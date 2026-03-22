-- ============================================================
-- BUILD IMPROVEMENT 112 — break_even_data table
-- Run in Supabase SQL editor
-- NOTE: Uses GENERATED ALWAYS AS (PostgreSQL 12+, supported by Supabase)
-- If GENERATED columns fail, see trigger fallback at bottom
-- ============================================================

CREATE TABLE IF NOT EXISTS break_even_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE,

  -- Fixed costs (monthly)
  fixed_rent           NUMERIC(10,2) DEFAULT 0,
  fixed_salaries       NUMERIC(10,2) DEFAULT 0,
  fixed_software       NUMERIC(10,2) DEFAULT 0,
  fixed_insurance      NUMERIC(10,2) DEFAULT 0,
  fixed_loan_payments  NUMERIC(10,2) DEFAULT 0,
  fixed_other          NUMERIC(10,2) DEFAULT 0,
  fixed_total          NUMERIC(10,2) GENERATED ALWAYS AS (
    fixed_rent + fixed_salaries + fixed_software +
    fixed_insurance + fixed_loan_payments + fixed_other
  ) STORED,

  -- Variable cost rate (% of revenue)
  variable_labour_pct      NUMERIC(5,2) DEFAULT 0,
  variable_materials_pct   NUMERIC(5,2) DEFAULT 0,
  variable_processing_pct  NUMERIC(5,2) DEFAULT 0,
  variable_other_pct       NUMERIC(5,2) DEFAULT 0,
  variable_total_pct       NUMERIC(5,2) GENERATED ALWAYS AS (
    variable_labour_pct + variable_materials_pct +
    variable_processing_pct + variable_other_pct
  ) STORED,

  -- Calculated fields (written by API, not generated — allows upsert)
  break_even_revenue  NUMERIC(10,2) DEFAULT 0,
  current_revenue     NUMERIC(10,2) DEFAULT 0,
  safety_margin       NUMERIC(10,2) DEFAULT 0,
  safety_margin_pct   NUMERIC(5,2)  DEFAULT 0,

  -- Metadata
  last_calculated_at  TIMESTAMPTZ DEFAULT NOW(),
  data_source         TEXT DEFAULT 'manual',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_break_even_data_business_id
  ON break_even_data(business_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_break_even_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_break_even_updated_at ON break_even_data;
CREATE TRIGGER trg_break_even_updated_at
  BEFORE UPDATE ON break_even_data
  FOR EACH ROW EXECUTE FUNCTION update_break_even_updated_at();

-- RLS: permissive (API routes enforce ownership)
ALTER TABLE break_even_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own break-even data"   ON break_even_data;
DROP POLICY IF EXISTS "Users can update their own break-even data" ON break_even_data;
DROP POLICY IF EXISTS "Service role can do everything on break_even_data" ON break_even_data;
DROP POLICY IF EXISTS "Authenticated users can access break-even data" ON break_even_data;

CREATE POLICY "Authenticated users can access break-even data"
  ON break_even_data FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- FALLBACK: If GENERATED ALWAYS AS fails, use this trigger instead
-- (comment out the GENERATED ALWAYS AS columns above first)
-- ============================================================
-- CREATE OR REPLACE FUNCTION compute_break_even_totals()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.fixed_total := COALESCE(NEW.fixed_rent,0) + COALESCE(NEW.fixed_salaries,0) +
--     COALESCE(NEW.fixed_software,0) + COALESCE(NEW.fixed_insurance,0) +
--     COALESCE(NEW.fixed_loan_payments,0) + COALESCE(NEW.fixed_other,0);
--   NEW.variable_total_pct := COALESCE(NEW.variable_labour_pct,0) +
--     COALESCE(NEW.variable_materials_pct,0) + COALESCE(NEW.variable_processing_pct,0) +
--     COALESCE(NEW.variable_other_pct,0);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- CREATE TRIGGER trg_compute_totals BEFORE INSERT OR UPDATE ON break_even_data
--   FOR EACH ROW EXECUTE FUNCTION compute_break_even_totals();
