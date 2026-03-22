// =============================================================================
// app/api/v2/score/route.ts
// GET  /api/v2/score?businessId=XXX — live calculated score + history
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  calculateLiveScore,
  scoreDeltaLabel,
  scoreNeedsRescan,
  type ScoreInputs,
} from "@/lib/ai/score-calculator";

export const maxDuration = 15;

async function verifyOwnership(userId: string, businessId: string): Promise<boolean> {
  const { data: biz } = await supabaseAdmin.from("businesses").select("id")
    .eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
  if (biz) return true;
  const { data: prof } = await supabaseAdmin.from("business_profiles").select("business_id")
    .eq("business_id", businessId).eq("user_id", userId).maybeSingle();
  return !!prof;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
    if (!await verifyOwnership(userId, businessId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await computeLiveScore(businessId, userId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Shared computation used by both GET and recalculate POST ─────────────────
export async function computeLiveScore(businessId: string, userId: string) {
  const [diagRow, tasksRows, obligRows, storedScoreRow, historyRows] = await Promise.all([
    // Latest completed diagnostic
    supabaseAdmin
      .from("diagnostic_reports")
      .select("overall_score, created_at, completed_at")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(r => r.data),

    // All completed tasks
    supabaseAdmin
      .from("diagnostic_tasks")
      .select("id, savings_monthly, effort, completed_at")
      .eq("business_id", businessId)
      .eq("status", "done")
      .then(r => r.data ?? []),

    // Overdue obligations
    supabaseAdmin
      .from("user_obligations")
      .select("id, obligation_slug, next_deadline, status, obligation_rules(category)")
      .eq("user_id", userId)
      .in("status", ["overdue"])
      .then(r => r.data ?? []),

    // Currently stored score
    supabaseAdmin
      .from("business_profiles")
      .select("current_score, last_diagnostic_score")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .maybeSingle()
      .then(r => r.data),

    // Last 6 score_history records
    supabaseAdmin
      .from("score_history")
      .select("score, score_delta, trigger_type, trigger_detail, calculated_at")
      .eq("business_id", businessId)
      .order("calculated_at", { ascending: false })
      .limit(6)
      .then(r => r.data ?? []),
  ]);

  if (!diagRow) {
    return {
      currentScore: null, lastDiagnosticScore: null, delta: null,
      deltaLabel: "", breakdown: [], history: [],
      daysSinceDiagnostic: null, needsRescan: false,
      lastCalculatedAt: null,
    };
  }

  const baseDiagnosticScore = diagRow.overall_score ?? 0;
  const diagnosticDate = new Date(diagRow.completed_at ?? diagRow.created_at);

  const inputs: ScoreInputs = {
    baseDiagnosticScore,
    diagnosticDate,
    completedTasks: (tasksRows as any[]).map(t => ({
      id:              t.id,
      savings_monthly: t.savings_monthly ?? 0,
      effort:          t.effort ?? "easy",
      completed_at:    new Date(t.completed_at ?? new Date()),
    })),
    missedDeadlines: (obligRows as any[]).map(o => ({
      id:       o.id,
      category: (o.obligation_rules as any)?.category ?? "general",
      due_date: new Date(o.next_deadline),
    })),
  };

  const result = calculateLiveScore(inputs);
  const daysSinceDiagnostic = Math.floor((Date.now() - diagnosticDate.getTime()) / 86400000);
  const needsRescan = scoreNeedsRescan(diagnosticDate);

  // Persist only if score changed by >= 1 point vs stored value
  const storedScore = storedScoreRow?.current_score ?? null;
  if (storedScore === null || Math.abs(result.finalScore - storedScore) >= 1) {
    // Non-blocking — don't await
    persistScore(businessId, userId, result, storedScore, "task_completed").catch(() => {});
  }

  return {
    currentScore:        result.finalScore,
    lastDiagnosticScore: baseDiagnosticScore,
    delta:               result.delta,
    deltaLabel:          scoreDeltaLabel(result.delta),
    breakdown:           result.breakdown,
    history:             (historyRows as any[]).reverse(), // oldest first for sparkline
    daysSinceDiagnostic,
    needsRescan,
    lastCalculatedAt:    new Date().toISOString(),
    taskBonus:           result.taskBonus,
    deadlinePenalty:     result.deadlinePenalty,
    decayPenalty:        result.decayPenalty,
  };
}

// ── Persist score to DB ───────────────────────────────────────────────────────
export async function persistScore(
  businessId: string,
  userId:     string,
  result:     ReturnType<typeof calculateLiveScore>,
  previousScore: number | null,
  triggerType: string,
  triggerDetail?: string,
  taskId?: string,
) {
  const delta = previousScore !== null ? result.finalScore - previousScore : result.delta;

  await Promise.all([
    // Insert score_history record
    supabaseAdmin.from("score_history").insert({
      business_id:       businessId,
      score:             result.finalScore,
      score_delta:       delta,
      trigger_type:      triggerType,
      trigger_detail:    triggerDetail ?? null,
      task_id:           taskId ?? null,
      base_score:        result.baseDiagnosticScore,
      task_bonus:        result.taskBonus,
      deadline_penalty:  result.deadlinePenalty,
      decay_penalty:     result.decayPenalty,
      final_score:       result.finalScore,
      calculated_at:     new Date().toISOString(),
    }),
    // Update business_profiles
    supabaseAdmin.from("business_profiles").update({
      current_score:          result.finalScore,
      last_diagnostic_score:  result.baseDiagnosticScore,
      score_updated_at:       new Date().toISOString(),
    } as any).eq("business_id", businessId).eq("user_id", userId),
  ]);
}
