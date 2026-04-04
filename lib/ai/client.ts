// =============================================================================
// lib/ai/client.ts
//
// Single Anthropic SDK instance for the entire application.
// All Claude calls go through callClaude() — never import Anthropic directly
// in a route file again.
//
// Usage:
//   import { callClaude, callClaudeJSON, callClaudeStream } from "@/lib/ai/client";
//   const raw  = await callClaude({ system, user, maxTokens: 8000 });
//   const json = await callClaudeJSON({ system, user, maxTokens: 8000 });
//   const stream = callClaudeStream({ system, user, maxTokens: 8000 });
// =============================================================================

import Anthropic from "@anthropic-ai/sdk";

// ─── Lazy SDK instance — never crashes at module load ─────────────────────────
let _anthropic: Anthropic | null = null;
export function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}
/** @deprecated use getAnthropicClient() — exported for backwards compat with routes that destructure */
export const anthropic = new Proxy({} as Anthropic, {
  get(_t, prop) {
    return (getAnthropicClient() as any)[prop];
  },
});

// ─── Model constants ─────────────────────────────────────────────────────────
export const CLAUDE_MODEL   = "claude-sonnet-4-20250514";          // main — diagnostics, analysis
export const CLAUDE_FAST    = "claude-sonnet-4-20250514";   // fast tier — same model for now
export const CLAUDE_LEGACY  = "claude-sonnet-4-20250514";   // legacy routes still using old string

// ─── Token budgets by use case (~30% reduction) ─────────────────────────────
export const TOKENS = {
  diagnostic_solo:        5_500,   // was 8,000
  diagnostic_business:    8_000,   // was 12,000
  diagnostic_enterprise: 12_000,   // was 16,000
  prescan_chat:           1_024,   // unchanged
  chat_advisor:           2_048,   // unchanged
  action_plan:            1_500,   // was 2,000
  competitor:             1_500,   // was 2,000
  parse_doc:              1_200,   // was 1,500
  tier3_diagnostic:       3_000,   // was 4,000
} as const;

// ─── Core call interface ──────────────────────────────────────────────────────
export interface ClaudeCallOptions {
  system:       string;
  user:         string;
  maxTokens:    number;
  model?:       string;
  cacheSystem?: boolean;
}

export interface ClaudeResult {
  text:              string;
  promptTokens:      number;
  completionTokens:  number;
  model:             string;
}

/**
 * Raw Claude call — returns the text block directly.
 * Throws on API error so callers can catch and handle.
 * When cacheSystem is true, the system prompt is sent with cache_control
 * for Anthropic's prompt caching (5-min TTL, 90% cost reduction on hits).
 */
export async function callClaude(opts: ClaudeCallOptions): Promise<ClaudeResult> {
  const model = opts.model ?? CLAUDE_MODEL;

  const systemPayload = opts.cacheSystem
    ? [{ type: "text" as const, text: opts.system, cache_control: { type: "ephemeral" as const } }]
    : opts.system;

  const response = await getAnthropicClient().messages.create({
    model,
    max_tokens: opts.maxTokens,
    system:     systemPayload as any,
    messages:   [{ role: "user", content: opts.user }],
  });

  const textBlock = response.content.find((b) => b.type === "text") as
    | { type: "text"; text: string }
    | undefined;

  return {
    text:             textBlock?.text ?? "",
    promptTokens:     response.usage?.input_tokens  ?? 0,
    completionTokens: response.usage?.output_tokens ?? 0,
    model,
  };
}

/**
 * Claude call that expects a JSON response.
 * Strips markdown fences, parses, and returns the parsed object.
 * Retries once on parse failure (with cacheSystem on the retry to save cost).
 */
export async function callClaudeJSON<T = any>(opts: ClaudeCallOptions): Promise<T & {
  _meta: { promptTokens: number; completionTokens: number; model: string };
}> {
  let lastError = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const userPrompt = attempt === 0
      ? opts.user
      : `Your previous response was invalid JSON. Fix it and respond with ONLY valid JSON, no markdown fences:\n\n${opts.user}`;

    const result = await callClaude({ ...opts, user: userPrompt, cacheSystem: attempt > 0 });
    const clean = result.text.replace(/```json\n?|```\n?/g, "").trim();

    try {
      const parsed = JSON.parse(clean) as T;
      return {
        ...parsed,
        _meta: {
          promptTokens:     result.promptTokens,
          completionTokens: result.completionTokens,
          model:            result.model,
        },
      };
    } catch (e: any) {
      lastError = `Attempt ${attempt + 1}: ${e.message}. Raw: ${clean.slice(0, 200)}`;
      console.warn(`[callClaudeJSON] Parse failed attempt ${attempt + 1}:`, e.message);
    }
  }

  throw new Error(`Claude returned invalid JSON after 2 attempts: ${lastError}`);
}

// ─── Streaming support ───────────────────────────────────────────────────────

export interface ClaudeStreamOptions extends ClaudeCallOptions {
  cacheSystem?: boolean;
  thinking?: { type: "enabled"; budget_tokens: number };
}

/**
 * Streaming Claude call — returns a ReadableStream of SSE-formatted chunks.
 * Each chunk is either { text } for content deltas, { done, usage } for
 * completion, or { error } on failure.
 */
export function callClaudeStream(opts: ClaudeStreamOptions): ReadableStream {
  const model = opts.model ?? CLAUDE_MODEL;
  const systemPayload = opts.cacheSystem
    ? [{ type: "text" as const, text: opts.system, cache_control: { type: "ephemeral" as const } }]
    : opts.system;

  const createParams: any = {
    model,
    max_tokens: opts.maxTokens,
    system: systemPayload,
    messages: [{ role: "user", content: opts.user }],
    stream: true,
  };

  if (opts.thinking) {
    createParams.thinking = opts.thinking;
  }

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = getAnthropicClient().messages.stream(createParams);
        for await (const event of stream) {
          if (event.type === "content_block_delta" && (event.delta as any).type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: (event.delta as any).text })}\n\n`));
          }
        }
        const finalMessage = await stream.finalMessage();
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, usage: finalMessage.usage })}\n\n`));
        controller.close();
      } catch (err: any) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
        controller.close();
      }
    },
  });
}
