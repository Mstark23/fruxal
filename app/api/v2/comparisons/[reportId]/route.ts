// =============================================================================
// app/api/v2/comparisons/[reportId]/route.ts
// GET /api/v2/comparisons/:reportId — fetch comparison for a specific report
// Returns { status: 'generating' } while comparison is in progress
// Client polls every 2s, max 15 polls (30s)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 10;

export async function GET(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const { reportId } = params;
    if (!reportId) return NextResponse.json({ error: "reportId required" }, { status: 400 });

    // Check if this report has a comparison linked
    const { data: report } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, comparison_id, is_rescan, business_id, user_id")
      .eq("id", reportId)
      .maybeSingle();

    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Auth: must be the owner
    if (report.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // First scan — no comparison possible
    if (!report.is_rescan) {
      return NextResponse.json({ status: "first_scan" });
    }

    // is_rescan but no comparison_id yet — still generating
    if (!report.comparison_id) {
      return NextResponse.json({ status: "generating" });
    }

    // Fetch the comparison
    const { data: comparison } = await supabaseAdmin
      .from("diagnostic_comparisons")
      .select("id,business_id,new_report_id,previous_report_id,previous_score,new_score,score_delta,leaks_fixed_count,savings_recovered_monthly,findings_resolved_count,findings_new_count,findings_persisted_count,net_monthly_improvement,comparison_narrative,comparison_headline,days_between_scans,generated_at")
      .eq("id", report.comparison_id)
      .maybeSingle();

    if (!comparison) {
      return NextResponse.json({ status: "generating" });
    }

    return NextResponse.json({ status: "ready", comparison });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
