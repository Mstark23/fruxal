-- ============================================================================
-- 059: PHASE 2 - FINANCIAL OS DASHBOARD TABLES
-- ============================================================================
-- Extends the foundation with:
-- - Cost categories reference table
-- - Snapshot cost breakdown (per-category costs per month)
-- - Raw transactions (normalized staging from all sources)
-- - Transaction category mappings (auto-classification rules)
-- - Extended financial_snapshots columns
-- - Subscription status tracking
-- ============================================================================

-- ─── 1. COST CATEGORIES (Reference Table) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS cost_categories (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  label_en TEXT NOT NULL,
  label_fr TEXT NOT NULL,
  icon TEXT DEFAULT '💧',
  benchmark_metric_key TEXT, -- links to industry_benchmarks.metric_key
  display_order INTEGER DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO cost_categories (code, label_en, label_fr, icon, benchmark_metric_key, display_order) VALUES
  ('revenue',          'Revenue',              'Revenus',              '💰', NULL, 0),
  ('cogs',             'Cost of Goods Sold',   'Coût des marchandises','📦', 'cogs_ratio', 1),
  ('rent',             'Rent / Occupancy',     'Loyer / Occupation',   '🏠', 'rent_ratio', 2),
  ('payroll',          'Payroll & Staff',       'Salaires & Personnel', '👥', 'labor_ratio', 3),
  ('processing_fees',  'Processing Fees',       'Frais de traitement',  '💳', 'processing_rate', 4),
  ('insurance',        'Insurance',             'Assurance',            '🛡️', 'insurance_ratio', 5),
  ('fuel_vehicle',     'Fuel & Vehicle',        'Carburant & Véhicule', '⛽', 'fuel_cost_ratio', 6),
  ('software',         'Software & Subscriptions','Logiciels & Abonnements','💻', NULL, 7),
  ('marketing',        'Marketing & Advertising','Marketing & Publicité','📣', NULL, 8),
  ('utilities',        'Utilities',             'Services publics',     '⚡', NULL, 9),
  ('professional_fees','Professional Fees',     'Honoraires professionnels','📋', NULL, 10),
  ('other',            'Other Expenses',        'Autres dépenses',      '📎', NULL, 99)
ON CONFLICT (code) DO NOTHING;

-- ─── 2. EXTEND FINANCIAL_SNAPSHOTS ──────────────────────────────────────────
-- Add columns if they don't exist (safe for re-runs)

DO $$ 
BEGIN
  -- Revenue details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_revenue') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_revenue NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_cogs') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_cogs NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_operating_expenses') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_operating_expenses NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_processing_fees') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_processing_fees NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_payroll') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_payroll NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_rent') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_rent NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_software_subs') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_software_subs NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_insurance') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_insurance NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_fuel_vehicle') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_fuel_vehicle NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='total_marketing') THEN
    ALTER TABLE financial_snapshots ADD COLUMN total_marketing NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='net_profit') THEN
    ALTER TABLE financial_snapshots ADD COLUMN net_profit NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='gross_margin_pct') THEN
    ALTER TABLE financial_snapshots ADD COLUMN gross_margin_pct NUMERIC(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='net_margin_pct') THEN
    ALTER TABLE financial_snapshots ADD COLUMN net_margin_pct NUMERIC(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='operating_margin_pct') THEN
    ALTER TABLE financial_snapshots ADD COLUMN operating_margin_pct NUMERIC(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='revenue_per_employee') THEN
    ALTER TABLE financial_snapshots ADD COLUMN revenue_per_employee NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='revenue_volatility_score') THEN
    ALTER TABLE financial_snapshots ADD COLUMN revenue_volatility_score NUMERIC(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='snapshot_month') THEN
    ALTER TABLE financial_snapshots ADD COLUMN snapshot_month DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_snapshots' AND column_name='employee_count') THEN
    ALTER TABLE financial_snapshots ADD COLUMN employee_count INTEGER DEFAULT 1;
  END IF;
END $$;

