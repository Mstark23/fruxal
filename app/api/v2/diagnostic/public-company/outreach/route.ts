// =============================================================================
// app/api/v2/diagnostic/public-company/outreach/route.ts
// POST — Generate a personalized CFO cold email from a completed diagnostic.
//
// Design principle: sentence 1 = the dollar number, sentence 2 = the specific
// calculation, sentence 3 = proof of work, ask = 15 minutes. Under 150 words.
// A CFO who can't use this email in 10 seconds deletes it.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Anthropic from "@anthropic-ai/sdk";


// ── Tone instructions ─────────────────────────────────────────────────────────
const TONE_INSTRUCTIONS: Record<string, string> = {
  peer: `Peer-to-peer financial analyst tone. Direct, analytical, zero fluff. The reader is a CFO or VP Finance who has seen every pitch deck ever written. Your credibility comes from the specificity of the numbers — not from pleasantries. Speak like you already ran their books.`,

  ceo: `Executive-to-executive tone for a CEO or President. Frame every finding through the lens of shareholder value, exit optionality, and EBITDA multiple. The CEO doesn't care about tax mechanics — they care that fixing this adds $X to what the business is worth. Keep it high-level but pin it to real numbers.`,

  warm: `Warm but efficient cold outreach. Acknowledge you're reaching out cold in one sentence — then immediately earn the read with a specific insight they'd want to know regardless of whether they respond. Tone: helpful advisor with no agenda, not vendor with a quota.`,

  activist: `Write like a respectful activist investor who has done their homework. Frame findings as gaps between current performance and what peers are achieving. This tone is most effective when the company is underperforming sector benchmarks. Lead with the shareholder value destruction angle — but keep it professional.`,
};

