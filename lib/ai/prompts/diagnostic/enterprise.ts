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
    profile, province, country, annualRevenue, revenueSource,
    estimatedPayroll, estimatedEBITDA, ebitdaSource, grossMarginPct,
    employees, isFr, taxCtx, leakList, programList, benchmarkList,
    overdue, penaltyExposure, ownerSalary, exactNetIncome, exitHorizon,
    hasHoldco, passiveOver50k, lcgeEligible, rdtohBalance, hasCDA,
    sredLastYear, estimatedTaxDrag, obligationsCount,
  } = ctx;
  if ((country ?? "CA") === "US") return buildUSEnterprisePrompts(ctx);

  const industry    = profile.industry_label || profile.industry || "business";
  const bizName     = profile.business_name  || "this corporation";
  const structure   = profile.structure || profile.business_structure || "corporation";
  // Industry-aware EV multiples based on Canadian M&A data
  // Source: BDC, Deloitte Canada M&A Trends, BizBuySell Canada comps
  const industrySlug = (profile.industry_slug || profile.industry || "").toLowerCase();
  function resolveEVMultiple(slug: string): { low: number; high: number; label: string } {
    // Professional services (accounting, legal, consulting, engineering)
    if (/account|cpa|tax|audit|legal|law|consult|engineer|architect|it.service|tech.service|staffing|recruit/.test(slug))
      return { low: 5, high: 9,  label: "5–9× EBITDA" };
    // SaaS / software / tech product
    if (/saas|software|app|platform|tech|digital|cloud|ai|data/.test(slug))
      return { low: 6, high: 12, label: "6–12× EBITDA" };
    // Healthcare / medical / dental / pharmacy
    if (/health|medical|dental|clinic|pharmacy|optom|physio|chiro|veterinar/.test(slug))
      return { low: 5, high: 8,  label: "5–8× EBITDA" };
    // Construction / trades / contracting
    if (/construct|contrac|trade|plumb|electric|hvac|roofing|landscap|excavat/.test(slug))
      return { low: 3, high: 5,  label: "3–5× EBITDA" };
    // Manufacturing / industrial
    if (/manufactur|industrial|fabricat|machin|assembly|processing|packaging/.test(slug))
      return { low: 3, high: 6,  label: "3–6× EBITDA" };
    // Food & beverage / hospitality / restaurant
    if (/food|beverage|restaurant|hospitality|catering|bakery|bar|cafe/.test(slug))
      return { low: 2, high: 4,  label: "2–4× EBITDA" };
    // Retail / e-commerce
    if (/retail|ecommerce|e-commerce|store|shop|boutique|wholesale|distrib/.test(slug))
      return { low: 2, high: 4,  label: "2–4× EBITDA" };
    // Real estate / property management
    if (/real.estate|property|realty|rental|landlord|brokerage/.test(slug))
      return { low: 4, high: 7,  label: "4–7× EBITDA" };
    // Transportation / logistics / trucking
    if (/transport|logistics|trucking|freight|courier|fleet|shipping/.test(slug))
      return { low: 3, high: 5,  label: "3–5× EBITDA" };
    // Financial services / insurance
    if (/financ|insurance|invest|wealth|mortgage|lending|broker/.test(slug))
      return { low: 5, high: 8,  label: "5–8× EBITDA" };
    // Media / marketing / agency / creative
    if (/market|advertis|media|agency|creative|design|print|pr\b|public.relat/.test(slug))
      return { low: 4, high: 7,  label: "4–7× EBITDA" };
    // Auto / dealership / repair
    if (/auto|car|dealer|vehicle|repair|mechanic|collision/.test(slug))
      return { low: 3, high: 5,  label: "3–5× EBITDA" };
    // Default — general Canadian SMB
    return { low: 4, high: 6, label: "4–6× EBITDA" };
  }

  const evRange    = resolveEVMultiple(industrySlug);
  const evMultiple = evRange.label;
  // Floor: if EBITDA unknown/zero, use revenue multiple as proxy
  const evLow  = estimatedEBITDA > 0 ? Math.round(estimatedEBITDA * evRange.low)  : Math.round(annualRevenue * 0.5);
  const evHigh = estimatedEBITDA > 0 ? Math.round(estimatedEBITDA * evRange.high) : Math.round(annualRevenue * 0.8);

  const systemPrompt = `${FRUXAL_VOICE}

You are analyzing ${bizName}, a ${industry} in ${province} generating $${(annualRevenue ?? 0).toLocaleString()} revenue.
This is a CCPC-level diagnostic. Your mandate: find every dollar of tax leakage, structural inefficiency,
and compliance risk — and calculate the enterprise value effect at ${evMultiple} (current EV range: $${(evLow ?? 0).toLocaleString()}–$${(evHigh ?? 0).toLocaleString()}).

EBITDA: ~$${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource}) | Gross margin: ${grossMarginPct}%
Employees: ${employees}${ownerSalary > 0 ? ` | Owner salary: $${ownerSalary.toLocaleString()}` : ""}

${taxCtx}

─── THINK BEFORE YOU WRITE JSON ───────────────────────────────────────────────
Reason through ALL 10 checks before writing any output. State findings only for items where
you can calculate a real dollar impact from this business's actual numbers.

1. SALARY vs DIVIDEND MIX
   Owner salary: $${ownerSalary > 0 ? ownerSalary.toLocaleString() : "unknown"} | Revenue: $${annualRevenue.toLocaleString()} | EBITDA: ~$${estimatedEBITDA.toLocaleString()}
   → Optimal T4 vs eligible dividend split to minimize combined corporate + personal tax?
   → CPP: T4 salary above $71,300 (2025 YMPE) triggers combined 11.9% CPP1 (employer + employee). CPP2 adds 4% on earnings $71,300–$81,900. Quantify if over-contributing.
   → At what salary level does additional T4 become net-negative vs dividends?
   → Model after-tax take-home: current mix vs optimal. Dollar difference = the finding.

2. RDTOH DIVIDEND REFUND
   Balance: $${rdtohBalance > 0 ? rdtohBalance.toLocaleString() : "unknown — assess if passive income earned"}
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
   Eligible: ${lcgeEligible ? "YES — $1,250,000 exemption (2025, indexed)" : "ASSESS — run QSBC share test"}
   → QSBC test: >90% assets in active business? Owned by individual or related group?
   → Purification strategy needed? Move passive assets out of opco before exit event.
   → On a sale at ${evMultiple}: LCGE saves ~$${Math.round(1_250_000 * 0.5 * (province === "AB" ? 0.480 : province === "QC" ? 0.5331 : province === "BC" ? 0.535 : province === "SK" ? 0.475 : 0.535)).toLocaleString()} in tax per owner (at ${province} top marginal rate, capital gains inclusion 50%).

5. PASSIVE INCOME GRIND-DOWN
   Passive >$50K: ${passiveOver50k ? "YES — SBD grind-down confirmed" : "assess — check investment income"}
   → Every $1 passive over $50K → $5 SBD lost. At $150K passive = full SBD eliminated.
   → Full SBD loss cost: ~$60,000/yr (diff between 9% SBD and 15% general rate on first $500K).
   → Solutions: prescribed rate loans to family, corporate-class mutual funds, RDTOH-exempt life insurance.
   → Quantify the annual tax cost at this business's passive income level.

6. IPP vs RRSP
   Owner salary: $${ownerSalary > 0 ? ownerSalary.toLocaleString() : "needed to assess"} | Exit horizon: ${exitHorizon}
   → IPP outperforms RRSP from ~age 40 onward. Past service contribution room can be $200K–$500K+.
   → RRSP limit 2025: $32,490. IPP can significantly exceed this with past service — especially valuable if owner age 45+.
   → Fully deductible to the corporation. Actuarial cost ~$3K–5K setup. Quantify net benefit.
   → Only works with T4 income — not dividends.

7. HOLDCO STRUCTURE
   Has holdco: ${hasHoldco ? "YES" : "NO — assess if missing intercorporate dividend planning"}
   → Without holdco: corporate surplus trapped in opco, exposed to creditors.
   → Section 112 deduction: intercorporate dividends between connected corps are tax-free.
   → Surplus stripping — freeze strategy + upstream loan planning.
   → Section 55 safe income analysis if dividends flowed between corps.

8. SR&ED REFUNDABLE CREDITS
   SR&ED last year: $${sredLastYear > 0 ? sredLastYear.toLocaleString() : "none — are they missing eligible work?"}
   → CCPC: 35% REFUNDABLE federal ITC on first $3M eligible R&D.
   ${province === "QC" ? "→ QC: additional 30% refundable provincial credit." : `→ ${province}: check provincial SR&ED rates.`}
   → Eligible work: software development, process improvement, new product R&D, custom manufacturing processes.
   → If $0 SR&ED and doing any of the above: high-value finding.

9. ESTATE FREEZE & SUCCESSION
   Exit horizon: ${exitHorizon !== "unknown" ? exitHorizon : "not specified — assess if owner 50+"}
   → Section 86 estate freeze: crystallize current FMV, all future growth to next gen or family trust.
   → Freeze before value appreciates + LCGE on future shares = double tax benefit.
   → Timing: freeze NOW at $${evLow.toLocaleString()} EV vs after growth to $${Math.round(evLow * 1.5).toLocaleString()} = $${Math.round((evLow * 1.5 - evLow) * 0.5 * (province === "AB" ? 0.480 : province === "QC" ? 0.5331 : province === "BC" ? 0.535 : 0.535)).toLocaleString()} incremental tax on that growth (${province} top marginal rate, 50% capital gains inclusion).

10. COMPLIANCE & AUDIT RISK
    Obligations: ${obligationsCount} tracked | Overdue: ${overdue} | Penalty exposure: $${(penaltyExposure ?? 0).toLocaleString()}
    → At $${(annualRevenue ?? 0).toLocaleString()} revenue, what is the CRA audit probability for this industry?
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

${buildQualityBar("enterprise", "US")}

${buildSolutionMatrix("enterprise", province, annualRevenue, employees, industry, profile.has_payroll ?? false, profile.does_rd ?? false, "US")}

STRUCTURAL RULES:
1. Calculate every dollar from ACTUAL revenue $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource}) and EBITDA $${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource}).
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
- Annual Revenue:   $${(annualRevenue ?? 0).toLocaleString()} (${revenueSource})
- Employees:        ${employees}
- Gross Margin:     ${grossMarginPct}%
- Est. EBITDA:      $${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource})
${estimatedPayroll > 0 ? `- Est. Payroll:     $${estimatedPayroll.toLocaleString()}` : ""}

OWNER FINANCIALS
- Owner Salary:     ${ownerSalary > 0 ? `$${ownerSalary.toLocaleString()}` : "Not provided"}
- Net Income (LY):  ${exactNetIncome > 0 ? `$${exactNetIncome.toLocaleString()}` : "Not provided"}
- Est. Tax Drag:    ${estimatedTaxDrag > 0 ? `$${estimatedTaxDrag.toLocaleString()}/yr [ESTIMATED — formula proxy, not actual CRA filing]` : "Not calculated"}
- Exit Horizon:     ${exitHorizon !== "unknown" ? exitHorizon : "Not specified"}

CORPORATE TAX FLAGS
- Holdco:                ${hasHoldco      ? "YES" : "NO/Unknown"}
- Passive Income >$50K:  ${passiveOver50k ? "YES — SBD grind-down" : "NO/Unknown"}
- LCGE Eligible:         ${lcgeEligible   ? "YES" : "Not confirmed"}
- RDTOH Balance:         ${rdtohBalance > 0 ? `$${rdtohBalance.toLocaleString()}` : "Unknown"}
- CDA Balance:           ${hasCDA         ? "YES" : "NO/Unknown"}
- SR&ED Last Year:       ${sredLastYear > 0 ? `$${sredLastYear.toLocaleString()}` : "None"}

COMPLIANCE
- Obligations tracked:   ${obligationsCount}
- Overdue:               ${overdue}
- Penalty exposure:      $${(penaltyExposure ?? 0).toLocaleString()}

BUSINESS FLAGS
- Has Payroll:       ${profile.has_payroll          ? "YES" : "NO"}
- Does R&D:          ${profile.does_rd              ? "YES" : "NO"}
- Has Accountant:    ${profile.has_accountant       ? "YES" : "NO"}
- Has Bookkeeper:    ${profile.has_bookkeeper       ? "YES" : "NO"}
- Physical Location: ${profile.has_physical_location ? "YES" : "NO"}
- Handles Data:      ${profile.handles_data         ? "YES" : "NO"}

Return ONLY this JSON (no markdown fences):
${buildDiagnosticSchema("enterprise", 12, "US")}`;

  return { systemPrompt, userPrompt };
}


