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
