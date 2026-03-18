// =============================================================================
// GET /api/me — Current user profile + business
// =============================================================================
// Checks both Prisma tables (business_members → businesses)
// AND Supabase tables (business_profiles) as fallback.
// =============================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    let business = null;

    // Path A: Prisma tables (business_members → businesses)
    try {
      const { data: membership } = await supabaseAdmin
        .from("business_members")
        .select("role, businessId, createdAt")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })
        .limit(1)
        .single();

      if (membership) {
        const { data: biz } = await supabaseAdmin
          .from("businesses")
          .select("id, name, industry, region, country_code, currency, province, tier, monthly_revenue, annual_revenue, employee_count")
          .eq("id", membership.businessId)
          .single();

        if (biz) {
          business = {
            id: biz.id,
            name: biz.name,
            industry: biz.industry,
            tier: biz.tier || "mid-size-business",
            region: biz.region || biz.country_code || "CA",
            currency: biz.currency || "CAD",
            province: biz.province || null,
            monthlyRevenue: biz.monthly_revenue || null,
            annualRevenue: biz.annual_revenue || null,
            employeeCount: biz.employee_count || null,
            role: membership.role,
          };
        }
      }
    } catch {}

    // Path B: business_profiles (V2 schema — register always creates this)
    if (!business) {
      try {
        const { data: profile } = await supabaseAdmin
          .from("business_profiles")
          .select("business_id, province, industry, industry_label, business_structure, annual_revenue, employee_count")
          .eq("user_id", userId)
          .single();

        if (profile) {
          business = {
            id: profile.business_id || userId,
            name: "My Business",
            industry: profile.industry || "generic_small_business",
            tier: "Free",
            region: "CA",
            currency: "CAD",
            province: profile.province || null,
            monthlyRevenue: null,
            annualRevenue: profile.annual_revenue || null,
            employeeCount: profile.employee_count || null,
            role: "owner",
          };
        }
      } catch {}
    }

    // Path C: prescan_runs (last resort — find any prescan linked to this user)
    if (!business) {
      try {
        const { data: run } = await supabaseAdmin
          .from("prescan_runs")
          .select("id, business_id, industry_slug, province, annual_revenue")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (run) {
          business = {
            id: run.business_id || run.id,
            name: "My Business",
            industry: run.industry_slug || "generic_small_business",
            tier: "Free",
            region: "CA",
            currency: "CAD",
            province: run.province || null,
            monthlyRevenue: null,
            annualRevenue: run.annual_revenue || null,
            employeeCount: null,
            role: "owner",
          };
        }
      } catch {}
    }

    return NextResponse.json({
      user: {
        id: userId,
        email: session.user.email,
        name: session.user.name,
      },
      business,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
