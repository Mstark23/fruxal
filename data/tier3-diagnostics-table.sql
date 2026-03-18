-- =============================================================================
-- Fruxal Tier 3 Diagnostics Table
-- =============================================================================
-- Stores the results of mid-market diagnostic runs from CFO calls.
-- Each row represents one company diagnostic with full inputs and results.
-- =============================================================================

CREATE TABLE IF NOT EXISTS tier3_diagnostics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,                          -- rep who ran the diagnostic
  company_name    TEXT NOT NULL,
  industry        TEXT NOT NULL,
  province        TEXT NOT NULL CHECK (province IN ('ON', 'QC', 'BC', 'AB', 'MB')),
  revenue_bracket TEXT NOT NULL CHECK (revenue_bracket IN ('1M_5M', '5M_20M', '20M_50M')),
  employee_count  INTEGER DEFAULT 0,
  call_answers    JSONB NOT NULL DEFAULT '{}'::jsonb,     -- structured call inputs
  result          JSONB NOT NULL DEFAULT '{}'::jsonb,     -- full diagnostic output
  status          TEXT NOT NULL DEFAULT 'draft'           -- draft | sent | signed | declined
                  CHECK (status IN ('draft', 'sent', 'signed', 'declined')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for rep dashboard queries
CREATE INDEX IF NOT EXISTS idx_tier3_diagnostics_user_id ON tier3_diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_tier3_diagnostics_created_at ON tier3_diagnostics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tier3_diagnostics_status ON tier3_diagnostics(status);
CREATE INDEX IF NOT EXISTS idx_tier3_diagnostics_company ON tier3_diagnostics(company_name);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_tier3_diagnostics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tier3_diagnostics_updated_at ON tier3_diagnostics;
CREATE TRIGGER trigger_tier3_diagnostics_updated_at
  BEFORE UPDATE ON tier3_diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION update_tier3_diagnostics_updated_at();

-- RLS (if using Supabase RLS — service role bypasses this)
ALTER TABLE tier3_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnostics"
  ON tier3_diagnostics FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own diagnostics"
  ON tier3_diagnostics FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own diagnostics"
  ON tier3_diagnostics FOR UPDATE
  USING (user_id = auth.uid()::text);
