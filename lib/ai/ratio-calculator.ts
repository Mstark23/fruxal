// =============================================================================
// lib/ai/ratio-calculator.ts
// Pure financial ratio calculations — zero dependencies, zero API calls.
// All inputs in monthly CAD figures unless noted.
// Returns null (never NaN/Infinity) for any ratio with insufficient data.
// =============================================================================

export interface RatioInputs {
  // Income statement (monthly)
  revenue:             number;
  cogs:                number;
  operatingExpenses:   number;
  ebitda:              number;
  interestExpense:     number;
  netProfit:           number;
  debtServiceMonthly:  number;

  // Balance sheet (point in time)
  cashAndEquivalents:      number;
  accountsReceivable:      number;
  inventory:               number;
  totalCurrentAssets:      number;
  totalAssets:             number;
  accountsPayable:         number;
  totalCurrentLiabilities: number;
  totalDebt:               number;
  totalEquity:             number;
}

export interface CalculatedRatios {
  // Liquidity
  currentRatio:       number | null;
  quickRatio:         number | null;
  cashRatio:          number | null;

  // Profitability
  grossMarginPct:        number | null;
  ebitdaMarginPct:       number | null;
  netProfitMarginPct:    number | null;
  returnOnAssetsPct:     number | null;

  // Efficiency
  assetTurnover:  number | null;
  dsoDays:        number | null;
  dpoDays:        number | null;
  inventoryDays:  number | null;

  // Leverage
  debtToEquity:      number | null;
  dscr:              number | null;
  interestCoverage:  number | null;
}

export interface RatioGrades {
  liquidity:      "A" | "B" | "C" | "D" | "F";
  profitability:  "A" | "B" | "C" | "D" | "F";
  efficiency:     "A" | "B" | "C" | "D" | "F";
  leverage:       "A" | "B" | "C" | "D" | "F";
  overall:        "A" | "B" | "C" | "D" | "F";
  overallScore:   number; // 0–100
}

export interface RatioBenchmark {
  good:    { min: number; max: number };
  warning: { min: number; max: number };
  danger:  { min: number; max: number };
  bankRequirement?: number;
  description: string;
  higherIsBetter: boolean;
  unit?: "x" | "%" | "days" | "";
}

