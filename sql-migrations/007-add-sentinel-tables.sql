-- =============================================================================
-- SENTINEL LAYER — 15 Tables
-- =============================================================================
-- Module N: Vendor & Supply Chain Intelligence (3 tables)
-- Module O: Customer Experience & Reputation (3 tables)
-- Module P: Operational Efficiency (3 tables)
-- Module Q: Strategic Planning & Forecasting (3 tables)
-- Module R: Partnership & Channel Economics (3 tables)
-- =============================================================================

-- ═══════════════════════════════════════════════════════════
-- MODULE N: VENDOR & SUPPLY CHAIN INTELLIGENCE
-- ═══════════════════════════════════════════════════════════

-- N1. Vendor Scorecards
CREATE TABLE IF NOT EXISTS vend_scorecards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor_name TEXT NOT NULL,
  vendor_category TEXT, -- materials, services, technology, logistics, professional, equipment
  annual_spend NUMERIC DEFAULT 0,
  spend_pct_of_total NUMERIC DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  payment_terms TEXT, -- net_15, net_30, net_60, prepay
  on_time_delivery_pct NUMERIC DEFAULT 0,
  quality_score NUMERIC DEFAULT 0, -- 0-100
  defect_rate_pct NUMERIC DEFAULT 0,
  responsiveness_score NUMERIC DEFAULT 0, -- 0-100
  price_competitiveness_score NUMERIC DEFAULT 0, -- 0-100 (vs market alternatives)
  price_increases_12mo INTEGER DEFAULT 0,
  total_price_increase_pct NUMERIC DEFAULT 0,
  alternatives_count INTEGER DEFAULT 0, -- known alternatives
  switching_cost_estimate NUMERIC DEFAULT 0,
  single_source_risk BOOLEAN DEFAULT false,
  dispute_count_12mo INTEGER DEFAULT 0,
  credit_memo_total NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0, -- composite 0-100
  status TEXT DEFAULT 'active',
  last_reviewed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, vendor_name)
);

-- N2. Supply Concentration Risk
CREATE TABLE IF NOT EXISTS vend_concentration (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_vendors INTEGER DEFAULT 0,
  total_annual_spend NUMERIC DEFAULT 0,
  top_vendor_name TEXT,
  top_vendor_spend NUMERIC DEFAULT 0,
  top_vendor_pct NUMERIC DEFAULT 0,
  top_3_pct NUMERIC DEFAULT 0,
  top_5_pct NUMERIC DEFAULT 0,
  single_source_categories INTEGER DEFAULT 0,
  single_source_spend NUMERIC DEFAULT 0,
  herfindahl_index NUMERIC DEFAULT 0, -- concentration metric (0-10000)
  geographic_concentration TEXT, -- local_only, regional, national, international
  lead_time_avg_days NUMERIC DEFAULT 0,
  critical_vendor_count INTEGER DEFAULT 0, -- vendors where disruption = business halt
  backup_vendor_coverage_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- N3. Price Trend Monitoring
CREATE TABLE IF NOT EXISTS vend_pricing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor_name TEXT NOT NULL,
  item_or_service TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  quantity NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  price_12mo_ago NUMERIC DEFAULT 0,
  price_change_pct NUMERIC DEFAULT 0,
  market_price NUMERIC DEFAULT 0,
  above_market_pct NUMERIC DEFAULT 0,
  volume_discount_available BOOLEAN DEFAULT false,
  volume_discount_threshold NUMERIC DEFAULT 0,
  current_volume NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, vendor_name, item_or_service, period_start)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE O: CUSTOMER EXPERIENCE & REPUTATION
-- ═══════════════════════════════════════════════════════════

-- O1. Review & Reputation Tracking
CREATE TABLE IF NOT EXISTS cx_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  platform TEXT NOT NULL, -- google, yelp, trustpilot, bbb, g2, capterra, facebook, industry_specific
  total_reviews INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  rating_5_pct NUMERIC DEFAULT 0,
  rating_1_2_pct NUMERIC DEFAULT 0,
  new_reviews_30d INTEGER DEFAULT 0,
  new_avg_30d NUMERIC DEFAULT 0,
  response_rate_pct NUMERIC DEFAULT 0,
  avg_response_time_hours NUMERIC DEFAULT 0,
  sentiment_positive_pct NUMERIC DEFAULT 0,
  sentiment_negative_pct NUMERIC DEFAULT 0,
  top_complaint TEXT,
  top_praise TEXT,
  competitor_avg_rating NUMERIC DEFAULT 0,
  rating_vs_competitor NUMERIC DEFAULT 0,
  review_velocity_trend TEXT DEFAULT 'stable', -- increasing, stable, declining
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date, platform)
);

