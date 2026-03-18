-- =============================================================================
-- DEEP TRACKING LAYER — 15 Tables
-- =============================================================================
-- Module D: Facility & Occupancy (fac_leases, fac_utilities, fac_efficiency)
-- Module E: Shipping & Logistics (ship_carriers, ship_monthly, ship_optimization)
-- Module F: Tech Stack (tech_stack, tech_overlaps, tech_waste)
-- Module G: Insurance & Compliance (ins_policies, ins_gaps, ins_compliance)
-- Module H: Receivables (recv_aging, recv_client_scores, recv_risk)
-- =============================================================================

-- MODULE D: FACILITY
CREATE TABLE IF NOT EXISTS fac_leases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  property_name TEXT NOT NULL,
  property_type TEXT DEFAULT 'office',
  address TEXT,
  total_sqft NUMERIC DEFAULT 0,
  usable_sqft NUMERIC DEFAULT 0,
  utilized_sqft NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  monthly_rent NUMERIC DEFAULT 0,
  cost_per_sqft_month NUMERIC DEFAULT 0,
  market_rate_per_sqft NUMERIC DEFAULT 0,
  above_market_pct NUMERIC DEFAULT 0,
  lease_start DATE,
  lease_end DATE,
  auto_renew BOOLEAN DEFAULT false,
  renewal_increase_pct NUMERIC DEFAULT 0,
  notice_period_days INTEGER DEFAULT 90,
  cancellation_deadline DATE,
  last_negotiated DATE,
  months_since_negotiation INTEGER DEFAULT 0,
  cam_charges NUMERIC DEFAULT 0,
  property_tax_passthrough NUMERIC DEFAULT 0,
  insurance_passthrough NUMERIC DEFAULT 0,
  total_occupancy_cost NUMERIC DEFAULT 0,
  headcount_at_location INTEGER DEFAULT 0,
  cost_per_employee NUMERIC DEFAULT 0,
  remote_eligible_pct NUMERIC DEFAULT 0,
  sublease_potential BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, property_name)
);

CREATE TABLE IF NOT EXISTS fac_utilities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  property_id TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  utility_type TEXT NOT NULL,
  provider TEXT,
  current_plan TEXT,
  monthly_cost NUMERIC DEFAULT 0,
  usage_amount NUMERIC DEFAULT 0,
  usage_unit TEXT,
  cost_per_unit NUMERIC DEFAULT 0,
  market_rate_per_unit NUMERIC DEFAULT 0,
  optimal_plan TEXT,
  optimal_cost NUMERIC DEFAULT 0,
  potential_savings NUMERIC DEFAULT 0,
  usage_trend TEXT DEFAULT 'stable',
  off_hours_usage_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, utility_type)
);

CREATE TABLE IF NOT EXISTS fac_efficiency (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  property_id TEXT,
  snapshot_date DATE NOT NULL,
  revenue_per_sqft NUMERIC DEFAULT 0,
  cost_per_sqft NUMERIC DEFAULT 0,
  employees_per_1000sqft NUMERIC DEFAULT 0,
  industry_benchmark_rev_sqft NUMERIC DEFAULT 0,
  industry_benchmark_cost_sqft NUMERIC DEFAULT 0,
  vacant_desks INTEGER DEFAULT 0,
  total_desks INTEGER DEFAULT 0,
  desk_utilization_pct NUMERIC DEFAULT 0,
  meeting_room_hours_used NUMERIC DEFAULT 0,
  meeting_room_hours_available NUMERIC DEFAULT 0,
  meeting_room_utilization_pct NUMERIC DEFAULT 0,
  parking_spots_used INTEGER DEFAULT 0,
  parking_spots_leased INTEGER DEFAULT 0,
  excess_space_cost_monthly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- MODULE E: SHIPPING
CREATE TABLE IF NOT EXISTS ship_carriers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  carrier TEXT NOT NULL,
  account_type TEXT DEFAULT 'standard',
  discount_pct NUMERIC DEFAULT 0,
  avg_rate_per_package NUMERIC DEFAULT 0,
  market_avg_rate NUMERIC DEFAULT 0,
  annual_volume_packages INTEGER DEFAULT 0,
  annual_spend NUMERIC DEFAULT 0,
  surcharges_paid NUMERIC DEFAULT 0,
  dim_weight_charges NUMERIC DEFAULT 0,
  residential_surcharges NUMERIC DEFAULT 0,
  fuel_surcharges NUMERIC DEFAULT 0,
  insurance_costs NUMERIC DEFAULT 0,
  last_rate_negotiation DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, carrier)
);

