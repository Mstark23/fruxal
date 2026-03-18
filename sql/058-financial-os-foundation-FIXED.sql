-- ============================================================================
-- 058: FINANCIAL OS FOUNDATION - Complete Schema
-- ============================================================================
-- Creates all tables needed for the Financial Operating System:
-- - Core business/user tables
-- - Prescan sessions & runs
-- - Leak detection & tracking
-- - Financial/Data Health scores
-- - Monitoring & alerts
-- - Quebec benchmark data
-- ============================================================================

-- ─── 0. CORE TABLES (Create if not exists) ──────────────────────────────────

-- Users table (Supabase Auth integration)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

COMMENT ON TABLE users IS 'Core user authentication table';

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  legal_name TEXT,
  industry_slug TEXT,
  province TEXT,
  city TEXT,
  size_tier TEXT DEFAULT 'solo', -- 'solo', 'small', 'growth'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry_slug);
CREATE INDEX IF NOT EXISTS idx_businesses_province ON businesses(province);

COMMENT ON TABLE businesses IS 'Business entities in the system';

-- Industries table (for reference)
CREATE TABLE IF NOT EXISTS industries (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE industries IS 'Industry reference table';

-- Insert common industries
INSERT INTO industries (slug, name, description) VALUES
  ('barber_shop', 'Barber Shop', 'Hair cutting and styling services'),
  ('beauty_salon', 'Beauty Salon', 'Beauty and hair salon services'),
  ('restaurant', 'Restaurant', 'Food service and dining'),
  ('cafe_coffee_shop', 'Cafe/Coffee Shop', 'Coffee and light food service'),
  ('rideshare_driver', 'Rideshare Driver', 'Uber, Lyft, and similar services'),
  ('taxi_rideshare', 'Taxi', 'Traditional taxi services'),
  ('trucking', 'Trucking', 'Freight and transportation'),
  ('construction', 'Construction', 'General construction services'),
  ('plumbing', 'Plumbing', 'Plumbing services'),
  ('electrical', 'Electrical', 'Electrical services'),
  ('consulting', 'Consulting', 'Professional consulting services'),
  ('accounting', 'Accounting', 'Accounting services'),
  ('bookkeeping', 'Bookkeeping', 'Bookkeeping services'),
  ('law_firm', 'Law Firm', 'Legal services'),
  ('retail', 'Retail', 'Retail store'),
  ('ecommerce', 'E-commerce', 'Online retail'),
  ('generic_small_business', 'Generic Small Business', 'Fallback for unclassified businesses')
ON CONFLICT (slug) DO NOTHING;

-- Industry Benchmarks table
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_slug TEXT NOT NULL REFERENCES industries(slug),
  province TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  metric_unit TEXT,
  p50 NUMERIC(10,4) NOT NULL,
  p75 NUMERIC(10,4) NOT NULL,
  p90 NUMERIC(10,4) NOT NULL,
  sample_size INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(industry_slug, province, metric_key, valid_from)
);

CREATE INDEX IF NOT EXISTS idx_benchmarks_industry ON industry_benchmarks(industry_slug);
CREATE INDEX IF NOT EXISTS idx_benchmarks_province ON industry_benchmarks(province);
CREATE INDEX IF NOT EXISTS idx_benchmarks_metric ON industry_benchmarks(metric_key);

COMMENT ON TABLE industry_benchmarks IS 'Industry and province-specific benchmark data';

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT DEFAULT 'free', -- 'free', 'solo', 'small', 'growth'
  status TEXT DEFAULT 'active', -- 'trialing', 'active', 'past_due', 'canceled'
  monitoring_enabled BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_business ON subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

COMMENT ON TABLE subscriptions IS 'Business subscription and billing information';
COMMENT ON COLUMN subscriptions.monitoring_enabled IS 'Whether continuous monitoring is active (requires paid tier)';

-- ─── 1. PRESCAN SESSIONS (Chat State) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescan_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  state JSONB DEFAULT '{}'::jsonb,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescan_sessions_business ON prescan_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_prescan_sessions_user ON prescan_sessions(user_id);

