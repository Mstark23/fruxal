-- =============================================================================
-- INTELLIGENCE ENGINE TABLES
-- The brain's memory. Run in Supabase SQL Editor.
-- =============================================================================

-- Patterns discovered by Tier 2 (weekly batch)
-- These get "absorbed" into Tier 1 code rules over time
CREATE TABLE IF NOT EXISTS intelligence_patterns (
  id TEXT PRIMARY KEY,
  "patternType" TEXT NOT NULL,           -- new_leak_type, benchmark_shift, cross_business, trend_anomaly
  industry TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "detectionRule" TEXT,                   -- JSON rule that Tier 1 can execute
  confidence INTEGER DEFAULT 50,
  "sampleSize" INTEGER DEFAULT 0,
  "estimatedImpactAvg" FLOAT DEFAULT 0,
  "discoveredAt" TIMESTAMPTZ DEFAULT now(),
  "absorbedAt" TIMESTAMPTZ,
  status TEXT DEFAULT 'new',             -- new → validated → absorbed → rejected
  metadata JSONB DEFAULT '{}'
);

-- Insights generated for specific businesses (Tier 1 + Tier 3)
CREATE TABLE IF NOT EXISTS intelligence_insights (
  id TEXT PRIMARY KEY,
  "businessId" TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  "insightType" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact FLOAT DEFAULT 0,
  actionable BOOLEAN DEFAULT false,
  action TEXT,
  confidence INTEGER DEFAULT 50,
  source TEXT DEFAULT 'tier1',           -- tier1, tier2, tier3
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  dismissed BOOLEAN DEFAULT false
);

-- Live benchmarks updated by Tier 2 (replaces static benchmarks over time)
CREATE TABLE IF NOT EXISTS intelligence_benchmarks (
  id TEXT PRIMARY KEY,
  industry TEXT NOT NULL,
  category TEXT NOT NULL,
  metric TEXT NOT NULL,
  p25 FLOAT,                             -- Top 25% (good)
  median FLOAT,
  p75 FLOAT,                             -- Bottom 25% (bad)
  "sampleSize" INTEGER DEFAULT 0,
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'static'           -- static, tier2_batch, user_reported
);

-- Execution logs — what the brain did and when
CREATE TABLE IF NOT EXISTS intelligence_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier INTEGER NOT NULL,                 -- 1, 2, or 3
  industry TEXT,
  action TEXT NOT NULL,
  "businessId" TEXT,
  summary TEXT,
  "patternsFound" INTEGER DEFAULT 0,
  "benchmarksUpdated" INTEGER DEFAULT 0,
  "businessesAnalyzed" INTEGER DEFAULT 0,
  "leaksAnalyzed" INTEGER DEFAULT 0,
  "insightsGenerated" INTEGER DEFAULT 0,
  "fullResult" JSONB,
  "tokenCost" INTEGER DEFAULT 0,         -- Track API spend
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patterns_industry ON intelligence_patterns(industry, status);
CREATE INDEX IF NOT EXISTS idx_insights_business ON intelligence_insights("businessId", source);
CREATE INDEX IF NOT EXISTS idx_benchmarks_industry ON intelligence_benchmarks(industry, category);
CREATE INDEX IF NOT EXISTS idx_logs_tier ON intelligence_logs(tier, "createdAt" DESC);

