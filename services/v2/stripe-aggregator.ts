// =============================================================================
// services/v2/stripe-aggregator.ts
// Pulls revenue data from a business's OWN Stripe account via Connect OAuth.
// Extracts: MRR, ARR, churn, refund rate, failed payment %, Stripe fees,
//           top products, customer count, subscription metrics.
// All writes go to business_profiles so the diagnostic gets real numbers.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENC_KEY = Buffer.from(
  process.env.STRIPE_ENCRYPTION_KEY || process.env.QB_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || "",
  "hex"
);

// ── Encryption ────────────────────────────────────────────────────────────────
export function encryptToken(plain: string): string {
  const iv  = randomBytes(16);
  const key = ENC_KEY.length === 32 ? ENC_KEY : Buffer.alloc(32, ENC_KEY);
  const c   = createCipheriv("aes-256-cbc", key, iv);
  return iv.toString("hex") + ":" + Buffer.concat([c.update(plain, "utf8"), c.final()]).toString("hex");
}

export function decryptToken(cipher: string): string {
  const [ivHex, encHex] = cipher.split(":");
  const key = ENC_KEY.length === 32 ? ENC_KEY : Buffer.alloc(32, ENC_KEY);
  const d   = createDecipheriv("aes-256-cbc", key, Buffer.from(ivHex, "hex"));
  return Buffer.concat([d.update(Buffer.from(encHex, "hex")), d.final()]).toString("utf8");
}

