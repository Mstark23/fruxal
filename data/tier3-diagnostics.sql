-- =============================================================================
-- Fruxal Tier 3 — tier3_diagnostics table
-- =============================================================================
-- Stores diagnostic results from CFO calls.
-- Each row = one company diagnostic with full engine output in JSONB.
-- =============================================================================

CREATE TABLE IF NOT EXISTS tier3_diagnostics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,
  company_name    TEXT NOT NULL,
  industry        TEXT NOT NULL,
  province        TEXT NOT NULL CHECK (province IN ('ON', 'QC', 'BC', 'AB', 'MB')),
  revenue_bracket TEXT NOT NULL CHECK (revenue_bracket IN ('1M_5M', '5M_20M', '20M_50M')),
  employee_count  INTEGER DEFAULT 0,
  call_answers    JSONB DEFAULT '{}'::jsonb,
  result          JSONB DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'rejected', 'archived')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tier3_user_id ON tier3_diagnostics (user_id);
CREATE INDEX IF NOT EXISTS idx_tier3_status ON tier3_diagnostics (status);
CREATE INDEX IF NOT EXISTS idx_tier3_created ON tier3_diagnostics (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tier3_company ON tier3_diagnostics (company_name);

-- RLS policy: users can only see their own diagnostics
ALTER TABLE tier3_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own diagnostics"
  ON tier3_diagnostics
  FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Service role bypass for API (supabaseAdmin)
CREATE POLICY "Service role full access"
  ON tier3_diagnostics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant access
GRANT ALL ON tier3_diagnostics TO authenticated;
GRANT ALL ON tier3_diagnostics TO service_role;
