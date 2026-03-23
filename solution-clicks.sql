-- ============================================================
-- BUILD IMPROVEMENT 05 — Solutions DB Connected
-- ============================================================

CREATE TABLE IF NOT EXISTS solution_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID,
  user_id TEXT,
  solution_id TEXT NOT NULL,
  solution_name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (
    source IN ('task_card','chat','brief','diagnostic','solutions_page')
  ),
  task_id UUID,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solution_clicks_solution_id ON solution_clicks(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_clicks_business_id ON solution_clicks(business_id);

ALTER TABLE solution_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can do everything on solution_clicks" ON solution_clicks;
CREATE POLICY "Service role can do everything on solution_clicks"
  ON solution_clicks FOR ALL USING (true);

-- Add source column to diagnostic_tasks (for user-added tasks)
ALTER TABLE diagnostic_tasks
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'diagnostic';
