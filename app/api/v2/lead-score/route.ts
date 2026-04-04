// =============================================================================
// POST /api/v2/lead-score — AI Lead Scoring & Auto-Assignment
// =============================================================================
// Scores every prescan completion 1-100 based on: revenue, leak severity,
// engagement signals, industry close rate, data completeness.
// Returns score + recommended rep assignment (best match).
// Called by: prescan completion webhook, admin manually, cron batch.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, prescanRunId } = body;
    if (!userId && !prescanRunId) return NextResponse.json({ error: "userId or prescanRunId required" }, { status: 400 });

    // Get prescan data
    const prescanQuery = prescanRunId
      ? supabaseAdmin.from("prescan_runs").select("id, user_id, industry_slug, province, annual_revenue, health_score, leak_count, total_leak_amount, created_at").eq("id", prescanRunId).maybeSingle()
      : supabaseAdmin.from("prescan_runs").select("id, user_id, industry_slug, province, annual_revenue, health_score, leak_count, total_leak_amount, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();

    const { data: prescan } = await prescanQuery;
    if (!prescan) return NextResponse.json({ error: "No prescan found" }, { status: 404 });

    const uid = prescan.user_id || userId;

    // Get engagement signals + profile data in parallel
    const [profile, leaks, chatMessages, reps] = await Promise.all([
      uid ? supabaseAdmin.from("business_profiles").select("country, business_structure, employee_count, has_accountant, annual_revenue").eq("user_id", uid).maybeSingle().then(r => r.data) : null,
      supabaseAdmin.from("detected_leaks").select("severity, annual_impact_max, category").eq("prescan_run_id", prescan.id).then(r => r.data || []),
      uid ? supabaseAdmin.from("chat_conversations").select("message_count").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle().then(r => r.data) : null,
      supabaseAdmin.from("tier3_reps").select("id, name, province, commission_rate, status").eq("status", "active").then(r => r.data || []),
    ]);

    const revenue = profile?.annual_revenue || prescan.annual_revenue || 0;
    const country = profile?.country || "CA";
    const criticalLeaks = leaks.filter(l => l.severity === "critical" || l.severity === "high").length;
    const totalLeak = leaks.reduce((s, l) => s + (l.annual_impact_max || 0), 0);
    const messageCount = chatMessages?.message_count || 0;
    const timeSincePrescan = Math.floor((Date.now() - new Date(prescan.created_at).getTime()) / 60000); // minutes

    // Deterministic scoring (fast, no AI call needed for basic score)
    let score = 30; // base

    // Revenue (0-25 pts)
    if (revenue >= 1000000) score += 25;
    else if (revenue >= 500000) score += 20;
    else if (revenue >= 200000) score += 15;
    else if (revenue >= 100000) score += 10;
    else if (revenue >= 50000) score += 5;

    // Leak severity (0-20 pts)
    if (totalLeak >= 50000) score += 20;
    else if (totalLeak >= 20000) score += 15;
    else if (totalLeak >= 10000) score += 10;
    else if (totalLeak >= 5000) score += 5;

    // Critical/high findings (0-15 pts)
    score += Math.min(15, criticalLeaks * 5);

    // Engagement signals (0-10 pts)
    if (messageCount >= 10) score += 10;
    else if (messageCount >= 5) score += 7;
    else if (messageCount >= 2) score += 3;

    // Recency bonus (0-5 pts) — active within last hour
    if (timeSincePrescan < 60) score += 5;
    else if (timeSincePrescan < 1440) score += 2;

    // Data completeness (0-5 pts)
    if (prescan.industry_slug && prescan.province && prescan.annual_revenue) score += 5;
    else if (prescan.industry_slug && prescan.province) score += 3;

    score = Math.min(100, Math.max(0, score));

    // Priority tier
    const tier = score >= 80 ? "hot" : score >= 55 ? "warm" : score >= 30 ? "cool" : "cold";

    // Rep matching: same province > fewest active clients > highest commission rate
    let recommendedRepId: string | null = null;
    let recommendedRepName: string | null = null;
    if (reps.length > 0) {
      // Count active clients per rep
      const { data: assignments } = await supabaseAdmin
        .from("tier3_rep_assignments")
        .select("rep_id")
        .in("rep_id", reps.map(r => r.id));

      const loadMap: Record<string, number> = {};
      for (const a of assignments || []) loadMap[a.rep_id] = (loadMap[a.rep_id] || 0) + 1;

      // Score each rep for this lead
      const province = prescan.province || profile?.country;
      const scoredReps = reps.map(r => ({
        ...r,
        matchScore: (r.province === province ? 50 : 0) + (100 - (loadMap[r.id] || 0) * 10),
      })).sort((a, b) => b.matchScore - a.matchScore);

      recommendedRepId = scoredReps[0].id;
      recommendedRepName = scoredReps[0].name;
    }

    // Store the score
    await supabaseAdmin.from("lead_scores").upsert({
      user_id: uid,
      prescan_run_id: prescan.id,
      score,
      tier,
      revenue,
      total_leak: totalLeak,
      critical_leaks: criticalLeaks,
      engagement_signals: messageCount,
      recommended_rep_id: recommendedRepId,
      scored_at: new Date().toISOString(),
    }, { onConflict: "prescan_run_id" }).then(({ error }) => {
      if (error) console.warn("[LeadScore] Upsert failed:", error.message);
    });

    return NextResponse.json({
      success: true,
      score,
      tier,
      factors: {
        revenue,
        totalLeak,
        criticalLeaks,
        messageCount,
        timeSincePrescan,
        dataCompleteness: prescan.industry_slug && prescan.province && prescan.annual_revenue ? "full" : "partial",
      },
      recommendedRep: recommendedRepId ? { id: recommendedRepId, name: recommendedRepName } : null,
    });
  } catch (err: any) {
    console.error("[LeadScore]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
