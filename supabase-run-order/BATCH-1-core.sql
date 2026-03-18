-- ═══════════════════════════════════════════════════════════════
-- BATCH 1 of 7: Core Tracking + Intelligence Engine
-- Safe to re-run (all IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════
-- =============================================================================
-- CONNECT ALL DOTS — Master SQL
-- =============================================================================
-- Run in Supabase SQL Editor. Safe to re-run (uses IF NOT EXISTS + ON CONFLICT).
--
-- WHAT THIS DOES:
--   1. Creates 6 missing Advanced Tracking tables (track_*)
--   2. Adds 10 new intelligence leak categories to affiliate mapping
--   3. Maps existing partners to intelligence categories
--   4. Adds 6 new specialist partners for advanced categories
--   5. Creates intelligence_scan_log table for layer tracking
--
-- AFTER THIS: All 20 layers → all 20 categories → all partners = connected
-- =============================================================================


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: MISSING ADVANCED TRACKING TABLES (Layer 02)
-- ═══════════════════════════════════════════════════════════════════════════════
-- These are the ONLY 6 tables missing from the entire 424-table database.
-- The SQL file existed but was never executed in Supabase.

CREATE TABLE IF NOT EXISTS track_marketing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  channel TEXT NOT NULL,
  monthly_spend NUMERIC(12,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  cost_per_lead NUMERIC(10,2) DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  customer_acquisition_cost NUMERIC(10,2) DEFAULT 0,
  lifetime_value_ratio NUMERIC(5,2) DEFAULT 0,
  attribution_model TEXT DEFAULT 'last_click',
  waste_indicator BOOLEAN DEFAULT false,
  waste_reason TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_track_marketing_biz ON track_marketing(business_id);
CREATE INDEX IF NOT EXISTS idx_track_marketing_channel ON track_marketing(channel);

CREATE TABLE IF NOT EXISTS track_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity_on_hand INTEGER DEFAULT 0,
  unit_cost NUMERIC(10,2) DEFAULT 0,
  total_value NUMERIC(12,2) DEFAULT 0,
  turnover_rate NUMERIC(5,2) DEFAULT 0,
  days_on_hand INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  overstock_flag BOOLEAN DEFAULT false,
  deadstock_flag BOOLEAN DEFAULT false,
  shrinkage_pct NUMERIC(5,2) DEFAULT 0,
  carrying_cost_monthly NUMERIC(10,2) DEFAULT 0,
  last_sold_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_track_inventory_biz ON track_inventory(business_id);
CREATE INDEX IF NOT EXISTS idx_track_inventory_category ON track_inventory(category);

CREATE TABLE IF NOT EXISTS track_labor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  department TEXT NOT NULL,
  role TEXT,
  headcount INTEGER DEFAULT 0,
  avg_hourly_rate NUMERIC(8,2) DEFAULT 0,
  overtime_hours_monthly NUMERIC(8,2) DEFAULT 0,
  overtime_cost_monthly NUMERIC(10,2) DEFAULT 0,
  utilization_pct NUMERIC(5,2) DEFAULT 0,
  revenue_per_employee NUMERIC(12,2) DEFAULT 0,
  turnover_rate_annual NUMERIC(5,2) DEFAULT 0,
  training_cost_annual NUMERIC(10,2) DEFAULT 0,
  idle_time_pct NUMERIC(5,2) DEFAULT 0,
  benchmark_utilization NUMERIC(5,2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_track_labor_biz ON track_labor(business_id);
CREATE INDEX IF NOT EXISTS idx_track_labor_dept ON track_labor(department);

CREATE TABLE IF NOT EXISTS track_tax (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  tax_type TEXT NOT NULL,
  jurisdiction TEXT,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  amount_owed NUMERIC(12,2) DEFAULT 0,
  deductions_claimed NUMERIC(12,2) DEFAULT 0,
  deductions_missed NUMERIC(12,2) DEFAULT 0,
  credits_claimed NUMERIC(12,2) DEFAULT 0,
  credits_missed NUMERIC(12,2) DEFAULT 0,
  effective_rate NUMERIC(5,2) DEFAULT 0,
  benchmark_rate NUMERIC(5,2) DEFAULT 0,
  filing_status TEXT DEFAULT 'current',
  next_deadline DATE,
  penalty_risk BOOLEAN DEFAULT false,
  tax_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_track_tax_biz ON track_tax(business_id);
CREATE INDEX IF NOT EXISTS idx_track_tax_type ON track_tax(tax_type);

CREATE TABLE IF NOT EXISTS track_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  product_service TEXT NOT NULL,
  current_price NUMERIC(10,2) DEFAULT 0,
  cost_basis NUMERIC(10,2) DEFAULT 0,
  margin_pct NUMERIC(5,2) DEFAULT 0,
  competitor_avg_price NUMERIC(10,2) DEFAULT 0,
  price_position TEXT DEFAULT 'average',
  last_increase_date DATE,
  months_since_increase INTEGER DEFAULT 0,
  elasticity_estimate NUMERIC(5,2) DEFAULT 0,
  volume_monthly INTEGER DEFAULT 0,
  revenue_at_risk NUMERIC(12,2) DEFAULT 0,
  underpriced_flag BOOLEAN DEFAULT false,
  overpriced_flag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_track_pricing_biz ON track_pricing(business_id);
CREATE INDEX IF NOT EXISTS idx_track_pricing_product ON track_pricing(product_service);

CREATE TABLE IF NOT EXISTS track_client_profit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  revenue_annual NUMERIC(12,2) DEFAULT 0,
  direct_costs NUMERIC(12,2) DEFAULT 0,
  time_invested_hours NUMERIC(8,2) DEFAULT 0,
  effective_hourly_rate NUMERIC(10,2) DEFAULT 0,
  profit_margin_pct NUMERIC(5,2) DEFAULT 0,
  benchmark_margin_pct NUMERIC(5,2) DEFAULT 0,
  payment_speed_days INTEGER DEFAULT 0,
  support_tickets_monthly INTEGER DEFAULT 0,
  scope_creep_pct NUMERIC(5,2) DEFAULT 0,
  lifetime_value NUMERIC(12,2) DEFAULT 0,
  risk_score NUMERIC(3,2) DEFAULT 0,
  profitable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_track_client_profit_biz ON track_client_profit(business_id);
CREATE INDEX IF NOT EXISTS idx_track_client_profit_client ON track_client_profit(client_name);


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: INTELLIGENCE SCAN LOG TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
-- Tracks which layers ran, what they found, and how long they took.
-- Powers the intelligence dashboard panel.

CREATE TABLE IF NOT EXISTS intelligence_scan_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  scan_depth TEXT NOT NULL DEFAULT 'standard',
  total_layers_run INTEGER DEFAULT 0,
  total_detectors_run INTEGER DEFAULT 0,
  total_leaks_found INTEGER DEFAULT 0,
  total_execution_ms INTEGER DEFAULT 0,
  layer_results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_intel_scan_log_biz ON intelligence_scan_log(business_id);
CREATE INDEX IF NOT EXISTS idx_intel_scan_log_created ON intelligence_scan_log(created_at DESC);


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: NEW SPECIALIST AFFILIATE PARTNERS (for intelligence categories)
-- ═══════════════════════════════════════════════════════════════════════════════
-- These partners serve the 10 new intelligence-layer leak categories that
-- go beyond basic financial detection into strategy, leadership, culture, etc.

INSERT INTO affiliate_partners (id, name, slug, description, category, sub_category, pricing_type, referral_type, referral_url, commission_type, commission_value, commission_recurring, quality_score, avg_user_satisfaction, active)
VALUES
  -- ─── STRATEGY & LEADERSHIP ───
  ('partner_eosworldwide', 'EOS Worldwide', 'eosworldwide',
   'Entrepreneurial Operating System — strategic alignment and execution framework for growing companies.',
   'strategy', 'execution', 'fixed', 'link', 'https://eosworldwide.com?ref=leakandgrow',
   'flat', 100, false, 0.85, 4.6, true),

  ('partner_vistage', 'Vistage', 'vistage',
   'CEO peer advisory groups with executive coaching. Leadership development for business owners.',
   'leadership', 'coaching', 'fixed', 'form', 'https://vistage.com?ref=leakandgrow',
   'flat', 200, false, 0.80, 4.5, true),

  -- ─── TALENT & CULTURE ───
  ('partner_bamboohr', 'BambooHR', 'bamboohr',
   'HR software for hiring, onboarding, culture surveys, and employee management.',
   'talent', 'hr_platform', 'fixed', 'link', 'https://bamboohr.com?ref=leakandgrow',
   'flat', 75, true, 0.82, 4.4, true),

  -- ─── TECHNOLOGY & AUTOMATION ───
  ('partner_zapier', 'Zapier', 'zapier',
   'No-code automation connecting 6,000+ apps. Eliminate manual processes.',
   'automation', 'integration', 'fixed', 'link', 'https://zapier.com?ref=leakandgrow',
   'percentage', 30, true, 0.88, 4.7, true),

  -- ─── CUSTOMER INTELLIGENCE ───
  ('partner_hubspot', 'HubSpot', 'hubspot',
   'CRM, marketing, sales, and customer service platform. Full customer lifecycle.',
   'crm', 'full_suite', 'fixed', 'link', 'https://hubspot.com?ref=leakandgrow',
   'percentage', 20, true, 0.85, 4.5, true),

  -- ─── KNOWLEDGE MANAGEMENT ───
  ('partner_notion', 'Notion', 'notion',
   'Connected workspace for docs, wikis, and project management. End knowledge silos.',
   'knowledge', 'workspace', 'fixed', 'link', 'https://notion.so?ref=leakandgrow',
   'flat', 25, false, 0.80, 4.6, true)

ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  referral_url = EXCLUDED.referral_url,
  commission_value = EXCLUDED.commission_value,
  quality_score = EXCLUDED.quality_score,
  active = EXCLUDED.active,
  updated_at = NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: EXTENDED AFFILIATE → LEAK CATEGORY MAPPINGS
-- ═══════════════════════════════════════════════════════════════════════════════
-- Maps the 10 NEW intelligence categories to appropriate partners.
-- Combined with the existing 10 standard categories, this gives us
-- FULL COVERAGE: every leak from every layer → at least 1 partner.

INSERT INTO affiliate_partner_leak_mappings (id, partner_id, leak_type, estimated_savings_percentage, active)
VALUES
  -- ─── strategy-alignment → Strategy/Leadership partners ───
  ('map_eos_strategy',         'partner_eosworldwide',  'strategy-alignment',     15, true),
  ('map_vistage_strategy',     'partner_vistage',       'strategy-alignment',     12, true),
  ('map_notion_strategy',      'partner_notion',        'strategy-alignment',      8, true),

  -- ─── leadership-decisions → Leadership/Coaching partners ───
  ('map_vistage_leadership',   'partner_vistage',       'leadership-decisions',   18, true),
  ('map_eos_leadership',       'partner_eosworldwide',  'leadership-decisions',   12, true),

  -- ─── customer-intelligence → CRM/Customer platform partners ───
  ('map_hubspot_customer',     'partner_hubspot',       'customer-intelligence',  20, true),
  ('map_freshbooks_customer',  'partner_freshbooks',    'customer-intelligence',  10, true),
  ('map_clio_customer',        'partner_clio',          'customer-intelligence',  12, true),

  -- ─── talent-culture → HR/People partners ───
  ('map_bamboo_talent',        'partner_bamboohr',      'talent-culture',         15, true),
  ('map_gusto_talent',         'partner_gusto',         'talent-culture',         12, true),
  ('map_7shifts_talent',       'partner_7shifts',       'talent-culture',         10, true),
  ('map_deputy_talent',        'partner_deputy',        'talent-culture',          8, true),

  -- ─── technology-debt → Automation/Software partners ───
  ('map_zapier_tech',          'partner_zapier',        'technology-debt',        20, true),
  ('map_xero_tech',            'partner_xero',          'technology-debt',        12, true),
  ('map_quickbooks_tech',      'partner_quickbooks',    'technology-debt',        10, true),

  -- ─── market-position → Digital/Brand partners ───
  ('map_hubspot_market',       'partner_hubspot',       'market-position',        15, true),
  ('map_lightspeed_market',    'partner_lightspeed',    'market-position',         8, true),

  -- ─── growth-blockers → Operations/Scale partners ───
  ('map_zapier_growth',        'partner_zapier',        'growth-blockers',        18, true),
  ('map_buildertrend_growth',  'partner_buildertrend',  'growth-blockers',        12, true),
  ('map_procore_growth',       'partner_procore',       'growth-blockers',        10, true),
  ('map_toast_growth',         'partner_toast',         'growth-blockers',         8, true),

  -- ─── risk-exposure → Insurance/Compliance partners ───
  ('map_zensurance_risk',      'partner_zensurance',    'risk-exposure',          22, true),
  ('map_sonnet_risk',          'partner_sonnet',        'risk-exposure',          18, true),
  ('map_kanetix_risk',         'partner_kanetix',       'risk-exposure',          15, true),
  ('map_bench_risk',           'partner_bench',         'risk-exposure',          10, true),

  -- ─── knowledge-capital → Knowledge/Workspace partners ───
  ('map_notion_knowledge',     'partner_notion',        'knowledge-capital',      20, true),
  ('map_pandadoc_knowledge',   'partner_pandadoc',      'knowledge-capital',      12, true),

  -- ─── hidden-revenue → Growth/Revenue partners ───
  ('map_hubspot_hidden',       'partner_hubspot',       'hidden-revenue',         15, true),
  ('map_eos_hidden',           'partner_eosworldwide',  'hidden-revenue',         12, true),
  ('map_lightspeed_hidden',    'partner_lightspeed',    'hidden-revenue',          8, true)

ON CONFLICT (id) DO UPDATE SET
  estimated_savings_percentage = EXCLUDED.estimated_savings_percentage,
  active = EXCLUDED.active;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: VERIFICATION QUERY
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this after to confirm everything connected.

-- Count tables by prefix
SELECT 'track_ tables' AS check_name,
       COUNT(*) AS count,
       CASE WHEN COUNT(*) = 6 THEN '✅ ALL 6 CREATED' ELSE '❌ MISSING' END AS status
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'track_%';

-- Count total affiliate partners
SELECT 'affiliate partners' AS check_name,
       COUNT(*) AS count,
       CASE WHEN COUNT(*) >= 48 THEN '✅ 48+ PARTNERS' ELSE '⚠️ CHECK' END AS status
FROM affiliate_partners WHERE active = true;

-- Count leak type mappings
SELECT 'leak type mappings' AS check_name,
       COUNT(*) AS count,
       CASE WHEN COUNT(*) >= 75 THEN '✅ 75+ MAPPINGS' ELSE '⚠️ CHECK' END AS status
FROM affiliate_partner_leak_mappings WHERE active = true;

-- Coverage check: which categories have partners?
SELECT m.leak_type,
       COUNT(DISTINCT m.partner_id) AS partner_count,
       STRING_AGG(p.name, ', ' ORDER BY p.quality_score DESC) AS partners
FROM affiliate_partner_leak_mappings m
JOIN affiliate_partners p ON p.id = m.partner_id
WHERE m.active = true AND p.active = true
GROUP BY m.leak_type
ORDER BY m.leak_type;

-- Session 4: Add recovery tracking columns to leaks table
-- Run this in Supabase SQL Editor

ALTER TABLE leaks ADD COLUMN IF NOT EXISTS "amountRecovered" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS "fixedAt" TIMESTAMP(3);

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
