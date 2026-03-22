-- ============================================================
-- BUILD IMPROVEMENT 02 — diagnostic_tasks table
-- Paste directly into Supabase SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS diagnostic_tasks (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id        UUID NOT NULL,
  report_id          UUID NOT NULL,
  title              TEXT NOT NULL,
  action             TEXT NOT NULL,
  why                TEXT,
  savings_monthly    NUMERIC(10,2) DEFAULT 0,
  effort             TEXT CHECK (effort IN ('easy', 'medium', 'hard')),
  time_to_implement  TEXT,
  solution_name      TEXT,
  solution_url       TEXT,
  category           TEXT,
  priority           INTEGER DEFAULT 0,
  status             TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'dismissed')),
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_tasks_business_id ON diagnostic_tasks(business_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tasks_report_id   ON diagnostic_tasks(report_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tasks_status      ON diagnostic_tasks(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_diagnostic_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_diagnostic_tasks_updated_at ON diagnostic_tasks;
CREATE TRIGGER trg_diagnostic_tasks_updated_at
  BEFORE UPDATE ON diagnostic_tasks
  FOR EACH ROW EXECUTE FUNCTION update_diagnostic_tasks_updated_at();

-- Row Level Security
ALTER TABLE diagnostic_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tasks"   ON diagnostic_tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON diagnostic_tasks;
DROP POLICY IF EXISTS "Service role can do everything"   ON diagnostic_tasks;

CREATE POLICY "Users can view their own tasks"
  ON diagnostic_tasks FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_user_id = auth.uid()::text
  ));

CREATE POLICY "Users can update their own tasks"
  ON diagnostic_tasks FOR UPDATE
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_user_id = auth.uid()::text
  ));

CREATE POLICY "Service role can do everything"
  ON diagnostic_tasks FOR ALL
  USING (true);