-- O2. Support Cost & Resolution
CREATE TABLE IF NOT EXISTS cx_support (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_tickets INTEGER DEFAULT 0,
  tickets_per_100_customers NUMERIC DEFAULT 0,
  avg_resolution_hours NUMERIC DEFAULT 0,
  first_contact_resolution_pct NUMERIC DEFAULT 0,
  escalation_rate_pct NUMERIC DEFAULT 0,
  total_support_cost NUMERIC DEFAULT 0,
  cost_per_ticket NUMERIC DEFAULT 0,
  cost_per_customer NUMERIC DEFAULT 0,
  industry_avg_cost_per_ticket NUMERIC DEFAULT 0,
  refunds_issued_count INTEGER DEFAULT 0,
  refund_total NUMERIC DEFAULT 0,
  credits_issued NUMERIC DEFAULT 0,
  top_issue_category TEXT,
  top_issue_pct NUMERIC DEFAULT 0,
  repeat_contact_pct NUMERIC DEFAULT 0,
  csat_score NUMERIC DEFAULT 0,
  nps_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

-- O3. Customer Acquisition Cost
CREATE TABLE IF NOT EXISTS cx_acquisition (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  channel TEXT NOT NULL, -- organic, paid_search, paid_social, referral, direct, email, events, partnerships, cold_outreach
  spend NUMERIC DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  conversion_rate_pct NUMERIC DEFAULT 0,
  customers_acquired INTEGER DEFAULT 0,
  cac NUMERIC DEFAULT 0, -- customer acquisition cost
  avg_first_deal_value NUMERIC DEFAULT 0,
  cac_payback_months NUMERIC DEFAULT 0,
  ltv_to_cac_ratio NUMERIC DEFAULT 0,
  industry_avg_cac NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, channel)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE P: OPERATIONAL EFFICIENCY
-- ═══════════════════════════════════════════════════════════

-- P1. Process Bottleneck Analysis
CREATE TABLE IF NOT EXISTS ops_bottlenecks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  process_name TEXT NOT NULL,
  process_category TEXT, -- sales, fulfillment, onboarding, billing, support, production, admin
  avg_cycle_time_hours NUMERIC DEFAULT 0,
  benchmark_cycle_time NUMERIC DEFAULT 0,
  excess_time_pct NUMERIC DEFAULT 0,
  manual_steps INTEGER DEFAULT 0,
  automatable_steps INTEGER DEFAULT 0,
  automation_potential_pct NUMERIC DEFAULT 0,
  error_rate_pct NUMERIC DEFAULT 0,
  rework_rate_pct NUMERIC DEFAULT 0,
  bottleneck_step TEXT,
  bottleneck_wait_hours NUMERIC DEFAULT 0,
  estimated_cost_of_delay NUMERIC DEFAULT 0, -- monthly
  people_involved INTEGER DEFAULT 0,
  hours_per_week NUMERIC DEFAULT 0,
  hourly_cost NUMERIC DEFAULT 0,
  total_weekly_cost NUMERIC DEFAULT 0,
  automation_cost_estimate NUMERIC DEFAULT 0,
  automation_roi_months NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, process_name)
);

-- P2. Meeting & Calendar Waste
CREATE TABLE IF NOT EXISTS ops_meetings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_meetings_week INTEGER DEFAULT 0,
  total_meeting_hours_week NUMERIC DEFAULT 0,
  avg_meeting_duration_min NUMERIC DEFAULT 0,
  avg_attendees NUMERIC DEFAULT 0,
  total_person_hours_week NUMERIC DEFAULT 0,
  estimated_hourly_cost NUMERIC DEFAULT 0,
  total_weekly_meeting_cost NUMERIC DEFAULT 0,
  meetings_with_no_agenda_pct NUMERIC DEFAULT 0,
  meetings_over_30min_pct NUMERIC DEFAULT 0,
  recurring_meetings_pct NUMERIC DEFAULT 0,
  meetings_that_could_be_email_pct NUMERIC DEFAULT 0,
  avg_productive_pct NUMERIC DEFAULT 0, -- survey-based
  wasted_meeting_cost_weekly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- P3. Capacity & Utilization
