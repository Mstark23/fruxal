-- ============================================================
-- LAW FIRM INDUSTRY ENGINE - DATABASE TABLES
-- Leak & Grow Platform
-- ~115 data points across 8 tables
-- ============================================================

-- 1. BILLING & REVENUE (monthly aggregates per attorney or firm-wide)
CREATE TABLE IF NOT EXISTS lawfirm_billing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  period DATE NOT NULL,                          -- first of month
  attorney_id TEXT,                               -- NULL = firm-wide
  attorney_name TEXT,
  attorney_role TEXT,                             -- partner, associate, of_counsel, paralegal
  available_hours DECIMAL(10,2),                 -- total working hours in period
  billable_hours DECIMAL(10,2),                  -- hours logged as billable
  billed_hours DECIMAL(10,2),                    -- hours that made it to invoices
  collected_hours DECIMAL(10,2),                 -- hours actually paid by clients
  standard_rate DECIMAL(10,2),                   -- $/hour standard rate
  effective_rate DECIMAL(10,2),                  -- actual collected $/hour
  total_billed DECIMAL(12,2),                    -- total $ invoiced
  total_collected DECIMAL(12,2),                 -- total $ collected
  write_offs DECIMAL(12,2) DEFAULT 0,            -- $ written off
  discounts_given DECIMAL(12,2) DEFAULT 0,       -- pre-bill discounts
  flat_fee_revenue DECIMAL(12,2) DEFAULT 0,      -- non-hourly revenue
  contingency_revenue DECIMAL(12,2) DEFAULT 0,   -- contingency fee revenue
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MATTERS / CASES (individual matter tracking)
CREATE TABLE IF NOT EXISTS lawfirm_matters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  matter_id TEXT NOT NULL,                       -- internal matter number
  matter_name TEXT,
  practice_area TEXT,                            -- litigation, corporate, family, etc.
  matter_type TEXT,                              -- hourly, flat_fee, contingency, hybrid
  client_id TEXT,
  date_opened DATE,
  date_closed DATE,
  status TEXT DEFAULT 'active',                  -- active, closed, dormant
  total_hours DECIMAL(10,2) DEFAULT 0,
  total_billed DECIMAL(12,2) DEFAULT 0,
  total_collected DECIMAL(12,2) DEFAULT 0,
  total_costs DECIMAL(12,2) DEFAULT 0,           -- hard costs (filing, expert, etc.)
  total_write_offs DECIMAL(12,2) DEFAULT 0,
  budget_amount DECIMAL(12,2),                   -- matter budget if set
  realization_rate DECIMAL(5,2),                 -- % billed vs worked
  collection_rate DECIMAL(5,2),                  -- % collected vs billed
  profit_margin DECIMAL(5,2),                    -- matter-level profitability
  days_to_invoice INTEGER,                       -- avg days work-to-invoice
  days_to_collect INTEGER,                       -- avg days invoice-to-payment
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLIENTS (client-level metrics)
CREATE TABLE IF NOT EXISTS lawfirm_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  client_name TEXT,
  client_type TEXT,                              -- individual, corporate, institutional
  date_acquired DATE,
  acquisition_source TEXT,                       -- referral, website, advertising, repeat
  total_matters INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_outstanding DECIMAL(12,2) DEFAULT 0,     -- unpaid A/R
  avg_collection_days INTEGER,
  lifetime_value DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_matter_date DATE,
  satisfaction_score DECIMAL(3,1),               -- 1-10 scale if tracked
  referrals_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLIENT INTAKE & LEADS (lead pipeline)
CREATE TABLE IF NOT EXISTS lawfirm_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  period DATE NOT NULL,                          -- first of month
  total_inquiries INTEGER DEFAULT 0,             -- calls + forms + emails
  calls_received INTEGER DEFAULT 0,
  calls_answered INTEGER DEFAULT 0,
  calls_missed INTEGER DEFAULT 0,
  voicemails_left INTEGER DEFAULT 0,
  web_form_leads INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER,             -- time to first response
  consultations_scheduled INTEGER DEFAULT 0,
  consultations_completed INTEGER DEFAULT 0,
  clients_signed INTEGER DEFAULT 0,
  lead_to_consult_rate DECIMAL(5,2),            -- % inquiries → consults
  consult_to_client_rate DECIMAL(5,2),          -- % consults → signed
  overall_conversion_rate DECIMAL(5,2),         -- % inquiries → signed
  marketing_source_breakdown JSONB,              -- {google: 40, referral: 30, ...}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OVERHEAD & EXPENSES (monthly)
