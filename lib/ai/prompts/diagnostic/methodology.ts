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
  const ebitdaEst = Math.round(rev * (margin / 100) * 0.6); // rough EBITDA
  const monthlyRev = Math.round(rev / 12);

  // Pre-computed targets Claude must use
  const targets = getIndustryTargets(i);
  const taxCalc = getTaxCalculations(isUS, rev, emp, structure, province, ebitdaEst);
  const complianceCalc = getComplianceExposure(isUS, rev, emp, province, hasPayroll);

  return `
══════════════════════════════════════════════════════════════════════════════
FRUXAL FORENSIC ENGINE — WORLD-CLASS LEAK DETECTION
══════════════════════════════════════════════════════════════════════════════

YOU ARE NOT WRITING ADVICE. YOU ARE CALCULATING LOSSES.

For this business:
  Revenue: $${rev.toLocaleString()}/yr ($${monthlyRev.toLocaleString()}/mo)
  Industry: ${industry} | Structure: ${structure} | Location: ${province} (${country})
  Employees: ${emp} | Gross margin: ${margin}% | Est. EBITDA: ~$${ebitdaEst.toLocaleString()}

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
    → If above target: gap = (actual% − ${t.targetPct}%) × $${rev.toLocaleString()} = finding amount
    → Minimum gap to report: $${tier === "solo" ? "500" : "2,000"}/yr`).join("\n")}

DO THIS NOW: For each category above, calculate the dollar gap.
Only report categories where the gap exceeds the minimum.

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 3: PAYROLL — Calculate the exact cost of inefficiency
══════════════════════════════════════════════════════════════════════════════

${emp > 0 ? `
Revenue per employee: $${rev.toLocaleString()} ÷ ${emp} = $${Math.round(rev/Math.max(emp,1)).toLocaleString()}
Industry target for ${industry}: $${targets.find(t => t.category === "Revenue/Employee")?.target || "$80K-$150K"}

${isUS ? `
FICA calculation for owner:
  Current owner W-2: [from data or estimate based on structure]
  Optimal W-2 (if S-corp): ~40% of net profit = $${Math.round(ebitdaEst * 0.4).toLocaleString()}
  FICA on current W-2: [amount] × 15.3% (up to $176,100) = $X
  FICA on optimal W-2: $${Math.round(ebitdaEst * 0.4).toLocaleString()} × 15.3% = $${Math.round(Math.min(ebitdaEst * 0.4, 176100) * 0.153).toLocaleString()}
  Annual FICA saving: $X - $${Math.round(Math.min(ebitdaEst * 0.4, 176100) * 0.153).toLocaleString()} = finding amount

Workers comp: Is the NAICS/classification code correct? Wrong code = 15-40% premium overpayment.
  At estimated payroll of $${Math.round(rev * 0.25).toLocaleString()}, 15% overpayment = $${Math.round(rev * 0.25 * 0.03 * 0.15).toLocaleString()}/yr
` : `
CPP calculation for owner:
  T4 salary above YMPE ($71,300 2025): triggers 11.9% combined CPP1
  CPP2: 4% on earnings $71,300–$81,900
  Optimal T4: balance CPP cost vs RRSP room generation vs dividend tax integration

Workers comp (${province === "QC" ? "CNESST" : province === "ON" ? "WSIB" : "WCB"}): classification code audit
  At estimated payroll of $${Math.round(rev * 0.25).toLocaleString()}, wrong class = $${Math.round(rev * 0.25 * 0.03 * 0.15).toLocaleString()}/yr overpayment
`}
` : `
Solo operator — no employees.
${isUS
  ? `SE tax on $${ebitdaEst.toLocaleString()} net: $${Math.round(Math.min(ebitdaEst, 176100) * 0.153).toLocaleString()}/yr
S-corp election would reduce to: ~$${Math.round(Math.min(ebitdaEst * 0.4, 176100) * 0.153).toLocaleString()}/yr
Potential saving: ~$${Math.round(Math.min(ebitdaEst, 176100) * 0.153 - Math.min(ebitdaEst * 0.4, 176100) * 0.153).toLocaleString()}/yr (if revenue supports S-corp costs)`
  : `Sole prop tax on $${ebitdaEst.toLocaleString()}: at marginal rate ~${rev > 200000 ? "48-53%" : rev > 100000 ? "35-43%" : "25-33%"}
If incorporated (CCPC): ${rev > 500000 ? "15% combined on first $500K + provincial" : "9% federal SBD + provincial"}
Potential annual tax saving: calculate exact delta between personal and corporate rates on this income`}
`}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 4: GOVERNMENT MONEY LEFT ON TABLE — Calculate exact amounts
══════════════════════════════════════════════════════════════════════════════

