// GET /api/trends — Historical trend data
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getTrends(businessId: string, months: number) {
  // Calculate date range
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const startISO = startDate.toISOString();

  // 1. Score history
  const { data: scoreRows } = await supabaseAdmin
    .from("score_history")
    .select("score, recorded_at")
    .eq("business_id", businessId)
    .gte("recorded_at", startISO)
    .order("recorded_at", { ascending: true });

  // 2. Recovery snapshots
  const { data: recoveryRows } = await supabaseAdmin
    .from("recovery_snapshots")
    .select("savings_recovered, snapshot_month")
    .eq("business_id", businessId)
    .gte("snapshot_month", startISO)
    .order("snapshot_month", { ascending: true });

  // 3. Completed diagnostic tasks
  const { data: taskRows } = await supabaseAdmin
    .from("diagnostic_tasks")
    .select("completed_at")
    .eq("business_id", businessId)
    .eq("status", "completed")
    .not("completed_at", "is", null)
    .gte("completed_at", startISO);

  // 4. Leaks count (from diagnostic_tasks or score_history — use score_history leaks_total if available)
  const { data: leakRows } = await supabaseAdmin
    .from("score_history")
    .select("leaks_total, recorded_at")
    .eq("business_id", businessId)
    .gte("recorded_at", startISO)
    .order("recorded_at", { ascending: true });

  // Build month buckets
  const monthBuckets: Record<string, { score: number; recovered: number; tasks_completed: number; leaks_total: number }> = {};

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthBuckets[key] = { score: 0, recovered: 0, tasks_completed: 0, leaks_total: 0 };
  }

  // Helper to extract YYYY-MM from a date string
  const toMonth = (dateStr: string) => dateStr.slice(0, 7);

  // Aggregate scores — take last score per month
  for (const row of scoreRows || []) {
    const m = toMonth(row.recorded_at);
    if (monthBuckets[m] !== undefined) {
      monthBuckets[m].score = row.score ?? 0;
    }
  }

  // Aggregate recovery
  for (const row of recoveryRows || []) {
    const m = toMonth(row.snapshot_month);
    if (monthBuckets[m] !== undefined) {
      monthBuckets[m].recovered += row.savings_recovered ?? 0;
    }
  }

  // Aggregate tasks completed by month
  for (const row of taskRows || []) {
    if (!row.completed_at) continue;
    const m = toMonth(row.completed_at);
    if (monthBuckets[m] !== undefined) {
      monthBuckets[m].tasks_completed += 1;
    }
  }

  // Aggregate leaks total — take last value per month
  for (const row of leakRows || []) {
    const m = toMonth(row.recorded_at);
    if (monthBuckets[m] !== undefined && row.leaks_total != null) {
      monthBuckets[m].leaks_total = row.leaks_total;
    }
  }

  // Convert to array
  return Object.entries(monthBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}

export async function GET(req: NextRequest) {
  try {
    // Auth: resolve userId from JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const months = parseInt(req.nextUrl.searchParams.get("months") || "6");

    // Look up the user's business
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("owner_id", userId)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const trends = await getTrends(business.id, months);
    return NextResponse.json({ trends });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
