// =============================================================================
// app/api/v2/cron/benchmarks/route.ts
// Nightly recomputation of benchmark_aggregates from benchmark_contributions.
// Runs at 3am UTC — after all diagnostics have been contributed.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  return (
    req.headers.get("x-vercel-cron") === "1" ||
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}` ||
    process.env.NODE_ENV === "development"
  );
}

export async function GET(req: NextRequest) { return POST(req); }

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();

  try {
    // Run the nightly aggregation RPC
    const { error } = await supabaseAdmin.rpc("recompute_benchmark_aggregates");

    if (error) {
      console.error("[BenchmarkCron] Aggregation failed:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Count results for logging
    const { count: aggCount } = await supabaseAdmin
      .from("benchmark_aggregates")
      .select("*", { count: "exact", head: true });

    const { count: contribCount } = await supabaseAdmin
      .from("benchmark_contributions")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      aggregates_computed: aggCount ?? 0,
      total_contributions: contribCount ?? 0,
      took_ms: Date.now() - start,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
