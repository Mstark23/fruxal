// =============================================================================
// GET /api/v2/stats/admin — Admin platform statistics (12-week trend)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// ── Helpers ─────────────────────────────────────────────────────────────────

function weekLabel(d: Date): string {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getLast12Weeks(): { start: string; end: string; label: string }[] {
  const weeks: { start: string; end: string; label: string }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 86400000);
    const day = d.getDay();
    const mon = new Date(d.getTime() - ((day + 6) % 7) * 86400000);
    const sun = new Date(mon.getTime() + 6 * 86400000);
    weeks.push({
      start: mon.toISOString(),
      end: sun.toISOString(),
      label: weekLabel(mon),
    });
  }
  return weeks;
}

function buildStatShape(points: { period: string; value: number }[]) {
  const current = points.length > 0 ? points[points.length - 1].value : 0;
  return { points, current };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const weeks = getLast12Weeks();
    const earliest = weeks[0].start;

    // ── 1. New signups by week ──────────────────────────────────────────────
    const { data: signupRows } = await supabaseAdmin
      .from("users")
      .select("created_at")
      .gte("created_at", earliest);

    const signupByWeek = new Map<string, number>();
    for (const w of weeks) signupByWeek.set(w.label, 0);
    for (const row of signupRows || []) {
      const d = new Date(row.created_at);
      const lbl = weekLabel(d);
      if (signupByWeek.has(lbl)) signupByWeek.set(lbl, (signupByWeek.get(lbl) || 0) + 1);
    }

    // ── 2. Diagnostic conversion (diagnostic_reports / prescan_runs) ────────
    const { data: prescanRows } = await supabaseAdmin
      .from("prescan_runs")
      .select("created_at")
      .gte("created_at", earliest);

    const { data: diagRows } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("created_at")
      .gte("created_at", earliest);

    const prescanByWeek = new Map<string, number>();
    const diagByWeek = new Map<string, number>();
    for (const w of weeks) { prescanByWeek.set(w.label, 0); diagByWeek.set(w.label, 0); }
    for (const row of prescanRows || []) {
      const lbl = weekLabel(new Date(row.created_at));
      if (prescanByWeek.has(lbl)) prescanByWeek.set(lbl, (prescanByWeek.get(lbl) || 0) + 1);
    }
    for (const row of diagRows || []) {
      const lbl = weekLabel(new Date(row.created_at));
      if (diagByWeek.has(lbl)) diagByWeek.set(lbl, (diagByWeek.get(lbl) || 0) + 1);
    }

    // ── 3. Total recovered (tier3_confirmed_findings.confirmed_amount) ──────
    const { data: confirmedRows } = await supabaseAdmin
      .from("tier3_confirmed_findings")
      .select("confirmed_amount, confirmed_at")
      .gte("confirmed_at", earliest);

    const recoveredByWeek = new Map<string, number>();
    for (const w of weeks) recoveredByWeek.set(w.label, 0);
    for (const row of confirmedRows || []) {
      const lbl = weekLabel(new Date(row.confirmed_at));
      if (recoveredByWeek.has(lbl)) recoveredByWeek.set(lbl, (recoveredByWeek.get(lbl) || 0) + (row.confirmed_amount || 0));
    }

    // ── 4. Active engagements snapshot by week ──────────────────────────────
    const { count: activeEngagements } = await supabaseAdmin
      .from("tier3_engagements")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    // For simplicity, use current count as this week; fill historical with same
    // (No historical engagement snapshots table exists — use current value)
    const engagementPoints = weeks.map((w, i) => ({
      period: w.label,
      value: i === weeks.length - 1 ? (activeEngagements || 0) : 0,
    }));
    // Backfill with a rough estimate: count engagements created before each week end
    const { data: engRows } = await supabaseAdmin
      .from("tier3_engagements")
      .select("created_at, status")
      .eq("status", "active");
    for (let wi = 0; wi < weeks.length; wi++) {
      const cutoff = new Date(weeks[wi].end).getTime();
      engagementPoints[wi].value = (engRows || []).filter(
        (e: any) => new Date(e.created_at).getTime() <= cutoff
      ).length;
    }

    // ── 5. Revenue (confirmed_amount * 0.12) ────────────────────────────────
    const revenueByWeek = new Map<string, number>();
    for (const w of weeks) revenueByWeek.set(w.label, 0);
    for (const row of confirmedRows || []) {
      const lbl = weekLabel(new Date(row.confirmed_at));
      if (revenueByWeek.has(lbl)) revenueByWeek.set(lbl, (revenueByWeek.get(lbl) || 0) + (row.confirmed_amount || 0) * 0.12);
    }

    // ── Build response ──────────────────────────────────────────────────────
    const stats = {
      new_signups: buildStatShape(
        weeks.map(w => ({ period: w.label, value: signupByWeek.get(w.label) || 0 }))
      ),
      diagnostic_conversion: buildStatShape(
        weeks.map(w => {
          const ps = prescanByWeek.get(w.label) || 0;
          const dg = diagByWeek.get(w.label) || 0;
          return { period: w.label, value: ps > 0 ? Math.round((dg / ps) * 100) : 0 };
        })
      ),
      total_recovered: buildStatShape(
        weeks.map(w => ({ period: w.label, value: Math.round(recoveredByWeek.get(w.label) || 0) }))
      ),
      active_engagements: buildStatShape(engagementPoints),
      revenue: buildStatShape(
        weeks.map(w => ({ period: w.label, value: Math.round(revenueByWeek.get(w.label) || 0) }))
      ),
    };

    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    console.error("[Stats/Admin]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
