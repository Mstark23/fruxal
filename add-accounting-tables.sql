-- =============================================================================
-- ACCOUNTING FIRM ENGINE — 8 Tables
-- =============================================================================
-- Benchmarks: AICPA MAP Survey 2025, Rosenberg Survey 2025, CPA.com CAS 2024
-- =============================================================================

-- 1. Engagements
CREATE TABLE IF NOT EXISTS acct_engagements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_name TEXT NOT NULL,
  engagement_type TEXT NOT NULL,
  service_line TEXT NOT NULL,
  fee_type TEXT DEFAULT 'fixed',
  quoted_fee NUMERIC NOT NULL,
  actual_fee NUMERIC DEFAULT 0,
  write_off NUMERIC DEFAULT 0,
  write_off_pct NUMERIC DEFAULT 0,
  budgeted_hours NUMERIC NOT NULL,
  actual_hours NUMERIC DEFAULT 0,
  realization_pct NUMERIC DEFAULT 100,
  status TEXT DEFAULT 'in_progress',
  due_date DATE,
  completed_date DATE,
  days_over_deadline INTEGER DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  fiscal_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, client_name, engagement_type, fiscal_year)
);

-- 2. Time Tracking
CREATE TABLE IF NOT EXISTS acct_time_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  staff_name TEXT NOT NULL,
  staff_role TEXT NOT NULL,
  engagement_id TEXT REFERENCES acct_engagements(id),
  entry_date DATE NOT NULL,
  billable_hours NUMERIC DEFAULT 0,
  non_billable_hours NUMERIC DEFAULT 0,
  total_hours NUMERIC DEFAULT 0,
  billing_rate NUMERIC DEFAULT 0,
  standard_rate NUMERIC DEFAULT 0,
  billed_amount NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Billing & Invoicing
CREATE TABLE IF NOT EXISTS acct_billing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_billings NUMERIC NOT NULL,
  total_collections NUMERIC NOT NULL,
  write_offs NUMERIC DEFAULT 0,
  write_off_pct NUMERIC DEFAULT 0,
  wip_balance NUMERIC DEFAULT 0,
  realization_rate NUMERIC DEFAULT 0,
  collection_rate NUMERIC DEFAULT 0,
  avg_days_to_bill NUMERIC DEFAULT 0,
  avg_days_to_collect NUMERIC DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 4. Clients
CREATE TABLE IF NOT EXISTS acct_clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_name TEXT NOT NULL,
  client_type TEXT DEFAULT 'business',
  industry TEXT,
  annual_fees NUMERIC DEFAULT 0,
  lifetime_value NUMERIC DEFAULT 0,
  client_since DATE,
  is_active BOOLEAN DEFAULT true,
  services_count INTEGER DEFAULT 1,
  referral_source TEXT,
  satisfaction_score NUMERIC DEFAULT 0,
  nps_score INTEGER DEFAULT 0,
  last_engagement_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  monthly_recurring_fee NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, client_name)
);

-- 5. Staff & Capacity
CREATE TABLE IF NOT EXISTS acct_staff (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL,
  hire_date DATE,
  annual_salary NUMERIC DEFAULT 0,
  billing_rate NUMERIC DEFAULT 0,
  cost_rate NUMERIC DEFAULT 0,
  available_hours NUMERIC DEFAULT 2080,
  billable_target_pct NUMERIC DEFAULT 60,
  actual_billable_pct NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  revenue_per_fte NUMERIC DEFAULT 0,
  is_cpa BOOLEAN DEFAULT false,
  certifications TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, staff_name)
);

-- 6. Overhead & Profitability
CREATE TABLE IF NOT EXISTS acct_overhead (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC NOT NULL,
  total_compensation NUMERIC NOT NULL,
  partner_compensation NUMERIC DEFAULT 0,
  staff_compensation NUMERIC DEFAULT 0,
  benefits_cost NUMERIC DEFAULT 0,
  office_rent NUMERIC DEFAULT 0,
  technology_software NUMERIC DEFAULT 0,
  insurance NUMERIC DEFAULT 0,
  cpe_training NUMERIC DEFAULT 0,
  marketing NUMERIC DEFAULT 0,
  professional_dues NUMERIC DEFAULT 0,
  outsourcing_cost NUMERIC DEFAULT 0,
  other_overhead NUMERIC DEFAULT 0,
  total_overhead NUMERIC DEFAULT 0,
  overhead_pct NUMERIC DEFAULT 0,
  net_income NUMERIC DEFAULT 0,
  net_margin_pct NUMERIC DEFAULT 0,
  net_per_partner NUMERIC DEFAULT 0,
  revenue_per_fte NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 7. AR Aging
CREATE TABLE IF NOT EXISTS acct_ar_aging (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_ar NUMERIC NOT NULL,
  current_0_30 NUMERIC DEFAULT 0,
  aging_31_60 NUMERIC DEFAULT 0,
  aging_61_90 NUMERIC DEFAULT 0,
  aging_91_120 NUMERIC DEFAULT 0,
  aging_over_120 NUMERIC DEFAULT 0,
  dso_days NUMERIC DEFAULT 0,
  pct_over_90 NUMERIC DEFAULT 0,
  total_wip NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- 8. Service Line Performance
CREATE TABLE IF NOT EXISTS acct_service_lines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  fiscal_year INTEGER NOT NULL,
  service_line TEXT NOT NULL,
  revenue NUMERIC DEFAULT 0,
  revenue_pct_of_total NUMERIC DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  avg_fee NUMERIC DEFAULT 0,
  avg_realization NUMERIC DEFAULT 0,
  avg_hours NUMERIC DEFAULT 0,
  effective_rate NUMERIC DEFAULT 0,
  client_count INTEGER DEFAULT 0,
  yoy_growth_pct NUMERIC DEFAULT 0,
  margin_pct NUMERIC DEFAULT 0,
  is_growing BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, fiscal_year, service_line)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_acct_eng_biz ON acct_engagements(business_id);
CREATE INDEX IF NOT EXISTS idx_acct_time_biz ON acct_time_entries(business_id);
CREATE INDEX IF NOT EXISTS idx_acct_bill_biz ON acct_billing(business_id);
CREATE INDEX IF NOT EXISTS idx_acct_client_biz ON acct_clients(business_id);
CREATE INDEX IF NOT EXISTS idx_acct_staff_biz ON acct_staff(business_id);
CREATE INDEX IF NOT EXISTS idx_acct_oh_biz ON acct_overhead(business_id);
CREATE INDEX IF NOT EXISTS idx_acct_ar_biz ON acct_ar_aging(business_id);
CREATE INDEX IF NOT EXISTS idx_acct_sl_biz ON acct_service_lines(business_id);

-- Disable RLS
ALTER TABLE acct_engagements DISABLE ROW LEVEL SECURITY;
ALTER TABLE acct_time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE acct_billing DISABLE ROW LEVEL SECURITY;
ALTER TABLE acct_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE acct_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE acct_overhead DISABLE ROW LEVEL SECURITY;
ALTER TABLE acct_ar_aging DISABLE ROW LEVEL SECURITY;
ALTER TABLE acct_service_lines DISABLE ROW LEVEL SECURITY;
