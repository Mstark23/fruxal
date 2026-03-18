-- =============================================================================
-- ADVANCED TRACKING LAYER — 6 Tables
-- =============================================================================
-- Marketing channel ROI, Inventory, Labor, Tax deductions, Pricing, Client profitability
-- =============================================================================

CREATE TABLE IF NOT EXISTS track_marketing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  channel TEXT NOT NULL,
  spend NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  customers_acquired INTEGER DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  cost_per_acquisition NUMERIC DEFAULT 0,
  return_on_ad_spend NUMERIC DEFAULT 0,
  roi_pct NUMERIC DEFAULT 0,
  attribution_method TEXT DEFAULT 'estimated',
  confidence NUMERIC DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, channel)
);

CREATE TABLE IF NOT EXISTS track_inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  category TEXT NOT NULL,
  opening_value NUMERIC DEFAULT 0,
  purchases NUMERIC DEFAULT 0,
  closing_value NUMERIC DEFAULT 0,
  cogs_actual NUMERIC DEFAULT 0,
  cogs_theoretical NUMERIC DEFAULT 0,
  shrinkage NUMERIC DEFAULT 0,
  shrinkage_pct NUMERIC DEFAULT 0,
  waste_logged NUMERIC DEFAULT 0,
  waste_pct NUMERIC DEFAULT 0,
  unaccounted_loss NUMERIC DEFAULT 0,
  turns_per_period NUMERIC DEFAULT 0,
  days_on_hand INTEGER DEFAULT 0,
  dead_stock_value NUMERIC DEFAULT 0,
  overstock_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, category)
);

CREATE TABLE IF NOT EXISTS track_labor (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  department TEXT DEFAULT 'general',
  total_labor_cost NUMERIC DEFAULT 0,
  regular_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_cost NUMERIC DEFAULT 0,
  overtime_pct NUMERIC DEFAULT 0,
  revenue_per_labor_hour NUMERIC DEFAULT 0,
  labor_cost_pct NUMERIC DEFAULT 0,
  headcount INTEGER DEFAULT 0,
  revenue_per_employee NUMERIC DEFAULT 0,
  turnover_count INTEGER DEFAULT 0,
  turnover_cost_est NUMERIC DEFAULT 0,
  training_hours NUMERIC DEFAULT 0,
  idle_hours_est NUMERIC DEFAULT 0,
  schedule_efficiency NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, department)
);

CREATE TABLE IF NOT EXISTS track_tax (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  tax_year INTEGER NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'potential',
  estimated_deduction NUMERIC DEFAULT 0,
  tax_rate_applicable NUMERIC DEFAULT 0,
  estimated_savings NUMERIC DEFAULT 0,
  current_claim NUMERIC DEFAULT 0,
  gap NUMERIC DEFAULT 0,
  evidence TEXT,
  recommendation TEXT,
  requires_documentation BOOLEAN DEFAULT true,
  confidence NUMERIC DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, tax_year, category)
);

CREATE TABLE IF NOT EXISTS track_pricing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  service_or_product TEXT NOT NULL,
  current_price NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'each',
  cost_to_deliver NUMERIC DEFAULT 0,
  current_margin_pct NUMERIC DEFAULT 0,
  market_low NUMERIC DEFAULT 0,
  market_median NUMERIC DEFAULT 0,
  market_high NUMERIC DEFAULT 0,
  percentile_position NUMERIC DEFAULT 0,
  volume_last_12mo INTEGER DEFAULT 0,
  revenue_last_12mo NUMERIC DEFAULT 0,
  price_last_changed DATE,
  months_since_change INTEGER DEFAULT 0,
  suggested_price NUMERIC DEFAULT 0,
  revenue_impact_if_adjusted NUMERIC DEFAULT 0,
  elasticity_estimate TEXT DEFAULT 'medium',
  competitor_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, service_or_product)
);

CREATE TABLE IF NOT EXISTS track_client_profit (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  client_name TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  gross_revenue NUMERIC DEFAULT 0,
  direct_costs NUMERIC DEFAULT 0,
  gross_profit NUMERIC DEFAULT 0,
  gross_margin_pct NUMERIC DEFAULT 0,
  hours_spent NUMERIC DEFAULT 0,
  effective_hourly_rate NUMERIC DEFAULT 0,
  revenue_rank INTEGER DEFAULT 0,
  profit_rank INTEGER DEFAULT 0,
  is_profitable BOOLEAN DEFAULT true,
  payment_behavior TEXT DEFAULT 'on_time',
  avg_days_to_pay INTEGER DEFAULT 30,
  lifetime_value NUMERIC DEFAULT 0,
  acquisition_cost NUMERIC DEFAULT 0,
  ltv_cac_ratio NUMERIC DEFAULT 0,
  churn_risk TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, client_name, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_track_mkt_biz ON track_marketing(business_id);
CREATE INDEX IF NOT EXISTS idx_track_mkt_ch ON track_marketing(business_id, channel);
CREATE INDEX IF NOT EXISTS idx_track_inv_biz ON track_inventory(business_id);
CREATE INDEX IF NOT EXISTS idx_track_lab_biz ON track_labor(business_id);
CREATE INDEX IF NOT EXISTS idx_track_tax_biz ON track_tax(business_id);
CREATE INDEX IF NOT EXISTS idx_track_price_biz ON track_pricing(business_id);
CREATE INDEX IF NOT EXISTS idx_track_client_biz ON track_client_profit(business_id);

ALTER TABLE track_marketing DISABLE ROW LEVEL SECURITY;
ALTER TABLE track_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE track_labor DISABLE ROW LEVEL SECURITY;
ALTER TABLE track_tax DISABLE ROW LEVEL SECURITY;
ALTER TABLE track_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE track_client_profit DISABLE ROW LEVEL SECURITY;
