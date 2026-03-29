// =============================================================================
// lib/ai/prompts.ts
// Builds the system and user prompts for the diagnostic engine.
// Claude generates ALL findings, programs, and affiliate recommendations
// from its own knowledge — no DB lookups required for content.
// =============================================================================

import { DiagnosticTier, tierMaxFindings } from "./tier";
import { DiagnosticContext } from "./context";

export interface PromptInputs {
  profile:    any;
  tier:       DiagnosticTier;
  isFr:       boolean;
  country:    "CA" | "US";
  province:   string;  // CA: province code | US: state code
  employees:  number;
  annualRevenue:    number;
  revenueSource:    string;
  grossMarginPct:   number;
  estimatedEBITDA:  number;
  ebitdaSource:     string;
  estimatedPayroll: number;
  ownerSalary:      number;
  exactNetIncome:   number;
  estimatedTaxDrag: number;
  exitHorizon:      string;
  lcgeEligible:     boolean;
  passiveOver50k:   boolean;
  hasHoldco:        boolean;
  rdtohBalance:     number;
  hasCDA:           boolean;
  sredLastYear:     number;
  // Integration data signals
  qbArOverdue?:     number;
  qbTopExpenses?:   any[];
  qbBankBalance?:   number;
  plaidRecurring?:  any[];
  stripeChurnRate?: number;
  stripeRefundRate?: number;
  dataSource?:      string;
  // Parsed document data from intake uploads
  docData?: {
    t2:         any | null;
    financials: any | null;
    gst:        any | null;
    t4:         any | null;
    bank:       any | null;
  };
  ctx: DiagnosticContext;
}

// ── Tax context ────────────────────────────────────────────────────────────────

// =============================================================================
// US Tax Context — state-aware, IRS-centric
// =============================================================================
const US_STATE_TAX: Record<string, string> = {
  TX: "No state income tax. Franchise tax (0.375% retail, 0.75% other) on revenue >$2.47M. Sales tax 6.25% + local up to 8.25%. No state payroll tax beyond federal.",
  FL: "No state income tax. Sales tax 6% + local. Reemployment tax (FUTA equivalent) 2.7% new employers on first $7,000/employee.",
  NY: "State income tax 4–10.9%. NYC surcharge if NYC-based. Sales tax 4% + local (NYC 8.875%). MTA payroll tax 0.34% if NYC metro. Corporate franchise tax 6.5% on net income.",
  CA: "State income tax up to 13.3% (highest in US). Sales tax 7.25% base + local up to 10.75%. SDI 0.9% on wages. Corporate tax 8.84% (S-corp 1.5%). Annual LLC fee $800 min.",
  WA: "No state income tax. B&O tax on gross receipts (0.471%–1.5% by industry). Sales tax 6.5% + local. L&I workers comp mandatory.",
  IL: "Flat state income tax 4.95%. Sales tax 6.25% + local. Replacement tax 2.5% on S-corps/partnerships. IDES unemployment insurance.",
  GA: "State income tax 5.49% (flat 2024). Sales tax 4% + local up to 9%. Corporate income tax 5.49%.",
  NC: "State income tax 4.5% (dropping to 3.99% by 2026). Sales tax 4.75% + local. Corporate income tax 2.5%.",
  AZ: "State income tax 2.5% flat. Sales tax 5.6% + local. Corporate income tax 4.9%.",
  CO: "State income tax 4.4% flat. Sales tax 2.9% + local. Corporate income tax 4.4%.",
  OH: "No traditional income tax on businesses (commercial activity tax 0.26% on gross receipts >$1M). Sales tax 5.75% + local.",
  PA: "State income tax 3.07% flat. Sales tax 6%. Corporate income tax 8.99% (phasing down to 4.99% by 2031). Gross receipts tax on utilities.",
  MI: "State income tax 4.05%. Sales tax 6%. Corporate income tax 6%.",
  NJ: "State income tax up to 10.75%. Sales tax 6.625%. Corporate business tax 9% on net income >$100K.",
  VA: "State income tax up to 5.75%. Sales tax 4.3% + local. Corporate income tax 6%.",
};

