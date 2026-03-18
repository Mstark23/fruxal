// =============================================================================
// POST /api/intelligence/cron — Weekly batch analysis (Tier 2)
// =============================================================================
// Meant to be called by:
//   1. Vercel Cron (vercel.json → schedule: "0 3 * * 1" = every Monday 3am)
//   2. External cron (e.g. cron-job.org hitting this endpoint weekly)
//   3. Manual trigger from admin panel
//
// What it does:
//   1. Analyzes ALL businesses grouped by industry
//   2. Discovers new leak patterns (Claude API batch)
//   3. Updates benchmarks from real data
//   4. Auto-validates high-confidence patterns → absorbs into Tier 1
//   5. Generates industry-level insights
//
// Cost: ~$5-15 per run for 100 businesses (Sonnet 4.5 batch pricing)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { tier2_WeeklyBatchAnalysis, autoValidatePatterns } from "@/services/intelligence/engine";
import { recalculateBenchmarks } from "@/services/intelligence/market-learning";

export const maxDuration = 300; // Vercel function timeout (seconds)

export async function POST(req: NextRequest) {
  // Simple auth — check for cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "dev-cron-secret";

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🧠 Weekly Intelligence Cycle starting...");
    const startTime = Date.now();

    // Step 1: Recalculate benchmarks from real user data
    console.log("   📊 Step 1: Market Learning — updating benchmarks from real data...");
    const benchResult = await recalculateBenchmarks();
    console.log(`   → Updated ${benchResult.updated} benchmarks across ${benchResult.industries.length} industries`);

    // Step 2: Run batch analysis across all businesses
    console.log("   🔍 Step 2: Pattern Discovery — analyzing cross-business data...");
    const patterns = await tier2_WeeklyBatchAnalysis();
    console.log(`   → Discovered ${patterns.length} new patterns`);

    // Step 3: Auto-validate high-confidence patterns
    console.log("   ✅ Step 3: Auto-validation — absorbing proven patterns into Tier 1...");
    const absorbed = await autoValidatePatterns();
    console.log(`   → Absorbed ${absorbed} patterns (now run as free code)`);

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`🧠 Intelligence cycle complete in ${duration}s`);

    return NextResponse.json({
      success: true,
      benchmarksUpdated: benchResult.updated,
      industriesCovered: benchResult.industries,
      patternsDiscovered: patterns.length,
      patternsAbsorbed: absorbed,
      duration: `${duration}s`,
      patterns: patterns.map(p => ({
        title: p.title,
        industry: p.industry,
        type: p.patternType,
        confidence: p.confidence,
        impact: p.estimatedImpactAvg,
      })),
    });
  } catch (error: any) {
    console.error("Tier 2 cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