CREATE TABLE IF NOT EXISTS lawfirm_overhead (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  total_revenue DECIMAL(12,2),
  total_overhead DECIMAL(12,2),                  -- all non-attorney costs
  rent DECIMAL(12,2) DEFAULT 0,
  staff_salaries DECIMAL(12,2) DEFAULT 0,        -- non-attorney staff
  technology DECIMAL(12,2) DEFAULT 0,            -- software, hardware, IT
  insurance DECIMAL(12,2) DEFAULT 0,             -- malpractice + general
  marketing_spend DECIMAL(12,2) DEFAULT 0,
  professional_development DECIMAL(12,2) DEFAULT 0, -- CLE, training
  office_supplies DECIMAL(12,2) DEFAULT 0,
  court_filing_fees DECIMAL(12,2) DEFAULT 0,
  expert_witness_fees DECIMAL(12,2) DEFAULT 0,
  travel DECIMAL(12,2) DEFAULT 0,
  other_overhead DECIMAL(12,2) DEFAULT 0,
  net_profit DECIMAL(12,2),
  profit_margin DECIMAL(5,2),
  overhead_ratio DECIMAL(5,2),                   -- overhead / revenue %
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRUST ACCOUNTS / IOLTA (compliance tracking)
CREATE TABLE IF NOT EXISTS lawfirm_trust (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  total_trust_balance DECIMAL(14,2),
  total_client_ledgers INTEGER,                  -- number of client sub-ledgers
  deposits_count INTEGER DEFAULT 0,
  disbursements_count INTEGER DEFAULT 0,
  three_way_reconciled BOOLEAN DEFAULT false,    -- monthly 3-way recon done?
  reconciliation_date DATE,
  negative_balance_incidents INTEGER DEFAULT 0,  -- client ledgers that went negative
  commingling_flags INTEGER DEFAULT 0,           -- firm funds mixed w/ client
  unearned_fees_held DECIMAL(12,2) DEFAULT 0,   -- retainers not yet earned
  earned_fees_not_transferred DECIMAL(12,2) DEFAULT 0, -- earned but still in trust
  stale_balances_over_90_days DECIMAL(12,2) DEFAULT 0, -- dormant client funds
  overdraft_incidents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STAFFING & COMPENSATION
CREATE TABLE IF NOT EXISTS lawfirm_staffing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  total_attorneys INTEGER,
  partners INTEGER DEFAULT 0,
  associates INTEGER DEFAULT 0,
  of_counsel INTEGER DEFAULT 0,
  paralegals INTEGER DEFAULT 0,
  support_staff INTEGER DEFAULT 0,               -- admin, IT, marketing, etc.
  total_compensation DECIMAL(12,2),              -- all attorney compensation
  revenue_per_lawyer DECIMAL(12,2),
  profit_per_partner DECIMAL(12,2),
  leverage_ratio DECIMAL(5,2),                   -- associates per partner
  staff_to_attorney_ratio DECIMAL(5,2),
  departures_this_period INTEGER DEFAULT 0,
  new_hires_this_period INTEGER DEFAULT 0,
  annualized_turnover_rate DECIMAL(5,2),
  avg_attorney_tenure_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACCOUNTS RECEIVABLE AGING
CREATE TABLE IF NOT EXISTS lawfirm_ar_aging (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_ar DECIMAL(12,2),
  ar_current DECIMAL(12,2) DEFAULT 0,            -- 0-30 days
  ar_31_60 DECIMAL(12,2) DEFAULT 0,
  ar_61_90 DECIMAL(12,2) DEFAULT 0,
  ar_91_120 DECIMAL(12,2) DEFAULT 0,
  ar_over_120 DECIMAL(12,2) DEFAULT 0,
  total_wip DECIMAL(12,2) DEFAULT 0,             -- unbilled work-in-progress
  wip_over_30_days DECIMAL(12,2) DEFAULT 0,
  wip_over_60_days DECIMAL(12,2) DEFAULT 0,
  realization_lockup_days INTEGER,               -- days work → invoice
  collection_lockup_days INTEGER,                -- days invoice → payment
  total_lockup_days INTEGER,                     -- total pipeline days
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_lawfirm_billing_biz_period ON lawfirm_billing(business_id, period);
CREATE INDEX IF NOT EXISTS idx_lawfirm_matters_biz ON lawfirm_matters(business_id, status);
CREATE INDEX IF NOT EXISTS idx_lawfirm_clients_biz ON lawfirm_clients(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lawfirm_intake_biz_period ON lawfirm_intake(business_id, period);
CREATE INDEX IF NOT EXISTS idx_lawfirm_overhead_biz_period ON lawfirm_overhead(business_id, period);
CREATE INDEX IF NOT EXISTS idx_lawfirm_trust_biz_period ON lawfirm_trust(business_id, period);
CREATE INDEX IF NOT EXISTS idx_lawfirm_staffing_biz_period ON lawfirm_staffing(business_id, period);
CREATE INDEX IF NOT EXISTS idx_lawfirm_ar_biz_date ON lawfirm_ar_aging(business_id, snapshot_date);
