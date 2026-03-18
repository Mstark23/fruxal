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
