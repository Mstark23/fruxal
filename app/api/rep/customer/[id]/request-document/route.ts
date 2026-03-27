// =============================================================================
// POST /api/rep/customer/[id]/request-document
// Rep requests a specific document from the client.
// Creates a tier3_engagement_documents row with status='requested'
// and emails the client.
// id = pipeline_id
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, emailTemplate } from "@/services/email/service";
import crypto from "crypto";

export const maxDuration = 30;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  const pipelineId = params.id;

  try {
    const { documentType, label, notes } = await req.json();
    if (!documentType || !label) {
      return NextResponse.json({ error: "documentType and label required" }, { status: 400 });
    }

    // Verify rep owns this pipeline
    const { data: assignment } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("rep_id, tier3_reps(name, email)")
      .eq("pipeline_id", pipelineId)
      .eq("rep_id", auth.repId!)
      .maybeSingle() as any;

    if (!assignment) {
      return NextResponse.json({ error: "Not authorized for this client" }, { status: 403 });
    }

    // Get pipeline + engagement info
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("company_name, contact_email, contact_name, diagnostic_id, user_id")
      .eq("id", pipelineId)
      .single() as any;

    if (!pipe) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

    // Get or create engagement for this pipeline
    let engagementId: string | null = null;
    if (pipe.diagnostic_id) {
      const { data: eng } = await supabaseAdmin
        .from("tier3_engagements")
        .select("id")
        .eq("diagnostic_id", pipe.diagnostic_id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      engagementId = eng?.id || null;
    }

    // Fallback: create a pending engagement if none exists
    if (!engagementId) {
      const newEngId = crypto.randomUUID();
      await supabaseAdmin.from("tier3_engagements").insert({
        id: newEngId,
        diagnostic_id: pipe.diagnostic_id || pipelineId, // use pipelineId as proxy
        company_name: pipe.company_name || "Client",
        status: "pending",
        fee_percentage: 12,
        started_at: new Date().toISOString(),
      }).then(() => {}, () => {}); // non-fatal
      engagementId = newEngId;
    }

    // Check for existing request for same document type
    const { data: existing } = await supabaseAdmin
      .from("tier3_engagement_documents")
      .select("id, status")
      .eq("engagement_id", engagementId)
      .eq("document_type", documentType)
      .maybeSingle();

    if (existing) {
      // Update to requested if it was pending/rejected
      await supabaseAdmin
        .from("tier3_engagement_documents")
        .update({ status: "requested", label, notes: notes || null, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("tier3_engagement_documents").insert({
        id: crypto.randomUUID(),
        engagement_id: engagementId,
        document_type: documentType,
        label,
        status: "requested",
        notes: notes || null,
        created_at: new Date().toISOString(),
      });
    }

    // Email client
    const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
    const repName = (assignment.tier3_reps as any)?.name || "Your Fruxal rep";
    const clientEmail = pipe.contact_email;

    if (clientEmail) {
      const body = `
        <p style="color:#3d3d4e;margin:0 0 16px">Hi ${pipe.contact_name || "there"},</p>
        <p style="color:#3d3d4e;margin:0 0 16px">
          ${repName} has requested a document to continue your Fruxal recovery engagement:
        </p>
        <div style="background:#F9F8F6;border:1px solid #E5E3DD;border-radius:12px;padding:16px 20px;margin:0 0 16px">
          <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Requested document</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#1A1A18">${label}</p>
          ${notes ? `<p style="margin:6px 0 0;font-size:12px;color:#56554F">${notes}</p>` : ""}
        </div>
        <p style="color:#3d3d4e;margin:0 0 24px">
          You can upload it directly in your Fruxal dashboard. If you have questions about what's needed, reply to this email.
        </p>
      `;
      sendEmail({
        to: clientEmail,
        subject: `${repName} is requesting a document — ${label}`,
        html: emailTemplate("Document requested", body, "Upload Document →", `${appUrl}/v2/collect`),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, engagementId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
