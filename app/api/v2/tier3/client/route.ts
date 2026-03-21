// =============================================================================
// GET /api/v2/tier3/client — Tier 3 client-facing engagement data
// Supports both flows:
//   Old: tier3_diagnostics → tier3_engagements (via diagnostic_id)
//   New: diagnostic_reports → tier3_engagements (via report_id)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30; // Vercel function timeout (seconds)

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Login required" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) return NextResponse.json({ success: false, error: "No user ID" }, { status: 400 });

    // ── Try old flow first: tier3_diagnostics ────────────────────────────
    const { data: diags } = await supabaseAdmin
      .from("tier3_diagnostics")
      .select("id, company_name, result, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (diags && diags.length > 0) {
      return buildResponseFromDiagnostic(diags[0], userId);
    }

    // ── Try new flow: diagnostic_reports ────────────────────────────────
    // Find business owned by this user
    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ success: true, engagement: null });
    }

    const { data: reports } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, business_id, tier, status, result_json, total_annual_leaks, total_potential_savings, ebitda_impact, enterprise_value_impact, completed_at, created_at")
      .eq("business_id", business.id)
      .eq("tier", "enterprise")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!reports || reports.length === 0) {
      return NextResponse.json({ success: true, engagement: null });
    }

    return buildResponseFromReport(reports[0], userId);

  } catch (err: any) {
    console.error("[Tier3:Client]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── Old flow: tier3_diagnostics → tier3_engagements ───────────────────────────

async function buildResponseFromDiagnostic(diag: any, userId: string) {
  const { data: eng } = await Promise.resolve(await supabaseAdmin
    .from("tier3_engagements")
    .select("*")
    .eq("diagnostic_id", diag.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
    .then(r => r)
    ).catch(() => ({ data: null }));

  if (!eng) {
    return NextResponse.json({
      success:  true,
      stage:    "diagnostic_complete",
      source:   "tier3_diagnostics",
      diagnostic: {
        companyName: diag.company_name,
        createdAt:   diag.created_at,
        summary:     diag.result?.summary || null,
        leaks:       diag.result?.topLeaks || [],
      },
      engagement: null,
    });
  }

  return buildEngagementResponse(eng, {
    companyName: diag.company_name,
    createdAt:   diag.created_at,
    summary:     diag.result?.summary || null,
    leaks:       diag.result?.topLeaks || [],
  }, "tier3_diagnostics");
}

// ── New flow: diagnostic_reports → tier3_engagements ─────────────────────────

async function buildResponseFromReport(report: any, userId: string) {
  // Get business profile for company name
  const { data: profile } = await supabaseAdmin
    .from("business_profiles")
    .select("business_name, industry, province")
    .eq("business_id", report.business_id)
    .maybeSingle();

  const result   = report.result_json || {};
  const findings = result.findings || [];

  // Build a leaks summary compatible with the old format
  const summary = {
    totalEstimatedLow:   report.total_annual_leaks      ?? 0,
    totalEstimatedHigh:  report.total_potential_savings ?? 0,
    feeRangeLow:         Math.round((report.total_annual_leaks      ?? 0) * 0.10),
    feeRangeHigh:        Math.round((report.total_potential_savings ?? 0) * 0.15),
    highConfidenceCount: findings.filter((f: any) => f.severity === "critical" || f.severity === "high").length,
  };

  const leaks = findings.map((f: any) => {
    // Normalize to the shape the /v2/tier3 page expects:
    //   amount     — single dollar figure (use max for display)
    //   confidence — number 0-100 (page renders as a progress bar)
    const impactMin = (f.impact_min || f.annual_leak) ?? 0;
    const impactMax = f.impact_max || f.potential_savings || impactMin;
    const confidenceMap: Record<string, number> = { critical: 95, high: 80, medium: 55, low: 30 };
    return {
      title:      f.title    || "",
      category:   f.category || "",
      amount:     impactMax  || impactMin,
      confidence: confidenceMap[f.severity?.toLowerCase()] ?? 55,
      effort:     f.effort   || "medium",
    };
  });

  // Check for engagement via report_id
  const { data: eng } = await Promise.resolve(await supabaseAdmin
    .from("tier3_engagements")
    .select("*")
    .eq("report_id", report.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
    .then(r => r)
    ).catch(() => ({ data: null }));

  const diagData = {
    companyName: profile?.business_name || "Your Business",
    createdAt:   report.created_at,
    summary,
    leaks,
  };

  if (!eng) {
    return NextResponse.json({
      success:    true,
      stage:      "diagnostic_complete",
      source:     "diagnostic_reports",
      diagnostic: diagData,
      engagement: null,
    });
  }

  return buildEngagementResponse(eng, diagData, "diagnostic_reports");
}

// ── Shared engagement response builder ───────────────────────────────────────

async function buildEngagementResponse(eng: any, diagData: any, source: string) {
  const [docs, findings, agreement] = await Promise.all([
    supabaseAdmin.from("tier3_engagement_documents").select("*").eq("engagement_id", eng.id).order("created_at").then(r => r.data || []),
    supabaseAdmin.from("tier3_confirmed_findings").select("*").eq("engagement_id", eng.id).order("created_at").then(r => r.data || []),
    supabaseAdmin.from("tier3_agreements")
      .select("*")
      .eq(eng.diagnostic_id ? "diagnostic_id" : "engagement_id", eng.diagnostic_id || eng.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(r => r.data).then(d => d, () => null),
  ]);

  const confirmedSavings = (findings ?? []).reduce((s: number, f: any) => s + (f.confirmed_amount ?? 0), 0);
  const feeOwed          = Math.round(confirmedSavings * ((eng.fee_percentage || 12) / 100));
  const totalDocs        = (docs ?? []).length;
  const receivedDocs     = (docs ?? []).filter((d: any) => ["received", "reviewed"].includes(d.status)).length;

  const STAGES = ["intake","diagnostic","agreement","document_collection","active_recovery","confirmed","invoiced","complete"];
  const currentStageIdx = STAGES.indexOf(eng.status) !== -1 ? STAGES.indexOf(eng.status) : 2;

  return NextResponse.json({
    success:    true,
    stage:      eng.status,
    source,
    diagnostic: diagData,
    engagement: {
      id:              eng.id,
      companyName:     eng.company_name,
      status:          eng.status,
      startedAt:       eng.started_at,
      targetCompletion: eng.target_completion,
      feePercentage:   eng.fee_percentage || 12,
      stageIndex:      currentStageIdx,
      stages:          STAGES,
      estimatedLow:    diagData.summary?.totalEstimatedLow ?? 0,
      estimatedHigh:   diagData.summary?.totalEstimatedHigh ?? 0,
      confirmedSavings,
      feeOwed,
      documents: {
        total:    totalDocs,
        received: receivedDocs,
        items: docs.map((d: any) => ({
          id:         d.id,
          label:      d.label,
          type:       d.document_type,
          status:     d.status,
          uploadedAt: d.uploaded_at,
        })),
      },
      findings: findings.map((f: any) => ({
        id:              f.id,
        category:        f.category,
        description:     f.description,
        confirmedAmount: f.confirmed_amount,
        confirmedAt:     f.confirmed_at,
        notes:           f.notes,
      })),
      invoice: {
        confirmedSavings,
        feePercentage: eng.fee_percentage || 12,
        feeOwed,
        paidAt:  eng.invoice_paid_at || null,
        status:  feeOwed === 0 ? "pending" : eng.invoice_paid_at ? "paid" : "outstanding",
      },
      agreementSigned: agreement?.status === "signed",
      agreementId:     agreement?.id || null,
    },
  });
}
