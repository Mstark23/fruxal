-- =============================================================================
-- LEAK & GROW v2.0 — Migration for Existing Database
-- =============================================================================
-- IMPORTANT: Run this AFTER your existing Prisma tables are in place.
-- This migration:
--   1. ALTERs the existing "leaks" table to add new columns
--   2. Creates NEW tables for v2 features
--   3. Uses camelCase column names (in quotes) to match Prisma convention
-- =============================================================================


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: UPGRADE EXISTING LEAKS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
-- Existing leaks table (from Prisma) has:
--   id, "businessId", "clientId", type, severity, status, title, description,
--   "annualImpact", "amountRecovered", evidence, "detectedAt", "fixedAt", "resolvedAt"
--
-- We ADD new columns for the unified architecture:

ALTER TABLE leaks ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS yours TEXT;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS benchmark TEXT;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS trend TEXT DEFAULT 'new';
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS "fixAction" TEXT;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS "affiliateVertical" TEXT;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS "affiliatePartner" TEXT;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS owner TEXT;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS "dataSource" TEXT DEFAULT 'estimate';
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS confidence INTEGER DEFAULT 60;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS industry TEXT;

-- Backfill: set category from existing "type" column where missing
UPDATE leaks SET category = type WHERE category IS NULL;

-- Index the new columns
CREATE INDEX IF NOT EXISTS idx_leaks_category ON leaks(category);
CREATE INDEX IF NOT EXISTS idx_leaks_industry ON leaks(industry);
CREATE INDEX IF NOT EXISTS idx_leaks_owner ON leaks(owner);


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: SCAN SNAPSHOTS (for trending)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scan_snapshots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL,
  "scannedAt" TIMESTAMPTZ DEFAULT NOW(),
  "totalLeaks" INTEGER DEFAULT 0,
  "totalAmount" NUMERIC DEFAULT 0,
  "fixedAmount" NUMERIC DEFAULT 0,
  "healthScore" INTEGER DEFAULT 50,
  "leakSummary" JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_snapshots_business
    FOREIGN KEY ("businessId") REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_snapshots_business ON scan_snapshots("businessId");
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON scan_snapshots("scannedAt");


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: GAMIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gamification (
  "businessId" TEXT PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  "streakMonths" INTEGER DEFAULT 0,
  "lastCheckin" TIMESTAMPTZ,
  "lastAction" TEXT,
  "lastActionAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_gamification_business
    FOREIGN KEY ("businessId") REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS xp_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  metadata JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_xp_business
    FOREIGN KEY ("businessId") REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_xp_business ON xp_history("businessId");


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  cta TEXT,
  "ctaUrl" TEXT,
  channel TEXT DEFAULT 'email',
  "sentAt" TIMESTAMPTZ,
  "readAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_notifications_business
    FOREIGN KEY ("businessId") REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notif_business ON notifications("businessId");
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications("readAt");


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 5: AFFILIATE CLICKS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT,
  "userId" TEXT,
  "leakId" TEXT,
  vertical TEXT NOT NULL,
  partner TEXT NOT NULL,
  source TEXT DEFAULT 'business',
  "clickedAt" TIMESTAMPTZ DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  "convertedAt" TIMESTAMPTZ,
  commission NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_aff_clicks_vertical ON affiliate_clicks(vertical);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_partner ON affiliate_clicks(partner);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_source ON affiliate_clicks(source);


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 6: TEAM MEMBERS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  permissions TEXT DEFAULT 'member',
  "invitedAt" TIMESTAMPTZ DEFAULT NOW(),
  "joinedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_team_business
    FOREIGN KEY ("businessId") REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_team_business ON team_members("businessId");


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 7: PERSONAL SCANS (B2C free product)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS personal_scans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  email TEXT,
  "scanData" JSONB,
  "totalSavings" NUMERIC DEFAULT 0,
  "affiliateClicks" INTEGER DEFAULT 0,
  shared BOOLEAN DEFAULT FALSE,
  "referralCode" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_user ON personal_scans("userId");


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 8: REFERRALS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "referrerBusinessId" TEXT,
  "referrerUserId" TEXT,
  "referredEmail" TEXT,
  "referralCode" TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  "rewardAmount" NUMERIC DEFAULT 50,
  rewarded BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "convertedAt" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_code ON referrals("referralCode");
CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referrals("referrerBusinessId");


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 9: ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE scan_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Summary:
--   ALTERED: leaks (+11 columns)
--   CREATED: scan_snapshots, gamification, xp_history, notifications,
--            affiliate_clicks, team_members, personal_scans, referrals
--   All columns use "camelCase" in quotes to match Prisma convention
-- ═══════════════════════════════════════════════════════════════════════════════
