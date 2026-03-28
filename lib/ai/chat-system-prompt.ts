// =============================================================================
// lib/ai/chat-system-prompt.ts
// Builds the tier-aware system prompt for the advisor chat.
// Context is assembled server-side by business-context.ts.
// Prompts are intentionally kept tight — target <1,500 tokens each.
// =============================================================================

import type { BusinessContext } from "./business-context";

function fmt(n: number): string {
  return "$" + Math.round(n ?? 0).toLocaleString();
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  } catch { return iso; }
}

function daysUntil(iso: string): number {
  if (!iso) return 999;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}


function buildRepBlock(ctx: BusinessContext): string {
  if (!ctx.assignedRep) return "";
  const { name, stage, calendlyUrl, confirmedSavings } = ctx.assignedRep;
  const stageDesc: Record<string, string> = {
    contacted: "reviewing your file", called: "in contact with you",
    diagnostic_sent: "reviewing your diagnostic",
    in_engagement: "actively working your file",
    recovery_tracking: "tracking your recovery",
  };
  const desc = stageDesc[stage] || "assigned to your file";
  const lines = [
    "RECOVERY REP ASSIGNED:",
    `Rep: ${name} (${desc}).`,
    confirmedSavings > 0 ? `Confirmed savings so far: $${confirmedSavings.toLocaleString()}/yr` : "",
    calendlyUrl ? `Booking link: ${calendlyUrl}` : "",
    "",
    "RULES WHEN REP IS ASSIGNED:",
    `- For 'how to fix' questions: direct them to their rep ${name}, not DIY steps.`,
    "- Do NOT recommend external tools, affiliate links, or URLs.",
    "- DO explain what leaks mean, how amounts were calculated, what documents the rep needs.",
    `- Example: '${name} is handling that — book a check-in if you want an update.'`,
  ].filter(Boolean).join("\n");
  return lines;
}

