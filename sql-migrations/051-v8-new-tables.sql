-- V8 new tables: shared results, partner leads
CREATE TABLE IF NOT EXISTS shared_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  business_id TEXT,
  share_token TEXT UNIQUE NOT NULL,
  result_data JSONB NOT NULL DEFAULT '{}',
  industry TEXT,
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_token ON shared_results(share_token);

CREATE TABLE IF NOT EXISTS partner_leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  partner_id TEXT,
  business_id TEXT,
  leak_id TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_leads_partner ON partner_leads(partner_id);
