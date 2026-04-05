// =============================================================================
// lib/ai/prompts/diagnostic/solo.ts
//
// SOLO TIER — $0–$150K revenue, sole proprietors and micro-businesses.
//
// Self-contained: imports shared utilities but owns its own prompt logic.
// Nothing in this file should be imported by business.ts or enterprise.ts.
// =============================================================================

import { DiagCtx }            from "./types";
import { buildDiagnosticSchema } from "./schema";
import { buildSolutionMatrix }   from "./solution-matrix";
import { buildQualityBar }       from "./quality-bar";
import { buildMethodology }      from "./methodology";
import { resolveEVMultiple }     from "./ev-multiples";
import { FRUXAL_VOICE, buildFruxalVoice } from "@/lib/ai/identity";

function industryBenchmarks(industry: string, revenue: number): string {
  const i = industry.toLowerCase();
  if (/restaurant|food|cafe/.test(i)) return "Industry benchmarks: COGS 28-35%, Labor 25-32%, Rent 6-10%, Net margin 3-9%, CC processing 2.5-3.2%";
  if (/construct|contractor|trade/.test(i)) return "Industry benchmarks: Gross margin 25-40%, Labor 30-40% of revenue, Material 25-35%, Net margin 5-12%";
  if (/saas|software|tech/.test(i)) return "Industry benchmarks: Gross margin 70-85%, CAC payback 12-18mo, Churn <5%/yr, R&D 15-25% of revenue";
  if (/consult|professional|legal|account/.test(i)) return "Industry benchmarks: Gross margin 50-70%, Utilization 65-75%, Effective rate $150-400/hr, Overhead 25-35%";
  if (/retail|ecommerce|store/.test(i)) return "Industry benchmarks: Gross margin 40-55%, Inventory turns 4-8x/yr, Shrinkage <2%, CC processing 2.2-3.0%";
  if (/health|medical|dental/.test(i)) return "Industry benchmarks: Collections rate 92-97%, Overhead 55-65%, Net margin 10-20%, Staff cost 25-35%";
  if (/transport|trucking|logistics/.test(i)) return "Industry benchmarks: Operating ratio 85-95%, Fuel 25-35% of revenue, Maintenance 8-12%, Net margin 3-8%";
  if (/real.estate|property/.test(i)) return "Industry benchmarks: Cap rate 5-8%, Operating expense ratio 35-50%, Vacancy 3-8%, NOI margin 50-65%";
  if (revenue < 100000) return "Industry benchmarks: Typical sole proprietor — gross margin varies widely by industry, target 40-60% for service, 30-50% for product";
  return "Industry benchmarks: Typical SMB — gross margin 40-60%, overhead ratio 20-35%, net margin 8-15%";
}

