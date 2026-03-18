-- =============================================================================
-- APEX LAYER — 15 Tables
-- =============================================================================
-- Module X: Intellectual Property & Knowledge Capital (3 tables)
-- Module Y: Working Capital & Treasury Optimization (3 tables)
-- Module Z: Regulatory & Legal Exposure (3 tables)
-- Module AA: Customer Journey & Lifecycle (3 tables)
-- Module AB: Ecosystem & Integration Economics (3 tables)
-- =============================================================================

-- MODULE X: IP & KNOWLEDGE
CREATE TABLE IF NOT EXISTS ip_portfolio (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  asset_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  registration_status TEXT DEFAULT 'unregistered',
  registration_number TEXT,
  registration_date DATE,
  expiration_date DATE,
  days_until_expiry INTEGER DEFAULT 0,
  renewal_cost NUMERIC DEFAULT 0,
  estimated_value NUMERIC DEFAULT 0,
  protection_level TEXT DEFAULT 'none',
  nda_coverage BOOLEAN DEFAULT false,
  non_compete_coverage BOOLEAN DEFAULT false,
  documented BOOLEAN DEFAULT false,
  accessible_by_count INTEGER DEFAULT 0,
  risk_if_lost TEXT,
  annual_revenue_dependent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, asset_type, name)
);

CREATE TABLE IF NOT EXISTS ip_knowledge (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  knowledge_area TEXT NOT NULL,
  sole_holder TEXT,
  holders_count INTEGER DEFAULT 1,
  criticality TEXT DEFAULT 'medium',
  documented BOOLEAN DEFAULT false,
  documentation_quality TEXT DEFAULT 'none',
  training_exists BOOLEAN DEFAULT false,
  succession_plan BOOLEAN DEFAULT false,
  last_updated DATE,
  revenue_at_risk NUMERIC DEFAULT 0,
  transfer_time_months NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, knowledge_area)
);

CREATE TABLE IF NOT EXISTS ip_brand (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  brand_awareness_score NUMERIC DEFAULT 0,
  brand_sentiment_score NUMERIC DEFAULT 0,
  social_share_of_voice_pct NUMERIC DEFAULT 0,
  competitor_avg_awareness NUMERIC DEFAULT 0,
  domain_value_estimate NUMERIC DEFAULT 0,
  trademark_portfolio_value NUMERIC DEFAULT 0,
  brand_mentions_30d INTEGER DEFAULT 0,
  negative_mentions_pct NUMERIC DEFAULT 0,
  crisis_response_plan BOOLEAN DEFAULT false,
  brand_guidelines_exist BOOLEAN DEFAULT false,
  brand_consistency_score NUMERIC DEFAULT 0,
  reputation_insurance BOOLEAN DEFAULT false,
  impersonation_attempts INTEGER DEFAULT 0,
  counterfeit_detections INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- MODULE Y: TREASURY
CREATE TABLE IF NOT EXISTS treas_cash_cycle (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  days_inventory_outstanding NUMERIC DEFAULT 0,
  days_sales_outstanding NUMERIC DEFAULT 0,
  days_payable_outstanding NUMERIC DEFAULT 0,
  cash_conversion_cycle NUMERIC DEFAULT 0,
  industry_avg_ccc NUMERIC DEFAULT 0,
  excess_cash_tied_up NUMERIC DEFAULT 0,
  early_payment_discounts_taken NUMERIC DEFAULT 0,
  early_payment_discounts_missed NUMERIC DEFAULT 0,
  supplier_payment_terms_avg_days NUMERIC DEFAULT 0,
  customer_payment_terms_avg_days NUMERIC DEFAULT 0,
  optimal_ccc NUMERIC DEFAULT 0,
  improvement_potential NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS treas_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  account_type TEXT NOT NULL,
  institution TEXT NOT NULL,
  account_name TEXT,
  avg_balance NUMERIC DEFAULT 0,
  interest_rate_pct NUMERIC DEFAULT 0,
  best_available_rate_pct NUMERIC DEFAULT 0,
  rate_gap_pct NUMERIC DEFAULT 0,
  monthly_fees NUMERIC DEFAULT 0,
  annual_fees NUMERIC DEFAULT 0,
  transaction_fees_monthly NUMERIC DEFAULT 0,
  minimum_balance NUMERIC DEFAULT 0,
  idle_cash NUMERIC DEFAULT 0,
  fdic_insured BOOLEAN DEFAULT true,
  above_fdic_limit BOOLEAN DEFAULT false,
  excess_above_fdic NUMERIC DEFAULT 0,
  last_rate_negotiation DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, institution, account_name)
);

