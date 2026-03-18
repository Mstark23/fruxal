-- ============================================================================
-- migration_097_quickbooks_v2.sql
-- QuickBooks Online connections for v2 stack.
-- Tokens stored encrypted in Supabase (not Prisma).
-- ============================================================================

CREATE TABLE IF NOT EXISTS quickbooks_connections (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id         uuid        NOT NULL,
  realm_id            text        NOT NULL,                    -- QBO company ID
  access_token_enc    text        NOT NULL,                    -- AES-256 encrypted
  refresh_token_enc   text        NOT NULL,
  token_expires_at    timestamptz NOT NULL,
  status              text        NOT NULL DEFAULT 'connected' CHECK (status IN ('connected','syncing','error','disconnected')),
  last_sync_at        timestamptz,
  last_error          text,
  sync_summary        jsonb       DEFAULT '{}',               -- { revenue, ar_overdue, expenses, ... }
  environment         text        NOT NULL DEFAULT 'production' CHECK (environment IN ('sandbox','production')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id)
);

ALTER TABLE quickbooks_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only" ON quickbooks_connections
  USING (user_id = auth.uid());

-- Add QB-enriched columns to business_profiles (safe if already exist)
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS qb_connected            boolean       DEFAULT false,
  ADD COLUMN IF NOT EXISTS qb_last_sync_at         timestamptz,
  ADD COLUMN IF NOT EXISTS qb_revenue_ttm          numeric(14,2),   -- trailing 12mo revenue
  ADD COLUMN IF NOT EXISTS qb_gross_profit_ttm     numeric(14,2),
  ADD COLUMN IF NOT EXISTS qb_total_expenses_ttm   numeric(14,2),
  ADD COLUMN IF NOT EXISTS qb_net_income_ttm       numeric(14,2),
  ADD COLUMN IF NOT EXISTS qb_ar_total             numeric(14,2),   -- total AR outstanding
  ADD COLUMN IF NOT EXISTS qb_ar_overdue_30        numeric(14,2),   -- AR 31-60 days
  ADD COLUMN IF NOT EXISTS qb_ar_overdue_60        numeric(14,2),   -- AR 61-90 days
  ADD COLUMN IF NOT EXISTS qb_ar_overdue_90        numeric(14,2),   -- AR 90+ days
  ADD COLUMN IF NOT EXISTS qb_payroll_ttm          numeric(14,2),
  ADD COLUMN IF NOT EXISTS qb_top_expense_cats     jsonb,           -- [{ name, amount }]
  ADD COLUMN IF NOT EXISTS qb_cogs_ttm             numeric(14,2),
  ADD COLUMN IF NOT EXISTS qb_owner_draws_ttm      numeric(14,2),
  ADD COLUMN IF NOT EXISTS qb_bank_balance         numeric(14,2);

-- Index for quick QB status lookups
CREATE INDEX IF NOT EXISTS idx_qb_connections_business ON quickbooks_connections(business_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_qb    ON business_profiles(user_id) WHERE qb_connected = true;

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_qb_connections_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS qb_connections_updated_at ON quickbooks_connections;
CREATE TRIGGER qb_connections_updated_at
  BEFORE UPDATE ON quickbooks_connections
  FOR EACH ROW EXECUTE FUNCTION update_qb_connections_updated_at();