export const maxDuration = 60; // Vercel function timeout (seconds)

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { reportId, tone = "peer", senderName, senderTitle, senderCompany } = body;
    if (!reportId) return NextResponse.json({ success: false, error: "reportId required" }, { status: 400 });

    // ── Load report ──────────────────────────────────────────────────────────
    const { data: report, error } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, result_json, input_snapshot, status")
      .eq("id", reportId)
      .single();

    if (error || !report) return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    if (report.status !== "completed") return NextResponse.json({ success: false, error: "Report not completed yet" }, { status: 400 });

    const result   = report.result_json  as any;
    const snapshot = report.input_snapshot as any;
    if (!result) return NextResponse.json({ success: false, error: "Report has no results" }, { status: 400 });

    // ── Extract findings + financials ────────────────────────────────────────
    const findings: any[] = result.findings || [];
    const topFindings = [...findings]
      .sort((a, b) => ((b.impact_max || b.ebitda_improvement) ?? 0) - ((a.impact_max || a.ebitda_improvement) ?? 0))
      .slice(0, 5);

    // ── Source financials — works for both public (fmp_snapshot) and private ─────
    const fmp       = result.fmp_snapshot || snapshot?.fmp_data || {};
    const profile   = snapshot?.profile   || {};                    // private company intake data
    const isPrivate = !result.fmp_snapshot && !snapshot?.fmp_data; // no public filings

    const companyName  = result.company_name || fmp.name    || profile.business_name || snapshot?.company_name || "the company";
    const ticker       = result.ticker       || fmp.symbol  || snapshot?.ticker       || "";
    const revenue      = (fmp.revenue || profile.annual_revenue) ?? 0;
    const ebitda       = (fmp.ebitda || profile.ebitda_estimate) ?? 0;
    const ebitdaMargin = fmp.ebitdaMarginPct || (revenue > 0 && ebitda > 0 ? (ebitda / revenue) * 100 : 0);
    const grossMargin  = (fmp.grossMarginPct || profile.gross_margin_pct) ?? 0;
    const netMargin    = fmp.netMarginPct ?? 0;
    const employees    = (fmp.employees || profile.employee_count) ?? 0;
    const industry     = fmp.industry        || profile.industry                      || result.industry || "";
    const sector       = fmp.sector          || "";
    const province     = fmp.province        || profile.province                      || "";
    const ceo          = fmp.ceo             || (isPrivate ? "Owner/Operator" : "");
    const fiscalYear   = result.fiscal_year  || fmp.latestFiscalYear                 || new Date().getFullYear().toString();
    const ownerSalary  = profile.owner_salary ?? 0;

    const totalLeaks    = (result.totals?.annual_leaks || result.total_annual_leaks) ?? 0;
    const totalEBITDA   = (result.totals?.ebitda_impact || result.ebitda_impact) ?? 0;
    const totalEV       = (result.totals?.enterprise_value_impact || result.enterprise_value_impact) ?? 0;
    const execSummary   = result.executive_summary || "";

    const fmt  = (n: number) => `$${n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : n >= 1_000 ? (n / 1_000).toFixed(0) + "K" : n.toString()}`;
    const pct  = (n: number) => `${n.toFixed(1)}%`;

    // Build rich finding context for the prompt
    const findingContext = topFindings.map((f, i) =>
      `FINDING ${i + 1}: ${f.title}
  Category: ${f.category} | Severity: ${f.severity}
  Annual Impact: ${fmt(f.impact_min ?? 0)}–${fmt(f.impact_max ?? 0)}
  EBITDA Improvement: ${fmt(f.ebitda_improvement ?? 0)}
  EV Uplift: ${fmt(f.enterprise_value_improvement ?? 0)}
  Calculation: ${f.calculation_shown || "N/A"}
  Recommendation: ${f.recommendation || "N/A"}`
    ).join("\n\n");

    // Identify the single biggest hook
    const biggestFinding  = topFindings[0];
    const biggestDollar   = totalEV > 0 ? totalEV : totalLeaks;
    const hookLabel       = totalEV > 0 ? "enterprise value upside" : "annual revenue leak";

    // ── System prompt ────────────────────────────────────────────────────────
    const systemPrompt = `You are a senior analyst at a Canadian financial intelligence firm writing a cold outreach email to the ${isPrivate ? "owner or CEO" : "CFO or CEO"} of ${companyName}${ticker ? ` (${ticker})` : ""}. You have just completed ${isPrivate ? "a financial diagnostic based on estimated financials and industry data" : "a forensic diagnostic using their public financial filings"}.${isPrivate && ownerSalary > 0 ? ` Owner salary on file: $${ownerSalary.toLocaleString()}.` : ""}

TONE: ${TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.peer}

THE ANATOMY OF AN EMAIL THAT GETS A REPLY FROM A CFO:
Sentence 1: The total dollar number. Lead with ${fmt(biggestDollar)} ${hookLabel}. Make it the very first thing they read.
Sentence 2: The single biggest specific finding with the exact math — not a vague reference, the actual calculation. E.g. "Your EBITDA margin is ${pct(ebitdaMargin)} vs the sector median ~22% — that's a ${fmt(Math.round((22 - ebitdaMargin) / 100 * revenue))} gap on your ${fmt(revenue)} revenue base."
Sentence 3: Proof of work — one sentence establishing that this came from real analysis of their public filings, not a template.
Sentence 4–6: One or two additional findings worth mentioning, then the ask.
Ask: 15-minute call. Nothing more. Not a demo, not a deck, not a proposal.
P.S. line: One additional finding or stat that hits differently — this is the last thing they read and often what triggers a reply.

HARD RULES — VIOLATING ANY OF THESE MAKES THE EMAIL WORTHLESS:
1. The FIRST sentence must contain the total dollar figure (${fmt(biggestDollar)}). No greeting, no context-setting, no "I wanted to reach out." Start with money.
2. Every number in the email must come from the diagnostic findings — no invented stats.
3. 120–160 words maximum (body only). CFOs do not read long cold emails. Longer = deleted.
4. Zero clichés: no "hope this finds you well", "touching base", "synergies", "value-add", "innovative", "leverage", "deep dive", "circle back", "move the needle".
5. Do NOT mention AI, machine learning, or software. Say "analysis of your public filings" or "forensic review."
6. The subject line must be specific enough that the CFO thinks "how do they know that?" — not generic enough to apply to any company.
7. LinkedIn message: 60 words max. Just the hook + one finding + minimal ask. No subject line.
8. Follow-up email (day 5): 80 words max. Reference that you sent something last week. Re-lead with a DIFFERENT finding from the original email.

OUTPUT: Respond with ONLY a valid JSON object — no markdown, no preamble:
{
  "subject_line": "string — specific, references their company or a real number",
  "subject_line_b": "string — alternative angle, e.g. a question format",
  "email_body": "string — 120-160 words, plain text, \\n for line breaks, P.S. line at end",
  "linkedin_message": "string — 60 words max, no subject line, starts with the dollar number",
  "follow_up_subject": "string",
  "follow_up_body": "string — 80 words max, different finding as hook",
  "key_hook": "string — the single stat the email is built around, in one punchy sentence",
  "ps_line": "string — the P.S. line extracted separately for easy editing",
  "personalization_notes": "string — 2-3 specific things to customize before sending (e.g. reference a recent earnings call, a recent hire, a specific product line)"
}`;

    // ── User prompt ──────────────────────────────────────────────────────────
    const userPrompt = `Write the outreach email sequence for the following diagnostic.

COMPANY: ${companyName} (${ticker})
INDUSTRY: ${industry}${sector ? ` / ${sector}` : ""}
PROVINCE: ${province}
FISCAL YEAR: ${fiscalYear}
CEO/LEADERSHIP: ${ceo || "Not specified"}

FINANCIALS (from public filings):
Revenue:       ${fmt(revenue)}
EBITDA:        ${fmt(ebitda)}  (${pct(ebitdaMargin)} margin)
Gross Margin:  ${pct(grossMargin)}
Net Margin:    ${pct(netMargin)}
Employees:     ${(employees ?? 0).toLocaleString()}

DIAGNOSTIC RESULTS:
Total Annual Leaks:        ${fmt(totalLeaks)}
Total EBITDA Improvement:  ${fmt(totalEBITDA)}
Total EV Upside:           ${fmt(totalEV)}

EXECUTIVE SUMMARY (from diagnostic):
${execSummary}

TOP FINDINGS (by dollar impact):
${findingContext}

SENDER:
Name:    ${senderName    || "[Your Name]"}
Title:   ${senderTitle   || "[Your Title]"}
Company: ${senderCompany || "Fruxal"}

Write the full outreach sequence now. Remember: sentence 1 = ${fmt(biggestDollar)} ${hookLabel}. Under 160 words. Starts with money.`;

    // ── Call Claude ──────────────────────────────────────────────────────────
    const response = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system:     systemPrompt,
      messages:   [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b: any) => b.type === "text");
    const rawText   = (textBlock as any)?.text || "";
    const jsonStr   = rawText.replace(/```json\n?|```\n?/g, "").trim();
    let emailResult: any = null; try { emailResult = JSON.parse(jsonStr); } catch { /* non-fatal */ }

    // ── Save ─────────────────────────────────────────────────────────────────
    await supabaseAdmin.from("diagnostic_outreach_emails").insert({
      report_id:    reportId,
      user_id:      userId,
      company_name: companyName,
      ticker,
      tone,
      subject_line: emailResult.subject_line,
      email_body:   emailResult.email_body,
      result_json:  emailResult,
      generated_at: new Date().toISOString(),
    }).single();

    return NextResponse.json({
      success: true,
      email:   emailResult,
      meta: {
        company:             companyName,
        ticker,
        revenue_formatted:   fmt(revenue),
        total_leaks:         totalLeaks,
        total_ev:            totalEV,
        top_finding:         biggestFinding?.title || "",
        top_finding_impact:  biggestFinding?.impact_max ?? 0,
        findings_used:       topFindings.length,
      },
    });

  } catch (err: any) {
    console.error("[Outreach] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
