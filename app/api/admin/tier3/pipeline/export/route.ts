// =============================================================================
// GET /api/admin/tier3/pipeline/export — Export pipeline as CSV
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

function csvCell(val: unknown): string {
  const s = String(val ?? "");
  const escaped = s.replace(/"/g, '""').replace(/[\r\n]+/g, " ");
  return `"${escaped}"`;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { data: pipes } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, user_id, company_name, contact_name, contact_email, contact_phone, industry, province, annual_revenue, stage, notes, follow_up_date, created_at, updated_at, diagnostic_id, lost_reason")
      .order("created_at", { ascending: false });

    const { data: assignments } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("pipeline_id, assigned_at, tier3_reps(name, email)")
      .order("assigned_at", { ascending: false }) as any;

    const { data: engagements } = await supabaseAdmin
      .from("tier3_engagements")
      .select("diagnostic_id, fee_percentage, status") as any;

    const { data: findings } = await supabaseAdmin
      .from("tier3_confirmed_findings")
      .select("engagement_id, confirmed_amount") as any;

    const repByPipeline: Record<string, any> = {};
    for (const a of assignments || []) {
      if (!repByPipeline[a.pipeline_id]) repByPipeline[a.pipeline_id] = a;
    }
    const engByDiag: Record<string, any> = {};
    for (const e of engagements || []) {
      if (e.diagnostic_id) engByDiag[e.diagnostic_id] = e;
    }
    const savingsByEng: Record<string, number> = {};
    for (const f of findings || []) {
      savingsByEng[f.engagement_id] = (savingsByEng[f.engagement_id] || 0) + (f.confirmed_amount || 0);
    }

    const headers = [
      "ID", "Company", "Contact Name", "Email", "Phone", "Industry", "Province",
      "Annual Revenue", "Stage", "Days in Stage", "Rep Name", "Rep Email",
      "Assigned At", "Fee Pct", "Confirmed Savings", "Engagement Status",
      "Notes", "Follow Up Date", "Created At", "Lost Reason",
    ];

    const rows = (pipes || []).map(p => {
      const rep    = repByPipeline[p.id];
      const eng    = p.diagnostic_id ? engByDiag[p.diagnostic_id] : null;
      const savings = eng ? (savingsByEng[eng.id] || 0) : 0;
      const days   = Math.floor((Date.now() - new Date(p.updated_at || p.created_at).getTime()) / 86400000);
      const repData = rep ? (rep.tier3_reps as any) : null;

      return [
        p.id,
        p.company_name,
        p.contact_name,
        p.contact_email,
        p.contact_phone,
        p.industry,
        p.province,
        p.annual_revenue,
        p.stage,
        days,
        repData?.name,
        repData?.email,
        rep?.assigned_at ? new Date(rep.assigned_at).toLocaleDateString("en-CA") : "",
        eng?.fee_percentage ?? 12,
        savings,
        eng?.status,
        p.notes,
        p.follow_up_date ? new Date(p.follow_up_date).toLocaleDateString("en-CA") : "",
        new Date(p.created_at).toLocaleDateString("en-CA"),
        p.lost_reason,
      ].map(csvCell).join(",");
    });

    const csv = [headers.map(csvCell).join(","), ...rows].join("\r\n");
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="fruxal-pipeline-${date}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
