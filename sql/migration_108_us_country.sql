-- =============================================================================
-- Migration 108: US Platform Support
-- =============================================================================

-- 1. Add country to business_profiles
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'CA';

ALTER TABLE business_profiles
  ADD CONSTRAINT IF NOT EXISTS business_profiles_country_check
  CHECK (country IN ('CA', 'US'));

-- 2. Add country to prescan tables
ALTER TABLE prescan_results
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'CA';

ALTER TABLE prescan_runs
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'CA';

-- 3. Add region column to affiliate_partners (it has provinces[] but not region TEXT)
ALTER TABLE affiliate_partners
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'CA';

-- 4. Backfill: all existing affiliate_partners rows are CA programs
UPDATE affiliate_partners SET region = 'CA' WHERE region IS NULL;

-- 5. Insert US government programs into affiliate_partners
-- (These are in free_alternatives already, but affiliate_partners is what context.ts queries)
INSERT INTO affiliate_partners (
  slug, name, name_fr, description, url, is_government_program,
  annual_value_min, annual_value_max, priority_score, region, is_active
) VALUES
  ('us-rd-tax-credit', 'US R&D Tax Credit (Section 41)', NULL,
   'Federal tax credit for research activities. 20% of QREs above base amount. Startups can apply up to $500K against payroll taxes.',
   'https://www.irs.gov/forms-pubs/about-form-6765', true, 0, 75000, 95, 'US', true),
  ('us-section-179', 'Section 179 Deduction', NULL,
   'Immediate expense deduction up to $1,220,000 for qualifying equipment and software purchased in the tax year.',
   'https://www.irs.gov/newsroom/section-179-deduction', true, 0, 50000, 90, 'US', true),
  ('us-qbi-deduction', 'Qualified Business Income Deduction (Section 199A)', NULL,
   '20% deduction on qualified business income for pass-through entities (S-corps, LLCs, sole props).',
   'https://www.irs.gov/newsroom/qualified-business-income-deduction', true, 0, 40000, 90, 'US', true),
  ('us-wotc', 'Work Opportunity Tax Credit (WOTC)', NULL,
   'Up to $9,600 per eligible hire from target groups (veterans, ex-felons, SNAP recipients). File Form 8850 within 28 days of hire.',
   'https://www.irs.gov/businesses/small-businesses-self-employed/work-opportunity-tax-credit', true, 0, 9600, 85, 'US', true),
  ('us-sba-7a', 'SBA 7(a) Loan Program', NULL,
   'Government-guaranteed loans up to $5M. Lower down payments and longer terms than conventional lending.',
   'https://www.sba.gov/funding-programs/loans', true, 0, 50000, 85, 'US', true),
  ('us-sba-504', 'SBA 504 Loan Program', NULL,
   'Up to $5.5M for major fixed assets at below-market fixed interest rates. Requires 10% down payment.',
   'https://www.sba.gov/funding-programs/loans/504-loans', true, 0, 100000, 85, 'US', true),
  ('us-step-grants', 'State Trade Expansion Program (STEP)', NULL,
   'Grants $5,000–$15,000 for international trade activities including trade shows, websites, and translation.',
   'https://www.sba.gov/funding-programs/grants/state-trade-expansion-program-step', true, 5000, 15000, 80, 'US', true),
  ('us-sba-microloan', 'SBA Microloan Program', NULL,
   'Loans up to $50,000 through nonprofit intermediaries for working capital, inventory, and equipment.',
   'https://www.sba.gov/funding-programs/loans/microloans', true, 0, 5000, 75, 'US', true),
  ('us-clean-energy-ira', 'Clean Energy Tax Credits (IRA)', NULL,
   '30% tax credit for solar, energy storage, and clean vehicles for businesses under the Inflation Reduction Act.',
   'https://www.energy.gov/clean-energy-tax-provisions', true, 0, 50000, 80, 'US', true),
  ('us-bonus-depreciation', 'Bonus Depreciation (80% 2024)', NULL,
   '80% first-year bonus depreciation on qualifying new and used assets in 2024. Decreasing 20%/yr through 2027.',
   'https://www.irs.gov/newsroom/new-rules-and-limitations-for-depreciation-and-expensing', true, 0, 30000, 88, 'US', true),
  ('us-health-care-credit', 'Small Business Health Care Tax Credit', NULL,
   'Up to 50% credit on health insurance premiums for businesses with <25 FTEs earning <$58,000/yr average.',
   'https://www.irs.gov/affordable-care-act/employers/small-business-health-care-tax-credit', true, 0, 25000, 78, 'US', true),
  ('us-sbir-sttr', 'SBIR / STTR Grants', NULL,
   'Federal R&D grants up to $1.7M+ for small businesses doing innovation research across 11 federal agencies.',
   'https://www.sbir.gov', true, 50000, 300000, 82, 'US', true)
ON CONFLICT (slug) DO UPDATE SET
  region = EXCLUDED.region,
  is_government_program = EXCLUDED.is_government_program,
  annual_value_max = EXCLUDED.annual_value_max,
  priority_score = EXCLUDED.priority_score;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_business_profiles_country ON business_profiles(country);
CREATE INDEX IF NOT EXISTS idx_prescan_results_country ON prescan_results(country);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_region ON affiliate_partners(region);
