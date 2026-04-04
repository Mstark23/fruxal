// =============================================================================
// lib/ai/tier.ts
// Tier resolution and per-tier config for the diagnostic engine.
// =============================================================================

export type DiagnosticTier = "solo" | "business" | "enterprise";

export function resolveTier(profile: any, business: any): DiagnosticTier {
  // Priority: billing_tier from businesses table → exact intake revenue → prescan revenue
  const billingTier = business?.billing_tier || business?.tier;
  if (billingTier === "enterprise") return "enterprise";
  if (billingTier === "business")   return "business";
  if (billingTier === "solo")       return "solo";

  const annualRev =
    profile.exact_annual_revenue ||
    profile.annual_revenue ||
    (profile.monthly_revenue ? profile.monthly_revenue * 12 : 0) ||
    0;

  if (annualRev >= 1_000_000) return "enterprise";
  if (annualRev >= 150_000)   return "business";
  return "solo";
}

export function tierMaxTokens(tier: DiagnosticTier): number {
  // Keep within Vercel Hobby 60s timeout — lower tokens = faster response
  if (tier === "enterprise") return 8000;
  if (tier === "business")   return 6000;
  return 4000;
}

export function tierMaxFindings(tier: DiagnosticTier): number {
  if (tier === "enterprise") return 10;
  if (tier === "business")   return 7;
  return 5;
}
