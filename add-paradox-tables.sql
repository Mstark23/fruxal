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
