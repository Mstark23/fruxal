// =============================================================================
// app/api/v2/breakeven/route.ts
// GET  /api/v2/breakeven?businessId=XXX  — fetch break-even data
// POST /api/v2/breakeven                 — save cost structure
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  calculateBreakEven,
  calculateSafetyMargin,
  validateCostInputs,
} from "@/lib/ai/break-even-calculator";

export const maxDuration = 15;

// ── Ownership helper ──────────────────────────────────────────────────────────
async function verifyOwnership(userId: string, businessId: string): Promise<boolean> {
  const { data: biz } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (biz) return true;

  const { data: prof } = await supabaseAdmin
    .from("business_profiles")
    .select("business_id")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!prof;
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    if (!await verifyOwnership(userId, businessId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data } = await supabaseAdmin
      .from("break_even_data")
      .select("id,business_id,fixed_rent,fixed_salaries,fixed_software,fixed_insurance,fixed_loan_payments,fixed_other,variable_labour_pct,variable_materials_pct,variable_processing_pct,variable_other_pct,break_even_revenue,current_revenue,safety_margin,safety_margin_pct,data_source,last_calculated_at,updated_at")
      .eq("business_id", businessId)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ data: null, setup_required: true });
    }

    return NextResponse.json({ data, setup_required: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const body = await req.json();
    const { businessId, fixedCosts, variablePcts, currentRevenue, dataSource } = body;

    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
    if (!await verifyOwnership(userId, businessId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fc = fixedCosts || {};
    const vp = variablePcts || {};

    const fixedRent          = Math.max(0, Number(fc.rent ?? 0));
    const fixedSalaries      = Math.max(0, Number(fc.salaries ?? 0));
    const fixedSoftware      = Math.max(0, Number(fc.software ?? 0));
    const fixedInsurance     = Math.max(0, Number(fc.insurance ?? 0));
    const fixedLoanPayments  = Math.max(0, Number(fc.loanPayments ?? 0));
    const fixedOther         = Math.max(0, Number(fc.other ?? 0));
    const fixedTotal         = fixedRent + fixedSalaries + fixedSoftware + fixedInsurance + fixedLoanPayments + fixedOther;

    const varLabourPct     = Math.max(0, Number(vp.labour ?? 0));
    const varMaterialsPct  = Math.max(0, Number(vp.materials ?? 0));
    const varProcessingPct = Math.max(0, Number(vp.processing ?? 0));
    const varOtherPct      = Math.max(0, Number(vp.other ?? 0));
    const varTotalPct      = varLabourPct + varMaterialsPct + varProcessingPct + varOtherPct;

    const rev = Math.max(0, Number(currentRevenue ?? 0));

    // Validate before saving
    const validation = validateCostInputs(fixedTotal, varTotalPct, rev);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const breakEvenRevenue = calculateBreakEven(fixedTotal, varTotalPct);
    const safetyMargin = calculateSafetyMargin(rev, breakEvenRevenue);

    const payload = {
      business_id:          businessId,
      fixed_rent:           fixedRent,
      fixed_salaries:       fixedSalaries,
      fixed_software:       fixedSoftware,
      fixed_insurance:      fixedInsurance,
      fixed_loan_payments:  fixedLoanPayments,
      fixed_other:          fixedOther,
      variable_labour_pct:     varLabourPct,
      variable_materials_pct:  varMaterialsPct,
      variable_processing_pct: varProcessingPct,
      variable_other_pct:      varOtherPct,
      break_even_revenue:   Math.round(breakEvenRevenue),
      current_revenue:      Math.round(rev),
      safety_margin:        safetyMargin.amount,
      safety_margin_pct:    safetyMargin.percentage,
      data_source:          dataSource || "manual",
      last_calculated_at:   new Date().toISOString(),
      updated_at:           new Date().toISOString(),
    };

    const { data: upserted, error } = await supabaseAdmin
      .from("break_even_data")
      .upsert(payload, { onConflict: "business_id" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: upserted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
