// =============================================================================
// app/api/v2/diagnostic/public-company/route.ts
// POST — Run a diagnostic on a TSX-listed company using real FMP financials.
//        No intake form needed — data pulled directly from public filings.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Anthropic from "@anthropic-ai/sdk";
import { aggregateFMPData, type FMPCompanyData } from "@/services/fmp/fmp-aggregator";

export const maxDuration = 120;

// ── Build a rich prompt from real public financials ──────────────────────────
function buildPublicCompanyPrompt(fmp: FMPCompanyData, language: string): { systemPrompt: string; userPrompt: string } {
  const isFr = language === "fr";
  const fmt = (n: number) => n.toLocaleString("en-CA");
  const pct = (n: number) => `${n.toFixed(1)}%`;

  const systemPrompt = `You are a senior partner at a Canadian M&A advisory firm with deep expertise in tax optimization, operational efficiency, and capital structure for publicly traded Canadian companies. You are analyzing a company that trades on ${fmp.exchange}.

CRITICAL RULES:
1. Every finding must use REAL numbers from the provided financial statements — not estimates.
2. Show the exact calculation for every dollar figure (e.g. "EBITDA margin of ${pct(fmp.ebitdaMarginPct)} vs peer median 22% = gap of X% × revenue $${fmt(fmp.revenue)} = $X recoverable EBITDA").
3. Set calculation_method to "calculated_from_public_filings" for all findings using real financials.
4. All findings must be institutional-quality — suitable for a board presentation or CFO briefing.
5. Think simultaneously as: M&A tax partner, activist investor, fractional CFO, risk officer.
6. This report may be used as an outbound sales asset — make findings specific enough that the CFO recognizes their own company immediately.
7. Minimum 12, maximum 18 findings. No finding under $50,000 annual impact.

CANADIAN TAX CONTEXT:
- Federal corporate rate: 15% (general), 9% (SBD on first $500K for CCPC — not applicable here)
- Province: ${fmp.province} — add applicable provincial rate
- SR&ED: 15% federal ITC for large corps (non-refundable), Provincial R&D credits vary
- Dividend refund, RDTOH, CDA mechanics for private corps — adapt if applicable
- Transfer pricing (if multinational operations detected)
- HST/GST optimization at this scale

OUTPUT: Respond with ONLY a valid JSON object. No markdown, no explanation, no preamble.

${buildJSONSchema(fmp)}`;

  const userPrompt = `ANALYZE ${fmp.name.toUpperCase()} (${fmp.symbol}) AND PRODUCE A COMPLETE INSTITUTIONAL-GRADE DIAGNOSTIC.

═══════════════════════════════════════════════════
COMPANY PROFILE (from public filings — ${fmp.latestFiscalYear} fiscal year)
═══════════════════════════════════════════════════
Company: ${fmp.name}
Ticker: ${fmp.symbol} | Exchange: ${fmp.exchange}
Industry: ${fmp.industry} | Sector: ${fmp.sector}
Province (HQ): ${fmp.province}
CEO: ${fmp.ceo}
Employees: ${fmt(fmp.employees)}
IPO Date: ${fmp.ipoDate}
Reporting Currency: ${fmp.reportingCurrency}

═══════════════════════════════════════════════════
INCOME STATEMENT (${fmp.latestFiscalYear} — AUDITED)
═══════════════════════════════════════════════════
Revenue:                  $${fmt(fmp.revenue)}
  YoY Growth:             ${fmp.revenueGrowthYoY !== null ? `${fmp.revenueGrowthYoY > 0 ? "+" : ""}${fmp.revenueGrowthYoY}%` : "N/A"}
Cost of Revenue:          $${fmt(fmp.costOfRevenue)}
Gross Profit:             $${fmt(fmp.grossProfit)} (${pct(fmp.grossMarginPct)} margin)
Operating Expenses:       $${fmt(fmp.operatingExpenses)}
Operating Income:         $${fmt(fmp.operatingIncome)} (${pct(fmp.operatingMarginPct)} margin)
EBITDA:                   $${fmt(fmp.ebitda)} (${pct(fmp.ebitdaMarginPct)} margin)
D&A:                      $${fmt(fmp.depreciationAmortization)}
Interest Expense:         $${fmt(fmp.interestExpense)}
Income Tax Expense:       $${fmt(fmp.incomeTaxExpense)}
Effective Tax Rate:       ${pct(fmp.effectiveTaxRatePct)}
Net Income:               $${fmt(fmp.netIncome)} (${pct(fmp.netMarginPct)} margin)
EPS:                      $${fmp.eps.toFixed(2)}
R&D Expense:              $${fmt(fmp.rd_expense)}

═══════════════════════════════════════════════════
BALANCE SHEET
═══════════════════════════════════════════════════
Cash & Equivalents:       $${fmt(fmp.cashAndEquivalents)}
Accounts Receivable:      $${fmt(fmp.accountsReceivable)}
Inventory:                $${fmt(fmp.inventory)}
Total Assets:             $${fmt(fmp.totalAssets)}
Total Debt:               $${fmt(fmp.totalDebt)}
Net Debt:                 $${fmt(fmp.netDebt)}
Total Equity:             $${fmt(fmp.totalEquity)}
Working Capital:          $${fmt(fmp.workingCapital)}
Current Ratio:            ${fmp.currentRatio ?? "N/A"}
Debt/Equity:              ${fmp.debtToEquity ?? "N/A"}

═══════════════════════════════════════════════════
CASH FLOW
═══════════════════════════════════════════════════
Operating Cash Flow:      $${fmt(fmp.operatingCashFlow)}
CapEx:                    $${fmt(fmp.capex)}
Free Cash Flow:           $${fmt(fmp.freeCashFlow)}
Dividends Paid:           $${fmt(fmp.dividendsPaid)}
FCF Conversion:           ${fmp.netIncome ? pct((fmp.freeCashFlow / fmp.netIncome) * 100) : "N/A"}

═══════════════════════════════════════════════════
KEY RATIOS & RETURNS
═══════════════════════════════════════════════════
P/E Ratio:                ${fmp.peRatio?.toFixed(1) ?? "N/A"}
P/B Ratio:                ${fmp.pbRatio?.toFixed(2) ?? "N/A"}
ROE:                      ${fmp.roe !== null ? pct(fmp.roe) : "N/A"}
ROA:                      ${fmp.roa !== null ? pct(fmp.roa) : "N/A"}
ROIC:                     ${fmp.roic !== null ? pct(fmp.roic) : "N/A"}

═══════════════════════════════════════════════════
3-YEAR TREND
═══════════════════════════════════════════════════
${fmp.history.map((h) =>
  `${h.year}: Revenue $${fmt(h.revenue)} | Gross Margin ${pct(h.grossMarginPct)} | EBITDA Margin ${pct(h.ebitdaMarginPct)} | Net Margin ${pct(h.netMarginPct)} | Net Income $${fmt(h.netIncome)}`
).join("\n")}

═══════════════════════════════════════════════════
ESTIMATED PAYROLL
═══════════════════════════════════════════════════
Estimated Annual Payroll:  $${fmt(fmp.payrollEstimate)} (based on ${fmt(fmp.employees)} employees × industry avg salary)
Payroll-to-Revenue Ratio:  ${fmp.revenue ? pct((fmp.payrollEstimate / fmp.revenue) * 100) : "N/A"}

INSTRUCTIONS:
- Use EVERY financial figure above. Do not ignore any line item.
- Calculate peer benchmarks for ${fmp.industry} (${fmp.sector}) on ${fmp.exchange}.
- Find the 3-5 largest value creation levers first (EBITDA margin expansion, tax structure, capital allocation).
- Identify any anomalies in the financials (e.g. effective tax rate vs statutory rate, FCF vs net income divergence, AR days vs industry).
- Calculate enterprise value implications for each finding (assume 8-12× EBITDA multiple for ${fmp.industry}).
- Language: ${isFr ? "French primary, English secondary" : "English primary, French secondary"}.`;

  return { systemPrompt, userPrompt };
}

