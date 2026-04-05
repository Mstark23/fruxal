// =============================================================================
// lib/ai/prompts/diagnostic/methodology.ts
//
// THE FRUXAL FORENSIC ENGINE — World-Class Financial Leak Detection
//
// This is NOT a checklist. This is an EXECUTION FRAMEWORK that tells Claude
// exactly WHAT to calculate, HOW to calculate it, and WHAT the output number
// must be — for this specific business, at this specific revenue, in this
// specific industry, in this specific jurisdiction.
//
// Every instruction produces a NUMBER. Every number produces a FINDING.
//
// DESIGN PRINCIPLE: Pass Claude RAW INPUTS + RULES/FORMULAS. Let Claude
// calculate. Never pre-compute dollar amounts in TypeScript.
// =============================================================================

export type Country = "CA" | "US";

export function buildMethodology(
  country: Country,
  tier: "solo" | "business" | "enterprise",
  industry: string,
  annualRevenue: number,
  employees: number,
  province: string,
  structure: string,
  grossMarginPct: number,
  hasPayroll: boolean,
  doesRd: boolean,
): string {
  const isUS = country === "US";
  const i = industry.toLowerCase();
  const rev = annualRevenue;
  const emp = Math.max(employees, 0);
  const margin = grossMarginPct || 0;

  // Industry benchmark targets (these ARE benchmarks, kept as-is)
  const targets = getIndustryTargets(i);
  // Tax rules for Claude to apply (raw rules, not pre-computed amounts)
  const taxCalc = getTaxCalculations(isUS, rev, emp, structure, province, margin);
  // Compliance rules for Claude to apply
  const complianceCalc = getComplianceExposure(isUS, rev, emp, province, hasPayroll);

  return `
══════════════════════════════════════════════════════════════════════════════
FRUXAL FORENSIC ENGINE — WORLD-CLASS LEAK DETECTION
══════════════════════════════════════════════════════════════════════════════

YOU ARE NOT WRITING ADVICE. YOU ARE CALCULATING LOSSES.

RAW BUSINESS DATA (use these inputs for ALL calculations):
  Revenue: $${rev.toLocaleString()}/yr
  Industry: ${industry} | Structure: ${structure} | Location: ${province} (${country})
  Employees: ${emp} | Gross margin: ${margin}%
  Has payroll: ${hasPayroll} | Does R&D: ${doesRd}

DERIVED VALUES (you must calculate these yourself):
  Monthly revenue = revenue ÷ 12
  Estimated EBITDA = revenue × (margin / 100) × 0.5–0.7 (use 0.6 as default, adjust for industry)
  Daily revenue = revenue ÷ 365

Your job: find every dollar leaving this business that shouldn't be.
Every finding = a specific calculation with a specific dollar result.

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 1: TAX STRUCTURE — Calculate the exact optimal structure
══════════════════════════════════════════════════════════════════════════════

${taxCalc}

DO THIS NOW: Calculate the EXACT annual tax difference between current
structure and optimal structure. This number becomes a finding if > $${tier === "solo" ? "500" : "2,000"}.

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 2: COST vs BENCHMARK — Calculate the gap on every line
══════════════════════════════════════════════════════════════════════════════

For ${industry} at $${rev.toLocaleString()}:

${targets.map(t => `  ${t.category}: This business = estimate from data. Target = ${t.target}.
    → If above target: gap = (actual% − ${t.targetPct}%) × revenue = finding amount
    → Minimum gap to report: $${tier === "solo" ? "500" : "2,000"}/yr`).join("\n")}

DO THIS NOW: For each category above, calculate the dollar gap.
Only report categories where the gap exceeds the minimum.

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 3: PAYROLL — Calculate the exact cost of inefficiency
══════════════════════════════════════════════════════════════════════════════

${emp > 0 ? `
Revenue per employee: calculate revenue ÷ ${emp}
Industry target for ${industry}: ${targets.find(t => t.category === "Revenue/Employee")?.target || "$80K-$150K"}

${isUS ? `
FICA CALCULATION RULES (you must apply these):
  SE tax rate: 15.3% on net self-employment income (12.4% SS + 2.9% Medicare)
  SS wage cap (2025): $176,100 — only 2.9% Medicare applies above this
  Additional Medicare: 0.9% surcharge above $200K (single) / $250K (joint)

  Step 1: Estimate EBITDA from revenue ($${rev.toLocaleString()}) × margin (${margin}%) × 0.6
  Step 2: Calculate current owner FICA based on structure (${structure})
  Step 3: Calculate optimal S-corp W-2 at 40-60% of EBITDA
  Step 4: Calculate FICA on optimal W-2 only (distributions are FICA-exempt)
  Step 5: Annual FICA saving = current FICA − optimal FICA

Workers comp: Is the NAICS/classification code correct? Wrong code = 15-40% premium overpayment.
  Rule: Estimate payroll at 25% of revenue, then wrong-code overpayment = payroll × avg rate (~3%) × 15%
` : `
CPP CALCULATION RULES (you must apply these):
  T4 salary above YMPE ($71,300 2025): triggers 11.9% combined CPP1
  CPP2: 4% on earnings $71,300–$81,900
  Optimal T4: balance CPP cost vs RRSP room generation vs dividend tax integration

  Step 1: Estimate EBITDA from revenue ($${rev.toLocaleString()}) × margin (${margin}%) × 0.6
  Step 2: Model T4 salary at different levels and calculate CPP cost
  Step 3: Compare against dividend-only approach for tax integration

Workers comp (${province === "QC" ? "CNESST" : province === "ON" ? "WSIB" : "WCB"}): classification code audit
  Rule: Estimate payroll at 25% of revenue, then wrong-class overpayment = payroll × avg rate (~3%) × 15%
`}
` : `
Solo operator — no employees.
${isUS
  ? `SE TAX CALCULATION RULES:
  Revenue: $${rev.toLocaleString()}, Margin: ${margin}%, Structure: ${structure}
  SE tax rule: 15.3% on net self-employment income up to $176,100 (2025)
  Above $176,100: only 2.9% Medicare applies
  Additional 0.9% Medicare surcharge above $200K single / $250K joint

  S-corp comparison:
  - S-corp rule: 15.3% applies only to W-2 salary, NOT distributions
  - Optimal W-2: 40-60% of net profit (IRS "reasonable compensation")
  - S-corp admin cost: ~$1,500/yr (payroll, separate return, etc.)

  Calculate: current SE burden vs optimal S-corp structure, net of admin costs.
  If net saving < $3,000/yr, S-corp is usually not worth it.`
  : `SOLE PROP vs INCORPORATION RULES:
  Revenue: $${rev.toLocaleString()}, Margin: ${margin}%, Structure: ${structure}
  Step 1: Estimate EBITDA from revenue × margin × 0.6
  Step 2: Look up personal marginal rate for this income level in ${province} (see tax brackets below)
  Step 3: Compare against CCPC SBD rate for ${province} (see CCPC rates below)
  Step 4: Rate gap × EBITDA × ~50% (conservative, accounts for eventual dividend extraction) = annual deferral
  Step 5: Subtract incorporation cost (~$1,500-$3,000 setup + ~$2,000/yr maintenance)
  If revenue < $80K, incorporation is usually below breakeven — focus on deductions.`}
`}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 4: GOVERNMENT MONEY LEFT ON TABLE — Calculate exact amounts
══════════════════════════════════════════════════════════════════════════════

${isUS ? `
Section 179 RULES:
  Typical annual capex: 3-8% of revenue. Check if business is expensing under §179.
  Tax saving formula: capex amount × marginal federal rate (see brackets below)

QBI Deduction (§199A) RULES:
  20% deduction on qualified business income for pass-through entities.
  Tax saving formula: estimated EBITDA × 20% × marginal rate
  W-2 wage limitation applies above $191,950 (single) / $383,900 (joint) — check if applicable.
  C-corps NOT eligible.

${doesRd ? `R&D Credit (§41) RULES:
  Qualifying research expenses (QREs): wages, supplies, contract research
  Typical QRE estimate: 12% of revenue for tech, 5% for other industries
  Credit: 14% using ASC (Alternative Simplified Credit) method
  Formula: estimated QREs × 14% = annual credit` : ""}

WOTC RULES:
  ${emp > 0 ? `Each eligible hire = $2,400-$9,600 credit depending on target group.
  Estimate: ~20% of hires may be eligible × $4,000 avg credit per eligible hire.
  With ${emp} employees, calculate based on estimated annual hiring rate.` : "No employees — N/A"}
` : `
SR&ED RULES:
  ${doesRd ? `R&D flagged. Eligible expenditures: salaries, materials, overhead, contractors.
  Estimate eligible spend: ~12% of revenue for tech, ~5% for other industries
  Federal ITC: 35% refundable for CCPCs on first $3M of eligible expenditures
  ${province === "QC" ? "QC provincial: additional 30% refundable credit on eligible expenditures" : ""}
  Formula: estimated eligible spend × credit rate = annual credit` :
  `Does this ${industry} do ANY process improvement, custom software, technical problem-solving?
  Even 5% of revenue qualifying at 35% federal ITC = significant annual credit.`}

HST Quick Method RULES:
  ${rev < 400000 && !isUS ? `Revenue $${rev.toLocaleString()} < $400K — eligible for Quick Method.
  Current HST/GST: ${province === "QC" ? "GST 5% (QST is separate)" : province === "AB" ? "GST 5%" : "HST 13%"} collected less ITCs claimed
  Quick Method remittance rate: ~${/service|consult|professional/.test(i) ? "8.8%" : "4.4%"} on revenue (includes GST/HST collected)
  Saving formula: (HST/GST collected − Quick Method remittance) = annual saving
  Calculate the difference for this business.` : "Revenue above $400K or not applicable"}
`}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 5: COMPLIANCE EXPOSURE — Calculate penalty × probability × years
══════════════════════════════════════════════════════════════════════════════

${complianceCalc}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 6: CASH LEAKAGE — Calculate exact trapped cash
══════════════════════════════════════════════════════════════════════════════

Accounts Receivable:
  Revenue: $${rev.toLocaleString()}/yr
  Industry DSO target: ${/consult|professional/.test(i) ? "35-45" : /construct/.test(i) ? "45-60" : "25-35"} days
  Trapped cash formula: daily revenue (revenue ÷ 365) × excess days above target
  Calculate: if DSO is 10-15 days above target, how much cash is trapped?

Vendor Contracts:
  Estimated recurring vendor spend: ~15% of revenue (typical)
  Contracts >2 years old save 8-15% when renegotiated
  Conservative formula: 10% savings on half of vendor spend = annual saving

Payment Processing:
  If accepting cards: revenue × card-processed % × (current_rate − benchmark_rate)
  Benchmark: ${/restaurant|retail/.test(i) ? "2.3-2.6% card-present" : "2.7-3.1% card-not-present"}
  Estimate excess rate at 0.2-0.3% and calculate based on card-processed revenue share
    (${/restaurant|retail/.test(i) ? "~70% of revenue for retail/restaurant" : "~40% of revenue for service/B2B"})

Banking Fees:
  Commercial accounts should cost <$${rev < 500000 ? "30" : "50"}/mo
  Compare against Relay Financial (free) or Mercury (free) benchmarks

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 7: INSURANCE — Calculate the overpayment
══════════════════════════════════════════════════════════════════════════════

Businesses that haven't compared insurance in 2+ years overpay 15-25%.
  Estimated annual premium rule of thumb for ${industry}:
    ${/construct|transport/.test(i) ? "~4% of revenue (high-risk industry)" : /health|professional/.test(i) ? "~2.5% of revenue" : "~1.5% of revenue"}
  Overpayment formula: estimated premium × 15% = annual recoverable amount
  Calculate using revenue of $${rev.toLocaleString()}.

Missing coverage gaps = unquantified but flag as compliance risk:
  ${/tech|saas|health/.test(i) ? "Cyber liability: CRITICAL for this industry" : ""}
  ${rev >= 500000 ? "Key person insurance: if owner incapacitated, business value = $0" : ""}
  ${/consult|professional|legal/.test(i) ? "E&O / professional liability: CRITICAL" : ""}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 8: PRICING EROSION — Calculate lost revenue
══════════════════════════════════════════════════════════════════════════════

Inflation erodes 2-3% of revenue purchasing power annually.
  Rule: If no price increase in 2 years → lost revenue ≈ revenue × 5%
  Rule: If no price increase in 3 years → lost revenue ≈ revenue × 8%
  Calculate using revenue of $${rev.toLocaleString()}.

Revenue per customer optimization:
  Average transaction size — can it increase 5-10% with bundling/upsell?
  Formula: revenue × 5% increase = additional annual revenue

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 9: DEDUCTIONS BEING MISSED — Calculate exact tax savings
══════════════════════════════════════════════════════════════════════════════

${isUS ? `
Home office: ${emp === 0 || structure === "sole_proprietor" ? `Simplified: $5/sq ft × up to 300 sq ft = $1,500 max deduction
  Tax saving formula: deduction × marginal rate (see brackets below)
  Actual method: often 2-3× higher than simplified — calculate both if data available` : "N/A (corporate structure)"}
Vehicle: ${/construct|real.estate|transport|consult/.test(i) ? `IRS rate $0.70/mile (2025) × estimated business miles
  Rule of thumb: 12,000-18,000 business miles for this industry
  Tax saving formula: mileage deduction × marginal rate` : "Assess business use percentage"}
Health insurance: ${structure !== "corporation" && structure !== "c_corp" ? `100% deductible for self-employed
  Average family premium: ~$7,200/yr
  Tax saving formula: $7,200 × marginal rate` : "Deductible through corporation"}
Retirement: ${structure === "sole_proprietor" || structure === "llc" ? `SEP-IRA: up to 25% of net self-employment income, max $69,000 (2025)
  Step 1: Calculate EBITDA from revenue and margin
  Step 2: SEP contribution = min(EBITDA × 25%, $69,000)
  Step 3: Tax saving = contribution × marginal rate` :
  `Solo 401(k): employee deferral ($23,500) + employer contribution (25% of comp) = up to $69,000 sheltered
  Tax saving formula: total contribution × marginal rate`}
` : `
Home office: ${emp === 0 || structure === "sole_proprietor" ? "Deductible as business-use-of-home. Calculate actual costs × business use %" : "N/A"}
Vehicle: CRA rate $0.70/km first 5,000km, $0.64 after. Log required.
  Rule of thumb: 15,000-25,000 business km for driving-heavy industries
  Tax saving formula: mileage deduction × marginal rate (see brackets below)
RRSP/IPP: ${rev > 100000 ? `At this income, RRSP room = 18% of earned income up to $32,490 (2025)
  IPP: can exceed RRSP limits significantly for owners 45+
  Tax saving formula: contribution × marginal rate` : "RRSP: 18% of prior year earned income"}
Meals: 50% deductible. Are all business meals tracked?
`}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 10: ENTERPRISE VALUE IMPACT — Multiply everything
══════════════════════════════════════════════════════════════════════════════

Every $1 of EBITDA improvement at industry multiple (${/saas|software/.test(i) ? "6-12×" : /professional|consult/.test(i) ? "5-9×" : /construct|transport/.test(i) ? "3-5×" : "4-6×"}):

Sum all findings' EBITDA impact × midpoint multiple = total EV impact.
This number goes in totals.enterprise_value_impact.

${tier === "enterprise" ? `
Exit readiness assessment:
  - Owner dependency: is this business sellable without the owner? (biggest value killer)
  - Customer concentration: >20% from one customer = discount
  - Recurring revenue %: higher = higher multiple
  - ${isUS ? "QSBS eligibility (Section 1202): if C-corp, held 5yr, original issue → $10M exclusion" : "LCGE: $1.25M lifetime exemption for QSBC shares — run purification test"}
` : ""}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 11: CASCADE EFFECTS — How findings compound each other
══════════════════════════════════════════════════════════════════════════════

Show how fixes COMPOUND — this is what separates world-class diagnostics.

After identifying all findings, map the cascade:
  - Fixing entity structure → unlocks ${isUS ? "QBI deduction" : "SBD rate"} → additional saving
  - Fixing payroll classification → reduces workers comp premium → additional saving
  - Renegotiating vendors → improves cash flow → reduces credit line usage → interest saving
  - Improving collections (DSO) → frees cash → earns interest or reduces line draws

CALCULATE the compound effect:
  Sum of individual findings: $X
  Cascade bonus (findings that unlock other savings): $Y
  Total recoverable: $X + $Y
  → This goes in savings_anchor.headline as the TOTAL number

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 12: COST OF DELAY — Quantify urgency for every finding
══════════════════════════════════════════════════════════════════════════════

For EVERY finding, calculate: what does each month of inaction cost?

  Finding amount ÷ 12 = monthly cost of delay

  Compliance findings: penalty accrues. Calculate:
    penalty_per_month = (annual_penalty × probability) ÷ 12

  Use this to set the PRIORITY SEQUENCE:
    Rank 1 = highest monthly cost of delay
    Rank 2 = second highest
    etc.

  The priority_sequence in your JSON must be ordered by cost of delay, NOT by total size.
  A $5,000 finding with a filing deadline NEXT MONTH outranks a $15,000 finding with no deadline.

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 13: PEER POSITIONING — Where does this business stand?
══════════════════════════════════════════════════════════════════════════════

For benchmark_comparisons, position this business against peers:

Revenue: $${rev.toLocaleString()} in ${industry}
  → Estimate the percentile ranking for this revenue level in this industry

For each benchmark metric:
  - State the business's value (calculated or from data)
  - State the industry median (P50)
  - State the top quartile (P25 for costs, P75 for margins)
  - Calculate the dollar gap: (their_value − top_quartile) × revenue
  - Frame it: "Closing this gap to top quartile = $X/yr additional"

Metrics to ALWAYS include:
  1. Gross margin % (MANDATORY — primary profitability indicator)
  2. EBITDA margin % (MANDATORY — operational efficiency)
  3. Revenue per employee (if employees > 0)
  4. ${/restaurant|retail/.test(i) ? "Prime cost % (food + labor)" : /saas|tech/.test(i) ? "CAC payback months" : /consult|professional/.test(i) ? "Utilization rate %" : "Operating expense ratio %"}
  5. Effective tax rate (actual tax paid ÷ pre-tax income)
  6. ${tier === "enterprise" ? "Working capital ratio (current assets ÷ current liabilities)" : "Owner compensation as % of revenue"}

══════════════════════════════════════════════════════════════════════════════
RED FLAG DETECTOR — Identify issues that need IMMEDIATE attention
══════════════════════════════════════════════════════════════════════════════

Before writing JSON, scan for these RED FLAGS. If any are true, they MUST
be the highest-severity finding regardless of dollar amount:

${isUS ? `
□ Operating as sole prop above $80K net income (SE tax bleeding)
□ No workers comp insurance with employees (criminal liability)
□ Form 941 deposits potentially late (trust fund penalty = 100%)
□ Selling across state lines without sales tax registration (Wayfair nexus)
□ 1099 contractors who should be W-2 (IRS misclassification = 3yr back taxes)
□ No business entity formed (unlimited personal liability)
□ Revenue >$600K and no retirement plan (missing $15K-$69K/yr tax shelter)
` : `
□ Operating as sole prop above $80K (missing CCPC SBD rate gap)
□ No WSIB/CNESST/WCB with employees (operating illegally)
□ Revenue >$30K and not registered for GST/HST (mandatory threshold)
□ Source deductions not remitted on time (director personal liability)
□ ${province === "QC" ? "No Law 25 privacy officer designated (up to $25M fine)" : "PIPEDA non-compliance with customer data"}
□ SR&ED eligible work being done but no claim filed (leaving 35% on table)
□ Revenue >$500K sole prop not incorporated (massive rate gap)
`}

If a red flag is detected, it becomes a CRITICAL finding with compliance_risk
prominently featured, regardless of its dollar amount.

══════════════════════════════════════════════════════════════════════════════
CROSS-VALIDATION — DO NOT OUTPUT JSON UNTIL ALL PASS
══════════════════════════════════════════════════════════════════════════════

□ MATH: Sum of finding impact_max = totals.annual_leaks (±10%)
□ CAP: No single finding > 30% of $${rev.toLocaleString()} revenue
□ OVERLAP: No two findings share the same root cause
□ CONSISTENCY: Revenue $${rev.toLocaleString()} used consistently in all calculations
□ ARITHMETIC: Every calculation_shown verifiable by a ${isUS ? "CPA" : "accountant"} in 30 seconds
□ SOLUTIONS: Every URL is a real, active website (not a guess)
□ FORMS: Every ${isUS ? "IRS" : "CRA"} form number is real and applies to this situation
□ CONFIDENCE: Exact data → "high". Estimates → "medium". Assumptions → "low"
□ CASCADE: At least 2 findings have cascade_unlocks showing compound benefits
□ URGENCY: priority_sequence ordered by monthly_cost_of_delay, NOT by total amount
□ RED FLAGS: Any detected red flag is severity "critical" regardless of dollar size
□ BENCHMARKS: All benchmark_comparisons use real industry data, not invented numbers

══════════════════════════════════════════════════════════════════════════════
EXACT TAX BRACKETS — USE THESE NUMBERS, DO NOT GUESS
══════════════════════════════════════════════════════════════════════════════

${isUS ? `
2025 US FEDERAL INDIVIDUAL TAX BRACKETS (use for sole prop / pass-through):
  $0–$11,925:       10%
  $11,926–$48,475:  12%
  $48,476–$103,350: 22%
  $103,351–$197,300: 24%
  $197,301–$250,525: 32%
  $250,526–$626,350: 35%
  $626,351+:         37%

Calculate this business's marginal and effective rate from revenue ($${rev.toLocaleString()}),
margin (${margin}%), and estimated EBITDA. Do NOT use pre-computed rates.

SE TAX: 15.3% on first $176,100 (12.4% SS + 2.9% Medicare). 2.9% Medicare only above $176,100.
Additional 0.9% Medicare surcharge above $200K (single) / $250K (joint).

CORPORATE: C-corp flat 21% federal.
S-corp: passes through to individual rates above. No entity-level tax.

${getUSStateRates(province)}
` : `
2025 CANADIAN FEDERAL TAX BRACKETS (individual):
  $0–$57,375:        15%
  $57,376–$114,750:  20.5%
  $114,751–$158,468: 26%
  $158,469–$220,000: 29%
  $220,001+:         33%

PROVINCIAL (${province}):
${getCanadianProvincialRates(province)}

Calculate this business's marginal and effective rate from revenue ($${rev.toLocaleString()}),
margin (${margin}%), and estimated EBITDA. Do NOT use pre-computed rates.

CCPC RATES (small business) for ${province}:
  Federal SBD: 9% on first $500K active business income
  Provincial: ${getProvincialSBDRate(province)}
  General rate (above $500K): 15% federal + provincial general rate

TAX INTEGRATION RULES:
  Step 1: Calculate estimated EBITDA from revenue × margin × 0.6
  Step 2: Look up personal combined marginal rate for that EBITDA level using brackets above
  Step 3: Look up CCPC SBD combined rate for ${province}
  Step 4: Rate gap = personal marginal − CCPC SBD rate
  Step 5: Annual tax deferral = EBITDA × rate gap × ~50% (conservative, accounts for eventual dividend extraction)
`}

══════════════════════════════════════════════════════════════════════════════
TIME-SENSITIVE DEADLINES — Flag anything due within 90 days
══════════════════════════════════════════════════════════════════════════════

Current date context: early 2026. Check these deadlines:

${isUS ? `
QUARTERLY (check which is NEXT):
  Form 941 (payroll): due Apr 30, Jul 31, Oct 31, Jan 31
  Estimated tax (1040-ES): due Apr 15, Jun 15, Sep 15, Jan 15
  ${province === "CA" ? "CA DE-9 (payroll): due same as 941" : ""}

ANNUAL:
  S-corp return (1120-S): due March 15 (or Sep 15 with extension)
  C-corp return (1120): due April 15 (or Oct 15 with extension)
  Personal (1040): due April 15 (or Oct 15 with extension)
  W-2/1099-NEC: due January 31
  Form 940 (FUTA): due January 31
  S-corp election (Form 2553): March 15 for calendar year (or within 75 days)
` : `
QUARTERLY (check which is NEXT):
  GST/HST return: depends on filing frequency (monthly/quarterly/annual)
  ${province === "QC" ? "QST return: same frequency as GST" : ""}
  Source deduction remittances: by 15th of following month (or earlier for large remitters)

ANNUAL:
  T2 corporate return: 6 months after fiscal year-end
  T1 personal: April 30 (or June 15 if self-employed, but balance due April 30)
  T4 summary: February 28
  T5 summary: February 28
  ${province === "QC" ? "Relevé 1: February 28" : ""}
  ROE: within 5 business days of interruption of earnings
`}

If any deadline is within 90 days and the business is NOT prepared,
flag it as a finding with high urgency and cost_of_inaction_monthly.

══════════════════════════════════════════════════════════════════════════════
ANTI-HALLUCINATION RULES — What you MUST NOT invent
══════════════════════════════════════════════════════════════════════════════

1. NEVER invent a benchmark number. If you don't know the exact industry P50/P75,
   say "estimated based on similar industries" in the gap field.

2. NEVER invent a product URL. If you're not 100% certain the URL is correct,
   use the domain root (e.g., https://gusto.com not https://gusto.com/pricing/s-corp).

3. NEVER invent a form number. Use ONLY these real forms:
${isUS ? `
   IRS: 1040, 1120, 1120-S, 1065, 941, 940, W-2, W-4, 1099-NEC, 1099-MISC,
   2553, 8832, 8850 (WOTC), 6765 (R&D), 4562 (depreciation), 8829 (home office),
   Schedule C, Schedule SE, Schedule K-1, 1040-ES, 8995 (QBI)
   State: varies — reference the state form number only if you know it exactly.
` : `
   CRA: T1, T2, T4, T4A, T5, T5013, T661 (SR&ED), RC4288, RC7004 (Quick Method),
   GST34, QST return, ROE, NR4
   Provincial: Relevé 1 (QC), Ontario Annual Return, ${province === "QC" ? "CNESST registration form" : "WCB registration"}
`}

4. NEVER invent a tax rate. Use the exact brackets provided above.

5. NEVER invent an employee count or revenue figure. Use ONLY $${rev.toLocaleString()}
   and ${emp} employees as provided. If a finding needs data you don't have,
   set confidence_level to "low" and explain what data is missing in data_source.

6. NEVER extrapolate beyond the data. If the business has $${rev.toLocaleString()} revenue
   and you're calculating a cost that requires payroll data you don't have,
   estimate conservatively and note it: "estimated at 25% of revenue"

7. SOLUTIONS: Only recommend products you are confident exist as of 2025:
${isUS ? `
   Payroll: Gusto, ADP, Paychex, Justworks, Rippling, OnPay
   Accounting: QuickBooks, Xero, FreshBooks, Wave, Bench
   Tax: TurboTax, H&R Block, TaxAct
   Insurance: Next Insurance, Hiscox, Pie Insurance, Coalition
   Banking: Mercury, Relay, Novo, Bluevine
   Legal: LegalZoom, ZenBusiness, Northwest Registered Agent
   R&D Credit: Boast.ai, Clarus R+D, alliantgroup
` : `
   Payroll: Wagepoint, Humi, Ceridian, ADP Canada, Nethris
   Accounting: QuickBooks Canada, Xero, Wave, Sage
   Tax filing: TurboTax Canada, Wealthsimple Tax
   Insurance: Zensurance, NEXT Canada, BrokerLink, HUB
   Banking: RBC Commercial, TD Business, Desjardins (QC)
   Legal: Ownr (RBC), BDC
   SR&ED: Boast.ai, Swifter, Mentor Works
`}

══════════════════════════════════════════════════════════════════════════════
FINDING PRIORITY ORDER (when trimming to fit limit)
══════════════════════════════════════════════════════════════════════════════

1. Tax structure optimization (highest dollar impact for most businesses)
2. Government programs missed (free money left on table)
3. Compliance exposure (penalty risk = urgency)
4. Payroll optimization (recurring monthly savings)
5. Cost vs benchmark gaps (only if gap > 2× minimum threshold)
6. Insurance overpayment (high probability of recovery)
7. Cash leakage (AR, processing fees, vendor contracts)
8. Pricing erosion (only if clear evidence of below-market pricing)
9. Software/SaaS bloat (usually smallest dollar amounts)

NEVER drop a finding from categories 1-3 in favor of categories 7-9.
If you must trim, drop from the bottom of this list first.
`.trim();
}


