-- =============================================================================
-- MIGRATION 102: outreach_log + misc improvements
-- =============================================================================

-- 1. Add user_id to outreach_log (new sequences write it)
ALTER TABLE outreach_log
  ADD COLUMN IF NOT EXISTS user_id TEXT;

ALTER TABLE outreach_log
  ADD COLUMN IF NOT EXISTS template TEXT;

ALTER TABLE outreach_log
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Index for dedup check (user_id + template)
CREATE INDEX IF NOT EXISTS idx_outreach_log_user_template
  ON outreach_log(user_id, template);

-- 3. Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'outreach_log'
ORDER BY ordinal_position;
