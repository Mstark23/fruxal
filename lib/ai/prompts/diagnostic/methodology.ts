// =============================================================================
// lib/ai/prompts/diagnostic/methodology.ts
//
// THE FRUXAL FORENSIC METHODOLOGY — 10-Layer Deep Analysis
//
// This is the core intellectual property of Fruxal. It defines HOW Claude
// analyzes a business — not just what to look for, but the exact analytical
// framework that produces Big 4-grade findings from intake data.
//
// Think of this as the "operating manual" for the most powerful AI-powered
// financial leak detection engine in the world.
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
  const prof = isUS ? "CPA" : "accountant";
  const agency = isUS ? "IRS" : "CRA";
  const i = industry.toLowerCase();

  // Revenue context
  const revBand = annualRevenue >= 5_000_000 ? "enterprise ($5M+)" :
    annualRevenue >= 1_000_000 ? "mid-market ($1M-$5M)" :
    annualRevenue >= 500_000 ? "growth ($500K-$1M)" :
    annualRevenue >= 150_000 ? "established ($150K-$500K)" :
    "micro ($0-$150K)";

  // Industry-specific metrics to check
  const industryChecks = getIndustryChecks(i, isUS);

  return `
══════════════════════════════════════════════════════════════════════════════
FRUXAL FORENSIC METHODOLOGY — 10-LAYER DEEP ANALYSIS
══════════════════════════════════════════════════════════════════════════════

You are performing the most thorough AI-powered financial diagnostic available.
Your analysis must be MORE specific than what a $50,000 Big 4 engagement produces.
Why? Because you have the business's exact numbers AND you can cross-reference
against thousands of industry benchmarks instantaneously.

BUSINESS CONTEXT:
- Revenue band: ${revBand}
- Industry: ${industry}
- Structure: ${structure}
- Employees: ${employees}
- Gross margin: ${grossMarginPct}%
- Location: ${province} (${country})

══════════════════════════════════════════════════════════════════════════════
LAYER 1: ENTITY & TAX STRUCTURE OPTIMIZATION
══════════════════════════════════════════════════════════════════════════════
Goal: Is this business in the OPTIMAL legal structure for its revenue level?

${isUS ? `
US ENTITY ANALYSIS:
- Sole prop → LLC → S-corp → C-corp decision tree
- At $${annualRevenue.toLocaleString()}: ${annualRevenue >= 60_000 ? "S-corp election likely beneficial — model the FICA savings" : "Below S-corp breakeven — focus on deduction optimization"}
- SE tax: 15.3% on first $176,100 (2025) + 2.9% Medicare above
- S-corp reasonable compensation: IRS targets W-2 below 40% of net profit
- QBI deduction (Section 199A): 20% of QBI for pass-throughs — check W-2 wage limitation
- ${structure === "sole_proprietor" || structure === "llc" ? "CRITICAL: Model sole prop vs S-corp — this is usually the #1 finding for this revenue level" : "Already structured — optimize W-2/distribution split"}
` : `
CANADIAN ENTITY ANALYSIS:
- Sole prop → Incorporation (CCPC) decision tree
- At $${annualRevenue.toLocaleString()}: ${annualRevenue >= 80_000 ? "Incorporation likely beneficial — model T4/dividend split" : "Below incorporation breakeven — focus on deductions"}
- Federal SBD: 9% on first $500K active business income (CCPC)
- Provincial rate varies: ${province === "AB" ? "8% (lowest)" : province === "QC" ? "3.2% (with federal = 12.2%)" : province === "ON" ? "3.2% (with federal = 12.2%)" : "check provincial rate"}
- Personal vs corporate rate gap: key to quantifying incorporation savings
- ${structure === "sole_proprietor" ? "CRITICAL: Model sole prop vs CCPC — this is usually the #1 finding" : "Already incorporated — optimize T4 vs eligible dividend split, check SBD grind-down"}
`}

══════════════════════════════════════════════════════════════════════════════
LAYER 2: COST STRUCTURE FORENSIC — LINE-BY-LINE P75 COMPARISON
══════════════════════════════════════════════════════════════════════════════
Goal: Identify EVERY cost line where this business exceeds the industry P75.

For each major cost category, calculate:
  gap = (this_business_% − industry_P50_%) × annual_revenue

Flag categories where gap > $${tier === "enterprise" ? "5,000" : tier === "business" ? "2,000" : "500"}/yr.

KEY COST CATEGORIES TO ANALYZE:
${industryChecks}

GENERAL (all industries):
- Rent/occupancy: target ${/restaurant|retail/.test(i) ? "6-10%" : "3-8%"} of revenue
- Insurance premiums: compare against 3 competitive quotes
- Professional fees (${prof}, legal): should be ${annualRevenue < 500_000 ? "2-4%" : "1-2%"} of revenue
- Banking fees: commercial accounts should cost <$50/mo for <$1M revenue
- Software/subscriptions: audit for overlap and unused seats
- Marketing/advertising: track ROI per channel — eliminate <2x ROAS channels

══════════════════════════════════════════════════════════════════════════════
LAYER 3: PAYROLL & HUMAN CAPITAL EFFICIENCY
══════════════════════════════════════════════════════════════════════════════
Goal: Is every dollar of payroll generating maximum return?

${employees > 0 ? `
With ${employees} employees:
- Revenue per employee: $${Math.round(annualRevenue / Math.max(employees, 1)).toLocaleString()} — industry target?
- Payroll as % of revenue: should be ${/restaurant|food/.test(i) ? "25-32%" : /consult|professional/.test(i) ? "40-55%" : "20-35%"}
- ${isUS ? "FICA optimization: are owner draws vs W-2 optimized?" : "CPP optimization: T4 salary at optimal level?"}
- ${isUS ? "WOTC screening: $2,400-$9,600 per eligible hire — is Form 8850 filed within 28 days?" : "Hiring credits: provincial wage subsidies being claimed?"}
- Workers comp classification: wrong NAICS/industry code = overpayment by 15-40%
- Overtime policy: are overtime costs tracked and managed?
- ${isUS ? "1099 vs W-2 classification: IRS 20-factor test — misclassification = back taxes + penalties" : "Contractor vs employee: CRA tests — misclassification = source deduction liability"}
` : `
Solo operator — no employees:
- Owner compensation optimization is the primary lever
- ${isUS ? "SE tax reduction through S-corp election" : "Salary vs dividend mix if incorporated"}
- Contractor engagement: are all 1099s/${isUS ? "W-9s" : "T4As"} issued?
`}

══════════════════════════════════════════════════════════════════════════════
LAYER 4: TAX CREDIT & GOVERNMENT PROGRAM MAXIMIZATION
══════════════════════════════════════════════════════════════════════════════
Goal: Identify EVERY credit, grant, and program this business qualifies for.

${isUS ? `
US PROGRAMS TO CHECK:
- R&D Tax Credit (Section 41): ${doesRd ? "R&D flagged YES — calculate QREs: wages (65%), supplies (35%), contract research (65% of external). 14% ASC method vs 20% incremental." : `Does this ${industry} do ANY process improvement, custom software, or technical development?`}
- Section 179 expensing: $1,250,000 limit (2025) — any equipment/software purchases?
- Bonus depreciation: 60% first-year (2025) on qualifying assets
- WOTC: up to $9,600 per eligible hire (veterans, SNAP, ex-felons, long-term unemployed)
- SBA programs: 7(a), 504, microloans — does this business qualify?
- State-specific: check ${province} state credits and incentives
` : `
CANADIAN PROGRAMS TO CHECK:
- SR&ED: ${doesRd ? "R&D flagged YES — 35% refundable federal ITC on first $3M eligible for CCPCs." : `Does this ${industry} do ANY process improvement, custom software, or technical development?`}
  ${province === "QC" ? "QC: additional 30% provincial refundable credit." : ""}