// ── Safe division ─────────────────────────────────────────────────────────────
function sdiv(a: number | undefined | null, b: number | undefined | null, decimals = 2): number | null {
  if (a == null || b == null || b === 0) return null;
  const result = a / b;
  if (!isFinite(result)) return null;
  return Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// ── Core calculations ─────────────────────────────────────────────────────────
export function calculateAllRatios(inputs: Partial<RatioInputs>): CalculatedRatios {
  const i = inputs;
  const rev   = i.revenue;
  const cogs  = i.cogs;
  const ebit  = i.ebitda;
  const np    = i.netProfit;

  // ── Liquidity
  const currentRatio = sdiv(i.totalCurrentAssets, i.totalCurrentLiabilities);
  const quickRatio   = (i.totalCurrentAssets != null && i.inventory != null && i.totalCurrentLiabilities != null)
    ? sdiv(i.totalCurrentAssets - (i.inventory ?? 0), i.totalCurrentLiabilities) : null;
  const cashRatio    = sdiv(i.cashAndEquivalents, i.totalCurrentLiabilities);

  // ── Profitability
  const grossMarginPct     = (rev && cogs != null)  ? sdiv((rev - cogs) * 100, rev) : null;
  const ebitdaMarginPct    = (rev && ebit != null)  ? sdiv(ebit * 100, rev) : null;
  const netProfitMarginPct = (rev && np != null)    ? sdiv(np * 100, rev) : null;
  // Annualise netProfit (monthly × 12) for ROA
  const returnOnAssetsPct  = (np != null && i.totalAssets) ? sdiv((np * 12) * 100, i.totalAssets) : null;

  // ── Efficiency
  // Annualise revenue for asset turnover
  const assetTurnover  = (rev && i.totalAssets) ? sdiv(rev * 12, i.totalAssets) : null;
  const dsoDays        = (rev && i.accountsReceivable != null) ? sdiv(i.accountsReceivable * 30, rev) : null;
  const dpoDays        = (cogs && cogs > 0 && i.accountsPayable != null) ? sdiv(i.accountsPayable * 30, cogs) : null;
  const inventoryDays  = (cogs && cogs > 0 && i.inventory != null) ? sdiv(i.inventory * 30, cogs) : null;

  // ── Leverage
  const debtToEquity = sdiv(i.totalDebt, i.totalEquity);
  // DSCR = annual EBITDA / annual debt service — standard banker formula
  const dscr = (ebit != null && i.debtServiceMonthly && i.debtServiceMonthly > 0)
    ? sdiv(ebit * 12, i.debtServiceMonthly * 12) : null;
  const interestCoverage = (ebit != null && i.interestExpense && i.interestExpense > 0)
    ? sdiv(ebit * 12, i.interestExpense * 12) : null;

  return {
    currentRatio, quickRatio, cashRatio,
    grossMarginPct, ebitdaMarginPct, netProfitMarginPct, returnOnAssetsPct,
    assetTurnover, dsoDays, dpoDays, inventoryDays,
    debtToEquity, dscr, interestCoverage,
  };
}

// ── Benchmarks ────────────────────────────────────────────────────────────────
// grossMargin benchmarks are industry-sensitive — use getGrossMarginBenchmark()
export const RATIO_BENCHMARKS: Record<keyof CalculatedRatios, RatioBenchmark> = {
  currentRatio: {
    good:    { min: 1.5, max: 999 }, warning: { min: 1.0, max: 1.5 }, danger: { min: 0, max: 1.0 },
    bankRequirement: 1.2,
    description: "For every $1 you owe short-term, how much do you have to cover it",
    higherIsBetter: true, unit: "x",
  },
  quickRatio: {
    good:    { min: 1.0, max: 999 }, warning: { min: 0.7, max: 1.0 }, danger: { min: 0, max: 0.7 },
    description: "Like current ratio, but excludes inventory — your most liquid coverage",
    higherIsBetter: true, unit: "x",
  },
  cashRatio: {
    good:    { min: 0.5, max: 999 }, warning: { min: 0.2, max: 0.5 }, danger: { min: 0, max: 0.2 },
    description: "Your cash on hand vs short-term obligations — the strictest liquidity test",
    higherIsBetter: true, unit: "x",
  },
  grossMarginPct: {
    good:    { min: 55, max: 100 }, warning: { min: 35, max: 55 }, danger: { min: 0, max: 35 },
    description: "Of every $100 you make, how much is left after direct costs",
    higherIsBetter: true, unit: "%",
  },
  ebitdaMarginPct: {
    good:    { min: 20, max: 100 }, warning: { min: 10, max: 20 }, danger: { min: 0, max: 10 },
    description: "Earnings before interest, taxes, depreciation — the core operating profit %",
    higherIsBetter: true, unit: "%",
  },
  netProfitMarginPct: {
    good:    { min: 10, max: 100 }, warning: { min: 5, max: 10 }, danger: { min: 0, max: 5 },
    description: "What % of revenue becomes actual profit after all costs",
    higherIsBetter: true, unit: "%",
  },
  returnOnAssetsPct: {
    good:    { min: 10, max: 999 }, warning: { min: 5, max: 10 }, danger: { min: 0, max: 5 },
    description: "How efficiently your assets are generating profit (annualized)",
    higherIsBetter: true, unit: "%",
  },
  assetTurnover: {
    good:    { min: 1.5, max: 999 }, warning: { min: 0.8, max: 1.5 }, danger: { min: 0, max: 0.8 },
    description: "How many dollars of revenue each dollar of assets generates (annualized)",
    higherIsBetter: true, unit: "x",
  },
  dsoDays: {
    good:    { min: 0, max: 30 }, warning: { min: 30, max: 45 }, danger: { min: 45, max: 9999 },
    description: "How many days on average to collect payment — lower means faster cash collection",
    higherIsBetter: false, unit: "days",
  },
  dpoDays: {
    good:    { min: 20, max: 45 }, warning: { min: 10, max: 20 }, danger: { min: 0, max: 10 },
    description: "How long you take to pay suppliers — higher means more cash float retained",
    higherIsBetter: true, unit: "days",
  },
  inventoryDays: {
    good:    { min: 0, max: 30 }, warning: { min: 30, max: 60 }, danger: { min: 60, max: 9999 },
    description: "How many days of inventory you hold — lower means faster turnover",
    higherIsBetter: false, unit: "days",
  },
  debtToEquity: {
    good:    { min: 0, max: 1.0 }, warning: { min: 1.0, max: 2.0 }, danger: { min: 2.0, max: 9999 },
    description: "How much of your business is financed by debt vs your own equity",
    higherIsBetter: false, unit: "x",
  },
  dscr: {
    good:    { min: 1.5, max: 999 }, warning: { min: 1.25, max: 1.5 }, danger: { min: 0, max: 1.25 },
    bankRequirement: 1.25,
    description: "Can your earnings cover your debt payments — and by how much. Banks require >1.25x",
    higherIsBetter: true, unit: "x",
  },
  interestCoverage: {
    good:    { min: 5, max: 999 }, warning: { min: 2, max: 5 }, danger: { min: 0, max: 2 },
    bankRequirement: 2.0,
    description: "How many times your operating profit covers your interest payments",
    higherIsBetter: true, unit: "x",
  },
};

// Industry-specific gross margin benchmarks
export function getGrossMarginBenchmark(industrySlug: string): RatioBenchmark {
  const INDUSTRY_MARGINS: Record<string, { good: number; warning: number }> = {
    professional_services: { good: 55, warning: 35 },
    consulting:            { good: 55, warning: 35 },
    technology:            { good: 60, warning: 40 },
    healthcare:            { good: 45, warning: 30 },
    restaurant:            { good: 35, warning: 20 },
    retail:                { good: 30, warning: 18 },
    construction:          { good: 20, warning: 12 },
    manufacturing:         { good: 30, warning: 18 },
    real_estate:           { good: 40, warning: 25 },
    trucking:              { good: 25, warning: 15 },
  };
  const margins = INDUSTRY_MARGINS[industrySlug] ?? { good: 55, warning: 35 };
  return {
    good:    { min: margins.good, max: 100 },
    warning: { min: margins.warning, max: margins.good },
    danger:  { min: 0, max: margins.warning },
    description: "Of every $100 you make, how much is left after direct costs",
    higherIsBetter: true, unit: "%",
  };
}

// ── Ratio status ──────────────────────────────────────────────────────────────
export function getRatioStatus(
  value: number,
  benchmark: RatioBenchmark
): "good" | "warning" | "danger" {
  if (benchmark.higherIsBetter) {
    if (value >= benchmark.good.min)    return "good";
    if (value >= benchmark.warning.min) return "warning";
    return "danger";
  } else {
    // Lower is better (e.g. DSO days, debt-to-equity)
    if (value <= benchmark.good.max)    return "good";
    if (value <= benchmark.warning.max) return "warning";
    return "danger";
  }
}

// ── Grading ───────────────────────────────────────────────────────────────────
// Score each ratio 0-100, weight by importance, return letter grades
function scoreRatio(value: number | null, benchmark: RatioBenchmark): number {
  if (value === null) return 50; // neutral when unknown
  const status = getRatioStatus(value, benchmark);
  if (status === "good")    return 90;
  if (status === "warning") return 65;
  return 30;
}

function toGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 88) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

