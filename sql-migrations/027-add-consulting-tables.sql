-- =============================================================================
-- CONSULTING FIRM ENGINE — 8 Tables
-- =============================================================================
-- Benchmarks: SPI 2025, Deltek, Consultancy BenchPress 2024, Cinode 2026
-- =============================================================================

-- 1. Clients
CREATE TABLE IF NOT EXISTS consult_clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_name TEXT NOT NULL,
  industry TEXT,
  client_type TEXT DEFAULT 'retainer', -- retainer, project, advisory
  annual_revenue NUMERIC NOT NULL,
  lifetime_value NUMERIC DEFAULT 0,
  client_since DATE,
  satisfaction_score NUMERIC DEFAULT 0,
  nps_score INTEGER,
  acquisition_cost NUMERIC DEFAULT 0,
  ltv_cac_ratio NUMERIC DEFAULT 0,
  referral_source TEXT,
  engagement_count INTEGER DEFAULT 1,
  avg_project_value NUMERIC DEFAULT 0,
  is_repeat BOOLEAN DEFAULT false,
  is_at_risk BOOLEAN DEFAULT false,
  churned BOOLEAN DEFAULT false,
  churn_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, client_name)
);

-- 2. Engagements / Projects
CREATE TABLE IF NOT EXISTS consult_engagements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_id TEXT REFERENCES consult_clients(id),
  engagement_name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- strategy, operations, technology, change_mgmt, hr, financial_advisory, implementation
  pricing_model TEXT DEFAULT 'fixed', -- fixed, time_material, retainer, value_based, milestone
  contract_value NUMERIC NOT NULL,
  actual_revenue NUMERIC DEFAULT 0,
  budgeted_hours NUMERIC NOT NULL,
  actual_hours NUMERIC DEFAULT 0,
  budgeted_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  gross_margin_pct NUMERIC DEFAULT 0,
  delivery_margin_pct NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, completed, overdue, on_hold, cancelled
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  days_over_schedule INTEGER DEFAULT 0,
  scope_changes INTEGER DEFAULT 0,
  scope_change_value NUMERIC DEFAULT 0,
  client_satisfaction NUMERIC DEFAULT 0,
  team_size INTEGER DEFAULT 1,
  leverage_ratio NUMERIC DEFAULT 0, -- junior:senior
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, engagement_name)
);

-- 3. Consultants / Staff
CREATE TABLE IF NOT EXISTS consult_staff (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL, -- partner, principal, senior_manager, manager, senior_consultant, consultant, analyst, admin
  practice_area TEXT,
  annual_salary NUMERIC NOT NULL,
  fully_loaded_cost NUMERIC NOT NULL,
  standard_billing_rate NUMERIC DEFAULT 0,
  effective_billing_rate NUMERIC DEFAULT 0,
  available_hours NUMERIC DEFAULT 1800,
  billable_hours_ytd NUMERIC DEFAULT 0,
  non_billable_hours_ytd NUMERIC DEFAULT 0,
  bench_hours_ytd NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  revenue_per_consultant NUMERIC DEFAULT 0,
  chargeability_pct NUMERIC DEFAULT 0,
  is_billable BOOLEAN DEFAULT true,
  tenure_years NUMERIC DEFAULT 0,
  attrition_risk TEXT DEFAULT 'low', -- low, medium, high
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, staff_name)
);

-- 4. Billing & Collections
CREATE TABLE IF NOT EXISTS consult_billing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_billed NUMERIC NOT NULL,
  total_collected NUMERIC DEFAULT 0,
  write_offs NUMERIC DEFAULT 0,
  write_off_pct NUMERIC DEFAULT 0,
  wip_balance NUMERIC DEFAULT 0,
  realization_rate NUMERIC DEFAULT 0,
  collection_rate NUMERIC DEFAULT 0,
  dso_days NUMERIC DEFAULT 0,
  avg_billing_rate NUMERIC DEFAULT 0,
  effective_rate NUMERIC DEFAULT 0,
  retainer_revenue NUMERIC DEFAULT 0,
  project_revenue NUMERIC DEFAULT 0,
  recurring_pct NUMERIC DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  invoices_overdue INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 5. Overhead & Profitability