export function buildSoloPrompts(ctx: DiagCtx): { systemPrompt: string; userPrompt: string } {
  const profile = ctx.profile;
  const province = ctx.province;
  const country = ctx.country;
  const annualRevenue = ctx.annualRevenue;
  const revenueSource = ctx.revenueSource;
  const employees = ctx.employees;
  const isFr = ctx.isFr;
  const taxCtx = ctx.taxCtx;
  const leakList = ctx.leakList;
  const programList = ctx.programList;
  const benchmarkList = ctx.benchmarkList;
  const overdue = ctx.overdue;
  const penaltyExposure = ctx.penaltyExposure;
  const grossMarginPct = ctx.grossMarginPct;
  const estimatedPayroll = ctx.estimatedPayroll;
  const estimatedEBITDA = ctx.estimatedEBITDA;
  const ebitdaSource = ctx.ebitdaSource;
  if ((country ?? "CA") === "US") return buildUSSoloPrompts(ctx);

  const industry  = profile.industry_label || profile.industry || "business";
  const bizName   = profile.business_name  || "this business";
  const structure = profile.structure      || "sole_proprietorship";

  // Industry-aware EV multiples — shared logic
  const evRange = resolveEVMultiple(profile.industry_slug || profile.industry || "general");
  const evMultiple = evRange.label;

  const provinceWarning = ctx.provinceDefaulted
    ? `\n\n⚠️ PROVINCE NOT CONFIRMED: Using ${province} as default. Tax rules, WCB/WSIB rates, and provincial programs may not match the actual jurisdiction. Flag all province-specific findings with "Verify: based on ${province} rules — confirm your actual province."\n`
    : "";

  const systemPrompt = `${FRUXAL_VOICE}

You are a forensic financial diagnostic engine. Analyze the business profile provided in the user message.${provinceWarning}

${taxCtx}

${buildMethodology("CA", "solo", industry, annualRevenue, employees, province, structure, grossMarginPct ?? 0, profile.has_payroll ?? false, profile.does_rd ?? false)}

ADDITIONAL CHECKS:
1. HST/GST THRESHOLD
   Revenue is $${(annualRevenue ?? 0).toLocaleString()}. The mandatory registration threshold is $30,000.
   ${annualRevenue < 30_000
     ? "They are BELOW the threshold. Should they register voluntarily for ITC recovery? Calculate the net benefit."
     : annualRevenue < 50_000
     ? "They are ABOVE the threshold. Are they registered? If not, back-taxes + penalties apply. Calculate penalty exposure."
     : "They are well above threshold. Confirm they are registered and filing correctly. Is Quick Method election optimal?"}

2. BUSINESS STRUCTURE
   Currently a ${structure}.
   ${(structure === "corporation" || structure === "ccpc" || structure === "incorporated")
     ? "ALREADY INCORPORATED — skip incorporation timing analysis. Focus instead on: T4 vs dividend optimization, deductible expenses within the corp, and whether a holdco is warranted."
     : `At what revenue does incorporation save more than it costs (~$3K setup + $2K/yr compliance)?
   ${annualRevenue >= 80_000
       ? `At $${annualRevenue.toLocaleString()}, incorporation is worth analyzing. Model the T4 vs dividend split.`
       : "Below breakeven. Sole prop deductions (home office, vehicle, equipment) are the bigger lever."}`}

3. DEDUCTIONS LIKELY BEING MISSED
   Does this ${industry} operator likely have:
   - Home office expenses (if no physical location flagged)?
   - Vehicle log (if mobile or client-visits)?
   - Business use of personal phone, internet, equipment?
   - RRSP contribution room (T4 income generates RRSP room)?
   What is the estimated annual deduction impact?

4. GOVERNMENT PROGRAMS
   Review the program list below. Which apply to this specific ${industry} in ${province}?
   What is the realistic total program value?

5. INDUSTRY-SPECIFIC LEAKS
   For ${industry} businesses at $${(annualRevenue ?? 0).toLocaleString()} revenue:
   ${/restaurant|food|cafe|bar/.test(industry.toLowerCase()) ? "→ Check: food cost % (target 28-32%), labor cost % (target 25-30%), liquor cost (target 18-22%), tip reporting, POS optimization" : ""}
   ${/construct|contractor|trade|plumb|electric/.test(industry.toLowerCase()) ? "→ Check: job costing accuracy, material waste %, subcontractor markup, equipment CCA, insurance classification, CCQ/CNESST rates" : ""}
   ${/saas|software|tech|digital/.test(industry.toLowerCase()) ? "→ Check: gross margin (target 70-80%), CAC, churn rate, SR&ED eligibility, contractor vs employee classification" : ""}
   ${/consult|professional|legal|account/.test(industry.toLowerCase()) ? "→ Check: utilization rate (target 65-75%), effective hourly rate, scope creep, professional liability, RRSP vs IPP" : ""}
   ${/retail|ecommerce|store/.test(industry.toLowerCase()) ? "→ Check: inventory turnover, shrinkage %, markup consistency, return rate, HST Quick Method eligibility" : ""}
   ${/health|medical|dental|clinic/.test(industry.toLowerCase()) ? "→ Check: collections rate, insurance reimbursement, equipment CCA, PHIPA/privacy compliance, professional liability" : ""}
   ${/transport|trucking|logistics/.test(industry.toLowerCase()) ? "→ Check: fuel cost per km, deadhead %, maintenance cost, insurance classification, meal allowance deductions" : ""}

6. BIGGEST LEVER
   Given all of the above, what is the single highest-dollar opportunity for this business?
   State it as a number before writing any JSON.

Only after completing this reasoning, produce the JSON report.
───────────────────────────────────────────────────────────────────────────────

GOVERNMENT PROGRAMS — include applicable slugs in program_slugs:
${programList || "None matched"}

LEAK DETECTORS — additional context from database:
${leakList || "None"}

INDUSTRY BENCHMARKS:
${benchmarkList || "Use Canadian solo operator averages for this industry"}

${buildQualityBar("solo", "CA", industry)}

${buildSolutionMatrix("solo", province, annualRevenue, employees, industry, profile.has_payroll ?? false, profile.does_rd ?? false, "CA")}

STRUCTURAL RULES:
${annualRevenue > 0 && revenueSource.includes("estimate") ? `0. DATA NOTE: Revenue is an estimate. Dollar amounts in findings must show ranges (e.g. "$4K–$12K"), not single figures. Set severity ≤ medium for revenue-dependent findings.` : ""}
1. Calculate every dollar from ACTUAL revenue $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource}).
2. Keep language plain. This owner has no CFO, no accountant on retainer. No jargon.
3. Maximum 5 findings. No finding under $500 annual impact.
4. second_order_effects is a PLAIN STRING — NOT an array. One sentence on the cascade.
5. REQUIRED — totals: compute all 6 fields from findings before writing the findings array.
6. REQUIRED — cpa_briefing: at least 2 talking_points {point, point_fr} and 2 questions_to_ask.
7. REQUIRED — risk_matrix: at least 3 entries.
8. REQUIRED — benchmark_comparisons: at least 4 entries. EBITDA margin and gross margin are mandatory. Include your_value_raw and top_quartile_raw as plain numbers.
9. REQUIRED — exit_readiness: score, value_killers, value_builders, next_step.
10. REQUIRED — priority_sequence: at least 3 entries using rank/action/action_fr/why_first/why_first_fr/expected_result/ebitda_improvement/enterprise_value_improvement.
11. MANDATORY WRITE ORDER: scores → totals → findings → executive_summary → savings_anchor → cpa_briefing → risk_matrix → benchmark_comparisons → exit_readiness → priority_sequence.
    If token budget is tight: reduce cpa_briefing and benchmark descriptions. NEVER truncate findings.
12. When you have more analyses than the finding limit allows, use the FINDING PRIORITY ORDER from the methodology section. Never drop categories 1-3 for categories 7-9.
${isFr ? "14. CRITICAL — FRENCH: Every user-facing text field (title, title_fr, description, description_fr, executive_summary_fr, recommendation_fr, etc.) MUST be in professional Quebec French. Use 'vous' not 'tu'. JSON keys stay in English. Do NOT leave any _fr field empty or in English." : ""}
RESPOND WITH ONLY VALID JSON — NO MARKDOWN, NO PREAMBLE, NO TRAILING TEXT.`;

  const userPrompt = `Analyze this solo/micro business and return a complete JSON diagnostic report.

${industryBenchmarks(industry, annualRevenue)}

PROFILE:
- Industry:          ${industry}
- Province:          ${province}
- Structure:         ${structure}
- Annual revenue:    $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource})
- Gross margin:      ${grossMarginPct}%
- Est. EBITDA:       $${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource})
- Employees:         ${employees}
${estimatedPayroll > 0 ? `- Est. payroll:      $${estimatedPayroll.toLocaleString()}` : ""}
- Has accountant:    ${profile.has_accountant  ? "YES" : "NO"}
- Has bookkeeper:    ${profile.has_bookkeeper  ? "YES" : "NO"}
- Does R&D:          ${profile.does_rd         ? "YES" : "NO"}
- Physical location: ${profile.has_physical_location ? "YES" : "NO"}
- E-commerce:        ${profile.has_ecommerce   ? "YES" : "NO"}
- Has payroll:       ${profile.has_payroll      ? "YES" : "NO"}
${overdue > 0 ? `- ⚠️  OVERDUE OBLIGATIONS: ${overdue} — estimated penalty $${penaltyExposure.toLocaleString()}` : ""}

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
${buildDiagnosticSchema("solo", 5, "CA")}`;

  return { systemPrompt, userPrompt };
}


