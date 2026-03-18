-- ═══════════════════════════════════════════════════════════════
-- BATCH 2 of 7: 15 Intelligence Layers (Genesis → Apex)
-- ═══════════════════════════════════════════════════════════════

-- === 004-add-genesis-tables.sql ===
-- =============================================================================
-- GENESIS LAYER — 15 Tables
-- =============================================================================
-- Module AH: Decision Architecture & Cognitive Cost (3 tables)
-- Module AI: Quality Systems & Cost of Poor Quality (3 tables)
-- Module AJ: Seasonality & Cyclical Intelligence (3 tables)
-- Module AK: Exit Readiness & Valuation Leaks (3 tables)
-- Module AL: Communication & Information Flow (3 tables)
-- =============================================================================

-- MODULE AH: DECISION ARCHITECTURE
CREATE TABLE IF NOT EXISTS dec_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  decision_name TEXT NOT NULL,
  decision_date DATE NOT NULL,
  category TEXT, -- pricing, hiring, investment, product, partnership, marketing, operational, strategic, financial, technology
  decision_maker TEXT,
  options_considered INTEGER DEFAULT 1,
  data_used BOOLEAN DEFAULT false,
  time_to_decide_days INTEGER DEFAULT 0,
  reversible BOOLEAN DEFAULT true,
  estimated_impact NUMERIC DEFAULT 0,
  actual_impact NUMERIC DEFAULT 0,
  variance_pct NUMERIC DEFAULT 0,
  outcome TEXT DEFAULT 'pending', -- positive, negative, neutral, pending
  bias_detected TEXT, -- sunk_cost, anchoring, confirmation, recency, optimism, status_quo, groupthink, none
  post_mortem_done BOOLEAN DEFAULT false,
  lessons_documented BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dec_patterns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_decisions_tracked INTEGER DEFAULT 0,
  decisions_data_driven_pct NUMERIC DEFAULT 0,
  avg_options_considered NUMERIC DEFAULT 0,
  avg_time_to_decide_days NUMERIC DEFAULT 0,
  decisions_with_positive_outcome_pct NUMERIC DEFAULT 0,
  avg_impact_variance_pct NUMERIC DEFAULT 0,
  most_common_bias TEXT,
  bias_frequency_pct NUMERIC DEFAULT 0,
  post_mortem_rate_pct NUMERIC DEFAULT 0,
  repeat_mistake_count INTEGER DEFAULT 0,
  estimated_cost_of_bad_decisions NUMERIC DEFAULT 0,
  decision_bottleneck TEXT, -- person or process causing delays
  avg_delay_cost_per_decision NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS dec_delayed (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  decision_name TEXT NOT NULL,
  category TEXT,
  identified_date DATE,
  days_delayed INTEGER DEFAULT 0,
  reason_delayed TEXT, -- analysis_paralysis, fear, lack_data, no_owner, politics, perfectionism, bandwidth
  cost_of_delay_per_month NUMERIC DEFAULT 0,
  total_delay_cost NUMERIC DEFAULT 0,
  risk_of_further_delay TEXT,
  recommended_deadline DATE,
  decision_owner TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, decision_name)
);

-- MODULE AI: QUALITY SYSTEMS
CREATE TABLE IF NOT EXISTS qual_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  process_name TEXT NOT NULL,
  department TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_units_or_deliverables INTEGER DEFAULT 0,
  defects_or_errors INTEGER DEFAULT 0,
  defect_rate_pct NUMERIC DEFAULT 0,
  industry_avg_defect_rate NUMERIC DEFAULT 0,
  rework_instances INTEGER DEFAULT 0,
  rework_hours NUMERIC DEFAULT 0,
  rework_cost NUMERIC DEFAULT 0,
  scrap_or_waste_cost NUMERIC DEFAULT 0,
  customer_complaints_from_quality INTEGER DEFAULT 0,
  warranty_claims INTEGER DEFAULT 0,
  warranty_cost NUMERIC DEFAULT 0,
  cost_of_poor_quality NUMERIC DEFAULT 0, -- total: rework + scrap + warranty + complaints
  prevention_spend NUMERIC DEFAULT 0, -- training, QC, tools
  appraisal_spend NUMERIC DEFAULT 0, -- inspections, testing, audits
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, process_name, period_start)
);

CREATE TABLE IF NOT EXISTS qual_customer_impact (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_deliveries INTEGER DEFAULT 0,
  on_time_pct NUMERIC DEFAULT 0,
  right_first_time_pct NUMERIC DEFAULT 0,
  returns_or_redo_pct NUMERIC DEFAULT 0,
  avg_resolution_days NUMERIC DEFAULT 0,
  sla_breaches INTEGER DEFAULT 0,
  sla_penalty_cost NUMERIC DEFAULT 0,
  customer_defections_from_quality INTEGER DEFAULT 0,
  revenue_lost_to_quality NUMERIC DEFAULT 0,
  nps_impact_from_quality NUMERIC DEFAULT 0,
  referrals_lost_estimate INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS qual_prevention (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  area TEXT NOT NULL,
  has_documented_process BOOLEAN DEFAULT false,
  has_checklist BOOLEAN DEFAULT false,
  has_quality_training BOOLEAN DEFAULT false,
  last_training_date DATE,
  has_automated_checks BOOLEAN DEFAULT false,
  has_peer_review BOOLEAN DEFAULT false,
  has_customer_feedback_loop BOOLEAN DEFAULT false,
  prevention_maturity_score NUMERIC DEFAULT 0, -- 0-100
  estimated_annual_quality_cost NUMERIC DEFAULT 0,
  estimated_savings_if_mature NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, area)
);

-- MODULE AJ: SEASONALITY
CREATE TABLE IF NOT EXISTS season_patterns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  metric_name TEXT NOT NULL, -- revenue, leads, support_volume, cash_flow, website_traffic, hiring_need, churn, inventory_demand
  month INTEGER NOT NULL, -- 1-12
  historical_avg NUMERIC DEFAULT 0,
  historical_min NUMERIC DEFAULT 0,
  historical_max NUMERIC DEFAULT 0,
  index_vs_annual_avg NUMERIC DEFAULT 100, -- 100 = average, 150 = 50% above average
  trend_direction TEXT DEFAULT 'stable',
  years_of_data INTEGER DEFAULT 1,
  confidence NUMERIC DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, metric_name, month)
);

CREATE TABLE IF NOT EXISTS season_preparedness (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  upcoming_period TEXT NOT NULL, -- Q1_peak, summer_slowdown, holiday_surge, year_end_rush, etc
  expected_start DATE,
  expected_end DATE,
  expected_impact TEXT, -- revenue_increase, revenue_decrease, cost_increase, demand_spike, demand_drop
  magnitude_pct NUMERIC DEFAULT 0,
  preparation_status TEXT DEFAULT 'not_started', -- not_started, planning, prepared, in_progress
  staff_plan_ready BOOLEAN DEFAULT false,
  inventory_plan_ready BOOLEAN DEFAULT false,
  cash_reserve_adequate BOOLEAN DEFAULT false,
  marketing_plan_ready BOOLEAN DEFAULT false,
  estimated_opportunity NUMERIC DEFAULT 0,
  estimated_risk NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, upcoming_period)
);

CREATE TABLE IF NOT EXISTS season_missed (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  what_happened TEXT,
  revenue_impact NUMERIC DEFAULT 0,
  cost_impact NUMERIC DEFAULT 0,
  root_cause TEXT, -- understaffed, no_inventory, no_marketing, no_cash, missed_forecast, no_planning
  preventable BOOLEAN DEFAULT true,
  lesson_learned TEXT,
  applied_to_future BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_name, year)
);

-- MODULE AK: EXIT READINESS
CREATE TABLE IF NOT EXISTS exit_valuation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  annual_revenue NUMERIC DEFAULT 0,
  annual_profit NUMERIC DEFAULT 0,
  owner_adjusted_ebitda NUMERIC DEFAULT 0, -- add back owner salary, perks, one-time expenses
  industry_multiple_low NUMERIC DEFAULT 0,
  industry_multiple_mid NUMERIC DEFAULT 0,
  industry_multiple_high NUMERIC DEFAULT 0,
  estimated_value_low NUMERIC DEFAULT 0,
  estimated_value_mid NUMERIC DEFAULT 0,
  estimated_value_high NUMERIC DEFAULT 0,
  recurring_revenue_pct NUMERIC DEFAULT 0,
  recurring_premium_pct NUMERIC DEFAULT 0, -- higher recurring = higher multiple
  customer_concentration_discount_pct NUMERIC DEFAULT 0,
  owner_dependency_discount_pct NUMERIC DEFAULT 0,
  documentation_discount_pct NUMERIC DEFAULT 0,
  total_discount_pct NUMERIC DEFAULT 0,
  adjusted_value NUMERIC DEFAULT 0,
  value_gap NUMERIC DEFAULT 0, -- mid estimate minus adjusted
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS exit_blockers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  blocker TEXT NOT NULL,
  category TEXT, -- owner_dependency, financial, operational, legal, customer, documentation, team, technology
  severity TEXT DEFAULT 'medium',
  description TEXT,
  valuation_impact_pct NUMERIC DEFAULT 0, -- how much this reduces valuation
  fix_timeline_months NUMERIC DEFAULT 0,
  fix_cost NUMERIC DEFAULT 0,
  fix_description TEXT,
  status TEXT DEFAULT 'unresolved', -- unresolved, in_progress, resolved
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, blocker)
);

CREATE TABLE IF NOT EXISTS exit_readiness (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  overall_score NUMERIC DEFAULT 0, -- 0-100
  financial_clarity_score NUMERIC DEFAULT 0,
  owner_independence_score NUMERIC DEFAULT 0,
  recurring_revenue_score NUMERIC DEFAULT 0,
  customer_health_score NUMERIC DEFAULT 0,
  team_strength_score NUMERIC DEFAULT 0,
  documentation_score NUMERIC DEFAULT 0,
  legal_clean_score NUMERIC DEFAULT 0,
  technology_transferability_score NUMERIC DEFAULT 0,
  years_until_target_exit INTEGER DEFAULT 0,
  target_exit_value NUMERIC DEFAULT 0,
  current_gap_to_target NUMERIC DEFAULT 0,
  monthly_value_build_needed NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- MODULE AL: COMMUNICATION FLOW
CREATE TABLE IF NOT EXISTS comm_channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  channel TEXT NOT NULL, -- email, slack, meetings, phone, text, project_management, crm, shared_docs, in_person, video_call
  messages_per_week NUMERIC DEFAULT 0,
  avg_response_time_hours NUMERIC DEFAULT 0,
  after_hours_pct NUMERIC DEFAULT 0,
  duplicate_info_pct NUMERIC DEFAULT 0, -- same info sent through multiple channels
  missed_message_pct NUMERIC DEFAULT 0,
  total_weekly_hours NUMERIC DEFAULT 0,
  productive_pct NUMERIC DEFAULT 50,
  wasted_hours NUMERIC DEFAULT 0,
  cost_per_week NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, channel)
);

CREATE TABLE IF NOT EXISTS comm_gaps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  gap_type TEXT NOT NULL, -- silo, bottleneck, missing_feedback, delayed_escalation, no_documentation, tribal_knowledge, inconsistent_messaging, lost_in_translation
  description TEXT,
  between_teams TEXT, -- e.g. "Sales → Engineering"
  frequency TEXT DEFAULT 'weekly', -- daily, weekly, monthly, occasional
  estimated_cost_per_incident NUMERIC DEFAULT 0,
  incidents_per_month INTEGER DEFAULT 0,
  annual_cost NUMERIC DEFAULT 0,
  root_cause TEXT,
  fix TEXT,
  fix_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, gap_type, between_teams)
);

CREATE TABLE IF NOT EXISTS comm_meetings_audit (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  meeting_name TEXT NOT NULL,
  meeting_type TEXT, -- standup, status_update, planning, brainstorm, one_on_one, all_hands, client, vendor, interview
  frequency TEXT, -- daily, weekly, biweekly, monthly, ad_hoc
  duration_minutes INTEGER DEFAULT 30,
  avg_attendees INTEGER DEFAULT 3,
  person_hours_per_occurrence NUMERIC DEFAULT 0,
  monthly_cost NUMERIC DEFAULT 0,
  has_agenda BOOLEAN DEFAULT false,
  has_action_items BOOLEAN DEFAULT false,
  has_notes BOOLEAN DEFAULT false,
  could_be_async BOOLEAN DEFAULT false,
  could_be_shorter BOOLEAN DEFAULT false,
  could_have_fewer_attendees BOOLEAN DEFAULT false,
  value_score NUMERIC DEFAULT 50, -- 0-100 perceived value
  potential_savings_monthly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, meeting_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dec_hist_biz ON dec_history(business_id);
CREATE INDEX IF NOT EXISTS idx_dec_pat_biz ON dec_patterns(business_id);
CREATE INDEX IF NOT EXISTS idx_dec_del_biz ON dec_delayed(business_id);
CREATE INDEX IF NOT EXISTS idx_qual_met_biz ON qual_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_qual_ci_biz ON qual_customer_impact(business_id);
CREATE INDEX IF NOT EXISTS idx_qual_prev_biz ON qual_prevention(business_id);
CREATE INDEX IF NOT EXISTS idx_season_pat_biz ON season_patterns(business_id);
CREATE INDEX IF NOT EXISTS idx_season_prep_biz ON season_preparedness(business_id);
CREATE INDEX IF NOT EXISTS idx_season_miss_biz ON season_missed(business_id);
CREATE INDEX IF NOT EXISTS idx_exit_val_biz ON exit_valuation(business_id);
CREATE INDEX IF NOT EXISTS idx_exit_blk_biz ON exit_blockers(business_id);
CREATE INDEX IF NOT EXISTS idx_exit_rdy_biz ON exit_readiness(business_id);
CREATE INDEX IF NOT EXISTS idx_comm_ch_biz ON comm_channels(business_id);
CREATE INDEX IF NOT EXISTS idx_comm_gap_biz ON comm_gaps(business_id);
CREATE INDEX IF NOT EXISTS idx_comm_mtg_biz ON comm_meetings_audit(business_id);

ALTER TABLE dec_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE dec_patterns DISABLE ROW LEVEL SECURITY;
ALTER TABLE dec_delayed DISABLE ROW LEVEL SECURITY;
ALTER TABLE qual_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE qual_customer_impact DISABLE ROW LEVEL SECURITY;
ALTER TABLE qual_prevention DISABLE ROW LEVEL SECURITY;
ALTER TABLE season_patterns DISABLE ROW LEVEL SECURITY;
ALTER TABLE season_preparedness DISABLE ROW LEVEL SECURITY;
ALTER TABLE season_missed DISABLE ROW LEVEL SECURITY;
ALTER TABLE exit_valuation DISABLE ROW LEVEL SECURITY;
ALTER TABLE exit_blockers DISABLE ROW LEVEL SECURITY;
ALTER TABLE exit_readiness DISABLE ROW LEVEL SECURITY;
ALTER TABLE comm_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE comm_gaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE comm_meetings_audit DISABLE ROW LEVEL SECURITY;

-- === 005-add-axiom-tables.sql ===
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

-- === 006-add-phantom-tables.sql ===
-- =============================================================================
-- PHANTOM LAYER — 15 Tables
-- =============================================================================
-- Module S: Digital & Marketing Intelligence (3 tables)
-- Module T: Human Capital & Talent (3 tables)
-- Module U: Data & Cybersecurity Posture (3 tables)
-- Module V: Growth & Market Position (3 tables)
-- Module W: Energy & Sustainability (3 tables)
-- =============================================================================

-- ═══════════════════════════════════════════════════════════
-- MODULE S: DIGITAL & MARKETING INTELLIGENCE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS digi_website (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  monthly_visitors INTEGER DEFAULT 0,
  visitor_trend TEXT DEFAULT 'stable',
  bounce_rate_pct NUMERIC DEFAULT 0,
  avg_session_duration_sec NUMERIC DEFAULT 0,
  pages_per_session NUMERIC DEFAULT 0,
  organic_traffic_pct NUMERIC DEFAULT 0,
  paid_traffic_pct NUMERIC DEFAULT 0,
  referral_traffic_pct NUMERIC DEFAULT 0,
  direct_traffic_pct NUMERIC DEFAULT 0,
  conversion_rate_pct NUMERIC DEFAULT 0,
  leads_from_website INTEGER DEFAULT 0,
  domain_authority INTEGER DEFAULT 0,
  page_speed_score INTEGER DEFAULT 0,
  mobile_score INTEGER DEFAULT 0,
  indexed_pages INTEGER DEFAULT 0,
  broken_links INTEGER DEFAULT 0,
  missing_meta_descriptions INTEGER DEFAULT 0,
  missing_alt_tags INTEGER DEFAULT 0,
  ssl_valid BOOLEAN DEFAULT true,
  uptime_pct NUMERIC DEFAULT 99.9,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS digi_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  platform TEXT NOT NULL,
  campaign_name TEXT,
  objective TEXT,
  spend NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr_pct NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost_per_conversion NUMERIC DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  industry_avg_cpc NUMERIC DEFAULT 0,
  industry_avg_ctr NUMERIC DEFAULT 0,
  industry_avg_conversion_rate NUMERIC DEFAULT 0,
  quality_score NUMERIC DEFAULT 0,
  wasted_spend NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, platform, campaign_name)
);

CREATE TABLE IF NOT EXISTS digi_content (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  channel TEXT NOT NULL,
  content_pieces_published INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  engagement_rate_pct NUMERIC DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  cost_to_produce NUMERIC DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  email_list_size INTEGER DEFAULT 0,
  email_open_rate_pct NUMERIC DEFAULT 0,
  email_click_rate_pct NUMERIC DEFAULT 0,
  email_unsubscribe_rate_pct NUMERIC DEFAULT 0,
  social_followers INTEGER DEFAULT 0,
  follower_growth_pct NUMERIC DEFAULT 0,
  best_performing_type TEXT,
  worst_performing_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, channel)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE T: HUMAN CAPITAL & TALENT
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hc_turnover (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_employees INTEGER DEFAULT 0,
  departures INTEGER DEFAULT 0,
  voluntary_departures INTEGER DEFAULT 0,
  involuntary_departures INTEGER DEFAULT 0,
  turnover_rate_pct NUMERIC DEFAULT 0,
  voluntary_rate_pct NUMERIC DEFAULT 0,
  industry_avg_turnover NUMERIC DEFAULT 0,
  avg_tenure_months NUMERIC DEFAULT 0,
  avg_cost_per_departure NUMERIC DEFAULT 0,
  total_turnover_cost NUMERIC DEFAULT 0,
  top_departure_reason TEXT,
  regrettable_departures INTEGER DEFAULT 0,
  regrettable_pct NUMERIC DEFAULT 0,
  avg_time_to_fill_days NUMERIC DEFAULT 0,
  open_positions INTEGER DEFAULT 0,
  open_position_cost_monthly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS hc_compensation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role_title TEXT NOT NULL,
  department TEXT,
  current_salary NUMERIC DEFAULT 0,
  market_median NUMERIC DEFAULT 0,
  market_25th NUMERIC DEFAULT 0,
  market_75th NUMERIC DEFAULT 0,
  compa_ratio NUMERIC DEFAULT 0,
  total_comp NUMERIC DEFAULT 0,
  market_total_comp NUMERIC DEFAULT 0,
  is_below_market BOOLEAN DEFAULT false,
  is_above_market BOOLEAN DEFAULT false,
  flight_risk BOOLEAN DEFAULT false,
  performance_rating NUMERIC DEFAULT 0,
  years_in_role NUMERIC DEFAULT 0,
  last_raise_date DATE,
  months_since_raise INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role_title)
);

