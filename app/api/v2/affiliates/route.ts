// =============================================================================
// GET /api/v2/affiliates — Affiliate partner data for programs page
// Called by /v2/programs page as: fetch("/api/v2/affiliates?type=partner")
// This route was missing — programs page always showed 0 partner firms.
// Proxies to the existing /api/v2/partners logic with the right shape.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type     = searchParams.get("type") || "partner";
    const category = searchParams.get("category") || null;
    const province = searchParams.get("province") || null;
    const industry = searchParams.get("industry") || null;
    const limit    = Math.min(Number(searchParams.get("limit")) || 50, 100);

    // Try to get user context for better matching
    let userProvince = province;
    let userCountry = searchParams.get("country") || null;
    let userIndustry = industry;

    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const userId = (session.user as any).id;
        const { data: profile } = await supabaseAdmin
          .from("business_profiles")
          .select("province, country, industry")
          .eq("user_id", userId)
          .maybeSingle();
        if (profile) {
          userProvince = userProvince || profile.province;
          userCountry = userCountry || profile.country;
          userIndustry = userIndustry || profile.industry;
        }
      }
    } catch { /* non-fatal */ }

    // Query affiliate_partners table
    let query = supabaseAdmin
      .from("affiliate_partners")
      .select("id, name, name_fr, slug, category, description, description_fr, url, logo_url, commission_type, commission_rate, is_government_program, province, industry_tags, tags, is_active, priority_score, annual_value_min, annual_value_max")
      .eq("is_active", true)
      .order("priority_score", { ascending: false })
      .limit(limit);

    // Filter by type
    if (type === "partner") {
      query = query.eq("is_government_program", false);
    } else if (type === "government" || type === "program") {
      query = query.eq("is_government_program", true);
    }

    // Filter by category if specified
    if (category) {
      query = query.eq("category", category);
    }

    const { data: allPartners, error } = await query;

    if (error) throw error;

    // Filter by province/country: include programs that match user's province
    // OR have empty provinces array (federal/national programs)
    let filtered = allPartners || [];
    if (userProvince) {
      filtered = filtered.filter((p: any) => {
        if (!p.provinces || p.provinces.length === 0) return true; // federal/national
        return p.provinces.includes(userProvince);
      });
    }

    // Group by category for the programs page
    const byCategory: Record<string, any[]> = {};
    for (const p of filtered) {
      const cat = p.category || "other";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({
        id:             p.id,
        name:           p.name,
        slug:           p.slug,
        category:       p.category,
        description:    p.description,
        description_fr: p.description_fr,
        url:            p.url,
        logo_url:       p.logo_url,
        commission_type: p.commission_type,
        is_government:  p.is_government_program,
        province:       p.province,
        tags:           p.tags || [],
      });
    }

    return NextResponse.json({
      success:    true,
      total:      allPartners.length,
      affiliates: filtered,        // flat list (programs page uses this)
      data:       filtered,        // alias
      by_category: byCategory,
    });

  } catch (err: any) {
    console.error("[Affiliates] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
