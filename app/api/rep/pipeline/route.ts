import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const repId = auth.repId!;

    const { data: assignments } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("diagnostic_id, assigned_at")
      .eq("rep_id", repId)
      .order("assigned_at", { ascending: false });

    if (!assignments?.length) return NextResponse.json({ success: true, clients: [] });

    const diagIds = assignments.map((a:any) => a.diagnostic_id).filter(Boolean);

    const [diagnostics, pipelines, engagements] = await Promise.all([
      supabaseAdmin.from("tier3_diagnostics").select("id, company_name, industry, province, revenue_bracket, result").in("id", diagIds).then(r => r.data || []),
      supabaseAdmin.from("tier3_pipeline").select("diagnostic_id, stage, follow_up_date, contact_name, contact_email").in("diagnostic_id", diagIds).then(r => r.data || []),
      supabaseAdmin.from("tier3_engagements").select("diagnostic_id, status, fee_percentage").in("diagnostic_id", diagIds).then(r => r.data || []),
    ]);

    const pm: Record<string,any> = {}; for (const p of pipelines)   pm[p.diagnostic_id] = p;
    const em: Record<string,any> = {}; for (const e of engagements) em[e.diagnostic_id] = e;
    const dm: Record<string,any> = {}; for (const d of diagnostics) dm[d.id] = d;

    const clients = assignments.map((a:any) => {
      const diag   = dm[a.diagnostic_id] || {};
      const result = diag.result || {};
      return {
        diagnosticId:  a.diagnostic_id,
        assignedAt:    a.assigned_at,
        companyName:   diag.company_name || "Unknown",
        industry:      diag.industry,
        province:      diag.province,
        pipeline:      pm[a.diagnostic_id] || null,
        engagement:    em[a.diagnostic_id] || null,
        annualLeak:    result.totals?.annual_leaks ?? 0,
        findingsCount: (result.findings || []).length,
      };
    });

    return NextResponse.json({ success: true, clients });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