${isUS ? `
Section 179: Any equipment/software purchases? At $${rev.toLocaleString()}, typical annual capex = $${Math.round(rev * 0.03).toLocaleString()}-$${Math.round(rev * 0.08).toLocaleString()}
  → If not expensing under §179: tax saving = capex × marginal rate (~${rev > 200000 ? "32-37%" : "22-24%"}) = $${Math.round(rev * 0.05 * 0.25).toLocaleString()}/yr

QBI Deduction (§199A): Is this business claiming the 20% pass-through deduction?
  → At $${ebitdaEst.toLocaleString()} QBI: deduction = $${Math.round(ebitdaEst * 0.2).toLocaleString()} × marginal rate = $${Math.round(ebitdaEst * 0.2 * 0.25).toLocaleString()}/yr tax saving

${doesRd ? `R&D Credit (§41): Qualifying research expenses (wages, supplies, contract research)
  → Estimated QREs: $${Math.round(rev * 0.12).toLocaleString()} (12% of revenue for tech, 5% for others)
  → Credit: 14% ASC method = $${Math.round(rev * 0.12 * 0.14).toLocaleString()}/yr` : ""}

WOTC: ${emp > 0 ? `With ${emp} employees, each eligible hire = $2,400-$9,600 credit
  → If 20% of hires eligible: ${Math.max(1, Math.round(emp * 0.2))} × $4,000 avg = $${Math.round(Math.max(1, emp * 0.2) * 4000).toLocaleString()}/yr` : "No employees — N/A"}
` : `
SR&ED: ${doesRd ? `R&D flagged. Eligible expenditures: salaries, materials, overhead, contractors.
  → Estimated eligible: $${Math.round(rev * 0.12).toLocaleString()} (12% of revenue)
  → Federal ITC: 35% refundable (CCPC) = $${Math.round(rev * 0.12 * 0.35).toLocaleString()}/yr
  ${province === "QC" ? `→ QC provincial: additional 30% = $${Math.round(rev * 0.12 * 0.30).toLocaleString()}/yr` : ""}` :
  `Does this ${industry} do ANY process improvement, custom software, technical problem-solving?
  → Even 5% of revenue qualifying = $${Math.round(rev * 0.05 * 0.35).toLocaleString()}/yr in SR&ED credits`}

HST Quick Method: ${rev < 400000 && !isUS ? `Revenue $${rev.toLocaleString()} < $400K — eligible.
  → Current: ${province === "QC" ? "GST 5%" : province === "AB" ? "GST 5%" : "HST 13%"} collected less ITCs
  → Quick Method rate: ~${/service|consult|professional/.test(i) ? "8.8%" : "4.4%"} on revenue
  → Estimated saving: $${Math.round(rev * (0.13 - (/service|consult/.test(i) ? 0.088 : 0.044))).toLocaleString()}/yr` : "Revenue above $400K or not applicable"}
`}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 5: COMPLIANCE EXPOSURE — Calculate penalty × probability × years
══════════════════════════════════════════════════════════════════════════════

${complianceCalc}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 6: CASH LEAKAGE — Calculate exact trapped cash
══════════════════════════════════════════════════════════════════════════════

Accounts Receivable:
  Monthly revenue: $${monthlyRev.toLocaleString()}
  Daily revenue: $${Math.round(rev / 365).toLocaleString()}
  Industry DSO target: ${/consult|professional/.test(i) ? "35-45" : /construct/.test(i) ? "45-60" : "25-35"} days
  Each 10 days excess DSO = $${Math.round(rev / 365 * 10).toLocaleString()} trapped
  → If DSO is 15 days above target: $${Math.round(rev / 365 * 15).toLocaleString()} freed by fixing

Vendor Contracts:
  Estimated recurring vendor spend: $${Math.round(rev * 0.15).toLocaleString()}/yr (15% of revenue typical)
  Contracts >2 years old save 8-15% when renegotiated
  → Conservative 10% on half of vendor spend: $${Math.round(rev * 0.15 * 0.5 * 0.10).toLocaleString()}/yr

