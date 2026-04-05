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
import { buildChatContext } from "@/lib/ai/chat-context";

export const maxDuration = 30;

const _contextCache = new Map<string, { data: any; ts: number }>();
const CONTEXT_TTL = 120_000; // 2 minutes

async function getCachedContext(userId: string) {
  const cached = _contextCache.get(userId);
  if (cached && Date.now() - cached.ts < CONTEXT_TTL) return cached.data;
  const fresh = await buildChatContext(userId);
  _contextCache.set(userId, { data: fresh, ts: Date.now() });
  // Prevent memory leak — cap cache at 100 entries
  if (_contextCache.size > 100) {
    const oldest = [..._contextCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) _contextCache.delete(oldest[0]);
  }
  return fresh;
}

const _rl = new Map<string, { c: number; r: number }>();
function rlCheck(key: string): boolean {
  const now = Date.now(), e = _rl.get(key);
  if (!e || e.r < now) { _rl.set(key, { c: 1, r: now + 60000 }); return true; }
  return ++e.c <= 20;
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    if (!rlCheck(userId)) return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 });

    const { message, history, getStarters } = await req.json();

    // If just requesting starters (no message), return them
    const { systemContext, starters, repName, calendlyUrl, memories } = await getCachedContext(userId);

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
