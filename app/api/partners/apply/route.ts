// =============================================================================
// POST /api/partners/apply — Partner program application
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, emailTemplate } from "@/services/email/service";
import { notifyAdmin } from "@/lib/admin-notify";

export async function POST(req: NextRequest) {
  try {
    const { name, email, firm, clients } = await req.json();
    if (!name || !email) return NextResponse.json({ error: "name and email required" }, { status: 400 });

    // Store application
    await supabaseAdmin.from("partner_applications").insert({
      name, email: email.toLowerCase().trim(), firm: firm || null,
      client_count: parseInt(clients) || null,
      applied_at: new Date().toISOString(),
    }).then(() => {}, () => {}); // table may not exist yet — non-fatal

    // Send confirmation to applicant
    sendEmail({
      to: email.toLowerCase().trim(),
      subject: "Fruxal partner application received",
      html: emailTemplate(
        "Partner application received",
        `<p style="color:#3d3d4e;margin:0 0 16px">Hi ${name},</p>
        <p style="color:#3d3d4e;margin:0 0 16px">
          We received your application to the Fruxal partner program. 
          We'll reach out within 1 business day with your partner referral code and setup instructions.
        </p>
        <p style="color:#3d3d4e;margin:0 0 24px;font-size:12px;color:#6b7280">
          In the meantime, you can start using the embed widget on your site — just add 
          <code>?utm_source=partner&utm_medium=embed</code> to the URL to track leads from your site.
        </p>`,
        "View embed code →",
        `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/partners`
      ),
    }).catch(() => {});

    // Alert admin
    notifyAdmin({
      type: "hot_lead_assigned",
      company: firm || email,
      extra: `Partner application: ${name} (${firm || "no firm"}) — ~${clients || "?"} SMB clients`,
      link: `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/admin/overview`,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
