-- ============================================================================
-- MIGRATION: Add Region Support to Industry Solutions
-- Adds region column + classifies all 217 products by availability
-- Run in Supabase SQL Editor
-- ============================================================================

-- Step 1: Add regions column (array of country codes)
ALTER TABLE industry_solutions ADD COLUMN IF NOT EXISTS regions TEXT[] DEFAULT ARRAY['US','CA','UK','AU','GLOBAL'];

-- Step 2: Create region lookup index
CREATE INDEX IF NOT EXISTS idx_solutions_regions ON industry_solutions USING GIN(regions);

-- ============================================================================
-- Step 3: Classify products by region
-- Default is GLOBAL (works everywhere). We override specific ones.
-- ============================================================================

-- === US-ONLY Products ===
-- Gusto: US payroll only
UPDATE industry_solutions SET regions = ARRAY['US']
WHERE product_slug = 'gusto';

-- SBA Programs (US Small Business Administration)
UPDATE industry_solutions SET regions = ARRAY['US']
WHERE product_name ILIKE '%SBA%' OR product_name ILIKE '%Small Business Administration%';

-- HSA (Health Savings Account) — US only
UPDATE industry_solutions SET regions = ARRAY['US']
WHERE product_name ILIKE '%HSA%' OR description ILIKE '%health savings account%';

-- Section 179 / IRS specific
UPDATE industry_solutions SET regions = ARRAY['US']
WHERE product_name ILIKE '%Section 179%' OR product_name ILIKE '%IRS%'
   OR description ILIKE '%section 179%' OR description ILIKE '%IRS%';

-- USDA programs
UPDATE industry_solutions SET regions = ARRAY['US']
WHERE product_name ILIKE '%USDA%' OR description ILIKE '%USDA FSA%';

-- US-specific payroll
UPDATE industry_solutions SET regions = ARRAY['US']
WHERE product_slug IN ('adp-run', 'paychex') AND regions @> ARRAY['GLOBAL'];

-- Homebase (US-focused scheduling)
UPDATE industry_solutions SET regions = ARRAY['US','CA']
WHERE product_slug = 'homebase';

-- === CANADA-ONLY Products ===
-- SR&ED Tax Credits
UPDATE industry_solutions SET regions = ARRAY['CA']
WHERE product_name ILIKE '%SR&ED%' OR product_name ILIKE '%SR%ED%'
   OR description ILIKE '%SR&ED%';

-- CRA specific
UPDATE industry_solutions SET regions = ARRAY['CA']
WHERE product_name ILIKE '%CRA%' OR description ILIKE '%CRA %';

-- CanExport
UPDATE industry_solutions SET regions = ARRAY['CA']
WHERE product_slug = 'canexport' OR product_name ILIKE '%CanExport%';

-- Canadian AgriStability
UPDATE industry_solutions SET regions = ARRAY['CA']
WHERE description ILIKE '%AgriStability%' OR description ILIKE '%AgriInvest%';

-- === US + CANADA ===
-- Helcim (Canadian company, works in US+CA)
UPDATE industry_solutions SET regions = ARRAY['US','CA']
WHERE product_slug = 'helcim';

-- Stripe (global but primary US/CA/UK/AU/EU)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU','EU','GLOBAL']
WHERE product_slug = 'stripe';

-- QuickBooks Online (global)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU','GLOBAL']
WHERE product_slug = 'quickbooks';

-- Wave Accounting (Canadian company, global)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU','GLOBAL']
WHERE product_slug = 'wave-accounting';

-- FreshBooks (Canadian company, global)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU','GLOBAL']
WHERE product_slug = 'freshbooks';

-- Xero (AU/NZ origin, global)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU','NZ','GLOBAL']
WHERE product_slug = 'xero';

-- Shopify (Canadian, global)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU','EU','GLOBAL']
WHERE product_slug = 'shopify';

-- Square (US origin, now global)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU','GLOBAL']
WHERE product_slug = 'square';

-- Jobber (Canadian, US+CA)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU']
WHERE product_slug = 'jobber';

-- Wealthsimple (Canada only)
UPDATE industry_solutions SET regions = ARRAY['CA']
WHERE product_slug = 'wealthsimple';

-- === COMBINED US/CA Government ===
UPDATE industry_solutions SET regions = ARRAY['US','CA']
WHERE product_name ILIKE '%CanExport%STEP%' OR product_name ILIKE '%STEP%CanExport%';

-- Farm subsidies (multi-region)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU']
WHERE product_slug = 'farm-subsidy-diy';

-- R&D credits (multi-region)
UPDATE industry_solutions SET regions = ARRAY['US','CA','UK','AU']
WHERE product_slug = 'sred-agriculture';

-- === DIY Tips → Global (work everywhere) ===
UPDATE industry_solutions SET regions = ARRAY['GLOBAL']
WHERE product_type = 'FREE' AND product_slug LIKE 'diy-%' AND regions IS NULL;

-- Make sure all remaining products default to GLOBAL
UPDATE industry_solutions SET regions = ARRAY['GLOBAL']
WHERE regions IS NULL;


-- ============================================================================
-- Step 4: Add region to businesses table
-- ============================================================================
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'US';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- ============================================================================
-- Step 5: Verify
-- ============================================================================
SELECT 'US-only products' AS check_name, COUNT(DISTINCT product_slug) AS count 
FROM industry_solutions WHERE regions = ARRAY['US'];

SELECT 'CA-only products' AS check_name, COUNT(DISTINCT product_slug) AS count 
FROM industry_solutions WHERE regions = ARRAY['CA'];

SELECT 'Global products' AS check_name, COUNT(DISTINCT product_slug) AS count 
FROM industry_solutions WHERE 'GLOBAL' = ANY(regions);

SELECT 'Products with region set' AS check_name, COUNT(*) AS count 
FROM industry_solutions WHERE regions IS NOT NULL;