// ─── US state tax rates — only the user's state ─────────────────────────────
function getUSStateRates(state: string): string {
  if (["FL","TX","NV","WA","WY","SD","TN","AK","NH"].includes(state))
    return `STATE: ${state} — NO state income tax.`;
  const stateRates: Record<string, string> = {
    "CA": "STATE: California — 1-13.3% (13.3% above $1M). Franchise tax min $800.",
    "NY": "STATE: New York — 4-10.9% + NYC 3.078-3.876% if applicable.",
    "IL": "STATE: Illinois — flat 4.95% individual, 9.5% corporate.",
    "NJ": "STATE: New Jersey — 1.4-10.75% (10.75% above $1M).",
    "PA": "STATE: Pennsylvania — flat 3.07% individual, 8.99% corporate.",
    "GA": "STATE: Georgia — 5.49% flat (phasing to 4.99%).",
    "OH": "STATE: Ohio — no individual income tax on business income <$26K. CAT 0.26% on gross >$1M.",
    "MA": "STATE: Massachusetts — 5% flat + 4% surtax above $1M.",
  };
  return stateRates[state] || `STATE: ${state} — verify current state income tax rates.`;
}


// ─── Canadian provincial rates — only the user's province ───────────────────
function getCanadianProvincialRates(province: string): string {
  const rates: Record<string, string> = {
    "QC": "  15-25.75% (25.75% above $126,000). Combined top: ~53.3%.",
    "ON": "  5.05-13.16% (13.16% above $220K). Combined top: ~53.53%. Ontario surtax applies.",
    "BC": "  5.06-20.5% (20.5% above $252K). Combined top: ~53.5%.",
    "AB": "  10% flat. Combined top: ~48%. Lowest combined rate in Canada.",
    "SK": "  10.5-14.5%. Combined top: ~47.5%.",
    "MB": "  10.8-17.4%. Combined top: ~50.4%.",
    "NS": "  8.79-21%. Combined top: ~54%.",
    "NB": "  9.4-19.5%. Combined top: ~52.5%.",
    "NL": "  8.7-21.8%. Combined top: ~54.8%. Highest in Canada.",
    "PE": "  9.65-16.7%. Combined top: ~51.37%.",
  };
  return rates[province] || `  Verify ${province} rates.`;
}


