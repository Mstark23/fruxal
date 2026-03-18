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
