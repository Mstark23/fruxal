// =============================================================================
// V2 POST /api/v2/chat — AI Advisor with full business context injection
// =============================================================================
// CHANGED from original:
//   - System prompt now built server-side from buildChatSystemPrompt(context)
//   - Context fetched from DB via buildBusinessContext() with 3s timeout
//   - businessId is read from server-side business_profiles — never trusted from client
//   - Model pinned to claude-sonnet-4-20250514
//   - maxDuration = 60 (was already set)
//
// UNCHANGED from original:
//   - Auth check (getToken)
//   - Paywall check (businesses.tier + user_progress fallback)
//   - Rate limiting (30/min)
//   - Conversation history loading/saving (chat_conversations)
//   - Message array building (last 20 messages)
//   - Response format { reply, conversationId, ... }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";
import { buildBusinessContext } from "@/lib/ai/business-context";
import { buildChatSystemPrompt } from "@/lib/ai/chat-system-prompt";

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

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, message, language } = body;
    // NOTE: clientContext is still accepted for backward compat but no longer used
    // for the system prompt — we fetch fresh from DB instead

    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    // ── Paywall check (unchanged) ──────────────────────────────────────────────
    const { data: biz } = await supabase
      .from("businesses")
      .select("id, tier")
      .eq("owner_user_id", userId)
      .maybeSingle();

    const bizTier = (biz?.tier || "").toLowerCase();
    const isPaidTier = ["business","growth","team","corp","enterprise","advisor","solo"].includes(bizTier);

    const { data: progress } = await Promise.resolve(
      supabase.from("user_progress").select("payment_status, total_leak_found").eq("userId", userId).single()
    ).catch(() => ({ data: null }));

    const isPaid = isPaidTier
      || progress?.payment_status === "active"
      || progress?.payment_status === "lifetime";

    // Chat is free for all users — T1/T2 revenue from affiliates, not subscriptions

    // ── Rate limit ─────────────────────────────────────────────────────────────
    if (!rateCheck(userId, 30, 60000)) {
      return NextResponse.json({ error: "Too many messages. Please wait a moment." }, { status: 429 });
    }

    // ── CHANGED: Build system prompt from DB context ───────────────────────────
    // businessId is resolved server-side from business_profiles — never from client
    const businessId = biz?.id || "";
    let systemPrompt: string;
    let contextMeta = { industry: "small business", leakCount: 0, totalLeak: 0, tier: "solo" };

    try {
      // 3-second timeout — if context fetch is slow, use a minimal fallback
      const ctx = await Promise.race([
        buildBusinessContext(businessId, userId),
        new Promise<null>((_, rej) => setTimeout(() => rej(new Error("context timeout")), 3000)),
      ]) as Awaited<ReturnType<typeof buildBusinessContext>>;

      systemPrompt = buildChatSystemPrompt(ctx);
      contextMeta = {
        industry: ctx.business.industry,
        leakCount: ctx.latest_report?.top_findings.length ?? 0,
        totalLeak: ctx.latest_report?.top_findings.reduce((s, f) => s + (f.annual_leak ?? 0), 0) ?? 0,
        tier: ctx.tier,
      };
    } catch {
      // Context fetch failed — use minimal fallback prompt, never block chat
      systemPrompt = [
        "You are the Fruxal AI Business Advisor — a no-BS financial advisor for Canadian SMBs.",
        "Answer questions about revenue leaks, tax optimization, compliance, and business finance.",
        "Be specific, numbers-first, and actionable. Always cite Canadian context (CRA, province-specific rules).",
        "Respond in French if the user writes in French.",
      ].join("\n");
    }

    // ── Conversation history (unchanged) ──────────────────────────────────────
    let history: { role: string; content: string }[] = [];
    let convId = conversationId;

    if (convId) {
      const { data: conv } = await supabase
        .from("chat_conversations")
        .select("messages")
        .eq("id", convId)
        .single();
      if (conv?.messages) history = conv.messages as any[];
    } else {
      const { data: newConv } = await supabase
        .from("chat_conversations")
        .insert({
          userId,
          industry: contextMeta.industry,
          leak_count: contextMeta.leakCount,
          total_leak_amount: contextMeta.totalLeak,
          title: `${contextMeta.industry} consultation`,
        })
        .select("id")
        .single();
      convId = newConv?.id;
    }

    // ── Build messages for Claude ──────────────────────────────────────────────
    const messages = [
      ...history.slice(-20).map((h: any) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    // ── Call Claude API ────────────────────────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "ANTHROPIC_API_KEY is not set. Please configure it in your environment.",
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
        model: "claude-sonnet-4-20250514",   // CHANGED: hardcoded — no env var override
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      console.error("[Chat] Claude API error:", res.status);
      return NextResponse.json({
        reply: "I'm having trouble connecting right now. Please try again in a moment.",
        conversationId: convId,
      });
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text || "I couldn't generate a response. Please try again.";

    // ── Save conversation (unchanged) ─────────────────────────────────────────
    const updatedMessages = [
      ...history,
      { role: "user", content: message, timestamp: new Date().toISOString() },
      { role: "assistant", content: reply, timestamp: new Date().toISOString() },
    ];

    if (convId) {
      await supabase
        .from("chat_conversations")
        .update({ messages: updatedMessages, message_count: updatedMessages.length })
        .eq("id", convId);
    }

    return NextResponse.json({
      reply,
      conversationId: convId,
      leakCount: contextMeta.leakCount,
      totalLeak: contextMeta.totalLeak,
      industry: contextMeta.industry,
    });

  } catch (error: any) {
    console.error("[Chat] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── GET /api/v2/chat/context — Returns welcome message + quick replies ────────
// Called by the chat page on load, before first user message
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const lang = (req.nextUrl.searchParams.get("lang") || "en") as "en" | "fr";

    const { data: biz } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_user_id", userId)
      .maybeSingle();

    const businessId = biz?.id || "";
    if (!businessId) {
      return NextResponse.json({
        welcome: lang === "fr"
          ? "Bonjour ! Je suis votre conseiller financier Fruxal. Quelle question financière puis-je vous aider à résoudre aujourd'hui ?"
          : "Hi! I'm your Fruxal financial advisor. What financial question can I help you with today?",
        quickReplies: [],
      });
    }

    const [ctx] = await Promise.all([
      buildBusinessContext(businessId, userId).catch(() => null),
    ]);

    if (!ctx) {
      return NextResponse.json({
        welcome: lang === "fr"
          ? "Bonjour ! Je suis votre conseiller Fruxal. Comment puis-je vous aider ?"
          : "Hi! I'm your Fruxal advisor. How can I help you today?",
        quickReplies: [],
      });
    }

    const { buildWelcomePrompt, buildQuickRepliesPrompt } = await import("@/lib/ai/chat-system-prompt");
    const systemPrompt = buildChatSystemPrompt(ctx);
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ welcome: "", quickReplies: [] });
    }

    // Generate welcome + quick replies in parallel
    const [welcomeRes, repliesRes] = await Promise.all([
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          system: systemPrompt,
          messages: [{ role: "user", content: buildWelcomePrompt(ctx, lang) }],
        }),
      }).then(r => r.ok ? r.json() : null).catch(() => null),

      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          system: "Output exactly 3 short questions, one per line, no numbering.",
          messages: [{ role: "user", content: buildQuickRepliesPrompt(ctx, lang) }],
        }),
      }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    const welcome = welcomeRes?.content?.[0]?.text?.trim() || "";
    const quickRepliesRaw = repliesRes?.content?.[0]?.text?.trim() || "";
    const quickReplies = quickRepliesRaw
      .split("\n")
      .map((q: string) => q.trim().replace(/^[-•\d.]+\s*/, ""))
      .filter((q: string) => q.length > 3)
      .slice(0, 3);

    return NextResponse.json({ welcome, quickReplies });
  } catch (err: any) {
    console.error("[Chat GET] Error:", err.message);
    return NextResponse.json({ welcome: "", quickReplies: [] });
  }
}
