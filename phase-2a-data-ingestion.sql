-- ============================================================================
-- LEAK & GROW: PHASE 2A — DATA INGESTION & FINANCIAL SNAPSHOTS
-- File: phase-2a-data-ingestion.sql
-- Run in: Supabase SQL Editor → New Query → Run All
-- ============================================================================

-- 1. DATA SOURCES — tracks what's connected (CSV, QuickBooks, Stripe, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_sources (
  id              TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id     TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  source_type     TEXT NOT NULL CHECK (source_type IN (
    'csv_upload', 'quickbooks', 'stripe', 'square', 'wave', 
    'plaid', 'desjardins', 'manual'
  )),
  source_name     TEXT,                    -- e.g. "Bank Statement Jan 2025"
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','error','disconnected','processing')),
  external_id     TEXT,                    -- external account ID for API integrations
  last_sync_at    TIMESTAMPTZ,
  total_rows      INTEGER DEFAULT 0,
  mapped_rows     INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}',      -- column mappings, file info, etc.
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_sources_business ON data_sources(business_id);

-- 2. TRANSACTION CATEGORIES — master list of expense/income categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS transaction_categories (
  id              TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,     -- e.g. 'rent', 'payroll', 'processing_fees'
  name            TEXT NOT NULL,
  name_fr         TEXT,
  parent_code     TEXT,                     -- for subcategories
  category_type   TEXT NOT NULL CHECK (category_type IN ('income','expense','transfer')),
  display_order   INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO transaction_categories (code, name, name_fr, category_type, display_order) VALUES
  -- Income
  ('revenue',             'Revenue / Sales',            'Revenus / Ventes',           'income',   1),
  ('other_income',        'Other Income',               'Autres revenus',             'income',   2),
  ('refund_received',     'Refunds Received',           'Remboursements reçus',       'income',   3),
  -- Expenses
  ('rent',                'Rent / Lease',               'Loyer',                      'expense',  10),
  ('chair_rent',          'Chair / Space Rent',         'Location de chaise',         'expense',  11),
  ('payroll',             'Payroll / Wages',            'Paie / Salaires',            'expense',  12),
  ('processing_fees',     'Payment Processing',         'Frais de traitement',        'expense',  13),
  ('insurance',           'Insurance',                  'Assurance',                  'expense',  14),
  ('utilities',           'Utilities',                  'Services publics',           'expense',  15),
  ('supplies',            'Supplies / Materials',       'Fournitures / Matériaux',    'expense',  16),
  ('tools_equipment',     'Tools & Equipment',          'Outils et équipement',       'expense',  17),
  ('software',            'Software / Subscriptions',   'Logiciels / Abonnements',    'expense',  18),
  ('marketing',           'Marketing / Advertising',    'Marketing / Publicité',      'expense',  19),
  ('fuel',                'Fuel / Vehicle',             'Carburant / Véhicule',       'expense',  20),
  ('food_cost',           'Food / COGS',                'Coût des aliments / CMD',    'expense',  21),
  ('professional_fees',   'Professional Fees',          'Frais professionnels',       'expense',  22),
  ('bank_fees',           'Bank Fees',                  'Frais bancaires',            'expense',  23),
  ('taxes',               'Taxes Paid',                 'Impôts payés',               'expense',  24),
  ('maintenance',         'Maintenance / Repairs',      'Entretien / Réparations',    'expense',  25),
  ('travel',              'Travel / Meals',             'Voyages / Repas',            'expense',  26),
  ('other_expense',       'Other Expense',              'Autres dépenses',            'expense',  99),
  -- Transfers
  ('transfer',            'Internal Transfer',          'Transfert interne',          'transfer', 50),
  ('owner_draw',          'Owner Draw / Distribution',  'Retrait du propriétaire',    'transfer', 51)
ON CONFLICT (code) DO NOTHING;

-- 3. RAW TRANSACTIONS — every imported row from CSV or API
-- ============================================================================
CREATE TABLE IF NOT EXISTS raw_transactions (
  id                TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id       TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  data_source_id    TEXT REFERENCES data_sources(id) ON DELETE SET NULL,
  
  -- Original data from CSV/API
  transaction_date  DATE NOT NULL,
  description       TEXT,
  amount            DECIMAL(15,2) NOT NULL,  -- positive = inflow, negative = outflow
  original_currency TEXT DEFAULT 'CAD',
  
  -- Categorization
  category_code     TEXT REFERENCES transaction_categories(code),
  auto_categorized  BOOLEAN DEFAULT false,    -- true = AI/rules assigned it
  user_confirmed    BOOLEAN DEFAULT false,    -- true = user verified category
  
  -- Dedup
  hash              TEXT,                     -- SHA256 of date+desc+amount for dedup
  is_duplicate      BOOLEAN DEFAULT false,
  
  -- Raw original columns (preserved)
  raw_data          JSONB DEFAULT '{}',       -- original CSV row as JSON
  
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_tx_business      ON raw_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_raw_tx_date          ON raw_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_raw_tx_category      ON raw_transactions(category_code);
CREATE INDEX IF NOT EXISTS idx_raw_tx_source        ON raw_transactions(data_source_id);
CREATE INDEX IF NOT EXISTS idx_raw_tx_hash          ON raw_transactions(hash);
CREATE INDEX IF NOT EXISTS idx_raw_tx_biz_date      ON raw_transactions(business_id, transaction_date);

-- 4. FINANCIAL SNAPSHOTS — monthly aggregated metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_snapshots (
  id                  TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  business_id         TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  snapshot_month      DATE NOT NULL,          -- first day of month, e.g. 2025-01-01
  
  -- Revenue
  revenue_total       DECIMAL(15,2) DEFAULT 0,
  transaction_count   INTEGER DEFAULT 0,
  
  -- Expenses
  expenses_total      DECIMAL(15,2) DEFAULT 0,
  
  -- Margins
  gross_margin        DECIMAL(8,4),           -- as decimal, e.g. 0.35 = 35%
  net_margin          DECIMAL(8,4),
  
  -- Scores
  fh_score            INTEGER,                -- Financial Health 0-100
  dh_score            INTEGER,                -- Data Health 0-100
  
  -- Meta
  source              TEXT DEFAULT 'computed' CHECK (source IN ('computed','prescan','manual')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (business_id, snapshot_month)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_business ON financial_snapshots(business_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_month    ON financial_snapshots(snapshot_month);

-- 5. SNAPSHOT COST BREAKDOWN — per-category totals for each monthly snapshot
-- ============================================================================
CREATE TABLE IF NOT EXISTS snapshot_cost_breakdown (
  id                TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  snapshot_id       TEXT NOT NULL REFERENCES financial_snapshots(id) ON DELETE CASCADE,
  category_code     TEXT NOT NULL REFERENCES transaction_categories(code),
  amount            DECIMAL(15,2) NOT NULL,
  pct_of_revenue    DECIMAL(8,4),            -- as decimal, e.g. 0.22 = 22%
  transaction_count INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_break_snapshot ON snapshot_cost_breakdown(snapshot_id);

-- 6. TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS trg_data_sources_updated_at ON data_sources;
CREATE TRIGGER trg_data_sources_updated_at
  BEFORE UPDATE ON data_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_snapshots_updated_at ON financial_snapshots;
CREATE TRIGGER trg_snapshots_updated_at
  BEFORE UPDATE ON financial_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- VERIFY
-- ============================================================================
SELECT 'data_sources'             AS tbl, COUNT(*) AS rows FROM data_sources           UNION ALL
SELECT 'transaction_categories',          COUNT(*) FROM transaction_categories          UNION ALL
SELECT 'raw_transactions',                COUNT(*) FROM raw_transactions                UNION ALL
SELECT 'financial_snapshots',             COUNT(*) FROM financial_snapshots             UNION ALL
SELECT 'snapshot_cost_breakdown',         COUNT(*) FROM snapshot_cost_breakdown;
