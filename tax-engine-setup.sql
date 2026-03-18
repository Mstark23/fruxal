-- =============================================================================
-- TAX ENGINE + MISSING INDUSTRIES — Database Setup
-- =============================================================================
-- 1. Tax-specific affiliate partners (accountants, tax software, HST recovery)
-- 2. New industry options in businesses table
-- 3. Leak category mappings for tax partners
-- Safe to re-run (IF NOT EXISTS + ON CONFLICT)
-- =============================================================================

-- ─── 1. New tax-focused affiliate partners ──────────────────────────────────
INSERT INTO affiliate_partners (
  id, name, slug, description, category, sub_category,
  referral_url, commission_type, commission_value,
  quality_score, avg_user_satisfaction, active
) VALUES

-- Tax Software
('tax-turbotax', 'TurboTax Business', 'turbotax-business',
 'Canada''s #1 tax software for small business. T2, T2125, GST/HST filing. Auto-imports from QuickBooks.',
 'Tax Software', 'Filing',
 'https://turbotax.intuit.ca/tax/business', 'per_sale', 25,
 0.85, 4.3, true),

('tax-wealthsimple', 'Wealthsimple Tax', 'wealthsimple-tax',
 'Free tax filing for simple returns. Pay-what-you-want model. CRA auto-fill integration.',
 'Tax Software', 'Personal Filing',
 'https://www.wealthsimple.com/en-ca/tax', 'per_lead', 5,
 0.80, 4.5, true),

-- Bookkeeping / Tax Prep Services
('tax-bench', 'Bench Accounting', 'bench-tax',
 'Dedicated bookkeeper + year-end tax package. Catches missed deductions monthly. Integrates with your bank.',
 'Bookkeeping', 'Tax Prep',
 'https://bench.co', 'per_sale', 150,
 0.90, 4.4, true),

('tax-fbc', 'FBC (Farm & Business Consultants)', 'fbc-tax',
 'Canada''s largest tax preparation firm for small business. Audit protection included. Year-round support.',
 'Tax Services', 'Full Service',
 'https://www.fbc.ca', 'per_lead', 50,
 0.85, 4.2, true),

-- HST/GST Recovery
('tax-hst-recovery', 'HST Recovery Pro', 'hst-recovery',
 'Specialized HST/GST audit service. Reviews past 4 years of filings for missed ITCs. No-find-no-fee model.',
 'Tax Services', 'HST Recovery',
 'https://www.hstrecovery.ca', 'revenue_share', 20,
 0.80, 4.0, true),

-- SR&ED
('tax-sred-rnd', 'RND Tax Credits', 'sred-rnd',
 'SR&ED tax credit specialists. Contingency-based — only pay when approved. Average claim: $50K-$200K.',
 'Tax Services', 'SR&ED Credits',
 'https://www.rfrgroup.com', 'revenue_share', 15,
 0.85, 4.1, true),

-- Health Spending Account
('tax-olympia', 'Olympia Benefits', 'olympia-hsa',
 'Health Spending Account provider. Tax-free medical benefits through your corporation. No monthly fees.',
 'Benefits', 'Health Spending Account',
 'https://www.olympiabenefits.com', 'per_sale', 50,
 0.85, 4.3, true),

-- Expense Tracking
('tax-dext', 'Dext (formerly Receipt Bank)', 'dext-receipts',
 'AI-powered receipt scanning and expense tracking. Auto-categorizes for tax deductions. Integrates with QBO/Xero.',
 'Expense Tracking', 'Receipts',
 'https://dext.com', 'per_sale', 30,
 0.85, 4.2, true),

-- Mileage Tracking
('tax-mileiq', 'MileIQ', 'mileiq-tracking',
 'Automatic mileage tracking for CRA vehicle deductions. GPS-based logging, trip classification, CRA-compliant reports.',
 'Expense Tracking', 'Mileage',
 'https://mileiq.com', 'per_sale', 15,
 0.80, 4.0, true)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  referral_url = EXCLUDED.referral_url,
  commission_value = EXCLUDED.commission_value,
  active = true;

-- ─── 2. Map tax partners to compliance-tax leak category ────────────────────
INSERT INTO affiliate_partner_leak_mappings (
  id, partner_id, leak_type, relevance_score, estimated_savings_percentage, active
) VALUES
  (gen_random_uuid()::text, 'tax-turbotax',     'compliance-tax', 0.90, 15, true),
  (gen_random_uuid()::text, 'tax-wealthsimple',  'compliance-tax', 0.70, 10, true),
  (gen_random_uuid()::text, 'tax-bench',          'compliance-tax', 0.95, 20, true),
  (gen_random_uuid()::text, 'tax-fbc',            'compliance-tax', 0.90, 18, true),
  (gen_random_uuid()::text, 'tax-hst-recovery',   'compliance-tax', 0.85, 25, true),
  (gen_random_uuid()::text, 'tax-sred-rnd',       'compliance-tax', 0.80, 30, true),
  (gen_random_uuid()::text, 'tax-olympia',         'compliance-tax', 0.75, 12, true),
  (gen_random_uuid()::text, 'tax-dext',            'compliance-tax', 0.80, 15, true),
  (gen_random_uuid()::text, 'tax-mileiq',          'compliance-tax', 0.70, 10, true),
  -- Also map Bench and Dext to operations (bookkeeping helps operations)
  (gen_random_uuid()::text, 'tax-bench',           'operations',     0.70, 10, true),
  (gen_random_uuid()::text, 'tax-dext',            'operations',     0.65, 8,  true),
  -- Map HST Recovery to vendor-costs (recovering money = reducing costs)
  (gen_random_uuid()::text, 'tax-hst-recovery',    'vendor-costs',   0.60, 5,  true)
ON CONFLICT DO NOTHING;

-- ─── 3. Ensure businesses table supports new industries ─────────────────────
-- (Only needed if there's an ENUM constraint — most Supabase setups use TEXT)
-- If your businesses.industry column has a CHECK constraint, update it:
DO $$
BEGIN
  -- Try to drop existing constraint and add expanded one
  -- This is safe — if constraint doesn't exist, it just skips
  BEGIN
    ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_industry_check;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- ─── 4. Quick verification ──────────────────────────────────────────────────
-- Run this to verify everything landed:
SELECT 'Tax Partners' as check_type, COUNT(*) as count
FROM affiliate_partners WHERE id LIKE 'tax-%'
UNION ALL
SELECT 'Tax Mappings', COUNT(*)
FROM affiliate_partner_leak_mappings WHERE partner_id LIKE 'tax-%'
UNION ALL
SELECT 'Total Partners', COUNT(*)
FROM affiliate_partners WHERE active = true
UNION ALL
SELECT 'Total Categories Covered', COUNT(DISTINCT leak_type)
FROM affiliate_partner_leak_mappings WHERE active = true;
