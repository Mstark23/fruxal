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
  const fields = ['revenue', 'province', 'industry', 'employees', 'structure'];
  const filled = fields.filter(f => input?.[f] != null && input?.[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
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
  return {
    adjustedImpact: base,
    severity:       leak?.severity === 'critical' ? 0.9 : 0.7,
    confidence:     leak?.severity === 'critical' ? 0.9 : 0.7,
    dhScore:        calculateDataHealthScore(input),
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
  const band  = score >= 80 ? 'Healthy' : score >= 60 ? 'At Risk' : 'Critical';
  return {
    score,
    grade,
    band,
    dhScore:            calculateDataHealthScore(input),
    confidence:         0.8,
    leakImpactPct:      Math.min(100, Math.round((totalImpact / Math.max(1, input?.revenue || 100_000)) * 100)),
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