Payment Processing:
  If accepting cards: revenue × card % × (current_rate − benchmark_rate)
  Benchmark: ${/restaurant|retail/.test(i) ? "2.3-2.6% card-present" : "2.7-3.1% card-not-present"}
  → At $${rev.toLocaleString()} and 0.3% excess rate: $${Math.round(rev * 0.003 * (/restaurant|retail/.test(i) ? 0.7 : 0.4)).toLocaleString()}/yr

Banking Fees:
  Commercial accounts should cost <$${rev < 500000 ? "30" : "50"}/mo
  → Excess: compare against Relay Financial (free) or Mercury (free) benchmarks

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 7: INSURANCE — Calculate the overpayment
══════════════════════════════════════════════════════════════════════════════

Businesses that haven't compared insurance in 2+ years overpay 15-25%.
  Estimated annual premium (${industry}): $${Math.round(rev * (/construct|transport/.test(i) ? 0.04 : /health|professional/.test(i) ? 0.025 : 0.015)).toLocaleString()}
  → 15% overpayment = $${Math.round(rev * (/construct|transport/.test(i) ? 0.04 : /health|professional/.test(i) ? 0.025 : 0.015) * 0.15).toLocaleString()}/yr recoverable

Missing coverage gaps = unquantified but flag as compliance risk:
  ${/tech|saas|health/.test(i) ? "Cyber liability: CRITICAL for this industry" : ""}
  ${rev >= 500000 ? "Key person insurance: if owner incapacitated, business value = $0" : ""}
  ${/consult|professional|legal/.test(i) ? "E&O / professional liability: CRITICAL" : ""}

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 8: PRICING EROSION — Calculate lost revenue
══════════════════════════════════════════════════════════════════════════════

Inflation erodes 2-3% of revenue purchasing power annually.
  If no price increase in 2 years: lost revenue = $${rev.toLocaleString()} × 5% = $${Math.round(rev * 0.05).toLocaleString()}/yr
  If no price increase in 3 years: $${Math.round(rev * 0.08).toLocaleString()}/yr

Revenue per customer optimization:
  Average transaction size — can it increase 5-10% with bundling/upsell?
  → 5% of $${rev.toLocaleString()} = $${Math.round(rev * 0.05).toLocaleString()}/yr additional revenue

══════════════════════════════════════════════════════════════════════════════
ANALYSIS 9: DEDUCTIONS BEING MISSED — Calculate exact tax savings
══════════════════════════════════════════════════════════════════════════════

${isUS ? `
Home office: ${emp === 0 || structure === "sole_proprietor" ? `$5/sq ft × 300 sq ft = $1,500 simplified deduction
  → Tax saving at marginal rate: $1,500 × ${rev > 200000 ? "32%" : "22%"} = $${Math.round(1500 * (rev > 200000 ? 0.32 : 0.22)).toLocaleString()}/yr (minimum)
  → Actual method often 2-3x higher` : "N/A (corporate structure)"}
Vehicle: ${/construct|real.estate|transport|consult/.test(i) ? `$0.70/mile (2025) × estimated business miles
  → 15,000 business miles × $0.70 = $10,500 deduction = $${Math.round(10500 * 0.25).toLocaleString()} tax saving` : "Assess business use percentage"}
Health insurance: ${structure !== "corporation" && structure !== "c_corp" ? `100% deductible for self-employed
  → Average $7,200/yr family premium × marginal rate = $${Math.round(7200 * 0.25).toLocaleString()} tax saving` : "Deductible through corporation"}
Retirement: ${structure === "sole_proprietor" || structure === "llc" ? `SEP-IRA: 25% of net × marginal rate
  → SEP contribution $${Math.round(Math.min(ebitdaEst * 0.25, 69000)).toLocaleString()} × ${rev > 200000 ? "32%" : "22%"} = $${Math.round(Math.min(ebitdaEst * 0.25, 69000) * (rev > 200000 ? 0.32 : 0.22)).toLocaleString()} tax saving` :
  `Solo 401(k): employee ($23,500) + employer (25% comp) = up to $69,000 sheltered`}
` : `
Home office: ${emp === 0 || structure === "sole_proprietor" ? "Deductible as business-use-of-home. Calculate actual costs × business use %" : "N/A"}
Vehicle: CRA rate $0.70/km first 5,000km, $0.64 after. Log required.
  → 20,000 business km ≈ $13,200 deduction × marginal rate = $${Math.round(13200 * (rev > 200000 ? 0.45 : 0.30)).toLocaleString()} tax saving
RRSP/IPP: ${rev > 100000 ? `At this income, RRSP room = 18% of earned income up to $32,490 (2025)
  → IPP: can exceed RRSP limits significantly for owners 45+` : "RRSP: 18% of prior year earned income"}
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

Big 4 firms always show how fixes COMPOUND. You must do the same.

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
  Example: $14,280/yr FICA saving ÷ 12 = $1,190/mo being wasted

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
  → This puts them at approximately P${rev < 100000 ? "25" : rev < 300000 ? "40" : rev < 500000 ? "50" : rev < 1000000 ? "65" : "80"} for revenue in this industry

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
`.trim();
}


