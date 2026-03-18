// =============================================================================
// src/app/api/v2/intelligence/refresh/route.ts
// =============================================================================
// CRON / ADMIN — Weekly refresh of all active business intelligence.
//
// POST with Authorization: Bearer <CRON_SECRET>
//
// Use with Vercel Cron or external scheduler:
// vercel.json: { "crons": [{ "path": "/api/v2/intelligence/refresh", "schedule": "0 6 * * 1" }] }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { refreshAllIntelligence } from "@/services/intelligence";

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    // Auth: either CRON_SECRET header or Vercel cron header
    const authHeader = req.headers.get("authorization");
    const cronHeader = req.headers.get("x-vercel-cron");
    const cronSecret = process.env.CRON_SECRET;

    const isAuthorized =
      cronHeader === "1" || // Vercel cron
      (cronSecret && authHeader === `Bearer ${cronSecret}`) || // Manual bearer token
      process.env.NODE_ENV === "development"; // Dev mode

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[Cron] Starting intelligence refresh...");

    const results = await refreshAllIntelligence();

    const changed = results.filter((r) => r.obligations_changed);
    const withPrograms = results.filter((r) => r.new_programs);

    console.log(
      `[Cron] Refreshed ${results.length} businesses. ` +
        `${changed.length} had obligation changes. ` +
        `${withPrograms.length} have new programs.`
    );

    return NextResponse.json({
      success: true,
      data: {
        total_refreshed: results.length,
        obligations_changed: changed.length,
        new_programs: withPrograms.length,
        took_ms: Date.now() - start,
        details: results,
      },
    });
  } catch (err: any) {
    console.error("[Cron] Refresh error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel cron (some cron providers use GET)
export async function GET(req: NextRequest) {
  return POST(req);
}
