// GET /api/admin/accountants/workload — all playbooks with assignment status
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const [accountants, playbooks] = await Promise.all([
    supabaseAdmin.from("accountants").select("id, name, email, status").eq("status", "active").then(r => r.data || []),
    supabaseAdmin.from("execution_playbooks")
      .select("id, finding_title, category, severity, amount_recoverable, status, quick_win, assigned_to, pipeline_id, created_at, confirmed_amount, updated_at")
      .neq("status", "closed")
      .order("quick_win", { ascending: false })
      .order("amount_recoverable", { ascending: false })
      .then(r => r.data || []),
  ]);

  // Get company names
  const pipelineIds = [...new Set((playbooks as any[]).map((p: any) => p.pipeline_id).filter(Boolean))];
  const companyMap: Record<string, string> = {};
  if (pipelineIds.length) {
    const { data: pipes } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, company_name")
      .in("id", pipelineIds as string[]);
    (pipes || []).forEach((p: any) => { companyMap[p.id] = p.company_name; });
  }

  const unassigned  = (playbooks as any[]).filter((p: any) => !p.assigned_to);
  const totalValue  = (playbooks as any[]).reduce((s: number, p: any) => s + (p.amount_recoverable || 0), 0);
  const confirmedValue = (playbooks as any[]).filter((p: any) => p.status === "confirmed").reduce((s: number, p: any) => s + (p.confirmed_amount || p.amount_recoverable || 0), 0);

  return NextResponse.json({
    success: true,
    accountants,
    playbooks: (playbooks as any[]).map((p: any) => ({ ...p, company_name: companyMap[p.pipeline_id] || "—" })),
    summary: {
      total:           (playbooks as any[]).length,
      unassigned:      unassigned.length,
      total_value:     totalValue,
      confirmed_value: confirmedValue,
      by_status: {
        queued:      (playbooks as any[]).filter((p: any) => p.status === "queued").length,
        in_progress: (playbooks as any[]).filter((p: any) => p.status === "in_progress").length,
        submitted:   (playbooks as any[]).filter((p: any) => p.status === "submitted").length,
        confirmed:   (playbooks as any[]).filter((p: any) => p.status === "confirmed").length,
      },
    },
  });
}
