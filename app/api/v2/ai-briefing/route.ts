// =============================================================================
// GET /api/v2/ai-briefing — Proactive Daily Briefing
// =============================================================================
// Returns 2-4 bullet points using SIMPLE LOGIC (no AI call) based on:
// - Overdue obligations & penalty exposure
// - Health score changes
// - Recovery progress
// - Upcoming deadlines (within 7 days)
// - New leaks detected in last 30 days
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Look up businessId
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id")
      .eq("user_id", userId)
      .maybeSingle();

    const businessId = profile?.business_id;

    // Parallel queries — all wrapped in try/catch for resilience
    const [obligations, scores, leaks, progress] = await Promise.all([
      // Overdue & upcoming obligations
      (async () => {
        try {
          const { data } = await supabaseAdmin
            .from("user_obligations")
            .select("obligation_slug, status, next_deadline, penalty_amount, obligation_rules(title, penalty_max)")
            .eq("user_id", userId)
            .order("next_deadline");
          return data || [];
        } catch { return []; }
      })(),

      // Health score history (last 2 runs)
      (async () => {
        try {
          const q = businessId
            ? supabaseAdmin.from("prescan_runs").select("health_score, created_at").eq("business_id", businessId)
            : supabaseAdmin.from("prescan_runs").select("health_score, created_at").eq("user_id", userId);
          const { data } = await q.order("created_at", { ascending: false }).limit(2);
          return data || [];
        } catch { return []; }
      })(),

      // Detected leaks
      (async () => {
        try {
          const { data } = await supabaseAdmin
            .from("detected_leaks")
            .select("id, title, severity, annual_impact_max, status, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
          return data || [];
        } catch { return []; }
      })(),

      // Recovery progress
      (async () => {
        try {
          const { data } = await supabaseAdmin
            .from("user_progress")
            .select("total_recovered, total_available, tasks_completed")
            .eq("user_id", userId)
            .maybeSingle();
          return data;
        } catch { return null; }
      })(),
    ]);

    const insights: { icon: string; text: string; chatPrompt?: string }[] = [];

    // 1. Overdue obligations
    const overdue = (obligations as any[]).filter((o: any) => o.status === "overdue");
    if (overdue.length > 0) {
      const totalPenalty = overdue.reduce((s: number, o: any) => {
        return s + ((o as any).penalty_amount || (o as any).obligation_rules?.penalty_max || 0);
      }, 0);
      insights.push({
        icon: "\u26a0\ufe0f",
        text: `You have ${overdue.length} overdue obligation${overdue.length > 1 ? "s" : ""} totaling $${totalPenalty.toLocaleString()} in penalty exposure`,
        chatPrompt: "What are my overdue obligations and how can I resolve them quickly?",
      });
    }

    // 2. Health score change
    if (scores.length >= 2) {
      const current = scores[0].health_score;
      const previous = scores[1].health_score;
      const delta = current - previous;
      if (delta !== 0) {
        insights.push({
          icon: delta > 0 ? "\ud83d\udcc8" : "\ud83d\udcc9",
          text: `Your health score ${delta > 0 ? "improved" : "dropped"} ${Math.abs(delta)} point${Math.abs(delta) !== 1 ? "s" : ""} to ${current}/100`,
          chatPrompt: `Why did my health score ${delta > 0 ? "improve" : "drop"} by ${Math.abs(delta)} points?`,
        });
      }
    }

    // 3. Recovery progress
    if (progress && progress.total_available > 0) {
      const recovered = progress.total_recovered || 0;
      const available = progress.total_available || 0;
      const pct = Math.round((recovered / available) * 100);
      insights.push({
        icon: "\ud83d\udcb0",
        text: `$${recovered.toLocaleString()} recovered so far \u2014 ${pct}% of identified leaks`,
        chatPrompt: "What leaks should I prioritize recovering next?",
      });
    }

    // 4. Upcoming deadlines (within 7 days)
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 86400000);
    const upcoming = (obligations as any[]).filter((o: any) => {
      if (!o.next_deadline || o.status === "completed") return false;
      const d = new Date(o.next_deadline);
      return d >= now && d <= sevenDays;
    });
    if (upcoming.length > 0) {
      const first = upcoming[0];
      const title = (first as any).obligation_rules?.title || first.obligation_slug;
      const daysLeft = Math.ceil((new Date(first.next_deadline).getTime() - now.getTime()) / 86400000);
      insights.push({
        icon: "\ud83d\udcc5",
        text: `${title} due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
        chatPrompt: `Tell me about the upcoming ${title} deadline and what I need to prepare.`,
      });
    }

    // 5. New leaks in last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const newLeaks = leaks.filter((l: any) => {
      return new Date(l.created_at).getTime() > thirtyDaysAgo.getTime() && l.status !== "fixed" && l.status !== "dismissed";
    });
    if (newLeaks.length > 0 && insights.length < 4) {
      insights.push({
        icon: "\ud83d\udd0d",
        text: `${newLeaks.length} new issue${newLeaks.length > 1 ? "s" : ""} detected this month`,
        chatPrompt: "What new issues were detected this month and how serious are they?",
      });
    }

    // Fallback if no insights
    if (insights.length === 0) {
      insights.push({
        icon: "\u2705",
        text: "Everything looks good \u2014 no urgent items today",
      });
    }

    return NextResponse.json({
      success: true,
      briefing: {
        date: now.toISOString().split("T")[0],
        insights: insights.slice(0, 4),
      },
    });
  } catch (err: any) {
    console.error("[ai-briefing]", err.message);
    return NextResponse.json({ success: false, error: "Failed to generate briefing" }, { status: 500 });
  }
}
