// =============================================================================
// services/v2/plaid-aggregator.ts
// Pulls bank data from Plaid and writes financial signals into business_profiles
// so the diagnostic prompt gets real cash flow, not estimates.
//
// Data extracted:
//   Account balances         → total cash across checking + savings
//   Transaction analysis     → revenue/expense inflows+outflows (30d, 90d)
//   Top merchants            → recurring vendor spend for leak detection
//   Recurring charges        → subscriptions, SaaS, insurance, utilities
//   Payroll deposits         → inbound ACH labeled payroll
//   Tax payments             → CRA / government outflows
//   Debt service             → loan payments for leverage analysis
//   Cash flow risk           → lowest 30d balance (liquidity signal)
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const PLAID_BASE = process.env.PLAID_ENV === "production"
  ? "https://production.plaid.com"
  : process.env.PLAID_ENV === "development"
  ? "https://development.plaid.com"
  : "https://sandbox.plaid.com";

const ENC_KEY = Buffer.from(process.env.PLAID_ENCRYPTION_KEY || process.env.QB_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || "", "hex");

// ── Encryption ────────────────────────────────────────────────────────────────
export function encryptToken(plain: string): string {
  const iv  = randomBytes(16);
  const key = ENC_KEY.length === 32 ? ENC_KEY : Buffer.alloc(32, ENC_KEY);
  const c   = createCipheriv("aes-256-cbc", key, iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return iv.toString("hex") + ":" + enc.toString("hex");
}

export function decryptToken(cipher: string): string {
  const [ivHex, encHex] = cipher.split(":");
  const key = ENC_KEY.length === 32 ? ENC_KEY : Buffer.alloc(32, ENC_KEY);
  const d   = createDecipheriv("aes-256-cbc", key, Buffer.from(ivHex, "hex"));
  return Buffer.concat([d.update(Buffer.from(encHex, "hex")), d.final()]).toString("utf8");
}

// ── Plaid API helper ─────────────────────────────────────────────────────────
async function plaidPost(path: string, body: object): Promise<any> {
  const res = await fetch(`${PLAID_BASE}${path}`, {.catch(() => { throw new Error("Network request failed"); });
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET":    process.env.PLAID_SECRET!,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error_message: res.statusText }));
    throw new Error(`Plaid ${path} failed: ${err.error_message || err.error_code || res.status}`);
  }
  return res.json();
}

// ── Create link token (called before Plaid Link opens) ───────────────────────
export async function createLinkToken(userId: string, businessId: string): Promise<string> {
  const data = await plaidPost("/link/token/create", {
    user:          { client_user_id: userId },
    client_name:   "Fruxal",
    products:      ["transactions"],
    country_codes: ["CA"],
    language:      "en",
    webhook:       `${process.env.NEXTAUTH_URL}/api/plaid/webhook`,
    // Pass businessId in link_customization or metadata via access_token exchange
  });
  return data.link_token;
}

// ── Exchange public token for access token ───────────────────────────────────
export async function exchangePublicToken(publicToken: string): Promise<{ accessToken: string; itemId: string }> {
  const data = await plaidPost("/item/public_token/exchange", { public_token: publicToken });
  return { accessToken: data.access_token, itemId: data.item_id };
}

// ── Classify a transaction ────────────────────────────────────────────────────
function classifyTxn(txn: any): "revenue" | "payroll_in" | "tax" | "loan" | "payroll_out" | "subscription" | "expense" | "transfer" | "ignore" {
  const name = (txn.merchant_name || txn.name || "").toLowerCase();
  const cats = ((txn.personal_finance_category?.primary || txn.category?.[0] || "")).toLowerCase();
  const amt  = txn.amount; // positive = debit (money out), negative = credit (money in) in Plaid

  // Transfers between own accounts — skip
  if (cats.includes("transfer") && Math.abs(amt) > 500) return "transfer";

  // Inflows (negative amount = credit to account)
  if (amt < 0) {
    if (name.match(/payroll|adp|ceridian|humi|wagepoint|nethris/)) return "payroll_in";
    return "revenue";
  }

  // Outflows (positive amount = debit)
  if (name.match(/cra|canada revenue|revenu canada|tax|impot|hst|gst|remittance/)) return "tax";
  if (name.match(/loan|mortgage|financing|leasing|capital one|td visa|cibc visa|desjardins visa/)) return "loan";
  if (name.match(/adp|ceridian|humi|wagepoint|nethris|payroll/)) return "payroll_out";
  if (cats.includes("subscription") || cats.includes("software")) return "subscription";
  return "expense";
}

// ── Main sync ─────────────────────────────────────────────────────────────────
export async function syncPlaidFinancials(businessId: string): Promise<void> {
  const { data: conn, error } = await supabaseAdmin
    .from("plaid_connections")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "active")
    .single();

  if (error || !conn) throw new Error("Plaid not connected for this business");

  await supabaseAdmin.from("plaid_connections")
    .update({ status: "syncing" }).eq("id", conn.id);

  const accessToken = decryptToken(conn.access_token_enc);

  // ── Accounts + balances ───────────────────────────────────────────────────
  let accounts: any[] = [];
  let totalBalance    = 0;
  let avgDailyBalance = 0;

  try {
    const acctData = await plaidPost("/accounts/get", { access_token: accessToken });
    accounts = acctData.accounts || [];

    const depAccounts = accounts.filter((a: any) =>
      ["checking", "savings", "depository"].includes(a.type?.toLowerCase() || a.subtype?.toLowerCase())
    );

    totalBalance    = depAccounts.reduce((s: number, a: any) => s + (a.balances?.current ?? 0), 0);
    avgDailyBalance = totalBalance; // approximate — refined below with transaction history
  } catch (err: any) {
    console.error("[Plaid] Accounts fetch failed:", err.message);
  }

  // ── Transactions (incremental sync using cursor) ──────────────────────────
  let allTxns: any[] = [];
  let cursor = conn.cursor || null;

  try {
    let hasMore = true;
    let pages   = 0;

    while (hasMore && pages < 10) {
      const body: any = { access_token: accessToken, options: { count: 500 } };
      if (cursor) body.cursor = cursor;

      const resp = await plaidPost("/transactions/sync", body);
      allTxns    = [...allTxns, ...(resp.added || []), ...(resp.modified || [])];
      cursor     = resp.next_cursor;
      hasMore    = resp.has_more;
      pages++;
    }

    // Save cursor for next incremental sync
    await supabaseAdmin.from("plaid_connections")
      .update({ cursor }).eq("id", conn.id);

  } catch (err: any) {
    console.error("[Plaid] Transaction sync failed:", err.message);
  }

  // ── Analyse transactions ──────────────────────────────────────────────────
  const now    = Date.now();
  const d30    = now - 30  * 86400000;
  const d90    = now - 90  * 86400000;

  // Filter to real transactions (no pending)
  const txns = allTxns.filter((t: any) => !t.pending);

  const rev30 = txns.filter(t => new Date(t.date).getTime() > d30 && classifyTxn(t) === "revenue")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const rev90 = txns.filter(t => new Date(t.date).getTime() > d90 && classifyTxn(t) === "revenue")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const exp30 = txns.filter(t => new Date(t.date).getTime() > d30 && t.amount > 0 &&
    !["transfer","ignore"].includes(classifyTxn(t)))
    .reduce((s, t) => s + t.amount, 0);

  const exp90 = txns.filter(t => new Date(t.date).getTime() > d90 && t.amount > 0 &&
    !["transfer","ignore"].includes(classifyTxn(t)))
    .reduce((s, t) => s + t.amount, 0);

  const taxPayments = txns.filter(t => classifyTxn(t) === "tax")
    .reduce((s, t) => s + t.amount, 0);

  const loanPayments = txns.filter(t => classifyTxn(t) === "loan")
    .reduce((s, t) => s + t.amount, 0);

  const payrollDeposits = txns.filter(t => classifyTxn(t) === "payroll_in")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  // Top merchants by total spend
  const merchantMap: Record<string, { amount: number; count: number }> = {};
  for (const t of txns) {
    if (t.amount <= 0 || classifyTxn(t) === "transfer") continue;
    const name = t.merchant_name || t.name || "Unknown";
    if (!merchantMap[name]) merchantMap[name] = { amount: 0, count: 0 };
    merchantMap[name].amount += t.amount;
    merchantMap[name].count  += 1;
  }
  const topMerchants = Object.entries(merchantMap)
    .map(([name, v]) => ({ name, amount: Math.round(v.amount), count: v.count }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 15);

  // Recurring charges (appear 2+ times)
  const recurring = topMerchants
    .filter(m => m.count >= 2)
    .map(m => ({ name: m.name, amount: Math.round(m.amount / m.count), frequency: m.count >= 8 ? "monthly" : "periodic", total: m.amount }))
    .slice(0, 10);

  // Lowest balance in last 30 days (rough — use balance + net flows)
  const net30Flows  = rev30 - exp30;
  const lowestBal30 = Math.max(0, totalBalance - Math.max(0, net30Flows));

  // ── Write to business_profiles ────────────────────────────────────────────
  const profileUpdate: Record<string, any> = {
    plaid_connected:          true,
    plaid_last_sync_at:       new Date().toISOString(),
    plaid_bank_balance_total: totalBalance     || null,
    plaid_revenue_30d:        rev30            || null,
    plaid_revenue_90d:        rev90            || null,
    plaid_expenses_30d:       exp30            || null,
    plaid_expenses_90d:       exp90            || null,
    plaid_top_merchants:      topMerchants,
    plaid_recurring_expenses: recurring,
    plaid_payroll_deposits:   payrollDeposits  || null,
    plaid_tax_payments:       taxPayments      || null,
    plaid_loan_payments:      loanPayments     || null,
    plaid_avg_daily_balance:  avgDailyBalance  || null,
    plaid_lowest_balance_30d: lowestBal30      || null,
    plaid_accounts:           accounts.map((a: any) => ({
      name:    a.name,
      type:    a.type,
      balance: a.balances?.current,
    })),
    updated_at: new Date().toISOString(),
  };

  // If no QB revenue data, use Plaid revenue as proxy
  const { data: existing } = await supabaseAdmin
    .from("business_profiles")
    .select("qb_connected, exact_annual_revenue")
    .eq("business_id", businessId)
    .single();

  if (!existing?.qb_connected && rev90 > 0) {
    profileUpdate.annual_revenue = Math.round(rev90 * (12 / 3)); // annualise 90d
  }

  await supabaseAdmin.from("business_profiles")
    .update(profileUpdate)
    .eq("business_id", businessId);

  // ── Update connection ─────────────────────────────────────────────────────
  await supabaseAdmin.from("plaid_connections").update({
    status:       "active",
    last_sync_at: new Date().toISOString(),
    last_error:   null,
    sync_summary: {
      bank_balance:   totalBalance,
      revenue_90d:    rev90,
      expenses_90d:   exp90,
      tax_payments:   taxPayments,
      loan_payments:  loanPayments,
      lowest_bal_30d: lowestBal30,
      synced_at:      new Date().toISOString(),
    },
  }).eq("id", conn.id);
}
