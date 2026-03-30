// =============================================================================
// GET  /api/agreement/[token] — Fetch agreement data for signature page
// POST /api/agreement/[token] — Record signature, advance pipeline to signed
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin }             from "@/lib/supabase-admin";
import { sendEmail }                 from "@/services/email/service";

export const maxDuration = 30;

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;
  try {
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, company_name, contact_name, contact_email, agreed_findings, report_id, agreement_token_expiry, stage, tier3_reps(name, email, contingency_rate, calendly_url)")
      .eq("agreement_token", token)
      .single();

    if (!pipe) return NextResponse.json({ success: false, error: "Invalid or expired link" }, { status: 404 });

    // Check expiry
    if (pipe.agreement_token_expiry && new Date(pipe.agreement_token_expiry) < new Date()) {
      return NextResponse.json({ success: false, error: "This link has expired. Contact your rep for a new one." }, { status: 410 });
    }

    // Already signed
    if (pipe.stage === "signed" || pipe.stage === "in_engagement" || pipe.stage === "recovery_tracking" || pipe.stage === "completed") {
      return NextResponse.json({ success: true, already_signed: true, company_name: pipe.company_name });
    }

    // Fetch agreed findings details
    let findings: any[] = [];
    let totalLeak = 0;
    if (pipe.report_id && pipe.agreed_findings?.length) {
      const { data: report } = await supabaseAdmin
        .from("diagnostic_reports")
        .select("result_json, total_annual_leaks")
        .eq("id", pipe.report_id)
        .single();
      const all = report?.result_json?.findings || [];
      findings = all.filter((f: any) => (pipe.agreed_findings as string[]).includes(f.id));
      totalLeak = findings.reduce((s: number, f: any) => s + (f.impact_max || 0), 0) || report?.total_annual_leaks || 0;
    }

    const rep = pipe.tier3_reps as any;
    return NextResponse.json({
      success: true,
      company_name:     pipe.company_name,
      contact_name:     pipe.contact_name,
      findings,
      total_recoverable: totalLeak,
      contingency_rate: rep?.contingency_rate ?? 12,
      rep_name:         rep?.name || "Fruxal",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;
  try {
    const { signatory_name, signatory_title, ip_address } = await req.json();
    if (!signatory_name) return NextResponse.json({ success: false, error: "Name required" }, { status: 400 });

    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, company_name, contact_email, agreement_token_expiry, stage, tier3_reps(name, email)")
      .eq("agreement_token", token)
      .single();

    if (!pipe) return NextResponse.json({ success: false, error: "Invalid link" }, { status: 404 });
    if (pipe.agreement_token_expiry && new Date(pipe.agreement_token_expiry) < new Date()) {
      return NextResponse.json({ success: false, error: "Link expired" }, { status: 410 });
    }
    if (["signed","in_engagement","completed"].includes(pipe.stage)) {
      return NextResponse.json({ success: true, already_signed: true });
    }

    const signedAt = new Date().toISOString();

    // Record signature
    await supabaseAdmin.from("tier3_pipeline").update({
      stage:             "signed",
      signed_at:         signedAt,
      signatory_name,
      signatory_title:   signatory_title || null,
      updated_at:        signedAt,
    }).eq("id", pipe.id);

    // Log in agreement table
    await supabaseAdmin.from("tier3_agreements").upsert({
      pipeline_id:       pipe.id,
      status:            "signed",
      signed_at:         signedAt,
      signatory_name,
      signatory_title:   signatory_title || null,
      ip_address:        ip_address || null,
      updated_at:        signedAt,
    }, { onConflict: "pipeline_id" });

    const rep = pipe.tier3_reps as any;
    const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";

    // Auto-create tier3_engagement and advance to in_engagement
    try {
      const { data: existingEng } = await supabaseAdmin
        .from("tier3_engagements")
        .select("id")
        .eq("pipeline_id", pipe.id)
        .maybeSingle();

      if (!existingEng) {
        // Fetch report data for scope
        const reportId = pipe.report_id || null;
        let scopeCategories: string[] = [];
        if (reportId) {
          const { data: report } = await supabaseAdmin
            .from("diagnostic_reports")
            .select("result_json")
            .eq("id", reportId)
            .single();
          const findings = report?.result_json?.findings || [];
          const cats = [...new Set(findings.map((f: any) => f.category).filter(Boolean))] as string[];
          scopeCategories = cats.slice(0, 5);
        }

        await supabaseAdmin.from("tier3_engagements").insert({
          pipeline_id:       pipe.id,
          report_id:         reportId,
          business_id:       pipe.business_id || null,
          status:            "active",
          fee_percentage:    rep?.contingency_rate || 12,
          scope_categories:  scopeCategories,
          started_at:        signedAt,
          created_at:        signedAt,
          updated_at:        signedAt,
        });

        // Advance pipeline to in_engagement
        await supabaseAdmin.from("tier3_pipeline").update({
          stage:      "in_engagement",
          updated_at: signedAt,
        }).eq("id", pipe.id);
      }
    } catch { /* non-fatal */ }

    // Auto-generate execution playbooks for accountant queue (non-blocking)
    if (pipe.report_id) {
      const playbookUrl = `${appUrl}/api/v2/diagnostic/generate-playbooks`;
      fetch(playbookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CRON_SECRET || ""}`,
        },
        body: JSON.stringify({
          reportId: pipe.report_id,
          businessId: pipe.business_id || pipe.id,
          language: "en",
        }),
      }).catch(e => console.warn("[Agreement] playbook generation failed (non-blocking):", e.message));
    }

    // Notify rep
    if (rep?.email) {
      await sendEmail({
        to:      rep.email,
        subject: `✅ ${pipe.company_name} signed — start engagement`,
        html:    `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;background:#f7f8fa">
<div style="max-width:480px;margin:0 auto;background:white;border-radius:12px;padding:28px;border:1px solid #E8E6E1">
  <p style="font-size:18px;font-weight:800;color:#1A1A18;margin:0 0 12px">Agreement signed 🎉</p>
  <p style="font-size:14px;color:#56554F;margin:0 0 8px"><strong>${pipe.company_name}</strong> just signed their engagement agreement.</p>
  <p style="font-size:13px;color:#8E8C85;margin:0 0 20px">Signed by: ${signatory_name}${signatory_title ? ` (${signatory_title})` : ""}</p>
  <a href="${appUrl}/rep/customer/${pipe.id}" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:13px;padding:12px 24px;border-radius:8px;text-decoration:none">Open Client File →</a>
</div></body></html>`,
      });
    }

    return NextResponse.json({ success: true, signed_at: signedAt });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