CREATE TABLE IF NOT EXISTS hc_hiring (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  positions_opened INTEGER DEFAULT 0,
  positions_filled INTEGER DEFAULT 0,
  positions_cancelled INTEGER DEFAULT 0,
  total_applicants INTEGER DEFAULT 0,
  interviews_conducted INTEGER DEFAULT 0,
  offers_extended INTEGER DEFAULT 0,
  offers_accepted INTEGER DEFAULT 0,
  offer_acceptance_rate_pct NUMERIC DEFAULT 0,
  avg_time_to_fill_days NUMERIC DEFAULT 0,
  avg_cost_per_hire NUMERIC DEFAULT 0,
  total_recruiting_spend NUMERIC DEFAULT 0,
  agency_fees NUMERIC DEFAULT 0,
  job_board_spend NUMERIC DEFAULT 0,
  internal_recruiter_cost NUMERIC DEFAULT 0,
  quality_of_hire_score NUMERIC DEFAULT 0,
  new_hire_retention_90d_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE U: DATA & CYBERSECURITY POSTURE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sec_assessment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  overall_score INTEGER DEFAULT 0,
  password_policy_score INTEGER DEFAULT 0,
  mfa_adoption_pct NUMERIC DEFAULT 0,
  endpoints_patched_pct NUMERIC DEFAULT 0,
  backup_frequency TEXT,
  backup_tested_recently BOOLEAN DEFAULT false,
  last_backup_test DATE,
  encryption_at_rest BOOLEAN DEFAULT false,
  encryption_in_transit BOOLEAN DEFAULT true,
  employee_training_completed_pct NUMERIC DEFAULT 0,
  last_training_date DATE,
  phishing_test_fail_rate_pct NUMERIC DEFAULT 0,
  admin_accounts INTEGER DEFAULT 0,
  excessive_admin_access BOOLEAN DEFAULT false,
  third_party_integrations INTEGER DEFAULT 0,
  unreviewed_integrations INTEGER DEFAULT 0,
  incident_response_plan BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS sec_breach_risk (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  pii_records_count INTEGER DEFAULT 0,
  payment_data_stored BOOLEAN DEFAULT false,
  health_data_stored BOOLEAN DEFAULT false,
  data_classification_exists BOOLEAN DEFAULT false,
  data_retention_policy BOOLEAN DEFAULT false,
  estimated_breach_cost NUMERIC DEFAULT 0,
  cyber_insurance_coverage NUMERIC DEFAULT 0,
  coverage_gap NUMERIC DEFAULT 0,
  gdpr_applicable BOOLEAN DEFAULT false,
  ccpa_applicable BOOLEAN DEFAULT false,
  hipaa_applicable BOOLEAN DEFAULT false,
  compliance_gaps INTEGER DEFAULT 0,
  estimated_fine_risk NUMERIC DEFAULT 0,
  vendor_risk_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS sec_access (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_user_accounts INTEGER DEFAULT 0,
  active_accounts INTEGER DEFAULT 0,
  inactive_accounts INTEGER DEFAULT 0,
  orphaned_accounts INTEGER DEFAULT 0,
  shared_accounts INTEGER DEFAULT 0,
  mfa_enabled_pct NUMERIC DEFAULT 0,
  weak_passwords_detected INTEGER DEFAULT 0,
  privileged_accounts INTEGER DEFAULT 0,
  excessive_permissions INTEGER DEFAULT 0,
  last_access_review DATE,
  months_since_review INTEGER DEFAULT 0,
  saas_apps_connected INTEGER DEFAULT 0,
  saas_with_sso INTEGER DEFAULT 0,
  shadow_it_detected INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE V: GROWTH & MARKET POSITION
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS grow_competitors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  competitor_name TEXT NOT NULL,
  market_position TEXT,
  estimated_revenue NUMERIC DEFAULT 0,
  estimated_market_share_pct NUMERIC DEFAULT 0,
  price_vs_us TEXT,
  price_difference_pct NUMERIC DEFAULT 0,
  strengths TEXT,
  weaknesses TEXT,
  recent_moves TEXT,
  threat_level TEXT DEFAULT 'medium',
  our_advantage TEXT,
  our_vulnerability TEXT,
  win_rate_against_pct NUMERIC DEFAULT 0,
  loss_reason_top TEXT,
  last_analyzed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, competitor_name)
);

CREATE TABLE IF NOT EXISTS grow_market (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  analysis_date DATE NOT NULL,
  total_addressable_market NUMERIC DEFAULT 0,
  serviceable_addressable_market NUMERIC DEFAULT 0,
  serviceable_obtainable_market NUMERIC DEFAULT 0,
  current_revenue NUMERIC DEFAULT 0,
  market_penetration_pct NUMERIC DEFAULT 0,
  market_growth_rate_pct NUMERIC DEFAULT 0,
  our_growth_rate_pct NUMERIC DEFAULT 0,
  growing_faster_than_market BOOLEAN DEFAULT false,
  untapped_segments JSONB DEFAULT '[]',
  geographic_expansion_potential JSONB DEFAULT '[]',
  product_expansion_potential JSONB DEFAULT '[]',
  pricing_power_score NUMERIC DEFAULT 0,
  customer_concentration_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, analysis_date)
);

CREATE TABLE IF NOT EXISTS grow_readiness (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  overall_readiness_score INTEGER DEFAULT 0,
  financial_health_score INTEGER DEFAULT 0,
  operational_scalability_score INTEGER DEFAULT 0,
  team_readiness_score INTEGER DEFAULT 0,
  technology_scalability_score INTEGER DEFAULT 0,
  brand_strength_score INTEGER DEFAULT 0,
  process_documentation_pct NUMERIC DEFAULT 0,
  key_person_dependency INTEGER DEFAULT 0,
  bottleneck_at_scale TEXT,
  max_capacity_before_hire TEXT,
  estimated_expansion_cost NUMERIC DEFAULT 0,
  estimated_expansion_roi_months NUMERIC DEFAULT 0,
  risk_factors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE W: ENERGY & SUSTAINABILITY
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS green_energy (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  electricity_kwh NUMERIC DEFAULT 0,
  electricity_cost NUMERIC DEFAULT 0,
  gas_therms NUMERIC DEFAULT 0,
  gas_cost NUMERIC DEFAULT 0,
  water_gallons NUMERIC DEFAULT 0,
  water_cost NUMERIC DEFAULT 0,
  total_energy_cost NUMERIC DEFAULT 0,
  cost_per_sqft NUMERIC DEFAULT 0,
  industry_avg_cost_per_sqft NUMERIC DEFAULT 0,
  above_avg_pct NUMERIC DEFAULT 0,
  peak_demand_kw NUMERIC DEFAULT 0,
  demand_charges NUMERIC DEFAULT 0,
  renewable_pct NUMERIC DEFAULT 0,
  energy_star_score INTEGER DEFAULT 0,
  yoy_change_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS green_carbon (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  reporting_year INTEGER NOT NULL,
  scope_1_tons NUMERIC DEFAULT 0,
  scope_2_tons NUMERIC DEFAULT 0,
  scope_3_tons NUMERIC DEFAULT 0,
  total_co2_tons NUMERIC DEFAULT 0,
  co2_per_employee NUMERIC DEFAULT 0,
  co2_per_revenue_million NUMERIC DEFAULT 0,
  industry_avg_per_employee NUMERIC DEFAULT 0,
  carbon_tax_applicable BOOLEAN DEFAULT false,
  carbon_tax_rate NUMERIC DEFAULT 0,
  carbon_tax_liability NUMERIC DEFAULT 0,
  offset_credits_purchased NUMERIC DEFAULT 0,
  offset_cost NUMERIC DEFAULT 0,
  reduction_target_pct NUMERIC DEFAULT 0,
  actual_reduction_pct NUMERIC DEFAULT 0,
  on_track BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, reporting_year)
);

CREATE TABLE IF NOT EXISTS green_incentives (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  incentive_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  jurisdiction TEXT,
  estimated_value NUMERIC DEFAULT 0,
  eligibility_status TEXT DEFAULT 'unknown',
  application_deadline DATE,
  requirements TEXT,
  effort_to_claim TEXT DEFAULT 'medium',
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_digi_web_biz ON digi_website(business_id);
CREATE INDEX IF NOT EXISTS idx_digi_camp_biz ON digi_campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_digi_cont_biz ON digi_content(business_id);
CREATE INDEX IF NOT EXISTS idx_hc_turn_biz ON hc_turnover(business_id);
CREATE INDEX IF NOT EXISTS idx_hc_comp_biz ON hc_compensation(business_id);
CREATE INDEX IF NOT EXISTS idx_hc_hire_biz ON hc_hiring(business_id);
CREATE INDEX IF NOT EXISTS idx_sec_assess_biz ON sec_assessment(business_id);
CREATE INDEX IF NOT EXISTS idx_sec_breach_biz ON sec_breach_risk(business_id);
CREATE INDEX IF NOT EXISTS idx_sec_access_biz ON sec_access(business_id);
CREATE INDEX IF NOT EXISTS idx_grow_comp_biz ON grow_competitors(business_id);
CREATE INDEX IF NOT EXISTS idx_grow_mkt_biz ON grow_market(business_id);
CREATE INDEX IF NOT EXISTS idx_grow_ready_biz ON grow_readiness(business_id);
CREATE INDEX IF NOT EXISTS idx_green_energy_biz ON green_energy(business_id);
CREATE INDEX IF NOT EXISTS idx_green_carbon_biz ON green_carbon(business_id);
CREATE INDEX IF NOT EXISTS idx_green_incent_biz ON green_incentives(business_id);

ALTER TABLE digi_website DISABLE ROW LEVEL SECURITY;
ALTER TABLE digi_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE digi_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE hc_turnover DISABLE ROW LEVEL SECURITY;
ALTER TABLE hc_compensation DISABLE ROW LEVEL SECURITY;
ALTER TABLE hc_hiring DISABLE ROW LEVEL SECURITY;
ALTER TABLE sec_assessment DISABLE ROW LEVEL SECURITY;
ALTER TABLE sec_breach_risk DISABLE ROW LEVEL SECURITY;
ALTER TABLE sec_access DISABLE ROW LEVEL SECURITY;
ALTER TABLE grow_competitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE grow_market DISABLE ROW LEVEL SECURITY;
ALTER TABLE grow_readiness DISABLE ROW LEVEL SECURITY;
ALTER TABLE green_energy DISABLE ROW LEVEL SECURITY;
ALTER TABLE green_carbon DISABLE ROW LEVEL SECURITY;
ALTER TABLE green_incentives DISABLE ROW LEVEL SECURITY;

-- === 007-add-sentinel-tables.sql ===
-- =============================================================================
-- SENTINEL LAYER — 15 Tables
-- =============================================================================
-- Module N: Vendor & Supply Chain Intelligence (3 tables)
-- Module O: Customer Experience & Reputation (3 tables)
-- Module P: Operational Efficiency (3 tables)
-- Module Q: Strategic Planning & Forecasting (3 tables)
-- Module R: Partnership & Channel Economics (3 tables)
-- =============================================================================

-- ═══════════════════════════════════════════════════════════
-- MODULE N: VENDOR & SUPPLY CHAIN INTELLIGENCE
-- ═══════════════════════════════════════════════════════════

-- N1. Vendor Scorecards
CREATE TABLE IF NOT EXISTS vend_scorecards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor_name TEXT NOT NULL,
  vendor_category TEXT, -- materials, services, technology, logistics, professional, equipment
  annual_spend NUMERIC DEFAULT 0,
  spend_pct_of_total NUMERIC DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  payment_terms TEXT, -- net_15, net_30, net_60, prepay
  on_time_delivery_pct NUMERIC DEFAULT 0,
  quality_score NUMERIC DEFAULT 0, -- 0-100
  defect_rate_pct NUMERIC DEFAULT 0,
  responsiveness_score NUMERIC DEFAULT 0, -- 0-100
  price_competitiveness_score NUMERIC DEFAULT 0, -- 0-100 (vs market alternatives)
  price_increases_12mo INTEGER DEFAULT 0,
  total_price_increase_pct NUMERIC DEFAULT 0,
  alternatives_count INTEGER DEFAULT 0, -- known alternatives
  switching_cost_estimate NUMERIC DEFAULT 0,
  single_source_risk BOOLEAN DEFAULT false,
  dispute_count_12mo INTEGER DEFAULT 0,
  credit_memo_total NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0, -- composite 0-100
  status TEXT DEFAULT 'active',
  last_reviewed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, vendor_name)
);

-- N2. Supply Concentration Risk
CREATE TABLE IF NOT EXISTS vend_concentration (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_vendors INTEGER DEFAULT 0,
  total_annual_spend NUMERIC DEFAULT 0,
  top_vendor_name TEXT,
  top_vendor_spend NUMERIC DEFAULT 0,
  top_vendor_pct NUMERIC DEFAULT 0,
  top_3_pct NUMERIC DEFAULT 0,
  top_5_pct NUMERIC DEFAULT 0,
  single_source_categories INTEGER DEFAULT 0,
  single_source_spend NUMERIC DEFAULT 0,
  herfindahl_index NUMERIC DEFAULT 0, -- concentration metric (0-10000)
  geographic_concentration TEXT, -- local_only, regional, national, international
  lead_time_avg_days NUMERIC DEFAULT 0,
  critical_vendor_count INTEGER DEFAULT 0, -- vendors where disruption = business halt
  backup_vendor_coverage_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- N3. Price Trend Monitoring
CREATE TABLE IF NOT EXISTS vend_pricing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor_name TEXT NOT NULL,
  item_or_service TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  quantity NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  price_12mo_ago NUMERIC DEFAULT 0,
  price_change_pct NUMERIC DEFAULT 0,
  market_price NUMERIC DEFAULT 0,
  above_market_pct NUMERIC DEFAULT 0,
  volume_discount_available BOOLEAN DEFAULT false,
  volume_discount_threshold NUMERIC DEFAULT 0,
  current_volume NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, vendor_name, item_or_service, period_start)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE O: CUSTOMER EXPERIENCE & REPUTATION
-- ═══════════════════════════════════════════════════════════

-- O1. Review & Reputation Tracking
CREATE TABLE IF NOT EXISTS cx_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  platform TEXT NOT NULL, -- google, yelp, trustpilot, bbb, g2, capterra, facebook, industry_specific
  total_reviews INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  rating_5_pct NUMERIC DEFAULT 0,
  rating_1_2_pct NUMERIC DEFAULT 0,
  new_reviews_30d INTEGER DEFAULT 0,
  new_avg_30d NUMERIC DEFAULT 0,
  response_rate_pct NUMERIC DEFAULT 0,
  avg_response_time_hours NUMERIC DEFAULT 0,
  sentiment_positive_pct NUMERIC DEFAULT 0,
  sentiment_negative_pct NUMERIC DEFAULT 0,
  top_complaint TEXT,
  top_praise TEXT,
  competitor_avg_rating NUMERIC DEFAULT 0,
  rating_vs_competitor NUMERIC DEFAULT 0,
  review_velocity_trend TEXT DEFAULT 'stable', -- increasing, stable, declining
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date, platform)
);

-- O2. Support Cost & Resolution
CREATE TABLE IF NOT EXISTS cx_support (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_tickets INTEGER DEFAULT 0,
  tickets_per_100_customers NUMERIC DEFAULT 0,
  avg_resolution_hours NUMERIC DEFAULT 0,
  first_contact_resolution_pct NUMERIC DEFAULT 0,
  escalation_rate_pct NUMERIC DEFAULT 0,
  total_support_cost NUMERIC DEFAULT 0,
  cost_per_ticket NUMERIC DEFAULT 0,
  cost_per_customer NUMERIC DEFAULT 0,
  industry_avg_cost_per_ticket NUMERIC DEFAULT 0,
  refunds_issued_count INTEGER DEFAULT 0,
  refund_total NUMERIC DEFAULT 0,
  credits_issued NUMERIC DEFAULT 0,
  top_issue_category TEXT,
  top_issue_pct NUMERIC DEFAULT 0,
  repeat_contact_pct NUMERIC DEFAULT 0,
  csat_score NUMERIC DEFAULT 0,
  nps_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

-- O3. Customer Acquisition Cost
CREATE TABLE IF NOT EXISTS cx_acquisition (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  channel TEXT NOT NULL, -- organic, paid_search, paid_social, referral, direct, email, events, partnerships, cold_outreach
  spend NUMERIC DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  conversion_rate_pct NUMERIC DEFAULT 0,
  customers_acquired INTEGER DEFAULT 0,
  cac NUMERIC DEFAULT 0, -- customer acquisition cost
  avg_first_deal_value NUMERIC DEFAULT 0,
  cac_payback_months NUMERIC DEFAULT 0,
  ltv_to_cac_ratio NUMERIC DEFAULT 0,
  industry_avg_cac NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, channel)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE P: OPERATIONAL EFFICIENCY
-- ═══════════════════════════════════════════════════════════

-- P1. Process Bottleneck Analysis
CREATE TABLE IF NOT EXISTS ops_bottlenecks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  process_name TEXT NOT NULL,
  process_category TEXT, -- sales, fulfillment, onboarding, billing, support, production, admin
  avg_cycle_time_hours NUMERIC DEFAULT 0,
  benchmark_cycle_time NUMERIC DEFAULT 0,
  excess_time_pct NUMERIC DEFAULT 0,
  manual_steps INTEGER DEFAULT 0,
  automatable_steps INTEGER DEFAULT 0,
  automation_potential_pct NUMERIC DEFAULT 0,
  error_rate_pct NUMERIC DEFAULT 0,
  rework_rate_pct NUMERIC DEFAULT 0,
  bottleneck_step TEXT,
  bottleneck_wait_hours NUMERIC DEFAULT 0,
  estimated_cost_of_delay NUMERIC DEFAULT 0, -- monthly
  people_involved INTEGER DEFAULT 0,
  hours_per_week NUMERIC DEFAULT 0,
  hourly_cost NUMERIC DEFAULT 0,
  total_weekly_cost NUMERIC DEFAULT 0,
  automation_cost_estimate NUMERIC DEFAULT 0,
  automation_roi_months NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, process_name)
);

-- P2. Meeting & Calendar Waste
CREATE TABLE IF NOT EXISTS ops_meetings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_meetings_week INTEGER DEFAULT 0,
  total_meeting_hours_week NUMERIC DEFAULT 0,
  avg_meeting_duration_min NUMERIC DEFAULT 0,
  avg_attendees NUMERIC DEFAULT 0,
  total_person_hours_week NUMERIC DEFAULT 0,
  estimated_hourly_cost NUMERIC DEFAULT 0,
  total_weekly_meeting_cost NUMERIC DEFAULT 0,
  meetings_with_no_agenda_pct NUMERIC DEFAULT 0,
  meetings_over_30min_pct NUMERIC DEFAULT 0,
  recurring_meetings_pct NUMERIC DEFAULT 0,
  meetings_that_could_be_email_pct NUMERIC DEFAULT 0,
  avg_productive_pct NUMERIC DEFAULT 0, -- survey-based
  wasted_meeting_cost_weekly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- P3. Capacity & Utilization
CREATE TABLE IF NOT EXISTS ops_capacity (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  department TEXT NOT NULL,
  total_hours_available NUMERIC DEFAULT 0,
  total_hours_billable NUMERIC DEFAULT 0,
  total_hours_internal NUMERIC DEFAULT 0,
  total_hours_idle NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  billable_pct NUMERIC DEFAULT 0,
  target_utilization NUMERIC DEFAULT 0,
  gap_pct NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_cost NUMERIC DEFAULT 0,
  contractor_hours NUMERIC DEFAULT 0,
  contractor_cost NUMERIC DEFAULT 0,
  revenue_per_hour NUMERIC DEFAULT 0,
  cost_per_hour NUMERIC DEFAULT 0,
  margin_per_hour NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, department)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE Q: STRATEGIC PLANNING & FORECASTING