CREATE TABLE IF NOT EXISTS consult_overhead (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC NOT NULL,
  cost_of_delivery NUMERIC NOT NULL,
  gross_margin NUMERIC DEFAULT 0,
  gross_margin_pct NUMERIC DEFAULT 0,
  total_overhead NUMERIC NOT NULL,
  overhead_pct NUMERIC DEFAULT 0,
  office_rent NUMERIC DEFAULT 0,
  technology NUMERIC DEFAULT 0,
  travel_expenses NUMERIC DEFAULT 0,
  insurance NUMERIC DEFAULT 0,
  marketing_biz_dev NUMERIC DEFAULT 0,
  training_development NUMERIC DEFAULT 0,
  admin_cost NUMERIC DEFAULT 0,
  subcontractor_cost NUMERIC DEFAULT 0,
  subcontractor_pct NUMERIC DEFAULT 0,
  ebitda NUMERIC DEFAULT 0,
  ebitda_margin_pct NUMERIC DEFAULT 0,
  net_income NUMERIC DEFAULT 0,
  net_margin_pct NUMERIC DEFAULT 0,
  revenue_per_fte NUMERIC DEFAULT 0,
  revenue_per_consultant NUMERIC DEFAULT 0,
  income_per_partner NUMERIC DEFAULT 0,
  fte_count NUMERIC DEFAULT 1,
  partner_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 6. Pipeline & Business Development
CREATE TABLE IF NOT EXISTS consult_pipeline (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  proposals_submitted INTEGER DEFAULT 0,
  proposals_won INTEGER DEFAULT 0,
  win_rate_pct NUMERIC DEFAULT 0,
  pipeline_value NUMERIC DEFAULT 0,
  avg_deal_size NUMERIC DEFAULT 0,
  avg_sales_cycle_days NUMERIC DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  repeat_clients_pct NUMERIC DEFAULT 0,
  clients_churned INTEGER DEFAULT 0,
  churn_rate_pct NUMERIC DEFAULT 0,
  retention_rate_pct NUMERIC DEFAULT 0,
  revenue_from_existing_pct NUMERIC DEFAULT 0,
  biz_dev_cost NUMERIC DEFAULT 0,
  cac NUMERIC DEFAULT 0,
  backlog_value NUMERIC DEFAULT 0,
  backlog_months NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 7. Practice Areas / Service Lines
CREATE TABLE IF NOT EXISTS consult_practices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  practice_name TEXT NOT NULL,
  practice_type TEXT NOT NULL, -- strategy, operations, technology, change_mgmt, hr, financial_advisory
  annual_revenue NUMERIC DEFAULT 0,
  revenue_pct NUMERIC DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  avg_engagement_value NUMERIC DEFAULT 0,
  avg_margin_pct NUMERIC DEFAULT 0,
  avg_billing_rate NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  consultant_count INTEGER DEFAULT 0,
  growth_rate_yoy NUMERIC DEFAULT 0,
  client_satisfaction_avg NUMERIC DEFAULT 0,
  is_growing BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, practice_name)
);

-- 8. Workforce & Capacity
CREATE TABLE IF NOT EXISTS consult_workforce (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_fte NUMERIC NOT NULL,
  billable_fte NUMERIC NOT NULL,
  non_billable_fte NUMERIC DEFAULT 0,
  leverage_ratio NUMERIC DEFAULT 0, -- junior:senior
  avg_utilization NUMERIC DEFAULT 0,
  bench_pct NUMERIC DEFAULT 0,
  bench_cost NUMERIC DEFAULT 0,
  attrition_rate NUMERIC DEFAULT 0,
  new_hires INTEGER DEFAULT 0,
  departures INTEGER DEFAULT 0,
  headcount_growth_pct NUMERIC DEFAULT 0,
  avg_tenure_years NUMERIC DEFAULT 0,
  training_hours_per_fte NUMERIC DEFAULT 0,
  training_investment NUMERIC DEFAULT 0,
  subcontractor_pct NUMERIC DEFAULT 0,
  employee_satisfaction NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consult_clients_biz ON consult_clients(business_id);
CREATE INDEX IF NOT EXISTS idx_consult_eng_biz ON consult_engagements(business_id);
CREATE INDEX IF NOT EXISTS idx_consult_staff_biz ON consult_staff(business_id);
CREATE INDEX IF NOT EXISTS idx_consult_bill_biz ON consult_billing(business_id);
CREATE INDEX IF NOT EXISTS idx_consult_oh_biz ON consult_overhead(business_id);
CREATE INDEX IF NOT EXISTS idx_consult_pipe_biz ON consult_pipeline(business_id);
CREATE INDEX IF NOT EXISTS idx_consult_prac_biz ON consult_practices(business_id);
CREATE INDEX IF NOT EXISTS idx_consult_wf_biz ON consult_workforce(business_id);

-- Disable RLS
ALTER TABLE consult_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE consult_engagements DISABLE ROW LEVEL SECURITY;
ALTER TABLE consult_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE consult_billing DISABLE ROW LEVEL SECURITY;
ALTER TABLE consult_overhead DISABLE ROW LEVEL SECURITY;
ALTER TABLE consult_pipeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE consult_practices DISABLE ROW LEVEL SECURITY;
ALTER TABLE consult_workforce DISABLE ROW LEVEL SECURITY;
