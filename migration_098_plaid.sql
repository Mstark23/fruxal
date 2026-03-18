-- ============================================================================
-- migration_098_plaid.sql
-- Plaid bank connection for v2 stack.
-- Stores encrypted access tokens + extracted financial signals in Supabase.
-- ============================================================================

CREATE TABLE IF NOT EXISTS plaid_connections (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id         uuid        NOT NULL,
  item_id             text        NOT NULL,                    -- Plaid item ID
  access_token_enc    text        NOT NULL,                    -- AES-256 encrypted
  institution_id      text,
  institution_name    text,
  status              text        NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','syncing','error','disconnected','pending_expiration')),
  last_sync_at        timestamptz,
  last_error          text,
  cursor              text,                                    -- Plaid transaction cursor for incremental sync
  sync_summary        jsonb       DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id)
);

ALTER TABLE plaid_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only" ON plaid_connections USING (user_id = auth.uid());

-- Plaid-enriched columns on business_profiles
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS plaid_connected              boolean       DEFAULT false,
  ADD COLUMN IF NOT EXISTS plaid_last_sync_at           timestamptz,
  ADD COLUMN IF NOT EXISTS plaid_bank_balance_total     numeric(14,2),  -- sum of all checking/savings
  ADD COLUMN IF NOT EXISTS plaid_revenue_30d            numeric(14,2),  -- inflows last 30 days
  ADD COLUMN IF NOT EXISTS plaid_revenue_90d            numeric(14,2),  -- inflows last 90 days
  ADD COLUMN IF NOT EXISTS plaid_expenses_30d           numeric(14,2),  -- outflows last 30 days
  ADD COLUMN IF NOT EXISTS plaid_expenses_90d           numeric(14,2),  -- outflows last 90 days
  ADD COLUMN IF NOT EXISTS plaid_top_merchants          jsonb,          -- [{ name, amount, count }]
  ADD COLUMN IF NOT EXISTS plaid_recurring_expenses     jsonb,          -- [{ name, amount, frequency }]
  ADD COLUMN IF NOT EXISTS plaid_payroll_deposits       numeric(14,2),  -- inbound payroll credits
  ADD COLUMN IF NOT EXISTS plaid_tax_payments           numeric(14,2),  -- CRA / government payments
  ADD COLUMN IF NOT EXISTS plaid_loan_payments          numeric(14,2),  -- debt service
  ADD COLUMN IF NOT EXISTS plaid_avg_daily_balance      numeric(14,2),
  ADD COLUMN IF NOT EXISTS plaid_lowest_balance_30d     numeric(14,2),  -- cash flow risk signal
  ADD COLUMN IF NOT EXISTS plaid_accounts               jsonb;          -- raw account list

CREATE INDEX IF NOT EXISTS idx_plaid_connections_business ON plaid_connections(business_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_plaid    ON business_profiles(user_id) WHERE plaid_connected = true;

CREATE OR REPLACE FUNCTION update_plaid_connections_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS plaid_connections_updated_at ON plaid_connections;
CREATE TRIGGER plaid_connections_updated_at
  BEFORE UPDATE ON plaid_connections
  FOR EACH ROW EXECUTE FUNCTION update_plaid_connections_updated_at();

