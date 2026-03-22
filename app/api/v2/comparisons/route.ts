// =============================================================================
// app/api/v2/comparisons/route.ts
// GET /api/v2/comparisons/history?businessId=XXX  — all comparisons for dashboard widget
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    // Verify ownership
    const { data: biz } = await supabaseAdmin.from("businesses").select("id")
      .eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
    const { data: prof } = biz ? { data: null } :
      await supabaseAdmin.from("business_profiles").select("business_id")
        .eq("business_id", businessId).eq("user_id", userId).maybeSingle();
    if (!biz && !prof) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: comparisons } = await supabaseAdmin
      .from("diagnostic_comparisons")
      .select("id, previous_score, new_score, score_delta, savings_recovered_monthly, findings_new_count, net_monthly_improvement, days_between_scans, comparison_headline, generated_at, new_report_id")
      .eq("business_id", businessId)
      .order("generated_at", { ascending: false })
      .limit(10);

    // Also get days since last diagnostic for rescan nudge
    const { data: lastDiag } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("created_at, completed_at")
      .eq("business_id", businessId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const daysSinceLast = lastDiag?.completed_at || lastDiag?.created_at
      ? Math.floor((Date.now() - new Date(lastDiag.completed_at ?? lastDiag.created_at).getTime()) / 86400000)
      : null;

    return NextResponse.json({
      comparisons:    comparisons ?? [],
      latestComparison: (comparisons ?? [])[0] ?? null,
      daysSinceLast,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
