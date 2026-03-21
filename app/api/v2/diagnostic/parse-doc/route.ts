// =============================================================================
// app/api/v2/diagnostic/parse-doc/route.ts
// POST — Upload a business document (PDF/image), Claude extracts financial data.
// Returns structured JSON that feeds into the diagnostic.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60; // Vercel function timeout (seconds)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const DOC_PROMPTS: Record<string, string> = {
  t2: `You are a Canadian tax document parser. Extract data from this T2 Corporate Tax Return.
Return ONLY valid JSON, no markdown:
{
  "tax_year": number,
  "net_income_before_tax": number,
  "taxable_income": number,
  "total_tax_payable": number,
  "small_business_deduction": number,
  "sred_credit_claimed": number,
  "rdtoh_balance": number,
  "cda_balance": number,
  "passive_income": number,
  "active_business_income": number,
  "confidence": "high"|"medium"|"low",
  "notes": "any flags or issues noticed"
}
If a field is not present, use null. Never guess.`,

  financials: `You are a Canadian financial statement parser. Extract data from this financial statement (Notice to Reader, Review Engagement, or Audited Financials).
Return ONLY valid JSON, no markdown:
{
  "period_end": "YYYY-MM-DD",
  "total_revenue": number,
  "cost_of_goods_sold": number,
  "gross_profit": number,
  "gross_margin_pct": number,
  "total_operating_expenses": number,
  "ebitda": number,
  "net_income": number,
  "total_assets": number,
  "total_liabilities": number,
  "total_equity": number,
  "cash_and_equivalents": number,
  "accounts_receivable": number,
  "accounts_payable": number,
  "confidence": "high"|"medium"|"low",
  "notes": "any flags or issues noticed"
}
If a field is not present, use null. Never guess.`,

  gst: `You are a Canadian tax document parser. Extract data from this GST/HST Return (GST34).
Return ONLY valid JSON, no markdown:
{
  "reporting_period_start": "YYYY-MM-DD",
  "reporting_period_end": "YYYY-MM-DD",
  "total_sales_and_other_revenue": number,
  "gst_hst_collected": number,
  "input_tax_credits": number,
  "net_tax_remitted": number,
  "qst_collected": number,
  "quick_method": boolean,
  "confidence": "high"|"medium"|"low",
  "notes": "any flags or issues noticed"
}
If a field is not present, use null. Never guess.`,

  t4: `You are a Canadian tax document parser. Extract data from this T4 Summary (employer payroll summary).
Return ONLY valid JSON, no markdown:
{
  "tax_year": number,
  "number_of_t4s": number,
  "total_employment_income": number,
  "total_cpp_deducted": number,
  "total_ei_deducted": number,
  "total_income_tax_deducted": number,
  "employer_cpp_contribution": number,
  "employer_ei_premium": number,
  "total_remittances": number,
  "confidence": "high"|"medium"|"low",
  "notes": "any flags or issues noticed"
}
If a field is not present, use null. Never guess.`,

  bank: `You are a financial analyst. Extract key data from this bank statement.
Return ONLY valid JSON, no markdown:
{
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "total_credits": number,
  "total_debits": number,
  "average_daily_balance": number,
  "largest_recurring_expenses": [{ "description": string, "amount": number }],
  "estimated_monthly_revenue": number,
  "estimated_monthly_expenses": number,
  "confidence": "high"|"medium"|"low",
  "notes": "any flags or issues noticed"
}
If a field is not present, use null. Never guess.`,
};

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const docType = (formData.get("docType") as string) || "financials";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File too large (max 20MB)" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Unsupported file type. Upload PDF, JPG, or PNG." }, { status: 400 });
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mediaType = file.type as "application/pdf" | "image/jpeg" | "image/png" | "image/webp";

    const systemPrompt = DOC_PROMPTS[docType] || DOC_PROMPTS.financials;

    // Build content block depending on file type
    const contentBlock = mediaType === "application/pdf"
      ? { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 } }
      : { type: "image" as const, source: { type: "base64" as const, media_type: mediaType, data: base64 } };

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: [
          contentBlock as any,
          { type: "text", text: "Extract all financial data from this document. Return only valid JSON." }
        ],
      }],
    });

    const rawText = (response.content.find((b: any) => b.type === "text") as any)?.text || "{}";
    const jsonStr = rawText.replace(/```json\n?|```\n?/g, "").trim();

    let extracted: any = {};
    try {
      extracted = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ success: false, error: "Could not parse document — try a clearer scan" }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      docType,
      data: extracted,
      confidence: extracted.confidence || "medium",
      fileName: file.name,
    });

  } catch (err: any) {
    console.error("[parse-doc]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