// ─── Provincial SBD rate helper ─────────────────────────────────────────────
function getProvincialSBDRate(province: string): string {
  const rates: Record<string, string> = {
    "AB": "2% provincial (total combined 11%)",
    "SK": "1% provincial (total combined 10%)",
    "MB": "0% provincial (total combined 9%)",
    "QC": "3.2% provincial (total combined 12.2%)",
    "ON": "3.2% provincial (total combined 12.2%)",
    "BC": "2% provincial (total combined 11%)",
    "NS": "2.5% provincial (total combined 11.5%)",
    "NB": "2.5% provincial (total combined 11.5%)",
    "NL": "3% provincial (total combined 12%)",
    "PE": "1% provincial (total combined 10%)",
  };
  return rates[province] || "~3% provincial (total combined ~12%)";
}


// ─── Pre-computed industry targets (benchmarks — these are fine to keep) ────
interface Target { category: string; target: string; targetPct: number }

function getIndustryTargets(i: string): Target[] {
  if (/restaurant|food|cafe|bar/.test(i)) return [
    { category: "Food Cost (COGS)", target: "28-32%", targetPct: 30 },
    { category: "Labor Cost", target: "25-32%", targetPct: 28 },
    { category: "Occupancy", target: "6-10%", targetPct: 8 },
    { category: "CC Processing", target: "2.3-2.8%", targetPct: 2.5 },
    { category: "Marketing", target: "2-5%", targetPct: 3 },
    { category: "Insurance", target: "1.5-3%", targetPct: 2 },
    { category: "Revenue/Employee", target: "$45K-$65K", targetPct: 0 },
  ];
  if (/construct|contractor|trade/.test(i)) return [
    { category: "Materials/COGS", target: "25-35%", targetPct: 30 },
    { category: "Labor (direct)", target: "30-40%", targetPct: 35 },
    { category: "Equipment", target: "5-10%", targetPct: 7 },
    { category: "Insurance", target: "3-5%", targetPct: 4 },
    { category: "Subcontractor Cost", target: "10-25%", targetPct: 15 },
    { category: "Revenue/Employee", target: "$100K-$200K", targetPct: 0 },
  ];
  if (/saas|software|tech/.test(i)) return [
    { category: "Hosting/Infra", target: "5-15%", targetPct: 10 },
    { category: "R&D/Engineering", target: "15-25%", targetPct: 20 },
    { category: "Sales & Marketing", target: "15-30%", targetPct: 22 },
    { category: "G&A", target: "10-15%", targetPct: 12 },
    { category: "CC Processing", target: "2.5-3.2%", targetPct: 2.8 },
    { category: "Revenue/Employee", target: "$150K-$300K", targetPct: 0 },
  ];
  if (/consult|professional|legal|account/.test(i)) return [
    { category: "Staff/Associate Cost", target: "40-55%", targetPct: 47 },
    { category: "Occupancy", target: "3-8%", targetPct: 5 },
    { category: "Professional Development", target: "1-3%", targetPct: 2 },
    { category: "Technology/Software", target: "2-5%", targetPct: 3 },
    { category: "Insurance", target: "2-4%", targetPct: 3 },
    { category: "Revenue/Employee", target: "$120K-$250K", targetPct: 0 },
  ];
  if (/retail|ecommerce|store/.test(i)) return [
    { category: "COGS/Inventory", target: "45-60%", targetPct: 52 },
    { category: "Occupancy/Rent", target: "5-10%", targetPct: 7 },
    { category: "Labor", target: "10-18%", targetPct: 14 },
    { category: "Shrinkage/Waste", target: "<2%", targetPct: 2 },
    { category: "CC Processing", target: "2.2-2.8%", targetPct: 2.5 },
    { category: "Marketing", target: "3-8%", targetPct: 5 },
  ];
  if (/health|medical|dental/.test(i)) return [
    { category: "Staff Cost", target: "25-35%", targetPct: 30 },
    { category: "Supplies/Materials", target: "5-12%", targetPct: 8 },
    { category: "Occupancy", target: "5-10%", targetPct: 7 },
    { category: "Equipment Depreciation", target: "3-8%", targetPct: 5 },
    { category: "Insurance (Professional)", target: "2-5%", targetPct: 3 },
    { category: "Revenue/Employee", target: "$100K-$200K", targetPct: 0 },
  ];
  if (/transport|trucking|logistics/.test(i)) return [
    { category: "Fuel", target: "25-35%", targetPct: 30 },
    { category: "Maintenance", target: "8-12%", targetPct: 10 },
    { category: "Insurance", target: "5-8%", targetPct: 6 },
    { category: "Labor/Drivers", target: "25-35%", targetPct: 30 },
    { category: "Equipment/Lease", target: "10-15%", targetPct: 12 },
    { category: "Revenue/Truck", target: "$150K-$250K", targetPct: 0 },
  ];
  // Generic
  return [
    { category: "COGS/Direct Costs", target: "30-60%", targetPct: 45 },
    { category: "Labor", target: "20-35%", targetPct: 28 },
    { category: "Occupancy", target: "3-10%", targetPct: 6 },
    { category: "Insurance", target: "1.5-4%", targetPct: 2.5 },
    { category: "Marketing", target: "2-8%", targetPct: 4 },
    { category: "Revenue/Employee", target: "$80K-$150K", targetPct: 0 },
  ];
}


