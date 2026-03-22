// =============================================================================
// app/api/v2/recovery/snapshot/route.ts
// PATCH /api/v2/recovery/snapshot — upsert monthly snapshot after task completion
// Also checks milestone thresholds and sends achievement emails (deduplicated)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendMilestoneEmail } from "@/services/email/service";

export const maxDuration = 15;

// Milestones in monthly savings recovered
const MILESTONES = [100, 500, 1000, 5000, 10000];

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const userEmail = session.user.email || "";

    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    // IDOR check
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
      if (!prof) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Recalculate live totals ───────────────────────────────────────────────
    const { data: tasks } = await supabaseAdmin
      .from("diagnostic_tasks")
      .select("status, savings_monthly, completed_at, title")
      .eq("business_id", businessId)
      .neq("status", "dismissed");

    const rows = tasks || [];
    const doneTasks = rows.filter(t => t.status === "done");
    const openTasks = rows.filter(t => t.status === "open" || t.status === "in_progress");

    const savings_recovered = Math.round(doneTasks.reduce((s, t) => s + (t.savings_monthly ?? 0), 0));
    const savings_available = Math.round(openTasks.reduce((s, t) => s + (t.savings_monthly ?? 0), 0));

    // ── Upsert this month's snapshot ─────────────────────────────────────────
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setHours(0, 0, 0, 0);
    const monthStr = monthDate.toISOString().split("T")[0];

    await supabaseAdmin
      .from("recovery_snapshots")
      .upsert({
        business_id:       businessId,
        month:             monthStr,
        savings_recovered,
        savings_available,
        tasks_completed:   doneTasks.length,
        tasks_open:        openTasks.length,
        updated_at:        new Date().toISOString(),
      }, { onConflict: "business_id,month" });

    // ── Milestone email check (deduplicated via recovery_snapshots metadata) ──
    if (userEmail && savings_recovered > 0) {
      // Get previously sent milestone emails from a simple check
      const { data: sentMilestones } = await supabaseAdmin
        .from("recovery_snapshots")
        .select("milestone_sent")
        .eq("business_id", businessId)
        .not("milestone_sent", "is", null)
        .limit(1)
        .maybeSingle();

      // Read milestone_sent as a JSON array in the snapshot row
      const { data: snap } = await supabaseAdmin
        .from("recovery_snapshots")
        .select("milestone_sent")
        .eq("business_id", businessId)
        .eq("month", monthStr)
        .maybeSingle();

      const alreadySent: number[] = (snap as any)?.milestone_sent || [];

      // Find the highest milestone crossed that hasn't been emailed yet
      for (const milestone of MILESTONES) {
        if (savings_recovered >= milestone && !alreadySent.includes(milestone)) {
          // Get top done tasks for email personalization
          const topTasks = doneTasks
            .sort((a, b) => (b.savings_monthly ?? 0) - (a.savings_monthly ?? 0))
            .slice(0, 3);

          const nextOpenTask = openTasks
            .sort((a, b) => (b.savings_monthly ?? 0) - (a.savings_monthly ?? 0))[0];

          // Fire and forget — don't block the response
          sendMilestoneEmail({
            to: userEmail,
            milestone,
            savings_recovered,
            savings_available,
            annualized: savings_recovered * 12,
            top_tasks: topTasks.map(t => ({ title: t.title, savings_monthly: t.savings_monthly ?? 0 })),
            next_task: nextOpenTask ? { title: nextOpenTask.title, savings_monthly: nextOpenTask.savings_monthly ?? 0 } : null,
          }).catch(() => {});

          // Mark milestone as sent in the snapshot row
          const updatedSent = [...alreadySent, milestone];
          await supabaseAdmin
            .from("recovery_snapshots")
            .update({ milestone_sent: updatedSent })
            .eq("business_id", businessId)
            .eq("month", monthStr);

          break; // Only send one milestone email at a time
        }
      }
    }

    return NextResponse.json({
      success: true,
      savings_recovered,
      savings_available,
      tasks_completed: doneTasks.length,
      tasks_open: openTasks.length,
      annualized_savings: savings_recovered * 12,
    });
  } catch (err: any) {
    console.error("[Recovery PATCH]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
