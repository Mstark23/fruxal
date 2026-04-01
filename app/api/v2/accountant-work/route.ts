// =============================================================================
// POST /api/v2/accountant-work — AI Accountant Work Product Generator
// =============================================================================
// Pre-drafts accountant deliverables: SR&ED narrative, Section 179 schedule,
// WOTC screening, compensation restructuring memo, etc.
// Accountant reviews + finalizes instead of writing from scratch.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaude } from "@/lib/ai/client";

export const maxDuration = 60;

const WORK_TYPES = [
  "sred_narrative",       // SR&ED claim narrative (CA)
  "rd_credit_narrative",  // R&D Credit documentation (US)
  "section_179_schedule", // Section 179 deduction schedule (US)
  "cca_schedule",         // Capital Cost Allowance schedule (CA)
  "compensation_memo",    // Owner compensation restructuring
  "wotc_screening",       // Work Opportunity Tax Credit screening (US)
  "entity_restructure",   // Corporate structure optimization memo
  "compliance_checklist", // Compliance gap analysis
] as const;

export async function POST(req: NextRequest) {
  try {
    // Auth: accountant session OR admin
    const body = await req.json();
    const { pipelineId, workType, findingIds, additionalContext } = body;

    if (!pipelineId || !workType) {
      return NextResponse.json({ error: "pipelineId and workType required" }, { status: 400 });
    }

    // Get full client context
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("user_id, company_name, industry, province, annual_revenue, contact_name")
      .eq("id", pipelineId)
      .single();

    if (!pipe) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

    const [profile, findings, extractions] = await Promise.all([
      supabaseAdmin.from("business_profiles").select("*").eq("user_id", pipe.user_id).maybeSingle().then(r => r.data),
      supabaseAdmin.from("detected_leaks").select("title, category, severity, annual_impact_min, annual_impact_max, description, status")
        .eq("user_id", pipe.user_id).order("annual_impact_max", { ascending: false }).limit(15).then(r => r.data || []),
      supabaseAdmin.from("document_extractions").select("document_type, extracted_data, confidence")
        .eq("user_id", pipe.user_id).order("created_at", { ascending: false }).limit(5).then(r => r.data || []),
    ]);

    const country = profile?.country || "CA";
    const isUS = country === "US";
    const revenue = profile?.exact_annual_revenue || profile?.annual_revenue || pipe.annual_revenue || 0;

    const clientContext = `
CLIENT: ${pipe.company_name}
Industry: ${pipe.industry || profile?.industry || "Unknown"}
Location: ${profile?.province || pipe.province}, ${country}
Revenue: $${revenue.toLocaleString()}
Employees: ${profile?.employee_count ?? "Unknown"}
Structure: ${profile?.business_structure || "Unknown"}
Owner Salary: ${profile?.owner_salary ? "$" + profile.owner_salary.toLocaleString() : "Unknown"}

DIAGNOSTIC FINDINGS:
${findings.slice(0, 10).map(f => `- ${f.title} (${f.severity}): $${(f.annual_impact_max || f.annual_impact_min || 0).toLocaleString()}/yr — ${f.description || ""}`).join("\n")}

DOCUMENT EXTRACTIONS:
${extractions.map(e => `- ${e.document_type} (${e.confidence} confidence): ${JSON.stringify(e.extracted_data).slice(0, 200)}`).join("\n") || "None uploaded yet."}

${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ""}
`.trim();

    const prompt = buildWorkPrompt(workType, isUS, clientContext);

    const result = await callClaude({
      system: `You are a senior ${isUS ? "CPA" : "CPA, CA"} preparing work products for client engagements.

Rules:
- Write as if you're the accountant preparing the document
- Use actual client data — never placeholder text
- Be technically precise — this will be reviewed by a qualified accountant
- Include section references (${isUS ? "IRC sections, Treasury Regulations" : "ITA sections, CRA bulletins, ITCs"})
- Mark any assumptions clearly as [ASSUMPTION: reason]
- Format with clear headers and numbered items
- Country: ${isUS ? "United States" : "Canada"}`,
      user: prompt,
      maxTokens: 3000,
    });

    // Store work product
    const wpId = crypto.randomUUID();
    await supabaseAdmin.from("accountant_work_products").insert({
      id: wpId,
      pipeline_id: pipelineId,
      work_type: workType,
      content: result.text,
      status: "draft",
      created_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.warn("[AccountantWork] Insert:", error.message); });

    return NextResponse.json({ success: true, workProductId: wpId, content: result.text, workType });
  } catch (err: any) {
    console.error("[AccountantWork]", err.message);
    return NextResponse.json({ error: "Work product generation failed" }, { status: 500 });
  }
}

function buildWorkPrompt(type: string, isUS: boolean, ctx: string): string {
  switch (type) {
    case "sred_narrative":
      return `Draft an SR&ED (Scientific Research & Experimental Development) claim narrative for this client.
${ctx}
Include: technological uncertainty, systematic investigation, advancement sought, work described. Follow CRA T661 format.`;

    case "rd_credit_narrative":
      return `Draft an R&D Tax Credit (IRC Section 41) documentation package for this client.
${ctx}
Include: qualified research activities, technological uncertainty, process of experimentation, business component test. Follow IRS four-part test format.`;

    case "section_179_schedule":
      return `Prepare a Section 179 deduction schedule for this client's eligible equipment and assets.
${ctx}
Include: asset list, placed-in-service dates, cost basis, Section 179 vs. MACRS comparison, phase-out thresholds.`;

    case "cca_schedule":
      return `Prepare a Capital Cost Allowance (CCA) schedule for this client.
${ctx}
Include: asset classes, UCC balances, half-year rule application, accelerated investment incentive eligibility. Reference CRA classes.`;

    case "compensation_memo":
      return `Draft an owner compensation restructuring memo for this client.
${ctx}
Analyze: salary vs. dividend mix, ${isUS ? "S-corp reasonable compensation, QBI deduction impact, SE tax optimization" : "salary vs. dividend tax efficiency, CPP optimization, CDA and RDTOH integration, passive income impact on SBD"}.
Include specific dollar recommendations with tax savings calculations.`;

    case "wotc_screening":
      return `Prepare a Work Opportunity Tax Credit (WOTC) screening questionnaire and eligibility assessment for this client.
${ctx}
Include: target group identification, hiring process modifications needed, Form 8850 timeline, estimated credit per eligible hire.`;

    case "entity_restructure":
      return `Draft a corporate structure optimization memo for this client.
${ctx}
Analyze current structure and recommend: ${isUS ? "S-corp vs C-corp vs LLC analysis, state nexus considerations, QSBS eligibility, holding company benefits" : "operating company + holdco analysis, LCGE planning, estate freeze considerations, inter-corporate dividend flow"}.`;

    case "compliance_checklist":
      return `Prepare a compliance gap analysis and remediation checklist for this client.
${ctx}
Cover: ${isUS ? "federal, state, payroll tax, 1099 reporting, sales tax nexus, employment law" : "federal, provincial, CRA remittances, T4/T5 reporting, HST/GST, employment standards, PIPEDA"} compliance areas.`;

    default:
      return `Prepare a professional work product for this client.\n${ctx}`;
  }
}
