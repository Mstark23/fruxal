// =============================================================================
// MARKET LEARNING — Benchmarks update from real user data
// =============================================================================
// Every scan feeds data back. As user base grows:
//   10 users → rough benchmarks (using industry standards)
//   100 users → good benchmarks (mixing real + standard)
//   1000 users → excellent benchmarks (mostly real data)
//
// This is the "learns from the market" part of the intelligence engine.
// It runs as part of the Tier 2 weekly batch.
// =============================================================================

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AggregatedMetric {
  industry: string;
  category: string;
  metric: string;
  values: number[];
}

// ─── Recalculate benchmarks from ALL leak data ───────────────────────────────
export async function recalculateBenchmarks(): Promise<{ updated: number; industries: string[] }> {
  // Fetch all leaks that have "yours" and "benchmark" values
  const { data: leaks } = await supabase
    .from("leaks")
    .select("industry, category, type, yours, benchmark, annualImpact, businessId")
    .not("yours", "is", null)
    .not("yours", "eq", "");

  if (!leaks || leaks.length < 10) {
    process.env.NODE_ENV === "development" && console.log("Market Learning: Not enough data yet (need 10+ leaks with values)");
    return { updated: 0, industries: [] };
  }

  // Group metrics by industry + category
  const metrics: Record<string, AggregatedMetric> = {};

  for (const leak of leaks) {
    const industry = leak.industry?.toLowerCase() || "unknown";
    const category = leak.category || leak.type || "unknown";
    const key = `${industry}:${category}`;

    if (!metrics[key]) {
      metrics[key] = { industry, category, metric: category, values: [] };
    }

    // Parse the "yours" value — could be "33%", "$500/mo", "45 days"
    const numVal = parseFloat(String(leak.yours).replace(/[^0-9.-]/g, ""));
    if (!isNaN(numVal) && numVal > 0) {
      metrics[key].values.push(numVal);
    }
  }

  // Calculate percentiles and update benchmarks
  let updated = 0;
  const industries = new Set<string>();

  for (const [key, data] of Object.entries(metrics)) {
    if (data.values.length < 3) continue; // Need minimum 3 data points

    const sorted = [...data.values].sort((a, b) => a - b);
    const len = sorted.length;

    const p25 = sorted[Math.floor(len * 0.25)];
    const median = sorted[Math.floor(len * 0.5)];
    const p75 = sorted[Math.floor(len * 0.75)];

    // Blend with static benchmarks (weighted: real data weight increases with sample size)
    // At 3 samples: 30% real, 70% static
    // At 20 samples: 70% real, 30% static
    // At 50+ samples: 90% real, 10% static
    const realWeight = Math.min(0.9, 0.3 + (len / 50) * 0.6);
    const staticWeight = 1 - realWeight;

    // Get existing static benchmark
    const { data: existing } = await supabase
      .from("intelligence_benchmarks")
      .select("p25, median, p75")
      .eq("industry", data.industry)
      .eq("category", data.category)
      .eq("source", "static")
      .single();

    let blendedP25 = p25;
    let blendedMedian = median;
    let blendedP75 = p75;

    if (existing) {
      blendedP25 = Math.round((p25 * realWeight + (existing.p25 || p25) * staticWeight) * 100) / 100;
      blendedMedian = Math.round((median * realWeight + (existing.median || median) * staticWeight) * 100) / 100;
      blendedP75 = Math.round((p75 * realWeight + (existing.p75 || p75) * staticWeight) * 100) / 100;
    }

    const benchId = `ib-live-${data.industry}-${data.category}`;

    const { error } = await supabase.from("intelligence_benchmarks").upsert({
      id: benchId,
      industry: data.industry,
      category: data.category,
      metric: data.metric,
      p25: blendedP25,
      median: blendedMedian,
      p75: blendedP75,
      sampleSize: len,
      updatedAt: new Date().toISOString(),
      source: "market_learning",
    }, { onConflict: "id" });

    if (!error) {
      updated++;
      industries.add(data.industry);
    }
  }

  process.env.NODE_ENV === "development" && console.log(`Market Learning: Updated ${updated} benchmarks across ${industries.size} industries`);
  return { updated, industries: [...industries] };
}

