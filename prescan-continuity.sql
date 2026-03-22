-- ============================================================
-- BUILD IMPROVEMENT 13 — Prescan → Diagnostic Continuity
-- ============================================================

-- 1. Prescan-diagnostic link table
CREATE TABLE IF NOT EXISTS prescan_diagnostic_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prescan_run_id TEXT NOT NULL,
  business_id UUID NOT NULL,
  diagnostic_report_id UUID NOT NULL,
  leaks_confirmed INTEGER DEFAULT 0,
  leaks_new INTEGER DEFAULT 0,
  leaks_not_found INTEGER DEFAULT 0,
  continuity_narrative TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(diagnostic_report_id)
);

CREATE INDEX IF NOT EXISTS idx_prescan_diagnostic_links_business
  ON prescan_diagnostic_links(business_id);

ALTER TABLE prescan_diagnostic_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can do everything on prescan_diagnostic_links" ON prescan_diagnostic_links;
DROP POLICY IF EXISTS "Users can view their own links" ON prescan_diagnostic_links;

CREATE POLICY "Service role can do everything on prescan_diagnostic_links"
  ON prescan_diagnostic_links FOR ALL USING (true);

CREATE POLICY "Authenticated users can view prescan links"
  ON prescan_diagnostic_links FOR SELECT
  TO authenticated USING (true);

-- 2. Add prescan columns to diagnostic_reports
ALTER TABLE diagnostic_reports
  ADD COLUMN IF NOT EXISTS prescan_run_id TEXT;

ALTER TABLE diagnostic_reports
  ADD COLUMN IF NOT EXISTS prescan_context_used BOOLEAN DEFAULT false;
