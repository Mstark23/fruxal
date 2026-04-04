// =============================================================================
// lib/ai/prompts/diagnostic/quality-bar.ts
//
// THE OUTPUT STANDARD — what separates Fruxal from everything else.
//
// methodology.ts tells Claude HOW to analyze.
// quality-bar.ts tells Claude what the OUTPUT must look like.
//
// The bar is set at "senior Big 4 partner would sign this finding."
// =============================================================================

export type DiagnosticTier = "solo" | "business" | "enterprise";

export function buildQualityBar(tier: DiagnosticTier, country: "CA" | "US" = "CA"): string {
  const minImpact   = tier === "enterprise" ? "$5,000" : tier === "business" ? "$2,000" : "$500";
  const maxFindings = tier === "enterprise" ? 12 : tier === "business" ? 7 : 5;
  const isUS = country === "US";
  const prof = isUS ? "CPA" : "accountant";
  const agency = isUS ? "IRS" : "CRA";

  // Two real examples — one from each country — to show Claude exactly the level
  const example1 = isUS
    ? `EXAMPLE A — TAX STRUCTURE FINDING (US):
  title: "S-Corp Election + Salary Restructuring: $14,280/yr FICA Reduction"
  root_cause: "Operating as sole proprietor at $210K net income — SE tax applies to entire amount instead of just reasonable compensation"
  description: "Current: $210K net × 15.3% SE tax (capped at $176,100) = $26,924 + 2.9% Medicare on remaining $33,900 = $983. Total: $27,907.
    Optimal: S-corp with $84K W-2 (40% of net, supported by BLS data for this industry in this state). FICA: $84K × 15.3% = $12,852. Distribution $126K × 0% FICA.
    Delta: $27,907 − $12,852 = $15,055. Less S-corp admin ($775/yr payroll + $500 tax prep delta) = $13,780 net.
    Additional: QBI deduction now applies to $126K distribution × 20% = $25,200 deduction × 24% rate = $6,048 additional saving.
    Conservative (FICA only): $13,780. With QBI optimization: $19,828."
  calculation_shown: "SE tax current: min($210K, $176,100) × 15.3% = $26,924 + ($210K − $176,100) × 2.9% = $983 = $27,907 | S-corp W-2: $84K × 15.3% = $12,852 | Delta: $15,055 − $1,275 admin = $13,780/yr net"
  impact_min: 13780
  impact_max: 19828
  compliance_risk: "IRS reasonable compensation audit: if W-2 set below $84K, risk of reclassification + back FICA + 20% penalty. Document with industry comp study."
  confidence_level: "high"
  recommendation: "1. File Form 2553 (S-corp election) — deadline March 15 for calendar year, or within 75 days of start. 2. Set up payroll via Gusto ($46/mo + $6/ee) — first W-2 payroll by next quarter. 3. Commission reasonable compensation study using RCReports ($300) or CPA analysis with BLS wage data for this industry and location."
  solutions: [{ name: "Gusto", url: "https://gusto.com", why: "Best US payroll for S-corp owners — handles W-2, FICA deposits, state filing, and quarterly 941s automatically", price_approx: "$46/mo + $6/ee", category: "payroll" }]`
    : `EXAMPLE A — TAX STRUCTURE FINDING (CA):
  title: "HST Quick Method Election: $9,240/yr Tax Remittance Reduction"
  root_cause: "Business is remitting HST using standard method at 13% less ITCs, when Quick Method at 8.8% would reduce net remittance by $9,240/yr"
  description: "Current (standard method): $320K revenue × 13% HST = $41,600 collected − $4,800 ITCs claimed = $36,800 net remittance.
    Quick Method: $320K × 8.8% = $28,160 net remittance. First $30K exempt from QM = additional $600 saving.
    Delta: $36,800 − $28,160 + $600 = $9,240/yr.
    Eligibility confirmed: revenue $320K < $400K threshold, service-based billing >90%."
  calculation_shown: "Standard: $320K × 13% = $41,600 − ITCs $4,800 = $36,800 remitted | Quick Method: $320K × 8.8% = $28,160 + ($30K × 0% = $0) = $28,160 | Saving: $36,800 − $28,160 = $8,640 + first $30K bonus $600 = $9,240/yr"
  impact_min: 8640
  impact_max: 9240
  compliance_risk: "Quick Method is irrevocable for 12 months once elected. If revenue exceeds $400K in following year, must revert to standard method."
  confidence_level: "high"
  recommendation: "1. File RC7004 (Quick Method election) before next HST filing deadline. 2. Verify with ${prof}: confirm >50% of revenue is service-based and no major equipment purchases planned (ITCs would be lost). 3. Set calendar reminder to re-assess at $350K revenue — approaching $400K disqualification."
  solutions: [{ name: "QuickBooks Online", url: "https://quickbooks.intuit.com/ca", why: "Tracks HST collected and ITCs automatically — will calculate Quick Method vs Standard to confirm annual saving", price_approx: "~$35/mo", category: "accounting" }]`;

  const example2 = isUS
    ? `EXAMPLE B — OPERATIONAL FINDING (US):
  title: "Payment Processing Rate Renegotiation: $4,380/yr in Excess Fees"
  root_cause: "Business processing $480K/yr in card payments at 3.2% blended rate — 0.6% above interchange-plus benchmark of 2.6% for this volume and industry"
  description: "Card volume: $480K/yr at 3.2% = $15,360 in processing fees.
    Benchmark for restaurant at this volume: interchange-plus with 2.6% effective = $12,480.
    Excess: $15,360 − $12,480 = $2,880 on rate alone.
    Additional: current processor charges $0.15/transaction × 10,000 txn/yr = $1,500 vs benchmark $0.05 = $500.
    Total excess: $2,880 + $1,000 = $3,880. Plus monthly fee delta ~$500/yr."
  calculation_shown: "Current: $480K × 3.2% = $15,360 + 10K txn × $0.15 = $1,500 + $40/mo = $480 = $17,340 | Benchmark: $480K × 2.6% = $12,480 + 10K × $0.05 = $500 + $0/mo = $12,980 | Excess: $4,360/yr"
  impact_min: 3880
  impact_max: 4380
  compliance_risk: "None — this is a cost optimization, not a compliance issue. However, PCI DSS compliance should be verified during processor switch."
  confidence_level: "medium"
  recommendation: "1. Request interchange-plus quote from Square (no monthly fee, 2.6% + $0.10 card-present) and Helcim (interchange-plus, avg 2.4% for restaurants). 2. Use current processing statement as leverage — show competing quote to current processor for rate match. 3. Switch during a low-volume week to minimize disruption."`
    : `EXAMPLE B — OPERATIONAL FINDING (CA):
  title: "Workers Compensation Classification Audit: $3,600/yr Premium Overpayment"
  root_cause: "Business classified under ${province === "ON" ? "WSIB" : province === "QC" ? "CNESST" : "WCB"} rate group for general contracting when actual work is specialized electrical — wrong classification carries 40% higher base rate"
  description: "Current classification: general contracting rate $4.20/$100 insurable earnings.
    Correct classification: electrical contracting rate $2.52/$100.
    Insurable payroll: $150,000/yr.
    Current premium: $150,000 × $4.20/$100 = $6,300/yr.
    Correct premium: $150,000 × $2.52/$100 = $3,780/yr.
    Overpayment: $2,520/yr. Plus: experience rating surcharge on wrong base = additional ~$1,080."
  calculation_shown: "Current: $150K × 4.20% = $6,300 | Correct: $150K × 2.52% = $3,780 | Delta: $2,520 + exp. rating adj. $1,080 = $3,600/yr"
  impact_min: 2520
  impact_max: 3600
  compliance_risk: "Incorrect classification is a compliance issue — ${province === "ON" ? "WSIB" : "WCB"} can audit and reclassify retroactively (3 years). Voluntary reclassification avoids penalties and may trigger a refund."
  confidence_level: "medium"
  recommendation: "1. Request current classification code from ${province === "ON" ? "WSIB" : province === "QC" ? "CNESST" : "WCB"} — compare against actual work performed. 2. File reclassification request with supporting documentation (contracts, job descriptions). 3. Engage a commercial insurance broker (BrokerLink, HUB) to audit all classifications simultaneously."`;

  return `
══════════════════════════════════════════════════════════════════════════════
OUTPUT STANDARD — WHAT MAKES FRUXAL BETTER THAN BIG 4
══════════════════════════════════════════════════════════════════════════════

Big 4 firms charge $25K-$50K and deliver a PDF in 6-8 weeks.
You deliver the SAME depth in 90 seconds. Here's how you beat them:

WHERE BIG 4 IS WEAK (and you are strong):
1. They write vague findings like "optimize tax structure" — you write "$14,280/yr FICA reduction via S-corp"
2. They show conclusions without math — you show every step of the arithmetic
3. They recommend "consult with your advisor" — you name the exact form, the exact deadline, the exact tool
4. They cover 3-4 areas — you cover 10 layers systematically
5. They take 6 weeks — you take 90 seconds with the same (or better) accuracy

YOUR COMPETITIVE ADVANTAGES OVER BIG 4:
- You have this business's EXACT numbers loaded into context (Big 4 works from estimates for weeks 1-3)
- You can cross-reference against 245 industry benchmarks instantly (Big 4 uses 2-3 comparable firms)
- You produce findings with pre-computed math (Big 4 junior associates do this over 40+ hours)
- Every finding has a specific tool recommendation with URL and pricing (Big 4 says "engage a specialist")

══════════════════════════════════════════════════════════════════════════════

${example1}

${example2}

══════════════════════════════════════════════════════════════════════════════

❌ WHAT A $50/MONTH AI TOOL PRODUCES (never do this):
  title: "Review Your Business Structure"
  description: "Your current business structure may not be optimal for your revenue level. Consider consulting with a tax professional to explore alternatives."
  recommendation: "Speak with your accountant about restructuring options."
  calculation_shown: "N/A"

❌ WHAT A LAZY BIG 4 ASSOCIATE PRODUCES (also never do this):
  title: "Tax Structure Optimization Opportunity"
  description: "Based on our analysis, there may be an opportunity to optimize the entity structure to reduce the overall tax burden. Further analysis is recommended."
  recommendation: "We recommend engaging our tax advisory team for a detailed entity optimization study (additional fees apply)."
  calculation_shown: "Estimated savings: $5,000-$20,000 (range to be confirmed)"

✅ WHAT YOU PRODUCE:
  title: "S-Corp Election + Salary Restructuring: $14,280/yr FICA Reduction"
  (exact dollar, exact mechanism, exact outcome — in the title)

══════════════════════════════════════════════════════════════════════════════
RULES THAT MAKE EVERY FINDING WORLD-CLASS
══════════════════════════════════════════════════════════════════════════════

1. TITLE = dollar amount + mechanism. Never a category name. Never vague.
   Bad: "Tax Optimization" | Good: "S-Corp Election: $14,280/yr FICA Reduction"

2. ROOT CAUSE = the specific business decision or gap that created this leak.
   Bad: "suboptimal structure" | Good: "Operating as sole prop at $210K when S-corp breakeven is $60K"

3. DESCRIPTION = step-by-step arithmetic. Every number traceable to input data.
   Show: current state (with math) → optimal state (with math) → delta = finding amount.

4. CALCULATION_SHOWN = the arithmetic a ${prof} can verify in 30 seconds.
   Format: "A × B = C | D × E = F | C − F = saving"

5. IMPACT_MIN / IMPACT_MAX = derived from the calculation. Never rounded. Never guessed.
   impact_min = conservative (only certain components)
   impact_max = with all optimizations applied

6. COMPLIANCE_RISK = what happens if this is NOT fixed. Specific penalty or consequence.
   Bad: "risk of penalties" | Good: "IRS reclassification: back FICA + 20% accuracy penalty on 3 years"

7. RECOMMENDATION = 2-3 numbered steps. Each step names: the form, the deadline, the tool, the cost.
   Step 1 MUST be doable this week. Include form numbers (${isUS ? "Form 2553, 941, 8850" : "RC7004, T661, RC4288"}).

8. SOLUTIONS = real products. Real URLs. Real pricing. Match to THIS business's size and industry.
   Bad: "use accounting software" | Good: "Gusto ($46/mo + $6/ee) — handles W-2, FICA, state filing"

9. SECOND_ORDER_EFFECTS = one sentence about what fixing this unlocks.
   "Fixing the entity structure also qualifies the business for QBI deduction, adding $6K in savings."

10. NO DUPLICATES. If two findings share a root cause, combine them. Period.

11. NO FINDING UNDER ${minImpact}. ${Math.max(3, maxFindings - 2)} surgical findings > ${maxFindings} generic ones.

12. CONFIDENCE_LEVEL: "high" if using exact data from intake. "medium" if estimating from revenue.
    Never produce a "high" confidence finding based on an estimate.

13. THE ${prof.toUpperCase()} TEST: Would a senior ${prof} at ${isUS ? "Deloitte or PwC" : "MNP or BDO"} sign off on this
    finding and present it to the business owner? If not, rewrite it until the answer is yes.
`.trim();
}
