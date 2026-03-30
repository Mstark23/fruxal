// =============================================================================
// app/api/v2/diagnostic/intake/route.ts
// POST — Save enriched intake data to business_profiles before running diagnostic.
// GET  — Load current profile + intake data for pre-filling the form.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ── GET: Load profile for intake pre-fill ─────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !profile) {
      // New user with no profile yet — create a minimal one so intake can proceed
      const newBizId = crypto.randomUUID();
      await supabaseAdmin.from("business_profiles").upsert(
        { user_id: userId, business_id: newBizId, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      return NextResponse.json({ success: true, profile: { user_id: userId, business_id: newBizId } });
    }

    // Auto-generate business_id if profile exists but business_id was never set
    let bizId = profile.business_id;
    if (!bizId) {
      bizId = crypto.randomUUID();
      await supabaseAdmin.from("business_profiles")
        .update({ business_id: bizId, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      profile.business_id = bizId;
    }

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── POST: Save enriched intake data ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, intakeData } = body;

    if (!businessId) {
      return NextResponse.json({ success: false, error: "businessId required" }, { status: 400 });
    }

    // Calculate intake quality score (0–100)
    let score = 0;
    const d = intakeData;

    // Core fields (60 points)
    if (d.exact_annual_revenue)     score += 15;
    if (d.gross_margin_pct)         score += 10;
    if (d.exact_payroll_total || !d.has_payroll) score += 10;
    if (d.net_income_last_year)     score += 10;
    if (d.owner_salary !== undefined) score += 5;
    if (d.ebitda_estimate)          score += 5;
    if (d.total_assets)             score += 5;

    // Documents uploaded (40 points)
    if (d.doc_financials_data)      score += 15;
    if (d.doc_t2_data)              score += 15;
    if (d.doc_gst_data)             score += 5;
    if (d.doc_t4_data)              score += 5;

    const updatePayload = {
      // Exact financials
      exact_annual_revenue:  d.exact_annual_revenue  ?? null,
      exact_monthly_revenue: d.exact_annual_revenue  ? Math.round(d.exact_annual_revenue / 12) : null,
      gross_margin_pct:      d.gross_margin_pct      ?? null,
      exact_payroll_total:   d.exact_payroll_total   ?? null,
      owner_salary:          d.owner_salary          ?? null,
      net_income_last_year:  d.net_income_last_year  ?? null,
      ebitda_estimate:       d.ebitda_estimate        ?? null,
      total_assets:          d.total_assets          ?? null,
      total_liabilities:     d.total_liabilities     ?? null,

      // Country + province (override onboarding if provided from intake form)
      country:               d.country               ?? undefined,
      province:              d.province               ?? undefined,

      // Operations flags (override onboarding if provided)
      has_payroll:           d.has_payroll            ?? undefined,
      employee_count:        d.employee_count         ?? undefined,
      has_accountant:        d.has_accountant         ?? undefined,
      has_bookkeeper:        d.has_bookkeeper         ?? undefined,
      does_rd:               d.does_rd               ?? undefined,
      exports_goods:         d.exports_goods          ?? undefined,
      handles_data:          d.handles_data           ?? undefined,
      has_physical_location: d.has_physical_location  ?? undefined,
      uses_payroll_software: d.uses_payroll_software  ?? undefined,
      gst_registration_date: (d.gst_registration_date && d.gst_registration_date !== '') ? d.gst_registration_date : undefined,
      structure:             d.structure             ?? undefined,
      fiscal_year_end_month: d.fiscal_year_end_month  ?? undefined,

      // Enterprise extras
      has_holdco:             d.has_holdco             ?? null,
      passive_income_over_50k:d.passive_income_over_50k ?? null,
      exit_horizon:           d.exit_horizon           ?? null,
      last_tax_review_year:   d.last_tax_review_year   ?? null,
      lcge_eligible:          d.lcge_eligible          ?? null,
      shareholder_agreements: d.shareholder_agreements ?? null,
      has_cda_balance:        d.has_cda_balance        ?? null,
      rdtoh_balance:          d.rdtoh_balance          ?? null,
      sred_claimed_last_year: d.sred_claimed_last_year ?? null,

      // Document data
      doc_t2_data:         d.doc_t2_data         ?? undefined,
      doc_financials_data: d.doc_financials_data  ?? undefined,
      doc_gst_data:        d.doc_gst_data         ?? undefined,
      doc_t4_data:         d.doc_t4_data          ?? undefined,
      doc_bank_data:       d.doc_bank_data        ?? undefined,

      // Quality + timestamp
      intake_quality_score: Math.min(score, 100),
      intake_completed_at:  new Date().toISOString(),
      updated_at:           new Date().toISOString(),
    };

    // Remove undefined values
    const clean = Object.fromEntries(
      Object.entries(updatePayload).filter(([, v]) => v !== undefined)
    );

    // upsert — if no row exists yet (new business), create it.
    // .update() silently fails when no row exists -> "Business not found" on diagnostic launch
    const { error } = await supabaseAdmin
      .from("business_profiles")
      .upsert(
        { ...clean, business_id: businessId, user_id: token.sub },
        { onConflict: "business_id" }
      );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      intake_quality_score: Math.min(score, 100),
      message: "Intake saved — ready to run diagnostic",
    });

  } catch (err: any) {
    console.error("[intake:POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}