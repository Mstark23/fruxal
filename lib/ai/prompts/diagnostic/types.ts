// =============================================================================
// lib/ai/prompts/diagnostic/types.ts
//
// Shared DiagCtx — assembled once in run/route.ts, passed to every tier builder.
// =============================================================================

export interface DiagCtx {
  profile:          any;        // raw business_profiles row
  country:          'CA' | 'US'; // platform country — drives entire prompt branch
  province:         string;      // CA: province code | US: state code (e.g. 'TX', 'CA', 'NY')
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
  provinceDefaulted?: boolean; // true if province was not set and we fell back to a default
  // Parsed document data (from Claude document parser — may be null if not uploaded)
  docData: {
    t2:         any | null;  // T2 Corporate Return extracted fields
    financials: any | null;  // Financial statements extracted fields
    gst:        any | null;  // GST/HST Return extracted fields
    t4:         any | null;  // T4 Summary extracted fields
    bank:       any | null;  // Bank statement extracted fields
  };
}
