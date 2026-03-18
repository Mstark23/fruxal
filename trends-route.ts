// GET /api/trends — Historical trend data
import { NextRequest, NextResponse } from "next/server";
// getTrends migrated to Supabase direct queries — stub until reimplemented
async function getTrends(businessId: string, months: number): Promise<any[]> { return []; }

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  const months = parseInt(req.nextUrl.searchParams.get("months") || "6");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    const trends = await getTrends(businessId, months);
    return NextResponse.json({ trends });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