// ─── Tax calculation RULES for Claude (raw rules, not pre-computed) ─────────
function getTaxCalculations(isUS: boolean, rev: number, emp: number, structure: string, province: string, margin: number): string {
  if (isUS) {
    const isPassThrough = ["sole_proprietor","llc","s_corp","partnership"].includes(structure);

    return `
CURRENT STRUCTURE: ${structure}
RAW INPUTS: Revenue: $${rev.toLocaleString()} | Margin: ${margin}% | Employees: ${emp}

YOU MUST CALCULATE EBITDA: revenue × (margin / 100) × 0.6 (approximate)

${structure === "sole_proprietor" || structure === "llc" ? `
SE TAX OPTIMIZATION — CALCULATE THIS:
  Step 1: Estimate EBITDA from revenue ($${rev.toLocaleString()}) × margin (${margin}%) × 0.6
  Step 2: Current SE tax = min(EBITDA, $176,100) × 15.3%
           If EBITDA > $176,100: add (EBITDA − $176,100) × 2.9% (Medicare only)
           If EBITDA > $200K: add 0.9% additional Medicare surcharge
  Step 3: Optimal S-corp W-2 = 40% of EBITDA (IRS "reasonable compensation")
  Step 4: S-corp FICA = min(W-2, $176,100) × 15.3% (distributions are FICA-exempt)
  Step 5: Annual FICA saving = Step 2 − Step 4
  Step 6: Net saving = FICA saving − $1,500 (S-corp admin cost)
  → If net saving > $3,000: THIS IS LIKELY YOUR #1 FINDING
  → If net saving < $3,000: below S-corp breakeven — focus on deductions
` : structure === "s_corp" ? `
S-CORP ALREADY — OPTIMIZE THE SPLIT:
  Is owner W-2 at the optimal level? IRS "reasonable compensation" = ~40-60% of net.
  Step 1: Calculate EBITDA from inputs above
  Step 2: Optimal W-2 range = 40-60% of EBITDA
  Step 3: Check if current W-2 is too high (wasting FICA) or too low (audit risk)
  Step 4: If W-2 is above optimal, excess FICA = (current W-2 − optimal W-2) × 15.3%
` : `
CORPORATION (${structure}):
  ${structure === "c_corp" ? "Double taxation risk: corporate 21% + qualified dividend 15-20%. Is S-corp election beneficial?" : ""}
  Reasonable compensation analysis required — calculate optimal W-2 vs distributions.
`}

QBI DEDUCTION (Section 199A):
  ${isPassThrough ? `Eligible for 20% QBI deduction on pass-through income.
  Step 1: Calculate EBITDA (your estimated QBI)
  Step 2: QBI deduction = EBITDA × 20%
  Step 3: Tax saving = QBI deduction × marginal rate (look up from brackets)
  W-2 wage limitation applies above $191,950 (single) / $383,900 (joint) — check if applicable.` : "N/A — C-corp not eligible for QBI deduction."}
`;
  } else {
    // Canadian tax context — raw rules only
    return `
CURRENT STRUCTURE: ${structure}
RAW INPUTS: Revenue: $${rev.toLocaleString()} | Margin: ${margin}% | Employees: ${emp} | Province: ${province}

YOU MUST CALCULATE EBITDA: revenue × (margin / 100) × 0.6 (approximate)

${structure === "sole_proprietor" ? `
INCORPORATION ANALYSIS — CALCULATE THIS:
  Step 1: Estimate EBITDA from revenue ($${rev.toLocaleString()}) × margin (${margin}%) × 0.6
  Step 2: Look up personal combined marginal rate for EBITDA level in ${province} (see brackets section)
  Step 3: Look up CCPC SBD combined rate for ${province} (see CCPC rates section)
  Step 4: Rate gap = personal marginal rate − CCPC SBD rate
  Step 5: Annual tax deferral = EBITDA × rate gap × ~50% (conservative, accounts for eventual dividend extraction)
  Step 6: Subtract incorporation cost: ~$1,500-$3,000 setup + ~$2,000/yr maintenance
  → If revenue >= $80K: INCORPORATION IS LIKELY BENEFICIAL — model T4 vs dividend split
  → If revenue < $80K: below incorporation breakeven — focus on deductions
` : `
ALREADY INCORPORATED — OPTIMIZE:
  T4 salary vs eligible dividend split
  CPP rules: T4 above $71,300 (2025 YMPE) triggers 11.9% combined CPP1
  CPP2: 4% on earnings $71,300–$81,900
  RRSP room: generated by T4 income (18% of earned income, max $32,490)
  SBD: is the $500K threshold being maximized?
  Calculate optimal T4 that balances CPP cost vs RRSP room vs dividend tax integration.
`}

HST/GST:
  ${rev < 400000 ? `Quick Method potentially eligible: revenue $${rev.toLocaleString()} < $400K.
  Calculate saving based on HST/GST rate vs Quick Method remittance rate for ${province}.` : "Above $400K — Quick Method not available. Focus on ITC optimization."}
  ${province === "QC" ? "QST separate: 9.975% + GST 5%. Dual filing with Revenu Québec." : ""}
`;
  }
}


