-- ============================================================================
-- FIX: Add Missing Columns to Existing businesses Table
-- ============================================================================

-- Add owner_user_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'owner_user_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN owner_user_id UUID;
  END IF;
END $$;

-- Add industry_slug if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'industry_slug'
  ) THEN
    ALTER TABLE businesses ADD COLUMN industry_slug TEXT;
  END IF;
END $$;

-- Add province if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'province'
  ) THEN
    ALTER TABLE businesses ADD COLUMN province TEXT;
  END IF;
END $$;

-- Add city if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'city'
  ) THEN
    ALTER TABLE businesses ADD COLUMN city TEXT;
  END IF;
END $$;

-- Add size_tier if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'size_tier'
  ) THEN
    ALTER TABLE businesses ADD COLUMN size_tier TEXT DEFAULT 'solo';
  END IF;
END $$;

-- Add name if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'name'
  ) THEN
    ALTER TABLE businesses ADD COLUMN name TEXT;
  END IF;
END $$;

-- Add legal_name if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'legal_name'
  ) THEN
    ALTER TABLE businesses ADD COLUMN legal_name TEXT;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry_slug);
CREATE INDEX IF NOT EXISTS idx_businesses_province ON businesses(province);

SELECT 'Businesses table updated successfully!' as result;
