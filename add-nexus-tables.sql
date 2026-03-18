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
