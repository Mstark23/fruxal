// =============================================================================
// lib/ai/prompts/analysis/competitor.ts
//
// Competitive position analysis prompt.
// Used by api/intelligence/competitor/route.ts.
// =============================================================================

export interface CompetitorContext {
  businessName:   string;
  industry:       string;
  province:       string;
  annualRevenue:  number;
  healthScore:    number;
  totalLeaking:   number;
  openFindings:   Array<{ title: string; annualImpact: number; category: string }>;
  competitors?:   string;
}

export function buildCompetitorSystem(): string {
  return `You are a Canadian business strategy advisor working with Fruxal.
You analyze a business's financial leak profile to determine their competitive position relative to industry peers.

FRAMEWORK:
- Strengths = areas with NO leaks detected (operating better than peers)
- Weaknesses = areas with leaks (cost disadvantage vs competitors who've fixed them)
- Opportunities = highest-ROI fixes ranked by competitive impact
- Threats = what happens if competitors fix these leaks and this business doesn't

CANADIAN CONTEXT:
- Reference real Canadian industry benchmarks where possible.
- Account for provincial cost structures (QC vs ON vs AB etc.).
- The "competitive gap" is the cost advantage well-run competitors have by NOT having these leaks.

Rules:
- Every point must reference actual data provided — no generic strategy advice.
- Dollar estimates must be grounded in the leak data.
- The recommendation must be a specific prioritized action, not generic advice.
- Respond with ONLY valid JSON. No markdown.`;
}

export function buildCompetitorUser(ctx: CompetitorContext): string {
  const { businessName, industry, province, annualRevenue, healthScore, totalLeaking, openFindings, competitors } = ctx;

  return `Analyze the competitive position of this business based on their financial leak profile.

BUSINESS: ${businessName} (${industry}, ${province})
ANNUAL REVENUE: $${(Number(annualRevenue) || 0).toLocaleString()}
HEALTH SCORE: ${healthScore}/100
TOTAL LEAKING: $${(Number(totalLeaking) || 0).toLocaleString()}/yr
${competitors ? `COMPETITORS MENTIONED: ${competitors}` : ""}

TOP LEAKS (competitive disadvantages):
${openFindings.slice(0, 10).map((f, i) =>
  `${i + 1}. ${f.title} — $${(f.annualImpact || 0).toLocaleString()}/yr [${f.category}]`
).join("\n")}

Return ONLY valid JSON:
{
  "strengths":        ["3-5 competitive strengths: areas with no leaks = cost parity or advantage vs peers"],
  "weaknesses":       ["3-5 competitive weaknesses: leak categories creating cost disadvantage"],
  "opportunities":    ["3-5 actionable opportunities with $ estimates — what fixing these leaks enables"],
  "threats":          ["2-3 competitive threats if leaks go unaddressed"],
  "recommendation":   "One paragraph strategic recommendation. Start with the biggest dollar opportunity.",
  "competitiveGap":   "Dollar amount: annual cost advantage a competitor has by NOT having these leaks",
  "urgentActions":    ["Top 3 actions ranked by competitive impact — specific, not generic"]
}`;
}
