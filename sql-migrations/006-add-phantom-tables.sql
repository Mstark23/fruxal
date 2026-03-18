-- =============================================================================
-- PHANTOM LAYER — 15 Tables
-- =============================================================================
-- Module S: Digital & Marketing Intelligence (3 tables)
-- Module T: Human Capital & Talent (3 tables)
-- Module U: Data & Cybersecurity Posture (3 tables)
-- Module V: Growth & Market Position (3 tables)
-- Module W: Energy & Sustainability (3 tables)
-- =============================================================================

-- ═══════════════════════════════════════════════════════════
-- MODULE S: DIGITAL & MARKETING INTELLIGENCE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS digi_website (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  monthly_visitors INTEGER DEFAULT 0,
  visitor_trend TEXT DEFAULT 'stable',
  bounce_rate_pct NUMERIC DEFAULT 0,
  avg_session_duration_sec NUMERIC DEFAULT 0,
  pages_per_session NUMERIC DEFAULT 0,
  organic_traffic_pct NUMERIC DEFAULT 0,
  paid_traffic_pct NUMERIC DEFAULT 0,
  referral_traffic_pct NUMERIC DEFAULT 0,
  direct_traffic_pct NUMERIC DEFAULT 0,
  conversion_rate_pct NUMERIC DEFAULT 0,
  leads_from_website INTEGER DEFAULT 0,
  domain_authority INTEGER DEFAULT 0,
  page_speed_score INTEGER DEFAULT 0,
  mobile_score INTEGER DEFAULT 0,
  indexed_pages INTEGER DEFAULT 0,
  broken_links INTEGER DEFAULT 0,
  missing_meta_descriptions INTEGER DEFAULT 0,
  missing_alt_tags INTEGER DEFAULT 0,
  ssl_valid BOOLEAN DEFAULT true,
  uptime_pct NUMERIC DEFAULT 99.9,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS digi_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  platform TEXT NOT NULL,
  campaign_name TEXT,
  objective TEXT,
  spend NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr_pct NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost_per_conversion NUMERIC DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  industry_avg_cpc NUMERIC DEFAULT 0,
  industry_avg_ctr NUMERIC DEFAULT 0,
  industry_avg_conversion_rate NUMERIC DEFAULT 0,
  quality_score NUMERIC DEFAULT 0,
  wasted_spend NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, platform, campaign_name)
);

CREATE TABLE IF NOT EXISTS digi_content (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  channel TEXT NOT NULL,
  content_pieces_published INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  engagement_rate_pct NUMERIC DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  cost_to_produce NUMERIC DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  email_list_size INTEGER DEFAULT 0,
  email_open_rate_pct NUMERIC DEFAULT 0,
  email_click_rate_pct NUMERIC DEFAULT 0,
  email_unsubscribe_rate_pct NUMERIC DEFAULT 0,
  social_followers INTEGER DEFAULT 0,
  follower_growth_pct NUMERIC DEFAULT 0,
  best_performing_type TEXT,
  worst_performing_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, channel)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE T: HUMAN CAPITAL & TALENT
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hc_turnover (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_employees INTEGER DEFAULT 0,
  departures INTEGER DEFAULT 0,
  voluntary_departures INTEGER DEFAULT 0,
  involuntary_departures INTEGER DEFAULT 0,
  turnover_rate_pct NUMERIC DEFAULT 0,
  voluntary_rate_pct NUMERIC DEFAULT 0,
  industry_avg_turnover NUMERIC DEFAULT 0,
  avg_tenure_months NUMERIC DEFAULT 0,
  avg_cost_per_departure NUMERIC DEFAULT 0,
  total_turnover_cost NUMERIC DEFAULT 0,
  top_departure_reason TEXT,
  regrettable_departures INTEGER DEFAULT 0,
  regrettable_pct NUMERIC DEFAULT 0,
  avg_time_to_fill_days NUMERIC DEFAULT 0,
  open_positions INTEGER DEFAULT 0,
  open_position_cost_monthly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS hc_compensation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  role_title TEXT NOT NULL,
  department TEXT,
  current_salary NUMERIC DEFAULT 0,
  market_median NUMERIC DEFAULT 0,
  market_25th NUMERIC DEFAULT 0,
  market_75th NUMERIC DEFAULT 0,
  compa_ratio NUMERIC DEFAULT 0,
  total_comp NUMERIC DEFAULT 0,
  market_total_comp NUMERIC DEFAULT 0,
  is_below_market BOOLEAN DEFAULT false,
  is_above_market BOOLEAN DEFAULT false,
  flight_risk BOOLEAN DEFAULT false,
  performance_rating NUMERIC DEFAULT 0,
  years_in_role NUMERIC DEFAULT 0,
  last_raise_date DATE,
  months_since_raise INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, role_title)
);