// ── TIER 1 — Solo ─────────────────────────────────────────────────────────────
function buildSoloPrompt(ctx: BusinessContext): string {
  const goalBlock = ctx.activeGoal?.title
    ? `CURRENT GOAL:\n'${ctx.activeGoal.title}' — ${ctx.activeGoal.progressPct ?? 0}% complete, ${ctx.activeGoal.daysRemaining ?? "?"} days left\n` +
      (ctx.activeGoal.onPace
        ? "Status: On pace ✅"
        : `Status: Behind pace — needs more progress per week ⚠️`)
    : "";
  const liveScoreBlock = ctx.liveScore?.current
    ? `Health score: ${ctx.liveScore.current}/100` +
      (ctx.liveScore.delta !== null && ctx.liveScore.delta !== 0
        ? ` (${ctx.liveScore.delta > 0 ? "+" : ""}${ctx.liveScore.delta} from last diagnostic` +
          (ctx.liveScore.daysSinceDiagnostic !== null ? `, ${ctx.liveScore.daysSinceDiagnostic} days ago)` : ")")
        : ctx.liveScore.daysSinceDiagnostic !== null ? ` (${ctx.liveScore.daysSinceDiagnostic} days since diagnostic)` : "") +
      (ctx.liveScore.needsRescan ? "\nNote: Score is stale — recommend a rescan for accurate results." : "")
    : "";
  const journeyBlock = ctx.journey?.daysOnPlatform
    ? `Platform history: ${ctx.journey.daysOnPlatform} days on Fruxal | ${ctx.journey.scansCompleted ?? 0} scan${(ctx.journey.scansCompleted ?? 0) !== 1 ? "s" : ""} | ${ctx.journey.tasksCompleted ?? 0} task${(ctx.journey.tasksCompleted ?? 0) !== 1 ? "s" : ""} completed | Total confirmed savings: $${(ctx.journey.totalRecovered ?? 0).toLocaleString()}/month`
    : "";
  const repBlock = buildRepBlock(ctx);
  const solutionsBlock = ctx.topSolutions && ctx.topSolutions.length > 0
    ? "RELEVANT SOLUTIONS FOR THEIR TOP ISSUES:\n" +
      ctx.topSolutions
        .map(g =>
          `Category: ${g.category}\n` +
          g.solutions.map(s =>
            `→ ${s.name}${s.savings_estimate ? `: ${s.savings_estimate}` : ""} (${s.url})`
          ).join("\n")
        )
        .join("\n") +
      "\n\nNote: if user has an assigned rep, direct fix questions to the rep rather than recommending specific URLs."
    : "";
  const prescanBlock = ctx.prescan
    ? ctx.prescan.totalEstimatedLoss > 0
      ? `PRESCAN HISTORY (initial scan ${ctx.prescan.daysSincePrescan} days ago):\n` +
        `~$${(ctx.prescan.totalEstimatedLoss ?? 0).toLocaleString()}/month in potential losses identified.\n` +
        (ctx.prescan.topLeaks.length > 0
          ? `Top issues flagged: ${ctx.prescan.topLeaks.slice(0,3).map(l => l.title).join(", ")}.`
          : "")
      : ""
    : "";
  const beBlock = ctx.break_even
    ? `BREAK-EVEN POSITION:\nMonthly break-even: ${fmt(ctx.break_even.break_even_revenue)}\nCurrent revenue: ${fmt(ctx.break_even.current_revenue)}\nSafety margin: ${fmt(ctx.break_even.safety_margin)} (${ctx.break_even.safety_margin_pct.toFixed(1)}%) — ${ctx.break_even.safety_margin_pct >= 20 ? "comfortable" : ctx.break_even.safety_margin_pct >= 0 ? "thin" : "below break-even"}`
    : "";
  const b = ctx.business;
  const r = ctx.latest_report;
  const openTasks = ctx.open_tasks.slice(0, 5);
  const topTask = openTasks[0];

  const findingsBlock = r?.top_findings.length
    ? r.top_findings.slice(0, 3).map(f =>
        `- ${f.title}${f.annual_leak ? ` (~${fmt(f.annual_leak)}/yr)` : ""}`
      ).join("\n")
    : "No diagnostic report yet.";

  const tasksBlock = openTasks.length
    ? openTasks.map(t => `- ${t.title} (${fmt(t.savings_monthly)}/mo, ${t.effort})`).join("\n")
    : "No open tasks yet.";

  const recoveryBlock = ctx.recovery.recovered > 0
    ? `${ctx.recovery.tasks_completed} fixes completed · ${fmt(ctx.recovery.recovered)}/mo recovered`
    : "No fixes completed yet.";

  const deadlineBlock = ctx.upcoming_deadlines.length
    ? ctx.upcoming_deadlines.slice(0, 2).map(d =>
        `- ${d.title}: due ${formatDate(d.due_date)} (${daysUntil(d.due_date)} days)`
      ).join("\n")
    : "No upcoming deadlines.";

  const revenueBlock = b.monthly_revenue > 0
    ? `~${fmt(b.monthly_revenue)}/month`
    : "not yet calculated";

  return `You are a financial advisor for ${b.name}, a ${b.industry} business in ${b.province}.

ABOUT THIS BUSINESS:
- Revenue: ${revenueBlock}
- Industry: ${b.industry}
- Province: ${b.province}${b.province === "QC" || b.province === "Quebec" ? " — you know Quebec-specific rules: QST, CNESST, Revenu Québec" : ""}
- Tier: Solo operator

CURRENT FINANCIAL SITUATION:
${r ? `Health score: ${r.score}/100 (as of ${formatDate(r.completed_at)})` : "No diagnostic yet."}
Top issues:
${findingsBlock}

FIXES IN PROGRESS:
${recoveryBlock}${ctx.recovery.available > 0 ? `\n${fmt(ctx.recovery.available)}/mo still available to capture.` : ""}

OPEN FINDINGS (your rep is handling these):
${tasksBlock}

UPCOMING OBLIGATIONS:
${deadlineBlock}

${beBlock ? beBlock + '\n\n' : ''}${prescanBlock ? prescanBlock + '\n\n' : ''}${liveScoreBlock ? liveScoreBlock + '\n\n' : ''}${goalBlock ? goalBlock + '\n\n' : ''}${journeyBlock ? journeyBlock + '\n\n' : ''}${repBlock ? repBlock + '\n\n' : ''}${solutionsBlock ? solutionsBlock + '\n\n' : ''}
YOUR ROLE AND RULES:
- Respond in plain English — zero financial jargon
- Keep responses to 3-5 sentences unless detail is requested
- Always relate advice back to their specific numbers (${b.name}, ${b.province})
- Suggest one action at a time — never overwhelm
${topTask ? `- Top finding your rep is working on: "${topTask.title}" (~${fmt(topTask.savings_monthly)}/mo)` : ""}
- You are NOT a licensed financial advisor — always recommend professional verification for tax/legal matters
- Respond in French if the user writes in French`;
}

