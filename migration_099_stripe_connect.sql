-- ============================================================================
-- migration_099_stripe_connect.sql
-- Stripe Connect — business links THEIR Stripe account so we can pull
-- revenue, MRR, churn, refund rate, failed payments into the diagnostic.
-- Uses Stripe Connect OAuth (separate from the platform's own Stripe keys).
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_connections (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id         uuid        NOT NULL,
  stripe_account_id   text        NOT NULL,          -- acct_xxx from Connect OAuth
  access_token_enc    text        NOT NULL,           -- AES-256 encrypted
  refresh_token_enc   text,
  scope               text,
  livemode            boolean     DEFAULT true,
  status              text        NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','syncing','error','disconnected')),
  last_sync_at        timestamptz,
  last_error          text,
  sync_summary        jsonb       DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id)
);

ALTER TABLE stripe_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_only" ON stripe_connections USING (user_id = auth.uid());

-- Stripe-enriched columns on business_profiles
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS stripe_connected          boolean       DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_last_sync_at       timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_mrr                numeric(14,2),   -- monthly recurring revenue
  ADD COLUMN IF NOT EXISTS stripe_arr                numeric(14,2),   -- annualised
  ADD COLUMN IF NOT EXISTS stripe_revenue_30d        numeric(14,2),   -- gross revenue last 30d
  ADD COLUMN IF NOT EXISTS stripe_revenue_90d        numeric(14,2),
  ADD COLUMN IF NOT EXISTS stripe_revenue_ttm        numeric(14,2),   -- trailing 12 months
  ADD COLUMN IF NOT EXISTS stripe_refund_rate_pct    numeric(6,2),    -- refund / gross %
  ADD COLUMN IF NOT EXISTS stripe_dispute_rate_pct   numeric(6,2),    -- dispute / charge %
  ADD COLUMN IF NOT EXISTS stripe_failed_payment_pct numeric(6,2),    -- failed / attempted %
  ADD COLUMN IF NOT EXISTS stripe_avg_transaction    numeric(14,2),   -- avg charge value
  ADD COLUMN IF NOT EXISTS stripe_customer_count     integer,
  ADD COLUMN IF NOT EXISTS stripe_active_subs        integer,         -- active subscriptions
  ADD COLUMN IF NOT EXISTS stripe_churn_rate_pct     numeric(6,2),    -- monthly churn estimate
  ADD COLUMN IF NOT EXISTS stripe_net_revenue_ttm    numeric(14,2),   -- after refunds/fees
  ADD COLUMN IF NOT EXISTS stripe_stripe_fees_ttm    numeric(14,2),   -- platform fees paid
  ADD COLUMN IF NOT EXISTS stripe_top_products       jsonb;           -- [{ name, revenue, count }]

CREATE INDEX IF NOT EXISTS idx_stripe_connections_business ON stripe_connections(business_id);

CREATE OR REPLACE FUNCTION update_stripe_connections_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS stripe_connections_updated_at ON stripe_connections;
CREATE TRIGGER stripe_connections_updated_at
  BEFORE UPDATE ON stripe_connections
  FOR EACH ROW EXECUTE FUNCTION update_stripe_connections_updated_at();