CREATE TABLE IF NOT EXISTS hc_hiring (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  positions_opened INTEGER DEFAULT 0,
  positions_filled INTEGER DEFAULT 0,
  positions_cancelled INTEGER DEFAULT 0,
  total_applicants INTEGER DEFAULT 0,
  interviews_conducted INTEGER DEFAULT 0,
  offers_extended INTEGER DEFAULT 0,
  offers_accepted INTEGER DEFAULT 0,
  offer_acceptance_rate_pct NUMERIC DEFAULT 0,
  avg_time_to_fill_days NUMERIC DEFAULT 0,
  avg_cost_per_hire NUMERIC DEFAULT 0,
  total_recruiting_spend NUMERIC DEFAULT 0,
  agency_fees NUMERIC DEFAULT 0,
  job_board_spend NUMERIC DEFAULT 0,
  internal_recruiter_cost NUMERIC DEFAULT 0,
  quality_of_hire_score NUMERIC DEFAULT 0,
  new_hire_retention_90d_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE U: DATA & CYBERSECURITY POSTURE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sec_assessment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  overall_score INTEGER DEFAULT 0,
  password_policy_score INTEGER DEFAULT 0,
  mfa_adoption_pct NUMERIC DEFAULT 0,
  endpoints_patched_pct NUMERIC DEFAULT 0,
  backup_frequency TEXT,
  backup_tested_recently BOOLEAN DEFAULT false,
  last_backup_test DATE,
  encryption_at_rest BOOLEAN DEFAULT false,
  encryption_in_transit BOOLEAN DEFAULT true,
  employee_training_completed_pct NUMERIC DEFAULT 0,
  last_training_date DATE,
  phishing_test_fail_rate_pct NUMERIC DEFAULT 0,
  admin_accounts INTEGER DEFAULT 0,
  excessive_admin_access BOOLEAN DEFAULT false,
  third_party_integrations INTEGER DEFAULT 0,
  unreviewed_integrations INTEGER DEFAULT 0,
  incident_response_plan BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS sec_breach_risk (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  pii_records_count INTEGER DEFAULT 0,
  payment_data_stored BOOLEAN DEFAULT false,
  health_data_stored BOOLEAN DEFAULT false,
  data_classification_exists BOOLEAN DEFAULT false,
  data_retention_policy BOOLEAN DEFAULT false,
  estimated_breach_cost NUMERIC DEFAULT 0,
  cyber_insurance_coverage NUMERIC DEFAULT 0,
  coverage_gap NUMERIC DEFAULT 0,
  gdpr_applicable BOOLEAN DEFAULT false,
  ccpa_applicable BOOLEAN DEFAULT false,
  hipaa_applicable BOOLEAN DEFAULT false,
  compliance_gaps INTEGER DEFAULT 0,
  estimated_fine_risk NUMERIC DEFAULT 0,
  vendor_risk_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

CREATE TABLE IF NOT EXISTS sec_access (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_user_accounts INTEGER DEFAULT 0,
  active_accounts INTEGER DEFAULT 0,
  inactive_accounts INTEGER DEFAULT 0,
  orphaned_accounts INTEGER DEFAULT 0,
  shared_accounts INTEGER DEFAULT 0,
  mfa_enabled_pct NUMERIC DEFAULT 0,
  weak_passwords_detected INTEGER DEFAULT 0,
  privileged_accounts INTEGER DEFAULT 0,
  excessive_permissions INTEGER DEFAULT 0,
  last_access_review DATE,
  months_since_review INTEGER DEFAULT 0,
  saas_apps_connected INTEGER DEFAULT 0,
  saas_with_sso INTEGER DEFAULT 0,
  shadow_it_detected INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE V: GROWTH & MARKET POSITION
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS grow_competitors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  competitor_name TEXT NOT NULL,
  market_position TEXT,
  estimated_revenue NUMERIC DEFAULT 0,
  estimated_market_share_pct NUMERIC DEFAULT 0,
  price_vs_us TEXT,
  price_difference_pct NUMERIC DEFAULT 0,
  strengths TEXT,
  weaknesses TEXT,
  recent_moves TEXT,
  threat_level TEXT DEFAULT 'medium',
  our_advantage TEXT,
  our_vulnerability TEXT,
  win_rate_against_pct NUMERIC DEFAULT 0,
  loss_reason_top TEXT,
  last_analyzed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, competitor_name)
);

CREATE TABLE IF NOT EXISTS grow_market (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  analysis_date DATE NOT NULL,
  total_addressable_market NUMERIC DEFAULT 0,
  serviceable_addressable_market NUMERIC DEFAULT 0,
  serviceable_obtainable_market NUMERIC DEFAULT 0,
  current_revenue NUMERIC DEFAULT 0,
  market_penetration_pct NUMERIC DEFAULT 0,
  market_growth_rate_pct NUMERIC DEFAULT 0,
  our_growth_rate_pct NUMERIC DEFAULT 0,
  growing_faster_than_market BOOLEAN DEFAULT false,
  untapped_segments JSONB DEFAULT '[]',
  geographic_expansion_potential JSONB DEFAULT '[]',
  product_expansion_potential JSONB DEFAULT '[]',
  pricing_power_score NUMERIC DEFAULT 0,
  customer_concentration_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, analysis_date)
);