-- Seed initial benchmarks from our estimate engine data
-- These will be overwritten by Tier 2 as real data accumulates
INSERT INTO intelligence_benchmarks (id, industry, category, metric, p25, median, p75, "sampleSize", source) VALUES
  ('ib-rest-food', 'restaurant', 'vendor-costs', 'food_cost_pct', 28, 32, 35, 0, 'static'),
  ('ib-rest-labor', 'restaurant', 'payroll-labor', 'labor_cost_pct', 28, 34, 38, 0, 'static'),
  ('ib-rest-prime', 'restaurant', 'operations', 'prime_cost_pct', 55, 60, 65, 0, 'static'),
  ('ib-rest-cc', 'restaurant', 'processing-fees', 'cc_processing_pct', 2.0, 2.6, 3.0, 0, 'static'),
  ('ib-const-margin', 'construction', 'pricing-margins', 'net_margin_pct', 8, 5, 3, 0, 'static'),
  ('ib-const-labor', 'construction', 'payroll-labor', 'labor_cost_pct', 30, 35, 40, 0, 'static'),
  ('ib-const-change', 'construction', 'contracts', 'change_order_pct', 3, 8, 15, 0, 'static'),
  ('ib-law-real', 'law-firm', 'collections', 'realization_rate', 92, 85, 78, 0, 'static'),
  ('ib-law-coll', 'law-firm', 'collections', 'collection_rate', 95, 88, 80, 0, 'static'),
  ('ib-ecom-margin', 'ecommerce', 'pricing-margins', 'gross_margin_pct', 50, 35, 25, 0, 'static'),
  ('ib-ecom-ship', 'ecommerce', 'vendor-costs', 'shipping_cost_pct', 8, 12, 16, 0, 'static'),
  ('ib-ecom-cc', 'ecommerce', 'processing-fees', 'cc_processing_pct', 2.2, 2.9, 3.2, 0, 'static'),
  ('ib-health-coll', 'healthcare', 'collections', 'collection_rate', 95, 90, 85, 0, 'static'),
  ('ib-health-deny', 'healthcare', 'collections', 'denial_rate_pct', 4, 8, 12, 0, 'static'),
  ('ib-acct-util', 'accounting', 'operations', 'utilization_pct', 75, 60, 50, 0, 'static'),
  ('ib-saas-margin', 'saas', 'pricing-margins', 'gross_margin_pct', 80, 70, 60, 0, 'static'),
  ('ib-saas-churn', 'saas', 'pricing-margins', 'monthly_churn_pct', 2, 5, 8, 0, 'static'),
  ('ib-agency-util', 'agency', 'payroll-labor', 'utilization_pct', 75, 60, 50, 0, 'static'),
  ('ib-consult-util', 'consulting', 'payroll-labor', 'utilization_pct', 75, 60, 50, 0, 'static'),
  ('ib-re-retention', 'real-estate', 'payroll-labor', 'agent_retention_pct', 85, 70, 55, 0, 'static')
ON CONFLICT (id) DO NOTHING;

-- VERIFY
SELECT 'intelligence_patterns: ' || count(*) FROM intelligence_patterns;
SELECT 'intelligence_benchmarks: ' || count(*) FROM intelligence_benchmarks;
SELECT 'intelligence_insights: ' || count(*) FROM intelligence_insights;
SELECT 'intelligence_logs: ' || count(*) FROM intelligence_logs;

-- Notifications table (for the engagement loop)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  "businessId" TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  priority TEXT DEFAULT 'routine',
  title TEXT NOT NULL,
  body TEXT,
  cta TEXT,
  "ctaUrl" TEXT,
  channel TEXT DEFAULT 'push',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "readAt" TIMESTAMPTZ,
  "sentAt" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifs_business ON notifications("businessId", "createdAt" DESC);

SELECT 'notifications: ' || count(*) FROM notifications;

-- Add billing columns to businesses table (safe to run multiple times)
DO $$ BEGIN
  ALTER TABLE businesses ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
  ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
  ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
  ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "notifPrefs" TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ═══ REFERRAL TABLES ═══
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

-- ═══ V6: WEBHOOK ENDPOINTS ═══
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id TEXT PRIMARY KEY,
  "businessId" TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT DEFAULT '["*"]',
  secret TEXT,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id TEXT PRIMARY KEY,
  "endpointId" TEXT REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  status INTEGER,
  "responseBody" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ═══ V6: CUSTOM ALERT RULES ═══
CREATE TABLE IF NOT EXISTS alert_rules (
  id TEXT PRIMARY KEY,
  "businessId" TEXT NOT NULL,
  metric TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('gt', 'lt', 'eq')),
  threshold NUMERIC NOT NULL,
  category TEXT,
  "notifyEmail" BOOLEAN DEFAULT true,
  "notifyPush" BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_biz ON alert_rules("businessId");

-- ═══ V6: GAMIFICATION STATE ═══
CREATE TABLE IF NOT EXISTS gamification (
  "businessId" TEXT PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT DEFAULT '[]',
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ═══ V6: WHITE-LABEL CONFIG ═══
DO $$ BEGIN
  ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "whiteLabelConfig" TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ═══ V6: TASKS (WORKFLOWS) ═══
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  "businessId" TEXT NOT NULL,
  "leakId" TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  category TEXT,
  "assignedTo" TEXT,
  "dueDate" TIMESTAMPTZ,
  "impactAmount" NUMERIC DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_biz ON tasks("businessId");
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
