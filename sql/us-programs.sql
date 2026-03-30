-- =============================================================================
-- US Government Programs — Federal + key state programs
-- Inserted into affiliate_partners with is_government_program = true
-- Uses provinces array with US state codes; '{}' = all states
-- =============================================================================

INSERT INTO affiliate_partners (slug, name, name_fr, category, sub_category, description, description_fr, url, is_government_program, provinces, priority_score, annual_value_min, annual_value_max, active, is_active, pricing_type, referral_type, commission_type, commission_value, quality_score)
VALUES

-- ── FEDERAL PROGRAMS (all states) ────────────────────────────────────────────

('us-rd-tax-credit', 'R&D Tax Credit (Section 41)', NULL, 'tax_credit', 'Federal R&D', 'Federal tax credit of 14-20% on qualified research expenses (wages, supplies, contract research). Startups under $5M gross receipts can apply up to $500K against payroll taxes via Form 6765.', NULL, 'https://www.irs.gov/businesses/research-credit', true, '{}', 98, 5000, 500000, true, true, 'free', 'link', 'none', 0, 0.95),

('us-section-179', 'Section 179 Expensing', NULL, 'tax_deduction', 'Depreciation', 'Immediate expensing of up to $1,220,000 on qualifying equipment, vehicles, software, and furniture purchased for business use. Phase-out begins at $3.05M total purchases.', NULL, 'https://www.irs.gov/newsroom/section-179-deduction', true, '{}', 95, 1000, 1220000, true, true, 'free', 'link', 'none', 0, 0.90),

('us-qbi-deduction', 'Qualified Business Income Deduction (Section 199A)', NULL, 'tax_deduction', 'Pass-Through', '20% deduction on qualified business income for S-corps, LLCs, partnerships, and sole proprietors. Subject to W-2 wage limitation and specified service trade restrictions above income threshold.', NULL, 'https://www.irs.gov/newsroom/qualified-business-income-deduction', true, '{}', 94, 2000, 100000, true, true, 'free', 'link', 'none', 0, 0.90),

('us-wotc', 'Work Opportunity Tax Credit (WOTC)', NULL, 'tax_credit', 'Employment', 'Tax credit of $2,400-$9,600 per eligible new hire including veterans, SNAP recipients, ex-felons, and long-term unemployed. Requires Form 8850 filed within 28 days of start date.', NULL, 'https://www.irs.gov/businesses/small-businesses-self-employed/work-opportunity-tax-credit', true, '{}', 82, 2400, 96000, true, true, 'free', 'link', 'none', 0, 0.85),

('us-sba-7a-loan', 'SBA 7(a) Loan Program', NULL, 'financing', 'SBA Loans', 'Government-guaranteed loans up to $5M for working capital, equipment, real estate, and debt refinancing. SBA guarantees 75-85% of loan reducing lender risk. Rates: prime + 2.25-4.75%.', NULL, 'https://www.sba.gov/funding-programs/loans/7a-loans', true, '{}', 90, 25000, 5000000, true, true, 'free', 'link', 'none', 0, 0.90),

('us-sba-504-loan', 'SBA 504 Loan Program', NULL, 'financing', 'SBA Loans', 'Long-term fixed-rate financing for major assets: real estate, heavy equipment, machinery. Up to $5.5M. Below-market fixed rates. 10-20 year terms. Requires 10% down payment.', NULL, 'https://www.sba.gov/funding-programs/loans/504-loans', true, '{}', 85, 50000, 5500000, true, true, 'free', 'link', 'none', 0, 0.88),

('us-sba-microloan', 'SBA Microloan Program', NULL, 'financing', 'SBA Loans', 'Loans up to $50,000 for small businesses and nonprofits. Average microloan: $13,000. Used for working capital, inventory, supplies, equipment. 6-year max term.', NULL, 'https://www.sba.gov/funding-programs/loans/microloans', true, '{}', 78, 1000, 50000, true, true, 'free', 'link', 'none', 0, 0.82),

('us-sbir-grant', 'SBIR/STTR Grant Program', NULL, 'grant', 'Federal R&D Grant', 'Small Business Innovation Research grants: Phase I up to $275K (6 months), Phase II up to $1.75M (2 years). Non-dilutive federal R&D funding across 11 agencies (NIH, NSF, DOD, DOE, etc.).', NULL, 'https://www.sbir.gov/', true, '{}', 88, 50000, 1750000, true, true, 'free', 'link', 'none', 0, 0.85),

('us-step-grant', 'SBA STEP Grant (Export)', NULL, 'grant', 'Export', 'State Trade Expansion Program provides financial assistance to small businesses entering or expanding in international markets. Covers trade missions, export training, website localization, compliance.', NULL, 'https://www.sba.gov/funding-programs/grants/state-trade-expansion-program-step', true, '{}', 72, 2000, 15000, true, true, 'free', 'link', 'none', 0, 0.78),

('us-empowerment-zone', 'Empowerment Zone Employment Credit', NULL, 'tax_credit', 'Employment', 'Tax credit up to $3,000 per employee who lives and works in a designated Empowerment Zone. Designed to encourage hiring in economically distressed communities.', NULL, 'https://www.irs.gov/businesses/small-businesses-self-employed/empowerment-zone-employment-credit', true, '{}', 68, 3000, 30000, true, true, 'free', 'link', 'none', 0, 0.72),

('us-erc-retention', 'Employee Retention Credit (ERC) — Retroactive Claims', NULL, 'tax_credit', 'COVID Relief', 'Refundable tax credit for wages paid during 2020-2021 COVID periods. Up to $26,000 per employee. IRS processing backlog means many legitimate claims still pending. Deadline to amend: April 2025.', NULL, 'https://www.irs.gov/coronavirus/employee-retention-credit', true, '{}', 75, 5000, 260000, true, true, 'free', 'link', 'none', 0, 0.75),

