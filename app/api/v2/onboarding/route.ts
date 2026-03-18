// =============================================================================
// POST /api/v2/onboarding
// Saves business profile data collected during onboarding.
// Returns { success, businessId } so the page can trigger obligation sync.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = token.sub;
    const body = await req.json().catch(() => ({}));

    // Resolve or create business_id
    const { data: existing } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id")
      .eq("user_id", userId)
      .single()
      .catch(() => ({ data: null }));

    const businessId = existing?.business_id || crypto.randomUUID();

    // Build whitelisted update payload
    const toNum = (v: any) => { const n = parseFloat(String(v || "0")); return isNaN(n) ? 0 : n; };
    const toInt = (v: any) => { const n = parseInt(String(v || "0")); return isNaN(n) ? 0 : n; };
    const toBool = (v: any) => v === true || v === "true" || v === 1;
    const toDate = (v: any) => (v && String(v).length >= 8 ? String(v) : null);

    const payload: Record<string, any> = {
      user_id:             userId,
      business_id:         businessId,
      business_name:       body.business_name || null,
      industry:            body.industry || null,
      industry_naics:      body.industry_naics || null,
      industry_slug:       body.industry || null,
      structure:           body.structure || null,
      business_structure:  body.structure || null,
      province:            body.province || null,
      city:                body.city || null,
      monthly_revenue:     toNum(body.monthly_revenue),
      annual_revenue:      toNum(body.monthly_revenue) * 12,
      employee_count:      toInt(body.employee_count),
      fiscal_year_end_month: toInt(body.fiscal_year_end_month) || 12,
      has_payroll:         toBool(body.has_payroll),
      handles_data:        toBool(body.handles_data),
      has_physical_location: toBool(body.has_physical_location),
      has_accountant:      toBool(body.has_accountant),
      has_bookkeeper:      toBool(body.has_bookkeeper),
      uses_payroll_software: toBool(body.uses_payroll_software),
      uses_pos:            toBool(body.uses_pos),
      does_construction:   toBool(body.does_construction),
      sells_alcohol:       toBool(body.sells_alcohol),
      handles_food:        toBool(body.handles_food),
      does_rd:             toBool(body.does_rd),
      has_professional_order: toBool(body.has_professional_order),
      has_holdco:          toBool(body.has_holdco),
      incorporation_date:  toDate(body.incorporation_date),
      registration_date:   toDate(body.registration_date),
      gst_registration_date: toDate(body.gst_registration_date),
      qst_registration_date: toDate(body.qst_registration_date),
      first_employee_date: toDate(body.first_employee_date),
      licence_renewal_date: toDate(body.licence_renewal_date),
      insurance_renewal_date: toDate(body.insurance_renewal_date),
      lease_start_date:    toDate(body.lease_start_date),
      lease_end_date:      toDate(body.lease_end_date),
      onboarding_completed: true,
      updated_at:          new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("business_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;

    // Also update businesses table if it exists for this user
    await supabaseAdmin
      .from("businesses")
      .update({
        name:          body.business_name || "My Business",
        industry_slug: body.industry || null,
        province:      body.province || null,
        updated_at:    new Date().toISOString(),
      })
      .eq("owner_user_id", userId)
      .catch(() => {});

    return NextResponse.json({ success: true, businessId });

  } catch (err: any) {
    console.error("[Onboarding:POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
