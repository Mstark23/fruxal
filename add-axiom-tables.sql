-- =============================================================================
-- AXIOM LAYER — 15 Tables
-- =============================================================================
-- Module AR: Customer Psychology & Behavior Economics (3 tables)
-- Module AS: Competitive Intelligence & Market Position (3 tables)
-- Module AT: Brand Equity & Reputation Capital (3 tables)
-- Module AU: Technology Debt & Infrastructure Fragility (3 tables)
-- Module AV: Knowledge Management & Institutional Memory (3 tables)
-- =============================================================================

-- MODULE AR: CUSTOMER PSYCHOLOGY
CREATE TABLE IF NOT EXISTS cust_segments_deep (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  segment_name TEXT NOT NULL,
  customer_count INTEGER DEFAULT 0,
  avg_ltv NUMERIC DEFAULT 0,
  avg_cac NUMERIC DEFAULT 0,
  ltv_cac_ratio NUMERIC DEFAULT 0,
  purchase_frequency_per_year NUMERIC DEFAULT 0,
  avg_order_value NUMERIC DEFAULT 0,
  price_sensitivity TEXT DEFAULT 'medium',
  switching_cost TEXT DEFAULT 'low',
  primary_motivation TEXT,
  trigger_event TEXT,
  churn_risk_pct NUMERIC DEFAULT 0,
  expansion_potential_pct NUMERIC DEFAULT 0,
  advocacy_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, segment_name)
);

CREATE TABLE IF NOT EXISTS cust_journey_friction (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  journey_stage TEXT NOT NULL,
  touchpoint TEXT NOT NULL,
  friction_type TEXT,
  severity TEXT DEFAULT 'medium',
  drop_off_pct NUMERIC DEFAULT 0,
  avg_time_stuck_hours NUMERIC DEFAULT 0,
  support_tickets_from INTEGER DEFAULT 0,
  estimated_revenue_lost NUMERIC DEFAULT 0,
  fix_description TEXT,
  fix_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, journey_stage, touchpoint)
);

CREATE TABLE IF NOT EXISTS cust_value_perception (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  product_or_service TEXT NOT NULL,
  perceived_value_score NUMERIC DEFAULT 0,
  actual_value_delivered NUMERIC DEFAULT 0,
  price_charged NUMERIC DEFAULT 0,
  value_to_price_ratio NUMERIC DEFAULT 0,
  features_used_pct NUMERIC DEFAULT 0,
  features_requested_but_missing INTEGER DEFAULT 0,
  competitor_perceived_value NUMERIC DEFAULT 0,
  willingness_to_pay_more BOOLEAN DEFAULT false,
  would_miss_if_gone TEXT,
  primary_complaint TEXT,
  nps_for_product NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, product_or_service)
);

-- MODULE AS: COMPETITIVE INTELLIGENCE
CREATE TABLE IF NOT EXISTS comp_landscape (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  competitor_name TEXT NOT NULL,
  competitor_type TEXT,
  market_share_pct NUMERIC DEFAULT 0,
  your_share_pct NUMERIC DEFAULT 0,
  price_comparison TEXT DEFAULT 'similar',
  price_difference_pct NUMERIC DEFAULT 0,
  strengths TEXT,
  weaknesses TEXT,
  their_ideal_customer TEXT,
  overlap_with_you_pct NUMERIC DEFAULT 0,
  customers_lost_to INTEGER DEFAULT 0,
  customers_won_from INTEGER DEFAULT 0,
  threat_level TEXT DEFAULT 'medium',
  last_updated DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, competitor_name)
);

CREATE TABLE IF NOT EXISTS comp_differentiators (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  differentiator TEXT NOT NULL,
  category TEXT,
  strength_score NUMERIC DEFAULT 0,
  defensibility TEXT DEFAULT 'low',
  customer_awareness_pct NUMERIC DEFAULT 0,
  competitor_closing_gap BOOLEAN DEFAULT false,
  months_until_parity INTEGER,
  revenue_attributed NUMERIC DEFAULT 0,
  investment_to_maintain NUMERIC DEFAULT 0,
  at_risk BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, differentiator)
);