CREATE TABLE IF NOT EXISTS ops_capacity (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  department TEXT NOT NULL,
  total_hours_available NUMERIC DEFAULT 0,
  total_hours_billable NUMERIC DEFAULT 0,
  total_hours_internal NUMERIC DEFAULT 0,
  total_hours_idle NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0,
  billable_pct NUMERIC DEFAULT 0,
  target_utilization NUMERIC DEFAULT 0,
  gap_pct NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_cost NUMERIC DEFAULT 0,
  contractor_hours NUMERIC DEFAULT 0,
  contractor_cost NUMERIC DEFAULT 0,
  revenue_per_hour NUMERIC DEFAULT 0,
  cost_per_hour NUMERIC DEFAULT 0,
  margin_per_hour NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, department)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE Q: STRATEGIC PLANNING & FORECASTING
-- ═══════════════════════════════════════════════════════════

-- Q1. Budget vs Actual Variance
CREATE TABLE IF NOT EXISTS plan_budget (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  category TEXT NOT NULL, -- revenue, cogs, payroll, marketing, rent, utilities, insurance, professional_services, technology, travel, misc
  budget_amount NUMERIC DEFAULT 0,
  actual_amount NUMERIC DEFAULT 0,
  variance NUMERIC DEFAULT 0,
  variance_pct NUMERIC DEFAULT 0,
  favorable BOOLEAN DEFAULT true, -- true = under budget (expense) or over budget (revenue)
  ytd_budget NUMERIC DEFAULT 0,
  ytd_actual NUMERIC DEFAULT 0,
  ytd_variance NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, category)
);

-- Q2. KPI Health Dashboard
CREATE TABLE IF NOT EXISTS plan_kpis (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  kpi_name TEXT NOT NULL,
  kpi_category TEXT, -- financial, operational, customer, employee, growth
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC DEFAULT 0,
  previous_period_value NUMERIC DEFAULT 0,
  trend TEXT DEFAULT 'stable', -- improving, stable, declining
  on_target BOOLEAN DEFAULT true,
  variance_pct NUMERIC DEFAULT 0,
  unit TEXT, -- pct, dollars, days, count, ratio
  priority TEXT DEFAULT 'medium', -- critical, high, medium, low
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date, kpi_name)
);

-- Q3. Cash Runway Projection
CREATE TABLE IF NOT EXISTS plan_runway (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  projection_date DATE NOT NULL,
  current_cash NUMERIC DEFAULT 0,
  monthly_revenue_avg NUMERIC DEFAULT 0,
  monthly_expenses_avg NUMERIC DEFAULT 0,
  monthly_burn_rate NUMERIC DEFAULT 0,
  revenue_growth_pct NUMERIC DEFAULT 0,
  expense_growth_pct NUMERIC DEFAULT 0,
  runway_months_optimistic NUMERIC DEFAULT 0,
  runway_months_realistic NUMERIC DEFAULT 0,
  runway_months_pessimistic NUMERIC DEFAULT 0,
  breakeven_date_estimate DATE,
  cash_zero_date_estimate DATE,
  upcoming_large_expenses JSONB DEFAULT '[]',
  upcoming_large_inflows JSONB DEFAULT '[]',
  scenario TEXT DEFAULT 'baseline', -- baseline, growth, contraction, worst_case
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, projection_date, scenario)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE R: PARTNERSHIP & CHANNEL ECONOMICS
-- ═══════════════════════════════════════════════════════════

