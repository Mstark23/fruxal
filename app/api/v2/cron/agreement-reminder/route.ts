// =============================================================================
// GET /api/v2/cron/agreement-reminder — Unsigned agreement nudge
// =============================================================================
// Runs every Friday 10am EST.
// Finds all pipeline entries at stage='agreement_out' where updated_at > 7 days.
// Sends a reminder email to the contact + logs a note.
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

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const reminded: string[] = [];

  try {
    const { data: stalled } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, company_name, contact_email, contact_name, updated_at, rep_id, tier3_reps(name, email)")
      .eq("stage", "agreement_out")
      .lte("updated_at", sevenDaysAgo) as any;

    for (const pipe of stalled || []) {
      if (!pipe.contact_email) continue;

      const repName = (pipe.tier3_reps as any)?.name || "your Fruxal rep";

      // Email client
      const body = `
        <p style="color:#3d3d4e;margin:0 0 16px">Hi ${pipe.contact_name || "there"},</p>
        <p style="color:#3d3d4e;margin:0 0 16px">
          Your Fruxal engagement agreement is ready and waiting for your signature.
          ${repName} has been holding your spot — once you sign, the recovery work begins immediately.
        </p>
        <p style="color:#3d3d4e;margin:0 0 16px">
          <strong>Reminder:</strong> There's no cost until savings are confirmed.
          You keep ${100 - 12}% of everything recovered.
        </p>
        <p style="color:#3d3d4e;margin:0 0 24px;font-size:12px;color:#6b7280;">
          If you have questions before signing, reply to this email or book a 10-minute call with ${repName}.
        </p>
      `;
      const sent = await sendEmail({
        to: pipe.contact_email,
        subject: `Your Fruxal agreement is still waiting — no cost until recovery`,
        html: emailTemplate("Agreement reminder", body, "Contact Us →", `mailto:${(pipe.tier3_reps as any)?.email || "hello@fruxal.ca"}`),
      });

      if (sent) {
        reminded.push(pipe.id);
        // Log note on pipeline
        await supabaseAdmin
          .from("tier3_pipeline")
          .update({ notes: ((pipe.notes || "") + " | Agreement reminder sent " + new Date().toLocaleDateString("en-CA")).trim() })
          .eq("id", pipe.id)
          .then(() => {}, () => {});

        // Notify rep
        if ((pipe.tier3_reps as any)?.email) {
          await sendEmail({
            to: (pipe.tier3_reps as any).email,
            subject: `Agreement reminder sent to ${pipe.company_name || pipe.contact_name || "client"}`,
            html: emailTemplate("Agreement reminder sent",
              `<p style="color:#3d3d4e">We've sent an automatic agreement reminder to ${pipe.contact_email}. If they haven't signed in 3 more days, follow up personally.</p>`,
              "View Pipeline →", `${appUrl}/rep/dashboard`),
          }).then(() => {}, () => {});
        }
      }
    }

    return NextResponse.json({ success: true, reminded: reminded.length, ids: reminded });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
