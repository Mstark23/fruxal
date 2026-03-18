// =============================================================================
// app/api/v2/enterprise/status/route.ts
// Client-facing enterprise engagement status API.
// Reads tier3 tables for the authenticated user and returns:
//   pipeline stage, rep assignment, engagement details, document vault,
//   confirmed savings, and quick action availability.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const userId = ((token as any)?.id || token?.sub) as string;
    const email  = (token as any)?.email as string | undefined;

    // ── 1. Pipeline entry for this user ────────────────────────────────────
    const { data: pipeline } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, stage, created_at, updated_at, follow_up_date, notes, diagnostic_id, company_name, contact_name")
      .or(`user_id.eq.${userId}${email ? `,contact_email.eq.${email}` : ""}`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    // ── 2. Active engagement ────────────────────────────────────────────────
    const { data: engagement } = await supabaseAdmin
      .from("tier3_engagements")
      .select("id, status, started_at, target_completion, fee_percentage, company_name, notes, completed_at")
      .or(`user_id.eq.${userId}${pipeline?.id ? `,pipeline_id.eq.${pipeline.id}` : ""}`)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    // ── 3. Rep assignment ───────────────────────────────────────────────────
    let rep: any = null;
    if (engagement?.id || pipeline?.diagnostic_id) {
      const diagId = engagement?.id
        ? (await supabaseAdmin.from("tier3_engagements").select("diagnostic_id").eq("id", engagement.id).single()).data?.diagnostic_id
        : pipeline?.diagnostic_id;

      if (diagId) {
        const { data: assignment } = await supabaseAdmin
          .from("tier3_rep_assignments")
          .select("rep_id, assigned_at, notes")
          .eq("diagnostic_id", diagId)
          .order("assigned_at", { ascending: false })
          .limit(1)
          .single();

        if (assignment?.rep_id) {
          const { data: repData } = await supabaseAdmin
            .from("tier3_reps")
            .select("name, email, phone, province")
            .eq("id", assignment.rep_id)
            .single();
          if (repData) rep = { ...repData, assignedAt: assignment.assigned_at };
        }
      }
    }

    // ── 4. Document vault ───────────────────────────────────────────────────
    let documents: any[] = [];
    if (engagement?.id) {
      const { data: docs } = await supabaseAdmin
        .from("tier3_engagement_documents")
        .select("id, document_type, label, status, received_at, notes")
        .eq("engagement_id", engagement.id)
        .order("created_at");
      documents = docs || [];
    }

    // ── 5. Confirmed savings ────────────────────────────────────────────────
    let confirmedFindings: any[] = [];
    let confirmedSavingsTotal = 0;
    if (engagement?.id) {
      const { data: findings } = await supabaseAdmin
        .from("tier3_confirmed_findings")
        .select("leak_name, category, confirmed_amount, estimated_low, estimated_high, confidence_note, created_at")
        .eq("engagement_id", engagement.id)
        .order("confirmed_amount", { ascending: false });
      confirmedFindings = findings || [];
      confirmedSavingsTotal = confirmedFindings.reduce((s, f) => s + (f.confirmed_amount || 0), 0);
    }

    const feeOwed = engagement?.fee_percentage
      ? Math.round(confirmedSavingsTotal * (engagement.fee_percentage / 100))
      : 0;

    // ── 6. Derive engagement status stage ──────────────────────────────────
    const STAGE_ORDER = ["lead","contacted","diagnostic_sent","call_booked","engaged","in_engagement","recovery_tracking","completed"];
    let currentStage = pipeline?.stage || (engagement ? "in_engagement" : null);

    // ── Response ────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        pipeline: pipeline ? {
          id:           pipeline.id,
          stage:        currentStage,
          stageOrder:   STAGE_ORDER.indexOf(currentStage || "") + 1,
          totalStages:  STAGE_ORDER.length,
          updatedAt:    pipeline.updated_at,
          followUpDate: pipeline.follow_up_date,
          companyName:  pipeline.company_name,
        } : null,

        engagement: engagement ? {
          id:               engagement.id,
          status:           engagement.status,
          startedAt:        engagement.started_at,
          targetCompletion: engagement.target_completion,
          completedAt:      engagement.completed_at,
          feePercentage:    engagement.fee_percentage,
          companyName:      engagement.company_name,
        } : null,

        rep,

        documents: {
          total:    documents.length,
          received: documents.filter(d => d.status === "received" || d.status === "reviewed").length,
          pending:  documents.filter(d => d.status === "pending").length,
          items:    documents,
        },

        savings: {
          confirmed:       confirmedSavingsTotal,
          feeOwed,
          feePercentage:   engagement?.fee_percentage || 12,
          findings:        confirmedFindings,
          findingsCount:   confirmedFindings.length,
        },

        // Quick action availability
        actions: {
          canBookCall:     !!rep?.email,
          canShareReport:  true,
          canRequestAudit: !engagement || engagement.status === "completed",
          hasEngagement:   !!engagement,
          hasPipeline:     !!pipeline,
        },
      },
    });
  } catch (err: any) {
    console.error("[GET /api/v2/enterprise/status]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
