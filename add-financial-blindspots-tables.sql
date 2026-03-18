-- =============================================================================
-- FINANCIAL BLIND SPOTS LAYER — 9 Tables
-- =============================================================================
-- Module A: Debt & Cash Flow (fin_debts, fin_cashflow, fin_reserves)
-- Module B: Contract Monitoring (mon_contracts, mon_alerts, mon_rate_checks)
-- Module C: Payment Processing (pay_processors, pay_monthly, pay_benchmarks)
-- =============================================================================

-- MODULE A: DEBT & CASH FLOW
CREATE TABLE IF NOT EXISTS fin_debts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  lender TEXT NOT NULL,
  debt_type TEXT,
  original_amount NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  interest_rate NUMERIC DEFAULT 0,
  rate_type TEXT DEFAULT 'fixed',
  monthly_payment NUMERIC DEFAULT 0,
  maturity_date DATE,
  origination_date DATE,
  annual_interest_paid NUMERIC DEFAULT 0,
  total_interest_paid NUMERIC DEFAULT 0,
  prepayment_penalty BOOLEAN DEFAULT false,
  prepayment_penalty_pct NUMERIC DEFAULT 0,
  refinance_eligible BOOLEAN DEFAULT false,
  estimated_market_rate NUMERIC DEFAULT 0,
  potential_savings_annual NUMERIC DEFAULT 0,
  annual_fees NUMERIC DEFAULT 0,
  collateral TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, lender, debt_type)
);

CREATE TABLE IF NOT EXISTS fin_cashflow (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  opening_balance NUMERIC DEFAULT 0,
  total_inflows NUMERIC DEFAULT 0,
  total_outflows NUMERIC DEFAULT 0,
  net_cashflow NUMERIC DEFAULT 0,
  closing_balance NUMERIC DEFAULT 0,
  min_balance_in_period NUMERIC DEFAULT 0,
  days_below_threshold INTEGER DEFAULT 0,
  safety_threshold NUMERIC DEFAULT 15000,
  largest_single_outflow NUMERIC DEFAULT 0,
  largest_outflow_desc TEXT,
  receivables_due NUMERIC DEFAULT 0,
  receivables_collected NUMERIC DEFAULT 0,
  collection_gap NUMERIC DEFAULT 0,
  payables_due NUMERIC DEFAULT 0,
  early_pay_discounts_available NUMERIC DEFAULT 0,
  early_pay_discounts_taken NUMERIC DEFAULT 0,
  early_pay_discounts_missed NUMERIC DEFAULT 0,
  late_payment_fees_incurred NUMERIC DEFAULT 0,
  overdraft_fees NUMERIC DEFAULT 0,
  interest_on_credit_line NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS fin_reserves (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  snapshot_date DATE NOT NULL,
  total_cash NUMERIC DEFAULT 0,
  operating_account NUMERIC DEFAULT 0,
  savings_account NUMERIC DEFAULT 0,
  emergency_fund NUMERIC DEFAULT 0,
  monthly_burn_rate NUMERIC DEFAULT 0,
  months_of_runway NUMERIC DEFAULT 0,
  target_runway_months NUMERIC DEFAULT 3,
  runway_gap NUMERIC DEFAULT 0,
  idle_cash NUMERIC DEFAULT 0,
  idle_cash_opportunity_cost NUMERIC DEFAULT 0,
  credit_available NUMERIC DEFAULT 0,
  credit_utilization_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, snapshot_date)
);

-- MODULE B: CONTRACT MONITORING
CREATE TABLE IF NOT EXISTS mon_contracts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor TEXT NOT NULL,
  contract_type TEXT,
  description TEXT,
  monthly_cost NUMERIC DEFAULT 0,
  annual_cost NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  auto_renew_increase_pct NUMERIC DEFAULT 0,
  notice_period_days INTEGER DEFAULT 30,
  cancellation_deadline DATE,
  days_until_deadline INTEGER DEFAULT 0,
  last_negotiated DATE,
  months_since_negotiation INTEGER DEFAULT 0,
  contracted_rate NUMERIC DEFAULT 0,
  actual_rate_being_charged NUMERIC DEFAULT 0,
  rate_discrepancy NUMERIC DEFAULT 0,
  penalties_triggered NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, vendor, contract_type)
);

