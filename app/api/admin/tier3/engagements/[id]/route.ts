// =============================================================================
// GET/PATCH /api/admin/tier3/engagements/[id] — Single engagement detail + actions
// =============================================================================
// ?action=update_document | add_finding | delete_finding
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

const CAT_LABELS: Record<string, string> = {
  tax_structure: "Tax Structure", vendor_procurement: "Vendor & Procurement",
  payroll_hr: "Payroll & HR", banking_treasury: "Banking & Treasury",
  insurance: "Insurance", saas_technology: "SaaS & Technology",
  compliance_penalties: "Compliance & Penalties",
};

// Map document_type → category
const DOC_CAT: Record<string, string> = {
  t2_returns: "tax_structure", shareholder_reg: "tax_structure", owner_comp: "tax_structure",
  vendor_contracts: "vendor_procurement", vendor_invoices: "vendor_procurement",
  payroll_summary: "payroll_hr", benefits_plan: "payroll_hr", employee_class: "payroll_hr",
  bank_statements: "banking_treasury", merchant_stmts: "banking_treasury", credit_facility: "banking_treasury",
  insurance_policies: "insurance", premium_invoices: "insurance",
  saas_list: "saas_technology", cc_statements: "saas_technology",
  cra_correspondence: "compliance_penalties", payroll_remittance: "compliance_penalties",
};

async function getTotals(engId: string) {
  const { data: findings } = await supabaseAdmin.from("tier3_confirmed_findings").select("confirmed_amount").eq("engagement_id", engId);
  const confirmed = (findings || []).reduce((s: number, f: any) => s + (f.confirmed_amount || 0), 0);
  const { data: eng } = await supabaseAdmin.from("tier3_engagements").select("fee_percentage").eq("id", engId).single();
  const fee = Math.round(confirmed * ((eng?.fee_percentage || 12) / 100));
  return { confirmedSavings: confirmed, feeOwed: fee };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id } = params;

  try {
    const [eng, docs, findings, diag] = await Promise.all([
      supabaseAdmin.from("tier3_engagements").select("*").eq("id", id).single().then(r => r.data),
      supabaseAdmin.from("tier3_engagement_documents").select("*").eq("engagement_id", id).order("created_at").then(r => r.data || []),
      supabaseAdmin.from("tier3_confirmed_findings").select("*").eq("engagement_id", id).order("created_at").then(r => r.data || []),
      null, // fetched separately below
    ]);

    if (!eng) return NextResponse.json({ success: false, error: "Engagement not found" }, { status: 404 });

    // Fetch diagnostic result for leak details
    let diagResult: any = null;
    if (eng.diagnostic_id) {
      const { data } = await supabaseAdmin.from("tier3_diagnostics").select("result").eq("id", eng.diagnostic_id).single();
      diagResult = data?.result || null;
    }

    // Group documents by category
    const grouped: Record<string, { label: string; docs: any[] }> = {};
    for (const d of docs) {
      const cat = DOC_CAT[d.document_type] || "other";
      if (!grouped[cat]) grouped[cat] = { label: CAT_LABELS[cat] || cat, docs: [] };
      grouped[cat].docs.push(d);
    }

    const totalDocs = docs.length;
    const receivedDocs = docs.filter((d: any) => d.status === "received" || d.status === "reviewed").length;
    const confirmedSavings = findings.reduce((s: number, f: any) => s + (f.confirmed_amount || 0), 0);
    const feeOwed = Math.round(confirmedSavings * ((eng.fee_percentage || 12) / 100));

    return NextResponse.json({
      success: true,
      engagement: {
        ...eng,
        documentsTotal: totalDocs,
        documentsReceived: receivedDocs,
        confirmedSavings,
        feeOwed,
      },
      documentGroups: grouped,
      findings,
      diagnosticResult: diagResult,
    });
  } catch (err: any) {
    console.error("[Engagements:GET:id]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id } = params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    const body = await req.json();

    // ─── ACTION: Update document status ───
    if (action === "update_document") {
      const { documentId, status, notes } = body;
      if (!documentId || !status) return NextResponse.json({ success: false, error: "documentId and status required" }, { status: 400 });

      const update: any = { status, updated_at: new Date().toISOString() };
      if (status === "received") update.received_at = new Date().toISOString();
      if (notes !== undefined) update.notes = notes;

      await supabaseAdmin.from("tier3_engagement_documents").update(update).eq("id", documentId);
      const totals = await getTotals(id);
      return NextResponse.json({ success: true, ...totals });
    }

    // ─── ACTION: Add finding ───
    if (action === "add_finding") {
      const { leakId, leakName, category, estimatedLow, estimatedHigh, confirmedAmount, confidenceNote } = body;
      if (!leakId || !leakName || confirmedAmount === undefined) {
        return NextResponse.json({ success: false, error: "leakId, leakName, confirmedAmount required" }, { status: 400 });
      }

      await supabaseAdmin.from("tier3_confirmed_findings").insert({
        id: crypto.randomUUID(), engagement_id: id,
        leak_id: leakId, leak_name: leakName, category: category || "unknown",
        estimated_low: estimatedLow || 0, estimated_high: estimatedHigh || 0,
        confirmed_amount: Number(confirmedAmount),
        confidence_note: confidenceNote || null,
      });

      const totals = await getTotals(id);
      return NextResponse.json({ success: true, ...totals });
    }

    // ─── ACTION: Delete finding ───
    if (action === "delete_finding") {
      const { findingId } = body;
      if (!findingId) return NextResponse.json({ success: false, error: "findingId required" }, { status: 400 });
      await supabaseAdmin.from("tier3_confirmed_findings").delete().eq("id", findingId).eq("engagement_id", id);
      const totals = await getTotals(id);
      return NextResponse.json({ success: true, ...totals });
    }

    // ─── DEFAULT: Update engagement fields ───
    const update: any = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) {
      update.status = body.status;
      if (body.status === "completed") update.completed_at = new Date().toISOString();
    }
    if (body.notes !== undefined) update.notes = body.notes;
    if (body.targetCompletion !== undefined) update.target_completion = body.targetCompletion || null;
    if (body.feePercentage !== undefined) update.fee_percentage = body.feePercentage;

    await supabaseAdmin.from("tier3_engagements").update(update).eq("id", id);
    const totals = await getTotals(id);
    return NextResponse.json({ success: true, ...totals });

  } catch (err: any) {
    console.error("[Engagements:PATCH]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
