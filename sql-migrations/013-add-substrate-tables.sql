-- =============================================================================
-- SUBSTRATE LAYER — 15 Tables
-- =============================================================================
-- Module AW: Regulatory & Compliance Exposure (3 tables)
-- Module AX: Vendor & Dependency Risk (3 tables)
-- Module AY: Revenue Architecture Integrity (3 tables)
-- Module AZ: Workforce Capacity & Planning (3 tables)
-- Module BA: Network & Ecosystem Effects (3 tables)
-- =============================================================================

-- MODULE AW: REGULATORY & COMPLIANCE
CREATE TABLE IF NOT EXISTS reg_obligations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  obligation TEXT NOT NULL,
  category TEXT, -- tax, employment, privacy, industry_specific, financial_reporting, licensing, environmental, accessibility, contract, insurance
  jurisdiction TEXT,
  compliance_status TEXT DEFAULT 'unknown', -- compliant, partial, non_compliant, unknown, exempt
  last_audit_date DATE,
  next_deadline DATE,
  responsible_person TEXT,
  penalty_if_violated NUMERIC DEFAULT 0,
  likelihood_of_audit TEXT DEFAULT 'low', -- low, medium, high
  remediation_cost NUMERIC DEFAULT 0,
  documented_process BOOLEAN DEFAULT false,
  automated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, obligation)
);

CREATE TABLE IF NOT EXISTS reg_exposure (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  risk_name TEXT NOT NULL,
  risk_type TEXT, -- data_breach_liability, misclassification, tax_underpayment, license_lapse, contract_breach, ip_infringement, ada_violation, gdpr_violation, osha_violation
  current_exposure NUMERIC DEFAULT 0,
  worst_case_exposure NUMERIC DEFAULT 0,
  insurance_coverage NUMERIC DEFAULT 0,
  gap NUMERIC DEFAULT 0,
  probability TEXT DEFAULT 'low',
  time_to_fix TEXT,
  fix_cost NUMERIC DEFAULT 0,
  discovered_date DATE,
  status TEXT DEFAULT 'open', -- open, mitigating, resolved, accepted
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, risk_name)
);

CREATE TABLE IF NOT EXISTS reg_changes_upcoming (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  change_name TEXT NOT NULL,
  category TEXT,
  effective_date DATE,
  impact_level TEXT DEFAULT 'medium', -- low, medium, high, critical
  description TEXT,
  affected_areas TEXT,
  preparation_status TEXT DEFAULT 'not_started', -- not_started, assessing, preparing, ready
  cost_to_comply NUMERIC DEFAULT 0,
  cost_of_non_compliance NUMERIC DEFAULT 0,
  days_until_effective INTEGER DEFAULT 0,
  action_required TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, change_name)
);

-- MODULE AX: VENDOR & DEPENDENCY
CREATE TABLE IF NOT EXISTS vendor_dependencies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor_name TEXT NOT NULL,
  category TEXT, -- infrastructure, software, payment_processing, shipping, manufacturing, consulting, marketing, legal, accounting, insurance
  annual_spend NUMERIC DEFAULT 0,
  contract_end_date DATE,
  notice_period_days INTEGER DEFAULT 30,
  switching_cost NUMERIC DEFAULT 0,
  switching_time_weeks NUMERIC DEFAULT 0,
  dependency_level TEXT DEFAULT 'medium', -- low, medium, high, critical
  alternative_identified BOOLEAN DEFAULT false,
  single_source BOOLEAN DEFAULT false,
  performance_score NUMERIC DEFAULT 0, -- 0-100
  sla_in_place BOOLEAN DEFAULT false,
  sla_met_pct NUMERIC DEFAULT 100,
  last_review_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, vendor_name)
);

CREATE TABLE IF NOT EXISTS vendor_concentration (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  total_vendor_spend NUMERIC DEFAULT 0,
  top_vendor_pct NUMERIC DEFAULT 0, -- % of spend with #1 vendor
  top_3_vendors_pct NUMERIC DEFAULT 0,
  single_source_count INTEGER DEFAULT 0,
  vendors_without_sla INTEGER DEFAULT 0,
  vendors_without_alternative INTEGER DEFAULT 0,
  avg_contract_remaining_months NUMERIC DEFAULT 0,
  auto_renew_spend NUMERIC DEFAULT 0,
  total_switching_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS vendor_incidents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor_name TEXT NOT NULL,
  incident_date DATE NOT NULL,
  incident_type TEXT, -- outage, data_loss, price_increase, quality_decline, breach, late_delivery, billing_error, support_failure
  duration_hours NUMERIC DEFAULT 0,
  business_impact TEXT,
  revenue_lost NUMERIC DEFAULT 0,
  workaround_cost NUMERIC DEFAULT 0,
  vendor_acknowledged BOOLEAN DEFAULT false,
  credit_received NUMERIC DEFAULT 0,
  recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MODULE AY: REVENUE ARCHITECTURE
CREATE TABLE IF NOT EXISTS rev_streams (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  stream_name TEXT NOT NULL,
  stream_type TEXT, -- recurring, one_time, usage_based, project, retainer, commission, licensing, advertising
  annual_revenue NUMERIC DEFAULT 0,
  pct_of_total NUMERIC DEFAULT 0,
  gross_margin_pct NUMERIC DEFAULT 0,
  growth_rate_pct NUMERIC DEFAULT 0, -- YoY
  customer_count INTEGER DEFAULT 0,
  avg_revenue_per_customer NUMERIC DEFAULT 0,
  concentration_risk TEXT DEFAULT 'low', -- if few customers drive most revenue
  predictability TEXT DEFAULT 'medium', -- low, medium, high
  scalability TEXT DEFAULT 'medium', -- low, medium, high
  at_risk_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, stream_name)
);

