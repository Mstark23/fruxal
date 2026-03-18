// POST /api/rep/auth/send — sends portal access link to rep
// TEMP: auth-free mode — link contains repId as query param
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { repId } = await req.json();
    if (!repId) return NextResponse.json({ success: false, error: "repId required" }, { status: 400 });

    const { data: rep } = await supabaseAdmin
      .from("tier3_reps")
      .select("id, name, email, status")
      .eq("id", repId)
      .single();

    if (!rep) return NextResponse.json({ success: false, error: "Rep not found" }, { status: 404 });
    if (rep.status !== "active") return NextResponse.json({ success: false, error: "Rep is not active" }, { status: 400 });

    const baseUrl    = process.env.NEXTAUTH_URL || "https://fruxal.com";
    const portalUrl  = `${baseUrl}/rep/dashboard?repId=${rep.id}`;

    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_KEY) return NextResponse.json({ success: false, error: "Email not configured" }, { status: 500 });

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: "Fruxal <noreply@fruxal.com>",
        to:   [rep.email],
        subject: "Your Fruxal Rep Portal Access",
        html: `
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#FAFAF8;">
  <div style="margin-bottom:28px;">
    <span style="font-size:18px;font-weight:700;color:#1B3A2D;letter-spacing:-0.3px;">Fruxal</span>
    <span style="font-size:11px;font-weight:600;color:#8E8C85;margin-left:8px;text-transform:uppercase;letter-spacing:0.5px;">Rep Portal</span>
  </div>
  <h2 style="font-size:20px;font-weight:700;color:#1A1A18;margin:0 0 8px;">Welcome, ${rep.name}</h2>
  <p style="font-size:14px;color:#56554F;margin:0 0 28px;line-height:1.6;">
    Your Fruxal advisor portal is ready. Click below to access your dashboard and view your assigned clients.
  </p>
  <a href="${portalUrl}"
    style="display:inline-block;padding:12px 28px;background:#1B3A2D;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
    Access My Dashboard →
  </a>
  <p style="font-size:11px;color:#B5B3AD;margin:24px 0 0;">Bookmark this link for quick access.</p>
</div>`,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("[Rep auth send] Resend error:", err);
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, sentTo: rep.email, portalUrl });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
