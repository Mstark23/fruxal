// =============================================================================
// app/api/v2/breakeven/extract/route.ts
// POST /api/v2/breakeven/extract — auto-populate break-even from diagnostic
// Called non-blocking after diagnostic/run completes
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateBreakEven, calculateSafetyMargin } from "@/lib/ai/break-even-calculator";

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const { businessId } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    // Fetch latest completed diagnostic report
    const { data: report } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("result_json, overall_score")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!report?.result_json) {
      return NextResponse.json({ extracted: false, reason: "No completed diagnostic" });
    }

    const rj = report.result_json as any;

    // ── Extract cost structure from diagnostic JSON ────────────────────────
    // Try multiple field name conventions used across diagnostic versions
    const fixedCosts =
      rj.fixed_costs ?? rj.monthly_fixed_costs ?? rj.cost_structure?.fixed ?? 0;
    const variablePct =
      rj.variable_cost_pct ?? rj.cogs_pct ?? rj.labour_ratio ?? rj.cost_structure?.variable_pct ?? 0;
    const revenue =
      rj.monthly_revenue ?? rj.current_revenue ?? rj.revenue ?? 0;

    // Try from findings if top-level fields missing
    let extractedFixed = Number(fixedCosts) || 0;
    let extractedVarPct = Number(variablePct) || 0;
    let extractedRevenue = Number(revenue) || 0;

    if (extractedFixed === 0 && Array.isArray(rj.findings)) {
      for (const f of rj.findings) {
        if (f.category === "payroll" || f.category === "salaries") {
          extractedFixed += Number(f.monthly_cost ?? (f.annual_cost ? f.annual_cost / 12 : 0));
        }
        if (f.category === "rent" || f.category === "occupancy") {
          extractedFixed += Number(f.monthly_cost ?? (f.annual_cost ? f.annual_cost / 12 : 0));
        }
        if (!extractedVarPct && (f.variable_cost_pct || f.cogs_pct)) {
          extractedVarPct = Number(f.variable_cost_pct ?? f.cogs_pct ?? 0);
        }
      }
    }

    // Also try profile revenue fallback
    if (extractedRevenue === 0) {
      const { data: prof } = await supabaseAdmin
        .from("business_profiles")
        .select("exact_annual_revenue, annual_revenue")
        .eq("business_id", businessId)
        .maybeSingle();
      const annRev = prof?.exact_annual_revenue ?? prof?.annual_revenue ?? 0;
      extractedRevenue = Math.round(annRev / 12);
    }

    // Require at least some data to auto-populate
    if (extractedFixed === 0 && extractedVarPct === 0) {
      return NextResponse.json({ extracted: false, reason: "Insufficient cost data in diagnostic" });
    }

    const breakEvenRevenue = calculateBreakEven(extractedFixed, extractedVarPct);
    const safetyMargin = calculateSafetyMargin(extractedRevenue, breakEvenRevenue);

    const { error } = await supabaseAdmin
      .from("break_even_data")
      .upsert({
        business_id:          businessId,
        fixed_other:          Math.round(extractedFixed), // store in 'other' since we can't split
        variable_other_pct:   Math.round(extractedVarPct * 10) / 10,
        current_revenue:      Math.round(extractedRevenue),
        break_even_revenue:   Math.round(breakEvenRevenue),
        safety_margin:        safetyMargin.amount,
        safety_margin_pct:    safetyMargin.percentage,
        data_source:          "diagnostic",
        last_calculated_at:   new Date().toISOString(),
        updated_at:           new Date().toISOString(),
      }, { onConflict: "business_id" });

    if (error) return NextResponse.json({ extracted: false, reason: error.message });

    return NextResponse.json({
      extracted: true,
      breakEvenRevenue: Math.round(breakEvenRevenue),
      safetyMargin: safetyMargin.amount,
    });
  } catch (err: any) {
    return NextResponse.json({ extracted: false, reason: err.message });
  }
}
