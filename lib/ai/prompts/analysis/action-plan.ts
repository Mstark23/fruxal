// =============================================================================
// lib/ai/prompts/analysis/action-plan.ts
//
// 30/60/90 day action plan prompt.
// Used by api/action-plan/route.ts.
// =============================================================================

export interface ActionPlanContext {
  businessName:   string;
  industry:       string;
  province:       string;
  totalLeaking:   number;
  findings:       Array<{
    title:        string;
    annualImpact: number;
    severity:     string;
    category:     string;
    recommendation?: string;
  }>;
  country?:       string;
}

export function buildActionPlanSystem(country: string = "CA"): string {
  const isUS = country === "US";
  return `You are a ${isUS ? "US" : "Canadian"} business efficiency advisor working with Fruxal.
Your job is to take a business's detected financial leaks and convert them into a prioritized, specific 30/60/90 day action plan.

RULES:
- Every action must reference the specific finding it addresses.
- Sequence by: (1) regulatory/compliance risk first, (2) quick wins by effort vs impact, (3) structural improvements last.
- Dollar amounts must come from the finding data provided — no guessing.
- Actions must be specific enough that the owner knows exactly what to do next Monday morning.
${isUS
  ? "- US context: IRS deadlines, state tax filings, sales tax compliance — these come first if overdue."
  : "- Canadian context: CRA deadlines, WSIB, HST filings — these come first if overdue."}
- Respond with ONLY valid JSON. No markdown, no preamble.`;
}

export function buildActionPlanUser(ctx: ActionPlanContext): string {
  const { businessName, industry, province, totalLeaking, findings } = ctx;

  const sorted = [...findings].sort((a, b) => (b.annualImpact ?? 0) - (a.annualImpact ?? 0));

  return `Generate a 30/60/90 day action plan for this business.

BUSINESS: ${businessName} (${industry}, ${province})
TOTAL LEAKING: $${(totalLeaking ?? 0).toLocaleString()}/yr

FINDINGS (sorted by impact):
${sorted.slice(0, 15).map((f, i) =>
  `${i + 1}. ${f.title} — $${(f.annualImpact ?? 0).toLocaleString()}/yr [${f.severity}/${f.category}]${f.recommendation ? `\n   Fix: ${f.recommendation}` : ""}`
).join("\n")}

Return ONLY valid JSON:
{
  "summary": "One sentence: total recoverable value + timeframe",
  "phases": [
    {
      "period": "Days 1-30",
      "title": "Quick Wins",
      "theme": "one sentence about what this phase accomplishes",
      "actions": [
        {
          "finding":          "finding title",
          "action":           "specific step — what to do, who to call, what form to file",
          "expectedSavings":  1000,
          "effort":           "low|medium|high",
          "urgency":          "overdue|this_week|this_month"
        }
      ]
    },
    {
      "period": "Days 31-60",
      "title": "Core Fixes",
      "theme": "...",
      "actions": [...]
    },
    {
      "period": "Days 61-90",
      "title": "Structural Improvements",
      "theme": "...",
      "actions": [...]
    }
  ],
  "projectedSavings": {
    "month1":  0,
    "month3":  0,
    "month6":  0,
    "month12": 0
  }
}`;
}