CREATE TABLE IF NOT EXISTS ship_monthly (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_shipments INTEGER DEFAULT 0,
  total_shipping_cost NUMERIC DEFAULT 0,
  avg_cost_per_shipment NUMERIC DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  shipping_as_pct_revenue NUMERIC DEFAULT 0,
  free_shipping_orders INTEGER DEFAULT 0,
  free_shipping_cost NUMERIC DEFAULT 0,
  late_deliveries INTEGER DEFAULT 0,
  late_delivery_pct NUMERIC DEFAULT 0,
  damaged_shipments INTEGER DEFAULT 0,
  damage_rate_pct NUMERIC DEFAULT 0,
  returns_count INTEGER DEFAULT 0,
  return_shipping_cost NUMERIC DEFAULT 0,
  return_rate_pct NUMERIC DEFAULT 0,
  refunds_issued NUMERIC DEFAULT 0,
  avg_package_weight NUMERIC DEFAULT 0,
  avg_zone NUMERIC DEFAULT 0,
  carrier_split JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS ship_optimization (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  analysis_date DATE,
  current_avg_cost NUMERIC DEFAULT 0,
  optimal_avg_cost NUMERIC DEFAULT 0,
  optimal_carrier_mix JSONB DEFAULT '{}',
  potential_savings NUMERIC DEFAULT 0,
  dim_weight_savings NUMERIC DEFAULT 0,
  negotiation_savings NUMERIC DEFAULT 0,
  carrier_switch_savings NUMERIC DEFAULT 0,
  packaging_savings NUMERIC DEFAULT 0,
  zone_optimization_savings NUMERIC DEFAULT 0,
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id)
);

-- MODULE F: TECH STACK
CREATE TABLE IF NOT EXISTS tech_stack (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  tool_name TEXT NOT NULL,
  category TEXT,
  vendor TEXT,
  monthly_cost NUMERIC DEFAULT 0,
  annual_cost NUMERIC DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly',
  seats_purchased INTEGER DEFAULT 0,
  seats_active INTEGER DEFAULT 0,
  seat_utilization_pct NUMERIC DEFAULT 0,
  plan_tier TEXT,
  features_used_pct NUMERIC DEFAULT 0,
  could_downgrade BOOLEAN DEFAULT false,
  downgrade_savings_monthly NUMERIC DEFAULT 0,
  last_login_by_any_user DATE,
  days_since_last_use INTEGER DEFAULT 0,
  appears_unused BOOLEAN DEFAULT false,
  overlap_with TEXT,
  is_redundant BOOLEAN DEFAULT false,
  auto_renews BOOLEAN DEFAULT false,
  cancellation_deadline DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, tool_name)
);

CREATE TABLE IF NOT EXISTS tech_overlaps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  category TEXT NOT NULL,
  tools_in_category INTEGER DEFAULT 0,
  tool_names JSONB DEFAULT '[]',
  total_monthly_cost NUMERIC DEFAULT 0,
  recommended_consolidation TEXT,
  potential_savings NUMERIC DEFAULT 0,
  overlap_type TEXT DEFAULT 'full',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, category)
);

