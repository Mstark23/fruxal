// =============================================================================
// GET /api/v2/stats/accountant — Accountant performance statistics (12-week)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAccountant } from "@/lib/accountant-auth";
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
    const auth = await requireAccountant(req);
    if (!auth.authorized) return auth.error!;
    const accountant = auth.accountant!;

    const weeks = getLast12Weeks();
    const earliest = weeks[0].start;

    // Fetch all playbooks for this accountant in the last 12 weeks
    const { data: allPlaybooks } = await supabaseAdmin
      .from("execution_playbooks")
      .select("id, status, queued_at, confirmed_at, confirmed_amount, updated_at, assigned_to")
      .eq("assigned_to", accountant.id);

    const playbooks = allPlaybooks || [];

    // ── 1. Findings processed (status changed to submitted or confirmed) ────
    const processedByWeek = new Map<string, number>();
    for (const w of weeks) processedByWeek.set(w.label, 0);
    for (const pb of playbooks) {
      if (pb.status === "submitted" || pb.status === "confirmed") {
        const d = pb.confirmed_at || pb.updated_at;
        if (d && d >= earliest) {
          const lbl = weekLabel(new Date(d));
          if (processedByWeek.has(lbl)) processedByWeek.set(lbl, (processedByWeek.get(lbl) || 0) + 1);
        }
      }
    }

    // ── 2. Avg confirm time (days between queued_at and confirmed_at) ───────
    const confirmTimes: number[] = [];
    const confirmTimeByWeek = new Map<string, { sum: number; count: number }>();
    for (const w of weeks) confirmTimeByWeek.set(w.label, { sum: 0, count: 0 });
    for (const pb of playbooks) {
      if (pb.status === "confirmed" && pb.queued_at && pb.confirmed_at) {
        const days = (new Date(pb.confirmed_at).getTime() - new Date(pb.queued_at).getTime()) / 86400000;
        confirmTimes.push(days);
        if (pb.confirmed_at >= earliest) {
          const lbl = weekLabel(new Date(pb.confirmed_at));
          const entry = confirmTimeByWeek.get(lbl);
          if (entry) { entry.sum += days; entry.count++; }
        }
      }
    }

    // ── 3. Confirmed value by week ──────────────────────────────────────────
    const confirmedByWeek = new Map<string, number>();
    for (const w of weeks) confirmedByWeek.set(w.label, 0);
    for (const pb of playbooks) {
      if (pb.status === "confirmed" && pb.confirmed_at && pb.confirmed_at >= earliest) {
        const lbl = weekLabel(new Date(pb.confirmed_at));
        if (confirmedByWeek.has(lbl)) confirmedByWeek.set(lbl, (confirmedByWeek.get(lbl) || 0) + (pb.confirmed_amount || 0));
      }
    }

    // ── 4. Queue depth (snapshot — current count of queued or in_progress) ──
    const currentQueue = playbooks.filter(p => p.status === "queued" || p.status === "in_progress").length;

    // ── 5. Docs pending — count rep_document_requests where status='pending'
    //    assigned to this accountant's clients ───────────────────────────────
    // Get pipeline IDs this accountant works on
    const clientPipelineIds = [...new Set(playbooks.map(p => (p as any).pipeline_id).filter(Boolean))];
    let docsPending = 0;
    if (clientPipelineIds.length > 0) {
      const { count } = await supabaseAdmin
        .from("rep_document_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .in("pipeline_id", clientPipelineIds);
      docsPending = count || 0;
    }

    // ── Build response ──────────────────────────────────────────────────────
    const stats = {
      findings_processed: buildStatShape(
        weeks.map(w => ({ period: w.label, value: processedByWeek.get(w.label) || 0 }))
      ),
      avg_confirm_time: buildStatShape(
        weeks.map(w => {
          const entry = confirmTimeByWeek.get(w.label);
          return { period: w.label, value: entry && entry.count > 0 ? Math.round(entry.sum / entry.count) : 0 };
        })
      ),
      confirmed_value: buildStatShape(
        weeks.map(w => ({ period: w.label, value: Math.round(confirmedByWeek.get(w.label) || 0) }))
      ),
      queue_depth: buildStatShape(
        weeks.map((w, i) => ({
          period: w.label,
          value: i === weeks.length - 1 ? currentQueue : 0,
        }))
      ),
      docs_pending: buildStatShape(
        weeks.map((w, i) => ({
          period: w.label,
          value: i === weeks.length - 1 ? docsPending : 0,
        }))
      ),
    };

    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    console.error("[Stats/Accountant]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
