-- ============================================================
-- BUILD IMPROVEMENT 06 — monthly_briefs table
-- Also adds monthly_brief opt-out column to notification_preferences
-- ============================================================

CREATE TABLE IF NOT EXISTS monthly_briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  brief_content TEXT NOT NULL,
  brief_subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  diagnostic_date TIMESTAMPTZ,
  tasks_completed_count INTEGER DEFAULT 0,
  savings_recovered NUMERIC(10,2) DEFAULT 0,
  savings_available NUMERIC(10,2) DEFAULT 0,
  tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monthly_briefs_business_id ON monthly_briefs(business_id);
CREATE INDEX IF NOT EXISTS idx_monthly_briefs_user_id     ON monthly_briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_briefs_sent_at     ON monthly_briefs(sent_at);

ALTER TABLE monthly_briefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can do everything on monthly_briefs" ON monthly_briefs;
CREATE POLICY "Service role can do everything on monthly_briefs"
  ON monthly_briefs FOR ALL USING (true);

-- Add opt-out column to notification_preferences (safe — IF NOT EXISTS)
ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS monthly_brief BOOLEAN DEFAULT true;
