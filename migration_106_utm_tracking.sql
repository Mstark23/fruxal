-- =============================================================================
-- MIGRATION 106: UTM tracking + prescan email capture follow-up
-- =============================================================================

-- UTM columns on users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Follow-up tracking on prescan_email_captures
ALTER TABLE prescan_email_captures
  ADD COLUMN IF NOT EXISTS followup_sent_at TIMESTAMPTZ;

-- Index for UTM reporting
CREATE INDEX IF NOT EXISTS idx_users_utm_source
  ON users(utm_source) WHERE utm_source IS NOT NULL;

-- Index for cron query
CREATE INDEX IF NOT EXISTS idx_prescan_captures_followup
  ON prescan_email_captures(captured_at, followup_sent_at);

SELECT column_name FROM information_schema.columns
WHERE table_name IN ('users', 'prescan_email_captures')
  AND column_name IN ('utm_source', 'utm_medium', 'utm_campaign', 'followup_sent_at')
ORDER BY table_name, column_name;
