// =============================================================================
// GET /api/intelligence?businessId=xxx — Get insights (Tier 1 always + cached Tier 3)
// POST /api/intelligence — Trigger deep analysis (Tier 3)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getIntelligence, tier3_DeepAnalysis } from "@/services/intelligence/engine";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    // Get business industry
    const { data: biz } = await supabase
      .from("businesses")
      .select("industry")
      .eq("id", businessId)
      .single();

    const industry = biz?.industry?.toLowerCase() || "unknown";
    const result = await getIntelligence(businessId, industry);

    return NextResponse.json({
      insights: result.insights,
      fromCache: result.fromCache,
      count: result.insights.length,
      tier1Count: result.insights.filter(i => i.source === "tier1").length,
      tier3Count: result.insights.filter(i => i.source === "tier3").length,
    });
  } catch (error: any) {
    console.error("Intelligence GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, analysisType = "full_business", leakId, question } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const insights = await tier3_DeepAnalysis(businessId, analysisType, { leakId, question });

    return NextResponse.json({
      success: true,
      insights,
      count: insights.length,
      tier: 3,
      note: "Deep analysis complete. Results cached for 7 days.",
    });
  } catch (error: any) {
    console.error("Intelligence POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
