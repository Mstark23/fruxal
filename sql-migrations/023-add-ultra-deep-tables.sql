-- =============================================================================
-- ULTRA DEEP LAYER — 15 Tables
-- =============================================================================
-- Module I: Revenue Optimization (3 tables)
-- Module J: Employee & Benefits Intelligence (3 tables)
-- Module K: Sales Pipeline Leaks (3 tables)
-- Module L: Compliance & Tax Jurisdiction (3 tables)
-- Module M: Fraud & Anomaly Detection (3 tables)
-- =============================================================================

-- ═══════════════════════════════════════════════════════════
-- MODULE I: REVENUE OPTIMIZATION
-- ═══════════════════════════════════════════════════════════

-- I1. Customer Lifetime Value & Upsell Gaps
CREATE TABLE IF NOT EXISTS rev_customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_name TEXT NOT NULL,
  client_id TEXT REFERENCES clients(id),
  segment TEXT DEFAULT 'standard', -- vip, standard, at_risk, dormant, new
  first_purchase_date DATE,
  last_purchase_date DATE,
  months_as_customer INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  avg_order_value NUMERIC DEFAULT 0,
  purchase_frequency_days NUMERIC DEFAULT 0, -- avg days between purchases
  ltv_actual NUMERIC DEFAULT 0,
  ltv_predicted NUMERIC DEFAULT 0,
  ltv_potential NUMERIC DEFAULT 0, -- if they bought full catalog
  upsell_gap NUMERIC DEFAULT 0, -- potential minus actual
  products_purchased INTEGER DEFAULT 0,
  products_available INTEGER DEFAULT 0,
  product_penetration_pct NUMERIC DEFAULT 0,
  last_upsell_attempt DATE,
  churn_probability NUMERIC DEFAULT 0, -- 0-1
  days_since_last_purchase INTEGER DEFAULT 0,
  avg_margin_pct NUMERIC DEFAULT 0,
  referrals_made INTEGER DEFAULT 0,
  nps_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, client_name)
);

-- I2. Pricing Elasticity & Revenue Experiments
CREATE TABLE IF NOT EXISTS rev_pricing_tests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  product_or_service TEXT NOT NULL,
  test_type TEXT DEFAULT 'price_change', -- price_change, bundle, discount, upsell
  old_price NUMERIC,
  new_price NUMERIC,
  change_pct NUMERIC DEFAULT 0,
  period_before_start DATE,
  period_before_end DATE,
  period_after_start DATE,
  period_after_end DATE,
  volume_before INTEGER DEFAULT 0,
  volume_after INTEGER DEFAULT 0,
  volume_change_pct NUMERIC DEFAULT 0,
  revenue_before NUMERIC DEFAULT 0,
  revenue_after NUMERIC DEFAULT 0,
  revenue_change_pct NUMERIC DEFAULT 0,
  elasticity_score NUMERIC DEFAULT 0, -- % volume change / % price change
  net_impact NUMERIC DEFAULT 0, -- revenue gained or lost
  recommendation TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- I3. Revenue Leakage Points
CREATE TABLE IF NOT EXISTS rev_leakage (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  leakage_type TEXT NOT NULL,
  -- Types: scope_creep, unbilled_hours, discount_abuse, free_work,
  --        undercharged_complexity, missed_billable, rate_erosion,
  --        unmonetized_expertise, dormant_accounts, failed_upsell
  description TEXT NOT NULL,
  affected_client TEXT,
  estimated_monthly_loss NUMERIC DEFAULT 0,
  estimated_annual_loss NUMERIC DEFAULT 0,
  frequency TEXT DEFAULT 'recurring', -- one_time, recurring, occasional
  evidence TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'identified',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- MODULE J: EMPLOYEE & BENEFITS INTELLIGENCE
-- ═══════════════════════════════════════════════════════════

-- J1. Benefits Plans & Costs
CREATE TABLE IF NOT EXISTS emp_benefits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  benefit_type TEXT NOT NULL, -- health, dental, vision, life, disability, 401k, hsa, fsa, pto, other
  provider TEXT,
  plan_name TEXT,
  employer_monthly_cost NUMERIC DEFAULT 0,
  employee_monthly_cost NUMERIC DEFAULT 0,
  total_monthly_cost NUMERIC DEFAULT 0,
  enrolled_count INTEGER DEFAULT 0,
  eligible_count INTEGER DEFAULT 0,
  enrollment_pct NUMERIC DEFAULT 0,
  cost_per_employee NUMERIC DEFAULT 0,
  market_avg_cost_per_employee NUMERIC DEFAULT 0,
  above_market_pct NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0, -- how much of the benefit is actually used
  claims_ratio NUMERIC DEFAULT 0, -- claims paid / premiums (health)
  admin_fees NUMERIC DEFAULT 0,
  broker_fees NUMERIC DEFAULT 0,
  last_shopped DATE,
  months_since_shopped INTEGER DEFAULT 0,
  renewal_date DATE,
  expected_increase_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, benefit_type, provider)
);

