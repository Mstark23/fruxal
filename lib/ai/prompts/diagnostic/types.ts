// =============================================================================
// lib/ai/prompts/diagnostic/types.ts
//
// Shared DiagCtx — assembled once in run/route.ts, passed to every tier builder.
// =============================================================================

export interface DiagCtx {
  profile:          any;        // raw business_profiles row
  province:         string;
  annualRevenue:    number;
  revenueSource:    string;
  employees:        number;
  isFr:             boolean;
  estimatedPayroll: number;
  estimatedEBITDA:  number;
  ebitdaSource:     string;
  grossMarginPct:   number;
  ownerSalary:      number;
  exactNetIncome:   number;
  estimatedTaxDrag: number;
  taxCtx:           string;     // pre-built from buildTaxContext()
  leakList:         string;     // formatted leak detectors
  programList:      string;     // government programs with slugs
  benchmarkList:    string;     // industry benchmarks
  overdue:          number;
  penaltyExposure:  number;
  obligationsCount: number;
  exitHorizon:      string;
  hasHoldco:        boolean;
  passiveOver50k:   boolean;
  lcgeEligible:     boolean;
  rdtohBalance:     number;
  hasCDA:           boolean;
  sredLastYear:     number;
}
