// =============================================================================
// app/api/v2/ratios/narrative/route.ts
// POST /api/v2/ratios/narrative — Claude-generated plain-English summary
// Cached 24h in financial_ratios.narrative column
// maxDuration = 30 (short Claude call)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getRatioGrades,
  getRatioStatus,
  RATIO_BENCHMARKS,
  getGrossMarginBenchmark,
  type CalculatedRatios,
} from "@/lib/ai/ratio-calculator";

export const maxDuration = 30;

function fmt(n: number | null, unit = ""): string {
  if (n === null) return "—";
  return `${Math.round(n * 100) / 100}${unit}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const { businessId } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    // Verify ownership
    const { data: biz } = await supabaseAdmin.from("businesses").select("id").eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
    const { data: prof } = biz ? { data: null } : await supabaseAdmin.from("business_profiles").select("business_id, industry").eq("business_id", businessId).eq("user_id", userId).maybeSingle();
    if (!biz && !prof) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Fetch latest ratios
    const { data: row } = await supabaseAdmin
      .from("financial_ratios")
      .select("id,business_id,period_month,calculated_at,current_ratio,quick_ratio,cash_ratio,gross_margin_pct,ebitda_margin_pct,net_profit_margin_pct,return_on_assets_pct,asset_turnover,dso_days,dpo_days,inventory_days,debt_to_equity,dscr,interest_coverage,monthly_revenue,monthly_cogs,monthly_ebitda,monthly_debt_service,total_assets,accounts_receivable,accounts_payable,data_completeness_pct,data_source,narrative,narrative_generated_at")
      .eq("business_id", businessId)
      .order("period_month", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) return NextResponse.json({ error: "No ratio data" }, { status: 404 });

    // Check cache (24h)
    if (row.narrative && row.narrative_generated_at) {
      const age = Date.now() - new Date(row.narrative_generated_at).getTime();
      if (age < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ narrative: row.narrative, cached: true });
      }
    }

    const { data: bizProf } = await supabaseAdmin.from("business_profiles").select("business_name, industry").eq("business_id", businessId).maybeSingle();
    const industrySlug = bizProf?.industry || "generic";
    const bizName = bizProf?.business_name || "this business";

    const ratios: CalculatedRatios = {
      currentRatio: row.current_ratio, quickRatio: row.quick_ratio, cashRatio: row.cash_ratio,
      grossMarginPct: row.gross_margin_pct, ebitdaMarginPct: row.ebitda_margin_pct,
      netProfitMarginPct: row.net_profit_margin_pct, returnOnAssetsPct: row.return_on_assets_pct,
      assetTurnover: row.asset_turnover, dsoDays: row.dso_days, dpoDays: row.dpo_days,
      inventoryDays: row.inventory_days, debtToEquity: row.debt_to_equity,
      dscr: row.dscr, interestCoverage: row.interest_coverage,
    };

    const grades = getRatioGrades(ratios, industrySlug);
    const gmBenchmark = getGrossMarginBenchmark(industrySlug);

    // Build ratio context for Claude
    const ratioLines = [
      ratios.currentRatio   !== null ? `Current ratio: ${fmt(ratios.currentRatio, "x")} (${getRatioStatus(ratios.currentRatio, RATIO_BENCHMARKS.currentRatio)})` : null,
      ratios.dscr           !== null ? `DSCR: ${fmt(ratios.dscr, "x")} — bank requires >1.25x (${getRatioStatus(ratios.dscr, RATIO_BENCHMARKS.dscr)})` : null,
      ratios.grossMarginPct !== null ? `Gross margin: ${fmt(ratios.grossMarginPct, "%")} (${getRatioStatus(ratios.grossMarginPct, gmBenchmark)})` : null,
      ratios.ebitdaMarginPct !== null ? `EBITDA margin: ${fmt(ratios.ebitdaMarginPct, "%")} (${getRatioStatus(ratios.ebitdaMarginPct, RATIO_BENCHMARKS.ebitdaMarginPct)})` : null,
      ratios.dsoDays        !== null ? `DSO: ${fmt(ratios.dsoDays, " days")} — benchmark <30 days (${getRatioStatus(ratios.dsoDays, RATIO_BENCHMARKS.dsoDays)})` : null,
      ratios.dpoDays        !== null ? `DPO: ${fmt(ratios.dpoDays, " days")} — you pay suppliers in this many days (${getRatioStatus(ratios.dpoDays, RATIO_BENCHMARKS.dpoDays)})` : null,
      ratios.debtToEquity   !== null ? `Debt-to-equity: ${fmt(ratios.debtToEquity, "x")} (${getRatioStatus(ratios.debtToEquity, RATIO_BENCHMARKS.debtToEquity)})` : null,
      ratios.interestCoverage !== null ? `Interest coverage: ${fmt(ratios.interestCoverage, "x")} (${getRatioStatus(ratios.interestCoverage, RATIO_BENCHMARKS.interestCoverage)})` : null,
    ].filter(Boolean).join("\n");

    const prompt = `Write a 3-paragraph plain English assessment of these financial ratios for ${bizName}, a ${industrySlug.replace(/_/g, " ")} business.

GRADES:
Liquidity: ${grades.liquidity} | Profitability: ${grades.profitability} | Efficiency: ${grades.efficiency} | Leverage: ${grades.leverage}
Overall: ${grades.overall} (${grades.overallScore}/100)

RATIOS:
${ratioLines}
Data completeness: ${row.data_completeness_pct ?? 0}%

Rules:
- Paragraph 1: overall picture in 2-3 sentences — what story do the ratios tell?
- Paragraph 2: focus on the weakest area(s) with specific dollar implications if possible
- Paragraph 3: the strongest ratio and what opportunity it creates
- Plain English, no jargon, no markdown, no bullet points
- Reference specific numbers from the ratios
- Canadian business context where relevant
- Under 200 words total`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ narrative: "", cached: false });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return NextResponse.json({ narrative: "", cached: false });
    const data = await res.json();
    const narrative = data.content?.[0]?.text?.trim() || "";

    // Cache in DB
    await supabaseAdmin
      .from("financial_ratios")
      .update({ narrative, narrative_generated_at: new Date().toISOString() } as any)
      .eq("id", row.id);

    return NextResponse.json({ narrative, cached: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
