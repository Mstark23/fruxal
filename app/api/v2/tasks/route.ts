// =============================================================================
// app/api/v2/tasks/route.ts
// GET  /api/v2/tasks?businessId=XXX  — fetch tasks with savings totals
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const sp = req.nextUrl.searchParams;
    const businessId = sp.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    // IDOR: verify caller owns this business
    const { data: biz } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (!biz) {
      // Fallback: check business_profiles
      const { data: prof } = await supabaseAdmin
        .from("business_profiles")
        .select("business_id")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!prof) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    // Fetch tasks — open/in_progress first, then done, excluding dismissed
    const { data: tasks, error } = await supabaseAdmin
      .from("diagnostic_tasks")
      .select("id, business_id, report_id, title, action, why, savings_monthly, effort, time_to_implement, solution_name, solution_url, category, priority, status, completed_at, created_at, updated_at")
      .eq("business_id", businessId)
      .neq("status", "dismissed")
      .order("status", { ascending: true })     // open < in_progress < done alphabetically
      .order("priority", { ascending: true })
      .order("savings_monthly", { ascending: false });

    if (error) {
      console.error("[Tasks GET]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const taskList = tasks || [];

    // Calculate savings totals
    const total_savings_available = taskList
      .filter((t) => t.status === "open" || t.status === "in_progress")
      .reduce((sum, t) => sum + (t.savings_monthly ?? 0), 0);

    const total_savings_recovered = taskList
      .filter((t) => t.status === "done")
      .reduce((sum, t) => sum + (t.savings_monthly ?? 0), 0);

    return NextResponse.json({
      tasks: taskList,
      total_savings_available: Math.round(total_savings_available),
      total_savings_recovered: Math.round(total_savings_recovered),
      counts: {
        open: taskList.filter((t) => t.status === "open").length,
        in_progress: taskList.filter((t) => t.status === "in_progress").length,
        done: taskList.filter((t) => t.status === "done").length,
      },
    });
  } catch (err: any) {
    console.error("[Tasks GET] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
