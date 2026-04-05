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
import { loadMemories, formatMemoriesForPrompt, extractAndSaveMemories } from "@/lib/ai/memory";
import { buildChatContext } from "@/lib/ai/chat-context";

export const maxDuration = 30;

// Rate limit: 20 messages per minute
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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!rlCheck(userId)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { message, history } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const { systemContext, memories } = await buildChatContext(userId);

    const systemPrompt = `You are the Fruxal AI Assistant — a financial advisor embedded in the customer's dashboard.

You have access to their REAL business data below. Every answer must reference their specific numbers.

${systemContext}

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

    // Extract and save new memories in background (non-blocking)
    extractAndSaveMemories({
      userId,
      source: "customer_chat",
      userMessage: message,
      assistantResponse: result.text,
      existingMemories: memories,
    }).catch(() => {}); // Never block response

    return NextResponse.json({ success: true, message: result.text });
  } catch (err: any) {
    console.error("[AI-Assistant]", err.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
