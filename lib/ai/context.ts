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
  language:   string
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

      // Government programs
      supabaseAdmin
        .from("affiliate_partners")
        .select("slug, name, name_fr, description, description_fr, annual_value_min, annual_value_max, category")
        .eq("is_government_program", true)
        .or(`provinces.cs.{${province}},provinces.is.null`)
        .order("priority_score", { ascending: false })
        .limit(20),

      // Commercial affiliates
      supabaseAdmin
        .from("affiliate_partners")
        .select("slug, name, name_fr, description, description_fr, category")
        .eq("is_government_program", false)
        .order("priority_score", { ascending: false })
        .limit(30),

      // Industry benchmarks
      supabaseAdmin
        .from("industry_benchmarks")
        .select("metric_key, metric_name, avg_value, top_performer, unit")
        .in("industry_slug", [
          industry,
          industry.replace(/-\d+$/, ""), // strip trailing version number
        ])
        .limit(10),
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
