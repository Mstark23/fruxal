// =============================================================================
// lib/ai/prompts/diagnostic/business.ts
//
// BUSINESS TIER — $150K–$1M revenue, growing SMBs with employees.
//
// Self-contained: owns its own prompt logic. Imports shared utilities only.
// Nothing here is imported by solo.ts or enterprise.ts.
// =============================================================================

import { DiagCtx }               from "./types";
import { buildDiagnosticSchema } from "./schema";
import { buildSolutionMatrix }   from "./solution-matrix";
import { buildQualityBar }       from "./quality-bar";
import { FRUXAL_VOICE }          from "@/lib/ai/identity";

export function buildBusinessPrompts(ctx: DiagCtx): { systemPrompt: string; userPrompt: string } {
  const {
    profile, province, country, annualRevenue, revenueSource,
    estimatedPayroll, estimatedEBITDA, ebitdaSource, grossMarginPct,
    employees, isFr, taxCtx, leakList, programList, benchmarkList,
    overdue, penaltyExposure, ownerSalary,
  } = ctx;
  if ((country ?? "CA") === "US") return buildUSBusinessPrompts(ctx);

  const industry  = profile.industry_label || profile.industry || "business";
  const bizName   = profile.business_name  || "this business";
  const structure = profile.structure      || "corporation";

  const systemPrompt = `${FRUXAL_VOICE}

You are analyzing ${bizName}, a ${industry} operating in ${province}.
Revenue: $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource}) | EBITDA: ~$${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource})
Employees: ${employees} | Gross margin: ${grossMarginPct}%${ownerSalary > 0 ? ` | Owner salary: $${ownerSalary.toLocaleString()}` : ""}

${taxCtx}

─── THINK BEFORE YOU WRITE JSON ───────────────────────────────────────────────
Reason through every check below before producing any output. State a finding only if you
have calculated a real dollar impact from this business's actual numbers.

1. T4 SALARY vs DIVIDENDS
   Owner salary: $${ownerSalary > 0 ? ownerSalary.toLocaleString() : "not provided"}
   Revenue: $${(annualRevenue ?? 0).toLocaleString()} | EBITDA: ~$${(estimatedEBITDA ?? 0).toLocaleString()}
   → What is the after-tax optimal T4 vs eligible dividend split?
   → CPP: T4 salary above $71,300 (2025 YMPE) triggers 11.9% combined CPP1. CPP2 adds 4% on $71,300–$81,900. Is owner over-contributing?
   → At what salary level does additional T4 become net-negative vs dividends?
   → Model the dollar saving between current mix and optimal.

2. PAYROLL COMPLIANCE
   ${employees} employees${estimatedPayroll > 0 ? `, ~$${estimatedPayroll.toLocaleString()} estimated payroll` : ""}.
   → Are ROEs current? EHT/WSIB thresholds reached?
   → Payroll software: ${profile.has_payroll ? "has payroll" : "NO payroll system flagged"}.
   ${profile.has_payroll ? "→ Is the current payroll tool Canadian? Handling ROEs, T4s, direct deposit correctly?" : "→ Manual payroll = compliance risk. What is the penalty exposure?"}

3. HST / GST
   → Quick Method election: at $${(annualRevenue ?? 0).toLocaleString()} revenue, is it applicable?
   ${province === "QC" ? "QC NOTE: Quick Method applies to GST only (5%) — no Quick Method for QST. Assess GST Quick Method savings only." : "Quick Method rates (ON/HST): service ~8.8%, retail ~4.4%. Compare to actual remittance."}
   → Max revenue to use Quick Method: $400K in preceding year — confirm eligibility.
   → Input tax credits: are all eligible business expenses claiming full ITCs?
   → Any exempt supplies being incorrectly taxed or vice versa?

4. ACCOUNTS RECEIVABLE
   Typical DSO for ${industry}: 30–45 days.
   → What is the working capital cost of slow collections?
   → At $${annualRevenue.toLocaleString()} revenue, every 10 extra days DSO = ~$${Math.round(annualRevenue / 365 * 10).toLocaleString()} tied up.

5. INSURANCE GAPS
   → GL, professional liability, cyber, key person — what is likely missing for a ${employees}-person ${industry}?
   → Key person insurance: if owner is incapacitated, what is the business continuity risk?

6. SR&ED ELIGIBILITY
   ${profile.does_rd ? "→ R&D flagged YES. Is ALL eligible work being claimed? Software dev, process improvement, prototyping?" : `→ R&D not flagged. Does this ${industry} do ANY process improvement, custom software, or technical development that could qualify?`}
   → CCPC refundable rate: 35% federal on first $3M eligible. ${province === "QC" ? "QC adds 30% provincial refundable." : ""}

7. BIGGEST LEVER
   Given the above, what is the single highest-dollar opportunity?
   State the dollar amount before writing any JSON.

Only after this reasoning, produce the JSON report.
───────────────────────────────────────────────────────────────────────────────

GOVERNMENT PROGRAMS — include applicable slugs in program_slugs:
${programList || "None matched"}

LEAK DETECTORS — additional context:
${leakList || "None"}

INDUSTRY BENCHMARKS:
${benchmarkList || "Use Canadian SMB averages for this industry"}

${buildQualityBar("business")}

${buildSolutionMatrix("business", province, annualRevenue, employees, industry, profile.has_payroll ?? false, profile.does_rd ?? false)}

STRUCTURAL RULES:
${annualRevenue > 0 && revenueSource.includes("estimate") ? `0. DATA NOTE: Revenue is an estimate. Dollar amounts in findings must show ranges (e.g. "$4K–$12K"), not single figures. Set severity ≤ medium for revenue-dependent findings.` : ""}
1. Calculate every dollar from ACTUAL revenue $${(annualRevenue ?? 0).toLocaleString()} and EBITDA $${(estimatedEBITDA ?? 0).toLocaleString()}.
2. Maximum 7 findings. No finding under $2,000 annual impact.
3. Every finding MUST include ebitda_improvement AND enterprise_value_improvement. Assume 3–5× EBITDA multiple. Show the math.
4. second_order_effects is a PLAIN STRING — NOT an array.
5. REQUIRED — totals: compute ALL 6 fields from findings BEFORE writing the findings array.
6. REQUIRED — cpa_briefing: at least 2 talking_points {point, point_fr}, 2 questions_to_ask, real CRA form numbers.
7. REQUIRED — risk_matrix: at least 4 entries.
8. REQUIRED — benchmark_comparisons: at least 5 entries — EBITDA margin, gross margin, revenue per employee, effective tax rate, working capital ratio. Every entry needs your_value_raw and top_quartile_raw as plain numbers.
9. REQUIRED — exit_readiness: score + at least 1 value_killer + 1 value_builder + next_step.
10. REQUIRED — priority_sequence: exactly 5 entries using rank/action/action_fr/why_first/why_first_fr/expected_result/ebitda_improvement/enterprise_value_improvement.
11. MANDATORY WRITE ORDER: scores → savings_anchor → executive_summary → totals → cpa_briefing → risk_matrix → benchmark_comparisons → exit_readiness → priority_sequence → findings.
    If tight on tokens: trim finding descriptions. NEVER skip earlier sections.
${isFr ? "12. All text fields in French. JSON keys stay in English." : ""}
RESPOND WITH ONLY VALID JSON — NO MARKDOWN, NO PREAMBLE, NO TRAILING TEXT.`;

  const userPrompt = `Analyze this small business and return a complete JSON diagnostic report.

PROFILE:
- Business:          ${bizName}
- Industry:          ${industry}
- Province:          ${province}
- Structure:         ${structure}
- Annual revenue:    $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource})
- Gross margin:      ${grossMarginPct}%
- Est. EBITDA:       $${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource})
- Employees:         ${employees}
${estimatedPayroll > 0 ? `- Est. payroll:      $${estimatedPayroll.toLocaleString()}` : ""}
${ownerSalary > 0      ? `- Owner salary:      $${ownerSalary.toLocaleString()}` : ""}
- Has payroll:       ${profile.has_payroll  ? "YES" : "NO"}
- Does R&D:          ${profile.does_rd      ? "YES" : "NO"}
- Has accountant:    ${profile.has_accountant  ? "YES" : "NO"}
- Has bookkeeper:    ${profile.has_bookkeeper  ? "YES" : "NO"}
- Physical location: ${profile.has_physical_location ? "YES" : "NO"}
- Handles data:      ${profile.handles_data ? "YES" : "NO"}
${overdue > 0 ? `- ⚠️  OVERDUE OBLIGATIONS: ${overdue} — penalty exposure: $${penaltyExposure.toLocaleString()}` : ""}

${(() => {
  const d = ctx.docData;
  if (!d || (!d.t2 && !d.financials && !d.gst && !d.t4)) return "";
  const lines: string[] = ["\nVERIFIED DOCUMENT DATA (treat as authoritative, overrides estimates below):"];
  if (d.t2?.net_income_before_tax) lines.push(`  T2: Net income $${d.t2.net_income_before_tax.toLocaleString()}, tax payable $${(d.t2.total_tax_payable ?? 0).toLocaleString()}`);
  if (d.t2?.small_business_deduction) lines.push(`  T2: SBD claimed $${d.t2.small_business_deduction.toLocaleString()}`);
  if (d.t2?.sred_credit_claimed) lines.push(`  T2: SR&ED credit $${d.t2.sred_credit_claimed.toLocaleString()}`);
  if (d.financials?.total_revenue) lines.push(`  Financials: Revenue $${d.financials.total_revenue.toLocaleString()}, Gross margin ${(d.financials.gross_margin_pct ?? 0).toFixed(1)}%, EBITDA $${(d.financials.ebitda ?? 0).toLocaleString()}, Net income $${(d.financials.net_income ?? 0).toLocaleString()}`);
  if (d.gst?.quick_method !== undefined) lines.push(`  GST: Quick method elected = ${d.gst.quick_method ? "YES — already active" : "NO — assess eligibility"}`);
  if (d.t4?.total_employment_income) lines.push(`  T4: Total payroll $${d.t4.total_employment_income.toLocaleString()}, ${d.t4.number_of_t4s ?? 0} employees on T4`);
  return lines.join("\n");
})()}

Return ONLY this JSON (no markdown fences):
${buildDiagnosticSchema("business", 7)}`;

  return { systemPrompt, userPrompt };
}


