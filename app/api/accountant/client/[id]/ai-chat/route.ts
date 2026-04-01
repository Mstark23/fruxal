// =============================================================================
// POST /api/accountant/client/[id]/ai-chat — Accountant AI Assistant (per-client)
// =============================================================================
// The accountant's technical advisor for each client. Knows:
// - Full diagnostic findings with tax implications
// - Extracted document data (T2, financials, payroll)
// - Compliance exposure + penalty risk
// - Work products already generated
// - Client's corporate structure + owner compensation
//
// The accountant asks: "What's the SR&ED exposure here?"
//                      "Is the owner compensation optimal?"
//                      "What's missing from the CCA schedule?"
//                      "Draft the RDTOH recovery strategy"
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaude } from "@/lib/ai/client";

export const maxDuration = 30;

const _rl = new Map<string, { c: number; r: number }>();
function rlCheck(key: string): boolean {
  const now = Date.now(), e = _rl.get(key);
  if (!e || e.r < now) { _rl.set(key, { c: 1, r: now + 60000 }); return true; }
  return ++e.c <= 20;
}

// Auth: accountant session cookie
async function requireAccountant(req: NextRequest) {
  const session = req.cookies.get("fruxal_accountant_session")?.value;
  if (!session) return { authorized: false, accountantId: null };
  try {
    const { verifyToken } = await import("@/lib/accountant-auth");
    const payload = verifyToken(session);
    if (!payload?.accountantId || payload.type !== "session") return { authorized: false, accountantId: null };
    return { authorized: true, accountantId: payload.accountantId };
  } catch {
    return { authorized: false, accountantId: null };
  }
}

