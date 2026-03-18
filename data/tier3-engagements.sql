-- =============================================================================
-- FRUXAL TIER 3 — Engagement Tracker Tables
-- =============================================================================
-- Run after tier3_diagnostics, tier3_agreements, tier3_pipeline exist.
-- Creates: tier3_engagements, tier3_engagement_documents, tier3_confirmed_findings
-- =============================================================================

CREATE TABLE IF NOT EXISTS tier3_engagements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id       UUID REFERENCES tier3_diagnostics(id) ON DELETE CASCADE,
  agreement_id        UUID REFERENCES tier3_agreements(id),
  pipeline_id         UUID REFERENCES tier3_pipeline(id),
  user_id             TEXT NOT NULL,
  company_name        TEXT NOT NULL,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused','cancelled')),
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  target_completion   DATE,
  completed_at        TIMESTAMPTZ,
  fee_percentage      NUMERIC DEFAULT 12,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tier3_engagement_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id   UUID REFERENCES tier3_engagements(id) ON DELETE CASCADE,
  document_type   TEXT NOT NULL,
  label           TEXT NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','requested','received','reviewed')),
  notes           TEXT,
  received_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tier3_confirmed_findings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id    UUID REFERENCES tier3_engagements(id) ON DELETE CASCADE,
  leak_id          TEXT NOT NULL,
  leak_name        TEXT NOT NULL,
  category         TEXT NOT NULL,
  estimated_low    NUMERIC,
  estimated_high   NUMERIC,
  confirmed_amount NUMERIC NOT NULL,
  confidence_note  TEXT,
  confirmed_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagements_diagnostic      ON tier3_engagements(diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_engagements_status          ON tier3_engagements(status);
CREATE INDEX IF NOT EXISTS idx_engagement_docs_engagement  ON tier3_engagement_documents(engagement_id);
CREATE INDEX IF NOT EXISTS idx_confirmed_findings_engagement ON tier3_confirmed_findings(engagement_id);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_tier3_engagements_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tier3_engagements_updated_at ON tier3_engagements;
CREATE TRIGGER trigger_tier3_engagements_updated_at
  BEFORE UPDATE ON tier3_engagements FOR EACH ROW EXECUTE FUNCTION update_tier3_engagements_updated_at();

CREATE OR REPLACE FUNCTION update_tier3_engagement_docs_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tier3_engagement_docs_updated_at ON tier3_engagement_documents;
CREATE TRIGGER trigger_tier3_engagement_docs_updated_at
  BEFORE UPDATE ON tier3_engagement_documents FOR EACH ROW EXECUTE FUNCTION update_tier3_engagement_docs_updated_at();

-- RLS
ALTER TABLE tier3_engagements          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier3_engagement_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier3_confirmed_findings   ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tier3_engagements' AND policyname = 'Service role full access engagements') THEN
    CREATE POLICY "Service role full access engagements" ON tier3_engagements FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tier3_engagement_documents' AND policyname = 'Service role full access engagement docs') THEN
    CREATE POLICY "Service role full access engagement docs" ON tier3_engagement_documents FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tier3_confirmed_findings' AND policyname = 'Service role full access confirmed findings') THEN
    CREATE POLICY "Service role full access confirmed findings" ON tier3_confirmed_findings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON tier3_engagements TO authenticated;
GRANT ALL ON tier3_engagements TO service_role;
GRANT ALL ON tier3_engagement_documents TO authenticated;
GRANT ALL ON tier3_engagement_documents TO service_role;
GRANT ALL ON tier3_confirmed_findings TO authenticated;
GRANT ALL ON tier3_confirmed_findings TO service_role;