-- ═══════════════════════════════════════════════════════════

-- Q1. Budget vs Actual Variance
CREATE TABLE IF NOT EXISTS plan_budget (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  category TEXT NOT NULL, -- revenue, cogs, payroll, marketing, rent, utilities, insurance, professional_services, technology, travel, misc
  budget_amount NUMERIC DEFAULT 0,
  actual_amount NUMERIC DEFAULT 0,
  variance NUMERIC DEFAULT 0,
  variance_pct NUMERIC DEFAULT 0,
  favorable BOOLEAN DEFAULT true, -- true = under budget (expense) or over budget (revenue)
  ytd_budget NUMERIC DEFAULT 0,
  ytd_actual NUMERIC DEFAULT 0,
  ytd_variance NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, category)
);

-- Q2. KPI Health Dashboard
CREATE TABLE IF NOT EXISTS plan_kpis (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  kpi_name TEXT NOT NULL,
  kpi_category TEXT, -- financial, operational, customer, employee, growth
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC DEFAULT 0,
  previous_period_value NUMERIC DEFAULT 0,
  trend TEXT DEFAULT 'stable', -- improving, stable, declining
  on_target BOOLEAN DEFAULT true,
  variance_pct NUMERIC DEFAULT 0,
  unit TEXT, -- pct, dollars, days, count, ratio
  priority TEXT DEFAULT 'medium', -- critical, high, medium, low
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date, kpi_name)
);

-- Q3. Cash Runway Projection
CREATE TABLE IF NOT EXISTS plan_runway (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  projection_date DATE NOT NULL,
  current_cash NUMERIC DEFAULT 0,
  monthly_revenue_avg NUMERIC DEFAULT 0,
  monthly_expenses_avg NUMERIC DEFAULT 0,
  monthly_burn_rate NUMERIC DEFAULT 0,
  revenue_growth_pct NUMERIC DEFAULT 0,
  expense_growth_pct NUMERIC DEFAULT 0,
  runway_months_optimistic NUMERIC DEFAULT 0,
  runway_months_realistic NUMERIC DEFAULT 0,
  runway_months_pessimistic NUMERIC DEFAULT 0,
  breakeven_date_estimate DATE,
  cash_zero_date_estimate DATE,
  upcoming_large_expenses JSONB DEFAULT '[]',
  upcoming_large_inflows JSONB DEFAULT '[]',
  scenario TEXT DEFAULT 'baseline', -- baseline, growth, contraction, worst_case
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, projection_date, scenario)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE R: PARTNERSHIP & CHANNEL ECONOMICS
-- ═══════════════════════════════════════════════════════════

-- R1. Referral & Affiliate Performance
CREATE TABLE IF NOT EXISTS part_referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  partner_name TEXT NOT NULL,
  partner_type TEXT, -- affiliate, referral_partner, reseller, agency, strategic_alliance
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  leads_referred INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  conversion_rate_pct NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  commission_paid NUMERIC DEFAULT 0,
  commission_rate_pct NUMERIC DEFAULT 0,
  cost_per_acquisition NUMERIC DEFAULT 0,
  avg_deal_size NUMERIC DEFAULT 0,
  avg_customer_ltv NUMERIC DEFAULT 0,
  roi_pct NUMERIC DEFAULT 0,
  is_profitable BOOLEAN DEFAULT true,
  days_since_last_referral INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, partner_name, period_start)
);

-- R2. Channel Mix & Attribution
CREATE TABLE IF NOT EXISTS part_channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  channel TEXT NOT NULL, -- direct_sales, channel_partners, online, marketplace, inbound, outbound, referral, upsell
  revenue NUMERIC DEFAULT 0,
  revenue_pct NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  margin NUMERIC DEFAULT 0,
  margin_pct NUMERIC DEFAULT 0,
  customers_acquired INTEGER DEFAULT 0,
  avg_deal_size NUMERIC DEFAULT 0,
  sales_cycle_days NUMERIC DEFAULT 0,
  ltv_avg NUMERIC DEFAULT 0,
  churn_rate_pct NUMERIC DEFAULT 0,
  growth_rate_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, channel)
);

-- R3. Commission & Payout Optimization
CREATE TABLE IF NOT EXISTS part_commissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  recipient_name TEXT NOT NULL,
  recipient_type TEXT, -- employee, affiliate, partner, reseller
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_revenue_attributed NUMERIC DEFAULT 0,
  commission_rate_pct NUMERIC DEFAULT 0,
  commission_earned NUMERIC DEFAULT 0,
  commission_paid NUMERIC DEFAULT 0,
  commission_owed NUMERIC DEFAULT 0,
  clawback_eligible NUMERIC DEFAULT 0, -- commissions on churned customers
  effective_commission_pct NUMERIC DEFAULT 0, -- after adjustments
  revenue_per_commission_dollar NUMERIC DEFAULT 0,
  is_overpaid BOOLEAN DEFAULT false,
  overpayment_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, recipient_name, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vend_score_biz ON vend_scorecards(business_id);
CREATE INDEX IF NOT EXISTS idx_vend_conc_biz ON vend_concentration(business_id);
CREATE INDEX IF NOT EXISTS idx_vend_price_biz ON vend_pricing(business_id);
CREATE INDEX IF NOT EXISTS idx_cx_rev_biz ON cx_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_cx_sup_biz ON cx_support(business_id);
CREATE INDEX IF NOT EXISTS idx_cx_acq_biz ON cx_acquisition(business_id);
CREATE INDEX IF NOT EXISTS idx_ops_bot_biz ON ops_bottlenecks(business_id);
CREATE INDEX IF NOT EXISTS idx_ops_meet_biz ON ops_meetings(business_id);
CREATE INDEX IF NOT EXISTS idx_ops_cap_biz ON ops_capacity(business_id);
CREATE INDEX IF NOT EXISTS idx_plan_bud_biz ON plan_budget(business_id);
CREATE INDEX IF NOT EXISTS idx_plan_kpi_biz ON plan_kpis(business_id);
CREATE INDEX IF NOT EXISTS idx_plan_run_biz ON plan_runway(business_id);
CREATE INDEX IF NOT EXISTS idx_part_ref_biz ON part_referrals(business_id);
CREATE INDEX IF NOT EXISTS idx_part_chan_biz ON part_channels(business_id);
CREATE INDEX IF NOT EXISTS idx_part_comm_biz ON part_commissions(business_id);

ALTER TABLE vend_scorecards DISABLE ROW LEVEL SECURITY;
ALTER TABLE vend_concentration DISABLE ROW LEVEL SECURITY;
ALTER TABLE vend_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE cx_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE cx_support DISABLE ROW LEVEL SECURITY;
ALTER TABLE cx_acquisition DISABLE ROW LEVEL SECURITY;
ALTER TABLE ops_bottlenecks DISABLE ROW LEVEL SECURITY;
ALTER TABLE ops_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE ops_capacity DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_budget DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_runway DISABLE ROW LEVEL SECURITY;
ALTER TABLE part_referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE part_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE part_commissions DISABLE ROW LEVEL SECURITY;

-- === 008-add-catalyst-tables.sql ===
-- =============================================================================
-- CATALYST LAYER — 15 Tables
-- =============================================================================
-- Module BB: Leadership Leverage & Founder Bandwidth (3 tables)
-- Module BC: Capital Efficiency & Investment Allocation (3 tables)
-- Module BD: Market Timing & Positioning Drift (3 tables)
-- Module BE: Customer Outcomes & Promise Delivery (3 tables)
-- Module BF: Operational Leverage & Scalability Readiness (3 tables)
-- =============================================================================

-- MODULE BB: LEADERSHIP LEVERAGE
CREATE TABLE IF NOT EXISTS lead_time_allocation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  person TEXT NOT NULL,
  role TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours_worked NUMERIC DEFAULT 0,
  strategic_pct NUMERIC DEFAULT 0,
  operational_pct NUMERIC DEFAULT 0,
  administrative_pct NUMERIC DEFAULT 0,
  firefighting_pct NUMERIC DEFAULT 0,
  people_management_pct NUMERIC DEFAULT 0,
  selling_pct NUMERIC DEFAULT 0,
  learning_pct NUMERIC DEFAULT 0,
  tasks_only_they_can_do_pct NUMERIC DEFAULT 0,
  tasks_should_delegate_pct NUMERIC DEFAULT 0,
  hourly_value NUMERIC DEFAULT 0,
  value_of_delegatable NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, person, period_start)
);

CREATE TABLE IF NOT EXISTS lead_decision_velocity (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  avg_decision_time_days NUMERIC DEFAULT 0,
  decisions_pending INTEGER DEFAULT 0,
  decisions_blocked_by_founder INTEGER DEFAULT 0,
  delegation_score NUMERIC DEFAULT 0,
  team_autonomy_score NUMERIC DEFAULT 0,
  reversible_decisions_escalated_pct NUMERIC DEFAULT 0,
  meeting_hours_per_week NUMERIC DEFAULT 0,
  meetings_that_need_them_pct NUMERIC DEFAULT 0,
  single_approver_processes INTEGER DEFAULT 0,
  bottleneck_cost_monthly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS lead_energy_audit (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  person TEXT NOT NULL,
  assessment_date DATE NOT NULL,
  energy_level NUMERIC DEFAULT 0,
  burnout_risk TEXT DEFAULT 'low',
  hours_in_zone_of_genius_pct NUMERIC DEFAULT 0,
  hours_in_zone_of_competence_pct NUMERIC DEFAULT 0,
  hours_in_zone_of_incompetence_pct NUMERIC DEFAULT 0,
  biggest_energy_drain TEXT,
  biggest_energy_source TEXT,
  vacation_days_taken_ytd NUMERIC DEFAULT 0,
  vacation_days_available NUMERIC DEFAULT 0,
  weekend_work_frequency TEXT DEFAULT 'sometimes',
  creative_time_hours_weekly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, person, assessment_date)
);

-- MODULE BC: CAPITAL EFFICIENCY
CREATE TABLE IF NOT EXISTS cap_allocation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  category TEXT NOT NULL,
  subcategory TEXT,
  annual_spend NUMERIC DEFAULT 0,
  pct_of_revenue NUMERIC DEFAULT 0,
  industry_benchmark_pct NUMERIC DEFAULT 0,
  expected_roi NUMERIC DEFAULT 0,
  actual_roi NUMERIC DEFAULT 0,
  roi_measured BOOLEAN DEFAULT false,
  strategic_alignment TEXT DEFAULT 'medium',
  could_reduce_by_pct NUMERIC DEFAULT 0,
  could_reduce_amount NUMERIC DEFAULT 0,
  last_reviewed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, category, subcategory)
);

CREATE TABLE IF NOT EXISTS cap_unit_economics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  cac NUMERIC DEFAULT 0,
  ltv NUMERIC DEFAULT 0,
  ltv_cac_ratio NUMERIC DEFAULT 0,
  payback_period_months NUMERIC DEFAULT 0,
  gross_margin_pct NUMERIC DEFAULT 0,
  net_margin_pct NUMERIC DEFAULT 0,
  burn_rate_monthly NUMERIC DEFAULT 0,
  revenue_per_employee NUMERIC DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  cost_per_qualified_lead NUMERIC DEFAULT 0,
  cost_per_demo NUMERIC DEFAULT 0,
  cost_per_close NUMERIC DEFAULT 0,
  magic_number NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS cap_investment_tracker (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  investment_name TEXT NOT NULL,
  category TEXT,
  amount NUMERIC DEFAULT 0,
  start_date DATE,
  expected_return NUMERIC DEFAULT 0,
  expected_return_date DATE,
  actual_return NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  roi_pct NUMERIC DEFAULT 0,
  time_to_roi_months NUMERIC DEFAULT 0,
  still_paying_off BOOLEAN DEFAULT true,
  lessons_learned TEXT,
  would_do_again BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, investment_name)
);

-- MODULE BD: MARKET POSITIONING
CREATE TABLE IF NOT EXISTS mkt_positioning (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  target_market_size NUMERIC DEFAULT 0,
  serviceable_market_size NUMERIC DEFAULT 0,
  current_penetration_pct NUMERIC DEFAULT 0,
  market_growth_rate_pct NUMERIC DEFAULT 0,
  your_growth_vs_market TEXT DEFAULT 'matching',
  positioning_clarity_score NUMERIC DEFAULT 0,
  ideal_customer_defined BOOLEAN DEFAULT false,
  message_market_fit_score NUMERIC DEFAULT 0,
  category_leader TEXT,
  your_category_rank INTEGER DEFAULT 0,
  price_position TEXT DEFAULT 'mid',
  trend_direction TEXT DEFAULT 'stable',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS mkt_signals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  signal_name TEXT NOT NULL,
  signal_type TEXT,
  direction TEXT DEFAULT 'neutral',
  strength TEXT DEFAULT 'medium',
  description TEXT,
  implication TEXT,
  action_required TEXT,
  urgency TEXT DEFAULT 'medium',
  detected_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, signal_name)
);

CREATE TABLE IF NOT EXISTS mkt_channel_effectiveness (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  channel TEXT NOT NULL,
  channel_type TEXT,
  monthly_spend NUMERIC DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  lead_to_customer_pct NUMERIC DEFAULT 0,
  cac_for_channel NUMERIC DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  roi NUMERIC DEFAULT 0,
  trend TEXT DEFAULT 'stable',
  saturated BOOLEAN DEFAULT false,
  untapped_potential TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, channel)
);

-- MODULE BE: CUSTOMER OUTCOMES
CREATE TABLE IF NOT EXISTS cust_outcomes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  outcome_name TEXT NOT NULL,
  promised_value TEXT,
  measurement_method TEXT,
  customers_measured_pct NUMERIC DEFAULT 0,
  customers_achieving_pct NUMERIC DEFAULT 0,
  avg_time_to_value_days NUMERIC DEFAULT 0,
  industry_avg_time_to_value NUMERIC DEFAULT 0,
  promise_delivery_gap TEXT DEFAULT 'none',
  top_barrier_to_outcome TEXT,
  nps_when_achieved NUMERIC DEFAULT 0,
  nps_when_not_achieved NUMERIC DEFAULT 0,
  churn_when_achieved_pct NUMERIC DEFAULT 0,
  churn_when_not_achieved_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, outcome_name)
);

CREATE TABLE IF NOT EXISTS cust_health_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_customers INTEGER DEFAULT 0,
  healthy_pct NUMERIC DEFAULT 0,
  at_risk_pct NUMERIC DEFAULT 0,
  critical_pct NUMERIC DEFAULT 0,
  avg_health_score NUMERIC DEFAULT 0,
  health_trending TEXT DEFAULT 'stable',
  top_risk_factor TEXT,
  proactive_outreach_pct NUMERIC DEFAULT 0,
  saves_attempted INTEGER DEFAULT 0,
  saves_successful INTEGER DEFAULT 0,
  save_rate_pct NUMERIC DEFAULT 0,
  revenue_saved NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS cust_feedback_loop (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  feedback_channels_active INTEGER DEFAULT 0,
  nps_survey_frequency TEXT DEFAULT 'never',
  last_nps_survey DATE,
  nps_score NUMERIC DEFAULT 0,
  response_rate_pct NUMERIC DEFAULT 0,
  feature_requests_open INTEGER DEFAULT 0,
  feature_requests_shipped_pct NUMERIC DEFAULT 0,
  avg_request_to_ship_days NUMERIC DEFAULT 0,
  complaints_open INTEGER DEFAULT 0,
  avg_complaint_resolution_days NUMERIC DEFAULT 0,
  closed_loop_pct NUMERIC DEFAULT 0,
  feedback_influenced_roadmap_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- MODULE BF: SCALABILITY READINESS
CREATE TABLE IF NOT EXISTS scale_readiness (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  current_revenue NUMERIC DEFAULT 0,
  target_2x_revenue NUMERIC DEFAULT 0,
  can_2x_without_hiring BOOLEAN DEFAULT false,
  can_2x_without_new_tech BOOLEAN DEFAULT false,
  can_2x_without_new_process BOOLEAN DEFAULT false,
  bottleneck_at_2x TEXT,
  cost_to_reach_2x NUMERIC DEFAULT 0,
  estimated_time_to_2x_months NUMERIC DEFAULT 0,
  biggest_scaling_risk TEXT,
  automation_score NUMERIC DEFAULT 0,
  process_maturity_score NUMERIC DEFAULT 0,
  tech_scalability_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS scale_constraints (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  constraint_name TEXT NOT NULL,
  constraint_type TEXT,
  current_capacity TEXT,
  capacity_limit TEXT,
  utilization_pct NUMERIC DEFAULT 0,
  breaks_at TEXT,
  cost_to_remove NUMERIC DEFAULT 0,
  time_to_remove_weeks NUMERIC DEFAULT 0,
  revenue_ceiling_if_not_removed NUMERIC DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, constraint_name)
);

CREATE TABLE IF NOT EXISTS scale_automation_gaps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  process_name TEXT NOT NULL,
  current_method TEXT DEFAULT 'manual',
  hours_per_week NUMERIC DEFAULT 0,
  error_rate_pct NUMERIC DEFAULT 0,
  automation_feasibility TEXT DEFAULT 'medium',
  automation_cost NUMERIC DEFAULT 0,
  time_saved_weekly_hours NUMERIC DEFAULT 0,
  annual_savings NUMERIC DEFAULT 0,
  blocks_scaling BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, process_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_time_biz ON lead_time_allocation(business_id);
CREATE INDEX IF NOT EXISTS idx_lead_dec_biz ON lead_decision_velocity(business_id);
CREATE INDEX IF NOT EXISTS idx_lead_eng_biz ON lead_energy_audit(business_id);
CREATE INDEX IF NOT EXISTS idx_cap_alloc_biz ON cap_allocation(business_id);
CREATE INDEX IF NOT EXISTS idx_cap_unit_biz ON cap_unit_economics(business_id);
CREATE INDEX IF NOT EXISTS idx_cap_inv_biz ON cap_investment_tracker(business_id);
CREATE INDEX IF NOT EXISTS idx_mkt_pos_biz ON mkt_positioning(business_id);
CREATE INDEX IF NOT EXISTS idx_mkt_sig_biz ON mkt_signals(business_id);
CREATE INDEX IF NOT EXISTS idx_mkt_chan_biz ON mkt_channel_effectiveness(business_id);
CREATE INDEX IF NOT EXISTS idx_cust_out_biz ON cust_outcomes(business_id);
CREATE INDEX IF NOT EXISTS idx_cust_hlth_biz ON cust_health_scores(business_id);
CREATE INDEX IF NOT EXISTS idx_cust_fb_biz ON cust_feedback_loop(business_id);
CREATE INDEX IF NOT EXISTS idx_scale_rdy_biz ON scale_readiness(business_id);
CREATE INDEX IF NOT EXISTS idx_scale_con_biz ON scale_constraints(business_id);
CREATE INDEX IF NOT EXISTS idx_scale_auto_biz ON scale_automation_gaps(business_id);

ALTER TABLE lead_time_allocation DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_decision_velocity DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_energy_audit DISABLE ROW LEVEL SECURITY;
ALTER TABLE cap_allocation DISABLE ROW LEVEL SECURITY;
ALTER TABLE cap_unit_economics DISABLE ROW LEVEL SECURITY;
ALTER TABLE cap_investment_tracker DISABLE ROW LEVEL SECURITY;
ALTER TABLE mkt_positioning DISABLE ROW LEVEL SECURITY;
ALTER TABLE mkt_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE mkt_channel_effectiveness DISABLE ROW LEVEL SECURITY;
ALTER TABLE cust_outcomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE cust_health_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE cust_feedback_loop DISABLE ROW LEVEL SECURITY;
ALTER TABLE scale_readiness DISABLE ROW LEVEL SECURITY;
ALTER TABLE scale_constraints DISABLE ROW LEVEL SECURITY;
ALTER TABLE scale_automation_gaps DISABLE ROW LEVEL SECURITY;

-- === 009-add-quantum-tables.sql ===
-- =============================================================================
-- QUANTUM LAYER — 15 Tables
-- =============================================================================
-- Module BQ: Micro-Decision Quality & Cognitive Load (3 tables)
-- Module BR: Behavioral Patterns & Habit Architecture (3 tables)
-- Module BS: Communication Fidelity & Signal Loss (3 tables)
-- Module BT: Attention Economics & Focus Architecture (3 tables)
-- Module BU: Compound Effects & Accumulation Physics (3 tables)
-- =============================================================================

-- MODULE BQ: MICRO-DECISIONS
CREATE TABLE IF NOT EXISTS micro_decision_audit (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  decision_domain TEXT NOT NULL,
  decisions_per_week INTEGER DEFAULT 0,
  reversible_pct NUMERIC DEFAULT 0,
  avg_time_spent_minutes NUMERIC DEFAULT 0,
  ideal_time_minutes NUMERIC DEFAULT 0,
  over_deliberated_pct NUMERIC DEFAULT 0,
  under_deliberated_pct NUMERIC DEFAULT 0,
  delegatable_pct NUMERIC DEFAULT 0,
  actually_delegated_pct NUMERIC DEFAULT 0,
  decision_fatigue_risk TEXT DEFAULT 'medium',
  quality_score NUMERIC DEFAULT 0,
  framework_exists BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, decision_domain)
);

