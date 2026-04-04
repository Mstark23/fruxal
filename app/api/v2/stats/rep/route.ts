// =============================================================================
// app/api/v2/stats/rep/route.ts
// GET — Returns weekly stat data for the authenticated rep.
// Stats: calls_made, close_rate, pipeline_value, recovery_confirmed, avg_days_to_close
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ── Helpers ──────────────────────────────────────────────────────────────────

function isoWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `W${weekNum}`;
}

function safeNum(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000;
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const repId = auth.repId!;

    // ── Parallel queries ─────────────────────────────────────────────────────

    const [debriefRes, pipelineRes, findingsRes] = await Promise.all([
      // 1. calls_made: call_debriefs
      supabaseAdmin
        .from("call_debriefs")
        .select("id, created_at")
        .eq("rep_id", repId)
        .order("created_at", { ascending: true })
        .limit(200),

      // 2 + 3 + 5. tier3_pipeline — close_rate, pipeline_value, avg_days_to_close
      supabaseAdmin
        .from("tier3_pipeline")
        .select("id, stage, annual_leak, assigned_at, signed_at, created_at")
        .eq("rep_id", repId)
        .order("created_at", { ascending: true })
        .limit(200),

      // 4. recovery_confirmed: tier3_confirmed_findings
      supabaseAdmin
        .from("tier3_confirmed_findings")
        .select("confirmed_amount, created_at")
        .eq("rep_id", repId)
        .order("created_at", { ascending: true })
        .limit(200),
    ]);

    // ── 1. calls_made ────────────────────────────────────────────────────────

    const debriefs = debriefRes.data || [];
    const callWeekMap = new Map<string, number>();
    for (const d of debriefs) {
      const wk = isoWeekLabel(d.created_at);
      callWeekMap.set(wk, (callWeekMap.get(wk) || 0) + 1);
    }
    const callsPoints = Array.from(callWeekMap.entries()).map(([period, value]) => ({ period, value }));
    const callsCurrent = debriefs.length;

    // ── 2. close_rate ────────────────────────────────────────────────────────

    const pipeline = pipelineRes.data || [];
    const SIGNED_STAGES = ["signed", "closed", "won", "completed"];
    const totalAssigned = pipeline.length || 1;
    const totalSigned = pipeline.filter((p: any) => SIGNED_STAGES.includes(p.stage)).length;
    const closeRateCurrent = Math.round((totalSigned / totalAssigned) * 100);

    // Weekly close rate is tricky — approximate by tracking cumulative signed/total by week
    const crWeekMap = new Map<string, { signed: number; total: number }>();
    for (const p of pipeline) {
      const wk = isoWeekLabel(p.created_at || p.assigned_at);
      const entry = crWeekMap.get(wk) || { signed: 0, total: 0 };
      entry.total++;
      if (SIGNED_STAGES.includes(p.stage)) entry.signed++;
      crWeekMap.set(wk, entry);
    }
    let cumSigned = 0;
    let cumTotal = 0;
    const closeRatePoints = Array.from(crWeekMap.entries()).map(([period, { signed, total }]) => {
      cumSigned += signed;
      cumTotal += total;
      return { period, value: Math.round((cumSigned / Math.max(cumTotal, 1)) * 100) };
    });
    if (closeRatePoints.length === 0) {
      closeRatePoints.push({ period: "now", value: closeRateCurrent });
    }

    // ── 3. pipeline_value ────────────────────────────────────────────────────

    const ACTIVE_STAGES = ["new", "contacted", "meeting", "proposal", "negotiation", "assigned", "active", "in_progress"];
    const activePipeline = pipeline.filter((p: any) => ACTIVE_STAGES.includes(p.stage));
    const pipelineCurrent = activePipeline.reduce((s: number, p: any) => s + safeNum(p.annual_leak), 0);

    // Weekly pipeline snapshots — running total of active deals by week of creation
    const pvWeekMap = new Map<string, number>();
    let pvRunning = 0;
    for (const p of pipeline) {
      if (ACTIVE_STAGES.includes(p.stage)) {
        pvRunning += safeNum(p.annual_leak);
      }
      const wk = isoWeekLabel(p.created_at || p.assigned_at);
      pvWeekMap.set(wk, pvRunning);
    }
    const pipelinePoints = Array.from(pvWeekMap.entries()).map(([period, value]) => ({ period, value }));
    if (pipelinePoints.length === 0) {
      pipelinePoints.push({ period: "now", value: pipelineCurrent });
    }

    // ── 4. recovery_confirmed ────────────────────────────────────────────────

    const findings = findingsRes.data || [];
    const recWeekMap = new Map<string, number>();
    for (const f of findings) {
      const wk = isoWeekLabel(f.created_at);
      recWeekMap.set(wk, (recWeekMap.get(wk) || 0) + safeNum(f.confirmed_amount));
    }
    const recoveryPoints = Array.from(recWeekMap.entries()).map(([period, value]) => ({ period, value }));
    const recoveryCurrent = findings.reduce((s: number, f: any) => s + safeNum(f.confirmed_amount), 0);
    if (recoveryPoints.length === 0) {
      recoveryPoints.push({ period: "now", value: recoveryCurrent });
    }

    // ── 5. avg_days_to_close ─────────────────────────────────────────────────

    const closedDeals = pipeline.filter((p: any) => SIGNED_STAGES.includes(p.stage) && p.signed_at && p.assigned_at);
    const avgDaysCurrent = closedDeals.length > 0
      ? Math.round(closedDeals.reduce((s: number, p: any) => s + daysBetween(p.assigned_at, p.signed_at), 0) / closedDeals.length)
      : 0;

    // Weekly avg — approximate by tracking closed deals per week they were signed
    const adWeekMap = new Map<string, { totalDays: number; count: number }>();
    for (const p of closedDeals) {
      const wk = isoWeekLabel(p.signed_at);
      const entry = adWeekMap.get(wk) || { totalDays: 0, count: 0 };
      entry.totalDays += daysBetween(p.assigned_at, p.signed_at);
      entry.count++;
      adWeekMap.set(wk, entry);
    }
    const avgDaysPoints = Array.from(adWeekMap.entries()).map(([period, { totalDays, count }]) => ({
      period,
      value: Math.round(totalDays / count),
    }));
    if (avgDaysPoints.length === 0) {
      avgDaysPoints.push({ period: "now", value: avgDaysCurrent });
    }

    // ── Response ─────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      stats: {
        calls_made: {
          points: callsPoints,
          current: callsCurrent,
        },
        close_rate: {
          points: closeRatePoints,
          current: closeRateCurrent,
        },
        pipeline_value: {
          points: pipelinePoints,
          current: pipelineCurrent,
        },
        recovery_confirmed: {
          points: recoveryPoints,
          current: recoveryCurrent,
        },
        avg_days_to_close: {
          points: avgDaysPoints,
          current: avgDaysCurrent,
        },
      },
    });
  } catch (err: any) {
    console.error("[stats/rep]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
