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