CREATE TABLE IF NOT EXISTS micro_cognitive_load (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role TEXT NOT NULL,
  context_switches_per_day INTEGER DEFAULT 0,
  open_loops_tracked INTEGER DEFAULT 0,
  tools_used_daily INTEGER DEFAULT 0,
  notifications_per_day INTEGER DEFAULT 0,
  interruptions_per_hour NUMERIC DEFAULT 0,
  deep_work_hours_per_day NUMERIC DEFAULT 0,
  recovery_time_per_switch_minutes NUMERIC DEFAULT 0,
  cognitive_overhead_pct NUMERIC DEFAULT 0,
  mental_load_score NUMERIC DEFAULT 0,
  burnout_trajectory TEXT DEFAULT 'stable',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role)
);

CREATE TABLE IF NOT EXISTS micro_defaults (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  default_name TEXT NOT NULL,
  domain TEXT,
  current_default TEXT,
  optimal_default TEXT,
  pct_who_override NUMERIC DEFAULT 0,
  impact_of_wrong_default TEXT,
  annual_cost_of_wrong_default NUMERIC DEFAULT 0,
  changeable BOOLEAN DEFAULT true,
  last_reviewed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, default_name)
);

-- MODULE BR: BEHAVIORAL PATTERNS
CREATE TABLE IF NOT EXISTS behav_org_patterns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  pattern_name TEXT NOT NULL,
  pattern_type TEXT DEFAULT 'negative',
  frequency TEXT DEFAULT 'weekly',
  trigger TEXT,
  behavior TEXT,
  consequence TEXT,
  awareness_level TEXT DEFAULT 'unaware',
  reinforced_by TEXT,
  cost_per_occurrence NUMERIC DEFAULT 0,
  occurrences_per_month INTEGER DEFAULT 0,
  alternative_behavior TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, pattern_name)
);

CREATE TABLE IF NOT EXISTS behav_rituals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  ritual_name TEXT NOT NULL,
  ritual_type TEXT DEFAULT 'operational',
  frequency TEXT,
  participants TEXT,
  purpose TEXT,
  actually_achieves TEXT,
  effectiveness_score NUMERIC DEFAULT 0,
  time_cost_monthly_hours NUMERIC DEFAULT 0,
  should_exist BOOLEAN DEFAULT true,
  missing_rituals TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, ritual_name)
);

CREATE TABLE IF NOT EXISTS behav_incentive_alignment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role_or_team TEXT NOT NULL,
  stated_goal TEXT,
  actual_incentive TEXT,
  alignment TEXT DEFAULT 'partial',
  perverse_outcome TEXT,
  gaming_behavior_observed TEXT,
  cost_of_misalignment NUMERIC DEFAULT 0,
  fix TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role_or_team)
);

-- MODULE BS: COMMUNICATION FIDELITY
CREATE TABLE IF NOT EXISTS comm_signal_loss (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  communication_path TEXT NOT NULL,
  sender TEXT,
  receiver TEXT,
  message_type TEXT,
  fidelity_pct NUMERIC DEFAULT 0,
  common_distortion TEXT,
  information_lost TEXT,
  consequence_of_loss TEXT,
  frequency TEXT DEFAULT 'daily',
  cost_per_miscommunication NUMERIC DEFAULT 0,
  miscommunications_per_month INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, communication_path)
);

CREATE TABLE IF NOT EXISTS comm_handoff_quality (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  handoff_name TEXT NOT NULL,
  from_team TEXT,
  to_team TEXT,
  information_transferred_pct NUMERIC DEFAULT 0,
  context_lost TEXT,
  customer_feels TEXT,
  drops_per_month INTEGER DEFAULT 0,
  cost_per_drop NUMERIC DEFAULT 0,
  automation_possible BOOLEAN DEFAULT false,
  sla_exists BOOLEAN DEFAULT false,
  sla_met_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, handoff_name)
);

CREATE TABLE IF NOT EXISTS comm_knowledge_flow (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  knowledge_type TEXT NOT NULL,
  source TEXT,
  intended_destination TEXT,
  actual_reach_pct NUMERIC DEFAULT 0,
  bottleneck TEXT,
  format TEXT,
  findable BOOLEAN DEFAULT true,
  up_to_date BOOLEAN DEFAULT true,
  time_to_find_minutes NUMERIC DEFAULT 0,
  cost_of_not_knowing NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, knowledge_type)
);

-- MODULE BT: ATTENTION ECONOMICS
CREATE TABLE IF NOT EXISTS attn_interruption_audit (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  interruption_source TEXT NOT NULL,
  interruptions_per_day NUMERIC DEFAULT 0,
  avg_recovery_minutes NUMERIC DEFAULT 0,
  total_daily_cost_minutes NUMERIC DEFAULT 0,
  eliminable BOOLEAN DEFAULT false,
  reducible BOOLEAN DEFAULT true,
  reduction_method TEXT,
  affects_roles TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, interruption_source)
);

CREATE TABLE IF NOT EXISTS attn_focus_blocks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role TEXT NOT NULL,
  focus_hours_available NUMERIC DEFAULT 0,
  focus_hours_protected NUMERIC DEFAULT 0,
  focus_hours_actually_achieved NUMERIC DEFAULT 0,
  biggest_focus_killer TEXT,
  work_requiring_focus_hours NUMERIC DEFAULT 0,
  focus_deficit_hours NUMERIC DEFAULT 0,
  output_quality_with_focus NUMERIC DEFAULT 0,
  output_quality_without_focus NUMERIC DEFAULT 0,
  quality_gap_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role)
);

CREATE TABLE IF NOT EXISTS attn_priority_drift (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  week_of DATE NOT NULL,
  planned_priority_1 TEXT,
  actual_priority_1 TEXT,
  drift_occurred BOOLEAN DEFAULT false,
  drift_cause TEXT,
  planned_vs_actual_alignment_pct NUMERIC DEFAULT 0,
  reactive_pct NUMERIC DEFAULT 0,
  proactive_pct NUMERIC DEFAULT 0,
  strategic_pct NUMERIC DEFAULT 0,
  wasted_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, week_of)
);

-- MODULE BU: COMPOUND EFFECTS
CREATE TABLE IF NOT EXISTS compound_positive (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  effect_name TEXT NOT NULL,
  category TEXT,
  started_when TEXT,
  current_value NUMERIC DEFAULT 0,
  growth_rate_monthly_pct NUMERIC DEFAULT 0,
  projected_12mo_value NUMERIC DEFAULT 0,
  investment_to_accelerate NUMERIC DEFAULT 0,
  accelerated_growth_rate_pct NUMERIC DEFAULT 0,
  at_risk BOOLEAN DEFAULT false,
  risk_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, effect_name)
);

CREATE TABLE IF NOT EXISTS compound_negative (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  effect_name TEXT NOT NULL,
  category TEXT,
  started_when TEXT,
  current_cost_monthly NUMERIC DEFAULT 0,
  growth_rate_monthly_pct NUMERIC DEFAULT 0,
  projected_12mo_cost NUMERIC DEFAULT 0,
  cost_to_stop NUMERIC DEFAULT 0,
  cost_if_ignored_12mo NUMERIC DEFAULT 0,
  reversible BOOLEAN DEFAULT true,
  intervention_point TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, effect_name)
);

CREATE TABLE IF NOT EXISTS compound_tipping_points (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  tipping_point_name TEXT NOT NULL,
  category TEXT,
  direction TEXT DEFAULT 'negative',
  current_position_pct NUMERIC DEFAULT 0,
  threshold_pct NUMERIC DEFAULT 100,
  distance_to_tip NUMERIC DEFAULT 0,
  velocity_toward_tip TEXT DEFAULT 'stable',
  consequence_if_tipped TEXT,
  reversible_after_tip BOOLEAN DEFAULT true,
  early_warning_metric TEXT,
  intervention_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, tipping_point_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_micro_dec_biz ON micro_decision_audit(business_id);
CREATE INDEX IF NOT EXISTS idx_micro_cog_biz ON micro_cognitive_load(business_id);
CREATE INDEX IF NOT EXISTS idx_micro_def_biz ON micro_defaults(business_id);
CREATE INDEX IF NOT EXISTS idx_behav_pat_biz ON behav_org_patterns(business_id);
CREATE INDEX IF NOT EXISTS idx_behav_rit_biz ON behav_rituals(business_id);
CREATE INDEX IF NOT EXISTS idx_behav_inc_biz ON behav_incentive_alignment(business_id);
CREATE INDEX IF NOT EXISTS idx_comm_sig_biz ON comm_signal_loss(business_id);
CREATE INDEX IF NOT EXISTS idx_comm_hand_biz ON comm_handoff_quality(business_id);
CREATE INDEX IF NOT EXISTS idx_comm_know_biz ON comm_knowledge_flow(business_id);
CREATE INDEX IF NOT EXISTS idx_attn_int_biz ON attn_interruption_audit(business_id);
CREATE INDEX IF NOT EXISTS idx_attn_foc_biz ON attn_focus_blocks(business_id);
CREATE INDEX IF NOT EXISTS idx_attn_dri_biz ON attn_priority_drift(business_id);
CREATE INDEX IF NOT EXISTS idx_comp_pos_biz ON compound_positive(business_id);
CREATE INDEX IF NOT EXISTS idx_comp_neg_biz ON compound_negative(business_id);
CREATE INDEX IF NOT EXISTS idx_comp_tip_biz ON compound_tipping_points(business_id);

ALTER TABLE micro_decision_audit DISABLE ROW LEVEL SECURITY;
ALTER TABLE micro_cognitive_load DISABLE ROW LEVEL SECURITY;
ALTER TABLE micro_defaults DISABLE ROW LEVEL SECURITY;
ALTER TABLE behav_org_patterns DISABLE ROW LEVEL SECURITY;
ALTER TABLE behav_rituals DISABLE ROW LEVEL SECURITY;
ALTER TABLE behav_incentive_alignment DISABLE ROW LEVEL SECURITY;
ALTER TABLE comm_signal_loss DISABLE ROW LEVEL SECURITY;
ALTER TABLE comm_handoff_quality DISABLE ROW LEVEL SECURITY;
ALTER TABLE comm_knowledge_flow DISABLE ROW LEVEL SECURITY;
ALTER TABLE attn_interruption_audit DISABLE ROW LEVEL SECURITY;
ALTER TABLE attn_focus_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE attn_priority_drift DISABLE ROW LEVEL SECURITY;
ALTER TABLE compound_positive DISABLE ROW LEVEL SECURITY;
ALTER TABLE compound_negative DISABLE ROW LEVEL SECURITY;
ALTER TABLE compound_tipping_points DISABLE ROW LEVEL SECURITY;

-- === 010-add-nexus-tables.sql ===
-- =============================================================================
-- NEXUS LAYER — 15 Tables
-- =============================================================================
-- Module AM: Culture & Organizational Health (3 tables)
-- Module AN: Learning & Development ROI (3 tables)
-- Module AO: Process Bottleneck & Throughput (3 tables)
-- Module AP: Innovation & Adaptation Speed (3 tables)
-- Module AQ: Governance & Accountability (3 tables)
-- =============================================================================

-- MODULE AM: CULTURE & ORG HEALTH
CREATE TABLE IF NOT EXISTS cult_pulse (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  survey_date DATE NOT NULL,
  response_rate_pct NUMERIC DEFAULT 0,
  overall_engagement_score NUMERIC DEFAULT 0, -- 0-100
  manager_effectiveness_score NUMERIC DEFAULT 0,
  role_clarity_score NUMERIC DEFAULT 0,
  growth_opportunity_score NUMERIC DEFAULT 0,
  compensation_fairness_score NUMERIC DEFAULT 0,
  work_life_balance_score NUMERIC DEFAULT 0,
  psychological_safety_score NUMERIC DEFAULT 0,
  mission_alignment_score NUMERIC DEFAULT 0,
  tool_satisfaction_score NUMERIC DEFAULT 0,
  enps NUMERIC DEFAULT 0, -- employee NPS -100 to 100
  top_concern TEXT,
  voluntary_comments_sentiment NUMERIC DEFAULT 0, -- -100 to 100
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, survey_date)
);

CREATE TABLE IF NOT EXISTS cult_alignment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  department TEXT NOT NULL,
  knows_company_priorities BOOLEAN DEFAULT false,
  team_goals_linked_to_company BOOLEAN DEFAULT false,
  cross_team_friction TEXT, -- description of friction with other teams
  conflicting_priorities_count INTEGER DEFAULT 0,
  duplicated_work_with TEXT, -- other department doing same thing
  handoff_quality_score NUMERIC DEFAULT 0, -- 0-100
  trust_score NUMERIC DEFAULT 0, -- 0-100
  collaboration_score NUMERIC DEFAULT 0,
  estimated_misalignment_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, department)
);

CREATE TABLE IF NOT EXISTS cult_burnout (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  avg_hours_worked_per_week NUMERIC DEFAULT 40,
  employees_over_50hrs_pct NUMERIC DEFAULT 0,
  unused_pto_days_avg NUMERIC DEFAULT 0,
  sick_days_trending TEXT DEFAULT 'stable', -- increasing, stable, decreasing
  overtime_hours_monthly NUMERIC DEFAULT 0,
  overtime_cost_monthly NUMERIC DEFAULT 0,
  burnout_risk_high_pct NUMERIC DEFAULT 0, -- % of employees showing signs
  turnover_prediction_next_6mo INTEGER DEFAULT 0,
  replacement_cost_estimate NUMERIC DEFAULT 0,
  top_burnout_driver TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- MODULE AN: LEARNING & DEVELOPMENT
CREATE TABLE IF NOT EXISTS ld_skills_gap (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  skill TEXT NOT NULL,
  category TEXT, -- technical, leadership, sales, communication, domain, tools, compliance, creative
  current_proficiency NUMERIC DEFAULT 0, -- 0-100 team average
  required_proficiency NUMERIC DEFAULT 0,
  gap NUMERIC DEFAULT 0,
  gap_severity TEXT DEFAULT 'medium',
  people_affected INTEGER DEFAULT 0,
  business_impact TEXT, -- revenue_limited, quality_reduced, speed_reduced, risk_increased, opportunity_missed
  estimated_annual_cost_of_gap NUMERIC DEFAULT 0,
  training_available BOOLEAN DEFAULT false,
  training_cost NUMERIC DEFAULT 0,
  time_to_close_months NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, skill)
);

CREATE TABLE IF NOT EXISTS ld_training_roi (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  program_name TEXT NOT NULL,
  category TEXT,
  total_cost NUMERIC DEFAULT 0, -- direct + time cost
  hours_invested NUMERIC DEFAULT 0,
  participants INTEGER DEFAULT 0,
  completion_rate_pct NUMERIC DEFAULT 0,
  knowledge_retention_pct NUMERIC DEFAULT 0, -- tested 30 days later
  behavior_change_pct NUMERIC DEFAULT 0, -- actually applied on job
  measurable_outcome TEXT,
  estimated_roi NUMERIC DEFAULT 0,
  roi_measured BOOLEAN DEFAULT false,
  wasted_spend NUMERIC DEFAULT 0, -- cost × (1 - behavior_change_pct)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, program_name)
);

CREATE TABLE IF NOT EXISTS ld_onboarding_effectiveness (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role_type TEXT NOT NULL,
  avg_time_to_productivity_weeks NUMERIC DEFAULT 0,
  industry_avg_weeks NUMERIC DEFAULT 0,
  structured_program BOOLEAN DEFAULT false,
  has_mentor_assigned BOOLEAN DEFAULT false,
  has_30_60_90_plan BOOLEAN DEFAULT false,
  has_knowledge_base BOOLEAN DEFAULT false,
  new_hire_satisfaction_score NUMERIC DEFAULT 0,
  new_hire_retention_1yr_pct NUMERIC DEFAULT 0,
  cost_of_slow_rampup NUMERIC DEFAULT 0, -- salary paid during unproductive weeks
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role_type)
);

-- MODULE AO: PROCESS BOTTLENECK
CREATE TABLE IF NOT EXISTS proc_bottlenecks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  process_name TEXT NOT NULL,
  bottleneck_point TEXT NOT NULL,
  bottleneck_type TEXT, -- person, system, approval, handoff, resource, information, capacity
  avg_wait_time_hours NUMERIC DEFAULT 0,
  throughput_before NUMERIC DEFAULT 0, -- units per period
  throughput_at_bottleneck NUMERIC DEFAULT 0,
  capacity_utilization_pct NUMERIC DEFAULT 0,
  queue_depth INTEGER DEFAULT 0, -- items waiting
  cost_of_delay_per_unit NUMERIC DEFAULT 0,
  annual_delay_cost NUMERIC DEFAULT 0,
  fix_type TEXT, -- add_capacity, automate, eliminate, parallelize, batch
  fix_cost NUMERIC DEFAULT 0,
  fix_impact_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, process_name, bottleneck_point)
);

CREATE TABLE IF NOT EXISTS proc_handoffs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  from_team TEXT NOT NULL,
  to_team TEXT NOT NULL,
  process_name TEXT,
  handoffs_per_month INTEGER DEFAULT 0,
  error_rate_pct NUMERIC DEFAULT 0,
  avg_delay_hours NUMERIC DEFAULT 0,
  information_loss_pct NUMERIC DEFAULT 0, -- % of context lost in handoff
  rework_from_bad_handoff_pct NUMERIC DEFAULT 0,
  documented BOOLEAN DEFAULT false,
  automated BOOLEAN DEFAULT false,
  annual_cost_of_friction NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, from_team, to_team, process_name)
);

