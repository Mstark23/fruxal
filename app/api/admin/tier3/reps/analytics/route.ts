// =============================================================================
// GET /api/admin/tier3/reps/analytics — Rep performance analytics
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const [reps, assignments, pipelines, commissions, findings] = await Promise.all([
      supabaseAdmin.from("tier3_reps").select("id, name, email, province, status, commission_rate").then(r => r.data || []),
      supabaseAdmin.from("tier3_rep_assignments").select("rep_id, pipeline_id, assigned_at").then(r => r.data || []),
      supabaseAdmin.from("tier3_pipeline").select("id, stage, created_at, updated_at").then(r => r.data || []),
      supabaseAdmin.from("tier3_rep_commissions").select("rep_id, commission_amount, status, created_at").then(r => r.data || []),
      supabaseAdmin.from("tier3_confirmed_findings").select("engagement_id, confirmed_amount, created_at").then(r => r.data || []),
    ]);

    const pipeMap: Record<string, any> = {};
    for (const p of pipelines) pipeMap[p.id] = p;

    const CLOSED_STAGES = ["in_engagement", "recovery_tracking", "fee_collected"];
    const ACTIVE_STAGES = ["contacted","called","diagnostic_sent","agreement_out","signed","in_engagement","recovery_tracking"];

    const analytics = reps.map((rep: any) => {
      const repAssignments = assignments.filter((a: any) => a.rep_id === rep.id);
      const repPipes = repAssignments.map((a: any) => pipeMap[a.pipeline_id]).filter(Boolean);
      const repCommissions = commissions.filter((c: any) => c.rep_id === rep.id);

      const totalClients   = repAssignments.length;
      const activeClients  = repPipes.filter((p: any) => ACTIVE_STAGES.includes(p.stage)).length;
      const closedClients  = repPipes.filter((p: any) => CLOSED_STAGES.includes(p.stage)).length;
      const conversionRate = totalClients > 0 ? Math.round((closedClients / totalClients) * 100) : 0;

      // Average days from assigned → in_engagement
      const closedPipes = repPipes.filter((p: any) => CLOSED_STAGES.includes(p.stage));
      const avgDaysToClose = closedPipes.length > 0
        ? Math.round(closedPipes.reduce((s: number, p: any) => {
            const assigned = repAssignments.find((a: any) => a.pipeline_id === p.id);
            if (!assigned) return s;
            return s + (new Date(p.updated_at).getTime() - new Date(assigned.assigned_at).getTime()) / 86400000;
          }, 0) / closedPipes.length)
        : null;

      const commissionsEarned  = repCommissions.filter((c: any) => c.status === "paid").reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0);
      const commissionsPending = repCommissions.filter((c: any) => c.status === "pending").reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0);

      // Monthly trend (last 3 months)
      const now = Date.now();
      const monthlyBreakdown = [0, 1, 2].map(m => {
        const start = new Date(now); start.setMonth(start.getMonth() - m - 1); start.setDate(1);
        const end   = new Date(now); end.setMonth(end.getMonth() - m); end.setDate(0);
        const monthCommissions = repCommissions.filter((c: any) =>
          new Date(c.created_at) >= start && new Date(c.created_at) <= end
        ).reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0);
        return { month: start.toLocaleDateString("en-CA", { month: "short" }), earned: monthCommissions };
      }).reverse();

      return {
        id:               rep.id,
        name:             rep.name,
        email:            rep.email,
        province:         rep.province,
        status:           rep.status,
        commissionRate:   rep.commission_rate,
        totalClients,
        activeClients,
        closedClients,
        conversionRate,
        avgDaysToClose,
        commissionsEarned,
        commissionsPending,
        monthlyBreakdown,
      };
    });

    // Sort by commissions earned desc
    analytics.sort((a: any, b: any) => b.commissionsEarned - a.commissionsEarned);

    return NextResponse.json({ success: true, analytics });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