CREATE TABLE IF NOT EXISTS treas_float (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  avg_daily_collections NUMERIC DEFAULT 0,
  avg_collection_float_days NUMERIC DEFAULT 0,
  avg_daily_disbursements NUMERIC DEFAULT 0,
  avg_disbursement_float_days NUMERIC DEFAULT 0,
  net_float_days NUMERIC DEFAULT 0,
  float_cost_annual NUMERIC DEFAULT 0,
  same_day_payment_pct NUMERIC DEFAULT 0,
  early_payment_cost NUMERIC DEFAULT 0,
  late_collection_cost NUMERIC DEFAULT 0,
  optimal_payment_timing TEXT,
  sweep_account_active BOOLEAN DEFAULT false,
  zero_balance_account BOOLEAN DEFAULT false,
  lockbox_service BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

-- MODULE Z: LEGAL
CREATE TABLE IF NOT EXISTS legal_contracts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  contract_name TEXT NOT NULL,
  counterparty TEXT NOT NULL,
  contract_type TEXT,
  annual_value NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  auto_renews BOOLEAN DEFAULT false,
  notice_period_days INTEGER DEFAULT 30,
  cancellation_deadline DATE,
  unfavorable_terms JSONB DEFAULT '[]',
  liability_cap NUMERIC DEFAULT 0,
  unlimited_liability BOOLEAN DEFAULT false,
  indemnification_clause BOOLEAN DEFAULT false,
  non_compete_clause BOOLEAN DEFAULT false,
  exclusivity_clause BOOLEAN DEFAULT false,
  ip_assignment_clause BOOLEAN DEFAULT false,
  most_favored_nation BOOLEAN DEFAULT false,
  last_reviewed DATE,
  months_since_review INTEGER DEFAULT 0,
  overall_risk_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, contract_name, counterparty)
);

CREATE TABLE IF NOT EXISTS legal_disputes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  dispute_type TEXT NOT NULL,
  description TEXT NOT NULL,
  counterparty TEXT,
  status TEXT DEFAULT 'active',
  filed_date DATE,
  estimated_exposure NUMERIC DEFAULT 0,
  best_case_outcome NUMERIC DEFAULT 0,
  worst_case_outcome NUMERIC DEFAULT 0,
  legal_fees_to_date NUMERIC DEFAULT 0,
  estimated_total_legal_fees NUMERIC DEFAULT 0,
  insurance_covered BOOLEAN DEFAULT false,
  insurance_coverage_amount NUMERIC DEFAULT 0,
  probability_of_loss_pct NUMERIC DEFAULT 50,
  expected_loss NUMERIC DEFAULT 0,
  reserve_booked NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_regulatory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  regulation_name TEXT NOT NULL,
  jurisdiction TEXT,
  category TEXT,
  status TEXT DEFAULT 'monitoring',
  effective_date DATE,
  compliance_deadline DATE,
  days_until_deadline INTEGER DEFAULT 0,
  estimated_compliance_cost NUMERIC DEFAULT 0,
  penalty_for_non_compliance NUMERIC DEFAULT 0,
  affects_operations TEXT,
  action_required TEXT,
  assigned_to TEXT,
  compliance_status TEXT DEFAULT 'not_started',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, regulation_name)
);