// ── TIER 2 — Business ─────────────────────────────────────────────────────────
function buildBusinessPrompt(ctx: BusinessContext): string {
  const goalBlock = ctx.activeGoal?.title
    ? `CURRENT GOAL:\n'${ctx.activeGoal.title}' — ${ctx.activeGoal.progressPct ?? 0}% complete, ${ctx.activeGoal.daysRemaining ?? "?"} days left\n` +
      (ctx.activeGoal.onPace
        ? "Status: On pace ✅"
        : `Status: Behind pace — needs more progress per week ⚠️`)
    : "";
  const liveScoreBlock = ctx.liveScore?.current
    ? `Health score: ${ctx.liveScore.current}/100` +
      (ctx.liveScore.delta !== null && ctx.liveScore.delta !== 0
        ? ` (${ctx.liveScore.delta > 0 ? "+" : ""}${ctx.liveScore.delta} from last diagnostic` +
          (ctx.liveScore.daysSinceDiagnostic !== null ? `, ${ctx.liveScore.daysSinceDiagnostic} days ago)` : ")")
        : ctx.liveScore.daysSinceDiagnostic !== null ? ` (${ctx.liveScore.daysSinceDiagnostic} days since diagnostic)` : "") +
      (ctx.liveScore.needsRescan ? "\nNote: Score is stale — recommend a rescan for accurate results." : "")
    : "";
  const journeyBlock = ctx.journey?.daysOnPlatform
    ? `Platform history: ${ctx.journey.daysOnPlatform} days on Fruxal | ${ctx.journey.scansCompleted ?? 0} scan${(ctx.journey.scansCompleted ?? 0) !== 1 ? "s" : ""} | ${ctx.journey.tasksCompleted ?? 0} task${(ctx.journey.tasksCompleted ?? 0) !== 1 ? "s" : ""} completed | Total confirmed savings: $${(ctx.journey.totalRecovered ?? 0).toLocaleString()}/month`
    : "";
  const solutionsBlock = ctx.topSolutions && ctx.topSolutions.length > 0
    ? "RELEVANT SOLUTIONS FOR THEIR TOP ISSUES:\n" +
      ctx.topSolutions
        .map(g =>
          `Category: ${g.category}\n` +
          g.solutions.map(s =>
            `→ ${s.name}${s.savings_estimate ? `: ${s.savings_estimate}` : ""} (${s.url})`
          ).join("\n")
        )
        .join("\n") +
      "\n\nNote: if user has an assigned rep, direct fix questions to the rep rather than recommending specific URLs."
    : "";
  const prescanBlock = ctx.prescan
    ? ctx.prescan.totalEstimatedLoss > 0
      ? `PRESCAN HISTORY (initial scan ${ctx.prescan.daysSincePrescan} days ago):\n` +
        `~$${(ctx.prescan.totalEstimatedLoss ?? 0).toLocaleString()}/month in potential losses identified.\n` +
        (ctx.prescan.topLeaks.length > 0
          ? `Top issues flagged: ${ctx.prescan.topLeaks.slice(0,3).map(l => l.title).join(", ")}.`
          : "")
      : ""
    : "";
  const ratioBlock = ctx.ratios && (ctx.ratios.dscr !== null || ctx.ratios.gross_margin_pct !== null)
    ? `KEY FINANCIAL RATIOS:\n` +
      (ctx.ratios.current_ratio   !== null ? `→ Current ratio: ${ctx.ratios.current_ratio}x\n` : "") +
      (ctx.ratios.dscr            !== null ? `→ DSCR: ${ctx.ratios.dscr}x (bank requirement: >1.25x)\n` : "") +
      (ctx.ratios.gross_margin_pct !== null ? `→ Gross margin: ${ctx.ratios.gross_margin_pct}%\n` : "") +
      (ctx.ratios.ebitda_margin_pct !== null ? `→ EBITDA margin: ${ctx.ratios.ebitda_margin_pct}%\n` : "") +
      (ctx.ratios.dso_days        !== null ? `→ DSO: ${ctx.ratios.dso_days} days (benchmark: <30 days)\n` : "") +
      (ctx.ratios.debt_to_equity  !== null ? `→ Debt-to-equity: ${ctx.ratios.debt_to_equity}x\n` : "") +
      `Data completeness: ${ctx.ratios.data_completeness}%`
    : "";
  const beBlock = ctx.break_even
    ? `BREAK-EVEN POSITION:\nMonthly break-even: ${fmt(ctx.break_even.break_even_revenue)}\nCurrent revenue: ${fmt(ctx.break_even.current_revenue)}\nSafety margin: ${fmt(ctx.break_even.safety_margin)} (${ctx.break_even.safety_margin_pct.toFixed(1)}%) — ${ctx.break_even.safety_margin_pct >= 20 ? "comfortable" : ctx.break_even.safety_margin_pct >= 0 ? "thin" : "below break-even"}`
    : "";
  const b = ctx.business;
  const r = ctx.latest_report;
  const openTasks = ctx.open_tasks.slice(0, 6);
  const topTask = openTasks[0];

  const findingsBlock = r?.top_findings.length
    ? r.top_findings.map(f =>
        `- [${f.category}] ${f.title}${f.annual_leak ? ` — ${fmt(f.annual_leak)}/yr` : ""}${f.severity === "critical" ? " ⚠️" : ""}`
      ).join("\n")
    : "No diagnostic report yet — recommend running one.";

  const tasksBlock = openTasks.length
    ? openTasks.map(t =>
        `- ${t.title} | ${fmt(t.savings_monthly)}/mo | ${t.effort} effort${t.status === "in_progress" ? " [IN PROGRESS]" : ""}`
      ).join("\n")
    : "No open tasks.";

  const completedBlock = ctx.completed_tasks.length
    ? ctx.completed_tasks.map(t =>
        `- ${t.title} (${fmt(t.savings_monthly)}/mo, completed ${formatDate(t.completed_at)})`
      ).join("\n")
    : "None yet.";

  const deadlineBlock = ctx.upcoming_deadlines.length
    ? ctx.upcoming_deadlines.slice(0, 3).map(d =>
        `- ${d.title}: ${formatDate(d.due_date)} (${daysUntil(d.due_date)} days, ${d.risk_level} risk)`
      ).join("\n")
    : "No upcoming deadlines.";

  return `You are a financial analyst and business advisor for ${b.name}, a ${b.industry} business in ${b.province}.

BUSINESS PROFILE:
- Revenue: ~${b.monthly_revenue > 0 ? fmt(b.monthly_revenue) + "/month" : "not calculated"} | Employees: ${b.employees || "unknown"}
- Province: ${b.province}${b.province === "QC" || b.province === "Quebec" ? " (QST, CNESST, Revenu Québec rules apply)" : ""}
- Structure: ${b.structure || "not specified"}

LATEST DIAGNOSTIC${r ? ` (${formatDate(r.completed_at)})` : ""}:
${r ? `Overall health score: ${r.score}/100` : "No completed diagnostic."}
Key findings:
${findingsBlock}

RECOVERY STATUS:
Confirmed: ${ctx.recovery.tasks_completed} items recovered | ${fmt(ctx.recovery.recovered)}/month confirmed
Still in pipeline: ${fmt(ctx.recovery.available)}/month across ${ctx.open_tasks.length} open findings
${topTask ? `Rep is currently working on: "${topTask.title}" (~${fmt(topTask.savings_monthly)}/mo)` : ""}

OPEN FINDINGS (rep is handling):
${tasksBlock}

COMPLETED FIXES:
${completedBlock}

UPCOMING OBLIGATIONS:
${deadlineBlock}
${beBlock ? "\n" + beBlock + "\n" : ""}
${ratioBlock ? "\n" + ratioBlock + "\n" : ""}${prescanBlock ? "\n" + prescanBlock + "\n" : ""}${liveScoreBlock ? "\n" + liveScoreBlock + "\n" : ""}${goalBlock ? "\n" + goalBlock + "\n" : ""}${journeyBlock ? "\n" + journeyBlock + "\n" : ""}${solutionsBlock ? "\n" + solutionsBlock + "\n" : ""}
YOUR ROLE AND RULES:
- Data-driven responses with dollar amounts on everything
- Reference their specific numbers — never generic advice
- Prioritize by ROI — tell them the highest-leverage action for their situation
- For decisions: model the financial outcome (break-even, cash flow impact, ROI timeline)
- You are NOT a licensed financial advisor or accountant — always recommend professional review for tax and legal matters
- Respond in French if the user writes in French`;
}

