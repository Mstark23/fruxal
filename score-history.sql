-- ============================================================
-- BUILD IMPROVEMENT 04 — Live Score Recalculation
-- ============================================================

-- Score history table
CREATE TABLE IF NOT EXISTS score_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  score_delta INTEGER DEFAULT 0,
  trigger_type TEXT NOT NULL CHECK (
    trigger_type IN ('diagnostic','task_completed','deadline_missed','monthly_decay','manual')
  ),
  trigger_detail TEXT,
  task_id UUID,
  obligation_id UUID,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  base_score INTEGER,
  task_bonus INTEGER DEFAULT 0,
  deadline_penalty INTEGER DEFAULT 0,
  decay_penalty INTEGER DEFAULT 0,
  final_score INTEGER
);

CREATE INDEX IF NOT EXISTS idx_score_history_business_id
  ON score_history(business_id);
CREATE INDEX IF NOT EXISTS idx_score_history_calculated_at
  ON score_history(business_id, calculated_at DESC);

ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own score history" ON score_history;
DROP POLICY IF EXISTS "Service role can do everything on score_history" ON score_history;
CREATE POLICY "Authenticated users can access score history"
  ON score_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add live score columns to business_profiles
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS current_score INTEGER,
  ADD COLUMN IF NOT EXISTS last_diagnostic_score INTEGER,
  ADD COLUMN IF NOT EXISTS score_updated_at TIMESTAMPTZ;
