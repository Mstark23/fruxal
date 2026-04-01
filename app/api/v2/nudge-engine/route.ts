// =============================================================================
// POST /api/v2/nudge-engine — Proactive AI Nudge Generator
// =============================================================================
// Monitors: health score drops, deadlines approaching, anomalies detected,
// recovery stalled 30+ days, new programs available.
// Generates personalized push notifications or emails.
// Called by cron daily or on-demand.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaudeJSON } from "@/lib/ai/client";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // Auth: cron secret or admin
    const authHeader = req.headers.get("authorization");
    const isCron = req.headers.get("x-vercel-cron") === "1" || authHeader === `Bearer ${process.env.CRON_SECRET}`;
    if (!isCron && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json().catch(() => ({ userId: null }));

    // If userId specified, generate nudges for one user. Otherwise batch all active.
    const userIds: string[] = [];
    if (userId) {
      userIds.push(userId);
    } else {
      const { data: active } = await supabaseAdmin
        .from("business_profiles")
        .select("user_id")
        .not("user_id", "is", null)
        .limit(100);
      for (const u of active || []) if (u.user_id) userIds.push(u.user_id);
    }

    const nudges: any[] = [];

    for (const uid of userIds.slice(0, 50)) { // Cap at 50 per run
      try {
        const [profile, recentScores, obligations, progress, anomalies, lastNudge] = await Promise.all([
          supabaseAdmin.from("business_profiles").select("business_name, country, annual_revenue").eq("user_id", uid).maybeSingle().then(r => r.data),
          supabaseAdmin.from("prescan_runs").select("health_score, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(2).then(r => r.data || []),
          supabaseAdmin.from("user_obligations").select("obligation_slug, status, next_deadline, obligation_rules(title, penalty_max)").eq("user_id", uid).eq("status", "upcoming").order("next_deadline").limit(3).then(r => r.data || []),
          supabaseAdmin.from("user_progress").select("total_recovered, total_available, updated_at").eq("user_id", uid).maybeSingle().then(r => r.data),
          supabaseAdmin.from("anomaly_alerts").select("title, severity, estimated_impact").eq("user_id", uid).eq("status", "new").limit(3).then(r => r.data || []),
          supabaseAdmin.from("nudge_history").select("created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle().then(r => r.data),
        ]);

        // Don't nudge if we nudged within 48 hours
        if (lastNudge?.created_at && Date.now() - new Date(lastNudge.created_at).getTime() < 48 * 3600000) continue;

        const triggers: string[] = [];

        // Health score dropping
        if (recentScores.length >= 2) {
          const diff = (recentScores[0]?.health_score || 0) - (recentScores[1]?.health_score || 0);
          if (diff <= -5) triggers.push(`health_score_drop:${diff}`);
        }

        // Deadline within 14 days
        const soon = (obligations as any[]).filter(o => {
          if (!o.next_deadline) return false;
          const days = Math.ceil((new Date(o.next_deadline).getTime() - Date.now()) / 86400000);
          return days <= 14 && days >= 0;
        });
        if (soon.length > 0) triggers.push(`deadline_approaching:${soon.length}`);

        // Recovery stalled >30 days
        if (progress?.updated_at && Date.now() - new Date(progress.updated_at).getTime() > 30 * 86400000 && (progress.total_available || 0) > (progress.total_recovered || 0)) {
          triggers.push("recovery_stalled");
        }

        // Anomaly detected
        if (anomalies.length > 0) triggers.push(`anomaly_detected:${anomalies.length}`);

        if (triggers.length === 0) continue;

        // Generate personalized nudge
        const isUS = profile?.country === "US";
        const result = await callClaudeJSON<{
          nudge_type: "email" | "notification";
          subject: string;
          message: string;
          cta_text: string;
          cta_url: string;
          urgency: "high" | "medium" | "low";
        }>({
          system: `Generate a single, personalized nudge message for a Fruxal customer.

Business: ${profile?.business_name || "Unknown"} ($${(profile?.annual_revenue || 0).toLocaleString()} revenue, ${isUS ? "US" : "Canada"})
Triggers: ${triggers.join(", ")}
${soon.length > 0 ? `Upcoming deadlines: ${soon.map(o => `${(o as any).obligation_rules?.title}: ${o.next_deadline} (penalty: $${((o as any).obligation_rules?.penalty_max || 0).toLocaleString()})`).join("; ")}` : ""}
${anomalies.length > 0 ? `Anomalies: ${anomalies.map(a => `${a.title} ($${(a.estimated_impact || 0).toLocaleString()})`).join("; ")}` : ""}
Recovery: $${(progress?.total_recovered || 0).toLocaleString()} recovered / $${(progress?.total_available || 0).toLocaleString()} available

Rules:
- Keep message to 2-3 sentences max
- Reference their actual numbers
- One clear CTA
- Tone: helpful, not pushy
- Never say "we noticed" — say what happened directly
Return JSON: { nudge_type, subject, message, cta_text, cta_url, urgency }`,
          user: "Generate the nudge.",
          maxTokens: 300,
        });

        nudges.push({
          user_id: uid,
          business_name: profile?.business_name,
          triggers,
          ...result,
        });

        // Record nudge
        await supabaseAdmin.from("nudge_history").insert({
          user_id: uid,
          triggers,
          nudge_type: result.nudge_type,
          subject: result.subject,
          message: result.message,
          urgency: result.urgency,
          created_at: new Date().toISOString(),
        }).then(({ error }) => { if (error) console.warn("[Nudge] Insert:", error.message); });
      } catch (e: any) {
        console.warn(`[Nudge] Skipping user ${uid}:`, e.message);
      }
    }

    return NextResponse.json({ success: true, nudgesGenerated: nudges.length, nudges });
  } catch (err: any) {
    console.error("[NudgeEngine]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
