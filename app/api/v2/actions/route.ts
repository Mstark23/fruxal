// =============================================================================
// V2 POST/GET/PATCH /api/v2/actions — Dashboard Action Items
// =============================================================================
// GET: Fetch all action items for a user (grouped by priority)
// POST: Generate actions from prescan results
// PATCH: Update action status (mark complete, skip, etc.)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30; // Vercel function timeout (seconds)
// generateActionsFromPrescan migrated — stub until lib/ai action-plan is wired
async function generateActionsFromPrescan(userId: string, scanId: string, data: any): Promise<any[]> { return []; }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── GET: Fetch all actions + progress ───────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = ((token as any)?.id || token?.sub) as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    { data: actions },
    { data: progress },
  ] = await Promise.all([
    supabase
      .from("user_actions")
      .select("*")
      .eq("userId", userId)
      .order("display_order", { ascending: true }),
    supabase
      .from("user_progress")
      .select("*")
      .eq("userId", userId)
      .single(),
  ]);

  // Group by status and priority
  const allActions = actions || [];
  const grouped = {
    this_week: allActions.filter(a => a.status === "pending" && a.priority === "this_week"),
    this_month: allActions.filter(a => a.status === "pending" && a.priority === "this_month"),
    this_quarter: allActions.filter(a => a.status === "pending" && a.priority === "this_quarter"),
    in_progress: allActions.filter(a => a.status === "in_progress"),
    completed: allActions.filter(a => a.status === "completed").sort(
      (a, b) => new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime()
    ),
    skipped: allActions.filter(a => a.status === "skipped" || a.status === "dismissed"),
  };

  // Calculate stats
  const stats = {
    total_leak: progress?.total_leak_found ?? 0,
    total_recovered: progress?.total_recovered ?? 0,
    total_verified: progress?.total_verified_leak ?? 0,
    actions_total: allActions.filter(a => a.status !== "dismissed").length,
    actions_completed: grouped.completed.length,
    actions_in_progress: grouped.in_progress.length,
    actions_remaining: grouped.this_week.length + grouped.this_month.length + grouped.this_quarter.length,
    quickbooks_connected: progress?.quickbooks_connected || false,
    bank_connected: progress?.bank_connected || false,
    contracts_uploaded: progress?.contracts_uploaded ?? 0,
    last_scan: progress?.last_prescan_date || null,
    scan_count: progress?.scan_count ?? 0,
  };

  return NextResponse.json({ actions: grouped, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: Generate actions from prescan ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const tokenP = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const serverUserId = ((tokenP as any)?.id || tokenP?.sub) as string | undefined;

    const { scanId, prescanData } = await req.json();
    const userId = serverUserId; // always server-resolved

    if (!userId || !prescanData) {
      return NextResponse.json({ error: "userId and prescanData required" }, { status: 400 });
    }

    // Save prescan results to prescan_results table
    const { data: saved } = await supabase
      .from("prescan_results")
      .insert({
        userId: userId,
        sessionId: scanId,
        industry: prescanData.industry,
        industry_display: prescanData.industryDisplay,
        tier: prescanData.tier,
        revenue_estimate: prescanData.revenue,
        total_leak_amount: prescanData.totalLeak,
        leak_count: prescanData.leakCount,
        question_count: prescanData.questionCount,
        confirmed_leaks: prescanData.confirmedLeaks,
        passed_checks: prescanData.passedChecks,
        category_breakdown: prescanData.categoryBreakdown,
      })
      .select("id")
      .single();

    // Generate action items
    await generateActionsFromPrescan(
      userId,
      saved?.id || scanId || "unknown",
      prescanData
    );

    return NextResponse.json({
      success: true,
      scanId: saved?.id,
      actionsGenerated: prescanData.confirmedLeaks?.length ?? 0,
    });

  } catch (error: any) {
    console.error("Generate actions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── PATCH: Update action status ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const tokenPA = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const serverPatchUserId = ((tokenPA as any)?.id || tokenPA?.sub) as string | undefined;
    if (!serverPatchUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { actionId, status, actualSavings, notes } = await req.json();
    const userId = serverPatchUserId;
    if (!actionId) {
      return NextResponse.json({ error: "actionId and userId required" }, { status: 400 });
    }

    const updates: any = { status };
    
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
      if (actualSavings) updates.actual_savings = actualSavings;
      if (notes) updates.completion_notes = notes;
    }

    // Update the action
    const { error } = await supabase
      .from("user_actions")
      .update(updates)
      .eq("id", actionId)
      .eq("userId", userId);

    if (error) throw error;

    // Recalculate progress
    const { data: allActions } = await supabase
      .from("user_actions")
      .select("status, estimated_value, actual_savings")
      .eq("userId", userId);

    const completed = (allActions || []).filter(a => a.status === "completed");
    const totalRecovered = completed.reduce(
      (s, a) => s + ((a.actual_savings || a.estimated_value) ?? 0), 0
    );

    await supabase.from("user_progress").upsert({
      userId: userId,
      total_recovered: totalRecovered,
      actions_completed: completed.length,
      actions_in_progress: (allActions || []).filter(a => a.status === "in_progress").length,
    }, { onConflict: "userId" });

    return NextResponse.json({ success: true, totalRecovered });

  } catch (error: any) {
    console.error("Update action error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
