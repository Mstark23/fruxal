// =============================================================================
// POST /api/webhooks/calendly — Calendly event webhook
// =============================================================================
// Receives Calendly webhook events. When a meeting is scheduled,
// finds the matching pipeline entry by invitee email and advances
// stage to 'call_booked'.
//
// Setup in Calendly:
//   Webhooks → Create webhook → URL: https://fruxal.ca/api/webhooks/calendly
//   Events: invitee.created (booking confirmed)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, emailTemplate } from "@/services/email/service";
import crypto from "crypto";

export const maxDuration = 30;

function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return true; // Skip verification in dev
  try {
    const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(signature, "hex"));
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("calendly-webhook-signature") || "";
    const secret = process.env.CALENDLY_WEBHOOK_SECRET || "";

    if (secret && !verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Only handle booking confirmations
    if (eventType !== "invitee.created") {
      return NextResponse.json({ received: true, action: "ignored" });
    }

    const inviteeEmail: string = event.payload?.invitee?.email || "";
    const inviteeName: string  = event.payload?.invitee?.name  || "";
    const eventName: string    = event.payload?.event_type?.name || "call";
    const startTime: string    = event.payload?.scheduled_event?.start_time || "";

    if (!inviteeEmail) {
      return NextResponse.json({ received: true, action: "no_email" });
    }

    // Find pipeline entry by invitee email
    const { data: pipes } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, stage, company_name, rep_id, tier3_rep_assignments(tier3_reps(name, email))")
      .eq("contact_email", inviteeEmail.toLowerCase())
      .in("stage", ["lead","contacted","called","diagnostic_sent","agreement_out"])
      .order("created_at", { ascending: false })
      .limit(1) as any;

    const pipe = pipes?.[0];
    if (!pipe) {
      return NextResponse.json({ received: true, action: "no_pipeline_match", email: inviteeEmail });
    }

    // Advance stage to call_booked
    await supabaseAdmin
      .from("tier3_pipeline")
      .update({
        stage:      "call_booked",
        updated_at: new Date().toISOString(),
        notes:      ((pipe.notes || "") + `
[Auto] Call booked: ${eventName} on ${new Date(startTime).toLocaleDateString("en-CA")}`).trim(),
      })
      .eq("id", pipe.id);

    // Notify rep
    const rep = pipe.tier3_rep_assignments?.[0]?.tier3_reps;
    const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";

    if (rep?.email) {
      const callDate = startTime ? new Date(startTime).toLocaleString("en-CA", {
        weekday: "short", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", timeZone: "America/Toronto",
      }) : "scheduled";

      await sendEmail({
        to: rep.email,
        subject: `Call booked: ${inviteeName || pipe.company_name || inviteeEmail} — ${callDate}`,
        html: emailTemplate(
          "Call booked",
          `<p style="color:#3d3d4e;margin:0 0 16px">Hi ${rep.name},</p>
          <p style="color:#3d3d4e;margin:0 0 16px">
            <strong>${inviteeName || pipe.company_name || inviteeEmail}</strong> just booked a call: 
            <strong>${eventName}</strong> on <strong>${callDate} EST</strong>.
          </p>
          <p style="color:#3d3d4e;margin:0 0 24px">
            Their pipeline stage has been advanced to <strong>Call Booked</strong> automatically.
          </p>`,
          "View Client File →",
          `${appUrl}/rep/customer/${pipe.id}`
        ),
      }).catch(() => {});
    }

    return NextResponse.json({
      received: true,
      action: "stage_advanced",
      pipelineId: pipe.id,
      newStage: "call_booked",
    });

  } catch (err: any) {
    console.error("[Calendly webhook]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
