// =============================================================================
// PRESCAN → PAID PLATFORM BRIDGE
// =============================================================================
// Converts prescan results into detected_leaks + layer_scores
// so the paid dashboard is pre-populated from day one.
//
// Flow: User takes prescan → signs up → this bridge runs → dashboard has data
// =============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const _ip_bridgeRl = new Map<string, {c: number; r: number}>();
function ip_bridgeCheck(ip: string): boolean {
  const now = Date.now();
  const e = _ip_bridgeRl.get(ip);
  if (!e || e.r < now) { _ip_bridgeRl.set(ip, {c: 1, r: now + 3600000}); return true; }
  e.c++; return e.c <= 10;
}



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Category → Layer Mapping ────────────────────────────────────────────────
// Each prescan leak category maps to one or more intelligence layers
const CATEGORY_TO_LAYERS: Record<string, string[]> = {
  "Revenue Leak":      ["catalyst", "quantum"],
  "Cost Leak":         ["phantom", "substrate"],
  "Marketing Leak":    ["axiom", "phantom"],
  "Operational Leak":  ["graviton", "nexus"],
  "Cash Flow Leak":    ["omega", "quantum"],
  "Tax Leak":          ["sentinel", "advanced_tracking"],
  "Compliance Leak":   ["sentinel"],
  "Pricing Leak":      ["catalyst", "paradox"],
  "People Leak":       ["phantom", "genesis"],
  "Technology Leak":   ["axiom", "nexus"],
  "Vendor Leak":       ["substrate", "void"],
  "Growth Leak":       ["catalyst", "apex"],
};

// ─── Severity mapping ────────────────────────────────────────────────────────
function mapSeverity(impactMonthly: number): string {
  if (impactMonthly > 3000) return "critical";
  if (impactMonthly > 1500) return "high";
  if (impactMonthly > 500) return "medium";
  return "low";
}

