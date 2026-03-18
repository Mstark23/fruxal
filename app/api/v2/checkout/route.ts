// =============================================================================
// POST /api/v2/checkout — Create Stripe checkout for V2 plans
// FIXED:
//   1. Added "business" plan ($150/mo) — was missing, UI showed it but API rejected it
//   2. Uses supabaseAdmin (not raw supabase client)
//   3. Metadata now includes plan on all events so webhook can sync businesses.tier
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

const VALID_PLANS = ["report", "solo", "business", "advisor"] as const;
type Plan = typeof VALID_PLANS[number];

const PLAN_CONFIG: Record<Plan, {
  name: string;
  description: string;
  amount: number;
  mode: "payment" | "subscription";
}> = {
  report: {
    name:        "Fruxal — Full Leak Report",
    description: "Complete business leak analysis with fix plan, tool recommendations, and priority action items",
    amount:      4700, // $47 CAD one-time
    mode:        "payment",
  },
  solo: {
    name:        "Fruxal Solo",
    description: "AI diagnostics, automated alerts, detailed fix steps, and government program matching",
    amount:      4900, // $49/mo CAD
    mode:        "subscription",
  },
  business: {
    name:        "Fruxal Business",
    description: "Everything in Solo plus industry benchmarks, QuickBooks integration, and monthly advisor call",
    amount:      15000, // $150/mo CAD
    mode:        "subscription",
  },
  advisor: {
    name:        "Fruxal Advisor",
    description: "Full advisor with monthly re-scans and priority support",
    amount:      7900, // $79/mo CAD
    mode:        "subscription",
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId    = (session.user as any).id as string;
    const userEmail = session.user.email || undefined;

    const { plan, scanId } = await req.json();

    if (!plan || !VALID_PLANS.includes(plan as Plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Choose one of: ${VALID_PLANS.join(", ")}` },
        { status: 400 }
      );
    }

    const config = PLAN_CONFIG[plan as Plan];
    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // ── Get or create Stripe customer ─────────────────────────────────────
    const { data: progress } = await supabaseAdmin
      .from("user_progress")
      .select("stripe_customer_id")
      .eq("userId", userId)
      .single();

    let customerId = progress?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    userEmail,
        metadata: { userId, source: "fruxal-v2" },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("user_progress")
        .upsert({ userId, stripe_customer_id: customerId }, { onConflict: "userId" });
    }

    // ── Build checkout session ────────────────────────────────────────────
    const sharedMeta = { userId, plan, scanId: scanId || "" };

    const sessionConfig: Stripe.Checkout.SessionCreateParams =
      config.mode === "payment"
        ? {
            customer:    customerId,
            mode:        "payment",
            line_items:  [{
              price_data: {
                currency:     "cad",
                product_data: { name: config.name, description: config.description },
                unit_amount:  config.amount,
              },
              quantity: 1,
            }],
            success_url:           `${origin}/v2/dashboard?paid=${plan}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:            `${origin}/v2/dashboard?cancelled=true`,
            metadata:              sharedMeta,
            payment_intent_data:   { metadata: sharedMeta },
            metadata:              sharedMeta,
          }
        : {
            customer:    customerId,
            mode:        "subscription",
            line_items:  [{
              price_data: {
                currency:     "cad",
                product_data: { name: config.name, description: config.description },
                unit_amount:  config.amount,
                recurring:    { interval: "month" },
              },
              quantity: 1,
            }],
            success_url:       `${origin}/v2/dashboard?paid=${plan}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:        `${origin}/v2/dashboard?cancelled=true`,
            metadata:          sharedMeta,
            subscription_data: { metadata: sharedMeta },
            metadata:         sharedMeta,
          };

    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: checkoutSession.url, plan, amount: config.amount });

  } catch (error: any) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
