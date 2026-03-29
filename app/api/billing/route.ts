// =============================================================================
// GET /api/billing — Get current plan
// POST /api/billing — Create checkout session
// PATCH /api/billing — Create portal session (manage subscription)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getCurrentPlan, createCheckout, createPortalSession, PLANS } from "@/services/billing/stripe";
import { rateLimit, rateLimitResponse } from "@/lib/security";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    const plan = await getCurrentPlan(businessId);
    const planDetails = PLANS[plan.plan] || PLANS.free;
    return NextResponse.json({ ...plan, details: planDetails, plans: PLANS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 checkout attempts per minute
  const rl = rateLimit(req, { max: 5, windowSeconds: 60 });
  if (!rl.allowed) return rateLimitResponse();

  try {
    const { businessId, userId, plan, interval = "monthly" } = await req.json();
    if (!businessId || !userId || !plan) {
      return NextResponse.json({ error: "businessId, userId, and plan required" }, { status: 400 });
    }

    if (plan !== "pro" && plan !== "team") {
      return NextResponse.json({ error: "Invalid plan. Choose 'pro' or 'team'" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "https://fruxal.vercel.app";
    const checkoutUrl = await createCheckout(
      businessId,
      userId,
      plan,
      `${origin}/dashboard?upgraded=true`,
      `${origin}/v2/dashboard`,
      interval,
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { businessId } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "https://fruxal.vercel.app";
    const portalUrl = await createPortalSession(businessId, `${origin}/dashboard`);

    return NextResponse.json({ url: portalUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}