// ─── Pre-computed industry targets ──────────────────────────────────────────
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


// ─── Tax calculations pre-computed for Claude ───────────────────────────────
function getTaxCalculations(isUS: boolean, rev: number, emp: number, structure: string, province: string, ebitda: number): string {
  if (isUS) {
    const isPassThrough = ["sole_proprietor","llc","s_corp","partnership"].includes(structure);
    const seRate = 0.153;
    const seCap = 176100;
    const currentSE = isPassThrough && structure !== "s_corp" ? Math.round(Math.min(ebitda, seCap) * seRate) : 0;
    const optimalW2 = Math.round(ebitda * 0.4);
    const optimalSE = Math.round(Math.min(optimalW2, seCap) * seRate);
    const seSaving = currentSE - optimalSE;

    return `
CURRENT STRUCTURE: ${structure}
Revenue: $${rev.toLocaleString()} | Est. EBITDA: $${ebitda.toLocaleString()}

${structure === "sole_proprietor" || structure === "llc" ? `
EXACT SE TAX CALCULATION:
  Current SE tax: $${Math.min(ebitda, seCap).toLocaleString()} × 15.3% = $${currentSE.toLocaleString()}/yr
  If S-corp with $${optimalW2.toLocaleString()} W-2 (40% of EBITDA):
    FICA on W-2: $${optimalW2.toLocaleString()} × 15.3% = $${optimalSE.toLocaleString()}/yr
    FICA on distribution ($${(ebitda - optimalW2).toLocaleString()}): $0
    Annual FICA saving: $${seSaving.toLocaleString()}/yr
    Minus S-corp admin cost (~$1,500/yr): NET SAVING = $${Math.max(0, seSaving - 1500).toLocaleString()}/yr
  ${seSaving > 3000 ? "→ THIS IS LIKELY YOUR #1 FINDING" : "→ Below S-corp breakeven — focus on deductions"}
` : structure === "s_corp" ? `
S-CORP ALREADY — OPTIMIZE THE SPLIT:
  Is owner W-2 at the optimal level? IRS "reasonable compensation" = ~40-60% of net.
  Optimal W-2: $${optimalW2.toLocaleString()} (40% of $${ebitda.toLocaleString()})
  Check: is current W-2 too high (wasting FICA) or too low (audit risk)?
` : `
CORPORATION (${structure}):
  ${structure === "c_corp" ? "Double taxation risk: corporate + dividend tax. Is S-corp election beneficial?" : ""}
  Reasonable compensation analysis required.
`}

QBI DEDUCTION (Section 199A):
  ${isPassThrough ? `QBI: ~$${ebitda.toLocaleString()} × 20% = $${Math.round(ebitda * 0.2).toLocaleString()} deduction
  Tax saving at marginal rate: $${Math.round(ebitda * 0.2 * (rev > 200000 ? 0.32 : 0.22)).toLocaleString()}/yr
  Check: W-2 wage limitation applies above $${rev > 200000 ? "191,950 (single) / $383,900 (joint)" : "threshold"}` : "N/A — C-corp not eligible"}
`;
  } else {
    // Canadian tax context
    const personalRate = rev > 200000 ? 0.50 : rev > 100000 ? 0.40 : 0.30;
    const corpRate = province === "AB" ? 0.11 : province === "SK" ? 0.12 : province === "QC" ? 0.122 : 0.122; // SBD rate
    const taxGap = personalRate - corpRate;
    const incorpSaving = structure === "sole_proprietor" ? Math.round(ebitda * taxGap * 0.5) : 0; // conservative 50% of gap

    return `
CURRENT STRUCTURE: ${structure}
Revenue: $${rev.toLocaleString()} | Est. EBITDA: $${ebitda.toLocaleString()}

${structure === "sole_proprietor" ? `
INCORPORATION ANALYSIS:
  Current marginal rate (${province}): ~${Math.round(personalRate * 100)}%
  CCPC SBD rate (${province}): ~${Math.round(corpRate * 100)}% on first $500K
  Rate gap: ${Math.round(taxGap * 100)}%
  Potential annual deferral on $${ebitda.toLocaleString()} EBITDA: ~$${incorpSaving.toLocaleString()}/yr
  ${rev >= 80000 ? "→ INCORPORATION IS LIKELY BENEFICIAL — model T4 vs dividend split" : "→ Below incorporation breakeven (~$80K) — focus on deductions"}
  Incorporation cost: ~$1,500-$3,000 setup + ~$2,000/yr maintenance
` : `
ALREADY INCORPORATED — OPTIMIZE:
  T4 salary vs eligible dividend split
  CPP: T4 above $71,300 (2025 YMPE) triggers 11.9% combined
  RRSP room: generated by T4 income (18% of earned income, max $32,490)
  SBD: is the $500K threshold being maximized?
`}

HST/GST:
  ${rev < 400000 ? `Quick Method eligible: revenue $${rev.toLocaleString()} < $400K
  Potential saving: estimate based on service vs goods mix` : "Above $400K — Quick Method not available. Focus on ITC optimization."}
  ${province === "QC" ? "QST separate: 9.975% + GST 5%. Dual filing with Revenu Québec." : ""}
`;
  }
}


