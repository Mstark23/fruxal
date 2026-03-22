// =============================================================================
// app/api/v2/ratios/calculate/route.ts
// POST /api/v2/ratios/calculate — save manual financial data + compute ratios
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  calculateAllRatios,
  calculateDataCompleteness,
  type RatioInputs,
} from "@/lib/ai/ratio-calculator";

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const body = await req.json();
    const { businessId, financialData, periodMonth }: { businessId: string; financialData: Partial<RatioInputs>; periodMonth?: string } = body;

    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const { data: biz } = await supabaseAdmin.from("businesses").select("id").eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
    const { data: prof } = biz ? { data: null } : await supabaseAdmin.from("business_profiles").select("business_id").eq("business_id", businessId).eq("user_id", userId).maybeSingle();
    if (!biz && !prof) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const ratios = calculateAllRatios(financialData);
    const completeness = calculateDataCompleteness(financialData);

    // Default period to first day of current month
    const period = periodMonth || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const { data: upserted, error } = await supabaseAdmin
      .from("financial_ratios")
      .upsert({
        business_id:           businessId,
        period_month:          period,
        calculated_at:         new Date().toISOString(),
        current_ratio:         ratios.currentRatio,
        quick_ratio:           ratios.quickRatio,
        cash_ratio:            ratios.cashRatio,
        gross_margin_pct:      ratios.grossMarginPct,
        ebitda_margin_pct:     ratios.ebitdaMarginPct,
        net_profit_margin_pct: ratios.netProfitMarginPct,
        return_on_assets_pct:  ratios.returnOnAssetsPct,
        asset_turnover:        ratios.assetTurnover,
        dso_days:              ratios.dsoDays,
        dpo_days:              ratios.dpoDays,
        inventory_days:        ratios.inventoryDays,
        debt_to_equity:        ratios.debtToEquity,
        dscr:                  ratios.dscr,
        interest_coverage:     ratios.interestCoverage,
        monthly_revenue:       financialData.revenue ?? null,
        monthly_cogs:          financialData.cogs ?? null,
        monthly_operating_expenses: financialData.operatingExpenses ?? null,
        monthly_ebitda:        financialData.ebitda ?? null,
        total_assets:          financialData.totalAssets ?? null,
        total_debt:            financialData.totalDebt ?? null,
        total_equity:          financialData.totalEquity ?? null,
        cash_and_equivalents:  financialData.cashAndEquivalents ?? null,
        accounts_receivable:   financialData.accountsReceivable ?? null,
        accounts_payable:      financialData.accountsPayable ?? null,
        monthly_debt_service:  financialData.debtServiceMonthly ?? null,
        monthly_interest:      financialData.interestExpense ?? null,
        data_completeness_pct: completeness,
        data_source:           "manual",
      }, { onConflict: "business_id,period_month" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: upserted, ratios, completeness });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
