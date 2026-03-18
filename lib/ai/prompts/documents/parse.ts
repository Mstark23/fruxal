// =============================================================================
// lib/ai/prompts/documents/parse.ts
//
// Document parsing prompts for financial document upload.
// Used by api/v2/diagnostic/parse-doc/route.ts.
// =============================================================================

export type DocType = "financials" | "gst" | "t4" | "bank" | "t2";

export const DOC_PROMPTS: Record<DocType, string> = {
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

  gst: `You are a Canadian tax document parser. Extract data from this GST/HST Return (GST34 or equivalent).
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
  "largest_recurring_expenses": [{ "description": "string", "amount": number }],
  "estimated_monthly_revenue": number,
  "estimated_monthly_expenses": number,
  "confidence": "high"|"medium"|"low",
  "notes": "any flags or issues noticed"
}
If a field is not present, use null. Never guess.`,

  t2: `You are a Canadian corporate tax parser. Extract data from this T2 Corporation Income Tax Return or T2 Schedule.
Return ONLY valid JSON, no markdown:
{
  "tax_year_end": "YYYY-MM-DD",
  "active_business_income": number,
  "investment_income": number,
  "total_income": number,
  "federal_tax_payable": number,
  "provincial_tax_payable": number,
  "sbd_claimed": number,
  "sred_claimed": number,
  "rdtoh_balance": number,
  "cda_balance": number,
  "net_income_after_tax": number,
  "confidence": "high"|"medium"|"low",
  "notes": "any flags or issues noticed"
}
If a field is not present, use null. Never guess.`,
};

export function getDocParsePrompt(docType: string): string {
  return DOC_PROMPTS[docType as DocType] ?? DOC_PROMPTS.financials;
}