CREATE TABLE IF NOT EXISTS proc_cycle_time (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  process_name TEXT NOT NULL,
  total_cycle_time_hours NUMERIC DEFAULT 0,
  value_add_time_hours NUMERIC DEFAULT 0,
  wait_time_hours NUMERIC DEFAULT 0,
  rework_time_hours NUMERIC DEFAULT 0,
  process_efficiency_pct NUMERIC DEFAULT 0, -- value_add / total
  industry_benchmark_hours NUMERIC DEFAULT 0,
  slower_than_benchmark_pct NUMERIC DEFAULT 0,
  revenue_per_cycle NUMERIC DEFAULT 0,
  cycles_per_month NUMERIC DEFAULT 0,
  potential_additional_cycles NUMERIC DEFAULT 0, -- if at benchmark speed
  revenue_opportunity NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, process_name)
);

-- MODULE AP: INNOVATION
CREATE TABLE IF NOT EXISTS innov_pipeline (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  idea_name TEXT NOT NULL,
  category TEXT, -- product, process, market, business_model, service, technology
  source TEXT, -- customer, employee, competitor, research, partner, market
  status TEXT DEFAULT 'idea', -- idea, evaluating, prototyping, testing, launching, launched, killed
  submitted_date DATE,
  days_in_pipeline INTEGER DEFAULT 0,
  estimated_revenue_impact NUMERIC DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  champion TEXT,
  blockers TEXT,
  customer_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, idea_name)
);

CREATE TABLE IF NOT EXISTS innov_experiments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  experiment_name TEXT NOT NULL,
  hypothesis TEXT,
  status TEXT DEFAULT 'planned', -- planned, running, completed, abandoned
  start_date DATE,
  end_date DATE,
  cost NUMERIC DEFAULT 0,
  success_metric TEXT,
  target_value NUMERIC DEFAULT 0,
  actual_value NUMERIC DEFAULT 0,
  result TEXT, -- validated, invalidated, inconclusive
  learning TEXT,
  applied_to_business BOOLEAN DEFAULT false,
  revenue_from_learning NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, experiment_name)
);

CREATE TABLE IF NOT EXISTS innov_change_readiness (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  change_velocity_score NUMERIC DEFAULT 0, -- 0-100 how fast the org adapts
  idea_to_launch_avg_days NUMERIC DEFAULT 0,
  experiments_per_quarter INTEGER DEFAULT 0,
  experiment_kill_rate_pct NUMERIC DEFAULT 0, -- healthy = 50-70%
  customer_feedback_response_days NUMERIC DEFAULT 0,
  competitor_response_time_days NUMERIC DEFAULT 0,
  technology_adoption_score NUMERIC DEFAULT 0,
  team_adaptability_score NUMERIC DEFAULT 0,
  innovation_budget_pct NUMERIC DEFAULT 0, -- % of revenue invested
  industry_avg_innovation_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- MODULE AQ: GOVERNANCE
CREATE TABLE IF NOT EXISTS gov_kpis (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  kpi_name TEXT NOT NULL,
  department TEXT,
  owner TEXT,
  target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  on_track BOOLEAN DEFAULT true,
  trend TEXT DEFAULT 'stable', -- improving, stable, declining
  months_off_track INTEGER DEFAULT 0,
  reviewed_frequency TEXT, -- daily, weekly, monthly, quarterly, never
  last_reviewed DATE,
  action_plan_if_off TEXT,
  has_action_plan BOOLEAN DEFAULT false,
  estimated_revenue_impact NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, kpi_name)
);

CREATE TABLE IF NOT EXISTS gov_ownership (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  area TEXT NOT NULL,
  has_clear_owner BOOLEAN DEFAULT false,
  owner_name TEXT,
  has_defined_metrics BOOLEAN DEFAULT false,
  has_authority_to_act BOOLEAN DEFAULT false,
  has_budget BOOLEAN DEFAULT false,
  accountability_score NUMERIC DEFAULT 0, -- 0-100
  things_falling_through TEXT, -- what drops because of unclear ownership
  estimated_annual_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, area)
);

CREATE TABLE IF NOT EXISTS gov_strategic_alignment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  has_written_strategy BOOLEAN DEFAULT false,
  strategy_communicated_pct NUMERIC DEFAULT 0,
  departments_aligned_pct NUMERIC DEFAULT 0,
  projects_aligned_to_strategy_pct NUMERIC DEFAULT 0,
  budget_aligned_to_strategy_pct NUMERIC DEFAULT 0,
  time_on_strategic_vs_reactive_pct NUMERIC DEFAULT 0,
  strategic_review_frequency TEXT,
  last_strategic_review DATE,
  misaligned_spend NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cult_pulse_biz ON cult_pulse(business_id);
CREATE INDEX IF NOT EXISTS idx_cult_align_biz ON cult_alignment(business_id);
CREATE INDEX IF NOT EXISTS idx_cult_burn_biz ON cult_burnout(business_id);
CREATE INDEX IF NOT EXISTS idx_ld_skills_biz ON ld_skills_gap(business_id);
CREATE INDEX IF NOT EXISTS idx_ld_train_biz ON ld_training_roi(business_id);
CREATE INDEX IF NOT EXISTS idx_ld_onb_biz ON ld_onboarding_effectiveness(business_id);
CREATE INDEX IF NOT EXISTS idx_proc_bot_biz ON proc_bottlenecks(business_id);
CREATE INDEX IF NOT EXISTS idx_proc_hand_biz ON proc_handoffs(business_id);
CREATE INDEX IF NOT EXISTS idx_proc_cyc_biz ON proc_cycle_time(business_id);
CREATE INDEX IF NOT EXISTS idx_innov_pipe_biz ON innov_pipeline(business_id);
CREATE INDEX IF NOT EXISTS idx_innov_exp_biz ON innov_experiments(business_id);
CREATE INDEX IF NOT EXISTS idx_innov_chg_biz ON innov_change_readiness(business_id);
CREATE INDEX IF NOT EXISTS idx_gov_kpi_biz ON gov_kpis(business_id);
CREATE INDEX IF NOT EXISTS idx_gov_own_biz ON gov_ownership(business_id);
CREATE INDEX IF NOT EXISTS idx_gov_strat_biz ON gov_strategic_alignment(business_id);

ALTER TABLE cult_pulse DISABLE ROW LEVEL SECURITY;
ALTER TABLE cult_alignment DISABLE ROW LEVEL SECURITY;
ALTER TABLE cult_burnout DISABLE ROW LEVEL SECURITY;
ALTER TABLE ld_skills_gap DISABLE ROW LEVEL SECURITY;
ALTER TABLE ld_training_roi DISABLE ROW LEVEL SECURITY;
ALTER TABLE ld_onboarding_effectiveness DISABLE ROW LEVEL SECURITY;
ALTER TABLE proc_bottlenecks DISABLE ROW LEVEL SECURITY;
ALTER TABLE proc_handoffs DISABLE ROW LEVEL SECURITY;
ALTER TABLE proc_cycle_time DISABLE ROW LEVEL SECURITY;
ALTER TABLE innov_pipeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE innov_experiments DISABLE ROW LEVEL SECURITY;
ALTER TABLE innov_change_readiness DISABLE ROW LEVEL SECURITY;
ALTER TABLE gov_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE gov_ownership DISABLE ROW LEVEL SECURITY;
ALTER TABLE gov_strategic_alignment DISABLE ROW LEVEL SECURITY;

-- === 011-add-omega-tables.sql ===
-- =============================================================================
-- OMEGA LAYER — 15 Tables
-- =============================================================================
-- Module AC: Pricing Architecture & Revenue Design (3 tables)
-- Module AD: Time & Attention Economics (3 tables)
-- Module AE: Relationship & Network Capital (3 tables)
-- Module AF: Risk Cascade & Compounding (3 tables)
-- Module AG: Opportunity Cost & Foregone Revenue (3 tables)
-- =============================================================================

-- MODULE AC: PRICING ARCHITECTURE
CREATE TABLE IF NOT EXISTS price_architecture (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  product_or_service TEXT NOT NULL,
  pricing_model TEXT, -- flat_rate, hourly, per_unit, tiered, value_based, subscription, project_based, retainer
  current_price NUMERIC DEFAULT 0,
  cost_to_deliver NUMERIC DEFAULT 0,
  margin_pct NUMERIC DEFAULT 0,
  price_last_changed DATE,
  months_since_change INTEGER DEFAULT 0,
  annual_inflation_pct NUMERIC DEFAULT 3,
  real_price_erosion_pct NUMERIC DEFAULT 0, -- how much inflation has eaten
  price_anchored_to TEXT, -- cost_plus, competitor, value, arbitrary, legacy
  value_delivered_estimate NUMERIC DEFAULT 0,
  value_capture_pct NUMERIC DEFAULT 0, -- price / value_delivered
  willingness_to_pay_estimate NUMERIC DEFAULT 0,
  price_gap_to_wtp NUMERIC DEFAULT 0,
  customers_on_this_plan INTEGER DEFAULT 0,
  annual_revenue_from_plan NUMERIC DEFAULT 0,
  grandfathered_customers INTEGER DEFAULT 0,
  grandfathered_discount_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, product_or_service)
);

CREATE TABLE IF NOT EXISTS price_segmentation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  segment_name TEXT NOT NULL,
  customer_count INTEGER DEFAULT 0,
  avg_revenue_per_customer NUMERIC DEFAULT 0,
  avg_cost_to_serve NUMERIC DEFAULT 0,
  avg_margin NUMERIC DEFAULT 0,
  margin_pct NUMERIC DEFAULT 0,
  churn_rate_pct NUMERIC DEFAULT 0,
  ltv NUMERIC DEFAULT 0,
  price_sensitivity TEXT DEFAULT 'medium', -- low, medium, high
  upsell_potential NUMERIC DEFAULT 0,
  cross_sell_potential NUMERIC DEFAULT 0,
  segment_growing BOOLEAN DEFAULT true,
  underpriced BOOLEAN DEFAULT false,
  overserved BOOLEAN DEFAULT false, -- high cost to serve, low margin
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, segment_name)
);

CREATE TABLE IF NOT EXISTS price_leakage (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  leakage_type TEXT NOT NULL, -- scope_creep_unbilled, ad_hoc_discounts, feature_giveaway, payment_term_cost, volume_discount_excess, free_tier_abuse, late_fee_uncollected, price_override, bundling_loss, warranty_cost
  description TEXT,
  frequency TEXT, -- per_deal, monthly, quarterly, annual
  occurrences_per_period INTEGER DEFAULT 0,
  avg_leakage_per_occurrence NUMERIC DEFAULT 0,
  total_period_leakage NUMERIC DEFAULT 0,
  annual_leakage NUMERIC DEFAULT 0,
  preventable_pct NUMERIC DEFAULT 80,
  root_cause TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, leakage_type)
);

-- MODULE AD: TIME & ATTENTION ECONOMICS
CREATE TABLE IF NOT EXISTS time_allocation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role TEXT NOT NULL,
  person_name TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours NUMERIC DEFAULT 0,
  revenue_generating_hours NUMERIC DEFAULT 0,
  admin_hours NUMERIC DEFAULT 0,
  meeting_hours NUMERIC DEFAULT 0,
  context_switching_hours NUMERIC DEFAULT 0,
  waiting_hours NUMERIC DEFAULT 0, -- blocked by others
  rework_hours NUMERIC DEFAULT 0,
  low_value_hours NUMERIC DEFAULT 0, -- tasks below pay grade
  strategic_hours NUMERIC DEFAULT 0,
  revenue_per_hour NUMERIC DEFAULT 0,
  cost_per_hour NUMERIC DEFAULT 0,
  effective_rate NUMERIC DEFAULT 0, -- revenue / total hours
  optimal_allocation_revenue_pct NUMERIC DEFAULT 0,
  actual_revenue_pct NUMERIC DEFAULT 0,
  productivity_gap_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role, period_start)
);

CREATE TABLE IF NOT EXISTS time_interruptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  avg_deep_work_blocks_per_day NUMERIC DEFAULT 0,
  avg_deep_work_minutes NUMERIC DEFAULT 0,
  interruptions_per_day NUMERIC DEFAULT 0,
  avg_recovery_time_minutes NUMERIC DEFAULT 0, -- time to refocus after interruption
  slack_messages_per_day NUMERIC DEFAULT 0,
  email_checks_per_day NUMERIC DEFAULT 0,
  notification_sources INTEGER DEFAULT 0,
  meetings_that_interrupt_flow INTEGER DEFAULT 0,
  context_switches_per_day NUMERIC DEFAULT 0,
  estimated_lost_productivity_pct NUMERIC DEFAULT 0,
  estimated_annual_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS time_delegation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  task_name TEXT NOT NULL,
  currently_done_by TEXT, -- role/person
  current_hourly_rate NUMERIC DEFAULT 0,
  could_be_done_by TEXT, -- lower-cost role
  delegated_hourly_rate NUMERIC DEFAULT 0,
  hours_per_month NUMERIC DEFAULT 0,
  current_monthly_cost NUMERIC DEFAULT 0,
  delegated_monthly_cost NUMERIC DEFAULT 0,
  savings_per_month NUMERIC DEFAULT 0,
  reason_not_delegated TEXT, -- trust, training, awareness, habit, no_one_available
  delegation_difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
  training_hours_needed NUMERIC DEFAULT 0,
  freed_hours_value NUMERIC DEFAULT 0, -- what the freed time is worth at higher-value work
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, task_name)
);

-- MODULE AE: RELATIONSHIP & NETWORK CAPITAL
CREATE TABLE IF NOT EXISTS rel_network (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  contact_name TEXT NOT NULL,
  relationship_type TEXT, -- client_champion, industry_peer, mentor, advisor, referral_source, media_contact, investor, strategic_partner, former_colleague, community_leader
  organization TEXT,
  influence_score NUMERIC DEFAULT 0, -- 0-100
  relationship_strength TEXT DEFAULT 'medium', -- strong, medium, weak, dormant
  last_meaningful_contact DATE,
  days_since_contact INTEGER DEFAULT 0,
  annual_value_generated NUMERIC DEFAULT 0, -- referrals, intros, deals
  potential_value NUMERIC DEFAULT 0,
  reciprocity_balance TEXT DEFAULT 'balanced', -- giving_more, balanced, taking_more, unknown
  at_risk_of_losing BOOLEAN DEFAULT false,
  nurture_action TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, contact_name)
);

CREATE TABLE IF NOT EXISTS rel_social_capital (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_network_size INTEGER DEFAULT 0,
  active_relationships INTEGER DEFAULT 0,
  dormant_relationships INTEGER DEFAULT 0,
  new_connections_30d INTEGER DEFAULT 0,
  relationships_lost_30d INTEGER DEFAULT 0,
  referrals_received_90d INTEGER DEFAULT 0,
  referrals_given_90d INTEGER DEFAULT 0,
  introductions_made_90d INTEGER DEFAULT 0,
  speaking_engagements_ytd INTEGER DEFAULT 0,
  industry_events_attended_ytd INTEGER DEFAULT 0,
  thought_leadership_pieces_ytd INTEGER DEFAULT 0,
  estimated_network_value NUMERIC DEFAULT 0,
  network_diversity_score NUMERIC DEFAULT 0, -- 0-100
  key_relationship_gaps TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS rel_goodwill (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_name TEXT NOT NULL,
  tenure_months INTEGER DEFAULT 0,
  total_lifetime_revenue NUMERIC DEFAULT 0,
  referrals_generated INTEGER DEFAULT 0,
  referral_revenue NUMERIC DEFAULT 0,
  testimonials_given INTEGER DEFAULT 0,
  case_study_participant BOOLEAN DEFAULT false,
  nps_score NUMERIC DEFAULT 0,
  last_positive_interaction DATE,
  last_negative_interaction DATE,
  goodwill_score NUMERIC DEFAULT 0, -- 0-100
  at_risk BOOLEAN DEFAULT false,
  untapped_potential TEXT, -- referral, case_study, upsell, co_marketing, advisory_board
  potential_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, client_name)
);

-- MODULE AF: RISK CASCADE
CREATE TABLE IF NOT EXISTS risk_register (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  risk_name TEXT NOT NULL,
  risk_category TEXT, -- financial, operational, strategic, compliance, reputational, technology, human_capital, market, legal, environmental
  probability_pct NUMERIC DEFAULT 0,
  impact_if_occurs NUMERIC DEFAULT 0,
  expected_loss NUMERIC DEFAULT 0, -- probability × impact
  velocity TEXT DEFAULT 'medium', -- sudden, fast, medium, slow
  detection_difficulty TEXT DEFAULT 'medium', -- easy, medium, hard, very_hard
  current_controls TEXT,
  control_effectiveness TEXT DEFAULT 'partial', -- strong, partial, weak, none
  residual_risk NUMERIC DEFAULT 0,
  triggers JSONB DEFAULT '[]', -- what other risks trigger this one
  cascades_to JSONB DEFAULT '[]', -- what risks this triggers
  mitigation_plan TEXT,
  mitigation_cost NUMERIC DEFAULT 0,
  risk_owner TEXT,
  last_assessed DATE,
  status TEXT DEFAULT 'active', -- active, mitigated, accepted, transferred
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, risk_name)
);

CREATE TABLE IF NOT EXISTS risk_scenarios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  scenario_name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT,
  cascade_chain JSONB DEFAULT '[]', -- ordered list of risks that would fire
  combined_probability_pct NUMERIC DEFAULT 0,
  total_impact NUMERIC DEFAULT 0,
  recovery_time_months NUMERIC DEFAULT 0,
  survivable BOOLEAN DEFAULT true,
  insurance_coverage NUMERIC DEFAULT 0,
  uncovered_exposure NUMERIC DEFAULT 0,
  prevention_cost NUMERIC DEFAULT 0,
  prevention_roi NUMERIC DEFAULT 0,
  last_tested DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, scenario_name)
);

CREATE TABLE IF NOT EXISTS risk_insurance_gaps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  coverage_type TEXT NOT NULL, -- general_liability, professional_liability, cyber, property, business_interruption, key_person, d_and_o, employment_practices, product_liability, umbrella
  has_coverage BOOLEAN DEFAULT false,
  coverage_amount NUMERIC DEFAULT 0,
  annual_premium NUMERIC DEFAULT 0,
  deductible NUMERIC DEFAULT 0,
  estimated_exposure NUMERIC DEFAULT 0,
  coverage_gap NUMERIC DEFAULT 0,
  last_reviewed DATE,
  months_since_review INTEGER DEFAULT 0,
  adequate BOOLEAN DEFAULT true,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, coverage_type)
);

-- MODULE AG: OPPORTUNITY COST
CREATE TABLE IF NOT EXISTS opp_foregone (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  opportunity_name TEXT NOT NULL,
  category TEXT, -- market_expansion, product_development, partnership, acquisition, talent, technology, pricing, channel
  description TEXT,
  estimated_annual_revenue NUMERIC DEFAULT 0,
  estimated_margin_pct NUMERIC DEFAULT 0,
  investment_required NUMERIC DEFAULT 0,
  time_to_revenue_months NUMERIC DEFAULT 0,
  roi_estimate_pct NUMERIC DEFAULT 0,
  competitive_window_months NUMERIC DEFAULT 0, -- how long before opportunity closes
  blocking_factor TEXT, -- capital, bandwidth, talent, technology, knowledge, risk_tolerance, awareness
  effort_level TEXT DEFAULT 'medium', -- low, medium, high, massive
  confidence NUMERIC DEFAULT 50,
  status TEXT DEFAULT 'identified', -- identified, evaluating, pursuing, deferred, missed
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, opportunity_name)
);

