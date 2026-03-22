-- ============================================================
-- BUILD IMPROVEMENT 03 — recovery_snapshots table
-- Run AFTER diagnostic-tasks.sql (Build 02)
-- ============================================================

CREATE TABLE IF NOT EXISTS recovery_snapshots (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id       UUID NOT NULL,
  month             DATE NOT NULL,
  savings_recovered NUMERIC(10,2) DEFAULT 0,
  savings_available NUMERIC(10,2) DEFAULT 0,
  tasks_completed   INTEGER DEFAULT 0,
  tasks_open        INTEGER DEFAULT 0,
  milestone_sent    JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, month)
);

CREATE INDEX IF NOT EXISTS idx_recovery_snapshots_business_id
  ON recovery_snapshots(business_id);

ALTER TABLE recovery_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access recovery snapshots"
  ON recovery_snapshots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
