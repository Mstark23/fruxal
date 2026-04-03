// =============================================================================
// POST /api/rep/customer/[id]/send-email
// Rep sends an email to the client. Logs it in tier3_messages table.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/services/email/service";
import crypto from "crypto";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  const repId = auth.repId!;
  const pipelineId = params.id;

  try {
    const { subject, body } = await req.json();
    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json({ success: false, error: "subject and body required" }, { status: 400 });
    }

    // Verify rep owns this client
    const { data: assignment } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("id")
      .eq("rep_id", repId)
      .or(`pipeline_id.eq.${pipelineId},diagnostic_id.eq.${pipelineId}`)
      .maybeSingle();

    const { data: pipelineOwner } = !assignment
      ? await supabaseAdmin
          .from("tier3_pipeline")
          .select("id")
          .eq("id", pipelineId)
          .eq("rep_id", repId)
          .maybeSingle()
      : { data: null };

    if (!assignment && !pipelineOwner) {
      return NextResponse.json({ success: false, error: "Client not assigned to you" }, { status: 403 });
    }

    // Load contact email from pipeline
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("contact_email, contact_name, company_name")
      .eq("id", pipelineId)
      .single();

    if (!pipe?.contact_email) {
      return NextResponse.json({ success: false, error: "No contact email for this client" }, { status: 400 });
    }

    // Build HTML from plain text body
    const htmlBody = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;padding:40px 20px">
  <div style="background:white;border-radius:12px;padding:28px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
    ${body.split("\n").map((line: string) =>
      line.trim() === "" ? "<br/>" : `<p style="margin:0 0 12px;font-size:14px;color:#3A3935;line-height:1.7">${line}</p>`
    ).join("\n    ")}
  </div>
  <p style="text-align:center;margin-top:16px;font-size:11px;color:#B5B3AD">
    Sent via Fruxal
  </p>
</div></body></html>`;

    // Send the email
    await sendEmail({
      to: pipe.contact_email,
      subject: subject.trim(),
      html: htmlBody,
      text: body,
    });

    // Log in messages_json on the pipeline (same pattern as messages endpoint)
    const { data: pipeMessages } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("messages_json")
      .eq("id", pipelineId)
      .maybeSingle();

    const existing: any[] = (pipeMessages as any)?.messages_json || [];
    const newMsg = {
      id: crypto.randomUUID(),
      author: auth.rep?.name || "Rep",
      role: "rep",
      type: "email",
      subject: subject.trim(),
      text: body.trim(),
      created_at: new Date().toISOString(),
    };
    const updated = [...existing, newMsg];

    await supabaseAdmin
      .from("tier3_pipeline")
      .update({ messages_json: updated, updated_at: new Date().toISOString() })
      .eq("id", pipelineId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-email POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
