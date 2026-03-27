// =============================================================================
// GET /api/v2/cron/call-prep-email — "Prepare for your call" email
// =============================================================================
// Fires daily at 10am EST.
// Finds clients assigned a rep 20-28h ago who haven't booked yet.
// Sends a warm-up email: what to prepare, what the call covers.
// This runs BEFORE the rep typically makes first contact.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, emailTemplate } from "@/services/email/service";

export const maxDuration = 60;

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-vercel-cron") === "1" ||
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}` ||
    process.env.NODE_ENV === "development";
}

export async function GET(req: NextRequest) { return handler(req); }
export async function POST(req: NextRequest) { return handler(req); }

async function handler(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appUrl    = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  // Window: assigned 20-28h ago (catches yesterday's assignments)
  const from = new Date(Date.now() - 28 * 3600000).toISOString();
  const to   = new Date(Date.now() - 20 * 3600000).toISOString();
  const sent: string[] = [];

  try {
    // Find assignments in the window
    const { data: assignments } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("pipeline_id, rep_id, assigned_at, tier3_reps(name, calendly_url, contingency_rate), tier3_pipeline(contact_email, contact_name, company_name, stage, user_id)")
      .gte("assigned_at", from)
      .lte("assigned_at", to) as any;

    for (const a of assignments || []) {
      const pipe = a.tier3_pipeline as any;
      const rep  = a.tier3_reps as any;
      if (!pipe?.contact_email) continue;
      // Skip if already booked
      if (pipe.stage === "call_booked" || pipe.stage === "signed" ||
          pipe.stage === "in_engagement" || pipe.stage === "fee_collected") continue;

      const contactName = pipe.contact_name?.split(" ")[0] || "there";
      const repName     = rep?.name || "your Fruxal rep";
      const keepPct     = 100 - (rep?.contingency_rate ?? 12);
      const ctaUrl      = rep?.calendly_url || `${appUrl}/v2/dashboard`;

      const body = `
        <p style="color:#3d3d4e;margin:0 0 16px">Hi ${contactName},</p>
        <p style="color:#3d3d4e;margin:0 0 16px">
          <strong>${repName}</strong> from Fruxal has been assigned to your file and will be reaching out soon.
          To make the most of your first call, here's what to have handy:
        </p>
        <div style="background:#F5F9F6;border-radius:10px;padding:16px 20px;margin:0 0 20px">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1B3A2D">What to prepare</p>
          <ul style="margin:0;padding-left:18px;color:#3d3d4e;font-size:13px;line-height:1.8">
            <li>Your most recent vendor/supplier contracts or invoices</li>
            <li>Your latest T2 corporate return (or T1 if self-employed)</li>
            <li>Roughly what you pay for: insurance, processing fees, payroll</li>
            <li>Whether you've done any custom software or technical development</li>
          </ul>
        </div>
        <p style="color:#3d3d4e;margin:0 0 16px">
          The call is 20–30 minutes. ${repName} will walk through exactly what was found in your scan
          and which recoveries make sense to pursue first.
        </p>
        <p style="color:#3d3d4e;margin:0 0 24px">
          <strong>Reminder:</strong> There's no cost to you until money is confirmed recovered.
          Fruxal's fee is ${rep?.contingency_rate ?? 12}% of what we actually find — 
          you keep ${keepPct}% of everything recovered.
        </p>
      `;

      const ok = await sendEmail({
        to: pipe.contact_email,
        subject: `Getting ready for your Fruxal call with ${repName}`,
        html: emailTemplate(
          `Your call with ${repName}`,
          body,
          rep?.calendly_url ? `Book Your Call with ${repName} →` : "View Your Dashboard →",
          ctaUrl
        ),
      });

      if (ok) sent.push(pipe.contact_email);
    }

    return NextResponse.json({ success: true, sent: sent.length, emails: sent });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