-- ─── 3. SNAPSHOT COST BREAKDOWN ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS snapshot_cost_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID REFERENCES financial_snapshots(id) ON DELETE CASCADE,
  category_code TEXT NOT NULL,
  amount NUMERIC(12,2) DEFAULT 0,
  ratio_of_revenue NUMERIC(5,4) DEFAULT 0,
  benchmark_p50 NUMERIC(5,4),
  benchmark_p75 NUMERIC(5,4),
  deviation_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshot_costs_snapshot ON snapshot_cost_breakdown(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_costs_category ON snapshot_cost_breakdown(category_code);

-- ─── 4. RAW TRANSACTIONS (Staging Area) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS raw_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  data_source_code TEXT DEFAULT 'manual_upload',
  external_id TEXT,
  txn_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  description TEXT,
  raw_category TEXT,
  mapped_category_code TEXT, -- resolved category after mapping
  direction TEXT NOT NULL CHECK (direction IN ('inflow', 'outflow')),
  is_mapped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, external_id, data_source_code)
);

CREATE INDEX IF NOT EXISTS idx_raw_txn_business ON raw_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_raw_txn_date ON raw_transactions(txn_date);
CREATE INDEX IF NOT EXISTS idx_raw_txn_direction ON raw_transactions(direction);
CREATE INDEX IF NOT EXISTS idx_raw_txn_mapped ON raw_transactions(is_mapped);

-- ─── 5. TRANSACTION CATEGORY MAPPINGS (Auto-Classification Rules) ───────────
CREATE TABLE IF NOT EXISTS transaction_category_mappings (
  id SERIAL PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  matcher_type TEXT NOT NULL CHECK (matcher_type IN ('contains', 'equals', 'regex')),
  matcher_value TEXT NOT NULL,
  mapped_category_code TEXT NOT NULL,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_txn_mappings_business ON transaction_category_mappings(business_id);

-- Insert global default mappings
INSERT INTO transaction_category_mappings (business_id, matcher_type, matcher_value, mapped_category_code, is_global) VALUES
  (NULL, 'contains', 'PAYROLL', 'payroll', true),
  (NULL, 'contains', 'SALARY', 'payroll', true),
  (NULL, 'contains', 'RENT', 'rent', true),
  (NULL, 'contains', 'LOYER', 'rent', true),
  (NULL, 'contains', 'INSURANCE', 'insurance', true),
  (NULL, 'contains', 'ASSURANCE', 'insurance', true),
  (NULL, 'contains', 'STRIPE', 'processing_fees', true),
  (NULL, 'contains', 'SQUARE', 'processing_fees', true),
  (NULL, 'contains', 'MONERIS', 'processing_fees', true),
  (NULL, 'contains', 'HYDRO', 'utilities', true),
  (NULL, 'contains', 'BELL', 'utilities', true),
  (NULL, 'contains', 'VIDEOTRON', 'utilities', true),
  (NULL, 'contains', 'PETRO', 'fuel_vehicle', true),
  (NULL, 'contains', 'SHELL', 'fuel_vehicle', true),
  (NULL, 'contains', 'ESSO', 'fuel_vehicle', true),
  (NULL, 'contains', 'ULTRAMAR', 'fuel_vehicle', true),
  (NULL, 'contains', 'GOOGLE ADS', 'marketing', true),
  (NULL, 'contains', 'FACEBOOK ADS', 'marketing', true),
  (NULL, 'contains', 'META ADS', 'marketing', true),
  (NULL, 'contains', 'QUICKBOOKS', 'software', true),
  (NULL, 'contains', 'SHOPIFY', 'software', true),
  (NULL, 'contains', 'CANVA', 'software', true),
  (NULL, 'contains', 'ADOBE', 'software', true)
ON CONFLICT DO NOTHING;

-- ─── 6. DATA SOURCE CONNECTIONS (Extended) ──────────────────────────────────
-- Extend existing data_sources if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='data_sources' AND column_name='category') THEN
    ALTER TABLE data_sources ADD COLUMN category TEXT DEFAULT 'other';
  END IF;
END $$;