- CDAP: $15K grant + $100K interest-free loan for digital adoption
- CSBFP: government-backed loans up to $1.15M
- Canada Job Grant: up to $10K/employee for training
- Provincial: check ${province}-specific credits and programs
`}

══════════════════════════════════════════════════════════════════════════════
LAYER 5: COMPLIANCE & PENALTY EXPOSURE MAPPING
══════════════════════════════════════════════════════════════════════════════
Goal: Calculate EXACT penalty exposure using: probability × max_penalty × years_at_risk

${isUS ? `
US COMPLIANCE MATRIX:
- Federal income tax (1120/1120-S/Schedule C): filed on time? Estimated payments current?
- Payroll (Form 941 quarterly, 940 annual): deposits on time? Trust fund risk?
- W-2/1099 (January 31 deadline): penalty $60-$310 per form, $630 intentional disregard
- Sales tax nexus: economic nexus in all states where >$100K or 200 transactions?
- ${province} state filings: annual report, franchise tax, state income tax
- BOI report (FinCEN): filed? $500/day civil penalty
- Workers comp: coverage current? Operating without = criminal misdemeanor in most states
` : `
CANADIAN COMPLIANCE MATRIX:
- T2 corporate return: filed within 6 months of fiscal year-end? 5% + 1%/month penalty
- GST/HST: registered if revenue >$30K? Filing on time? ITCs claimed?
  ${province === "QC" ? "QST: separate filing with Revenu Québec" : ""}