// ─── Compliance exposure RULES (formulas, not pre-computed amounts) ──────────
function getComplianceExposure(isUS: boolean, rev: number, emp: number, province: string, hasPayroll: boolean): string {
  if (isUS) {
    const rules: string[] = [];
    rules.push(`Income tax filing: penalty = 5%/mo of tax owing, up to 25% max.
    Formula: estimate tax owing as ~5% of revenue, then max penalty = tax owing × 25%.
    Calculate using revenue of $${rev.toLocaleString()}.`);
    if (emp > 0) {
      rules.push(`Form 941 (payroll): trust fund recovery penalty = 100% of unpaid employment taxes. Personal liability for responsible persons.`);
      rules.push(`W-2 filing: $60-$310 per form × ${emp} employees. Calculate the penalty range.`);
      rules.push(`Workers comp: operating without = misdemeanor, fines up to $100K, personal injury liability.`);
    }
    if (rev > 100000) rules.push(`Sales tax nexus: if selling across state lines without registration = back taxes + 25% penalty + interest. Calculate exposure based on estimated out-of-state revenue.`);
    rules.push(`BOI report (FinCEN): $500/day civil penalty. Criminal: up to $10K + 2yr imprisonment.`);
    return rules.map((p, idx) => `  ${idx + 1}. ${p}`).join("\n");
  } else {
    const rules: string[] = [];
    rules.push(`T2 corporate/T1 personal: late filing penalty = 5% + 1%/month up to 12 months of tax owing.
    Formula: estimate tax owing as ~4% of revenue, then max penalty = tax owing × 17%.
    Calculate using revenue of $${rev.toLocaleString()}.`);
    if (rev > 30000) rules.push(`GST/HST: must be registered above $30K. Late filing penalty + interest at prescribed rate + 6%.`);
    if (emp > 0) {
      rules.push(`Source deductions: failure to remit = 10-20% penalty + director personal liability.`);
      rules.push(`T4/ROE: $100-$7,500 penalty per failure. Must issue T4 by Feb 28, ROE within 5 days of interruption.`);
      // Only include province-specific compliance for user's province
      if (province === "QC") rules.push(`CNESST: must register. Late = penalties + retroactive premiums + no coverage if injury.`);
      else if (province === "ON") rules.push(`WSIB: must register if in mandatory industry. Operating without = fines + retroactive premiums.`);
      else if (province === "BC") rules.push(`WorkSafe BC: must register if in mandatory industry. Operating without = fines + retroactive premiums.`);
      else if (province === "AB") rules.push(`WCB Alberta: must register. Operating without = fines + retroactive premiums.`);
      else rules.push(`${province} WCB: must register if in mandatory industry. Operating without = fines + retroactive premiums.`);
    }
    if (province === "QC") rules.push(`Law 25 privacy: privacy officer must be designated. Fines up to $25M or 4% of global revenue.`);
    return rules.map((p, idx) => `  ${idx + 1}. ${p}`).join("\n");
  }
}