CREATE TABLE IF NOT EXISTS rev_model_health (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  total_revenue NUMERIC DEFAULT 0,
  recurring_pct NUMERIC DEFAULT 0,
  one_time_pct NUMERIC DEFAULT 0,
  top_customer_pct NUMERIC DEFAULT 0,
  top_5_customers_pct NUMERIC DEFAULT 0,
  revenue_per_employee NUMERIC DEFAULT 0,
  industry_avg_rev_per_employee NUMERIC DEFAULT 0,
  months_of_runway NUMERIC DEFAULT 0,
  cash_conversion_cycle_days NUMERIC DEFAULT 0,
  industry_avg_ccc_days NUMERIC DEFAULT 0,
  days_sales_outstanding NUMERIC DEFAULT 0,
  late_payments_pct NUMERIC DEFAULT 0,
  bad_debt_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS rev_pricing_integrity (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  product_or_tier TEXT NOT NULL,
  list_price NUMERIC DEFAULT 0,
  avg_actual_price NUMERIC DEFAULT 0,
  discount_frequency_pct NUMERIC DEFAULT 0,
  avg_discount_pct NUMERIC DEFAULT 0,
  max_discount_given_pct NUMERIC DEFAULT 0,
  discount_authority TEXT, -- anyone, sales_lead, vp, ceo_only
  price_last_increased DATE,
  months_since_increase NUMERIC DEFAULT 0,
  cost_increase_since_pct NUMERIC DEFAULT 0, -- costs have gone up by X% since last price change
  margin_erosion_pct NUMERIC DEFAULT 0,
  competitor_price_position TEXT DEFAULT 'similar', -- below, similar, above, premium
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, product_or_tier)
);

-- MODULE AZ: WORKFORCE CAPACITY
CREATE TABLE IF NOT EXISTS wf_capacity (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  department TEXT NOT NULL,
  current_headcount INTEGER DEFAULT 0,
  open_roles INTEGER DEFAULT 0,
  avg_time_to_fill_days NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  overtime_pct NUMERIC DEFAULT 0,
  contractor_pct NUMERIC DEFAULT 0,
  attrition_rate_pct NUMERIC DEFAULT 0,
  planned_growth INTEGER DEFAULT 0,
  capacity_gap TEXT DEFAULT 'none', -- none, slight, moderate, severe
  bottleneck_role TEXT,
  cost_of_vacancy_monthly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, department)
);

CREATE TABLE IF NOT EXISTS wf_compensation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role TEXT NOT NULL,
  current_compensation NUMERIC DEFAULT 0,
  market_rate_low NUMERIC DEFAULT 0,
  market_rate_mid NUMERIC DEFAULT 0,
  market_rate_high NUMERIC DEFAULT 0,
  position_in_range TEXT DEFAULT 'at_market', -- below_market, at_market, above_market
  gap_to_market_pct NUMERIC DEFAULT 0,
  people_in_role INTEGER DEFAULT 0,
  flight_risk_if_underpaid TEXT DEFAULT 'low',
  last_raise_date DATE,
  months_since_raise NUMERIC DEFAULT 0,
  competitor_poaching_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role)
);

CREATE TABLE IF NOT EXISTS wf_succession (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  critical_role TEXT NOT NULL,
  current_holder TEXT,
  backup_identified BOOLEAN DEFAULT false,
  backup_ready BOOLEAN DEFAULT false,
  backup_name TEXT,
  time_to_ready_months NUMERIC DEFAULT 0,
  external_hire_time_months NUMERIC DEFAULT 0,
  external_hire_cost NUMERIC DEFAULT 0,
  role_documentation TEXT DEFAULT 'none', -- none, partial, complete
  institutional_knowledge_risk TEXT DEFAULT 'low',
  business_impact_if_vacant TEXT,
  revenue_at_risk NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, critical_role)
);

