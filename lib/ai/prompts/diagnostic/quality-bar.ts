// =============================================================================
// lib/ai/prompts/diagnostic/quality-bar.ts
//
// THE OUTPUT STANDARD — what separates Fruxal from everything else.
//
// methodology.ts tells Claude HOW to analyze.
// quality-bar.ts tells Claude what the OUTPUT must look like.
//
// The bar is set at "a senior CPA would sign this finding."
// =============================================================================

export type DiagnosticTier = "solo" | "business" | "enterprise";

export function buildQualityBar(tier: DiagnosticTier, country: "CA" | "US" = "CA", industry: string = "general"): string {
  const minImpact   = tier === "enterprise" ? "$5,000" : tier === "business" ? "$2,000" : "$500";
  const maxFindings = tier === "enterprise" ? 12 : tier === "business" ? 7 : 5;
  const isUS = country === "US";
  const prof = isUS ? "CPA" : "accountant";
  const agency = isUS ? "IRS" : "CRA";

  // Industry-matched examples — show Claude the exact quality bar for this business's industry
  const ind = industry.toLowerCase();
  const { example1, example2 } = resolveIndustryExamples(ind, isUS, prof);

  return `
══════════════════════════════════════════════════════════════════════════════
OUTPUT STANDARD — WORLD-CLASS FINDINGS
══════════════════════════════════════════════════════════════════════════════

${example1}

${example2}

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

13. THE ${prof.toUpperCase()} TEST: Would a senior ${prof} sign off on this finding and present it to the business owner? If not, rewrite it until the answer is yes.
`.trim();
}


