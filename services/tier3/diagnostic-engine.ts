// =============================================================================
// src/services/tier3/diagnostic-engine.ts
// =============================================================================
// Fruxal Tier 3 — Mid-Market Diagnostic Engine
//
// Takes CFO call inputs + company profile → scores 57 leaks → returns top 10
// with province-adjusted dollar estimates and confidence levels.
//
// Flow:
//   1. Load leak database
//   2. Filter by industry (fallback to all if no match)
//   3. Apply province multiplier to dollar ranges
//   4. Score confidence based on call answers
//   5. Calculate priority = confidence weight × midpoint dollar value
//   6. Return top 10 sorted by priority + summary
// =============================================================================

import path from "path";
import fs from "fs";

// ─── Types ───────────────────────────────────────────────────────────────────

export type RevenueBracket = "1M_5M" | "5M_20M" | "20M_50M";
export type Province = "ON" | "QC" | "BC" | "AB" | "MB";
export type Confidence = "HIGH" | "MEDIUM" | "SPECULATIVE";

export interface CallAnswers {
  vendorContractsLastRenegotiated: string;
  taxStructureLastReviewed: string;
  benefitsPlanLastRebid: string;
  hasDedicatedCFO: boolean;
  primaryBank: string;
  monthlySaasSpend: number;
  claimedSRED: boolean;
  biggestPainPoint: string;
}

export interface DiagnosticInput {
  companyName: string;
  industry: string;
  revenueBracket: RevenueBracket;
  province: Province;
  employeeCount: number;
  callAnswers: CallAnswers;
}

export interface ScoredLeak {
  rank: number;
  leak_id: string;
  category: string;
  name: string;
  description: string;
  estimatedLow: number;
  estimatedHigh: number;
  confidence: Confidence;
  confidenceReason: string;
  dataNeeded: string[];
  recoveryTimeline: string;
}

export interface DiagnosticSummary {
  totalEstimatedLow: number;
  totalEstimatedHigh: number;
  highConfidenceCount: number;
  topCategory: string;
  feeRangeLow: number;
  feeRangeHigh: number;
}

export interface DiagnosticResult {
  companyName: string;
  industry: string;
  province: string;
  revenueBracket: string;
  generatedAt: string;
  topLeaks: ScoredLeak[];
  summary: DiagnosticSummary;
}

// ─── Raw DB types ────────────────────────────────────────────────────────────

interface RawLeak {
  leak_id: string;
  category: string;
  name: string;
  description: string;
  dollar_ranges: Record<string, { low: number; high: number }>;
  applicable_industries: string[];
  province_modifiers: Record<string, { multiplier: number; note: string }>;
  confidence_trigger: string;
  data_needed: string[];
  recovery_timeline: string;
}

interface LeakDB {
  leaks: RawLeak[];
}

// ─── Confidence Scoring ──────────────────────────────────────────────────────

const STALE_THRESHOLD = ["never", "3+ years", "5+ years", "don't know", "not sure", "no idea"];
const SOMEWHAT_STALE = ["2-3 years", "1-2 years", "a while ago", "a few years"];

function isStale(answer: string): boolean {
  const a = answer.toLowerCase().trim();
  return STALE_THRESHOLD.some(s => a.includes(s)) || a === "";
}

function isSomewhatStale(answer: string): boolean {
  const a = answer.toLowerCase().trim();
  return SOMEWHAT_STALE.some(s => a.includes(s));
}

function painPointMentions(painPoint: string, ...keywords: string[]): boolean {
  const p = painPoint.toLowerCase();
  return keywords.some(k => p.includes(k));
}

