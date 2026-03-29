-- =============================================================================
-- Migration 109: US Leak Detectors
-- Seeds provincial_leak_detectors with province='US' (federal-level)
-- These apply to all US states. State-specific ones can be added later.
-- Uses ON CONFLICT DO NOTHING so safe to re-run.
-- =============================================================================

-- ── FEDERAL / ALL STATES ─────────────────────────────────────────────────────

INSERT INTO provincial_leak_detectors
  (slug, province, title, severity, category, description,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('us_fica_optimization', 'US',
   'S-Corp FICA Overpayment — W-2/Distribution Split Not Optimized',
   'critical', 'Tax',
   'S-corp owners taking 100% of income as W-2 salary pay 15.3% FICA on the full amount. Optimal split: reasonable W-2 salary + distributions avoids FICA on the distribution portion. At $150K+ net income, typical saving is $8K–$22K/yr.',
   8000, 22000, 'professional', 98, true),

  ('us_se_tax_structure', 'US',
   'Self-Employment Tax Leak — No S-Corp Election Filed',
   'critical', 'Tax',
   'Sole proprietors and single-member LLCs pay 15.3% SE tax on all net profit. An S-corp election (Form 2553) eliminates SE tax on the distribution portion. At $80K+ net, this saves $4K–$12K/yr after payroll admin costs.',
   4000, 12000, 'professional', 95, true),

  ('us_qbi_deduction_missed', 'US',
   'Section 199A QBI Deduction Not Claimed',
   'high', 'Tax',
   'Pass-through entities (S-corps, LLCs, sole props) can deduct 20% of qualified business income from federal taxable income. At $200K net income, this is $40K deduction × marginal rate = $9,600–$14,800 tax saving. Many owners miss this or miscalculate the W-2 wage limitation.',
   5000, 18000, 'professional', 92, true),

  ('us_section_179_missed', 'US',
   'Section 179 & Bonus Depreciation Not Maximized',
   'high', 'Tax',
   'Businesses can immediately expense up to $1,220,000 of qualifying equipment and software (2024). 80% bonus depreciation also available on new and used assets. Most SMBs over-depreciate on a schedule instead of taking immediate deduction, costing them time-value of the tax deferral.',
   3000, 25000, 'professional', 88, true),

  ('us_rd_credit_unclaimed', 'US',
   'R&D Tax Credit (Section 41) Not Claimed',
   'high', 'Tax',
   'The federal R&D credit covers wages, supplies, and contract research for qualifying activities — including custom software, process improvement, and technical development. Many SMBs do qualifying work without claiming the credit. Startups can offset up to $500K/yr against payroll taxes (Form 6765).',
   5000, 75000, 'professional', 90, true),

  ('us_processing_rate_high', 'US',
   'Card Processing Rate Above Industry Average',
   'high', 'Operations',
   'The average SMB pays 2.5–3.5% in card processing fees. Many are on legacy interchange-plus or flat-rate plans that cost 0.5–1.0% more than optimized plans. On $500K in card volume, that is $2,500–$5,000/yr in excess fees.',
   2500, 12000, 'software', 85, true),

  ('us_no_bookkeeping', 'US',
   'No Bookkeeping System — Deductions and Credits Being Missed',
   'critical', 'Operations',
   'Without accounting software, businesses miss an average of $8,000–$18,000 in deductible expenses annually. Clean books also prevent IRS penalties for poor records and enable better cash flow forecasting.',
   8000, 18000, 'software', 95, true),

  ('us_banking_fees_high', 'US',
   'Business Banking Fees Above Average',
   'medium', 'Cash Flow',
   'Traditional bank business accounts charge $15–$40/month plus transaction fees. Fee-free alternatives (Mercury, Relay, Bluevine) save $500–$1,500/yr. More importantly, high-yield business accounts now offer 4–5% APY on operating balances.',
   500, 3000, 'software', 72, true),

  ('us_insurance_not_compared', 'US',
   'Business Insurance Premiums Not Benchmarked in 3+ Years',
   'high', 'Insurance',
   'Insurance premiums increase 5–15% annually if not actively shopped. US SMBs that compare BOP, GL, professional liability, and cyber coverage every 2 years save an average of $2,000–$8,000/yr without reducing coverage.',
   2000, 8000, 'professional', 80, true),

  ('us_payroll_tax_errors', 'US',
   'Payroll Tax Errors — FICA, FUTA, State SUI Miscalculations',
   'high', 'Compliance',
   'Payroll tax errors are the #1 cause of IRS penalties for SMBs. Common issues: not registering for state SUI in every state with employees, missing WOTC credits ($9,600/eligible hire), and incorrect FUTA credit offset calculations. Average cost to a 5-person business: $3,000–$9,000/yr in overpayment or penalties.',
   3000, 9000, 'professional', 87, true),

  ('us_contractor_misclassification', 'US',
   'Contractor Misclassification Risk — IRS 20-Factor Test',
   'critical', 'Compliance',
   'Businesses using 1099 contractors for work that meets W-2 employee criteria face back FICA taxes (employer share), interest, and penalties of 1.5–40% of wages paid. The IRS intensified enforcement post-2023. Exposure for a $100K contractor relationship: $15,000–$35,000.',
   5000, 35000, 'professional', 93, true),

  ('us_sales_tax_nexus_gap', 'US',
   'Unregistered Sales Tax Nexus in Multiple States',
   'critical', 'Compliance',
   'Post-Wayfair (2018), economic nexus is triggered at $100K sales OR 200 transactions per state. Businesses selling across state lines without registration face back taxes + 10–25% penalties + interest. Average exposure for an unregistered e-commerce business: $15,000–$80,000.',
   5000, 80000, 'professional', 95, true),

  ('us_ar_days_high', 'US',
   'Accounts Receivable Days Above Industry Benchmark',
   'medium', 'Cash Flow',
   'The US SMB average DSO is 38 days. Every 10 extra days of DSO on $500K revenue ties up $13,700 in working capital. Businesses with DSO >55 days are paying implicit interest of 5–8% on their own money.',
   3000, 15000, 'software', 78, true),

  ('us_retirement_plan_gap', 'US',
   'No Retirement Plan — Missing Tax-Deferred Contribution Opportunity',
   'high', 'Tax',
   'A SEP-IRA allows 25% of W-2 or 20% of self-employment income up to $69,000/yr (2024). A Solo 401(k) allows $69,000 + $7,500 catch-up if 50+. A cash balance plan can shelter $150,000–$300,000/yr. Most SMB owners contribute nothing, paying full tax on money they could shelter.',
   8000, 50000, 'professional', 85, true),

  ('us_saas_overspend', 'US',
   'Software & SaaS Subscriptions Above Benchmark',
   'medium', 'Operations',
   'The average US SMB spends 3–8% of revenue on software. Annual audits of active subscriptions typically find 15–30% of spend on unused or duplicated tools. At $500K revenue, that is $2,250–$12,000/yr in recoverable spend.',
   2000, 12000, 'software', 75, true),

  ('us_home_office_unclaimed', 'US',
   'Home Office Deduction Not Claimed',
   'medium', 'Tax',
   'The IRS simplified method allows $5/sq ft (max 300 sq ft = $1,500) without recordkeeping. The actual method (Form 8829) typically yields $3,000–$8,000/yr for a dedicated home office. Most solo operators and remote workers miss this entirely.',
   1500, 8000, 'professional', 70, true),

  ('us_vehicle_deduction_suboptimal', 'US',
   'Vehicle Deduction Not Optimized — Actual vs Standard Mileage',
   'medium', 'Tax',
   'The 2024 IRS standard mileage rate is $0.67/mile. A business that drives 15,000 miles/yr can deduct $10,050. The actual method (including depreciation, gas, insurance, repairs) often yields 20–35% more but requires a mileage log. Many owners claim neither or pick the wrong method.',
   2000, 8000, 'professional', 73, true),

  ('us_wotc_unclaimed', 'US',
   'Work Opportunity Tax Credit (WOTC) — No Screening Process',
   'high', 'Tax',
   'WOTC provides up to $9,600 per eligible hire (veterans, ex-felons, SNAP recipients). Must file Form 8850 within 28 days of hire. Businesses with 5+ annual hires and no WOTC screening are leaving $10,000–$50,000/yr in credits on the table.',
   5000, 50000, 'professional', 82, true),

  ('us_entity_structure_suboptimal', 'US',
   'Entity Structure Not Optimized — LLC/S-Corp/C-Corp Analysis Needed',
   'high', 'Tax',
   'Default LLC taxation (sole prop or partnership) often costs more than an S-corp election at $60K+ net income. C-corp at 21% flat rate can beat S-corp for retained earnings at high income levels. Most owners last reviewed their structure at formation — not at current revenue.',
   5000, 30000, 'professional', 88, true),

  ('us_health_insurance_deduction', 'US',
   'Self-Employed Health Insurance Deduction Not Maximized',
   'medium', 'Tax',
   'S-corp shareholders and self-employed owners can deduct 100% of health insurance premiums (including family coverage) as an above-the-line deduction on Form 1040. Additionally, HSA contributions up to $4,150 (individual) or $8,300 (family) are fully deductible. Most owners miss the S-corp add-back requirement.',
   3000, 12000, 'professional', 78, true)

ON CONFLICT (slug, province) DO NOTHING;
