// =============================================================================
// INTELLIGENCE ENGINE — 3-Tier Self-Learning System
// =============================================================================
// The brain of Fruxal. Gets smarter over time, costs LESS over time.
//
// TIER 1: Pure Code Detection (FREE — runs on every scan)
//   → Benchmark comparisons, threshold checks, pattern rules
//   → Cost: $0. Handles 80% of detection.
//
// TIER 2: Weekly Batch Analysis (CHEAP — Claude API batch mode)
//   → Cross-business pattern discovery, new leak type generation
//   → Anomaly detection across the entire user base
//   → Cost: ~$5-15/week for 1000 users (batch = 50% discount)
//
// TIER 3: On-Demand Deep Analysis (TARGETED — per-request)
//   → Complex multi-source reasoning, contract analysis
//   → Triggered by user action or high-value anomaly
//   → Cost: ~$0.03-0.10 per analysis
//
// THE LEARNING LOOP:
//   Tier 2 discovers new patterns → generates code rules → Tier 1 absorbs them
//   Over time, more work shifts from paid API → free code = costs decrease
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


// ─── Types ───────────────────────────────────────────────────────────────────
export interface DiscoveredPattern {
  id: string;
  patternType: string;         // "new_leak_type" | "benchmark_shift" | "cross_business" | "trend_anomaly"
  industry: string;
  title: string;
  description: string;
  detectionRule: string;       // Code-convertible rule for Tier 1 absorption
  confidence: number;          // 0-100
  sampleSize: number;          // How many businesses showed this pattern
  estimatedImpactAvg: number;  // Average $ impact across affected businesses
  discoveredAt: string;
  status: "new" | "validated" | "absorbed" | "rejected";
  metadata: Record<string, any>;
}

export interface IntelligenceInsight {
  id: string;
  businessId: string;
  insightType: string;
  title: string;
  description: string;
  impact: number;
  actionable: boolean;
  action: string;
  confidence: number;
  source: "tier1" | "tier2" | "tier3";
  createdAt: string;
}

export interface MarketBenchmark {
  category: string;
  metric: string;
  industry: string;
  p25: number;           // Top 25% (good)
  median: number;        // Middle
  p75: number;           // Bottom 25% (bad)
  sampleSize: number;
  updatedAt: string;
}

// =============================================================================
// TIER 1: Pure Code Detection (FREE)
// =============================================================================
// Runs on every scan. Zero API cost. Gets smarter as Tier 2 feeds it rules.
// =============================================================================

