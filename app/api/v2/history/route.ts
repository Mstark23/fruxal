// =============================================================================
// app/api/v2/history/route.ts
// GET /api/v2/history?businessId=XXX
// Returns: timeline events, score progression, journey stats
// Triggers buildTimeline() if stale (>24h since last event)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildTimeline } from "@/lib/ai/timeline-builder";

export const maxDuration = 30;

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

    // Check if rebuild needed (last timeline event >24h old OR no events at all)
    const { data: lastEvent } = await supabaseAdmin
      .from("business_timeline")
      .select("created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isStale = !lastEvent || (Date.now() - new Date(lastEvent.created_at).getTime()) > 24 * 3600000;
    if (isStale) {
      // Rebuild synchronously (first load) — acceptable latency for fresh data
      await buildTimeline(businessId, userId);
    }

    // Fetch all data in parallel
    const [timelineRows, scoreRows] = await Promise.all([
      supabaseAdmin
        .from("business_timeline")
        .select("id, event_type, event_date, title, description, score_at_event, score_delta, savings_monthly_at_event, savings_monthly_delta, source_id, source_type, icon, color, is_milestone")
        .eq("business_id", businessId)
        .order("event_date", { ascending: true }),

      supabaseAdmin
        .from("score_history")
        .select("score, trigger_type, calculated_at")
        .eq("business_id", businessId)
        .order("calculated_at", { ascending: true }),
    ]);

    const events    = timelineRows.data ?? [];
    const scoreHist = scoreRows.data ?? [];

    // ── Journey stats ─────────────────────────────────────────────────────
    const diagnosticEvents = events.filter(e => ["diagnostic","rescan"].includes(e.event_type));
    const taskEvents = events.filter(e => e.event_type === "task_completed");
    const goalsDone  = events.filter(e => e.event_type === "goal_completed");
    const firstEvent = events[0] ? new Date(events[0].event_date) : null;
    const totalDaysOnPlatform = firstEvent
      ? Math.floor((Date.now() - firstEvent.getTime()) / 86400000)
      : 0;
    const totalSavingsRecovered = taskEvents.reduce(
      (s, e) => s + (e.savings_monthly_delta ?? 0), 0
    );
    const firstScore = scoreHist[0]?.score ?? 0;
    const latestScore = scoreHist[scoreHist.length - 1]?.score ?? 0;
    const scoreImprovement = latestScore - firstScore;

    // Score projection (last 60 days rate)
    const now = Date.now();
    const sixtyDaysAgo = now - 60 * 86400000;
    const recent = scoreHist.filter(s => new Date(s.calculated_at).getTime() >= sixtyDaysAgo);
    let projectedDate: string | null = null;
    if (recent.length >= 2) {
      const oldScore = recent[0].score;
      const newScore = recent[recent.length - 1].score;
      const daySpan  = Math.max(1, (new Date(recent[recent.length - 1].calculated_at).getTime() - new Date(recent[0].calculated_at).getTime()) / 86400000);
      const rate = (newScore - oldScore) / daySpan; // points per day
      if (rate > 0 && latestScore < 80) {
        const daysTo80 = Math.ceil((80 - latestScore) / rate);
        if (daysTo80 > 0 && daysTo80 <= 365) {
          const d = new Date(now + daysTo80 * 86400000);
          projectedDate = d.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
        }
      }
    }

    const stats = {
      totalDaysOnPlatform,
      totalSavingsRecovered:      Math.round(totalSavingsRecovered),
      totalSavingsAnnualized:     Math.round(totalSavingsRecovered * 12),
      scoreImprovement,
      firstScore,
      latestScore,
      tasksCompleted:             taskEvents.length,
      goalsCompleted:             goalsDone.length,
      rescansCompleted:           diagnosticEvents.filter(e => e.event_type === "rescan").length,
      estimatedBusinessValueAdded: Math.round(totalSavingsRecovered * 24),
      projectedDate,
    };

    return NextResponse.json({ events, scoreHistory: scoreHist, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