CREATE TABLE IF NOT EXISTS tech_waste (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_tools INTEGER DEFAULT 0,
  total_monthly_spend NUMERIC DEFAULT 0,
  unused_tools INTEGER DEFAULT 0,
  unused_monthly_waste NUMERIC DEFAULT 0,
  underutilized_tools INTEGER DEFAULT 0,
  underutilized_waste NUMERIC DEFAULT 0,
  redundant_tools INTEGER DEFAULT 0,
  redundant_waste NUMERIC DEFAULT 0,
  empty_seats INTEGER DEFAULT 0,
  empty_seat_waste NUMERIC DEFAULT 0,
  total_waste_monthly NUMERIC DEFAULT 0,
  total_waste_annual NUMERIC DEFAULT 0,
  could_save_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- MODULE G: INSURANCE & COMPLIANCE
CREATE TABLE IF NOT EXISTS ins_policies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  policy_type TEXT NOT NULL,
  carrier TEXT,
  annual_premium NUMERIC DEFAULT 0,
  monthly_cost NUMERIC DEFAULT 0,
  deductible NUMERIC DEFAULT 0,
  coverage_limit NUMERIC DEFAULT 0,
  effective_date DATE,
  expiration_date DATE,
  days_until_expiry INTEGER DEFAULT 0,
  last_shopped DATE,
  months_since_shopped INTEGER DEFAULT 0,
  market_avg_premium NUMERIC DEFAULT 0,
  above_market_pct NUMERIC DEFAULT 0,
  claims_filed INTEGER DEFAULT 0,
  claims_paid NUMERIC DEFAULT 0,
  loss_ratio_pct NUMERIC DEFAULT 0,
  coverage_adequate BOOLEAN DEFAULT true,
  gap_identified TEXT,
  workers_comp_mod_rate NUMERIC DEFAULT 1.0,
  workers_comp_class_code TEXT,
  class_code_correct BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, policy_type)
);

CREATE TABLE IF NOT EXISTS ins_gaps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  gap_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  policy_type TEXT,
  description TEXT,
  financial_exposure NUMERIC DEFAULT 0,
  recommended_action TEXT,
  estimated_cost_to_fix NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ins_compliance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  item_type TEXT NOT NULL,
  name TEXT NOT NULL,
  issuing_authority TEXT,
  license_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  days_until_expiry INTEGER DEFAULT 0,
  renewal_cost NUMERIC DEFAULT 0,
  late_renewal_penalty NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, name)
);

-- MODULE H: RECEIVABLES
CREATE TABLE IF NOT EXISTS recv_aging (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_receivables NUMERIC DEFAULT 0,
  current_0_30 NUMERIC DEFAULT 0,
  aging_31_60 NUMERIC DEFAULT 0,
  aging_61_90 NUMERIC DEFAULT 0,
  aging_91_120 NUMERIC DEFAULT 0,
  aging_120_plus NUMERIC DEFAULT 0,
  pct_over_60 NUMERIC DEFAULT 0,
  pct_over_90 NUMERIC DEFAULT 0,
  pct_over_120 NUMERIC DEFAULT 0,
  weighted_avg_days NUMERIC DEFAULT 0,
  estimated_bad_debt NUMERIC DEFAULT 0,
  bad_debt_pct NUMERIC DEFAULT 0,
  invoices_total INTEGER DEFAULT 0,
  invoices_overdue INTEGER DEFAULT 0,
  overdue_pct NUMERIC DEFAULT 0,
  dso NUMERIC DEFAULT 0,
  dso_trend TEXT DEFAULT 'stable',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS recv_client_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_name TEXT NOT NULL,
  payment_score INTEGER DEFAULT 50,
  avg_days_to_pay INTEGER DEFAULT 30,
  median_days_to_pay INTEGER DEFAULT 30,
  invoices_total INTEGER DEFAULT 0,
  invoices_paid_on_time INTEGER DEFAULT 0,
  on_time_pct NUMERIC DEFAULT 0,
  invoices_late INTEGER DEFAULT 0,
  invoices_outstanding INTEGER DEFAULT 0,
  outstanding_amount NUMERIC DEFAULT 0,
  oldest_outstanding_days INTEGER DEFAULT 0,
  total_billed_12mo NUMERIC DEFAULT 0,
  total_collected_12mo NUMERIC DEFAULT 0,
  collection_rate_pct NUMERIC DEFAULT 0,
  payment_trend TEXT DEFAULT 'stable',
  risk_level TEXT DEFAULT 'low',
  recommended_terms TEXT DEFAULT 'net_30',
  recommended_credit_limit NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, client_name)
);

