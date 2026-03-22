-- ============================================================
-- BUILD IMPROVEMENT 15 — Diagnostic History Timeline
-- ============================================================

CREATE TABLE IF NOT EXISTS business_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'prescan','diagnostic','rescan','task_completed',
      'goal_set','goal_completed','milestone_reached',
      'score_milestone','grant_applied','compliance_cleared'
    )
  ),
  event_date TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  score_at_event INTEGER,
  score_delta INTEGER DEFAULT 0,
  savings_monthly_at_event NUMERIC(10,2),
  savings_monthly_delta NUMERIC(10,2) DEFAULT 0,
  source_id TEXT,
  source_type TEXT,
  icon TEXT DEFAULT '📊',
  color TEXT DEFAULT 'blue',
  is_milestone BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, source_type)
);

CREATE INDEX IF NOT EXISTS idx_business_timeline_business_id
  ON business_timeline(business_id);
CREATE INDEX IF NOT EXISTS idx_business_timeline_event_date
  ON business_timeline(business_id, event_date DESC);

ALTER TABLE business_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own timeline" ON business_timeline;
DROP POLICY IF EXISTS "Service role can do everything on business_timeline" ON business_timeline;

CREATE POLICY "Authenticated users can access timeline"
  ON business_timeline FOR ALL TO authenticated USING (true) WITH CHECK (true);