('us-disabled-access-credit', 'Disabled Access Credit (Section 44)', NULL, 'tax_credit', 'Accessibility', 'Small businesses (under $1M revenue or <30 employees) can claim 50% of accessibility expenditures between $250-$10,250. Max credit: $5,000/year for ADA compliance expenses.', NULL, 'https://www.irs.gov/forms-pubs/about-form-8826', true, '{}', 65, 250, 5000, true, true, 'free', 'link', 'none', 0, 0.70),

-- ── KEY STATE PROGRAMS ───────────────────────────────────────────────────────

-- California
('us-ca-competes', 'California Competes Tax Credit', NULL, 'tax_credit', 'State Incentive', 'Negotiated income tax credit for businesses that want to locate or expand in California. Based on jobs created, investment amount, and strategic importance. Up to $2M per small business.', NULL, 'https://business.ca.gov/california-competes-tax-credit/', true, '{CA}', 80, 10000, 2000000, true, true, 'free', 'link', 'none', 0, 0.82),

('us-ca-rd-credit', 'California R&D Tax Credit', NULL, 'tax_credit', 'State R&D', '24% credit on qualified research expenses exceeding base amount (15% for basic research payments). No cap. Can be carried forward indefinitely. Stacks with federal R&D credit.', NULL, 'https://www.ftb.ca.gov/file/business/credits/research.html', true, '{CA}', 88, 5000, 200000, true, true, 'free', 'link', 'none', 0, 0.88),

-- New York
('us-ny-excelsior', 'New York Excelsior Jobs Program', NULL, 'tax_credit', 'State Incentive', 'Refundable tax credits for job creation, investment, and R&D in targeted industries: biotech, pharma, software, financial services, agriculture, manufacturing, distribution. Credits of 6.85% of wages per new job.', NULL, 'https://esd.ny.gov/excelsior-jobs-program', true, '{NY}', 82, 5000, 500000, true, true, 'free', 'link', 'none', 0, 0.83),

-- Texas
('us-tx-enterprise-zone', 'Texas Enterprise Zone Program', NULL, 'tax_credit', 'State Incentive', 'Sales tax refunds for businesses in enterprise zones that create jobs and make capital investments. Refunds of up to $2,500 per new permanent job. Max $1.25M over 5-year benefit period.', NULL, 'https://gov.texas.gov/business/page/texas-enterprise-zone-program', true, '{TX}', 76, 2500, 1250000, true, true, 'free', 'link', 'none', 0, 0.78),

('us-tx-skills-fund', 'Texas Skills Development Fund', NULL, 'grant', 'Workforce', 'Grants for customized job training through community and technical colleges. Businesses partner with local colleges to train new or existing workers. Covers up to 100% of training costs.', NULL, 'https://www.twc.texas.gov/programs/skills-development-fund', true, '{TX}', 72, 5000, 500000, true, true, 'free', 'link', 'none', 0, 0.75),

-- Florida
('us-fl-qti', 'Florida Qualified Target Industry (QTI) Tax Refund', NULL, 'tax_credit', 'State Incentive', 'Tax refunds of $3,000-$6,000 per new job created in high-value industries: life sciences, IT, financial services, manufacturing, clean energy. Must create 10+ jobs paying 115%+ of area average wage.', NULL, 'https://www.floridajobs.org/business-growth-and-partnerships/for-businesses-702/qualified-target-industry-tax-refund', true, '{FL}', 78, 30000, 600000, true, true, 'free', 'link', 'none', 0, 0.80),

-- Illinois
('us-il-edge', 'Illinois EDGE Tax Credit', NULL, 'tax_credit', 'State Incentive', 'Economic Development for a Growing Economy: income tax credit for businesses creating/retaining jobs in Illinois. Credits based on incremental income tax from new employees. Up to 10-year term.', NULL, 'https://www.illinois.gov/dceo/expandrelocate/incentives/taxassistance/pages/edge.aspx', true, '{IL}', 76, 5000, 1000000, true, true, 'free', 'link', 'none', 0, 0.78),

-- Washington
('us-wa-rd-credit', 'Washington B&O R&D Tax Credit', NULL, 'tax_credit', 'State R&D', 'B&O tax credit for qualified R&D expenditures in Washington. Credit rate varies by expenditure amount. Available to businesses conducting R&D activities with nexus in WA.', NULL, 'https://dor.wa.gov/taxes-rates/tax-incentives/credits/research-development-credit', true, '{WA}', 80, 2000, 100000, true, true, 'free', 'link', 'none', 0, 0.80),

-- Colorado
('us-co-advanced-industries', 'Colorado Advanced Industries Grant', NULL, 'grant', 'State Innovation', 'Proof of Concept and Early-Stage Capital & Retention grants for advanced industries: aerospace, bioscience, electronics, energy, infrastructure engineering, IT, and technology. Grants up to $250K.', NULL, 'https://oedit.colorado.gov/advanced-industries', true, '{CO}', 78, 25000, 250000, true, true, 'free', 'link', 'none', 0, 0.80),

-- Georgia
('us-ga-job-tax-credit', 'Georgia Job Tax Credit', NULL, 'tax_credit', 'State Incentive', 'Tax credits of $1,250-$4,000 per new job created depending on county tier designation. Can be applied against 100% of GA income tax liability in Tier 1 counties. 5-year carry-forward.', NULL, 'https://www.georgia.org/competitive-advantages/incentives/tax-credits/job-tax-credit', true, '{GA}', 76, 6250, 200000, true, true, 'free', 'link', 'none', 0, 0.78)

ON CONFLICT (slug) DO NOTHING;
