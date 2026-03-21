// =============================================================================
// GET /api/v2/payment-status — Check if user has paid
// POST /api/v2/payment-status — Verify a checkout session after redirect
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 60; // Vercel function timeout (seconds)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


async function syncBusinessTier(userId: string, plan: string, active: boolean) {
  const PLAN_TO_TIER: Record<string, string> = {
    solo: "solo", business: "business", advisor: "business",
    report: "solo", team: "business", enterprise: "enterprise",
  };
  const tier = active ? (PLAN_TO_TIER[plan] || "solo") : "free";
  try {
    const { data: biz } = await supabaseAdmin
      .from("businesses").select("id").eq("owner_user_id", userId).maybeSingle();
    if (biz?.id) {
      await supabaseAdmin.from("businesses")
        .update({ tier, updated_at: new Date().toISOString() }).eq("id", biz.id);
    }
    await supabaseAdmin.from("business_profiles")
      .update({ plan: tier, updated_at: new Date().toISOString() }).eq("user_id", userId);
  } catch (e: any) {
    console.warn("[PaymentStatus] syncBusinessTier failed:", e.message);
  }
}

// GET — Check current payment status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { data: progress } = await supabase
      .from("user_progress")
      .select("payment_status, payment_type, paid_at, plan_expires_at, stripe_subscription_id")
      .eq("userId", userId)
      .single();

    if (!progress) {
      return NextResponse.json({ paid: false, status: "free", plan: null });
    }

    // Check subscription still active if applicable
    if (progress.payment_status === "active" && progress.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(progress.stripe_subscription_id);
        if (sub.status !== "active" && sub.status !== "trialing") {
          // Subscription lapsed
          await supabase
            .from("user_progress")
            .update({ payment_status: "expired" })
            .eq("userId", userId);

          return NextResponse.json({ paid: false, status: "expired", plan: progress.payment_type });
        }
      } catch {
        // Stripe error — give benefit of doubt
      }
    }

    const isPaid = progress.payment_status === "active" || progress.payment_status === "lifetime";

    return NextResponse.json({
      paid: isPaid,
      status: progress.payment_status,
      plan: progress.payment_type,
      paidAt: progress.paid_at,
      expiresAt: progress.plan_expires_at,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — Verify checkout session after Stripe redirect
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed", paid: false }, { status: 400 });
    }

    // Verify this session belongs to this user
    if (checkoutSession.metadata?.userId !== userId) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
    }

    const plan = checkoutSession.metadata?.plan || "report";
    const isSubscription = checkoutSession.mode === "subscription";

    // Update user_progress with payment info
    const updateData: any = {
      payment_status: isSubscription ? "active" : "lifetime",
      payment_type: plan,
      stripe_session_id: sessionId,
      stripe_customer_id: checkoutSession.customer as string,
      paid_at: new Date().toISOString(),
    };

    if (isSubscription && checkoutSession.subscription) {
      updateData.stripe_subscription_id = checkoutSession.subscription as string;
      // Subscription renews monthly
      updateData.plan_expires_at = new Date(Date.now() + 35 * 86400000).toISOString();
    } else {
      // Lifetime access for one-time payment
      updateData.plan_expires_at = null;
    }

    await supabase
      .from("user_progress")
      .upsert({ userId, ...updateData }, { onConflict: "userId" });

    // Sync businesses.tier so dashboard shows correct tier immediately
    await syncBusinessTier(userId, plan, true);

    // Also update prescan_results if scanId was provided
    const scanId = checkoutSession.metadata?.scanId;
    if (scanId) {
      await supabase
        .from("prescan_results")
        .update({ payment_status: "paid", stripe_session_id: sessionId })
        .eq("id", scanId);
    }

    return NextResponse.json({
      paid: true,
      plan,
      type: isSubscription ? "subscription" : "one-time",
    });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