-- J2. 401k & Retirement Fees
CREATE TABLE IF NOT EXISTS emp_retirement (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  plan_provider TEXT NOT NULL,
  plan_type TEXT DEFAULT '401k', -- 401k, simple_ira, sep_ira, 403b
  total_assets NUMERIC DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  participation_rate NUMERIC DEFAULT 0,
  employer_match_pct NUMERIC DEFAULT 0,
  employer_match_cap_pct NUMERIC DEFAULT 0,
  annual_employer_contribution NUMERIC DEFAULT 0,
  plan_admin_fee_annual NUMERIC DEFAULT 0,
  per_participant_fee NUMERIC DEFAULT 0,
  total_expense_ratio_pct NUMERIC DEFAULT 0, -- fund expense ratios (weighted avg)
  benchmark_expense_ratio NUMERIC DEFAULT 0,
  excess_fee_pct NUMERIC DEFAULT 0,
  excess_fee_annual NUMERIC DEFAULT 0, -- what participants lose to high fees
  has_revenue_sharing BOOLEAN DEFAULT false,
  last_fee_audit DATE,
  last_benchmarked DATE,
  fiduciary_compliant BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, plan_provider)
);

-- J3. PTO & Time-Off Liability
CREATE TABLE IF NOT EXISTS emp_pto (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_employees INTEGER DEFAULT 0,
  avg_accrued_hours NUMERIC DEFAULT 0,
  total_accrued_hours NUMERIC DEFAULT 0,
  avg_hourly_rate NUMERIC DEFAULT 0,
  total_pto_liability NUMERIC DEFAULT 0, -- accrued hours × rate = balance sheet liability
  avg_utilization_pct NUMERIC DEFAULT 0, -- % of PTO actually used
  forfeit_risk_hours NUMERIC DEFAULT 0, -- hours at risk of use-it-or-lose-it
  forfeit_risk_value NUMERIC DEFAULT 0,
  carryover_liability NUMERIC DEFAULT 0,
  sick_days_avg NUMERIC DEFAULT 0,
  unscheduled_absence_rate NUMERIC DEFAULT 0,
  absence_cost_estimate NUMERIC DEFAULT 0, -- productivity loss from unplanned absences
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE K: SALES PIPELINE LEAKS
-- ═══════════════════════════════════════════════════════════

-- K1. Pipeline Snapshot
CREATE TABLE IF NOT EXISTS sales_pipeline (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_opportunities INTEGER DEFAULT 0,
  total_pipeline_value NUMERIC DEFAULT 0,
  weighted_pipeline NUMERIC DEFAULT 0,
  avg_deal_size NUMERIC DEFAULT 0,
  avg_sales_cycle_days NUMERIC DEFAULT 0,
  win_rate_pct NUMERIC DEFAULT 0,
  loss_rate_pct NUMERIC DEFAULT 0,
  stale_deals INTEGER DEFAULT 0, -- no activity >30 days
  stale_value NUMERIC DEFAULT 0,
  deals_past_expected_close INTEGER DEFAULT 0,
  past_close_value NUMERIC DEFAULT 0,
  pipeline_coverage_ratio NUMERIC DEFAULT 0, -- pipeline / quota
  quota NUMERIC DEFAULT 0,
  closed_won_mtd NUMERIC DEFAULT 0,
  closed_lost_mtd NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- K2. Stage Conversion Rates
CREATE TABLE IF NOT EXISTS sales_stages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER DEFAULT 0,
  entered_count INTEGER DEFAULT 0,
  exited_to_next INTEGER DEFAULT 0,
  exited_to_lost INTEGER DEFAULT 0,
  conversion_rate_pct NUMERIC DEFAULT 0,
  avg_days_in_stage NUMERIC DEFAULT 0,
  benchmark_conversion NUMERIC DEFAULT 0,
  benchmark_days NUMERIC DEFAULT 0,
  value_entered NUMERIC DEFAULT 0,
  value_lost NUMERIC DEFAULT 0,
  bottleneck_score NUMERIC DEFAULT 0, -- higher = worse bottleneck
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, stage_name)
);

