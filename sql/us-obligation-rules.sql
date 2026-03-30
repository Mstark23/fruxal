-- =============================================================================
-- US Obligation Rules — Federal + Key State obligations
-- Uses applies_to_provinces with US state codes (TX, CA, NY, FL, etc.)
-- Federal obligations use '{}' (applies to all states)
-- =============================================================================

-- ── FEDERAL (all states) ─────────────────────────────────────────────────────

INSERT INTO obligation_rules (slug, title, title_fr, category, risk_level, frequency, agency, penalty_min, penalty_max, penalty_description, deadline_description, applies_to_provinces, applies_to_industries, applies_to_structures, min_employees, min_revenue, priority_score, active)
VALUES

-- Federal Tax
('irs-form-1120s', 'S-Corp Tax Return (Form 1120-S)', NULL, 'tax', 'critical', 'annual', 'IRS', 2500, 25000, 'Penalty: $220/month per shareholder for up to 12 months for late filing', 'Due March 15 (or September 15 with extension)', '{}', '{}', '{s_corp}', 0, 0, 98, true),
('irs-form-1120', 'C-Corp Tax Return (Form 1120)', NULL, 'tax', 'critical', 'annual', 'IRS', 2500, 25000, 'Failure to file: 5% of unpaid tax per month up to 25%; failure to pay: 0.5% per month', 'Due April 15 (or October 15 with extension)', '{}', '{}', '{corporation,c_corp}', 0, 0, 97, true),
('irs-schedule-c', 'Sole Proprietor Tax Return (Schedule C)', NULL, 'tax', 'critical', 'annual', 'IRS', 500, 15000, 'Late filing penalty: 5% of tax per month up to 25%; late payment: 0.5% per month + interest', 'Due April 15 (or October 15 with extension)', '{}', '{}', '{sole_proprietor,sole_proprietorship}', 0, 0, 96, true),
('irs-form-1065', 'Partnership Tax Return (Form 1065)', NULL, 'tax', 'critical', 'annual', 'IRS', 2200, 26400, 'Penalty: $220/month per partner for up to 12 months', 'Due March 15 (or September 15 with extension)', '{}', '{}', '{partnership,llc}', 0, 0, 95, true),
('irs-estimated-tax', 'Quarterly Estimated Tax Payments (Form 1040-ES)', NULL, 'tax', 'high', 'quarterly', 'IRS', 200, 5000, 'Underpayment penalty calculated on Form 2210; interest at federal short-term rate + 3%', 'Due April 15, June 15, September 15, January 15', '{}', '{}', '{}', 0, 10000, 90, true),

-- Payroll
('irs-form-941', 'Quarterly Payroll Tax Return (Form 941)', NULL, 'payroll', 'critical', 'quarterly', 'IRS', 500, 25000, 'Late deposit: 2-15% penalty; late filing: 5% per month up to 25%; trust fund recovery penalty (100%) on responsible persons', 'Due last day of month following quarter end', '{}', '{}', '{}', 1, 0, 95, true),
('irs-form-940', 'Annual FUTA Tax Return (Form 940)', NULL, 'payroll', 'high', 'annual', 'IRS', 100, 5000, 'Late filing: 5% per month up to 25%; late deposit: 2-15% penalty', 'Due January 31 of following year', '{}', '{}', '{}', 1, 0, 85, true),
('irs-form-w2', 'W-2 Wage Statements to Employees', NULL, 'payroll', 'critical', 'annual', 'IRS / SSA', 60, 12000, 'Penalty: $60-$310 per form depending on how late; intentional disregard: $630/form with no cap', 'Due January 31 to employees; January 31 to SSA', '{}', '{}', '{}', 1, 0, 92, true),
('irs-form-1099nec', '1099-NEC for Independent Contractors', NULL, 'payroll', 'high', 'annual', 'IRS', 60, 6300, 'Penalty: $60-$310 per form depending on how late; intentional disregard: $630/form', 'Due January 31 to contractors and IRS', '{}', '{}', '{}', 0, 5000, 88, true),

-- Workers Comp / Insurance
('workers-comp-federal', 'Workers Compensation Insurance', NULL, 'insurance', 'critical', 'ongoing', 'State Workers Comp Board', 1000, 100000, 'Operating without workers comp: misdemeanor in most states; fines up to $100K; personal liability for injuries', 'Must maintain coverage at all times when employees are on payroll', '{}', '{}', '{}', 1, 0, 93, true),

-- Sales Tax
('sales-tax-nexus', 'Sales Tax Collection & Remittance (Post-Wayfair)', NULL, 'tax', 'high', 'varies', 'State Revenue Dept', 500, 50000, 'Back taxes + up to 25% penalty + interest; some states impose criminal penalties for willful non-collection', 'Varies by state: monthly, quarterly, or annually based on volume', '{}', '{}', '{}', 0, 100000, 88, true),

-- Self-Employment
('irs-se-tax', 'Self-Employment Tax (Schedule SE)', NULL, 'tax', 'high', 'annual', 'IRS', 200, 10000, 'Underpayment penalty; 15.3% SE tax on net earnings up to $168,600 (2024) + 2.9% Medicare on excess', 'Filed with Form 1040 on April 15', '{}', '{}', '{sole_proprietor,sole_proprietorship,partnership}', 0, 400, 87, true),