async function buildAccountantContext(clientId: string) {
  // clientId = pipeline_id
  const { data: pipe } = await supabaseAdmin
    .from("tier3_pipeline")
    .select("id, user_id, company_name, industry, province, annual_revenue, stage")
    .eq("id", clientId)
    .maybeSingle();

  if (!pipe) return null;

  const userId = pipe.user_id;

  const [profile, findings, extractions, documents, confirmedFindings, workProducts, obligations] = await Promise.all([
    userId ? supabaseAdmin.from("business_profiles").select("country, business_structure, exact_annual_revenue, employee_count, has_accountant, owner_salary, gross_margin_pct, net_income_last_year, ebitda_estimate, has_holdco, passive_income_over_50k, exit_horizon, lcge_eligible").eq("user_id", userId).maybeSingle().then(r => r.data) : null,
    supabaseAdmin.from("detected_leaks").select("title, severity, category, annual_impact_min, annual_impact_max, status, description, leak_type_code").eq("user_id", userId || "").order("annual_impact_max", { ascending: false }).limit(15).then(r => r.data || []),
    supabaseAdmin.from("document_extractions").select("document_type, extracted_data, confidence, created_at").eq("user_id", userId || "").order("created_at", { ascending: false }).limit(8).then(r => r.data || []),
    supabaseAdmin.from("tier3_engagement_documents").select("document_type, label, status").eq("engagement_id", pipe.id).then(r => r.data || []),
    supabaseAdmin.from("tier3_confirmed_findings").select("leak_name, category, confirmed_amount, confidence_note").eq("engagement_id", pipe.id).then(r => r.data || []),
    supabaseAdmin.from("accountant_work_products").select("work_type, status, created_at").eq("pipeline_id", pipe.id).order("created_at", { ascending: false }).limit(5).then(r => r.data || []),
    userId ? supabaseAdmin.from("user_obligations").select("obligation_slug, status, next_deadline, obligation_rules(title, penalty_max, category)").eq("user_id", userId).order("next_deadline").limit(10).then(r => r.data || []) : [],
  ]);

  const country = profile?.country || "CA";
  const isUS = country === "US";
  const revenue = profile?.exact_annual_revenue || pipe.annual_revenue || 0;

  // Separate tax findings from operational
  const taxFindings = findings.filter(f => ["tax_structure", "tax_credit", "tax_deduction", "compliance"].includes(f.category));
  const opsFindings = findings.filter(f => !["tax_structure", "tax_credit", "tax_deduction", "compliance"].includes(f.category));

  return `
CLIENT: ${pipe.company_name}
Industry: ${pipe.industry || "Unknown"} | Location: ${pipe.province}, ${country}
Revenue: $${revenue.toLocaleString()} | Net Income: ${profile?.net_income_last_year ? "$" + profile.net_income_last_year.toLocaleString() : "Unknown"}
EBITDA: ${profile?.ebitda_estimate ? "$" + profile.ebitda_estimate.toLocaleString() : "Unknown"}
Gross Margin: ${profile?.gross_margin_pct ? Math.round(profile.gross_margin_pct * 100) + "%" : "Unknown"}
Employees: ${profile?.employee_count ?? "Unknown"}
Structure: ${profile?.business_structure || "Unknown"}
Owner Salary: ${profile?.owner_salary ? "$" + profile.owner_salary.toLocaleString() : "Unknown"}
Has Holdco: ${profile?.has_holdco ? "Yes" : "No"}
${!isUS ? `Passive Income >$50K: ${profile?.passive_income_over_50k ? "Yes — SBD at risk" : "No"}
LCGE Eligible: ${profile?.lcge_eligible ?? "Unknown"}` : `Exit Horizon: ${profile?.exit_horizon || "Unknown"}`}

TAX-RELATED FINDINGS (${taxFindings.length}):
${taxFindings.map(f => `- [${f.severity?.toUpperCase()}] ${f.title}: $${(f.annual_impact_max || f.annual_impact_min || 0).toLocaleString()}/yr — ${f.description || ""}`).join("\n") || "None."}

OPERATIONAL FINDINGS (${opsFindings.length}):
${opsFindings.slice(0, 5).map(f => `- [${f.severity?.toUpperCase()}] ${f.title}: $${(f.annual_impact_max || f.annual_impact_min || 0).toLocaleString()}/yr`).join("\n") || "None."}

CONFIRMED RECOVERIES:
${confirmedFindings.map(f => `- ${f.leak_name}: $${f.confirmed_amount.toLocaleString()}`).join("\n") || "None yet."}

EXTRACTED DOCUMENT DATA:
${extractions.map(e => {
  const d = e.extracted_data as any;
  if (e.document_type === "t2" || e.document_type === "1120") {
    return `- ${e.document_type.toUpperCase()} (${e.confidence}): Revenue $${(d.gross_revenue||0).toLocaleString()}, Net $${(d.net_income||0).toLocaleString()}, Tax $${(d.total_tax_payable||0).toLocaleString()}, ETR ${d.effective_tax_rate ? Math.round(d.effective_tax_rate*100)+"%" : "?"}, Depreciation $${(d.depreciation_claimed||0).toLocaleString()}, ${isUS ? `QBI $${(d.qbi_deduction||0).toLocaleString()}, R&D $${(d.r_and_d_credit||0).toLocaleString()}` : `SBD $${(d.small_business_deduction||0).toLocaleString()}, SRED $${(d.sred_credit||0).toLocaleString()}, CDA $${(d.cda_balance||0).toLocaleString()}, RDTOH $${(d.rdtoh_balance||0).toLocaleString()}`}`;
  }
  if (e.document_type === "financials") {
    return `- Financials (${e.confidence}): Revenue $${(d.revenue||0).toLocaleString()}, COGS $${(d.cogs||0).toLocaleString()}, GM ${d.gross_margin_pct ? Math.round(d.gross_margin_pct*100)+"%" : "?"}, EBITDA $${(d.ebitda||0).toLocaleString()}, AR $${(d.accounts_receivable||0).toLocaleString()}, AP $${(d.accounts_payable||0).toLocaleString()}`;
  }
  return `- ${e.document_type} (${e.confidence}): ${JSON.stringify(d).slice(0, 150)}`;
}).join("\n") || "No documents extracted yet."}

DOCUMENTS: ${documents.filter((d: any) => d.status === "received" || d.status === "reviewed").length}/${documents.length} received
${documents.map(d => `- ${d.label || d.document_type}: ${d.status}`).join("\n") || "None requested."}

WORK PRODUCTS GENERATED:
${workProducts.map(w => `- ${w.work_type}: ${w.status}`).join("\n") || "None yet."}

COMPLIANCE OBLIGATIONS:
${(obligations as any[]).filter(o => o.status === "overdue" || o.next_deadline).slice(0, 5).map(o => `- ${(o as any).obligation_rules?.title || o.obligation_slug}: ${o.status === "overdue" ? "OVERDUE" : `Due ${o.next_deadline}`} — Penalty: $${((o as any).obligation_rules?.penalty_max || 0).toLocaleString()}`).join("\n") || "None flagged."}

COUNTRY: ${isUS ? "United States" : "Canada"}
TAX FRAMEWORK: ${isUS ? "IRC, Treasury Regulations, state tax codes" : "ITA, CRA bulletins, provincial tax acts"}
`.trim();
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAccountant(req);
  if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!rlCheck(auth.accountantId!)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { message, history } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const context = await buildAccountantContext(params.id);
    if (!context) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const systemPrompt = `You are a Fruxal AI Tax & Compliance Advisor — an expert assistant for the accountant reviewing this client.

You have the client's COMPLETE financial data below. Your job is to help the accountant:
1. Identify the highest-value tax optimization opportunities
2. Flag compliance risks and remediation steps
3. Draft technical work products (SR&ED narratives, CCA schedules, comp restructuring)
4. Analyze extracted document data for missed deductions or credits
5. Prioritize findings by confirmed recoverability

${context}

BEHAVIOR RULES:
- Respond as a senior CPA would to a colleague — technical, precise, concise.
- Reference specific ITA/IRC sections, CRA bulletins, or state tax codes.
- When analyzing tax structure, consider: entity type, owner compensation mix, passive income, SBD/QBI eligibility, holdco opportunities.
- When asked about a specific finding, assess: likelihood of recovery, documents needed, estimated timeline, and any risk factors.
- If document data contradicts prescan estimates, note the discrepancy and recommend which number to use.
- For work product requests, draft the actual content — not an outline.
- If data is insufficient for a definitive answer, state what's missing and how to get it.
- Keep responses to 3-6 sentences unless drafting a work product.
- Never use hedging language like "you might want to consider" — be direct: "Claim the CCA. Here's why."`;

    const conversationHistory = (history || []).slice(-6);
    const userContent = conversationHistory.length > 0
      ? [...conversationHistory.map((m: any) => `${m.role === "assistant" ? "AI" : "Accountant"}: ${m.content}`), `Accountant: ${message}`].join("\n\n")
      : message;

    const result = await callClaude({
      system: systemPrompt,
      user: userContent,
      maxTokens: 1200,
    });

    return NextResponse.json({ success: true, message: result.text });
  } catch (err: any) {
    console.error("[Accountant:AI-Chat]", err.message);
    return NextResponse.json({ error: "AI assistant error" }, { status: 500 });
  }
}
