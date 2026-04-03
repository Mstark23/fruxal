// =============================================================================
// POST /api/v2/ai-assistant/stream — Streaming AI Assistant
// =============================================================================
// Same context as the regular assistant but streams the response word by word.
// Also returns suggested follow-up questions after the stream ends.
// =============================================================================

import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/ai/client";
import { loadMemories, formatMemoriesForPrompt, extractAndSaveMemories } from "@/lib/ai/memory";

export const maxDuration = 30;

const _rl = new Map<string, { c: number; r: number }>();
function rlCheck(key: string): boolean {
  const now = Date.now(), e = _rl.get(key);
  if (!e || e.r < now) { _rl.set(key, { c: 1, r: now + 60000 }); return true; }
  return ++e.c <= 20;
}

async function buildContext(userId: string) {
  const [profile, leaks, progress, pipeline, obligations, anomalies, memories, recentTopics] = await Promise.all([
    supabaseAdmin.from("business_profiles").select("business_name, industry, province, country, annual_revenue, employee_count, business_structure").eq("user_id", userId).maybeSingle().then(r => r.data),
    supabaseAdmin.from("detected_leaks").select("title, severity, category, annual_impact_min, annual_impact_max, status").eq("user_id", userId).order("annual_impact_max", { ascending: false }).limit(8).then(r => r.data || []),
    supabaseAdmin.from("user_progress").select("total_recovered, total_available").eq("user_id", userId).maybeSingle().then(r => r.data),
    supabaseAdmin.from("tier3_pipeline").select("stage, tier3_rep_assignments(tier3_reps(name, calendly_url))").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle().then(r => r.data),
    supabaseAdmin.from("user_obligations").select("obligation_slug, status, next_deadline, obligation_rules(title, penalty_max)").eq("user_id", userId).in("status", ["upcoming", "overdue"]).order("next_deadline").limit(5).then(r => r.data || []),
    supabaseAdmin.from("anomaly_alerts").select("title, severity, estimated_impact").eq("user_id", userId).eq("status", "new").limit(3).then(r => r.data || []),
    loadMemories({ userId, limit: 30 }),
    // Cross-session: check what topics they've asked about most
    supabaseAdmin.from("business_memories").select("content, category").eq("user_id", userId).eq("source", "customer_chat").order("created_at", { ascending: false }).limit(20).then(r => r.data || []),
  ]);

  const country = profile?.country || "CA";
  const isUS = country === "US";
  const repName = (pipeline as any)?.tier3_rep_assignments?.[0]?.tier3_reps?.name;
  const calendlyUrl = (pipeline as any)?.tier3_rep_assignments?.[0]?.tier3_reps?.calendly_url;

  // Proactive alerts — things the AI should mention unprompted
  const proactiveAlerts: string[] = [];
  const upcomingDeadlines = (obligations as any[]).filter(o => {
    if (!o.next_deadline) return false;
    const days = Math.ceil((new Date(o.next_deadline).getTime() - Date.now()) / 86400000);
    return days <= 14;
  });
  if (upcomingDeadlines.length > 0) {
    proactiveAlerts.push(`DEADLINE ALERT: ${upcomingDeadlines.map(o => `${(o as any).obligation_rules?.title || o.obligation_slug} due ${o.next_deadline}${o.status === "overdue" ? " (OVERDUE!)" : ""} — penalty $${((o as any).obligation_rules?.penalty_max || 0).toLocaleString()}`).join("; ")}`);
  }
  if (anomalies.length > 0) {
    proactiveAlerts.push(`ANOMALY DETECTED: ${anomalies.map(a => `${a.title} (${a.severity}) — $${(a.estimated_impact || 0).toLocaleString()} impact`).join("; ")}`);
  }
  const recovered = progress?.total_recovered || 0;
  const available = progress?.total_available || 0;
  if (recovered > 0 && recovered >= available * 0.5) {
    proactiveAlerts.push(`MILESTONE: Client has recovered 50%+ of identified savings ($${recovered.toLocaleString()} of $${available.toLocaleString()})`);
  }

  // Cross-session intelligence: detect repeated topics
  const topicCounts: Record<string, number> = {};
  for (const m of recentTopics) {
    const words = m.content.toLowerCase();
    for (const topic of ["processing", "insurance", "tax", "fee", "accountant", "rep", "deadline", "program", "grant"]) {
      if (words.includes(topic)) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  }
  const repeatedTopics = Object.entries(topicCounts).filter(([, c]) => c >= 3).map(([t]) => t);

  // Build smart starters based on proactive data
  const starters: string[] = [];
  if (anomalies.length > 0) {
    starters.push(`What's going on with the ${anomalies[0].title.toLowerCase()}?`);
  }
  if (upcomingDeadlines.length > 0 && upcomingDeadlines[0].status === "overdue") {
    starters.push(`My ${(upcomingDeadlines[0] as any).obligation_rules?.title || "filing"} is overdue — what do I do?`);
  } else if (upcomingDeadlines.length > 0) {
    starters.push(`What do I need to do before my ${(upcomingDeadlines[0] as any).obligation_rules?.title || "deadline"}?`);
  }
  if (leaks.length > 0) {
    starters.push(`What does "${leaks[0].title}" mean for my business?`);
    if (leaks.length > 1) starters.push("Which leak should I fix first?");
  }
  if (recovered > 0) {
    starters.push("What's my recovery progress so far?");
  } else if (available > 0) {
    starters.push("How does the recovery process work?");
  }
  starters.push(isUS ? "What tax credits do I qualify for?" : "What government programs can I access?");

  const memoryBlock = formatMemoriesForPrompt(memories);

  return {
    systemContext: `
BUSINESS: ${profile?.business_name || "Unknown"} (${profile?.industry || "Unknown"}, ${profile?.province || "?"} ${country})
Revenue: $${(profile?.annual_revenue || 0).toLocaleString()} | Employees: ${profile?.employee_count ?? 0}
Structure: ${profile?.business_structure || "Unknown"}
${repName ? `Rep: ${repName}` : "No rep assigned yet"}

LEAKS (${leaks.length}):
${leaks.slice(0, 6).map(l => `- [${l.severity}] ${l.title}: $${(l.annual_impact_max || l.annual_impact_min || 0).toLocaleString()}/yr [${l.status}]`).join("\n") || "None."}

RECOVERY: $${recovered.toLocaleString()} recovered / $${available.toLocaleString()} available

UPCOMING DEADLINES:
${upcomingDeadlines.map(o => `- ${(o as any).obligation_rules?.title || o.obligation_slug}: ${o.next_deadline} ${o.status === "overdue" ? "OVERDUE" : ""}`).join("\n") || "None in next 14 days."}

${proactiveAlerts.length > 0 ? `\nPROACTIVE ALERTS (mention these naturally if relevant to the conversation):\n${proactiveAlerts.map(a => `- ${a}`).join("\n")}` : ""}

${repeatedTopics.length > 0 ? `\nPATTERN DETECTED: Client has asked about "${repeatedTopics.join('", "')}" multiple times across conversations. This seems important to them — prioritize these topics and acknowledge you remember their interest.` : ""}

Country: ${isUS ? "US" : "Canada"} — use ${isUS ? "IRS/CPA" : "CRA/accountant"} terminology
${memoryBlock}
`.trim(),
    starters: starters.slice(0, 5),
    repName,
    calendlyUrl,
    memories,
  };
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    if (!rlCheck(userId)) return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 });

    const { message, history, getStarters } = await req.json();

    // If just requesting starters (no message), return them
    const { systemContext, starters, repName, calendlyUrl } = await buildContext(userId);

    // Detect user tier from the businesses table
    const tierResult = await supabaseAdmin
      .from("businesses")
      .select("tier")
      .eq("user_id", userId)
      .maybeSingle();
    const tier: string = tierResult.data?.tier || "solo";

    if (getStarters) {
      let finalStarters: string[];

      if (tier === "enterprise") {
        const enterpriseStarters = [
          "Model the EBITDA impact if we fix all critical leaks",
          "What's my biggest exit readiness gap right now?",
          "Compare my margins to industry top quartile",
          "Walk me through the optimal recovery sequence",
          "What compliance risks should I flag for my board?",
          "Run a scenario: what if revenue grows 20% next year?",
        ];
        finalStarters = enterpriseStarters.sort(() => Math.random() - 0.5).slice(0, 4);
      } else if (tier === "business") {
        finalStarters = [
          "Which leak should I fix first for maximum ROI?",
          "How does my financial health compare to peers?",
          "What government programs am I eligible for?",
          "What's the status of my recovery?",
        ];
      } else {
        // solo tier — use context-aware starters if available, fallback to defaults
        finalStarters = starters.length > 0 ? starters.slice(0, 4) : [
          "What are my biggest money leaks?",
          "Do I have any overdue obligations?",
          "What free programs am I eligible for?",
          "How can I improve my health score?",
        ];
      }

      return new Response(JSON.stringify({ success: true, starters: finalStarters, repName, calendlyUrl, tier }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!message?.trim()) return new Response(JSON.stringify({ error: "Message required" }), { status: 400 });

    const memories = await loadMemories({ userId });
    const memoryBlock = formatMemoriesForPrompt(memories);

    const systemPrompt = `You are the Fruxal AI Assistant — a financial advisor embedded in the customer's dashboard. You know this business deeply and remember previous conversations.

${systemContext}

CORE RULES:
1. Keep answers to 2-4 sentences. Be direct and specific.
2. Always cite actual dollar amounts from their data.
3. Explain leaks in THEIR context (industry, revenue, province/state).
4. Give the exact first step — not a list of options.
5. Never name specific vendors. Say "your rep can connect you with the right provider."
6. Be warm but professional. No emojis.
7. End with a single actionable next step.

CONFIDENCE INDICATORS — After key dollar claims, add one of these inline tags:
- [DATA:actual] — from uploaded documents or confirmed recoveries
- [DATA:scan] — from prescan estimates (benchmarks, not exact)
- [DATA:industry] — from industry averages
Only on dollar amounts or specific claims. Use sparingly (1-2 per response max).

PROACTIVE BEHAVIOR:
- If PROACTIVE ALERTS exist above, weave them naturally into your response
- If a deadline is within 7 days, mention it even if they didn't ask
- If an anomaly was detected, bring it up: "By the way, I noticed..."
- If they've hit a recovery milestone, celebrate it

MULTI-TURN TASKS:
When the customer asks something requiring multiple steps (e.g., "help me prepare for tax filing"):
- Guide them step by step: "Let's do this together. Step 1: [action]. Ready for step 2?"
- Wait for their response before giving the next step
- Number the steps so they know progress
- End each step with a question

CROSS-SESSION MEMORY:
- Reference memories naturally: "Last time we discussed your insurance..."
- If PATTERN DETECTED above shows repeated topics, acknowledge: "I know [topic] has been on your mind..."

AFTER YOUR RESPONSE, add exactly 3 follow-up suggestions:
[SUGGEST]Question 1[/SUGGEST]
[SUGGEST]Question 2[/SUGGEST]
[SUGGEST]Question 3[/SUGGEST]
Make them specific to what was discussed. If proactive alerts exist, make one suggestion about the alert.

ACTION ITEMS:
When you recommend a specific action the user could take right now, wrap it in action tags:
[ACTION:mark_obligation|slug=gst-return]Mark GST return as filed[/ACTION]
[ACTION:create_task|title=Review insurance quotes|category=insurance]Create this as a task[/ACTION]
[ACTION:schedule_reminder|title=Follow up on SR&ED|due_date=2026-05-15]Set a reminder[/ACTION]
[ACTION:run_scenario|scenario=Fix top 3 critical leaks]Run this scenario[/ACTION]

Only add 1-2 action tags per response, and only when the action is clearly appropriate. Don't force actions.`;

    const conversationMessages = (history || []).slice(-8).map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Stream the response
    const stream = await getAnthropicClient().messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [
        ...conversationMessages,
        { role: "user", content: message },
      ],
    });

    // Create a ReadableStream that sends chunks
    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && (event.delta as any).type === "text_delta") {
              const text = (event.delta as any).text;
              fullText += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Parse suggested follow-ups from the response
          const suggestions: string[] = [];
          const suggestRegex = /\[SUGGEST\](.*?)\[\/SUGGEST\]/g;
          let match;
          while ((match = suggestRegex.exec(fullText)) !== null) {
            suggestions.push(match[1].trim());
          }

          // Parse action items from the response
          const actions: { type: string; params: Record<string, string>; label: string }[] = [];
          const actionRegex = /\[ACTION:([\w]+)\|([^\]]+)\](.*?)\[\/ACTION\]/g;
          let actionMatch;
          while ((actionMatch = actionRegex.exec(fullText)) !== null) {
            const type = actionMatch[1];
            const paramStr = actionMatch[2];
            const label = actionMatch[3].trim();
            const params: Record<string, string> = {};
            for (const pair of paramStr.split("|")) {
              const [k, ...v] = pair.split("=");
              if (k && v.length) params[k] = v.join("=");
            }
            actions.push({ type, params, label });
          }

          // Clean response text (remove suggestion and action tags)
          const cleanText = fullText
            .replace(/\[SUGGEST\].*?\[\/SUGGEST\]/g, "")
            .replace(/\[ACTION:[\w]+\|[^\]]+\].*?\[\/ACTION\]/g, "")
            .trim();

          // Send final metadata
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, suggestions, actions, repName, calendlyUrl, tier })}\n\n`));
          controller.close();

          // Extract memories in background
          extractAndSaveMemories({
            userId,
            source: "customer_chat",
            userMessage: message,
            assistantResponse: cleanText,
            existingMemories: memories,
          }).catch(() => {});

          // Save to chat history
          supabaseAdmin.from("chat_conversations").upsert({
            user_id: userId,
            messages: [...conversationMessages, { role: "user", content: message }, { role: "assistant", content: cleanText }].slice(-20),
            message_count: (conversationMessages.length + 2),
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" }).then(() => {}).catch(() => {});

        } catch (e) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
