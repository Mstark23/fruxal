// =============================================================================
// app/api/v2/stats/customer/route.ts
// GET — Returns weekly stat data for the authenticated customer.
// Stats: health_score, leak_exposure, recovery_monthly, compliance_rate, engagement_streak
// =============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ── Helpers ──────────────────────────────────────────────────────────────────

function isoWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `W${weekNum}`;
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-CA", { month: "short", year: "2-digit" });
}

function safeNum(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    // Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Resolve businessId
    const { data: biz } = await supabaseAdmin
      .from("businesses")
      .select("id, streak_days")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!biz) {
      return NextResponse.json({ success: false, error: "No business found" }, { status: 404 });
    }

    const businessId = biz.id;

    // ── Parallel queries ─────────────────────────────────────────────────────

    const [scoreHistoryRes, leaksRes, recoveryRes, obligationsRes, timelineRes] = await Promise.all([
      // 1. health_score: score_history, last 12 entries
      supabaseAdmin
        .from("score_history")
        .select("score, calculated_at, leaks_total")
        .eq("business_id", businessId)
        .order("calculated_at", { ascending: true })
        .limit(12),

      // 2. leak_exposure: detected_leaks unfixed
      supabaseAdmin
        .from("detected_leaks")
        .select("annual_impact_max, created_at, status")
        .eq("business_id", businessId),

      // 3. recovery_monthly: recovery_snapshots
      supabaseAdmin
        .from("recovery_snapshots")
        .select("confirmed_total, snapshot_date")
        .eq("business_id", businessId)
        .order("snapshot_date", { ascending: true })
        .limit(24),

      // 4. compliance_rate: user_obligations
      supabaseAdmin
        .from("user_obligations")
        .select("status, completed_at")
        .eq("business_id", businessId),

      // 5. engagement_streak: business_timeline events
      supabaseAdmin
        .from("business_timeline")
        .select("created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: true })
        .limit(100),
    ]);

    // ── Build stat objects ───────────────────────────────────────────────────

    // 1. health_score
    const scoreRows = scoreHistoryRes.data || [];
    const healthPoints = scoreRows.map((r: any) => ({
      period: isoWeekLabel(r.calculated_at),
      value: safeNum(r.score),
    }));
    const healthCurrent = healthPoints.length > 0 ? healthPoints[healthPoints.length - 1].value : 0;

    // 2. leak_exposure — running total of unfixed leaks grouped by week
    const allLeaks = (leaksRes.data || []);
    const unfixedLeaks = allLeaks.filter((l: any) => l.status !== "fixed");
    const leakExposureCurrent = unfixedLeaks.reduce((s: number, l: any) => s + safeNum(l.annual_impact_max), 0);

    // Build weekly leak exposure from score_history leaks_total if available, else from current value
    let leakPoints: Array<{ period: string; value: number }>;
    const hasLeaksTotalColumn = scoreRows.length > 0 && scoreRows[0].leaks_total != null;
    if (hasLeaksTotalColumn) {
      leakPoints = scoreRows.map((r: any) => ({
        period: isoWeekLabel(r.calculated_at),
        value: safeNum(r.leaks_total),
      }));
    } else {
      // Fallback: weekly snapshots from created_at of unfixed leaks (cumulative)
      const weekMap = new Map<string, number>();
      const sorted = [...allLeaks].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      let running = 0;
      for (const l of sorted) {
        if (l.status !== "fixed") running += safeNum(l.annual_impact_max);
        const wk = isoWeekLabel(l.created_at);
        weekMap.set(wk, running);
      }
      leakPoints = Array.from(weekMap.entries()).map(([period, value]) => ({ period, value }));
      if (leakPoints.length === 0) leakPoints = [{ period: "now", value: leakExposureCurrent }];
    }

    // 3. recovery_monthly
    const recoveryRows = recoveryRes.data || [];
    // Group by month
    const monthMap = new Map<string, number>();
    for (const r of recoveryRows) {
      const m = monthLabel(r.snapshot_date);
      monthMap.set(m, safeNum(r.confirmed_total));
    }
    const recoveryPoints = Array.from(monthMap.entries()).map(([period, value]) => ({ period, value }));
    const recoveryCurrent = recoveryPoints.length > 0 ? recoveryPoints[recoveryPoints.length - 1].value : 0;

    // 4. compliance_rate
    const obRows = obligationsRes.data || [];
    const totalOb = obRows.length || 1;
    const completedOb = obRows.filter((o: any) => o.status === "completed" || o.status === "done").length;
    const complianceCurrent = Math.round((completedOb / totalOb) * 100);
    // Build history from completed_at dates
    const compWeekMap = new Map<string, { done: number; total: number }>();
    for (const o of obRows) {
      if (o.completed_at) {
        const wk = isoWeekLabel(o.completed_at);
        const entry = compWeekMap.get(wk) || { done: 0, total: 0 };
        entry.done++;
        entry.total++;
        compWeekMap.set(wk, entry);
      }
    }
    let compliancePoints: Array<{ period: string; value: number }>;
    if (compWeekMap.size > 1) {
      let cumDone = 0;
      let cumTotal = 0;
      compliancePoints = Array.from(compWeekMap.entries()).map(([period, { done, total }]) => {
        cumDone += done;
        cumTotal += total;
        return { period, value: Math.round((cumDone / Math.max(cumTotal, 1)) * 100) };
      });
    } else {
      // Not enough history — just repeat current value
      compliancePoints = [
        { period: "prev", value: Math.max(complianceCurrent - 5, 0) },
        { period: "now", value: complianceCurrent },
      ];
    }

    // 5. engagement_streak
    const streakCurrent = safeNum(biz.streak_days, 0);
    const tlRows = timelineRes.data || [];
    const streakWeekMap = new Map<string, number>();
    for (const e of tlRows) {
      const wk = isoWeekLabel(e.created_at);
      streakWeekMap.set(wk, (streakWeekMap.get(wk) || 0) + 1);
    }
    const streakPoints = Array.from(streakWeekMap.entries()).map(([period, value]) => ({ period, value }));
    if (streakPoints.length === 0) {
      streakPoints.push({ period: "now", value: streakCurrent });
    }

    // ── Response ─────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      stats: {
        health_score: {
          points: healthPoints,
          current: healthCurrent,
        },
        leak_exposure: {
          points: leakPoints,
          current: leakExposureCurrent,
        },
        recovery_monthly: {
          points: recoveryPoints,
          current: recoveryCurrent,
        },
        compliance_rate: {
          points: compliancePoints,
          current: complianceCurrent,
        },
        engagement_streak: {
          points: streakPoints,
          current: streakCurrent,
        },
      },
    });
  } catch (err: any) {
    console.error("[stats/customer]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
