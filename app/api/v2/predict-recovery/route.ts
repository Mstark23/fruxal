// =============================================================================
// POST /api/v2/predict-recovery — AI Recovery Prediction
// =============================================================================
// After 1-2 confirmed savings, Claude predicts which remaining leaks
// will actually recover based on patterns, data quality, and client engagement.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaudeJSON } from "@/lib/ai/client";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get all data
    const [profile, leaks, confirmed, documents] = await Promise.all([
      supabaseAdmin.from("business_profiles").select("business_name, industry, province, country, annual_revenue, employee_count, has_accountant").eq("user_id", userId).maybeSingle().then(r => r.data),
      supabaseAdmin.from("detected_leaks").select("id, title, category, severity, annual_impact_min, annual_impact_max, status, leak_type_code").eq("user_id", userId).then(r => r.data || []),
      supabaseAdmin.from("tier3_confirmed_findings").select("leak_name, category, confirmed_amount").eq("user_id", userId).then(r => r.data || []),
      supabaseAdmin.from("document_extractions").select("document_type, confidence").eq("user_id", userId).then(r => r.data || []),
    ]);

    if (!leaks.length) return NextResponse.json({ success: true, predictions: [], message: "No leaks to predict." });

    const confirmedCategories = new Set(confirmed.map(c => c.category));
    const docTypes = new Set(documents.map(d => d.document_type));
    const isUS = profile?.country === "US";

    const dataBlock = `
BUSINESS: ${profile?.business_name} (${profile?.industry}, ${profile?.province} ${profile?.country})
Revenue: $${(profile?.annual_revenue || 0).toLocaleString()}
Employees: ${profile?.employee_count ?? 0}
Has Accountant: ${profile?.has_accountant ? "Yes" : "No"}

DOCUMENTS UPLOADED: ${docTypes.size > 0 ? Array.from(docTypes).join(", ") : "None"}

CONFIRMED RECOVERIES:
${confirmed.map(c => `- ${c.leak_name} (${c.category}): $${c.confirmed_amount.toLocaleString()}`).join("\n") || "None yet."}

ALL DETECTED LEAKS:
${leaks.map(l => `- ${l.title} (${l.category}, ${l.severity}): $${(l.annual_impact_min || 0).toLocaleString()}-$${(l.annual_impact_max || 0).toLocaleString()}/yr [${l.status}]`).join("\n")}
`.trim();

    const result = await callClaudeJSON<{
      predictions: Array<{
        leak_title: string;
        recovery_probability: number; // 0-100
        predicted_recovery_amount: number;
        reasoning: string;
        next_step: string;
        documents_needed: string[];
      }>;
      total_predicted_recovery: number;
      confidence_note: string;
    }>({
      system: `You are a recovery prediction engine. Based on the client's confirmed recoveries, data quality, and leak profile, predict which remaining leaks will likely recover and how much.

Rules:
- Be conservative — predict LOWER than the estimated range
- Recovery probability 0-100: 80+ means near-certain, 50-79 means likely, 30-49 means possible, <30 means unlikely
- If a category already has a confirmed recovery, similar leaks in that category have HIGHER probability
- If relevant documents are uploaded (T2, financials), tax-related leaks have HIGHER probability
- If no documents uploaded, lower all probabilities by 20%
- If business has an accountant, tax leaks are slightly lower probability (they may already be handled)
- Be specific about what documents would increase probability
- Country: ${isUS ? "US" : "Canada"}

Return JSON:
{
  "predictions": [{ "leak_title", "recovery_probability", "predicted_recovery_amount", "reasoning", "next_step", "documents_needed" }],
  "total_predicted_recovery": number,
  "confidence_note": "one sentence about overall prediction quality"
}`,
      user: dataBlock,
      maxTokens: 1500,
    });

    return NextResponse.json({
      success: true,
      predictions: result.predictions || [],
      totalPredicted: result.total_predicted_recovery,
      confidenceNote: result.confidence_note,
    });
  } catch (err: any) {
    console.error("[PredictRecovery]", err.message);
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 });
  }
}
