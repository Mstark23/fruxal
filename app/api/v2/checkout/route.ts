// =============================================================================
// POST /api/v2/checkout — Create Stripe checkout for V2 plans
// =============================================================================
// Plans:
//   report:  $47 one-time  → Full leak report + fix plan
//   advisor: $79/month     → Everything in report + ongoing AI advisor
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


// Sync businesses.tier so dashboard tier resolver picks it up immediately
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
    console.warn("[Checkout] syncBusinessTier failed:", e.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const userEmail = (session.user as any).email;

    const { plan, scanId } = await req.json();

    if (!plan || !["report", "advisor", "solo", "business"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan. Choose 'report', 'solo', 'advisor', or 'business'" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL || "https://fruxal.vercel.app";

    // Get or create Stripe customer
    const { data: progress } = await supabase
      .from("user_progress")
      .select("stripe_customer_id")
      .eq("userId", userId)
      .single();

    let customerId = progress?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail || undefined,
        metadata: { userId, source: "fruxal-v2" },
      });
      customerId = customer.id;

      await supabase
        .from("user_progress")
        .upsert({ userId, stripe_customer_id: customerId }, { onConflict: "userId" });
    }

    // Build checkout session based on plan
    let sessionConfig: Stripe.Checkout.SessionCreateParams;

    if (plan === "report") {
      // $47 one-time payment
      sessionConfig = {
        customer: customerId,
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "cad",
            product_data: {
              name: "Fruxal — Full Leak Report",
              description: "Complete business leak analysis with fix plan, tool recommendations, and priority action items",
            },
            unit_amount: 4700, // $47.00 CAD
          },
          quantity: 1,
        }],
        success_url: `${origin}/v2/dashboard?paid=report&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/v2/dashboard?cancelled=true`,
        metadata: { userId, plan: "report", scanId: scanId || "" },
        payment_intent_data: {
          metadata: { userId, plan: "report", scanId: scanId || "" },
        },
      };
    } else if (plan === "solo") {
      // $49/month subscription — Solo plan
      sessionConfig = {
        customer: customerId,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "cad",
            product_data: {
              name: "Fruxal Solo",
              description: "AI diagnostics, automated alerts, detailed fix steps, and government program matching",
            },
            unit_amount: 4900, // $49.00 CAD
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        success_url: `${origin}/v2/dashboard?paid=solo&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/v2/dashboard?cancelled=true`,
        metadata: { userId, plan: "solo", scanId: scanId || "" },
        subscription_data: {
          metadata: { userId, plan: "solo", scanId: scanId || "" },
        },
      };
    } else if (plan === "business") {
      // $149/month — Business plan
      sessionConfig = {
        customer: customerId,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "cad",
            product_data: {
              name: "Fruxal Business",
              description: "Full AI diagnostic · 7 findings with calculation math · CPA briefing · Priority sequence · Benchmarks · Monthly re-scans",
            },
            unit_amount: 14900, // $149.00 CAD
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        success_url: `${origin}/v2/dashboard?paid=business&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${origin}/v2/dashboard/business?cancelled=true`,
        metadata: { userId, plan: "business", scanId: scanId || "" },
        subscription_data: {
          metadata: { userId, plan: "business", scanId: scanId || "" },
        },
      };
    } else {
      // $79/month — Advisor plan (business tier access)
      sessionConfig = {
        customer: customerId,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "cad",
            product_data: {
              name: "Fruxal Advisor",
              description: "Full leak report + ongoing AI business advisor, monthly re-scans, and priority support",
            },
            unit_amount: 7900, // $79.00 CAD
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        success_url: `${origin}/v2/dashboard?paid=advisor&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/v2/dashboard?cancelled=true`,
        metadata: { userId, plan: "advisor", scanId: scanId || "" },
        subscription_data: {
          metadata: { userId, plan: "advisor", scanId: scanId || "" },
        },
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

    // Sync businesses.tier immediately — don't wait for Stripe webhook
    // This ensures the user sees the correct dashboard right after payment
    await syncBusinessTier(userId, plan, true);

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error("V2 checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}