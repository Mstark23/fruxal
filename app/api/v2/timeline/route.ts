// =============================================================================
// app/api/v2/timeline/route.ts
// GET /api/v2/timeline?businessId=XXX
// Assembles user journey: prescan → diagnostics → confirmed recoveries
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 15;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    // Verify ownership
    const { data: biz } = await supabaseAdmin
      .from("businesses").select("id").eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
    if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [prescanRow, diagnostics, taskGroups, prescanLinks] = await Promise.all([
      // Latest prescan for this user
      supabaseAdmin
        .from("prescan_results")
        .select("prescan_run_id, created_at, summary, teaser_leaks, province, industry")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(r => r.data),

      // All completed diagnostics for this business
      supabaseAdmin
        .from("diagnostic_reports")
        .select("id, overall_score, created_at, tier, prescan_context_used, prescan_run_id")
        .eq("business_id", businessId)
        .eq("status", "completed")
        .order("created_at", { ascending: true })
        .then(r => r.data ?? []),

      // Completed tasks grouped by month
      supabaseAdmin
        .from("diagnostic_tasks")
        .select("title, savings_monthly, completed_at, category")
        .eq("business_id", businessId)
        .eq("status", "done")
        .order("completed_at", { ascending: true })
        .then(r => r.data ?? []),

      // Prescan-diagnostic links for enriching diagnostic entries
      supabaseAdmin
        .from("prescan_diagnostic_links")
        .select("diagnostic_report_id, leaks_confirmed, leaks_new, continuity_narrative")
        .eq("business_id", businessId)
        .then(r => r.data ?? []),
    ]);

    const linkMap = new Map((prescanLinks as any[]).map((l: any) => [l.diagnostic_report_id, l]));

    // Build timeline entries
    const entries: any[] = [];

    // Prescan entry
    if (prescanRow) {
      const totalLeaks = prescanRow.summary?.total_leaks ?? (prescanRow.teaser_leaks as any[])?.length ?? 0;
      const lossMin = prescanRow.summary?.leak_range_min ?? 0;
      entries.push({
        type: "prescan",
        date: prescanRow.created_at,
        title: `Initial scan — ${totalLeaks} issue${totalLeaks !== 1 ? "s" : ""} identified`,
        subtitle: lossMin > 0 ? `~$${Math.round(lossMin / 12).toLocaleString()}/month in potential losses flagged` : null,
        meta: { prescanRunId: prescanRow.prescan_run_id, totalLeaks, lossMin },
      });
    }

    // Diagnostic entries
    for (const diag of diagnostics as any[]) {
      const link = linkMap.get(diag.id);
      entries.push({
        type:  "diagnostic",
        date:  diag.created_at,
        reportId: diag.id,
        title: `Full diagnostic — Score: ${diag.overall_score}/100`,
        subtitle: link
          ? `${link.leaks_confirmed} prescan finding${link.leaks_confirmed !== 1 ? "s" : ""} confirmed + ${link.leaks_new} new`
          : null,
        narrative: link?.continuity_narrative ?? null,
        meta: {
          score: diag.overall_score,
          tier: diag.tier,
          prescanContextUsed: diag.prescan_context_used,
        },
      });
    }

    // Group tasks by month
    const tasksByMonth: Record<string, { month: string; tasks: any[]; totalSavings: number }> = {};
    for (const task of taskGroups as any[]) {
      if (!task.completed_at) continue;
      const d = new Date(task.completed_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
      if (!tasksByMonth[key]) tasksByMonth[key] = { month: label, tasks: [], totalSavings: 0 };
      tasksByMonth[key].tasks.push(task);
      tasksByMonth[key].totalSavings += task.savings_monthly ?? 0;
    }

    for (const [key, group] of Object.entries(tasksByMonth)) {
      const firstTask = group.tasks[0];
      entries.push({
        type: "tasks",
        date: firstTask?.completed_at,
        title: `${group.month}: ${group.tasks.length} recovery${group.tasks.length !== 1 ? " confirmations" : " confirmed"}`,
        subtitle: group.totalSavings > 0
          ? `$${Math.round(group.totalSavings).toLocaleString()}/month recovered`
          : null,
        meta: { month: group.month, count: group.tasks.length, totalSavings: Math.round(group.totalSavings) },
      });
    }

    // Sort all entries by date ascending
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ entries, hasPrescan: !!prescanRow });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
