// =============================================================================
// GET  /api/admin/tier3/pipeline/[id]/execution  — fetch execution playbooks
// PATCH /api/admin/tier3/pipeline/[id]/execution  — update playbook status/notes
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id } = params; // pipeline entry id

  try {
    // Resolve pipeline → report_id
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, report_id, business_id, company_name, stage")
      .eq("id", id)
      .single();

    if (!pipe?.report_id) {
      return NextResponse.json({ success: true, playbooks: [], message: "No diagnostic report linked to this pipeline entry" });
    }

    // Fetch execution playbooks
    const { data: playbooks, error } = await supabaseAdmin
      .from("execution_playbooks")
      .select("*")
      .eq("diagnostic_report_id", pipe.report_id)
      .order("amount_recoverable", { ascending: false });

    if (error) throw error;

    // If playbooks don't exist yet, check if report is ready and trigger generation
    if (!playbooks || playbooks.length === 0) {
      const { data: report } = await supabaseAdmin
        .from("diagnostic_reports")
        .select("id, status, result_json")
        .eq("id", pipe.report_id)
        .single();

      if (report?.status === "completed" && report?.result_json?.findings?.length > 0) {
        // Trigger generation — fire and forget
        const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
        fetch(`${base}/api/v2/diagnostic/generate-playbooks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.CRON_SECRET || ""}`,
          },
          body: JSON.stringify({ reportId: pipe.report_id, businessId: pipe.business_id }),
        }).catch(() => {});

        return NextResponse.json({
          success: true,
          playbooks: [],
          generating: true,
          message: "Playbooks are being generated — refresh in 30 seconds",
        });
      }

      return NextResponse.json({ success: true, playbooks: [], message: "No playbooks yet" });
    }

    const total_recoverable = playbooks.reduce((s: number, p: any) => s + (p.amount_recoverable || 0), 0);
    const confirmed         = playbooks.filter((p: any) => p.status === "confirmed").reduce((s: number, p: any) => s + (p.confirmed_amount || p.amount_recoverable || 0), 0);
    const quick_wins        = playbooks.filter((p: any) => p.quick_win && p.status === "queued").length;

    return NextResponse.json({
      success: true,
      pipeline_id:        pipe.id,
      report_id:          pipe.report_id,
      company_name:       pipe.company_name,
      stage:              pipe.stage,
      playbooks,
      summary: {
        total:             playbooks.length,
        total_recoverable,
        confirmed,
        quick_wins,
        by_status: {
          queued:      playbooks.filter((p: any) => p.status === "queued").length,
          in_progress: playbooks.filter((p: any) => p.status === "in_progress").length,
          submitted:   playbooks.filter((p: any) => p.status === "submitted").length,
          confirmed:   playbooks.filter((p: any) => p.status === "confirmed").length,
          closed:      playbooks.filter((p: any) => p.status === "closed").length,
        },
      },
    });
  } catch (err: any) {
    console.error("[execution GET]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { playbook_id, status, notes, confirmed_amount } = await req.json();
    if (!playbook_id) return NextResponse.json({ success: false, error: "playbook_id required" }, { status: 400 });

    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status)           update.status           = status;
    if (notes !== undefined) update.notes          = notes;
    if (confirmed_amount !== undefined) {
      update.confirmed_amount = confirmed_amount;
      if (status === "confirmed") update.confirmed_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("execution_playbooks")
      .update(update)
      .eq("id", playbook_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[execution PATCH]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
