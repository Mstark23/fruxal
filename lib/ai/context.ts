// =============================================================================
// lib/ai/context.ts
// Fetches all database context needed to build diagnostic prompts.
// Keeps the route handler clean — one call returns everything.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import { DiagnosticTier } from "./tier";

export interface DiagnosticContext {
  // Obligations / compliance
  obligations:      any[];
  overdue:          number;
  penaltyExposure:  number;
  // Leak detectors
  leakDetectors:    any[];
  // Government programs
  programs:         any[];
  // Affiliate partners
  affiliates:       any[];
  // Industry benchmarks
  benchmarks:       any[];
}

export async function fetchDiagnosticContext(
  businessId: string,
  province:   string,
  industry:   string,
  tier:       DiagnosticTier,
  language:   string,
  country:    "CA" | "US" = "CA"
): Promise<DiagnosticContext> {

  const [obligationsResult, leakResult, programResult, affiliateResult, benchmarkResult] =
    await Promise.allSettled([

      // Obligations via RPC
      supabaseAdmin.rpc("get_deadline_calendar", {
        p_business_id: businessId,
        p_language:    language,
      }),

      // Leak detectors
      supabaseAdmin
        .from("provincial_leak_detectors")
        .select("*")
        .eq("province", province)
        .order("annual_impact_max", { ascending: false })
        .limit(tier === "enterprise" ? 60 : tier === "business" ? 40 : 25),

      // Government programs — filter by country via region column
      supabaseAdmin
        .from("affiliate_partners")
        .select("slug, name, name_fr, description, description_fr, annual_value_min, annual_value_max, category")
        .eq("is_government_program", true)
        .in("region", country === "US" ? ["US"] : ["CA","CA-QC","CA-ON","CA-BC","CA-AB","ALL"])
        .order("priority_score", { ascending: false })
        .limit(20),

      // Commercial affiliates — no country filter (tools like QuickBooks work everywhere)
      supabaseAdmin
        .from("affiliate_partners")
        .select("slug, name, name_fr, description, description_fr, category")
        .eq("is_government_program", false)
        .order("priority_score", { ascending: false })
        .limit(30),

      // Industry benchmarks — prefer benchmark_aggregates (real user data) over seeded data
      (async () => {
        // Try real aggregated data first (province+industry specific)
        const { data: agg } = await supabaseAdmin
          .from("benchmark_aggregates")
          .select("metric_key, metric_name, metric_name_fr, effective_avg, effective_p75, unit, confidence, sample_size, lower_is_better")
          .eq("industry_slug", industry)
          .or(`province.eq.${province},province.eq.ALL,province.eq.${country}`)
          .order("sample_size", { ascending: false })
          .limit(10);

        if (agg && agg.length >= 3) {
          // Enough real data — return aggregates shaped like industry_benchmarks
          return {
            data: agg.map(a => ({
              metric_key:   a.metric_key,
              metric_name:  a.metric_name,
              avg_value:    a.effective_avg,
              top_performer: a.effective_p75,
              unit:         a.unit || "%",
              confidence:   a.confidence,
              sample_size:  a.sample_size,
            })),
            error: null,
          };
        }

        // Fall back to seeded industry_benchmarks
        return supabaseAdmin
          .from("industry_benchmarks")
          .select("metric_key, metric_name, avg_value, top_performer, unit")
          .in("industry_slug", [
            industry,
            industry.replace(/-\d+$/, ""),
          ])
          .limit(10);
      })(),
    ]);

  // Parse obligations
  let obligations: any[] = [];
  if (obligationsResult.status === "fulfilled" && obligationsResult.value.data) {
    const cal = obligationsResult.value.data as any;
    obligations = [
      ...(cal.overdue        || []),
      ...(cal.this_week      || []),
      ...(cal.this_month     || []),
      ...(cal.next_3_months  || []),
      ...(cal.later          || []),
      ...(cal.continuous     || []),
    ];
  }

  const overdue         = obligations.filter((o: any) => o.days_overdue > 0).length;
  const penaltyExposure = obligations
    .filter((o: any) => o.days_overdue > 0)
    .reduce((sum: number, o: any) => sum + (o.penalty_amount || 500), 0);

  return {
    obligations,
    overdue,
    penaltyExposure,
    leakDetectors: leakResult.status === "fulfilled" ? (leakResult.value.data || []) : [],
    programs:      programResult.status === "fulfilled" ? (programResult.value.data || []) : [],
    affiliates:    affiliateResult.status === "fulfilled" ? (affiliateResult.value.data || []) : [],
    benchmarks:    benchmarkResult.status === "fulfilled" ? (benchmarkResult.value.data || []) : [],
  };
}