- Payroll: source deductions remitted? T4s filed by Feb 28? ROEs issued?
- ${province === "ON" ? "WSIB: registered? Rate class correct?" : province === "QC" ? "CNESST: registered? Classification correct? CCQ if construction?" : "Provincial WCB: registered and current?"}
- ${province === "QC" ? "Law 25 privacy compliance: privacy officer designated? Privacy policy published?" : "PIPEDA compliance: privacy policy current?"}
`}

══════════════════════════════════════════════════════════════════════════════
LAYER 6: CASH FLOW & WORKING CAPITAL OPTIMIZATION
══════════════════════════════════════════════════════════════════════════════
Goal: Free trapped cash and reduce the cash conversion cycle.

- Accounts receivable DSO: industry average is ${/consult|professional/.test(i) ? "35-45" : /construct/.test(i) ? "45-60" : "25-35"} days — what's this business at?
- At $${annualRevenue.toLocaleString()} revenue, each 10 days excess DSO = ~$${Math.round(annualRevenue / 365 * 10).toLocaleString()} tied up
- Vendor payment terms: are early payment discounts being captured? (2/10 net 30 = 36% annualized return)
- ${annualRevenue >= 500_000 ? "Credit facility: is the business using a line of credit optimally? What's the rate vs market?" : "Banking: is the business earning interest on idle cash? High-yield business accounts available at 4%+"}
- Payment processing: current rate vs interchange-plus benchmark (should be 2.2-2.6% for card-present, 2.7-3.1% for card-not-present)
- Vendor contract age: contracts >2 years old are typically 8-15% above market — renegotiation opportunity

══════════════════════════════════════════════════════════════════════════════
LAYER 7: INSURANCE & RISK TRANSFER OPTIMIZATION
══════════════════════════════════════════════════════════════════════════════
Goal: Ensure adequate coverage at competitive premiums.

- General liability: adequate limits for this industry?
- Professional liability / E&O: ${/consult|professional|legal|tech/.test(i) ? "CRITICAL for this industry — verify limits" : "assess need based on client contracts"}
- Cyber liability: ${/tech|saas|health|legal/.test(i) ? "HIGH PRIORITY — data breach exposure" : "assess based on data handling"}
- Key person insurance: ${annualRevenue >= 500_000 ? "if owner incapacitated, what happens to the business? Quantify the risk." : "assess need"}
- Business interruption: coverage adequate? Many policies exclude pandemics/cyber
- Premium comparison: businesses that haven't compared in 2+ years overpay 15-25%

══════════════════════════════════════════════════════════════════════════════
LAYER 8: VENDOR & CONTRACT LEVERAGE
══════════════════════════════════════════════════════════════════════════════
Goal: Renegotiate every recurring cost that hasn't been reviewed in 12+ months.

- Rent/lease: when does it renew? What's the market rate? Leverage: vacancy rates in area
- Telecom/internet: business plans overcharge by 20-40% vs competitive offers
- Software licenses: are all seats used? Annual vs monthly pricing delta?
- Supplier costs: 3 competitive quotes on top 5 suppliers typically saves 8-15%
- Professional fees: ${prof} and legal fees should be benchmarked annually
- ${/restaurant|retail/.test(i) ? "Food/supply distributors: GPO (group purchasing) savings of 5-12%" : ""}

══════════════════════════════════════════════════════════════════════════════
LAYER 9: GROWTH & REVENUE OPTIMIZATION
══════════════════════════════════════════════════════════════════════════════
Goal: Identify revenue being left on the table.

- Pricing: when was the last price increase? Inflation alone erodes 2-3%/yr
- Revenue per customer: can average transaction size be increased?
- Customer retention: what's the churn/attrition rate vs industry?
- Underutilized capacity: ${/restaurant/.test(i) ? "seat utilization during off-peak" : /consult|professional/.test(i) ? "billable utilization rate" : "production capacity utilization"}
- Cross-sell/upsell: are existing customers buying the full product/service range?
- Referral program: structured referral incentives typically increase leads 20-35%

══════════════════════════════════════════════════════════════════════════════
LAYER 10: EXIT READINESS & ENTERPRISE VALUE
══════════════════════════════════════════════════════════════════════════════
Goal: Every operational improvement has an enterprise value multiplier effect.

${tier === "enterprise" ? `
- Current EV estimate at industry EBITDA multiple
- Value killers: owner dependency, customer concentration, key person risk, pending litigation
- Value builders: recurring revenue %, documented processes, management team, IP
- ${isUS ? "QSBS (Section 1202): if C-corp + held 5yrs + original issue → up to $10M exclusion" : "LCGE: $1.25M lifetime capital gains exemption for QSBC shares"}
- Every finding's EBITDA improvement × EV multiple = enterprise value impact
` : `
- Even for ${revBand} businesses: bankability score affects loan terms, insurance rates, and future exit options
- Every $1 of EBITDA improvement = $3-6× enterprise value at exit
- Document processes now — reduces owner dependency (biggest value killer)
`}

══════════════════════════════════════════════════════════════════════════════
CROSS-VALIDATION PROTOCOL
══════════════════════════════════════════════════════════════════════════════

Before finalizing your JSON output, verify:

1. MATH CHECK: Sum of all finding impact_max ≈ totals.annual_leaks (±10%)
2. REVENUE CHECK: No finding's impact exceeds 30% of annual revenue (unrealistic)
3. OVERLAP CHECK: No two findings address the same root cause
4. CONSISTENCY CHECK: If finding A references $X revenue, all other findings use same $X
5. BENCHMARK CHECK: Every benchmark_comparison uses a real industry metric, not invented
6. SOLUTION CHECK: Every solution URL is a real website that exists
7. ${isUS ? "FORM CHECK: Every IRS form referenced is real and applicable" : "FORM CHECK: Every CRA form referenced is real and applicable"}
8. CONFIDENCE CHECK: findings based on estimates get confidence_level "medium", exact data gets "high"
`.trim();
}


