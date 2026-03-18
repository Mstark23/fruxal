// =============================================================================
// AFFILIATE REDIRECT PIPELINE
// =============================================================================
// LAW 7: The affiliate click IS the revenue.
//
// Flow: User clicks "Fix This" → hits /api/affiliate/redirect → 
//       we log everything → redirect to partner URL
//
// Every click tracks: who, what leak, which partner, when, source page.
// =============================================================================

import { NextResponse } from "next/server";
import { db, insert, findById, update } from "@/lib/db/service";
import { withAuth, apiError, AffiliateClickSchema } from "@/lib/api/middleware";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const partnerId = url.searchParams.get("pid");
  const leakId = url.searchParams.get("lid");
  const category = url.searchParams.get("cat");
  const source = url.searchParams.get("src") || "dashboard";

  if (!partnerId) {
    return apiError("Missing partner ID", "MISSING_PARAM", 400);
  }

  // Get partner details
  const { data: partner } = await findById("affiliate_partners", partnerId);
  if (!partner) {
    return apiError("Partner not found", "NOT_FOUND", 404);
  }

  // Get auth (optional for pre-scan clicks — anonymous users can click too)
  let userId = "anonymous";
  let businessId: string | null = null;
  try {
    const auth = await withAuth(req);
    if (auth.ctx) {
      userId = auth.ctx.userId;
      // Try to get their business
      const { data: member } = await db()
        .from("business_members")
        .select("businessId")
        .eq("userId", userId)
        .single();
      businessId = member?.businessId || null;
    }
  } catch {
    // Anonymous click — still track it
  }

  // Get leak details for savings projection
  let projectedSavings: number | null = null;
  let currentCost: number | null = null;
  if (leakId) {
    const { data: leak } = await findById("leaks", leakId);
    if (leak) {
      projectedSavings = leak.annualImpact || null;
      currentCost = leak.annualImpact ? leak.annualImpact / 12 : null;
    }
  }

  // Log the click — THIS IS THE REVENUE EVENT
  const referralId = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await insert("affiliate_referrals", {
    id: referralId,
    user_id: userId,
    business_id: businessId,
    partner_id: partnerId,
    leak_id: leakId || null,
    category: category || partner.category || null,
    current_cost_monthly: currentCost,
    projected_savings_monthly: projectedSavings ? projectedSavings / 12 : null,
    projected_savings_annual: projectedSavings,
    referral_url: partner.referral_url,
    status: "CLICKED",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Increment partner click counter
  await db()
    .from("affiliate_partners")
    .update({ 
      total_clicks: (partner.total_clicks || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", partnerId);

  // Build redirect URL with our tracking params
  let redirectUrl = partner.referral_url || partner.website_url || "#";
  
  // Append referral code if partner has one
  if (partner.referral_code) {
    const separator = redirectUrl.includes("?") ? "&" : "?";
    redirectUrl += `${separator}ref=${partner.referral_code}`;
  }

  // Append our tracking ID for conversion attribution
  const trackingSeparator = redirectUrl.includes("?") ? "&" : "?";
  redirectUrl += `${trackingSeparator}utm_source=fruxal&utm_medium=referral&utm_campaign=${category || "leak"}&lg_ref=${referralId}`;

  // 302 redirect to partner
  return NextResponse.redirect(redirectUrl, { status: 302 });
}

// ─── Conversion webhook (partner calls back when user converts) ──────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { referralId, conversionValue, status } = body;

    if (!referralId) {
      return apiError("Missing referralId", "MISSING_PARAM", 400);
    }

    // Update referral status
    await update("affiliate_referrals", { id: referralId }, {
      status: status || "CONVERTED",
      converted_at: new Date().toISOString(),
      actual_savings_monthly: conversionValue || null,
      updated_at: new Date().toISOString(),
    });

    // Update partner conversion count
    const { data: referral } = await findById("affiliate_referrals", referralId);
    if (referral?.partner_id) {
      const { data: partner } = await findById("affiliate_partners", referral.partner_id);
      if (partner) {
        const newConversions = (partner.total_conversions || 0) + 1;
        const newRate = partner.total_clicks > 0 ? newConversions / partner.total_clicks : 0;
        await update("affiliate_partners", { id: partner.id }, {
          total_conversions: newConversions,
          conversion_rate: newRate,
          updated_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return apiError("Conversion tracking failed", "SERVER_ERROR", 500);
  }
}
