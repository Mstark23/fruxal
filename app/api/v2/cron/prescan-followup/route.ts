// =============================================================================
// GET /api/v2/cron/prescan-followup — Follow up with anonymous prescan captures
// =============================================================================
// Fires daily at 11am EST.
// Finds prescan_email_captures from 24-48h ago that have no associated account.
// Sends one follow-up email with urgency and register CTA.
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

  const now = Date.now();
  const from24h = new Date(now - 48 * 3600000).toISOString();
  const to24h   = new Date(now - 24 * 3600000).toISOString();
  const appUrl  = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const reminded: string[] = [];

  try {
    const { data: captures } = await supabaseAdmin
      .from("prescan_email_captures")
      .select("*")
      .gte("captured_at", from24h)
      .lte("captured_at", to24h)
      .is("followup_sent_at", null);

    for (const cap of captures || []) {
      // Skip if they've already created an account
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", cap.email)
        .maybeSingle();

      if (user) continue; // Already registered — skip

      const totalLeak = cap.total_leak ?? 0;
      const dailyCost = Math.round(totalLeak / 365);
      const registerUrl = cap.prescan_result_id
        ? `${appUrl}/register?from=prescan&prescanRunId=${cap.prescan_result_id}`
        : `${appUrl}/register`;

      const body = `
        <p style="color:#3d3d4e;margin:0 0 16px">Hi,</p>
        <p style="color:#3d3d4e;margin:0 0 16px">
          Yesterday you scanned your business on Fruxal and we found 
          <strong style="color:#B34040">$${totalLeak.toLocaleString()}/yr</strong> in potential leaks.
          That's approximately <strong>$${dailyCost}/day</strong> leaving your business.
        </p>
        <p style="color:#3d3d4e;margin:0 0 16px">
          Your results are still saved. Create a free account to see the full breakdown — 
          every finding with dollar amounts, the fix steps, and which government programs you qualify for.
        </p>
        <p style="color:#3d3d4e;margin:0 0 24px">
          Takes 30 seconds. No credit card. If your results qualify you for a recovery expert, 
          we'll assign one at no cost — you only pay 12% of what we actually recover.
        </p>
      `;

      const sent = await sendEmail({
        to: cap.email,
        subject: `Your scan found $${totalLeak.toLocaleString()}/yr — results still waiting`,
        html: emailTemplate("Your results are waiting", body, "See My Full Results →", registerUrl),
      });

      if (sent) {
        reminded.push(cap.email);
        await supabaseAdmin
          .from("prescan_email_captures")
          .update({ followup_sent_at: new Date().toISOString() })
          .eq("id", cap.id)
          .then(() => {}, () => {});
      }
    }

    return NextResponse.json({ success: true, reminded: reminded.length, emails: reminded });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