function buildUSTaxContext(inputs: PromptInputs): string {
  const { province: state, hasHoldco, sredLastYear } = inputs;
  const payroll = (inputs as any).estimatedPayroll ?? 0;
  const emp     = inputs.employees ?? 0;
  const lines: string[] = [];

  // Federal baseline — always applies
  lines.push("FEDERAL: Corporate rate 21% (C-corp) | S-corp/LLC pass-through: ordinary rates up to 37%. Self-employment tax 15.3% on net earnings up to $168,600 (2024 SS wage base), 2.9% Medicare above.");
  lines.push("FEDERAL PAYROLL: FICA — employer pays 6.2% SS + 1.45% Medicare per employee. FUTA 6% on first $7,000/employee (credit to 0.6% if state SUI paid). Form 941 quarterly required.");

  // State-specific
  const stateTax = US_STATE_TAX[state] || `State ${state} — apply standard state income tax, sales tax nexus, and workers compensation rules. Verify current rates with state revenue department.`;
  lines.push(`STATE (${state}): ${stateTax}`);

  // Structure flags
  const structure = (inputs.profile?.structure || "").toLowerCase();
  if (structure.includes("s_corp") || structure.includes("s-corp")) {
    lines.push("S-CORP: Shareholder-employee must receive reasonable W-2 compensation before distributions. IRS scrutiny on low salary + high distributions. Document comp study.");
  }
  if (structure.includes("llc")) {
    lines.push("LLC: Check if taxed as sole prop, partnership, S-corp, or C-corp. Multi-member LLCs default to partnership — Schedule K-1 required. S-corp election (Form 2553) may reduce SE tax.");
  }
  if (hasHoldco) {
    lines.push("HOLDING COMPANY: Assess IC-DISC for export income, captive insurance, IP holding structure. Management fee deductibility between entities.");
  }

  // R&D credit
  if (inputs.profile?.does_rd || (sredLastYear ?? 0) > 0) {
    lines.push("R&D CREDIT (Section 41): 20% incremental research credit or ASC method (14% of QREs above 50% of avg prior 3 years). Startups <$5M revenue can offset up to $500K payroll taxes. Document contemporaneously.");
  }

  // Payroll thresholds
  if (payroll > 0) {
    lines.push(`PAYROLL: ~$${payroll.toLocaleString()} estimated. FUTA deposits required if liability >$500. 941 must be deposited semi-weekly if payroll >$50K/lookback period. State SUI registration required in each state with employees.`);
  }

  // Sales tax nexus warning
  lines.push("SALES TAX NEXUS: Economic nexus thresholds ($100K sales OR 200 transactions) triggered in most states post-Wayfair (2018). Audit exposure if selling to multiple states without registration.");

  return lines.join("\n");
}

export function buildTaxContext(inputs: PromptInputs): string {
  const { province, hasHoldco, passiveOver50k, lcgeEligible, rdtohBalance, hasCDA, sredLastYear } = inputs;
  const country = inputs.country ?? "CA";

  // ── US TAX CONTEXT ──────────────────────────────────────────────────────────
  if (country === "US") {
    return buildUSTaxContext(inputs);
  }
  // ── CA TAX CONTEXT (original logic below) ───────────────────────────────────
  const payroll = (inputs as any).estimatedPayroll ?? 0;
  const emp     = inputs.employees ?? 0;
  const lines: string[] = [];

  // Full province coverage — all 10 provinces
  switch (province) {
    case "QC":
      lines.push("QST 9.975% + GST 5%. Bill 96 French language obligations on client-facing materials. RS&DE provincial credit: 30% refundable for CCPC. No HST Quick Method for QST — GST Quick Method only.");
      if (emp > 0) lines.push("CNESST contributions mandatory. CCQ applies to construction. CQRDA credit for R&D-adjacent work.");
      break;
    case "ON":
      lines.push("HST 13%. WSIB mandatory for most industries. EHT: payroll >$1M triggers 1.95% on full amount.");
      if (payroll > 500_000) lines.push(`EHT threshold: payroll ~$${payroll.toLocaleString()} — confirm exemption status.`);
      break;
    case "BC":
      lines.push("No HST — PST 7% separate from GST 5%. Self-assess PST on SaaS and imported software. WorkSafe BC mandatory.");
      if (payroll > 500_000) lines.push("BC EHT: payroll >$500K triggers 1.95% employer health tax.");
      break;
    case "AB":
      lines.push("No provincial sales tax. GST 5% only. Corporate rate 8% (lowest in Canada). WCB Alberta instead of WSIB. No provincial payroll tax.");
      break;
    case "SK":
      lines.push("PST 6% applies including on SaaS and digital services. Corporate rate 12%. WCB Saskatchewan.");
      break;
    case "MB":
      lines.push("RST 7%. Health and post-secondary education levy on payroll >$2.25M. Manitoba Business Council grants available.");
      break;
    case "NS":
      lines.push("HST 15% — highest combined rate in Canada. Corporate rate 14%. WCB Nova Scotia.");
      break;
    case "NB":
      lines.push("HST 15%. Corporate rate 14%. WorkSafeNB.");
      break;
    case "NL":
      lines.push("HST 15%. Corporate rate 15%. WorkplaceNL.");
      break;
    case "PE":
      lines.push("HST 15%. Corporate rate 16%. WCB PEI.");
      break;
    default:
      lines.push(`Province ${province} — apply standard federal rules. Confirm current provincial rates and WCB/WSIB equivalent.`);
  }

  // CCPC-specific flags
  if (hasHoldco)         lines.push("Holdco structure — assess RDTOH, CDA, intercorporate dividends, passive income grind.");
  if (passiveOver50k)    lines.push("Passive income >$50K confirmed — SBD grind-down applies: $5 SBD lost per $1 passive over $50K.");
  if (lcgeEligible)      lines.push("LCGE eligible — $1,250,000 exemption (2025, indexed). Optimize QSBC share test before any exit event.");
  if (rdtohBalance > 0)  lines.push(`RDTOH balance $${(rdtohBalance ?? 0).toLocaleString()} — refund at 38.33% per $1 eligible dividend paid.`);
  if (hasCDA)            lines.push("CDA balance confirmed — tax-free capital dividend available. Quantify at owner marginal rate.");
  if (sredLastYear > 0)  lines.push(`SR&ED claimed $${(sredLastYear ?? 0).toLocaleString()} last year — assess for additional eligible work.`);

  return lines.join("\n");
}

