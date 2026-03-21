// =============================================================================
// PATCH /api/admin/tier3/reps/[id] — Update rep, assign deals, manage commissions
// =============================================================================
// ?action=assign | add_commission | mark_paid | update
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export const maxDuration = 30; // Vercel function timeout (seconds)

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id } = params;

  try {
    const [rep, assignments, commissions] = await Promise.all([
      supabaseAdmin.from("tier3_reps").select("*").eq("id", id).single().then(r => r.data),
      supabaseAdmin.from("tier3_rep_assignments").select("*").eq("rep_id", id).order("assigned_at", { ascending: false }).then(r => r.data || []),
      supabaseAdmin.from("tier3_rep_commissions").select("*").eq("rep_id", id).order("created_at", { ascending: false }).then(r => r.data || []),
    ]);

    if (!rep) return NextResponse.json({ success: false, error: "Rep not found" }, { status: 404 });

    // Enrich assignments with company names
    const diagIds = assignments.map((a: any) => a.diagnostic_id).filter(Boolean);
    const diagMap: Record<string, string> = {};
    if (diagIds.length > 0) {
      const { data: diags } = await supabaseAdmin.from("tier3_diagnostics").select("id, company_name").in("id", diagIds);
      for (const d of diags || []) diagMap[d.id] = d.company_name;
    }

    const enrichedAssignments = assignments.map((a: any) => ({
      ...a, companyName: diagMap[a.diagnostic_id] || "Unknown",
    }));

    // Enrich commissions with company names
    const engIds = commissions.map((c: any) => c.engagement_id).filter(Boolean);
    const engMap: Record<string, string> = {};
    if (engIds.length > 0) {
      const { data: engs } = await supabaseAdmin.from("tier3_engagements").select("id, company_name").in("id", engIds);
      for (const e of engs || []) engMap[e.id] = e.company_name;
    }

    const enrichedCommissions = commissions.map((c: any) => ({
      ...c, companyName: engMap[c.engagement_id] || "Unknown",
    }));

    const totalEarned = commissions.filter((c: any) => c.status === "paid").reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0);
    const totalPending = commissions.filter((c: any) => c.status === "pending").reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0);

    return NextResponse.json({
      success: true, rep, assignments: enrichedAssignments, commissions: enrichedCommissions,
      totals: { earned: totalEarned, pending: totalPending },
    });
  } catch (err: any) {
    console.error("[Reps:GET:id]", err);
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

    // ─── Assign to diagnostic ───
    if (action === "assign") {
      const { diagnosticId, pipelineId, stageAtAssignment, notes } = body;
      if (!diagnosticId) return NextResponse.json({ success: false, error: "diagnosticId required" }, { status: 400 });

      // NOTE: Multi-step write — not atomic. Partial failure leaves inconsistent state.
    await supabaseAdmin.from("tier3_rep_assignments").insert({
        id: crypto.randomUUID(), rep_id: id,
        diagnostic_id: diagnosticId, pipeline_id: pipelineId || null,
        stage_at_assignment: stageAtAssignment || null, notes: notes || null,
      });
      return NextResponse.json({ success: true, action: "assigned" });
    }

    // ─── Add commission record ───
    if (action === "add_commission") {
      const { engagementId, confirmedSavings, feeCollected, commissionRate, notes } = body;
      if (!engagementId) return NextResponse.json({ success: false, error: "engagementId required" }, { status: 400 });

      const rate = commissionRate || 20;
      const commissionAmount = Math.round((feeCollected ?? 0) * (rate / 100));

      await supabaseAdmin.from("tier3_rep_commissions").insert({
        id: crypto.randomUUID(), rep_id: id, engagement_id: engagementId,
        confirmed_savings: confirmedSavings ?? 0, fee_collected: feeCollected ?? 0,
        commission_amount: commissionAmount, commission_rate: rate,
        status: "pending", notes: notes || null,
      });
      return NextResponse.json({ success: true, action: "commission_added", commissionAmount });
    }

    // ─── Mark commission paid ───
    if (action === "mark_paid") {
      const { commissionId } = body;
      if (!commissionId) return NextResponse.json({ success: false, error: "commissionId required" }, { status: 400 });

      await supabaseAdmin.from("tier3_rep_commissions").update({
        status: "paid", paid_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).eq("id", commissionId).eq("rep_id", id);
      return NextResponse.json({ success: true, action: "marked_paid" });
    }

    // ─── Default: update rep profile ───
    const update: any = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) update.name = body.name;
    if (body.email !== undefined) update.email = body.email.toLowerCase().trim();
    if (body.phone !== undefined) update.phone = body.phone;
    if (body.province !== undefined) update.province = body.province;
    if (body.status !== undefined) update.status = body.status;
    if (body.commissionRate !== undefined) update.commission_rate = body.commissionRate;
    if (body.notes !== undefined) update.notes = body.notes;

    await supabaseAdmin.from("tier3_reps").update(update).eq("id", id);
    return NextResponse.json({ success: true, action: "updated" });

  } catch (err: any) {
    console.error("[Reps:PATCH]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
