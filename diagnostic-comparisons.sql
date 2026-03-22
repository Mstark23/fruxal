-- ============================================================
-- BUILD IMPROVEMENT 07 — Month-Over-Month Comparison After Rescan
-- ============================================================

CREATE TABLE IF NOT EXISTS diagnostic_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  new_report_id UUID NOT NULL,
  previous_report_id UUID NOT NULL,
  previous_score INTEGER,
  new_score INTEGER,
  score_delta INTEGER,
  leaks_fixed_count INTEGER DEFAULT 0,
  savings_recovered_monthly NUMERIC(10,2) DEFAULT 0,
  findings_resolved_count INTEGER DEFAULT 0,
  findings_new_count INTEGER DEFAULT 0,
  findings_persisted_count INTEGER DEFAULT 0,
  net_monthly_improvement NUMERIC(10,2) DEFAULT 0,
  comparison_narrative TEXT,
  comparison_headline TEXT,
  days_between_scans INTEGER,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_comparisons_business
  ON diagnostic_comparisons(business_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_comparisons_new_report
  ON diagnostic_comparisons(new_report_id);

ALTER TABLE diagnostic_comparisons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own comparisons" ON diagnostic_comparisons;
DROP POLICY IF EXISTS "Service role can do everything on diagnostic_comparisons" ON diagnostic_comparisons;
CREATE POLICY "Authenticated users can access comparisons"
  ON diagnostic_comparisons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add columns to diagnostic_reports
ALTER TABLE diagnostic_reports
  ADD COLUMN IF NOT EXISTS comparison_id UUID,
  ADD COLUMN IF NOT EXISTS is_rescan BOOLEAN DEFAULT false;
