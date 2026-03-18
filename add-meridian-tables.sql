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
