-- =============================================================================
-- FOUNDATION: Functions + Tables for Production
-- Run in Supabase SQL Editor
-- =============================================================================

-- Atomic click counter increment (avoids race conditions)
CREATE OR REPLACE FUNCTION increment_partner_clicks(p_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_partners 
  SET total_clicks = COALESCE(total_clicks, 0) + 1,
      updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Pre-scan analytics (track anonymous usage for conversion optimization)
CREATE TABLE IF NOT EXISTS prescan_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT,
  ip_hash TEXT, -- hashed IP, never raw
  industry TEXT NOT NULL,
  annual_revenue NUMERIC,
  employee_count INT,
  total_leak_estimated NUMERIC,
  leak_count INT,
  converted_to_signup BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescan_industry ON prescan_events(industry);
CREATE INDEX IF NOT EXISTS idx_prescan_created ON prescan_events(created_at);

-- Rate limiting table (for production Redis replacement)
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INT DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking (know your costs)
CREATE TABLE IF NOT EXISTS api_usage_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  endpoint TEXT NOT NULL,
  user_id TEXT,
  business_id TEXT,
  method TEXT,
  status_code INT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_log(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_log(created_at);