// =============================================================================
// US ENTERPRISE TIER — $1M+ revenue, US owner-managed C-corps / S-corps / LLCs
// =============================================================================
function buildUSEnterprisePrompts(ctx: DiagCtx): { systemPrompt: string; userPrompt: string } {
  const {
    profile, province: state, annualRevenue, revenueSource,
    estimatedPayroll, estimatedEBITDA, ebitdaSource, grossMarginPct,
    employees, isFr, taxCtx, leakList, programList, benchmarkList,
    overdue, penaltyExposure, ownerSalary, exitHorizon,
    hasHoldco, sredLastYear, estimatedTaxDrag,
  } = ctx;

  const industry   = profile.industry_label || profile.industry || "business";
  const bizName    = profile.business_name  || "this corporation";
  const structure  = profile.structure      || "s_corp";

  // US EV multiples (similar ranges, US M&A comps)
  const evLow  = estimatedEBITDA > 0 ? Math.round(estimatedEBITDA * 4) : Math.round(annualRevenue * 0.5);
  const evHigh = estimatedEBITDA > 0 ? Math.round(estimatedEBITDA * 8) : Math.round(annualRevenue * 0.9);

  const systemPrompt = `${FRUXAL_VOICE}

You are analyzing ${bizName}, a ${industry} in ${state} (US) generating $${(annualRevenue ?? 0).toLocaleString()} revenue.
Structure: ${structure} | EBITDA: ~$${(estimatedEBITDA ?? 0).toLocaleString()} (${ebitdaSource}) | Gross margin: ${grossMarginPct}%
Employees: ${employees}${ownerSalary > 0 ? ` | Owner W-2: $${ownerSalary.toLocaleString()}` : ""}
Enterprise value range: $${(evLow ?? 0).toLocaleString()}–$${(evHigh ?? 0).toLocaleString()} (4–8× EBITDA)

${taxCtx}

─── THINK BEFORE YOU WRITE JSON — 10 CHECKS ───────────────────────────────────

1. OWNER COMPENSATION & ENTITY STRUCTURE
   Owner W-2: $${ownerSalary > 0 ? ownerSalary.toLocaleString() : "unknown"} | EBITDA: ~$${estimatedEBITDA.toLocaleString()}
   → S-corp: reasonable compensation vs distribution split. FICA on W-2 only — model optimal split.
   → C-corp: double taxation on dividends vs salary deductibility. Is conversion to S-corp or LLC beneficial?
   → If holding company structure: evaluate management fees, IP holding, captive insurance.

2. R&D TAX CREDIT (Section 41)
   ${profile.does_rd || (sredLastYear ?? 0) > 0 ? `R&D flagged. QREs: wages (~65%), supplies (~35%), contract research (65% of external).` : `Does this ${industry} do process improvement, custom software dev, or technical uncertainty work?`}
   → 20% incremental method or 14% ASC method — which gives larger credit at this revenue?
   → ASC method: 14% × (QREs − 50% × avg 3-yr QREs). Calculate both.
   → Payroll tax offset: still available if <$5M gross receipts?

3. SECTION 179 & BONUS DEPRECIATION
   → Section 179: $1,220,000 immediate expensing limit (2024). Phase-out at $3.05M purchases.
   → Bonus depreciation: 80% first-year (2024), 60% (2025), 40% (2026) — accelerate purchases?
   → Cost segregation study: reclassify building components to 5/7/15-yr property for faster depreciation.

4. QUALIFIED BUSINESS INCOME (Section 199A)
   → 20% QBI deduction for S-corps, LLCs, partnerships. Phase-out for specified service trades.
   → At $${annualRevenue.toLocaleString()}, is this business above W-2 wage limitation threshold?
   → W-2 wage limit: deduction capped at 50% of W-2 wages or 25% of wages + 2.5% of qualified property.

5. PAYROLL & EMPLOYMENT TAX
   ${employees} employees | Payroll: ~$${estimatedPayroll > 0 ? estimatedPayroll.toLocaleString() : "estimated"}
   → Form 941 deposits on schedule? 940 FUTA filed? SUTA registered in all employee states?
   → WOTC (Work Opportunity Tax Credit): up to $9,600/eligible hire. Is screening process in place?
   → PEO vs self-administered: at ${employees} employees, is professional employer organization cost-effective?
   → Misclassification: any 1099 contractors vs W-2 employees? IRS 20-factor test risk?

6. SALES TAX NEXUS & WAYFAIR
   → Economic nexus triggered in how many states? Threshold: $100K or 200 transactions.
   → Voluntary disclosure program: retroactive exposure can often be settled for 3 years back + no penalties.
   → Marketplace facilitator laws: if selling via Amazon/Shopify, is tax collection being handled?

7. RETIREMENT PLANS
   → Defined benefit plan: can shelter $200K–$300K+/yr for owner vs $69K SEP-IRA limit.
   → Cash balance plan + 401(k): combined can reach $350K+/yr for owners 55+.
   → Employee 401(k) match: tax deductible, reduces FICA base for S-corp.

8. EXIT PLANNING / QSBS (Section 1202)
   → Qualified Small Business Stock: up to $10M or 10× basis EXCLUDED from federal capital gains if:
     C-corp, held 5+ years, acquired at original issue, active business. Is conversion from S-corp worth it?
   → ${exitHorizon !== "none" ? `Exit horizon: ${exitHorizon}. Optimize structure now.` : "No exit horizon specified — raise QSBS and estate planning questions."}
   → Installment sale vs asset vs stock sale: tax implications at this EV range.

9. HOLDING COMPANY / IP STRUCTURE
   ${hasHoldco ? "Holdco confirmed. Assess: management fees (must be arm's-length), IP holding (royalty deductibility), captive insurance (Section 831(b) micro-captive)." : `At $${annualRevenue.toLocaleString()}, evaluate: separate IP holding entity (royalty stream), captive insurance, real estate segregation.`}

10. BIGGEST LEVER
    State the single highest-dollar opportunity (quantified) before writing JSON.

───────────────────────────────────────────────────────────────────────────────

GOVERNMENT PROGRAMS — include applicable slugs in program_slugs:
${programList || "None matched"}

LEAK DETECTORS — additional context:
${leakList || "None"}

INDUSTRY BENCHMARKS:
${benchmarkList || "Use US enterprise averages for this industry and state"}

${buildQualityBar("enterprise", "US")}

${buildSolutionMatrix("enterprise", state, annualRevenue, employees, industry, profile.has_payroll ?? false, profile.does_rd ?? false, "US")}

STRUCTURAL RULES:
1. Calculate every dollar from ACTUAL revenue $${(annualRevenue ?? 0).toLocaleString()} and EBITDA $${(estimatedEBITDA ?? 0).toLocaleString()}.
2. Use USD. Reference IRS forms (1120-S, W-2, 941, 6765, 8850, 4562, 8996), not CRA.
3. Maximum 9 findings. No finding under $5,000 annual impact at this revenue level.
4. Every finding MUST include ebitda_improvement AND enterprise_value_improvement at 4–8× EBITDA.
5. second_order_effects is a PLAIN STRING — NOT an array.
6. REQUIRED — all sections: totals, cpa_briefing, risk_matrix, benchmark_comparisons, exit_readiness, priority_sequence.
RESPOND WITH ONLY VALID JSON — NO MARKDOWN, NO PREAMBLE, NO TRAILING TEXT.`;

  const userPrompt = `Analyze this US enterprise business and return a complete JSON diagnostic report.

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
- Does R&D:       ${profile.does_rd ? "YES" : "NO"}
- Has holdco:     ${hasHoldco ? "YES" : "NO"}
- Exit horizon:   ${exitHorizon || "not specified"}
`;

  return { systemPrompt, userPrompt };
}
