// =============================================================================
// app/api/v2/score/recalculate/route.ts
// POST /api/v2/score/recalculate — force recalculation and persist
// Called after: task completion, deadline missed check
// Returns same shape as GET /api/v2/score
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { computeLiveScore, persistScore } from "../route";
import { calculateLiveScore, scoreDeltaLabel, scoreNeedsRescan, type ScoreInputs } from "@/lib/ai/score-calculator";

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const { businessId, triggerType, triggerDetail, taskId } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    // Verify ownership
    const { data: biz } = await supabaseAdmin.from("businesses").select("id")
      .eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
    const { data: prof } = biz ? { data: null } :
      await supabaseAdmin.from("business_profiles").select("business_id")
        .eq("business_id", businessId).eq("user_id", userId).maybeSingle();
    if (!biz && !prof) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Get current stored score for delta
    const { data: current } = await supabaseAdmin
      .from("business_profiles")
      .select("current_score")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .maybeSingle();

    const result = await computeLiveScore(businessId, userId);

    // Always persist on explicit recalculate
    if (result.currentScore !== null) {
      const fakeResult = {
        finalScore:          result.currentScore,
        baseDiagnosticScore: result.lastDiagnosticScore ?? result.currentScore,
        taskBonus:           result.taskBonus ?? 0,
        deadlinePenalty:     result.deadlinePenalty ?? 0,
        decayPenalty:        result.decayPenalty ?? 0,
        delta:               result.delta ?? 0,
        breakdown:           result.breakdown ?? [],
      };
      await persistScore(
        businessId, userId, fakeResult,
        current?.current_score ?? null,
        triggerType ?? "task_completed",
        triggerDetail,
        taskId,
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