-- K3. Proposal & Close Analysis
CREATE TABLE IF NOT EXISTS sales_proposals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  proposals_sent INTEGER DEFAULT 0,
  proposals_accepted INTEGER DEFAULT 0,
  proposals_rejected INTEGER DEFAULT 0,
  proposals_expired INTEGER DEFAULT 0, -- never responded to
  acceptance_rate_pct NUMERIC DEFAULT 0,
  avg_proposal_value NUMERIC DEFAULT 0,
  avg_accepted_value NUMERIC DEFAULT 0,
  avg_days_to_decision NUMERIC DEFAULT 0,
  total_value_proposed NUMERIC DEFAULT 0,
  total_value_won NUMERIC DEFAULT 0,
  total_value_lost NUMERIC DEFAULT 0,
  total_value_expired NUMERIC DEFAULT 0, -- LEAK: money left on table
  discount_given_avg_pct NUMERIC DEFAULT 0,
  discount_total NUMERIC DEFAULT 0,
  no_follow_up_count INTEGER DEFAULT 0, -- proposals sent without follow-up
  top_loss_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE L: COMPLIANCE & TAX JURISDICTION
-- ═══════════════════════════════════════════════════════════

-- L1. Sales Tax Nexus & Obligations
CREATE TABLE IF NOT EXISTS tax_nexus (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  jurisdiction TEXT NOT NULL, -- state/province
  nexus_type TEXT DEFAULT 'economic', -- physical, economic, affiliate, marketplace
  has_nexus BOOLEAN DEFAULT false,
  is_registered BOOLEAN DEFAULT false,
  registration_number TEXT,
  tax_rate NUMERIC DEFAULT 0,
  annual_revenue_in_jurisdiction NUMERIC DEFAULT 0,
  threshold_amount NUMERIC DEFAULT 0, -- economic nexus threshold
  threshold_transactions INTEGER DEFAULT 0,
  above_threshold BOOLEAN DEFAULT false,
  collecting_tax BOOLEAN DEFAULT false,
  exposure_amount NUMERIC DEFAULT 0, -- uncollected tax liability
  penalty_risk NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'unknown', -- compliant, non_compliant, exempt, unknown
  last_reviewed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, jurisdiction)
);

-- L2. Regulatory Fines & Penalties Risk
CREATE TABLE IF NOT EXISTS tax_penalties (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  penalty_type TEXT NOT NULL, -- late_filing, underpayment, non_compliance, audit_risk, misclassification
  jurisdiction TEXT,
  description TEXT NOT NULL,
  estimated_penalty NUMERIC DEFAULT 0,
  probability_pct NUMERIC DEFAULT 50,
  expected_cost NUMERIC DEFAULT 0, -- penalty × probability
  preventable BOOLEAN DEFAULT true,
  prevention_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'at_risk', -- at_risk, mitigated, incurred, resolved
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- L3. Multi-Jurisdiction Compliance
CREATE TABLE IF NOT EXISTS tax_compliance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  obligation_type TEXT NOT NULL, -- income_tax, sales_tax, payroll_tax, franchise_tax, business_license, annual_report
  jurisdiction TEXT NOT NULL,
  frequency TEXT DEFAULT 'annual', -- monthly, quarterly, annual
  next_due_date DATE,
  days_until_due INTEGER DEFAULT 0,
  estimated_amount NUMERIC DEFAULT 0,
  last_filed DATE,
  filed_on_time BOOLEAN DEFAULT true,
  penalty_if_late NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'current', -- current, upcoming, overdue, filed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, obligation_type, jurisdiction)
);

-- ═══════════════════════════════════════════════════════════
-- MODULE M: FRAUD & ANOMALY DETECTION
-- ═══════════════════════════════════════════════════════════