// ── Benchmark context from real profile data ──────────────────────────────────

export function computeYourBenchmarks(inputs: PromptInputs): string {
  const { annualRevenue, grossMarginPct, estimatedEBITDA, estimatedPayroll, exactNetIncome, estimatedTaxDrag, profile, employees } = inputs;
  if (annualRevenue === 0) return "";
  const lines: string[] = ["CALCULATED YOUR VALUES (use these exactly as your_value in benchmark_comparisons):"];
  if (grossMarginPct > 0) lines.push(`• Gross Margin %: your_value = "${grossMarginPct.toFixed(1)}%"`);
  if (estimatedEBITDA > 0) lines.push(`• EBITDA Margin %: your_value = "${((estimatedEBITDA / annualRevenue) * 100).toFixed(1)}%"`);
  if (exactNetIncome > 0) lines.push(`• Net Profit Margin %: your_value = "${((exactNetIncome / annualRevenue) * 100).toFixed(1)}%"`);
  if (employees > 0) lines.push(`• Revenue per Employee: your_value = "$${Math.round(annualRevenue / employees).toLocaleString()}"`);
  if (estimatedPayroll > 0) lines.push(`• Payroll Ratio %: your_value = "${((estimatedPayroll / annualRevenue) * 100).toFixed(1)}%"`);
  if (estimatedTaxDrag > 0) lines.push(`• Effective Tax Rate %: your_value = "${((estimatedTaxDrag / annualRevenue) * 100).toFixed(1)}%"`);
  const totalAssets = (profile as any).total_assets ?? 0;
  const totalLiabilities = (profile as any).total_liabilities ?? 0;
  if (totalAssets > 0 && totalLiabilities > 0) lines.push(`• Debt Ratio %: your_value = "${((totalLiabilities / totalAssets) * 100).toFixed(1)}%"`);
  return lines.length > 1 ? lines.join("\n") : "";
}

function buildBenchmarkList(benchmarks: any[]): string {
  return benchmarks
    .map(b => `• ${b.metric_name}: avg ${b.avg_value}${b.unit}, top ${b.top_performer}${b.unit}`)
    .join("\n") || "No DB benchmarks — use verified industry averages for this region; flag each as estimate";
}

// ── JSON schema ────────────────────────────────────────────────────────────────

