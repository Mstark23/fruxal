// =============================================================================
// STRIPE BILLING SERVICE
// =============================================================================
// Handles: checkout, portal, subscription status, webhook events
// Plans: Free → Solo $49/mo (self-employed) → Business $150/mo (has employees, $500K–$5M) → Enterprise (contingency, $5M–$200M)
//        → Team $99/mo (multi-user + reports + priority support)
// =============================================================================

import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20" as any,
});

export const PLANS: Record<string, any> = {
  free: {
    name: "Free",
    price: 0,
    annualPrice: 0,
    leaksVisible: 3,
    features: ["3 leak preview", "Health score", "1 scan/month"],
  },
  solo: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    annualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "",
    price: 49, // $49/mo — Solo (self-employed, no employees)
    annualPrice: 39, // $39/mo billed annually = $468/yr (save $120)
    leaksVisible: Infinity,
    features: [
      "All leaks visible",
      "Fix recommendations + affiliate partners",
      "Intelligence insights (Tier 1 + 3)",
      "Unlimited scans",
      "Reports & exports",
      "Email notifications",
    ],
  },
  business: {
    name: "Business",
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || "",
    annualPriceId: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID || "",
    price: 150,
    features: [
      "Everything in Solo",
      "Mid-market leak engine",
      "Industry benchmarks",
      "Multi-business support",
      "QuickBooks integration",
      "Monthly advisor call",
    ],
  },
  team: {
    name: "Team",
    priceId: process.env.STRIPE_TEAM_PRICE_ID || "",
    annualPriceId: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID || "",
    price: 99,
    annualPrice: 79, // $79/mo billed annually = $948/yr (save $240)
    leaksVisible: Infinity,
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Team performance tracking",
      "Priority support",
      "Custom benchmarks",
      "White-label branding",
    ],
  },
};

// ─── Get current plan for a business ─────────────────────────────────────────
export async function getCurrentPlan(businessId: string): Promise<{
  plan: "free" | "solo" | "pro" | "business" | "growth" | "team";
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}> {
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("stripe_customer_id, stripe_subscription_id, tier")
    .eq("id", businessId)
    .maybeSingle();

  if (!business?.stripe_subscription_id) {
    return { plan: "free", status: "active", currentPeriodEnd: null, cancelAtPeriodEnd: false };
  }

  try {
    const sub = await stripe.subscriptions.retrieve(business.stripe_subscription_id);
    return {
      plan: (business.tier as "free" | "solo" | "pro" | "business" | "growth" | "team") || "free",
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  } catch {
    return { plan: "free", status: "active", currentPeriodEnd: null, cancelAtPeriodEnd: false };
  }
}

// ─── Create checkout session ─────────────────────────────────────────────────
export async function createCheckout(
  businessId: string,
  userId: string,
  planKey: "solo" | "pro" | "business" | "growth" | "team",
  successUrl: string,
  cancelUrl: string,
  interval: "monthly" | "annual" = "monthly"
): Promise<string> {
  const plan = PLANS[planKey];
  const priceId = interval === "annual" && plan.annualPriceId ? plan.annualPriceId : plan.priceId;
  if (!priceId) throw new Error(`No Stripe price ID configured for ${planKey} ${interval} plan`);

  // Get or create Stripe customer
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("stripe_customer_id, name")
    .eq("id", businessId)
    .maybeSingle();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("email, name")
    .eq("id", userId)
    .maybeSingle();

  let customerId = business?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email || undefined,
      name: business?.name || user?.name || undefined,
      metadata: { businessId, userId },
    });
    customerId = customer.id;

    await supabaseAdmin
      .from("businesses")
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("id", businessId);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { businessId, userId, plan: planKey },
    subscription_data: {
      metadata: { businessId, userId, plan: planKey },
    },
    allow_promotion_codes: true,
  });

  return session.url || "";
}

// ─── Create customer portal session ──────────────────────────────────────────
export async function createPortalSession(
  businessId: string,
  returnUrl: string
): Promise<string> {
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("stripe_customer_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!business?.stripe_customer_id) throw new Error("No Stripe customer found");

  const session = await stripe.billingPortal.sessions.create({
    customer: business.stripe_customer_id,
    return_url: returnUrl,
  });

  return session.url;
}

// ─── Handle webhook events ───────────────────────────────────────────────────
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const businessId = session.metadata?.businessId;
      const plan = session.metadata?.plan as "solo" | "pro" | "business" | "growth" | "team";
      const subscriptionId = session.subscription as string;

      if (businessId && plan && subscriptionId) {
        await supabaseAdmin
          .from("businesses")
          .update({ tier: plan, stripe_subscription_id: subscriptionId, stripe_customer_id: session.customer as string, updated_at: new Date().toISOString() })
          .eq("id", businessId);
        process.env.NODE_ENV === "development" && console.log(`✅ Business ${businessId} upgraded to ${plan}`);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const businessId = sub.metadata?.businessId;
      if (businessId) {
        const plan = sub.metadata?.plan as "solo" | "pro" | "business" | "growth" | "team" || "pro";
        await supabaseAdmin
          .from("businesses")
          .update({ tier: sub.status === "active" ? plan : "free", updated_at: new Date().toISOString() })
          .eq("id", businessId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const businessId = sub.metadata?.businessId;
      if (businessId) {
        await supabaseAdmin
          .from("businesses")
          .update({ tier: "free", stripe_subscription_id: null, updated_at: new Date().toISOString() })
          .eq("id", businessId);
        process.env.NODE_ENV === "development" && console.log(`⚠️ Business ${businessId} downgraded to free`);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      // Find business by customer ID and notify
      const { data: business } = await supabaseAdmin
        .from("businesses")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (business) {
        process.env.NODE_ENV === "development" && console.log(`❌ Payment failed for business ${business.id}`);
        // Could trigger a notification here
      }
      break;
    }
  }
}

// ─── Check if feature is available on current plan ───────────────────────────
export function canAccess(plan: string, feature: string): boolean {
  const access: Record<string, string[]> = {
    free: ["scan", "3_leaks", "health_score"],
    solo: ["scan", "all_leaks", "health_score", "fix", "intelligence", "reports", "notifications", "unlimited_scans"],
    pro: ["scan", "all_leaks", "health_score", "fix", "intelligence", "reports", "notifications", "unlimited_scans"],
    business: ["scan", "all_leaks", "health_score", "fix", "intelligence", "reports", "notifications", "unlimited_scans", "benchmarks", "multi_business", "quickbooks", "advisor_call", "mid_market_engine"],
    team: ["scan", "all_leaks", "health_score", "fix", "intelligence", "reports", "notifications", "unlimited_scans", "team", "custom_benchmarks"],
  };
  return (access[plan] || access.free).includes(feature);
}

// ─── Apply paywall to leak list ──────────────────────────────────────────────
// Contingency model — all leaks visible to all users. No gating.
export function applyPaywall(leaks: any[], _plan: string): any[] {
  return leaks;
}
