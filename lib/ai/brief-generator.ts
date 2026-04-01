// =============================================================================
// lib/ai/brief-generator.ts
// generateMonthlyBrief(businessId, userId, tier)
// Assembles full context via 7 parallel DB queries, builds tier-aware prompt,
// calls Claude, parses JSON response. Never throws — returns null on any failure.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPrescanContext } from "@/lib/ai/prescan-context";
import { findSolutionsForTask } from "@/lib/solutions/matcher";

export interface BriefResult {
  subject:    string;
  preview:    string;
  body_html:  string;
  body_text:  string;
}

function fmt(n: number | null | undefined): string {
  return "$" + Math.round((n ?? 0)).toLocaleString();
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-CA", { month: "long", day: "numeric" });
  } catch { return iso; }
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

// ── Context assembly ──────────────────────────────────────────────────────────
async function assembleContext(businessId: string, userId: string) {
  const [bizRow, reportsRow, completedTasksRow, openTasksRow, snapshotsRow, obligationsRow, ratiosRow, prescanCtx, activeGoal, latestComparison] =
    await Promise.all([
      // 1. Business + owner info
      supabaseAdmin
        .from("business_profiles")
        .select("business_name, industry, industry_label, province, employee_count, annual_revenue, exact_annual_revenue")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .maybeSingle()
        .then(r => r.data),

      // 2. Latest 2 diagnostic reports (current + previous for comparison)
      supabaseAdmin
        .from("diagnostic_reports")
        .select("overall_score, created_at, result_json, tier")
        .eq("business_id", businessId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(2)
        .then(r => r.data ?? []),

      // 3. Tasks completed in last 35 days
      supabaseAdmin
        .from("diagnostic_tasks")
        .select("title, savings_monthly, completed_at, category")
        .eq("business_id", businessId)
        .eq("status", "done")
        .gte("completed_at", new Date(Date.now() - 35 * 86400000).toISOString())
        .order("completed_at", { ascending: false })
        .then(r => r.data ?? []),

      // 4. Top 3 open tasks by savings
      supabaseAdmin
        .from("diagnostic_tasks")
        .select("title, action, savings_monthly, effort, category")
        .eq("business_id", businessId)
        .in("status", ["open", "in_progress"])
        .order("savings_monthly", { ascending: false })
        .limit(3)
        .then(r => r.data ?? []),

      // 5. Recovery snapshots (last 2 months for delta)
      supabaseAdmin
        .from("recovery_snapshots")
        .select("savings_recovered, savings_available, tasks_completed, month")
        .eq("business_id", businessId)
        .order("month", { ascending: false })
        .limit(2)
        .then(r => r.data ?? []),

      // 6. Upcoming obligations (next 45 days)
      supabaseAdmin
        .from("user_obligations")
        .select("obligation_slug, next_deadline, status, obligation_rules(title, category)")
        .eq("user_id", userId)
        .in("status", ["upcoming", "overdue"])
        .order("next_deadline", { ascending: true })
        .limit(4)
        .then(r => r.data ?? []),

      // 7. Latest financial ratios
      supabaseAdmin
        .from("financial_ratios")
        .select("gross_margin_pct, dscr, dso_days, ebitda_margin_pct, data_completeness_pct")
        .eq("business_id", businessId)
        .order("period_month", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(r => r.data),
      // 8. Prescan context (for first-diagnostic continuity messaging)
      getPrescanContext(businessId, userId).catch(() => null),

      // 9. Active goal
      supabaseAdmin
        .from("business_goals")
        .select("goal_title, goal_type, progress_pct, target_date, target_amount, status, created_at")
        .eq("business_id", businessId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then((r: any) => r.data),

      // 10. Most recent comparison (from rescan)
      supabaseAdmin
        .from("diagnostic_comparisons")
        .select("comparison_headline, score_delta, savings_recovered_monthly, findings_new_count, net_monthly_improvement, days_between_scans, generated_at")
        .eq("business_id", businessId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then((r: any) => r.data),
    ]);

  const currentReport = (reportsRow as any[])[0] ?? null;
  const prevReport    = (reportsRow as any[])[1] ?? null;
  const currentSnap   = (snapshotsRow as any[])[0] ?? null;
  const prevSnap      = (snapshotsRow as any[])[1] ?? null;

  const revAnnual = bizRow?.exact_annual_revenue ?? bizRow?.annual_revenue ?? 0;
  const revMonthly = Math.round(revAnnual / 12);

  // Detect language from province
  const isQC = (bizRow?.province || "").toUpperCase() === "QC" ||
    (bizRow?.province || "").toLowerCase() === "quebec";

  return {
    biz: {
      name:     bizRow?.business_name || "your business",
      industry: bizRow?.industry_label || bizRow?.industry || "business",
      province: bizRow?.province || "Canada",
      employees: bizRow?.employee_count ?? 0,
      revMonthly,
      isQC,
    },
    currentScore:  currentReport ? (currentReport.overall_score ?? 0) : null,
    prevScore:     prevReport    ? (prevReport.overall_score ?? 0)    : null,
    reportDate:    currentReport?.created_at ?? null,
    completedTasks: completedTasksRow as any[],
    openTasks:      openTasksRow as any[],
    recovery: currentSnap ? {
      recovered:  Math.round(currentSnap.savings_recovered ?? 0),
      available:  Math.round(currentSnap.savings_available ?? 0),
      completed:  currentSnap.tasks_completed ?? 0,
    } : null,
    prevRecovery: prevSnap ? {
      recovered: Math.round(prevSnap.savings_recovered ?? 0),
    } : null,
    obligations: (obligationsRow as any[]).map((o: any) => ({
      title:    (o.obligation_rules as any)?.title || o.obligation_slug,
      due_date: o.next_deadline,
      daysUntil: daysUntil(o.next_deadline),
    })).filter(o => o.due_date),
    ratios: ratiosRow,
    prescanCtx: prescanCtx ?? null,
    activeGoal:        activeGoal ?? null,
    latestComparison:  latestComparison ?? null,
    topSolution:       null as any,  // enriched below
  };
}

// ── Tier-specific user prompts ────────────────────────────────────────────────
async function buildUserPrompt(ctx: Awaited<ReturnType<typeof assembleContext>>, tier: string): Promise<string> {
  const { biz, currentScore, prevScore, completedTasks, openTasks, recovery, obligations, ratios, prescanCtx, activeGoal, latestComparison } = ctx;

  // Rep assignment context for monthly brief
  let repCtx: { repName: string; stage: string; confirmed: number } | null = null;
  // (repCtx populated by caller if needed — skip internal lookup to avoid biz type mismatch)
  const topTask = openTasks[0];
  const topDeadline = obligations[0];
  const langNote = biz.isQC ? " (If relevant, use Quebec tax terms: TPS/TVQ instead of HST/GST.)" : "";
  const recoveryDelta = recovery && ctx.prevRecovery
    ? recovery.recovered - ctx.prevRecovery.recovered : 0;

  const completedLines = completedTasks.length
    ? completedTasks.map(t => `  - ${t.title}: +${fmt(t.savings_monthly)}/month`).join("\n")
    : "  - No tasks completed in the last 35 days";

  const openLines = openTasks.length
    ? openTasks.map(t => `  - ${t.title} (~${fmt(t.savings_monthly)}/month, ${t.effort} effort)`).join("\n")
    : "  - No open tasks";

  const obligationLines = obligations.length
    ? obligations.map(o => `  - ${o.title}: due ${fmtDate(o.due_date)} (${o.daysUntil} days)`).join("\n")
    : "  - No upcoming deadlines";

  const scoreNote = prevScore !== null && currentScore !== null
    ? `${currentScore}/100 (${currentScore >= prevScore ? "up" : "down"} from ${prevScore} last time)`
    : currentScore !== null ? `${currentScore}/100` : "not yet calculated";

  if (tier === "solo") {
    return `Write a monthly financial brief for the owner of ${biz.name}, a ${biz.industry} business in ${biz.province}.${langNote}

Their situation this month:
- Health score: ${scoreNote}
- Money recovered recently: ${recovery ? fmt(recovery.recovered) + "/month" : "not yet tracked"} (${recovery?.completed ?? 0} fixes completed)
- Money still available to capture: ${recovery ? fmt(recovery.available) + "/month" : "unknown"}
- Their easiest open fix: ${topTask ? `"${topTask.title}" (~${fmt(topTask.savings_monthly)}/month, ${topTask.effort} effort)` : "none yet"}
- Next deadline: ${topDeadline ? `${topDeadline.title} in ${topDeadline.daysUntil} days` : "none upcoming"}

Keep it simple and direct. Maximum 3 short paragraphs. They are a solo operator with limited time. One action only. Make it feel achievable.`;
  }




  // Top solution for brief
  let solutionNote = "";
  try {
    const briefTopTask = (openTasks as any[])[0];
    if (briefTopTask) {
      const briefMatches = await findSolutionsForTask(
        { category: briefTopTask.category ?? "general", title: briefTopTask.title ?? "", savings_monthly: briefTopTask.savings_monthly ?? 0 },
        { industrySlug: biz.industry ?? "general", province: biz.province ?? "QC", tier }
      );
      const s = briefMatches[0];
      if (s) {
        solutionNote = `\nTOP RECOMMENDED SOLUTION THIS MONTH:\nTask: ${briefTopTask.title} (~$${Math.round(briefTopTask.savings_monthly ?? 0).toLocaleString()}/month)\nSolution: ${s.name}${s.savings_estimate ? ` — ${s.savings_estimate}` : ""}\nURL: ${s.url}\nInclude this naturally in the brief. Mention the solution by name and link: 'learn more at ${s.url}'`;
      }
    }
  } catch { /* non-fatal */ }

  // Goal progress note for brief
  const goalNote = (activeGoal as any)?.goal_title
    ? (() => {
        const g = activeGoal as any;
        const pct = g.progress_pct ?? 0;
        const daysLeft = Math.max(0, Math.ceil((new Date(g.target_date).getTime() - Date.now()) / 86400000));
        const totalDays = 90;
        const daysElapsed = totalDays - daysLeft;
        const pacePct = Math.min(100, (daysElapsed / totalDays) * 100);
        const onPace = pct >= pacePct;
        if (onPace) return `\nGOAL PROGRESS: On track for goal '${g.goal_title}' — ${Math.round(pct)}% complete with ${daysLeft} days left.`;
        return `\nGOAL PROGRESS: Behind pace on goal '${g.goal_title}' — ${Math.round(pct)}% complete, ${daysLeft} days left.`;
      })()
    : "";


  // Rescan comparison note for brief
  const compNote = (latestComparison as any)?.comparison_headline
    ? (() => {
        const lc = latestComparison as any;
        const isRecent = lc.generated_at && (Date.now() - new Date(lc.generated_at).getTime()) < 35 * 86400000;
        if (!isRecent) return "";
        return `\nRECENT RESCAN (${lc.days_between_scans} days between scans): Score ${lc.score_delta >= 0 ? "+" : ""}${lc.score_delta} | Savings recovered: $${Math.round(lc.savings_recovered_monthly ?? 0).toLocaleString()}/month | New issues: ${lc.findings_new_count} | Net improvement: ${lc.net_monthly_improvement >= 0 ? "+" : ""}$${Math.round(Math.abs(lc.net_monthly_improvement ?? 0)).toLocaleString()}/month`;
      })()
    : "";

  // Prescan continuity note for brief
  const prescanNote = prescanCtx
    ? ctx.currentScore !== null && !ctx.prevScore
      ? `\nPRESCAN CONTEXT: Their initial scan ${prescanCtx.daysSincePrescan} days ago flagged ~$${(prescanCtx.totalEstimatedLoss ?? 0).toLocaleString()}/month in potential losses. This is their first full diagnostic — reference the prescan validation in the brief.`
      : prescanCtx.daysSincePrescan > 0 && prescanCtx.totalEstimatedLoss > 0
      ? `\nPRESCAN HISTORY: Initial scan ${prescanCtx.daysSincePrescan} days ago flagged ~$${(prescanCtx.totalEstimatedLoss ?? 0).toLocaleString()}/month.`
      : ""
    : "";

  if (tier === "enterprise") {
    const ratioNote = ratios && (ratios.data_completeness_pct ?? 0) >= 20
      ? `Ratio highlights: Gross margin ${ratios.gross_margin_pct !== null ? ratios.gross_margin_pct + "%" : "—"}, DSCR ${ratios.dscr !== null ? ratios.dscr + "×" : "—"}`
      : "";

    return `Write a monthly CFO-style financial brief for the owner of ${biz.name}, a ${biz.industry} business in ${biz.province}.${langNote}

Financial summary:
- Health score: ${scoreNote}
- Confirmed recoveries this month: ${recovery ? fmt(recovery.recovered) + "/month" : "not tracked"}
- Cumulative annual impact: ${recovery ? fmt(recovery.recovered * 12) + "/year" : "not tracked"}
- Open opportunities: ${recovery ? fmt(recovery.available) + "/month" : "unknown"} available
- Priority items:
${openLines}
- Upcoming obligations:
${obligationLines}
${ratioNote ? `- ${ratioNote}` : ""}

Write in a professional advisory tone. 4 paragraphs. Format as a monthly business intelligence update. CTA should be specific to their highest-value open item.`;
  }

  // Default: business tier
  const ratioNote = ratios && (ratios.data_completeness_pct ?? 0) >= 20
    ? `\n- Key ratio note: ${ratios.gross_margin_pct !== null ? `Gross margin ${ratios.gross_margin_pct}%` : ""}${ratios.dscr !== null ? `, DSCR ${ratios.dscr}×` : ""}${ratios.dso_days !== null ? `, DSO ${Math.round(ratios.dso_days)} days` : ""}`
    : "";

  return `Write a monthly financial brief for the owner of ${biz.name}, a ${biz.industry} business in ${biz.province} with ${biz.employees || "a team of"} employees.${langNote}

Their financial situation:
- Health score: ${scoreNote}
- Tasks completed recently:
${completedLines}
- Total recovered to date: ${recovery ? fmt(recovery.recovered) + "/month" : "not tracked"} (${recovery ? fmt(recovery.recovered * 12) + "/year" : "—"})
- Month-over-month change: ${recoveryDelta >= 0 ? "+" : ""}${fmt(recoveryDelta)}/month
- Still available: ${recovery ? fmt(recovery.available) + "/month" : "unknown"} across ${openTasks.length} open tasks
- Top priority task: ${topTask ? `"${topTask.title}" (~${fmt(topTask.savings_monthly)}/month)` : "none"}
- Top open tasks:
${openLines}
- Upcoming deadlines:
${obligationLines}${ratioNote}${prescanNote}${goalNote}${compNote}${solutionNote}

Write 3-4 substantive paragraphs. Include dollar amounts everywhere. The subject line should reference a specific number from their situation. CTA should link to their top priority task.`;
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateMonthlyBrief(
  businessId: string,
  userId:     string,
  tier:       string,
  repNote?:   string
): Promise<BriefResult | null> {
  try {
    const ctx = await assembleContext(businessId, userId);

    // Require at least a diagnostic score or some recovery data to generate
    if (!ctx.currentScore && !ctx.recovery) {
      process.env.NODE_ENV !== "production" && console.log(`[Brief] Skipping ${businessId} — no diagnostic or recovery data`);
      return null;
    }

    const userPrompt = await buildUserPrompt(ctx, tier);

    const systemPrompt = `You are writing a monthly financial brief for a Canadian SMB owner.
Your job is to write a brief that feels personal, specific, and genuinely useful — not a generic newsletter.

Rules:
- Reference their actual numbers in every paragraph
- Write in a direct, warm, professional tone
- No bullet points in the email body — write in paragraphs
- Length: 250-350 words total
- End with ONE clear call to action
- Never use the words "leverage", "synergy", "optimize", or "utilize"
- Respond with JSON only — no preamble, no markdown fences:
  {"subject":"...","preview":"...","body_html":"...","body_text":"..."}

subject: compelling, specific, under 60 chars, must reference a real number from their data
preview: email preview text under 90 chars
body_html: full HTML email body using only inline styles — no CSS classes
body_text: plain text version`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    let res;
    try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    }); } catch (fetchErr: any) { console.error("[Brief] fetch error:", fetchErr.message); return null; }
    if (!res) return null;
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[Brief] Claude API error: ${res.status}`);
      return null;
    }

    const data = await res.json().catch(() => null);
    if (!data) { console.error("[Brief] Failed to parse Claude response"); return null; }
    const raw = data.content?.[0]?.text?.trim() || "";

    // Strip markdown fences if present
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: BriefResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("[Brief] JSON parse failed for", businessId);
      return null;
    }

    // Validate required fields
    if (!parsed.subject || !parsed.body_html) {
      console.error("[Brief] Missing required fields for", businessId);
      return null;
    }

    return parsed;
  } catch (err: any) {
    console.error("[Brief] generateMonthlyBrief error:", err.message);
    return null;
  }
}