-- MODULE BA: NETWORK & ECOSYSTEM
CREATE TABLE IF NOT EXISTS eco_partnerships (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  partner_name TEXT NOT NULL,
  partnership_type TEXT, -- referral, integration, reseller, co_marketing, strategic, technology, distribution
  status TEXT DEFAULT 'active', -- prospecting, active, dormant, churned
  annual_revenue_generated NUMERIC DEFAULT 0,
  annual_cost NUMERIC DEFAULT 0,
  roi NUMERIC DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  deals_influenced INTEGER DEFAULT 0,
  health_score NUMERIC DEFAULT 0, -- 0-100
  last_engagement_date DATE,
  days_since_engagement INTEGER DEFAULT 0,
  renewal_date DATE,
  at_risk BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, partner_name)
);

CREATE TABLE IF NOT EXISTS eco_integrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  integration_name TEXT NOT NULL,
  category TEXT, -- accounting, crm, payment, communication, analytics, storage, hr, marketing, support
  users_connected INTEGER DEFAULT 0,
  pct_of_customers_using NUMERIC DEFAULT 0,
  retention_impact_pct NUMERIC DEFAULT 0, -- customers using this integration churn X% less
  api_health TEXT DEFAULT 'healthy', -- healthy, degraded, broken, deprecated
  maintenance_cost_monthly NUMERIC DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  requested_not_built INTEGER DEFAULT 0, -- requested integrations not yet built
  competitive_gap BOOLEAN DEFAULT false, -- competitors have it, you don't
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, integration_name)
);

CREATE TABLE IF NOT EXISTS eco_community (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  total_community_size INTEGER DEFAULT 0,
  active_members_pct NUMERIC DEFAULT 0,
  community_growth_rate_pct NUMERIC DEFAULT 0,
  user_generated_content_monthly INTEGER DEFAULT 0,
  support_deflection_pct NUMERIC DEFAULT 0, -- % of support handled by community
  community_influenced_deals INTEGER DEFAULT 0,
  community_revenue_impact NUMERIC DEFAULT 0,
  nps_community_vs_non NUMERIC DEFAULT 0, -- NPS difference
  referral_from_community_pct NUMERIC DEFAULT 0,
  investment_monthly NUMERIC DEFAULT 0,
  community_roi NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reg_obl_biz ON reg_obligations(business_id);
CREATE INDEX IF NOT EXISTS idx_reg_exp_biz ON reg_exposure(business_id);
CREATE INDEX IF NOT EXISTS idx_reg_chg_biz ON reg_changes_upcoming(business_id);
CREATE INDEX IF NOT EXISTS idx_vend_dep_biz ON vendor_dependencies(business_id);
CREATE INDEX IF NOT EXISTS idx_vend_conc_biz ON vendor_concentration(business_id);
CREATE INDEX IF NOT EXISTS idx_vend_inc_biz ON vendor_incidents(business_id);
CREATE INDEX IF NOT EXISTS idx_rev_str_biz ON rev_streams(business_id);
CREATE INDEX IF NOT EXISTS idx_rev_mod_biz ON rev_model_health(business_id);
CREATE INDEX IF NOT EXISTS idx_rev_pri_biz ON rev_pricing_integrity(business_id);
CREATE INDEX IF NOT EXISTS idx_wf_cap_biz ON wf_capacity(business_id);
CREATE INDEX IF NOT EXISTS idx_wf_comp_biz ON wf_compensation(business_id);
CREATE INDEX IF NOT EXISTS idx_wf_succ_biz ON wf_succession(business_id);
CREATE INDEX IF NOT EXISTS idx_eco_part_biz ON eco_partnerships(business_id);
CREATE INDEX IF NOT EXISTS idx_eco_int_biz ON eco_integrations(business_id);
CREATE INDEX IF NOT EXISTS idx_eco_comm_biz ON eco_community(business_id);

ALTER TABLE reg_obligations DISABLE ROW LEVEL SECURITY;
ALTER TABLE reg_exposure DISABLE ROW LEVEL SECURITY;
ALTER TABLE reg_changes_upcoming DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_dependencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_concentration DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE rev_streams DISABLE ROW LEVEL SECURITY;
ALTER TABLE rev_model_health DISABLE ROW LEVEL SECURITY;
ALTER TABLE rev_pricing_integrity DISABLE ROW LEVEL SECURITY;
ALTER TABLE wf_capacity DISABLE ROW LEVEL SECURITY;
ALTER TABLE wf_compensation DISABLE ROW LEVEL SECURITY;
ALTER TABLE wf_succession DISABLE ROW LEVEL SECURITY;
ALTER TABLE eco_partnerships DISABLE ROW LEVEL SECURITY;
ALTER TABLE eco_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE eco_community DISABLE ROW LEVEL SECURITY;
