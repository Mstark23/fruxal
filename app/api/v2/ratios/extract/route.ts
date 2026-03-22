// =============================================================================
// app/api/v2/ratios/extract/route.ts
// POST /api/v2/ratios/extract — auto-populate from diagnostic + break_even_data
// Called non-blocking after every diagnostic run
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
    if (!session?.user) return NextResponse.json({ extracted: false, reason: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const { businessId } = await req.json();
    if (!businessId) return NextResponse.json({ extracted: false, reason: "businessId required" }, { status: 400 });

    // Parallel fetch: diagnostic report + break_even_data + profile
    const [reportData, beData, profileData] = await Promise.all([
      supabaseAdmin
        .from("diagnostic_reports")
        .select("result_json, overall_score")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(r => r.data),

      supabaseAdmin
        .from("break_even_data")
        .select("fixed_rent,fixed_salaries,fixed_software,fixed_insurance,fixed_loan_payments,fixed_other,variable_labour_pct,variable_materials_pct,variable_processing_pct,variable_other_pct,current_revenue")
        .eq("business_id", businessId)
        .maybeSingle()
        .then(r => r.data),

      supabaseAdmin
        .from("business_profiles")
        .select("exact_annual_revenue, annual_revenue, employee_count")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .maybeSingle()
        .then(r => r.data),
    ]);

    const inputs: Partial<RatioInputs> = {};
    const missing: string[] = [];

    // ── From business profile ─────────────────────────────────────────────
    const annRev = profileData?.exact_annual_revenue ?? profileData?.annual_revenue ?? 0;
    if (annRev > 0) inputs.revenue = Math.round(annRev / 12);

    // ── From break_even_data ──────────────────────────────────────────────
    if (beData) {
      const fixedTotal = (beData.fixed_rent ?? 0) + (beData.fixed_salaries ?? 0) +
        (beData.fixed_software ?? 0) + (beData.fixed_insurance ?? 0) +
        (beData.fixed_loan_payments ?? 0) + (beData.fixed_other ?? 0);
      const varPct = (beData.variable_labour_pct ?? 0) + (beData.variable_materials_pct ?? 0) +
        (beData.variable_processing_pct ?? 0) + (beData.variable_other_pct ?? 0);
      const rev = inputs.revenue ?? beData.current_revenue ?? 0;

      if (fixedTotal > 0) inputs.operatingExpenses = Math.round(fixedTotal);
      if (varPct > 0 && rev > 0) inputs.cogs = Math.round(rev * varPct / 100);
      if (beData.fixed_loan_payments > 0) inputs.debtServiceMonthly = Math.round(beData.fixed_loan_payments);
      if (rev > 0 && inputs.cogs != null && inputs.operatingExpenses != null) {
        inputs.ebitda = Math.max(0, rev - inputs.cogs - inputs.operatingExpenses);
        inputs.netProfit = inputs.ebitda; // simplified — no tax/interest available
      }
    }

    // ── From diagnostic report JSON ───────────────────────────────────────
    if (reportData?.result_json) {
      const rj = reportData.result_json as any;

      // Try direct fields first
      if (rj.monthly_revenue ?? rj.revenue)     inputs.revenue              = rj.monthly_revenue ?? rj.revenue;
      if (rj.monthly_cogs ?? rj.cogs)           inputs.cogs                 = rj.monthly_cogs ?? rj.cogs;
      if (rj.ebitda ?? rj.monthly_ebitda)       inputs.ebitda               = rj.ebitda ?? rj.monthly_ebitda;
      if (rj.net_profit)                        inputs.netProfit            = rj.net_profit;
      if (rj.gross_margin_pct && inputs.revenue) {
        inputs.cogs = Math.round(inputs.revenue * (1 - rj.gross_margin_pct / 100));
      }
      if (rj.total_assets)                      inputs.totalAssets          = rj.total_assets;
      if (rj.total_debt)                        inputs.totalDebt            = rj.total_debt;
      if (rj.total_equity)                      inputs.totalEquity          = rj.total_equity;
      if (rj.accounts_receivable)               inputs.accountsReceivable   = rj.accounts_receivable;
      if (rj.accounts_payable)                  inputs.accountsPayable      = rj.accounts_payable;
      if (rj.cash_and_equivalents ?? rj.cash)   inputs.cashAndEquivalents   = rj.cash_and_equivalents ?? rj.cash;
      if (rj.debt_service_monthly)              inputs.debtServiceMonthly   = rj.debt_service_monthly;

      // Try from findings
      if (Array.isArray(rj.findings)) {
        for (const f of rj.findings) {
          if (!inputs.cogs && (f.category === "cogs" || f.category === "cost_of_goods")) {
            inputs.cogs = f.monthly_cost ?? 0;
          }
          if (!inputs.debtServiceMonthly && f.category === "debt_service") {
            inputs.debtServiceMonthly = f.monthly_cost ?? 0;
          }
        }
      }
    }

    // Track what's missing
    if (!inputs.revenue)                { missing.push("Monthly revenue"); }
    if (!inputs.cogs)                   { missing.push("Cost of goods sold"); }
    if (!inputs.totalAssets)            { missing.push("Total assets (balance sheet)"); }
    if (!inputs.totalDebt)              { missing.push("Total debt"); }
    if (!inputs.totalEquity)            { missing.push("Total equity"); }
    if (!inputs.accountsReceivable)     { missing.push("Accounts receivable"); }
    if (!inputs.debtServiceMonthly)     { missing.push("Monthly debt service"); }

    // Require at least revenue to save
    if (!inputs.revenue) {
      return NextResponse.json({ extracted: false, reason: "Insufficient data — no revenue available", missing });
    }

    const ratios = calculateAllRatios(inputs);
    const completeness = calculateDataCompleteness(inputs);
    const period = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const { error } = await supabaseAdmin
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
        monthly_revenue:       inputs.revenue ?? null,
        monthly_cogs:          inputs.cogs ?? null,
        monthly_ebitda:        inputs.ebitda ?? null,
        monthly_debt_service:  inputs.debtServiceMonthly ?? null,
        total_assets:          inputs.totalAssets ?? null,
        total_debt:            inputs.totalDebt ?? null,
        total_equity:          inputs.totalEquity ?? null,
        accounts_receivable:   inputs.accountsReceivable ?? null,
        accounts_payable:      inputs.accountsPayable ?? null,
        cash_and_equivalents:  inputs.cashAndEquivalents ?? null,
        data_completeness_pct: completeness,
        data_source:           "diagnostic",
      }, { onConflict: "business_id,period_month" });

    if (error) return NextResponse.json({ extracted: false, reason: error.message });

    return NextResponse.json({ extracted: true, completeness, ratios, missing });
  } catch (err: any) {
    return NextResponse.json({ extracted: false, reason: err.message });
  }
}
