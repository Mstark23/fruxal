// =============================================================================
// services/bhs-engine.ts — Stub
// Original file was removed during cleanup. These stubs satisfy the import
// in prescan-engine-v3.ts. Replace with full implementation if BHS scoring
// is needed beyond prescan.
// =============================================================================

export interface BHSResult {
  score:        number;
  grade:        string;
  dhScore:      number;
  dimensions:   Record<string, number>;
  explanation:  string;
}

export function calculateDataHealthScore(input: any): number {
  // Heuristic: score by how many fields are populated
  const fields = ['revenue', 'province', 'industry', 'employees', 'structure'];
  const filled = fields.filter(f => input?.[f] != null && input?.[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}

export function scoreLeakV2(leak: any, input: any, benchmarks?: any): any {
  const base = leak?.annual_impact_max ?? leak?.annualImpact ?? 0;
  return {
    adjustedImpact: base,
    confidence:     leak?.severity === 'critical' ? 0.9 : 0.7,
    dhScore:        calculateDataHealthScore(input),
  };
}

export function calculateBHS(leaks: any[], input: any, benchmarks?: any): BHSResult {
  const totalImpact = leaks.reduce((s, l) => s + (l.annual_impact_max || l.annualImpact || 0), 0);
  const maxExpected = 200_000;
  const raw   = Math.max(0, 100 - Math.round((totalImpact / maxExpected) * 100));
  const score = Math.min(100, Math.max(0, raw));
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';
  return {
    score,
    grade,
    dhScore:     calculateDataHealthScore(input),
    dimensions:  { tax: score, payroll: score, compliance: score, operations: score },
    explanation: `Overall financial health score based on ${leaks.length} detected leaks.`,
  };
}
