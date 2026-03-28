// POST /api/admin/backfill-playbooks
// One-time admin tool: generates execution playbooks for all completed diagnostic
// reports that don't have playbooks yet. Run once after deploy.
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    // Find all completed reports that have no playbooks yet
    const { data: reports } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, business_id, language")
      .eq("status", "completed")
      .not("result_json->findings", "is", null);

    if (!reports?.length) {
      return NextResponse.json({ success: true, message: "No reports found", triggered: 0 });
    }

    // For each report, check if playbooks already exist
    const { data: existing } = await supabaseAdmin
      .from("execution_playbooks")
      .select("diagnostic_report_id");

    const existingIds = new Set((existing || []).map((p: any) => p.diagnostic_report_id));

    const toGenerate = reports.filter((r: any) => !existingIds.has(r.id));

    if (!toGenerate.length) {
      return NextResponse.json({ success: true, message: "All reports already have playbooks", triggered: 0 });
    }

    // Fire off generation for each — non-blocking
    const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
    let triggered = 0;

    for (const report of toGenerate) {
      fetch(`${appUrl}/api/v2/diagnostic/generate-playbooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CRON_SECRET || ""}`,
        },
        body: JSON.stringify({
          reportId:   report.id,
          businessId: report.business_id,
          language:   report.language || "en",
        }),
      }).catch(() => {});
      triggered++;
      // Small delay to avoid hammering the API
      await new Promise(r => setTimeout(r, 300));
    }

    return NextResponse.json({
      success: true,
      triggered,
      total_reports: reports.length,
      already_had_playbooks: reports.length - triggered,
      message: `Triggered playbook generation for ${triggered} reports. Check execution tabs in ~2 minutes.`,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
