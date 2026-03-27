// =============================================================================
// GET /api/v2/cron/renewal-outreach — Year-2 re-engagement trigger
// =============================================================================
// Runs monthly on the 1st at 9am EST.
// Finds completed engagements where completed_at is ~11 months ago.
// Sends a re-engagement email to the client inviting a second engagement.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, emailTemplate } from "@/services/email/service";
import { notifyAdmin } from "@/lib/admin-notify";

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

  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  // 11 months ago window (±15 days)
  const low  = new Date(Date.now() - (11 * 30 + 15) * 86400000).toISOString();
  const high = new Date(Date.now() - (11 * 30 - 15) * 86400000).toISOString();
  const reminded: string[] = [];

  try {
    const { data: engagements } = await supabaseAdmin
      .from("tier3_engagements")
      .select("id, company_name, fee_percentage, diagnostic_id, completed_at")
      .eq("status", "completed")
      .gte("completed_at", low)
      .lte("completed_at", high)
      .is("renewal_outreach_sent_at", null);

    for (const eng of engagements || []) {
      // Get confirmed savings
      const { data: findings } = await supabaseAdmin
        .from("tier3_confirmed_findings")
        .select("confirmed_amount")
        .eq("engagement_id", eng.id);
      const totalConfirmed = (findings || []).reduce((s, f) => s + (f.confirmed_amount ?? 0), 0);

      // Get client contact
      const { data: pipe } = await supabaseAdmin
        .from("tier3_pipeline")
        .select("contact_email, contact_name, user_id")
        .eq("diagnostic_id", eng.diagnostic_id || "")
        .maybeSingle();

      const clientEmail = pipe?.contact_email;
      if (!clientEmail) continue;

      const contactName = pipe?.contact_name || "there";
      const keep = 100 - (eng.fee_percentage || 12);
      const youKept = Math.round(totalConfirmed * (keep / 100));
      const completedDate = eng.completed_at
        ? new Date(eng.completed_at).toLocaleDateString("en-CA", { month: "long", year: "numeric" })
        : "last year";

      const body = `
        <p style="color:#3d3d4e;margin:0 0 16px">Hi ${contactName},</p>
        <p style="color:#3d3d4e;margin:0 0 16px">
          It's been almost a year since we closed your Fruxal engagement.
          ${totalConfirmed > 0 ? `You recovered <strong style="color:#2D7A50">$${youKept.toLocaleString()}</strong> — your ${keep}% share of the $${totalConfirmed.toLocaleString()} we found together.` : "We worked through a number of recovery opportunities together."}
        </p>
        <p style="color:#3d3d4e;margin:0 0 16px">
          A lot changes in 12 months: vendor contracts renew at new rates, regulations shift,
          your payroll structure may have changed, and new government programs come online.
          Most of our clients find a fresh round of opportunities every year.
        </p>
        <p style="color:#3d3d4e;margin:0 0 24px">
          Would you like to run another engagement? Same terms — 12% contingency,
          no cost until we recover. We'd start with a fresh scan to see what's changed.
        </p>
      `;

      const sent = await sendEmail({
        to: clientEmail,
        subject: `Ready for year 2? ${totalConfirmed > 0 ? `You kept $${youKept.toLocaleString()} last time.` : `Your engagement closed ${completedDate}.`}`,
        html: emailTemplate(
          "Year 2 opportunity",
          body,
          "Start a New Scan — Free →",
          `${appUrl}/?utm_source=renewal&utm_campaign=year2`
        ),
      });

      if (sent) {
        reminded.push(eng.id);
        // Mark sent
        await supabaseAdmin
          .from("tier3_engagements")
          .update({ renewal_outreach_sent_at: new Date().toISOString() })
          .eq("id", eng.id)
          .then(() => {}, () => {});

        // Notify admin
        notifyAdmin({
          type: "hot_lead_assigned",
          company: eng.company_name || "client",
          extra: `Year-2 renewal outreach sent. Previous confirmed savings: $${totalConfirmed.toLocaleString()}`,
          link: `${appUrl}/admin/tier3`,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, outreach_sent: reminded.length, ids: reminded });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
