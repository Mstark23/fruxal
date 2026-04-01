// =============================================================================
// POST /api/v2/qbr-generate — Quarterly Business Review Generator
// =============================================================================
// Every 90 days, generates a full QBR for each active client:
// recovery progress, health score trend, new leaks, upcoming deadlines,
// next quarter priorities. Rep sends this — looks like custom consulting.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaude } from "@/lib/ai/client";

export const maxDuration = 60;

export async function POST(req: NextRequest, context?: any) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { pipelineId } = await req.json();
    if (!pipelineId) return NextResponse.json({ error: "pipelineId required" }, { status: 400 });

    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("user_id, company_name, industry, province, annual_revenue, stage, created_at")
      .eq("id", pipelineId)
      .single();

    if (!pipe) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const userId = pipe.user_id;
    const [profile, leaks, confirmed, progress, scoreHistory, obligations, anomalies] = await Promise.all([
      userId ? supabaseAdmin.from("business_profiles").select("country, exact_annual_revenue, employee_count, business_structure").eq("user_id", userId).maybeSingle().then(r => r.data) : null,
      supabaseAdmin.from("detected_leaks").select("title, severity, category, annual_impact_max, status, created_at").eq("user_id", userId || "").order("annual_impact_max", { ascending: false }).then(r => r.data || []),
      supabaseAdmin.from("tier3_confirmed_findings").select("leak_name, confirmed_amount, created_at").eq("engagement_id", pipelineId).then(r => r.data || []),
      userId ? supabaseAdmin.from("user_progress").select("total_recovered, total_available, tasks_completed").eq("user_id", userId).maybeSingle().then(r => r.data) : null,
      userId ? supabaseAdmin.from("prescan_runs").select("health_score, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(4).then(r => r.data || []) : [],
      userId ? supabaseAdmin.from("user_obligations").select("obligation_slug, status, next_deadline, obligation_rules(title, penalty_max)").eq("user_id", userId).order("next_deadline").limit(8).then(r => r.data || []) : [],
      userId ? supabaseAdmin.from("anomaly_alerts").select("title, severity, estimated_impact, created_at").eq("user_id", userId).eq("status", "new").limit(5).then(r => r.data || []) : [],
    ]);

    const country = profile?.country || "CA";
    const isUS = country === "US";
    const revenue = profile?.exact_annual_revenue || pipe.annual_revenue || 0;
    const totalRecovered = progress?.total_recovered || confirmed.reduce((s: number, c: any) => s + (c.confirmed_amount || 0), 0);
    const totalAvailable = progress?.total_available || leaks.reduce((s: number, l: any) => s + (l.annual_impact_max || 0), 0);
    const openLeaks = leaks.filter(l => l.status !== "fixed" && l.status !== "dismissed");
    const fixedLeaks = leaks.filter(l => l.status === "fixed");
    const newLeaks = leaks.filter(l => new Date(l.created_at).getTime() > Date.now() - 90 * 86400000);
    const daysAsClient = Math.floor((Date.now() - new Date(pipe.created_at).getTime()) / 86400000);

    const healthTrend = (scoreHistory || []).map((s: any) => `${new Date(s.created_at).toLocaleDateString("en-CA", { month: "short" })}: ${s.health_score}`).join(" → ");

    const dataBlock = `
CLIENT: ${pipe.company_name}
Industry: ${pipe.industry} | Location: ${pipe.province}, ${country}
Revenue: $${revenue.toLocaleString()} | Employees: ${profile?.employee_count ?? "?"}
Structure: ${profile?.business_structure || "?"} | Days as client: ${daysAsClient}

HEALTH SCORE TREND: ${healthTrend || "No history"}

RECOVERY SUMMARY:
- Total recovered: $${totalRecovered.toLocaleString()}
- Still available: $${(totalAvailable - totalRecovered).toLocaleString()}
- Recovery rate: ${totalAvailable > 0 ? Math.round((totalRecovered / totalAvailable) * 100) : 0}%
- Confirmed findings: ${confirmed.length}

CONFIRMED RECOVERIES:
${confirmed.map((c: any) => `- ${c.leak_name}: $${c.confirmed_amount.toLocaleString()} (${new Date(c.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })})`).join("\n") || "None yet."}

OPEN LEAKS (${openLeaks.length}):
${openLeaks.slice(0, 8).map(l => `- [${l.severity}] ${l.title}: $${(l.annual_impact_max || 0).toLocaleString()}/yr`).join("\n")}

NEW LEAKS THIS QUARTER (${newLeaks.length}):
${newLeaks.slice(0, 5).map(l => `- ${l.title}: $${(l.annual_impact_max || 0).toLocaleString()}/yr`).join("\n") || "None."}

UPCOMING DEADLINES (next 90 days):
${(obligations as any[]).filter(o => o.next_deadline).slice(0, 5).map(o => `- ${(o as any).obligation_rules?.title || o.obligation_slug}: ${o.next_deadline} ${o.status === "overdue" ? "OVERDUE" : ""}`).join("\n") || "None."}

ANOMALIES DETECTED:
${anomalies.map((a: any) => `- ${a.title} (${a.severity}): $${(a.estimated_impact || 0).toLocaleString()}`).join("\n") || "None."}
`.trim();

    const result = await callClaude({
      system: `You are writing a Quarterly Business Review (QBR) for a Fruxal client.

Write a professional, personalized QBR that the rep can email or present to the client. Format:

1. **Executive Summary** (3-4 sentences — what happened this quarter, headline number)
2. **Recovery Progress** (table format: what was found, what was recovered, what's in progress)
3. **Health Score Trend** (interpret the trend — improving, declining, stable)
4. **New Issues Detected** (any new leaks or anomalies this quarter)
5. **Upcoming Priorities** (next 90 days — what should be tackled, deadlines approaching)
6. **Recommended Next Steps** (3 specific actions for next quarter)

Rules:
- Use the client's actual numbers — never generic
- Tone: confident, professional, results-focused
- If recovery is going well, celebrate it
- If recovery is stalled, be honest but constructive
- Country: ${isUS ? "US" : "Canada"} — use appropriate terminology
- Length: 500-700 words
- Format: Markdown with headers`,
      user: dataBlock,
      maxTokens: 2000,
    });

    return NextResponse.json({ success: true, qbr: result.text, clientName: pipe.company_name });
  } catch (err: any) {
    console.error("[QBR]", err.message);
    return NextResponse.json({ error: "QBR generation failed" }, { status: 500 });
  }
}