// =============================================================================
// US BUSINESS TIER — $150K–$1M revenue, US SMBs with employees
// =============================================================================
function buildUSBusinessPrompts(ctx: DiagCtx): { systemPrompt: string; userPrompt: string } {
  const {
    profile, province: state, annualRevenue, revenueSource,
    estimatedPayroll, estimatedEBITDA, ebitdaSource, grossMarginPct,
    employees, isFr, taxCtx, leakList, programList, benchmarkList,
    overdue, penaltyExposure, ownerSalary,
  } = ctx;

  const industry  = profile.industry_label || profile.industry || "business";
  const bizName   = profile.business_name  || "this business";
  const structure = profile.structure      || "s_corp";

  const systemPrompt = `${FRUXAL_VOICE}

You are analyzing ${bizName}, a ${industry} operating in ${state} (US).
Revenue: $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource}) | EBITDA: ~$${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource})
Employees: ${employees} | Gross margin: ${grossMarginPct}%${ownerSalary > 0 ? ` | Owner W-2: $${ownerSalary.toLocaleString()}` : ""}

${taxCtx}

─── THINK BEFORE YOU WRITE JSON ───────────────────────────────────────────────

1. OWNER COMPENSATION STRUCTURE
   Owner W-2: $${ownerSalary > 0 ? ownerSalary.toLocaleString() : "not provided"} | EBITDA: ~$${(estimatedEBITDA ?? 0).toLocaleString()}
   → For S-corp: is owner W-2 "reasonable compensation"? IRS scrutiny below ~40% of net profit.
   → C-corp: excess compensation deductible; dividends are double-taxed. Is structure optimal?
   → FICA savings: each $10K shifted from W-2 to S-corp distribution saves ~$1,530 in FICA.
   → Model: current vs optimal W-2/distribution split. Dollar difference = finding.

2. PAYROLL COMPLIANCE
   ${employees} employees | Est. payroll: ${estimatedPayroll > 0 ? `$${estimatedPayroll.toLocaleString()}` : "not provided"}
   → Form 941 (quarterly) and Form 940 (annual FUTA) filing current?
   → State SUI registered in every state where employees work?
   → Workers comp coverage current for ${state}?
   → Misclassification risk: any 1099 contractors doing W-2 employee work?
   → WOTC screening: are eligible hires (veterans, SNAP recipients) being certified via Form 8850?

3. SALES TAX NEXUS
   → Economic nexus in how many states? $100K / 200 transactions threshold post-Wayfair.
   → ${state} sales tax registered and filing?
   → SaaS/digital services: nexus rules differ by state — verify taxability.
   → Penalty exposure for unregistered states: back tax + 25% penalty + interest.

4. FEDERAL DEDUCTIONS BEING MISSED
   → Section 179: up to $1,220,000 immediate expensing on equipment/software.
   → Bonus depreciation: 80% first-year on qualifying assets (2024).
   → QBI deduction (Section 199A): 20% of qualified business income for pass-throughs.
   → Health insurance premiums: 100% deductible for S-corp shareholders (must be on payroll).
   → Retirement plans: SEP-IRA (25% of W-2, max $69K), Solo 401(k), SIMPLE IRA.

5. R&D TAX CREDIT (Section 41)
   ${profile.does_rd ? "→ R&D flagged YES. Qualified Research Expenses (QREs): wages, supplies, contract research. 20% incremental credit or 14% ASC method. Document all eligible work." : `→ Does this ${industry} do process improvement, custom software, prototyping, or technical development? May qualify for R&D credit.`}
   → Startups <$5M revenue: up to $500K credit against payroll taxes (Form 6765).

6. ACCOUNTS RECEIVABLE
   → DSO for ${industry}: typically 30–45 days.
   → At $${annualRevenue.toLocaleString()} revenue, every 10 extra days DSO = ~$${Math.round(annualRevenue / 365 * 10).toLocaleString()} tied up.
   → Bad debt reserve: is write-off methodology consistent with accrual accounting?

7. BIGGEST LEVER
   State the single highest-dollar opportunity as a number before writing JSON.

Only after this reasoning, produce the JSON report.
───────────────────────────────────────────────────────────────────────────────

GOVERNMENT PROGRAMS — include applicable slugs in program_slugs:
${programList || "None matched"}

LEAK DETECTORS — additional context:
${leakList || "None"}

INDUSTRY BENCHMARKS:
${benchmarkList || "Use US SMB averages for this industry and state"}

${buildQualityBar("business")}

${buildSolutionMatrix("business", state, annualRevenue, employees, industry, profile.has_payroll ?? false, profile.does_rd ?? false)}

STRUCTURAL RULES:
1. Calculate every dollar from ACTUAL revenue $${(annualRevenue ?? 0).toLocaleString()} and EBITDA $${(estimatedEBITDA ?? 0).toLocaleString()}.
2. Use USD. Reference IRS forms (W-2, 941, 940, 1120-S, Schedule K-1, Form 6765, 8850), not CRA.
3. Maximum 7 findings. No finding under $2,000 annual impact.
4. Every finding MUST include ebitda_improvement AND enterprise_value_improvement. Assume 3–5× EBITDA. Show math.
5. second_order_effects is a PLAIN STRING — NOT an array.
6. REQUIRED — totals: compute ALL 6 fields from findings BEFORE writing the findings array.
RESPOND WITH ONLY VALID JSON — NO MARKDOWN, NO PREAMBLE, NO TRAILING TEXT.`;

  const userPrompt = `Analyze this US business and return a complete JSON diagnostic report.

PROFILE:
- Industry:       ${industry}
- State:          ${state}
- Structure:      ${structure}
- Annual revenue: $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource})
- Gross margin:   ${grossMarginPct}%
- Est. EBITDA:    $${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource})
- Employees:      ${employees}
${estimatedPayroll > 0 ? `- Est. payroll:   $${estimatedPayroll.toLocaleString()}` : ""}
${ownerSalary > 0 ? `- Owner W-2:      $${ownerSalary.toLocaleString()}` : ""}
- Has accountant: ${profile.has_accountant  ? "YES" : "NO"}
- Does R&D:       ${profile.does_rd         ? "YES" : "NO"}
`;

  return { systemPrompt, userPrompt };
}