CREATE TABLE IF NOT EXISTS opp_capacity_waste (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  resource_type TEXT NOT NULL, -- office_space, equipment, licenses, subscriptions, inventory_space, vehicle, personnel_hours, server_capacity
  resource_name TEXT,
  total_capacity NUMERIC DEFAULT 0,
  utilized_capacity NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  idle_capacity NUMERIC DEFAULT 0,
  monthly_cost_of_idle NUMERIC DEFAULT 0,
  could_be_monetized BOOLEAN DEFAULT false,
  monetization_method TEXT,
  potential_monthly_revenue NUMERIC DEFAULT 0,
  could_be_shed BOOLEAN DEFAULT false,
  shedding_savings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, resource_type, resource_name)
);

CREATE TABLE IF NOT EXISTS opp_strategic_gaps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  gap_area TEXT NOT NULL, -- recurring_revenue, digital_presence, data_monetization, platform_play, community_building, international, vertical_expansion, productization, self_service, ai_automation
  current_state TEXT,
  industry_leaders_state TEXT,
  gap_severity TEXT DEFAULT 'medium', -- critical, high, medium, low
  estimated_value_if_closed NUMERIC DEFAULT 0,
  effort_to_close TEXT DEFAULT 'medium',
  timeline_months NUMERIC DEFAULT 0,
  first_step TEXT,
  blocking_factor TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, gap_area)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_price_arch_biz ON price_architecture(business_id);
CREATE INDEX IF NOT EXISTS idx_price_seg_biz ON price_segmentation(business_id);
CREATE INDEX IF NOT EXISTS idx_price_leak_biz ON price_leakage(business_id);
CREATE INDEX IF NOT EXISTS idx_time_alloc_biz ON time_allocation(business_id);
CREATE INDEX IF NOT EXISTS idx_time_int_biz ON time_interruptions(business_id);
CREATE INDEX IF NOT EXISTS idx_time_del_biz ON time_delegation(business_id);
CREATE INDEX IF NOT EXISTS idx_rel_net_biz ON rel_network(business_id);
CREATE INDEX IF NOT EXISTS idx_rel_soc_biz ON rel_social_capital(business_id);
CREATE INDEX IF NOT EXISTS idx_rel_good_biz ON rel_goodwill(business_id);
CREATE INDEX IF NOT EXISTS idx_risk_reg_biz ON risk_register(business_id);
CREATE INDEX IF NOT EXISTS idx_risk_scen_biz ON risk_scenarios(business_id);
CREATE INDEX IF NOT EXISTS idx_risk_ins_biz ON risk_insurance_gaps(business_id);
CREATE INDEX IF NOT EXISTS idx_opp_fore_biz ON opp_foregone(business_id);
CREATE INDEX IF NOT EXISTS idx_opp_cap_biz ON opp_capacity_waste(business_id);
CREATE INDEX IF NOT EXISTS idx_opp_strat_biz ON opp_strategic_gaps(business_id);

ALTER TABLE price_architecture DISABLE ROW LEVEL SECURITY;
ALTER TABLE price_segmentation DISABLE ROW LEVEL SECURITY;
ALTER TABLE price_leakage DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_allocation DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_interruptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_delegation DISABLE ROW LEVEL SECURITY;
ALTER TABLE rel_network DISABLE ROW LEVEL SECURITY;
ALTER TABLE rel_social_capital DISABLE ROW LEVEL SECURITY;
ALTER TABLE rel_goodwill DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_register DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_insurance_gaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE opp_foregone DISABLE ROW LEVEL SECURITY;
ALTER TABLE opp_capacity_waste DISABLE ROW LEVEL SECURITY;
ALTER TABLE opp_strategic_gaps DISABLE ROW LEVEL SECURITY;

-- === 012-add-paradox-tables.sql ===
-- =============================================================================
-- PARADOX LAYER — 15 Tables
-- =============================================================================
-- Module CF: Strategic Contradictions & Double Binds (3 tables)
-- Module CG: Strength-Weakness Inversions & Asset Liabilities (3 tables)
-- Module CH: Growth Paradoxes & Success Traps (3 tables)
-- Module CI: Cultural Contradictions & Value Conflicts (3 tables)
-- Module CJ: Temporal Paradoxes & Present-Future Conflicts (3 tables)
-- =============================================================================

-- MODULE CF: STRATEGIC CONTRADICTIONS
CREATE TABLE IF NOT EXISTS para_contradictions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  contradiction_name TEXT NOT NULL,
  domain TEXT,
  side_a TEXT,
  side_b TEXT,
  both_feel_true BOOLEAN DEFAULT true,
  evidence_for_a TEXT,
  evidence_for_b TEXT,
  resources_to_a_pct NUMERIC DEFAULT 0,
  resources_to_b_pct NUMERIC DEFAULT 0,
  cost_of_contradiction NUMERIC DEFAULT 0,
  resolution_possible BOOLEAN DEFAULT true,
  resolution_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, contradiction_name)
);

CREATE TABLE IF NOT EXISTS para_double_binds (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  bind_name TEXT NOT NULL,
  description TEXT,
  option_a TEXT,
  option_a_cost TEXT,
  option_b TEXT,
  option_b_cost TEXT,
  why_stuck BOOLEAN DEFAULT true,
  hidden_option_c TEXT,
  cost_of_inaction_monthly NUMERIC DEFAULT 0,
  months_stuck NUMERIC DEFAULT 0,
  total_cost_so_far NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, bind_name)
);

CREATE TABLE IF NOT EXISTS para_conflicting_strategies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  strategy_a TEXT NOT NULL,
  strategy_b TEXT NOT NULL,
  conflict_description TEXT,
  both_active BOOLEAN DEFAULT true,
  team_a TEXT,
  team_b TEXT,
  wasted_effort_monthly NUMERIC DEFAULT 0,
  which_should_win TEXT,
  why_not_resolved TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, strategy_a, strategy_b)
);

-- MODULE CG: STRENGTH-WEAKNESS INVERSIONS
CREATE TABLE IF NOT EXISTS para_strength_shadows (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  strength_name TEXT NOT NULL,
  strength_domain TEXT,
  how_its_a_strength TEXT,
  how_its_become_weakness TEXT,
  tipping_point TEXT,
  current_state TEXT DEFAULT 'both',
  cost_as_weakness NUMERIC DEFAULT 0,
  value_as_strength NUMERIC DEFAULT 0,
  rebalance_possible BOOLEAN DEFAULT true,
  rebalance_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, strength_name)
);

CREATE TABLE IF NOT EXISTS para_asset_liabilities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  asset_name TEXT NOT NULL,
  original_value TEXT,
  how_it_became_liability TEXT,
  current_carrying_cost NUMERIC DEFAULT 0,
  sunk_cost_invested NUMERIC DEFAULT 0,
  salvage_value NUMERIC DEFAULT 0,
  cost_to_maintain NUMERIC DEFAULT 0,
  cost_to_exit NUMERIC DEFAULT 0,
  holding_because TEXT,
  rational_action TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, asset_name)
);

CREATE TABLE IF NOT EXISTS para_expertise_traps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  expertise_area TEXT NOT NULL,
  held_by TEXT,
  how_it_helps TEXT,
  how_it_limits TEXT,
  blind_spot_created TEXT,
  alternatives_dismissed TEXT,
  cost_of_tunnel_vision NUMERIC DEFAULT 0,
  outsider_would_see TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, expertise_area)
);

-- MODULE CH: GROWTH PARADOXES
CREATE TABLE IF NOT EXISTS para_growth_traps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  trap_name TEXT NOT NULL,
  growth_action TEXT,
  intended_result TEXT,
  actual_result TEXT,
  why_counterproductive TEXT,
  doing_more_makes_worse BOOLEAN DEFAULT true,
  cost_per_month NUMERIC DEFAULT 0,
  alternative_approach TEXT,
  requires_letting_go_of TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, trap_name)
);

CREATE TABLE IF NOT EXISTS para_success_poisons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  success_name TEXT NOT NULL,
  what_succeeded TEXT,
  how_success_became_poison TEXT,
  locked_into TEXT,
  opportunity_cost NUMERIC DEFAULT 0,
  hard_to_stop_because TEXT,
  what_dies_if_you_stop TEXT,
  what_lives_if_you_stop TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, success_name)
);

CREATE TABLE IF NOT EXISTS para_scaling_contradictions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  contradiction_name TEXT NOT NULL,
  works_at_current_scale TEXT,
  breaks_at_next_scale TEXT,
  current_scale TEXT,
  next_scale TEXT,
  transition_cost NUMERIC DEFAULT 0,
  cost_of_not_transitioning NUMERIC DEFAULT 0,
  what_must_be_unlearned TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, contradiction_name)
);

-- MODULE CI: CULTURAL CONTRADICTIONS
CREATE TABLE IF NOT EXISTS para_value_conflicts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  stated_value TEXT NOT NULL,
  conflicting_behavior TEXT,
  frequency TEXT DEFAULT 'weekly',
  who_notices TEXT,
  cynicism_created TEXT,
  cost_to_culture NUMERIC DEFAULT 0,
  fix_behavior_or_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, stated_value)
);

CREATE TABLE IF NOT EXISTS para_reward_punish (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  behavior TEXT NOT NULL,
  officially TEXT DEFAULT 'encouraged',
  actually TEXT DEFAULT 'punished',
  how_punished TEXT,
  example TEXT,
  result TEXT,
  cost_monthly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, behavior)
);

CREATE TABLE IF NOT EXISTS para_identity_gaps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  who_we_say_we_are TEXT NOT NULL,
  who_we_actually_are TEXT,
  gap_domain TEXT,
  evidence_of_gap TEXT,
  who_sees_the_gap TEXT,
  cost_of_gap NUMERIC DEFAULT 0,
  path_to_close TEXT DEFAULT 'change_reality',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, who_we_say_we_are)
);

-- MODULE CJ: TEMPORAL PARADOXES
CREATE TABLE IF NOT EXISTS para_present_future (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  conflict_name TEXT NOT NULL,
  present_need TEXT,
  future_need TEXT,
  currently_favoring TEXT DEFAULT 'present',
  present_cost_of_future NUMERIC DEFAULT 0,
  future_cost_of_present NUMERIC DEFAULT 0,
  optimal_balance TEXT,
  current_balance TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, conflict_name)
);

CREATE TABLE IF NOT EXISTS para_sunk_cost_traps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  investment_name TEXT NOT NULL,
  total_invested NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  ongoing_cost_monthly NUMERIC DEFAULT 0,
  rational_action TEXT,
  emotional_blocker TEXT,
  cost_of_continuing_monthly NUMERIC DEFAULT 0,
  savings_if_stopped_monthly NUMERIC DEFAULT 0,
  what_you_fear_losing TEXT,
  what_you_actually_lose TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, investment_name)
);

CREATE TABLE IF NOT EXISTS para_urgency_importance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  activity TEXT NOT NULL,
  urgent BOOLEAN DEFAULT false,
  important BOOLEAN DEFAULT false,
  hours_per_week NUMERIC DEFAULT 0,
  should_hours NUMERIC DEFAULT 0,
  quadrant TEXT,
  displaces TEXT,
  cost_of_displacement NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, activity)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_para_contr_biz ON para_contradictions(business_id);
CREATE INDEX IF NOT EXISTS idx_para_bind_biz ON para_double_binds(business_id);
CREATE INDEX IF NOT EXISTS idx_para_strat_biz ON para_conflicting_strategies(business_id);
CREATE INDEX IF NOT EXISTS idx_para_str_biz ON para_strength_shadows(business_id);
CREATE INDEX IF NOT EXISTS idx_para_asset_biz ON para_asset_liabilities(business_id);
CREATE INDEX IF NOT EXISTS idx_para_exp_biz ON para_expertise_traps(business_id);
CREATE INDEX IF NOT EXISTS idx_para_grow_biz ON para_growth_traps(business_id);
CREATE INDEX IF NOT EXISTS idx_para_succ_biz ON para_success_poisons(business_id);
CREATE INDEX IF NOT EXISTS idx_para_scale_biz ON para_scaling_contradictions(business_id);
CREATE INDEX IF NOT EXISTS idx_para_val_biz ON para_value_conflicts(business_id);
CREATE INDEX IF NOT EXISTS idx_para_rew_biz ON para_reward_punish(business_id);
CREATE INDEX IF NOT EXISTS idx_para_idgap_biz ON para_identity_gaps(business_id);
CREATE INDEX IF NOT EXISTS idx_para_pf_biz ON para_present_future(business_id);
CREATE INDEX IF NOT EXISTS idx_para_sunk_biz ON para_sunk_cost_traps(business_id);
CREATE INDEX IF NOT EXISTS idx_para_urg_biz ON para_urgency_importance(business_id);

ALTER TABLE para_contradictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_double_binds DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_conflicting_strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_strength_shadows DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_asset_liabilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_expertise_traps DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_growth_traps DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_success_poisons DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_scaling_contradictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_value_conflicts DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_reward_punish DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_identity_gaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_present_future DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_sunk_cost_traps DISABLE ROW LEVEL SECURITY;
ALTER TABLE para_urgency_importance DISABLE ROW LEVEL SECURITY;

-- === 013-add-substrate-tables.sql ===
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

-- === 014-add-void-tables.sql ===
-- =============================================================================
-- VOID LAYER — 15 Tables
-- =============================================================================
-- Module CA: Missing Markets & Unserved Segments (3 tables)
-- Module CB: Absent Infrastructure & Capability Gaps (3 tables)
-- Module CC: Unasked Questions & Blind Spot Architecture (3 tables)
-- Module CD: Non-Existent Feedback & Measurement Voids (3 tables)
-- Module CE: Phantom Revenue & Unrealized Potential (3 tables)
-- =============================================================================

-- MODULE CA: MISSING MARKETS
CREATE TABLE IF NOT EXISTS void_unserved_segments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  segment_name TEXT NOT NULL,
  segment_type TEXT DEFAULT 'customer',
  description TEXT,
  estimated_size INTEGER DEFAULT 0,
  estimated_annual_value NUMERIC DEFAULT 0,
  why_not_served TEXT,
  barrier_to_entry TEXT,
  barrier_removal_cost NUMERIC DEFAULT 0,
  competitor_serving BOOLEAN DEFAULT false,
  competitor_names TEXT,
  adjacency_to_current TEXT DEFAULT 'adjacent',
  effort_to_reach TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, segment_name)
);

CREATE TABLE IF NOT EXISTS void_missing_channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  channel_name TEXT NOT NULL,
  channel_type TEXT,
  target_audience TEXT,
  estimated_reach INTEGER DEFAULT 0,
  estimated_annual_leads NUMERIC DEFAULT 0,
  estimated_annual_revenue NUMERIC DEFAULT 0,
  why_not_using TEXT,
  barrier TEXT,
  setup_cost NUMERIC DEFAULT 0,
  ongoing_cost_monthly NUMERIC DEFAULT 0,
  competitor_using BOOLEAN DEFAULT false,
  time_to_results_months NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, channel_name)
);

CREATE TABLE IF NOT EXISTS void_missing_products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  product_concept TEXT NOT NULL,
  product_type TEXT,
  target_segment TEXT,
  customer_requests INTEGER DEFAULT 0,
  estimated_annual_revenue NUMERIC DEFAULT 0,
  development_cost NUMERIC DEFAULT 0,
  time_to_market_months NUMERIC DEFAULT 0,
  why_not_built TEXT,
  validates_core_thesis BOOLEAN DEFAULT true,
  cannibalizes_existing BOOLEAN DEFAULT false,
  competitor_has_it BOOLEAN DEFAULT false,
  strategic_value TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, product_concept)
);

-- MODULE CB: ABSENT INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS void_missing_roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role_title TEXT NOT NULL,
  department TEXT,
  work_currently_done_by TEXT,
  hours_per_week_absorbed NUMERIC DEFAULT 0,
  quality_of_absorbed_work TEXT DEFAULT 'poor',
  cost_of_not_having NUMERIC DEFAULT 0,
  salary_range_annual NUMERIC DEFAULT 0,
  roi_if_hired NUMERIC DEFAULT 0,
  why_not_hired TEXT,
  impact_on_existing_team TEXT,
  urgency TEXT DEFAULT 'medium',
  been_delayed_months NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role_title)
);

CREATE TABLE IF NOT EXISTS void_missing_systems (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  system_name TEXT NOT NULL,
  category TEXT,
  what_it_would_do TEXT,
  current_workaround TEXT,
  workaround_hours_monthly NUMERIC DEFAULT 0,
  workaround_error_rate_pct NUMERIC DEFAULT 0,
  build_cost NUMERIC DEFAULT 0,
  buy_cost_annual NUMERIC DEFAULT 0,
  implementation_months NUMERIC DEFAULT 0,
  annual_savings NUMERIC DEFAULT 0,
  why_not_implemented TEXT,
  blocks_what TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, system_name)
);

CREATE TABLE IF NOT EXISTS void_missing_processes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  process_name TEXT NOT NULL,
  domain TEXT,
  what_it_would_standardize TEXT,
  current_state TEXT DEFAULT 'ad-hoc',
  inconsistency_cost_monthly NUMERIC DEFAULT 0,
  quality_variation_pct NUMERIC DEFAULT 0,
  design_effort_hours NUMERIC DEFAULT 0,
  training_effort_hours NUMERIC DEFAULT 0,
  expected_improvement_pct NUMERIC DEFAULT 0,
  why_not_created TEXT,
  who_should_own TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, process_name)
);

-- MODULE CC: UNASKED QUESTIONS
CREATE TABLE IF NOT EXISTS void_unasked_questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  question TEXT NOT NULL,
  domain TEXT,
  why_not_asked TEXT,
  who_should_ask TEXT,
  who_might_know TEXT,
  potential_impact_if_answered TEXT,
  estimated_value_of_answer NUMERIC DEFAULT 0,
  cost_to_find_answer NUMERIC DEFAULT 0,
  discomfort_level TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'strategic',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, question)
);

CREATE TABLE IF NOT EXISTS void_unexplored_hypotheses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  hypothesis TEXT NOT NULL,
  domain TEXT,
  if_true_impact TEXT,
  if_false_impact TEXT,
  test_method TEXT,
  test_cost NUMERIC DEFAULT 0,
  test_duration_weeks NUMERIC DEFAULT 0,
  why_not_tested TEXT,
  assumptions_it_challenges TEXT,
  potential_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, hypothesis)
);

CREATE TABLE IF NOT EXISTS void_missing_perspectives (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  perspective_name TEXT NOT NULL,
  perspective_type TEXT,
  what_they_would_see TEXT,
  currently_missing_because TEXT,
  how_to_acquire TEXT,
  cost_to_acquire NUMERIC DEFAULT 0,
  value_of_perspective NUMERIC DEFAULT 0,
  blind_spot_it_covers TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, perspective_name)
);

-- MODULE CD: MEASUREMENT VOIDS
CREATE TABLE IF NOT EXISTS void_unmeasured_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  metric_name TEXT NOT NULL,
  domain TEXT,
  why_it_matters TEXT,
  decisions_it_would_inform TEXT,
  current_substitute TEXT,
  substitute_accuracy TEXT DEFAULT 'poor',
  cost_to_measure NUMERIC DEFAULT 0,
  setup_time_weeks NUMERIC DEFAULT 0,
  value_of_knowing NUMERIC DEFAULT 0,
  why_not_measured TEXT,
  leading_or_lagging TEXT DEFAULT 'leading',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, metric_name)
);

CREATE TABLE IF NOT EXISTS void_missing_feedback (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  feedback_source TEXT NOT NULL,
  feedback_type TEXT,
  what_you_would_learn TEXT,
  current_collection TEXT DEFAULT 'none',
  frequency_if_collected TEXT DEFAULT 'never',
  volume_available INTEGER DEFAULT 0,
  actionability TEXT DEFAULT 'high',
  setup_cost NUMERIC DEFAULT 0,
  value_per_insight NUMERIC DEFAULT 0,
  why_not_collected TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, feedback_source)
);