function scoreConfidence(
  leak: RawLeak,
  input: DiagnosticInput
): { confidence: Confidence; reason: string } {
  const { callAnswers, employeeCount } = input;
  const ca = callAnswers;
  const id = leak.leak_id;
  const cat = leak.category;

  // ═══ PASS 1: Direct leak-specific triggers ═══

  // TAX-001: Corporate structure
  if (id === "TAX-001" && painPointMentions(ca.biggestPainPoint, "tax", "structure", "holding", "dividend", "salary")) {
    return { confidence: "HIGH", reason: "Pain point directly references tax structure or compensation planning" };
  }

  // TAX-002: SR&ED
  if (id === "TAX-002" && !ca.claimedSRED) {
    return { confidence: "HIGH", reason: "Company has not claimed SR&ED credits despite likely qualifying based on industry" };
  }
  if (id === "TAX-002" && ca.claimedSRED) {
    return { confidence: "SPECULATIVE", reason: "Company already claims SR&ED — may still have optimization opportunity" };
  }

  // TAX-005: HST/GST — Quebec dual filing
  if (id === "TAX-005" && input.province === "QC") {
    return { confidence: "HIGH", reason: "Quebec dual GST/QST filing creates high probability of missed input tax credits" };
  }

  // TAX-008: Interprovincial allocation
  if (id === "TAX-008" && painPointMentions(ca.biggestPainPoint, "multi-province", "multiple province", "interprovincial", "different province")) {
    return { confidence: "HIGH", reason: "CFO references multi-province operations — allocation optimization very likely" };
  }

  // TAX-009: Owner comp mix
  if (id === "TAX-009" && painPointMentions(ca.biggestPainPoint, "salary", "dividend", "compensation", "personal tax", "take home")) {
    return { confidence: "HIGH", reason: "CFO pain point directly relates to owner compensation optimization" };
  }

  // VEND category: vendor renegotiation timing
  if (cat === "vendor_procurement") {
    if (isStale(ca.vendorContractsLastRenegotiated)) {
      return { confidence: "HIGH", reason: `Vendor contracts not renegotiated (answer: "${ca.vendorContractsLastRenegotiated}") — above-market pricing highly probable` };
    }
    if (isSomewhatStale(ca.vendorContractsLastRenegotiated)) {
      return { confidence: "MEDIUM", reason: `Vendor contracts renegotiated "${ca.vendorContractsLastRenegotiated}" — moderate savings likely` };
    }
  }

  // PAY-001: Worker misclassification
  if (id === "PAY-001" && ["construction", "IT_services", "staffing_agencies", "logistics_trucking", "HVAC_trades"].includes(normalizeIndustry(input.industry))) {
    return { confidence: "MEDIUM", reason: "Industry has high prevalence of contractor misclassification based on CRA audit patterns" };
  }

  // PAY-003: Turnover
  if (id === "PAY-003" && painPointMentions(ca.biggestPainPoint, "hiring", "retention", "turnover", "staff", "people", "quit", "recruit")) {
    return { confidence: "HIGH", reason: "CFO pain point directly relates to employee retention and recruitment costs" };
  }

  // PAY-004: Benefits
  if (id === "PAY-004") {
    if (isStale(ca.benefitsPlanLastRebid)) {
      return { confidence: "HIGH", reason: `Benefits plan not competitively rebid (answer: "${ca.benefitsPlanLastRebid}") — premium savings very likely` };
    }
    if (isSomewhatStale(ca.benefitsPlanLastRebid)) {
      return { confidence: "MEDIUM", reason: `Benefits last rebid "${ca.benefitsPlanLastRebid}" — moderate premium savings expected` };
    }
  }

  // PAY-005: Payroll remittance penalties — Quebec double risk
  if (id === "PAY-005" && input.province === "QC" && !ca.hasDedicatedCFO) {
    return { confidence: "HIGH", reason: "Quebec dual CRA/Revenu Québec remittance with no dedicated CFO — penalty exposure very likely" };
  }

  // PAY-007: WCB classification
  if (id === "PAY-007" && ["construction", "manufacturing", "logistics_trucking", "HVAC_trades"].includes(normalizeIndustry(input.industry))) {
    return { confidence: "MEDIUM", reason: "High-risk WCB industry — classification and experience rating optimization commonly missed" };
  }

  // BANK category: no CFO + specific triggers
  if (cat === "banking_treasury") {
    if (!ca.hasDedicatedCFO) {
      if (id === "BANK-001" && painPointMentions(ca.biggestPainPoint, "bank", "fees", "banking")) {
        return { confidence: "HIGH", reason: "No dedicated CFO and pain point mentions banking fees" };
      }
      if (id === "BANK-002" && painPointMentions(ca.biggestPainPoint, "credit card", "processing", "merchant", "payment")) {
        return { confidence: "HIGH", reason: "No dedicated CFO and pain point references payment processing costs" };
      }
      if (id === "BANK-004" && painPointMentions(ca.biggestPainPoint, "cash flow", "cash", "liquidity", "overdraft")) {
        return { confidence: "HIGH", reason: "No dedicated CFO and pain point references cash flow management" };
      }
      return { confidence: "MEDIUM", reason: "No dedicated CFO — treasury and banking optimization typically unmanaged" };
    }
  }

  // INS category
  if (cat === "insurance") {
    if (id === "INS-001" && painPointMentions(ca.biggestPainPoint, "insurance", "premium", "coverage")) {
      return { confidence: "HIGH", reason: "CFO pain point directly references insurance costs" };
    }
    if (id === "INS-004" && painPointMentions(ca.biggestPainPoint, "vehicle", "fleet", "truck", "van")) {
      return { confidence: "HIGH", reason: "CFO mentions fleet/vehicle concerns — fleet insurance optimization likely" };
    }
    if (id === "INS-008" && painPointMentions(ca.biggestPainPoint, "cyber", "hack", "data", "privacy", "breach", "security")) {
      return { confidence: "HIGH", reason: "CFO references cyber/data/security risk without cyber coverage" };
    }
  }

  // SAAS category
  if (cat === "saas_technology") {
    const monthlySpend = ca.monthlySaasSpend || 0;
    if (id === "SAAS-001" && monthlySpend > 5000) {
      return { confidence: "HIGH", reason: `Monthly SaaS spend of $${monthlySpend.toLocaleString()} significantly exceeds benchmarks — unused licenses very likely` };
    }
    if (id === "SAAS-001" && monthlySpend > 2000) {
      return { confidence: "MEDIUM", reason: `Monthly SaaS spend of $${monthlySpend.toLocaleString()} suggests license optimization opportunity` };
    }
    if (id === "SAAS-005" && painPointMentions(ca.biggestPainPoint, "manual", "data entry", "spreadsheet", "excel", "inefficient", "process")) {
      return { confidence: "HIGH", reason: "CFO pain point directly describes manual processes ripe for automation" };
    }
    if (id === "SAAS-004" && painPointMentions(ca.biggestPainPoint, "server", "legacy", "old system", "on-premise", "it cost")) {
      return { confidence: "HIGH", reason: "CFO describes legacy infrastructure creating unnecessary maintenance overhead" };
    }
  }

  // COMP category
  if (cat === "compliance_penalties") {
    if (id === "COMP-001" && painPointMentions(ca.biggestPainPoint, "filing", "late", "cra", "penalty", "accountant")) {
      return { confidence: "HIGH", reason: "CFO references filing or CRA penalty issues directly" };
    }
    if (id === "COMP-002" && employeeCount >= 20 && painPointMentions(ca.biggestPainPoint, "hr", "employee", "labour", "labor", "compliance")) {
      return { confidence: "HIGH", reason: "20+ employees with HR-related pain point — employment standards exposure likely" };
    }
    if (id === "COMP-003" && input.province === "QC") {
      return { confidence: "HIGH", reason: "Quebec Law 25 is the most stringent privacy regime in Canada — non-compliance highly probable" };
    }
    if (id === "COMP-004" && ["construction", "manufacturing", "logistics_trucking", "HVAC_trades"].includes(normalizeIndustry(input.industry)) && employeeCount >= 20) {
      return { confidence: "MEDIUM", reason: "High-risk industry with 20+ employees — OHS compliance gaps are common" };
    }
  }

  // ═══ PASS 2: Category-level tax scoring ═══

  if (cat === "tax_structure") {
    if (isStale(ca.taxStructureLastReviewed)) {
      return { confidence: "MEDIUM", reason: `Tax structure not reviewed recently (answer: "${ca.taxStructureLastReviewed}") — optimization gaps statistically likely` };
    }
    if (isSomewhatStale(ca.taxStructureLastReviewed)) {
      return { confidence: "MEDIUM", reason: `Tax structure reviewed "${ca.taxStructureLastReviewed}" — legislative changes may have created new opportunities` };
    }
  }

  // ═══ PASS 3: Structural signals ═══

  if (!ca.hasDedicatedCFO && (cat === "compliance_penalties" || cat === "payroll_hr")) {
    return { confidence: "MEDIUM", reason: "No dedicated CFO — compliance and payroll optimization typically gaps without financial leadership" };
  }

  if (employeeCount >= 50 && (cat === "payroll_hr" || cat === "compliance_penalties")) {
    return { confidence: "MEDIUM", reason: `${employeeCount} employees creates significant payroll and compliance surface area` };
  }

  // Pain point keyword catch-all
  if (painPointMentions(ca.biggestPainPoint, ...categoryKeywords(cat))) {
    return { confidence: "MEDIUM", reason: `CFO pain point relates to ${categoryLabel(cat)} concerns` };
  }

  // ═══ Default: SPECULATIVE ═══
  return {
    confidence: "SPECULATIVE",
    reason: "Industry and revenue bracket statistics suggest this leak is present in 30-50% of comparable companies",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function categoryKeywords(cat: string): string[] {
  const map: Record<string, string[]> = {
    tax_structure: ["tax", "cra", "deduction", "credit", "corporate structure", "accountant"],
    vendor_procurement: ["vendor", "supplier", "contract", "procurement", "cost", "shipping", "freight", "telecom"],
    payroll_hr: ["payroll", "hr", "hiring", "turnover", "benefits", "overtime", "workers comp", "wsib", "cnesst"],
    banking_treasury: ["bank", "cash", "credit", "loan", "interest", "payment", "receivable", "collection"],
    insurance: ["insurance", "premium", "coverage", "liability", "risk", "claim"],
    saas_technology: ["software", "saas", "technology", "it", "system", "automation", "manual", "legacy"],
    compliance_penalties: ["compliance", "penalty", "fine", "regulation", "filing", "safety", "privacy", "ohs"],
  };
  return map[cat] || [];
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    tax_structure: "Tax Structure",
    vendor_procurement: "Vendor & Procurement",
    payroll_hr: "Payroll & HR",
    banking_treasury: "Banking & Treasury",
    insurance: "Insurance",
    saas_technology: "SaaS & Technology",
    compliance_penalties: "Compliance & Penalties",
  };
  return map[cat] || cat;
}

const CONFIDENCE_WEIGHT: Record<Confidence, number> = {
  HIGH: 3,
  MEDIUM: 2,
  SPECULATIVE: 1,
};

// ─── Normalize industry input ────────────────────────────────────────────────

function normalizeIndustry(input: string): string {
  const normalized = input.toLowerCase().trim().replace(/[\s&]+/g, "_").replace(/[^a-z0-9_]/g, "");

  const aliases: Record<string, string> = {
    it: "IT_services", it_services: "IT_services", tech: "IT_services", technology: "IT_services",
    hvac: "HVAC_trades", hvac_trades: "HVAC_trades", trades: "HVAC_trades", plumbing: "HVAC_trades", electrical: "HVAC_trades",
    ecommerce: "e_commerce", e_commerce: "e_commerce", online_retail: "e_commerce",
    pharma: "pharmaceutical_distribution", pharmaceutical: "pharmaceutical_distribution", pharmaceutical_distribution: "pharmaceutical_distribution",
    restaurant: "food_beverage", food: "food_beverage", food_beverage: "food_beverage", food_and_beverage: "food_beverage",
    trucking: "logistics_trucking", logistics: "logistics_trucking", logistics_trucking: "logistics_trucking", transport: "logistics_trucking",
    dental: "dental_clinics", dental_clinics: "dental_clinics", dentist: "dental_clinics",
    law: "legal_services", legal: "legal_services", legal_services: "legal_services",
    accounting: "accounting_firms", accounting_firms: "accounting_firms", cpa: "accounting_firms",
    marketing: "marketing_agencies", marketing_agencies: "marketing_agencies", agency: "marketing_agencies",
    staffing: "staffing_agencies", staffing_agencies: "staffing_agencies", recruitment: "staffing_agencies",
    auto: "auto_dealerships", auto_dealerships: "auto_dealerships", dealership: "auto_dealerships",
    property: "property_management", property_management: "property_management",
    real_estate: "real_estate", realestate: "real_estate",
    construction: "construction", manufacturing: "manufacturing", hospitality: "hospitality", hotel: "hospitality",
    healthcare: "healthcare", medical: "healthcare", retail: "retail",
    engineering: "engineering_firms", engineering_firms: "engineering_firms",
  };

  return aliases[normalized] || normalized;
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

export function runDiagnostic(input: DiagnosticInput): DiagnosticResult {
  // 1. Load leak database
  const dbPath = path.join(process.cwd(), "src", "data", "tier3-leaks.json");
  const raw = fs.readFileSync(dbPath, "utf-8");
  const db: LeakDB = JSON.parse(raw);

  const normalizedIndustry = normalizeIndustry(input.industry);

  // 2. Filter by industry
  let matchingLeaks = db.leaks.filter((leak) =>
    leak.applicable_industries.some(
      (ind) => ind.toLowerCase().replace(/[\s&]+/g, "_") === normalizedIndustry.toLowerCase()
    )
  );

  // Fallback: if no industry match, include all leaks
  if (matchingLeaks.length === 0) {
    console.warn(`[Tier3Engine] No industry match for "${input.industry}" (normalized: "${normalizedIndustry}"). Using all ${db.leaks.length} leaks.`);
    matchingLeaks = db.leaks;
  }

  // 3. Score and adjust each leak
  const scored = matchingLeaks.map((leak) => {
    const bracket = leak.dollar_ranges[input.revenueBracket];
    if (!bracket) return null;

    const modifier = leak.province_modifiers[input.province];
    const multiplier = modifier?.multiplier ?? 1.0;

    const adjustedLow = Math.round(bracket.low * multiplier);
    const adjustedHigh = Math.round(bracket.high * multiplier);
    const midpoint = (adjustedLow + adjustedHigh) / 2;

    const { confidence, reason } = scoreConfidence(leak, input);
    const weight = CONFIDENCE_WEIGHT[confidence];
    const priorityScore = weight * midpoint;

    return { leak, adjustedLow, adjustedHigh, confidence, confidenceReason: reason, priorityScore };
  }).filter(Boolean) as Array<{
    leak: RawLeak; adjustedLow: number; adjustedHigh: number;
    confidence: Confidence; confidenceReason: string; priorityScore: number;
  }>;

  // 4. Sort by priority descending
  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  // 5. Top 10
  const top10 = scored.slice(0, 10);

  // 6. Build output
  const topLeaks: ScoredLeak[] = top10.map((item, i) => ({
    rank: i + 1,
    leak_id: item.leak.leak_id,
    category: item.leak.category,
    name: item.leak.name,
    description: item.leak.description,
    estimatedLow: item.adjustedLow,
    estimatedHigh: item.adjustedHigh,
    confidence: item.confidence,
    confidenceReason: item.confidenceReason,
    dataNeeded: item.leak.data_needed,
    recoveryTimeline: item.leak.recovery_timeline,
  }));

  // 7. Summary
  const totalEstimatedLow = topLeaks.reduce((sum, l) => sum + l.estimatedLow, 0);
  const totalEstimatedHigh = topLeaks.reduce((sum, l) => sum + l.estimatedHigh, 0);
  const highConfidenceCount = topLeaks.filter((l) => l.confidence === "HIGH").length;

  const categoryDollars: Record<string, number> = {};
  for (const l of topLeaks) {
    const mid = (l.estimatedLow + l.estimatedHigh) / 2;
    categoryDollars[l.category] = (categoryDollars[l.category] || 0) + mid;
  }
  const topCategory = Object.entries(categoryDollars).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

  return {
    companyName: input.companyName,
    industry: input.industry,
    province: input.province,
    revenueBracket: input.revenueBracket,
    generatedAt: new Date().toISOString(),
    topLeaks,
    summary: {
      totalEstimatedLow,
      totalEstimatedHigh,
      highConfidenceCount,
      topCategory,
      feeRangeLow: Math.round(totalEstimatedLow * 0.12),
      feeRangeHigh: Math.round(totalEstimatedHigh * 0.12),
    },
  };
}
