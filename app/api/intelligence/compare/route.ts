// =============================================================================
// GET /api/intelligence/compare?businessId=xxx — Compare vs industry peers
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getIndustryComparison } from "@/services/intelligence/market-learning";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    const { data: biz } = await supabase
      .from("businesses")
      .select("industry")
      .eq("id", businessId)
      .single();

    if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const comparison = await getIndustryComparison(
      businessId,
      biz.industry?.toLowerCase() || "unknown"
    );

    return NextResponse.json(comparison);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
