// POST /api/accountant/request-document
// Accountant requests a document from client for a specific playbook.
// Sends email to client via rep's existing document request flow.
import { NextRequest, NextResponse } from "next/server";
import { requireAccountant } from "@/lib/accountant-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/services/email/service";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const auth = await requireAccountant(req);
  if (!auth.authorized) return auth.error!;

  const { playbook_id, document_label, notes } = await req.json();
  if (!playbook_id || !document_label) {
    return NextResponse.json({ success: false, error: "playbook_id + document_label required" }, { status: 400 });
  }

  // Get playbook + pipeline + contact info
  const { data: pb } = await supabaseAdmin
    .from("execution_playbooks")
    .select("id, finding_title, pipeline_id")
    .eq("id", playbook_id)
    .eq("assigned_to", auth.accountant!.id)
    .single();

  if (!pb) return NextResponse.json({ success: false, error: "Playbook not found" }, { status: 404 });

  const { data: pipe } = await supabaseAdmin
    .from("tier3_pipeline")
    .select("company_name, contact_name, contact_email, tier3_reps(name, email)")
    .eq("id", pb.pipeline_id)
    .single();

  if (!pipe?.contact_email) {
    return NextResponse.json({ success: false, error: "No client email on file" }, { status: 422 });
  }

  const appUrl  = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const repName = (pipe.tier3_reps as any)?.name || "Fruxal";

  // Store document request
  await supabaseAdmin.from("rep_document_requests").insert({
    pipeline_id:   pb.pipeline_id,
    requested_by:  "accountant",
    document_type: document_label,
    label:         document_label,
    notes:         notes || null,
    status:        "pending",
    created_at:    new Date().toISOString(),
  }).catch(() => { /* non-fatal — table may not have pipeline_id yet */ });

  // Email client
  await sendEmail({
    to:      pipe.contact_email,
    subject: `Document needed for your Fruxal recovery — ${document_label}`,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f7f8fa;padding:40px 20px">
<div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;border:1px solid #E8E6E1">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
    <div style="width:26px;height:26px;border-radius:6px;background:#1B3A2D;display:flex;align-items:center;justify-content:center">
      <span style="color:white;font-weight:900;font-size:12px">F</span>
    </div>
    <span style="font-size:15px;font-weight:800;color:#1A1A18">Fruxal</span>
  </div>
  <p style="font-size:14px;font-weight:700;color:#1A1A18;margin:0 0 12px">Hi ${pipe.contact_name || "there"},</p>
  <p style="font-size:14px;color:#56554F;margin:0 0 8px;line-height:1.6">
    Our accountant is working on your recovery for <strong>${pb.finding_title}</strong> and needs the following document to proceed:
  </p>
  <div style="background:#FAFAF8;border:1px solid #E8E6E1;border-radius:10px;padding:14px 18px;margin:16px 0">
    <p style="font-size:15px;font-weight:700;color:#1A1A18;margin:0">${document_label}</p>
    ${notes ? `<p style="font-size:13px;color:#56554F;margin:6px 0 0">${notes}</p>` : ""}
  </div>
  <p style="font-size:13px;color:#56554F;margin:0 0 20px;line-height:1.6">
    Please reply to this email with the document attached, or send it directly to <a href="mailto:documents@fruxal.com" style="color:#1B3A2D">documents@fruxal.com</a>.
  </p>
  <p style="font-size:12px;color:#B5B3AD;margin:0">Questions? Contact your rep ${repName} at <a href="mailto:${(pipe.tier3_reps as any)?.email || "hello@fruxal.ca"}" style="color:#B5B3AD">${(pipe.tier3_reps as any)?.email || "hello@fruxal.ca"}</a></p>
</div></body></html>`,
  });

  return NextResponse.json({ success: true });
}
