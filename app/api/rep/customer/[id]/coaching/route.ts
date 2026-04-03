// =============================================================================
// POST /api/rep/customer/[id]/coaching — Post-call AI coaching feedback
// =============================================================================
// Takes debrief data, loads client context + industry intel, calls Claude to
// generate actionable coaching: score, next steps, follow-up email, objection
// prep, and SLP (Straight Line Persuasion) guidance.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAnthropicClient } from "@/lib/ai/client";
import { getIndustryScenario } from "@/lib/rep/industry-scenarios";

export const maxDuration = 30;

function fmt(n: number): string {
  return n.toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  const pipelineId = params.id;

  try {
    const body = await req.json();
    const {
      outcome,           // "ready_to_sign" | "needs_time" | "not_interested" | "no_answer"
      agreedFindings,    // string[] — finding titles the client agreed to
      clientConcerns,    // string
      notes,             // string
      industry: bodyIndustry, // optional override
    } = body;

    if (!outcome) {
      return NextResponse.json({ success: false, error: "outcome is required" }, { status: 400 });
    }

    // ------------------------------------------------------------------
    // 1. Load client context
    // ------------------------------------------------------------------
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("*")
      .eq("id", pipelineId)
      .maybeSingle();

    if (!pipe) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const companyName = pipe.company_name || "the business";
    const contactName = pipe.contact_name?.split(" ")[0] || "the client";
    const industry = bodyIndustry || pipe.industry || "";

    // ------------------------------------------------------------------
    // 2. Load findings from diagnostics
    // ------------------------------------------------------------------
    let findings: any[] = [];
    let totalLeak = 0;

    if (pipe.diagnostic_id) {
      const { data: diag } = await supabaseAdmin
        .from("tier3_diagnostics")
        .select("result")
        .eq("id", pipe.diagnostic_id)
        .maybeSingle();

      if (diag?.result) {
        findings = diag.result.findings || [];
        totalLeak = diag.result.total_annual_leak
          ?? diag.result.totalAnnualLeak
          ?? findings.reduce((s: number, f: any) => s + (f.impact_max || f.annual_impact || 0), 0);
      }
    }

    if (!totalLeak && findings.length) {
      totalLeak = findings.reduce((s: number, f: any) => s + (f.impact_max || f.annual_impact || 0), 0);
    }

    // ------------------------------------------------------------------
    // 3. Industry scenario
    // ------------------------------------------------------------------
    const scenario = getIndustryScenario(industry);

    // Build findings summary for prompt
    const findingsText = findings.map((f: any, i: number) => {
      const amount = f.impact_max || f.annual_impact || 0;
      return `${i + 1}. ${f.title || f.category || "Finding"} — $${fmt(amount)}/yr (${f.severity || "medium"} severity)`;
    }).join("\n");

    const agreedText = (agreedFindings || []).join(", ") || "None explicitly agreed to";
    const notAgreed = findings
      .filter((f: any) => !(agreedFindings || []).includes(f.title))
      .map((f: any) => `${f.title || f.category} ($${fmt(f.impact_max || f.annual_impact || 0)}/yr)`)
      .join(", ") || "All findings were agreed to";

    const scenarioContext = scenario
      ? [
          `Industry: ${scenario.name}`,
          `Average leak: ${scenario.benchmarks.avgLeakPct}% of revenue`,
          `Conversion rate: ${scenario.benchmarks.conversionRate}%`,
          `Recovery timeline: ${scenario.benchmarks.avgRecoveryTimeline} days`,
          `Decision makers: ${scenario.decisionMakers}`,
          `Competitive angle: ${scenario.competitiveAngle}`,
          `Seasonal notes: ${scenario.seasonalNotes}`,
          `Common objections: ${scenario.objections.map(o => o.objection).join("; ")}`,
        ].join("\n")
      : "No specific industry data available.";

    // ------------------------------------------------------------------
    // 4. Call Claude for coaching
    // ------------------------------------------------------------------
    const prompt = `You are a senior sales coach at Fruxal, a Canadian cost-recovery firm that works on contingency (12% of recovered savings). A rep just finished a call. Analyze their performance and generate coaching.

CLIENT CONTEXT:
Company: ${companyName}
Contact: ${contactName}
Industry: ${industry}
Total annual leak identified: $${fmt(totalLeak)}
Province: ${pipe.province || "Unknown"}

ALL FINDINGS FROM DIAGNOSTIC:
${findingsText || "No findings available"}

INDUSTRY INTELLIGENCE:
${scenarioContext}

CALL DEBRIEF FROM REP:
Outcome: ${outcome}
Findings client agreed to: ${agreedText}
Findings NOT discussed or not agreed: ${notAgreed}
Client concerns: ${clientConcerns || "None noted"}
Rep notes: ${notes || "None"}

FRUXAL MODEL: 12% contingency fee. Client pays $0 unless money is recovered. They keep 88%.

Generate coaching feedback as JSON with these exact keys:
{
  "score": <1-10 rating of the call>,
  "whatWorkedWell": "<1-2 sentences on what went right, referencing specific findings and amounts>",
  "missedOpportunities": "<1-2 sentences on findings or angles they missed, with specific dollar amounts and industry-specific advice>",
  "nextAction": "<Specific next step with timing — e.g. send email within 24 hours, book call for Thursday, etc.>",
  "followUpEmail": {
    "subject": "<Ready-to-send subject line with real company name and dollar amount>",
    "body": "<Full email body, 3-5 paragraphs, professional but warm. Use real findings, amounts, and company name. Include a clear CTA.>"
  },
  "objectionPrep": [
    {
      "theyMightSay": "<Likely objection based on their concerns>",
      "youShouldSay": "<Specific counter with real numbers from their file>"
    }
  ],
  "slpNote": "<Straight Line Persuasion assessment — rate client certainty on 3 scales: trust in rep (1-10), trust in product (1-10), trust in company (1-10). Then advise which to focus on next call and how.>"
}

Rules:
- Use REAL dollar amounts from their findings, not placeholders
- The follow-up email should be ready to copy-paste — no [brackets] or placeholders
- Generate 2-3 objection prep items based on their specific concerns
- The SLP note should reference the Straight Line methodology specifically
- Be direct and actionable, not generic
- If outcome is "not_interested", focus coaching on what to try differently and whether to pursue further

Respond with ONLY the JSON, no other text.`;

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content.find((b: any) => b.type === "text") as
      | { type: "text"; text: string }
      | undefined;
    const rawText = raw?.text || "{}";
    const clean = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let coaching;
    try {
      coaching = JSON.parse(clean);
    } catch {
      // If Claude didn't return valid JSON, wrap the raw text
      coaching = {
        score: 5,
        whatWorkedWell: rawText.slice(0, 200),
        missedOpportunities: "Could not parse AI response — review manually.",
        nextAction: "Follow up within 24 hours.",
        followUpEmail: { subject: `Follow-up — ${companyName}`, body: rawText.slice(0, 500) },
        objectionPrep: [],
        slpNote: "Unable to assess — AI response parsing failed.",
      };
    }

    return NextResponse.json({ success: true, coaching });
  } catch (err: any) {
    console.error("[coaching POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