COMMENT ON TABLE prescan_sessions IS 'AI chat state for prescan conversations';
COMMENT ON COLUMN prescan_sessions.state IS 'Full conversation state as JSONB';

-- ─── 2. PRESCAN RUNS (Completed Prescans) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS prescan_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  industry_slug TEXT NOT NULL,
  province TEXT NOT NULL,
  revenue_band TEXT, -- 'under_100k', '100k_500k', '500k_2m', '2m_plus'
  annual_revenue NUMERIC(12,2),
  payment_mix TEXT, -- 'mostly_cash', 'mixed', 'mostly_card'
  payment_tools TEXT[], -- ['bank_terminal', 'square', 'stripe', etc]
  main_costs TEXT[], -- ['rent', 'chair_rent', 'fuel', 'staff', etc]
  employee_count INTEGER DEFAULT 0,
  uses_accounting_software BOOLEAN DEFAULT false,
  health_score INTEGER, -- 0-100 Financial Health Score
  data_health_score INTEGER, -- 0-100 Data Health Score
  total_leak_estimate_year NUMERIC(12,2),
  recovered_amount_ytd NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescan_runs_business ON prescan_runs(business_id);
CREATE INDEX IF NOT EXISTS idx_prescan_runs_created ON prescan_runs(created_at DESC);

COMMENT ON TABLE prescan_runs IS 'Completed prescan analyses with full business context';

