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
    profile, province, annualRevenue, revenueSource,
    estimatedPayroll, estimatedEBITDA, ebitdaSource, grossMarginPct,
    employees, isFr, taxCtx, leakList, programList, benchmarkList,
    overdue, penaltyExposure, ownerSalary,
  } = ctx;

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
   → CPP: T4 salary above $68,500 triggers 11.9% combined (employer + employee). Over-contributing?
   → At what salary level does additional T4 become net-negative vs dividends?
   → Model the dollar saving between current mix and optimal.

2. PAYROLL COMPLIANCE
   ${employees} employees${estimatedPayroll > 0 ? `, ~$${estimatedPayroll.toLocaleString()} estimated payroll` : ""}.
   → Are ROEs current? EHT/WSIB thresholds reached?
   → Payroll software: ${profile.has_payroll ? "has payroll" : "NO payroll system flagged"}.
   ${profile.has_payroll ? "→ Is the current payroll tool Canadian? Handling ROEs, T4s, direct deposit correctly?" : "→ Manual payroll = compliance risk. What is the penalty exposure?"}

3. HST / GST
   → Quick Method election: at $${(annualRevenue ?? 0).toLocaleString()} revenue, is it applicable?
   Quick Method rates: service ~8.8% (ON), retail ~4.4%. Compare to actual remittance.
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
   ${profile.does_rd ? "→ R&D flagged YES. Is ALL eligible work being claimed? Software dev, process improvement, prototyping?" : "→ R&D not flagged. Does this ${industry} do ANY process improvement, custom software, or technical development?"}
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
