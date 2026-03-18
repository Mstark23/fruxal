-- ═══════════════════════════════════════════════════════════════
-- AFFILIATE ENGINE — CLEAN INSTALL (drop + create + seed)
-- Run this single file in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Drop old tables if they exist (order matters for foreign keys)
DROP TABLE IF EXISTS affiliate_recommendations CASCADE;
DROP TABLE IF EXISTS affiliate_referrals CASCADE;
DROP TABLE IF EXISTS user_expense_profiles CASCADE;
DROP TABLE IF EXISTS market_benchmarks CASCADE;
DROP TABLE IF EXISTS affiliate_partner_leak_mappings CASCADE;
DROP TABLE IF EXISTS affiliate_partner_rates CASCADE;
DROP TABLE IF EXISTS affiliate_partners CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- CREATE TABLES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE affiliate_partners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  category TEXT NOT NULL,
  sub_category TEXT,
  pricing_type TEXT NOT NULL DEFAULT 'fixed',
  referral_type TEXT NOT NULL DEFAULT 'link',
  referral_url TEXT,
  referral_code TEXT,
  commission_type TEXT NOT NULL DEFAULT 'percentage',
  commission_value DOUBLE PRECISION NOT NULL DEFAULT 0,
  commission_recurring BOOLEAN NOT NULL DEFAULT false,
  quality_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  avg_user_satisfaction DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  conversion_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affiliate_partner_rates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  partner_id TEXT NOT NULL REFERENCES affiliate_partners(id) ON DELETE CASCADE,
  rate_name TEXT NOT NULL,
  rate_type TEXT NOT NULL,
  rate_value DOUBLE PRECISION NOT NULL,
  monthly_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  setup_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  conditions TEXT,
  valid_from TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affiliate_partner_leak_mappings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  partner_id TEXT NOT NULL REFERENCES affiliate_partners(id) ON DELETE CASCADE,
  leak_type TEXT NOT NULL,
  estimated_savings_percentage DOUBLE PRECISION NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(partner_id, leak_type)
);

CREATE TABLE market_benchmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category TEXT NOT NULL,
  sub_category TEXT,
  region TEXT NOT NULL DEFAULT 'CANADA',
  business_size TEXT,
  top10_value DOUBLE PRECISION,
  low_value DOUBLE PRECISION,
  median_value DOUBLE PRECISION,
  high_value DOUBLE PRECISION,
  unit TEXT,
  sample_size INTEGER NOT NULL DEFAULT 0,
  confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  source TEXT,
  last_updated TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, sub_category, region, business_size)
);

CREATE TABLE user_expense_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT,
  user_id TEXT,
  category TEXT NOT NULL,
  sub_category TEXT,
  vendor_name TEXT,
  monthly_cost DOUBLE PRECISION,
  annual_cost DOUBLE PRECISION,
  current_rate DOUBLE PRECISION,
  contract_start_date TIMESTAMP(3),
  contract_end_date TIMESTAMP(3),
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  potential_savings_monthly DOUBLE PRECISION,
  potential_savings_annual DOUBLE PRECISION,
  best_partner_id TEXT,
  detected_from_transactions BOOLEAN NOT NULL DEFAULT false,
  last_analyzed TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affiliate_referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  business_id TEXT,
  partner_id TEXT NOT NULL REFERENCES affiliate_partners(id),
  expense_profile_id TEXT,
  leak_id TEXT,
  category TEXT,
  current_cost_monthly DOUBLE PRECISION,
  projected_savings_monthly DOUBLE PRECISION,
  projected_savings_annual DOUBLE PRECISION,
  actual_savings_monthly DOUBLE PRECISION,
  referral_url TEXT,
  status TEXT NOT NULL DEFAULT 'CLICKED',
  converted_at TIMESTAMP(3),
  user_satisfaction INTEGER,
  user_feedback TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affiliate_recommendations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  business_id TEXT,
  partner_id TEXT NOT NULL,
  category TEXT NOT NULL,
  reason TEXT,
  estimated_savings DOUBLE PRECISION,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  dismiss_reason TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_expense_profiles_business ON user_expense_profiles(business_id);
CREATE INDEX idx_expense_profiles_category ON user_expense_profiles(category);
CREATE INDEX idx_referrals_user ON affiliate_referrals(user_id);
CREATE INDEX idx_referrals_partner ON affiliate_referrals(partner_id);
CREATE INDEX idx_partners_category ON affiliate_partners(category);
CREATE INDEX idx_benchmarks_category ON market_benchmarks(category);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════

-- Partners
INSERT INTO affiliate_partners (id, name, slug, description, category, pricing_type, referral_type, referral_url, commission_type, commission_value, commission_recurring, quality_score, avg_user_satisfaction, active)
VALUES
  ('partner_helcim', 'Helcim', 'helcim', 'Interchange-plus pricing with no monthly fees. Transparent rates for small businesses.', 'payment_processing', 'fixed', 'link', 'https://helcim.com/ref/leakandgrow', 'percentage', 0.25, true, 0.85, 4.6, true),
  ('partner_square', 'Square', 'square', 'Flat-rate payment processing with free POS. Simple, predictable pricing.', 'payment_processing', 'fixed', 'link', 'https://squareup.com/ref/leakandgrow', 'flat', 50, false, 0.72, 4.2, true),
  ('partner_plooto', 'Plooto', 'plooto', 'Automated AP/AR with lower processing fees. Built for Canadian SMBs.', 'payment_processing', 'fixed', 'link', 'https://plooto.com/ref/leakandgrow', 'percentage', 0.20, true, 0.68, 4.1, true),
  ('partner_sonnet', 'Sonnet Insurance', 'sonnet', 'Digital-first business insurance with instant quotes and competitive rates.', 'insurance', 'quote', 'form', 'https://sonnet.ca/business/ref/leakandgrow', 'flat', 75, false, 0.75, 4.3, true),
  ('partner_videotron', 'Vidéotron Business', 'videotron-business', 'Quebec-based telecom with competitive business plans. Local support.', 'telecom', 'fixed', 'link', 'https://videotron.com/business/ref/leakandgrow', 'flat', 40, false, 0.65, 3.9, true),
  ('partner_waveapps', 'Wave', 'wave', 'Free accounting software with affordable payroll. Great for small businesses.', 'software', 'fixed', 'link', 'https://waveapps.com/ref/leakandgrow', 'percentage', 0.15, true, 0.60, 4.0, true);

