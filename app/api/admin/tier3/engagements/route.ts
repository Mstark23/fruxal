// =============================================================================
// GET/POST /api/admin/tier3/engagements — Engagement Tracker
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

const DOC_MAP: Record<string, Array<{ type: string; label: string }>> = {
  tax_structure:        [{ type: "t2_returns", label: "T2 Corporate Returns (3 years)" }, { type: "shareholder_reg", label: "Shareholder Register" }, { type: "owner_comp", label: "Owner Compensation Breakdown" }],
  vendor_procurement:   [{ type: "vendor_contracts", label: "Top 20 Vendor Contracts" }, { type: "vendor_invoices", label: "Most Recent Invoices Per Vendor" }],
  payroll_hr:           [{ type: "payroll_summary", label: "Payroll Summary Report" }, { type: "benefits_plan", label: "Benefits Plan Documents" }, { type: "employee_class", label: "Employee Classification List" }],
  banking_treasury:     [{ type: "bank_statements", label: "3 Months Bank Statements" }, { type: "merchant_stmts", label: "Merchant Processing Statements" }, { type: "credit_facility", label: "Credit Facility Agreement" }],
  insurance:            [{ type: "insurance_policies", label: "Current Insurance Policies (All Lines)" }, { type: "premium_invoices", label: "Most Recent Premium Invoices" }],
  saas_technology:      [{ type: "saas_list", label: "Software Subscription List with Monthly Costs" }, { type: "cc_statements", label: "Last 3 Months Credit Card Statements" }],
  compliance_penalties: [{ type: "cra_correspondence", label: "CRA Correspondence (2 Years)" }, { type: "payroll_remittance", label: "Most Recent Payroll Remittance Records" }],
};

const ALL_CATEGORIES = Object.keys(DOC_MAP);

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch { return fb; }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const [engagements, docs, findings] = await Promise.all([
      safe(async () => { const { data } = await supabaseAdmin.from("tier3_engagements").select("*").order("created_at", { ascending: false }); return data || []; }, [] as any[]),
      safe(async () => { const { data } = await supabaseAdmin.from("tier3_engagement_documents").select("engagement_id, status"); return data || []; }, [] as any[]),
      safe(async () => { const { data } = await supabaseAdmin.from("tier3_confirmed_findings").select("engagement_id, confirmed_amount"); return data || []; }, [] as any[]),
    ]);

    // Get diagnostic data for estimated ranges
    const diagIds = [...new Set(engagements.map((e: any) => e.diagnostic_id).filter(Boolean))];
    const diagMap: Record<string, any> = {};
    if (diagIds.length > 0) {
      const { data: diags } = await supabaseAdmin.from("tier3_diagnostics").select("id, result").in("id", diagIds);
      for (const d of diags || []) diagMap[d.id] = d.result?.summary || {};
    }

    // Build doc stats per engagement
    const docStats: Record<string, { total: number; received: number }> = {};
    for (const d of docs) {
      if (!docStats[d.engagement_id]) docStats[d.engagement_id] = { total: 0, received: 0 };
      docStats[d.engagement_id].total++;
      if (d.status === "received" || d.status === "reviewed") docStats[d.engagement_id].received++;
    }

    // Build finding totals per engagement
    const findingTotals: Record<string, number> = {};
    for (const f of findings) {
      findingTotals[f.engagement_id] = (findingTotals[f.engagement_id] || 0) + (f.confirmed_amount || 0);
    }

    let activeCount = 0, totalConfirmedSavings = 0, totalFeesOwed = 0, docProgressSum = 0, docProgressCount = 0;

    const enriched = engagements.map((e: any) => {
      const ds = docStats[e.id] || { total: 0, received: 0 };
      const confirmed = findingTotals[e.id] || 0;
      const fee = Math.round(confirmed * (e.fee_percentage / 100));
      const summary = diagMap[e.diagnostic_id] || {};

      if (e.status === "active") activeCount++;
      totalConfirmedSavings += confirmed;
      totalFeesOwed += fee;
      if (ds.total > 0) { docProgressSum += ds.received / ds.total; docProgressCount++; }

      return {
        id: e.id, companyName: e.company_name, status: e.status,
        startedAt: e.started_at, targetCompletion: e.target_completion,
        feePercentage: e.fee_percentage,
        documentsTotal: ds.total, documentsReceived: ds.received,
        confirmedSavings: confirmed, feeOwed: fee,
        estimatedLow: summary.totalEstimatedLow || 0, estimatedHigh: summary.totalEstimatedHigh || 0,
        diagnosticId: e.diagnostic_id,
      };
    });

    const avgDocProgress = docProgressCount > 0 ? Math.round((docProgressSum / docProgressCount) * 100) : 0;

    return NextResponse.json({
      success: true, engagements: enriched,
      stats: { activeCount, totalConfirmedSavings, totalFeesOwed, avgDocumentProgress: avgDocProgress },
    });
  } catch (err: any) {
    console.error("[Engagements:GET]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { diagnosticId, agreementId, pipelineId, feePercentage, targetCompletion } = await req.json();
    if (!diagnosticId) return NextResponse.json({ success: false, error: "diagnosticId required" }, { status: 400 });

    // Fetch diagnostic for company name
    const { data: diag } = await supabaseAdmin.from("tier3_diagnostics").select("id, company_name, user_id").eq("id", diagnosticId).single();
    if (!diag) return NextResponse.json({ success: false, error: "Diagnostic not found" }, { status: 404 });

    // Determine scope categories from agreement
    let scopeCategories = ALL_CATEGORIES;
    if (agreementId) {
      const { data: ag } = await supabaseAdmin.from("tier3_agreements").select("scope_categories").eq("id", agreementId).single();
      if (ag && ag.scope_categories?.length > 0) scopeCategories = ag.scope_categories;
    } else {
      // Try finding any agreement for this diagnostic
      const { data: ag } = await supabaseAdmin.from("tier3_agreements").select("id, scope_categories").eq("diagnostic_id", diagnosticId).order("created_at", { ascending: false }).limit(1).single();
      if (ag && ag.scope_categories?.length > 0) scopeCategories = ag.scope_categories;
    }

    // Create engagement
    const engId = crypto.randomUUID();
    const { error: engErr } = await supabaseAdmin.from("tier3_engagements").insert({
      id: engId, diagnostic_id: diagnosticId,
      agreement_id: agreementId || null, pipeline_id: pipelineId || null,
      user_id: auth.userId || diag.user_id, company_name: diag.company_name,
      fee_percentage: feePercentage || 12,
      target_completion: targetCompletion || null,
      status: "active",
    });
    if (engErr) throw new Error("Failed to create engagement: " + engErr.message);

    // Seed document checklist
    const docRows: any[] = [];
    for (const cat of scopeCategories) {
      const docs = DOC_MAP[cat] || [];
      for (const d of docs) {
        docRows.push({ id: crypto.randomUUID(), engagement_id: engId, document_type: d.type, label: d.label, status: "pending" });
      }
    }
    if (docRows.length > 0) {
      await supabaseAdmin.from("tier3_engagement_documents").insert(docRows);
    }

    // Update pipeline stage if pipelineId provided
    if (pipelineId) {
      await supabaseAdmin.from("tier3_pipeline").update({ stage: "in_engagement", updated_at: new Date().toISOString() }).eq("id", pipelineId);
    }

    console.log(`[Engagements] Created for "${diag.company_name}" — ${docRows.length} documents seeded from ${scopeCategories.length} categories`);

    return NextResponse.json({ success: true, id: engId, documentsSeeded: docRows.length });
  } catch (err: any) {
    console.error("[Engagements:POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
