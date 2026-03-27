-- =============================================================================
-- MIGRATION 109: Partner applications table
-- =============================================================================
CREATE TABLE IF NOT EXISTS partner_applications (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  firm         TEXT,
  client_count INTEGER,
  status       TEXT        DEFAULT 'pending',
  partner_code TEXT        UNIQUE,
  applied_at   TIMESTAMPTZ DEFAULT NOW(),
  approved_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_partner_applications_email
  ON partner_applications(email);