-- Beneficial Ownership
('fincen-boi', 'Beneficial Ownership Information Report (BOI)', NULL, 'compliance', 'high', 'one-time', 'FinCEN', 500, 10000, '$500/day civil penalty; criminal: up to $10,000 and 2 years imprisonment', 'Existing companies: by January 1, 2025; new companies: within 90 days of formation', '{}', '{}', '{corporation,s_corp,c_corp,llc,partnership}', 0, 0, 85, true),

-- ── KEY STATE OBLIGATIONS ────────────────────────────────────────────────────

-- California
('ca-franchise-tax', 'California Franchise Tax (Form 100/100S)', NULL, 'tax', 'critical', 'annual', 'CA Franchise Tax Board', 800, 25000, 'Minimum $800 franchise tax; late penalty 5% + 0.5%/month', 'Due April 15 (calendar year) or 15th day of 4th month after fiscal year end', '{CA}', '{}', '{corporation,s_corp,c_corp,llc}', 0, 0, 92, true),
('ca-de9', 'California Quarterly Payroll Tax (DE 9)', NULL, 'payroll', 'critical', 'quarterly', 'CA EDD', 200, 10000, 'Late penalty: 15% of contribution amount; interest accrues', 'Due last day of month following quarter end', '{CA}', '{}', '{}', 1, 0, 90, true),
('ca-sales-tax', 'California Sales & Use Tax', NULL, 'tax', 'high', 'quarterly', 'CA CDTFA', 500, 25000, '10% penalty for late payment; interest at adjusted rate', 'Monthly, quarterly, or annually based on tax liability', '{CA}', '{}', '{}', 0, 30000, 88, true),

-- New York
('ny-corp-tax', 'New York Corporate Franchise Tax (CT-3/CT-3-S)', NULL, 'tax', 'critical', 'annual', 'NY Dept of Tax & Finance', 500, 25000, 'Late filing: 5% per month up to 25%; late payment: 0.5% per month', 'Due March 15 for S-corps; April 15 for C-corps', '{NY}', '{}', '{corporation,s_corp,c_corp,llc}', 0, 0, 92, true),
('ny-sales-tax', 'New York Sales Tax', NULL, 'tax', 'high', 'quarterly', 'NY Dept of Tax & Finance', 500, 20000, '10% penalty; plus interest at prevailing rate', 'Quarterly (March 20, June 20, September 20, December 20)', '{NY}', '{}', '{}', 0, 30000, 88, true),

-- Texas
('tx-franchise-tax', 'Texas Franchise (Margin) Tax', NULL, 'tax', 'high', 'annual', 'TX Comptroller', 0, 25000, '5% penalty if 1-30 days late; 10% if over 30 days; plus interest', 'Due May 15; applies to entities with revenue > $2.47M (no tax below $1.23M)', '{TX}', '{}', '{corporation,s_corp,c_corp,llc,partnership}', 0, 1230000, 85, true),
('tx-sales-tax', 'Texas Sales & Use Tax', NULL, 'tax', 'high', 'varies', 'TX Comptroller', 250, 15000, '5% penalty if 1-30 days late; 10% if over 30 days; plus interest', 'Monthly, quarterly, or annually based on tax liability', '{TX}', '{}', '{}', 0, 30000, 87, true),

-- Florida
('fl-corp-tax', 'Florida Corporate Income Tax (F-1120)', NULL, 'tax', 'high', 'annual', 'FL Dept of Revenue', 500, 15000, 'Late penalty: 10% of tax due per month up to 50%; plus interest', 'Due April 1 (or 1st day of 4th month after fiscal year end)', '{FL}', '{}', '{corporation,c_corp}', 0, 0, 88, true),
('fl-sales-tax', 'Florida Sales & Use Tax', NULL, 'tax', 'high', 'varies', 'FL Dept of Revenue', 250, 15000, '10% penalty for late filing/payment; interest at adjusted rate', 'Due 1st-20th of month following collection period', '{FL}', '{}', '{}', 0, 30000, 87, true),

-- Illinois
('il-corp-tax', 'Illinois Corporate Income & Replacement Tax', NULL, 'tax', 'high', 'annual', 'IL Dept of Revenue', 500, 15000, 'Late filing: 2% per month up to 20%; late payment: 20% penalty', 'Due April 15 (or 15th day of 4th month after fiscal year end)', '{IL}', '{}', '{corporation,s_corp,c_corp,llc}', 0, 0, 87, true),

-- Ohio
('oh-cat-tax', 'Ohio Commercial Activity Tax (CAT)', NULL, 'tax', 'medium', 'quarterly', 'OH Dept of Taxation', 100, 10000, 'Late payment penalty plus interest; minimum CAT of $150/quarter for gross receipts $150K-$1M', 'Due quarterly (May 10, August 10, November 10, February 10)', '{OH}', '{}', '{}', 0, 150000, 82, true),

-- Pennsylvania
('pa-corp-tax', 'Pennsylvania Corporate Net Income Tax', NULL, 'tax', 'high', 'annual', 'PA Dept of Revenue', 500, 20000, 'Late penalty: 5% per month up to 25%; interest at prevailing rate', 'Due April 15; rate: 8.99% (phasing down to 4.99% by 2031)', '{PA}', '{}', '{corporation,s_corp,c_corp,llc}', 0, 0, 87, true),

-- Washington
('wa-bno-tax', 'Washington B&O Tax', NULL, 'tax', 'high', 'varies', 'WA Dept of Revenue', 250, 15000, '9% penalty for late filing; 19% for late payment; interest accrues', 'Monthly, quarterly, or annually based on classification and tax amount', '{WA}', '{}', '{}', 0, 0, 86, true)

ON CONFLICT (slug) DO NOTHING;
