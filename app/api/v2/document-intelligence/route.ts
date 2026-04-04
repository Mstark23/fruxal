// =============================================================================
// POST /api/v2/document-intelligence — AI Document Analysis
// =============================================================================
// Customer uploads T2, 1120, bank statement, or financial statement.
// Claude extracts actual numbers → updates business profile → re-scores leaks.
// This turns prescan estimates into confirmed findings.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/ai/client";

export const maxDuration = 60;

const DOC_TYPES = ["t2", "1120", "financials", "bank_statement", "gst_hst", "sales_tax", "t4", "w2", "1099", "payroll_summary"] as const;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("documentType") as string;

    if (!file) return NextResponse.json({ error: "File required" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });

    // Get user's business profile for context
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id, business_name, industry, province, country, annual_revenue")
      .eq("user_id", userId)
      .maybeSingle();

    const country = profile?.country || "CA";
    const isUS = country === "US";

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mediaType = file.type === "application/pdf" ? "application/pdf"
      : file.type.startsWith("image/") ? file.type
      : "application/pdf";

    // Build extraction prompt based on document type
    const extractionPrompt = buildExtractionPrompt(docType, isUS, profile);

    const systemPrompt = `You are a financial document analysis engine. Extract structured data from the uploaded document.
Return ONLY valid JSON. Be precise with numbers — use exact values from the document, never estimate.
If a field is not visible or not applicable, use null.
Country context: ${isUS ? "United States" : "Canada"}`;

    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: [
          {
            type: mediaType.startsWith("image/") ? "image" : "document",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: "text",
            text: extractionPrompt,
          },
        ],
      }],
    });

    const textBlock = response.content.find((b: any) => b.type === "text");
    const rawText = (textBlock as any)?.text || "";
    const clean = rawText.replace(/```json\n?|```\n?/g, "").trim();
    const result = JSON.parse(clean);

    // Store extraction result
    const extractionId = crypto.randomUUID();
    await supabaseAdmin.from("document_extractions").insert({
      id: extractionId,
      user_id: userId,
      business_id: profile?.business_id || null,
      document_type: docType,
      filename: file.name,
      extracted_data: result,
      confidence: result.confidence || "medium",
      created_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.warn("[DocIntel] Insert failed:", error.message); });

    // Auto-update business profile with extracted actuals
    const profileUpdates = buildProfileUpdates(result, docType, isUS);
    if (Object.keys(profileUpdates).length > 0 && profile?.business_id) {
      await supabaseAdmin.from("business_profiles")
        .update({ ...profileUpdates, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }

    // Generate insights — what did we learn that changes their diagnostic?
    const insights = generateInsights(result, docType, profile);

    return NextResponse.json({
      success: true,
      extractionId,
      documentType: docType,
      extractedData: result,
      profileUpdated: Object.keys(profileUpdates),
      insights,
    });
  } catch (err: any) {
    console.error("[DocIntel]", err.message);
    return NextResponse.json({ error: "Document analysis failed" }, { status: 500 });
  }
}

function buildExtractionPrompt(docType: string, isUS: boolean, profile: any): string {
  const base = `Analyze this document and extract the following data as JSON:\n\n`;

  if (docType === "t2" || docType === "1120") {
    return base + `Extract from this ${isUS ? "Form 1120/1120-S" : "T2 Corporate Tax Return"}:
{
  "tax_year": "YYYY",
  "gross_revenue": number or null,
  "net_income": number or null,
  "taxable_income": number or null,
  "total_tax_payable": number or null,
  "effective_tax_rate": number or null (as decimal, e.g. 0.15),
  ${isUS ? `"qbi_deduction": number or null,
  "section_179_claimed": number or null,
  "r_and_d_credit": number or null,
  "wotc_credit": number or null,
  "state_tax": number or null,` : `"small_business_deduction": number or null,
  "sred_credit": number or null,
  "cda_balance": number or null,
  "rdtoh_balance": number or null,
  "passive_income": number or null,
  "active_income": number or null,`}
  "total_deductions": number or null,
  "depreciation_claimed": number or null,
  "owner_compensation": number or null,
  "confidence": "high" | "medium" | "low",
  "notes": "any observations about missed opportunities"
}`;
  }

  if (docType === "financials") {
    return base + `Extract from this financial statement:
{
  "period": "description of period",
  "revenue": number or null,
  "cogs": number or null,
  "gross_profit": number or null,
  "gross_margin_pct": number or null (as decimal),
  "operating_expenses": number or null,
  "ebitda": number or null,
  "net_income": number or null,
  "total_assets": number or null,
  "total_liabilities": number or null,
  "equity": number or null,
  "accounts_receivable": number or null,
  "accounts_payable": number or null,
  "cash_and_equivalents": number or null,
  "current_ratio": number or null,
  "debt_to_equity": number or null,
  "confidence": "high" | "medium" | "low",
  "notes": "any red flags or observations"
}`;
  }

  if (docType === "bank_statement") {
    return base + `Extract from this bank statement:
{
  "period": "month/year",
  "opening_balance": number or null,
  "closing_balance": number or null,
  "total_deposits": number or null,
  "total_withdrawals": number or null,
  "average_daily_balance": number or null,
  "bank_fees": number or null,
  "interest_paid": number or null,
  "nsf_charges": number or null,
  "largest_recurring_expenses": [{"description": "string", "amount": number, "frequency": "monthly|weekly|one-time"}],
  "estimated_monthly_revenue": number or null,
  "confidence": "high" | "medium" | "low",
  "notes": "patterns noticed — high fees, irregular cash flow, etc."
}`;
  }

  if (docType === "payroll_summary" || docType === "t4" || docType === "w2") {
    return base + `Extract from this ${isUS ? "W-2/payroll" : "T4/payroll"} summary:
{
  "period": "YYYY or range",
  "total_employees": number or null,
  "total_employment_income": number or null,
  "total_employer_contributions": number or null,
  ${isUS ? `"total_fica": number or null,
  "total_futa": number or null,
  "total_state_unemployment": number or null,` : `"total_cpp_contributions": number or null,
  "total_ei_contributions": number or null,
  "total_wcb_premiums": number or null,`}
  "owner_salary": number or null,
  "highest_salary": number or null,
  "contractor_payments": number or null,
  "confidence": "high" | "medium" | "low",
  "notes": "any misclassification risks or optimization opportunities"
}`;
  }

  return base + `Extract all financial data from this document as structured JSON. Include: revenue, expenses, taxes, fees, balances, and any notable patterns. Add "confidence" and "notes" fields.`;
}