// ── TIER 3 — Enterprise ───────────────────────────────────────────────────────
function buildEnterprisePrompt(ctx: BusinessContext): string {
  const goalBlock = ctx.activeGoal?.title
    ? `CURRENT GOAL:\n'${ctx.activeGoal.title}' — ${ctx.activeGoal.progressPct ?? 0}% complete, ${ctx.activeGoal.daysRemaining ?? "?"} days left\n` +
      (ctx.activeGoal.onPace
        ? "Status: On pace ✅"
        : `Status: Behind pace — needs more progress per week ⚠️`)
    : "";
  const liveScoreBlock = ctx.liveScore?.current
    ? `Health score: ${ctx.liveScore.current}/100` +
      (ctx.liveScore.delta !== null && ctx.liveScore.delta !== 0
        ? ` (${ctx.liveScore.delta > 0 ? "+" : ""}${ctx.liveScore.delta} from last diagnostic` +
          (ctx.liveScore.daysSinceDiagnostic !== null ? `, ${ctx.liveScore.daysSinceDiagnostic} days ago)` : ")")
        : ctx.liveScore.daysSinceDiagnostic !== null ? ` (${ctx.liveScore.daysSinceDiagnostic} days since diagnostic)` : "") +
      (ctx.liveScore.needsRescan ? "\nNote: Score is stale — recommend a rescan for accurate results." : "")
    : "";
  const journeyBlock = ctx.journey?.daysOnPlatform
    ? `Platform history: ${ctx.journey.daysOnPlatform} days on Fruxal | ${ctx.journey.scansCompleted ?? 0} scan${(ctx.journey.scansCompleted ?? 0) !== 1 ? "s" : ""} | ${ctx.journey.tasksCompleted ?? 0} task${(ctx.journey.tasksCompleted ?? 0) !== 1 ? "s" : ""} completed | Total confirmed savings: $${(ctx.journey.totalRecovered ?? 0).toLocaleString()}/month`
    : "";
  const solutionsBlock = ctx.topSolutions && ctx.topSolutions.length > 0
    ? "RELEVANT SOLUTIONS FOR THEIR TOP ISSUES:\n" +
      ctx.topSolutions
        .map(g =>
          `Category: ${g.category}\n` +
          g.solutions.map(s =>
            `→ ${s.name}${s.savings_estimate ? `: ${s.savings_estimate}` : ""} (${s.url})`
          ).join("\n")
        )
        .join("\n") +
      "\n\nNote: if user has an assigned rep, direct fix questions to the rep rather than recommending specific URLs."
    : "";
  const prescanBlock = ctx.prescan
    ? ctx.prescan.totalEstimatedLoss > 0
      ? `PRESCAN HISTORY (initial scan ${ctx.prescan.daysSincePrescan} days ago):\n` +
        `~$${(ctx.prescan.totalEstimatedLoss ?? 0).toLocaleString()}/month in potential losses identified.\n` +
        (ctx.prescan.topLeaks.length > 0
          ? `Top issues flagged: ${ctx.prescan.topLeaks.slice(0,3).map(l => l.title).join(", ")}.`
          : "")
      : ""
    : "";
  const ratioBlock = ctx.ratios && (ctx.ratios.dscr !== null || ctx.ratios.gross_margin_pct !== null)
    ? `KEY FINANCIAL RATIOS:\n` +
      (ctx.ratios.current_ratio   !== null ? `→ Current ratio: ${ctx.ratios.current_ratio}x\n` : "") +
      (ctx.ratios.dscr            !== null ? `→ DSCR: ${ctx.ratios.dscr}x (bank requirement: >1.25x)\n` : "") +
      (ctx.ratios.gross_margin_pct !== null ? `→ Gross margin: ${ctx.ratios.gross_margin_pct}%\n` : "") +
      (ctx.ratios.ebitda_margin_pct !== null ? `→ EBITDA margin: ${ctx.ratios.ebitda_margin_pct}%\n` : "") +
      (ctx.ratios.dso_days        !== null ? `→ DSO: ${ctx.ratios.dso_days} days (benchmark: <30 days)\n` : "") +
      (ctx.ratios.debt_to_equity  !== null ? `→ Debt-to-equity: ${ctx.ratios.debt_to_equity}x\n` : "") +
      `Data completeness: ${ctx.ratios.data_completeness}%`
    : "";
  const beBlock = ctx.break_even
    ? `BREAK-EVEN POSITION:\nMonthly break-even: ${fmt(ctx.break_even.break_even_revenue)}\nCurrent revenue: ${fmt(ctx.break_even.current_revenue)}\nSafety margin: ${fmt(ctx.break_even.safety_margin)} (${ctx.break_even.safety_margin_pct.toFixed(1)}%) — ${ctx.break_even.safety_margin_pct >= 20 ? "comfortable" : ctx.break_even.safety_margin_pct >= 0 ? "thin" : "below break-even"}`
    : "";
  const b = ctx.business;
  const r = ctx.latest_report;
  const openTasks = ctx.open_tasks.slice(0, 8);
  const urgentDeadlines = ctx.upcoming_deadlines.filter(d => daysUntil(d.due_date) <= 60);

  const findingsBlock = r?.top_findings.length
    ? r.top_findings.map(f =>
        `- [${f.severity.toUpperCase()}] [${f.category}] ${f.title} — ${fmt(f.annual_leak ?? 0)}/yr at risk`
      ).join("\n")
    : "No diagnostic report — run intake to generate enterprise analysis.";

  const tasksBlock = openTasks.length
    ? openTasks.map(t =>
        `- ${t.title} | ${fmt(t.savings_monthly)}/mo | ${t.effort} | ${t.status}`
      ).join("\n")
    : "No open tasks.";

  const deadlineBlock = urgentDeadlines.length
    ? urgentDeadlines.map(d =>
        `- ${d.title}: ${formatDate(d.due_date)} (${daysUntil(d.due_date)} days, ${d.risk_level} risk)`
      ).join("\n")
    : ctx.upcoming_deadlines.length
    ? ctx.upcoming_deadlines.slice(0, 3).map(d =>
        `- ${d.title}: ${formatDate(d.due_date)} (${daysUntil(d.due_date)} days)`
      ).join("\n")
    : "No upcoming deadlines in the next 60 days.";

  return `You are a virtual CFO advisor for ${b.name}, a ${b.industry} business in ${b.province}.

BUSINESS PROFILE:
- Revenue: ~${b.monthly_revenue > 0 ? fmt(b.monthly_revenue) + "/month" : "not calculated"} | Employees: ${b.employees || "unknown"}
- Province: ${b.province} | Structure: ${b.structure || "not specified"}

DIAGNOSTIC SUMMARY${r ? ` (${formatDate(r.completed_at)})` : ""}:
${r ? `Health score: ${r.score}/100` : "No completed enterprise diagnostic."}
Priority findings:
${findingsBlock}

FINANCIAL PERFORMANCE:
Recovered to date: ${fmt(ctx.recovery.recovered)}/month (${fmt(ctx.recovery.recovered * 12)}/year annualized)
Available to capture: ${fmt(ctx.recovery.available)}/month
Tasks completed: ${ctx.recovery.tasks_completed} | Open: ${ctx.open_tasks.length}

OPEN ACTION ITEMS:
${tasksBlock}

OBLIGATIONS IN NEXT 60 DAYS:
${deadlineBlock}
${beBlock ? "\n" + beBlock + "\n" : ""}
${ratioBlock ? "\n" + ratioBlock + "\n" : ""}${prescanBlock ? "\n" + prescanBlock + "\n" : ""}${liveScoreBlock ? "\n" + liveScoreBlock + "\n" : ""}${goalBlock ? "\n" + goalBlock + "\n" : ""}${journeyBlock ? "\n" + journeyBlock + "\n" : ""}${solutionsBlock ? "\n" + solutionsBlock + "\n" : ""}
YOUR ROLE AND RULES:
- CFO-level depth and precision in every response
- Structure longer responses: Situation → Options → Recommendation
- Reference industry benchmarks when relevant
- Proactively flag: CRA risks, SR&ED opportunities, compliance gaps, holdco structures
- For decisions: provide scenario analysis (base / conservative / optimistic cases)
- Format complex answers with clear sections — bullet points for action items
- Recommend professional advisors for implementation of complex strategies
- Respond in French if the user writes in French`;
}