CREATE TABLE IF NOT EXISTS recv_risk (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_outstanding NUMERIC DEFAULT 0,
  at_risk_amount NUMERIC DEFAULT 0,
  at_risk_pct NUMERIC DEFAULT 0,
  high_risk_clients INTEGER DEFAULT 0,
  high_risk_amount NUMERIC DEFAULT 0,
  worsening_clients INTEGER DEFAULT 0,
  worsening_amount NUMERIC DEFAULT 0,
  collection_efficiency NUMERIC DEFAULT 0,
  avg_collection_period NUMERIC DEFAULT 0,
  write_off_ytd NUMERIC DEFAULT 0,
  write_off_last_year NUMERIC DEFAULT 0,
  projected_bad_debt_annual NUMERIC DEFAULT 0,
  recommended_reserve NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fac_leases_biz ON fac_leases(business_id);
CREATE INDEX IF NOT EXISTS idx_fac_util_biz ON fac_utilities(business_id);
CREATE INDEX IF NOT EXISTS idx_fac_eff_biz ON fac_efficiency(business_id);
CREATE INDEX IF NOT EXISTS idx_ship_carrier_biz ON ship_carriers(business_id);
CREATE INDEX IF NOT EXISTS idx_ship_monthly_biz ON ship_monthly(business_id);
CREATE INDEX IF NOT EXISTS idx_ship_opt_biz ON ship_optimization(business_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_biz ON tech_stack(business_id);
CREATE INDEX IF NOT EXISTS idx_tech_overlap_biz ON tech_overlaps(business_id);
CREATE INDEX IF NOT EXISTS idx_tech_waste_biz ON tech_waste(business_id);
CREATE INDEX IF NOT EXISTS idx_ins_pol_biz ON ins_policies(business_id);
CREATE INDEX IF NOT EXISTS idx_ins_gaps_biz ON ins_gaps(business_id);
CREATE INDEX IF NOT EXISTS idx_ins_comp_biz ON ins_compliance(business_id);
CREATE INDEX IF NOT EXISTS idx_recv_aging_biz ON recv_aging(business_id);
CREATE INDEX IF NOT EXISTS idx_recv_scores_biz ON recv_client_scores(business_id);
CREATE INDEX IF NOT EXISTS idx_recv_risk_biz ON recv_risk(business_id);

ALTER TABLE fac_leases DISABLE ROW LEVEL SECURITY;
ALTER TABLE fac_utilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE fac_efficiency DISABLE ROW LEVEL SECURITY;
ALTER TABLE ship_carriers DISABLE ROW LEVEL SECURITY;
ALTER TABLE ship_monthly DISABLE ROW LEVEL SECURITY;
ALTER TABLE ship_optimization DISABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack DISABLE ROW LEVEL SECURITY;
ALTER TABLE tech_overlaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE tech_waste DISABLE ROW LEVEL SECURITY;
ALTER TABLE ins_policies DISABLE ROW LEVEL SECURITY;
ALTER TABLE ins_gaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE ins_compliance DISABLE ROW LEVEL SECURITY;
ALTER TABLE recv_aging DISABLE ROW LEVEL SECURITY;
ALTER TABLE recv_client_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE recv_risk DISABLE ROW LEVEL SECURITY;
