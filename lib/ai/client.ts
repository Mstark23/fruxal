// =============================================================================
// lib/ai/client.ts
//
// Single Anthropic SDK instance for the entire application.
// All Claude calls go through callClaude() — never import Anthropic directly
// in a route file again.
//
// Usage:
//   import { callClaude, callClaudeJSON } from "@/lib/ai/client";
//   const raw  = await callClaude({ system, user, maxTokens: 8000 });
//   const json = await callClaudeJSON({ system, user, maxTokens: 8000 });
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
export const CLAUDE_FAST    = "claude-haiku-4-5-20251001";  // cheap — prescan chat, follow-ups
export const CLAUDE_LEGACY  = "claude-sonnet-4-20250514";   // legacy routes still using old string

// ─── Token budgets by use case ───────────────────────────────────────────────
export const TOKENS = {
  diagnostic_solo:       8_000,
  diagnostic_business:  12_000,
  diagnostic_enterprise:16_000,
  prescan_chat:          1_024,
  chat_advisor:          2_048,
  action_plan:           2_000,
  competitor:            2_000,
  parse_doc:             1_500,
  tier3_diagnostic:      4_000,
} as const;

// ─── Core call interface ──────────────────────────────────────────────────────
export interface ClaudeCallOptions {
  system:    string;
  user:      string;
  maxTokens: number;
  model?:    string;
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
 */
export async function callClaude(opts: ClaudeCallOptions): Promise<ClaudeResult> {
  const model = opts.model ?? CLAUDE_MODEL;
  const response = await getAnthropicClient().messages.create({
    model,
    max_tokens: opts.maxTokens,
    system:     opts.system,
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
 * Throws if parsing fails.
 */
export async function callClaudeJSON<T = any>(opts: ClaudeCallOptions): Promise<T & {
  _meta: { promptTokens: number; completionTokens: number; model: string };
}> {
  const result = await callClaude(opts);
  const clean  = result.text.replace(/```json\n?|```\n?/g, "").trim();

  let parsed: T;
  try {
    parsed = JSON.parse(clean) as T;
  } catch (e: any) {
    throw new Error(`Claude returned invalid JSON: ${e.message}. Raw: ${clean.slice(0,200)}`);
  }
  return {
    ...parsed,
    _meta: {
      promptTokens:     result.promptTokens,
      completionTokens: result.completionTokens,
      model:            result.model,
    },
  };
}