CREATE TABLE IF NOT EXISTS grow_readiness (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  assessment_date DATE NOT NULL,
  overall_readiness_score INTEGER DEFAULT 0,
  financial_health_score INTEGER DEFAULT 0,
  operational_scalability_score INTEGER DEFAULT 0,
  team_readiness_score INTEGER DEFAULT 0,
  technology_scalability_score INTEGER DEFAULT 0,
  brand_strength_score INTEGER DEFAULT 0,
  process_documentation_pct NUMERIC DEFAULT 0,
  key_person_dependency INTEGER DEFAULT 0,
  bottleneck_at_scale TEXT,
  max_capacity_before_hire TEXT,
  estimated_expansion_cost NUMERIC DEFAULT 0,
  estimated_expansion_roi_months NUMERIC DEFAULT 0,
  risk_factors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, assessment_date)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE W: ENERGY & SUSTAINABILITY
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS green_energy (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  electricity_kwh NUMERIC DEFAULT 0,
  electricity_cost NUMERIC DEFAULT 0,
  gas_therms NUMERIC DEFAULT 0,
  gas_cost NUMERIC DEFAULT 0,
  water_gallons NUMERIC DEFAULT 0,
  water_cost NUMERIC DEFAULT 0,
  total_energy_cost NUMERIC DEFAULT 0,
  cost_per_sqft NUMERIC DEFAULT 0,
  industry_avg_cost_per_sqft NUMERIC DEFAULT 0,
  above_avg_pct NUMERIC DEFAULT 0,
  peak_demand_kw NUMERIC DEFAULT 0,
  demand_charges NUMERIC DEFAULT 0,
  renewable_pct NUMERIC DEFAULT 0,
  energy_star_score INTEGER DEFAULT 0,
  yoy_change_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS green_carbon (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  reporting_year INTEGER NOT NULL,
  scope_1_tons NUMERIC DEFAULT 0,
  scope_2_tons NUMERIC DEFAULT 0,
  scope_3_tons NUMERIC DEFAULT 0,
  total_co2_tons NUMERIC DEFAULT 0,
  co2_per_employee NUMERIC DEFAULT 0,
  co2_per_revenue_million NUMERIC DEFAULT 0,
  industry_avg_per_employee NUMERIC DEFAULT 0,
  carbon_tax_applicable BOOLEAN DEFAULT false,
  carbon_tax_rate NUMERIC DEFAULT 0,
  carbon_tax_liability NUMERIC DEFAULT 0,
  offset_credits_purchased NUMERIC DEFAULT 0,
  offset_cost NUMERIC DEFAULT 0,
  reduction_target_pct NUMERIC DEFAULT 0,
  actual_reduction_pct NUMERIC DEFAULT 0,
  on_track BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, reporting_year)
);

