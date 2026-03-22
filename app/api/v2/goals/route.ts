// =============================================================================
// app/api/v2/goals/route.ts
// GET  /api/v2/goals?businessId=XXX  — active goal + progress
// POST /api/v2/goals                 — create a new goal
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 15;

async function verifyOwnership(userId: string, businessId: string): Promise<boolean> {
  const { data: biz } = await supabaseAdmin.from("businesses").select("id")
    .eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
  if (biz) return true;
  const { data: prof } = await supabaseAdmin.from("business_profiles").select("business_id")
    .eq("business_id", businessId).eq("user_id", userId).maybeSingle();
  return !!prof;
}

// ── Calculate progress for an active goal ────────────────────────────────────
async function calcProgress(goal: any, businessId: string, userId: string) {
  let current = 0;

  if (goal.goal_type === "recovery_amount") {
    const { data: done } = await supabaseAdmin
      .from("diagnostic_tasks")
      .select("savings_monthly")
      .eq("business_id", businessId)
      .eq("status", "done")
      .gte("completed_at", goal.created_at);
    current = (done ?? []).reduce((s: number, t: any) => s + (t.savings_monthly ?? 0), 0);

  } else if (goal.goal_type === "score_improvement") {
    const { data: scoreRow } = await supabaseAdmin
      .from("score_history")
      .select("score")
      .eq("business_id", businessId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const baseScore = goal.current_score ?? 0;
    const latestScore = scoreRow?.score ?? baseScore;
    current = Math.max(0, latestScore - baseScore);

  } else if (goal.goal_type === "tasks_completed") {
    const { data: done } = await supabaseAdmin
      .from("diagnostic_tasks")
      .select("id")
      .eq("business_id", businessId)
      .eq("status", "done")
      .gte("completed_at", goal.created_at);
    current = (done ?? []).length;
  }

  const target = goal.target_amount ?? goal.target_score ?? goal.target_count ?? 1;
  const pct = Math.min(100, Math.round((current / target) * 100 * 10) / 10);

  // Pace check
  const createdAt = new Date(goal.created_at);
  const targetDate = new Date(goal.target_date);
  const totalDays = Math.max(1, Math.ceil((targetDate.getTime() - createdAt.getTime()) / 86400000));
  const daysElapsed = Math.ceil((Date.now() - createdAt.getTime()) / 86400000);
  const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / 86400000));
  const pacePct = Math.min(100, (daysElapsed / totalDays) * 100);
  const onPace = pct >= pacePct;

  const weeklyPaceNeeded = daysRemaining > 0
    ? Math.round(((target - current) / (daysRemaining / 7)) * 10) / 10
    : 0;

  // Projected completion
  const ratePerDay = daysElapsed > 0 ? current / daysElapsed : 0;
  const projectedDays = ratePerDay > 0 ? Math.ceil((target - current) / ratePerDay) : null;
  const projectedCompletion = projectedDays !== null
    ? new Date(Date.now() + projectedDays * 86400000).toISOString().split("T")[0]
    : null;

  return { current, target, pct, onPace, daysRemaining, projectedCompletion, weeklyPaceNeeded };
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
    if (!await verifyOwnership(userId, businessId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [activeGoals, completedGoals] = await Promise.all([
      supabaseAdmin
        .from("business_goals")
        .select("id,goal_type,goal_title,goal_description,target_amount,target_score,target_count,target_date,current_amount,current_score,current_count,progress_pct,status,completed_at,was_suggested_by_claude,suggestion_rationale,source_report_id,created_at,updated_at")
        .eq("business_id", businessId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3),
      supabaseAdmin
        .from("business_goals")
        .select("id, goal_title, goal_type, completed_at, progress_pct, target_amount")
        .eq("business_id", businessId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(5),
    ]);

    const active = activeGoals.data ?? [];
    const primaryGoal = active[0] ?? null;

    if (!primaryGoal) {
      return NextResponse.json({
        activeGoal:     null,
        progress:       null,
        completedGoals: completedGoals.data ?? [],
      });
    }

    const progress = await calcProgress(primaryGoal, businessId, userId);

    // Update stored progress if it changed meaningfully
    if (Math.abs(progress.pct - (primaryGoal.progress_pct ?? 0)) >= 1) {
      const updates: any = {
        progress_pct:   progress.pct,
        current_amount: primaryGoal.goal_type === "recovery_amount" ? progress.current : primaryGoal.current_amount,
        current_score:  primaryGoal.goal_type === "score_improvement" ? progress.current : primaryGoal.current_score,
        current_count:  primaryGoal.goal_type === "tasks_completed" ? progress.current : primaryGoal.current_count,
        updated_at:     new Date().toISOString(),
      };
      // Mark completed if 100%
      if (progress.pct >= 100 && primaryGoal.status === "active") {
        updates.status = "completed";
        updates.completed_at = new Date().toISOString();
      }
      await supabaseAdmin.from("business_goals").update(updates).eq("id", primaryGoal.id);
    }

    // Find easiest open task for behind-pace CTA
    let easiestTask = null;
    if (!progress.onPace) {
      const { data: easyTask } = await supabaseAdmin
        .from("diagnostic_tasks")
        .select("id, title, savings_monthly")
        .eq("business_id", businessId)
        .eq("status", "open")
        .eq("effort", "easy")
        .order("savings_monthly", { ascending: false })
        .limit(1)
        .maybeSingle();
      easiestTask = easyTask;
    }

    return NextResponse.json({
      activeGoal:     primaryGoal,
      progress,
      easiestTask,
      completedGoals: completedGoals.data ?? [],
      goalCompleted:  progress.pct >= 100,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST — create goal ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const body = await req.json();
    const { businessId, goal, tier } = body;
    if (!businessId || !goal) return NextResponse.json({ error: "businessId and goal required" }, { status: 400 });
    if (!await verifyOwnership(userId, businessId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Tier limit: Solo/Business max 1 active goal
    const maxActive = ["enterprise"].includes((tier || "solo").toLowerCase()) ? 3 : 1;
    const { count } = await supabaseAdmin
      .from("business_goals")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "active");

    if ((count ?? 0) >= maxActive) {
      return NextResponse.json({
        error: maxActive === 1
          ? "Complete or abandon your current goal before setting a new one."
          : "Maximum 3 active goals reached.",
      }, { status: 409 });
    }

    // Get current score for baseline (score_improvement goals)
    const { data: scoreRow } = await supabaseAdmin
      .from("score_history")
      .select("score")
      .eq("business_id", businessId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: created, error } = await supabaseAdmin
      .from("business_goals")
      .insert({
        business_id:          businessId,
        goal_type:            goal.goal_type,
        goal_title:           goal.goal_title,
        goal_description:     goal.goal_description ?? null,
        target_amount:        goal.target_amount ?? null,
        target_score:         goal.target_score ?? null,
        target_count:         goal.target_count ?? null,
        target_date:          goal.target_date,
        current_score:        scoreRow?.score ?? 0,
        was_suggested_by_claude: goal.was_suggested_by_claude ?? false,
        suggestion_rationale: goal.suggestion_rationale ?? null,
        source_report_id:     goal.source_report_id ?? null,
        status:               "active",
        progress_pct:         0,
        created_at:           new Date().toISOString(),
        updated_at:           new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ goal: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
