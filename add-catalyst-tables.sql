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
