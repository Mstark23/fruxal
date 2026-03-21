// =============================================================================
// src/app/api/v2/tour/data/route.ts
// =============================================================================
// GET — Returns all data needed for the post-onboarding tour.
//
// Requires authenticated user with completed onboarding.
// Queries:
//   1. User profile (province, industry, structure, employees, revenue)
//   2. Matched obligations (top 5 by priority, penalty exposure, next deadline)
//   3. Matched leak detectors (top 3 by impact, total range)
//   4. Matched programs (top 4, government count)
//   5. Rough health score calculation
//
// Each section is resilient — if a table doesn't exist yet, sensible defaults
// are returned so the tour still works.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // ─── Auth ────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const supabase = getSupabase();

    // ─── 1. User profile ─────────────────────────────────────────

    let province = "QC";
    let industry = "general_business";
    let structure = "sole_proprietor";
    let employees = 0;
    let annualRevenue = 0;
    let hasAccountant = false;
    let hasEmployees = false;
    let handlesData = false;

    try {
      const { data: profile, error: profileErr } = await supabase
        .from("business_profiles")
        .select("province, industry, business_structure, employee_count, annual_revenue, monthly_revenue, has_accountant, has_employees, handles_data, handles_food, does_construction, sells_alcohol")
        .eq("user_id", userId)
        .single();

      if (!profileErr && profile) {
        province = profile.province || province;
        industry = profile.industry || industry;
        structure = profile.business_structure || structure;
        employees = profile.employee_count ?? 0;
        annualRevenue = profile.annual_revenue || (profile.monthly_revenue ?? 0) * 12;
        hasAccountant = !!profile.has_accountant;
        hasEmployees = !!profile.has_employees;
        handlesData = !!profile.handles_data;
      }
    } catch (err) {
      console.warn("[Tour:Data] business_profiles query failed:", err);
    }

    // ─── 2. Matched obligations ──────────────────────────────────

    let matchedObligations: any[] = [];
    let criticalObs = 0;
    let highObs = 0;
    let penaltyExposure = 0;
    let nextDeadline: string | null = null;
    let nextDeadlineLabel: string | null = null;

    try {
      const { data: obligations } = await supabase
        .from("obligation_rules")
        .select("title, category, risk_level, frequency, agency, penalty_max, priority_score")
        .eq("province", province)
        .order("priority_score", { ascending: false });

      matchedObligations = (obligations || []).filter((ob: any) => ob.priority_score >= 60);
      criticalObs = matchedObligations.filter((o: any) => o.risk_level === "critical").length;
      highObs = matchedObligations.filter((o: any) => o.risk_level === "high").length;
      penaltyExposure = matchedObligations.reduce((sum: number, o: any) => sum + (o.penalty_max ?? 0), 0);
    } catch (err) {
      console.warn("[Tour:Data] obligation_rules query failed:", err);
    }

    // Next deadline from user_obligations
    try {
      const { data: nextDeadlineData } = await supabase
        .from("user_obligations")
        .select("next_deadline, obligation_rules(title)")
        .eq("user_id", userId)
        .eq("status", "upcoming")
        .order("next_deadline", { ascending: true })
        .limit(1);

      if (nextDeadlineData?.[0]) {
        const d = new Date(nextDeadlineData[0].next_deadline);
        nextDeadline = d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
        nextDeadlineLabel = (nextDeadlineData[0] as any).obligation_rules?.title || null;
      }
    } catch (err) {
      console.warn("[Tour:Data] user_obligations query failed:", err);
    }

    // ─── 3. Matched leak detectors ───────────────────────────────

    let matchedLeaks: any[] = [];
    let criticalLeaks = 0;
    let leakMin = 0;
    let leakMax = 0;

    try {
      const { data: leaks } = await supabase
        .from("provincial_leak_detectors")
        .select("title, severity, category, annual_impact_min, annual_impact_max, solution_type")
        .eq("province", province)
        .order("annual_impact_max", { ascending: false });

      matchedLeaks = leaks || [];
      criticalLeaks = matchedLeaks.filter((l: any) => l.severity === "critical").length;
      leakMin = matchedLeaks.reduce((sum: number, l: any) => sum + (l.annual_impact_min ?? 0), 0);
      leakMax = matchedLeaks.reduce((sum: number, l: any) => sum + (l.annual_impact_max ?? 0), 0);
    } catch (err) {
      console.warn("[Tour:Data] provincial_leak_detectors query failed:", err);
    }

    // ─── 4. Matched programs ─────────────────────────────────────

    let matchedPrograms: any[] = [];
    let govCount = 0;
    let totalPrograms = 0;

    try {
      const { data: programs } = await supabase
        .from("affiliate_partners")
        .select("name, sub_category, description, is_government_program, priority_score")
        .eq("is_government_program", true)
        .contains("provinces", [province])
        .order("priority_score", { ascending: false });

      matchedPrograms = programs || [];
      govCount = matchedPrograms.filter((p: any) => p.is_government_program).length;

      const { data: affiliates } = await supabase
        .from("affiliate_partners")
        .select("name, sub_category, description, is_government_program, priority_score")
        .eq("is_government_program", false)
        .contains("provinces", [province])
        .order("priority_score", { ascending: false })
        .limit(10);

      totalPrograms = matchedPrograms.length + (affiliates || []).length;
    } catch (err) {
      console.warn("[Tour:Data] affiliate_partners query failed:", err);
    }

    // ─── 5. Health score calculation ─────────────────────────────

    let score = 72; // Base

    // Structure optimization
    if (structure === "sole_proprietor" && annualRevenue > 50000) score -= 12;
    if (structure === "sole_proprietor" && annualRevenue > 100000) score -= 8;

    // Professional support
    if (!hasAccountant) score -= 10;
    if (!hasAccountant && annualRevenue > 60000) score -= 5;

    // Compliance signals
    if (employees > 0 && !hasEmployees) score -= 8;
    if (handlesData && !hasAccountant) score -= 6;

    // Leak density
    if (criticalLeaks > 3) score -= 10;
    else if (criticalLeaks > 1) score -= 5;

    // Revenue thresholds
    if (annualRevenue > 30000 && annualRevenue < 40000) score -= 3;

    // Province-specific
    if (["NL", "NT", "NU"].includes(province) && employees > 0) score -= 3;

    score = Math.max(12, Math.min(88, score));

    // ─── 6. Build response ───────────────────────────────────────

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          province,
          industry,
          structure,
          employee_count: employees,
          annual_revenue: annualRevenue,
        },
        obligations: {
          total: matchedObligations.length,
          critical: criticalObs,
          high: highObs,
          next_deadline: nextDeadline,
          next_deadline_label: nextDeadlineLabel,
          penalty_exposure: penaltyExposure,
          top: matchedObligations.slice(0, 5).map((o: any) => ({
            title: o.title,
            category: o.category,
            risk_level: o.risk_level,
            frequency: o.frequency,
            agency: o.agency,
            penalty_max: o.penalty_max ?? 0,
          })),
        },
        leaks: {
          total: matchedLeaks.length,
          critical: criticalLeaks,
          range_min: leakMin,
          range_max: leakMax,
          top: matchedLeaks.slice(0, 3).map((l: any) => ({
            title: l.title,
            severity: l.severity,
            category: l.category,
            impact_min: l.annual_impact_min ?? 0,
            impact_max: l.annual_impact_max ?? 0,
            solution_type: l.solution_type,
          })),
        },
        programs: {
          total: totalPrograms,
          government: govCount,
          top: matchedPrograms.slice(0, 4).map((p: any) => ({
            name: p.name,
            category: p.sub_category,
            description: p.description,
          })),
        },
        health_score: score,
      },
    });

  } catch (err: any) {
    console.error("[Tour:Data] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
