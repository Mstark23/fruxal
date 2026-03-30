-- =============================================================================
-- US Leak Detectors — Federal + key state patterns
-- Uses province field with US state codes
-- "ALL" province = applies to every US state
-- =============================================================================

INSERT INTO provincial_leak_detectors (slug, province, title, title_fr, severity, category, description, description_fr, annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES

-- ── FEDERAL (all US states) ──────────────────────────────────────────────────

-- S-Corp / SE Tax
('us-se-tax-overpay', 'ALL', 'Self-Employment Tax Overpayment', NULL, 'critical', 'tax', 'Sole proprietors and single-member LLC owners pay 15.3% SE tax on all net earnings. S-corp election can save $3,000-$15,000/yr by splitting income into W-2 salary (subject to FICA) and distributions (not subject to FICA).', NULL, 3000, 15000, 'professional', 98, true),
('us-scorp-reasonable-comp', 'ALL', 'S-Corp Reasonable Compensation Risk', NULL, 'high', 'tax', 'IRS scrutinizes S-corp owner W-2 salaries below 40% of net profit. Setting W-2 too low triggers reclassification of distributions as wages + back FICA + penalties. Setting it too high wastes FICA savings.', NULL, 2000, 12000, 'professional', 92, true),

-- QBI / Section 199A
('us-qbi-deduction-missed', 'ALL', 'Section 199A QBI Deduction Not Claimed', NULL, 'critical', 'tax', 'Pass-through entities (S-corps, LLCs, partnerships, sole props) may deduct 20% of Qualified Business Income. At $200K income, this is worth $40K deduction = ~$8K-$12K in tax savings. Subject to W-2 wage limitation above threshold.', NULL, 2000, 40000, 'professional', 95, true),

-- Retirement
('us-no-retirement-plan', 'ALL', 'No Business Retirement Plan', NULL, 'high', 'tax', 'Self-employed owners without a SEP-IRA, Solo 401(k), or defined benefit plan are missing tax-deferred savings of $23K-$69K/year (2024). Solo 401(k) allows employee + employer contributions.', NULL, 3000, 20000, 'professional', 90, true),

-- R&D Credit
('us-rd-credit-unclaimed', 'ALL', 'Federal R&D Tax Credit (Section 41) Not Claimed', NULL, 'high', 'tax', 'Businesses doing software development, process improvement, product design, or technical innovation may qualify for 14-20% credit on qualified research expenses. Startups under $5M revenue can offset payroll taxes.', NULL, 5000, 50000, 'professional', 88, true),

-- Section 179 / Depreciation
('us-section-179-missed', 'ALL', 'Section 179 / Bonus Depreciation Underused', NULL, 'high', 'tax', 'Section 179 allows immediate expensing up to $1.22M on equipment, vehicles, and software. Bonus depreciation adds 80% first-year deduction (2024). Many businesses use straight-line when accelerated methods save more upfront.', NULL, 2000, 30000, 'professional', 85, true),

-- Health Insurance
('us-health-insurance-deduction', 'ALL', 'Self-Employed Health Insurance Deduction Missed', NULL, 'medium', 'tax', 'Self-employed individuals can deduct 100% of health insurance premiums (medical, dental, vision, long-term care) for themselves and family. S-corp owners must include premiums on W-2 to qualify.', NULL, 2000, 12000, 'professional', 82, true),

-- Home Office
('us-home-office-missed', 'ALL', 'Home Office Deduction Not Claimed', NULL, 'medium', 'tax', 'Simplified method: $5/sq ft up to 300 sq ft = $1,500. Actual method can be much higher including mortgage interest, utilities, insurance, depreciation proportional to office space.', NULL, 500, 5000, 'professional', 78, true),

-- Vehicle
('us-vehicle-deduction-missed', 'ALL', 'Business Vehicle Deduction Underused', NULL, 'medium', 'tax', 'Standard mileage rate: $0.67/mile (2024). Many business owners fail to track mileage or use actual expense method when it would yield more. 15,000 business miles = $10,050 deduction.', NULL, 1000, 10000, 'professional', 80, true),

-- Workers Comp
('us-no-workers-comp', 'ALL', 'Operating Without Workers Compensation', NULL, 'critical', 'compliance', 'Required in most states for businesses with employees. Operating without coverage exposes the business to lawsuits, fines up to $100K, and criminal penalties. Even 1099 contractors may require coverage in some states.', NULL, 5000, 100000, 'professional', 95, true),

-- 1099 Misclassification
('us-1099-misclassification', 'ALL', 'Worker Misclassification (1099 vs W-2)', NULL, 'critical', 'payroll', 'IRS 20-factor test determines employee vs contractor status. Misclassification triggers back payroll taxes (employer + employee share), penalties of 1.5-3% of wages, and potential state labor law violations.', NULL, 3000, 50000, 'professional', 93, true),

-- WOTC
('us-wotc-not-screening', 'ALL', 'Work Opportunity Tax Credit (WOTC) Not Used', NULL, 'medium', 'tax', 'Employers can claim $2,400-$9,600 per eligible hire (veterans, SNAP recipients, ex-felons, long-term unemployed). Requires Form 8850 submitted within 28 days of hire.', NULL, 2400, 24000, 'professional', 78, true),

-- Sales Tax Nexus
('us-sales-tax-nexus-unregistered', 'ALL', 'Sales Tax Nexus in Unregistered States', NULL, 'high', 'compliance', 'Post-Wayfair, economic nexus ($100K revenue or 200 transactions in a state) triggers collection obligations. Selling across state lines without registering creates back-tax liability + 25% penalties.', NULL, 2000, 50000, 'professional', 88, true),

-- No Bookkeeping
('us-no-bookkeeping', 'ALL', 'No Professional Bookkeeping System', NULL, 'high', 'operations', 'Businesses without accounting software miss 15-40% of eligible deductions. Poor records increase audit risk and make tax preparation more expensive. QuickBooks, Xero, or FreshBooks pay for themselves.', NULL, 3000, 18000, 'software', 90, true),

-- Insurance Gaps
('us-insurance-gaps', 'ALL', 'Business Insurance Gaps', NULL, 'high', 'insurance', 'Many small businesses lack adequate coverage: general liability, professional liability (E&O), cyber liability, business interruption, key person. A single uncovered claim can bankrupt a small business.', NULL, 5000, 50000, 'professional', 85, true),

-- Vendor Contracts
('us-vendor-contracts-stale', 'ALL', 'Vendor Contracts Not Renegotiated', NULL, 'medium', 'operations', 'Businesses that haven''t renegotiated vendor contracts in 2+ years typically overpay 8-15% on recurring expenses: merchant processing, insurance, supplies, software, utilities, telecom.', NULL, 2000, 15000, 'professional', 80, true),

-- ── STATE-SPECIFIC ───────────────────────────────────────────────────────────

-- California
('us-ca-ccpa-noncompliance', 'CA', 'CCPA/CPRA Privacy Compliance Gap', NULL, 'critical', 'compliance', 'California Consumer Privacy Act requires businesses with >$25M revenue, >50K consumer records, or >50% revenue from data sales to provide privacy notices, opt-out rights, and data deletion. Fines up to $7,500 per intentional violation.', NULL, 5000, 75000, 'professional', 90, true),
('us-ca-llc-fee', 'CA', 'California LLC Annual Fee Optimization', NULL, 'medium', 'tax', 'California charges $800 minimum franchise tax + gross receipts fee ($900-$11,790 based on revenue). Multi-state LLCs may reduce CA-source income through proper apportionment.', NULL, 800, 5000, 'professional', 75, true),

-- New York
('us-ny-mta-surcharge', 'NY', 'NY MTA Surcharge Not Planned For', NULL, 'medium', 'tax', 'NYC metro area businesses pay an additional 30% surcharge on corporate franchise tax. Proper planning around entity location and income allocation can reduce exposure.', NULL, 1000, 10000, 'professional', 78, true),

-- Texas
('us-tx-franchise-exemption', 'TX', 'Texas Franchise Tax Exemption Missed', NULL, 'medium', 'tax', 'Businesses with total revenue below $2.47M owe no franchise tax (but must still file). Between $1.23M-$2.47M, EZ computation rate of 0.331% may apply. Many businesses overpay by using wrong calculation method.', NULL, 500, 5000, 'professional', 75, true),

-- Florida
('us-fl-no-income-tax', 'FL', 'Florida Entity Structure Opportunity', NULL, 'medium', 'tax', 'Florida has no personal income tax. S-corp and LLC owners can minimize state tax burden by ensuring income flows through to FL-resident owners. C-corps still pay 5.5% FL corporate tax.', NULL, 1000, 8000, 'professional', 76, true),

-- Washington
('us-wa-bno-classification', 'WA', 'Washington B&O Tax Misclassification', NULL, 'medium', 'tax', 'B&O tax rates vary by business classification (0.471% retailing to 1.5% service). Many businesses use the wrong classification, overpaying by thousands. Manufacturing at 0.484% vs service at 1.5% is a significant difference.', NULL, 1000, 8000, 'professional', 78, true),

-- Colorado
('us-co-privacy-law', 'CO', 'Colorado Privacy Act Compliance', NULL, 'high', 'compliance', 'CPA requires businesses controlling/processing personal data of 100K+ consumers or 25K+ consumers with revenue from data sales to implement privacy rights. Effective July 2023.', NULL, 2000, 20000, 'professional', 82, true),

-- Virginia
('us-va-privacy-law', 'VA', 'Virginia CDPA Compliance', NULL, 'high', 'compliance', 'VCDPA applies to businesses controlling/processing personal data of 100K+ consumers or 25K+ consumers with >50% revenue from data. Must provide opt-out, access, and deletion rights.', NULL, 2000, 20000, 'professional', 82, true)

ON CONFLICT (slug, province) DO NOTHING;
