// =============================================================================
// app/api/v2/recovery/route.ts
// GET  /api/v2/recovery?businessId=XXX  — live recovery totals
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 15;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    // IDOR: verify ownership
    const { data: biz } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (!biz) {
      const { data: prof } = await supabaseAdmin
        .from("business_profiles")
        .select("business_id")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .maybeSingle();
      if (!prof) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // ── Live totals from diagnostic_tasks ────────────────────────────────────
    const { data: tasks, error } = await supabaseAdmin
      .from("diagnostic_tasks")
      .select("status, savings_monthly, completed_at, created_at")
      .eq("business_id", businessId)
      .neq("status", "dismissed");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = tasks || [];

    const savings_recovered = rows
      .filter(t => t.status === "done")
      .reduce((s, t) => s + (t.savings_monthly ?? 0), 0);

    const savings_available = rows
      .filter(t => t.status === "open" || t.status === "in_progress")
      .reduce((s, t) => s + (t.savings_monthly ?? 0), 0);

    const tasks_completed = rows.filter(t => t.status === "done").length;
    const tasks_open = rows.filter(t => t.status === "open" || t.status === "in_progress").length;

    // Monthly delta: this month's completed tasks vs last month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthRecovered = rows
      .filter(t => t.status === "done" && t.completed_at && new Date(t.completed_at) >= thisMonthStart)
      .reduce((s, t) => s + (t.savings_monthly ?? 0), 0);

    const lastMonthRecovered = rows
      .filter(t => {
        if (t.status !== "done" || !t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d >= lastMonthStart && d < thisMonthStart;
      })
      .reduce((s, t) => s + (t.savings_monthly ?? 0), 0);

    // Months on platform (since first task created)
    const firstTask = rows
      .map(t => t.created_at ? new Date(t.created_at).getTime() : Infinity)
      .reduce((min, t) => Math.min(min, t), Infinity);

    const months_on_platform = firstTask === Infinity
      ? 0
      : Math.max(1, Math.round((Date.now() - firstTask) / (30 * 24 * 60 * 60 * 1000)));

    return NextResponse.json({
      savings_recovered:    Math.round(savings_recovered),
      savings_available:    Math.round(savings_available),
      tasks_completed,
      tasks_open,
      monthly_delta:        Math.round(thisMonthRecovered - lastMonthRecovered),
      this_month_recovered: Math.round(thisMonthRecovered),
      months_on_platform,
      annualized_savings:   Math.round(savings_recovered * 12),
      all_time_recovered:   Math.round(savings_recovered),
    });
  } catch (err: any) {
    console.error("[Recovery GET]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
