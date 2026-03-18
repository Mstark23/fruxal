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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

// Map plan name → businesses.tier value the dashboard resolver reads
const PLAN_TO_TIER: Record<string, string> = {
  solo:     "solo",
  business: "business",
  advisor:  "solo",    // advisor = enhanced solo tier
  report:   "solo",    // one-time report = solo access
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
      console.log(`[Webhook] businesses.tier → ${tier} for user ${userId}`);
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
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.error("[Webhook] Signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      // Dev fallback — no secret configured
      if (process.env.NODE_ENV === "production") {
        console.error("[Webhook] STRIPE_WEBHOOK_SECRET not set in production!");
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
      }
      event = JSON.parse(body);
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

          console.log(`✅ Payment: ${userId} → ${plan}`);
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

          console.log(`⚠️ Subscription cancelled: ${userId}`);
          break;
        }

        case "invoice.payment_failed": {
          await supabaseAdmin
            .from("user_progress")
            .update({ payment_status: "past_due" })
            .eq("userId", userId);
          console.log(`❌ Payment failed: ${userId}`);
          break;
        }

        case "invoice.payment_succeeded": {
          // Renewal — keep tier active
          await syncBusinessTier(userId, plan, true);
          await supabaseAdmin
            .from("user_progress")
            .update({ payment_status: "active" })
            .eq("userId", userId);
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
