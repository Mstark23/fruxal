-- =============================================================================
-- FRUXAL TIER 3 — Pipeline CRM Table
-- =============================================================================
-- Run in Supabase SQL Editor after tier3_diagnostics exists.
-- =============================================================================

CREATE TABLE IF NOT EXISTS tier3_pipeline (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id    UUID REFERENCES tier3_diagnostics(id) ON DELETE CASCADE,
  user_id          TEXT NOT NULL,
  stage            TEXT NOT NULL DEFAULT 'contacted' CHECK (stage IN (
                     'contacted','called','diagnostic_sent','agreement_out',
                     'signed','in_engagement','fee_collected','lost'
                   )),
  notes            TEXT,
  follow_up_date   DATE,
  lost_reason      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tier3_pipeline_diagnostic ON tier3_pipeline(diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_tier3_pipeline_stage      ON tier3_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_tier3_pipeline_user       ON tier3_pipeline(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_tier3_pipeline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tier3_pipeline_updated_at ON tier3_pipeline;
CREATE TRIGGER trigger_tier3_pipeline_updated_at
  BEFORE UPDATE ON tier3_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION update_tier3_pipeline_updated_at();

ALTER TABLE tier3_pipeline ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tier3_pipeline' AND policyname = 'Service role full access pipeline') THEN
    CREATE POLICY "Service role full access pipeline"
      ON tier3_pipeline FOR ALL
      USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON tier3_pipeline TO authenticated;
GRANT ALL ON tier3_pipeline TO service_role;