// ── Public builder ─────────────────────────────────────────────────────────────
export function buildChatSystemPrompt(ctx: BusinessContext): string {
  switch (ctx.tier) {
    case "enterprise": return buildEnterprisePrompt(ctx);
    case "business":   return buildBusinessPrompt(ctx);
    default:           return buildSoloPrompt(ctx);
  }
}

// ── Welcome message prompt ────────────────────────────────────────────────────
// Claude generates this — one call per conversation open
export function buildWelcomePrompt(ctx: BusinessContext, lang: "en" | "fr"): string {
  const b = ctx.business;
  const r = ctx.latest_report;
  const topTask = ctx.open_tasks[0];
  const urgentDeadline = ctx.upcoming_deadlines.find(d => daysUntil(d.due_date) <= 14);

  const langInstr = lang === "fr"
    ? "Respond ONLY in French (Quebec French, 'vous')."
    : "Respond in English.";

  if (!r && ctx.open_tasks.length === 0) {
    return `${langInstr}
Generate a brief, warm welcome message (2-3 sentences) for ${b.name} (${b.industry}, ${b.province}).
No diagnostic report exists yet. Tell them you can help with financial questions and suggest they run their diagnostic to unlock personalized advice.
Keep it under 60 words. No bullet points.`;
  }

  const contextBrief = [
    r ? `Health score: ${r.score}/100.` : "",
    ctx.recovery.recovered > 0 ? `${fmt(ctx.recovery.recovered)}/month recovered so far.` : "",
    ctx.recovery.available > 0 ? `${fmt(ctx.recovery.available)}/month still available.` : "",
    topTask ? `Top priority task: "${topTask.title}" (${fmt(topTask.savings_monthly)}/mo).` : "",
    urgentDeadline ? `Urgent: "${urgentDeadline.title}" due in ${daysUntil(urgentDeadline.due_date)} days.` : "",
  ].filter(Boolean).join(" ");

  return `${langInstr}
Generate a brief, personalized welcome message for ${b.name} (${b.industry}, ${b.province}).
Context: ${contextBrief}

Rules:
- 2-4 sentences maximum
- Reference at least one specific number from their situation
- End with one specific question or prompt to start the conversation
- Tier: ${ctx.tier}
- No generic greetings like "How can I help you today?" — be specific to their data
- Do not use markdown or bullet points`;
}

