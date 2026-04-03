// =============================================================================
// GET /api/rep/pipeline — Rep's full client list
// =============================================================================
// Supports both T3 (via diagnostic_id) and T1/T2 (via pipeline_id + user_id).
// Primary key for clients is now pipeline_id, not diagnostic_id.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const repId = auth.repId!;

    // All assignments for this rep — both T3 and T1/T2
    const { data: assignments } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("id, pipeline_id, diagnostic_id, assigned_at")
      .eq("rep_id", repId)
      .order("assigned_at", { ascending: false });

    if (!assignments?.length) return NextResponse.json({ success: true, clients: [] });

    const pipeIds  = assignments.map((a:any) => a.pipeline_id).filter(Boolean);
    const diagIds  = assignments.map((a:any) => a.diagnostic_id).filter(Boolean);

    const [pipelines, diagnostics, engagements] = await Promise.all([
      // Pipeline entries carry user_id, stage, company info for T1/T2
      pipeIds.length
        ? supabaseAdmin.from("tier3_pipeline")
            .select("id, diagnostic_id, user_id, stage, follow_up_date, contact_name, contact_email, company_name, industry, province, annual_revenue")
            .in("id", pipeIds)
            .then(r => r.data || [])
        : Promise.resolve([] as any[]),
      // T3 diagnostics for richer data
      diagIds.length
        ? supabaseAdmin.from("tier3_diagnostics")
            .select("id, company_name, industry, province, revenue_bracket, result")
            .in("id", diagIds)
            .then(r => r.data || [])
        : Promise.resolve([] as any[]),
      diagIds.length
        ? supabaseAdmin.from("tier3_engagements")
            .select("diagnostic_id, status, fee_percentage")
            .in("diagnostic_id", diagIds)
            .then(r => r.data || [])
        : Promise.resolve([] as any[]),
    ]);

    // Maps
    const pm: Record<string,any>  = {}; for (const p of pipelines)   pm[p.id]            = p;
    const dm: Record<string,any>  = {}; for (const d of diagnostics) dm[d.id]             = d;
    const em: Record<string,any>  = {}; for (const e of engagements) em[e.diagnostic_id]  = e;

    // Enrich: for T1/T2 users, pull business_profile + detected_leaks
    const userIds = pipelines.map((p:any) => p.user_id).filter(Boolean);
    const profileMap: Record<string,any> = {};
    const leakMap: Record<string,{ count: number; total: number }> = {};
    if (userIds.length) {
      const [profilesRes, leaksRes] = await Promise.all([
        supabaseAdmin
          .from("business_profiles")
          .select("user_id, business_name, business_id, industry, province, annual_revenue")
          .in("user_id", userIds),
        supabaseAdmin
          .from("detected_leaks")
          .select("user_id, annual_impact_max")
          .in("user_id", userIds),
      ]);
      for (const p of profilesRes.data || []) profileMap[p.user_id] = p;
      // Aggregate leaks per user
      for (const l of leaksRes.data || []) {
        if (!l.user_id) continue;
        if (!leakMap[l.user_id]) leakMap[l.user_id] = { count: 0, total: 0 };
        leakMap[l.user_id].count++;
        leakMap[l.user_id].total += l.annual_impact_max || 0;
      }
    }

    const clients = assignments.map((a:any) => {
      const pipe    = pm[a.pipeline_id] || null;
      const diag    = dm[a.diagnostic_id] || {};
      const result  = diag.result || {};
      const profile = pipe?.user_id ? (profileMap[pipe.user_id] || {}) : {};

      // Prefer T3 diagnostic data when available, fallback to pipeline/profile
      const companyName = diag.company_name || pipe?.company_name || profile.business_name || "Unknown";
      const industry    = diag.industry    || pipe?.industry    || profile.industry    || null;
      const province    = diag.province    || pipe?.province    || profile.province    || null;

      return {
        diagnosticId:  a.diagnostic_id || null,
        pipelineId:    a.pipeline_id   || null,
        userId:        pipe?.user_id   || null,
        assignedAt:    a.assigned_at,
        companyName,
        industry,
        province,
        pipeline:      pipe ? {
          id:            pipe.id,
          stage:         pipe.stage,
          followUpDate:  pipe.follow_up_date,
          contactName:   pipe.contact_name  || profile.business_name || null,
          contactEmail:  pipe.contact_email || null,
          notes:         (pipe as any).notes || null,
        } : null,
        engagement:    a.diagnostic_id ? (em[a.diagnostic_id] || null) : null,
        annualLeak:    result.totals?.annual_leaks ?? (pipe?.user_id ? leakMap[pipe.user_id]?.total ?? 0 : 0),
        findingsCount: (result.findings || []).length || (pipe?.user_id ? leakMap[pipe.user_id]?.count ?? 0 : 0),
      };
    });

    return NextResponse.json({ success: true, clients });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