-- R1. Referral & Affiliate Performance
CREATE TABLE IF NOT EXISTS part_referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  partner_name TEXT NOT NULL,
  partner_type TEXT, -- affiliate, referral_partner, reseller, agency, strategic_alliance
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  leads_referred INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  conversion_rate_pct NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  commission_paid NUMERIC DEFAULT 0,
  commission_rate_pct NUMERIC DEFAULT 0,
  cost_per_acquisition NUMERIC DEFAULT 0,
  avg_deal_size NUMERIC DEFAULT 0,
  avg_customer_ltv NUMERIC DEFAULT 0,
  roi_pct NUMERIC DEFAULT 0,
  is_profitable BOOLEAN DEFAULT true,
  days_since_last_referral INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, partner_name, period_start)
);

-- R2. Channel Mix & Attribution
CREATE TABLE IF NOT EXISTS part_channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  channel TEXT NOT NULL, -- direct_sales, channel_partners, online, marketplace, inbound, outbound, referral, upsell
  revenue NUMERIC DEFAULT 0,
  revenue_pct NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  margin NUMERIC DEFAULT 0,
  margin_pct NUMERIC DEFAULT 0,
  customers_acquired INTEGER DEFAULT 0,
  avg_deal_size NUMERIC DEFAULT 0,
  sales_cycle_days NUMERIC DEFAULT 0,
  ltv_avg NUMERIC DEFAULT 0,
  churn_rate_pct NUMERIC DEFAULT 0,
  growth_rate_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, channel)
);

-- R3. Commission & Payout Optimization
CREATE TABLE IF NOT EXISTS part_commissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  recipient_name TEXT NOT NULL,
  recipient_type TEXT, -- employee, affiliate, partner, reseller
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_revenue_attributed NUMERIC DEFAULT 0,
  commission_rate_pct NUMERIC DEFAULT 0,
  commission_earned NUMERIC DEFAULT 0,
  commission_paid NUMERIC DEFAULT 0,
  commission_owed NUMERIC DEFAULT 0,
  clawback_eligible NUMERIC DEFAULT 0, -- commissions on churned customers
  effective_commission_pct NUMERIC DEFAULT 0, -- after adjustments
  revenue_per_commission_dollar NUMERIC DEFAULT 0,
  is_overpaid BOOLEAN DEFAULT false,
  overpayment_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, recipient_name, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vend_score_biz ON vend_scorecards(business_id);
CREATE INDEX IF NOT EXISTS idx_vend_conc_biz ON vend_concentration(business_id);
CREATE INDEX IF NOT EXISTS idx_vend_price_biz ON vend_pricing(business_id);
CREATE INDEX IF NOT EXISTS idx_cx_rev_biz ON cx_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_cx_sup_biz ON cx_support(business_id);
CREATE INDEX IF NOT EXISTS idx_cx_acq_biz ON cx_acquisition(business_id);
CREATE INDEX IF NOT EXISTS idx_ops_bot_biz ON ops_bottlenecks(business_id);
CREATE INDEX IF NOT EXISTS idx_ops_meet_biz ON ops_meetings(business_id);
CREATE INDEX IF NOT EXISTS idx_ops_cap_biz ON ops_capacity(business_id);
CREATE INDEX IF NOT EXISTS idx_plan_bud_biz ON plan_budget(business_id);
CREATE INDEX IF NOT EXISTS idx_plan_kpi_biz ON plan_kpis(business_id);
CREATE INDEX IF NOT EXISTS idx_plan_run_biz ON plan_runway(business_id);
CREATE INDEX IF NOT EXISTS idx_part_ref_biz ON part_referrals(business_id);
CREATE INDEX IF NOT EXISTS idx_part_chan_biz ON part_channels(business_id);
CREATE INDEX IF NOT EXISTS idx_part_comm_biz ON part_commissions(business_id);

ALTER TABLE vend_scorecards DISABLE ROW LEVEL SECURITY;
ALTER TABLE vend_concentration DISABLE ROW LEVEL SECURITY;
ALTER TABLE vend_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE cx_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE cx_support DISABLE ROW LEVEL SECURITY;
ALTER TABLE cx_acquisition DISABLE ROW LEVEL SECURITY;
ALTER TABLE ops_bottlenecks DISABLE ROW LEVEL SECURITY;
ALTER TABLE ops_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE ops_capacity DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_budget DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_runway DISABLE ROW LEVEL SECURITY;
ALTER TABLE part_referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE part_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE part_commissions DISABLE ROW LEVEL SECURITY;