CREATE TABLE IF NOT EXISTS void_invisible_outcomes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  outcome_name TEXT NOT NULL,
  domain TEXT,
  happens_but_unseen TEXT,
  estimated_frequency TEXT,
  estimated_annual_impact NUMERIC DEFAULT 0,
  how_to_make_visible TEXT,
  detection_cost NUMERIC DEFAULT 0,
  why_invisible TEXT,
  discovered_how TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, outcome_name)
);

-- MODULE CE: PHANTOM REVENUE
CREATE TABLE IF NOT EXISTS void_lost_customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  loss_category TEXT NOT NULL,
  description TEXT,
  estimated_annual_count INTEGER DEFAULT 0,
  estimated_revenue_per NUMERIC DEFAULT 0,
  total_annual_loss NUMERIC DEFAULT 0,
  loss_point TEXT,
  reason_for_loss TEXT,
  preventable BOOLEAN DEFAULT true,
  prevention_cost NUMERIC DEFAULT 0,
  currently_tracked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, loss_category)
);

CREATE TABLE IF NOT EXISTS void_uncaptured_value (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  value_name TEXT NOT NULL,
  value_type TEXT,
  description TEXT,
  estimated_annual_value NUMERIC DEFAULT 0,
  why_uncaptured TEXT,
  capture_mechanism TEXT,
  capture_cost NUMERIC DEFAULT 0,
  capture_effort TEXT DEFAULT 'medium',
  example TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, value_name)
);

CREATE TABLE IF NOT EXISTS void_shadow_revenue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  shadow_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  could_generate_annually NUMERIC DEFAULT 0,
  exists_because TEXT,
  barrier_to_capture TEXT,
  effort_to_capture TEXT DEFAULT 'medium',
  risk_level TEXT DEFAULT 'low',
  time_to_revenue_months NUMERIC DEFAULT 0,
  validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, shadow_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_void_seg_biz ON void_unserved_segments(business_id);
CREATE INDEX IF NOT EXISTS idx_void_chan_biz ON void_missing_channels(business_id);
CREATE INDEX IF NOT EXISTS idx_void_prod_biz ON void_missing_products(business_id);
CREATE INDEX IF NOT EXISTS idx_void_role_biz ON void_missing_roles(business_id);
CREATE INDEX IF NOT EXISTS idx_void_sys_biz ON void_missing_systems(business_id);
CREATE INDEX IF NOT EXISTS idx_void_proc_biz ON void_missing_processes(business_id);
CREATE INDEX IF NOT EXISTS idx_void_ques_biz ON void_unasked_questions(business_id);
CREATE INDEX IF NOT EXISTS idx_void_hypo_biz ON void_unexplored_hypotheses(business_id);
CREATE INDEX IF NOT EXISTS idx_void_persp_biz ON void_missing_perspectives(business_id);
CREATE INDEX IF NOT EXISTS idx_void_metr_biz ON void_unmeasured_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_void_fb_biz ON void_missing_feedback(business_id);
CREATE INDEX IF NOT EXISTS idx_void_invis_biz ON void_invisible_outcomes(business_id);
CREATE INDEX IF NOT EXISTS idx_void_lost_biz ON void_lost_customers(business_id);
CREATE INDEX IF NOT EXISTS idx_void_uncap_biz ON void_uncaptured_value(business_id);
CREATE INDEX IF NOT EXISTS idx_void_shadow_biz ON void_shadow_revenue(business_id);

ALTER TABLE void_unserved_segments DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_missing_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_missing_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_missing_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_missing_systems DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_missing_processes DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_unasked_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_unexplored_hypotheses DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_missing_perspectives DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_unmeasured_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_missing_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_invisible_outcomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_lost_customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_uncaptured_value DISABLE ROW LEVEL SECURITY;
ALTER TABLE void_shadow_revenue DISABLE ROW LEVEL SECURITY;

-- === 015-add-graviton-tables.sql ===
-- =============================================================================
-- GRAVITON LAYER — 15 Tables
-- =============================================================================
-- Module BL: Trust Architecture & Credibility Capital (3 tables)
-- Module BM: Complexity Tax & Simplification Debt (3 tables)
-- Module BN: Timing Intelligence & Window Detection (3 tables)
-- Module BO: Narrative Coherence & Story Integrity (3 tables)
-- Module BP: Asymmetric Leverage & Force Multiplication (3 tables)
-- =============================================================================

-- MODULE BL: TRUST ARCHITECTURE
CREATE TABLE IF NOT EXISTS trust_inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  stakeholder_group TEXT NOT NULL,
  trust_level TEXT DEFAULT 'medium',
  trust_trend TEXT DEFAULT 'stable',
  evidence_of_trust TEXT,
  evidence_of_distrust TEXT,
  trust_built_through TEXT,
  trust_damaged_by TEXT,
  recovery_effort TEXT,
  monetary_value_of_trust NUMERIC DEFAULT 0,
  cost_if_lost NUMERIC DEFAULT 0,
  fragility TEXT DEFAULT 'medium',
  last_assessed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, stakeholder_group)
);

CREATE TABLE IF NOT EXISTS trust_promises (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  promise TEXT NOT NULL,
  made_to TEXT,
  promise_type TEXT DEFAULT 'implicit',
  delivery_status TEXT DEFAULT 'partial',
  delivery_pct NUMERIC DEFAULT 0,
  consequence_of_breaking TEXT,
  times_broken INTEGER DEFAULT 0,
  times_kept INTEGER DEFAULT 0,
  credibility_impact TEXT DEFAULT 'medium',
  current_at_risk BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, promise)
);

CREATE TABLE IF NOT EXISTS trust_social_proof (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  proof_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  quality_score NUMERIC DEFAULT 0,
  recency_months NUMERIC DEFAULT 0,
  conversion_impact_pct NUMERIC DEFAULT 0,
  industry_avg_quantity INTEGER DEFAULT 0,
  gap_vs_competitor TEXT,
  stale_pct NUMERIC DEFAULT 0,
  acquisition_effort TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, proof_type)
);

-- MODULE BM: COMPLEXITY TAX
CREATE TABLE IF NOT EXISTS complexity_inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  complexity_name TEXT NOT NULL,
  domain TEXT,
  complexity_type TEXT DEFAULT 'accidental',
  added_when TEXT,
  added_why TEXT,
  still_needed BOOLEAN DEFAULT true,
  hours_per_month_cost NUMERIC DEFAULT 0,
  error_rate_contribution_pct NUMERIC DEFAULT 0,
  onboarding_impact_days NUMERIC DEFAULT 0,
  people_who_understand INTEGER DEFAULT 0,
  simplification_possible BOOLEAN DEFAULT false,
  simplification_cost NUMERIC DEFAULT 0,
  simplification_savings_monthly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, complexity_name)
);

CREATE TABLE IF NOT EXISTS complexity_product (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  total_features INTEGER DEFAULT 0,
  features_used_by_majority_pct NUMERIC DEFAULT 0,
  features_never_used_pct NUMERIC DEFAULT 0,
  avg_clicks_to_core_value INTEGER DEFAULT 0,
  time_to_first_value_minutes NUMERIC DEFAULT 0,
  support_tickets_from_confusion INTEGER DEFAULT 0,
  documentation_pages INTEGER DEFAULT 0,
  documentation_up_to_date_pct NUMERIC DEFAULT 0,
  pricing_tiers INTEGER DEFAULT 0,
  pricing_complaints_monthly INTEGER DEFAULT 0,
  feature_bloat_score NUMERIC DEFAULT 0,
  simplicity_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS complexity_operations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  tools_in_stack INTEGER DEFAULT 0,
  tools_with_overlapping_function INTEGER DEFAULT 0,
  integrations_maintained INTEGER DEFAULT 0,
  integrations_broken INTEGER DEFAULT 0,
  processes_documented INTEGER DEFAULT 0,
  processes_total INTEGER DEFAULT 0,
  handoffs_per_customer_journey INTEGER DEFAULT 0,
  approval_layers_avg INTEGER DEFAULT 0,
  exceptions_per_week INTEGER DEFAULT 0,
  workarounds_known INTEGER DEFAULT 0,
  tech_debt_hours_monthly NUMERIC DEFAULT 0,
  operational_complexity_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- MODULE BN: TIMING INTELLIGENCE
CREATE TABLE IF NOT EXISTS timing_windows (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  window_name TEXT NOT NULL,
  window_type TEXT,
  opens_date DATE,
  closes_date DATE,
  days_remaining NUMERIC DEFAULT 0,
  opportunity_value NUMERIC DEFAULT 0,
  cost_of_missing NUMERIC DEFAULT 0,
  readiness_pct NUMERIC DEFAULT 0,
  blockers TEXT,
  action_required TEXT,
  probability_of_capture TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, window_name)
);

CREATE TABLE IF NOT EXISTS timing_cycles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  cycle_name TEXT NOT NULL,
  cycle_type TEXT,
  period TEXT,
  peak_months TEXT,
  trough_months TEXT,
  revenue_variance_pct NUMERIC DEFAULT 0,
  demand_variance_pct NUMERIC DEFAULT 0,
  currently_in TEXT DEFAULT 'normal',
  preparation_for_next_peak TEXT,
  preparation_status TEXT DEFAULT 'not_started',
  cost_of_unpreparedness NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, cycle_name)
);

CREATE TABLE IF NOT EXISTS timing_debt (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  decision_name TEXT NOT NULL,
  decision_type TEXT,
  should_have_been_made DATE,
  days_delayed NUMERIC DEFAULT 0,
  reason_for_delay TEXT,
  cost_of_delay_monthly NUMERIC DEFAULT 0,
  total_cost_so_far NUMERIC DEFAULT 0,
  still_delaying BOOLEAN DEFAULT true,
  what_changes_if_decided_today TEXT,
  blocker TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, decision_name)
);

-- MODULE BO: NARRATIVE COHERENCE
CREATE TABLE IF NOT EXISTS narr_story_audit (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  audience TEXT NOT NULL,
  story_told TEXT,
  story_believed TEXT,
  alignment_score NUMERIC DEFAULT 0,
  evidence_supports BOOLEAN DEFAULT true,
  contradictions TEXT,
  emotional_resonance TEXT DEFAULT 'medium',
  unique_vs_competitors BOOLEAN DEFAULT true,
  last_updated DATE,
  months_since_update NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, audience)
);

CREATE TABLE IF NOT EXISTS narr_consistency (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  channel TEXT NOT NULL,
  message_current TEXT,
  aligned_with_brand BOOLEAN DEFAULT true,
  aligned_with_product BOOLEAN DEFAULT true,
  aligned_with_other_channels BOOLEAN DEFAULT true,
  last_reviewed DATE,
  inconsistencies TEXT,
  impact_of_inconsistency TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, channel)
);

CREATE TABLE IF NOT EXISTS narr_internal_alignment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  founder_vision_clarity NUMERIC DEFAULT 0,
  team_understands_vision_pct NUMERIC DEFAULT 0,
  team_believes_vision_pct NUMERIC DEFAULT 0,
  external_story_matches_internal BOOLEAN DEFAULT true,
  customers_describe_you_as TEXT,
  you_describe_yourself_as TEXT,
  gap_description TEXT,
  employer_brand_vs_reality TEXT DEFAULT 'aligned',
  investor_story_vs_reality TEXT DEFAULT 'aligned',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- MODULE BP: ASYMMETRIC LEVERAGE
CREATE TABLE IF NOT EXISTS lever_unfair_advantages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  advantage_name TEXT NOT NULL,
  advantage_type TEXT,
  strength TEXT DEFAULT 'medium',
  durability TEXT DEFAULT 'medium',
  currently_leveraged BOOLEAN DEFAULT false,
  leverage_pct NUMERIC DEFAULT 0,
  potential_if_fully_leveraged NUMERIC DEFAULT 0,
  competitor_can_copy BOOLEAN DEFAULT true,
  time_to_copy_months NUMERIC DEFAULT 0,
  investment_to_strengthen NUMERIC DEFAULT 0,
  eroding BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, advantage_name)
);

CREATE TABLE IF NOT EXISTS lever_force_multipliers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  multiplier_name TEXT NOT NULL,
  category TEXT,
  current_multiplier NUMERIC DEFAULT 1,
  potential_multiplier NUMERIC DEFAULT 1,
  input_metric TEXT,
  output_metric TEXT,
  bottleneck_to_unlock TEXT,
  cost_to_unlock NUMERIC DEFAULT 0,
  revenue_at_potential NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'underutilized',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, multiplier_name)
);

CREATE TABLE IF NOT EXISTS lever_asymmetric_bets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  bet_name TEXT NOT NULL,
  description TEXT,
  downside_cost NUMERIC DEFAULT 0,
  upside_value NUMERIC DEFAULT 0,
  asymmetry_ratio NUMERIC DEFAULT 0,
  probability_of_upside TEXT DEFAULT 'medium',
  time_to_know_months NUMERIC DEFAULT 0,
  reversible BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'identified',
  why_not_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, bet_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trust_inv_biz ON trust_inventory(business_id);
CREATE INDEX IF NOT EXISTS idx_trust_prom_biz ON trust_promises(business_id);
CREATE INDEX IF NOT EXISTS idx_trust_sp_biz ON trust_social_proof(business_id);
CREATE INDEX IF NOT EXISTS idx_cmplx_inv_biz ON complexity_inventory(business_id);
CREATE INDEX IF NOT EXISTS idx_cmplx_prod_biz ON complexity_product(business_id);
CREATE INDEX IF NOT EXISTS idx_cmplx_ops_biz ON complexity_operations(business_id);
CREATE INDEX IF NOT EXISTS idx_timing_win_biz ON timing_windows(business_id);
CREATE INDEX IF NOT EXISTS idx_timing_cyc_biz ON timing_cycles(business_id);
CREATE INDEX IF NOT EXISTS idx_timing_dbt_biz ON timing_debt(business_id);
CREATE INDEX IF NOT EXISTS idx_narr_story_biz ON narr_story_audit(business_id);
CREATE INDEX IF NOT EXISTS idx_narr_cons_biz ON narr_consistency(business_id);
CREATE INDEX IF NOT EXISTS idx_narr_int_biz ON narr_internal_alignment(business_id);
CREATE INDEX IF NOT EXISTS idx_lever_ua_biz ON lever_unfair_advantages(business_id);
CREATE INDEX IF NOT EXISTS idx_lever_fm_biz ON lever_force_multipliers(business_id);
CREATE INDEX IF NOT EXISTS idx_lever_ab_biz ON lever_asymmetric_bets(business_id);

ALTER TABLE trust_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE trust_promises DISABLE ROW LEVEL SECURITY;
ALTER TABLE trust_social_proof DISABLE ROW LEVEL SECURITY;
ALTER TABLE complexity_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE complexity_product DISABLE ROW LEVEL SECURITY;
ALTER TABLE complexity_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE timing_windows DISABLE ROW LEVEL SECURITY;
ALTER TABLE timing_cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE timing_debt DISABLE ROW LEVEL SECURITY;
ALTER TABLE narr_story_audit DISABLE ROW LEVEL SECURITY;
ALTER TABLE narr_consistency DISABLE ROW LEVEL SECURITY;
ALTER TABLE narr_internal_alignment DISABLE ROW LEVEL SECURITY;
ALTER TABLE lever_unfair_advantages DISABLE ROW LEVEL SECURITY;
ALTER TABLE lever_force_multipliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE lever_asymmetric_bets DISABLE ROW LEVEL SECURITY;

-- === 016-add-singularity-tables.sql ===
-- =============================================================================
-- SINGULARITY LAYER — 15 Tables
-- =============================================================================
-- Module BV: Mental Models & Belief Systems (3 tables)
-- Module BW: Identity Architecture & Self-Concept (3 tables)
-- Module BX: Emotional Patterns & Decision Drivers (3 tables)
-- Module BY: Foundational Assumptions & Sacred Cows (3 tables)
-- Module BZ: Origin Patterns & Founding DNA (3 tables)
-- =============================================================================

-- MODULE BV: MENTAL MODELS
CREATE TABLE IF NOT EXISTS mm_active_models (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  model_name TEXT NOT NULL,
  domain TEXT,
  belief TEXT,
  evidence_for TEXT,
  evidence_against TEXT,
  last_challenged DATE,
  accuracy_estimate TEXT DEFAULT 'unknown',
  decisions_influenced TEXT,
  cost_if_wrong NUMERIC DEFAULT 0,
  benefit_if_right NUMERIC DEFAULT 0,
  origin TEXT,
  held_by TEXT,
  shared_across_team BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, model_name)
);

CREATE TABLE IF NOT EXISTS mm_blind_spots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  blind_spot_name TEXT NOT NULL,
  domain TEXT,
  what_you_dont_see TEXT,
  why_you_dont_see_it TEXT,
  evidence_it_exists TEXT,
  potential_impact NUMERIC DEFAULT 0,
  who_could_see_it TEXT,
  asked_them BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, blind_spot_name)
);

CREATE TABLE IF NOT EXISTS mm_decision_filters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  filter_name TEXT NOT NULL,
  filter_type TEXT DEFAULT 'cognitive_bias',
  description TEXT,
  frequency TEXT DEFAULT 'often',
  decisions_affected TEXT,
  typical_distortion TEXT,
  cost_per_distorted_decision NUMERIC DEFAULT 0,
  distorted_decisions_per_month INTEGER DEFAULT 0,
  counterbalance TEXT,
  counterbalance_in_place BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, filter_name)
);

-- MODULE BW: IDENTITY ARCHITECTURE
CREATE TABLE IF NOT EXISTS id_self_concept (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  dimension TEXT NOT NULL,
  you_believe TEXT,
  evidence_supports BOOLEAN DEFAULT true,
  reality TEXT,
  gap_description TEXT,
  gap_cost NUMERIC DEFAULT 0,
  limits_imposed TEXT,
  opportunities_blocked TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, dimension)
);

CREATE TABLE IF NOT EXISTS id_roles_played (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role_name TEXT NOT NULL,
  played_by TEXT,
  serves_purpose TEXT,
  cost_of_role NUMERIC DEFAULT 0,
  prevents_what TEXT,
  outgrown BOOLEAN DEFAULT false,
  replacement_needed TEXT,
  awareness_level TEXT DEFAULT 'unaware',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role_name)
);

CREATE TABLE IF NOT EXISTS id_permission_gaps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  permission_name TEXT NOT NULL,
  description TEXT,
  what_you_wont_allow TEXT,
  why TEXT,
  cost_of_not_allowing NUMERIC DEFAULT 0,
  what_changes_if_permitted TEXT,
  root_fear TEXT,
  rational_basis BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, permission_name)
);

-- MODULE BX: EMOTIONAL PATTERNS
CREATE TABLE IF NOT EXISTS emo_decision_drivers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  driver_name TEXT NOT NULL,
  emotion TEXT,
  trigger TEXT,
  typical_decision TEXT,
  rational_alternative TEXT,
  frequency TEXT DEFAULT 'often',
  cost_per_occurrence NUMERIC DEFAULT 0,
  occurrences_per_month INTEGER DEFAULT 0,
  awareness_level TEXT DEFAULT 'unaware',
  management_strategy TEXT,
  strategy_in_place BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, driver_name)
);

CREATE TABLE IF NOT EXISTS emo_fear_inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  fear_name TEXT NOT NULL,
  fear_type TEXT,
  rational_component_pct NUMERIC DEFAULT 0,
  irrational_component_pct NUMERIC DEFAULT 0,
  decisions_it_blocks TEXT,
  annual_cost_of_avoidance NUMERIC DEFAULT 0,
  worst_case_if_faced TEXT,
  actual_probability TEXT DEFAULT 'low',
  cost_of_worst_case NUMERIC DEFAULT 0,
  expected_value_of_facing NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, fear_name)
);

