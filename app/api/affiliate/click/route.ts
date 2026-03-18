// =============================================================================
// POST /api/affiliate/click — Track click and return partner redirect URL
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { trackClick, recordConversion, getAffiliateStats } from "@/services/affiliate/service";

// POST — Track a click (user tapped "Fix with Partner")
export async function POST(req: NextRequest) {
  try {
    const { businessId, userId, leakId, partnerId, partnerSlug, leakCategory, source = "business" } = await req.json();

    if (!partnerId || !leakCategory) {
      return NextResponse.json({ error: "partnerId and leakCategory required" }, { status: 400 });
    }

    const result = await trackClick({
      businessId,
      userId,
      leakId,
      partnerId,
      partnerSlug: partnerSlug || "",
      leakCategory,
      source,
    });

    return NextResponse.json({
      success: true,
      referralId: result.referralId,
      redirectUrl: result.redirectUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — Record a conversion
export async function PATCH(req: NextRequest) {
  try {
    const { referralId, actualSavingsMonthly } = await req.json();
    if (!referralId) {
      return NextResponse.json({ error: "referralId required" }, { status: 400 });
    }
    await recordConversion(referralId, actualSavingsMonthly);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — Affiliate stats (admin view)
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId") || undefined;
  try {
    const stats = await getAffiliateStats(businessId);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
