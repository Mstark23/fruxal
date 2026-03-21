// =============================================================================
// lib/ai/prompts/diagnostic/enterprise.ts
//
// ENTERPRISE TIER — $1M+ revenue, owner-managed CCPCs.
//
// Self-contained: owns its own prompt logic. The most complex tier —
// covers CCPC-specific tax planning, estate freeze, RDTOH, CDA, LCGE, IPP.
// Nothing here is imported by solo.ts or business.ts.
// =============================================================================

import { DiagCtx }               from "./types";
import { buildDiagnosticSchema } from "./schema";
import { buildSolutionMatrix }   from "./solution-matrix";
import { buildQualityBar }       from "./quality-bar";
import { FRUXAL_VOICE }          from "@/lib/ai/identity";

export function buildEnterprisePrompts(ctx: DiagCtx): { systemPrompt: string; userPrompt: string } {
  const {
    profile, province, annualRevenue, revenueSource,
    estimatedPayroll, estimatedEBITDA, ebitdaSource, grossMarginPct,
    employees, isFr, taxCtx, leakList, programList, benchmarkList,
    overdue, penaltyExposure, ownerSalary, exactNetIncome, exitHorizon,
    hasHoldco, passiveOver50k, lcgeEligible, rdtohBalance, hasCDA,
    sredLastYear, estimatedTaxDrag, obligationsCount,
  } = ctx;

  const industry    = profile.industry_label || profile.industry || "business";
  const bizName     = profile.business_name  || "this corporation";
  const structure   = profile.structure || profile.business_structure || "corporation";
  const evMultiple  = "4–6× EBITDA";
  const evLow       = Math.round(estimatedEBITDA * 4);
  const evHigh      = Math.round(estimatedEBITDA * 6);

  const systemPrompt = `${FRUXAL_VOICE}

You are analyzing ${bizName}, a ${industry} in ${province} generating $${(Number(annualRevenue) || 0).toLocaleString()} revenue.
This is a CCPC-level diagnostic. Your mandate: find every dollar of tax leakage, structural inefficiency,
and compliance risk — and calculate the enterprise value effect at ${evMultiple} (current EV range: $${(Number(evLow) || 0).toLocaleString()}–$${(Number(evHigh) || 0).toLocaleString()}).

EBITDA: ~$${(Number(estimatedEBITDA) || 0).toLocaleString()} (${ebitdaSource}) | Gross margin: ${grossMarginPct}%
Employees: ${employees}${ownerSalary > 0 ? ` | Owner salary: $${(Number(ownerSalary) || 0).toLocaleString()}` : ""}

${taxCtx}

─── THINK BEFORE YOU WRITE JSON ───────────────────────────────────────────────
Reason through ALL 10 checks before writing any output. State findings only for items where
you can calculate a real dollar impact from this business's actual numbers.

1. SALARY vs DIVIDEND MIX
   Owner salary: $${ownerSalary > 0 ? (Number(ownerSalary) || 0).toLocaleString() : "unknown"} | Revenue: $${(Number(annualRevenue) || 0).toLocaleString()} | EBITDA: ~$${(Number(estimatedEBITDA) || 0).toLocaleString()}
   → Optimal T4 vs eligible dividend split to minimize combined corporate + personal tax?
   → CPP over-contribution: salary >$68,500 triggers 11.9% total (employer + employee) — quantify if over-contributing.
   → At what salary level does additional T4 become net-negative vs dividends?
   → Model after-tax take-home: current mix vs optimal. Dollar difference = the finding.

2. RDTOH DIVIDEND REFUND
   Balance: $${rdtohBalance > 0 ? (Number(rdtohBalance) || 0).toLocaleString() : "unknown — assess if passive income earned"}
   → Eligible RDTOH refunded at 38.33% per $1 eligible dividend paid.
   → Non-eligible RDTOH refunded at 38.33% per $1 non-eligible dividend.
   → If no dividends declared recently: calculate stranded refund amount.
   → Dividend declared NOW unlocks: $${Math.round(rdtohBalance * 0.3833).toLocaleString()} refund (if balance confirmed).

3. CDA (CAPITAL DIVIDEND ACCOUNT)
   CDA: ${hasCDA ? "YES — tax-free capital dividend opportunity" : "check — life insurance proceeds, capital gains, sold assets?"}
   → CDA balance × owner marginal rate = pure tax saving if paid as capital dividend.
   → ON marginal rate ~53.53%, QC ~53.31%, AB ~48.0%, BC ~53.5%.
   → If CDA exists and not paid out: calculate the tax cost of delay.

4. LCGE (LIFETIME CAPITAL GAINS EXEMPTION)
   Eligible: ${lcgeEligible ? "YES — $1,016,602 exemption available (2024)" : "ASSESS — run QSBC share test"}
   → QSBC test: >90% assets in active business? Owned by individual or related group?
   → Purification strategy needed? Move passive assets out of opco before exit event.
   → On a sale at ${evMultiple}: LCGE saves ~$${Math.round(1_016_602 * 0.2676 * 0.5353).toLocaleString()} in tax per owner (at ON marginal rate).

5. PASSIVE INCOME GRIND-DOWN
   Passive >$50K: ${passiveOver50k ? "YES — SBD grind-down confirmed" : "assess — check investment income"}
   → Every $1 passive over $50K → $5 SBD lost. At $150K passive = full SBD eliminated.
   → Full SBD loss cost: ~$60,000/yr (diff between 9% SBD and 15% general rate on first $500K).
   → Solutions: prescribed rate loans to family, corporate-class mutual funds, RDTOH-exempt life insurance.
   → Quantify the annual tax cost at this business's passive income level.

6. IPP vs RRSP
   Owner salary: $${ownerSalary > 0 ? (Number(ownerSalary) || 0).toLocaleString() : "needed to assess"} | Exit horizon: ${exitHorizon}
   → IPP outperforms RRSP from ~age 40 onward. Past service contribution room can be $200K–$500K+.
   → RRSP limit 2024: $31,560. IPP can significantly exceed this with past service.
   → Fully deductible to the corporation. Actuarial cost ~$3K–5K setup. Quantify net benefit.
   → Only works with T4 income — not dividends.

7. HOLDCO STRUCTURE
   Has holdco: ${hasHoldco ? "YES" : "NO — assess if missing intercorporate dividend planning"}
   → Without holdco: corporate surplus trapped in opco, exposed to creditors.
   → Section 112 deduction: intercorporate dividends between connected corps are tax-free.
   → Surplus stripping — freeze strategy + upstream loan planning.
   → Section 55 safe income analysis if dividends flowed between corps.

8. SR&ED REFUNDABLE CREDITS
   SR&ED last year: $${sredLastYear > 0 ? (Number(sredLastYear) || 0).toLocaleString() : "none — are they missing eligible work?"}
   → CCPC: 35% REFUNDABLE federal ITC on first $3M eligible R&D.
   ${province === "QC" ? "→ QC: additional 30% refundable provincial credit." : `→ ${province}: check provincial SR&ED rates.`}
   → Eligible work: software development, process improvement, new product R&D, custom manufacturing processes.
   → If $0 SR&ED and doing any of the above: high-value finding.

9. ESTATE FREEZE & SUCCESSION
   Exit horizon: ${exitHorizon !== "unknown" ? exitHorizon : "not specified — assess if owner 50+"}
   → Section 86 estate freeze: crystallize current FMV, all future growth to next gen or family trust.
   → Freeze before value appreciates + LCGE on future shares = double tax benefit.
   → Timing: freeze NOW on $${(Number(evLow) || 0).toLocaleString()} EV vs after growth to $${Math.round(evLow * 1.5).toLocaleString()} = $${Math.round((evLow * 1.5 - evLow) * 0.2676 * 0.5353).toLocaleString()} incremental tax on the growth.

10. COMPLIANCE & AUDIT RISK
    Obligations: ${obligationsCount} tracked | Overdue: ${overdue} | Penalty exposure: $${(Number(penaltyExposure) || 0).toLocaleString()}
    → At $${(Number(annualRevenue) || 0).toLocaleString()} revenue, what is the CRA audit probability for this industry?
    → Director liability: overdue source deductions expose directors personally.
    → Key person risk: if owner is incapacitated, what happens to the business and estate?

After reasoning through all 10: identify the 8–12 highest-impact findings and write the JSON.
───────────────────────────────────────────────────────────────────────────────

GOVERNMENT PROGRAMS — include applicable slugs in program_slugs:
${programList || "None matched"}

LEAK DETECTORS — additional context:
${leakList || "None"}

INDUSTRY BENCHMARKS:
${benchmarkList || "Use Canadian enterprise averages for this industry"}

${buildQualityBar("enterprise")}

${buildSolutionMatrix("enterprise", province, annualRevenue, employees, industry, profile.has_payroll ?? false, profile.does_rd ?? false)}

STRUCTURAL RULES:
1. Calculate every dollar from ACTUAL revenue $${(Number(annualRevenue) || 0).toLocaleString()} (${revenueSource}) and EBITDA $${(Number(estimatedEBITDA) || 0).toLocaleString()} (${ebitdaSource}).
2. Every finding MUST include ebitda_improvement AND enterprise_value_improvement. Assume ${evMultiple}. Show the math in calculation_shown.
3. Minimum 8, maximum 12 findings. No finding under $5,000 annual impact.
4. second_order_effects is a PLAIN STRING — NOT an array. Describe the cascading effect (e.g. fixing salary mix → RDTOH timing → CDA → estate freeze all interact).
5. Executive summary MUST open with the single biggest dollar figure. CFO/board-ready language. No generic opener.
6. REQUIRED — totals: compute ALL 6 fields from findings BEFORE writing the findings array.
7. REQUIRED — cpa_briefing: at least 4 talking_points {point, point_fr}, 3+ questions_to_ask, real CRA form numbers (T2, T4, T5, T661, RC4288, etc.), tax_exposures with specific dollar amount, rdtoh_strategy/cda_strategy/lcge_plan where applicable.
8. REQUIRED — risk_matrix: at least 5 entries — tax compliance, key person, data/IP, financing covenants, exit timing.
9. REQUIRED — benchmark_comparisons: exactly 6 entries — EBITDA margin, gross margin, revenue per employee, effective tax rate, owner comp as % of revenue, working capital ratio. Every entry needs your_value_raw and top_quartile_raw as plain numbers.
10. REQUIRED — exit_readiness: at least 2 value_killers with valuation_discount, 2 value_builders with valuation_premium_amount, specific next_step.
11. REQUIRED — priority_sequence: exactly 6 entries. Each needs rank/action/action_fr/why_first/why_first_fr/expected_result/ebitda_improvement/enterprise_value_improvement.
12. MANDATORY WRITE ORDER: scores → savings_anchor → executive_summary → totals → cpa_briefing → risk_matrix → benchmark_comparisons → exit_readiness → priority_sequence → findings.
    If token budget is tight: reduce to 8 findings, shorten descriptions. NEVER skip or truncate earlier sections.
${isFr ? "13. All text fields in French. JSON keys stay in English." : ""}
RESPOND WITH ONLY VALID JSON — NO MARKDOWN, NO PREAMBLE, NO TRAILING TEXT.`;

  const userPrompt = `Conduct a full CCPC financial diagnostic. Return a complete JSON report.

BUSINESS PROFILE
- Name:             ${bizName}
- Industry:         ${industry}
- Province:         ${province}
- Structure:        ${structure}
- Fiscal Year End:  Month ${profile.fiscal_year_end_month || 12}
- Annual Revenue:   $${(Number(annualRevenue) || 0).toLocaleString()} (${revenueSource})
- Employees:        ${employees}
- Gross Margin:     ${grossMarginPct}%
- Est. EBITDA:      $${(Number(estimatedEBITDA) || 0).toLocaleString()} (${ebitdaSource})
${estimatedPayroll > 0 ? `- Est. Payroll:     $${(Number(estimatedPayroll) || 0).toLocaleString()}` : ""}

OWNER FINANCIALS
- Owner Salary:     ${ownerSalary > 0 ? `$${(Number(ownerSalary) || 0).toLocaleString()}` : "Not provided"}
- Net Income (LY):  ${exactNetIncome > 0 ? `$${(Number(exactNetIncome) || 0).toLocaleString()}` : "Not provided"}
- Est. Tax Drag:    ${estimatedTaxDrag > 0 ? `$${(Number(estimatedTaxDrag) || 0).toLocaleString()}/yr` : "Not calculated"}
- Exit Horizon:     ${exitHorizon !== "unknown" ? exitHorizon : "Not specified"}

CORPORATE TAX FLAGS
- Holdco:                ${hasHoldco      ? "YES" : "NO/Unknown"}
- Passive Income >$50K:  ${passiveOver50k ? "YES — SBD grind-down" : "NO/Unknown"}
- LCGE Eligible:         ${lcgeEligible   ? "YES" : "Not confirmed"}
- RDTOH Balance:         ${rdtohBalance > 0 ? `$${(Number(rdtohBalance) || 0).toLocaleString()}` : "Unknown"}
- CDA Balance:           ${hasCDA         ? "YES" : "NO/Unknown"}
- SR&ED Last Year:       ${sredLastYear > 0 ? `$${(Number(sredLastYear) || 0).toLocaleString()}` : "None"}

COMPLIANCE
- Obligations tracked:   ${obligationsCount}
- Overdue:               ${overdue}
- Penalty exposure:      $${(Number(penaltyExposure) || 0).toLocaleString()}

BUSINESS FLAGS
- Has Payroll:       ${profile.has_payroll          ? "YES" : "NO"}
- Does R&D:          ${profile.does_rd              ? "YES" : "NO"}
- Has Accountant:    ${profile.has_accountant       ? "YES" : "NO"}
- Has Bookkeeper:    ${profile.has_bookkeeper       ? "YES" : "NO"}
- Physical Location: ${profile.has_physical_location ? "YES" : "NO"}
- Handles Data:      ${profile.handles_data         ? "YES" : "NO"}

Return ONLY this JSON (no markdown fences):
${buildDiagnosticSchema("enterprise", 12)}`;

  return { systemPrompt, userPrompt };
}
