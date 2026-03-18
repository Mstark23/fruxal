// POST /api/v2/notify/enterprise-lead — Email sales team when enterprise form submitted
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, name, email, phone, revenue, industry, province, message, pipelineId } = body;

    const RESEND_KEY = process.env.RESEND_API_KEY;
    const SALES_EMAIL = process.env.SALES_EMAIL || "sales@fruxal.com";

    if (!RESEND_KEY) return NextResponse.json({ success: false, error: "No Resend key" });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: "Fruxal <noreply@fruxal.com>",
        to: [SALES_EMAIL],
        subject: `🔥 New Enterprise Lead: ${company} (${revenue})`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;padding:24px;">
            <h2 style="color:#1B3A2D;margin-bottom:16px;">New Enterprise Lead</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#8E8C85;font-size:13px;width:140px;">Company</td><td style="font-weight:600;font-size:13px;">${company}</td></tr>
              <tr><td style="padding:8px 0;color:#8E8C85;font-size:13px;">Contact</td><td style="font-weight:600;font-size:13px;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#8E8C85;font-size:13px;">Email</td><td style="font-size:13px;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#8E8C85;font-size:13px;">Phone</td><td style="font-size:13px;">${phone||"—"}</td></tr>
              <tr><td style="padding:8px 0;color:#8E8C85;font-size:13px;">Revenue</td><td style="font-weight:700;color:#1B3A2D;font-size:13px;">${revenue}</td></tr>
              <tr><td style="padding:8px 0;color:#8E8C85;font-size:13px;">Industry</td><td style="font-size:13px;">${industry||"—"}</td></tr>
              <tr><td style="padding:8px 0;color:#8E8C85;font-size:13px;">Province</td><td style="font-size:13px;">${province||"—"}</td></tr>
              ${message ? `<tr><td style="padding:8px 0;color:#8E8C85;font-size:13px;vertical-align:top;">Notes</td><td style="font-size:13px;">${message}</td></tr>` : ""}
            </table>
            ${pipelineId ? `<div style="margin-top:20px;"><a href="${process.env.NEXTAUTH_URL||"https://fruxal.com"}/admin/tier3/pipeline" style="padding:10px 20px;background:#1B3A2D;color:white;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">View in Pipeline →</a></div>` : ""}
          </div>
        `,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
