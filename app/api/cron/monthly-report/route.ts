// =============================================================================
// POST /api/cron/monthly-report — Monthly email digest
// =============================================================================
// Schedule via Vercel Cron: "0 9 1 * *" (1st of every month at 9am UTC)
// Requires: Authorization: Bearer CRON_SECRET
//
// WIRED: V3 email service integration pending — see services/email/service.ts
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const maxDuration = 300; // Vercel function timeout (seconds)

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Count businesses that have prescan data
    const { count } = await sb
      .from("prescan_runs")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      message: "Monthly report cron triggered (email service not yet configured)",
      businesses_with_prescans: count ?? 0,
      sent: 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
