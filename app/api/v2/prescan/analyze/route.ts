// =============================================================================
// src/app/api/v2/prescan/analyze/route.ts
// =============================================================================
// POST — Processes prescan answers WITHOUT calling Claude (free tier).
//
// Pipeline:
//   1. Receive 5 answers (province, industry, structure, revenue, employees, flags)
//   2. Query obligation_rules for matched obligations
//   3. Query provincial_leak_detectors for matched leaks
//   4. Query affiliate_partners for matched programs
//   5. Calculate totals: obligations count, leak exposure, programs value
//   6. Store result in prescan_results table
//   7. Return resultId for redirect to results page
//
// NO authentication required — this is top of funnel.
// NO Claude API — too expensive for free users. Pure database math.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCountryFromHost, type Country } from "@/lib/country";

// Rate limit: 10 prescan analyses per IP per hour
const _pscRl = new Map<string, {c: number; r: number}>();
function pscRateCheck(ip: string): boolean {
  const now = Date.now();
  const e = _pscRl.get(ip);
  if (!e || e.r < now) { _pscRl.set(ip, {c: 1, r: now + 3_600_000}); return true; }
  e.c++; return e.c <= 10;
}



export const maxDuration = 60; // Vercel function timeout (seconds)


export async function POST(req: NextRequest) {
  const _pIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!pscRateCheck(_pIp)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  try {
    const body = await req.json();
    const {
      province, industry, structure, monthly_revenue, employee_count,
      has_accountant, has_payroll, handles_data, handles_food,
      does_construction, sells_alcohol,
      // Smart follow-up fields
      does_rd, exports_goods, has_physical_location,
      uses_payroll_software, tax_last_reviewed,
      vendor_contracts_stale, has_business_insurance,
    } = body;

    // Determine country: explicit from client, or detect from Host header
    const country: Country = body.country === "US" ? "US"
      : body.country === "CA" ? "CA"
      : getCountryFromHost(req.headers.get("host") || "");
    const isUS = country === "US";

    if (!province || !industry || !structure) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const annual_revenue = (monthly_revenue ?? 0) * 12;
    const employees = employee_count ?? 0;

    // Build flags array for matching
    const flags: string[] = [];
    if (employees > 0) flags.push("has_employees");
    if (has_payroll || employees > 0) flags.push("has_payroll");
    if (handles_data) flags.push("handles_data");
    if (handles_food) flags.push("handles_food");
    if (does_construction) flags.push("does_construction");
    if (sells_alcohol) flags.push("sells_alcohol");

    // ─── 1. Match obligations ────────────────────────────────────────

    // Fetch obligations: match by province/state code in applies_to_provinces array,
    // OR obligations with empty array (federal — applies to all)
    const { data: allObligations } = await supabaseAdmin
      .from("obligation_rules")
      .select("slug, title, title_fr, category, risk_level, agency, penalty_min, penalty_max, penalty_description, frequency, priority_score, applies_to_provinces")
      .order("priority_score", { ascending: false });

    // Filter: obligations that apply to this province/state or are federal (empty array)
    const obligations = (allObligations || []).filter(o => {
      const prov = o.applies_to_provinces;
      if (!prov || prov.length === 0) return true; // federal/all
      return prov.includes(province);
    });

    // Filter obligations by business profile
    const matchedObligations = (obligations || []).filter(ob => {
      return ob.priority_score >= 60; // Only show meaningful ones in prescan
    }).slice(0, 30); // Cap for prescan

    // Count by risk level
    const criticalObligations = matchedObligations.filter(o => o.risk_level === "critical").length;
    const highObligations = matchedObligations.filter(o => o.risk_level === "high").length;
    const totalPenaltyExposure = matchedObligations.reduce((sum, o) => sum + (o.penalty_max ?? 0), 0);

    // ─── 2. Match leak detectors ─────────────────────────────────────

    const { data: leaks } = await supabaseAdmin
      .from("provincial_leak_detectors")
      .select("slug, title, title_fr, category, severity, annual_impact_min, annual_impact_max, solution_type, detection_question, detection_question_fr, partner_slugs, program_slugs, structures, min_employees, max_employees, min_revenue, max_revenue")
      .in("province", isUS ? [province, "ALL"] : [province])
      .order("annual_impact_max", { ascending: false });

    // Filter leaks by relevance to this business
    const matchedLeaks = (leaks || []).filter(leak => {
      // Structure filter
      if ((leak as any).structures && !(leak as any).structures.includes(structure)) return false;
      // Employee filter
      if ((leak as any).min_employees && employees < (leak as any).min_employees) return false;
      if ((leak as any).max_employees && employees > (leak as any).max_employees) return false;
      // Revenue filter
      if ((leak as any).min_revenue && annual_revenue < (leak as any).min_revenue) return false;
      if ((leak as any).max_revenue && annual_revenue > (leak as any).max_revenue) return false;
      return true;
    }).slice(0, 20);

    const totalLeakMin = matchedLeaks.reduce((sum, l) => sum + (l.annual_impact_min ?? 0), 0);
    const totalLeakMax = matchedLeaks.reduce((sum, l) => sum + (l.annual_impact_max ?? 0), 0);
    const criticalLeaks = matchedLeaks.filter(l => l.severity === "critical").length;
    const highLeaks = matchedLeaks.filter(l => l.severity === "high").length;

    // ─── 3. Match government programs ────────────────────────────────
    // Fetch all government programs, then filter by province/state or federal (empty array)
    const { data: allPrograms } = await supabaseAdmin
      .from("affiliate_partners")
      .select("slug, name, category, sub_category, description, url, priority_score, provinces")
      .eq("is_government_program", true)
      .order("priority_score", { ascending: false });

    const matchedPrograms = (allPrograms || []).filter(p => {
      if (!p.provinces || p.provinces.length === 0) return true; // federal/all
      return p.provinces.includes(province);
    }).slice(0, 15);

    // ─── 4. Calculate business-specific insights ─────────────────────

    const insights: { type: string; title: string; title_fr: string; impact: string; severity: string }[] = [];

    // ── Incorporation / entity structure check ──
    if (structure === "sole_proprietor" && annual_revenue > 50000) {
      if (isUS) {
        const savings = Math.round(annual_revenue * 0.15);
        insights.push({
          type: "structure",
          title: "You may be overpaying self-employment tax as a sole proprietor",
          title_fr: "",
          impact: `$${savings.toLocaleString()}/yr potential savings — S-corp election can reduce FICA exposure`,
          severity: "critical",
        });
      } else {
        const corpRate = province === "SK" ? "9%" : province === "MB" ? "9%" : province === "AB" ? "10%" :
          province === "QC" ? "12.2%" : province === "ON" ? "12.2%" : province === "BC" ? "11%" :
          province === "PE" ? "10%" : province === "NL" ? "12%" : "11.5%";
        const personalRate = province === "NL" ? "54.8%" : province === "NS" ? "54%" : province === "QC" ? "53.3%" :
          province === "BC" ? "53.5%" : province === "ON" ? "53.5%" : province === "SK" ? "47.5%" :
          province === "AB" ? "48%" : "50%";
        const savings = Math.round(annual_revenue * 0.15);
        insights.push({
          type: "structure",
          title: "You may be overpaying taxes as a sole proprietor",
          title_fr: "Vous pourriez payer trop d'impôt comme travailleur autonome",
          impact: `$${savings.toLocaleString()}/yr potential savings (${corpRate} corporate vs ${personalRate} personal top rate)`,
          severity: "critical",
        });
      }
    }

    // ── No accountant / CPA check ──
    if (!has_accountant && annual_revenue > 30000) {
      insights.push({
        type: "bookkeeping",
        title: isUS ? "Operating without a CPA or bookkeeper" : "Operating without professional bookkeeping",
        title_fr: "Opérer sans tenue de livres professionnelle",
        impact: "$3,000 - $15,000/yr in missed deductions",
        severity: "high",
      });
    }

    // ── Data privacy check ──
    if (handles_data) {
      if (isUS && province === "CA") {
        insights.push({
          type: "privacy",
          title: "CCPA / CPRA privacy compliance required",
          title_fr: "",
          impact: "Up to $7,500 per intentional violation",
          severity: "critical",
        });
      } else if (isUS && ["NY", "CO", "CT", "VA", "UT"].includes(province)) {
        insights.push({
          type: "privacy",
          title: `${province} state privacy law compliance required`,
          title_fr: "",
          impact: "Fines vary by state — non-compliance risk is rising",
          severity: "high",
        });
      } else if (!isUS && ["QC", "AB", "BC"].includes(province)) {
        const law = province === "QC" ? "Law 25" : province === "AB" ? "PIPA" : "PIPA BC";
        insights.push({
          type: "privacy",
          title: `${law} privacy compliance required`,
          title_fr: `Conformité ${law} obligatoire`,
          impact: "Up to $100,000 in potential fines",
          severity: "critical",
        });
      }
    }

    // ── Sales tax / GST threshold ──
    if (isUS) {
      // US: sales tax nexus — relevant for e-commerce / multi-state
      if (exports_goods || annual_revenue > 100000) {
        insights.push({
          type: "sales_tax",
          title: "You may have sales tax nexus in multiple states",
          title_fr: "",
          impact: "Post-Wayfair, economic nexus thresholds apply — penalties for non-collection",
          severity: "high",
        });
      }
    } else {
      if (annual_revenue > 30000 && annual_revenue < 40000) {
        insights.push({
          type: "gst",
          title: "You've crossed the $30K GST/HST registration threshold",
          title_fr: "Vous avez franchi le seuil de 30K$ d'inscription TPS/TVH",
          impact: "Must register or face penalties",
          severity: "high",
        });
      }
    }

    // ── Employee-related ──
    if (employees > 0 && employees <= 5) {
      insights.push({
        type: "payroll",
        title: "Small team compliance gaps are common",
        title_fr: "Les petites équipes ont souvent des lacunes de conformité",
        impact: isUS
          ? "Workers' comp, payroll taxes, FLSA, and employment standards all apply"
          : "Workers' comp, source deductions, employment standards all apply",
        severity: "high",
      });
    }

    // ── US-specific: R&D credit ──
    if (isUS && does_rd && annual_revenue > 50000) {
      insights.push({
        type: "rd_credit",
        title: "You may qualify for the federal R&D tax credit",
        title_fr: "",
        impact: "Section 41 credit — up to 20% of qualifying R&D expenses",
        severity: "high",
      });
    }

    // ── US-specific: Section 199A / QBI deduction ──
    if (isUS && structure !== "corporation" && annual_revenue > 50000 && annual_revenue < 500000) {
      insights.push({
        type: "qbi",
        title: "You may be eligible for the 20% QBI deduction (Section 199A)",
        title_fr: "",
        impact: `Up to $${Math.round(annual_revenue * 0.04).toLocaleString()}/yr in tax savings`,
        severity: "high",
      });
    }

    // ─── 5. Build result object ──────────────────────────────────────

    const tier = employees === 0 && monthly_revenue < 10000 ? "solo" :
                 employees <= 10 && monthly_revenue < 80000 ? "small" : "growth";

    // Calculate a rough health score (lower = more leaks/risks)
    let roughScore = 75;
    if (structure === "sole_proprietor" && annual_revenue > 50000) roughScore -= 15;
    if (!has_accountant) roughScore -= 10;
    if (handles_data && !has_accountant) roughScore -= 8;
    if (employees > 0 && !has_payroll) roughScore -= 10;
    if (criticalLeaks > 2) roughScore -= 10;
    roughScore = Math.max(15, Math.min(85, roughScore));

    const result = {
      // Input snapshot
      input: {
        province, industry, structure, monthly_revenue, employee_count: employees,
        annual_revenue, tier, flags, country,
      },
      // Summary numbers
      summary: {
        health_score: roughScore,
        total_obligations: matchedObligations.length,
        critical_obligations: criticalObligations,
        high_obligations: highObligations,
        total_penalty_exposure: totalPenaltyExposure,
        total_leaks: matchedLeaks.length,
        critical_leaks: criticalLeaks,
        high_leaks: highLeaks,
        leak_range_min: totalLeakMin,
        leak_range_max: totalLeakMax,
        programs_count: matchedPrograms.length,
      },
      // Teaser findings (show 3 most impactful, blur the rest)
      teaser_leaks: matchedLeaks.slice(0, 3).map(l => ({
        slug: l.slug,
        title: l.title,
        title_fr: l.title_fr,
        severity: l.severity,
        impact_min: l.annual_impact_min,
        impact_max: l.annual_impact_max,
        category: l.category,
        solution_type: l.solution_type,
      })),
      // Blurred count (how many more exist)
      hidden_leak_count: Math.max(0, matchedLeaks.length - 3),
      // Business-specific insights
      insights,
      // Teaser obligations (show categories only, not details)
      obligation_categories: [...new Set(matchedObligations.map(o => o.category))],
      // Teaser programs (show 2 names, blur rest)
      teaser_programs: matchedPrograms.slice(0, 2).map(p => ({
        name: p.name,
        category: p.sub_category,
      })),
      hidden_program_count: Math.max(0, matchedPrograms.length - 2),
      ai_insight: "", // filled below
    };

    // ─── 6. Store in prescan_results ─────────────────────────────────

    const { data: stored, error: storeErr } = await supabaseAdmin
      .from("prescan_results")
      .insert({
        input_snapshot: result.input,
        summary: result.summary,
        teaser_leaks: result.teaser_leaks,
        hidden_leak_count: result.hidden_leak_count,
        insights: result.insights,
        obligation_categories: result.obligation_categories,
        teaser_programs: result.teaser_programs,
        hidden_program_count: result.hidden_program_count,
        province, industry, structure, tier,
      })
      .select("id")
      .single();

    if (storeErr || !stored?.id) throw storeErr || new Error("Failed to store prescan result");

    return NextResponse.json({
      success: true,
      resultId: stored.id,
      aiInsight,
    });

  } catch (err: any) {
    console.error("[Prescan:Analyze] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
