// =============================================================================
// lib/rep/industry-scenarios.ts — Sales intelligence by industry
// =============================================================================
// Provides leak categories, pain points, objection handles, and benchmarks
// for the top 8 industries Fruxal targets.
// =============================================================================

export interface LeakCategory {
  category: string;
  avgImpactPct: number;
  typicalAmountRange: string;
  opener: string;
}

export interface Objection {
  objection: string;
  response: string;
}

export interface IndustryScenario {
  name: string;
  topLeakCategories: LeakCategory[];
  painPoints: string[];
  objections: Objection[];
  benchmarks: {
    avgLeakPct: number;
    avgRecoveryTimeline: number;
    conversionRate: number;
  };
  seasonalNotes: string;
  decisionMakers: string;
  competitiveAngle: string;
}

// ---------------------------------------------------------------------------
// Industry data
// ---------------------------------------------------------------------------

export const INDUSTRY_SCENARIOS: Record<string, IndustryScenario> = {
  restaurant: {
    name: "Restaurant & Food Service",
    topLeakCategories: [
      {
        category: "processing_fees",
        avgImpactPct: 2.8,
        typicalAmountRange: "$8,000–$35,000",
        opener: "Most restaurant owners are paying 30–50% more in credit card processing fees than they should be.",
      },
      {
        category: "food_cost",
        avgImpactPct: 4.5,
        typicalAmountRange: "$15,000–$60,000",
        opener: "Your food cost is probably 3–5 points higher than it needs to be — that is $15K+ walking out the back door every year.",
      },
      {
        category: "labour",
        avgImpactPct: 3.2,
        typicalAmountRange: "$12,000–$45,000",
        opener: "Labour scheduling inefficiencies cost the average restaurant $20K+ a year in overtime and overstaffing.",
      },
      {
        category: "insurance",
        avgImpactPct: 1.5,
        typicalAmountRange: "$4,000–$18,000",
        opener: "When was the last time you benchmarked your restaurant insurance? Most owners are overpaying by 20–40%.",
      },
      {
        category: "liquor_waste",
        avgImpactPct: 1.8,
        typicalAmountRange: "$5,000–$25,000",
        opener: "Liquor shrinkage and over-pouring typically cost 15–25% of your bar revenue — that adds up fast.",
      },
    ],
    painPoints: [
      "Razor-thin margins — one bad month can wipe out a quarter of profit",
      "Rising food costs with no ability to raise menu prices fast enough",
      "Staff turnover and training costs eating into labour budget",
      "No time to audit vendors — too busy running the floor",
      "Feeling like the accountant only shows up at tax time",
    ],
    objections: [
      {
        objection: "I already watch my food costs like a hawk",
        response: "That is great — most owners focus on food cost percentage, but we look at vendor contract terms, rebate programs, and waste patterns that even careful operators miss. Our average restaurant client finds $18K in savings they did not know about.",
      },
      {
        objection: "12% is too much — my margins are already tight",
        response: "I hear you — that is exactly why we only charge on money we actually recover. If we find $30K in annual savings, our 12% is $3,600 and you keep $26,400 you were not keeping before. Your margins actually get better.",
      },
      {
        objection: "I do not have time for this",
        response: "That is the best part — we do the heavy lifting. We work directly with your accountant and vendors. All we need is 15 minutes for an initial walkthrough, then we handle the rest.",
      },
      {
        objection: "My accountant already handles this",
        response: "Your accountant is great at taxes and compliance, but we specialize in cost recovery — vendor contract audits, processing fee optimization, insurance benchmarking. It is a different skill set. We actually work alongside your accountant, not replace them.",
      },
    ],
    benchmarks: {
      avgLeakPct: 13.8,
      avgRecoveryTimeline: 45,
      conversionRate: 32,
    },
    seasonalNotes: "Best time to call: January (post-holiday cash crunch), March-April (pre-patio season budgeting), September (post-summer wrap-up). Avoid calling during Friday/Saturday dinner service.",
    decisionMakers: "Owner-operator or general manager. Multi-unit chains may have a CFO or controller.",
    competitiveAngle: "Fruxal audits processing fees, vendor contracts, and insurance simultaneously — most consultants only look at one area. Contingency model means zero risk for already-thin margins.",
  },

  construction: {
    name: "Construction & General Contracting",
    topLeakCategories: [
      {
        category: "wcb_insurance",
        avgImpactPct: 3.5,
        typicalAmountRange: "$12,000–$55,000",
        opener: "Most contractors are overpaying WCB premiums by 20–35% because their rate codes have not been reviewed in years.",
      },
      {
        category: "equipment_depreciation",
        avgImpactPct: 2.8,
        typicalAmountRange: "$10,000–$40,000",
        opener: "Are you claiming accelerated depreciation on your equipment? Most contractors leave $10K–$40K on the table every year.",
      },
      {
        category: "fuel",
        avgImpactPct: 2.2,
        typicalAmountRange: "$8,000–$30,000",
        opener: "Fuel costs for a fleet your size usually have $8K–$30K in optimization room — bulk purchasing, route optimization, and tax credits.",
      },
      {
        category: "subcontractor_markup",
        avgImpactPct: 3.0,
        typicalAmountRange: "$15,000–$50,000",
        opener: "Subcontractor agreements are one of the biggest hidden cost leaks in construction — most GCs overpay by 10–15% on markup and holdback structures.",
      },
      {
        category: "bonding",
        avgImpactPct: 1.5,
        typicalAmountRange: "$5,000–$25,000",
        opener: "Your bonding costs may be higher than necessary — a financial health review can improve your bond rate by 15–30%.",
      },
    ],
    painPoints: [
      "Cash flow gaps between project milestones and receivables",
      "Rising material costs eating into fixed-price bids",
      "WCB and insurance premiums climbing every year",
      "Difficulty tracking costs across multiple job sites",
      "Worry about being underbid by competitors cutting corners",
    ],
    objections: [
      {
        objection: "We are too busy with projects right now",
        response: "That is actually the perfect time — you are generating revenue but leaking money on every job. We work in the background with your bookkeeper. No disruption to your crew or schedule.",
      },
      {
        objection: "My bookkeeper handles everything",
        response: "Your bookkeeper keeps the books in order — we audit for cost recovery opportunities they are not trained to look for, like WCB rate code optimization, equipment tax credits, and sub markup analysis. We work alongside them.",
      },
      {
        objection: "12% is too high for construction margins",
        response: "I get it — construction margins are tight. But think of it this way: if we recover $40K in WCB overpayments and tax credits, you keep $35,200. That is money you were already losing. And if we find nothing, you pay nothing.",
      },
      {
        objection: "We already had an audit done",
        response: "That is great — most audits focus on financial compliance. We focus specifically on cost recovery: WCB rate codes, equipment CCA claims, fuel tax credits, and subcontractor terms. It is a completely different analysis.",
      },
    ],
    benchmarks: {
      avgLeakPct: 13.0,
      avgRecoveryTimeline: 60,
      conversionRate: 28,
    },
    seasonalNotes: "Best time to call: November-February (slow season, owners planning next year). Spring is harder — everyone is on job sites. Q4 is also good for year-end tax planning conversations.",
    decisionMakers: "Owner or project manager. Larger firms have a controller or CFO.",
    competitiveAngle: "Fruxal understands construction-specific cost structures — WCB rate code audits, CCA schedules, holdback optimization. Most financial consultants do not know the trades.",
  },

  professional_services: {
    name: "Professional Services (Law, Accounting, Consulting)",
    topLeakCategories: [
      {
        category: "overhead_ratio",
        avgImpactPct: 4.0,
        typicalAmountRange: "$20,000–$80,000",
        opener: "Professional firms typically run 15–20% higher overhead than best-in-class — that is $20K–$80K a year in unnecessary costs.",
      },
      {
        category: "billing_leakage",
        avgImpactPct: 5.5,
        typicalAmountRange: "$25,000–$120,000",
        opener: "The average professional firm loses 10–15% of billable time to write-offs, unbilled hours, and collection gaps.",
      },
      {
        category: "insurance",
        avgImpactPct: 1.8,
        typicalAmountRange: "$6,000–$30,000",
        opener: "Professional liability and E&O insurance premiums are one of those costs that creep up — most firms are overpaying by 20–30% compared to current market rates.",
      },
      {
        category: "tax_structure",
        avgImpactPct: 3.5,
        typicalAmountRange: "$15,000–$60,000",
        opener: "Your corporate structure and compensation mix probably have $15K–$60K in tax optimization room — salary vs. dividends, holding company setup, income splitting.",
      },
      {
        category: "technology_spend",
        avgImpactPct: 1.5,
        typicalAmountRange: "$5,000–$25,000",
        opener: "Firms tend to accumulate software subscriptions — practice management, CRM, document tools. Most have 20–30% redundancy in their tech stack.",
      },
    ],
    painPoints: [
      "Billing realization rates declining year over year",
      "Rising overhead costs while billing rates are under pressure",
      "Partner compensation tied to firm profitability",
      "Difficulty tracking and recovering all billable time",
      "Competitive pressure from alternative legal/accounting service providers",
    ],
    objections: [
      {
        objection: "We are accountants/lawyers — we handle our own finances",
        response: "Absolutely — you are experts in your clients' finances. But the cobbler's children often go barefoot. We bring a fresh set of eyes specifically trained on cost recovery in professional services. Our average law firm client discovers $45K in savings they overlooked.",
      },
      {
        objection: "Our managing partner would never approve this",
        response: "We work with over a dozen professional firms. Most managing partners love that it is contingency-based — zero risk to the partnership. We can put together a quick analysis first so you have hard numbers to bring to the table.",
      },
      {
        objection: "12% of what exactly?",
        response: "12% of actual confirmed savings — money we find and recover. If we identify $50K in annual savings across insurance, overhead, and tax structure, our fee is $6K and the firm keeps $44K. If we find nothing, you pay nothing.",
      },
      {
        objection: "We just did a strategic review",
        response: "Strategic reviews typically focus on growth and positioning. We focus purely on cost recovery — vendor contracts, insurance benchmarking, billing leakage analysis, and tax structure optimization. It is complementary, not redundant.",
      },
    ],
    benchmarks: {
      avgLeakPct: 16.3,
      avgRecoveryTimeline: 30,
      conversionRate: 35,
    },
    seasonalNotes: "Best time to call: June-August (slower period for law/accounting), October-November (pre year-end planning). Avoid tax season (Feb-April) for accounting firms.",
    decisionMakers: "Managing partner, senior partner, or firm administrator. Larger firms may have a COO.",
    competitiveAngle: "Fruxal understands professional services economics — realization rates, leverage ratios, overhead benchmarks. We speak the language of professional firms.",
  },

  retail: {
    name: "Retail & E-Commerce",
    topLeakCategories: [
      {
        category: "inventory_shrinkage",
        avgImpactPct: 3.5,
        typicalAmountRange: "$10,000–$50,000",
        opener: "The average retailer loses 1.5–3% of revenue to inventory shrinkage — theft, damage, and administrative errors. That adds up to $10K–$50K a year.",
      },
      {
        category: "pos_fees",
        avgImpactPct: 2.5,
        typicalAmountRange: "$8,000–$35,000",
        opener: "Your POS and payment processing fees are probably 25–40% higher than they need to be — most retailers have not renegotiated in years.",
      },
      {
        category: "rent",
        avgImpactPct: 2.0,
        typicalAmountRange: "$6,000–$30,000",
        opener: "Commercial rent is your second biggest cost. When was the last time you benchmarked your lease against current market rates? Most retailers are overpaying by 10–20%.",
      },
      {
        category: "insurance",
        avgImpactPct: 1.5,
        typicalAmountRange: "$4,000–$18,000",
        opener: "Retail insurance premiums tend to creep up with auto-renewals. A competitive review usually saves 15–30%.",
      },
      {
        category: "payroll_ratio",
        avgImpactPct: 3.0,
        typicalAmountRange: "$12,000–$40,000",
        opener: "Your payroll-to-revenue ratio might be 3–5 points higher than optimal — scheduling optimization alone can save $12K–$40K a year.",
      },
    ],
    painPoints: [
      "Competing with online giants on price while maintaining margins",
      "Shrinkage and loss prevention eating into thin margins",
      "Rising rent and occupancy costs",
      "Seasonal cash flow swings making it hard to plan",
      "Staff scheduling challenges — too many or too few people on the floor",
    ],
    objections: [
      {
        objection: "My margins are already so thin",
        response: "That is exactly why this matters — every dollar in savings goes straight to your bottom line. If we find $25K in annual savings across processing fees, insurance, and payroll optimization, that could double your net margin. And there is zero cost if we do not find anything.",
      },
      {
        objection: "I cannot afford another service right now",
        response: "You cannot afford not to look. Our model is 100% contingency — we only get paid from money we find. Think of it like finding cash in your couch cushions, except it is $20K+.",
      },
      {
        objection: "I already negotiate hard with my suppliers",
        response: "That is great — but we look at the areas suppliers do not want you to audit: processing interchange rates, insurance policy overlaps, lease escalation clauses, and payroll structure. These are the hidden ones.",
      },
      {
        objection: "Let me think about it",
        response: "Absolutely. Just know that every month you wait, those savings are gone — they do not accumulate retroactively. The prescan takes 15 minutes and shows you the exact dollar amounts. No commitment needed to see the numbers.",
      },
    ],
    benchmarks: {
      avgLeakPct: 12.5,
      avgRecoveryTimeline: 40,
      conversionRate: 30,
    },
    seasonalNotes: "Best time to call: January (post-holiday review), May-June (pre-summer planning), September (pre-holiday budgeting). Avoid mid-November through December (holiday rush).",
    decisionMakers: "Store owner or operations manager. Multi-location chains may have a regional director or CFO.",
    competitiveAngle: "Fruxal covers the full spectrum — POS fees, shrinkage analysis, lease review, and payroll optimization in one engagement. Most consultants only touch one area.",
  },

  tech: {
    name: "Technology & SaaS",
    topLeakCategories: [
      {
        category: "sred_credits",
        avgImpactPct: 5.0,
        typicalAmountRange: "$25,000–$150,000",
        opener: "Are you claiming SR&ED credits? Most tech companies leave $25K–$150K in R&D tax credits on the table every year.",
      },
      {
        category: "saas_bloat",
        avgImpactPct: 2.5,
        typicalAmountRange: "$10,000–$50,000",
        opener: "The average tech company has 30–40% redundancy in their SaaS stack — unused licenses, overlapping tools, and forgotten subscriptions.",
      },
      {
        category: "payroll_optimization",
        avgImpactPct: 3.0,
        typicalAmountRange: "$15,000–$60,000",
        opener: "Your compensation structure probably has $15K–$60K in tax optimization room — contractor vs. employee classification, benefits structuring, and payroll tax credits.",
      },
      {
        category: "stock_compensation",
        avgImpactPct: 2.0,
        typicalAmountRange: "$10,000–$40,000",
        opener: "Stock option and equity compensation plans often have hidden tax inefficiencies for both the company and employees.",
      },
      {
        category: "cloud_infrastructure",
        avgImpactPct: 2.5,
        typicalAmountRange: "$8,000–$45,000",
        opener: "Cloud infrastructure spend is one of the fastest-growing cost centres in tech — most companies are over-provisioned by 25–40%.",
      },
    ],
    painPoints: [
      "Burn rate pressure — need to extend runway",
      "SaaS tool sprawl across teams with no central oversight",
      "Missing R&D tax credits that could fund another hire",
      "Cloud costs growing faster than revenue",
      "Unclear ROI on technical investments",
    ],
    objections: [
      {
        objection: "We already have a CFO/finance team",
        response: "Great — we complement your finance team. They manage the budget; we audit for recovery opportunities they are not looking for: SR&ED claims, SaaS license optimization, cloud cost reduction, and payroll structure. We work alongside them.",
      },
      {
        objection: "We are a startup — we do not have money to leak",
        response: "Startups actually leak the most proportionally — unclaimed SR&ED credits alone could fund an extra quarter of runway. And since we work on contingency, there is literally zero risk. If we find nothing, you pay nothing.",
      },
      {
        objection: "We track everything in our dashboards",
        response: "Dashboards show you what you are spending — we show you what you should not be spending. There is a difference. We audit vendor contracts, find licensing overlaps, and claim tax credits your dashboards cannot flag.",
      },
      {
        objection: "12% seems high for tech",
        response: "Consider it this way: if we recover $100K in SR&ED credits your company was not claiming, you keep $88K of free money. Our 12% only applies to confirmed savings — money you were leaving on the table.",
      },
    ],
    benchmarks: {
      avgLeakPct: 15.0,
      avgRecoveryTimeline: 35,
      conversionRate: 38,
    },
    seasonalNotes: "Best time to call: Q1 (year-end wrap-up, SR&ED filing window), September-October (budget planning for next year). Tech founders are generally reachable year-round via email.",
    decisionMakers: "CEO/founder, CTO (for tech-specific costs), or VP Finance. Larger companies have a CFO or controller.",
    competitiveAngle: "Fruxal specializes in SR&ED claim optimization and SaaS stack audits — most financial consultants do not understand tech cost structures. We have recovered millions in R&D credits alone.",
  },

  healthcare: {
    name: "Healthcare (Dental, Physio, Medical)",
    topLeakCategories: [
      {
        category: "insurance",
        avgImpactPct: 2.5,
        typicalAmountRange: "$8,000–$35,000",
        opener: "Medical malpractice and business insurance premiums for clinics are often 25–35% higher than competitive rates — that is $8K–$35K you could recover.",
      },
      {
        category: "equipment_leasing",
        avgImpactPct: 3.0,
        typicalAmountRange: "$10,000–$45,000",
        opener: "Equipment lease agreements in healthcare are notorious for hidden costs — auto-renewals, inflated buyouts, and missed purchase options.",
      },
      {
        category: "supply_costs",
        avgImpactPct: 3.5,
        typicalAmountRange: "$12,000–$50,000",
        opener: "Most clinics are paying 20–30% more for medical supplies than they need to. Group purchasing and vendor renegotiation can save $12K–$50K a year.",
      },
      {
        category: "billing_errors",
        avgImpactPct: 4.0,
        typicalAmountRange: "$15,000–$60,000",
        opener: "Billing errors and undercoding cost the average practice $15K–$60K a year — that is money you already earned but are not collecting.",
      },
      {
        category: "tax_structure",
        avgImpactPct: 2.5,
        typicalAmountRange: "$10,000–$40,000",
        opener: "Your corporate structure and income splitting strategy probably have $10K–$40K in optimization room — most practitioners set it up once and never revisit it.",
      },
    ],
    painPoints: [
      "Equipment costs and lease payments taking a huge chunk of revenue",
      "Rising supply costs with limited ability to increase patient fees",
      "Complex billing — losing revenue to coding errors and missed claims",
      "Insurance premiums increasing annually with no claims",
      "No time to manage the business side while seeing patients",
    ],
    objections: [
      {
        objection: "I am too busy seeing patients to deal with this",
        response: "That is exactly why we exist — you focus on patients, we focus on your profitability. We work directly with your office manager and accountant. The only time we need from you is a 15-minute walkthrough of findings.",
      },
      {
        objection: "My accountant handles all of this",
        response: "Your accountant handles taxes and compliance — we audit for cost recovery: equipment lease terms, supply vendor contracts, insurance benchmarking, and billing optimization. We actually make your accountant's life easier by finding deductions they can apply.",
      },
      {
        objection: "We just renewed our equipment leases",
        response: "That is actually one of the first things we review — renewal terms often include inflated rates. Even mid-lease, there are optimization strategies. Plus, equipment is only one of five areas we audit.",
      },
      {
        objection: "We are a small clinic — how much could you really find?",
        response: "Small clinics actually have the most to gain per dollar of revenue. Our average healthcare client discovers $35K in annual savings. Even a solo practitioner typically finds $15K–$20K. And if we find nothing, you pay nothing.",
      },
    ],
    benchmarks: {
      avgLeakPct: 15.5,
      avgRecoveryTimeline: 40,
      conversionRate: 34,
    },
    seasonalNotes: "Best time to call: January (new year budgeting), June-August (summer slowdown in dental/physio), October (pre year-end planning). Avoid calling during patient hours — early morning or lunch breaks work best.",
    decisionMakers: "Clinic owner (dentist, doctor, physiotherapist) or office/practice manager. Group practices may have an administrator.",
    competitiveAngle: "Fruxal understands healthcare-specific cost structures — equipment lease audits, supply chain optimization, and billing analysis. Most financial consultants do not know the healthcare space.",
  },

  manufacturing: {
    name: "Manufacturing & Industrial",
    topLeakCategories: [
      {
        category: "energy_costs",
        avgImpactPct: 3.5,
        typicalAmountRange: "$15,000–$60,000",
        opener: "Energy is typically 5–10% of manufacturing costs — rate optimization and efficiency upgrades can save $15K–$60K a year.",
      },
      {
        category: "material_waste",
        avgImpactPct: 4.0,
        typicalAmountRange: "$20,000–$80,000",
        opener: "Material waste in manufacturing averages 5–8% of raw material costs. That is $20K–$80K a year walking out as scrap.",
      },
      {
        category: "equipment_maintenance",
        avgImpactPct: 2.5,
        typicalAmountRange: "$10,000–$45,000",
        opener: "Reactive maintenance costs 3–5x more than planned maintenance — most manufacturers have $10K–$45K in maintenance optimization room.",
      },
      {
        category: "wcb_insurance",
        avgImpactPct: 3.0,
        typicalAmountRange: "$12,000–$55,000",
        opener: "Manufacturing WCB premiums are among the highest — rate code audits and safety program credits can reduce them by 20–35%.",
      },
      {
        category: "tax_credits",
        avgImpactPct: 3.5,
        typicalAmountRange: "$15,000–$75,000",
        opener: "Most manufacturers miss SR&ED credits, capital cost allowances, and provincial manufacturing incentives worth $15K–$75K a year.",
      },
    ],
    painPoints: [
      "Rising raw material and energy costs squeezing margins",
      "Equipment downtime and maintenance costs unpredictable",
      "WCB premiums climbing despite safety investments",
      "Difficulty finding and retaining skilled workers",
      "Competing with overseas manufacturers on cost",
    ],
    objections: [
      {
        objection: "We already have lean processes in place",
        response: "Lean is great for operational efficiency — but we focus on financial leakage: energy rate optimization, WCB rate codes, equipment tax credits, and vendor contract terms. It is a different layer of savings that lean does not address.",
      },
      {
        objection: "Our controller manages costs carefully",
        response: "Controllers are excellent at cost tracking and budgeting. We are cost recovery specialists — we audit for WCB rate code errors, missed tax credits, energy rate optimization, and vendor contract terms. We work alongside your controller to find hidden savings.",
      },
      {
        objection: "We cannot afford downtime for an audit",
        response: "Zero downtime required. We work with your financial records, not your production line. Your team keeps building; we work in the background with your bookkeeper and accountant.",
      },
      {
        objection: "We already claim SR&ED",
        response: "Great — but are you claiming everything? Most manufacturers under-claim by 25–40%. We review eligible activities, overhead allocation, and filing methodology. Plus SR&ED is just one of five areas we audit.",
      },
    ],
    benchmarks: {
      avgLeakPct: 16.5,
      avgRecoveryTimeline: 55,
      conversionRate: 26,
    },
    seasonalNotes: "Best time to call: December-February (production slowdowns and year-end planning), July-August (summer maintenance shutdowns). Avoid peak production periods in Q2 and Q4.",
    decisionMakers: "Plant owner/CEO, operations manager, or controller. Larger plants have a CFO.",
    competitiveAngle: "Fruxal understands manufacturing economics — energy audits, WCB for industrial rate codes, CCA schedules, and SR&ED for process improvement R&D. Most consultants do not know the shop floor.",
  },

  real_estate: {
    name: "Real Estate & Property Management",
    topLeakCategories: [
      {
        category: "property_management_fees",
        avgImpactPct: 3.0,
        typicalAmountRange: "$10,000–$50,000",
        opener: "Property management fees and hidden charges typically run 15–25% higher than they should — that is $10K–$50K a year across your portfolio.",
      },
      {
        category: "insurance",
        avgImpactPct: 2.5,
        typicalAmountRange: "$8,000–$40,000",
        opener: "Property insurance premiums tend to auto-escalate — a competitive review usually saves 20–30%, especially across multiple properties.",
      },
      {
        category: "tax_structure",
        avgImpactPct: 4.0,
        typicalAmountRange: "$15,000–$80,000",
        opener: "Real estate tax structures are the most optimization-rich area we see — holding companies, cost segregation, and CCA schedules can save $15K–$80K a year.",
      },
      {
        category: "maintenance_reserves",
        avgImpactPct: 2.5,
        typicalAmountRange: "$8,000–$35,000",
        opener: "Most property owners overspend on maintenance by 15–25% because vendor contracts are not competitively reviewed.",
      },
      {
        category: "property_tax",
        avgImpactPct: 2.0,
        typicalAmountRange: "$5,000–$30,000",
        opener: "Have you appealed your property tax assessment recently? Most properties are over-assessed by 10–20%, and the appeal process is straightforward.",
      },
    ],
    painPoints: [
      "Property taxes and insurance eating into rental yields",
      "Maintenance costs unpredictable and vendors overcharging",
      "Property management companies not transparent on fees",
      "Complex tax structures — unsure if optimized correctly",
      "Rising interest rates squeezing cash flow on leveraged properties",
    ],
    objections: [
      {
        objection: "I already have a property manager",
        response: "We do not replace your property manager — we audit them. Property management agreements often include hidden markups on maintenance, insurance, and vendor coordination. We make sure you are not overpaying.",
      },
      {
        objection: "My accountant handles all my real estate taxes",
        response: "Your accountant files the returns — we audit the structure. Cost segregation studies, CCA optimization, and holding company strategies are specialized areas most accountants do not proactively review. We work alongside them.",
      },
      {
        objection: "12% on real estate savings is a lot of money",
        response: "Let me put it in perspective: if we find $60K in annual savings across your portfolio — tax structure, insurance, property tax appeals, and maintenance — our fee is $7,200. That is the equivalent of one month's savings to unlock the other eleven months. And if we find nothing, you pay nothing.",
      },
      {
        objection: "I only have a few properties",
        response: "Even 2–3 properties usually have $20K–$40K in combined savings. Insurance bundling, property tax appeals, and tax structure optimization apply regardless of portfolio size. Our smallest real estate client had 3 units and saved $28K.",
      },
    ],
    benchmarks: {
      avgLeakPct: 14.0,
      avgRecoveryTimeline: 50,
      conversionRate: 31,
    },
    seasonalNotes: "Best time to call: January-March (post year-end review, property tax assessment period), September-October (pre year-end tax planning). Investors are generally reachable year-round.",
    decisionMakers: "Property owner/investor, property manager, or investment group principal. Larger portfolios may have an asset manager or CFO.",
    competitiveAngle: "Fruxal covers the full real estate cost stack — property tax appeals, insurance benchmarking, management fee audits, and tax structure optimization. Most consultants specialize in only one area.",
  },
};

