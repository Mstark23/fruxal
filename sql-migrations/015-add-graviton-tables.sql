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
