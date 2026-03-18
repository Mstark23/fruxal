// POST — Syncs obligations for a user based on their business profile.
// Works for all users including intake/prescan users who have business_profiles
// but no entry in the Prisma businesses table.
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const userId = (token as any)?.id || token?.sub;

    // Get user's business profile
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id, province, industry, industry_slug, business_structure, employee_count, annual_revenue")
      .eq("user_id", userId)
      .single();

    let businessId: string;
    if (!profile?.business_id) {
      // No profile at all — nothing to sync against
      if (!profile) {
        return NextResponse.json({ success: false, error: "No business profile found" }, { status: 404 });
      }
      // Profile exists but missing business_id — generate one and save it
      businessId = crypto.randomUUID();
      await supabaseAdmin
        .from("business_profiles")
        .update({ business_id: businessId, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    } else {
      businessId = profile.business_id;
    }

    // ── Try RPC sync first ────────────────────────────────────────────────
    try {
      const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc("sync_obligations", {
        p_business_id: businessId,
      });
      if (!rpcErr) {
        return NextResponse.json({ success: true, data: rpcResult, method: "rpc" });
      }
    } catch {}

    // ── Fallback: match obligation_rules to profile, upsert user_obligations ─
    const province  = profile.province || "QC";
    const industry  = profile.industry_slug || profile.industry || "generic_small_business";
    const structure = profile.business_structure || null;
    const employees = profile.employee_count || 1;
    const revenue   = profile.annual_revenue || 0;

    // Fetch matching obligation rules
    let query = supabaseAdmin
      .from("obligation_rules")
      .select("slug, title, category, risk_level, frequency, penalty_max, applies_to_provinces, applies_to_industries, applies_to_structures, min_employees, min_revenue, active")
      .eq("active", true);

    const { data: rules } = await query;
    if (!rules?.length) {
      return NextResponse.json({ success: true, data: { total_matched: 0, new_obligations: 0 }, method: "fallback_empty" });
    }

    // Filter rules that apply to this business
    const matching = rules.filter((r: any) => {
      if (r.applies_to_provinces?.length && !r.applies_to_provinces.includes(province) && !r.applies_to_provinces.includes("ALL")) return false;
      if (r.applies_to_industries?.length && !r.applies_to_industries.includes(industry) && !r.applies_to_industries.includes("all")) return false;
      if (r.applies_to_structures?.length && structure && !r.applies_to_structures.includes(structure)) return false;
      if (r.min_employees && employees < r.min_employees) return false;
      if (r.min_revenue && revenue < r.min_revenue) return false;
      return true;
    });

    // Compute next_deadline from frequency
    const nextDeadline = (freq: string): string | null => {
      const now = new Date();
      if (!freq) return null;
      const f = freq.toLowerCase();
      if (f.includes("monthly"))    { now.setMonth(now.getMonth() + 1); now.setDate(15); }
      else if (f.includes("quarterly")) { now.setMonth(now.getMonth() + 3); now.setDate(1); }
      else if (f.includes("annual") || f.includes("yearly")) { now.setFullYear(now.getFullYear() + 1); now.setMonth(2); now.setDate(31); }
      else if (f.includes("weekly")) { now.setDate(now.getDate() + 7); }
      else return null;
      return now.toISOString().split("T")[0];
    };

    // Get existing slugs for this user to avoid re-inserting
    const { data: existing } = await supabaseAdmin
      .from("user_obligations")
      .select("obligation_slug")
      .eq("user_id", userId);

    const existingSlugs = new Set((existing || []).map((e: any) => e.obligation_slug));

    const toInsert = matching
      .filter((r: any) => !existingSlugs.has(r.slug))
      .map((r: any) => ({
        user_id:         userId,
        business_id:     businessId,
        obligation_slug: r.slug,
        status:          "upcoming",
        next_deadline:   nextDeadline(r.frequency || ""),
        created_at:      new Date().toISOString(),
        updated_at:      new Date().toISOString(),
      }));

    if (toInsert.length > 0) {
      await supabaseAdmin.from("user_obligations").insert(toInsert);
    }

    return NextResponse.json({
      success: true,
      data: {
        total_matched:    matching.length,
        new_obligations:  toInsert.length,
        existing:         existingSlugs.size,
      },
      method: "fallback_direct",
    });
  } catch (err: any) {
    console.error("[Obligations Sync] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
