-- =============================================================================
-- AGENCY ENGINE — 8 Tables (Marketing / Creative / Digital)
-- =============================================================================
-- Benchmarks: Promethean Research, TMetric 2025, Ignition 2025, Parakeeto,
--             Predictable Profits, Focus Digital 2026
-- =============================================================================

-- 1. Clients
CREATE TABLE IF NOT EXISTS agency_clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_name TEXT NOT NULL,
  industry TEXT,
  client_type TEXT DEFAULT 'retainer', -- retainer, project, hybrid
  monthly_retainer NUMERIC DEFAULT 0,
  annual_revenue NUMERIC NOT NULL,
  agi_annual NUMERIC DEFAULT 0, -- after pass-through costs
  pass_through_spend NUMERIC DEFAULT 0, -- ad spend, print, etc.
  client_since DATE,
  contract_end_date DATE,
  nps_score INTEGER,
  satisfaction_score NUMERIC DEFAULT 0, -- 1-10
  lifetime_value NUMERIC DEFAULT 0,
  acquisition_cost NUMERIC DEFAULT 0,
  ltv_cac_ratio NUMERIC DEFAULT 0,
  referral_source TEXT,
  is_at_risk BOOLEAN DEFAULT false,
  churned BOOLEAN DEFAULT false,
  churn_date DATE,
  churn_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, client_name)
);

-- 2. Projects
CREATE TABLE IF NOT EXISTS agency_projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_id TEXT REFERENCES agency_clients(id),
  project_name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- seo, ppc, social, content, web_design, branding, strategy, email
  pricing_model TEXT DEFAULT 'fixed', -- fixed, hourly, retainer, value_based
  quoted_amount NUMERIC NOT NULL,
  actual_amount NUMERIC DEFAULT 0,
  pass_through_cost NUMERIC DEFAULT 0,
  agi NUMERIC DEFAULT 0,
  budgeted_hours NUMERIC NOT NULL,
  actual_hours NUMERIC DEFAULT 0,
  delivery_margin_pct NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, completed, overdue, on_hold
  start_date DATE,
  deadline DATE,
  completed_date DATE,
  days_over_deadline INTEGER DEFAULT 0,
  scope_changes INTEGER DEFAULT 0,
  scope_creep_hours NUMERIC DEFAULT 0,
  scope_creep_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, project_name)
);

-- 3. Staff & Utilization
CREATE TABLE IF NOT EXISTS agency_staff (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL, -- creative_director, account_manager, designer, developer, copywriter, strategist, media_buyer, project_manager, admin
  department TEXT, -- creative, strategy, account, development, admin
  annual_salary NUMERIC NOT NULL,
  fully_loaded_cost NUMERIC NOT NULL, -- salary + benefits + taxes + overhead allocation
  billable_rate NUMERIC DEFAULT 0,
  cost_per_hour NUMERIC DEFAULT 0,
  available_hours_annual NUMERIC DEFAULT 1800,
  billable_hours_ytd NUMERIC DEFAULT 0,
  non_billable_hours_ytd NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  delivery_utilization_pct NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  is_billable BOOLEAN DEFAULT true,
  tenure_years NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, staff_name)
);

-- 4. Billing & Cash Flow
CREATE TABLE IF NOT EXISTS agency_billing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC NOT NULL,
  pass_through_revenue NUMERIC DEFAULT 0,
  agi NUMERIC DEFAULT 0,
  total_billed NUMERIC NOT NULL,
  total_collected NUMERIC DEFAULT 0,
  collection_rate_pct NUMERIC DEFAULT 0,
  late_payments NUMERIC DEFAULT 0,
  late_payment_pct NUMERIC DEFAULT 0,
  avg_days_to_pay NUMERIC DEFAULT 0,
  dso_days NUMERIC DEFAULT 0,
  wip_balance NUMERIC DEFAULT 0,
  retainer_revenue NUMERIC DEFAULT 0,
  project_revenue NUMERIC DEFAULT 0,
  recurring_pct NUMERIC DEFAULT 0,
  mrr NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 5. Scope Changes
