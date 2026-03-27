-- =============================================================================
-- MIGRATION 108: NPS + testimonial fields on engagements
-- =============================================================================
ALTER TABLE tier3_engagements
  ADD COLUMN IF NOT EXISTS nps_token         TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS nps_score         INTEGER,
  ADD COLUMN IF NOT EXISTS testimonial_text  TEXT,
  ADD COLUMN IF NOT EXISTS nps_submitted_at  TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_engagements_nps_token
  ON tier3_engagements(nps_token) WHERE nps_token IS NOT NULL;