function buildProfileUpdates(extracted: any, docType: string, isUS: boolean): Record<string, any> {
  const updates: Record<string, any> = {};

  if (docType === "t2" || docType === "1120") {
    if (extracted.gross_revenue) updates.exact_annual_revenue = extracted.gross_revenue;
    if (extracted.net_income != null) updates.net_income_last_year = extracted.net_income;
    if (extracted.owner_compensation) updates.owner_salary = extracted.owner_compensation;
    if (extracted.effective_tax_rate) updates.effective_tax_rate = extracted.effective_tax_rate;
  }

  if (docType === "financials") {
    if (extracted.revenue) updates.exact_annual_revenue = extracted.revenue;
    if (extracted.gross_margin_pct) updates.gross_margin_pct = extracted.gross_margin_pct;
    if (extracted.ebitda) updates.ebitda_estimate = extracted.ebitda;
    if (extracted.net_income != null) updates.net_income_last_year = extracted.net_income;
  }

  if (docType === "payroll_summary" || docType === "t4" || docType === "w2") {
    if (extracted.total_employees) updates.employee_count = extracted.total_employees;
    if (extracted.total_employment_income) updates.exact_payroll_total = extracted.total_employment_income;
    if (extracted.owner_salary) updates.owner_salary = extracted.owner_salary;
  }

  return updates;
}

function generateInsights(extracted: any, docType: string, profile: any): string[] {
  const insights: string[] = [];

  if (docType === "t2" || docType === "1120") {
    if (extracted.depreciation_claimed === 0 || extracted.depreciation_claimed === null) {
      insights.push("No depreciation/CCA claimed — your rep should review equipment purchases for missed deductions.");
    }
    if (extracted.sred_credit === 0 && extracted.notes?.toLowerCase().includes("r&d")) {
      insights.push("No SR&ED credit claimed but R&D activity detected — this could be worth $10K-$100K+.");
    }
    if (extracted.effective_tax_rate && extracted.effective_tax_rate > 0.20) {
      insights.push(`Your effective tax rate (${Math.round(extracted.effective_tax_rate * 100)}%) is above the small business rate — structure optimization may help.`);
    }
  }

  if (docType === "financials") {
    if (extracted.gross_margin_pct && extracted.gross_margin_pct < 0.30) {
      insights.push(`Gross margin (${Math.round(extracted.gross_margin_pct * 100)}%) is below 30% — COGS review recommended.`);
    }
    if (extracted.accounts_receivable && extracted.revenue) {
      const dso = Math.round((extracted.accounts_receivable / extracted.revenue) * 365);
      if (dso > 45) insights.push(`DSO is ${dso} days — collections improvement could free up cash.`);
    }
  }

  if (docType === "bank_statement") {
    if (extracted.bank_fees && extracted.bank_fees > 50) {
      insights.push(`Bank fees of $${extracted.bank_fees}/month — comparing commercial accounts could save $${Math.round(extracted.bank_fees * 0.4 * 12)}/year.`);
    }
    if (extracted.nsf_charges && extracted.nsf_charges > 0) {
      insights.push(`NSF charges detected ($${extracted.nsf_charges}) — cash flow management or overdraft protection recommended.`);
    }
  }

  return insights;
}
