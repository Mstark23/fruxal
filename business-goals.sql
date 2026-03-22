-- ============================================================
-- BUILD IMPROVEMENT 14 — Goal Setting & Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS business_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (
    goal_type IN ('recovery_amount','score_improvement','tasks_completed','custom')
  ),
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  target_amount NUMERIC(10,2),
  target_score INTEGER,
  target_count INTEGER,
  target_date DATE NOT NULL,
  current_amount NUMERIC(10,2) DEFAULT 0,
  current_score INTEGER DEFAULT 0,
  current_count INTEGER DEFAULT 0,
  progress_pct NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (
    status IN ('active','completed','missed','abandoned')
  ),
  completed_at TIMESTAMPTZ,
  was_suggested_by_claude BOOLEAN DEFAULT false,
  suggestion_rationale TEXT,
  source_report_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_goals_business_id ON business_goals(business_id);
CREATE INDEX IF NOT EXISTS idx_business_goals_status ON business_goals(business_id, status);

ALTER TABLE business_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own goals" ON business_goals;
DROP POLICY IF EXISTS "Service role can do everything on business_goals" ON business_goals;
CREATE POLICY "Authenticated users can access business goals"
  ON business_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add goal_suggestion column to diagnostic_reports
ALTER TABLE diagnostic_reports
  ADD COLUMN IF NOT EXISTS goal_suggestion JSONB;

-- Keep progress_pct capped at 100
CREATE OR REPLACE FUNCTION cap_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.progress_pct := LEAST(NEW.progress_pct, 100.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cap_goal_progress ON business_goals;
CREATE TRIGGER trg_cap_goal_progress
  BEFORE INSERT OR UPDATE ON business_goals
  FOR EACH ROW EXECUTE FUNCTION cap_goal_progress();