export async function tier1_CodeDetection(businessId: string, industry: string): Promise<IntelligenceInsight[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const insights: IntelligenceInsight[] = [];

  // Fetch business leaks and scan history
  const { data: leaks } = await supabase
    .from("leaks")
    .select("*")
    .eq("businessId", businessId);

  const { data: snapshots } = await supabase
    .from("scan_snapshots")
    .select("*")
    .eq("businessId", businessId)
    .order("scannedAt", { ascending: true });

  if (!leaks || leaks.length === 0) return insights;

  // ─── RULE 1: Worsening Trends ───────────────────────────────────────────
  // If a leak's metric has gotten worse over 2+ scans, flag it
  if (snapshots && snapshots.length >= 2) {
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    if (latest.totalAmount > previous.totalAmount) {
      const increase = latest.totalAmount - previous.totalAmount;
      const pctIncrease = Math.round((increase / previous.totalAmount) * 100);
      insights.push({
        id: `t1-trend-${businessId}-${Date.now()}`,
        businessId,
        insightType: "worsening_trend",
        title: "Leakage is increasing",
        description: `Total leakage grew ${pctIncrease}% since last scan ($${Math.round(increase).toLocaleString()} more). ${leaks.filter(l => l.trend === "worsening").length} individual leaks are getting worse.`,
        impact: increase,
        actionable: true,
        action: "Review worsening leaks immediately — they compound monthly.",
        confidence: 85,
        source: "tier1",
        createdAt: new Date().toISOString(),
      });
    }

    // Improving → celebrate
    if (latest.totalAmount < previous.totalAmount * 0.9) {
      const saved = previous.totalAmount - latest.totalAmount;
      insights.push({
        id: `t1-improve-${businessId}-${Date.now()}`,
        businessId,
        insightType: "improvement",
        title: "You're making progress!",
        description: `Leakage dropped by $${Math.round(saved).toLocaleString()} since last scan. Keep fixing leaks to drive this lower.`,
        impact: saved,
        actionable: false,
        action: "",
        confidence: 90,
        source: "tier1",
        createdAt: new Date().toISOString(),
      });
    }
  }

  // ─── RULE 2: Stale Leaks (not acted on for 30+ days) ───────────────────
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const staleLeaks = leaks.filter(l =>
    (l.status === "OPEN" || l.status === "open") &&
    l.detectedAt < thirtyDaysAgo
  );
  if (staleLeaks.length > 0) {
    const staleTotal = staleLeaks.reduce((s, l) => s + (l.annualImpact ?? 0), 0);
    insights.push({
      id: `t1-stale-${businessId}-${Date.now()}`,
      businessId,
      insightType: "stale_leaks",
      title: `${staleLeaks.length} leaks sitting unfixed for 30+ days`,
      description: `You have $${Math.round(staleTotal).toLocaleString()}/yr in leaks that haven't been acted on. Every month you wait costs ~$${Math.round(staleTotal / 12).toLocaleString()}.`,
      impact: Math.round(staleTotal / 12), // monthly cost of inaction
      actionable: true,
      action: "Open Fix List and start with the highest-impact leak.",
      confidence: 95,
      source: "tier1",
      createdAt: new Date().toISOString(),
    });
  }

  // ─── RULE 3: Category Concentration Risk ────────────────────────────────
  // If >50% of leakage is in one category, that's a red flag
  const catTotals: Record<string, number> = {};
  const totalLeak = leaks.reduce((s, l) => s + (l.annualImpact ?? 0), 0);
  leaks.forEach(l => {
    const cat = l.category || l.type || "other";
    catTotals[cat] = (catTotals[cat] || 0) + (l.annualImpact ?? 0);
  });
  for (const [cat, amount] of Object.entries(catTotals)) {
    if (totalLeak > 0 && amount / totalLeak > 0.5) {
      insights.push({
        id: `t1-concentration-${businessId}-${cat}-${Date.now()}`,
        businessId,
        insightType: "concentration_risk",
        title: `${Math.round((amount / totalLeak) * 100)}% of your leakage is in ${cat.replace(/-/g, " ")}`,
        description: `$${Math.round(amount).toLocaleString()}/yr in a single category means one fix could recover most of your money. This is actually good news.`,
        impact: amount,
        actionable: true,
        action: `Focus all energy on ${cat.replace(/-/g, " ")} leaks first.`,
        confidence: 90,
        source: "tier1",
        createdAt: new Date().toISOString(),
      });
    }
  }

  // ─── RULE 4: Quick Wins (low effort, high impact) ──────────────────────
  const quickWins = leaks.filter(l =>
    (l.status === "OPEN" || l.status === "open") &&
    l.annualImpact >= 3000 &&
    l.affiliatePartner // Has a partner = 1-click fix available
  );
  if (quickWins.length > 0) {
    const qwTotal = quickWins.reduce((s, l) => s + l.annualImpact, 0);
    insights.push({
      id: `t1-quickwin-${businessId}-${Date.now()}`,
      businessId,
      insightType: "quick_wins",
      title: `${quickWins.length} leaks have 1-click fixes available`,
      description: `$${Math.round(qwTotal).toLocaleString()}/yr can be recovered by clicking "Fix" — we've already matched you with a partner.`,
      impact: qwTotal,
      actionable: true,
      action: "Go to Fix List → click the green buttons.",
      confidence: 85,
      source: "tier1",
      createdAt: new Date().toISOString(),
    });
  }

  // ─── RULE 5: Load absorbed patterns from Tier 2 ────────────────────────
  const { data: absorbedPatterns } = await supabase
    .from("intelligence_patterns")
    .select("*")
    .eq("status", "absorbed")
    .eq("industry", industry);

  if (absorbedPatterns) {
    for (const pattern of absorbedPatterns) {
      try {
        // Each absorbed pattern has a detectionRule that's a simple condition
        const rule = JSON.parse(pattern.detectionRule);
        const matchingLeaks = leaks.filter(l => {
          if (rule.category && l.category !== rule.category) return false;
          if (rule.minImpact && l.annualImpact < rule.minImpact) return false;
          if (rule.metric && l.yours) {
            const val = parseFloat(l.yours);
            if (rule.operator === ">" && val <= rule.threshold) return false;
            if (rule.operator === "<" && val >= rule.threshold) return false;
          }
          return true;
        });

        if (matchingLeaks.length > 0) {
          insights.push({
            id: `t1-pattern-${pattern.id}-${businessId}`,
            businessId,
            insightType: "learned_pattern",
            title: pattern.title,
            description: pattern.description,
            impact: matchingLeaks.reduce((s, l) => s + l.annualImpact, 0),
            actionable: true,
            action: pattern.metadata?.action || "Review affected leaks.",
            confidence: pattern.confidence,
            source: "tier1", // Originally from Tier 2, now absorbed
            createdAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        // Invalid rule, skip
      }
    }
  }

  return insights;
}

// =============================================================================
// TIER 2: Weekly Batch Analysis (Claude API — Batch Mode)
// =============================================================================
// Runs weekly via cron. Analyzes ALL businesses to find cross-cutting patterns.
// Discovers new leak types. Updates benchmarks. Feeds Tier 1.
//
// Uses Claude Batch API = 50% cost reduction.
// Each call processes 10-50 businesses at once = efficient.
// =============================================================================

export async function tier2_WeeklyBatchAnalysis(): Promise<DiscoveredPattern[]> {
  const patterns: DiscoveredPattern[] = [];

  // ─── Step 1: Gather aggregate data across all businesses ───────────────
  const { data: allLeaks } = await supabase
    .from("leaks")
    .select("businessId, category, type, severity, status, annualImpact, yours, benchmark, industry, confidence, fixAction")
    .not("status", "eq", "DISMISSED");

  if (!allLeaks || allLeaks.length < 10) {
    process.env.NODE_ENV === "development" && console.log("Tier 2: Not enough data yet (need 10+ leaks across businesses)");
    return patterns;
  }

  // Group by industry
  const byIndustry: Record<string, any[]> = {};
  allLeaks.forEach(l => {
    const ind = l.industry || "unknown";
    if (!byIndustry[ind]) byIndustry[ind] = [];
    byIndustry[ind].push(l);
  });

  // ─── Step 2: For each industry, ask Claude to find patterns ────────────
  for (const [industry, leaks] of Object.entries(byIndustry)) {
    if (leaks.length < 5) continue; // Need minimum data

    // Aggregate stats for the prompt
    const businessCount = new Set(leaks.map(l => l.businessId)).size;
    const catBreakdown: Record<string, { count: number; totalImpact: number; avgImpact: number }> = {};
    leaks.forEach(l => {
      const cat = l.category || l.type;
      if (!catBreakdown[cat]) catBreakdown[cat] = { count: 0, totalImpact: 0, avgImpact: 0 };
      catBreakdown[cat].count++;
      catBreakdown[cat].totalImpact += l.annualImpact ?? 0;
    });
    Object.values(catBreakdown).forEach(c => c.avgImpact = Math.round(c.totalImpact / c.count));

    // Sample some leak details (not all, to control token usage)
    const sampleLeaks = leaks
      .sort((a, b) => (b.annualImpact ?? 0) - (a.annualImpact ?? 0))
      .slice(0, 20)
      .map(l => ({
        category: l.category || l.type,
        title: l.title,
        impact: l.annualImpact,
        yours: l.yours,
        benchmark: l.benchmark,
        severity: l.severity,
        status: l.status,
      }));

    const prompt = `You are an intelligence engine analyzing leak data across ${businessCount} ${industry} businesses.

AGGREGATE DATA:
${JSON.stringify(catBreakdown, null, 2)}

TOP LEAKS (sample of ${sampleLeaks.length}):
${JSON.stringify(sampleLeaks, null, 2)}

Analyze this data and return ONLY valid JSON with discovered patterns:

{
  "patterns": [
    {
      "patternType": "new_leak_type" | "benchmark_shift" | "cross_business" | "trend_anomaly",
      "title": "Short descriptive title",
      "description": "What the pattern is and why it matters",
      "detectionRule": {
        "category": "leak category or null",
        "metric": "metric name or null",
        "operator": ">" | "<" | "between",
        "threshold": number,
        "minImpact": minimum dollar impact to trigger
      },
      "confidence": 0-100,
      "estimatedImpactAvg": average dollar impact per affected business,
      "action": "What the business owner should do"
    }
  ],
  "benchmarkUpdates": [
    {
      "category": "leak category",
      "metric": "metric name",
      "newMedian": number,
      "newP25": number (top quartile),
      "newP75": number (bottom quartile),
      "sampleSize": number
    }
  ],
  "industryInsight": "One paragraph summary of the most important finding"
}

Focus on:
1. Patterns that appear in 30%+ of businesses (systemic issues)
2. New leak types not currently in our detection (novel discoveries)
3. Benchmark shifts from our current standards
4. Correlations between leak types (e.g. high processing fees often comes with high insurance)`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content
        .filter(b => b.type === "text")
        .map(b => (b as any).text)
        .join("");

      // Parse response
      const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      let result: any = {};
      try { result = JSON.parse(cleaned); } catch { result = {}; }

      // Store discovered patterns
      if (result.patterns) {
        for (const p of result.patterns) {
          const pattern: DiscoveredPattern = {
            id: `t2-${industry}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            patternType: p.patternType,
            industry,
            title: p.title,
            description: p.description,
            detectionRule: JSON.stringify(p.detectionRule),
            confidence: p.confidence || 70,
            sampleSize: businessCount,
            estimatedImpactAvg: p.estimatedImpactAvg ?? 0,
            discoveredAt: new Date().toISOString(),
            status: "new",
            metadata: { action: p.action, raw: p },
          };
          patterns.push(pattern);

          // Save to DB
          await supabase.from("intelligence_patterns").upsert({
            id: pattern.id,
            patternType: pattern.patternType,
            industry: pattern.industry,
            title: pattern.title,
            description: pattern.description,
            detectionRule: pattern.detectionRule,
            confidence: pattern.confidence,
            sampleSize: pattern.sampleSize,
            estimatedImpactAvg: pattern.estimatedImpactAvg,
            discoveredAt: pattern.discoveredAt,
            status: pattern.status,
            metadata: pattern.metadata,
          }, { onConflict: "id" });
        }
      }

      // Update benchmarks
      if (result.benchmarkUpdates) {
        for (const bu of result.benchmarkUpdates) {
          await supabase.from("intelligence_benchmarks").upsert({
            id: `bench-${industry}-${bu.category}-${bu.metric}`,
            industry,
            category: bu.category,
            metric: bu.metric,
            p25: bu.newP25,
            median: bu.newMedian,
            p75: bu.newP75,
            sampleSize: bu.sampleSize || businessCount,
            updatedAt: new Date().toISOString(),
            source: "tier2_batch",
          }, { onConflict: "id" });
        }
      }

      // Log the industry insight
      if (result.industryInsight) {
        await supabase.from("intelligence_logs").insert({
          tier: 2,
          industry,
          action: "weekly_batch",
          summary: result.industryInsight,
          patternsFound: result.patterns?.length ?? 0,
          benchmarksUpdated: result.benchmarkUpdates?.length ?? 0,
          businessesAnalyzed: businessCount,
          leaksAnalyzed: leaks.length,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e: any) {
      console.error(`Tier 2 analysis failed for ${industry}:`, e.message);
    }
  }

  return patterns;
}

// ─── Absorb validated patterns into Tier 1 ───────────────────────────────────
// Called after human review OR auto-validated (confidence > 80 + sample > 20)
export async function absorbPattern(patternId: string): Promise<void> {
  await supabase
    .from("intelligence_patterns")
    .update({ status: "absorbed", absorbedAt: new Date().toISOString() })
    .eq("id", patternId);

  process.env.NODE_ENV === "development" && console.log(`Pattern ${patternId} absorbed into Tier 1 — will run as free code on next scan.`);
}

// ─── Auto-validate patterns that meet confidence threshold ───────────────────
export async function autoValidatePatterns(): Promise<number> {
  const { data: newPatterns } = await supabase
    .from("intelligence_patterns")
    .select("*")
    .eq("status", "new")
    .gte("confidence", 80)
    .gte("sampleSize", 20);

  let absorbed = 0;
  if (newPatterns) {
    for (const p of newPatterns) {
      await absorbPattern(p.id);
      absorbed++;
    }
  }
  return absorbed;
}

// =============================================================================
// TIER 3: On-Demand Deep Analysis (Claude API — Single Request)
// =============================================================================
// Triggered by user action. Gives personalized, context-rich analysis.
// Most expensive per call but most valuable per insight.
// =============================================================================

export async function tier3_DeepAnalysis(
  businessId: string,
  analysisType: "full_business" | "single_leak" | "comparison" | "forecast",
  context?: { leakId?: string; question?: string }
): Promise<IntelligenceInsight[]> {
  // Gather full business context
  const [
    { data: business },
    { data: leaks },
    { data: snapshots },
    { data: benchmarks },
  ] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", businessId).single(),
    supabase.from("leaks").select("*").eq("businessId", businessId),
    supabase.from("scan_snapshots").select("*").eq("businessId", businessId).order("scannedAt", { ascending: true }),
    supabase.from("intelligence_benchmarks").select("*").eq("industry", "all"), // Will filter by business industry
  ]);

  if (!business || !leaks) return [];

  const industry = business.industry?.toLowerCase() || "unknown";
  const totalLeaking = leaks.filter(l => l.status !== "FIXED").reduce((s, l) => s + (l.annualImpact ?? 0), 0);
  const totalFixed = leaks.filter(l => l.status === "FIXED").reduce((s, l) => s + (l.annualImpact ?? 0), 0);

  let prompt = "";

  switch (analysisType) {
    case "full_business":
      prompt = `You are an expert financial analyst for a ${industry} business called "${business.name}".

CURRENT STATE:
- Total annual leakage: $${(totalLeaking ?? 0).toLocaleString()}
- Already recovered: $${(totalFixed ?? 0).toLocaleString()}
- Open leaks: ${leaks.filter(l => l.status !== "FIXED").length}
- Fixed leaks: ${leaks.filter(l => l.status === "FIXED").length}
- Scan history: ${snapshots?.length ?? 0} scans

OPEN LEAKS:
${leaks.filter(l => l.status !== "FIXED").map(l => `- ${l.title}: $${l.annualImpact}/yr (${l.category}) — You: ${l.yours}, Benchmark: ${l.benchmark}`).join("\n")}

${snapshots && snapshots.length > 1 ? `TREND: Leakage went from $${snapshots[0]?.totalAmount} to $${snapshots[snapshots.length-1]?.totalAmount} over ${snapshots.length} scans.` : ""}

Provide a strategic analysis. Return JSON:
{
  "insights": [
    {
      "type": "priority" | "hidden_opportunity" | "risk" | "quick_win" | "strategic",
      "title": "Short title",
      "description": "Detailed explanation",
      "impact": estimated dollar impact,
      "action": "Specific action to take",
      "confidence": 0-100
    }
  ],
  "executiveSummary": "2-3 sentence overview",
  "topPriority": "The single most important thing to do right now",
  "forecast": "If they fix all leaks, projected savings in 12 months"
}`;
      break;

    case "single_leak":
      const leak = leaks.find(l => l.id === context?.leakId);
      if (!leak) return [];
      prompt = `Analyze this specific leak for a ${industry} business:

LEAK: ${leak.title}
Category: ${leak.category}
Your value: ${leak.yours}
Benchmark: ${leak.benchmark}
Annual impact: $${leak.annualImpact}
Current fix action: ${leak.fixAction}

Provide deep analysis. Return JSON:
{
  "insights": [
    {
      "type": "root_cause" | "fix_strategy" | "negotiation_tip" | "alternative",
      "title": "Short title",
      "description": "Detailed explanation",
      "impact": dollar impact,
      "action": "Step by step action",
      "confidence": 0-100
    }
  ],
  "rootCause": "Why this leak likely exists",
  "fixPlan": ["Step 1", "Step 2", "Step 3"],
  "negotiationScript": "What to say when calling the vendor/provider",
  "timeToFix": "Estimated days to resolve"
}`;
      break;

    case "comparison":
      prompt = `Compare this ${industry} business against industry peers:

THIS BUSINESS:
${leaks.map(l => `- ${l.category}: ${l.yours} (benchmark: ${l.benchmark}), impact: $${l.annualImpact}`).join("\n")}

Return JSON:
{
  "insights": [
    { "type": "comparison", "title": "...", "description": "...", "impact": 0, "action": "...", "confidence": 0 }
  ],
  "ranking": "Where this business ranks (top 25%, middle, bottom 25%)",
  "biggestGap": "Their worst category vs peers",
  "bestArea": "Where they're doing well"
}`;
      break;

    case "forecast":
      prompt = `Forecast the financial impact if this ${industry} business fixes its leaks:

CURRENT LEAKS:
${leaks.filter(l => l.status !== "FIXED").map(l => `- ${l.title}: $${l.annualImpact}/yr`).join("\n")}

ALREADY FIXED:
${leaks.filter(l => l.status === "FIXED").map(l => `- ${l.title}: $${l.annualImpact}/yr saved`).join("\n")}

Return JSON:
{
  "insights": [
    { "type": "forecast", "title": "...", "description": "...", "impact": 0, "action": "...", "confidence": 0 }
  ],
  "month3": { "savings": number, "healthScore": number },
  "month6": { "savings": number, "healthScore": number },
  "month12": { "savings": number, "healthScore": number },
  "compoundEffect": "Explanation of how savings compound"
}`;
      break;
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content.filter(b => b.type === "text").map(b => (b as any).text).join("");
    const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    let result: any = { insights: [] };
    try { result = JSON.parse(cleaned); } catch { result = { insights: [] }; }

    // Convert to insights
    const insights: IntelligenceInsight[] = (result.insights || []).map((i: any, idx: number) => ({
      id: `t3-${analysisType}-${businessId}-${Date.now()}-${idx}`,
      businessId,
      insightType: i.type,
      title: i.title,
      description: i.description,
      impact: i.impact ?? 0,
      actionable: !!i.action,
      action: i.action || "",
      confidence: i.confidence || 75,
      source: "tier3" as const,
      createdAt: new Date().toISOString(),
    }));

    // Save insights to DB
    for (const insight of insights) {
      await supabase.from("intelligence_insights").upsert(insight, { onConflict: "id" });
    }

    // Save the full analysis result
    await supabase.from("intelligence_logs").insert({
      tier: 3,
      industry,
      action: analysisType,
      businessId,
      summary: result.executiveSummary || result.ranking || result.compoundEffect || "",
      insightsGenerated: insights.length,
      fullResult: result,
      createdAt: new Date().toISOString(),
    });

    return insights;
  } catch (e: any) {
    console.error(`Tier 3 analysis failed:`, e.message);
    return [];
  }
}

// =============================================================================
// COMBINED: Run all relevant tiers for a business
// =============================================================================

export async function getIntelligence(
  businessId: string,
  industry: string,
  options?: { deepAnalysis?: boolean }
): Promise<{
  insights: IntelligenceInsight[];
  fromCache: boolean;
}> {
  // Always run Tier 1 (free)
  const tier1 = await tier1_CodeDetection(businessId, industry);

  // Check if we have recent Tier 3 insights cached
  const { data: cachedInsights } = await supabase
    .from("intelligence_insights")
    .select("*")
    .eq("businessId", businessId)
    .eq("source", "tier3")
    .gte("createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("createdAt", { ascending: false });

  let tier3: IntelligenceInsight[] = [];
  let fromCache = false;

  if (cachedInsights && cachedInsights.length > 0 && !options?.deepAnalysis) {
    // Use cached insights (less than 7 days old)
    tier3 = cachedInsights as IntelligenceInsight[];
    fromCache = true;
  } else if (options?.deepAnalysis) {
    // Run fresh Tier 3
    tier3 = await tier3_DeepAnalysis(businessId, "full_business");
  }

  return {
    insights: [...tier1, ...tier3].sort((a, b) => b.impact - a.impact),
    fromCache,
  };
}
