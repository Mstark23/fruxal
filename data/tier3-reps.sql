-- =============================================================================
-- FRUXAL TIER 3 — Rep Portal + Commission Tracker Tables
-- =============================================================================
-- Run after tier3_diagnostics, tier3_pipeline, tier3_engagements exist.
-- =============================================================================

CREATE TABLE IF NOT EXISTS tier3_reps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,
  province        TEXT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  commission_rate NUMERIC DEFAULT 20,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tier3_rep_assignments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id               UUID REFERENCES tier3_reps(id) ON DELETE CASCADE,
  diagnostic_id        UUID REFERENCES tier3_diagnostics(id) ON DELETE CASCADE,
  pipeline_id          UUID REFERENCES tier3_pipeline(id),
  assigned_at          TIMESTAMPTZ DEFAULT NOW(),
  stage_at_assignment  TEXT,
  notes                TEXT
);

CREATE TABLE IF NOT EXISTS tier3_rep_commissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id            UUID REFERENCES tier3_reps(id) ON DELETE CASCADE,
  engagement_id     UUID REFERENCES tier3_engagements(id) ON DELETE CASCADE,
  confirmed_savings NUMERIC DEFAULT 0,
  fee_collected     NUMERIC DEFAULT 0,
  commission_amount NUMERIC DEFAULT 0,
  commission_rate   NUMERIC DEFAULT 20,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at           TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tier3_reps_email          ON tier3_reps(email);
CREATE INDEX IF NOT EXISTS idx_tier3_reps_status         ON tier3_reps(status);
CREATE INDEX IF NOT EXISTS idx_rep_assignments_rep       ON tier3_rep_assignments(rep_id);
CREATE INDEX IF NOT EXISTS idx_rep_assignments_diag      ON tier3_rep_assignments(diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_rep_commissions_rep       ON tier3_rep_commissions(rep_id);
CREATE INDEX IF NOT EXISTS idx_rep_commissions_eng       ON tier3_rep_commissions(engagement_id);
CREATE INDEX IF NOT EXISTS idx_rep_commissions_status    ON tier3_rep_commissions(status);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_tier3_reps_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_tier3_reps_updated_at ON tier3_reps;
CREATE TRIGGER trigger_tier3_reps_updated_at BEFORE UPDATE ON tier3_reps FOR EACH ROW EXECUTE FUNCTION update_tier3_reps_updated_at();

CREATE OR REPLACE FUNCTION update_tier3_rep_commissions_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_tier3_rep_commissions_updated_at ON tier3_rep_commissions;
CREATE TRIGGER trigger_tier3_rep_commissions_updated_at BEFORE UPDATE ON tier3_rep_commissions FOR EACH ROW EXECUTE FUNCTION update_tier3_rep_commissions_updated_at();

-- RLS
ALTER TABLE tier3_reps             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier3_rep_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier3_rep_commissions  ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tier3_reps' AND policyname='Service role full access reps') THEN CREATE POLICY "Service role full access reps" ON tier3_reps FOR ALL USING (true) WITH CHECK (true); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tier3_rep_assignments' AND policyname='Service role full access rep assignments') THEN CREATE POLICY "Service role full access rep assignments" ON tier3_rep_assignments FOR ALL USING (true) WITH CHECK (true); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tier3_rep_commissions' AND policyname='Service role full access rep commissions') THEN CREATE POLICY "Service role full access rep commissions" ON tier3_rep_commissions FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

GRANT ALL ON tier3_reps TO authenticated, service_role;
GRANT ALL ON tier3_rep_assignments TO authenticated, service_role;
GRANT ALL ON tier3_rep_commissions TO authenticated, service_role;
