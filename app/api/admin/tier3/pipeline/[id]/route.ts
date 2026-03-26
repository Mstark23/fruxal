// =============================================================================
// GET/PATCH /api/admin/tier3/pipeline/[id]
// PATCH now auto-creates tier3_engagements when stage → "in_engagement"
// GET supports both tier3_diagnostics (old) and diagnostic_reports (new v2 flow)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";
import { sendEmail, emailTemplate } from "@/services/email/service";

export const maxDuration = 30; // Vercel function timeout (seconds)

const STAGES = ["lead","contacted","called","diagnostic_sent","agreement_out","signed","in_engagement","fee_collected","lost"];

const DOC_MAP: Record<string, Array<{ type: string; label: string }>> = {
  tax_structure:        [{ type: "t2_returns", label: "T2 Corporate Returns (3 years)" }, { type: "shareholder_reg", label: "Shareholder Register" }, { type: "owner_comp", label: "Owner Compensation Breakdown" }],
  vendor_procurement:   [{ type: "vendor_contracts", label: "Top 20 Vendor Contracts" }, { type: "vendor_invoices", label: "Most Recent Invoices Per Vendor" }],
  payroll_hr:           [{ type: "payroll_summary", label: "Payroll Summary Report" }, { type: "benefits_plan", label: "Benefits Plan Documents" }, { type: "employee_class", label: "Employee Classification List" }],
  banking_treasury:     [{ type: "bank_statements", label: "3 Months Bank Statements" }, { type: "merchant_stmts", label: "Merchant Processing Statements" }, { type: "credit_facility", label: "Credit Facility Agreement" }],
  insurance:            [{ type: "insurance_policies", label: "Current Insurance Policies (All Lines)" }, { type: "premium_invoices", label: "Most Recent Premium Invoices" }],
  saas_technology:      [{ type: "saas_list", label: "Software Subscription List with Monthly Costs" }, { type: "cc_statements", label: "Last 3 Months Credit Card Statements" }],
  compliance_penalties: [{ type: "cra_correspondence", label: "CRA Correspondence (2 Years)" }, { type: "payroll_remittance", label: "Most Recent Payroll Remittance Records" }],
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id } = params;
  if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

  try {
    // Try tier3_diagnostics first (old flow)
    const { data: diag } = await supabaseAdmin
      .from("tier3_diagnostics")
      .select("id, company_name, industry, province, revenue_bracket, employee_count, status, result, created_at, user_id")
      .eq("id", id)
      .single();

    if (diag) {
      const { data: pipe } = await supabaseAdmin.from("tier3_pipeline").select("*").eq("diagnostic_id", id).single();
      const result    = diag.result || {};
      const low       = result.summary?.totalEstimatedLow ?? 0;
      const high      = result.summary?.totalEstimatedHigh ?? 0;
      const updatedAt = pipe?.updated_at || diag.created_at;
      const daysInStage = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86400000);

      return NextResponse.json({
        success: true,
        entry: {
          pipelineId: pipe?.id || null, diagnosticId: diag.id, reportId: null,
          companyName: diag.company_name, industry: diag.industry,
          province: diag.province, revenueBracket: diag.revenue_bracket,
          stage: pipe?.stage || diag.status, notes: pipe?.notes || null,
          followUpDate: pipe?.follow_up_date || null, agreementStatus: null,
          estimatedLow: low, estimatedHigh: high,
          highConfidenceCount: result.summary?.highConfidenceCount ?? 0,
          daysInStage,
        },
        diagnostic: diag,
        source: "tier3_diagnostics",
      });
    }

    // Try diagnostic_reports (new v2 flow) — look up by report_id stored in pipeline
    const { data: pipe } = await supabaseAdmin.from("tier3_pipeline").select("*").eq("id", id).single();

    if (pipe?.report_id) {
      const { data: report } = await supabaseAdmin
        .from("diagnostic_reports")
        .select("id, business_id, user_id, tier, status, result_json, total_potential_savings, total_annual_leaks, ebitda_impact, enterprise_value_impact, overall_score, completed_at")
        .eq("id", pipe.report_id)
        .single();

      const { data: profile } = report?.business_id ? await supabaseAdmin
        .from("business_profiles")
        .select("business_name, industry, province, exact_annual_revenue, employee_count")
        .eq("business_id", report.business_id)
        .single() : { data: null };

      const result    = report?.result_json || {};
      const findings  = result.findings || [];
      const daysInStage = Math.floor((Date.now() - new Date(pipe.updated_at || pipe.created_at).getTime()) / 86400000);

      return NextResponse.json({
        success: true,
        entry: {
          pipelineId: pipe.id, diagnosticId: null, reportId: pipe.report_id,
          companyName: profile?.business_name || "Unknown",
          industry: profile?.industry || "—",
          province: profile?.province || "—",
          revenueBracket: profile?.exact_annual_revenue
            ? (profile.exact_annual_revenue >= 20_000_000 ? "20M_50M" : profile.exact_annual_revenue >= 5_000_000 ? "5M_20M" : "1M_5M")
            : "—",
          stage: pipe.stage, notes: pipe.notes || null,
          followUpDate: pipe.follow_up_date || null, agreementStatus: null,
          estimatedLow: report?.total_annual_leaks ?? 0,
          estimatedHigh: report?.total_potential_savings ?? 0,
          highConfidenceCount: findings.filter((f: any) => f.severity === "critical" || f.severity === "high").length,
          daysInStage,
        },
        diagnostic: report,
        source: "diagnostic_reports",
      });
    }

    // Standalone pipeline lead (no diagnostic yet)
    if (pipe) {
      const daysInStage = Math.floor((Date.now() - new Date(pipe.created_at).getTime()) / 86400000);
      return NextResponse.json({
        success: true,
        entry: {
          pipelineId: pipe.id, diagnosticId: pipe.diagnostic_id || null, reportId: pipe.report_id || null,
          companyName: pipe.company_name || "Unknown", industry: pipe.industry || "—",
          province: pipe.province || "—", revenueBracket: "—",
          stage: pipe.stage, notes: pipe.notes, followUpDate: pipe.follow_up_date,
          agreementStatus: null, estimatedLow: 0, estimatedHigh: 0,
          highConfidenceCount: 0, daysInStage,
          contactEmail: pipe.contact_email, contactPhone: pipe.contact_phone,
        },
        diagnostic: null,
        source: "standalone",
      });
    }

    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  } catch (err: any) {
    console.error("[Pipeline:GET]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id } = params;
  if (!id) return NextResponse.json({ success: false, error: "Pipeline ID required" }, { status: 400 });

  try {
    const body   = await req.json();
    const update: any = { updated_at: new Date().toISOString() };

    if (body.stage !== undefined) {
      if (!STAGES.includes(body.stage)) return NextResponse.json({ success: false, error: "Invalid stage" }, { status: 400 });
      update.stage = body.stage;
    }
    if (body.notes       !== undefined) update.notes           = body.notes;
    if (body.followUpDate !== undefined) update.follow_up_date = body.followUpDate || null;
    if (body.lostReason  !== undefined) update.lost_reason     = body.lostReason;

    const { data: pipe, error } = await supabaseAdmin
      .from("tier3_pipeline")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // ── Auto-create engagement when stage moves to "in_engagement" ────────
    if (body.stage === "in_engagement" && pipe) {
      try {
        const { data: existing } = await supabaseAdmin
          .from("tier3_engagements")
          .select("id")
          .or(
            pipe.diagnostic_id ? `diagnostic_id.eq.${pipe.diagnostic_id}` : `report_id.eq.${pipe.report_id || "none"}`
          )
          .maybeSingle();

        if (!existing) {
          const engId = crypto.randomUUID();

          // Get company name + estimated values
          let companyName = "Unknown";
          let feePercentage = body.feePercentage || 12;
          let estimatedLow  = 0;
          let estimatedHigh = 0;

          if (pipe.diagnostic_id) {
            const { data: diag } = await supabaseAdmin
              .from("tier3_diagnostics")
              .select("company_name, result")
              .eq("id", pipe.diagnostic_id)
              .single();
            if (diag) {
              companyName   = diag.company_name;
              estimatedLow  = diag.result?.summary?.totalEstimatedLow ?? 0;
              estimatedHigh = diag.result?.summary?.totalEstimatedHigh ?? 0;
            }
          } else if (pipe.report_id) {
            const { data: report } = await supabaseAdmin
              .from("diagnostic_reports")
              .select("business_id, total_annual_leaks, total_potential_savings")
              .eq("id", pipe.report_id)
              .single();
            if (report?.business_id) {
              const { data: profile } = await supabaseAdmin
                .from("business_profiles")
                .select("business_name")
                .eq("business_id", report.business_id)
                .single();
              companyName   = profile?.business_name || "Unknown";
              estimatedLow  = report.total_annual_leaks       ?? 0;
              estimatedHigh = report.total_potential_savings   ?? 0;
            }
          }

          // Get fee % from agreement if exists
          if (pipe.diagnostic_id) {
            const { data: ag } = await supabaseAdmin
              .from("tier3_agreements")
              .select("fee_percentage")
              .eq("diagnostic_id", pipe.diagnostic_id)
              .maybeSingle();
            if (ag?.fee_percentage) feePercentage = ag.fee_percentage;
          }

          await supabaseAdmin.from("tier3_engagements").insert({
            id:             engId,
            diagnostic_id:  pipe.diagnostic_id || null,
            report_id:      pipe.report_id     || null,
            pipeline_id:    pipe.id,
            company_name:   companyName,
            status:         "active",
            fee_percentage: feePercentage,
            started_at:     new Date().toISOString(),
            created_at:     new Date().toISOString(),
          });

          // Seed document checklist from the diagnostic's top leak categories
          const categories = new Set<string>();
          if (pipe.diagnostic_id) {
            const { data: diag } = await supabaseAdmin
              .from("tier3_diagnostics")
              .select("result")
              .eq("id", pipe.diagnostic_id)
              .single();
            const leaks = diag?.result?.topLeaks || [];
            leaks.slice(0, 5).forEach((l: any) => { if (l.category) categories.add(l.category); });
          }

          // Default to top 3 categories if none from diagnostic
          if (categories.size === 0) {
            ["tax_structure", "vendor_procurement", "payroll_hr"].forEach(c => categories.add(c));
          }

          const docRows: any[] = [];
          for (const cat of categories) {
            const docs = DOC_MAP[cat] || [];
            for (const d of docs) {
              docRows.push({
                id:             crypto.randomUUID(),
                engagement_id:  engId,
                document_type:  d.type,
                label:          d.label,
                status:         "pending",
                created_at:     new Date().toISOString(),
              });
            }
          }
          if (docRows.length > 0) {
            await supabaseAdmin.from("tier3_engagement_documents").insert(docRows);
          }

          process.env.NODE_ENV !== "production" && console.log(`[Pipeline] Engagement auto-created: ${engId} for pipeline ${id}`);
          return NextResponse.json({ success: true, entry: pipe, engagementId: engId, action: "engagement_created" });
        }
      } catch (engErr: any) {
        console.warn("[Pipeline] Engagement auto-create failed:", engErr.message);
      }
    }

    return NextResponse.json({ success: true, entry: pipe });

  } catch (err: any) {
    console.error("[Pipeline:PATCH]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
