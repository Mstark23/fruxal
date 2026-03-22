// =============================================================================
// lib/ai/score-calculator.ts
// Pure calculation functions — no API calls, no Claude.
// All scoring rules defined as exported constants for UI display.
// Self-testing in dev via assertions at module load.
// =============================================================================

export interface ScoreInputs {
  baseDiagnosticScore: number;
  diagnosticDate:      Date;
  completedTasks: Array<{
    id:              string;
    savings_monthly: number;
    effort:          "easy" | "medium" | "hard";
    completed_at:    Date;
  }>;
  missedDeadlines: Array<{
    id:       string;
    category: string;
    due_date: Date;
  }>;
}

export interface ScoreBreakdownItem {
  type:   "task" | "deadline" | "decay";
  label:  string;
  points: number;   // positive = bonus, negative = penalty
}

export interface ScoreResult {
  finalScore:          number;
  baseDiagnosticScore: number;
  taskBonus:           number;
  deadlinePenalty:     number;
  decayPenalty:        number;
  delta:               number;   // finalScore - baseDiagnosticScore
  breakdown:           ScoreBreakdownItem[];
}

// ── Exported constants (for UI display) ──────────────────────────────────────

export const TASK_SAVINGS_TIERS: Array<{ maxMonthly: number; points: number; label: string }> = [
  { maxMonthly: 100,   points: 1, label: "Under $100/mo" },
  { maxMonthly: 300,   points: 2, label: "$100–$300/mo" },
  { maxMonthly: 600,   points: 3, label: "$300–$600/mo" },
  { maxMonthly: 1000,  points: 4, label: "$600–$1,000/mo" },
  { maxMonthly: Infinity, points: 5, label: "$1,000+/mo" },
];

export const EFFORT_MULTIPLIERS: Record<string, number> = {
  easy:   1.0,
  medium: 1.2,
  hard:   1.5,
};

export const TASK_BONUS_CAP = 25;

export const DEADLINE_PENALTIES: Record<string, number> = {
  tax:        5,
  cra:        5,
  payroll:    4,
  compliance: 3,
  general:    2,
};

export const DEADLINE_PENALTY_CAP = 20;

export const DECAY_SCHEDULE: Array<{ minDays: number; maxDays: number; penalty: number; label: string }> = [
  { minDays: 0,   maxDays: 30,  penalty: 0,  label: "No decay (within 30 days)" },
  { minDays: 31,  maxDays: 60,  penalty: 1,  label: "1 point (31–60 days)" },
  { minDays: 61,  maxDays: 90,  penalty: 3,  label: "3 points (61–90 days)" },
  { minDays: 91,  maxDays: 120, penalty: 6,  label: "6 points (91–120 days)" },
  { minDays: 121, maxDays: Infinity, penalty: 10, label: "10 points (120+ days)" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / 86400000);
}

function taskPoints(savings: number, effort: string): number {
  const tier = TASK_SAVINGS_TIERS.find(t => savings < t.maxMonthly) ?? TASK_SAVINGS_TIERS[TASK_SAVINGS_TIERS.length - 1];
  const base = tier.points;
  const mult = EFFORT_MULTIPLIERS[effort] ?? 1.0;
  return Math.round(base * mult);
}

function deadlinePenaltyFor(category: string): number {
  const key = category.toLowerCase();
  return DEADLINE_PENALTIES[key] ?? DEADLINE_PENALTIES.general;
}

function decayPenaltyFor(daysSince: number): number {
  const band = DECAY_SCHEDULE.find(d => daysSince >= d.minDays && daysSince <= d.maxDays);
  return band?.penalty ?? 10;
}

// ── Main calculation ──────────────────────────────────────────────────────────