function getIndustryChecks(i: string, isUS: boolean): string {
  if (/restaurant|food|cafe|bar/.test(i)) return `
RESTAURANT/FOOD SERVICE:
- Food cost: target 28-32% of food revenue (check COGS detail)
- Labor cost: target 25-32% of revenue (include benefits + taxes)
- Liquor cost: target 18-22% of liquor revenue (if applicable)
- Prime cost (food + labor): should be <65% of revenue
- Occupancy: target 6-10% of revenue
- CC processing: should be <2.8% blended rate
- Tip compliance: ${isUS ? "FICA tip credit (Section 45B) being claimed?" : "gratuity reporting compliant?"}
- Waste/shrinkage: industry benchmark 2-4% of food cost`;

  if (/construct|contractor|trade|plumb|electric|hvac/.test(i)) return `
CONSTRUCTION/TRADES:
- Gross margin: target 25-40% (varies by trade)
- Material cost: target 25-35% (are supplier discounts being captured?)
- Subcontractor markup: are sub costs competitive? 3 bids minimum?
- Equipment: ${isUS ? "Section 179 on all qualifying equipment" : "CCA schedule optimized?"}
- Job costing: is every project tracked for profitability?
- Change orders: are all scope changes documented and billed?
- Workers comp: classification code correct? Wrong code = 15-40% overpayment
- ${isUS ? "" : "Holdback: 10% statutory holdback being managed for cash flow?"}`;

  if (/saas|software|tech|digital|app/.test(i)) return `
SAAS/TECHNOLOGY:
- Gross margin: target 70-85% (below 65% = structural problem)
- Customer acquisition cost (CAC): payback period should be <18 months
- Churn rate: target <5% annual for B2B, <7% for B2C
- Hosting/infrastructure: right-sized? Cloud costs optimized?
- ${isUS ? "R&D credit (Section 41): ALL qualifying development is eligible — wages, cloud, contractors" : "SR&ED: ALL qualifying development eligible — salaries, materials, overhead. 35% refundable for CCPCs."}
- Contractor vs employee: ${isUS ? "IRS 20-factor test" : "CRA tests"} — misclassification is the #1 audit trigger in tech
- Revenue recognition: ARR vs MRR accuracy, deferred revenue accounting`;

  if (/consult|professional|legal|account|engineer|architect/.test(i)) return `
PROFESSIONAL SERVICES:
- Utilization rate: target 65-75% of available hours billed
- Effective hourly rate: actual collected ÷ hours worked (not list rate)
- Realization rate: collected ÷ billed (target >92%)
- WIP (work in progress): is unbilled WIP growing? Cash flow risk
- Partner/owner compensation: ${isUS ? "W-2/distribution split optimized?" : "T4/dividend mix optimized?"}
- Professional liability (E&O): limits adequate for engagement sizes?
- Retirement: ${isUS ? "defined benefit plan can shelter $200K+/yr for owners 50+" : "IPP can significantly exceed RRSP limits for owners with T4 income"}`;

  if (/retail|ecommerce|store|shop/.test(i)) return `
RETAIL/E-COMMERCE:
- Gross margin: target 40-55% (varies by category)
- Inventory turnover: target 4-8x/year (low = dead stock, high = stockouts)
- Shrinkage: target <2% of revenue
- Markdown rate: track clearance losses
- CC processing: interchange-plus should be 2.2-2.8% (watch for tiered/flat rate traps)
- ${isUS ? "Sales tax nexus: economic nexus in all states where >$100K or 200 transactions" : "HST/GST Quick Method: eligible if <$400K revenue, saves 2-4% on tax remittance"}
- Return rate: industry average 8-10% for e-commerce, 5-8% for brick-and-mortar`;

  if (/health|medical|dental|clinic|pharmacy/.test(i)) return `
HEALTHCARE:
- Collections rate: target 92-97% of billed amounts
- Overhead ratio: target 55-65% of revenue
- Staff cost: target 25-35% of revenue
- Equipment depreciation: ${isUS ? "Section 179 on all qualifying medical equipment" : "CCA schedule — accelerated depreciation available?"}
- Insurance reimbursement optimization: are all eligible codes being billed?
- ${isUS ? "HIPAA compliance: risk assessment current? Breach insurance adequate?" : "PHIPA/provincial privacy compliance"}
- Associate compensation: production-based vs salary — which is optimal?`;

  if (/transport|trucking|logistics|freight/.test(i)) return `
TRANSPORTATION/TRUCKING:
- Operating ratio: target 85-95% (>95% = trouble)
- Fuel cost: target 25-35% of revenue (${isUS ? "$0.67/mile standard deduction vs actual" : "per-km tracking for CCA and fuel tax credits"})
- Deadhead percentage: target <15% (empty miles = pure cost)
- Maintenance: target 8-12% of revenue (predictive maintenance reduces this)
- Insurance: classification code drives 30%+ of premium — verify correct class
- ${isUS ? "Per diem: $69/day (2024) for DOT drivers — 80% deductible" : "Meal allowance: $23/meal CRA rate — track every trip"}
- ELD/compliance: ${isUS ? "FMCSA compliance current?" : "Hours of service compliance?"}`;

  // Generic for all other industries
  return `
INDUSTRY-SPECIFIC (${i}):
- Gross margin: compare against industry P50 and P75
- Largest 3 cost lines: compare each against benchmark
- Revenue per employee: $${Math.round(100000).toLocaleString()} is typical SMB baseline — how does this compare?
- Customer concentration: >20% revenue from one customer = risk
- Pricing power: when was last price increase? Inflation erodes 2-3%/yr`;
}
