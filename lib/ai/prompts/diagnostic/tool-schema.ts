// =============================================================================
// lib/ai/prompts/diagnostic/tool-schema.ts
//
// Diagnostic output as an Anthropic tool_use schema. Forces Claude to return
// structured JSON that matches the schema exactly — eliminates JSON parse
// failures from raw text extraction.
// =============================================================================

export function buildDiagnosticTool(tier: "solo" | "business" | "enterprise", country: "CA" | "US" = "CA") {
  const maxFindings = tier === "enterprise" ? 12 : tier === "business" ? 7 : 5;

  return {
    name: "submit_diagnostic",
    description: "Submit the completed financial diagnostic report with all findings, scores, and recommendations.",
    input_schema: {
      type: "object" as const,
      required: ["scores", "savings_anchor", "executive_summary", "totals", "findings", "risk_matrix", "benchmark_comparisons", "action_plan", "cpa_briefing"],
      properties: {
        scores: {
          type: "object",
          required: ["overall", "compliance", "efficiency", "optimization", "growth", "bankability", "exit_readiness"],
          properties: {
            overall: { type: "number", description: "0-100 overall health score" },
            compliance: { type: "number" },
            efficiency: { type: "number" },
            optimization: { type: "number" },
            growth: { type: "number" },
            bankability: { type: "number" },
            exit_readiness: { type: "number" },
          },
        },
        savings_anchor: {
          type: "object",
          required: ["headline", "description"],
          properties: {
            headline: { type: "string", description: "e.g. '$47,200/yr recoverable from 5 leaks'" },
            description: { type: "string" },
            description_fr: { type: "string" },
          },
        },
        executive_summary: { type: "string", description: "3-4 sentences. Lead with exact total. Name top 2 findings. End with urgency." },
        executive_summary_fr: { type: "string" },
        totals: {
          type: "object",
          required: ["annual_leaks", "potential_savings", "penalty_exposure", "programs_value"],
          properties: {
            annual_leaks: { type: "number" },
            potential_savings: { type: "number" },
            ebitda_impact: { type: "number" },
            enterprise_value_impact: { type: "number" },
            penalty_exposure: { type: "number" },
            programs_value: { type: "number" },
          },
        },
        findings: {
          type: "array",
          maxItems: maxFindings,
          items: {
            type: "object",
            required: ["title", "category", "severity", "impact_min", "impact_max", "description", "recommendation"],
            properties: {
              title: { type: "string" },
              title_fr: { type: "string" },
              category: { type: "string" },
              severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
              impact_min: { type: "number" },
              impact_max: { type: "number" },
              description: { type: "string", description: "Show the math. Revenue x rate x gap = dollar amount." },
              description_fr: { type: "string" },
              recommendation: { type: "string" },
              recommendation_fr: { type: "string" },
              priority: { type: "number" },
              timeline: { type: "string" },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            },
          },
        },
        risk_matrix: {
          type: "array",
          items: {
            type: "object",
            properties: {
              area: { type: "string" },
              risk_level: { type: "string", enum: ["critical", "high", "medium", "low"] },
              likelihood: { type: "string" },
              impact: { type: "string" },
              recommendation: { type: "string" },
            },
          },
        },
        benchmark_comparisons: {
          type: "array",
          items: {
            type: "object",
            properties: {
              metric: { type: "string" },
              your_value: { type: "string" },
              industry_avg: { type: "string" },
              top_quartile: { type: "string" },
              gap: { type: "string" },
            },
          },
        },
        action_plan: {
          type: "object",
          properties: {
            optimal_sequence: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "number" },
                  title: { type: "string" },
                  estimated_savings: { type: "number" },
                  timeline: { type: "string" },
                  difficulty: { type: "string" },
                },
              },
            },
          },
        },
        cpa_briefing: {
          type: "object",
          properties: {
            intro: { type: "string" },
            talking_points: { type: "array", items: { type: "string" } },
            forms_to_file: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  };
}
