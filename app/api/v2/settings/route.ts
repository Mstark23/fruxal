// =============================================================================
// src/app/api/v2/settings/route.ts
// =============================================================================
// GET  — Load all settings (profile, dates, notifications, billing)
// PUT  — Save all settings in one call, triggers obligation resync if dates changed
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // ─── Profile + dates ──────────────────────────────────────────────
    const { data: bp } = await supabaseAdmin
      .from("business_profiles")
      .select("*")
      .eq("user_id", token.sub)
      .single();

    const profile = bp ? {
      business_name: bp.business_name || "",
      industry: bp.industry || "",
      structure: bp.structure || "",
      province: bp.province || "",
      city: bp.city || "",
      monthly_revenue: String(bp.monthly_revenue || ""),
      employee_count: String(bp.employee_count || 0),
      fiscal_year_end_month: String(bp.fiscal_year_end_month || 12),
      has_payroll: bp.has_payroll || false,
      handles_data: bp.handles_data || false,
      has_physical_location: bp.has_physical_location || false,
      sells_alcohol: bp.sells_alcohol || false,
      handles_food: bp.handles_food || false,
      does_construction: bp.does_construction || false,
      has_professional_order: bp.has_professional_order || false,
      exports_goods: bp.exports_goods || false,
      does_rd: bp.does_rd || false,
      has_accountant: bp.has_accountant || false,
      has_bookkeeper: bp.has_bookkeeper || false,
      uses_payroll_software: bp.uses_payroll_software || false,
      uses_pos: bp.uses_pos || false,
    } : null;

    const dates = bp ? {
      incorporation_date: bp.incorporation_date || "",
      registration_date: bp.registration_date || "",
      gst_registration_date: bp.gst_registration_date || "",
      qst_registration_date: bp.qst_registration_date || "",
      first_employee_date: bp.first_employee_date || "",
      licence_renewal_date: bp.licence_renewal_date || "",
      insurance_renewal_date: bp.insurance_renewal_date || "",
      lease_start_date: bp.lease_start_date || "",
      lease_end_date: bp.lease_end_date || "",
    } : null;

    // ─── Notification preferences ─────────────────────────────────────
    let np: any = null;
    try {
      const { data: npData } = await supabaseAdmin
        .from("notification_preferences")
        .select("*")
        .eq("user_id", token.sub)
        .single();
      np = npData;
    } catch {}

    const notifications = {
      email_enabled: np?.email_enabled ?? true,
      in_app_enabled: np?.in_app_enabled ?? true,
      email_frequency: np?.email_frequency || "smart",
      quiet_start_hour: np?.quiet_start_hour ?? 20,
      quiet_end_hour: np?.quiet_end_hour ?? 8,
      timezone: np?.timezone || "America/Montreal",
      min_urgency_email: np?.min_urgency_email || "warning",
    };

    // ─── Billing ──────────────────────────────────────────────────────
    let billing = {
      plan: "free",
      status: "active",
      current_period_end: "",
      diagnostics_used: 0,
      diagnostics_limit: 1,
      stripe_customer_id: null as string | null,
    };

    try {
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", token.sub)
        .single();

      if (sub) {
        billing = {
          plan: sub.plan || "free",
          status: sub.status || "active",
          current_period_end: sub.current_period_end || "",
          diagnostics_used: sub.diagnostics_used || 0,
          diagnostics_limit: sub.plan === "growth" ? -1 : sub.plan === "pro" ? 999 : 1,
          stripe_customer_id: sub.stripe_customer_id || null,
        };
      }

      // Count diagnostics used this period
      const { count } = await supabaseAdmin
        .from("diagnostic_reports")
        .select("id", { count: "exact", head: true })
        .eq("user_id", token.sub)
        .eq("status", "complete");
      billing.diagnostics_used = count || 0;

    } catch {}

    return NextResponse.json({
      success: true,
      data: { profile, dates, notifications, billing },
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { profile, dates, notifications, language } = body;

    // ─── Get existing profile to detect changes ───────────────────────
    const { data: existing } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id, province, employee_count, structure, fiscal_year_end_month, incorporation_date, registration_date, first_employee_date")
      .eq("user_id", token.sub)
      .single();

    if (!existing) {
      // Create a minimal profile for new users who access settings before completing intake
      const newBizId = crypto.randomUUID();
      await supabaseAdmin.from("business_profiles").upsert(
        { user_id: token.sub, business_id: newBizId, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      return NextResponse.json({ success: false, error: "Profile just created — please retry." }, { status: 503 });
    }

    const businessId = existing.business_id || (() => {
      // Auto-generate business_id inline if missing
      const id = crypto.randomUUID();
      supabaseAdmin.from("business_profiles").update({ business_id: id }).eq("user_id", token.sub).catch(() => {});
      return id;
    })();

    // ─── Update profile ───────────────────────────────────────────────
    if (profile) {
      const profileUpdate: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      const profileFields = [
        "business_name", "industry", "structure", "province", "city",
        "has_payroll", "handles_data", "has_physical_location",
        "sells_alcohol", "handles_food", "does_construction",
        "has_professional_order", "exports_goods", "does_rd",
        "has_accountant", "has_bookkeeper", "uses_payroll_software", "uses_pos",
      ];

      for (const f of profileFields) {
        if (profile[f] !== undefined) profileUpdate[f] = profile[f];
      }

      // Numeric fields
      if (profile.monthly_revenue !== undefined) profileUpdate.monthly_revenue = parseInt(profile.monthly_revenue) || null;
      if (profile.employee_count !== undefined) profileUpdate.employee_count = parseInt(profile.employee_count) || 0;
      if (profile.fiscal_year_end_month !== undefined) profileUpdate.fiscal_year_end_month = parseInt(profile.fiscal_year_end_month) || 12;

      const { error: profileErr } = await supabaseAdmin
        .from("business_profiles")
        .update(profileUpdate)
        .eq("user_id", token.sub);

      if (profileErr) throw profileErr;
    }

    // ─── Update dates ─────────────────────────────────────────────────
    let datesChanged = false;
    if (dates) {
      const dateUpdate: Record<string, any> = { updated_at: new Date().toISOString() };
      const dateFields = [
        "incorporation_date", "registration_date", "gst_registration_date",
        "qst_registration_date", "first_employee_date", "licence_renewal_date",
        "insurance_renewal_date", "lease_start_date", "lease_end_date",
      ];

      for (const f of dateFields) {
        if (dates[f] !== undefined) {
          dateUpdate[f] = dates[f] || null;
          // Check if date actually changed
          if (dates[f] !== (existing as any)[f]) datesChanged = true;
        }
      }

      const { error: dateErr } = await supabaseAdmin
        .from("business_profiles")
        .update(dateUpdate)
        .eq("user_id", token.sub);

      if (dateErr) throw dateErr;
    }

    // ─── Update notification preferences ──────────────────────────────
    if (notifications) {
      const notifUpdate: Record<string, any> = { updated_at: new Date().toISOString() };
      const notifFields = [
        "email_enabled", "in_app_enabled", "email_frequency",
        "quiet_start_hour", "quiet_end_hour", "timezone", "min_urgency_email",
      ];

      for (const f of notifFields) {
        if (notifications[f] !== undefined) notifUpdate[f] = notifications[f];
      }

      await supabaseAdmin
        .from("notification_preferences")
        .upsert(
          { user_id: token.sub, ...notifUpdate },
          { onConflict: "user_id" }
        );
    }

    // ─── Resync obligations if key fields changed ─────────────────────
    const profileChanged = profile && (
      profile.province !== existing.province ||
      parseInt(profile.employee_count) !== existing.employee_count ||
      profile.structure !== existing.structure ||
      parseInt(profile.fiscal_year_end_month) !== existing.fiscal_year_end_month
    );

    if (profileChanged || datesChanged) {
      try {
        await supabaseAdmin.rpc("auto_detect_flags", { p_business_id: businessId });
        try {
          await supabaseAdmin.rpc("sync_obligations_with_deadlines", { p_user_id: token.sub });
        } catch {
          await supabaseAdmin.rpc("sync_obligations", { p_business_id: businessId }).then(null, () => {});
        }
      } catch (syncErr) {
        console.warn("[Settings] Resync warning:", syncErr);
        // Non-fatal: obligations will sync on next cron
      }
    }

    return NextResponse.json({
      success: true,
      resynced: profileChanged || datesChanged,
    });

  } catch (err: any) {
    console.error("[Settings] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