export function getRatioGrades(ratios: CalculatedRatios, industrySlug = "generic"): RatioGrades {
  const gm = getGrossMarginBenchmark(industrySlug);
  const bm = { ...RATIO_BENCHMARKS, grossMarginPct: gm };

  const liquidityScore = Math.round(
    scoreRatio(ratios.currentRatio, bm.currentRatio) * 0.5 +
    scoreRatio(ratios.quickRatio,   bm.quickRatio)   * 0.3 +
    scoreRatio(ratios.cashRatio,    bm.cashRatio)     * 0.2
  );

  const profitabilityScore = Math.round(
    scoreRatio(ratios.grossMarginPct,     bm.grossMarginPct)     * 0.35 +
    scoreRatio(ratios.ebitdaMarginPct,    bm.ebitdaMarginPct)    * 0.35 +
    scoreRatio(ratios.netProfitMarginPct, bm.netProfitMarginPct) * 0.2  +
    scoreRatio(ratios.returnOnAssetsPct,  bm.returnOnAssetsPct)  * 0.1
  );

  const efficiencyScore = Math.round(
    scoreRatio(ratios.dsoDays,       bm.dsoDays)       * 0.4 +
    scoreRatio(ratios.dpoDays,       bm.dpoDays)       * 0.3 +
    scoreRatio(ratios.assetTurnover, bm.assetTurnover) * 0.2 +
    scoreRatio(ratios.inventoryDays, bm.inventoryDays) * 0.1
  );

  const leverageScore = Math.round(
    scoreRatio(ratios.dscr,             bm.dscr)             * 0.5 +
    scoreRatio(ratios.debtToEquity,     bm.debtToEquity)     * 0.3 +
    scoreRatio(ratios.interestCoverage, bm.interestCoverage) * 0.2
  );

  const overallScore = Math.round(
    liquidityScore     * 0.25 +
    profitabilityScore * 0.35 +
    efficiencyScore    * 0.2  +
    leverageScore      * 0.2
  );

  return {
    liquidity:     toGrade(liquidityScore),
    profitability: toGrade(profitabilityScore),
    efficiency:    toGrade(efficiencyScore),
    leverage:      toGrade(leverageScore),
    overall:       toGrade(overallScore),
    overallScore,
  };
}

