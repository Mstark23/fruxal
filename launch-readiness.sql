-- ============================================================
-- LAUNCH READINESS — SQL for account deletion + billing grace period
-- ============================================================

-- Deletion audit log (PIPEDA compliance — hash only, no PII)
CREATE TABLE IF NOT EXISTS deletion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_hash TEXT NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  data_purge_confirmed BOOLEAN DEFAULT true
);

-- No RLS — service role only, users cannot read this table
-- (intentionally no user-facing policy)

-- Grace period column for failed Stripe payments
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;
