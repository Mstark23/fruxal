// =============================================================================
// app/api/v2/diagnostic/prescan-link/route.ts
// GET /api/v2/diagnostic/prescan-link?reportId=XXX
// Fetches prescan continuity data for the diagnostic results page banner
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reportId = req.nextUrl.searchParams.get("reportId");
    if (!reportId) return NextResponse.json({ error: "reportId required" }, { status: 400 });

    const { data } = await supabaseAdmin
      .from("prescan_diagnostic_links")
      .select("leaks_confirmed, leaks_new, leaks_not_found, continuity_narrative, created_at")
      .eq("diagnostic_report_id", reportId)
      .maybeSingle();

    if (!data) return NextResponse.json(null);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