-- ─── 7. EXTEND ALERTS TABLE ────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='message_en') THEN
    ALTER TABLE alerts ADD COLUMN message_en TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='message_fr') THEN
    ALTER TABLE alerts ADD COLUMN message_fr TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='snapshot_id') THEN
    ALTER TABLE alerts ADD COLUMN snapshot_id UUID REFERENCES financial_snapshots(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─── 8. ADD MORE LEAK TYPES FOR LIVE MONITORING ────────────────────────────
INSERT INTO leak_types (code, name, category, description, severity, module_key) VALUES
  ('payroll_ratio_high', 'Payroll Costs Above Benchmark', 'payroll',
   'Your payroll ratio exceeds the benchmark for similar businesses.', 'medium', 'payroll'),
  ('software_bloat', 'Software Subscription Bloat', 'subscriptions',
   'Your SaaS spending is above average for your revenue level.', 'low', 'software'),
  ('low_margin', 'Low Profit Margin', 'other',
   'Your net margin is below the benchmark median for your industry.', 'high', 'margin'),
  ('revenue_instability', 'Revenue Instability', 'other',
   'Your revenue has high month-to-month variance, increasing financial risk.', 'medium', 'revenue'),
  ('insurance_cost_high', 'Insurance Premiums Too High', 'insurance',
   'Your insurance costs exceed the benchmark. Shopping rates annually could save money.', 'medium', 'insurance'),
  ('fuel_cost_high', 'Fuel/Vehicle Costs High', 'fuel',
   'Your fuel and vehicle costs are above benchmark. Route optimization or fuel cards may help.', 'medium', 'fuel'),
  ('marketing_overspend', 'Marketing Overspend', 'other',
   'Your marketing costs are high relative to revenue with unclear ROI.', 'low', 'marketing')
ON CONFLICT (code) DO NOTHING;

-- ─── 9. ADD MORE BENCHMARK DATA FOR NET MARGINS ────────────────────────────
INSERT INTO industry_benchmarks (industry_slug, province, metric_key, metric_unit, p50, p75, p90, sample_size, valid_from) VALUES
  ('barber_shop', 'QC', 'net_margin', '%', 0.15, 0.22, 0.30, 150, NOW()),
  ('barber_shop', 'QC', 'payroll_ratio', '%', 0.35, 0.45, 0.55, 150, NOW()),
  ('restaurant', 'QC', 'net_margin', '%', 0.05, 0.10, 0.15, 300, NOW()),
  ('rideshare_driver', 'QC', 'net_margin', '%', 0.20, 0.30, 0.40, 200, NOW()),
  ('trucking', 'QC', 'net_margin', '%', 0.08, 0.12, 0.18, 100, NOW()),
  ('generic_small_business', 'QC', 'net_margin', '%', 0.08, 0.15, 0.22, 500, NOW()),
  ('generic_small_business', 'QC', 'payroll_ratio', '%', 0.30, 0.38, 0.48, 500, NOW()),
  ('generic_small_business', 'QC', 'insurance_ratio', '%', 0.03, 0.05, 0.08, 500, NOW()),
  ('generic_small_business', 'QC', 'software_ratio', '%', 0.02, 0.04, 0.07, 500, NOW()),
  ('cafe_coffee_shop', 'QC', 'net_margin', '%', 0.06, 0.12, 0.18, 120, NOW()),
  ('cafe_coffee_shop', 'QC', 'payroll_ratio', '%', 0.28, 0.35, 0.42, 120, NOW())
ON CONFLICT (industry_slug, province, metric_key, valid_from) DO NOTHING;

-- ─── DONE ───────────────────────────────────────────────────────────────────
-- Verify
SELECT 'Phase 2 tables ready' AS status;
SELECT COUNT(*) AS cost_categories FROM cost_categories;
SELECT COUNT(*) AS global_mappings FROM transaction_category_mappings WHERE is_global = true;
SELECT COUNT(*) AS leak_types FROM leak_types;
SELECT COUNT(*) AS benchmarks FROM industry_benchmarks WHERE province = 'QC';