// ── Stripe Connect OAuth — exchange code for access token ────────────────────
export async function exchangeStripeCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  stripeAccountId: string;
  livemode: boolean;
  scope: string;
}> {
  const res = await fetch("https://connect.stripe.com/oauth/token", {.catch(() => { throw new Error("Network request failed"); });
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_secret: process.env.STRIPE_SECRET_KEY!,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Stripe OAuth failed: ${err.error_description || err.error || res.status}`);
  }

  const data = await res.json();
  return {
    accessToken:     data.access_token,
    refreshToken:    data.refresh_token || "",
    stripeAccountId: data.stripe_user_id,
    livemode:        data.livemode ?? true,
    scope:           data.scope || "read_only",
  };
}

// ── Stripe API helper — calls on behalf of connected account ─────────────────
async function stripeGet(path: string, accessToken: string, params: Record<string, string> = {}): Promise<any> {
  const qs  = new URLSearchParams({ limit: "100", ...params }).toString();
  const url = `https://api.stripe.com/v1/${path}${qs ? "?" + qs : ""}`;

  const res = await fetch(url, {.catch(() => { throw new Error("Network request failed"); });
    headers: {
      Authorization:        `Bearer ${accessToken}`,
      "Stripe-Version":     "2024-06-20",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Stripe GET /${path} failed: ${err.error?.message || res.status}`);
  }
  return res.json();
}

// ── Auto-paginate a Stripe list endpoint ─────────────────────────────────────
async function stripeList(path: string, accessToken: string, extraParams: Record<string, string> = {}, maxPages = 10): Promise<any[]> {
  const all: any[] = [];
  let startingAfter: string | undefined;
  let page = 0;

  while (page < maxPages) {
    const params: Record<string, string> = { limit: "100", ...extraParams };
    if (startingAfter) params.starting_after = startingAfter;

    const data = await stripeGet(path, accessToken, params);
    const items = data.data || [];
    all.push(...items);

    if (!data.has_more || items.length === 0) break;
    startingAfter = items[items.length - 1].id;
    page++;
  }

  return all;
}

// ── Compute monthly churn from subscription events ────────────────────────────
function estimateChurn(canceledSubs: number, totalSubs: number, months = 3): number {
  if (totalSubs === 0) return 0;
  return Math.round((canceledSubs / months / totalSubs) * 100 * 10) / 10;
}

// ── Main sync ─────────────────────────────────────────────────────────────────
export async function syncStripeFinancials(businessId: string): Promise<void> {
  const { data: conn, error } = await supabaseAdmin
    .from("stripe_connections")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "active")
    .single();

  if (error || !conn) throw new Error("Stripe not connected for this business");

  await supabaseAdmin.from("stripe_connections")
    .update({ status: "syncing" }).eq("id", conn.id);

  const accessToken = decryptToken(conn.access_token_enc);

  const now    = Math.floor(Date.now() / 1000);
  const d30    = now - 30  * 86400;
  const d90    = now - 90  * 86400;
  const d365   = now - 365 * 86400;

  const results: Record<string, any> = {};

  // ── 1. Charges — revenue, refunds, failed payments ───────────────────────
  try {
    const charges = await stripeList("charges", accessToken, {
      created: String(d365),
    });

    const succeeded = charges.filter((c: any) => c.status === "succeeded");
    const failed    = charges.filter((c: any) => c.status === "failed");
    const refunded  = charges.filter((c: any) => c.refunded || c.amount_refunded > 0);
    const disputes  = charges.filter((c: any) => c.disputed);

    const grossTTM   = succeeded.reduce((s: number, c: any) => s + (c.amount ?? 0), 0) / 100;
    const refundsTTM = succeeded.reduce((s: number, c: any) => s + (c.amount_refunded ?? 0), 0) / 100;
    const feesTTM    = succeeded.reduce((s: number, c: any) => s + (c.application_fee_amount ?? 0) + (c.balance_transaction?.fee ?? 0), 0) / 100;

    results.revenue_ttm      = grossTTM;
    results.net_revenue_ttm  = grossTTM - refundsTTM;
    results.stripe_fees_ttm  = feesTTM;
    results.refund_rate_pct  = grossTTM > 0 ? Math.round((refundsTTM / grossTTM) * 1000) / 10 : 0;
    results.dispute_rate_pct = succeeded.length > 0 ? Math.round((disputes.length / succeeded.length) * 1000) / 10 : 0;
    results.failed_pct       = charges.length > 0 ? Math.round((failed.length / charges.length) * 1000) / 10 : 0;
    results.avg_transaction  = succeeded.length > 0 ? Math.round(grossTTM / succeeded.length) : 0;

    // 30d / 90d windows
    const succ30 = succeeded.filter((c: any) => c.created > d30);
    const succ90 = succeeded.filter((c: any) => c.created > d90);
    results.revenue_30d = succ30.reduce((s: number, c: any) => s + c.amount, 0) / 100;
    results.revenue_90d = succ90.reduce((s: number, c: any) => s + c.amount, 0) / 100;

    // Top products by revenue
    const productMap: Record<string, { revenue: number; count: number }> = {};
    for (const c of succeeded) {
      const name = c.description || c.metadata?.product_name || c.metadata?.description || "One-time payment";
      if (!productMap[name]) productMap[name] = { revenue: 0, count: 0 };
      productMap[name].revenue += c.amount / 100;
      productMap[name].count   += 1;
    }
    results.top_products = Object.entries(productMap)
      .map(([name, v]) => ({ name, revenue: Math.round(v.revenue), count: v.count }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

  } catch (err: any) {
    console.error("[Stripe] Charges sync failed:", err.message);
  }

  // ── 2. Subscriptions — MRR, ARR, churn ───────────────────────────────────
  try {
    const activeSubs   = await stripeList("subscriptions", accessToken, { status: "active" });
    const canceledSubs = await stripeList("subscriptions", accessToken, {
      status: "canceled",
      created: String(d90), // canceled in last 90d for churn calc
    });

    // MRR from active subscriptions
    let mrr = 0;
    for (const sub of activeSubs) {
      for (const item of sub.items?.data || []) {
        const amount   = (item.price?.unit_amount ?? 0) / 100 * (item.quantity || 1);
        const interval = item.price?.recurring?.interval;
        if (interval === "month")  mrr += amount;
        if (interval === "year")   mrr += amount / 12;
        if (interval === "week")   mrr += amount * 4.33;
      }
    }

    results.mrr          = Math.round(mrr);
    results.arr          = Math.round(mrr * 12);
    results.active_subs  = activeSubs.length;
    results.churn_rate   = estimateChurn(canceledSubs.length, activeSubs.length + canceledSubs.length);

  } catch (err: any) {
    console.error("[Stripe] Subscriptions sync failed:", err.message);
  }

  // ── 3. Customers ──────────────────────────────────────────────────────────
  try {
    const customers        = await stripeList("customers", accessToken);
    results.customer_count = customers.length;
  } catch (err: any) {
    console.error("[Stripe] Customers sync failed:", err.message);
  }

  // ── 4. Write to business_profiles ────────────────────────────────────────
  const profileUpdate: Record<string, any> = {
    stripe_connected:          true,
    stripe_last_sync_at:       new Date().toISOString(),
    stripe_mrr:                results.mrr               ?? null,
    stripe_arr:                results.arr               ?? null,
    stripe_revenue_30d:        results.revenue_30d       ?? null,
    stripe_revenue_90d:        results.revenue_90d       ?? null,
    stripe_revenue_ttm:        results.revenue_ttm       ?? null,
    stripe_refund_rate_pct:    results.refund_rate_pct   ?? null,
    stripe_dispute_rate_pct:   results.dispute_rate_pct  ?? null,
    stripe_failed_payment_pct: results.failed_pct        ?? null,
    stripe_avg_transaction:    results.avg_transaction   ?? null,
    stripe_customer_count:     results.customer_count    ?? null,
    stripe_active_subs:        results.active_subs       ?? null,
    stripe_churn_rate_pct:     results.churn_rate        ?? null,
    stripe_net_revenue_ttm:    results.net_revenue_ttm   ?? null,
    stripe_stripe_fees_ttm:    results.stripe_fees_ttm   ?? null,
    stripe_top_products:       results.top_products      ?? null,
    updated_at:                new Date().toISOString(),
  };

  // If no QB/Plaid revenue, use Stripe TTM
  const { data: existing } = await supabaseAdmin
    .from("business_profiles")
    .select("qb_connected, plaid_connected, exact_annual_revenue")
    .eq("business_id", businessId)
    .single();

  if (!existing?.qb_connected && !existing?.plaid_connected && results.revenue_ttm > 0) {
    profileUpdate.exact_annual_revenue = results.revenue_ttm;
  }

  await supabaseAdmin.from("business_profiles")
    .update(profileUpdate)
    .eq("business_id", businessId);

  // ── 5. Update connection ──────────────────────────────────────────────────
  await supabaseAdmin.from("stripe_connections").update({
    status:       "active",
    last_sync_at: new Date().toISOString(),
    last_error:   null,
    sync_summary: {
      mrr:              results.mrr           ?? 0,
      arr:              results.arr           ?? 0,
      revenue_ttm:      results.revenue_ttm ?? 0,
      refund_rate_pct:  results.refund_rate_pct ?? 0,
      churn_rate:       results.churn_rate ?? 0,
      active_subs:      results.active_subs ?? 0,
      customer_count:   results.customer_count ?? 0,
      stripe_fees_ttm:  results.stripe_fees_ttm ?? 0,
      synced_at:        new Date().toISOString(),
    },
  }).eq("id", conn.id);
}