CREATE TABLE IF NOT EXISTS green_incentives (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  incentive_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  jurisdiction TEXT,
  estimated_value NUMERIC DEFAULT 0,
  eligibility_status TEXT DEFAULT 'unknown',
  application_deadline DATE,
  requirements TEXT,
  effort_to_claim TEXT DEFAULT 'medium',
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_digi_web_biz ON digi_website(business_id);
CREATE INDEX IF NOT EXISTS idx_digi_camp_biz ON digi_campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_digi_cont_biz ON digi_content(business_id);
CREATE INDEX IF NOT EXISTS idx_hc_turn_biz ON hc_turnover(business_id);
CREATE INDEX IF NOT EXISTS idx_hc_comp_biz ON hc_compensation(business_id);
CREATE INDEX IF NOT EXISTS idx_hc_hire_biz ON hc_hiring(business_id);
CREATE INDEX IF NOT EXISTS idx_sec_assess_biz ON sec_assessment(business_id);
CREATE INDEX IF NOT EXISTS idx_sec_breach_biz ON sec_breach_risk(business_id);
CREATE INDEX IF NOT EXISTS idx_sec_access_biz ON sec_access(business_id);
CREATE INDEX IF NOT EXISTS idx_grow_comp_biz ON grow_competitors(business_id);
CREATE INDEX IF NOT EXISTS idx_grow_mkt_biz ON grow_market(business_id);
CREATE INDEX IF NOT EXISTS idx_grow_ready_biz ON grow_readiness(business_id);
CREATE INDEX IF NOT EXISTS idx_green_energy_biz ON green_energy(business_id);
CREATE INDEX IF NOT EXISTS idx_green_carbon_biz ON green_carbon(business_id);
CREATE INDEX IF NOT EXISTS idx_green_incent_biz ON green_incentives(business_id);

ALTER TABLE digi_website DISABLE ROW LEVEL SECURITY;
ALTER TABLE digi_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE digi_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE hc_turnover DISABLE ROW LEVEL SECURITY;
ALTER TABLE hc_compensation DISABLE ROW LEVEL SECURITY;
ALTER TABLE hc_hiring DISABLE ROW LEVEL SECURITY;
ALTER TABLE sec_assessment DISABLE ROW LEVEL SECURITY;
ALTER TABLE sec_breach_risk DISABLE ROW LEVEL SECURITY;
ALTER TABLE sec_access DISABLE ROW LEVEL SECURITY;
ALTER TABLE grow_competitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE grow_market DISABLE ROW LEVEL SECURITY;
ALTER TABLE grow_readiness DISABLE ROW LEVEL SECURITY;
ALTER TABLE green_energy DISABLE ROW LEVEL SECURITY;
ALTER TABLE green_carbon DISABLE ROW LEVEL SECURITY;
ALTER TABLE green_incentives DISABLE ROW LEVEL SECURITY;
