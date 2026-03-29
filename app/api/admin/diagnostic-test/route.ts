// =============================================================================
// POST /api/admin/diagnostic-test
// Runs the paid diagnostic engine with a simulated profile — no real user needed
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60; // Vercel function timeout (seconds)


const PROVINCE_TAX_CONTEXT: Record<string, string> = {
  QC: "Quebec: SB corporate rate 12.2% (federal 9% + provincial 3.2%). Personal top rate 53.3%. QST 9.975% + GST 5%. Dual CRA + Revenu Québec. CNESST workers comp. Law 25 privacy. Bill 96 French. CCQ for construction.",
  ON: "Ontario: SB corporate rate 12.2%. Personal top rate 53.5%. HST 13%. WSIB workers comp. EHT on payroll >$1M. OHSA. ESA. AODA.",
  BC: "BC: SB corporate rate 11%. Personal top rate 53.5%. PST 7% + GST 5%. WorkSafeBC. PIPA privacy.",
  AB: "Alberta: SB corporate rate 11% — lowest in Canada. No provincial sales tax. WCB. No payroll tax.",
  MB: "Manitoba: SB corporate rate 9%. RST 7% + GST 5%. WCB.",
  NS: "Nova Scotia: SB corporate rate 14.5% — highest in Canada. HST 15%.",
  NB: "New Brunswick: HST 15%. SB corporate rate 12%. WorkSafeNB.",
  SK: "Saskatchewan: SB corporate rate 9%. PST 6% + GST 5%.",
  NL: "Newfoundland: HST 15%. SB corporate rate 15%.",
  PE: "PEI: HST 15%. SB corporate rate 9%.",
};

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const body = await req.json();
    const {
      businessName, industry, province, structure, monthlyRevenue,
      employees, hasAccountant, hasPayroll, handlesData,
      doesConstruction, doesRD, handlesFood, sellsAlcohol, language,
    } = body;

    const annualRevenue = (monthlyRevenue ?? 0) * 12;
    const estimatedPayroll = employees > 0 ? Math.round(annualRevenue * 0.35) : 0;
    const lang = language || "en";
    const taxCtx = PROVINCE_TAX_CONTEXT[province] || province;

    // Fetch real leak detectors from DB for this province
    let leakDetectors: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from("provincial_leak_detectors")
        .select("title, category, severity, annual_impact_min, annual_impact_max, solution_type, partner_slugs, program_slugs")
        .eq("province", province)
        .order("annual_impact_max", { ascending: false })
        .limit(25);
      leakDetectors = data || [];
    } catch { /* non-fatal */ }

    // Fetch real government programs
    let programs: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from("affiliate_partners")
        .select("name, sub_category, description, government_level")
        .eq("is_government_program", true)
        .contains("provinces", [province])
        .order("priority_score", { ascending: false })
        .limit(15);
      programs = data || [];
    } catch { /* non-fatal */ }

    const systemPrompt = `You are the Fruxal AI Diagnostic Engine — Canada's most precise financial leak detection system. You produce forensic-grade diagnostics that read like they were written by a $500/hr Canadian CPA and CFO consultant.

RULES:
1. Every finding must reference ACTUAL dollar amounts calculated from the business's real revenue.
2. Name real Canadian programs: SR&ED (T661), CEBA, RRSP vs IPP, CDA, RDTOH, LCGE ($971,190), CDAP ($15,000), BDC, EDC, provincial wage subsidies.
3. Use ONLY ${province} regulations — never apply other province rules.
4. Open the executive summary with the business name.
5. ${lang === "fr" ? "Provide both French AND English for all text fields." : "Provide both English AND French for all text fields."}
6. Respond with ONLY valid JSON. No markdown. No preamble.

JSON SCHEMA:
{
  "executive_summary": "string",
  "executive_summary_fr": "string",
  "overall_score": 0-100,
  "compliance_score": 0-100,
  "efficiency_score": 0-100,
  "optimization_score": 0-100,
  "growth_score": 0-100,
  "total_annual_leaks": number,
  "total_potential_savings": number,
  "total_penalty_exposure": number,
  "total_programs_value": number,
  "findings": [{
    "category": "tax|payroll|compliance|operations|insurance|contract|subscription|growth",
    "severity": "critical|high|medium|low",
    "title": "string",
    "title_fr": "string",
    "description": "string — specific dollar amounts, real regulation names",
    "description_fr": "string",
    "impact_min": number,
    "impact_max": number,
    "recommendation": "string — exact next steps, forms, agencies",
    "recommendation_fr": "string",
    "priority": 1-10,
    "timeline": "immediate|this_week|this_month|this_quarter|this_year",
    "difficulty": "easy|medium|hard",
    "solution_type": "free_fix|affiliate|professional|government_program",
    "partner_slugs": [],
    "program_slugs": []
  }],
  "action_plan": [{
    "priority": number,
    "title": "string",
    "title_fr": "string",
    "description": "string — step-by-step with forms and phone numbers",
    "description_fr": "string",
    "estimated_savings": number,
    "timeline": "Week 1|Week 2|Month 1|Quarter 1",
    "difficulty": "easy|medium|hard",
    "category": "quick_win|compliance_fix|optimization|growth"
  }],
  "risk_matrix": [{
    "area": "string",
    "area_fr": "string",
    "risk_level": "critical|high|medium|low",
    "likelihood": "certain|likely|possible|unlikely",
    "impact": "catastrophic|major|moderate|minor",
    "current_status": "string",
    "current_status_fr": "string",
    "recommendation": "string",
    "recommendation_fr": "string"
  }],
  "benchmark_comparisons": [{
    "metric": "string",
    "metric_fr": "string",
    "your_value": "string",
    "industry_avg": "string",
    "top_quartile": "string",
    "gap": "string",
    "gap_fr": "string",
    "recommendation": "string",
    "recommendation_fr": "string"
  }]
}`;

    const userPrompt = `BUSINESS: ${businessName}

PROFILE:
- Industry: ${industry}
- Province: ${province} — ${taxCtx}
- Structure: ${structure}
- Annual Revenue: $${(annualRevenue ?? 0).toLocaleString()} ($${(monthlyRevenue ?? 0).toLocaleString()}/mo)
- Employees: ${employees}
- Estimated payroll: ~$${(estimatedPayroll ?? 0).toLocaleString()}

FLAGS:
- Has accountant: ${hasAccountant ? "YES" : "NO — no professional financial oversight"}
- Has payroll: ${hasPayroll ? "YES" : "NO"}
- Handles customer data: ${handlesData ? "YES" : "NO"}
- Construction/trades: ${doesConstruction ? "YES" : "NO"}
- R&D: ${doesRD ? "YES" : "NO"}
- Food handling: ${handlesFood ? "YES" : "NO"}
- Alcohol sales: ${sellsAlcohol ? "YES" : "NO"}
- Structure tax note: ${structure === "sole_proprietor" && annualRevenue > 50000 ? `SOLE PROPRIETOR at $${annualRevenue.toLocaleString()} — paying personal marginal rates vs ${taxCtx} corporate SB rate — major tax drag` : "incorporated"}

LEAK DETECTORS FROM DATABASE (pre-matched to ${province}):
${leakDetectors.map(l => `- [${l.severity?.toUpperCase()}] ${l.title} | $${l.annual_impact_min?.toLocaleString()}–$${l.annual_impact_max?.toLocaleString()}/yr | ${l.solution_type}${l.partner_slugs ? ` | Partners: ${Array.isArray(l.partner_slugs) ? l.partner_slugs.join(",") : l.partner_slugs}` : ""}`).join("\n")}

GOVERNMENT PROGRAMS AVAILABLE (${province}):
${programs.map(p => `- ${p.name} [${p.government_level}] | ${p.sub_category} | ${p.description?.substring(0, 100)}`).join("\n")}

Generate 8-12 high-quality findings specific to ${businessName}. Calculate all dollar impacts from their $${(annualRevenue ?? 0).toLocaleString()} annual revenue. Reference the leak detectors and programs above directly. Include partner_slugs and program_slugs where applicable.

RESPOND WITH ONLY VALID JSON.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20251029",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = (response.content[0] as any).text || "";
    let clean = raw.replace(/```json|```/g, "").trim();
    
    // If JSON is truncated, try to close it
    let report: any;
    try {
      try { report = JSON.parse(clean); } catch { report = null; }
    } catch {
      // Attempt to salvage truncated JSON by closing open structures
      const lastBrace = clean.lastIndexOf('}');
      const lastBracket = clean.lastIndexOf(']');
      const lastValid = Math.max(lastBrace, lastBracket);
      if (lastValid > 0) {
        clean = clean.substring(0, lastValid + 1);
        // Count unclosed brackets and braces
        let opens = 0;
        for (const ch of clean) { if (ch === '{' || ch === '[') opens++; else if (ch === '}' || ch === ']') opens--; }
        while (opens > 0) { clean += '}'; opens--; }
        try { report = JSON.parse(clean); } catch { report = null; }
      } else {
        throw new Error("AI response was truncated — try again");
      }
    }

    return NextResponse.json({ success: true, report });

  } catch (err: any) {
    console.error("[DiagnosticTest]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