CREATE TABLE IF NOT EXISTS emo_energy_sources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  source_name TEXT NOT NULL,
  source_type TEXT DEFAULT 'positive',
  description TEXT,
  frequency TEXT,
  energy_impact TEXT DEFAULT 'medium',
  currently_active BOOLEAN DEFAULT true,
  threatened_by TEXT,
  amplifiable BOOLEAN DEFAULT false,
  amplification_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, source_name)
);

-- MODULE BY: FOUNDATIONAL ASSUMPTIONS
CREATE TABLE IF NOT EXISTS fa_sacred_cows (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assumption_name TEXT NOT NULL,
  assumption TEXT,
  domain TEXT,
  held_since TEXT,
  ever_tested BOOLEAN DEFAULT false,
  test_result TEXT,
  cost_if_wrong NUMERIC DEFAULT 0,
  benefit_of_questioning NUMERIC DEFAULT 0,
  who_benefits_from_keeping TEXT,
  what_changes_if_dropped TEXT,
  political_difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assumption_name)
);

CREATE TABLE IF NOT EXISTS fa_constraints (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  constraint_name TEXT NOT NULL,
  assumed_real BOOLEAN DEFAULT true,
  actually_real BOOLEAN DEFAULT true,
  description TEXT,
  imposed_by TEXT,
  removable BOOLEAN DEFAULT false,
  cost_to_remove NUMERIC DEFAULT 0,
  value_if_removed NUMERIC DEFAULT 0,
  who_told_you TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, constraint_name)
);

CREATE TABLE IF NOT EXISTS fa_success_definitions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  stakeholder TEXT NOT NULL,
  their_definition_of_success TEXT,
  your_definition_of_success TEXT,
  alignment_pct NUMERIC DEFAULT 0,
  conflict_area TEXT,
  cost_of_misalignment NUMERIC DEFAULT 0,
  whose_definition_drives_decisions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, stakeholder)
);

-- MODULE BZ: ORIGIN PATTERNS
CREATE TABLE IF NOT EXISTS origin_founding_decisions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  decision_name TEXT NOT NULL,
  made_when TEXT,
  context_then TEXT,
  context_now TEXT,
  still_valid BOOLEAN DEFAULT true,
  cost_of_keeping NUMERIC DEFAULT 0,
  cost_of_changing NUMERIC DEFAULT 0,
  inertia_reason TEXT,
  dependencies INTEGER DEFAULT 0,
  reversible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, decision_name)
);

CREATE TABLE IF NOT EXISTS origin_culture_imprints (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  imprint_name TEXT NOT NULL,
  source TEXT,
  behavior_it_produces TEXT,
  serves_current_stage BOOLEAN DEFAULT true,
  was_useful_when TEXT,
  harmful_now_because TEXT,
  strength TEXT DEFAULT 'medium',
  changeable BOOLEAN DEFAULT true,
  cost_of_keeping NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, imprint_name)
);

CREATE TABLE IF NOT EXISTS origin_growth_ceilings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  ceiling_name TEXT NOT NULL,
  ceiling_type TEXT,
  current_revenue NUMERIC DEFAULT 0,
  ceiling_at NUMERIC DEFAULT 0,
  root_cause TEXT,
  identity_component TEXT,
  skill_component TEXT,
  system_component TEXT,
  what_must_change TEXT,
  founder_willing BOOLEAN DEFAULT true,
  cost_of_breakthrough NUMERIC DEFAULT 0,
  value_of_breakthrough NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, ceiling_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mm_active_biz ON mm_active_models(business_id);
CREATE INDEX IF NOT EXISTS idx_mm_blind_biz ON mm_blind_spots(business_id);
CREATE INDEX IF NOT EXISTS idx_mm_filter_biz ON mm_decision_filters(business_id);
CREATE INDEX IF NOT EXISTS idx_id_self_biz ON id_self_concept(business_id);
CREATE INDEX IF NOT EXISTS idx_id_roles_biz ON id_roles_played(business_id);
CREATE INDEX IF NOT EXISTS idx_id_perm_biz ON id_permission_gaps(business_id);
CREATE INDEX IF NOT EXISTS idx_emo_drv_biz ON emo_decision_drivers(business_id);
CREATE INDEX IF NOT EXISTS idx_emo_fear_biz ON emo_fear_inventory(business_id);
CREATE INDEX IF NOT EXISTS idx_emo_src_biz ON emo_energy_sources(business_id);
CREATE INDEX IF NOT EXISTS idx_fa_sacred_biz ON fa_sacred_cows(business_id);
CREATE INDEX IF NOT EXISTS idx_fa_const_biz ON fa_constraints(business_id);
CREATE INDEX IF NOT EXISTS idx_fa_succ_biz ON fa_success_definitions(business_id);
CREATE INDEX IF NOT EXISTS idx_orig_dec_biz ON origin_founding_decisions(business_id);
CREATE INDEX IF NOT EXISTS idx_orig_cult_biz ON origin_culture_imprints(business_id);
CREATE INDEX IF NOT EXISTS idx_orig_ceil_biz ON origin_growth_ceilings(business_id);

ALTER TABLE mm_active_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE mm_blind_spots DISABLE ROW LEVEL SECURITY;
ALTER TABLE mm_decision_filters DISABLE ROW LEVEL SECURITY;
ALTER TABLE id_self_concept DISABLE ROW LEVEL SECURITY;
ALTER TABLE id_roles_played DISABLE ROW LEVEL SECURITY;
ALTER TABLE id_permission_gaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE emo_decision_drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE emo_fear_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE emo_energy_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE fa_sacred_cows DISABLE ROW LEVEL SECURITY;
ALTER TABLE fa_constraints DISABLE ROW LEVEL SECURITY;
ALTER TABLE fa_success_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE origin_founding_decisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE origin_culture_imprints DISABLE ROW LEVEL SECURITY;
ALTER TABLE origin_growth_ceilings DISABLE ROW LEVEL SECURITY;

-- === 017-add-meridian-tables.sql ===
-- =============================================================================
-- MERIDIAN LAYER — 15 Tables
-- =============================================================================
-- Module BG: Strategic Coherence & Alignment Integrity (3 tables)
-- Module BH: Feedback Loop & Learning Velocity (3 tables)
-- Module BI: Resource Flow & Energy Distribution (3 tables)
-- Module BJ: Risk Correlation & Cascade Mapping (3 tables)
-- Module BK: Growth Architecture & Momentum Physics (3 tables)
-- =============================================================================

-- MODULE BG: STRATEGIC COHERENCE
CREATE TABLE IF NOT EXISTS strat_coherence (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  stated_priority_1 TEXT,
  stated_priority_2 TEXT,
  stated_priority_3 TEXT,
  budget_alignment_p1_pct NUMERIC DEFAULT 0,
  budget_alignment_p2_pct NUMERIC DEFAULT 0,
  budget_alignment_p3_pct NUMERIC DEFAULT 0,
  time_alignment_p1_pct NUMERIC DEFAULT 0,
  time_alignment_p2_pct NUMERIC DEFAULT 0,
  time_alignment_p3_pct NUMERIC DEFAULT 0,
  hiring_aligned_to_priorities BOOLEAN DEFAULT false,
  tech_roadmap_aligned BOOLEAN DEFAULT false,
  marketing_aligned BOOLEAN DEFAULT false,
  say_do_gap_score NUMERIC DEFAULT 0,
  team_can_name_priorities_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS strat_initiative_health (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  initiative_name TEXT NOT NULL,
  linked_to_priority TEXT,
  owner TEXT,
  status TEXT DEFAULT 'in_progress',
  start_date DATE,
  target_date DATE,
  pct_complete NUMERIC DEFAULT 0,
  days_overdue NUMERIC DEFAULT 0,
  budget_allocated NUMERIC DEFAULT 0,
  budget_spent NUMERIC DEFAULT 0,
  expected_outcome TEXT,
  outcome_measurable BOOLEAN DEFAULT false,
  on_track BOOLEAN DEFAULT true,
  blockers TEXT,
  dependencies TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, initiative_name)
);

CREATE TABLE IF NOT EXISTS strat_meeting_alignment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  meeting_type TEXT NOT NULL,
  frequency TEXT,
  avg_duration_minutes NUMERIC DEFAULT 0,
  attendees_avg INTEGER DEFAULT 0,
  strategic_topics_pct NUMERIC DEFAULT 0,
  operational_topics_pct NUMERIC DEFAULT 0,
  produces_decisions BOOLEAN DEFAULT true,
  produces_action_items BOOLEAN DEFAULT true,
  action_items_completed_pct NUMERIC DEFAULT 0,
  could_be_async BOOLEAN DEFAULT false,
  monthly_cost NUMERIC DEFAULT 0,
  effectiveness_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, meeting_type)
);

-- MODULE BH: FEEDBACK LOOPS & LEARNING
CREATE TABLE IF NOT EXISTS fb_loop_inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  loop_name TEXT NOT NULL,
  loop_type TEXT,
  source TEXT,
  destination TEXT,
  signal_captured BOOLEAN DEFAULT false,
  signal_analyzed BOOLEAN DEFAULT false,
  action_taken BOOLEAN DEFAULT false,
  outcome_measured BOOLEAN DEFAULT false,
  loop_closed BOOLEAN DEFAULT false,
  cycle_time_days NUMERIC DEFAULT 0,
  data_quality TEXT DEFAULT 'medium',
  automated BOOLEAN DEFAULT false,
  value_if_working NUMERIC DEFAULT 0,
  current_status TEXT DEFAULT 'broken',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, loop_name)
);

CREATE TABLE IF NOT EXISTS fb_learning_velocity (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  experiments_run_per_quarter INTEGER DEFAULT 0,
  avg_experiment_cycle_days NUMERIC DEFAULT 0,
  lessons_documented_pct NUMERIC DEFAULT 0,
  lessons_applied_pct NUMERIC DEFAULT 0,
  same_mistake_repeated_count INTEGER DEFAULT 0,
  post_mortems_conducted_pct NUMERIC DEFAULT 0,
  knowledge_sharing_frequency TEXT DEFAULT 'rarely',
  time_from_insight_to_action_days NUMERIC DEFAULT 0,
  org_learning_score NUMERIC DEFAULT 0,
  competitive_learning_advantage TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS fb_data_intelligence (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  data_source TEXT NOT NULL,
  category TEXT,
  collected BOOLEAN DEFAULT false,
  analyzed BOOLEAN DEFAULT false,
  acted_upon BOOLEAN DEFAULT false,
  analysis_frequency TEXT DEFAULT 'never',
  data_quality TEXT DEFAULT 'poor',
  insights_generated_monthly INTEGER DEFAULT 0,
  decisions_influenced_monthly INTEGER DEFAULT 0,
  revenue_impact_attributed NUMERIC DEFAULT 0,
  could_automate BOOLEAN DEFAULT false,
  automation_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, data_source)
);

-- MODULE BI: RESOURCE FLOW
CREATE TABLE IF NOT EXISTS res_attention_allocation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  area TEXT NOT NULL,
  importance TEXT DEFAULT 'medium',
  urgency TEXT DEFAULT 'medium',
  hours_per_week_actual NUMERIC DEFAULT 0,
  hours_per_week_ideal NUMERIC DEFAULT 0,
  gap_hours NUMERIC DEFAULT 0,
  over_or_under TEXT DEFAULT 'aligned',
  opportunity_cost_monthly NUMERIC DEFAULT 0,
  driven_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, area)
);

CREATE TABLE IF NOT EXISTS res_cash_velocity (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  cash_in_monthly NUMERIC DEFAULT 0,
  cash_out_monthly NUMERIC DEFAULT 0,
  net_cash_flow NUMERIC DEFAULT 0,
  days_cash_on_hand NUMERIC DEFAULT 0,
  fastest_cash_in TEXT,
  slowest_cash_in TEXT,
  largest_cash_drain TEXT,
  most_wasteful_spend TEXT,
  cash_trapped_in_receivables NUMERIC DEFAULT 0,
  cash_trapped_in_inventory NUMERIC DEFAULT 0,
  available_but_unused_credit NUMERIC DEFAULT 0,
  cash_efficiency_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS res_energy_map (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  team_or_function TEXT NOT NULL,
  energy_level TEXT DEFAULT 'medium',
  morale TEXT DEFAULT 'medium',
  momentum TEXT DEFAULT 'neutral',
  biggest_frustration TEXT,
  biggest_win_recent TEXT,
  autonomy_level TEXT DEFAULT 'medium',
  clarity_of_purpose TEXT DEFAULT 'medium',
  tools_adequacy TEXT DEFAULT 'medium',
  feeling_heard BOOLEAN DEFAULT true,
  would_recommend_working_here BOOLEAN DEFAULT true,
  flight_risk_aggregate TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, team_or_function)
);

-- MODULE BJ: RISK CASCADE
CREATE TABLE IF NOT EXISTS risk_correlations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  risk_a TEXT NOT NULL,
  risk_a_domain TEXT,
  risk_b TEXT NOT NULL,
  risk_b_domain TEXT,
  correlation_type TEXT DEFAULT 'amplifies',
  correlation_strength TEXT DEFAULT 'medium',
  if_a_triggers_b_probability TEXT DEFAULT 'medium',
  combined_impact NUMERIC DEFAULT 0,
  mitigation_for_both TEXT,
  mitigation_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, risk_a, risk_b)
);

CREATE TABLE IF NOT EXISTS risk_scenarios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  scenario_name TEXT NOT NULL,
  trigger_event TEXT,
  probability TEXT DEFAULT 'low',
  cascade_sequence TEXT,
  systems_affected TEXT,
  time_to_impact TEXT,
  worst_case_revenue_impact NUMERIC DEFAULT 0,
  worst_case_survival_months NUMERIC DEFAULT 0,
  response_plan_exists BOOLEAN DEFAULT false,
  last_rehearsed DATE,
  insurance_coverage NUMERIC DEFAULT 0,
  gap NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, scenario_name)
);

CREATE TABLE IF NOT EXISTS risk_resilience (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  financial_resilience_months NUMERIC DEFAULT 0,
  operational_resilience_score NUMERIC DEFAULT 0,
  team_resilience_score NUMERIC DEFAULT 0,
  technology_resilience_score NUMERIC DEFAULT 0,
  customer_resilience_score NUMERIC DEFAULT 0,
  single_points_of_failure INTEGER DEFAULT 0,
  recovery_time_estimate_days NUMERIC DEFAULT 0,
  stress_tested BOOLEAN DEFAULT false,
  last_crisis TEXT,
  crisis_response_rating NUMERIC DEFAULT 0,
  lessons_from_last_crisis TEXT,
  overall_antifragility_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- MODULE BK: GROWTH ARCHITECTURE
CREATE TABLE IF NOT EXISTS growth_engine (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  primary_growth_lever TEXT,
  secondary_growth_lever TEXT,
  growth_rate_current_pct NUMERIC DEFAULT 0,
  growth_rate_target_pct NUMERIC DEFAULT 0,
  growth_efficiency_ratio NUMERIC DEFAULT 0,
  viral_coefficient NUMERIC DEFAULT 0,
  organic_pct_of_growth NUMERIC DEFAULT 0,
  paid_pct_of_growth NUMERIC DEFAULT 0,
  expansion_pct_of_growth NUMERIC DEFAULT 0,
  net_dollar_retention_pct NUMERIC DEFAULT 0,
  growth_compounding BOOLEAN DEFAULT false,
  biggest_growth_blocker TEXT,
  cheapest_growth_lever TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS growth_flywheel (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  stage_name TEXT NOT NULL,
  stage_order INTEGER DEFAULT 0,
  input_metric TEXT,
  output_metric TEXT,
  current_conversion_pct NUMERIC DEFAULT 0,
  target_conversion_pct NUMERIC DEFAULT 0,
  bottleneck BOOLEAN DEFAULT false,
  friction_description TEXT,
  improvement_potential_pct NUMERIC DEFAULT 0,
  revenue_impact_of_improvement NUMERIC DEFAULT 0,
  cost_to_improve NUMERIC DEFAULT 0,
  feeds_into_next BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, stage_name)
);

CREATE TABLE IF NOT EXISTS growth_momentum (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  momentum_score NUMERIC DEFAULT 0,
  momentum_direction TEXT DEFAULT 'neutral',
  leading_indicators_positive INTEGER DEFAULT 0,
  leading_indicators_negative INTEGER DEFAULT 0,
  pipeline_coverage_ratio NUMERIC DEFAULT 0,
  months_of_committed_revenue NUMERIC DEFAULT 0,
  new_logo_trend TEXT DEFAULT 'stable',
  expansion_trend TEXT DEFAULT 'stable',
  churn_trend TEXT DEFAULT 'stable',
  team_confidence_score NUMERIC DEFAULT 0,
  market_tailwind_score NUMERIC DEFAULT 0,
  execution_velocity_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_strat_coh_biz ON strat_coherence(business_id);
CREATE INDEX IF NOT EXISTS idx_strat_init_biz ON strat_initiative_health(business_id);
CREATE INDEX IF NOT EXISTS idx_strat_mtg_biz ON strat_meeting_alignment(business_id);
CREATE INDEX IF NOT EXISTS idx_fb_loop_biz ON fb_loop_inventory(business_id);
CREATE INDEX IF NOT EXISTS idx_fb_learn_biz ON fb_learning_velocity(business_id);
CREATE INDEX IF NOT EXISTS idx_fb_data_biz ON fb_data_intelligence(business_id);
CREATE INDEX IF NOT EXISTS idx_res_attn_biz ON res_attention_allocation(business_id);
CREATE INDEX IF NOT EXISTS idx_res_cash_biz ON res_cash_velocity(business_id);
CREATE INDEX IF NOT EXISTS idx_res_energy_biz ON res_energy_map(business_id);
CREATE INDEX IF NOT EXISTS idx_risk_corr_biz ON risk_correlations(business_id);
CREATE INDEX IF NOT EXISTS idx_risk_scen_biz ON risk_scenarios(business_id);
CREATE INDEX IF NOT EXISTS idx_risk_res_biz ON risk_resilience(business_id);
CREATE INDEX IF NOT EXISTS idx_growth_eng_biz ON growth_engine(business_id);
CREATE INDEX IF NOT EXISTS idx_growth_fly_biz ON growth_flywheel(business_id);
CREATE INDEX IF NOT EXISTS idx_growth_mom_biz ON growth_momentum(business_id);

ALTER TABLE strat_coherence DISABLE ROW LEVEL SECURITY;
ALTER TABLE strat_initiative_health DISABLE ROW LEVEL SECURITY;
ALTER TABLE strat_meeting_alignment DISABLE ROW LEVEL SECURITY;
ALTER TABLE fb_loop_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE fb_learning_velocity DISABLE ROW LEVEL SECURITY;
ALTER TABLE fb_data_intelligence DISABLE ROW LEVEL SECURITY;
ALTER TABLE res_attention_allocation DISABLE ROW LEVEL SECURITY;
ALTER TABLE res_cash_velocity DISABLE ROW LEVEL SECURITY;
ALTER TABLE res_energy_map DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_correlations DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_resilience DISABLE ROW LEVEL SECURITY;
ALTER TABLE growth_engine DISABLE ROW LEVEL SECURITY;
ALTER TABLE growth_flywheel DISABLE ROW LEVEL SECURITY;
ALTER TABLE growth_momentum DISABLE ROW LEVEL SECURITY;

-- === 018-add-apex-tables.sql ===
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
