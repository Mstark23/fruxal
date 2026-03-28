// =============================================================================
// GET /api/v2/cron/rep-followup — Weekly rep follow-up reminder
// =============================================================================
// Fires every Wednesday 9am EST. Finds all pipeline entries where:
//   - stage is "contacted" or "called" AND follow_up_date <= today
//   - Or stage is "lead" and created > 3 days ago with no contact
// Sends reminder email to the assigned rep.
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

  const today = new Date().toISOString().split("T")[0];
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
  const results: string[] = [];

  try {
    // 1. Follow-up dates that have passed
    const { data: overdueFollowUps } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, company_name, stage, follow_up_date, rep_id, user_id, tier3_reps(name, email)")
      .in("stage", ["contacted", "called", "call_booked", "diagnostic_sent", "agreement_out"])
      .lte("follow_up_date", today)
      .not("rep_id", "is", null);

    // 2. Stale leads (assigned but no contact in 3+ days)
    const { data: staleLeads } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, company_name, stage, created_at, rep_id, user_id, tier3_reps(name, email)")
      .eq("stage", "lead")
      .lte("created_at", threeDaysAgo)
      .not("rep_id", "is", null);

    const allItems = [...(overdueFollowUps || []), ...(staleLeads || [])];

    // Group by rep
    const byRep: Record<string, { rep: any; items: any[] }> = {};
    for (const item of allItems) {
      const rep = (item as any).tier3_reps;
      if (!rep?.email) continue;
      if (!byRep[rep.email]) byRep[rep.email] = { rep, items: [] };
      byRep[rep.email].items.push(item);
    }

    const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";

    for (const [email, { rep, items }] of Object.entries(byRep)) {
      const rows = items.map((item: any) => {
        const isStale = item.stage === "lead";
        const name = item.company_name || `Lead ${(item.id as string).slice(0, 8)}`;
        const days = isStale
          ? Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000)
          : Math.ceil((Date.now() - new Date(item.follow_up_date).getTime()) / 86400000);
        return `<li style="margin:0 0 8px;color:#3d3d4e;font-size:13px">
          <strong>${name}</strong> — ${isStale ? `New lead (${days}d uncontacted)` : `Follow-up ${days}d overdue`}
          <a href="${appUrl}/rep/customer/${item.id}" style="margin-left:8px;color:#1B3A2D;font-weight:700;font-size:11px">View →</a>
        </li>`;
      }).join("");

      const body = `
        <p style="color:#3d3d4e;margin:0 0 12px">Hi ${rep.name},</p>
        <p style="color:#3d3d4e;margin:0 0 16px">You have ${items.length} client${items.length > 1 ? "s" : ""} that need${items.length === 1 ? "s" : ""} attention:</p>
        <ul style="padding:0 0 0 16px;margin:0 0 20px">${rows}</ul>
        <p style="color:#6b7280;font-size:12px">Quick contact increases conversion by 3× — clients who hear within 24h are far more likely to book a call.</p>
      `;

      const sent = await sendEmail({
        to: email,
        subject: `${items.length} client${items.length > 1 ? "s" : ""} waiting for your follow-up`,
        html: emailTemplate("Follow-up needed", body, "View Your Pipeline →", `${appUrl}/rep/dashboard`),
      });
      if (sent) results.push(email);
    }

    return NextResponse.json({ success: true, reminded: results.length, emails: results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