CREATE TABLE IF NOT EXISTS mon_alerts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  action_deadline DATE,
  financial_impact NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mon_rate_checks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor TEXT NOT NULL,
  check_date DATE,
  contracted_rate NUMERIC DEFAULT 0,
  actual_charged NUMERIC DEFAULT 0,
  variance NUMERIC DEFAULT 0,
  variance_pct NUMERIC DEFAULT 0,
  overcharge BOOLEAN DEFAULT false,
  annual_overcharge_impact NUMERIC DEFAULT 0,
  evidence TEXT,
  status TEXT DEFAULT 'flagged',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MODULE C: PAYMENT PROCESSING
CREATE TABLE IF NOT EXISTS pay_processors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  processor_name TEXT NOT NULL,
  pricing_model TEXT DEFAULT 'flat_rate',
  base_rate_pct NUMERIC DEFAULT 0,
  per_transaction_fee NUMERIC DEFAULT 0,
  monthly_fee NUMERIC DEFAULT 0,
  annual_fee NUMERIC DEFAULT 0,
  pci_compliance_fee NUMERIC DEFAULT 0,
  chargeback_fee NUMERIC DEFAULT 0,
  batch_fee NUMERIC DEFAULT 0,
  gateway_fee NUMERIC DEFAULT 0,
  statement_fee NUMERIC DEFAULT 0,
  minimum_monthly_fee NUMERIC DEFAULT 0,
  contract_end_date DATE,
  early_termination_fee NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, processor_name)
);

CREATE TABLE IF NOT EXISTS pay_monthly (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  processor_id TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_volume NUMERIC DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  avg_transaction_size NUMERIC DEFAULT 0,
  total_fees NUMERIC DEFAULT 0,
  effective_rate_pct NUMERIC DEFAULT 0,
  interchange_fees NUMERIC DEFAULT 0,
  processor_markup NUMERIC DEFAULT 0,
  gateway_fees NUMERIC DEFAULT 0,
  monthly_fixed_fees NUMERIC DEFAULT 0,
  chargeback_count INTEGER DEFAULT 0,
  chargeback_volume NUMERIC DEFAULT 0,
  chargeback_rate_pct NUMERIC DEFAULT 0,
  refund_count INTEGER DEFAULT 0,
  refund_volume NUMERIC DEFAULT 0,
  refund_rate_pct NUMERIC DEFAULT 0,
  card_present_pct NUMERIC DEFAULT 0,
  card_not_present_pct NUMERIC DEFAULT 0,
  debit_pct NUMERIC DEFAULT 0,
  credit_pct NUMERIC DEFAULT 0,
  amex_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start)
);

CREATE TABLE IF NOT EXISTS pay_benchmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  current_processor TEXT,
  current_effective_rate NUMERIC DEFAULT 0,
  current_monthly_fees NUMERIC DEFAULT 0,
  annual_volume NUMERIC DEFAULT 0,
  annual_fees_paid NUMERIC DEFAULT 0,
  benchmark_rate_interchange_plus NUMERIC DEFAULT 0,
  benchmark_rate_flat NUMERIC DEFAULT 0,
  benchmark_rate_subscription NUMERIC DEFAULT 0,
  best_model_for_volume TEXT,
  potential_savings_annual NUMERIC DEFAULT 0,
  recommended_processor TEXT,
  recommended_rate NUMERIC DEFAULT 0,
  savings_breakdown JSONB DEFAULT '{}',
  analysis_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fin_debts_biz ON fin_debts(business_id);
CREATE INDEX IF NOT EXISTS idx_fin_cf_biz ON fin_cashflow(business_id);
CREATE INDEX IF NOT EXISTS idx_fin_res_biz ON fin_reserves(business_id);
CREATE INDEX IF NOT EXISTS idx_mon_contracts_biz ON mon_contracts(business_id);
CREATE INDEX IF NOT EXISTS idx_mon_alerts_biz ON mon_alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_mon_rates_biz ON mon_rate_checks(business_id);
CREATE INDEX IF NOT EXISTS idx_pay_proc_biz ON pay_processors(business_id);
CREATE INDEX IF NOT EXISTS idx_pay_monthly_biz ON pay_monthly(business_id);
CREATE INDEX IF NOT EXISTS idx_pay_bench_biz ON pay_benchmarks(business_id);

ALTER TABLE fin_debts DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_cashflow DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_reserves DISABLE ROW LEVEL SECURITY;
ALTER TABLE mon_contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE mon_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE mon_rate_checks DISABLE ROW LEVEL SECURITY;
ALTER TABLE pay_processors DISABLE ROW LEVEL SECURITY;
ALTER TABLE pay_monthly DISABLE ROW LEVEL SECURITY;
ALTER TABLE pay_benchmarks DISABLE ROW LEVEL SECURITY;
