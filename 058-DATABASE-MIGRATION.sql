-- ============================================================================
-- LEAK & GROW: PRESCAN SYSTEM TABLES
-- File: 058-DATABASE-MIGRATION.sql
-- Run in: Supabase SQL Editor → New Query → Run All
-- ============================================================================

-- 1. LEAK TYPES — master catalog of all detectable leaks
-- ============================================================================
CREATE TABLE IF NOT EXISTS leak_types (
  id            TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  name_fr       TEXT,
  description   TEXT,
  category      TEXT NOT NULL,
  industry_slug TEXT,
  severity      TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  avg_impact_pct DECIMAL(5,2),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDUSTRY BENCHMARKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id               TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  industry_slug    TEXT NOT NULL,
  metric_key       TEXT NOT NULL,
  metric_name      TEXT NOT NULL,
  metric_name_fr   TEXT,
  avg_value        DECIMAL(12,4),
  top_performer    DECIMAL(12,4),
  unit             TEXT,
  lower_is_better  BOOLEAN DEFAULT false,
  source           TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (industry_slug, metric_key)
);

-- 3. PRESCAN RUNS — one record per prescan session
-- ============================================================================
CREATE TABLE IF NOT EXISTS prescan_runs (
  id                  TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  temp_user_id        TEXT,
  user_id             TEXT REFERENCES users(id) ON DELETE SET NULL,
  business_id         TEXT REFERENCES businesses(id) ON DELETE SET NULL,
  business_name       TEXT,
  industry_slug       TEXT,
  industry_label      TEXT,
  industry_label_fr   TEXT,
  annual_revenue      DECIMAL(15,2),
  employee_count      INTEGER,
  tier                TEXT CHECK (tier IN ('solo','small','growth')),
  language            TEXT DEFAULT 'en' CHECK (language IN ('en','fr')),
  country             TEXT DEFAULT 'CA',
  province            TEXT,
  raw_answers         JSONB DEFAULT '{}',
  extracted_tags      JSONB DEFAULT '{}',
  conversation_log    JSONB DEFAULT '[]',
  total_leaks_found   INTEGER DEFAULT 0,
  estimated_loss_min  DECIMAL(15,2),
  estimated_loss_max  DECIMAL(15,2),
  health_score        INTEGER,
  scan_status         TEXT DEFAULT 'pending'
                        CHECK (scan_status IN ('pending','processing','complete','failed')),
  prescan_version     TEXT DEFAULT 'v2',
  source              TEXT,
  utm_source          TEXT,
  utm_campaign        TEXT,
  converted_to_paid   BOOLEAN DEFAULT false,
  converted_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescan_runs_temp_user    ON prescan_runs(temp_user_id);
CREATE INDEX IF NOT EXISTS idx_prescan_runs_user_id      ON prescan_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_prescan_runs_industry     ON prescan_runs(industry_slug);
CREATE INDEX IF NOT EXISTS idx_prescan_runs_created      ON prescan_runs(created_at DESC);

-- 4. DETECTED LEAKS — individual leaks found during a prescan
-- ============================================================================
CREATE TABLE IF NOT EXISTS detected_leaks (
  id                TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  prescan_run_id    TEXT NOT NULL REFERENCES prescan_runs(id) ON DELETE CASCADE,
  leak_type_code    TEXT,
  category          TEXT NOT NULL,
  title             TEXT NOT NULL,
  title_fr          TEXT,
  description       TEXT,
  description_fr    TEXT,
  severity          TEXT NOT NULL DEFAULT 'MEDIUM'
                      CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  annual_impact_min DECIMAL(15,2),
  annual_impact_max DECIMAL(15,2),
  impact_pct        DECIMAL(5,2),
  evidence          JSONB DEFAULT '{}',
  quick_fix         TEXT,
  quick_fix_fr      TEXT,
  full_fix          TEXT,
  affiliate_ids     JSONB DEFAULT '[]',
  is_free_preview   BOOLEAN DEFAULT false,
  display_order     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detected_leaks_run   ON detected_leaks(prescan_run_id);
CREATE INDEX IF NOT EXISTS idx_detected_leaks_sev   ON detected_leaks(severity);

-- ============================================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prescan_runs_updated_at ON prescan_runs;
CREATE TRIGGER trg_prescan_runs_updated_at
  BEFORE UPDATE ON prescan_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_leak_types_updated_at ON leak_types;
CREATE TRIGGER trg_leak_types_updated_at
  BEFORE UPDATE ON leak_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED: Core leak types
-- ============================================================================
INSERT INTO leak_types (code, name, name_fr, category, severity, avg_impact_pct) VALUES
  ('UNBILLED_TIME',        'Unbilled Time / Work Done Without Invoice',    'Temps non facturé',               'BILLING',    'HIGH',     4.5),
  ('PRICING_BELOW_MARKET', 'Pricing Below Market Rate',                    'Tarification sous le marché',     'PRICING',    'HIGH',     6.0),
  ('HIGH_CHURN',           'High Client / Customer Churn',                 'Taux de perte clients élevé',     'RETENTION',  'CRITICAL', 8.0),
  ('LATE_PAYMENT',         'Slow Collections / Late Payments',             'Paiements en retard',             'CASH_FLOW',  'MEDIUM',   2.5),
  ('SCOPE_CREEP',          'Scope Creep — Work Beyond Contract',           'Dépassement de portée',           'BILLING',    'HIGH',     3.5),
  ('UNUSED_SUBSCRIPTIONS', 'Paying for Unused Software / Subscriptions',   'Abonnements non utilisés',        'EXPENSES',   'LOW',      1.5),
  ('POOR_LEAD_CONVERSION', 'Poor Lead-to-Sale Conversion',                 'Mauvaise conversion des leads',   'GROWTH',     'HIGH',     5.0),
  ('OPERATIONAL_WASTE',    'Operational Inefficiency / Process Waste',     'Inefficacité opérationnelle',     'OPERATIONS', 'MEDIUM',   3.0),
  ('MANUAL_PROCESSES',     'Manual Processes That Should Be Automated',    'Processus manuels automatisables','OPERATIONS', 'MEDIUM',   2.0),
  ('CONCENTRATION_RISK',   'Revenue Concentration in Too Few Clients',     'Concentration des revenus',       'RISK',       'HIGH',     0.0),
  ('MISSED_UPSELLS',       'Missed Upsell / Cross-sell Opportunities',     'Opportunités de vente manquées',  'GROWTH',     'MEDIUM',   4.0),
  ('NO_RECURRING_REVENUE', 'No or Low Recurring Revenue Model',            'Peu de revenus récurrents',       'GROWTH',     'HIGH',     7.0),
  ('CASH_FLOW_GAP',        'Cash Flow Gaps Between Invoicing and Payment', 'Écarts de trésorerie',            'CASH_FLOW',  'MEDIUM',   2.0),
  ('EMPLOYEE_TURNOVER',    'High Employee Turnover Cost',                  'Coût de roulement du personnel',  'HR',         'HIGH',     3.5),
  ('UNTAPPED_GRANTS',      'Unclaimed Government Grants / Tax Credits',    'Subventions gouvernementales',    'FUNDING',    'HIGH',     0.0)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- VERIFY — you should see 4 tables and 15 leak_types rows
-- ============================================================================
SELECT 
  'prescan_runs'        AS tbl, COUNT(*) AS rows FROM prescan_runs      UNION ALL
SELECT 'detected_leaks',          COUNT(*) FROM detected_leaks          UNION ALL
SELECT 'leak_types',              COUNT(*) FROM leak_types              UNION ALL
SELECT 'industry_benchmarks',     COUNT(*) FROM industry_benchmarks;
