// =============================================================================
// Lead scoring — priority score 0-100 for pipeline entries
// =============================================================================
// Higher score = assign a rep sooner.
// Scored fields all come from prescan answers + pipeline data.
// =============================================================================

export interface LeadSignals {
  annualRevenue:    number | null;   // From business_profiles or pipeline
  estimatedLeak:    number | null;   // ~5% revenue or prescan-calculated
  province:         string | null;   // QC/ON = better rep coverage (CA); CA/TX/NY (US)
  country:          string | null;   // "CA" or "US" — determines which coverage map to use
  hasAccountant:    boolean | null;  // false = likely missing credits
  lastTaxReview:    string | null;   // "never" / "3_plus_years" = high value
  doesRd:           boolean | null;  // SR&ED (CA) or R&D Tax Credit (US) opportunity
  employeeCount:    number | null;   // Payroll optimization plays
  industry:         string | null;   // Some industries have higher avg savings
  daysInPipeline:   number;          // Urgency — older = cooling off
}

const HIGH_VALUE_INDUSTRIES = new Set([
  "construction","manufacturing","tech","saas","software_development",
  "real_estate","trucking","healthcare","legal","accounting",
]);

const HIGH_COVERAGE_PROVINCES = new Set(["QC","ON","BC","AB"]);
const HIGH_COVERAGE_US_STATES = new Set(["CA","TX","NY","FL","IL","WA","CO","GA"]);

export function scoreLeadQuality(s: LeadSignals): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Revenue size — up to 35 points
  const rev = s.annualRevenue ?? 0;
  if (rev >= 1_000_000)      { score += 35; reasons.push("Revenue $1M+"); }
  else if (rev >= 500_000)   { score += 28; reasons.push("Revenue $500K+"); }
  else if (rev >= 250_000)   { score += 20; reasons.push("Revenue $250K+"); }
  else if (rev >= 100_000)   { score += 12; reasons.push("Revenue $100K+"); }
  else if (rev >= 50_000)    { score +=  6; reasons.push("Revenue $50K+"); }

  // Estimated leak — up to 25 points
  const leak = s.estimatedLeak ?? (rev * 0.05);
  if (leak >= 50_000)        { score += 25; reasons.push("Leak $50K+/yr"); }
  else if (leak >= 20_000)   { score += 18; reasons.push("Leak $20K+/yr"); }
  else if (leak >= 10_000)   { score += 12; reasons.push("Leak $10K+/yr"); }
  else if (leak >= 5_000)    { score +=  6; reasons.push("Leak $5K+/yr"); }

  // SR&ED / R&D — instant high-confidence recovery
  if (s.doesRd === true)     { score += 15; reasons.push("R&D detected — SR&ED opportunity"); }

  // Tax review gap — easy wins
  if (s.lastTaxReview === "never" || s.lastTaxReview === "3_plus_years") {
    score += 12; reasons.push("Tax not reviewed 3+ years");
  } else if (s.lastTaxReview === "1_2_years") {
    score +=  5; reasons.push("Tax reviewed 1-2 years ago");
  }

  // No accountant — missed deductions almost certain
  if (s.hasAccountant === false) { score += 8; reasons.push("No accountant"); }

  // Employee count — payroll optimization
  if ((s.employeeCount ?? 0) >= 10)    { score += 6; reasons.push("10+ employees"); }
  else if ((s.employeeCount ?? 0) >= 3){ score += 3; reasons.push("3+ employees"); }

  // Province/state — rep coverage quality
  const coverageSet = s.country === "US" ? HIGH_COVERAGE_US_STATES : HIGH_COVERAGE_PROVINCES;
  if (s.province && coverageSet.has(s.province)) {
    score += 5; reasons.push(`${s.province} — strong rep coverage`);
  }

  // Industry — some have higher average savings
  if (s.industry && HIGH_VALUE_INDUSTRIES.has(s.industry)) {
    score += 5; reasons.push(`${s.industry} — high-value industry`);
  }

  // Urgency decay — older leads cool off
  if (s.daysInPipeline > 14)      { score -= 10; }
  else if (s.daysInPipeline > 7)  { score -=  5; }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

/** Map score to human priority label */
export function scoreToPriority(score: number): "hot" | "warm" | "cold" {
  if (score >= 60) return "hot";
  if (score >= 35) return "warm";
  return "cold";
}