// =============================================================================
// Industry-matched example pairs — so the quality bar resonates with the
// actual business type being diagnosed instead of always showing the same
// generic HST / WCB examples.
// =============================================================================
function resolveIndustryExamples(
  ind: string,
  isUS: boolean,
  prof: string
): { example1: string; example2: string } {

  // ── Restaurant / Food ────────────────────────────────────────────────────
  if (/restaurant|food|cafe|bar|bakery|catering/.test(ind)) {
    const example1 = isUS
      ? `EXAMPLE A — COST OF GOODS FINDING (US — Restaurant):
  title: "Food Cost Optimization: $18,720/yr COGS Reduction"
  root_cause: "Actual food cost running at 36.2% of revenue vs industry benchmark of 28-32% — 4.2% excess on $480K food revenue"
  description: "Current food cost: $480K × 36.2% = $173,760. Benchmark (top quartile): 32%. Target: $480K × 32% = $153,600. Delta: $20,160. Conservative (portion control + supplier renegotiation): $18,720."
  calculation_shown: "Current: $480K × 36.2% = $173,760 | Target: $480K × 32% = $153,600 | Delta: $20,160 | Conservative: $18,720/yr"
  impact_min: 15600
  impact_max: 20160
  compliance_risk: "No regulatory risk — operational. Food cost above 35% signals inventory shrinkage or waste."
  confidence_level: "medium"
  recommendation: "1. Run 2-week waste audit. 2. Rebid top 10 ingredients with 3 suppliers. 3. Implement recipe costing in MarketMan or BlueCart."`
      : `EXAMPLE A — COST OF GOODS FINDING (CA — Restaurant):
  title: "Food Cost Optimization: $18,720/yr COGS Reduction"
  root_cause: "Actual food cost at 36.2% vs benchmark of 28-32% — excess on $480K food revenue"
  description: "Current: $480K × 36.2% = $173,760. Target: $480K × 32% = $153,600. Delta: $20,160. Conservative: $18,720."
  calculation_shown: "Current: $480K × 36.2% = $173,760 | Target: $480K × 32% = $153,600 | Conservative: $18,720/yr"
  impact_min: 15600
  impact_max: 20160
  compliance_risk: "No regulatory risk — operational optimization."
  confidence_level: "medium"
  recommendation: "1. Run 2-week waste audit. 2. Rebid top 10 ingredients. 3. Implement recipe costing in MarketMan ($239/mo)."`;

    const example2 = isUS
      ? `EXAMPLE B — PROCESSING FEES FINDING (US — Restaurant):
  title: "Payment Processing Rate Renegotiation: $4,380/yr in Excess Fees"
  root_cause: "Processing $480K/yr at 3.2% blended rate — 0.6% above interchange-plus benchmark of 2.6%"
  description: "Card volume: $480K × 3.2% = $15,360. Benchmark: 2.6% = $12,480. Plus per-txn excess and fee delta. Total excess: $4,380/yr."
  calculation_shown: "Current: $17,340 | Benchmark: $12,980 | Excess: $4,360/yr"
  impact_min: 3880
  impact_max: 4380
  compliance_risk: "None — cost optimization. Verify PCI DSS compliance during processor switch."
  confidence_level: "medium"
  recommendation: "1. Request interchange-plus quote from Square and Helcim. 2. Use current statement as leverage. 3. Switch during low-volume week."`
      : `EXAMPLE B — PROCESSING FEES FINDING (CA — Restaurant):
  title: "Payment Processing Rate Renegotiation: $3,840/yr in Excess Fees"
  root_cause: "Processing $420K/yr at 2.9% blended rate — 0.5% above benchmark of 2.4%"
  description: "Card volume: $420K × 2.9% = $12,180. Benchmark: 2.4% = $10,080. Plus per-txn excess. Total: $3,840/yr."
  calculation_shown: "Current: $13,920 | Benchmark: $10,780 | Excess: $3,840/yr"
  impact_min: 3140
  impact_max: 3840
  compliance_risk: "None — cost optimization."
  confidence_level: "medium"
  recommendation: "1. Request interchange-plus quote from Helcim and Clover. 2. Leverage current statement for rate match. 3. Switch during low-volume period."`;

    return { example1, example2 };
  }

  // ── Construction / Trades ────────────────────────────────────────────────
  if (/construct|contractor|trade|plumb|electric|hvac|roofing/.test(ind)) {
    const example1 = isUS
      ? `EXAMPLE A — CLASSIFICATION FINDING (US — Construction):
  title: "Workers Comp Classification Correction: $4,200/yr Premium Overpayment"
  root_cause: "Classified under general contracting WC code when actual work is specialized — wrong code carries 35% higher base rate"
  description: "Current code rate: $5.40/$100. Correct: $3.51/$100. On $180K payroll: $9,720 vs $6,318. Delta: $3,402 + exp mod adj $798."
  calculation_shown: "Current: $180K × 5.40% = $9,720 | Correct: $180K × 3.51% = $6,318 | Delta: $3,402 + $798 = $4,200/yr"
  impact_min: 3402
  impact_max: 4200
  compliance_risk: "State WC board can reclassify retroactively (3 years). Voluntary correction avoids penalties."
  confidence_level: "medium"
  recommendation: "1. Request current NCCI classification from carrier. 2. File reclassification with supporting contracts. 3. Engage commercial insurance broker for full audit."`
      : `EXAMPLE A — CLASSIFICATION FINDING (CA — Construction):
  title: "WCB Classification Audit: $3,600/yr Premium Overpayment"
  root_cause: "Classified under general contracting WCB rate when actual work is specialized — wrong class carries 40% higher rate"
  description: "Current: $4.20/$100. Correct: $2.52/$100. On $150K payroll: $6,300 vs $3,780. Overpayment: $2,520 + experience rating $1,080."
  calculation_shown: "Current: $150K × 4.20% = $6,300 | Correct: $150K × 2.52% = $3,780 | Delta: $2,520 + $1,080 = $3,600/yr"
  impact_min: 2520
  impact_max: 3600
  compliance_risk: "Provincial WCB can audit retroactively (3 years). Voluntary reclassification avoids penalties."
  confidence_level: "medium"
  recommendation: "1. Request classification code from WCB/WSIB/CNESST. 2. File reclassification with documentation. 3. Engage broker (BrokerLink, HUB) for full audit."`;

    const example2 = isUS
      ? `EXAMPLE B — DEPRECIATION FINDING (US — Construction):
  title: "Equipment Section 179 + Bonus Depreciation: $22,400/yr Tax Reduction"
  root_cause: "Equipment purchases of $112K depreciated straight-line instead of Section 179 immediate expensing"
  description: "Section 179: $112K full deduction year 1. At 24% rate: $26,880 first-year benefit vs $3,840 straight-line. NPV advantage: $22,400."
  calculation_shown: "Section 179: $112K × 24% = $26,880 yr-1 | Straight-line: $16K × 24% = $3,840/yr | NPV advantage: $22,400"
  impact_min: 18000
  impact_max: 26880
  compliance_risk: "Section 179 is elective — no risk. Must file Form 4562. Phase-out at $3.05M total purchases."
  confidence_level: "high"
  recommendation: "1. Amend current return to elect Section 179 (Form 4562). 2. Structure future acquisitions for first-year expensing. 3. Review all assets for bonus depreciation eligibility."`
      : `EXAMPLE B — CCA FINDING (CA — Construction):
  title: "Equipment CCA Reclassification: $8,400/yr Tax Reduction"
  root_cause: "Heavy equipment in CCA Class 8 (20%) when qualifying mobile equipment should be Class 10 (30%)"
  description: "Class 10 + ACII: $140K × 45% = $63K deduction. Class 8 + ACII: $140K × 30% = $42K. Delta: $21K × 26.5% = $5,565 yr-1. Annualized: $8,400/yr."
  calculation_shown: "Class 10: $63K deduction | Class 8: $42K | Delta: $21K × 26.5% = $5,565 yr-1 | Annualized: $8,400/yr"
  impact_min: 5565
  impact_max: 8400
  compliance_risk: "CCA misclassification can trigger CRA reassessment. Voluntary correction is penalty-free."
  confidence_level: "medium"
  recommendation: "1. Review fixed assets with ${prof} for Class 10/10.1 eligibility. 2. File T2 adjustment if applicable. 3. Update capital asset register."`;

    return { example1, example2 };
  }

  // ── SaaS / Software / Tech ───────────────────────────────────────────────
  if (/saas|software|tech|digital|app|platform|cloud|ai/.test(ind)) {
    const example1 = isUS
      ? `EXAMPLE A — R&D CREDIT FINDING (US — SaaS/Tech):
  title: "R&D Tax Credit (Section 41): $38,500/yr Unclaimed Credit"
  root_cause: "3 developers spending ~70% on qualifying R&D — zero QREs claimed"
  description: "Developer wages: $320K. R&D-eligible (70%): $224K QREs. Cloud infra supplies: $29K. Total QREs: $253K. ASC method: 14% × ($253K − $90K) = $22,820/yr. Conservative over 2 open years: $38,500."
  calculation_shown: "QREs: $224K + $29K = $253K | ASC: 14% × $163K = $22,820/yr | 2 years conservative: $38,500"
  impact_min: 22820
  impact_max: 45640
  compliance_risk: "R&D credit audit-prone (~10% exam rate). Contemporaneous documentation critical. Engage specialist ($3K–$5K)."
  confidence_level: "medium"
  recommendation: "1. Engage R&D specialist (Tri-Merit, alliantgroup, Clarus R+D). 2. Pull Git logs, Jira tickets as evidence. 3. File Form 6765 with amended returns."`
      : `EXAMPLE A — SR&ED CREDIT FINDING (CA — SaaS/Tech):
  title: "SR&ED Refundable Credit: $42,000/yr Unclaimed R&D Credit"
  root_cause: "3 developers spending ~70% on qualifying SR&ED — zero T661 filed"
  description: "Developer wages: $300K × 70% = $210K QEs. Federal: $210K × 35% = $73,500. Provincial: $7,350. Conservative: $42,000/yr."
  calculation_shown: "QEs: $210K | Federal: $73,500 | Provincial: $7,350 | Total: $80,850 | Conservative: $42,000/yr"
  impact_min: 42000
  impact_max: 80850
  compliance_risk: "SR&ED audited ~20% of claims. Contemporaneous docs critical. CRA can deny entire claim if weak."
  confidence_level: "medium"
  recommendation: "1. Engage SR&ED consultant (Conceptivity, NorthBridge — contingency 20-25%). 2. Pull Git history, design docs. 3. File T661 + T2SCH31."`;

    const example2 = isUS
      ? `EXAMPLE B — SAAS TOOL BLOAT FINDING (US — SaaS/Tech):
  title: "SaaS Subscription Audit: $11,400/yr in Redundant/Unused Licenses"
  root_cause: "42 active subscriptions for 12 people — 8 overlapping tools, 14 unused seats"
  description: "Total SaaS: $68K/yr. Unused seats: 14 × $45/mo = $7,560. Redundant tools: $3,840/yr. Total: $11,400."
  calculation_shown: "Unused: 14 × $45/mo × 12 = $7,560 | Redundant: $3,840 | Total: $11,400/yr"
  impact_min: 7560
  impact_max: 11400
  compliance_risk: "None — cost optimization. Unused accounts with permissions are a security risk (SOC 2)."
  confidence_level: "medium"
  recommendation: "1. Run SaaS audit (Productiv, Zylo, or manual). 2. Cancel unused seats. 3. Consolidate redundant tools at renewal."`
      : `EXAMPLE B — SAAS TOOL BLOAT FINDING (CA — SaaS/Tech):
  title: "SaaS Subscription Audit: $9,600/yr in Redundant/Unused Licenses"
  root_cause: "38 active subscriptions for 10 people — overlapping tools and unused seats"
  description: "Total SaaS: $58K/yr. Unused seats: 12 × $40/mo = $5,760. Redundant tools: $3,840. Total: $9,600."
  calculation_shown: "Unused: 12 × $40/mo × 12 = $5,760 | Redundant: $3,840 | Total: $9,600/yr"
  impact_min: 5760
  impact_max: 9600
  compliance_risk: "None — cost optimization."
  confidence_level: "medium"
  recommendation: "1. Run full SaaS audit. 2. Cancel unused seats. 3. Consolidate redundant tools at renewal."`;

    return { example1, example2 };
  }

  // ── Professional Services / Consulting ───────────────────────────────────
  if (/consult|professional|legal|account|engineer|architect/.test(ind)) {
    const example1 = isUS
      ? `EXAMPLE A — BILLING LEAKAGE FINDING (US — Professional Services):
  title: "Billing Leakage Recovery: $24,000/yr in Unbilled Time"
  root_cause: "Realization rate at 78% vs benchmark of 88-92% — scope creep and write-offs losing 10% of billable time"
  description: "Capacity: 4 × 1,800 hrs × $200 = $1,440K. Current 78%: $1,123K. Target 83%: $1,195K. Delta: $72K. Conservative: $24,000/yr."
  calculation_shown: "Capacity: $1,440K | Current 78%: $1,123K | Target 83%: $1,195K | Conservative: $24,000/yr"
  impact_min: 24000
  impact_max: 72000
  compliance_risk: "No regulatory risk. Under-billing signals engagement letter gaps — increases E&O exposure."
  confidence_level: "medium"
  recommendation: "1. Implement time tracking (Harvest $12/user/mo). 2. Engagement letters with change-order pricing. 3. Weekly WIP review."`
      : `EXAMPLE A — BILLING LEAKAGE FINDING (CA — Professional Services):
  title: "Billing Leakage Recovery: $22,000/yr in Unbilled Time"
  root_cause: "Realization rate at 79% vs benchmark 88-92% — scope creep and write-offs"
  description: "Capacity: 4 × 1,800 × $185 = $1,332K. Current 79%: $1,052K. Target 84%: $1,119K. Conservative: $22,000/yr."
  calculation_shown: "Capacity: $1,332K | Current 79%: $1,052K | Target 84%: $1,119K | Conservative: $22,000/yr"
  impact_min: 22000
  impact_max: 67000
  compliance_risk: "No regulatory risk. Under-billing signals E&O exposure."
  confidence_level: "medium"
  recommendation: "1. Implement time tracking (Harvest, Toggl). 2. Engagement letters with change-order pricing. 3. Weekly WIP review."`;

    const example2 = isUS
      ? `EXAMPLE B — INSURANCE FINDING (US — Professional Services):
  title: "E&O Insurance Optimization: $3,200/yr Premium Reduction"
  root_cause: "Policy auto-renewed at $12,800/yr — market rate is $9,600 for equivalent coverage"
  description: "Current: $12,800 ($2M/$4M). Market: $9,600. Delta: $3,200. Plus missing cyber rider: $800/yr covers $50K+ breach costs."
  calculation_shown: "Current: $12,800 | Market: $9,600 | Delta: $3,200 (net of $800 cyber: $2,400)"
  impact_min: 2400
  impact_max: 3200
  compliance_risk: "Operating without adequate E&O exposes partners personally."
  confidence_level: "medium"
  recommendation: "1. Request 3 quotes via Embroker or Insureon. 2. Add cyber rider. 3. Review deductible for additional savings."`
      : `EXAMPLE B — INSURANCE FINDING (CA — Professional Services):
  title: "E&O Insurance Optimization: $2,800/yr Premium Reduction"
  root_cause: "Policy auto-renewed at $11,200/yr — market rate is $8,400 for equivalent coverage"
  description: "Current: $11,200 ($2M/$4M). Market: $8,400. Delta: $2,800. Missing cyber rider: $700/yr."
  calculation_shown: "Current: $11,200 | Market: $8,400 | Delta: $2,800 (net of $700 cyber: $2,100)"
  impact_min: 2100
  impact_max: 2800
  compliance_risk: "Inadequate E&O exposes partners personally."
  confidence_level: "medium"
  recommendation: "1. Request 3 quotes via broker (HUB, BrokerLink). 2. Add cyber rider. 3. Review deductible."`;

    return { example1, example2 };
  }

  // ── Default — HST/WCB (CA) and S-Corp/Processing (US) ───────────────────
  const example1 = isUS
    ? `EXAMPLE A — TAX STRUCTURE FINDING (US):
  title: "S-Corp Election + Salary Restructuring: $14,280/yr FICA Reduction"
  root_cause: "Operating as sole proprietor at $210K net income — SE tax on entire amount instead of reasonable compensation only"
  description: "Current: $210K × 15.3% (capped) = $27,907. Optimal: S-corp with $84K W-2, FICA $12,852. Delta: $15,055 − $1,275 admin = $13,780."
  calculation_shown: "SE current: $27,907 | S-corp W-2: $12,852 | Delta: $15,055 − $1,275 = $13,780/yr"
  impact_min: 13780
  impact_max: 19828
  compliance_risk: "IRS reasonable comp audit: W-2 below $84K risks reclassification + back FICA + 20% penalty."
  confidence_level: "high"
  recommendation: "1. File Form 2553 (S-corp election). 2. Set up payroll via Gusto ($46/mo + $6/ee). 3. Reasonable comp study ($300)."`
    : `EXAMPLE A — TAX STRUCTURE FINDING (CA):
  title: "HST Quick Method Election: $9,240/yr Tax Remittance Reduction"
  root_cause: "Remitting HST standard method when Quick Method at 8.8% would reduce remittance"
  description: "Standard: $320K × 13% − $4,800 ITCs = $36,800. Quick Method: $320K × 8.8% = $28,160. Saving: $8,640 + $600 bonus = $9,240."
  calculation_shown: "Standard: $36,800 | Quick Method: $28,160 | Saving: $9,240/yr"
  impact_min: 8640
  impact_max: 9240
  compliance_risk: "Quick Method irrevocable 12 months. Revenue >$400K disqualifies."
  confidence_level: "high"
  recommendation: "1. File RC7004 before next HST deadline. 2. Verify >50% service revenue. 3. Re-assess at $350K."`;

  const example2 = isUS
    ? `EXAMPLE B — OPERATIONAL FINDING (US):
  title: "Payment Processing Rate Renegotiation: $4,380/yr in Excess Fees"
  root_cause: "Processing $480K/yr at 3.2% blended — 0.6% above interchange-plus benchmark of 2.6%"
  description: "Card volume: $480K × 3.2% = $15,360. Benchmark: $12,480. Plus per-txn and fee excess. Total: $4,380."
  calculation_shown: "Current: $17,340 | Benchmark: $12,980 | Excess: $4,360/yr"
  impact_min: 3880
  impact_max: 4380
  compliance_risk: "None — cost optimization. Verify PCI DSS during switch."
  confidence_level: "medium"
  recommendation: "1. Quote from Square and Helcim. 2. Leverage current statement. 3. Switch during low-volume week."`
    : `EXAMPLE B — OPERATIONAL FINDING (CA):
  title: "Workers Compensation Classification Audit: $3,600/yr Premium Overpayment"
  root_cause: "WCB classification for general contracting when actual work is specialized — 40% higher base rate"
  description: "Current: $4.20/$100. Correct: $2.52/$100. On $150K: $6,300 vs $3,780. Delta: $2,520 + exp rating $1,080 = $3,600."
  calculation_shown: "Current: $6,300 | Correct: $3,780 | Delta: $3,600/yr"
  impact_min: 2520
  impact_max: 3600
  compliance_risk: "WCB can audit retroactively (3 years). Voluntary reclassification avoids penalties."
  confidence_level: "medium"
  recommendation: "1. Request classification from WCB/WSIB/CNESST. 2. File reclassification. 3. Broker audit."`;

  return { example1, example2 };
}
