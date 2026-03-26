import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  const clientId = params.id; // may be diagnostic_id OR pipeline_id
  const repId    = auth.repId!;

  try {
    // Try pipeline_id first (covers T1/T2), fallback to diagnostic_id (T3)
    let diag: any = null, pipeline: any = null, engagement: any = null;
    let userId: string | null = null;

    // 1. Try as pipeline_id
    const { data: pipeByPipeId } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();

    if (pipeByPipeId) {
      pipeline = pipeByPipeId;
      userId   = pipeline.user_id || null;

      // Try to find a diagnostic via pipeline
      if (pipeline.diagnostic_id) {
        const { data: diagFromPipe } = await supabaseAdmin
          .from("tier3_diagnostics")
          .select("id, company_name, industry, province, revenue_bracket, result, status, created_at")
          .eq("id", pipeline.diagnostic_id)
          .maybeSingle();
        diag = diagFromPipe;
      }

      // T1/T2: synthesize "diag-like" object from pipeline + business_profile
      if (!diag && userId) {
        const { data: profile } = await supabaseAdmin
          .from("business_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        // Load leaks from detected_leaks (T1/T2 source of truth)
        const { data: leakRows } = await supabaseAdmin
          .from("detected_leaks")
          .select("title, title_fr, severity, category, annual_impact_min, annual_impact_max, status, savings_amount, leak_type_code")
          .eq("business_id", profile?.business_id || "")
          .order("annual_impact_max", { ascending: false });

        const findings = (leakRows || []).map((l: any) => ({
          title:       l.title || l.leak_type_code,
          title_fr:    l.title_fr || l.title,
          severity:    l.severity || "medium",
          category:    l.category || "general",
          impact_min:  l.annual_impact_min ?? 0,
          impact_max:  l.annual_impact_max ?? 0,
          status:      l.status || "detected",
          recommendation: null,
          action_items:   [],
          affiliates:     [],
        }));

        const totalLeak = findings.reduce((s: number, f: any) => s + (f.impact_max || f.impact_min || 0), 0);

        diag = {
          id:             pipeline.id,
          company_name:   pipeline.company_name || profile?.business_name || "Unknown",
          industry:       pipeline.industry  || profile?.industry  || null,
          province:       pipeline.province  || profile?.province  || null,
          revenue_bracket: null,
          status:         "active",
          created_at:     pipeline.created_at,
          result: {
            findings,
            totals: { annual_leaks: totalLeak },
            executive_summary: "",
            outreach_email: null,
          },
          _is_t1t2: true, // flag for rep UI
        };
      }

      // Load engagement if exists
      if (pipeline.diagnostic_id) {
        const { data: eng } = await supabaseAdmin
          .from("tier3_engagements")
          .select("*")
          .eq("diagnostic_id", pipeline.diagnostic_id)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        engagement = eng;
      }
    } else {
      // 2. Fallback: treat as diagnostic_id (T3 original flow)
      const [diagData, pipeData, engData] = await Promise.all([
        supabaseAdmin.from("tier3_diagnostics").select("id, company_name, industry, province, revenue_bracket, result, status, created_at").eq("id", clientId).single().then(r => r.data),
        supabaseAdmin.from("tier3_pipeline").select("*").eq("diagnostic_id", clientId).single().then(r => r.data),
        supabaseAdmin.from("tier3_engagements").select("*").eq("diagnostic_id", clientId).order("started_at", { ascending: false }).limit(1).single().then(r => r.data),
      ]);
      diag = diagData; pipeline = pipeData; engagement = engData;
    }

    if (!diag) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let documents: any[] = [], confirmedFindings: any[] = [];
    if (engagement?.id) {
      [documents, confirmedFindings] = await Promise.all([
        supabaseAdmin.from("tier3_engagement_documents").select("*").eq("engagement_id", engagement.id).order("created_at").then(r => r.data || []),
        supabaseAdmin.from("tier3_confirmed_findings").select("*").eq("engagement_id", engagement.id).order("confirmed_amount", { ascending: false }).then(r => r.data || []),
      ]);
    }

    const rep = auth.rep;

    const result = diag.result || {};
    const confirmedSavings = confirmedFindings.reduce((s: number, f: any) => s + (f.confirmed_amount ?? 0), 0);
    const feeOwed = engagement?.fee_percentage ? Math.round(confirmedSavings * (engagement.fee_percentage / 100)) : 0;
    const myCommission = feeOwed && rep?.commission_rate ? Math.round(feeOwed * (rep.commission_rate / 100)) : 0;

    return NextResponse.json({
      success: true,
      client: {
        diagnosticId:   diag.id,
        companyName:    diag.company_name,
        industry:       diag.industry,
        province:       diag.province,
        revenueBracket: diag.revenue_bracket,
        diagnostic: {
          status:        diag.status,
          scores:        result.scores || {},
          totals:        result.totals || {},
          findings:      (result.findings || []).sort((a: any, b: any) => (b.impact_max ?? 0) - (a.impact_max ?? 0)),
          execSummary:   result.executive_summary || "",
          outreachEmail: result.outreach_email || null,
        },
        pipeline: pipeline ? { id: pipeline.id, stage: pipeline.stage, updatedAt: pipeline.updated_at, followUpDate: pipeline.follow_up_date, contactName: pipeline.contact_name, contactEmail: pipeline.contact_email, contactPhone: pipeline.contact_phone, notes: pipeline.notes } : null,
        engagement: engagement ? { id: engagement.id, status: engagement.status, feePercentage: engagement.fee_percentage, docsTotal: documents.length, docsReceived: documents.filter((d: any) => d.status === "received" || d.status === "reviewed").length } : null,
        documents,
        confirmedFindings,
        savings: { confirmed: confirmedSavings, feeOwed, myCommission, commissionRate: rep?.commission_rate || 20 },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
