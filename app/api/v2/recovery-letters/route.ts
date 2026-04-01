// =============================================================================
// POST /api/v2/recovery-letters — AI-Generated Recovery Documents
// =============================================================================
// Generates ready-to-send letters: vendor renegotiation, insurance rebid,
// CRA/IRS dispute, program application, lease renewal.
// Rep reviews + sends — customer never drafts themselves.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaude } from "@/lib/ai/client";

export const maxDuration = 30;

const LETTER_TYPES = [
  "vendor_renegotiation",
  "insurance_rebid",
  "lease_renewal",
  "processing_rate_negotiation",
  "cra_dispute",
  "irs_dispute",
  "program_application",
  "collections_followup",
] as const;

export async function POST(req: NextRequest) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { pipelineId, letterType, findingId, customInstructions } = await req.json();
    if (!pipelineId || !letterType) return NextResponse.json({ error: "pipelineId and letterType required" }, { status: 400 });

    // Get client data
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("user_id, company_name, contact_name, contact_email, industry, province, annual_revenue")
      .eq("id", pipelineId)
      .single();

    if (!pipe) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

    // Get business profile for country context
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("country, business_structure, exact_annual_revenue, employee_count")
      .eq("user_id", pipe.user_id)
      .maybeSingle();

    const country = profile?.country || "CA";
    const isUS = country === "US";

    // Get specific finding data if provided
    let finding: any = null;
    if (findingId) {
      const { data: f } = await supabaseAdmin
        .from("detected_leaks")
        .select("title, category, annual_impact_min, annual_impact_max, description")
        .eq("id", findingId)
        .maybeSingle();
      finding = f;
    }

    const repName = auth.rep?.name || "Your Fruxal Representative";
    const revenue = profile?.exact_annual_revenue || pipe.annual_revenue || 0;

    const systemPrompt = `You are a professional business letter writer working for Fruxal, a financial recovery firm.
Write letters that are:
- Professional but firm (not aggressive)
- Specific with real dollar amounts and business context
- Legally sound (not legal advice, but proper business correspondence)
- Ready to send with minimal editing
- Country-appropriate: ${isUS ? "US business norms, USD, federal/state references" : "Canadian business norms, CAD, CRA/provincial references"}

Return the letter as plain text with proper formatting (date, addresses, subject line, body, closing).
The letter is FROM ${pipe.company_name} (signed by ${pipe.contact_name || "the business owner"}).
It is NOT from Fruxal — we are helping them write it.`;

    const userPrompt = buildLetterPrompt(letterType, {
      companyName: pipe.company_name,
      contactName: pipe.contact_name,
      industry: pipe.industry,
      province: pipe.province,
      revenue,
      employees: profile?.employee_count,
      structure: profile?.business_structure,
      finding,
      isUS,
      customInstructions,
    });

    const result = await callClaude({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 1500,
    });

    // Save for audit trail
    await supabaseAdmin.from("recovery_letters").insert({
      id: crypto.randomUUID(),
      pipeline_id: pipelineId,
      rep_id: auth.repId,
      letter_type: letterType,
      finding_id: findingId || null,
      content: result.text,
      status: "draft",
      created_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.warn("[RecoveryLetters] Insert failed:", error.message); });

    return NextResponse.json({ success: true, letter: result.text, letterType });
  } catch (err: any) {
    console.error("[RecoveryLetters]", err.message);
    return NextResponse.json({ error: "Letter generation failed" }, { status: 500 });
  }
}

function buildLetterPrompt(type: string, ctx: any): string {
  const { companyName, contactName, industry, province, revenue, employees, finding, isUS, customInstructions } = ctx;
  const revStr = `$${(revenue || 0).toLocaleString()}`;
  const findingStr = finding ? `\nRelated finding: ${finding.title} — estimated impact $${(finding.annual_impact_max || finding.annual_impact_min || 0).toLocaleString()}/yr.\n${finding.description || ""}` : "";

  switch (type) {
    case "vendor_renegotiation":
      return `Write a vendor renegotiation letter for ${companyName} (${industry}, ${province}, ${revStr} revenue, ${employees || "small"} team).
They want to renegotiate pricing with a key vendor. The tone should be professional and cite market rates.${findingStr}
${customInstructions ? `Additional context: ${customInstructions}` : ""}
Include: current business relationship value, market rate comparison, specific ask, timeline for response.`;

    case "insurance_rebid":
      return `Write an insurance rebid request letter for ${companyName} (${industry}, ${province}, ${revStr} revenue).
They want to get competitive quotes on their commercial insurance.${findingStr}
${customInstructions ? `Additional context: ${customInstructions}` : ""}
Include: request for comprehensive quote, coverage requirements, current premium concern, deadline for response.`;

    case "processing_rate_negotiation":
      return `Write a payment processing rate negotiation letter for ${companyName} (${industry}, ${province}, ${revStr} revenue).
They want to reduce their card processing rates.${findingStr}
${customInstructions ? `Additional context: ${customInstructions}` : ""}
Include: current volume data, industry average rates, specific rate target, willingness to switch if terms aren't met.`;

    case "lease_renewal":
      return `Write a lease renewal negotiation letter for ${companyName} (${industry}, ${province}, ${revStr} revenue).${findingStr}
${customInstructions ? `Additional context: ${customInstructions}` : ""}
Include: tenancy history, market rate comparison, specific ask (rate reduction or TI), timeline.`;

    case "cra_dispute":
    case "irs_dispute":
      return `Write a ${isUS ? "IRS" : "CRA"} objection/dispute letter for ${companyName} (${industry}, ${province}).
They need to dispute an assessment or claim a missed credit/deduction.${findingStr}
${customInstructions ? `Additional context: ${customInstructions}` : ""}
Include: taxpayer information section, issue description, supporting rationale, specific relief requested, compliance history reference.`;

    case "program_application":
      return `Write a government program application cover letter for ${companyName} (${industry}, ${province}, ${revStr} revenue, ${employees || "small"} team).
They are applying for a ${isUS ? "federal/state" : "federal/provincial"} program or grant.${findingStr}
${customInstructions ? `Additional context: ${customInstructions}` : ""}
Include: company overview, eligibility justification, intended use of funds, projected impact.`;

    case "collections_followup":
      return `Write a professional collections follow-up letter for ${companyName}.
They have outstanding invoices from clients that are 30+ days overdue.${findingStr}
${customInstructions ? `Additional context: ${customInstructions}` : ""}
Tone: firm but professional. Include: outstanding amount, original terms, payment options, escalation timeline.`;

    default:
      return `Write a professional business letter for ${companyName} (${industry}, ${province}).${findingStr}\n${customInstructions || ""}`;
  }
}
