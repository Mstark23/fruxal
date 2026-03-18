-- ============================================================================
-- SAAS / SOFTWARE ENGINE — COMPLETE INSTALL (tables + seed)
-- Run this ONE file in Supabase SQL Editor
-- Simulates "CloudMetric Analytics" — B2B SaaS, $2.1M ARR, 340 customers
-- ============================================================================

-- STEP 1: Drop existing tables
DROP TABLE IF EXISTS saas_feature_usage CASCADE;
DROP TABLE IF EXISTS saas_support_tickets CASCADE;
DROP TABLE IF EXISTS saas_payment_events CASCADE;
DROP TABLE IF EXISTS saas_mrr_movements CASCADE;
DROP TABLE IF EXISTS saas_leads CASCADE;
DROP TABLE IF EXISTS saas_expenses CASCADE;
DROP TABLE IF EXISTS saas_subscriptions CASCADE;
DROP TABLE IF EXISTS saas_customers CASCADE;
DROP TABLE IF EXISTS saas_plans CASCADE;
DROP TABLE IF EXISTS saas_channels CASCADE;

-- ============================================================================
-- STEP 2: Create 10 tables
-- ============================================================================

-- Pricing plans
CREATE TABLE IF NOT EXISTS saas_plans (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL, -- STARTER, GROWTH, PROFESSIONAL, ENTERPRISE
  billing_interval TEXT DEFAULT 'MONTHLY', -- MONTHLY, ANNUAL
  price_monthly NUMERIC(10,2) NOT NULL,
  price_annual NUMERIC(10,2),
  seats_included INTEGER DEFAULT 1,
  features_included TEXT[], -- array of feature keys
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- Customers (accounts)
CREATE TABLE IF NOT EXISTS saas_customers (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  industry TEXT,
  employee_count INTEGER,
  signup_date DATE NOT NULL,
  lead_source TEXT,
  lead_cost NUMERIC(8,2) DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_date DATE,
  days_to_onboard INTEGER,
  health_score INTEGER DEFAULT 50, -- 0-100
  nps_score INTEGER, -- -100 to 100
  last_login DATE,
  login_count_30d INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CHURNED, PAUSED, TRIAL, DELINQUENT
  churn_date DATE,
  churn_reason TEXT,
  expansion_revenue NUMERIC(10,2) DEFAULT 0,
  lifetime_revenue NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS saas_subscriptions (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES saas_customers(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES saas_plans(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CANCELLED, PAST_DUE, TRIALING, PAUSED
  mrr NUMERIC(10,2) NOT NULL,
  arr NUMERIC(12,2),
  seats INTEGER DEFAULT 1,
  seats_used INTEGER DEFAULT 1,
  billing_interval TEXT DEFAULT 'MONTHLY',
  start_date DATE NOT NULL,
  current_period_end DATE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_start DATE,
  trial_end DATE,
  discount_pct NUMERIC(5,2) DEFAULT 0,
  contract_months INTEGER,
  renewal_date DATE,
  last_payment_date DATE,
  last_payment_amount NUMERIC(10,2),
  failed_payment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- MRR Movements (monthly tracking)
CREATE TABLE IF NOT EXISTS saas_mrr_movements (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES saas_customers(id) ON DELETE SET NULL,
  month DATE NOT NULL,
  movement_type TEXT NOT NULL, -- NEW, EXPANSION, CONTRACTION, CHURN, REACTIVATION
  mrr_amount NUMERIC(10,2) NOT NULL,
  previous_mrr NUMERIC(10,2) DEFAULT 0,
  new_mrr NUMERIC(10,2) DEFAULT 0,
  plan_from TEXT,
  plan_to TEXT,
  reason TEXT,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- Payment Events
CREATE TABLE IF NOT EXISTS saas_payment_events (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES saas_customers(id) ON DELETE CASCADE,
  subscription_id TEXT REFERENCES saas_subscriptions(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL, -- PAYMENT_SUCCESS, PAYMENT_FAILED, REFUND, DUNNING_SENT, RECOVERED, CARD_EXPIRED
  amount NUMERIC(10,2),
  decline_code TEXT, -- insufficient_funds, card_expired, generic_decline, etc.
  retry_count INTEGER DEFAULT 0,
  recovered BOOLEAN DEFAULT FALSE,
  recovered_date DATE,
  days_to_recover INTEGER,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- Feature Usage
CREATE TABLE IF NOT EXISTS saas_feature_usage (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES saas_customers(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  feature_key TEXT NOT NULL,
  feature_name TEXT,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  usage_pct NUMERIC(5,2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS saas_support_tickets (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES saas_customers(id) ON DELETE CASCADE,
  opened_date DATE NOT NULL,
  resolved_date DATE,
  category TEXT, -- BUG, FEATURE_REQUEST, BILLING, ONBOARDING, GENERAL, CANCELLATION
  priority TEXT DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  status TEXT DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
  resolution_hours INTEGER,
  satisfaction_score INTEGER, -- 1-5
  escalated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- Acquisition Channels
CREATE TABLE IF NOT EXISTS saas_channels (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  channel_type TEXT, -- ORGANIC, PAID, REFERRAL, PARTNER, OUTBOUND, EVENT
  month DATE NOT NULL,
  spend NUMERIC(10,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  trials INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(10,2) DEFAULT 0,
  cac NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- Leads / Pipeline
CREATE TABLE IF NOT EXISTS saas_leads (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  lead_date DATE NOT NULL,
  company_name TEXT,
  contact_name TEXT,
  lead_type TEXT DEFAULT 'MQL', -- VISITOR, MQL, SQL, PQL, OPPORTUNITY, WON, LOST
  lead_score INTEGER DEFAULT 0,
  demo_scheduled BOOLEAN DEFAULT FALSE,
  demo_completed BOOLEAN DEFAULT FALSE,
  trial_started BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  converted_date DATE,
  days_to_convert INTEGER,
  deal_value NUMERIC(10,2),
  lost_reason TEXT,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- Operating Expenses (for margin/efficiency calcs)
CREATE TABLE IF NOT EXISTS saas_expenses (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  category TEXT NOT NULL, -- HOSTING, SALARIES, SALES_MARKETING, SUPPORT, R_AND_D, G_AND_A
  subcategory TEXT,
  amount NUMERIC(12,2) NOT NULL,
  headcount INTEGER,
  notes TEXT,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saas_plans_biz ON saas_plans(business_id);
CREATE INDEX idx_saas_cust_biz ON saas_customers(business_id);
CREATE INDEX idx_saas_cust_status ON saas_customers(status);
CREATE INDEX idx_saas_sub_biz ON saas_subscriptions(business_id);
CREATE INDEX idx_saas_sub_cust ON saas_subscriptions(customer_id);
CREATE INDEX idx_saas_mrr_biz ON saas_mrr_movements(business_id);
CREATE INDEX idx_saas_mrr_month ON saas_mrr_movements(month);
CREATE INDEX idx_saas_pay_biz ON saas_payment_events(business_id);
CREATE INDEX idx_saas_pay_cust ON saas_payment_events(customer_id);
CREATE INDEX idx_saas_feat_biz ON saas_feature_usage(business_id);
CREATE INDEX idx_saas_feat_cust ON saas_feature_usage(customer_id);
CREATE INDEX idx_saas_tix_biz ON saas_support_tickets(business_id);
CREATE INDEX idx_saas_chan_biz ON saas_channels(business_id);
CREATE INDEX idx_saas_leads_biz ON saas_leads(business_id);
CREATE INDEX idx_saas_exp_biz ON saas_expenses(business_id);

-- ============================================================================
-- STEP 3: SEED DEMO DATA — "CloudMetric Analytics"
-- B2B SaaS analytics platform, ~$2.1M ARR, 340 customers
-- ============================================================================
DO $$
DECLARE
  biz_id TEXT;
  m1 DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')::date;
  m2 DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '4 months')::date;
  m3 DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')::date;
  m4 DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::date;
  m5 DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date;
  m6 DATE := DATE_TRUNC('month', CURRENT_DATE)::date;
BEGIN
  SELECT id INTO biz_id FROM businesses LIMIT 1;
  IF biz_id IS NULL THEN
    RAISE EXCEPTION 'No business found. Create a business first.';
  END IF;

  -- ========================================================================
  -- PLANS (4 tiers × 2 intervals = 8 plans)
  -- ========================================================================
  INSERT INTO saas_plans (id, business_id, name, tier, billing_interval, price_monthly, price_annual, seats_included, features_included) VALUES
    ('plan-starter-m', biz_id, 'Starter Monthly', 'STARTER', 'MONTHLY', 49, NULL, 2, ARRAY['dashboards','basic_reports','email_support']),
    ('plan-starter-a', biz_id, 'Starter Annual', 'STARTER', 'ANNUAL', 39, 468, 2, ARRAY['dashboards','basic_reports','email_support']),
    ('plan-growth-m', biz_id, 'Growth Monthly', 'GROWTH', 'MONTHLY', 149, NULL, 5, ARRAY['dashboards','advanced_reports','integrations','api_access','priority_support']),
    ('plan-growth-a', biz_id, 'Growth Annual', 'GROWTH', 'ANNUAL', 119, 1428, 5, ARRAY['dashboards','advanced_reports','integrations','api_access','priority_support']),
    ('plan-pro-m', biz_id, 'Professional Monthly', 'PROFESSIONAL', 'MONTHLY', 349, NULL, 15, ARRAY['dashboards','advanced_reports','integrations','api_access','custom_dashboards','sso','priority_support','phone_support']),
    ('plan-pro-a', biz_id, 'Professional Annual', 'PROFESSIONAL', 'ANNUAL', 279, 3348, 15, ARRAY['dashboards','advanced_reports','integrations','api_access','custom_dashboards','sso','priority_support','phone_support']),
    ('plan-ent-m', biz_id, 'Enterprise Monthly', 'ENTERPRISE', 'MONTHLY', 799, NULL, 50, ARRAY['dashboards','advanced_reports','integrations','api_access','custom_dashboards','sso','dedicated_csm','sla','white_label','audit_log']),
    ('plan-ent-a', biz_id, 'Enterprise Annual', 'ENTERPRISE', 'ANNUAL', 649, 7788, 50, ARRAY['dashboards','advanced_reports','integrations','api_access','custom_dashboards','sso','dedicated_csm','sla','white_label','audit_log']);

  -- ========================================================================
  -- CUSTOMERS — 45 named accounts (mix of healthy, at-risk, churned)
  -- ========================================================================
  INSERT INTO saas_customers (id, business_id, company_name, contact_name, contact_email, industry, employee_count, signup_date, lead_source, lead_cost, onboarding_completed, onboarding_completed_date, days_to_onboard, health_score, nps_score, last_login, login_count_30d, status, churn_date, churn_reason, expansion_revenue, lifetime_revenue) VALUES
    -- ENTERPRISE customers (healthy)
    ('cust-001', biz_id, 'Apex Financial Group', 'Diana Reynolds', 'diana@apexfin.com', 'Finance', 850, '2023-06-15', 'OUTBOUND', 2800, true, '2023-07-10', 25, 92, 9, CURRENT_DATE - 1, 28, 'ACTIVE', NULL, NULL, 4200, 62400),
    ('cust-002', biz_id, 'TechVault Systems', 'Robert Kim', 'rkim@techvault.io', 'Technology', 1200, '2023-03-01', 'EVENT', 3200, true, '2023-03-20', 19, 88, 8, CURRENT_DATE - 2, 22, 'ACTIVE', NULL, NULL, 3800, 78000),
    ('cust-003', biz_id, 'MedCore Health', 'Sarah Lin', 'slin@medcore.com', 'Healthcare', 620, '2024-01-10', 'REFERRAL', 0, true, '2024-02-05', 26, 85, 7, CURRENT_DATE - 3, 18, 'ACTIVE', NULL, NULL, 1600, 38400),
    -- ENTERPRISE at-risk (low engagement)
    ('cust-004', biz_id, 'GlobalRetail Inc', 'James Chen', 'jchen@globalretail.com', 'Retail', 2000, '2023-09-01', 'OUTBOUND', 4500, true, '2023-10-15', 44, 35, 3, CURRENT_DATE - 21, 4, 'ACTIVE', NULL, NULL, 0, 52800),
    ('cust-005', biz_id, 'Pinnacle Manufacturing', 'Tom Barrett', 'tbarrett@pinnacle.com', 'Manufacturing', 950, '2024-06-01', 'PARTNER', 1500, false, NULL, NULL, 28, NULL, CURRENT_DATE - 35, 2, 'ACTIVE', NULL, NULL, 0, 15600),
    -- PROFESSIONAL customers
    ('cust-006', biz_id, 'BrightPath Consulting', 'Elena Martinez', 'emartinez@brightpath.co', 'Consulting', 85, '2023-08-15', 'CONTENT', 120, true, '2023-09-01', 17, 78, 8, CURRENT_DATE - 1, 25, 'ACTIVE', NULL, NULL, 1800, 28800),
    ('cust-007', biz_id, 'NexGen Marketing', 'Kyle Davis', 'kyle@nexgenm.com', 'Marketing', 120, '2024-02-01', 'GOOGLE_ADS', 380, true, '2024-02-18', 17, 72, 6, CURRENT_DATE - 4, 16, 'ACTIVE', NULL, NULL, 700, 14400),
    ('cust-008', biz_id, 'DataDriven Labs', 'Amy Zhao', 'azhao@datadrivenlabs.com', 'Technology', 65, '2024-05-15', 'ORGANIC', 0, true, '2024-06-02', 18, 82, 9, CURRENT_DATE - 1, 30, 'ACTIVE', NULL, NULL, 1050, 11200),
    ('cust-009', biz_id, 'Crestview Legal', 'Mark Thompson', 'mthompson@crestview.law', 'Legal', 45, '2024-08-01', 'REFERRAL', 0, true, '2024-08-20', 19, 65, 5, CURRENT_DATE - 8, 10, 'ACTIVE', NULL, NULL, 0, 5600),
    -- PROFESSIONAL at-risk
    ('cust-010', biz_id, 'Summit Logistics', 'Patricia Okafor', 'pokafor@summit-log.com', 'Logistics', 200, '2024-03-01', 'LINKEDIN_ADS', 650, true, '2024-04-05', 35, 32, 2, CURRENT_DATE - 28, 3, 'ACTIVE', NULL, NULL, 0, 10800),
    -- GROWTH customers (healthy)
    ('cust-011', biz_id, 'Craftwork Studio', 'Liam O''Brien', 'liam@craftwork.studio', 'Design', 22, '2024-04-01', 'ORGANIC', 0, true, '2024-04-10', 9, 90, 10, CURRENT_DATE, 35, 'ACTIVE', NULL, NULL, 450, 4800),
    ('cust-012', biz_id, 'GreenLeaf Foods', 'Nina Patel', 'nina@greenleaf.co', 'Food', 35, '2024-06-15', 'CONTENT', 85, true, '2024-06-25', 10, 75, 7, CURRENT_DATE - 2, 20, 'ACTIVE', NULL, NULL, 300, 3000),
    ('cust-013', biz_id, 'UrbanFit Gyms', 'Derek Wang', 'dwang@urbanfit.com', 'Fitness', 40, '2024-01-15', 'FACEBOOK_ADS', 220, true, '2024-01-28', 13, 68, 6, CURRENT_DATE - 5, 14, 'ACTIVE', NULL, NULL, 0, 5400),
    ('cust-014', biz_id, 'Bloom Agency', 'Rachel Torres', 'rachel@bloomagency.com', 'Marketing', 15, '2024-09-01', 'ORGANIC', 0, true, '2024-09-08', 7, 85, 9, CURRENT_DATE - 1, 28, 'ACTIVE', NULL, NULL, 150, 1800),
    ('cust-015', biz_id, 'Coastal Realty', 'Ben Harper', 'bharper@coastalrealty.com', 'Real Estate', 28, '2024-07-01', 'GOOGLE_ADS', 310, true, '2024-07-15', 14, 62, 5, CURRENT_DATE - 10, 8, 'ACTIVE', NULL, NULL, 0, 2400),
    -- GROWTH at-risk (low usage, high support tickets)
    ('cust-016', biz_id, 'QuickShip Express', 'Andrea Bell', 'abell@quickship.io', 'Logistics', 18, '2024-05-01', 'GOOGLE_ADS', 290, false, NULL, NULL, 25, 1, CURRENT_DATE - 42, 1, 'ACTIVE', NULL, NULL, 0, 2700),
    ('cust-017', biz_id, 'EduSpark Online', 'Kevin Frost', 'kfrost@eduspark.com', 'Education', 12, '2024-08-15', 'CONTENT', 95, true, '2024-09-15', 31, 30, 2, CURRENT_DATE - 30, 2, 'ACTIVE', NULL, NULL, 0, 1200),
    -- STARTER customers (mix)
    ('cust-018', biz_id, 'Solo Design Co', 'Mia Chang', 'mia@solodesign.co', 'Design', 3, '2024-10-01', 'ORGANIC', 0, true, '2024-10-05', 4, 80, 8, CURRENT_DATE - 1, 22, 'ACTIVE', NULL, NULL, 0, 600),
    ('cust-019', biz_id, 'PetPals Vet', 'Josh Morales', 'josh@petpals.vet', 'Healthcare', 8, '2024-11-01', 'FACEBOOK_ADS', 180, true, '2024-11-10', 9, 55, 5, CURRENT_DATE - 12, 6, 'ACTIVE', NULL, NULL, 0, 300),
    ('cust-020', biz_id, 'FreshBrew Coffee', 'Tina Walsh', 'tina@freshbrew.co', 'Food', 5, '2024-09-15', 'ORGANIC', 0, true, '2024-09-20', 5, 70, 7, CURRENT_DATE - 3, 15, 'ACTIVE', NULL, NULL, 0, 750),
    -- STARTER at-risk / delinquent
    ('cust-021', biz_id, 'Swift Courier', 'Dave Newton', 'dave@swiftcourier.com', 'Logistics', 6, '2024-08-01', 'GOOGLE_ADS', 340, false, NULL, NULL, 15, NULL, CURRENT_DATE - 45, 0, 'DELINQUENT', NULL, NULL, 0, 450),
    ('cust-022', biz_id, 'TinyTask Apps', 'Leo Kim', 'leo@tinytask.io', 'Technology', 4, '2024-07-01', 'ORGANIC', 0, true, '2024-07-08', 7, 20, 1, CURRENT_DATE - 60, 0, 'DELINQUENT', NULL, NULL, 0, 550),
    -- TRIAL customers (not yet converted)
    ('cust-023', biz_id, 'BrightStar Analytics', 'Nora Quinn', 'nquinn@brightstar.co', 'Finance', 30, CURRENT_DATE - 10, 'ORGANIC', 0, false, NULL, NULL, 45, NULL, CURRENT_DATE - 2, 8, 'TRIAL', NULL, NULL, 0, 0),
    ('cust-024', biz_id, 'CloudFirst IT', 'Ryan Shaw', 'rshaw@cloudfirst.com', 'Technology', 55, CURRENT_DATE - 8, 'OUTBOUND', 900, false, NULL, NULL, 50, NULL, CURRENT_DATE, 12, 'TRIAL', NULL, NULL, 0, 0),
    ('cust-025', biz_id, 'Harmony HR', 'Lisa Becker', 'lbecker@harmonyhr.com', 'HR', 80, CURRENT_DATE - 12, 'CONTENT', 65, false, NULL, NULL, 35, NULL, CURRENT_DATE - 5, 4, 'TRIAL', NULL, NULL, 0, 0),
    -- CHURNED customers (LEAK: each one represents lost MRR)
    ('cust-026', biz_id, 'RedLine Autos', 'Chris Palmer', 'chris@redlineautos.com', 'Automotive', 25, '2024-01-15', 'GOOGLE_ADS', 410, true, '2024-02-01', 17, 0, 2, '2025-06-10', 0, 'CHURNED', '2025-06-15', 'COMPETITOR', 0, 4500),
    ('cust-027', biz_id, 'Keystone Properties', 'Donna Lewis', 'dlewis@keystone.com', 'Real Estate', 50, '2024-03-01', 'EVENT', 1800, false, NULL, NULL, 0, 1, '2025-04-20', 0, 'CHURNED', '2025-05-01', 'NO_VALUE', 0, 5200),
    ('cust-028', biz_id, 'AquaPure Systems', 'Greg Hansen', 'ghansen@aquapure.com', 'Manufacturing', 35, '2024-06-01', 'PARTNER', 600, true, '2024-06-28', 27, 0, 3, '2025-07-01', 0, 'CHURNED', '2025-07-15', 'BUDGET_CUT', 0, 2400),
    ('cust-029', biz_id, 'NovaTech Solutions', 'Heather Rios', 'hrios@novatech.co', 'Technology', 70, '2024-04-15', 'LINKEDIN_ADS', 880, true, '2024-05-10', 25, 0, 4, '2025-09-01', 0, 'CHURNED', '2025-09-15', 'PRODUCT_GAP', 0, 6000),
    ('cust-030', biz_id, 'LuminaDesign', 'Sam Park', 'spark@luminadesign.io', 'Design', 10, '2024-09-01', 'ORGANIC', 0, true, '2024-09-10', 9, 0, 2, '2025-08-15', 0, 'CHURNED', '2025-08-30', 'PRICING', 0, 1800),
    -- CHURNED from failed payments (involuntary — LEAK)
    ('cust-031', biz_id, 'Metro Dental Group', 'Dr. Alan Brooks', 'abrooks@metrodental.com', 'Healthcare', 15, '2024-05-01', 'CONTENT', 95, true, '2024-05-12', 11, 0, 7, '2025-10-01', 0, 'CHURNED', '2025-10-15', 'PAYMENT_FAILED', 0, 2550),
    ('cust-032', biz_id, 'ProFit Accounting', 'Janet Moore', 'jmoore@profitacct.com', 'Finance', 8, '2024-07-01', 'ORGANIC', 0, true, '2024-07-05', 4, 0, 6, '2025-11-01', 0, 'CHURNED', '2025-11-10', 'PAYMENT_FAILED', 0, 1200),
    ('cust-033', biz_id, 'UrbanPrint Co', 'Alex Vargas', 'avargas@urbanprint.com', 'Media', 5, '2024-08-01', 'FACEBOOK_ADS', 195, true, '2024-08-08', 7, 0, 8, '2025-09-20', 0, 'CHURNED', '2025-10-05', 'PAYMENT_FAILED', 0, 850),
    -- Bulk additional active customers (Growth & Starter) to simulate ~340 total
    -- We'll use a loop for the remaining ~12
    ('cust-034', biz_id, 'AlphaWave Media', 'Tyler Grant', 'tgrant@alphawave.co', 'Media', 20, '2024-11-15', 'ORGANIC', 0, true, '2024-11-25', 10, 74, 7, CURRENT_DATE - 2, 18, 'ACTIVE', NULL, NULL, 0, 900),
    ('cust-035', biz_id, 'NorthPeak Financial', 'Karen Liu', 'kliu@northpeak.com', 'Finance', 45, '2024-10-01', 'REFERRAL', 0, true, '2024-10-12', 11, 80, 8, CURRENT_DATE - 1, 24, 'ACTIVE', NULL, NULL, 350, 2800),
    ('cust-036', biz_id, 'VeloCargo', 'Oscar Diaz', 'odiaz@velocargo.com', 'Logistics', 60, '2024-03-15', 'OUTBOUND', 1200, true, '2024-04-10', 26, 58, 4, CURRENT_DATE - 14, 6, 'ACTIVE', NULL, NULL, 0, 7200),
    ('cust-037', biz_id, 'Pixel Perfect', 'Chloe Martin', 'chloe@pixelperfect.design', 'Design', 9, '2025-01-10', 'ORGANIC', 0, true, '2025-01-15', 5, 88, 9, CURRENT_DATE, 32, 'ACTIVE', NULL, NULL, 0, 600),
    ('cust-038', biz_id, 'TrustBridge Insurance', 'Paul Newman', 'pnewman@trustbridge.com', 'Insurance', 150, '2024-04-01', 'EVENT', 2200, true, '2024-04-25', 24, 70, 6, CURRENT_DATE - 6, 12, 'ACTIVE', NULL, NULL, 1400, 16800),
    ('cust-039', biz_id, 'EcoHarvest', 'Ming Wei', 'mwei@ecoharvest.co', 'Agriculture', 30, '2024-12-01', 'CONTENT', 75, true, '2024-12-15', 14, 65, 5, CURRENT_DATE - 9, 8, 'ACTIVE', NULL, NULL, 0, 900),
    ('cust-040', biz_id, 'QuantumEdge AI', 'Priya Sharma', 'psharma@quantumedge.ai', 'Technology', 40, '2025-01-15', 'ORGANIC', 0, false, NULL, NULL, 42, NULL, CURRENT_DATE - 4, 10, 'ACTIVE', NULL, NULL, 0, 450),
    -- LEAK: Heavily discounted Enterprise (paying Growth prices)
    ('cust-041', biz_id, 'MegaCorp Industries', 'Victoria Blake', 'vblake@megacorp.com', 'Manufacturing', 5000, '2023-01-15', 'OUTBOUND', 5500, true, '2023-02-20', 36, 60, 5, CURRENT_DATE - 7, 8, 'ACTIVE', NULL, NULL, 0, 42000),
    -- LEAK: High-usage Starter not upgrading
    ('cust-042', biz_id, 'ScaleUp Ventures', 'Marco Rossi', 'mrossi@scaleup.vc', 'Finance', 18, '2024-02-01', 'REFERRAL', 0, true, '2024-02-05', 4, 85, 9, CURRENT_DATE, 40, 'ACTIVE', NULL, NULL, 0, 3600),
    -- LEAK: Very long onboarding, low health
    ('cust-043', biz_id, 'Precision Engineering', 'James Wright', 'jwright@precisioneng.com', 'Manufacturing', 100, '2025-01-01', 'OUTBOUND', 1400, false, NULL, NULL, 22, NULL, CURRENT_DATE - 20, 3, 'ACTIVE', NULL, NULL, 0, 700),
    -- PAUSED customer
    ('cust-044', biz_id, 'WinterSport Gear', 'Anna Frost', 'afrost@wintersport.com', 'Retail', 12, '2024-06-01', 'GOOGLE_ADS', 280, true, '2024-06-12', 11, 40, 4, '2025-10-01', 0, 'PAUSED', NULL, NULL, 0, 1500),
    ('cust-045', biz_id, 'Catalyst Partners', 'David Cho', 'dcho@catalystpartners.com', 'Consulting', 25, '2024-11-01', 'REFERRAL', 0, true, '2024-11-10', 9, 76, 7, CURRENT_DATE - 3, 15, 'ACTIVE', NULL, NULL, 200, 1400);

  -- ========================================================================
  -- SUBSCRIPTIONS
  -- ========================================================================
  INSERT INTO saas_subscriptions (id, business_id, customer_id, plan_id, status, mrr, arr, seats, seats_used, billing_interval, start_date, current_period_end, cancel_at_period_end, discount_pct, contract_months, renewal_date, last_payment_date, last_payment_amount, failed_payment_count) VALUES
    -- Enterprise
    ('sub-001', biz_id, 'cust-001', 'plan-ent-a', 'ACTIVE', 649, 7788, 50, 42, 'ANNUAL', '2023-06-15', '2026-06-14', false, 0, 12, '2026-06-14', CURRENT_DATE - 15, 649, 0),
    ('sub-002', biz_id, 'cust-002', 'plan-ent-a', 'ACTIVE', 649, 7788, 50, 48, 'ANNUAL', '2023-03-01', '2026-02-28', false, 0, 12, '2026-02-28', CURRENT_DATE - 5, 649, 0),
    ('sub-003', biz_id, 'cust-003', 'plan-ent-m', 'ACTIVE', 799, 9588, 50, 30, 'MONTHLY', '2024-01-10', (CURRENT_DATE + 10)::date, false, 0, NULL, NULL, CURRENT_DATE - 20, 799, 0),
    ('sub-004', biz_id, 'cust-004', 'plan-ent-a', 'ACTIVE', 649, 7788, 50, 12, 'ANNUAL', '2023-09-01', '2026-08-31', true, 0, 12, '2026-08-31', CURRENT_DATE - 45, 649, 0),
    ('sub-005', biz_id, 'cust-005', 'plan-ent-m', 'ACTIVE', 799, 9588, 50, 8, 'MONTHLY', '2024-06-01', (CURRENT_DATE + 5)::date, false, 0, NULL, NULL, CURRENT_DATE - 25, 799, 1),
    -- LEAK: Enterprise customer paying Growth price (massive discount)
    ('sub-041', biz_id, 'cust-041', 'plan-growth-a', 'ACTIVE', 119, 1428, 5, 5, 'ANNUAL', '2023-01-15', '2026-01-14', false, 40, 36, '2026-01-14', CURRENT_DATE - 12, 119, 0),
    -- Professional
    ('sub-006', biz_id, 'cust-006', 'plan-pro-a', 'ACTIVE', 279, 3348, 15, 12, 'ANNUAL', '2023-08-15', '2026-08-14', false, 0, 12, '2026-08-14', CURRENT_DATE - 8, 279, 0),
    ('sub-007', biz_id, 'cust-007', 'plan-pro-m', 'ACTIVE', 349, 4188, 15, 10, 'MONTHLY', '2024-02-01', (CURRENT_DATE + 12)::date, false, 0, NULL, NULL, CURRENT_DATE - 18, 349, 0),
    ('sub-008', biz_id, 'cust-008', 'plan-pro-a', 'ACTIVE', 279, 3348, 15, 8, 'ANNUAL', '2024-05-15', '2026-05-14', false, 0, 12, '2026-05-14', CURRENT_DATE - 3, 279, 0),
    ('sub-009', biz_id, 'cust-009', 'plan-pro-m', 'ACTIVE', 349, 4188, 15, 5, 'MONTHLY', '2024-08-01', (CURRENT_DATE + 8)::date, false, 10, NULL, NULL, CURRENT_DATE - 22, 314, 0),
    ('sub-010', biz_id, 'cust-010', 'plan-pro-a', 'ACTIVE', 279, 3348, 15, 4, 'ANNUAL', '2024-03-01', '2026-02-28', true, 0, 12, '2026-02-28', CURRENT_DATE - 30, 279, 0),
    ('sub-038', biz_id, 'cust-038', 'plan-pro-a', 'ACTIVE', 279, 3348, 15, 14, 'ANNUAL', '2024-04-01', '2026-03-31', false, 0, 12, '2026-03-31', CURRENT_DATE - 6, 279, 0),
    -- Growth
    ('sub-011', biz_id, 'cust-011', 'plan-growth-m', 'ACTIVE', 149, 1788, 5, 4, 'MONTHLY', '2024-04-01', (CURRENT_DATE + 15)::date, false, 0, NULL, NULL, CURRENT_DATE - 15, 149, 0),
    ('sub-012', biz_id, 'cust-012', 'plan-growth-a', 'ACTIVE', 119, 1428, 5, 5, 'ANNUAL', '2024-06-15', '2025-06-14', false, 0, 12, '2025-06-14', CURRENT_DATE - 10, 119, 0),
    ('sub-013', biz_id, 'cust-013', 'plan-growth-m', 'ACTIVE', 149, 1788, 5, 5, 'MONTHLY', '2024-01-15', (CURRENT_DATE + 18)::date, false, 0, NULL, NULL, CURRENT_DATE - 12, 149, 0),
    ('sub-014', biz_id, 'cust-014', 'plan-growth-m', 'ACTIVE', 149, 1788, 5, 3, 'MONTHLY', '2024-09-01', (CURRENT_DATE + 8)::date, false, 0, NULL, NULL, CURRENT_DATE - 22, 149, 0),
    ('sub-015', biz_id, 'cust-015', 'plan-growth-a', 'ACTIVE', 119, 1428, 5, 4, 'ANNUAL', '2024-07-01', '2025-06-30', false, 0, 12, '2025-06-30', CURRENT_DATE - 5, 119, 0),
    ('sub-016', biz_id, 'cust-016', 'plan-growth-m', 'ACTIVE', 149, 1788, 5, 1, 'MONTHLY', '2024-05-01', (CURRENT_DATE + 3)::date, false, 0, NULL, NULL, CURRENT_DATE - 27, 149, 2),
    ('sub-017', biz_id, 'cust-017', 'plan-growth-m', 'ACTIVE', 149, 1788, 5, 2, 'MONTHLY', '2024-08-15', (CURRENT_DATE + 14)::date, false, 0, NULL, NULL, CURRENT_DATE - 16, 149, 0),
    ('sub-034', biz_id, 'cust-034', 'plan-growth-m', 'ACTIVE', 149, 1788, 5, 4, 'MONTHLY', '2024-11-15', (CURRENT_DATE + 10)::date, false, 0, NULL, NULL, CURRENT_DATE - 20, 149, 0),
    ('sub-035', biz_id, 'cust-035', 'plan-growth-a', 'ACTIVE', 119, 1428, 5, 5, 'ANNUAL', '2024-10-01', '2025-09-30', false, 0, 12, '2025-09-30', CURRENT_DATE - 8, 119, 0),
    ('sub-036', biz_id, 'cust-036', 'plan-growth-a', 'ACTIVE', 119, 1428, 5, 5, 'ANNUAL', '2024-03-15', '2025-03-14', false, 0, 12, '2025-03-14', CURRENT_DATE - 14, 119, 0),
    ('sub-039', biz_id, 'cust-039', 'plan-growth-m', 'ACTIVE', 149, 1788, 5, 3, 'MONTHLY', '2024-12-01', (CURRENT_DATE + 6)::date, false, 0, NULL, NULL, CURRENT_DATE - 24, 149, 0),
    ('sub-040', biz_id, 'cust-040', 'plan-growth-m', 'ACTIVE', 149, 1788, 5, 4, 'MONTHLY', '2025-01-15', (CURRENT_DATE + 20)::date, false, 0, NULL, NULL, CURRENT_DATE - 10, 149, 0),
    ('sub-045', biz_id, 'cust-045', 'plan-growth-a', 'ACTIVE', 119, 1428, 5, 3, 'ANNUAL', '2024-11-01', '2025-10-31', false, 0, 12, '2025-10-31', CURRENT_DATE - 5, 119, 0),
    -- Starter
    ('sub-018', biz_id, 'cust-018', 'plan-starter-m', 'ACTIVE', 49, 588, 2, 2, 'MONTHLY', '2024-10-01', (CURRENT_DATE + 11)::date, false, 0, NULL, NULL, CURRENT_DATE - 19, 49, 0),
    ('sub-019', biz_id, 'cust-019', 'plan-starter-m', 'ACTIVE', 49, 588, 2, 2, 'MONTHLY', '2024-11-01', (CURRENT_DATE + 7)::date, false, 0, NULL, NULL, CURRENT_DATE - 23, 49, 0),
    ('sub-020', biz_id, 'cust-020', 'plan-starter-a', 'ACTIVE', 39, 468, 2, 2, 'ANNUAL', '2024-09-15', '2025-09-14', false, 0, 12, '2025-09-14', CURRENT_DATE - 9, 39, 0),
    -- LEAK: Starter with high usage (should be Growth)
    ('sub-042', biz_id, 'cust-042', 'plan-starter-m', 'ACTIVE', 49, 588, 2, 2, 'MONTHLY', '2024-02-01', (CURRENT_DATE + 5)::date, false, 0, NULL, NULL, CURRENT_DATE - 25, 49, 0),
    ('sub-037', biz_id, 'cust-037', 'plan-starter-m', 'ACTIVE', 49, 588, 2, 1, 'MONTHLY', '2025-01-10', (CURRENT_DATE + 16)::date, false, 0, NULL, NULL, CURRENT_DATE - 14, 49, 0),
    -- Delinquent (failed payments)
    ('sub-021', biz_id, 'cust-021', 'plan-starter-m', 'PAST_DUE', 49, 588, 2, 1, 'MONTHLY', '2024-08-01', (CURRENT_DATE - 15)::date, false, 0, NULL, NULL, CURRENT_DATE - 45, 49, 3),
    ('sub-022', biz_id, 'cust-022', 'plan-starter-m', 'PAST_DUE', 49, 588, 2, 0, 'MONTHLY', '2024-07-01', (CURRENT_DATE - 30)::date, false, 0, NULL, NULL, CURRENT_DATE - 60, 49, 4),
    -- Trials
    ('sub-023', biz_id, 'cust-023', 'plan-growth-m', 'TRIALING', 0, 0, 5, 3, 'MONTHLY', CURRENT_DATE - 10, (CURRENT_DATE + 4)::date, false, 0, NULL, NULL, NULL, 0, 0),
    ('sub-024', biz_id, 'cust-024', 'plan-pro-m', 'TRIALING', 0, 0, 15, 6, 'MONTHLY', CURRENT_DATE - 8, (CURRENT_DATE + 6)::date, false, 0, NULL, NULL, NULL, 0, 0),
    ('sub-025', biz_id, 'cust-025', 'plan-growth-m', 'TRIALING', 0, 0, 5, 2, 'MONTHLY', CURRENT_DATE - 12, (CURRENT_DATE + 2)::date, false, 0, NULL, NULL, NULL, 0, 0),
    -- Paused
    ('sub-044', biz_id, 'cust-044', 'plan-growth-m', 'PAUSED', 0, 0, 5, 0, 'MONTHLY', '2024-06-01', '2025-10-01', false, 0, NULL, NULL, '2025-09-15', 149, 0),
    -- Professional (more)
    ('sub-043', biz_id, 'cust-043', 'plan-pro-m', 'ACTIVE', 349, 4188, 15, 3, 'MONTHLY', '2025-01-01', (CURRENT_DATE + 9)::date, false, 0, NULL, NULL, CURRENT_DATE - 21, 349, 0);

  -- ========================================================================
  -- MRR MOVEMENTS (6 months)
  -- ========================================================================
  INSERT INTO saas_mrr_movements (id, business_id, customer_id, month, movement_type, mrr_amount, previous_mrr, new_mrr, plan_from, plan_to, reason) VALUES
    -- Month 1: New + Expansion
    ('mrr-001', biz_id, 'cust-034', m1, 'NEW', 149, 0, 149, NULL, 'Growth', 'New signup'),
    ('mrr-002', biz_id, 'cust-001', m1, 'EXPANSION', 200, 649, 849, 'Enterprise', 'Enterprise+Addons', 'Added API credits'),
    ('mrr-003', biz_id, 'cust-026', m1, 'CHURN', -149, 149, 0, 'Growth', NULL, 'Competitor switch'),
    -- Month 2
    ('mrr-004', biz_id, 'cust-035', m2, 'NEW', 119, 0, 119, NULL, 'Growth Annual', 'New signup'),
    ('mrr-005', biz_id, 'cust-006', m2, 'EXPANSION', 100, 279, 379, 'Professional', 'Professional+Seats', 'Added 5 seats'),
    ('mrr-006', biz_id, 'cust-027', m2, 'CHURN', -279, 279, 0, 'Professional', NULL, 'No value perceived'),
    ('mrr-007', biz_id, 'cust-015', m2, 'CONTRACTION', -30, 149, 119, 'Growth Monthly', 'Growth Annual', 'Downgrade to annual'),
    -- Month 3
    ('mrr-008', biz_id, 'cust-039', m3, 'NEW', 149, 0, 149, NULL, 'Growth', 'New signup'),
    ('mrr-009', biz_id, 'cust-028', m3, 'CHURN', -149, 149, 0, 'Growth', NULL, 'Budget cut'),
    ('mrr-010', biz_id, 'cust-008', m3, 'EXPANSION', 70, 279, 349, 'Professional', 'Professional+API', 'API overage'),
    -- Month 4
    ('mrr-011', biz_id, 'cust-040', m4, 'NEW', 149, 0, 149, NULL, 'Growth', 'New signup'),
    ('mrr-012', biz_id, 'cust-029', m4, 'CHURN', -349, 349, 0, 'Professional', NULL, 'Product gap'),
    ('mrr-013', biz_id, 'cust-011', m4, 'EXPANSION', 50, 149, 199, 'Growth', 'Growth+Seats', 'Added 2 seats'),
    ('mrr-014', biz_id, 'cust-031', m4, 'CHURN', -49, 49, 0, 'Starter', NULL, 'Payment failed'),
    -- Month 5
    ('mrr-015', biz_id, 'cust-037', m5, 'NEW', 49, 0, 49, NULL, 'Starter', 'New signup'),
    ('mrr-016', biz_id, 'cust-030', m5, 'CHURN', -49, 49, 0, 'Starter', NULL, 'Pricing'),
    ('mrr-017', biz_id, 'cust-032', m5, 'CHURN', -49, 49, 0, 'Starter', NULL, 'Payment failed'),
    ('mrr-018', biz_id, 'cust-002', m5, 'EXPANSION', 150, 649, 799, 'Enterprise', 'Enterprise+White Label', 'Added white label'),
    -- Month 6 (current)
    ('mrr-019', biz_id, 'cust-045', m6, 'NEW', 119, 0, 119, NULL, 'Growth Annual', 'New signup'),
    ('mrr-020', biz_id, 'cust-033', m6, 'CHURN', -49, 49, 0, 'Starter', NULL, 'Payment failed'),
    ('mrr-021', biz_id, 'cust-044', m6, 'CONTRACTION', -149, 149, 0, 'Growth', NULL, 'Paused subscription'),
    ('mrr-022', biz_id, 'cust-035', m6, 'EXPANSION', 30, 119, 149, 'Growth Annual', 'Growth+Seats', 'Added seat');

  -- ========================================================================
  -- PAYMENT EVENTS — Success + Failures + Dunning
  -- ========================================================================
  INSERT INTO saas_payment_events (id, business_id, customer_id, subscription_id, event_date, event_type, amount, decline_code, retry_count, recovered, recovered_date, days_to_recover) VALUES
    -- Successful payments (sampling)
    ('pay-001', biz_id, 'cust-001', 'sub-001', m5, 'PAYMENT_SUCCESS', 649, NULL, 0, false, NULL, NULL),
    ('pay-002', biz_id, 'cust-006', 'sub-006', m5, 'PAYMENT_SUCCESS', 279, NULL, 0, false, NULL, NULL),
    ('pay-003', biz_id, 'cust-011', 'sub-011', m5, 'PAYMENT_SUCCESS', 149, NULL, 0, false, NULL, NULL),
    -- LEAK: Failed payments NOT recovered (involuntary churn)
    ('pay-010', biz_id, 'cust-021', 'sub-021', m4, 'PAYMENT_FAILED', 49, 'insufficient_funds', 1, false, NULL, NULL),
    ('pay-011', biz_id, 'cust-021', 'sub-021', m4 + 3, 'DUNNING_SENT', 49, NULL, 2, false, NULL, NULL),
    ('pay-012', biz_id, 'cust-021', 'sub-021', m4 + 7, 'PAYMENT_FAILED', 49, 'insufficient_funds', 3, false, NULL, NULL),
    ('pay-013', biz_id, 'cust-022', 'sub-022', m3, 'PAYMENT_FAILED', 49, 'card_expired', 1, false, NULL, NULL),
    ('pay-014', biz_id, 'cust-022', 'sub-022', m3 + 3, 'DUNNING_SENT', 49, NULL, 2, false, NULL, NULL),
    ('pay-015', biz_id, 'cust-022', 'sub-022', m3 + 7, 'PAYMENT_FAILED', 49, 'card_expired', 3, false, NULL, NULL),
    ('pay-016', biz_id, 'cust-022', 'sub-022', m3 + 14, 'PAYMENT_FAILED', 49, 'card_expired', 4, false, NULL, NULL),
    -- Failed then recovered
    ('pay-020', biz_id, 'cust-005', 'sub-005', m5, 'PAYMENT_FAILED', 799, 'generic_decline', 1, true, m5 + 5, 5),
    ('pay-021', biz_id, 'cust-016', 'sub-016', m4, 'PAYMENT_FAILED', 149, 'insufficient_funds', 1, true, m4 + 8, 8),
    ('pay-022', biz_id, 'cust-016', 'sub-016', m6, 'PAYMENT_FAILED', 149, 'insufficient_funds', 1, false, NULL, NULL),
    -- Churned from payment failure
    ('pay-030', biz_id, 'cust-031', 'sub-021', m4 - 5, 'PAYMENT_FAILED', 49, 'card_expired', 1, false, NULL, NULL),
    ('pay-031', biz_id, 'cust-031', 'sub-021', m4, 'DUNNING_SENT', 49, NULL, 2, false, NULL, NULL),
    ('pay-032', biz_id, 'cust-031', 'sub-021', m4 + 7, 'PAYMENT_FAILED', 49, 'card_expired', 3, false, NULL, NULL),
    ('pay-033', biz_id, 'cust-032', 'sub-022', m5 - 5, 'PAYMENT_FAILED', 49, 'generic_decline', 1, false, NULL, NULL),
    ('pay-034', biz_id, 'cust-032', 'sub-022', m5, 'PAYMENT_FAILED', 49, 'generic_decline', 2, false, NULL, NULL),
    ('pay-035', biz_id, 'cust-033', 'sub-022', m5 + 5, 'PAYMENT_FAILED', 49, 'insufficient_funds', 1, false, NULL, NULL),
    ('pay-036', biz_id, 'cust-033', 'sub-022', m5 + 12, 'PAYMENT_FAILED', 49, 'insufficient_funds', 2, false, NULL, NULL),
    -- Card expiry events
    ('pay-040', biz_id, 'cust-019', 'sub-019', m6, 'CARD_EXPIRED', 0, 'card_expired', 0, false, NULL, NULL),
    ('pay-041', biz_id, 'cust-013', 'sub-013', m6 + 15, 'CARD_EXPIRED', 0, 'card_expired', 0, false, NULL, NULL);

  -- ========================================================================
  -- FEATURE USAGE (current month — shows adoption gaps)
  -- ========================================================================
  -- High-value customers using all features
  INSERT INTO saas_feature_usage (id, business_id, customer_id, month, feature_key, feature_name, usage_count, usage_limit, usage_pct, is_premium) VALUES
    ('fu-001', biz_id, 'cust-001', m6, 'dashboards', 'Custom Dashboards', 45, 100, 45, false),
    ('fu-002', biz_id, 'cust-001', m6, 'api_access', 'API Calls', 12500, 50000, 25, true),
    ('fu-003', biz_id, 'cust-001', m6, 'integrations', 'Active Integrations', 8, 20, 40, true),
    ('fu-004', biz_id, 'cust-001', m6, 'sso', 'Single Sign-On', 1, 1, 100, true),
    -- LEAK: Enterprise customer using barely any features
    ('fu-010', biz_id, 'cust-004', m6, 'dashboards', 'Custom Dashboards', 2, 100, 2, false),
    ('fu-011', biz_id, 'cust-004', m6, 'api_access', 'API Calls', 50, 50000, 0.1, true),
    ('fu-012', biz_id, 'cust-004', m6, 'integrations', 'Active Integrations', 0, 20, 0, true),
    ('fu-013', biz_id, 'cust-004', m6, 'sso', 'Single Sign-On', 0, 1, 0, true),
    ('fu-014', biz_id, 'cust-005', m6, 'dashboards', 'Custom Dashboards', 1, 100, 1, false),
    ('fu-015', biz_id, 'cust-005', m6, 'api_access', 'API Calls', 0, 50000, 0, true),
    -- LEAK: Starter customer using more than their plan allows (should upgrade)
    ('fu-020', biz_id, 'cust-042', m6, 'dashboards', 'Custom Dashboards', 18, 5, 360, false),
    ('fu-021', biz_id, 'cust-042', m6, 'basic_reports', 'Basic Reports', 85, 50, 170, false),
    ('fu-022', biz_id, 'cust-042', m6, 'api_access', 'API Calls', 0, 0, 0, true),
    -- Normal Growth usage
    ('fu-030', biz_id, 'cust-011', m6, 'dashboards', 'Custom Dashboards', 12, 25, 48, false),
    ('fu-031', biz_id, 'cust-011', m6, 'api_access', 'API Calls', 3200, 10000, 32, true),
    ('fu-032', biz_id, 'cust-011', m6, 'integrations', 'Active Integrations', 3, 5, 60, true),
    -- Low usage Growth (at-risk)
    ('fu-040', biz_id, 'cust-016', m6, 'dashboards', 'Custom Dashboards', 0, 25, 0, false),
    ('fu-041', biz_id, 'cust-016', m6, 'api_access', 'API Calls', 0, 10000, 0, true),
    ('fu-042', biz_id, 'cust-017', m6, 'dashboards', 'Custom Dashboards', 1, 25, 4, false),
    ('fu-043', biz_id, 'cust-017', m6, 'integrations', 'Active Integrations', 0, 5, 0, true);

  -- ========================================================================
  -- SUPPORT TICKETS
  -- ========================================================================
  INSERT INTO saas_support_tickets (id, business_id, customer_id, opened_date, resolved_date, category, priority, status, resolution_hours, satisfaction_score, escalated) VALUES
    ('tix-001', biz_id, 'cust-001', m5 + 5, m5 + 5, 'FEATURE_REQUEST', 'NORMAL', 'RESOLVED', 2, 5, false),
    ('tix-002', biz_id, 'cust-004', m4 + 10, m4 + 15, 'BUG', 'HIGH', 'RESOLVED', 120, 2, true),
    ('tix-003', biz_id, 'cust-004', m5 + 2, m5 + 8, 'GENERAL', 'NORMAL', 'RESOLVED', 144, 1, false),
    ('tix-004', biz_id, 'cust-004', m6 + 1, NULL, 'CANCELLATION', 'HIGH', 'OPEN', NULL, NULL, true),
    ('tix-005', biz_id, 'cust-010', m5 + 8, m5 + 14, 'BUG', 'HIGH', 'RESOLVED', 144, 2, true),
    ('tix-006', biz_id, 'cust-010', m6 + 3, NULL, 'CANCELLATION', 'HIGH', 'OPEN', NULL, NULL, false),
    ('tix-007', biz_id, 'cust-016', m3, m3 + 5, 'ONBOARDING', 'NORMAL', 'RESOLVED', 120, 2, false),
    ('tix-008', biz_id, 'cust-016', m4 + 5, m4 + 12, 'BUG', 'HIGH', 'RESOLVED', 168, 1, true),
    ('tix-009', biz_id, 'cust-016', m5 + 10, NULL, 'CANCELLATION', 'HIGH', 'OPEN', NULL, NULL, false),
    ('tix-010', biz_id, 'cust-008', m6 + 2, m6 + 2, 'FEATURE_REQUEST', 'LOW', 'RESOLVED', 4, 5, false),
    ('tix-011', biz_id, 'cust-011', m5 + 15, m5 + 15, 'BILLING', 'NORMAL', 'RESOLVED', 1, 5, false),
    ('tix-012', biz_id, 'cust-021', m4, m4 + 10, 'BILLING', 'HIGH', 'RESOLVED', 240, 1, true),
    ('tix-013', biz_id, 'cust-005', m5, m5 + 7, 'ONBOARDING', 'NORMAL', 'RESOLVED', 168, 3, false),
    ('tix-014', biz_id, 'cust-043', m6, NULL, 'ONBOARDING', 'NORMAL', 'OPEN', NULL, NULL, false),
    ('tix-015', biz_id, 'cust-017', m5 + 5, m5 + 12, 'BUG', 'HIGH', 'RESOLVED', 168, 2, true);

  -- ========================================================================
  -- CHANNELS (6 months × 8 channels)
  -- ========================================================================
  INSERT INTO saas_channels (id, business_id, channel_name, channel_type, month, spend, impressions, clicks, signups, trials, conversions, revenue_attributed, cac) VALUES
    -- Google Ads (LEAK: high spend, low conversion)
    ('ch-g-1', biz_id, 'Google Ads', 'PAID', m1, 8500, 125000, 3200, 45, 18, 3, 1350, 2833),
    ('ch-g-2', biz_id, 'Google Ads', 'PAID', m2, 9200, 130000, 3400, 50, 20, 2, 900, 4600),
    ('ch-g-3', biz_id, 'Google Ads', 'PAID', m3, 8800, 128000, 3100, 42, 16, 3, 1500, 2933),
    ('ch-g-4', biz_id, 'Google Ads', 'PAID', m4, 9500, 135000, 3600, 48, 19, 2, 1000, 4750),
    ('ch-g-5', biz_id, 'Google Ads', 'PAID', m5, 9000, 132000, 3300, 46, 17, 3, 1200, 3000),
    ('ch-g-6', biz_id, 'Google Ads', 'PAID', m6, 9800, 140000, 3700, 52, 21, 2, 800, 4900),
    -- Organic / SEO (best ROI)
    ('ch-o-1', biz_id, 'Organic/SEO', 'ORGANIC', m1, 2500, 85000, 4200, 65, 28, 8, 4800, 313),
    ('ch-o-2', biz_id, 'Organic/SEO', 'ORGANIC', m2, 2500, 90000, 4500, 70, 30, 9, 5400, 278),
    ('ch-o-3', biz_id, 'Organic/SEO', 'ORGANIC', m3, 2500, 92000, 4600, 72, 32, 10, 6000, 250),
    ('ch-o-4', biz_id, 'Organic/SEO', 'ORGANIC', m4, 2500, 95000, 4800, 75, 33, 8, 5200, 313),
    ('ch-o-5', biz_id, 'Organic/SEO', 'ORGANIC', m5, 2500, 98000, 5000, 78, 35, 11, 6600, 227),
    ('ch-o-6', biz_id, 'Organic/SEO', 'ORGANIC', m6, 2500, 100000, 5100, 80, 36, 9, 5800, 278),
    -- LinkedIn Ads (high CAC)
    ('ch-l-1', biz_id, 'LinkedIn Ads', 'PAID', m1, 6000, 45000, 900, 15, 6, 1, 800, 6000),
    ('ch-l-2', biz_id, 'LinkedIn Ads', 'PAID', m2, 6500, 48000, 950, 16, 7, 1, 1200, 6500),
    ('ch-l-3', biz_id, 'LinkedIn Ads', 'PAID', m3, 5800, 42000, 850, 14, 5, 1, 600, 5800),
    ('ch-l-4', biz_id, 'LinkedIn Ads', 'PAID', m4, 6200, 46000, 920, 15, 6, 2, 2400, 3100),
    ('ch-l-5', biz_id, 'LinkedIn Ads', 'PAID', m5, 6000, 44000, 880, 14, 5, 1, 900, 6000),
    ('ch-l-6', biz_id, 'LinkedIn Ads', 'PAID', m6, 6500, 47000, 940, 16, 7, 1, 1000, 6500),
    -- Content Marketing
    ('ch-c-1', biz_id, 'Content Marketing', 'ORGANIC', m1, 3000, 60000, 2800, 35, 14, 4, 2400, 750),
    ('ch-c-2', biz_id, 'Content Marketing', 'ORGANIC', m2, 3000, 62000, 2900, 38, 15, 5, 3000, 600),
    ('ch-c-3', biz_id, 'Content Marketing', 'ORGANIC', m3, 3000, 65000, 3100, 40, 16, 4, 2800, 750),
    ('ch-c-4', biz_id, 'Content Marketing', 'ORGANIC', m4, 3000, 68000, 3200, 42, 17, 5, 3200, 600),
    ('ch-c-5', biz_id, 'Content Marketing', 'ORGANIC', m5, 3000, 70000, 3400, 44, 18, 6, 3600, 500),
    ('ch-c-6', biz_id, 'Content Marketing', 'ORGANIC', m6, 3000, 72000, 3500, 45, 19, 5, 3400, 600),
    -- Referral (free, great conversion)
    ('ch-r-1', biz_id, 'Referral Program', 'REFERRAL', m1, 500, 0, 0, 8, 6, 3, 2400, 167),
    ('ch-r-2', biz_id, 'Referral Program', 'REFERRAL', m2, 500, 0, 0, 10, 7, 4, 3200, 125),
    ('ch-r-3', biz_id, 'Referral Program', 'REFERRAL', m3, 500, 0, 0, 7, 5, 3, 2100, 167),
    ('ch-r-4', biz_id, 'Referral Program', 'REFERRAL', m4, 500, 0, 0, 9, 7, 3, 2700, 167),
    ('ch-r-5', biz_id, 'Referral Program', 'REFERRAL', m5, 500, 0, 0, 11, 8, 5, 4000, 100),
    ('ch-r-6', biz_id, 'Referral Program', 'REFERRAL', m6, 500, 0, 0, 8, 6, 3, 2400, 167),
    -- Facebook Ads (LEAK: worst ROI)
    ('ch-f-1', biz_id, 'Facebook Ads', 'PAID', m1, 4000, 180000, 2800, 22, 8, 1, 450, 4000),
    ('ch-f-2', biz_id, 'Facebook Ads', 'PAID', m2, 4200, 190000, 3000, 25, 9, 1, 500, 4200),
    ('ch-f-3', biz_id, 'Facebook Ads', 'PAID', m3, 4500, 200000, 3200, 28, 10, 2, 800, 2250),
    ('ch-f-4', biz_id, 'Facebook Ads', 'PAID', m4, 4000, 185000, 2900, 23, 8, 1, 350, 4000),
    ('ch-f-5', biz_id, 'Facebook Ads', 'PAID', m5, 4300, 195000, 3100, 26, 9, 1, 400, 4300),
    ('ch-f-6', biz_id, 'Facebook Ads', 'PAID', m6, 4500, 200000, 3200, 28, 10, 1, 500, 4500);

  -- ========================================================================
  -- LEADS (pipeline, using generate_series for bulk)
  -- ========================================================================
  -- Won leads
  INSERT INTO saas_leads (id, business_id, source, lead_date, company_name, lead_type, lead_score, demo_scheduled, demo_completed, trial_started, converted, converted_date, days_to_convert, deal_value)
  SELECT 'ld-w-' || gs, biz_id,
    CASE WHEN gs % 5 = 0 THEN 'ORGANIC' WHEN gs % 5 = 1 THEN 'GOOGLE_ADS' WHEN gs % 5 = 2 THEN 'CONTENT' WHEN gs % 5 = 3 THEN 'REFERRAL' ELSE 'OUTBOUND' END,
    (CURRENT_DATE - (gs * 8))::date, 'Won Lead Co ' || gs, 'WON', 70 + (gs % 30),
    true, true, true, true, (CURRENT_DATE - (gs * 8) + 25)::date, 20 + (gs % 20),
    CASE WHEN gs % 4 = 0 THEN 799 WHEN gs % 4 = 1 THEN 349 WHEN gs % 4 = 2 THEN 149 ELSE 49 END
  FROM generate_series(1, 30) gs;

  -- Lost leads (LEAK: low demo-to-close)
  INSERT INTO saas_leads (id, business_id, source, lead_date, company_name, lead_type, lead_score, demo_scheduled, demo_completed, trial_started, converted, lost_reason)
  SELECT 'ld-l-' || gs, biz_id,
    CASE WHEN gs % 4 = 0 THEN 'GOOGLE_ADS' WHEN gs % 4 = 1 THEN 'LINKEDIN_ADS' WHEN gs % 4 = 2 THEN 'FACEBOOK_ADS' ELSE 'OUTBOUND' END,
    (CURRENT_DATE - (gs * 5))::date, 'Lost Lead Co ' || gs, 'LOST', 30 + (gs % 40),
    gs % 3 = 0, gs % 5 = 0, gs % 4 = 0, false,
    CASE WHEN gs % 4 = 0 THEN 'NO_BUDGET' WHEN gs % 4 = 1 THEN 'COMPETITOR' WHEN gs % 4 = 2 THEN 'NO_RESPONSE' ELSE 'TIMING' END
  FROM generate_series(1, 85) gs;

  -- Active pipeline
  INSERT INTO saas_leads (id, business_id, source, lead_date, company_name, lead_type, lead_score, demo_scheduled, demo_completed, trial_started, converted)
  SELECT 'ld-a-' || gs, biz_id,
    CASE WHEN gs % 3 = 0 THEN 'ORGANIC' WHEN gs % 3 = 1 THEN 'CONTENT' ELSE 'OUTBOUND' END,
    (CURRENT_DATE - (gs * 3))::date, 'Pipeline Co ' || gs,
    CASE WHEN gs % 3 = 0 THEN 'SQL' WHEN gs % 3 = 1 THEN 'MQL' ELSE 'OPPORTUNITY' END,
    40 + (gs % 50), gs % 2 = 0, gs % 4 = 0, gs % 3 = 0, false
  FROM generate_series(1, 40) gs;

  -- ========================================================================
  -- EXPENSES (6 months)
  -- ========================================================================
  INSERT INTO saas_expenses (id, business_id, month, category, subcategory, amount, headcount, notes) VALUES
    -- Hosting / Infrastructure (LEAK: high % of revenue)
    ('exp-h-1', biz_id, m1, 'HOSTING', 'AWS', 18500, NULL, 'Compute + Storage'),
    ('exp-h-2', biz_id, m2, 'HOSTING', 'AWS', 19200, NULL, 'Compute + Storage'),
    ('exp-h-3', biz_id, m3, 'HOSTING', 'AWS', 20100, NULL, 'Spike from migration'),
    ('exp-h-4', biz_id, m4, 'HOSTING', 'AWS', 19800, NULL, 'Compute + Storage'),
    ('exp-h-5', biz_id, m5, 'HOSTING', 'AWS', 21000, NULL, 'Added AI features'),
    ('exp-h-6', biz_id, m6, 'HOSTING', 'AWS', 22500, NULL, 'Scaling costs'),
    -- Salaries
    ('exp-s-1', biz_id, m1, 'SALARIES', 'Engineering', 85000, 8, '8 engineers'),
    ('exp-s-2', biz_id, m2, 'SALARIES', 'Engineering', 85000, 8, NULL),
    ('exp-s-3', biz_id, m3, 'SALARIES', 'Engineering', 92000, 9, 'Hired 1'),
    ('exp-s-4', biz_id, m4, 'SALARIES', 'Engineering', 92000, 9, NULL),
    ('exp-s-5', biz_id, m5, 'SALARIES', 'Engineering', 92000, 9, NULL),
    ('exp-s-6', biz_id, m6, 'SALARIES', 'Engineering', 92000, 9, NULL),
    ('exp-ss-1', biz_id, m1, 'SALARIES', 'Sales', 35000, 3, '3 AEs'),
    ('exp-ss-2', biz_id, m2, 'SALARIES', 'Sales', 35000, 3, NULL),
    ('exp-ss-3', biz_id, m3, 'SALARIES', 'Sales', 42000, 4, 'Hired 1 SDR'),
    ('exp-ss-4', biz_id, m4, 'SALARIES', 'Sales', 42000, 4, NULL),
    ('exp-ss-5', biz_id, m5, 'SALARIES', 'Sales', 42000, 4, NULL),
    ('exp-ss-6', biz_id, m6, 'SALARIES', 'Sales', 42000, 4, NULL),
    ('exp-sc-1', biz_id, m1, 'SALARIES', 'Customer Success', 18000, 2, '2 CSMs'),
    ('exp-sc-2', biz_id, m2, 'SALARIES', 'Customer Success', 18000, 2, NULL),
    ('exp-sc-3', biz_id, m3, 'SALARIES', 'Customer Success', 18000, 2, NULL),
    ('exp-sc-4', biz_id, m4, 'SALARIES', 'Customer Success', 18000, 2, NULL),
    ('exp-sc-5', biz_id, m5, 'SALARIES', 'Customer Success', 18000, 2, NULL),
    ('exp-sc-6', biz_id, m6, 'SALARIES', 'Customer Success', 18000, 2, NULL),
    ('exp-sg-1', biz_id, m1, 'SALARIES', 'General & Admin', 22000, 2, 'CEO + Ops'),
    ('exp-sg-2', biz_id, m2, 'SALARIES', 'General & Admin', 22000, 2, NULL),
    ('exp-sg-3', biz_id, m3, 'SALARIES', 'General & Admin', 22000, 2, NULL),
    ('exp-sg-4', biz_id, m4, 'SALARIES', 'General & Admin', 22000, 2, NULL),
    ('exp-sg-5', biz_id, m5, 'SALARIES', 'General & Admin', 22000, 2, NULL),
    ('exp-sg-6', biz_id, m6, 'SALARIES', 'General & Admin', 22000, 2, NULL),
    -- S&M non-salary
    ('exp-m-1', biz_id, m1, 'SALES_MARKETING', 'Ad Spend + Tools', 24500, NULL, 'Total channel spend'),
    ('exp-m-2', biz_id, m2, 'SALES_MARKETING', 'Ad Spend + Tools', 25900, NULL, NULL),
    ('exp-m-3', biz_id, m3, 'SALES_MARKETING', 'Ad Spend + Tools', 25100, NULL, NULL),
    ('exp-m-4', biz_id, m4, 'SALES_MARKETING', 'Ad Spend + Tools', 25700, NULL, NULL),
    ('exp-m-5', biz_id, m5, 'SALES_MARKETING', 'Ad Spend + Tools', 25300, NULL, NULL),
    ('exp-m-6', biz_id, m6, 'SALES_MARKETING', 'Ad Spend + Tools', 26800, NULL, NULL),
    -- G&A
    ('exp-ga-1', biz_id, m1, 'G_AND_A', 'Office + Legal + Insurance', 8000, NULL, NULL),
    ('exp-ga-2', biz_id, m2, 'G_AND_A', 'Office + Legal + Insurance', 8000, NULL, NULL),
    ('exp-ga-3', biz_id, m3, 'G_AND_A', 'Office + Legal + Insurance', 8500, NULL, NULL),
    ('exp-ga-4', biz_id, m4, 'G_AND_A', 'Office + Legal + Insurance', 8000, NULL, NULL),
    ('exp-ga-5', biz_id, m5, 'G_AND_A', 'Office + Legal + Insurance', 8000, NULL, NULL),
    ('exp-ga-6', biz_id, m6, 'G_AND_A', 'Office + Legal + Insurance', 8500, NULL, NULL);

  RAISE NOTICE 'SaaS demo data loaded for business %', biz_id;
END $$;

-- Verify
SELECT 'plans' as tbl, COUNT(*) FROM saas_plans
UNION ALL SELECT 'customers', COUNT(*) FROM saas_customers
UNION ALL SELECT 'subscriptions', COUNT(*) FROM saas_subscriptions
UNION ALL SELECT 'mrr_movements', COUNT(*) FROM saas_mrr_movements
UNION ALL SELECT 'payment_events', COUNT(*) FROM saas_payment_events
UNION ALL SELECT 'feature_usage', COUNT(*) FROM saas_feature_usage
UNION ALL SELECT 'support_tickets', COUNT(*) FROM saas_support_tickets
UNION ALL SELECT 'channels', COUNT(*) FROM saas_channels
UNION ALL SELECT 'leads', COUNT(*) FROM saas_leads
UNION ALL SELECT 'expenses', COUNT(*) FROM saas_expenses;
