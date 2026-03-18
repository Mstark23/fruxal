// =============================================================================
// POST /api/cron/rescan — Monthly auto-rescan for all businesses
// =============================================================================
// Schedule via Vercel Cron: "0 3 1 * *" (1st of every month at 3am UTC)
// Requires: Authorization: Bearer CRON_SECRET
//
// TODO: Wire to V3 prescan engine once paid tiers are live.
//       Currently stubs — no paid users exist yet.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const maxDuration = 300; // Vercel function timeout (seconds)

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Count businesses that have prescan data (future: rescan them)
    const { count } = await supabase
      .from("prescan_runs")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      message: "Rescan cron triggered (V3 engine not yet wired for auto-rescan)",
      businesses_with_prescans: count || 0,
      scanned: 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