const JSON_SCHEMA = `{
  "scores": {
    "overall": <0-100>,
    "compliance": <0-100>,
    "efficiency": <0-100>,
    "optimization": <0-100>,
    "growth": <0-100>,
    "bankability": <0-100>,
    "exit_readiness": <0-100>
  },
  "savings_anchor": {
    "headline": "<e.g. $127,400/yr>",
    "description": "<one sentence>",
    "description_fr": "<French>"
  },
  "executive_summary": "<2-3 sentences, board-ready>",
  "executive_summary_fr": "<French>",
  "findings": [
    {
      "id": "<slug>",
      "category": "<compliance|efficiency|optimization|growth|bankability|exit>",
      "severity": "<critical|high|medium|low>",
      "title": "<English>",
      "title_fr": "<French>",
      "description": "<English>",
      "description_fr": "<French>",
      "annual_leak": <number>,
      "potential_savings": <number>,
      "penalty_exposure": <number>,
      "calculation_shown": "<formula string showing how you calculated the dollar amount>",
      "action_items": ["<concrete step 1>", "<concrete step 2>"],
      "action_items_fr": ["<step fr 1>"],
      "effort": "<low|medium|high>",
      "timeline": "<immediate|30days|90days|6months|12months>",
      "programs": [
        {
          "slug": "<kebab-case-slug>",
          "name": "<official English program name>",
          "name_fr": "<official French program name>",
          "description": "<what they can claim and rough dollar range>",
          "max_amount": <number>,
          "url": "<official government URL>"
        }
      ],
      "affiliates": [
        {
          "slug": "<kebab-case-slug>",
          "name": "<company or service name>",
          "category": "<accounting|legal|software|payroll|insurance|banking|hr>",
          "description": "<how this specific service fixes this specific finding>",
          "url": "<website URL if known>"
        }
      ],
      "program_slugs": ["<slug of any government program from the programs array that directly addresses this finding>"]
    }
  ],
  "programs": [
    {
      "slug": "<kebab-case-slug>",
      "name": "<official English program name>",
      "name_fr": "<official French program name>",
      "description": "<1-2 sentences: what the business can claim, eligibility criteria, and dollar range>",
      "description_fr": "<French>",
      "category": "<tax_credit|grant|loan|wage_subsidy|training>",
      "level": "<federal|provincial|municipal>",
      "max_amount": <number>,
      "url": "<official government URL>",
      "why_relevant": "<1 sentence specific to this business>",
      "finding_ids": ["<finding id this program relates to>"]
    }
  ],
  "priority_sequence": [
    { "step": 1, "title": "<>", "title_fr": "<>", "description": "<>", "deadline": "<>" }
  ],
  "benchmark_comparisons": [
    { "metric": "<>", "your_value": "<>", "industry_avg": "<>", "top_performer": "<>", "status": "<above|at|below>" }
  ],
  "accountant_briefing": {
    "summary": "<paragraph for CPA>",
    "forms_relevant": ["<e.g. W-2 / T4, Schedule C / T2125, Form 941>"],
    "estimated_tax_exposure": <number>,
    "questions_to_ask": ["<question 1>", "<question 2>"]
  },
  "north_star_metric": {
    "metric": "<single most important KPI to move>",
    "current_value": "<current measured value with unit>",
    "target_value": "<target value in 90 days>",
    "how_to_track_it": "<one sentence on how to measure this>"
  },
  "ninety_day_success": {
    "success_statement": "<what success looks like in 90 days — 1-2 sentences>",
    "key_milestones": ["<milestone 1>", "<milestone 2>", "<milestone 3>", "<milestone 4>"]
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "action_plan": {
    "tonight_action": {
      "title": "<specific action owner can do tonight, under 30 min>",
      "steps": ["<step 1>", "<step 2>", "<step 3>"],
      "time_required": "<e.g. 20 minutes>",
      "estimated_value": <annual dollar value>,
      "why_tonight": "<one sentence urgency reason>"
    },
    "optimal_sequence": [
      { "step": 1, "action": "<>", "value": <number>, "unlocks": ["<>"] }
    ]
  },
  "total_potential_savings": <number>,
  "total_annual_leaks": <number>,
  "total_penalty_exposure": <number>,
  "total_programs_value": <number>,
  "ebitda_impact": <number>,
  "enterprise_value_impact": <number>,
  "risk_matrix": [
    {
      "area": "<compliance|tax|cash_flow|operations|data_privacy|employment>",
      "area_fr": "<French area name>",
      "risk_level": "<critical|high|medium|low>",
      "likelihood": "<certain|likely|possible|unlikely>",
      "impact": "<severe|high|moderate|low>",
      "current_status": "<exposed|at_risk|monitored|compliant>",
      "current_status_fr": "<French>",
      "mitigation": "<one concrete action>"
    }
  ]
}`;

// ── Enterprise additions ───────────────────────────────────────────────────────

