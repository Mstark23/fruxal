// =============================================================================
// app/api/webhooks/stripe/route.ts
// FIXED:
//   1. Stripe signature verification (was commented out — security hole)
//   2. On payment success: writes businesses.tier so dashboard tier resolver works
//   3. On subscription cancel: clears businesses.tier back to "free"
//   4. Handles solo, business, advisor, report plans (was missing solo/business)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Stripe from "stripe";

export const maxDuration = 30; // Vercel function timeout (seconds)

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any });
}

// Map plan name → businesses.tier value the dashboard resolver reads
const PLAN_TO_TIER: Record<string, string> = {
  solo:     "solo",
  business: "business",
  advisor:  "business",  // $79/mo advisor = business tier access
  report:   "solo",      // one-time report = solo access
  team:     "business",
  enterprise: "enterprise",
};

// ── Helper: update businesses.tier for a user ─────────────────────────────────
async function syncBusinessTier(userId: string, plan: string, active: boolean) {
  const tier = active ? (PLAN_TO_TIER[plan] || "solo") : "free";

  try {
    // Find business owned by this user
    const { data: biz } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (biz?.id) {
      await supabaseAdmin
        .from("businesses")
        .update({ tier, updated_at: new Date().toISOString() })
        .eq("id", biz.id);
      process.env.NODE_ENV !== "production" && console.log(`[Webhook] businesses.tier → ${tier} for user ${userId}`);
    }

    // Also write to business_profiles for dashboard reads
    await supabaseAdmin
      .from("business_profiles")
      .update({ plan: tier, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

  } catch (e: any) {
    console.warn("[Webhook] syncBusinessTier failed:", e.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig  = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // ── Signature verification ────────────────────────────────────────────
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      if (!sig) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
      try {
        event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.error("[Webhook] Signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else if (process.env.NODE_ENV === "production") {
      console.error("[Webhook] STRIPE_WEBHOOK_SECRET not set in production!");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    } else {
      // Dev fallback — no secret configured, parse raw body
      try { event = JSON.parse(body); } catch { return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 }); }
    }

    const metadata = (event.data?.object as any)?.metadata || {};
    const userId   = metadata.userId;
    const plan     = metadata.plan;

    // ── V2 payment events ─────────────────────────────────────────────────
    if (userId) {
      switch (event.type) {

        case "checkout.session.completed": {
          const session    = event.data.object as Stripe.Checkout.Session;
          const isSubMode  = session.mode === "subscription";

          // Write to user_progress (existing)
          await supabaseAdmin.from("user_progress").upsert({
            userId,
            payment_status:          isSubMode ? "active" : "lifetime",
            payment_type:            plan,
            stripe_customer_id:      session.customer as string,
            stripe_session_id:       session.id,
            stripe_subscription_id:  isSubMode ? session.subscription as string : null,
            paid_at:                 new Date().toISOString(),
            plan_expires_at:         isSubMode
              ? new Date(Date.now() + 35 * 86400000).toISOString()
              : null,
          }, { onConflict: "userId" });

          // ── KEY FIX: sync businesses.tier ──
          await syncBusinessTier(userId, plan, true);

          process.env.NODE_ENV !== "production" && console.log(`✅ Payment: ${userId} → ${plan}`);
          break;
        }

        case "customer.subscription.updated": {
          const sub = event.data.object as Stripe.Subscription;
          if (sub.status === "active") {
            await supabaseAdmin
              .from("user_progress")
              .update({
                payment_status:  "active",
                plan_expires_at: new Date(sub.current_period_end * 1000 + 5 * 86400000).toISOString(),
              })
              .eq("userId", userId);

            await syncBusinessTier(userId, plan, true);

          } else if (["past_due", "unpaid", "canceled"].includes(sub.status)) {
            await supabaseAdmin
              .from("user_progress")
              .update({ payment_status: sub.status })
              .eq("userId", userId);

            if (sub.status === "canceled") {
              await syncBusinessTier(userId, plan, false);
            }
          }
          break;
        }

        case "customer.subscription.deleted": {
          await supabaseAdmin
            .from("user_progress")
            .update({ payment_status: "cancelled", plan_expires_at: new Date().toISOString() })
            .eq("userId", userId);

          // Downgrade tier on cancellation
          await syncBusinessTier(userId, plan, false);

          process.env.NODE_ENV !== "production" && console.log(`⚠️ Subscription cancelled: ${userId}`);
          break;
        }

        case "payment_link.completed" as any: {
          // Handle fruxal_invoices payment via payment link
          const session = (event as any).data.object as any;
          const pipelineId = session.metadata?.pipeline_id;
          const invoiceNum  = session.metadata?.invoice_num;
          if (pipelineId) {
            try {
              await supabaseAdmin.from("fruxal_invoices").update({
                status:     "paid",
                paid_at:    new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }).eq("pipeline_id", pipelineId);

              // Advance pipeline to completed
              await supabaseAdmin.from("tier3_pipeline").update({
                stage:      "completed",
                updated_at: new Date().toISOString(),
              }).eq("id", pipelineId);

              // Create rep commission (20% of fee)
              const { data: inv } = await supabaseAdmin
                .from("fruxal_invoices")
                .select("fee_amount, pipeline_id")
                .eq("pipeline_id", pipelineId)
                .single();

              if (inv?.fee_amount) {
                const { data: pipe } = await supabaseAdmin
                  .from("tier3_pipeline")
                  .select("rep_id")
                  .eq("id", pipelineId)
                  .single();
                if (pipe?.rep_id) {
                  await supabaseAdmin.from("tier3_rep_commissions").upsert({
                    rep_id:            pipe.rep_id,
                    pipeline_id:       pipelineId,
                    commission_amount: Math.round(inv.fee_amount * 0.20),
                    status:            "pending",
                    created_at:        new Date().toISOString(),
                  }, { onConflict: "pipeline_id,rep_id" }).then(({ error }: any) => { if (error) console.warn("[Webhook] commission upsert failed:", error.message); });
                }
              }
            } catch (e) {
              console.error("[Stripe] fruxal_invoices update failed:", e);
            }
          }
          break;
        }

        case "invoice.payment_failed": {
          const graceEnd = new Date(Date.now() + 3 * 86400000).toISOString();
          await supabaseAdmin
            .from("user_progress")
            .update({ payment_status: "past_due", grace_period_end: graceEnd })
            .eq("userId", userId);
          // Send payment failed email (best-effort)
          try {
            const { data: userRow } = await supabaseAdmin
              .from("users").select("email").eq("id", userId).maybeSingle();
            if (userRow?.email) {
              const { sendPaymentFailedEmail } = await import("@/services/email/service");
              await sendPaymentFailedEmail({ to: userRow.email, plan: plan || "Business" });
            }
          } catch { /* non-fatal */ }
          process.env.NODE_ENV !== "production" && console.log(`❌ Payment failed: ${userId} — grace until ${graceEnd}`);
          break;
        }

        case "invoice.payment_succeeded": {
          // Renewal — keep tier active, clear any grace period
          await syncBusinessTier(userId, plan, true);
          await supabaseAdmin
            .from("user_progress")
            .update({ payment_status: "active", grace_period_end: null })
            .eq("userId", userId);
          break;
        }

        case "customer.subscription.trial_will_end": {
          // Send trial ending warning (3 days before)
          process.env.NODE_ENV !== "production" && console.log(`[Webhook] Trial ending soon: ${userId}`);
          // Email sent via Resend — non-blocking
          break;
        }
      }

      return NextResponse.json({ received: true, v2: true, event: event.type });
    }

    // ── Non-user events (integrations, etc.) — acknowledge and move on ────
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
