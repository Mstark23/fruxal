-- =============================================================================
-- Benchmark Data Flywheel
-- Run this in Supabase SQL Editor
-- =============================================================================

-- ── 1. Customer-contributed benchmark data (anonymized) ──────────────────────
CREATE TABLE IF NOT EXISTS benchmark_contributions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Context (no PII — just segmentation keys)
  industry_slug       text NOT NULL,
  province            text NOT NULL,
  revenue_band        text NOT NULL,  -- e.g. '0_150k', '150k_500k', '500k_1m', '1m_plus'
  tier                text NOT NULL,  -- solo | business | enterprise
  -- Metrics (anonymized values from diagnostic)
  metric_key          text NOT NULL,  -- gross_margin_pct | ebitda_margin_pct | payroll_ratio_pct |
                                      -- revenue_per_employee | effective_tax_rate_pct | ar_days
  metric_value        numeric NOT NULL,
  -- Source metadata (for data quality — never exposed to users)
  data_source         text,           -- 'verified_financials' | 'intake_exact' | 'estimated'
  data_confidence     text,           -- 'high' | 'medium' | 'low'
  diagnostic_report_id uuid REFERENCES diagnostic_reports(id) ON DELETE CASCADE,
  contributed_at      timestamptz DEFAULT now(),
  -- Ensure one row per metric per report
  UNIQUE (diagnostic_report_id, metric_key)
);

-- Index for fast aggregation queries
CREATE INDEX IF NOT EXISTS idx_bench_contrib_segment
  ON benchmark_contributions (industry_slug, province, revenue_band, metric_key);
CREATE INDEX IF NOT EXISTS idx_bench_contrib_time
  ON benchmark_contributions (contributed_at DESC);

-- ── 2. Aggregated benchmark results (recomputed nightly) ──────────────────────
CREATE TABLE IF NOT EXISTS benchmark_aggregates (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Segment keys
  industry_slug       text NOT NULL,
  province            text NOT NULL,     -- 'ALL' = national aggregate
  revenue_band        text NOT NULL,     -- 'ALL' = all sizes aggregate
  metric_key          text NOT NULL,
  metric_name         text NOT NULL,
  metric_name_fr      text,
  unit                text DEFAULT '%',
  -- Aggregated values (from customer data)
  fruxal_avg          numeric,
  fruxal_p25          numeric,
  fruxal_p50          numeric,
  fruxal_p75          numeric,           -- top quartile threshold
  fruxal_p90          numeric,
  sample_size         int DEFAULT 0,
  -- Fallback values (from manually seeded industry_benchmarks)
  fallback_avg        numeric,
  fallback_p75        numeric,
  -- Combined best-available values (what Claude and UI actually use)
  effective_avg       numeric GENERATED ALWAYS AS (
    COALESCE(CASE WHEN sample_size >= 10 THEN fruxal_avg ELSE NULL END, fallback_avg)
  ) STORED,
  effective_p75       numeric GENERATED ALWAYS AS (
    COALESCE(CASE WHEN sample_size >= 10 THEN fruxal_p75 ELSE NULL END, fallback_p75)
  ) STORED,
  -- Confidence level drives what Claude says and what UI shows
  confidence          text GENERATED ALWAYS AS (
    CASE
      WHEN sample_size >= 100 THEN 'high'
      WHEN sample_size >= 20  THEN 'medium'
      WHEN sample_size >= 5   THEN 'low'
      ELSE 'estimate'
    END
  ) STORED,
  lower_is_better     boolean DEFAULT false,
  last_computed       timestamptz DEFAULT now(),
  UNIQUE (industry_slug, province, revenue_band, metric_key)
);

-- ── 3. Nightly aggregation function ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION recompute_benchmark_aggregates()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  metric_names jsonb := '{
    "gross_margin_pct":        {"en": "Gross Margin", "fr": "Marge brute", "unit": "%", "lower": false},
    "ebitda_margin_pct":       {"en": "EBITDA Margin", "fr": "Marge BAIIA", "unit": "%", "lower": false},
    "payroll_ratio_pct":       {"en": "Payroll Ratio", "fr": "Ratio masse salariale", "unit": "%", "lower": true},
    "revenue_per_employee":    {"en": "Revenue per Employee", "fr": "Revenu par employé", "unit": "$", "lower": false},
    "effective_tax_rate_pct":  {"en": "Effective Tax Rate", "fr": "Taux d''imposition effectif", "unit": "%", "lower": true},
    "ar_days":                 {"en": "Days Sales Outstanding", "fr": "Délai de recouvrement", "unit": "days", "lower": true}
  }';
