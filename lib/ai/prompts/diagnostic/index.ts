// =============================================================================
// lib/ai/prompts/diagnostic/index.ts
//
// Public API for the diagnostic prompt library.
// run/route.ts imports from here — never directly from solo/business/enterprise.
// =============================================================================

export { buildSoloPrompts }       from "./solo";
export { buildBusinessPrompts }   from "./business";
export { buildEnterprisePrompts } from "./enterprise";
export type { DiagCtx }           from "./types";

import { buildSoloPrompts }       from "./solo";
import { buildBusinessPrompts }   from "./business";
import { buildEnterprisePrompts } from "./enterprise";
import type { DiagCtx }           from "./types";

export type DiagnosticTier = "solo" | "business" | "enterprise";

/**
 * Route context to the correct tier prompt builder.
 * This is the only function run/route.ts needs to call.
 */
export function buildDiagnosticPrompts(
  tier: DiagnosticTier,
  ctx:  DiagCtx
): { systemPrompt: string; userPrompt: string } {
  switch (tier) {
    case "enterprise": return buildEnterprisePrompts(ctx);
    case "business":   return buildBusinessPrompts(ctx);
    default:           return buildSoloPrompts(ctx);
  }
}

/** Token budget per tier — used by tierMaxTokens() in run/route.ts */
export const DIAGNOSTIC_MAX_TOKENS: Record<DiagnosticTier, number> = {
  enterprise: 12_000,  // was 16,000
  business:    8_000,  // was 12,000
  solo:        5_500,  // was 8,000
};
