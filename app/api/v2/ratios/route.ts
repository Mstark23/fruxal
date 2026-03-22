// =============================================================================
// app/api/v2/ratios/route.ts
// GET  /api/v2/ratios?businessId=XXX  — fetch ratios with trend + grades
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getRatioGrades,
  calculateTrend,
  RATIO_BENCHMARKS,
  type CalculatedRatios,
} from "@/lib/ai/ratio-calculator";

export const maxDuration = 15;

async function verifyOwnership(userId: string, businessId: string): Promise<boolean> {
  const { data: biz } = await supabaseAdmin.from("businesses").select("id").eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
  if (biz) return true;
  const { data: prof } = await supabaseAdmin.from("business_profiles").select("business_id").eq("business_id", businessId).eq("user_id", userId).maybeSingle();
  return !!prof;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
    if (!await verifyOwnership(userId, businessId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Fetch last 4 months for trend + sparklines
    const { data: rows } = await supabaseAdmin
      .from("financial_ratios")
      .select("id,business_id,period_month,calculated_at,current_ratio,quick_ratio,cash_ratio,gross_margin_pct,ebitda_margin_pct,net_profit_margin_pct,return_on_assets_pct,asset_turnover,dso_days,dpo_days,inventory_days,debt_to_equity,dscr,interest_coverage,monthly_revenue,monthly_cogs,monthly_ebitda,monthly_debt_service,total_assets,accounts_receivable,accounts_payable,data_completeness_pct,data_source,narrative,narrative_generated_at")
      .eq("business_id", businessId)
      .order("period_month", { ascending: false })
      .limit(4);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: null, setup_required: true });
    }

    const current = rows[0];
    const previous = rows[1] ?? null;

    // Get business industry for grading
    const { data: prof } = await supabaseAdmin
      .from("business_profiles")
      .select("industry")
      .eq("business_id", businessId)
      .maybeSingle();
    const industrySlug = prof?.industry || "generic";

    const currentRatios: CalculatedRatios = {
      currentRatio:       current.current_ratio,
      quickRatio:         current.quick_ratio,
      cashRatio:          current.cash_ratio,
      grossMarginPct:     current.gross_margin_pct,
      ebitdaMarginPct:    current.ebitda_margin_pct,
      netProfitMarginPct: current.net_profit_margin_pct,
      returnOnAssetsPct:  current.return_on_assets_pct,
      assetTurnover:      current.asset_turnover,
      dsoDays:            current.dso_days,
      dpoDays:            current.dpo_days,
      inventoryDays:      current.inventory_days,
      debtToEquity:       current.debt_to_equity,
      dscr:               current.dscr,
      interestCoverage:   current.interest_coverage,
    };

    // Trend per ratio
    const trend: Record<string, "improving" | "stable" | "declining"> = {};
    if (previous) {
      const prevRatios: CalculatedRatios = {
        currentRatio: previous.current_ratio, quickRatio: previous.quick_ratio,
        cashRatio: previous.cash_ratio, grossMarginPct: previous.gross_margin_pct,
        ebitdaMarginPct: previous.ebitda_margin_pct, netProfitMarginPct: previous.net_profit_margin_pct,
        returnOnAssetsPct: previous.return_on_assets_pct, assetTurnover: previous.asset_turnover,
        dsoDays: previous.dso_days, dpoDays: previous.dpo_days, inventoryDays: previous.inventory_days,
        debtToEquity: previous.debt_to_equity, dscr: previous.dscr, interestCoverage: previous.interest_coverage,
      };
      for (const key of Object.keys(RATIO_BENCHMARKS) as (keyof CalculatedRatios)[]) {
        trend[key] = calculateTrend(currentRatios[key] as number | null, prevRatios[key] as number | null, RATIO_BENCHMARKS[key]);
      }
    }

    const grades = getRatioGrades(currentRatios, industrySlug);

    // History for sparklines (last 3 months)
    const history = rows.slice(0, 3).map(r => ({
      period_month: r.period_month,
      currentRatio: r.current_ratio, quickRatio: r.quick_ratio,
      grossMarginPct: r.gross_margin_pct, ebitdaMarginPct: r.ebitda_margin_pct,
      dsoDays: r.dso_days, dscr: r.dscr, debtToEquity: r.debt_to_equity,
    }));

    return NextResponse.json({
      current: currentRatios,
      trend,
      grades,
      dataCompleteness: current.data_completeness_pct ?? 0,
      dataSource: current.data_source ?? "diagnostic",
      narrative: current.narrative ?? null,
      narrativeGeneratedAt: current.narrative_generated_at ?? null,
      lastCalculated: current.calculated_at,
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
