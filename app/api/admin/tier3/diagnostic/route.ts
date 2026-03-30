// =============================================================================
// POST /api/admin/tier3/diagnostic
// AI-powered Tier 3 diagnostic — uses Claude to generate personalized analysis
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";

export const maxDuration = 60; // Vercel function timeout (seconds)


const REVENUE_LABELS: Record<string, string> = {
  "1M_5M": "$1M–$5M", "5M_20M": "$5M–$20M", "20M_50M": "$20M–$50M"
};

const PROVINCE_CONTEXT: Record<string, string> = {
  QC: "Quebec (dual GST/QST filing, Law 25 privacy, CNESST, Revenu Québec, French language requirements)",
  ON: "Ontario (HST, WSIB, Employment Standards Act, OHSA)",
  BC: "British Columbia (PST+GST, WorkSafeBC, Employment Standards Act)",
  AB: "Alberta (no provincial sales tax, WCB, Employment Standards Code)",
  MB: "Manitoba (RST+GST, WCB, Employment Standards Code)",
  NS: "Nova Scotia (HST at 15%, WCB Nova Scotia)",
  NB: "New Brunswick (HST at 15%, WorkSafeNB)",
  SK: "Saskatchewan (PST+GST, WCB Saskatchewan)",
  NL: "Newfoundland (HST at 15%, WorkplaceNL)",
  PE: "Prince Edward Island (HST at 15%, WCB PEI)",
  NT: "Northwest Territories (GST only, WSCC)",
  NU: "Nunavut (GST only, WSCC)",
  YT: "Yukon (GST only, WCB Yukon)",
};

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const body = await req.json();
    const { companyName, industry, revenueBracket, province, employeeCount, callAnswers, pipelineId } = body;

    if (!companyName || !industry || !revenueBracket || !province) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const ca = callAnswers || {};
    const revenueLabel = REVENUE_LABELS[revenueBracket] || revenueBracket;
    const provinceContext = PROVINCE_CONTEXT[province] || province;

    const prompt = `You are a senior Canadian CFO consultant conducting a confidential financial leak diagnostic for a mid-market business. Generate a detailed, highly specific diagnostic report.

COMPANY PROFILE:
- Company: ${companyName}
- Industry: ${industry}
- Annual Revenue: ${revenueLabel}
- Province: ${provinceContext}
- Employees: ${employeeCount || "unknown"}

DISCOVERY CALL ANSWERS:
- Vendor contracts last renegotiated: ${ca.vendorContractsLastRenegotiated || "not disclosed"}
- Tax structure last reviewed: ${ca.taxStructureLastReviewed || "not disclosed"}
- Benefits plan last rebid: ${ca.benefitsPlanLastRebid || "not disclosed"}
- Has dedicated CFO/Controller: ${ca.hasDedicatedCFO ? "Yes" : "No"}
- Primary bank: ${ca.primaryBank || "not disclosed"}
- Monthly SaaS spend: ${ca.monthlySaasSpend ? "$" + ca.monthlySaasSpend : "not disclosed"}
- Has claimed SR&ED: ${ca.claimedSRED ? "Yes" : "No"}
- Biggest pain point: ${ca.biggestPainPoint || "not disclosed"}

Generate exactly 8 financial leaks. For each leak:
- Use REAL Canadian tax law, CRA regulations, and provincial rules
- Reference actual programs: SR&ED, CEBA, CEWS, RRSP, IPP, CDA, RDTOH, LCGE, Law 25, WSIB/CNESST, etc.
- Dollar amounts must be REALISTIC for ${revenueLabel} revenue in ${province}
- Confidence must be justified by the call answers above
- Be SPECIFIC — name exact issues, not generic advice

Confidence rules:
- HIGH: Direct evidence from call answers (stale contracts, no CFO, unclaimed credits, pain point match)
- MEDIUM: Strong statistical likelihood for this industry/province/size
- SPECULATIVE: Possible but needs verification

Return ONLY valid JSON, no markdown, no explanation:

{
  "topLeaks": [
    {
      "rank": 1,
      "leak_id": "TAX-001",
      "category": "tax_structure",
      "name": "Specific leak name",
      "description": "2-3 sentence specific description referencing actual Canadian regulations and why this applies to ${companyName}",
      "estimatedLow": 45000,
      "estimatedHigh": 180000,
      "confidence": "HIGH",
      "confidenceReason": "Specific reason based on their call answers",
      "dataNeeded": ["Specific document 1", "Specific document 2", "Specific document 3"],
      "recoveryTimeline": "Specific timeline e.g. 60-90 days with CRA filing"
    }
  ],
  "summary": {
    "totalEstimatedLow": 0,
    "totalEstimatedHigh": 0,
    "highConfidenceCount": 0,
    "topCategory": "tax_structure",
    "feeRangeLow": 0,
    "feeRangeHigh": 0,
    "executiveSummary": "2-3 sentence executive summary specific to ${companyName} highlighting the biggest opportunity"
  }
}

Categories to use: tax_structure, vendor_procurement, payroll_hr, banking_treasury, insurance, saas_technology, compliance_penalties

Calculate totalEstimatedLow/High as sum of all leaks. feeRangeLow/High = 12% of total. highConfidenceCount = count of HIGH leaks.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.content[0] as any).text || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    let result: any = {}; try { result = JSON.parse(clean); } catch { result = {}; }

    // Add metadata
    result.companyName = companyName;
    result.industry = industry;
    result.province = province;
    result.revenueBracket = revenueBracket;
    result.generatedAt = new Date().toISOString();

    // Ensure topLeaks have rank
    result.topLeaks = result.topLeaks.map((l: any, i: number) => ({ ...l, rank: i + 1 }));

    // Save to tier3_diagnostics
    const recordId = crypto.randomUUID();
    const { data: diagData, error: diagError } = await supabaseAdmin
      .from("tier3_diagnostics")
      .insert({
        id: recordId,
        user_id: auth.userId,
        company_name: companyName,
        industry,
        province,
        revenue_bracket: revenueBracket,
        employee_count: Number(employeeCount) || 10,
        call_answers: callAnswers,
        result,
        status: "draft",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (diagError) throw new Error(diagError.message);
    const savedId = diagData?.id || recordId;

    // Link to pipeline and advance stage
    if (pipelineId) {
      await supabaseAdmin.from("tier3_pipeline")
        .update({ diagnostic_id: savedId, stage: "diagnostic_sent", updated_at: new Date().toISOString() })
        .eq("id", pipelineId);
    }

    return NextResponse.json({ success: true, id: savedId, result });

  } catch (err: any) {
    console.error("[AdminDiagnostic:POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