// ---------------------------------------------------------------------------
// Fuzzy industry matcher
// ---------------------------------------------------------------------------

const INDUSTRY_ALIASES: Record<string, string> = {
  // Restaurant
  restaurant: "restaurant",
  restaurants: "restaurant",
  "restaurant & bar": "restaurant",
  "food service": "restaurant",
  "food & beverage": "restaurant",
  bar: "restaurant",
  cafe: "restaurant",
  catering: "restaurant",
  bakery: "restaurant",
  "quick service": "restaurant",
  "fast food": "restaurant",

  // Construction
  construction: "construction",
  contractor: "construction",
  "general contractor": "construction",
  "general contracting": "construction",
  contracting: "construction",
  trades: "construction",
  plumbing: "construction",
  electrical: "construction",
  hvac: "construction",
  roofing: "construction",
  renovation: "construction",
  renovations: "construction",
  landscaping: "construction",
  "home building": "construction",

  // Professional Services
  professional_services: "professional_services",
  "professional services": "professional_services",
  legal: "professional_services",
  law: "professional_services",
  "law firm": "professional_services",
  lawyer: "professional_services",
  accounting: "professional_services",
  "accounting firm": "professional_services",
  accountant: "professional_services",
  cpa: "professional_services",
  consulting: "professional_services",
  consultant: "professional_services",
  "management consulting": "professional_services",
  advisory: "professional_services",
  engineering: "professional_services",
  architecture: "professional_services",

  // Retail
  retail: "retail",
  "e-commerce": "retail",
  ecommerce: "retail",
  "retail store": "retail",
  shop: "retail",
  boutique: "retail",
  grocery: "retail",
  "convenience store": "retail",
  wholesale: "retail",

  // Tech
  tech: "tech",
  technology: "tech",
  saas: "tech",
  software: "tech",
  "it services": "tech",
  "it consulting": "tech",
  startup: "tech",
  fintech: "tech",
  "web development": "tech",
  "app development": "tech",
  digital: "tech",

  // Healthcare
  healthcare: "healthcare",
  dental: "healthcare",
  dentist: "healthcare",
  medical: "healthcare",
  "medical clinic": "healthcare",
  clinic: "healthcare",
  physio: "healthcare",
  physiotherapy: "healthcare",
  chiropractic: "healthcare",
  chiropractor: "healthcare",
  optometry: "healthcare",
  pharmacy: "healthcare",
  veterinary: "healthcare",
  vet: "healthcare",
  "health & wellness": "healthcare",

  // Manufacturing
  manufacturing: "manufacturing",
  industrial: "manufacturing",
  factory: "manufacturing",
  production: "manufacturing",
  fabrication: "manufacturing",
  "food manufacturing": "manufacturing",
  "metal fabrication": "manufacturing",
  machining: "manufacturing",
  assembly: "manufacturing",

  // Real Estate
  real_estate: "real_estate",
  "real estate": "real_estate",
  "property management": "real_estate",
  property: "real_estate",
  realty: "real_estate",
  "real estate investment": "real_estate",
  landlord: "real_estate",
  "property investor": "real_estate",
  rental: "real_estate",
  "commercial real estate": "real_estate",
  "residential real estate": "real_estate",
};

export function getIndustryScenario(industrySlug: string): IndustryScenario | null {
  if (!industrySlug) return null;

  const normalized = industrySlug.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

  // Direct match on key
  if (INDUSTRY_SCENARIOS[normalized.replace(/ /g, "_")]) {
    return INDUSTRY_SCENARIOS[normalized.replace(/ /g, "_")];
  }

  // Alias lookup
  if (INDUSTRY_ALIASES[normalized]) {
    return INDUSTRY_SCENARIOS[INDUSTRY_ALIASES[normalized]];
  }

  // Partial / substring match — check if the input contains any alias
  for (const [alias, key] of Object.entries(INDUSTRY_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      return INDUSTRY_SCENARIOS[key];
    }
  }

  // Fallback: check if any scenario name contains the input
  for (const [key, scenario] of Object.entries(INDUSTRY_SCENARIOS)) {
    if (scenario.name.toLowerCase().includes(normalized) || normalized.includes(key)) {
      return scenario;
    }
  }

  return null;
}
