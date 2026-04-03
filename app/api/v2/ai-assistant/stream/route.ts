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
  const [profile, leaks, progress, pipeline] = await Promise.all([
    supabaseAdmin.from("business_profiles").select("business_name, industry, province, country, annual_revenue, employee_count, business_structure").eq("user_id", userId).maybeSingle().then(r => r.data),
    supabaseAdmin.from("detected_leaks").select("title, severity, category, annual_impact_min, annual_impact_max, status").eq("user_id", userId).order("annual_impact_max", { ascending: false }).limit(8).then(r => r.data || []),
    supabaseAdmin.from("user_progress").select("total_recovered, total_available").eq("user_id", userId).maybeSingle().then(r => r.data),
    supabaseAdmin.from("tier3_pipeline").select("stage, tier3_rep_assignments(tier3_reps(name, calendly_url))").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle().then(r => r.data),
  ]);

  const country = profile?.country || "CA";
  const isUS = country === "US";
  const repName = (pipeline as any)?.tier3_rep_assignments?.[0]?.tier3_reps?.name;
  const calendlyUrl = (pipeline as any)?.tier3_rep_assignments?.[0]?.tier3_reps?.calendly_url;

  // Build smart starter questions based on their data
  const starters: string[] = [];
  if (leaks.length > 0) {
    const topLeak = leaks[0];
    starters.push(`What does "${topLeak.title}" mean for my business?`);
    if (leaks.length > 1) starters.push(`Which leak should I fix first?`);
  }
  if ((progress?.total_available || 0) > 0 && (progress?.total_recovered || 0) === 0) {
    starters.push("How does the recovery process work?");
  }
  if ((progress?.total_recovered || 0) > 0) {
    starters.push("What's my recovery progress so far?");
  }
  starters.push(isUS ? "What tax credits do I qualify for?" : "What government programs can I access?");
  if (!repName) starters.push("When will I be assigned a rep?");

  return {
    systemContext: `
BUSINESS: ${profile?.business_name || "Unknown"} (${profile?.industry || "Unknown"}, ${profile?.province || "?"} ${country})
Revenue: $${(profile?.annual_revenue || 0).toLocaleString()} | Employees: ${profile?.employee_count ?? 0}
${repName ? `Rep: ${repName}` : "No rep assigned yet"}

LEAKS (${leaks.length}):
${leaks.slice(0, 6).map(l => `- [${l.severity}] ${l.title}: $${(l.annual_impact_max || l.annual_impact_min || 0).toLocaleString()}/yr [${l.status}]`).join("\n") || "None."}

RECOVERY: $${(progress?.total_recovered || 0).toLocaleString()} recovered / $${(progress?.total_available || 0).toLocaleString()} available

Country: ${isUS ? "US" : "Canada"} — use ${isUS ? "IRS/CPA" : "CRA/accountant"} terminology
`.trim(),
    starters,
    repName,
    calendlyUrl,
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

    if (getStarters) {
      return new Response(JSON.stringify({ success: true, starters, repName, calendlyUrl }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!message?.trim()) return new Response(JSON.stringify({ error: "Message required" }), { status: 400 });

    const memories = await loadMemories({ userId });
    const memoryBlock = formatMemoriesForPrompt(memories);

    const systemPrompt = `You are the Fruxal AI Assistant — a financial advisor embedded in the customer's dashboard.

${systemContext}
${memoryBlock}

RULES:
1. Keep answers to 2-4 sentences. Be direct and specific.
2. Always cite actual dollar amounts.
3. Explain leaks in THEIR context (industry, revenue).
4. Give the exact first step to fix something — not a list.
5. Never name specific vendors. Say "your rep can connect you."
6. Be warm but professional. No emojis.
7. End with a single actionable next step.

AFTER YOUR RESPONSE, on a new line, add exactly 3 suggested follow-up questions the user might ask next. Format them as:
[SUGGEST]Question 1[/SUGGEST]
[SUGGEST]Question 2[/SUGGEST]
[SUGGEST]Question 3[/SUGGEST]

Make suggestions specific to what was just discussed. Never generic.`;

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

          // Clean response text (remove suggestion tags)
          const cleanText = fullText.replace(/\[SUGGEST\].*?\[\/SUGGEST\]/g, "").trim();

          // Send final metadata
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, suggestions, repName, calendlyUrl })}\n\n`));
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