// ─── Compliance exposure pre-computed ───────────────────────────────────────
function getComplianceExposure(isUS: boolean, rev: number, emp: number, province: string, hasPayroll: boolean): string {
  if (isUS) {
    const penalties: string[] = [];
    penalties.push(`Income tax filing: penalty 5%/mo up to 25% of tax owing. At est. $${Math.round(rev * 0.05).toLocaleString()} tax: max penalty $${Math.round(rev * 0.05 * 0.25).toLocaleString()}`);
    if (emp > 0) {
      penalties.push(`Form 941 (payroll): trust fund recovery penalty = 100% of unpaid employment taxes. Personal liability for responsible persons.`);
      penalties.push(`W-2 filing: $60-$310 per form × ${emp} employees = $${60 * emp}-$${310 * emp} penalty range`);
      penalties.push(`Workers comp: operating without = misdemeanor, fines up to $100K, personal injury liability`);
    }
    if (rev > 100000) penalties.push(`Sales tax nexus: if selling across state lines without registration = back taxes + 25% penalty + interest`);
    penalties.push(`BOI report (FinCEN): $500/day civil penalty. Criminal: up to $10K + 2yr imprisonment.`);
    return penalties.map((p, idx) => `  ${idx + 1}. ${p}`).join("\n");
  } else {
    const penalties: string[] = [];
    penalties.push(`T2 corporate/T1 personal: late filing 5% + 1%/month up to 12 months. At est. $${Math.round(rev * 0.04).toLocaleString()} tax: max $${Math.round(rev * 0.04 * 0.17).toLocaleString()}`);
    if (rev > 30000) penalties.push(`GST/HST: must be registered. Late filing penalty + interest at prescribed rate + 6%`);
    if (emp > 0) {
      penalties.push(`Source deductions: failure to remit = 10-20% penalty + director personal liability`);
      penalties.push(`T4/ROE: $100-$7,500 penalty per failure. Must issue T4 by Feb 28, ROE within 5 days of interruption.`);
      if (province === "QC") penalties.push(`CNESST: must register. Late = penalties + retroactive premiums + no coverage if injury.`);
      else if (province === "ON") penalties.push(`WSIB: must register if in mandatory industry. Operating without = fines + retroactive premiums.`);
    }
    if (province === "QC") penalties.push(`Law 25 privacy: privacy officer must be designated. Fines up to $25M or 4% of global revenue.`);
    return penalties.map((p, idx) => `  ${idx + 1}. ${p}`).join("\n");
  }
}
