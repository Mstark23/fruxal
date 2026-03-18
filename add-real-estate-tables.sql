-- ============================================================================
-- REAL ESTATE INDUSTRY ENGINE — DATABASE TABLES
-- Covers: Brokerages, Property Management, Agent Teams
-- Run in Supabase SQL Editor
-- ============================================================================

-- 1. LISTINGS — Every property listed by the brokerage/team
CREATE TABLE IF NOT EXISTS re_listings (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  agent_id TEXT,                          -- which agent listed it
  mls_number TEXT,
  property_address TEXT NOT NULL,
  property_type TEXT DEFAULT 'RESIDENTIAL', -- RESIDENTIAL, COMMERCIAL, LAND, MULTI_FAMILY
  list_price NUMERIC(14,2) NOT NULL,
  sale_price NUMERIC(14,2),
  listing_date DATE NOT NULL,
  contract_date DATE,                     -- when it went under contract
  closing_date DATE,
  days_on_market INTEGER,
  status TEXT DEFAULT 'ACTIVE',           -- ACTIVE, PENDING, SOLD, EXPIRED, WITHDRAWN, CANCELLED
  listing_side TEXT DEFAULT 'SELLER',     -- SELLER, BUYER, DUAL
  commission_rate NUMERIC(5,3),           -- e.g. 2.750 for 2.75%
  commission_earned NUMERIC(12,2),
  commission_paid_to_agent NUMERIC(12,2),
  brokerage_split NUMERIC(5,2),           -- % kept by brokerage
  referral_fee_paid NUMERIC(12,2) DEFAULT 0,
  marketing_spend NUMERIC(10,2) DEFAULT 0,
  lead_source TEXT,                        -- REFERRAL, PORTAL, SIGN_CALL, OPEN_HOUSE, SOI, COLD
  expired_reason TEXT,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- 2. AGENTS — Agent roster with production & comp details
CREATE TABLE IF NOT EXISTS re_agents (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  license_number TEXT,
  license_expiry DATE,
  hire_date DATE,
  status TEXT DEFAULT 'ACTIVE',           -- ACTIVE, INACTIVE, TERMINATED
  commission_split NUMERIC(5,2),          -- agent's split % (e.g. 70.00)
  cap_amount NUMERIC(10,2),              -- annual cap before 100% (if applicable)
  cap_progress NUMERIC(10,2) DEFAULT 0,  -- how much toward cap this year
  desk_fee NUMERIC(8,2) DEFAULT 0,       -- monthly desk fee if flat model
  team_name TEXT,
  specialization TEXT,                    -- RESIDENTIAL, COMMERCIAL, LUXURY, FIRST_TIME
  ytd_volume NUMERIC(14,2) DEFAULT 0,
  ytd_transactions INTEGER DEFAULT 0,
  ytd_gci NUMERIC(12,2) DEFAULT 0,       -- gross commission income
  prior_year_volume NUMERIC(14,2) DEFAULT 0,
  prior_year_transactions INTEGER DEFAULT 0,
  monthly_expenses NUMERIC(10,2) DEFAULT 0, -- MLS, E&O, marketing, etc.
  sphere_size INTEGER DEFAULT 0,          -- # contacts in SOI database
  lead_response_time_min INTEGER,         -- avg minutes to respond to leads
  client_satisfaction_score NUMERIC(3,1), -- 1-5 rating
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- 3. TRANSACTIONS — Closed deals with full financial breakdown
CREATE TABLE IF NOT EXISTS re_transactions (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  listing_id TEXT REFERENCES re_listings(id) ON DELETE SET NULL,
  agent_id TEXT REFERENCES re_agents(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  sale_price NUMERIC(14,2) NOT NULL,
  property_address TEXT,
  transaction_type TEXT DEFAULT 'SALE',   -- SALE, LEASE, REFERRAL
  side TEXT DEFAULT 'SELLER',             -- SELLER, BUYER, DUAL
  gross_commission NUMERIC(12,2) NOT NULL,
  commission_rate NUMERIC(5,3),
  agent_split_pct NUMERIC(5,2),
  agent_payout NUMERIC(12,2),
  brokerage_revenue NUMERIC(12,2),
  referral_fee NUMERIC(12,2) DEFAULT 0,
  franchise_fee NUMERIC(12,2) DEFAULT 0,  -- if part of franchise (KW, RE/MAX, etc.)
  e_and_o_fee NUMERIC(8,2) DEFAULT 0,
  transaction_fee NUMERIC(8,2) DEFAULT 0, -- flat per-transaction fee
  marketing_cost NUMERIC(10,2) DEFAULT 0,
  days_to_close INTEGER,
  fell_through BOOLEAN DEFAULT false,
  fall_through_reason TEXT,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- 4. LEADS — Lead tracking & conversion pipeline
CREATE TABLE IF NOT EXISTS re_leads (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES re_agents(id) ON DELETE SET NULL,
  lead_name TEXT,
  lead_source TEXT NOT NULL,              -- ZILLOW, REALTOR_COM, REFERRAL, SIGN_CALL, OPEN_HOUSE, SOI, WEBSITE, COLD
  lead_type TEXT DEFAULT 'BUYER',         -- BUYER, SELLER, BOTH, INVESTOR
  lead_date DATE NOT NULL,
  first_response_date TIMESTAMP(3),
  first_response_minutes INTEGER,
  status TEXT DEFAULT 'NEW',              -- NEW, CONTACTED, QUALIFIED, SHOWING, OFFER, CONTRACT, CLOSED, LOST
  monthly_cost NUMERIC(8,2) DEFAULT 0,    -- cost of lead (portal fee, ad spend)
  converted BOOLEAN DEFAULT false,
  conversion_date DATE,
  lost_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- 5. RENTAL PROPERTIES — Property management portfolio
CREATE TABLE IF NOT EXISTS re_rental_properties (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  property_type TEXT DEFAULT 'SFR',       -- SFR, MULTI_FAMILY, CONDO, TOWNHOUSE, COMMERCIAL
  unit_count INTEGER DEFAULT 1,
  owner_name TEXT,
  management_fee_pct NUMERIC(5,2),        -- % of collected rent
  management_fee_flat NUMERIC(8,2),       -- or flat monthly fee
  leasing_fee NUMERIC(10,2),              -- one-time tenant placement fee
  monthly_rent NUMERIC(10,2),
  market_rent NUMERIC(10,2),              -- what it SHOULD be renting for
  current_occupancy TEXT DEFAULT 'OCCUPIED', -- OCCUPIED, VACANT, NOTICE_GIVEN
  lease_start DATE,
  lease_end DATE,
  tenant_name TEXT,
  last_rent_increase DATE,
  annual_maintenance_cost NUMERIC(10,2) DEFAULT 0,
  annual_insurance NUMERIC(10,2) DEFAULT 0,
  annual_property_tax NUMERIC(10,2) DEFAULT 0,
  last_inspection_date DATE,
  vacancy_days_ytd INTEGER DEFAULT 0,
  turnover_cost_last NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- 6. RENT ROLLS — Monthly rent collection tracking
CREATE TABLE IF NOT EXISTS re_rent_rolls (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES re_rental_properties(id) ON DELETE CASCADE,
  month DATE NOT NULL,                    -- first of month
  rent_due NUMERIC(10,2) NOT NULL,
  rent_collected NUMERIC(10,2) DEFAULT 0,
  late_fee_due NUMERIC(8,2) DEFAULT 0,
  late_fee_collected NUMERIC(8,2) DEFAULT 0,
  days_late INTEGER DEFAULT 0,
  collection_status TEXT DEFAULT 'PENDING', -- PENDING, PAID, PARTIAL, DELINQUENT, WRITTEN_OFF
  notes TEXT,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- 7. MARKETING SPEND — Track ROI on lead generation
CREATE TABLE IF NOT EXISTS re_marketing_spend (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES re_agents(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,                  -- ZILLOW, REALTOR_COM, GOOGLE_ADS, FACEBOOK, INSTAGRAM, PRINT, DIRECT_MAIL, SIGN, OPEN_HOUSE
  month DATE NOT NULL,
  spend_amount NUMERIC(10,2) NOT NULL,
  leads_generated INTEGER DEFAULT 0,
  appointments_set INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- 8. COMMISSION DISPUTES & ADJUSTMENTS
CREATE TABLE IF NOT EXISTS re_commission_adjustments (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  transaction_id TEXT REFERENCES re_transactions(id) ON DELETE SET NULL,
  agent_id TEXT REFERENCES re_agents(id) ON DELETE SET NULL,
  adjustment_type TEXT NOT NULL,          -- CORRECTION, DISPUTE, REFERRAL_MISSED, SPLIT_ERROR, CAP_ERROR
  original_amount NUMERIC(12,2),
  corrected_amount NUMERIC(12,2),
  difference NUMERIC(12,2),
  reason TEXT,
  status TEXT DEFAULT 'OPEN',             -- OPEN, RESOLVED, DISPUTED
  created_at TIMESTAMP(3) DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_re_listings_business ON re_listings(business_id);
CREATE INDEX IF NOT EXISTS idx_re_listings_status ON re_listings(business_id, status);
CREATE INDEX IF NOT EXISTS idx_re_agents_business ON re_agents(business_id);
CREATE INDEX IF NOT EXISTS idx_re_transactions_business ON re_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_re_transactions_agent ON re_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_re_leads_business ON re_leads(business_id);
CREATE INDEX IF NOT EXISTS idx_re_leads_agent ON re_leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_re_rental_props_business ON re_rental_properties(business_id);
CREATE INDEX IF NOT EXISTS idx_re_rent_rolls_property ON re_rent_rolls(property_id);
CREATE INDEX IF NOT EXISTS idx_re_marketing_business ON re_marketing_spend(business_id);

SELECT 'Real Estate tables created successfully' as result;
