// =============================================================================
// services/bhs-engine.ts — Stub
// Original file was removed during cleanup. These stubs satisfy the import
// in prescan-engine-v3.ts. Replace with full implementation if BHS scoring
// is needed beyond prescan.
// =============================================================================

export interface BHSDimension {
  score:   number;
  weight:  number;
  factors: string[];
}

export interface BHSResult {
  score:               number;
  grade:               string;
  band:                string;
  dhScore:             number;
  confidence:          number;
  leakImpactPct:       number;
  industryComparison:  string;
  dimensions:          {
    expenseEfficiency:  BHSDimension;
    revenueProtection:  BHSDimension;
    taxCompliance:      BHSDimension;
    operationalHealth:  BHSDimension;
    riskExposure:       BHSDimension;
  };
  explanation:         string;
}

export function calculateDataHealthScore(input: any): number {
  // Check actual PrescanInput field names (not the old generic names)
  const checks = [
    !!input?.annualRevenue,
    !!(input?.province && input.province !== 'QC'), // QC is default, not explicit
    !!(input?.industrySlug && input.industrySlug !== 'generic'),
    input?.employeeCount != null,
    !!(input?.paymentMix && input.paymentMix !== 'unknown'),
    !!(input?.mainCosts?.length > 0),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

/** Alias — prescan-engine-v3 imports both names */
export function calculateFinancialHealthScore(leaks: any[], revenue?: number): number {
  if (!leaks || leaks.length === 0) return 72; // No leaks found = decent but not perfect (data gap)
  const totalLeak = leaks.reduce((s, l) => s + ((l.estimated_annual_leak || l.annualImpact) ?? 0), 0);
  const rev = revenue || 100_000;
  // Score is relative to revenue — 5% leak = -15pts, 10% = -25pts, 20%+ = critical
  const leakPct = totalLeak / rev;
  const penalty = Math.min(60, Math.round(leakPct * 250)); // 20% leak = 50pt penalty
  const base = 78; // Start from 78 — no business is perfect
  return Math.max(20, Math.min(79, base - penalty));
}

export function scoreLeakV2(leak: any, input: any, benchmarks?: any, dataPoints?: any): any {
  const base = leak?.annual_impact_max ?? leak?.annualImpact ?? leak?.amount ?? 0;
  const dhScore = calculateDataHealthScore(input);

  // Data richness — how many data points were actually collected
  const points = typeof dataPoints === "number" ? dataPoints : 3;
  const dataFactor = Math.min(1, points / 6); // 6 points = full confidence

  // Leak-specific base confidence (from original detector logic)
  const baseConfidence = leak?.confidence_score ?? 25; // already set by detector

  // Adjust by data richness — sparse data = lower confidence
  const adjustedConfidence = Math.round(baseConfidence * (0.5 + 0.5 * dataFactor));

  // Severity derived from leak amount relative to revenue
  const rev = input?.annualRevenue ?? 100_000;
  const impactPct = base / rev;
  const severity = Math.min(95, Math.max(10, Math.round(
    impactPct >= 0.15 ? 85 :
    impactPct >= 0.08 ? 70 :
    impactPct >= 0.04 ? 55 :
    impactPct >= 0.02 ? 40 : 25
  )));

  const priority = Math.round((severity * adjustedConfidence) / 100);

  return {
    adjustedImpact:  base,
    severity:        severity,
    confidence:      adjustedConfidence,
    priority:        priority,
    dhScore,
  };
}

function makeDim(score: number): BHSDimension {
  return { score, weight: 0.2, factors: [] };
}

export function calculateBHS(leaks: any[], input: any, benchmarks?: any): BHSResult {
  const totalImpact = leaks.reduce((s, l) => s + ((l.annual_impact_max || l.annualImpact || l.estimated_annual_leak) ?? 0), 0);
  const rev = input?.annualRevenue || input?.revenue || 100_000;
  // Revenue-relative: 10% leak = score ~55, 20% = score ~30, 3% = score ~65
  const leakPct = totalImpact / rev;
  const penalty = Math.min(55, Math.round(leakPct * 275));
  const base = 78;
  const raw   = Math.max(20, base - penalty);
  const score = leaks.length === 0 ? 72 : Math.min(79, raw);
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';
  const band  = score >= 65 ? 'Healthy' : score >= 45 ? 'At Risk' : 'Critical'; // aligned with frontend thresholds
  return {
    score,
    grade,
    band,
    dhScore:            calculateDataHealthScore(input),
    confidence:         Math.min(0.85, Math.max(0.3, calculateDataHealthScore(input) / 100)),
    leakImpactPct:      Math.min(100, Math.round((totalImpact / Math.max(1, input?.annualRevenue || input?.revenue || 100_000)) * 100)),
    industryComparison: 'Average',
    dimensions: {
      expenseEfficiency: makeDim(score),
      revenueProtection: makeDim(score),
      taxCompliance:     makeDim(score),
      operationalHealth: makeDim(score),
      riskExposure:      makeDim(score),
    },
    explanation: `Overall financial health score based on ${leaks.length} detected leaks.`,
  };
}
