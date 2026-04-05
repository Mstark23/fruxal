// =============================================================================
// lib/ai/break-even-calculator.ts
// Pure calculation functions — no Claude calls, no API calls, no side effects.
// Safe to run client-side for instant feedback.
// All inputs/outputs in monthly dollars unless noted.
// =============================================================================

export interface SafetyMargin {
  amount: number;       // monthly dollars above/below break-even
  percentage: number;   // as % of current revenue (negative = below)
}

export interface DecisionInput {
  type: "hire" | "lease" | "price_increase" | "lose_client" | "custom";
  fixedCostChange: number;    // monthly $ change to fixed costs (positive = cost increase)
  variablePctChange: number;  // percentage point change to variable cost %
  revenueChange: number;      // monthly $ change to revenue
  label: string;              // human-readable description
}

export interface ModelledScenario {
  newBreakEven: number;
  newRevenue: number;
  newSafetyMargin: SafetyMargin;
  breakEvenDelta: number;       // change in break-even amount
  revenueNeededForSafety: number; // revenue needed to restore original safety margin
  recommendation: string;       // filled by Claude narrative layer
}

export interface SeasonalMonth {
  month: string;
  revenue: number;
  aboveBreakEven: boolean;
  gap: number;        // positive = above, negative = below
  pctAbove: number;   // % above/below break-even
}

// ── Core break-even formula ───────────────────────────────────────────────────
// Break-even = Fixed costs / Contribution margin ratio
// Contribution margin ratio = 1 - (variable cost % / 100)
export function calculateBreakEven(
  fixedCosts: number,
  variableCostPct: number  // 0-100
): number {
  if (variableCostPct >= 100) return Infinity;
  if (variableCostPct < 0) return fixedCosts; // edge case
  const contributionMarginRatio = 1 - variableCostPct / 100;
  if (contributionMarginRatio <= 0) return Infinity;
  return Math.round(fixedCosts / contributionMarginRatio);
}

// ── Safety margin ─────────────────────────────────────────────────────────────
export function calculateSafetyMargin(
  currentRevenue: number,
  breakEvenRevenue: number
): SafetyMargin {
  const amount = currentRevenue - breakEvenRevenue;
  const percentage = currentRevenue > 0
    ? (amount / currentRevenue) * 100
    : amount > 0 ? 100 : -100;
  return {
    amount: Math.round(amount),
    percentage: Math.round(percentage * 10) / 10,
  };
}

// ── Decision modeller (instant, client-side) ──────────────────────────────────
export function modelDecision(
  currentFixed: number,
  currentVariablePct: number,
  currentRevenue: number,
  decision: DecisionInput
): ModelledScenario {
  const newFixed = Math.max(0, currentFixed + decision.fixedCostChange);
  const newVariablePct = Math.max(0, Math.min(99, currentVariablePct + decision.variablePctChange));
  const newRevenue = Math.max(0, currentRevenue + decision.revenueChange);

  const currentBreakEven = calculateBreakEven(currentFixed, currentVariablePct);
  const newBreakEven = calculateBreakEven(newFixed, newVariablePct);
  const newSafetyMargin = calculateSafetyMargin(newRevenue, newBreakEven);

  // How much revenue needed to match original safety margin %
  const originalSafetyPct = currentRevenue > 0
    ? ((currentRevenue - currentBreakEven) / currentRevenue) * 100
    : 0;
  const revenueNeededForSafety = originalSafetyPct >= 0
    ? Math.round(newBreakEven / (1 - originalSafetyPct / 100))
    : newRevenue;

  return {
    newBreakEven: Math.round(newBreakEven),
    newRevenue: Math.round(newRevenue),
    newSafetyMargin,
    breakEvenDelta: Math.round(newBreakEven - currentBreakEven),
    revenueNeededForSafety,
    recommendation: "", // filled server-side by Claude
  };
}

// ── Seasonal break-even calendar ──────────────────────────────────────────────
// seasonalPattern: { "Jan": -15, "Feb": -20, "Jul": +30 } (% deviation from avg)
export function calculateSeasonalBreakEven(
  breakEvenRevenue: number,
  currentRevenue: number,  // average monthly revenue
  seasonalPattern: Record<string, number>
): SeasonalMonth[] {
  return Object.entries(seasonalPattern).map(([month, pctDeviation]) => {
    const revenue = Math.round(currentRevenue * (1 + pctDeviation / 100));
    const gap = revenue - breakEvenRevenue;
    const pctAbove = breakEvenRevenue > 0
      ? Math.round((gap / breakEvenRevenue) * 100 * 10) / 10
      : 0;
    return {
      month,
      revenue,
      aboveBreakEven: revenue >= breakEvenRevenue,
      gap: Math.round(gap),
      pctAbove,
    };
  });
}

// ── Validation ────────────────────────────────────────────────────────────────
export function validateCostInputs(
  fixedCosts: number,
  variablePct: number,
  revenue: number
): { valid: boolean; error?: string } {
  if (fixedCosts < 0) return { valid: false, error: "Fixed costs cannot be negative." };
  if (variablePct < 0) return { valid: false, error: "Variable cost % cannot be negative." };
  if (variablePct >= 95) return {
    valid: false,
    error: "Variable costs above 95% make break-even calculation unreliable — please review your cost inputs.",
  };
  if (revenue < 0) return { valid: false, error: "Revenue cannot be negative." };
  if (fixedCosts === 0 && variablePct === 0) return { valid: false, error: "Enter at least one cost to calculate break-even." };
  return { valid: true };
}

// ── Safety margin status label ────────────────────────────────────────────────
export function safetyLabel(pct: number): "comfortable" | "thin" | "below" {
  if (pct >= 20) return "comfortable";
  if (pct >= 0) return "thin";
  return "below";
}

// ── Quick estimate from revenue (prescan teaser) ──────────────────────────────
// Without actual cost data, estimate break-even from industry typical margins
export function estimateBreakEvenFromRevenue(
  monthlyRevenue: number,
  industrySlug: string = "generic"
): { estimate: number; variablePctUsed: number; fixedEstimate: number } {
  // Industry-typical variable cost ratios (conservative estimates)
  const INDUSTRY_VARIABLE_PCT: Record<string, number> = {
    restaurant: 65, retail: 55, construction: 60, trucking: 60,
    professional_services: 25, healthcare: 40, technology: 30,
    manufacturing: 55, real_estate: 35, generic: 45,
  };

  const variablePct = INDUSTRY_VARIABLE_PCT[industrySlug] ?? INDUSTRY_VARIABLE_PCT.generic;
  // Estimate fixed costs as ~25% of revenue for generic businesses
  const fixedEstimate = Math.round(monthlyRevenue * 0.25);
  const estimate = calculateBreakEven(fixedEstimate, variablePct);

  return { estimate: Math.round(estimate), variablePctUsed: variablePct, fixedEstimate };
}

// ── Self-test (called at module load in dev) ──────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const be = calculateBreakEven(10000, 40);
  console.assert(Math.abs(be - 16667) < 1, `calculateBreakEven failed: expected ~16667, got ${be}`);
  const sm = calculateSafetyMargin(20000, 16667);
  console.assert(sm.amount === 3333, `calculateSafetyMargin amount failed`);
  console.assert(Math.abs(sm.percentage - 16.7) < 0.2, `calculateSafetyMargin pct failed`);
}
