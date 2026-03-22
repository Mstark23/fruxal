-- ============================================================
-- BUILD IMPROVEMENT 142 — financial_ratios table
-- Also adds narrative columns if table already exists
-- ============================================================

CREATE TABLE IF NOT EXISTS financial_ratios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  period_month DATE NOT NULL,

  -- Liquidity
  current_ratio NUMERIC(8,2), quick_ratio NUMERIC(8,2), cash_ratio NUMERIC(8,2),

  -- Profitability
  gross_margin_pct NUMERIC(8,2), ebitda_margin_pct NUMERIC(8,2),
  net_profit_margin_pct NUMERIC(8,2), return_on_assets_pct NUMERIC(8,2),

  -- Efficiency
  asset_turnover NUMERIC(8,2), dso_days NUMERIC(8,2),
  dpo_days NUMERIC(8,2), inventory_days NUMERIC(8,2),

  -- Leverage
  debt_to_equity NUMERIC(8,2), dscr NUMERIC(8,2), interest_coverage NUMERIC(8,2),

  -- Input snapshot
  monthly_revenue NUMERIC(12,2), monthly_cogs NUMERIC(12,2),
  monthly_operating_expenses NUMERIC(12,2), monthly_ebitda NUMERIC(12,2),
  total_assets NUMERIC(12,2), total_debt NUMERIC(12,2), total_equity NUMERIC(12,2),
  cash_and_equivalents NUMERIC(12,2), accounts_receivable NUMERIC(12,2),
  accounts_payable NUMERIC(12,2), monthly_debt_service NUMERIC(12,2),
  monthly_interest NUMERIC(12,2),

  -- Narrative (Claude-generated, cached 24h)
  narrative TEXT,
  narrative_generated_at TIMESTAMPTZ,

  -- Metadata
  data_completeness_pct INTEGER DEFAULT 0,
  data_source TEXT DEFAULT 'diagnostic',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, period_month)
);

CREATE INDEX IF NOT EXISTS idx_financial_ratios_business_id ON financial_ratios(business_id);
CREATE INDEX IF NOT EXISTS idx_financial_ratios_period      ON financial_ratios(business_id, period_month DESC);

-- Add narrative columns if table already exists
DO $$ BEGIN
  ALTER TABLE financial_ratios ADD COLUMN IF NOT EXISTS narrative TEXT;
  ALTER TABLE financial_ratios ADD COLUMN IF NOT EXISTS narrative_generated_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS: permissive (API routes enforce ownership)
ALTER TABLE financial_ratios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own ratios" ON financial_ratios;
DROP POLICY IF EXISTS "Service role can do everything on financial_ratios" ON financial_ratios;
DROP POLICY IF EXISTS "Authenticated users can access financial ratios" ON financial_ratios;

CREATE POLICY "Authenticated users can access financial ratios"
  ON financial_ratios FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
