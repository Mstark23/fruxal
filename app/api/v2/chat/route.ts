// =============================================================================
// V2 POST /api/v2/chat — AI Consultation with full leak profile
// =============================================================================
// Uses prompt-builder to package all user data into system prompt.
// Supports streaming responses for real-time feel.
// Saves conversation history for returning users.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";
// prompt-builder migrated to lib/ai/prompts/chat/advisor.ts
// Inline stub until migration is applied
async function buildSystemPrompt(userId: string, clientCtx?: any, scanId?: string): Promise<{ systemPrompt: string; context: any }> {
  // Build a rich system prompt using any diagnostic context passed by the client
  const businessName  = clientCtx?.businessName || "this business";
  const industry      = clientCtx?.industry || "small business";
  const province      = clientCtx?.province || "Canada";
  // Handle both field name conventions (page sends overallScore/totalLeaks, some callers send score/totalLeak)
  const rawLeak       = clientCtx?.totalLeak || clientCtx?.totalLeaks || 0;
  const rawScore      = clientCtx?.score || clientCtx?.overallScore || 0;
  const rawFindings   = clientCtx?.findings || clientCtx?.topFindings || [];
  const totalLeak     = rawLeak ? "$" + Number(rawLeak).toLocaleString() + "/yr" : "unknown amount";
  const score         = rawScore ? String(rawScore) + "/100" : "not yet calculated";
  const topFindings   = Array.isArray(rawFindings)
    ? rawFindings.slice(0, 5).map((f: any) =>
        typeof f === "string" ? "- " + f : "- " + (f.title || "") + " ($" + (f.annual_leak || f.impact_max || 0).toLocaleString() + "/yr)"
      ).join("\n")
    : "";
  const savingsAnchor = clientCtx?.savingsAnchor?.headline || clientCtx?.savingsAnchor || "";

  const systemPrompt = [
    "You are the Fruxal AI Business Advisor — a no-BS financial advisor for Canadian SMBs.",
    "You answer questions about revenue leaks, tax optimization, compliance, and business finance.",
    "Be specific, numbers-first, and actionable. Always cite Canadian context (CRA, province-specific rules).",
    "",
    "BUSINESS CONTEXT:",
    "Business: " + businessName,
    "Industry: " + industry,
    "Province: " + province,
    "Financial Health Score: " + score,
    "Annual Revenue at Risk: " + totalLeak,
    savingsAnchor ? "Key Insight: " + savingsAnchor : "",
    topFindings ? "\nTop Identified Leaks:\n" + topFindings : "",
    "",
    "Use this context to give personalized, specific advice. If asked about something outside your context, say so and give general best practice.",
  ].filter(Boolean).join("\n");

  return {
    systemPrompt,
    context: { userId, scanId, industry, province, leakCount: (clientCtx?.findings || []).length, totalLeak: clientCtx?.totalLeak || 0, industryDisplay: industry },
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limiter
const rl: Map<string, { c: number; r: number }> = new Map();
function rateCheck(key: string, max: number, ms: number): boolean {
  const now = Date.now();
  const e = rl.get(key);
  if (!e || e.r < now) { rl.set(key, { c: 1, r: now + ms }); return true; }
  e.c++;
  return e.c <= max;
}

export const maxDuration = 60; // Vercel function timeout (seconds)

export async function POST(req: NextRequest) {
  try {
    // Auth: always resolve userId from server-side token, never trust client
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const serverUserId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!serverUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { scanId, conversationId, message, context: clientContext } = body;
    const userId = serverUserId; // always use server-resolved userId

    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    // ─── PAYWALL CHECK ─────────────────────────────────────────────────────
    // Check paid tier — businesses.tier (written by Stripe webhook) is authoritative
    const { data: biz } = await supabase
      .from("businesses")
      .select("tier")
      .eq("owner_user_id", userId)
      .maybeSingle();

    const bizTier = (biz?.tier || "").toLowerCase();
    const isPaidTier = ["business","growth","team","corp","enterprise","advisor","solo"].includes(bizTier);

    // Fallback: check legacy user_progress table
    const { data: progress } = await supabase
      .from("user_progress")
      .select("payment_status, total_leak_found")
      .eq("userId", userId)
      .single()
      .catch(() => ({ data: null }));

    const isPaid = isPaidTier
      || progress?.payment_status === "active"
      || progress?.payment_status === "lifetime";

    // Allow 2 free messages to hook the user, then paywall
    if (!isPaid) {
      const { data: convs } = await supabase
        .from("chat_conversations")
        .select("message_count")
        .eq("userId", userId);

      const totalMessages = (convs || []).reduce((s: number, c: any) => s + (c.message_count || 0), 0);
      const userMessageCount = Math.floor(totalMessages / 2);

      if (userMessageCount >= 2) {
        return NextResponse.json({
          error: "paywall",
          message: "You've used your 2 free messages.",
          totalLeak: progress?.total_leak_found || 0,
          paywallType: "chat_limit",
        }, { status: 402 });
      }
    }

    // Rate limit: 30 messages per minute
    if (!rateCheck(userId, 30, 60000)) {
      return NextResponse.json({ error: "Too many messages. Please wait a moment." }, { status: 429 });
    }

    // 1. Build or retrieve system prompt
    const { systemPrompt, context } = await buildSystemPrompt(userId, clientContext, scanId);

    // 2. Load conversation history
    let history: { role: string; content: string }[] = [];
    let convId = conversationId;

    if (convId) {
      const { data: conv } = await supabase
        .from("chat_conversations")
        .select("messages")
        .eq("id", convId)
        .single();
      
      if (conv?.messages) {
        history = conv.messages as any[];
      }
    } else {
      // Create new conversation
      const { data: newConv } = await supabase
        .from("chat_conversations")
        .insert({
          userId: userId,
          industry: context.industry,
          leak_count: context.leakCount,
          total_leak_amount: context.totalLeak,
          title: `${context.industryDisplay} consultation`,
        })
        .select("id")
        .single();
      
      convId = newConv?.id;
    }

    // 3. Build messages for Claude API
    const messages = [
      ...history.slice(-20).map((h: any) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    // 4. Call Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: `You have ${context.leakCount} confirmed leaks totaling approximately $${Math.round(context.totalLeak).toLocaleString()}/year. To get the full AI consultation, set ANTHROPIC_API_KEY in your environment.`,
        conversationId: convId,
      });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Claude API error:", res.status, errData);
      return NextResponse.json({
        reply: "I'm having trouble connecting right now. Please try again in a moment.",
        conversationId: convId,
      });
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text || "I couldn't generate a response. Please try again.";

    // 5. Save conversation
    const updatedMessages = [
      ...history,
      { role: "user", content: message, timestamp: new Date().toISOString() },
      { role: "assistant", content: reply, timestamp: new Date().toISOString() },
    ];

    if (convId) {
      await supabase
        .from("chat_conversations")
        .update({
          messages: updatedMessages,
          message_count: updatedMessages.length,
        })
        .eq("id", convId);
    }

    return NextResponse.json({
      reply,
      conversationId: convId,
      leakCount: context.leakCount,
      totalLeak: context.totalLeak,
      industry: context.industryDisplay,
    });

  } catch (error: any) {
    console.error("V2 Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
