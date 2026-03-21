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
import { FRUXAL_VOICE }          from "@/lib/ai/identity";

export function buildSoloPrompts(ctx: DiagCtx): { systemPrompt: string; userPrompt: string } {
  const {
    profile, province, annualRevenue, revenueSource,
    employees, isFr, taxCtx, leakList, programList, benchmarkList,
    overdue, penaltyExposure,
  } = ctx;

  const industry  = profile.industry_label || profile.industry || "business";
  const bizName   = profile.business_name  || "this business";
  const structure = profile.structure      || "sole_proprietorship";

  const systemPrompt = `${FRUXAL_VOICE}

You are analyzing ${bizName}, a ${industry} operating in ${province} as a ${structure}.
Annual revenue: $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource}).
Employees: ${employees}.

${taxCtx}

─── THINK BEFORE YOU WRITE JSON ───────────────────────────────────────────────
Before producing any JSON, reason through these questions in order:

1. HST/GST THRESHOLD
   Revenue is $${(annualRevenue ?? 0).toLocaleString()}. The mandatory registration threshold is $30,000.
   ${annualRevenue < 30_000
     ? "They are BELOW the threshold. Should they register voluntarily for ITC recovery? Calculate the net benefit."
     : annualRevenue < 50_000
     ? "They are ABOVE the threshold. Are they registered? If not, back-taxes + penalties apply. Calculate penalty exposure."
     : "They are well above threshold. Confirm they are registered and filing correctly. Is Quick Method election optimal?"}

2. BUSINESS STRUCTURE
   Currently a ${structure}.
   At what revenue point does incorporation save more than it costs (~$3K setup + $2K/yr compliance)?
   ${annualRevenue >= 80_000
     ? `At $${annualRevenue.toLocaleString()}, incorporation is likely worth analyzing. Model the T4 vs dividend split.`
     : "Below the typical incorporation breakeven. Sole prop deductions (home office, vehicle, equipment) may be the bigger lever."}

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

5. BIGGEST LEVER
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

${buildQualityBar("solo")}

${buildSolutionMatrix("solo", province, annualRevenue, employees, industry, profile.has_payroll ?? false, profile.does_rd ?? false)}

STRUCTURAL RULES:
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
11. MANDATORY WRITE ORDER: scores → savings_anchor → executive_summary → totals → cpa_briefing → risk_matrix → benchmark_comparisons → exit_readiness → priority_sequence → findings.
    If token budget is tight: shorten finding descriptions. NEVER skip or truncate earlier sections.
${isFr ? "12. All text fields in French. JSON keys stay in English." : ""}
RESPOND WITH ONLY VALID JSON — NO MARKDOWN, NO PREAMBLE, NO TRAILING TEXT.`;

  const userPrompt = `Analyze this solo/micro business and return a complete JSON diagnostic report.

PROFILE:
- Industry:          ${industry}
- Province:          ${province}
- Structure:         ${structure}
- Annual revenue:    $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource})
- Employees:         ${employees}
- Has accountant:    ${profile.has_accountant  ? "YES" : "NO"}
- Has bookkeeper:    ${profile.has_bookkeeper  ? "YES" : "NO"}
- Does R&D:          ${profile.does_rd         ? "YES" : "NO"}
- Physical location: ${profile.has_physical_location ? "YES" : "NO"}
- E-commerce:        ${profile.has_ecommerce   ? "YES" : "NO"}
${overdue > 0 ? `- ⚠️  OVERDUE OBLIGATIONS: ${overdue} — estimated penalty $${penaltyExposure.toLocaleString()}` : ""}

Return ONLY this JSON (no markdown fences):
${buildDiagnosticSchema("solo", 5)}`;

  return { systemPrompt, userPrompt };
}
