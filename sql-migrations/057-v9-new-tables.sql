-- V9 new tables: scan_snapshots, affiliate_clicks, outreach_log
CREATE TABLE IF NOT EXISTS scan_snapshots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  business_id TEXT NOT NULL,
  scan_type TEXT DEFAULT 'full',
  leak_count INTEGER DEFAULT 0,
  total_monthly NUMERIC(12,2) DEFAULT 0,
  total_annual NUMERIC(12,2) DEFAULT 0,
  snapshot_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snapshots_biz ON scan_snapshots(business_id);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  business_id TEXT,
  partner_id TEXT,
  product_slug TEXT,
  source TEXT DEFAULT 'prescan',
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_partner ON affiliate_clicks(partner_id);

CREATE TABLE IF NOT EXISTS outreach_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  business_id TEXT,
  sequence_name TEXT,
  step INTEGER DEFAULT 0,
  channel TEXT DEFAULT 'email',
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_outreach_biz ON outreach_log(business_id);