-- MODULE AA: CUSTOMER JOURNEY
CREATE TABLE IF NOT EXISTS cj_onboarding (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  new_customers INTEGER DEFAULT 0,
  completed_onboarding INTEGER DEFAULT 0,
  onboarding_completion_pct NUMERIC DEFAULT 0,
  avg_onboarding_days NUMERIC DEFAULT 0,
  target_onboarding_days NUMERIC DEFAULT 0,
  dropout_at_step JSONB DEFAULT '{}',
  biggest_friction_point TEXT,
  time_to_first_value_days NUMERIC DEFAULT 0,
  nps_at_onboarding NUMERIC DEFAULT 0,
  support_tickets_during_onboard INTEGER DEFAULT 0,
  onboarding_cost_per_customer NUMERIC DEFAULT 0,
  churn_within_90_days INTEGER DEFAULT 0,
  early_churn_pct NUMERIC DEFAULT 0,
  revenue_lost_to_early_churn NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS cj_adoption (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  feature_or_service TEXT NOT NULL,
  category TEXT,
  total_customers INTEGER DEFAULT 0,
  customers_using INTEGER DEFAULT 0,
  adoption_pct NUMERIC DEFAULT 0,
  avg_usage_frequency TEXT,
  revenue_from_feature NUMERIC DEFAULT 0,
  cost_to_maintain NUMERIC DEFAULT 0,
  margin_pct NUMERIC DEFAULT 0,
  upsell_conversion_pct NUMERIC DEFAULT 0,
  customers_aware INTEGER DEFAULT 0,
  awareness_pct NUMERIC DEFAULT 0,
  satisfaction_score NUMERIC DEFAULT 0,
  feature_requested_by_churned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, feature_or_service)
);

CREATE TABLE IF NOT EXISTS cj_churn_signals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_name TEXT NOT NULL,
  signal_date DATE NOT NULL,
  signal_type TEXT NOT NULL,
  signal_strength NUMERIC DEFAULT 0,
  description TEXT,
  churn_probability NUMERIC DEFAULT 0,
  annual_revenue_at_risk NUMERIC DEFAULT 0,
  recommended_action TEXT,
  action_taken TEXT,
  action_date DATE,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MODULE AB: ECOSYSTEM
CREATE TABLE IF NOT EXISTS eco_integrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  integration_name TEXT NOT NULL,
  provider TEXT,
  integration_type TEXT,
  direction TEXT,
  data_synced TEXT,
  monthly_cost NUMERIC DEFAULT 0,
  monthly_api_calls INTEGER DEFAULT 0,
  error_rate_pct NUMERIC DEFAULT 0,
  avg_latency_ms NUMERIC DEFAULT 0,
  last_failure_date DATE,
  failures_30d INTEGER DEFAULT 0,
  data_freshness_minutes NUMERIC DEFAULT 0,
  manual_workaround_hours NUMERIC DEFAULT 0,
  business_impact_if_down TEXT,
  redundancy_exists BOOLEAN DEFAULT false,
  contract_end_date DATE,
  api_version_current TEXT,
  api_version_latest TEXT,
  deprecated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, integration_name)
);

CREATE TABLE IF NOT EXISTS eco_data_quality (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  data_domain TEXT NOT NULL,
  total_records INTEGER DEFAULT 0,
  duplicate_records INTEGER DEFAULT 0,
  duplicate_pct NUMERIC DEFAULT 0,
  incomplete_records INTEGER DEFAULT 0,
  incomplete_pct NUMERIC DEFAULT 0,
  stale_records INTEGER DEFAULT 0,
  stale_pct NUMERIC DEFAULT 0,
  conflicting_records INTEGER DEFAULT 0,
  conflicting_pct NUMERIC DEFAULT 0,
  overall_quality_score NUMERIC DEFAULT 0,
  systems_of_record INTEGER DEFAULT 0,
  single_source_of_truth BOOLEAN DEFAULT false,
  estimated_cost_of_bad_data NUMERIC DEFAULT 0,
  last_cleansed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, data_domain)
);