function buildEnterpriseInstructions(inputs: PromptInputs, taxCtx: string): string {
  const { annualRevenue, revenueSource, estimatedEBITDA, ebitdaSource, grossMarginPct, exactNetIncome, ownerSalary, exitHorizon, profile, ctx: { overdue, penaltyExposure }, isFr, province } = inputs;
  const evMultiple = estimatedEBITDA > 0 ? Math.round(annualRevenue / Math.max(estimatedEBITDA, 1)) : 5;
  return `
ENTERPRISE instructions:
Every finding must calculate the enterprise value effect (EBITDA x ${evMultiple}x multiple).
Revenue: $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource}), EBITDA: $${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource}), gross margin: ${grossMarginPct}%.
${exactNetIncome > 0 ? `Net income last year: $${exactNetIncome.toLocaleString()}` : ""}
${ownerSalary > 0 ? `Owner salary: $${ownerSalary.toLocaleString()} — assess ${inputs.country === "US" ? "W-2 salary vs S-corp distributions vs defined benefit plan" : "T4 vs dividends vs IPP"}` : ""}
${inputs.country === "US" ? `Entity structure: ${profile.structure || "LLC/S-corp"} — assess reasonable comp, QBI deduction, QSBS eligibility.` : `RDTOH / CDA: ${profile.has_cda_balance ? "CDA balance — tax-free capital dividend opportunity" : "N/A"}, passive income vs $50K threshold.`}
${overdue > 0 ? `Overdue obligations: ${overdue}, penalty exposure: $${penaltyExposure.toLocaleString()}` : ""}
${exitHorizon !== "unknown" ? `Exit horizon: ${exitHorizon} — ensure every finding links to exit timing.` : ""}
${isFr ? "Respond in French for all text fields. Keep JSON keys in English." : ""}
RESPOND WITH ONLY VALID JSON NO MARKDOWN.
`;
}

// ── Public builders ────────────────────────────────────────────────────────────

export function buildSystemPrompt(inputs: PromptInputs): string {
  const { tier, isFr, province, annualRevenue, estimatedPayroll, employees } = inputs;
  const { overdue, penaltyExposure, benchmarks } = inputs.ctx;
  const taxCtx      = buildTaxContext(inputs);
  const maxFindings = tierMaxFindings(tier);

  const isUS = inputs.country === 'US';
  const base = `You are a senior ${isUS ? 'US' : 'Canadian'} CFO, tax advisor, and business diagnostician.
Your job is to analyze this business and identify every revenue leak, tax opportunity, government program, and efficiency gap — then recommend specific solutions and service providers.

YOU GENERATE EVERYTHING FROM YOUR OWN KNOWLEDGE. Do not reference slugs from a database. Create your own slugs in kebab-case.

Province: ${province} | Language: ${isFr ? "French" : "English"} | Tier: ${tier}
${taxCtx ? `Tax context: ${taxCtx}` : ""}

${isUS ? "INDUSTRY BENCHMARKS (from DB or use US averages):" : "INDUSTRY BENCHMARKS (from DB or use Canadian averages):"}
${buildBenchmarkList(benchmarks)}

INSTRUCTIONS:
1. FINDINGS: Identify up to ${maxFindings} specific revenue leaks. Every finding needs:
   - Exact dollar amount calculated from actual revenue $${(annualRevenue ?? 0).toLocaleString()}
   - The formula used (calculation_shown)
   - Concrete action steps
   - Specific government programs that apply to THIS finding
   - Specific service providers (affiliates) that fix THIS finding

2. PROGRAMS: In the top-level programs[] array, list EVERY government program this business is eligible for based on province, industry, structure, and activities. Include:
   - Federal programs: SR&ED (if any R&D/innovation), CDAP (digital), Canada Job Grant (if employees), CSBFP (financing), NRC IRAP (if innovation), BDC financing
   - Provincial programs specific to ${province}: ${province === "QC" ? "RS&DE additionnel QC, C3i, Investissement Quebec, Emploi-Quebec" : province === "ON" ? "Ontario Made ITC, Ontario Job Creation Partnership" : province === "BC" ? "BC Employer Training Grant, BC Idea Fund" : "check provincial programs"}
   ${isUS ? "- NEVER leave programs[] empty. Every US business qualifies for at least 3-4 federal or state programs." : "- NEVER leave programs[] empty. Every Canadian business qualifies for at least 3-4 programs."}
   - Include official URLs and accurate max_amount figures.

${isUS ? "3. AFFILIATES in findings: Recommend real US service providers:" : "3. AFFILIATES in findings: Recommend real Canadian service providers:"}
   - Accounting: CPA firms, BDO, MNP, Deloitte, Grant Thornton, local CPAs
   - Payroll: Wagepoint, Payworks, ADP Canada, Ceridian
   - Banking: BDC, EDC, ATB, local credit unions
   - Software: QuickBooks, Sage, FreshBooks, Dext
   - HR: Humi, Collage HR, Rise People
   - Legal: relevant law firms for the issue

4. CALCULATIONS: Every dollar figure must be derived from ACTUAL data below.
   DATA CONFIDENCE LABELS — follow these strictly:
   • VERIFIED = from uploaded document (${isUS ? "Form 1120-S/W-2" : "T2/T4"}, financials, bank). Treat as authoritative. Do not hedge.
   • INTAKE = user-entered exact value. High confidence. Use directly.
   • ESTIMATED = computed by formula or headcount proxy. Treat as approximate.
     When using ESTIMATED values, add "(estimated)" to calculation_shown and
     keep dollar ranges wide (±30%) to reflect uncertainty.
   • DEFAULT = industry average used because no data provided.
     When using DEFAULT values, explicitly flag findings with "based on industry average" in description.

   Revenue = $\${(annualRevenue ?? 0).toLocaleString()} [\${revenueSource}]
   \${estimatedPayroll > 0 ? \`Payroll = $\${estimatedPayroll.toLocaleString()} [\${profile.exact_payroll_total ? "INTAKE" : profile.qb_payroll_ttm ? "QB_VERIFIED" : "ESTIMATED — headcount x $55K proxy"}]\` : "Payroll = not provided"}
   EBITDA = $\${estimatedEBITDA.toLocaleString()} [\${ebitdaSource}]
   Gross margin = \${grossMarginPct}% [\${profile.gross_margin_pct ? "INTAKE" : profile.qb_gross_profit_ttm ? "QB_VERIFIED" : "DEFAULT — industry average"}]
   Tax drag = $\${estimatedTaxDrag.toLocaleString()} [ESTIMATED — flat formula, not actual tax return]
   \${overdue > 0 ? \`Overdue obligations = \${overdue}, penalty exposure = $\${penaltyExposure.toLocaleString()}\` : ""}
   \${province ? \`Province = \${province}\` : ""}

5. LANGUAGE: ${isFr ? "All text fields in French. JSON keys stay in English." : "English."}

RESPOND WITH ONLY VALID JSON — NO MARKDOWN, NO PREAMBLE.`;

  const yourBenchmarks = computeYourBenchmarks(inputs);
  const baseWithBenchmarks = yourBenchmarks ? base + "\n\n" + yourBenchmarks : base;

  if (tier === "enterprise") {
    return baseWithBenchmarks + buildEnterpriseInstructions(inputs, taxCtx);
  }
  return baseWithBenchmarks;
}