-- ─── 3. LEAK TYPES (Leak Catalog) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leak_types (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'payments', 'banking', 'insurance', 'payroll', 'tax', 'fuel', 'subscriptions', 'other'
  description TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  module_key TEXT, -- Reference to detection module
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 4 core leaks from Phase 1
INSERT INTO leak_types (code, name, category, description, severity, module_key) VALUES
  ('processing_rate_high', 'Card Processing Fees Too High', 'payments', 
   'Your card processing rate is higher than similar businesses in your province.', 
   'medium', 'processing'),
  ('rent_or_chair_high', 'Rent/Chair Cost Too High', 'other', 
   'Your rent or chair rental cost is taking a larger percentage of revenue than typical for your industry.', 
   'medium', 'rent'),
  ('tax_optimization_gap', 'Tax Deduction Opportunities Missed', 'tax', 
   'Without accounting software, you may be missing significant tax deductions.', 
   'high', 'tax'),
  ('cash_management_risk', 'Cash Handling Risk', 'other', 
   'Heavy cash usage with manual tracking creates risk of loss and missed insights.', 
   'low', 'cash')
ON CONFLICT (code) DO NOTHING;

-- ─── 4. DETECTED LEAKS (Leak Results) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS detected_leaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  prescan_run_id UUID REFERENCES prescan_runs(id) ON DELETE CASCADE,
  leak_type_id INTEGER REFERENCES leak_types(id),
  status TEXT DEFAULT 'detected', -- 'detected', 'in_progress', 'fixed', 'ignored'
  estimated_annual_leak NUMERIC(12,2) DEFAULT 0,
  severity_score INTEGER, -- 0-100
  confidence_score INTEGER, -- 0-100
  priority_score INTEGER, -- 0-100
  detection_confidence NUMERIC(3,2), -- 0.00-1.00
  source TEXT DEFAULT 'prescan', -- 'prescan', 'monthly_scan', 'manual'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  fixed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_detected_leaks_business ON detected_leaks(business_id);
CREATE INDEX IF NOT EXISTS idx_detected_leaks_status ON detected_leaks(status);
CREATE INDEX IF NOT EXISTS idx_detected_leaks_priority ON detected_leaks(priority_score DESC);

COMMENT ON TABLE detected_leaks IS 'Individual leaks detected for businesses';

-- ─── 5. LEAK ACTIONS (Fix Tracking) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leak_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_leak_id UUID REFERENCES detected_leaks(id) ON DELETE CASCADE,
  action_type TEXT, -- 'switch_processor', 'renegotiate_bank', 'change_insurance', 'adjust_payroll'
  description TEXT,
  partner_offer_id UUID, -- FK to partner_offers (if using affiliate)
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'abandoned'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leak_actions_leak ON leak_actions(detected_leak_id);

-- ─── 6. FINANCIAL SNAPSHOTS (Monthly Monitoring) ────────────────────────────
CREATE TABLE IF NOT EXISTS financial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  revenue_month NUMERIC(12,2),
  expenses_month NUMERIC(12,2),
  gross_margin NUMERIC(5,2),
  payroll_cost NUMERIC(12,2),
  processing_fees NUMERIC(12,2),
  insurance_cost NUMERIC(12,2),
  fuel_cost NUMERIC(12,2),
  subscriptions_cost NUMERIC(12,2),
  cash_position NUMERIC(12,2),
  financial_health_score INTEGER, -- 0-100
  data_health_score INTEGER, -- 0-100
  total_estimated_leak NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_snapshots_business ON financial_snapshots(business_id);
CREATE INDEX IF NOT EXISTS idx_financial_snapshots_date ON financial_snapshots(snapshot_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_snapshots_business_date ON financial_snapshots(business_id, snapshot_date);

COMMENT ON TABLE financial_snapshots IS 'Monthly financial snapshots for trend analysis';

-- ─── 7. ALERTS (Monitoring Notifications) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  leak_id UUID REFERENCES detected_leaks(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'new_leak', 'worsening', 'improvement', 'benchmark_shift'
  level TEXT NOT NULL, -- 'info', 'advisory', 'important', 'critical'
  title TEXT NOT NULL,
  message TEXT,
  priority_score INTEGER,
  status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'ignored'
  first_triggered_at TIMESTAMPTZ DEFAULT NOW(),
  last_sent_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_alerts_business ON alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts(level);

-- ─── 8. PROFILES (User metadata) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'owner', -- 'founder', 'owner', 'accountant', 'member'
  locale TEXT DEFAULT 'en', -- 'en' or 'fr'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);

-- ─── 9. BUSINESS_USERS (Multi-user access) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'owner', 'admin', 'accountant', 'viewer'
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_users_business ON business_users(business_id);
CREATE INDEX IF NOT EXISTS idx_business_users_user ON business_users(user_id);

-- ─── 10. SAVINGS EVENTS (Recovery Tracking) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS savings_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  detected_leak_id UUID REFERENCES detected_leaks(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  period_start DATE,
  period_end DATE,
  source TEXT DEFAULT 'self_reported', -- 'self_reported', 'linked_account', 'estimated'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_events_business ON savings_events(business_id);

COMMENT ON TABLE savings_events IS 'Track money recovered by fixing leaks';

-- ─── 11. QUEBEC BENCHMARK DATA ──────────────────────────────────────────────
-- Seed Quebec benchmarks for key industries

-- Barber shops
INSERT INTO industry_benchmarks (industry_slug, province, metric_key, metric_unit, p50, p75, p90, sample_size, valid_from)
VALUES
  ('barber_shop', 'QC', 'processing_rate', '%', 2.20, 2.60, 2.90, 150, NOW()),
  ('barber_shop', 'QC', 'rent_ratio', '%', 0.25, 0.35, 0.45, 150, NOW()),
  ('barber_shop', 'QC', 'chair_rent_ratio', '%', 0.40, 0.50, 0.60, 100, NOW())
ON CONFLICT (industry_slug, province, metric_key, valid_from) DO NOTHING;

-- Restaurants
INSERT INTO industry_benchmarks (industry_slug, province, metric_key, metric_unit, p50, p75, p90, sample_size, valid_from)
VALUES
  ('restaurant', 'QC', 'processing_rate', '%', 2.50, 2.90, 3.20, 300, NOW()),
  ('restaurant', 'QC', 'rent_ratio', '%', 0.08, 0.12, 0.18, 300, NOW()),
  ('restaurant', 'QC', 'labor_ratio', '%', 0.30, 0.35, 0.42, 300, NOW()),
  ('restaurant', 'QC', 'cogs_ratio', '%', 0.28, 0.32, 0.38, 300, NOW())
ON CONFLICT (industry_slug, province, metric_key, valid_from) DO NOTHING;

-- Rideshare drivers (Uber/Lyft)
INSERT INTO industry_benchmarks (industry_slug, province, metric_key, metric_unit, p50, p75, p90, sample_size, valid_from)
VALUES
  ('rideshare_driver', 'QC', 'processing_rate', '%', 0.00, 0.00, 0.00, 200, NOW()),
  ('rideshare_driver', 'QC', 'fuel_efficiency', '$/km', 0.15, 0.20, 0.25, 200, NOW()),
  ('rideshare_driver', 'QC', 'insurance_monthly', '$', 200, 280, 350, 200, NOW()),
  ('rideshare_driver', 'QC', 'vehicle_maintenance_ratio', '%', 0.10, 0.15, 0.22, 200, NOW())
ON CONFLICT (industry_slug, province, metric_key, valid_from) DO NOTHING;

-- Trucking
INSERT INTO industry_benchmarks (industry_slug, province, metric_key, metric_unit, p50, p75, p90, sample_size, valid_from)
VALUES
  ('trucking', 'QC', 'processing_rate', '%', 2.00, 2.40, 2.80, 100, NOW()),
  ('trucking', 'QC', 'fuel_cost_ratio', '%', 0.25, 0.30, 0.35, 100, NOW()),
  ('trucking', 'QC', 'insurance_ratio', '%', 0.05, 0.08, 0.12, 100, NOW()),
  ('trucking', 'QC', 'maintenance_ratio', '%', 0.08, 0.12, 0.18, 100, NOW())
ON CONFLICT (industry_slug, province, metric_key, valid_from) DO NOTHING;

-- Generic small business (fallback)
INSERT INTO industry_benchmarks (industry_slug, province, metric_key, metric_unit, p50, p75, p90, sample_size, valid_from)
VALUES
  ('generic_small_business', 'QC', 'processing_rate', '%', 2.30, 2.70, 3.00, 500, NOW()),
  ('generic_small_business', 'QC', 'rent_ratio', '%', 0.10, 0.15, 0.22, 500, NOW()),
  ('generic_small_business', 'QC', 'overhead_ratio', '%', 0.20, 0.28, 0.38, 500, NOW())
ON CONFLICT (industry_slug, province, metric_key, valid_from) DO NOTHING;

-- Cafe/Coffee shop
INSERT INTO industry_benchmarks (industry_slug, province, metric_key, metric_unit, p50, p75, p90, sample_size, valid_from)
VALUES
  ('cafe_coffee_shop', 'QC', 'processing_rate', '%', 2.40, 2.80, 3.10, 120, NOW()),
  ('cafe_coffee_shop', 'QC', 'rent_ratio', '%', 0.12, 0.18, 0.25, 120, NOW()),
  ('cafe_coffee_shop', 'QC', 'cogs_ratio', '%', 0.25, 0.30, 0.38, 120, NOW())
ON CONFLICT (industry_slug, province, metric_key, valid_from) DO NOTHING;

-- ─── 12. FUNCTIONS & TRIGGERS ───────────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
DROP TRIGGER IF EXISTS update_prescan_sessions_updated_at ON prescan_sessions;
CREATE TRIGGER update_prescan_sessions_updated_at
  BEFORE UPDATE ON prescan_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_detected_leaks_updated_at ON detected_leaks;
CREATE TRIGGER update_detected_leaks_updated_at
  BEFORE UPDATE ON detected_leaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── 13. ROW LEVEL SECURITY (RLS) ───────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE prescan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescan_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_leaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leak_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_events ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
-- (Note: These assume Supabase auth.uid() function exists)

CREATE POLICY "Users can view their own prescan sessions" ON prescan_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescan sessions" ON prescan_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view prescans for their businesses" ON prescan_runs
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM business_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view leaks for their businesses" ON detected_leaks
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM business_users WHERE user_id = auth.uid()
    )
  );

-- Similar policies for other tables...

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'prescan_sessions', 'prescan_runs', 'leak_types', 'detected_leaks',
  'leak_actions', 'financial_snapshots', 'alerts', 'profiles',
  'business_users', 'savings_events'
)
ORDER BY table_name;

-- Check Quebec benchmarks loaded
SELECT industry_slug, COUNT(*) as metric_count
FROM industry_benchmarks
WHERE province = 'QC'
GROUP BY industry_slug
ORDER BY industry_slug;

-- Check leak types
SELECT code, name, category FROM leak_types ORDER BY id;