CREATE TABLE IF NOT EXISTS agency_scope_changes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  project_id TEXT REFERENCES agency_projects(id),
  change_description TEXT,
  requested_by TEXT DEFAULT 'client', -- client, internal
  additional_hours NUMERIC DEFAULT 0,
  additional_cost NUMERIC DEFAULT 0,
  was_billed BOOLEAN DEFAULT false,
  billed_amount NUMERIC DEFAULT 0,
  recovery_pct NUMERIC DEFAULT 0,
  approved_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Overhead & Profitability
CREATE TABLE IF NOT EXISTS agency_overhead (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC NOT NULL,
  agi NUMERIC NOT NULL,
  total_delivery_cost NUMERIC NOT NULL,
  delivery_margin NUMERIC DEFAULT 0,
  delivery_margin_pct NUMERIC DEFAULT 0,
  total_overhead NUMERIC NOT NULL,
  overhead_pct_of_agi NUMERIC DEFAULT 0,
  office_rent NUMERIC DEFAULT 0,
  software_tools NUMERIC DEFAULT 0,
  software_pct NUMERIC DEFAULT 0,
  insurance NUMERIC DEFAULT 0,
  marketing_biz_dev NUMERIC DEFAULT 0,
  admin_salaries NUMERIC DEFAULT 0,
  training NUMERIC DEFAULT 0,
  other_overhead NUMERIC DEFAULT 0,
  net_income NUMERIC DEFAULT 0,
  net_margin_pct NUMERIC DEFAULT 0,
  revenue_per_fte NUMERIC DEFAULT 0,
  agi_per_fte NUMERIC DEFAULT 0,
  fte_count NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 7. Pipeline & New Business
CREATE TABLE IF NOT EXISTS agency_pipeline (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  proposals_sent INTEGER DEFAULT 0,
  proposals_won INTEGER DEFAULT 0,
  win_rate_pct NUMERIC DEFAULT 0,
  avg_deal_size NUMERIC DEFAULT 0,
  pipeline_value NUMERIC DEFAULT 0,
  new_clients_added INTEGER DEFAULT 0,
  clients_churned INTEGER DEFAULT 0,
  net_client_change INTEGER DEFAULT 0,
  churn_rate_pct NUMERIC DEFAULT 0,
  retention_rate_pct NUMERIC DEFAULT 0,
  revenue_churned NUMERIC DEFAULT 0,
  revenue_expanded NUMERIC DEFAULT 0,
  net_revenue_retention_pct NUMERIC DEFAULT 0,
  avg_client_tenure_months NUMERIC DEFAULT 0,
  cac NUMERIC DEFAULT 0,
  biz_dev_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 8. Service Lines
CREATE TABLE IF NOT EXISTS agency_service_lines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL, -- strategy, creative, media, development, content, analytics
  annual_revenue NUMERIC DEFAULT 0,
  annual_agi NUMERIC DEFAULT 0,
  revenue_pct_of_total NUMERIC DEFAULT 0,
  project_count INTEGER DEFAULT 0,
  avg_project_fee NUMERIC DEFAULT 0,
  avg_delivery_margin_pct NUMERIC DEFAULT 0,
  avg_hours_per_project NUMERIC DEFAULT 0,
  effective_hourly_rate NUMERIC DEFAULT 0,
  scope_creep_pct NUMERIC DEFAULT 0,
  client_satisfaction_avg NUMERIC DEFAULT 0,
  growth_rate_yoy NUMERIC DEFAULT 0,
  is_specialization BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, service_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agency_clients_biz ON agency_clients(business_id);
CREATE INDEX IF NOT EXISTS idx_agency_projects_biz ON agency_projects(business_id);
CREATE INDEX IF NOT EXISTS idx_agency_staff_biz ON agency_staff(business_id);
CREATE INDEX IF NOT EXISTS idx_agency_billing_biz ON agency_billing(business_id);
CREATE INDEX IF NOT EXISTS idx_agency_scope_biz ON agency_scope_changes(business_id);
CREATE INDEX IF NOT EXISTS idx_agency_oh_biz ON agency_overhead(business_id);
CREATE INDEX IF NOT EXISTS idx_agency_pipe_biz ON agency_pipeline(business_id);
CREATE INDEX IF NOT EXISTS idx_agency_sl_biz ON agency_service_lines(business_id);

-- Disable RLS
ALTER TABLE agency_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_billing DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_scope_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_overhead DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_pipeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_service_lines DISABLE ROW LEVEL SECURITY;
