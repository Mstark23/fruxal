// =============================================================================
// src/app/api/v2/partners/route.ts
// =============================================================================
// PUBLIC or AUTH — Smart partner matching with province/language priority.
//
// GET ?category=payment_processing&province=QC&industry=restaurant&language=fr
//
// Also handles partner click tracking:
// POST { partnerId, partnerSlug, businessId, leakId, source }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSmartPartners } from "@/services/intelligence";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        { success: false, error: "category is required" },
        { status: 400 }
      );
    }

    const partners = await getSmartPartners({
      leakCategory: category,
      province: searchParams.get("province") || undefined,
      industry: searchParams.get("industry") || undefined,
      structure: searchParams.get("structure") || undefined,
      employeeCount: Number(searchParams.get("employees")) || 0,
      annualRevenue: Number(searchParams.get("revenue")) || 0,
      language: searchParams.get("language") || "en",
      includeGovernment: searchParams.get("includeGov") !== "false",
      limit: Math.min(Number(searchParams.get("limit")) || 10, 20),
    });

    // Split into commercial partners vs government programs
    const commercial = partners.filter((p) => !p.is_government_program);
    const government = partners.filter((p) => p.is_government_program);

    return NextResponse.json({
      success: true,
      data: {
        total: partners.length,
        commercial,
        government,
        partners, // full sorted list
      },
    });
  } catch (err: any) {
    console.error("[GET /api/v2/partners] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// Track partner clicks for affiliate attribution
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partnerSlug, businessId, leakId, source } = body;

    if (!partnerSlug) {
      return NextResponse.json(
        { success: false, error: "partnerSlug is required" },
        { status: 400 }
      );
    }

    // Get partner details
    const { data: partner } = await supabaseAdmin
      .from("affiliate_partners")
      .select("id, referral_url, slug")
      .eq("slug", partnerSlug)
      .single();

    if (!partner) {
      return NextResponse.json(
        { success: false, error: "Partner not found" },
        { status: 404 }
      );
    }

    // Record the click
    await supabaseAdmin.from("affiliate_clicks").insert({
      partner_id: partner.id,
      business_id: businessId || null,
      leak_id: leakId || null,
      source: source || "prescan",
      referral_url: partner.referral_url,
      clicked_at: new Date().toISOString(),
    });

    // Increment partner click count
    try {
      await supabaseAdmin.rpc("increment_partner_clicks", {
        p_partner_slug: partnerSlug,
      });
    } catch {
      // RPC may not exist yet — silently ignore
    }

    return NextResponse.json({
      success: true,
      data: {
        redirect_url: partner.referral_url,
      },
    });
  } catch (err: any) {
    console.error("[POST /api/v2/partners] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