export function calculateLiveScore(inputs: ScoreInputs): ScoreResult {
  const { baseDiagnosticScore, diagnosticDate, completedTasks, missedDeadlines } = inputs;
  const now = new Date();
  const daysSinceDiagnostic = daysBetween(diagnosticDate, now);
  const breakdown: ScoreBreakdownItem[] = [];

  // ── Task bonuses ──────────────────────────────────────────────────────────
  let rawTaskBonus = 0;
  for (const task of completedTasks) {
    const pts = taskPoints(task.savings_monthly ?? 0, task.effort ?? "easy");
    rawTaskBonus += pts;
    if (pts > 0) {
      breakdown.push({
        type:   "task",
        label:  `Fixed task (+$${(task.savings_monthly ?? 0).toLocaleString()}/mo, ${task.effort})`,
        points: pts,
      });
    }
  }
  const taskBonus = clamp(rawTaskBonus, 0, TASK_BONUS_CAP);

  // Cap-reduction breakdown item if capped
  if (rawTaskBonus > TASK_BONUS_CAP) {
    breakdown.push({
      type:   "task",
      label:  `Cap applied (max +${TASK_BONUS_CAP} pts)`,
      points: TASK_BONUS_CAP - rawTaskBonus,   // negative adjustment
    });
  }

  // ── Deadline penalties ────────────────────────────────────────────────────
  let rawDeadlinePenalty = 0;
  for (const dl of missedDeadlines) {
    const pts = deadlinePenaltyFor(dl.category);
    rawDeadlinePenalty += pts;
    breakdown.push({
      type:   "deadline",
      label:  `Missed ${dl.category} deadline`,
      points: -pts,
    });
  }
  const deadlinePenalty = clamp(rawDeadlinePenalty, 0, DEADLINE_PENALTY_CAP);

  // ── Decay penalty ─────────────────────────────────────────────────────────
  const decayPenalty = decayPenaltyFor(daysSinceDiagnostic);
  if (decayPenalty > 0) {
    breakdown.push({
      type:   "decay",
      label:  `Time elapsed (${daysSinceDiagnostic} days since diagnostic)`,
      points: -decayPenalty,
    });
  } else {
    breakdown.push({
      type:   "decay",
      label:  `Time elapsed (${daysSinceDiagnostic} days — no decay yet)`,
      points: 0,
    });
  }

  // ── Final score ───────────────────────────────────────────────────────────
  const raw = baseDiagnosticScore + taskBonus - deadlinePenalty - decayPenalty;
  const finalScore = clamp(Math.round(raw), 0, 100);
  const delta = finalScore - baseDiagnosticScore;

  return {
    finalScore,
    baseDiagnosticScore,
    taskBonus,
    deadlinePenalty,
    decayPenalty,
    delta,
    breakdown,
  };
}

// ── Delta label helper (for UI) ───────────────────────────────────────────────
export function scoreDeltaLabel(delta: number): string {
  if (delta === 0) return "";
  if (delta > 0) return `+${delta} from last scan`;
  return `${Math.abs(delta)} from last scan`;   // no minus sign — reads naturally
}

// ── needsRescan helper ────────────────────────────────────────────────────────
export function scoreNeedsRescan(diagnosticDate: Date | null): boolean {
  if (!diagnosticDate) return false;
  return daysBetween(diagnosticDate, new Date()) >= 90;
}

// ── Self-tests (dev only) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  // Test: $400/mo medium task → 3 pts × 1.2 = 3.6 → rounded to 4
  const pts = taskPoints(400, "medium");
  console.assert(pts === 4, `taskPoints(400,'medium'): expected 4, got ${pts}`);

  // Test: $400/mo hard task → 3 pts × 1.5 = 4.5 → rounded to 5
  const ptsHard = taskPoints(400, "hard");
  console.assert(ptsHard === 5, `taskPoints(400,'hard'): expected 5, got ${ptsHard}`);

  // Test: base 65, one $400/mo medium task, no missed deadlines, 0 days
  const result = calculateLiveScore({
    baseDiagnosticScore: 65,
    diagnosticDate: new Date(),
    completedTasks: [{ id: "t1", savings_monthly: 400, effort: "medium", completed_at: new Date() }],
    missedDeadlines: [],
  });
  console.assert(result.taskBonus === 4, `taskBonus: expected 4, got ${result.taskBonus}`);
  console.assert(result.finalScore === 69, `finalScore: expected 69, got ${result.finalScore}`);
  console.assert(result.delta === 4, `delta: expected 4, got ${result.delta}`);

  // Test: clamp at 100
  const capped = calculateLiveScore({
    baseDiagnosticScore: 95,
    diagnosticDate: new Date(),
    completedTasks: Array(10).fill({ id: "t", savings_monthly: 2000, effort: "hard", completed_at: new Date() }),
    missedDeadlines: [],
  });
  console.assert(capped.taskBonus === 25, `cap: expected 25, got ${capped.taskBonus}`);
  console.assert(capped.finalScore === 100, `capped: expected 100, got ${capped.finalScore}`);

  // Test: decay at 95 days → -6
  const aged = calculateLiveScore({
    baseDiagnosticScore: 65,
    diagnosticDate: new Date(Date.now() - 95 * 86400000),
    completedTasks: [],
    missedDeadlines: [],
  });
  console.assert(aged.decayPenalty === 6, `decay95: expected 6, got ${aged.decayPenalty}`);
  console.assert(aged.finalScore === 59, `decay95 final: expected 59, got ${aged.finalScore}`);
}
