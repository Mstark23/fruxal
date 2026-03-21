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
  province:   string;
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

export function buildTaxContext(inputs: PromptInputs): string {
  const { province, hasHoldco, passiveOver50k, lcgeEligible, rdtohBalance, hasCDA, sredLastYear } = inputs;
  const lines: string[] = [];
  if (province === "QC") lines.push("QST 9.975% applies. Bill 96 French language obligations. SR&ED additionnel QC available.");
  if (province === "AB") lines.push("No provincial income tax. No provincial sales tax.");
  if (province === "BC") lines.push("PST 7% applies. Employer Health Tax if payroll > $500K.");
  if (province === "ON") lines.push("HST 13%. EHT applies on payroll. WSIB mandatory. Ontario Made ITC available.");
  if (hasHoldco)         lines.push("Holdco structure — assess RDTOH, CDA, inter-corporate dividends.");
  if (passiveOver50k)    lines.push("Passive income > $50K — small business deduction grind-down applies.");
  if (lcgeEligible)      lines.push("LCGE eligible — optimize for $971,190 capital gains exemption.");
  if (rdtohBalance > 0)  lines.push(`RDTOH balance: $${(rdtohBalance ?? 0).toLocaleString()} — dividend timing opportunity.`);
  if (hasCDA)            lines.push("CDA balance present — tax-free capital dividend opportunity.");
  if (sredLastYear > 0)  lines.push(`SR&ED claimed last year: $${(sredLastYear ?? 0).toLocaleString()}`);
  return lines.join(" ");
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
    .join("\n") || "No DB benchmarks — use verified Canadian industry averages; flag each as estimate";
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
    "cra_forms_relevant": ["<T2125>", "<T4>"],
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
${ownerSalary > 0 ? `Owner salary: $${ownerSalary.toLocaleString()} — assess T4 vs dividends vs IPP` : ""}
RDTOH / CDA: ${profile.has_cda_balance ? "CDA balance — tax-free capital dividend opportunity" : "N/A"}, passive income vs $50K threshold.
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

  const base = `You are a senior Canadian CFO, tax advisor, and business diagnostician.
Your job is to analyze this business and identify every revenue leak, tax opportunity, government program, and efficiency gap — then recommend specific solutions and service providers.

YOU GENERATE EVERYTHING FROM YOUR OWN KNOWLEDGE. Do not reference slugs from a database. Create your own slugs in kebab-case.

Province: ${province} | Language: ${isFr ? "French" : "English"} | Tier: ${tier}
${taxCtx ? `Tax context: ${taxCtx}` : ""}

INDUSTRY BENCHMARKS (from DB or use Canadian averages):
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
   - NEVER leave programs[] empty. Every Canadian business qualifies for at least 3-4 programs.
   - Include official URLs and accurate max_amount figures.

3. AFFILIATES in findings: Recommend real Canadian service providers:
   - Accounting: CPA firms, BDO, MNP, Deloitte, Grant Thornton, local CPAs
   - Payroll: Wagepoint, Payworks, ADP Canada, Ceridian
   - Banking: BDC, EDC, ATB, local credit unions
   - Software: QuickBooks, Sage, FreshBooks, Dext
   - HR: Humi, Collage HR, Rise People
   - Legal: relevant law firms for the issue

4. CALCULATIONS: Every dollar figure must be derived from:
   Revenue = $${(annualRevenue ?? 0).toLocaleString()}
   ${estimatedPayroll > 0 ? `Payroll = $${estimatedPayroll.toLocaleString()} (${employees} employees)` : ""}
   ${overdue > 0 ? `Overdue obligations = ${overdue}, penalty exposure = $${penaltyExposure.toLocaleString()}` : ""}
   ${province ? `Province = ${province}` : ""}

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

  return `Analyze this ${tier} business and return a complete JSON diagnostic report.

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
${lcgeEligible          ? "- LCGE eligible: YES" : ""}
${rdtohBalance > 0      ? `- RDTOH balance: $${rdtohBalance.toLocaleString()}` : ""}
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
    lines.push("\nVERIFIED T2 CORPORATE RETURN DATA (treat as authoritative — from actual CRA filing):");
    if (d.t2.tax_year)                lines.push(`  Tax year: ${d.t2.tax_year}`);
    if (d.t2.net_income_before_tax)   lines.push(`  Net income before tax: $${(d.t2.net_income_before_tax ?? 0).toLocaleString()}`);
    if (d.t2.taxable_income)          lines.push(`  Taxable income: $${(d.t2.taxable_income ?? 0).toLocaleString()}`);
    if (d.t2.total_tax_payable)       lines.push(`  Total tax payable: $${(d.t2.total_tax_payable ?? 0).toLocaleString()}`);
    if (d.t2.small_business_deduction)lines.push(`  SBD claimed: $${(d.t2.small_business_deduction ?? 0).toLocaleString()}`);
    if (d.t2.sred_credit_claimed)     lines.push(`  SR&ED credit: $${(d.t2.sred_credit_claimed ?? 0).toLocaleString()}`);
    if (d.t2.rdtoh_balance)           lines.push(`  RDTOH balance: $${(d.t2.rdtoh_balance ?? 0).toLocaleString()}`);
    if (d.t2.passive_income)          lines.push(`  Passive income: $${(d.t2.passive_income ?? 0).toLocaleString()}`);
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
    lines.push("\nVERIFIED GST/HST RETURN DATA:");
    if (d.gst.total_sales_and_other_revenue) lines.push(`  Reported GST sales: $${(d.gst.total_sales_and_other_revenue ?? 0).toLocaleString()}`);
    if (d.gst.gst_hst_collected)             lines.push(`  GST/HST collected: $${(d.gst.gst_hst_collected ?? 0).toLocaleString()}`);
    if (d.gst.input_tax_credits)             lines.push(`  ITCs claimed: $${(d.gst.input_tax_credits ?? 0).toLocaleString()}`);
    if (d.gst.net_tax_remitted)              lines.push(`  Net remitted: $${(d.gst.net_tax_remitted ?? 0).toLocaleString()}`);
    if (d.gst.quick_method !== undefined)    lines.push(`  Quick method elected: ${d.gst.quick_method ? "YES" : "NO"}`);
  }
  if (d.t4) {
    lines.push("\nVERIFIED T4 SUMMARY DATA:");
    if (d.t4.total_employment_income) lines.push(`  Total T4 employment income: $${(d.t4.total_employment_income ?? 0).toLocaleString()}`);
    if (d.t4.number_of_t4s)           lines.push(`  Number of T4s issued: ${d.t4.number_of_t4s}`);
    if (d.t4.total_cpp_deducted)      lines.push(`  Total CPP deducted: $${(d.t4.total_cpp_deducted ?? 0).toLocaleString()}`);
    if (d.t4.total_ei_deducted)       lines.push(`  Total EI deducted: $${(d.t4.total_ei_deducted ?? 0).toLocaleString()}`);
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