// ─── Get the best available benchmark for a metric ───────────────────────────
// Prefers market-learned over static
export async function getBestBenchmark(
  industry: string,
  category: string
): Promise<{ p25: number; median: number; p75: number; source: string; sampleSize: number } | null> {
  // Try market-learned first
  const { data: live } = await supabase
    .from("intelligence_benchmarks")
    .select("*")
    .eq("industry", industry.toLowerCase())
    .eq("category", category)
    .eq("source", "market_learning")
    .single();

  if (live && live.sampleSize >= 5) {
    return {
      p25: live.p25,
      median: live.median,
      p75: live.p75,
      source: "market_learning",
      sampleSize: live.sampleSize,
    };
  }

  // Fall back to static
  const { data: stat } = await supabase
    .from("intelligence_benchmarks")
    .select("*")
    .eq("industry", industry.toLowerCase())
    .eq("category", category)
    .eq("source", "static")
    .single();

  if (stat) {
    return {
      p25: stat.p25,
      median: stat.median,
      p75: stat.p75,
      source: "static",
      sampleSize: stat.sampleSize ?? 0,
    };
  }

  return null;
}

// ─── Get industry comparison data ────────────────────────────────────────────
// "Where does this business rank vs peers?"
export async function getIndustryComparison(
  businessId: string,
  industry: string
): Promise<{
  ranking: string;
  percentile: number;
  betterThan: number;
  totalInIndustry: number;
  categoryRankings: Array<{ category: string; yours: number; p25: number; median: number; p75: number; ranking: string }>;
}> {
  // Get this business's leaks
  const { data: myLeaks } = await supabase
    .from("leaks")
    .select("category, type, yours, annualImpact")
    .eq("businessId", businessId);

  // Get all businesses in same industry
  const { data: allBiz } = await supabase
    .from("businesses")
    .select("id")
    .ilike("industry", industry);

  const totalInIndustry = allBiz?.length || 1;

  // Get all leaks in this industry for comparison
  const { data: allLeaks } = await supabase
    .from("leaks")
    .select("businessId, annualImpact, status")
    .eq("industry", industry.toLowerCase());

  // Calculate total leakage per business
  const bizTotals: Record<string, number> = {};
  allLeaks?.forEach(l => {
    if (l.status !== "FIXED") {
      bizTotals[l.businessId] = (bizTotals[l.businessId] || 0) + (l.annualImpact ?? 0);
    }
  });

  const myTotal = bizTotals[businessId] || 0;
  const allTotals = Object.values(bizTotals).sort((a, b) => a - b); // Lower = better
  const myRankIdx = allTotals.findIndex(t => t >= myTotal);
  const percentile = allTotals.length > 0 ? Math.round((myRankIdx / allTotals.length) * 100) : 50;

  let ranking = "Average";
  if (percentile <= 25) ranking = "Top Quartile";
  else if (percentile <= 50) ranking = "Above Average";
  else if (percentile <= 75) ranking = "Below Average";
  else ranking = "Bottom Quartile";

  // Category-level rankings
  const categoryRankings: any[] = [];
  const myCategories = new Set((myLeaks || []).map(l => l.category || l.type));

  for (const cat of myCategories) {
    const myLeak = myLeaks?.find(l => (l.category || l.type) === cat);
    if (!myLeak?.yours) continue;

    const myVal = parseFloat(String(myLeak.yours).replace(/[^0-9.-]/g, ""));
    if (isNaN(myVal)) continue;

    const bench = await getBestBenchmark(industry, String(cat));
    if (bench) {
      let catRanking = "Average";
      if (myVal <= bench.p25) catRanking = "Top Quartile";
      else if (myVal <= bench.median) catRanking = "Above Average";
      else if (myVal <= bench.p75) catRanking = "Below Average";
      else catRanking = "Bottom Quartile";

      categoryRankings.push({
        category: cat,
        yours: myVal,
        p25: bench.p25,
        median: bench.median,
        p75: bench.p75,
        ranking: catRanking,
      });
    }
  }

  return {
    ranking,
    percentile,
    betterThan: Math.max(0, allTotals.length - myRankIdx - 1),
    totalInIndustry,
    categoryRankings,
  };
}