export async function POST(request: Request) {
  const _ip_ip_bridge = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!ip_bridgeCheck(_ip_ip_bridge)) return NextResponse.json({error: "Too many requests"}, {status: 429});
  try {
    const body = await request.json();
    const { businessId, userId, prescanResults } = body;

    if (!businessId || !prescanResults) {
      return NextResponse.json(
        { error: "businessId and prescanResults required" },
        { status: 400 }
      );
    }

    const { industry, confirmedLeaks, probableLeaks, possibleLeaks, summary } = prescanResults;

    // Combine all leaks with their confidence level
    const allLeaks = [
      ...(confirmedLeaks || []).map((l: any) => ({ ...l, confidence: "confirmed" })),
      ...(probableLeaks || []).map((l: any) => ({ ...l, confidence: "probable" })),
      ...(possibleLeaks || []).map((l: any) => ({ ...l, confidence: "possible" })),
    ];

    if (allLeaks.length === 0) {
      return NextResponse.json({ message: "No leaks to bridge", bridged: 0 });
    }

    // ─── 1. Convert prescan leaks → detected_leaks ────────────────────────────
    const detectedLeaks = allLeaks.map((leak: any) => {
      const category = leak.category || "Revenue Leak";
      const layers = CATEGORY_TO_LAYERS[category] || ["omega"];
      const primaryLayer = layers[0];
      const impactLow = leak.impactMonthly?.low || leak.impactMonthly?.likely ?? 0;
      const impactHigh = leak.impactMonthly?.high || leak.impactMonthly?.likely ?? 0;

      return {
        business_id: businessId,
        layer: primaryLayer,
        leak_name: leak.title || leak.description || "Unidentified leak",
        severity: leak.severity || mapSeverity(leak.impactMonthly?.likely ?? 0),
        estimated_loss_low: impactLow * 12, // Annual
        estimated_loss_high: impactHigh * 12,
        status: "OPEN",
        details: {
          source: "prescan",
          confidence: leak.confidence,
          category: category,
          mapped_layers: layers,
          industry: industry?.id || industry,
          monthly_impact: leak.impactMonthly,
          description: leak.description,
          fix: leak.fix,
          pattern_id: leak.id,
        },
      };
    });

    // Insert detected leaks
    const { data: insertedLeaks, error: leakError } = await supabase
      .from("detected_leaks")
      .insert(detectedLeaks)
      .select("id, layer");

    if (leakError) {
      console.error("Failed to insert detected leaks:", leakError);
      return NextResponse.json(
        { error: "Failed to bridge leaks: " + leakError.message },
        { status: 500 }
      );
    }

    // ─── 2. Calculate layer_scores from bridged leaks ─────────────────────────
    const layerStats: Record<string, { count: number; lossLow: number; lossHigh: number }> = {};

    for (const leak of detectedLeaks) {
      const layers = leak.details.mapped_layers as string[];
      for (const layer of layers) {
        if (!layerStats[layer]) {
          layerStats[layer] = { count: 0, lossLow: 0, lossHigh: 0 };
        }
        layerStats[layer].count++;
        layerStats[layer].lossLow += leak.estimated_loss_low;
        layerStats[layer].lossHigh += leak.estimated_loss_high;
      }
    }

    // Upsert layer scores
    const layerScoreRows = Object.entries(layerStats).map(([layer, stats]) => ({
      business_id: businessId,
      layer,
      score: Math.max(0, 100 - stats.count * 8), // More leaks = lower score
      leaks_found: stats.count,
      total_loss_low: stats.lossLow,
      total_loss_high: stats.lossHigh,
    }));

    const { error: scoreError } = await supabase
      .from("layer_scores")
      .upsert(layerScoreRows, { onConflict: "business_id,layer" });

    if (scoreError) {
      console.error("Failed to upsert layer scores:", scoreError);
    }

    // ─── 3. Store bridge metadata ─────────────────────────────────────────────
    const bridgeSummary = {
      totalLeaksBridged: detectedLeaks.length,
      confirmedBridged: confirmedLeaks?.length ?? 0,
      probableBridged: probableLeaks?.length ?? 0,
      possibleBridged: possibleLeaks?.length ?? 0,
      layersPopulated: Object.keys(layerStats).length,
      totalAnnualLossLow: detectedLeaks.reduce((s: number, l: any) => s + l.estimated_loss_low, 0),
      totalAnnualLossHigh: detectedLeaks.reduce((s: number, l: any) => s + l.estimated_loss_high, 0),
      layerBreakdown: Object.entries(layerStats).map(([layer, stats]) => ({
        layer,
        leaks: stats.count,
        annualLossRange: `$${(stats.lossLow ?? 0).toLocaleString()} - $${(stats.lossHigh ?? 0).toLocaleString()}`,
      })),
    };

    return NextResponse.json({
      message: "Prescan results bridged to paid platform",
      bridged: detectedLeaks.length,
      layers: Object.keys(layerStats).length,
      summary: bridgeSummary,
    });

  } catch (error: any) {
    console.error("Bridge error:", error);
    return NextResponse.json(
      { error: "Bridge failed: " + (error.message || "unknown") },
      { status: 500 }
    );
  }
}

// GET: Check bridge status for a business
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    // Get detected leaks from prescan
    const { data: leaks } = await supabase
      .from("detected_leaks")
      .select("*")
      .eq("business_id", businessId)
      .eq("status", "OPEN")
      .order("estimated_loss_high", { ascending: false });

    // Get layer scores
    const { data: scores } = await supabase
      .from("layer_scores")
      .select("*")
      .eq("business_id", businessId)
      .order("total_loss_high", { ascending: false });

    const prescanLeaks = (leaks || []).filter(
      (l: any) => l.details?.source === "prescan"
    );

    return NextResponse.json({
      bridged: prescanLeaks.length > 0,
      totalLeaks: leaks?.length ?? 0,
      prescanLeaks: prescanLeaks.length,
      layers: scores || [],
      leaks: leaks || [],
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to check bridge: " + error.message },
      { status: 500 }
    );
  }
}
