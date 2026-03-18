-- =============================================================================
-- 037: PRESCAN V3 + REFERRALS + FOUNDATION
-- Run in Supabase SQL Editor after all previous migrations
-- =============================================================================

-- ═══ PRESCAN V3: SELF-DIAGNOSIS TABLES ═══

-- Industry leak patterns (the brain)
CREATE TABLE IF NOT EXISTS industry_leak_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  leak_category TEXT NOT NULL,
  detector_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  probability_pct DECIMAL(5,2) NOT NULL,
  severity TEXT NOT NULL,
  loss_type TEXT NOT NULL,
  loss_pct_low DECIMAL(5,4),
  loss_pct_high DECIMAL(5,4),
  loss_fixed_low DECIMAL(12,2),
  loss_fixed_high DECIMAL(12,2),
  loss_per_employee DECIMAL(10,2),
  impact_statement TEXT NOT NULL,
  evidence_line TEXT NOT NULL,
  fix_description TEXT NOT NULL,
  affiliate_category TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.80,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leak_patterns_industry ON industry_leak_patterns(industry);
CREATE INDEX IF NOT EXISTS idx_leak_patterns_active ON industry_leak_patterns(industry, is_active) WHERE is_active = true;

-- Diagnostic quiz questions
CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  no_leak_pattern_id UUID REFERENCES industry_leak_patterns(id),
  no_confirms_leak BOOLEAN DEFAULT true,
  no_confidence DECIMAL(3,2) DEFAULT 0.95,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(industry, question_order)
);

-- Scan requests (tracks full journey)
CREATE TABLE IF NOT EXISTS prescan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  monthly_revenue NUMERIC,
  employee_count INTEGER,
  years_in_business INTEGER,
  quiz_started BOOLEAN DEFAULT false,
  quiz_completed BOOLEAN DEFAULT false,
  quiz_questions_answered INTEGER DEFAULT 0,
  quiz_duration_ms INTEGER,
  confirmed_leaks INTEGER DEFAULT 0,
  probable_leaks INTEGER DEFAULT 0,
  total_leak_monthly DECIMAL(12,2),
  total_leak_annual DECIMAL(12,2),
  leak_score INTEGER,
  cumulative_loss_shown DECIMAL(12,2),
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  email_captured BOOLEAN DEFAULT false,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescan_req_industry ON prescan_requests(industry);
CREATE INDEX IF NOT EXISTS idx_prescan_req_converted ON prescan_requests(converted) WHERE converted = true;

-- Quiz answers
CREATE TABLE IF NOT EXISTS prescan_quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES prescan_requests(id) ON DELETE CASCADE,
  question_id UUID REFERENCES diagnostic_questions(id),
  answer BOOLEAN NOT NULL,
  answer_order INTEGER NOT NULL,
  leak_confirmed BOOLEAN DEFAULT false,
  impact_shown DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_req ON prescan_quiz_answers(request_id);

-- Scan results (confirmed + probable)
CREATE TABLE IF NOT EXISTS prescan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES prescan_requests(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES industry_leak_patterns(id),
  result_type TEXT NOT NULL,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  probability_pct DECIMAL(5,2),
  estimated_loss_monthly DECIMAL(12,2),
  estimated_loss_annual DECIMAL(12,2),
  affiliate_category TEXT,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescan_results_req ON prescan_results(request_id);

-- Pre-scan analytics (daily aggregates)
CREATE TABLE IF NOT EXISTS prescan_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  industry TEXT NOT NULL,
  total_scans INTEGER DEFAULT 0,
  quiz_starts INTEGER DEFAULT 0,
  quiz_completions INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  avg_leak_score DECIMAL(5,2),
  avg_estimated_loss DECIMAL(12,2),
  UNIQUE(date, industry)
);

CREATE INDEX IF NOT EXISTS idx_prescan_analytics_date ON prescan_analytics(date DESC);

-- ═══ REFERRAL SYSTEM ═══

CREATE TABLE IF NOT EXISTS referrals (
  "referrerId" TEXT NOT NULL UNIQUE,
  code TEXT PRIMARY KEY,
  signups INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  earned NUMERIC DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_signups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "referralCode" TEXT REFERENCES referrals(code),
  "referrerId" TEXT,
  "referredUserId" TEXT,
  converted BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_code ON referral_signups("referralCode");

-- ═══ FOUNDATION FUNCTIONS ═══

-- Atomic click counter
CREATE OR REPLACE FUNCTION increment_partner_clicks(p_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_partners 
  SET total_clicks = COALESCE(total_clicks, 0) + 1, updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Add notifPrefs column
DO $$ BEGIN
  ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "notifPrefs" TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  endpoint TEXT NOT NULL,
  user_id TEXT,
  method TEXT,
  status_code INT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_log(endpoint);

-- Verify
SELECT 'industry_leak_patterns: ' || count(*) FROM industry_leak_patterns;
SELECT 'diagnostic_questions: ' || count(*) FROM diagnostic_questions;
SELECT 'prescan_requests: ' || count(*) FROM prescan_requests;
SELECT 'referrals: ' || count(*) FROM referrals;
