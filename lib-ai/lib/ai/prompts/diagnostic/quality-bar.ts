// =============================================================================
// lib/ai/prompts/diagnostic/quality-bar.ts
//
// Finding quality bar — injected into every tier's system prompt.
// Shows Claude what great vs. mediocre looks like with a concrete example.
// The bad example is intentional — Claude needs to see what NOT to produce.
// =============================================================================

export type DiagnosticTier = "solo" | "business" | "enterprise";

export function buildQualityBar(tier: DiagnosticTier): string {
  const minImpact   = tier === "enterprise" ? "$5,000" : tier === "business" ? "$2,000" : "$500";
  const audience    = tier === "enterprise" ? "CFO/board" : tier === "business" ? "business owner" : "sole proprietor";
  const maxFindings = tier === "enterprise" ? 12 : tier === "business" ? 7 : 5;

  return `
FINDING QUALITY BAR — read this before writing a single finding:

✅ GREAT finding:
  title:       "HST Quick Method Election Saving $8,400/yr"
  description: "At $280K revenue with 93% service-based billing, the Quick Method election
    remits 8.8% on $280K = $24,640 vs actual HST collected at 13% less ITCs (~$33,040).
    Net annual saving: $8,400. Election is irrevocable for 12 months once filed."
  calculation: "$280K × 13% = $36,400 − ITCs ~$3,360 = $33,040 owing vs Quick Method:
    $280K × 8.8% = $24,640 → annual saving $8,400"
  recommendation: "1. File RC7004 before next HST filing deadline.
    2. Confirm eligibility — >$400K gross revenue disqualifies.
    3. Request CRA confirm receipt within 30 days."

❌ MEDIOCRE finding (never produce this):
  title:       "Improve Cash Flow Management"
  description: "Better cash flow practices can improve your business."
  recommendation: "Consider reviewing your invoicing processes."

WHY THE GREAT ONE WORKS:
- Title states the exact dollar and the exact mechanism.
- Description shows the arithmetic using this business's real numbers.
- Recommendation gives 2-3 numbered actions. Step 1 is actionable today.
- The ${audience} could hand this directly to their accountant and be taken seriously.

HARD RULES FOR EVERY FINDING:
1. title must state a dollar amount OR a specific risk — never a category name or vague theme.
2. description must show the arithmetic with this business's actual revenue/payroll/cost numbers.
3. impact_min and impact_max must be derived from real figures — never round guesses.
4. calculation_shown must be explicit arithmetic, not a conclusion.
5. recommendation must be 2-3 numbered steps. First step = something they can do today or this week.
6. No finding under ${minImpact} annual impact. Better ${Math.max(3, maxFindings - 2)} excellent findings than ${maxFindings} mediocre ones.
7. second_order_effects is a PLAIN STRING — one sentence about the cascade effect — NEVER an array.
`.trim();
}