CREATE TABLE IF NOT EXISTS comp_win_loss (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_opportunities INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate_pct NUMERIC DEFAULT 0,
  avg_deal_size_won NUMERIC DEFAULT 0,
  avg_deal_size_lost NUMERIC DEFAULT 0,
  top_win_reason TEXT,
  top_loss_reason TEXT,
  lost_to_competitor_pct NUMERIC DEFAULT 0,
  lost_to_no_decision_pct NUMERIC DEFAULT 0,
  lost_to_price_pct NUMERIC DEFAULT 0,
  lost_to_features_pct NUMERIC DEFAULT 0,
  lost_to_trust_pct NUMERIC DEFAULT 0,
  total_revenue_lost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

-- MODULE AT: BRAND EQUITY
CREATE TABLE IF NOT EXISTS brand_health (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  brand_awareness_pct NUMERIC DEFAULT 0,
  brand_recall_pct NUMERIC DEFAULT 0,
  brand_sentiment_score NUMERIC DEFAULT 0,
  online_review_avg NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  review_response_rate_pct NUMERIC DEFAULT 0,
  negative_review_pct NUMERIC DEFAULT 0,
  social_mention_sentiment NUMERIC DEFAULT 0,
  share_of_voice_pct NUMERIC DEFAULT 0,
  brand_consistency_score NUMERIC DEFAULT 0,
  trust_score NUMERIC DEFAULT 0,
  referral_rate_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS brand_reputation_risks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  risk_name TEXT NOT NULL,
  risk_type TEXT,
  current_status TEXT DEFAULT 'monitoring',
  potential_impact TEXT DEFAULT 'medium',
  customers_affected_estimate INTEGER DEFAULT 0,
  revenue_at_risk NUMERIC DEFAULT 0,
  response_plan BOOLEAN DEFAULT false,
  spokesperson_assigned BOOLEAN DEFAULT false,
  monitoring_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, risk_name)
);

CREATE TABLE IF NOT EXISTS brand_content_assets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  asset_type TEXT NOT NULL,
  exists BOOLEAN DEFAULT false,
  quality_score NUMERIC DEFAULT 0,
  last_updated DATE,
  months_stale NUMERIC DEFAULT 0,
  consistent_with_brand BOOLEAN DEFAULT true,
  drives_revenue BOOLEAN DEFAULT false,
  estimated_annual_value NUMERIC DEFAULT 0,
  needs_update BOOLEAN DEFAULT false,
  update_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, asset_type)
);

-- MODULE AU: TECHNOLOGY DEBT
CREATE TABLE IF NOT EXISTS tech_debt_register (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  item TEXT NOT NULL,
  category TEXT,
  severity TEXT DEFAULT 'medium',
  age_months NUMERIC DEFAULT 0,
  workaround_in_place BOOLEAN DEFAULT false,
  workaround_cost_monthly NUMERIC DEFAULT 0,
  productivity_drag_pct NUMERIC DEFAULT 0,
  risk_of_failure TEXT DEFAULT 'low',
  fix_effort_hours NUMERIC DEFAULT 0,
  fix_cost NUMERIC DEFAULT 0,
  annual_cost_of_inaction NUMERIC DEFAULT 0,
  blocking_features TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, item)
);

CREATE TABLE IF NOT EXISTS tech_stack_health (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  system_name TEXT NOT NULL,
  category TEXT,
  monthly_cost NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  user_satisfaction_score NUMERIC DEFAULT 0,
  integration_quality TEXT DEFAULT 'good',
  data_flows_correctly BOOLEAN DEFAULT true,
  vendor_lock_in TEXT DEFAULT 'low',
  contract_end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  alternative_exists BOOLEAN DEFAULT false,
  potential_savings NUMERIC DEFAULT 0,
  redundant_with TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, system_name)
);

CREATE TABLE IF NOT EXISTS tech_incidents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_incidents INTEGER DEFAULT 0,
  critical_incidents INTEGER DEFAULT 0,
  total_downtime_hours NUMERIC DEFAULT 0,
  avg_resolution_hours NUMERIC DEFAULT 0,
  customer_impacting INTEGER DEFAULT 0,
  revenue_lost NUMERIC DEFAULT 0,
  repeat_incidents INTEGER DEFAULT 0,
  root_cause_analysis_done_pct NUMERIC DEFAULT 0,
  preventable_pct NUMERIC DEFAULT 0,
  backup_tested BOOLEAN DEFAULT false,
  disaster_recovery_plan BOOLEAN DEFAULT false,
  last_dr_test DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

