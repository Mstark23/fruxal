-- =============================================================================
-- TRANSACTION INTELLIGENCE LAYER — 4 Tables
-- =============================================================================
-- Core data structures for automated leak detection from raw transactions
-- Fed by QuickBooks, Plaid, bank imports
-- =============================================================================

-- 1. Detected Patterns (the findings)
CREATE TABLE IF NOT EXISTS txn_patterns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  pattern_type TEXT NOT NULL, 
  -- Types: duplicate_payment, subscription_creep, rate_increase, ghost_vendor,
  --        late_fee, missed_discount, category_drift, invoice_mismatch,
  --        dormant_subscription, seasonal_spike, overpayment, split_payment
  severity TEXT DEFAULT 'medium', -- critical, high, medium, low, info
  status TEXT DEFAULT 'detected', -- detected, confirmed, dismissed, resolved
  vendor_name TEXT,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '{}',
  -- evidence stores the raw proof: transaction IDs, amounts, dates, comparisons
  amount NUMERIC NOT NULL DEFAULT 0, -- single occurrence amount
  annual_impact NUMERIC DEFAULT 0,   -- projected yearly cost
  recurrence TEXT DEFAULT 'one_time', -- one_time, monthly, quarterly, annual
  first_detected DATE,
  last_occurrence DATE,
  occurrence_count INTEGER DEFAULT 1,
  confidence NUMERIC DEFAULT 0.5, -- 0.0 to 1.0
  auto_detected BOOLEAN DEFAULT true,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Subscription Tracker (recurring charges detected from transactions)
CREATE TABLE IF NOT EXISTS txn_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor_name TEXT NOT NULL,
  normalized_vendor TEXT, -- cleaned vendor name for matching
  category TEXT,
  current_amount NUMERIC NOT NULL,
  original_amount NUMERIC, -- first detected amount
  amount_change_pct NUMERIC DEFAULT 0, -- % change since first detected
  frequency TEXT DEFAULT 'monthly', -- weekly, monthly, quarterly, annual
  first_seen DATE NOT NULL,
  last_seen DATE NOT NULL,
  months_active INTEGER DEFAULT 1,
  last_used_date DATE, -- if we can detect usage
  appears_dormant BOOLEAN DEFAULT false,
  dormant_months INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  transaction_count INTEGER DEFAULT 1,
  has_contract BOOLEAN DEFAULT false,
  contract_end_date DATE,
  auto_renews BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active', -- active, dormant, cancelled, flagged
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, normalized_vendor, frequency)
);

-- 3. Vendor Analysis (aggregated vendor intelligence)
CREATE TABLE IF NOT EXISTS txn_vendors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  vendor_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT,
  total_spent_ytd NUMERIC DEFAULT 0,
  total_spent_last_year NUMERIC DEFAULT 0,
  yoy_change_pct NUMERIC DEFAULT 0,
  avg_transaction NUMERIC DEFAULT 0,
  max_transaction NUMERIC DEFAULT 0,
  min_transaction NUMERIC DEFAULT 0,
  transaction_count_ytd INTEGER DEFAULT 0,
  first_transaction DATE,
  last_transaction DATE,
  payment_frequency TEXT, -- weekly, biweekly, monthly, irregular
  has_duplicate_risk BOOLEAN DEFAULT false,
  has_rate_increase BOOLEAN DEFAULT false,
  rate_increase_pct NUMERIC DEFAULT 0,
  has_contract BOOLEAN DEFAULT false,
  is_essential BOOLEAN DEFAULT true,
  risk_score NUMERIC DEFAULT 0, -- 0.0 to 1.0 (higher = more risk)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, normalized_name)
);

-- 4. Anomaly Log (individual flagged transactions)
CREATE TABLE IF NOT EXISTS txn_anomalies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  transaction_id TEXT, -- references the source transaction
  external_id TEXT, -- QuickBooks/Plaid ID
  anomaly_type TEXT NOT NULL,
  -- Types: duplicate, amount_spike, unusual_vendor, unusual_category,
  --        weekend_charge, round_number, sequential_increase, missing_invoice
  vendor_name TEXT,
  amount NUMERIC NOT NULL,
  transaction_date DATE,
  comparison_data JSONB DEFAULT '{}',
  -- stores what it's being compared against (previous transaction, average, etc.)
  confidence NUMERIC DEFAULT 0.5,
  status TEXT DEFAULT 'flagged', -- flagged, reviewed, confirmed, dismissed
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_txn_patterns_biz ON txn_patterns(business_id);
CREATE INDEX IF NOT EXISTS idx_txn_patterns_type ON txn_patterns(business_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_txn_patterns_status ON txn_patterns(business_id, status);
CREATE INDEX IF NOT EXISTS idx_txn_subs_biz ON txn_subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_txn_subs_status ON txn_subscriptions(business_id, status);
CREATE INDEX IF NOT EXISTS idx_txn_vendors_biz ON txn_vendors(business_id);
CREATE INDEX IF NOT EXISTS idx_txn_anomalies_biz ON txn_anomalies(business_id);
CREATE INDEX IF NOT EXISTS idx_txn_anomalies_type ON txn_anomalies(business_id, anomaly_type);

-- Disable RLS
ALTER TABLE txn_patterns DISABLE ROW LEVEL SECURITY;
ALTER TABLE txn_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE txn_vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE txn_anomalies DISABLE ROW LEVEL SECURITY;
