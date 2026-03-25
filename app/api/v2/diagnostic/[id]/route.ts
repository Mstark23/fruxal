// =============================================================================
// app/api/v2/diagnostic/[id]/route.ts
// GET — Fetch a completed diagnostic report by ID.
// Direct table read (no RPC dependency).
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = (token as any)?.id || token?.sub;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: row, error } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();

    if (error || !row) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    // Auto-heal: if result_json exists but status is still analyzing, mark completed
    if (row.result_json && row.status === "analyzing") {
      await supabaseAdmin
        .from("diagnostic_reports")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", params.id);
      row.status = "completed";
    }

    // Merge result_json (full AI output) with denormalized columns
    const data = {
      ...(row.result_json || {}),
      id:              row.id,
      businessId:      row.business_id,   // page needs this for solutions/goals calls
      tier:            row.tier,
      language:        row.language,
      status:          row.status,
      created_at:      row.created_at,
      completed_at:    row.completed_at,
      model_used:      row.model_used,
      prescan_context_used: row.prescan_context_used ?? false,
      prescan_run_id:  row.prescan_run_id ?? null,
      goal_suggestion: row.goal_suggestion ?? null,
      // Fallback denormalized scores (if result_json has flat fields)
      overall_score:        row.overall_score,
      compliance_score:     row.compliance_score,
      efficiency_score:     row.efficiency_score,
      optimization_score:   row.optimization_score,
      growth_score:         row.growth_score,
      bankability_score:    row.bankability_score,
      exit_readiness_score: row.exit_readiness_score,
      findings_count:       row.findings_count,
      critical_findings:    row.critical_findings,
      total_potential_savings:     row.total_potential_savings,
      total_annual_leaks:          row.total_annual_leaks,
      ebitda_impact:               row.ebitda_impact,
      enterprise_value_impact:     row.enterprise_value_impact,
    };

    // Normalize result_json so page gets consistent field names regardless of AI output version
    if (data && typeof data === "object") {
      // Build totals from flat or nested fields
      if (!data.totals) {
        data.totals = {
          annual_leaks:       data.total_annual_leaks      ?? 0,
          potential_savings:  data.total_potential_savings  ?? 0,
          penalty_exposure:   data.total_penalty_exposure   ?? 0,
          programs_value:     data.total_programs_value     ?? 0,
        };
      }
      // Normalize findings: add impact_min/impact_max if missing
      // Normalize benchmark_comparisons: new schema uses metric_name/metric_name_fr
      // but results page TypeScript interface uses metric/metric_fr
      if (Array.isArray(data.benchmark_comparisons)) {
        data.benchmark_comparisons = data.benchmark_comparisons.map((b: any) => ({
          ...b,
          metric:    b.metric    || b.metric_name    || "",
          metric_fr: b.metric_fr || b.metric_name_fr || b.metric || b.metric_name || "",
        }));
      }

      // Normalize priority_sequence → action_plan.optimal_sequence
      // Results page tab "Action Plan" reads action_plan.optimal_sequence
      // New schema outputs priority_sequence with different field names
      if (Array.isArray(data.priority_sequence) && !data.action_plan?.optimal_sequence?.length) {
        data.action_plan = {
          ...(data.action_plan || {}),
          optimal_sequence: data.priority_sequence.map((s: any) => ({
            priority:          s.rank        || s.step || 1,
            title:             s.action      || s.title || "",
            title_fr:          s.action_fr   || s.title_fr || "",
            description:       s.why_first   || s.expected_result || s.description || "",
            description_fr:    s.why_first_fr || s.description_fr || "",
            estimated_savings: s.ebitda_improvement || s.enterprise_value_improvement || 0,
            timeline:          s.timeline    || "90days",
            difficulty:        s.effort      || s.difficulty || "medium",
          })),
        };
      }

      if (Array.isArray(data.findings)) {
        data.findings = data.findings.map((f: any) => {
          const leak = (f.annual_leak || f.impact_max || f.impact_min || f.potential_savings) ?? 0;
          const savings = f.potential_savings || leak;
          // Map effort → difficulty (Claude returns 'effort', page renders 'difficulty')
          const difficulty = f.difficulty || f.effort || "medium";
          // Map action_items array → recommendation string (page reads string, Claude returns array)
          const recommendation = f.recommendation || (
            Array.isArray(f.action_items) && f.action_items.length > 0
              ? f.action_items[0]
              : ""
          );
          const recommendation_fr = f.recommendation_fr || (
            Array.isArray(f.action_items_fr) && f.action_items_fr.length > 0
              ? f.action_items_fr[0]
              : recommendation
          );
          return {
            ...f,
            difficulty,
            recommendation,
            recommendation_fr,
            impact_min: f.impact_min || Math.round(leak * 0.8),  // provide realistic range
            impact_max: f.impact_max || leak,
            annual_leak: leak,
            potential_savings: savings,
          };
        });
      }
    }

    // Add meta object page reads at report.meta.duration_ms etc
    if (data && !data.meta) {
      (data as any).meta = {
        model:        row.model_used || "claude-sonnet-4-20250514",
        duration_ms:  row.duration_ms ?? 0,
        created_at:   row.created_at,
        completed_at: row.completed_at,
      };
    }

    return NextResponse.json({ success: true, data, report_id: row.id });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
