-- =============================================================================
-- Migration: Wire v2 diagnostic_reports into tier3 pipeline
-- Run in Supabase SQL editor AFTER drop-in9 migration
-- =============================================================================

-- 1. Add report_id to tier3_pipeline (links v2 diagnostic_reports flow)
ALTER TABLE tier3_pipeline
  ADD COLUMN IF NOT EXISTS report_id    uuid REFERENCES diagnostic_reports(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS business_id  uuid REFERENCES businesses(id)         ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tier3_pipeline_report_id    ON tier3_pipeline(report_id);
CREATE INDEX IF NOT EXISTS idx_tier3_pipeline_business_id  ON tier3_pipeline(business_id);

-- 2. Add report_id and pipeline_id to tier3_engagements
ALTER TABLE tier3_engagements
  ADD COLUMN IF NOT EXISTS report_id   uuid REFERENCES diagnostic_reports(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pipeline_id uuid REFERENCES tier3_pipeline(id)     ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tier3_engagements_report_id   ON tier3_engagements(report_id);
CREATE INDEX IF NOT EXISTS idx_tier3_engagements_pipeline_id ON tier3_engagements(pipeline_id);

-- 3. Add report_id to tier3_rep_assignments (for v2 flow reps)
ALTER TABLE tier3_rep_assignments
  ADD COLUMN IF NOT EXISTS pipeline_id uuid REFERENCES tier3_pipeline(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS report_id   uuid REFERENCES diagnostic_reports(id) ON DELETE SET NULL;

-- 4. Ensure tier3_pipeline has company_name, industry, province for standalone leads
ALTER TABLE tier3_pipeline
  ADD COLUMN IF NOT EXISTS company_name   text,
  ADD COLUMN IF NOT EXISTS industry       text,
  ADD COLUMN IF NOT EXISTS province       text,
  ADD COLUMN IF NOT EXISTS contact_email  text,
  ADD COLUMN IF NOT EXISTS contact_phone  text,
  ADD COLUMN IF NOT EXISTS annual_revenue numeric;

-- Done. Verify:
-- SELECT id, diagnostic_id, report_id, stage FROM tier3_pipeline ORDER BY created_at DESC LIMIT 10;