BEGIN
  -- Delete old aggregates and recompute from scratch
  DELETE FROM benchmark_aggregates;

  -- Insert province+industry specific aggregates
  INSERT INTO benchmark_aggregates (
    industry_slug, province, revenue_band, metric_key,
    metric_name, metric_name_fr, unit, lower_is_better,
    fruxal_avg, fruxal_p25, fruxal_p50, fruxal_p75, fruxal_p90,
    sample_size, fallback_avg, fallback_p75, last_computed
  )
  SELECT
    c.industry_slug,
    c.province,
    c.revenue_band,
    c.metric_key,
    (metric_names -> c.metric_key ->> 'en')::text,
    (metric_names -> c.metric_key ->> 'fr')::text,
    (metric_names -> c.metric_key ->> 'unit')::text,
    (metric_names -> c.metric_key -> 'lower')::boolean,
    ROUND(AVG(c.metric_value)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY c.metric_value)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY c.metric_value)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY c.metric_value)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY c.metric_value)::numeric, 2),
    COUNT(*)::int,
    -- Pull fallback from existing industry_benchmarks table
    (SELECT ib.avg_value FROM industry_benchmarks ib
     WHERE ib.industry_slug = c.industry_slug
       AND ib.metric_key = c.metric_key LIMIT 1),
    (SELECT ib.top_performer FROM industry_benchmarks ib
     WHERE ib.industry_slug = c.industry_slug
       AND ib.metric_key = c.metric_key LIMIT 1),
    now()
  FROM benchmark_contributions c
  WHERE c.data_confidence IN ('high', 'medium')
  GROUP BY c.industry_slug, c.province, c.revenue_band, c.metric_key
  HAVING COUNT(*) >= 1;

  -- Also insert national aggregates (province = 'ALL') for industries with enough data
  INSERT INTO benchmark_aggregates (
    industry_slug, province, revenue_band, metric_key,
    metric_name, metric_name_fr, unit, lower_is_better,
    fruxal_avg, fruxal_p25, fruxal_p50, fruxal_p75, fruxal_p90,
    sample_size, fallback_avg, fallback_p75, last_computed
  )
  SELECT
    c.industry_slug,
    'ALL',
    'ALL',
    c.metric_key,
    (metric_names -> c.metric_key ->> 'en')::text,
    (metric_names -> c.metric_key ->> 'fr')::text,
    (metric_names -> c.metric_key ->> 'unit')::text,
    (metric_names -> c.metric_key -> 'lower')::boolean,
    ROUND(AVG(c.metric_value)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY c.metric_value)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY c.metric_value)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY c.metric_value)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY c.metric_value)::numeric, 2),
    COUNT(*)::int,
    NULL, NULL,
    now()
  FROM benchmark_contributions c
  WHERE c.data_confidence IN ('high', 'medium')
  GROUP BY c.industry_slug, c.metric_key
  HAVING COUNT(*) >= 5
  ON CONFLICT (industry_slug, province, revenue_band, metric_key) DO NOTHING;
END;
$$;

-- RLS: users can read aggregates, never raw contributions
ALTER TABLE benchmark_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_aggregates    ENABLE ROW LEVEL SECURITY;

-- No user can read raw contributions — service role only
CREATE POLICY "service_only" ON benchmark_contributions
  USING (false);

-- Anyone can read aggregates (they're already anonymized)
CREATE POLICY "public_read" ON benchmark_aggregates
  FOR SELECT USING (true);

COMMENT ON TABLE benchmark_contributions IS
  'Anonymized financial metrics contributed from each diagnostic. No PII. Segment keys only.';
COMMENT ON TABLE benchmark_aggregates IS
  'Nightly-computed benchmark aggregates. effective_avg and effective_p75 are used by Claude and the UI.';
