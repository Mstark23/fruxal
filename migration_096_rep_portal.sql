-- =============================================================================
-- migration_096_rep_portal.sql
-- Rep Portal: no schema changes needed — uses existing tier3_reps,
-- tier3_rep_assignments, tier3_pipeline, tier3_engagements,
-- tier3_engagement_documents, tier3_confirmed_findings, tier3_rep_commissions.
--
-- This migration adds:
--   1. RLS policy so reps can only be read by admins (already handled via supabaseAdmin)
--   2. Index on tier3_rep_assignments(rep_id) for fast pipeline lookup
--   3. Index on tier3_pipeline(diagnostic_id) for customer detail load
-- =============================================================================

-- Fast lookup: all diagnostics for a rep
CREATE INDEX IF NOT EXISTS idx_rep_assignments_rep_id
  ON tier3_rep_assignments(rep_id);

-- Fast lookup: pipeline entry by diagnostic
CREATE INDEX IF NOT EXISTS idx_pipeline_diagnostic_id
  ON tier3_pipeline(diagnostic_id);

-- Fast lookup: engagements by diagnostic
CREATE INDEX IF NOT EXISTS idx_engagements_diagnostic_id
  ON tier3_engagements(diagnostic_id);

-- Fast lookup: documents by engagement
CREATE INDEX IF NOT EXISTS idx_engagement_docs_engagement_id
  ON tier3_engagement_documents(engagement_id);

-- Fast lookup: findings by engagement
CREATE INDEX IF NOT EXISTS idx_confirmed_findings_engagement_id
  ON tier3_confirmed_findings(engagement_id);

-- Fast lookup: commissions by rep + engagement
CREATE INDEX IF NOT EXISTS idx_rep_commissions_rep_id
  ON tier3_rep_commissions(rep_id);

CREATE INDEX IF NOT EXISTS idx_rep_commissions_engagement_id
  ON tier3_rep_commissions(engagement_id);
