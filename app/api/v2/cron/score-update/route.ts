// =============================================================================
// app/api/v2/cron/score-update/route.ts
// GET — daily cron at 8am UTC
// Finds businesses with NEWLY overdue obligations (last 24h) → recalculates scores
// Does NOT re-penalize obligations that were already overdue yesterday
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { computeLiveScore, persistScore } from "@/app/api/v2/score/route";
import { calculateLiveScore, type ScoreInputs } from "@/lib/ai/score-calculator";

export const maxDuration = 120;

function isAuthorized(req: NextRequest): boolean {
  return (
    req.headers.get("x-vercel-cron") === "1" ||
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}` ||
    process.env.NODE_ENV === "development"
  );
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const today     = new Date().toISOString();

    // Find obligations that became overdue in the last 24 hours
    const { data: newlyOverdue } = await supabaseAdmin
      .from("user_obligations")
      .select("id, user_id, obligation_rules(category, title)")
      .gte("next_deadline", yesterday.split("T")[0])
      .lte("next_deadline", today.split("T")[0])
      .neq("status", "completed")
      .limit(100);

    if (!newlyOverdue || newlyOverdue.length === 0) {
      return NextResponse.json({ processed: 0, score_decreases: 0, message: "No newly overdue obligations" });
    }

    // Get unique user_ids
    const userIds = [...new Set((newlyOverdue as any[]).map(o => o.user_id).filter(Boolean))];

    let processed = 0;
    let scoreDecreases = 0;

    for (const userId of userIds) {
      try {
        // Get business_id for this user
        const { data: bizRow } = await supabaseAdmin
          .from("businesses")
          .select("id")
          .eq("owner_user_id", userId)
          .maybeSingle();

        if (!bizRow) continue;

        const businessId = bizRow.id;

        // Get current stored score
        const { data: storedRow } = await supabaseAdmin
          .from("business_profiles")
          .select("current_score")
          .eq("business_id", businessId)
          .eq("user_id", userId)
          .maybeSingle();

        const result = await computeLiveScore(businessId, userId);
        if (result.currentScore === null) continue;

        const prevScore = storedRow?.current_score ?? result.lastDiagnosticScore ?? result.currentScore;
        const overdueTitles = (newlyOverdue as any[])
          .filter(o => o.user_id === userId)
          .map(o => (o.obligation_rules as any)?.title || "obligation")
          .join(", ");

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
          prevScore,
          "deadline_missed",
          `Newly overdue: ${overdueTitles}`,
        );

        processed++;
        if (result.currentScore < prevScore) scoreDecreases++;
      } catch (err: any) {
        console.error(`[ScoreCron] Error for user ${userId}:`, err.message);
      }
    }

    return NextResponse.json({ processed, score_decreases: scoreDecreases });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