// ── Quick reply suggestions prompt ───────────────────────────────────────────
export function buildQuickRepliesPrompt(ctx: BusinessContext, lang: "en" | "fr"): string {
  const b = ctx.business;
  const topTask = ctx.open_tasks[0];
  const topFinding = ctx.latest_report?.top_findings[0];
  const urgentDeadline = ctx.upcoming_deadlines[0];

  const contextSummary = [
    topTask ? `Top open task: "${topTask.title}" (${fmt(topTask.savings_monthly)}/mo)` : "",
    topFinding ? `Top finding: "${topFinding.title}" (${topFinding.category})` : "",
    urgentDeadline ? `Next obligation: "${urgentDeadline.title}"` : "",
    `Province: ${b.province}, Industry: ${b.industry}`,
  ].filter(Boolean).join(". ");

  const langInstr = lang === "fr"
    ? "Generate the questions in French (Quebec French, 'vous')."
    : "Generate the questions in English.";

  return `${langInstr}
Generate exactly 3 short, specific questions a business owner would ask their financial advisor given this context:
${contextSummary}

Rules:
- Each question max 8 words
- Must reference their specific situation (not generic)
- One question per line, no numbering, no bullets
- Questions should be diverse: one tactical, one strategic, one compliance/tax
- Output ONLY the 3 questions, nothing else`;
}
