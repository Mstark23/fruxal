// =============================================================================
// lib/stats/condition-engine.ts
// Management by Statistics — Condition Engine
// Assigns a condition (Power → Non-Existence) based on trend direction,
// plus a prescribed formula (action plan) for each condition.
// =============================================================================

export type Condition = "power" | "affluence" | "normal" | "emergency" | "danger" | "non_existence";

export interface StatPoint {
  period: string; // "2026-W14", "2026-03", etc.
  value: number;
}

export interface StatCondition {
  condition: Condition;
  label: string;
  color: string;
  bg: string;
  formula: string; // Prescribed action for this condition
  trend: "up" | "flat" | "down" | "none";
  delta: number; // % change
  deltaLabel: string;
}

export interface StatDefinition {
  key: string;
  label: string;
  unit: "number" | "currency" | "percent" | "days";
  higherIsBetter: boolean; // false for things like "days to close" or "leak exposure"
  formulas: Record<Condition, string>;
}

// ── Condition assignment logic ────────────────────────────────────────────────

export function evaluateCondition(
  points: StatPoint[],
  higherIsBetter: boolean = true
): { condition: Condition; trend: "up" | "flat" | "down" | "none"; delta: number } {
  if (points.length === 0) return { condition: "non_existence", trend: "none", delta: 0 };

  const values = points.map(p => p.value);
  const current = values[values.length - 1];

  // Non-existence: current value is 0 or no data
  if (current === 0 && values.every(v => v === 0)) {
    return { condition: "non_existence", trend: "none", delta: 0 };
  }

  // Need at least 3 data points for trend analysis
  if (points.length < 3) {
    if (current > 0) return { condition: "normal", trend: "flat", delta: 0 };
    return { condition: "non_existence", trend: "none", delta: 0 };
  }

  // Calculate trend using last 3-5 periods
  const recentCount = Math.min(5, points.length);
  const recent = values.slice(-recentCount);
  const older = recent.slice(0, Math.floor(recentCount / 2));
  const newer = recent.slice(Math.floor(recentCount / 2));
  const olderAvg = older.reduce((s, v) => s + v, 0) / older.length;
  const newerAvg = newer.reduce((s, v) => s + v, 0) / newer.length;

  const delta = olderAvg > 0 ? ((newerAvg - olderAvg) / olderAvg) * 100 : newerAvg > 0 ? 100 : 0;
  const absDelta = Math.abs(delta);

  // Determine raw trend
  let rawTrend: "up" | "flat" | "down" = absDelta < 5 ? "flat" : delta > 0 ? "up" : "down";

  // If lower is better (e.g., leak exposure, days to close), invert the meaning
  const effectiveTrend = higherIsBetter ? rawTrend : (rawTrend === "up" ? "down" : rawTrend === "down" ? "up" : "flat");

  // Check for new highs/lows
  const allTimeHigh = Math.max(...values);
  const allTimeLow = Math.min(...values.filter(v => v > 0));
  const isNewHigh = higherIsBetter && current >= allTimeHigh && current > 0;
  const isNewLow = !higherIsBetter && current <= allTimeLow && current > 0;

  // Consecutive trend detection
  const lastThree = values.slice(-3);
  const consecutiveUp = lastThree.length >= 3 && lastThree[2] > lastThree[1] && lastThree[1] > lastThree[0];
  const consecutiveDown = lastThree.length >= 3 && lastThree[2] < lastThree[1] && lastThree[1] < lastThree[0];

  // Assign condition
  let condition: Condition;

  if (isNewHigh || isNewLow) {
    // Power: stat in a new high range (or new low if lower is better)
    condition = "power";
  } else if (effectiveTrend === "up" && (absDelta >= 10 || consecutiveUp)) {
    // Affluence: clearly trending in the right direction
    condition = "affluence";
  } else if (effectiveTrend === "flat" || absDelta < 10) {
    // Normal: stable, not moving much
    condition = "normal";
  } else if (effectiveTrend === "down" && absDelta < 25) {
    // Emergency: trending wrong direction
    condition = "emergency";
  } else {
    // Danger: sustained decline or steep drop
    condition = "danger";
  }

  return { condition, trend: rawTrend, delta: Math.round(delta * 10) / 10 };
}

// ── Format condition into display object ─────────────────────────────────────

