// =============================================================================
// app/api/v2/diagnostic/latest/route.ts
// GET — Returns the latest completed diagnostic report for the current user.
// Normalizes both old (flat) and new (nested) AI output shapes so all
// dashboard tiers read consistently.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken }        from "next-auth/jwt";
import { supabaseAdmin }   from "@/lib/supabase-admin";

// ── Normalize AI result to the shape all dashboards expect ───────────────────
// The AI schema evolved over time. This normalizer ensures old reports and
// new reports both produce the same structure for dashboard consumption.
function normalize(raw: any): any {
  if (!raw) return null;

  // ── totals: support both flat and nested ──────────────────────────────────
  const totals = raw.totals || {
    annual_leaks:            raw.total_annual_leaks            ?? 0,
    potential_savings:       raw.total_potential_savings        ?? 0,
    penalty_exposure:        raw.total_penalty_exposure         ?? 0,
    programs_value:          raw.total_programs_value           ?? 0,
    ebitda_impact:           raw.ebitda_impact ?? 0,
    enterprise_value_impact: raw.enterprise_value_impact ?? 0,
  };

  // ── accountant_briefing: support string (old) and object (new) ───────────
  let accountant_briefing = raw.accountant_briefing || null;
  if (!accountant_briefing && raw.cpa_briefing) {
    // Old format: cpa_briefing is a plain string
    if (typeof raw.cpa_briefing === "string") {
      accountant_briefing = {
        summary:                raw.cpa_briefing,
        cra_forms_relevant:     [],
        estimated_tax_exposure: 0,
        questions_to_ask:       [],
      };
    } else {
      accountant_briefing = raw.cpa_briefing;
    }
  }

  // ── action_plan: support missing tonight_action ───────────────────────────
  const action_plan = raw.action_plan || {
    tonight_action:   null,
    optimal_sequence: raw.priority_sequence
      ? raw.priority_sequence.map((p: any, i: number) => ({
          step:    p.step || i + 1,
          action:  p.title || p.description || "",
          value:   0,
          unlocks: [],
        }))
      : [],
  };

  // ── north_star, ninety_day, strengths: provide safe defaults ─────────────
  const north_star_metric  = raw.north_star_metric  || null;
  const ninety_day_success = raw.ninety_day_success || null;
  const strengths          = raw.strengths          || [];

  // ── Fix 3: backfill calculation_shown for findings that lack it ─────────────
  // Older diagnostics didn't include calculation_shown.
  // Construct a minimal formula string from available numeric fields.
  const findings = (raw.findings || []).map((f: any) => {
    // Normalize dollar fields: AI uses annual_leak/potential_savings,
    // dashboard pages read impact_min/impact_max — bridge both
    const leak    = (f.annual_leak    || f.impact_max || f.impact_min || f.potential_savings) ?? 0;
    const savings = (f.potential_savings || f.annual_leak || f.impact_max) ?? 0;

    // Add impact_min/impact_max so dashboard pages work regardless of AI field names
    const normalized: any = {
      ...f,
      impact_min: f.impact_min || leak,
      impact_max: f.impact_max || leak,
      annual_leak: leak,
      potential_savings: savings,
    };

    // Build calculation_shown if missing
    if (!f.calculation_shown && leak > 0) {
      normalized.calculation_shown = (savings > 0 && savings !== leak)
        ? "Est. $" + leak.toLocaleString() + "/yr leak -> $" + savings.toLocaleString() + " recoverable"
        : "Est. $" + (leak ?? 0).toLocaleString() + "/yr annual impact";
    }

    // Extract program_slugs from programs[] array if present
    if (!f.program_slugs && f.programs?.length > 0) {
      normalized.program_slugs = f.programs.map((p: any) => p.slug).filter(Boolean);
    }

    return normalized;
  });

  // Normalize programs: use top-level programs[] if present,
  // otherwise reconstruct from finding program_slugs (backward compat)
  let programs = raw.programs || [];
  if (programs.length === 0) {
    // Old reports: collect unique program_slugs from findings, create stub entries
    const seen = new Set<string>();
    findings.forEach((f: any) => {
      (f.program_slugs || []).forEach((slug: string) => {
        if (!seen.has(slug)) {
          seen.add(slug);
          programs.push({ slug, name: slug.replace(/-/g, " ").replace(/\w/g, (l: string) => l.toUpperCase()), name_fr: "", description: "", category: "grant", level: "federal", max_amount: 0, url: "", finding_ids: [f.id] });
        }
      });
    });
  }

  return {
    ...raw,
    findings,
    programs,
    totals,
    accountant_briefing,
    action_plan,
    north_star_metric,
    ninety_day_success,
    strengths,
    // Keep flat fields for backward compat
    total_annual_leaks:      totals.annual_leaks,
    total_potential_savings: totals.potential_savings,
    total_penalty_exposure:  totals.penalty_exposure,
    total_programs_value:    totals.programs_value,
    ebitda_impact:           totals.ebitda_impact,
    enterprise_value_impact: totals.enterprise_value_impact,
  };
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = (token as any)?.id || token?.sub;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: report, error } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, tier, status, completed_at, created_at, result_json")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !report) {
      return NextResponse.json({ success: true, data: null, status: null });
    }

    // Still analyzing — return poll state
    if (report.status === "analyzing") {
      return NextResponse.json({
        success:   true,
        data:      null,
        status:    "analyzing",
        report_id: report.id,
        tier:      report.tier,
      });
    }

    const normalized = normalize(report.result_json);

    return NextResponse.json({
      success:      true,
      data:         normalized,
      report_id:    report.id,
      tier:         report.tier,
      status:       report.status,
      completed_at: report.completed_at,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
