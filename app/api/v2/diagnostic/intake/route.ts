// =============================================================================
// app/api/v2/diagnostic/intake/route.ts
// POST — Save enriched intake data to business_profiles before running diagnostic.
// GET  — Load current profile + intake data for pre-filling the form.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { pickBestRep } from "@/lib/rep-picker";
import { scoreLeadQuality, scoreToPriority } from "@/lib/lead-score";
import { sendRepAssigned, sendRepNewClient } from "@/services/email/service";
import crypto from "crypto";

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

      // Industry (critical — used by diagnostic engine for benchmarks)
      // NOTE: only 'industry' column exists in business_profiles table (per Prisma schema)
      // industry_label, industry_slug, industry_naics do NOT exist as DB columns
      industry:              d.industry && d.industry !== "" ? d.industry : undefined,

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

    console.log(`[Intake] Saving: industry="${d.industry}" → clean.industry="${clean.industry}". All keys: ${Object.keys(clean).join(", ")}`);

    // upsert — if no row exists yet (new business), create it.
    // .update() silently fails when no row exists -> "Business not found" on diagnostic launch
    const { error } = await supabaseAdmin
      .from("business_profiles")
      .upsert(
        { ...clean, business_id: businessId, user_id: token.sub },
        { onConflict: "business_id" }
      );

    if (error) throw error;

    // ── Auto-assign rep if no pipeline entry exists yet ────────────────────
    let assignedRep: { name: string; calendly_url: string | null; contingency_rate: number } | null = null;
    let leadScore = 0;
    let leadPriority: "hot" | "warm" | "cold" = "cold";

    try {
      const userId = token.sub as string;
      const { data: existingPipe } = await supabaseAdmin
        .from("tier3_pipeline").select("id").eq("user_id", userId).maybeSingle();

      if (!existingPipe) {
        // ── Fix #1: Convert year → string format the scorer expects ──────
        let taxReviewStr: string | null = null;
        if (d.last_tax_review_year) {
          const gap = new Date().getFullYear() - Number(d.last_tax_review_year);
          if (gap >= 3)      taxReviewStr = "3_plus_years";
          else if (gap >= 1) taxReviewStr = "1_2_years";
          else               taxReviewStr = "recent";
        }

        // ── Fix #5: Smarter leak estimate using intake signals ───────────
        const rev = d.exact_annual_revenue ?? 0;
        let leakEstimate = rev * 0.05; // baseline 5%
        if (d.does_rd && !d.sred_claimed_last_year) leakEstimate += Math.min(rev * 0.15, 200_000); // unclaimed SR&ED
        if (d.has_accountant === false)              leakEstimate += rev * 0.02; // missed deductions
        if (d.gross_margin_pct && d.gross_margin_pct < 30) leakEstimate += rev * 0.03; // cost structure leaks
        if ((d.employee_count ?? 0) >= 5 && !d.uses_payroll_software) leakEstimate += (d.employee_count ?? 0) * 500; // payroll inefficiency

        const result = scoreLeadQuality({
          annualRevenue:  d.exact_annual_revenue ?? null,
          estimatedLeak:  Math.round(leakEstimate),
          province:       d.province ?? null,
          hasAccountant:  d.has_accountant ?? null,
          lastTaxReview:  taxReviewStr,
          doesRd:         d.does_rd ?? null,
          employeeCount:  d.employee_count ?? null,
          industry:       d.industry ?? null,
          daysInPipeline: 0,
        });
        leadScore = result.score;
        leadPriority = scoreToPriority(leadScore);

        // ── Fix #2: Only auto-assign hot/warm leads ──────────────────────
        if (leadPriority === "hot" || leadPriority === "warm") {
          const rep = await pickBestRep(d.province ?? null);
          if (rep) {
            // ── Fix #3: Direct DB inserts instead of self-fetch ──────────
            const pipelineId = crypto.randomUUID();
            const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";

            await supabaseAdmin.from("tier3_pipeline").insert({
              id:             pipelineId,
              user_id:        userId,
              business_id:    businessId,
              contact_email:  token.email || null,
              company_name:   d.business_name || null,
              industry:       d.industry || null,
              province:       d.province || null,
              country:        d.country || null,
              annual_revenue: d.exact_annual_revenue || null,
              stage:          leadPriority === "hot" ? "contacted" : "lead",
              notes:          `Auto-assigned at intake. Score: ${leadScore} (${leadPriority}). Revenue: $${rev}. Leak est: $${Math.round(leakEstimate)}`,
              created_at:     new Date().toISOString(),
              updated_at:     new Date().toISOString(),
            });

            await supabaseAdmin.from("tier3_rep_assignments").insert({
              id:                  crypto.randomUUID(),
              rep_id:              rep.id,
              pipeline_id:         pipelineId,
              stage_at_assignment: leadPriority === "hot" ? "contacted" : "lead",
              notes:               `Intake auto-assign. Reasons: ${result.reasons.join(", ")}`,
              assigned_at:         new Date().toISOString(),
            });

            // Fire emails (non-blocking, non-fatal)
            const clientDashUrl = `${appUrl}/rep/customer/${pipelineId}`;
            Promise.all([
              token.email ? sendRepAssigned(
                token.email as string,
                d.business_name || "your business",
                rep.name,
                rep.calendly_url || null,
                Math.round(leakEstimate),
                rep.contingency_rate ?? 12,
              ) : Promise.resolve(false),
              sendRepNewClient(
                rep.email,
                rep.name,
                d.business_name || "New client",
                d.industry || null,
                d.province || null,
                Math.round(leakEstimate),
                clientDashUrl,
              ),
            ]).catch((e) => { console.warn("[Intake] notification failed:", e.message); });

            assignedRep = { name: rep.name, calendly_url: rep.calendly_url, contingency_rate: rep.contingency_rate ?? 12 };
            console.log(`[Intake] Auto-assigned rep ${rep.name} to user ${userId} (score: ${leadScore}, priority: ${leadPriority})`);
          }
        } else {
          console.log(`[Intake] Lead score ${leadScore} (${leadPriority}) — no auto-assign for user ${userId}`);
        }
      }
    } catch (e: any) {
      console.warn("[Intake] Rep auto-assign failed (non-fatal):", e.message);
    }

    // ── Fix #4: Return rep info so frontend can show advisor immediately ──
    return NextResponse.json({
      success: true,
      intake_quality_score: Math.min(score, 100),
      lead_score: leadScore,
      lead_priority: leadPriority,
      assigned_rep: assignedRep,
      message: assignedRep
        ? `Intake saved — your advisor ${assignedRep.name} has been notified`
        : "Intake saved — ready to run diagnostic",
    });

  } catch (err: any) {
    console.error("[intake:POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}