// =============================================================================
// app/api/v2/diagnostic/private-company/route.ts
// POST — Rep-facing: create business_profile for a private company and run
//        the enterprise diagnostic. Returns reportId for dashboard redirect.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      business_name, industry, province = "ON", structure = "ccpc",
      annual_revenue, employee_count = 0, gross_margin_pct, ebitda_estimate,
      owner_salary, exit_horizon = "unknown", has_holdco = false,
      lcge_eligible = false, passive_over_50k = false, has_cda = false,
      rdtoh_balance, sred_last_year, does_rd = false, has_payroll = true,
      has_accountant = false, language = "en",
    } = body;

    if (!business_name || !annual_revenue || !industry) {
      return NextResponse.json(
        { success: false, error: "business_name, annual_revenue, and industry are required" },
        { status: 400 }
      );
    }

    // ── Upsert business_profile ───────────────────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id")
      .eq("user_id", userId)
      .eq("business_name", business_name)
      .maybeSingle();

    let businessId: string = existing?.business_id;

    if (!businessId) {
      businessId = crypto.randomUUID();
      const { error: insertErr } = await supabaseAdmin
        .from("business_profiles")
        .insert({
          business_id:               businessId,
          user_id:                   userId,
          business_name,
          industry,
          province,
          structure,
          exact_annual_revenue:      annual_revenue,
          employee_count,
          gross_margin_pct:          gross_margin_pct   || null,
          ebitda_estimate:           ebitda_estimate    || null,
          owner_salary:              owner_salary       || null,
          exit_horizon,
          has_holdco,
          lcge_eligible,
          passive_income_over_50k:   passive_over_50k,
          has_cda_balance:           has_cda,
          rdtoh_balance:             rdtoh_balance      || null,
          sred_claimed_last_year:    sred_last_year     || null,
          does_rd,
          has_payroll,
          has_accountant,
          is_public_company:         false,
          is_rep_created:            true,
        });
      if (insertErr) throw insertErr;
    } else {
      await supabaseAdmin.from("business_profiles").update({
        industry, province, structure,
        exact_annual_revenue:      annual_revenue,
        employee_count,
        gross_margin_pct:          gross_margin_pct   || null,
        ebitda_estimate:           ebitda_estimate    || null,
        owner_salary:              owner_salary       || null,
        exit_horizon,
        has_holdco, lcge_eligible,
        passive_income_over_50k:   passive_over_50k,
        has_cda_balance:           has_cda,
        rdtoh_balance:             rdtoh_balance      || null,
        sred_claimed_last_year:    sred_last_year     || null,
        does_rd, has_payroll, has_accountant,
        updated_at: new Date().toISOString(),
      }).eq("business_id", businessId);
    }

    // ── Fire diagnostic ───────────────────────────────────────────────────────
    const diagRes = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/v2/diagnostic/run`,
      {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify({ businessId, language }),
      }
    );

    const diagData = await diagRes.json();
    if (!diagData.success) throw new Error(diagData.error || "Diagnostic failed");

    return NextResponse.json({
      success:    true,
      reportId:   diagData.reportId,
      businessId,
      tier:       diagData.tier,
      companyName: business_name,
    });

  } catch (err: any) {
    console.error("[PrivateCompany Diagnostic]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