const CONDITION_META: Record<Condition, { label: string; color: string; bg: string }> = {
  power:         { label: "Power",          color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  affluence:     { label: "Affluence",      color: "#2D7A50", bg: "rgba(45,122,80,0.08)" },
  normal:        { label: "Normal",         color: "#0369a1", bg: "rgba(3,105,161,0.08)" },
  emergency:     { label: "Emergency",      color: "#C4841D", bg: "rgba(196,132,29,0.08)" },
  danger:        { label: "Danger",         color: "#B34040", bg: "rgba(179,64,64,0.08)" },
  non_existence: { label: "Non-Existence",  color: "#8E8C85", bg: "rgba(142,140,133,0.08)" },
};

export function getStatCondition(
  points: StatPoint[],
  def: StatDefinition
): StatCondition {
  const { condition, trend, delta } = evaluateCondition(points, def.higherIsBetter);
  const meta = CONDITION_META[condition];
  const deltaLabel = delta === 0 ? "No change"
    : `${delta > 0 ? "+" : ""}${delta}% ${trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}`;

  return {
    condition,
    label: meta.label,
    color: meta.color,
    bg: meta.bg,
    formula: def.formulas[condition],
    trend,
    delta,
    deltaLabel,
  };
}

// ── Format stat values ───────────────────────────────────────────────────────

export function formatStatValue(value: number, unit: StatDefinition["unit"]): string {
  switch (unit) {
    case "currency":
      return value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1)}M`
        : value >= 1_000 ? `$${Math.round(value / 1_000)}K`
        : `$${value.toLocaleString()}`;
    case "percent": return `${Math.round(value)}%`;
    case "days": return `${Math.round(value)}d`;
    default: return value.toLocaleString();
  }
}

// ── Common stat definitions ──────────────────────────────────────────────────

export const CUSTOMER_STATS: StatDefinition[] = [
  {
    key: "health_score", label: "Health Score", unit: "number", higherIsBetter: true,
    formulas: {
      power: "Maintain what you're doing. Document your processes so they can be replicated.",
      affluence: "Don't change anything. Reinforce the actions that drove improvement.",
      normal: "Push for the next diagnostic. Look for one new area to optimize.",
      emergency: "Review overdue obligations immediately. Fix the highest-impact leak this week.",
      danger: "Book a call with your rep today. Focus on the top 3 critical findings only.",
      non_existence: "Run your first diagnostic to establish a baseline score.",
    },
  },
  {
    key: "leak_exposure", label: "Leak Exposure", unit: "currency", higherIsBetter: false,
    formulas: {
      power: "Lowest leak exposure ever. Maintain current vendor contracts and compliance.",
      affluence: "Leaks are declining. Keep working with your rep on the remaining findings.",
      normal: "Leak exposure is stable. Review if any new leaks have appeared this month.",
      emergency: "Leaks increasing. Check if a vendor contract changed or a new compliance gap opened.",
      danger: "Significant leak growth. Schedule an urgent rep call to re-prioritize recovery.",
      non_existence: "No leak data. Run a diagnostic to identify money leaving your business.",
    },
  },
  {
    key: "recovery_monthly", label: "Monthly Recovery", unit: "currency", higherIsBetter: true,
    formulas: {
      power: "Record recovery month. Ask your rep to document what worked for future reference.",
      affluence: "Recovery accelerating. Stay responsive to rep document requests to keep momentum.",
      normal: "Steady recovery pace. Check if there are findings your rep is waiting on you for.",
      emergency: "Recovery slowing. Are there pending documents or approvals blocking your rep?",
      danger: "Recovery stalled. Book a check-in with your rep to unblock the pipeline.",
      non_existence: "No recoveries yet. Your rep is working your file — respond to document requests.",
    },
  },
  {
    key: "compliance_rate", label: "Compliance Rate", unit: "percent", higherIsBetter: true,
    formulas: {
      power: "100% compliant. Set calendar reminders to maintain this standard.",
      affluence: "Compliance improving. Keep clearing obligations as they come due.",
      normal: "Compliance stable. Check for any obligations due in the next 14 days.",
      emergency: "Compliance slipping. You have overdue items — address them this week.",
      danger: "Multiple overdue obligations. Risk of penalties. Prioritize by penalty amount.",
      non_existence: "No obligations tracked. Complete onboarding to sync your compliance calendar.",
    },
  },
  {
    key: "engagement_streak", label: "Platform Engagement", unit: "days", higherIsBetter: true,
    formulas: {
      power: "Longest streak ever. Your consistency is directly improving your score.",
      affluence: "Great engagement streak. Keep logging in to maintain momentum.",
      normal: "Moderate activity. Try checking in 3x/week to catch deadline alerts.",
      emergency: "Activity dropping. Set a recurring reminder to check Fruxal weekly.",
      danger: "Platform abandoned. Your leaks are still costing you — log in to see what's changed.",
      non_existence: "No activity recorded. Start by reviewing your dashboard.",
    },
  },
];

export const REP_STATS: StatDefinition[] = [
  {
    key: "calls_made", label: "Calls Made", unit: "number", higherIsBetter: true,
    formulas: {
      power: "Record call volume. Focus on quality — prep every call with the briefing tool.",
      affluence: "Call volume increasing. Maintain your cadence and watch close rates.",
      normal: "Steady call volume. Look for pipeline clients you haven't contacted this week.",
      emergency: "Call volume declining. Block 2 hours daily for outreach — no exceptions.",
      danger: "Calls critically low. Your pipeline will dry up in 2 weeks at this pace.",
      non_existence: "No calls logged. Start with your overdue follow-ups today.",
    },
  },
  {
    key: "close_rate", label: "Close Rate", unit: "percent", higherIsBetter: true,
    formulas: {
      power: "Best close rate ever. Document what's working — share it with the team.",
      affluence: "Close rate improving. Keep using the industry-specific scripts.",
      normal: "Average close rate. Run 3 drill sessions this week to sharpen objection handling.",
      emergency: "Close rate dropping. Review your last 5 debriefs — find the pattern.",
      danger: "Close rate critical. Book a coaching session and review your post-call AI feedback.",
      non_existence: "No closes yet. Focus on booking more review calls — that's where closes happen.",
    },
  },
  {
    key: "pipeline_value", label: "Pipeline Value", unit: "currency", higherIsBetter: true,
    formulas: {
      power: "Largest pipeline ever. Prioritize by close probability and deal size.",
      affluence: "Pipeline growing. Focus on moving stalled deals to next stage.",
      normal: "Pipeline stable. Add 3 new leads this week to prevent future gaps.",
      emergency: "Pipeline shrinking. Increase outreach volume — your future revenue depends on it.",
      danger: "Pipeline dangerously low. All-hands on prospecting. Use cold outreach scripts.",
      non_existence: "Empty pipeline. Start with the assigned leads in your dashboard.",
    },
  },
  {
    key: "recovery_confirmed", label: "Recovery Confirmed", unit: "currency", higherIsBetter: true,
    formulas: {
      power: "Record confirmations. You're proving the model — ask for referrals.",
      affluence: "Confirmations accelerating. Push to close remaining open findings.",
      normal: "Steady recoveries. Follow up on pending accountant verifications.",
      emergency: "Confirmations slowing. Check if accountants have bottlenecks.",
      danger: "Confirmations stalled. Escalate stuck findings to admin.",
      non_existence: "No confirmations yet. Focus on getting your first engagement signed.",
    },
  },
  {
    key: "avg_days_to_close", label: "Avg Days to Close", unit: "days", higherIsBetter: false,
    formulas: {
      power: "Fastest closes ever. Share your approach with the team.",
      affluence: "Closing faster. Your follow-up cadence is working — don't change it.",
      normal: "Average close timeline. Look for deals that can be accelerated with urgency.",
      emergency: "Closing slower. Tighten follow-up intervals — 2-day max between touches.",
      danger: "Close time critically long. Qualify harder upfront to avoid slow deals.",
      non_existence: "No closes to measure. Focus on getting your first deal signed.",
    },
  },
];

export const ADMIN_STATS: StatDefinition[] = [
  {
    key: "new_signups", label: "New Signups", unit: "number", higherIsBetter: true,
    formulas: {
      power: "Record signups. Scale what's working — increase ad spend or content.",
      affluence: "Signups growing. Focus on activation — are they running diagnostics?",
      normal: "Steady signups. Test new acquisition channels.",
      emergency: "Signups declining. Check landing page conversion, ad performance, and SEO rankings.",
      danger: "Signups critically low. Emergency marketing review needed.",
      non_existence: "No signups this period. Check if the registration flow is broken.",
    },
  },
  {
    key: "diagnostic_conversion", label: "Prescan → Diagnostic", unit: "percent", higherIsBetter: true,
    formulas: {
      power: "Best conversion ever. The onboarding flow is optimized — don't touch it.",
      affluence: "Conversion improving. Monitor which industries convert best.",
      normal: "Average conversion. A/B test the post-prescan CTA and email drip.",
      emergency: "Conversion dropping. Check the intake form for friction or errors.",
      danger: "Conversion critically low. Review the prescan-to-diagnostic funnel step by step.",
      non_existence: "No conversions measured. Ensure prescan results link to diagnostic intake.",
    },
  },
  {
    key: "total_recovered", label: "Total Recovered", unit: "currency", higherIsBetter: true,
    formulas: {
      power: "Record recovery. This is the number that proves the model — publicize it.",
      affluence: "Recovery growing. Ensure rep capacity matches demand.",
      normal: "Steady recovery. Look for bottlenecks in the accountant verification queue.",
      emergency: "Recovery declining. Check rep pipeline health and accountant throughput.",
      danger: "Recovery stalled. Executive review needed — is rep quality the issue?",
      non_existence: "No recovery yet. Focus on getting the first engagement to confirmation.",
    },
  },
  {
    key: "active_engagements", label: "Active Engagements", unit: "number", higherIsBetter: true,
    formulas: {
      power: "Most active engagements ever. Ensure delivery quality doesn't drop.",
      affluence: "Engagements growing. Hire/train more accountants if queue is backing up.",
      normal: "Stable engagement count. Focus on converting pipeline to signed.",
      emergency: "Engagements declining. Check if close rate or retention is the issue.",
      danger: "Very few active engagements. Revenue at risk — prioritize sales.",
      non_existence: "No active engagements. The entire pipeline needs attention.",
    },
  },
  {
    key: "revenue", label: "Revenue (Fees)", unit: "currency", higherIsBetter: true,
    formulas: {
      power: "Record revenue. Reinvest in growth — more reps, more marketing.",
      affluence: "Revenue trending up. Maintain recovery velocity.",
      normal: "Revenue stable. Look for ways to increase average deal size.",
      emergency: "Revenue declining. Check if recovery confirmations are slowing.",
      danger: "Revenue critically low. All-hands on recovery pipeline.",
      non_existence: "No revenue yet. Focus on getting first contingency fee collected.",
    },
  },
];

export const ACCOUNTANT_STATS: StatDefinition[] = [
  {
    key: "findings_processed", label: "Findings Processed", unit: "number", higherIsBetter: true,
    formulas: {
      power: "Record throughput. You're the top performer — maintain this pace.",
      affluence: "Processing speed increasing. Keep batch-reviewing similar findings.",
      normal: "Average processing rate. Look for quick wins to clear first.",
      emergency: "Processing slowing. Are you blocked on client documents?",
      danger: "Queue backing up. Prioritize critical severity findings first.",
      non_existence: "No findings processed. Check your queue for new assignments.",
    },
  },
  {
    key: "avg_confirm_time", label: "Avg Time to Confirm", unit: "days", higherIsBetter: false,
    formulas: {
      power: "Fastest confirmation times. Your efficiency is driving client satisfaction.",
      affluence: "Getting faster. Batch similar findings to keep accelerating.",
      normal: "Average confirmation time. Look for bottlenecks in document requests.",
      emergency: "Confirmation times increasing. Request documents earlier in the process.",
      danger: "Clients waiting too long. Escalate missing documents to rep.",
      non_existence: "No confirmations yet. Start with the highest-value finding in your queue.",
    },
  },
  {
    key: "confirmed_value", label: "Confirmed Value", unit: "currency", higherIsBetter: true,
    formulas: {
      power: "Record confirmed value. Your work is directly driving platform revenue.",
      affluence: "Confirmed value growing. Focus on the highest-value findings next.",
      normal: "Steady confirmation value. Look for overlooked findings in your queue.",
      emergency: "Confirmed value declining. Are you working lower-value findings?",
      danger: "Value dropping significantly. Reprioritize queue by dollar impact.",
      non_existence: "No value confirmed yet. Review your queue and start with quick wins.",
    },
  },
  {
    key: "queue_depth", label: "Queue Depth", unit: "number", higherIsBetter: false,
    formulas: {
      power: "Queue at lowest — you're fully caught up. Ask admin for more assignments.",
      affluence: "Queue shrinking. Great pace — keep clearing.",
      normal: "Queue at manageable level. Process 2-3 per day to stay on track.",
      emergency: "Queue growing. Request document batches to unblock multiple findings.",
      danger: "Queue overflowing. Flag to admin — you may need workload redistribution.",
      non_existence: "Queue empty. Request new assignments from admin.",
    },
  },
  {
    key: "docs_pending", label: "Documents Pending", unit: "number", higherIsBetter: false,
    formulas: {
      power: "No pending documents. All clients have responded — rare achievement.",
      affluence: "Fewer pending docs. Your follow-up cadence is working.",
      normal: "Average pending docs. Send reminders for anything older than 5 days.",
      emergency: "Many pending docs. Contact clients directly — don't wait for email.",
      danger: "Critical document backlog. Escalate to rep for client follow-up.",
      non_existence: "No documents requested yet. Check if your findings need supporting docs.",
    },
  },
];
