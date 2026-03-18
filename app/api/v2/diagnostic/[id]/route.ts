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
      tier:            row.tier,
      status:          row.status,
      created_at:      row.created_at,
      completed_at:    row.completed_at,
      model_used:      row.model_used,
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
          annual_leaks:       data.total_annual_leaks      || 0,
          potential_savings:  data.total_potential_savings  || 0,
          penalty_exposure:   data.total_penalty_exposure   || 0,
          programs_value:     data.total_programs_value     || 0,
        };
      }
      // Normalize findings: add impact_min/impact_max if missing
      if (Array.isArray(data.findings)) {
        data.findings = data.findings.map((f: any) => {
          const leak = f.annual_leak || f.impact_max || f.impact_min || 0;
          return {
            ...f,
            impact_min: f.impact_min || leak,
            impact_max: f.impact_max || leak,
            annual_leak: leak,
          };
        });
      }
    }

    return NextResponse.json({ success: true, data, report_id: row.id });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
