// =============================================================================
// POST /api/cron/monthly-report — Monthly email digest with recovery data
// Schedule: "0 9 1 * *" (1st of every month at 9am UTC)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, emailTemplate } from "@/services/email/service";

export const maxDuration = 300;

function isAuthorized(req: NextRequest): boolean {
  return (
    req.headers.get("x-vercel-cron") === "1" ||
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}` ||
    process.env.NODE_ENV === "development"
  );
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active businesses that have tasks
    const { data: businesses } = await supabaseAdmin
      .from("diagnostic_tasks")
      .select("business_id")
      .neq("status", "dismissed")
      .limit(500);

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "No businesses with tasks" });
    }

    // Unique business IDs
    const bizIds = [...new Set(businesses.map((b: any) => b.business_id))];

    let sent = 0;
    let errors = 0;

    for (const bizId of bizIds) {
      try {
        // Get latest financial ratios
        const { data: ratioRow } = await supabaseAdmin
          .from("financial_ratios")
          .select("gross_margin_pct, dscr, dso_days, data_completeness_pct")
          .eq("business_id", bizId)
          .order("period_month", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Get recovery totals
        const { data: tasks } = await supabaseAdmin
          .from("diagnostic_tasks")
          .select("status, savings_monthly, completed_at")
          .eq("business_id", bizId)
          .neq("status", "dismissed");

        const rows = tasks || [];
        const recovered = Math.round(rows.filter((t: any) => t.status === "done").reduce((s: number, t: any) => s + (t.savings_monthly ?? 0), 0));
        const available = Math.round(rows.filter((t: any) => t.status === "open" || t.status === "in_progress").reduce((s: number, t: any) => s + (t.savings_monthly ?? 0), 0));

        // This month's new recoveries
        const thisMonthStart = new Date(); thisMonthStart.setDate(1); thisMonthStart.setHours(0,0,0,0);
        const lastMonthStart = new Date(thisMonthStart); lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        const thisMonthNew = Math.round(rows
          .filter((t: any) => t.status === "done" && t.completed_at && new Date(t.completed_at) >= lastMonthStart && new Date(t.completed_at) < thisMonthStart)
          .reduce((s: number, t: any) => s + (t.savings_monthly ?? 0), 0));

        if (recovered === 0 && available === 0) continue;

        // Get user email from business_profiles
        const { data: prof } = await supabaseAdmin
          .from("business_profiles")
          .select("business_name, user_id")
          .eq("business_id", bizId)
          .maybeSingle();

        if (!prof?.user_id) continue;

        const { data: userRow } = await supabaseAdmin
          .from("users")
          .select("email, name")
          .eq("id", prof.user_id)
          .maybeSingle();

        if (!userRow?.email) continue;

        const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.com";
        const bizName = prof.business_name || "your business";

        const bodyLines = [];
        if (thisMonthNew > 0) bodyLines.push(`This month you recovered <strong>$${(thisMonthNew ?? 0).toLocaleString()}/month</strong> in new fixes.`);
        if (recovered > 0) bodyLines.push(`Total to date: <strong>$${(recovered ?? 0).toLocaleString()}/month</strong> ($${(recovered * 12).toLocaleString()}/year).`);
        if (available > 0) bodyLines.push(`<strong>$${(available ?? 0).toLocaleString()}/month</strong> still identified and uncaptured.`);

        const html = emailTemplate(
          `Monthly update for ${bizName}`,
          bodyLines.join("<br><br>"),
          "See your action plan →",
          `${appUrl}/v2/tasks`
        );

        const ok = await sendEmail({
          to: userRow.email,
          subject: recovered > 0
            ? `Your Fruxal update: $${(recovered ?? 0).toLocaleString()}/mo recovered`
            : `Fruxal: $${(available ?? 0).toLocaleString()}/mo waiting to be captured`,
          html,
        });

        if (ok) sent++;
        else errors++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({ success: true, processed: bizIds.length, sent, errors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
