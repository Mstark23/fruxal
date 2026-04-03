// =============================================================================
// POST /api/rep/customer/[id]/ai-chat — Rep AI Assistant (per-client)
// =============================================================================
// The rep's personal strategist for each client. Knows:
// - Full diagnostic findings + severity + dollar amounts
// - Pipeline stage + history + notes
// - Affiliate solutions available per leak category
// - Commission potential + confirmed savings
// - Documents received/pending
// - Client engagement signals (calls, messages, debrief)
//
// The rep asks: "What's the fastest close path?"
//               "Which finding should I lead with on the call?"
//               "Draft a follow-up email for this client"
//               "What objections will they have about the 12% fee?"
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaude } from "@/lib/ai/client";
import { loadMemories, formatMemoriesForPrompt, extractAndSaveMemories } from "@/lib/ai/memory";

export const maxDuration = 30;

const _rl = new Map<string, { c: number; r: number }>();
function rlCheck(key: string): boolean {
  const now = Date.now(), e = _rl.get(key);
  if (!e || e.r < now) { _rl.set(key, { c: 1, r: now + 60000 }); return true; }
  return ++e.c <= 25;
}

async function buildRepContext(clientId: string, repId: string) {
  // Try as pipeline_id first, fallback to diagnostic_id
  let pipe: any = null;
  const { data: p1 } = await supabaseAdmin
    .from("tier3_pipeline")
    .select("id, user_id, company_name, industry, province, contact_name, contact_email, contact_phone, annual_revenue, stage, follow_up_date, notes, messages_json, created_at, updated_at")
    .eq("id", clientId)
    .maybeSingle();
  pipe = p1;

  if (!pipe) {
    const { data: p2 } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, user_id, company_name, industry, province, contact_name, contact_email, contact_phone, annual_revenue, stage, follow_up_date, notes, messages_json, created_at, updated_at")
      .eq("diagnostic_id", clientId)
      .maybeSingle();
    pipe = p2;
  }

  if (!pipe) return null;

  // Fetch everything in parallel
  const userId = pipe.user_id;
  const [profile, findings, confirmedFindings, documents, engagement, debriefs, partners, recommendations] = await Promise.all([
    userId ? supabaseAdmin.from("business_profiles").select("country, business_structure, exact_annual_revenue, employee_count, has_accountant, owner_salary").eq("user_id", userId).maybeSingle().then(r => r.data) : null,
    supabaseAdmin.from("detected_leaks").select("title, title_fr, severity, category, annual_impact_min, annual_impact_max, status, description").eq("user_id", userId || "").order("annual_impact_max", { ascending: false }).limit(12).then(r => r.data || []),
    supabaseAdmin.from("tier3_confirmed_findings").select("leak_name, category, confirmed_amount, confidence_note").eq("engagement_id", pipe.id).then(r => r.data || []),
    supabaseAdmin.from("tier3_engagement_documents").select("document_type, label, status").eq("engagement_id", pipe.id).then(r => r.data || []),
    supabaseAdmin.from("tier3_engagements").select("id, status, fee_percentage").eq("pipeline_id", pipe.id).maybeSingle().then(r => r.data),
    supabaseAdmin.from("call_debriefs").select("call_outcome, agreed_findings, client_concerns, notes, created_at").eq("pipeline_id", pipe.id).order("created_at", { ascending: false }).limit(3).then(r => r.data || []),
    supabaseAdmin.from("affiliate_partners").select("name, slug, category, commission_type, commission_value, description").eq("active", true).order("quality_score", { ascending: false }).limit(30).then(r => r.data || []),
    supabaseAdmin.from("affiliate_clicks").select("partner, vertical, created_at").eq("pipeline_id", pipe.id).eq("source", "rep_recommendation").then(r => r.data || []),
  ]);

  const country = profile?.country || "CA";
  const isUS = country === "US";
  const revenue = profile?.exact_annual_revenue || pipe.annual_revenue || 0;
  const feeRate = engagement?.fee_percentage || 12;
  const confirmedTotal = confirmedFindings.reduce((s: number, f: any) => s + (f.confirmed_amount || 0), 0);
  const feeOwed = Math.round(confirmedTotal * (feeRate / 100));
  const totalLeak = findings.reduce((s: number, f: any) => s + (f.annual_impact_max || f.annual_impact_min || 0), 0);

  // Map partners to leak categories
  const partnersByCategory: Record<string, string[]> = {};
  for (const p of partners) {
    if (!partnersByCategory[p.category]) partnersByCategory[p.category] = [];
    if (partnersByCategory[p.category].length < 3) partnersByCategory[p.category].push(`${p.name} (${p.commission_type === "percentage" ? `${p.commission_value}%` : `$${p.commission_value}`})`);
  }

  const daysInPipeline = Math.floor((Date.now() - new Date(pipe.created_at).getTime()) / 86400000);
  const daysSinceUpdate = Math.floor((Date.now() - new Date(pipe.updated_at).getTime()) / 86400000);

  return `
CLIENT FILE: ${pipe.company_name}
Contact: ${pipe.contact_name || "Unknown"} ${pipe.contact_email ? `<${pipe.contact_email}>` : ""} ${pipe.contact_phone || ""}
Industry: ${pipe.industry || "Unknown"} | Location: ${pipe.province}, ${country}
Revenue: $${revenue.toLocaleString()} | Employees: ${profile?.employee_count ?? "Unknown"}
Structure: ${profile?.business_structure || "Unknown"} | Has Accountant: ${profile?.has_accountant ? "Yes" : "No"}

PIPELINE STATUS:
- Stage: ${pipe.stage} (${daysInPipeline} days in pipeline, ${daysSinceUpdate} since last update)
- Follow-up: ${pipe.follow_up_date || "None set"}
- Notes: ${pipe.notes || "None"}
- Engagement: ${engagement ? `Active (${feeRate}% fee)` : "Not yet created"}

FINDINGS (${findings.length} total, $${totalLeak.toLocaleString()}/yr estimated):
${findings.slice(0, 8).map(f => `- [${f.severity?.toUpperCase()}] ${f.title}: $${(f.annual_impact_max || f.annual_impact_min || 0).toLocaleString()}/yr — ${f.description?.slice(0, 80) || ""}`).join("\n")}

CONFIRMED RECOVERIES ($${confirmedTotal.toLocaleString()} confirmed → $${feeOwed.toLocaleString()} fee owed):
${confirmedFindings.map(f => `- ${f.leak_name}: $${f.confirmed_amount.toLocaleString()} ${f.confidence_note ? `(${f.confidence_note})` : ""}`).join("\n") || "None yet."}

DOCUMENTS: ${documents.length} total — ${documents.filter((d: any) => d.status === "received" || d.status === "reviewed").length} received, ${documents.filter((d: any) => d.status === "pending" || d.status === "requested").length} pending
${documents.slice(0, 6).map(d => `- ${d.label || d.document_type}: ${d.status}`).join("\n")}

RECENT DEBRIEFS:
${debriefs.slice(0, 2).map(d => `- ${new Date(d.created_at).toLocaleDateString()}: ${d.call_outcome} — Concerns: ${d.client_concerns || "None"} — Agreed: ${(d.agreed_findings || []).length} findings`).join("\n") || "No debriefs yet."}

RECOMMENDATIONS ALREADY SENT:
${recommendations.map(r => `- ${r.partner} (${r.vertical}) — ${new Date(r.created_at).toLocaleDateString()}`).join("\n") || "None yet."}

AVAILABLE SOLUTIONS BY CATEGORY:
${Object.entries(partnersByCategory).slice(0, 8).map(([cat, partners]) => `- ${cat}: ${partners.join(", ")}`).join("\n")}

CONTEXT:
- Country: ${isUS ? "US" : "Canada"} — use ${isUS ? "IRS/CPA" : "CRA/accountant"} terminology
- Fee model: ${feeRate}% contingency on confirmed savings — client pays NOTHING upfront
- Rep commission: based on confirmed recovery fee
`.trim();
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    if (!rlCheck(auth.repId!)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { message, history } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const [context, memories] = await Promise.all([
      buildRepContext(params.id, auth.repId!),
      loadMemories({ pipelineId: params.id }),
    ]);
    if (!context) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const memoryBlock = formatMemoriesForPrompt(memories);
    const repName = auth.rep?.name || "Rep";

    const systemPrompt = `You are a Fruxal AI Strategist — ${repName}'s personal assistant for this specific client.

You have the client's COMPLETE file below. Your job is to help the rep:
1. Close the deal faster
2. Maximize confirmed recovery (more recovery = more commission)
3. Handle objections with data
4. Prioritize which findings to pursue first
5. Draft communications (emails, follow-ups, talking points)

${context}
${memoryBlock}

BEHAVIOR RULES:
- Be direct and strategic. No fluff. The rep is busy.
- Always reference the client's actual numbers.
- When asked about closing strategy, consider: their stage, concerns from debriefs, which findings they agreed to, and what documents are missing.
- When asked to draft an email/message, make it ready to send — not a template.
- For objection handling, use the client's specific numbers to counter (e.g., "At $${Math.round(12000 * 0.88).toLocaleString()} kept vs $${Math.round(12000).toLocaleString()} left on the table...").
- When recommending which finding to lead with, prioritize: highest dollar + highest confidence + easiest to explain.
- Never reveal internal commission details to draft client-facing messages.
- If asked about solutions, name the available partners from the list above.
- Keep responses to 3-5 sentences unless drafting a letter/email.`;

    const conversationHistory = (history || []).slice(-6);
    const userContent = conversationHistory.length > 0
      ? [...conversationHistory.map((m: any) => `${m.role === "assistant" ? "AI" : "Rep"}: ${m.content}`), `Rep: ${message}`].join("\n\n")
      : message;

    const result = await callClaude({
      system: systemPrompt,
      user: userContent,
      maxTokens: 800,
    });

    // Save memories in background
    extractAndSaveMemories({
      pipelineId: params.id,
      source: "rep_chat",
      userMessage: message,
      assistantResponse: result.text,
      existingMemories: memories,
    }).catch(() => {});

    return NextResponse.json({ success: true, message: result.text });
  } catch (err: any) {
    console.error("[Rep:AI-Chat]", err.message);
    return NextResponse.json({ error: "AI assistant error" }, { status: 500 });
  }
}