-- M1. Expense Report Intelligence
CREATE TABLE IF NOT EXISTS fraud_expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  employee_name TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_expenses NUMERIC DEFAULT 0,
  receipt_attached_pct NUMERIC DEFAULT 0,
  round_number_pct NUMERIC DEFAULT 0,
  weekend_expenses_pct NUMERIC DEFAULT 0,
  max_single_expense NUMERIC DEFAULT 0,
  just_under_approval_count INTEGER DEFAULT 0, -- expenses just under approval threshold
  duplicate_submissions INTEGER DEFAULT 0,
  avg_per_diem_claim NUMERIC DEFAULT 0,
  per_diem_allowance NUMERIC DEFAULT 0,
  over_per_diem_count INTEGER DEFAULT 0,
  mileage_claimed NUMERIC DEFAULT 0,
  mileage_verified NUMERIC DEFAULT 0,
  mileage_discrepancy NUMERIC DEFAULT 0,
  risk_score NUMERIC DEFAULT 0, -- 0-100
  flags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'normal', -- normal, flagged, under_review, confirmed_fraud
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, employee_name, period_start)
);

-- M2. Internal Controls & Access
CREATE TABLE IF NOT EXISTS fraud_controls (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  control_area TEXT NOT NULL,
  -- Areas: bank_access, ap_approval, payroll_changes, vendor_creation,
  --        credit_card, inventory_access, pricing_changes, refund_authority,
  --        check_signing, journal_entries, system_admin
  control_exists BOOLEAN DEFAULT false,
  separation_of_duties BOOLEAN DEFAULT false, -- different people for request/approve
  dual_approval_required BOOLEAN DEFAULT false,
  audit_trail_exists BOOLEAN DEFAULT false,
  last_reviewed DATE,
  risk_level TEXT DEFAULT 'medium',
  finding TEXT,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, control_area)
);

-- M3. Anomaly Patterns
CREATE TABLE IF NOT EXISTS fraud_anomalies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  anomaly_type TEXT NOT NULL,
  -- Types: after_hours_transaction, sequential_invoices, vendor_employee_match,
  --        address_match, payment_pattern_change, ghost_employee, 
  --        split_transaction, unusual_journal_entry, inventory_mismatch
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  financial_impact NUMERIC DEFAULT 0,
  evidence JSONB DEFAULT '{}',
  detected_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'flagged', -- flagged, investigating, confirmed, cleared
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rev_cust_biz ON rev_customers(business_id);
CREATE INDEX IF NOT EXISTS idx_rev_tests_biz ON rev_pricing_tests(business_id);
CREATE INDEX IF NOT EXISTS idx_rev_leak_biz ON rev_leakage(business_id);
CREATE INDEX IF NOT EXISTS idx_emp_ben_biz ON emp_benefits(business_id);
CREATE INDEX IF NOT EXISTS idx_emp_ret_biz ON emp_retirement(business_id);
CREATE INDEX IF NOT EXISTS idx_emp_pto_biz ON emp_pto(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_pipe_biz ON sales_pipeline(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_stage_biz ON sales_stages(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_prop_biz ON sales_proposals(business_id);
CREATE INDEX IF NOT EXISTS idx_tax_nexus_biz ON tax_nexus(business_id);
CREATE INDEX IF NOT EXISTS idx_tax_pen_biz ON tax_penalties(business_id);
CREATE INDEX IF NOT EXISTS idx_tax_comp_biz ON tax_compliance(business_id);
CREATE INDEX IF NOT EXISTS idx_fraud_exp_biz ON fraud_expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_fraud_ctrl_biz ON fraud_controls(business_id);
CREATE INDEX IF NOT EXISTS idx_fraud_anom_biz ON fraud_anomalies(business_id);

-- Disable RLS
ALTER TABLE rev_customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE rev_pricing_tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE rev_leakage DISABLE ROW LEVEL SECURITY;
ALTER TABLE emp_benefits DISABLE ROW LEVEL SECURITY;
ALTER TABLE emp_retirement DISABLE ROW LEVEL SECURITY;
ALTER TABLE emp_pto DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_pipeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE tax_nexus DISABLE ROW LEVEL SECURITY;
ALTER TABLE tax_penalties DISABLE ROW LEVEL SECURITY;
ALTER TABLE tax_compliance DISABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_controls DISABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_anomalies DISABLE ROW LEVEL SECURITY;