CREATE TABLE IF NOT EXISTS eco_automation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  process_name TEXT NOT NULL,
  department TEXT,
  current_state TEXT DEFAULT 'manual',
  manual_hours_per_month NUMERIC DEFAULT 0,
  automated_hours_saved NUMERIC DEFAULT 0,
  remaining_manual_hours NUMERIC DEFAULT 0,
  error_rate_manual NUMERIC DEFAULT 0,
  error_rate_automated NUMERIC DEFAULT 0,
  automation_tool TEXT,
  monthly_tool_cost NUMERIC DEFAULT 0,
  hourly_labor_cost NUMERIC DEFAULT 0,
  manual_cost_per_month NUMERIC DEFAULT 0,
  automation_savings_per_month NUMERIC DEFAULT 0,
  roi_achieved_pct NUMERIC DEFAULT 0,
  next_automation_opportunity TEXT,
  estimated_savings NUMERIC DEFAULT 0,
  implementation_cost NUMERIC DEFAULT 0,
  implementation_months NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, process_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ip_port_biz ON ip_portfolio(business_id);
CREATE INDEX IF NOT EXISTS idx_ip_know_biz ON ip_knowledge(business_id);
CREATE INDEX IF NOT EXISTS idx_ip_brand_biz ON ip_brand(business_id);
CREATE INDEX IF NOT EXISTS idx_treas_cc_biz ON treas_cash_cycle(business_id);
CREATE INDEX IF NOT EXISTS idx_treas_acc_biz ON treas_accounts(business_id);
CREATE INDEX IF NOT EXISTS idx_treas_flt_biz ON treas_float(business_id);
CREATE INDEX IF NOT EXISTS idx_legal_con_biz ON legal_contracts(business_id);
CREATE INDEX IF NOT EXISTS idx_legal_dis_biz ON legal_disputes(business_id);
CREATE INDEX IF NOT EXISTS idx_legal_reg_biz ON legal_regulatory(business_id);
CREATE INDEX IF NOT EXISTS idx_cj_onb_biz ON cj_onboarding(business_id);
CREATE INDEX IF NOT EXISTS idx_cj_adopt_biz ON cj_adoption(business_id);
CREATE INDEX IF NOT EXISTS idx_cj_churn_biz ON cj_churn_signals(business_id);
CREATE INDEX IF NOT EXISTS idx_eco_int_biz ON eco_integrations(business_id);
CREATE INDEX IF NOT EXISTS idx_eco_dq_biz ON eco_data_quality(business_id);
CREATE INDEX IF NOT EXISTS idx_eco_auto_biz ON eco_automation(business_id);

ALTER TABLE ip_portfolio DISABLE ROW LEVEL SECURITY;
ALTER TABLE ip_knowledge DISABLE ROW LEVEL SECURITY;
ALTER TABLE ip_brand DISABLE ROW LEVEL SECURITY;
ALTER TABLE treas_cash_cycle DISABLE ROW LEVEL SECURITY;
ALTER TABLE treas_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE treas_float DISABLE ROW LEVEL SECURITY;
ALTER TABLE legal_contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE legal_disputes DISABLE ROW LEVEL SECURITY;
ALTER TABLE legal_regulatory DISABLE ROW LEVEL SECURITY;
ALTER TABLE cj_onboarding DISABLE ROW LEVEL SECURITY;
ALTER TABLE cj_adoption DISABLE ROW LEVEL SECURITY;
ALTER TABLE cj_churn_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE eco_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE eco_data_quality DISABLE ROW LEVEL SECURITY;
ALTER TABLE eco_automation DISABLE ROW LEVEL SECURITY;