// =============================================================================
// US SOLO — Sole proprietors, single-member LLCs, micro-businesses
// =============================================================================
function buildUSSoloPrompts(ctx: DiagCtx): { systemPrompt: string; userPrompt: string } {
  const profile = ctx.profile;
  const state = ctx.province;
  const annualRevenue = ctx.annualRevenue;
  const revenueSource = ctx.revenueSource;
  const employees = ctx.employees;
  const isFr = ctx.isFr;
  const taxCtx = ctx.taxCtx;
  const leakList = ctx.leakList;
  const programList = ctx.programList;
  const benchmarkList = ctx.benchmarkList;
  const overdue = ctx.overdue;
  const penaltyExposure = ctx.penaltyExposure;
  const estimatedPayroll = ctx.estimatedPayroll;
  const estimatedEBITDA = ctx.estimatedEBITDA;
  const ebitdaSource = ctx.ebitdaSource;
  const grossMarginPct = ctx.grossMarginPct;

  const industry = profile.industry_label || profile.industry || "business";
  const bizName  = profile.business_name  || "this business";
  const structure = profile.structure     || "sole_proprietorship";

  // Industry-aware EV multiples — shared logic
  const usEvRange = resolveEVMultiple(profile.industry_slug || profile.industry || "general");
  const usEvMultiple = usEvRange.label;

  const usProvinceWarning = ctx.provinceDefaulted
    ? `\n\n⚠️ PROVINCE NOT CONFIRMED: Using ${state} as default. Tax rules, workers comp rates, and state programs may not match the actual jurisdiction. Flag all state-specific findings with "Verify: based on ${state} rules — confirm your actual state."\n`
    : "";

  const systemPrompt = `${buildFruxalVoice("US")}

You are a forensic financial diagnostic engine. Analyze the business profile provided in the user message.${usProvinceWarning}

${taxCtx}

${buildMethodology("US", "solo", industry, annualRevenue, employees, state, structure, grossMarginPct ?? 0, profile.has_payroll ?? false, profile.does_rd ?? false)}

ADDITIONAL CHECKS:

1. SELF-EMPLOYMENT TAX
   SE tax is 15.3% on net earnings up to $168,600, then 2.9% Medicare above.
   Revenue: $${(annualRevenue ?? 0).toLocaleString()}, EBITDA: ~$${(estimatedEBITDA ?? 0).toLocaleString()}
   → Estimated SE tax burden? S-corp election (Form 2553) savings if revenue ≥ $60K?
   → At this revenue, what is the reasonable W-2 salary vs distribution split?
   → Document the annual SE tax saved with S-corp election after payroll costs.

2. BUSINESS STRUCTURE
   Currently: ${structure}.
   ${(structure.includes("llc") || structure.includes("s_corp"))
     ? "Already structured — optimize salary vs distribution split and document reasonable compensation."
     : annualRevenue >= 60_000
     ? `At $${annualRevenue.toLocaleString()}, LLC or S-corp election likely saves $3,000–$12,000/yr in SE tax. Model it.`
     : "Below S-corp breakeven. Focus on deduction optimization."}

3. DEDUCTIONS BEING MISSED
   Does this ${industry} operator likely have:
   - Home office (Section 280A — $5/sq ft simplified or actual)
   - Vehicle (Section 179 / actual vs standard mileage $0.67/mi 2024)
   - Health insurance premiums (100% deductible for self-employed — Schedule 1)
   - SEP-IRA or Solo 401(k): up to $69,000/yr (2024) contribution
   - Business use of phone, internet, software subscriptions
   What is the estimated annual deduction impact at their marginal rate?

4. SALES TAX NEXUS
   Does this business sell goods/services across state lines?
   → Economic nexus: $100K or 200 transactions triggers registration in most states (post-Wayfair).
   → Penalty exposure if unregistered: back taxes + up to 25% penalties.

5. GOVERNMENT PROGRAMS
   Review programs below. Which apply to this ${industry} in ${state}?
   WOTC, SBA microloans, Section 179, R&D credit, STEP grants — what is realistic total?

6. INDUSTRY-SPECIFIC LEAKS
   For ${industry} businesses at $${(annualRevenue ?? 0).toLocaleString()} revenue:
   ${/restaurant|food|cafe|bar/.test(industry.toLowerCase()) ? "→ Check: food cost % (target 28-32%), labor cost % (target 25-30%), liquor cost (target 18-22%), tip reporting compliance, POS optimization" : ""}
   ${/construct|contractor|trade|plumb|electric/.test(industry.toLowerCase()) ? "→ Check: job costing accuracy, material waste %, subcontractor markup, equipment depreciation, insurance classification, bonding" : ""}
   ${/saas|software|tech|digital/.test(industry.toLowerCase()) ? "→ Check: gross margin (target 70-80%), customer acquisition cost, churn rate, hosting costs, R&D credit eligibility, contractor vs employee" : ""}
   ${/consult|professional|legal|account/.test(industry.toLowerCase()) ? "→ Check: utilization rate (target 65-75%), effective hourly rate, scope creep, professional liability coverage, retirement plan optimization" : ""}
   ${/retail|ecommerce|store/.test(industry.toLowerCase()) ? "→ Check: inventory turnover, shrinkage %, markup consistency, return rate, sales tax nexus compliance, credit card processing fees" : ""}
   ${/health|medical|dental|clinic/.test(industry.toLowerCase()) ? "→ Check: collections rate, insurance reimbursement optimization, equipment depreciation, HIPAA compliance costs, professional liability" : ""}
   ${/transport|trucking|logistics/.test(industry.toLowerCase()) ? "→ Check: fuel cost per mile, deadhead %, maintenance cost per mile, insurance classification, per diem deductions, ELD compliance" : ""}

7. BIGGEST LEVER
   Single highest-dollar opportunity stated as a number before JSON.

Only after this reasoning, produce the JSON report.
───────────────────────────────────────────────────────────────────────────────

GOVERNMENT PROGRAMS — include applicable slugs in program_slugs:
${programList || "None matched"}

LEAK DETECTORS — additional context:
${leakList || "None"}

INDUSTRY BENCHMARKS:
${benchmarkList || "Use US SMB averages for this industry and state"}

${buildQualityBar("solo", "US", industry)}

${buildSolutionMatrix("solo", state, annualRevenue, employees, industry, profile.has_payroll ?? false, profile.does_rd ?? false, "US")}

STRUCTURAL RULES:
1. Calculate every dollar from ACTUAL revenue $${(annualRevenue ?? 0).toLocaleString()}.
2. Use USD. Reference IRS forms (Schedule C, Form 941, W-2, 1099-NEC), not CRA forms.
3. Maximum 5 findings. No finding under $500 annual impact.
4. second_order_effects is a PLAIN STRING — NOT an array.
5. REQUIRED — totals: compute all 6 fields from findings before writing the findings array.
6. REQUIRED — cpa_briefing: at least 2 talking_points {point, point_fr} and 2 questions_to_ask.
7. REQUIRED — risk_matrix: at least 3 entries.
8. REQUIRED — benchmark_comparisons: at least 4 entries. EBITDA margin and gross margin are mandatory. Include your_value_raw and top_quartile_raw as plain numbers.
9. REQUIRED — exit_readiness: score, value_killers, value_builders, next_step.
10. REQUIRED — priority_sequence: at least 3 entries using rank/action/action_fr/why_first/why_first_fr/expected_result/ebitda_improvement/enterprise_value_improvement.
11. MANDATORY WRITE ORDER: scores → totals → findings → executive_summary → savings_anchor → cpa_briefing → risk_matrix → benchmark_comparisons → exit_readiness → priority_sequence.
    If token budget is tight: reduce cpa_briefing and benchmark descriptions. NEVER truncate findings.
12. When you have more analyses than the finding limit allows, use the FINDING PRIORITY ORDER from the methodology section. Never drop categories 1-3 for categories 7-9.
RESPOND WITH ONLY VALID JSON — NO MARKDOWN, NO PREAMBLE, NO TRAILING TEXT.`;

  const userPrompt = `Analyze this US solo/micro business and return a complete JSON diagnostic report.

${industryBenchmarks(industry, annualRevenue)}

PROFILE:
- Industry:       ${industry}
- State:          ${state}
- Structure:      ${structure}
- Annual revenue: $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource})
- Gross margin:   ${grossMarginPct}%
- Est. EBITDA:    $${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource})
- Employees:      ${employees}
${estimatedPayroll > 0 ? `- Est. payroll:   $${estimatedPayroll.toLocaleString()}` : ""}
- Has accountant: ${profile.has_accountant  ? "YES" : "NO"}
- Has bookkeeper: ${profile.has_bookkeeper  ? "YES" : "NO"}
- Does R&D:       ${profile.does_rd         ? "YES" : "NO"}
- Physical location: ${profile.has_physical_location ? "YES" : "NO"}
- E-commerce:     ${profile.has_ecommerce   ? "YES" : "NO"}
- Has payroll:    ${profile.has_payroll      ? "YES" : "NO"}
${overdue > 0 ? `- ⚠️  OVERDUE OBLIGATIONS: ${overdue} — estimated penalty $${penaltyExposure.toLocaleString()}` : ""}

Return ONLY this JSON (no markdown fences):
${buildDiagnosticSchema("solo", 5, "US")}`;

  return { systemPrompt, userPrompt };
}
