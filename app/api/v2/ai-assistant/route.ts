// =============================================================================
// POST /api/v2/ai-assistant — Dashboard AI Assistant
// =============================================================================
// Customer asks questions about their leaks, recovery, programs.
// Claude has their full business context — never generic advice.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaude } from "@/lib/ai/client";

export const maxDuration = 30;

// Rate limit: 20 messages per minute
const _rl = new Map<string, { c: number; r: number }>();
function rlCheck(key: string): boolean {
  const now = Date.now(), e = _rl.get(key);
  if (!e || e.r < now) { _rl.set(key, { c: 1, r: now + 60000 }); return true; }
  return ++e.c <= 20;
}

async function buildContext(userId: string) {
  const [profile, report, leaks, obligations, progress, pipeline] = await Promise.all([
    supabaseAdmin.from("business_profiles").select("business_name, industry, province, country, annual_revenue, employee_count, business_structure, has_accountant").eq("user_id", userId).maybeSingle().then(r => r.data),
    supabaseAdmin.from("diagnostic_reports").select("result_json, tier, overall_score, created_at").eq("user_id", userId).eq("status", "completed").order("created_at", { ascending: false }).limit(1).maybeSingle().then(r => r.data),
    supabaseAdmin.from("detected_leaks").select("title, severity, category, annual_impact_min, annual_impact_max, status").eq("user_id", userId).order("annual_impact_max", { ascending: false }).limit(10).then(r => r.data || []),
    supabaseAdmin.from("user_obligations").select("obligation_slug, status, next_deadline, obligation_rules(title, penalty_max)").eq("user_id", userId).order("next_deadline").limit(8).then(r => r.data || []),
    supabaseAdmin.from("user_progress").select("total_recovered, total_available, tasks_completed").eq("user_id", userId).maybeSingle().then(r => r.data),
    supabaseAdmin.from("tier3_pipeline").select("stage, follow_up_date, tier3_rep_assignments(tier3_reps(name, calendly_url))").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle().then(r => r.data),
  ]);

  const country = profile?.country || "CA";
  const isUS = country === "US";
  const findings = (report?.result_json as any)?.findings || [];
  const repName = (pipeline as any)?.tier3_rep_assignments?.[0]?.tier3_reps?.name;

  return `
BUSINESS PROFILE:
- Name: ${profile?.business_name || "Unknown"}
- Industry: ${profile?.industry || "Unknown"}
- Location: ${profile?.province || "Unknown"}, ${country}
- Annual Revenue: $${(profile?.annual_revenue || 0).toLocaleString()}
- Employees: ${profile?.employee_count ?? 0}
- Structure: ${profile?.business_structure || "Unknown"}
- Has Accountant: ${profile?.has_accountant ? "Yes" : "No"}
${repName ? `- Assigned Rep: ${repName}` : ""}

DIAGNOSTIC RESULTS (Score: ${report?.overall_score ?? "Not run"}/100):
${findings.slice(0, 6).map((f: any) => `- [${f.severity?.toUpperCase()}] ${f.title}: $${(f.impact_max || f.impact_min || 0).toLocaleString()}/yr — ${f.description || ""}`).join("\n") || "No diagnostic run yet."}

DETECTED LEAKS:
${leaks.slice(0, 8).map(l => `- ${l.title} (${l.severity}): $${(l.annual_impact_max || l.annual_impact_min || 0).toLocaleString()}/yr [${l.status}]`).join("\n") || "None detected."}

RECOVERY PROGRESS:
- Recovered: $${(progress?.total_recovered || 0).toLocaleString()}
- Available: $${(progress?.total_available || 0).toLocaleString()}
- Tasks Completed: ${progress?.tasks_completed || 0}

UPCOMING OBLIGATIONS (next 60 days):
${obligations.filter(o => o.next_deadline).slice(0, 5).map(o => `- ${(o as any).obligation_rules?.title || o.obligation_slug}: Due ${o.next_deadline} ${o.status === "overdue" ? "(OVERDUE)" : ""} — Penalty: $${((o as any).obligation_rules?.penalty_max || 0).toLocaleString()}`).join("\n") || "None."}

CONTEXT RULES:
- Country: ${isUS ? "US" : "Canada"} — use ${isUS ? "IRS/federal/state" : "CRA/provincial"} terminology
- Currency: ${isUS ? "USD" : "CAD"}
- Tax references: ${isUS ? "Section 179, WOTC, R&D Credit (Section 41), QBI" : "SR&ED, CCA, CDA, RDTOH, LCGE"}
- Do NOT mention specific partner/affiliate names or URLs
- Always reference their actual numbers, never generic advice
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!rlCheck(userId)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { message, history } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const context = await buildContext(userId);

    const systemPrompt = `You are the Fruxal AI Assistant — a financial advisor embedded in the customer's dashboard.

You have access to their REAL business data below. Every answer must reference their specific numbers.

${context}

BEHAVIOR RULES:
1. Keep answers to 2-4 sentences. Be direct and specific.
2. Always cite their actual dollar amounts — never say "your business" without a number.
3. If they ask about a leak, explain what it means IN THEIR CONTEXT (their industry, revenue, province/state).
4. If they ask how to fix something, give the exact first step — not a list of 5 options.
5. If they ask about programs/grants, only mention ones that apply to their location and industry.
6. Never recommend specific vendors/partners. Say "your rep can connect you with the right provider."
7. If they ask something outside your data, say "I don't have that data yet — your rep can help with that."
8. Be warm but professional. No emojis. No exclamation marks.
9. If their recovery is going well, acknowledge it genuinely.
10. Always end with a single actionable next step.`;

    const conversationHistory = (history || []).slice(-8).map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const result = await callClaude({
      system: systemPrompt,
      user: [...conversationHistory.map((m: any) => `${m.role}: ${m.content}`), `user: ${message}`].join("\n\n"),
      maxTokens: 512,
    });

    return NextResponse.json({ success: true, message: result.text });
  } catch (err: any) {
    console.error("[AI-Assistant]", err.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