function buildJSONSchema(fmp: FMPCompanyData): string {
  return `JSON SCHEMA (respond with this exact structure):
{
  "tier": "public_company",
  "company_name": "${fmp.name}",
  "ticker": "${fmp.symbol}",
  "fiscal_year": "${fmp.latestFiscalYear}",
  "savings_anchor": "string (e.g. 'We identified $X in value creation opportunities for ${fmp.name}.')",
  "executive_summary": "string (300 words max. Open with the single biggest finding. Quantify total opportunity. Frame through shareholder value and EBITDA multiple. Professional advisory register.)",
  "overall_score": 0-100,
  "compliance_score": 0-100,
  "efficiency_score": 0-100,
  "optimization_score": 0-100,
  "growth_score": 0-100,
  "bankability_score": 0-100,
  "exit_readiness_score": 0-100,
  "scores": { "overall": 0-100, "compliance": 0-100, "efficiency": 0-100, "optimization": 0-100, "growth": 0-100, "bankability": 0-100, "exit_readiness": 0-100 },
  "total_annual_leaks": number,
  "total_potential_savings": number,
  "total_penalty_exposure": number,
  "total_programs_value": number,
  "totals": { "annual_leaks": number, "potential_savings": number, "penalty_exposure": number, "programs_value": number },
  "findings": [
    {
      "id": "F-001",
      "category": "tax|payroll|compliance|operations|insurance|contract|growth|structure|cash_flow",
      "severity": "critical|high|medium|low",
      "priority_quadrant": "quick_win|strategic|defer|ignore",
      "title": "string",
      "title_fr": "string",
      "description": "string (real numbers, calculation shown, benchmark referenced)",
      "description_fr": "string",
      "impact_min": number,
      "impact_max": number,
      "lifetime_value": number,
      "calculation_shown": "string (exact math with real figures)",
      "calculation_method": "calculated_from_public_filings",
      "assumptions": ["string"],
      "confidence": "high|medium|low",
      "finding_type": "confirmed|probable|estimated|risk_indicator",
      "saving_type": "recurring_annual|one_time_recovery|ongoing_cost_reduction",
      "urgency_level": "today|this_month|this_quarter|this_year|when_ready",
      "urgency_reason": "string",
      "cost_of_inaction_90_days": number,
      "monthly_delay_cost": number,
      "recommendation": "string (board/CFO level action steps)",
      "recommendation_fr": "string",
      "fix_method": "hire_specialist|hire_accountant|hire_lawyer|use_software|diy",
      "implementation_hours": number,
      "requires_professional": true,
      "estimated_professional_cost": number,
      "success_vision": "string",
      "second_order_effects": ["string (e.g. EV impact, credit rating, bonding capacity)"],
      "solution_type": "professional|government_program|affiliate",
      "partner_slugs": [],
      "program_slugs": [],
      "obligation_slug": null,
      "priority": 1-10,
      "timeline": "immediate|this_week|this_month|this_quarter|this_year",
      "difficulty": "easy|medium|hard"
    }
  ],
  "action_plan": {
    "week_1": ["string"],
    "month_1": ["string"],
    "quarter_1": ["string"],
    "optimal_sequence": [{ "step": 1, "action": "string", "unlocks": ["string"], "value": number }]
  },
  "accountant_briefing": {
    "summary": "string (CPA-level language)",
    "priority_items": ["string"],
    "cra_forms_relevant": ["string"],
    "estimated_tax_exposure": number,
    "questions_to_ask": ["string"]
  },
  "risk_matrix": [
    {
      "area": "string", "area_fr": "string",
      "risk_level": "critical|high|medium|low",
      "likelihood": "certain|likely|possible|unlikely",
      "impact": "catastrophic|major|moderate|minor",
      "current_status": "string", "current_status_fr": "string",
      "recommendation": "string", "recommendation_fr": "string"
    }
  ],
  "benchmark_comparisons": [
    {
      "metric": "string", "metric_fr": "string",
      "your_value": "string", "industry_avg": "string", "top_quartile": "string",
      "gap": "string", "gap_fr": "string",
      "recommendation": "string", "recommendation_fr": "string"
    }
  ]
}`;
}

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const start = Date.now();

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { ticker, language = "en" } = body;
    if (!ticker) return NextResponse.json({ success: false, error: "ticker required" }, { status: 400 });

    // ── Step 1: Fetch real financial data ──────────────────────────────────
    let fmpData: FMPCompanyData;
    try {
      fmpData = await aggregateFMPData(ticker);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: `Could not fetch data for ${ticker}: ${e.message}` }, { status: 404 });
    }

    // ── Step 2: Get or create a business_profile for this company ──────────
    const { data: existingProfile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id")
      .eq("user_id", userId)
      .eq("business_name", fmpData.name)
      .single();

    let businessId = existingProfile?.business_id;

    if (!businessId) {
      const { data: newProfile } = await supabaseAdmin
        .from("business_profiles")
        .insert({
          user_id: userId,
          business_name: fmpData.name,
          industry: fmpData.industry,
          province: fmpData.province,
          structure: "corporation",
          monthly_revenue: Math.round(fmpData.revenue / 12),
          exact_annual_revenue: fmpData.revenue,
          employee_count: fmpData.employees,
          has_payroll: fmpData.employees > 0,
          does_rd: fmpData.rd_expense > 0,
          ticker_symbol: fmpData.symbol,
          is_public_company: true,
        })
        .select("business_id")
        .single();
      businessId = newProfile?.business_id;
    }

    // ── Step 3: Create report record ───────────────────────────────────────
    const { data: report, error: createErr } = await supabaseAdmin
      .from("diagnostic_reports")
      .insert({
        business_id: businessId,
        user_id: userId,
        language,
        status: "analyzing",
        tier: "enterprise",
        input_snapshot: { fmp_data: fmpData, source: "public_filings", ticker: fmpData.symbol },
      })
      .select("id")
      .single();

    if (createErr) throw createErr;
    const reportId = report.id;

    // ── Step 4: Build prompt ───────────────────────────────────────────────
    const { systemPrompt, userPrompt } = buildPublicCompanyPrompt(fmpData, language);

    // ── Step 5: Call Claude ────────────────────────────────────────────────
    let aiResult: any;
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20251029",
        max_tokens: 10000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      promptTokens = response.usage?.input_tokens ?? 0;
      completionTokens = response.usage?.output_tokens ?? 0;
      const textBlock = response.content.find((b: any) => b.type === "text");
      const rawText = (textBlock as any)?.text || "";
      const jsonStr = rawText.replace(/```json\n?|```\n?/g, "").trim();
      try { aiResult = JSON.parse(jsonStr); } catch { throw new Error('AI returned invalid JSON'); }
    } catch (aiErr: any) {
      await supabaseAdmin.from("diagnostic_reports")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", reportId);
      return NextResponse.json({ success: false, error: "AI analysis failed: " + aiErr.message, reportId }, { status: 500 });
    }

    // ── Step 6: Save ───────────────────────────────────────────────────────
    const duration = Date.now() - start;
    const resultJson = {
      ...aiResult,
      fmp_snapshot: fmpData,
      model_used: "claude-sonnet-4-5-20251029",
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      analysis_duration_ms: duration,
      data_source: "public_filings",
    };

    const { error: saveErr } = await supabaseAdmin
      .from("diagnostic_reports")
      .update({
        status: "completed",
        result_json: resultJson,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (saveErr) throw saveErr;

    return NextResponse.json({
      success: true,
      reportId,
      companyName: fmpData.name,
      ticker: fmpData.symbol,
      duration_ms: duration,
      findings_count: aiResult?.findings?.length ?? 0,
      critical_findings: (aiResult?.findings || []).filter((f: any) => f.severity === "critical").length,
      total_potential_savings: aiResult?.totals?.potential_savings ?? 0,
      data_source: "public_filings",
    });

  } catch (err: any) {
    console.error("[PublicCompany Diagnostic]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
