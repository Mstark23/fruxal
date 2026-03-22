// =============================================================================
// lib/ai/timeline-builder.ts
// buildTimeline(businessId, userId?) — assembles all significant events from
// multiple sources into the business_timeline table. Idempotent via upsert.
// Called non-blocking after diagnostics, task completions, goal events.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";

interface TimelineEvent {
  business_id:             string;
  event_type:              string;
  event_date:              string;
  title:                   string;
  description?:            string;
  score_at_event?:         number | null;
  score_delta?:            number;
  savings_monthly_at_event?: number | null;
  savings_monthly_delta?:  number;
  source_id:               string;
  source_type:             string;
  icon:                    string;
  color:                   string;
  is_milestone:            boolean;
}

function scoreColor(score: number): string {
  if (score >= 70) return "green";
  if (score >= 50) return "blue";
  return "amber";
}

const SCORE_MILESTONES = [50, 60, 70, 80, 90];
const RECOVERY_MILESTONES = [100, 500, 1000, 5000];

export async function buildTimeline(
  businessId: string,
  userId?: string
): Promise<void> {
  try {
    // ── 1. Fetch all sources in parallel ─────────────────────────────────
    const [
      prescanRows,
      reportRows,
      compRows,
      taskRows,
      goalRows,
      scoreRows,
    ] = await Promise.all([
      // a) Prescan
      supabaseAdmin
        .from("prescan_results")
        .select("prescan_run_id, created_at, summary, teaser_leaks, industry, province")
        .eq("user_id", userId ?? "")
        .order("created_at", { ascending: true })
        .limit(5)
        .then(r => r.data ?? []),

      // b) Diagnostic reports
      supabaseAdmin
        .from("diagnostic_reports")
        .select("id, overall_score, created_at, completed_at, is_rescan, comparison_id, status")
        .eq("business_id", businessId)
        .eq("status", "completed")
        .order("created_at", { ascending: true })
        .then(r => r.data ?? []),

      // c) Comparisons (for rescan score deltas)
      supabaseAdmin
        .from("diagnostic_comparisons")
        .select("id, new_report_id, score_delta, savings_recovered_monthly, findings_new_count, days_between_scans")
        .eq("business_id", businessId)
        .then(r => r.data ?? []),

      // d) Completed tasks
      supabaseAdmin
        .from("diagnostic_tasks")
        .select("id, title, savings_monthly, completed_at, category, effort")
        .eq("business_id", businessId)
        .eq("status", "done")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: true })
        .then(r => r.data ?? []),

      // e) Goals
      supabaseAdmin
        .from("business_goals")
        .select("id, goal_title, goal_type, target_amount, status, created_at, completed_at, progress_pct")
        .eq("business_id", businessId)
        .order("created_at", { ascending: true })
        .then(r => r.data ?? []),

      // f) Score history
      supabaseAdmin
        .from("score_history")
        .select("id, score, trigger_type, calculated_at")
        .eq("business_id", businessId)
        .order("calculated_at", { ascending: true })
        .then(r => r.data ?? []),
    ]);

    const compMap = new Map(
      (compRows as any[]).map((c: any) => [c.new_report_id, c])
    );

    const events: TimelineEvent[] = [];

    // ── 2a. Prescan events ────────────────────────────────────────────────
    for (const p of prescanRows as any[]) {
      if (!p.prescan_run_id) continue;
      const totalLeaks = (p.teaser_leaks as any[])?.length ?? p.summary?.total_leaks ?? 0;
      const lossMin = p.summary?.leak_range_min ?? 0;
      events.push({
        business_id:            businessId,
        event_type:             "prescan",
        event_date:             p.created_at,
        title:                  "Initial scan completed",
        description:            `${totalLeaks} potential issue${totalLeaks !== 1 ? "s" : ""} identified — $${Math.round(lossMin / 12).toLocaleString()}/month at risk`,
        score_at_event:         null,
        savings_monthly_delta:  -Math.round(lossMin / 12),
        source_id:              p.prescan_run_id,
        source_type:            "prescan_results",
        icon:                   "🔍",
        color:                  "blue",
        is_milestone:           true,
      });
    }

    // ── 2b. Diagnostic events ─────────────────────────────────────────────
    let firstReport = true;
    for (const r of reportRows as any[]) {
      const score    = r.overall_score ?? 0;
      const isRescan = !!(r.is_rescan);
      const comp     = compMap.get(r.id) as any;
      const delta    = comp?.score_delta ?? 0;

      events.push({
        business_id:    businessId,
        event_type:     isRescan ? "rescan" : "diagnostic",
        event_date:     r.completed_at ?? r.created_at,
        title:          isRescan
          ? `Monthly scan — Score ${score}/100`
          : `First full diagnostic — Score ${score}/100`,
        description:    comp
          ? `${comp.findings_new_count > 0 ? `${comp.findings_new_count} new issue${comp.findings_new_count !== 1 ? "s" : ""} found. ` : ""}${comp.savings_recovered_monthly > 0 ? `$${Math.round(comp.savings_recovered_monthly).toLocaleString()}/month recovered.` : ""}`
          : undefined,
        score_at_event: score,
        score_delta:    delta,
        source_id:      r.id,
        source_type:    "diagnostic_reports",
        icon:           isRescan ? "🔄" : "🩺",
        color:          scoreColor(score),
        is_milestone:   firstReport,
      });
      firstReport = false;
    }

    // ── 2c. Task completed events ─────────────────────────────────────────
    for (const t of taskRows as any[]) {
      const mo = t.savings_monthly ?? 0;
      events.push({
        business_id:           businessId,
        event_type:            "task_completed",
        event_date:            t.completed_at,
        title:                 `Fixed: ${t.title}`,
        description:           mo > 0 ? `+$${Math.round(mo).toLocaleString()}/month recovered` : undefined,
        savings_monthly_delta: Math.round(mo),
        source_id:             t.id,
        source_type:           "diagnostic_tasks",
        icon:                  "✅",
        color:                 "green",
        is_milestone:          false,
      });
    }

    // ── 2d. Goal events ───────────────────────────────────────────────────
    for (const g of goalRows as any[]) {
      // Goal set
      events.push({
        business_id: businessId,
        event_type:  "goal_set",
        event_date:  g.created_at,
        title:       `Goal set: ${g.goal_title}`,
        description: g.target_amount ? `Target: $${Math.round(g.target_amount).toLocaleString()}/month` : undefined,
        source_id:   `${g.id}_set`,
        source_type: "business_goals_set",
        icon:        "🎯",
        color:       "purple",
        is_milestone: false,
      });

      // Goal completed
      if (g.status === "completed" && g.completed_at) {
        events.push({
          business_id:  businessId,
          event_type:   "goal_completed",
          event_date:   g.completed_at,
          title:        `🏆 Goal achieved: ${g.goal_title}`,
          description:  g.target_amount ? `$${Math.round(g.target_amount).toLocaleString()}/month target reached.` : "Goal completed.",
          source_id:    `${g.id}_done`,
          source_type:  "business_goals_done",
          icon:         "🏆",
          color:        "purple",
          is_milestone: true,
        });
      }
    }

    // ── 2e. Score milestone events ────────────────────────────────────────
    // Only emit the FIRST time a score threshold is crossed
    const crossedMilestones = new Set<number>();
    let prevScore = 0;
    for (const sh of scoreRows as any[]) {
      const s = sh.score ?? 0;
      for (const m of SCORE_MILESTONES) {
        if (prevScore < m && s >= m && !crossedMilestones.has(m)) {
          crossedMilestones.add(m);
          events.push({
            business_id:    businessId,
            event_type:     "score_milestone",
            event_date:     sh.calculated_at,
            title:          `Score milestone: ${m}/100 reached`,
            description:    `Financial health score crossed ${m} for the first time`,
            score_at_event: s,
            source_id:      `score_milestone_${m}_${businessId}`,
            source_type:    "score_milestones",
            icon:           "⭐",
            color:          "amber",
            is_milestone:   true,
          });
        }
      }
      prevScore = s;
    }

    // ── 2f. Recovery milestone events ────────────────────────────────────
    // Calculate running total savings and detect crossings
    const tasksSorted = [...(taskRows as any[])].sort(
      (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    );
    let cumulativeSavings = 0;
    const crossedRecovery = new Set<number>();
    for (const t of tasksSorted) {
      const prev = cumulativeSavings;
      cumulativeSavings += t.savings_monthly ?? 0;
      for (const m of RECOVERY_MILESTONES) {
        if (prev < m && cumulativeSavings >= m && !crossedRecovery.has(m)) {
          crossedRecovery.add(m);
          events.push({
            business_id:           businessId,
            event_type:            "milestone_reached",
            event_date:            t.completed_at,
            title:                 `Recovery milestone: $${Math.round(m)}/month`,
            description:           `Cumulative monthly savings crossed $${Math.round(m)} — that's $${Math.round(m * 12)}/year staying in your business`,
            savings_monthly_at_event: cumulativeSavings,
            source_id:             `recovery_milestone_${m}_${businessId}`,
            source_type:           "recovery_milestones",
            icon:                  "💰",
            color:                 "green",
            is_milestone:          true,
          });
        }
      }
    }

    // ── 3. Upsert all events ──────────────────────────────────────────────
    if (events.length === 0) return;

    // Batch upsert in chunks of 50
    for (let i = 0; i < events.length; i += 50) {
      const chunk = events.slice(i, i + 50);
      await supabaseAdmin
        .from("business_timeline")
        .upsert(chunk, { onConflict: "source_id,source_type" });
    }
  } catch (err: any) {
    console.error("[buildTimeline] Error:", err?.message);
    // Never re-throw — must be non-blocking
  }
}
