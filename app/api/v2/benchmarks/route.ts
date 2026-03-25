// =============================================================================
// app/api/v2/benchmarks/route.ts
// GET — Returns benchmark data for a business.
// Priority: fruxal_data (real customer data) > fallback (seeded industry data)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 15;

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (token as any)?.id || token?.sub;

    // Get business profile
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id, industry_slug, industry, province, annual_revenue, exact_annual_revenue, employee_count")
      .eq("user_id", userId)
      .single();

    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

    const industrySlug = (profile.industry_slug || profile.industry || "").toLowerCase();
    const province     = profile.province || "ON";
    const revenue      = profile.exact_annual_revenue || profile.annual_revenue || 0;

    // Revenue band for filtering
    const band =
      revenue < 150_000   ? "0_150k"    :
      revenue < 500_000   ? "150k_500k" :
      revenue < 1_000_000 ? "500k_1m"   :
      revenue < 3_000_000 ? "1m_3m"     :
      revenue < 10_000_000 ? "3m_10m"   : "10m_plus";

    // Try province+industry specific first, then national, then fallback
    const { data: aggregates } = await supabaseAdmin
      .from("benchmark_aggregates")
      .select("*")
      .eq("industry_slug", industrySlug)
      .or(`province.eq.${province},province.eq.ALL`)
      .or(`revenue_band.eq.${band},revenue_band.eq.ALL`)
      .order("sample_size", { ascending: false }); // best data first

    // Deduplicate: prefer province-specific over national, band-specific over ALL
    const seen = new Set<string>();
    const deduplicated = (aggregates || []).filter(a => {
      const key = a.metric_key;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // If no Fruxal data yet, fall back to industry_benchmarks table
    let benchmarks = deduplicated;
    if (benchmarks.length === 0) {
      const { data: fallback } = await supabaseAdmin
        .from("industry_benchmarks")
        .select("metric_key, metric_name, avg_value, top_performer, unit")
        .eq("industry_slug", industrySlug)
        .limit(10);

      benchmarks = (fallback || []).map(b => ({
        metric_key:   b.metric_key,
        metric_name:  b.metric_name,
        effective_avg: b.avg_value,
        effective_p75: b.top_performer,
        sample_size:  0,
        confidence:   "estimate",
        unit:         b.unit || "%",
        fruxal_avg:   null,
        fruxal_p75:   null,
      }));
    }

    // Get the latest diagnostic for this business (for your_value comparison)
    const { data: latestReport } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("result_json, overall_score, completed_at")
      .eq("business_id", profile.business_id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    // Extract user's own values from the latest diagnostic benchmark_comparisons
    const yourValues: Record<string, number> = {};
    if (latestReport?.result_json?.benchmark_comparisons) {
      for (const b of latestReport.result_json.benchmark_comparisons) {
        const key = b.metric_key || b.metric_name?.toLowerCase().replace(/\s+/g, "_");
        if (key && b.your_value_raw != null) {
          yourValues[key] = b.your_value_raw;
        }
      }
    }

    // Enrich benchmarks with user\'s own values
    const enriched = benchmarks.map((b: any) => ({
      metric_key:    b.metric_key,
      metric_name:   b.metric_name,
      unit:          b.unit || "%",
      lower_is_better: b.lower_is_better ?? false,
      // User\'s value
      your_value:    yourValues[b.metric_key] ?? null,
      // Benchmark values
      fruxal_avg:    b.fruxal_avg ?? null,
      fruxal_p75:    b.fruxal_p75 ?? null,
      effective_avg: b.effective_avg ?? null,
      effective_p75: b.effective_p75 ?? null,
      // Meta
      sample_size:   b.sample_size ?? 0,
      confidence:    b.confidence ?? "estimate",
      // Status relative to benchmark
      status: yourValues[b.metric_key] != null && b.effective_p75 != null
        ? (b.lower_is_better
            ? (yourValues[b.metric_key] <= b.effective_p75 ? "top_quartile" : yourValues[b.metric_key] <= b.effective_avg ? "above_avg" : "below_avg")
            : (yourValues[b.metric_key] >= b.effective_p75 ? "top_quartile" : yourValues[b.metric_key] >= b.effective_avg ? "above_avg" : "below_avg"))
        : "unknown",
    }));

    // Contribution stats for transparency
    const { count: totalContribs } = await supabaseAdmin
      .from("benchmark_contributions")
      .select("*", { count: "exact", head: true })
      .eq("industry_slug", industrySlug);

    return NextResponse.json({
      success: true,
      data: {
        industry_slug: industrySlug,
        province,
        revenue_band:  band,
        benchmarks:    enriched,
        total_contributions_in_industry: totalContribs ?? 0,
        has_diagnostic: !!latestReport,
        diagnostic_score: latestReport?.overall_score ?? null,
        diagnostic_date:  latestReport?.completed_at ?? null,
      },
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
