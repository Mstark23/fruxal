-- Session 4: Add recovery tracking columns to leaks table
-- Run this in Supabase SQL Editor

ALTER TABLE leaks ADD COLUMN IF NOT EXISTS "amountRecovered" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS "fixedAt" TIMESTAMP(3);
