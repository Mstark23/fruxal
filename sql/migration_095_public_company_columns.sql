-- migration 095: Add public company columns to business_profiles
-- Required by: app/api/v2/diagnostic/public-company/route.ts
-- Run in: Supabase SQL editor

ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS ticker_symbol    TEXT,
  ADD COLUMN IF NOT EXISTS is_public_company BOOLEAN DEFAULT FALSE;

-- Index for looking up by ticker
CREATE INDEX IF NOT EXISTS idx_business_profiles_ticker_symbol
  ON business_profiles (ticker_symbol)
  WHERE ticker_symbol IS NOT NULL;

-- Index for filtering public companies
CREATE INDEX IF NOT EXISTS idx_business_profiles_is_public
  ON business_profiles (is_public_company)
  WHERE is_public_company = TRUE;