-- MODULE AV: KNOWLEDGE MANAGEMENT
CREATE TABLE IF NOT EXISTS km_assets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  knowledge_area TEXT NOT NULL,
  documented BOOLEAN DEFAULT false,
  documentation_quality TEXT DEFAULT 'none',
  single_point_of_knowledge TEXT,
  people_who_know INTEGER DEFAULT 0,
  bus_factor INTEGER DEFAULT 0,
  criticality TEXT DEFAULT 'medium',
  last_updated DATE,
  months_since_update NUMERIC DEFAULT 0,
  access_frequency TEXT DEFAULT 'monthly',
  estimated_recreation_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, knowledge_area)
);

CREATE TABLE IF NOT EXISTS km_tribal_knowledge (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  person TEXT NOT NULL,
  role TEXT,
  knowledge_domains TEXT NOT NULL,
  unique_knowledge_count INTEGER DEFAULT 0,
  documented_pct NUMERIC DEFAULT 0,
  flight_risk TEXT DEFAULT 'low',
  years_with_company NUMERIC DEFAULT 0,
  replacement_difficulty TEXT DEFAULT 'medium',
  knowledge_loss_impact NUMERIC DEFAULT 0,
  succession_plan BOOLEAN DEFAULT false,
  cross_training_in_progress BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, person)
);

CREATE TABLE IF NOT EXISTS km_documentation_health (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  total_processes_identified INTEGER DEFAULT 0,
  processes_documented_pct NUMERIC DEFAULT 0,
  documentation_current_pct NUMERIC DEFAULT 0,
  avg_document_age_months NUMERIC DEFAULT 0,
  searchable BOOLEAN DEFAULT false,
  centralized BOOLEAN DEFAULT false,
  version_controlled BOOLEAN DEFAULT false,
  onboarding_coverage_pct NUMERIC DEFAULT 0,
  client_facing_docs_quality NUMERIC DEFAULT 0,
  internal_docs_quality NUMERIC DEFAULT 0,
  estimated_productivity_loss_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cust_seg_biz ON cust_segments_deep(business_id);
CREATE INDEX IF NOT EXISTS idx_cust_jrn_biz ON cust_journey_friction(business_id);
CREATE INDEX IF NOT EXISTS idx_cust_val_biz ON cust_value_perception(business_id);
CREATE INDEX IF NOT EXISTS idx_comp_land_biz ON comp_landscape(business_id);
CREATE INDEX IF NOT EXISTS idx_comp_diff_biz ON comp_differentiators(business_id);
CREATE INDEX IF NOT EXISTS idx_comp_wl_biz ON comp_win_loss(business_id);
CREATE INDEX IF NOT EXISTS idx_brand_hlth_biz ON brand_health(business_id);
CREATE INDEX IF NOT EXISTS idx_brand_risk_biz ON brand_reputation_risks(business_id);
CREATE INDEX IF NOT EXISTS idx_brand_cont_biz ON brand_content_assets(business_id);
CREATE INDEX IF NOT EXISTS idx_tech_debt_biz ON tech_debt_register(business_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_biz ON tech_stack_health(business_id);
CREATE INDEX IF NOT EXISTS idx_tech_inc_biz ON tech_incidents(business_id);
CREATE INDEX IF NOT EXISTS idx_km_asset_biz ON km_assets(business_id);
CREATE INDEX IF NOT EXISTS idx_km_tribal_biz ON km_tribal_knowledge(business_id);
CREATE INDEX IF NOT EXISTS idx_km_doc_biz ON km_documentation_health(business_id);

ALTER TABLE cust_segments_deep DISABLE ROW LEVEL SECURITY;
ALTER TABLE cust_journey_friction DISABLE ROW LEVEL SECURITY;
ALTER TABLE cust_value_perception DISABLE ROW LEVEL SECURITY;
ALTER TABLE comp_landscape DISABLE ROW LEVEL SECURITY;
ALTER TABLE comp_differentiators DISABLE ROW LEVEL SECURITY;
ALTER TABLE comp_win_loss DISABLE ROW LEVEL SECURITY;
ALTER TABLE brand_health DISABLE ROW LEVEL SECURITY;
ALTER TABLE brand_reputation_risks DISABLE ROW LEVEL SECURITY;
ALTER TABLE brand_content_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE tech_debt_register DISABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_health DISABLE ROW LEVEL SECURITY;
ALTER TABLE tech_incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE km_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE km_tribal_knowledge DISABLE ROW LEVEL SECURITY;
ALTER TABLE km_documentation_health DISABLE ROW LEVEL SECURITY;
