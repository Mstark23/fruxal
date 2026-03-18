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
