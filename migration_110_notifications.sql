-- =============================================================================
-- MIGRATION 110: Ensure notifications table exists (direct query implementation)
-- =============================================================================
-- The notifications API now queries this table directly (no RPC needed).
-- This migration ensures the table exists with the correct schema.
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT        NOT NULL,
  type       TEXT        NOT NULL DEFAULT 'info',
  title      TEXT        NOT NULL,
  message    TEXT,
  data       JSONB       DEFAULT '{}',
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_all
  ON notifications(user_id, created_at DESC);

-- Verify
SELECT COUNT(*) AS notification_count FROM notifications;
