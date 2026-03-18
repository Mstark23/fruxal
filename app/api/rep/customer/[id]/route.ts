import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const diagId = params.id;
  const repId  = req.nextUrl.searchParams.get("repId");

  try {
    const [diag, pipeline, engagement] = await Promise.all([
      supabaseAdmin.from("tier3_diagnostics").select("id, company_name, industry, province, revenue_bracket, result, status, created_at").eq("id", diagId).single().then(r => r.data),
      supabaseAdmin.from("tier3_pipeline").select("*").eq("diagnostic_id", diagId).single().then(r => r.data),
      supabaseAdmin.from("tier3_engagements").select("*").eq("diagnostic_id", diagId).order("started_at", { ascending: false }).limit(1).single().then(r => r.data),
    ]);

    if (!diag) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let documents: any[] = [], confirmedFindings: any[] = [];
    if (engagement?.id) {
      [documents, confirmedFindings] = await Promise.all([
        supabaseAdmin.from("tier3_engagement_documents").select("*").eq("engagement_id", engagement.id).order("created_at").then(r => r.data || []),
        supabaseAdmin.from("tier3_confirmed_findings").select("*").eq("engagement_id", engagement.id).order("confirmed_amount", { ascending: false }).then(r => r.data || []),
      ]);
    }

    let rep: any = null;
    if (repId) {
      const { data } = await supabaseAdmin.from("tier3_reps").select("commission_rate").eq("id", repId).single();
      rep = data;
    }

    const result = diag.result || {};
    const confirmedSavings = confirmedFindings.reduce((s: number, f: any) => s + (f.confirmed_amount || 0), 0);
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
          findings:      (result.findings || []).sort((a: any, b: any) => (b.impact_max || 0) - (a.impact_max || 0)),
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