-- Partner Rates
INSERT INTO affiliate_partner_rates (id, partner_id, rate_name, rate_type, rate_value, monthly_fee, conditions)
VALUES
  ('rate_helcim_1', 'partner_helcim', 'Interchange Plus', 'percentage', 0.003, 0, 'All volumes'),
  ('rate_helcim_2', 'partner_helcim', 'Online Transactions', 'percentage', 0.0035, 0, 'Card-not-present'),
  ('rate_square_1', 'partner_square', 'In-Person', 'percentage', 0.026, 0, 'Tap/chip/swipe'),
  ('rate_square_2', 'partner_square', 'Online', 'percentage', 0.029, 0, 'E-commerce'),
  ('rate_plooto_1', 'partner_plooto', 'EFT Processing', 'flat', 1.50, 0, 'Per transaction'),
  ('rate_plooto_2', 'partner_plooto', 'International Wire', 'flat', 9.99, 0, 'Per transaction');

-- Leak Type → Partner Mappings
INSERT INTO affiliate_partner_leak_mappings (id, partner_id, leak_type, estimated_savings_percentage, active)
VALUES
  ('lm_helcim_vendor', 'partner_helcim', 'VENDOR_OVERCHARGE', 75, true),
  ('lm_square_vendor', 'partner_square', 'VENDOR_OVERCHARGE', 19, true),
  ('lm_plooto_vendor', 'partner_plooto', 'VENDOR_OVERCHARGE', 30, true),
  ('lm_helcim_system', 'partner_helcim', 'SYSTEM_GAP', 40, true),
  ('lm_sonnet_vendor', 'partner_sonnet', 'VENDOR_OVERCHARGE', 25, true),
  ('lm_wave_system', 'partner_waveapps', 'SYSTEM_GAP', 20, true);

-- Market Benchmarks (Canadian small business)
INSERT INTO market_benchmarks (id, category, sub_category, region, business_size, top10_value, low_value, median_value, high_value, unit, sample_size, confidence_score, source)
VALUES
  ('bench_pp_card', 'payment_processing', 'card_present', 'CANADA', 'small', 0.018, 0.022, 0.026, 0.032, 'percentage', 850, 0.85, 'Helcim/CFIB 2025'),
  ('bench_pp_online', 'payment_processing', 'card_not_present', 'CANADA', 'small', 0.023, 0.027, 0.029, 0.035, 'percentage', 620, 0.80, 'Helcim/CFIB 2025'),
  ('bench_insurance', 'insurance', 'general_liability', 'CANADA', 'small', 150, 200, 275, 400, 'dollars_monthly', 480, 0.72, 'Sonnet/IBC 2025'),
  ('bench_insurance_pro', 'insurance', 'professional_liability', 'CANADA', 'small', 80, 120, 180, 300, 'dollars_monthly', 350, 0.70, 'Sonnet/IBC 2025'),
  ('bench_telecom', 'telecom', 'business_internet', 'CANADA', 'small', 60, 80, 120, 189, 'dollars_monthly', 720, 0.82, 'CRTC/PCMag 2025'),
  ('bench_telecom_phone', 'telecom', 'business_phone', 'CANADA', 'small', 25, 35, 50, 75, 'dollars_monthly', 520, 0.75, 'CRTC 2025'),
  ('bench_software_acct', 'software', 'accounting', 'CANADA', 'small', 0, 15, 35, 65, 'dollars_monthly', 900, 0.88, 'G2/Capterra 2025'),
  ('bench_banking', 'banking', 'business_account', 'CANADA', 'small', 0, 4.95, 7.95, 15, 'dollars_monthly', 1100, 0.90, 'Ratehub 2025'),
  ('bench_banking_payroll', 'banking', 'payroll', 'CANADA', 'small', 20, 30, 45, 80, 'dollars_monthly', 380, 0.68, 'Wagepoint/ADP 2025'),
  ('bench_software_crm', 'software', 'crm', 'CANADA', 'small', 0, 15, 35, 80, 'dollars_monthly', 500, 0.75, 'G2 2025'),
  ('bench_marketing', 'marketing', 'email_platform', 'CANADA', 'small', 0, 13, 30, 65, 'dollars_monthly', 450, 0.72, 'Mailchimp/G2 2025'),
  ('bench_software_pm', 'software', 'project_management', 'CANADA', 'small', 0, 10, 25, 50, 'dollars_monthly', 400, 0.70, 'G2 2025'),
  ('bench_cloud', 'software', 'cloud_hosting', 'CANADA', 'small', 5, 20, 50, 150, 'dollars_monthly', 300, 0.65, 'AWS/Azure pricing 2025'),
  ('bench_shipping', 'logistics', 'shipping', 'CANADA', 'small', 200, 400, 700, 1200, 'dollars_monthly', 250, 0.60, 'ShipStation 2025');

-- ═══════════════════════════════════════════════════════════════
-- DONE! Tables created + seeded with 6 partners + 14 benchmarks
-- ═══════════════════════════════════════════════════════════════
