// =============================================================================
// POST /api/rep/customer/[id]/invite
// Rep sends a magic access link to their enterprise client.
// Client clicks link → /join?token=XXX → creates account → enterprise dashboard
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

const SECRET   = process.env.NEXTAUTH_SECRET || "fruxal-client-invite";
const BASE_URL = process.env.NEXTAUTH_URL || "https://fruxal.vercel.app";

function signInvite(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig  = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  const diagId = params.id;

  try {
    const { clientEmail, clientName } = await req.json();

    if (!clientEmail) {
      return NextResponse.json({ success: false, error: "clientEmail required" }, { status: 400 });
    }

    // Verify this diagnostic is assigned to this rep
    const { data: assignment } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("diagnostic_id")
      .eq("rep_id", auth.repId!)
      .eq("diagnostic_id", diagId)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Not authorized for this client" }, { status: 403 });
    }

    // Get diagnostic details
    const { data: diag } = await supabaseAdmin
      .from("tier3_diagnostics")
      .select("id, company_name, industry, province")
      .eq("id", diagId)
      .maybeSingle();

    const companyName = diag?.company_name || "Your company";

    // Generate invite token — valid 7 days
    const token = signInvite({
      diagId,
      clientEmail: clientEmail.toLowerCase().trim(),
      clientName:  clientName || "",
      companyName,
      repId:       auth.repId,
      repName:     auth.rep?.name || "Your advisor",
      exp:         Date.now() + 7 * 24 * 60 * 60 * 1000,
      type:        "client_invite",
    });

    const inviteUrl = `${BASE_URL}/join?token=${encodeURIComponent(token)}`;

    // Send email via Resend
    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_KEY) {
      return NextResponse.json({ success: false, error: "Email not configured" }, { status: 500 });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Fruxal <noreply@fruxal.com>",
        to:   [clientEmail.toLowerCase().trim()],
        subject: `Your Fruxal Financial Dashboard is Ready — ${companyName}`,
        html: `
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAFAF8;">
  <div style="margin-bottom:28px;">
    <span style="font-size:18px;font-weight:700;color:#1B3A2D;letter-spacing:-0.3px;">Fruxal</span>
  </div>
  <h2 style="font-size:22px;font-weight:700;color:#1A1A18;margin:0 0 12px;">Your financial dashboard is ready</h2>
  <p style="font-size:14px;color:#56554F;margin:0 0 8px;line-height:1.6;">
    Hi${clientName ? ` ${clientName}` : ""},
  </p>
  <p style="font-size:14px;color:#56554F;margin:0 0 24px;line-height:1.6;">
    ${auth.rep?.name || "Your Fruxal advisor"} has completed your financial diagnostic for <strong>${companyName}</strong>. 
    Your dashboard is ready — click below to create your account and view your results.
  </p>
  <div style="background:#F0F7F4;border:1px solid #C8E0D4;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#1B3A2D;text-transform:uppercase;letter-spacing:0.5px;">Your dashboard includes</p>
    <ul style="margin:8px 0 0;padding-left:20px;font-size:13px;color:#56554F;line-height:1.8;">
      <li>Financial health score and detailed findings</li>
      <li>Identified savings opportunities with dollar amounts</li>
      <li>Your 90-day recovery action plan</li>
      <li>Secure document sharing with your advisor</li>
    </ul>
  </div>
  <a href="${inviteUrl}"
    style="display:inline-block;padding:14px 32px;background:#1B3A2D;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;margin-bottom:16px;">
    Access My Dashboard →
  </a>
  <p style="font-size:11px;color:#B5B3AD;margin:0;">
    This link expires in 7 days. Questions? Reply to this email or contact your advisor ${auth.rep?.name || ""} directly.
  </p>
</div>`,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("[Client invite] Resend error:", err);
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }

    // Log invite sent
    await supabaseAdmin.from("tier3_pipeline").update({
      client_email:      clientEmail.toLowerCase().trim(),
      client_name:       clientName || null,
      invite_sent_at:    new Date().toISOString(),
      updated_at:        new Date().toISOString(),
    }).eq("diagnostic_id", diagId);

    return NextResponse.json({ success: true, sentTo: clientEmail });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