export function buildUserPrompt(inputs: PromptInputs): string {
  const {
    profile, tier, isFr, province, employees,
    annualRevenue, revenueSource, estimatedEBITDA, ebitdaSource,
    grossMarginPct, estimatedPayroll, ownerSalary, exactNetIncome,
    estimatedTaxDrag, exitHorizon, hasHoldco, passiveOver50k,
    lcgeEligible, rdtohBalance, hasCDA, sredLastYear,
    ctx: { obligations, overdue, penaltyExposure },
  } = inputs;

  return `Analyze this \${tier} business and return a complete JSON diagnostic report.

DATA QUALITY SUMMARY (read before generating findings):
- Revenue confidence: \${
    revenueSource.includes("verified") || revenueSource.includes("uploaded") ? "HIGH — from uploaded documents. Use exact figures." :
    revenueSource.includes("QuickBooks") || revenueSource.includes("Stripe") || revenueSource.includes("Plaid") ? "MEDIUM-HIGH — from connected integration. Reliable." :
    revenueSource.includes("intake") || revenueSource.includes("exact") ? "MEDIUM — user-entered exact value." :
    "LOW — estimated from monthly x 12. Dollar amounts in findings should show ranges, not single points."
  }
- Payroll confidence: \${profile.exact_payroll_total ? "HIGH — exact intake value" : profile.qb_payroll_ttm ? "HIGH — QuickBooks TTM" : employees > 0 ? "LOW — headcount proxy ($55K/employee). Flag payroll findings as estimates." : "NONE — no payroll data."}
- Financial statements uploaded: \${inputs.docData?.financials ? "YES — use these as authoritative" : "NO — using intake estimates"}
- ${inputs.country === "US" ? "Form 1120/1120-S" : "T2 return"} uploaded: \${inputs.docData?.t2 ? "YES — treat as authoritative" : "NO — tax findings based on estimates"}

CRITICAL INSTRUCTION: When data confidence is LOW or NONE, your findings must:
1. Show dollar ranges (e.g. "$8K–$24K/yr") rather than single precise numbers
2. Include "Based on estimated revenue" in calculation_shown
3. Set severity no higher than "medium" unless there is legal/compliance evidence independent of revenue size
4. Do NOT invent financial details not in the profile

BUSINESS PROFILE:
- Name: ${profile.business_name || "Unknown"}
- Industry: ${profile.industry_label || profile.industry || "Unknown"}
- Province: ${province}
- Structure: ${profile.structure || profile.business_structure || "Unknown"}
- Annual revenue: $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource})
- Employees: ${employees}
- Fiscal year end: month ${profile.fiscal_year_end_month || 12}
${estimatedPayroll > 0  ? `- Total payroll: $${estimatedPayroll.toLocaleString()}` : ""}
${estimatedEBITDA > 0   ? `- EBITDA: $${estimatedEBITDA.toLocaleString()} (${ebitdaSource})` : ""}
${grossMarginPct > 0    ? `- Gross margin: ${grossMarginPct}%` : ""}
${ownerSalary > 0       ? `- Owner salary/dividends: $${ownerSalary.toLocaleString()}` : ""}
${exactNetIncome > 0    ? `- Net income last year: $${exactNetIncome.toLocaleString()}` : ""}
${exitHorizon !== "unknown" ? `- Exit horizon: ${exitHorizon}` : ""}
${hasHoldco             ? "- Has holdco: YES" : ""}
${passiveOver50k        ? "- Passive income > $50K: YES" : ""}
${inputs.country !== "US" && lcgeEligible ? "- LCGE eligible: YES" : inputs.country === "US" && lcgeEligible ? "- QSBS eligible: YES" : ""}
${inputs.country !== "US" && rdtohBalance > 0 ? `- RDTOH balance: $${rdtohBalance.toLocaleString()}` : ""}
${hasCDA                ? "- CDA balance: YES" : ""}
${sredLastYear > 0      ? `- SR&ED claimed last year: $${sredLastYear.toLocaleString()}` : ""}
${estimatedTaxDrag > 0  ? `- Estimated annual tax drag: $${estimatedTaxDrag.toLocaleString()}` : ""}
${inputs.qbArOverdue && inputs.qbArOverdue > 0 ? `- AR overdue >30 days: $${inputs.qbArOverdue.toLocaleString()} (CASH FLOW RISK)` : ""}
${inputs.qbBankBalance && inputs.qbBankBalance > 0 ? `- Bank balance: $${inputs.qbBankBalance.toLocaleString()}` : ""}
${inputs.stripeChurnRate && inputs.stripeChurnRate > 0 ? `- Stripe churn rate: ${inputs.stripeChurnRate.toFixed(1)}%` : ""}
${inputs.stripeRefundRate && inputs.stripeRefundRate > 0 ? `- Stripe refund rate: ${inputs.stripeRefundRate.toFixed(1)}%` : ""}
${inputs.dataSource ? `- Data source: ${inputs.dataSource}` : ""}
${(() => {
  const d = inputs.docData;
  if (!d) return "";
  const lines: string[] = [];
  if (d.t2) {
    lines.push(`\nVERIFIED ${inputs.country === "US" ? "FORM 1120/1120-S" : "T2 CORPORATE RETURN"} DATA (treat as authoritative — from actual ${inputs.country === "US" ? "IRS filing" : "CRA filing"}):`);
    if (d.t2.tax_year)                lines.push(`  Tax year: ${d.t2.tax_year}`);
    if (d.t2.net_income_before_tax)   lines.push(`  Net income before tax: $${(d.t2.net_income_before_tax ?? 0).toLocaleString()}`);
    if (d.t2.taxable_income)          lines.push(`  Taxable income: $${(d.t2.taxable_income ?? 0).toLocaleString()}`);
    if (d.t2.total_tax_payable)       lines.push(`  Total tax payable: $${(d.t2.total_tax_payable ?? 0).toLocaleString()}`);
    if (inputs.country !== "US") {
      if (d.t2.small_business_deduction) lines.push(`  SBD claimed: $${(d.t2.small_business_deduction ?? 0).toLocaleString()}`);
      if (d.t2.sred_credit_claimed)     lines.push(`  SR&ED credit: $${(d.t2.sred_credit_claimed ?? 0).toLocaleString()}`);
      if (d.t2.rdtoh_balance)           lines.push(`  RDTOH balance: $${(d.t2.rdtoh_balance ?? 0).toLocaleString()}`);
      if (d.t2.passive_income)          lines.push(`  Passive income: $${(d.t2.passive_income ?? 0).toLocaleString()}`);
    }
    if (d.t2.confidence)              lines.push(`  Parse confidence: ${d.t2.confidence}`);
  }
  if (d.financials) {
    lines.push("\nVERIFIED FINANCIAL STATEMENTS DATA (treat as authoritative):");
    if (d.financials.total_revenue)   lines.push(`  Total revenue: $${(d.financials.total_revenue ?? 0).toLocaleString()}`);
    if (d.financials.gross_profit)    lines.push(`  Gross profit: $${(d.financials.gross_profit ?? 0).toLocaleString()}`);
    if (d.financials.gross_margin_pct)lines.push(`  Gross margin: ${d.financials.gross_margin_pct.toFixed(1)}%`);
    if (d.financials.ebitda)          lines.push(`  EBITDA: $${(d.financials.ebitda ?? 0).toLocaleString()}`);
    if (d.financials.net_income)      lines.push(`  Net income: $${(d.financials.net_income ?? 0).toLocaleString()}`);
    if (d.financials.total_assets)    lines.push(`  Total assets: $${(d.financials.total_assets ?? 0).toLocaleString()}`);
    if (d.financials.total_liabilities)lines.push(`  Total liabilities: $${(d.financials.total_liabilities ?? 0).toLocaleString()}`);
    if (d.financials.accounts_receivable)lines.push(`  Accounts receivable: $${(d.financials.accounts_receivable ?? 0).toLocaleString()}`);
    if (d.financials.accounts_payable)lines.push(`  Accounts payable: $${(d.financials.accounts_payable ?? 0).toLocaleString()}`);
    if (d.financials.confidence)      lines.push(`  Parse confidence: ${d.financials.confidence}`);
  }
  if (d.gst) {
    lines.push(`\nVERIFIED ${inputs.country === "US" ? "SALES TAX / FORM 941 RETURN" : "GST/HST RETURN"} DATA:`);
    if (d.gst.total_sales_and_other_revenue) lines.push(`  Reported ${inputs.country === "US" ? "taxable sales" : "GST sales"}: $${(d.gst.total_sales_and_other_revenue ?? 0).toLocaleString()}`);
    if (d.gst.gst_hst_collected)             lines.push(`  ${inputs.country === "US" ? "Sales tax collected" : "GST/HST collected"}: $${(d.gst.gst_hst_collected ?? 0).toLocaleString()}`);
    if (d.gst.input_tax_credits)             lines.push(`  ${inputs.country === "US" ? "Input tax credits" : "ITCs"} claimed: $${(d.gst.input_tax_credits ?? 0).toLocaleString()}`);
    if (d.gst.net_tax_remitted)              lines.push(`  Net remitted: $${(d.gst.net_tax_remitted ?? 0).toLocaleString()}`);
    if (d.gst.quick_method !== undefined && inputs.country !== "US") lines.push(`  Quick method elected: ${d.gst.quick_method ? "YES" : "NO"}`);
  }
  if (d.t4) {
    lines.push(`\nVERIFIED ${inputs.country === "US" ? "W-2 / PAYROLL SUMMARY" : "T4 SUMMARY"} DATA:`);
    if (d.t4.total_employment_income) lines.push(`  Total ${inputs.country === "US" ? "W-2" : "T4"} employment income: $${(d.t4.total_employment_income ?? 0).toLocaleString()}`);
    if (d.t4.number_of_t4s)           lines.push(`  Number of ${inputs.country === "US" ? "W-2s" : "T4s"} issued: ${d.t4.number_of_t4s}`);
    if (inputs.country !== "US") {
      if (d.t4.total_cpp_deducted)    lines.push(`  Total CPP deducted: $${(d.t4.total_cpp_deducted ?? 0).toLocaleString()}`);
      if (d.t4.total_ei_deducted)     lines.push(`  Total EI deducted: $${(d.t4.total_ei_deducted ?? 0).toLocaleString()}`);
    }
  }
  return lines.join("\n");
})()}

COMPLIANCE:
- Obligations tracked: ${obligations.length}
- Overdue: ${overdue}
- Penalty exposure: $${(penaltyExposure ?? 0).toLocaleString()}

BUSINESS ACTIVITIES:
- Has payroll: ${profile.has_payroll ? "YES" : "NO"}
- Does R&D / innovation: ${profile.does_rd ? "YES" : "NO"}
- Exports goods/services: ${profile.exports_goods ? "YES" : "NO"}
- Has physical location: ${profile.has_physical_location ? "YES" : "NO"}
- Handles personal data: ${profile.handles_data ? "YES" : "NO"}
- Has accountant/CPA: ${profile.has_accountant ? "YES" : "NO"}
- Uses payroll software: ${profile.uses_payroll_software ? "YES" : "NO"}

Return ONLY this JSON structure (no markdown fences):
${JSON_SCHEMA}`;
}