// ── Data completeness score ───────────────────────────────────────────────────
// 15 key inputs — each non-zero/non-null contributes to completeness %
export function calculateDataCompleteness(inputs: Partial<RatioInputs>): number {
  const KEY_FIELDS: (keyof RatioInputs)[] = [
    "revenue", "cogs", "operatingExpenses", "ebitda", "netProfit",
    "debtServiceMonthly", "cashAndEquivalents", "accountsReceivable",
    "inventory", "totalCurrentAssets", "totalAssets",
    "accountsPayable", "totalCurrentLiabilities", "totalDebt", "totalEquity",
  ];
  const available = KEY_FIELDS.filter(f => inputs[f] != null && inputs[f] !== 0).length;
  return Math.round((available / KEY_FIELDS.length) * 100);
}

// ── Trend calculation ─────────────────────────────────────────────────────────
export function calculateTrend(
  current: number | null,
  previous: number | null,
  benchmark: RatioBenchmark
): "improving" | "stable" | "declining" {
  if (current === null || previous === null) return "stable";
  const delta = current - previous;
  const pctChange = Math.abs(previous) > 0 ? Math.abs(delta / previous) : 0;
  if (pctChange < 0.03) return "stable"; // < 3% change = stable
  const improving = benchmark.higherIsBetter ? delta > 0 : delta < 0;
  return improving ? "improving" : "declining";
}

// ── Self-test ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const r = calculateAllRatios({
    totalCurrentAssets: 100, totalCurrentLiabilities: 50,
    revenue: 50000, cogs: 20000, ebitda: 15000, debtServiceMonthly: 3000,
    accountsReceivable: 30000, accountsPayable: 10000,
  });
  console.assert(r.currentRatio === 2, `currentRatio: expected 2, got ${r.currentRatio}`);
  console.assert(r.grossMarginPct === 60, `grossMargin: expected 60, got ${r.grossMarginPct}`);
  console.assert(r.dscr !== null && Math.abs((r.dscr ?? 0) - 4.17) < 0.05, `dscr: expected ~4.17, got ${r.dscr}`);
  console.assert(r.dsoDays !== null && Math.abs((r.dsoDays ?? 0) - 18) < 0.5, `dsoDays: expected 18, got ${r.dsoDays}`);
  const c = calculateDataCompleteness({ revenue: 50000, cogs: 20000 });
  console.assert(c === 13, `completeness: expected 13, got ${c}`);
}
