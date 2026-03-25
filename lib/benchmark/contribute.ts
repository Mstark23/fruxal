// =============================================================================
// lib/benchmark/contribute.ts
//
// Anonymized benchmark contribution — called non-blocking after every diagnostic.
// Extracts 6 core financial metrics, strips all PII, and writes to
// benchmark_contributions. Never blocks the diagnostic response.
//
// Data separation principle:
//   - benchmark_contributions = customer data (never exposed, service role only)
//   - benchmark_aggregates    = Fruxal computed (public read, shown in UI/prompts)
//   - industry_benchmarks     = Fruxal curated seed data (manual, static)
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";

// Revenue band bucketing — coarse enough to prevent re-identification
function revenueBand(annualRevenue: number): string {
  if (annualRevenue <  150_000)   return "0_150k";
  if (annualRevenue <  500_000)   return "150k_500k";
  if (annualRevenue <  1_000_000) return "500k_1m";
  if (annualRevenue <  3_000_000) return "1m_3m";
  if (annualRevenue < 10_000_000) return "3m_10m";
  return "10m_plus";
}

// Confidence rating for a metric value based on how it was sourced
function dataConfidence(source: string): "high" | "medium" | "low" {
  if (source.includes("verified") || source.includes("uploaded")) return "high";
  if (source.includes("QuickBooks") || source.includes("Stripe") || source.includes("intake")) return "medium";
  return "low";
}

interface ContributionInput {
  reportId:         string;
  industrySlug:     string;
  province:         string;
  tier:             string;
  annualRevenue:    number;
  revenueSource:    string;
  grossMarginPct:   number;
  estimatedEBITDA:  number;
  ebitdaSource:     string;
  estimatedPayroll: number;
  employees:        number;
  exactNetIncome:   number;
  estimatedTaxDrag: number;
  // AI-extracted values from benchmark_comparisons array (most accurate)
  aiBenchmarks?:    Array<{ metric_key?: string; metric_name?: string; your_value_raw?: number }>;
}

export async function contributeBenchmarks(input: ContributionInput): Promise<void> {
  const {
    reportId, industrySlug, province, tier,
    annualRevenue, revenueSource,
    grossMarginPct, estimatedEBITDA, ebitdaSource,
    estimatedPayroll, employees, exactNetIncome, estimatedTaxDrag,
    aiBenchmarks = [],
  } = input;

  if (!industrySlug || !province || !annualRevenue) return;

  const band       = revenueBand(annualRevenue);
  const revConf    = dataConfidence(revenueSource);
  const ebitdaConf = dataConfidence(ebitdaSource);

  // Build rows from derived financials
  const rows: Array<{
    metric_key: string;
    metric_value: number;
    data_source: string;
    data_confidence: string;
  }> = [];

  // 1. Gross margin % — only if plausible (2%–95%)
  if (grossMarginPct > 2 && grossMarginPct < 95) {
    rows.push({
      metric_key: "gross_margin_pct",
      metric_value: Math.round(grossMarginPct * 10) / 10,
      data_source: revenueSource,
      data_confidence: revConf,
    });
  }

  // 2. EBITDA margin %
  if (estimatedEBITDA > 0 && annualRevenue > 0) {
    const margin = (estimatedEBITDA / annualRevenue) * 100;
    if (margin > -50 && margin < 80) {
      rows.push({
        metric_key: "ebitda_margin_pct",
        metric_value: Math.round(margin * 10) / 10,
        data_source: ebitdaSource,
        data_confidence: ebitdaConf,
      });
    }
  }

  // 3. Payroll ratio %
  if (estimatedPayroll > 0 && annualRevenue > 0) {
    const ratio = (estimatedPayroll / annualRevenue) * 100;
    if (ratio > 1 && ratio < 85) {
      rows.push({
        metric_key: "payroll_ratio_pct",
        metric_value: Math.round(ratio * 10) / 10,
        data_source: "intake_derived",
        data_confidence: "medium",
      });
    }
  }

  // 4. Revenue per employee
  if (employees > 0 && annualRevenue > 0) {
    const rpe = Math.round(annualRevenue / employees);
    if (rpe > 10_000 && rpe < 10_000_000) {
      rows.push({
        metric_key: "revenue_per_employee",
        metric_value: rpe,
        data_source: revenueSource,
        data_confidence: revConf,
      });
    }
  }

  // 5. Effective tax rate %
  if (exactNetIncome > 0 && estimatedTaxDrag > 0 && annualRevenue > 0) {
    const taxRate = (estimatedTaxDrag / annualRevenue) * 100;
    if (taxRate > 0.5 && taxRate < 50) {
      rows.push({
        metric_key: "effective_tax_rate_pct",
        metric_value: Math.round(taxRate * 10) / 10,
        data_source: "estimated",
        data_confidence: "low",  // formula-based, never exact
      });
    }
  }

  // 6. Override with AI-extracted values if available (most accurate — from actual financials)
  // AI benchmark_comparisons contain your_value_raw from uploaded docs or QB data
  const METRIC_MAP: Record<string, string> = {
    "gross margin":        "gross_margin_pct",
    "gross margin %":      "gross_margin_pct",
    "ebitda margin":       "ebitda_margin_pct",
    "ebitda margin %":     "ebitda_margin_pct",
    "payroll ratio":       "payroll_ratio_pct",
    "revenue per employee": "revenue_per_employee",
    "effective tax rate":  "effective_tax_rate_pct",
  };

  for (const b of aiBenchmarks) {
    if (!b.your_value_raw || !b.metric_name) continue;
    const key = METRIC_MAP[b.metric_name.toLowerCase()] || b.metric_key;
    if (!key) continue;
    // Override existing row with AI value (higher confidence since it used real financials)
    const idx = rows.findIndex(r => r.metric_key === key);
    const aiRow = {
      metric_key: key,
      metric_value: b.your_value_raw,
      data_source: "ai_extracted",
      data_confidence: "high" as const,  // AI used verified docs or QB to compute this
    };
    if (idx >= 0) rows[idx] = aiRow;
    else rows.push(aiRow);
  }

  if (rows.length === 0) return;

  // Insert with upsert — if the same report is processed twice, no duplicates
  const inserts = rows.map(r => ({
    industry_slug:        industrySlug.toLowerCase().replace(/\s+/g, "-"),
    province:             province,
    revenue_band:         band,
    tier,
    metric_key:           r.metric_key,
    metric_value:         r.metric_value,
    data_source:          r.data_source,
    data_confidence:      r.data_confidence,
    diagnostic_report_id: reportId,
    contributed_at:       new Date().toISOString(),
  }));

  try {
    await supabaseAdmin
      .from("benchmark_contributions")
      .upsert(inserts, { onConflict: "diagnostic_report_id,metric_key", ignoreDuplicates: true });
  } catch (err: any) {
    // Fully non-fatal — contribution failure never surfaces to user
    console.warn("[BenchmarkFlywheel] Contribution failed (non-fatal):", err?.message);
  }
}
