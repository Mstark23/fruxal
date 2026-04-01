// =============================================================================
// GET /api/v2/revenue-forecast — AI Pipeline Revenue Forecaster (Admin)
// =============================================================================
// Analyzes all pipeline entries, stage velocity, rep conversion rates,
// seasonal patterns → predicts next month's revenue with confidence intervals.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaudeJSON } from "@/lib/ai/client";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const [pipeline, reps, commissions, invoices, recentConversions] = await Promise.all([
      supabaseAdmin.from("tier3_pipeline").select("id, stage, company_name, annual_revenue, created_at, updated_at").order("created_at", { ascending: false }).limit(100).then(r => r.data || []),
      supabaseAdmin.from("tier3_reps").select("id, name, commission_rate, status").eq("status", "active").then(r => r.data || []),
      supabaseAdmin.from("tier3_rep_commissions").select("commission_amount, status, created_at").order("created_at", { ascending: false }).limit(50).then(r => r.data || []),
      supabaseAdmin.from("fruxal_invoices").select("fee_amount, status, created_at").order("created_at", { ascending: false }).limit(30).then(r => r.data || []),
      supabaseAdmin.from("tier3_confirmed_findings").select("confirmed_amount, created_at").order("created_at", { ascending: false }).limit(50).then(r => r.data || []),
    ]);

    // Stage breakdown
    const stageCount: Record<string, { count: number; totalRevenue: number }> = {};
    for (const p of pipeline) {
      const s = p.stage || "lead";
      if (!stageCount[s]) stageCount[s] = { count: 0, totalRevenue: 0 };
      stageCount[s].count++;
      stageCount[s].totalRevenue += p.annual_revenue || 0;
    }

    // Recent revenue (last 3 months)
    const threeMonthsAgo = new Date(Date.now() - 90 * 86400000).toISOString();
    const recentInvoiceRevenue = invoices.filter(i => i.created_at >= threeMonthsAgo && i.status === "paid").reduce((s, i) => s + (i.fee_amount || 0), 0);
    const recentConfirmed = recentConversions.filter(c => c.created_at >= threeMonthsAgo).reduce((s, c) => s + (c.confirmed_amount || 0), 0);
    const avgMonthlyFee = Math.round(recentInvoiceRevenue / 3);

    // Conversion velocity: avg days from lead to in_engagement
    const engagedEntries = pipeline.filter(p => ["in_engagement", "recovery_tracking", "fee_collected", "completed"].includes(p.stage));
    const avgDaysToEngage = engagedEntries.length > 0
      ? Math.round(engagedEntries.reduce((s, p) => s + Math.floor((new Date(p.updated_at).getTime() - new Date(p.created_at).getTime()) / 86400000), 0) / engagedEntries.length)
      : 30;

    const dataBlock = `
PIPELINE BY STAGE:
${Object.entries(stageCount).map(([stage, { count, totalRevenue }]) => `- ${stage}: ${count} entries, $${totalRevenue.toLocaleString()} total revenue`).join("\n")}

REPS: ${reps.length} active
RECENT CONVERSIONS (last 90 days): $${recentConfirmed.toLocaleString()} confirmed savings
RECENT FEE REVENUE (last 90 days): $${recentInvoiceRevenue.toLocaleString()} (avg $${avgMonthlyFee.toLocaleString()}/month)
AVG DAYS TO ENGAGEMENT: ${avgDaysToEngage} days
PENDING COMMISSIONS: $${commissions.filter(c => c.status === "pending").reduce((s, c) => s + (c.commission_amount || 0), 0).toLocaleString()}
TOTAL PIPELINE ENTRIES: ${pipeline.length}
`.trim();

    const result = await callClaudeJSON<{
      forecast_30_days: { low: number; expected: number; high: number };
      forecast_90_days: { low: number; expected: number; high: number };
      confidence: "high" | "medium" | "low";
      assumptions: string[];
      risks: string[];
      opportunities: string[];
      stage_conversion_estimates: Array<{ from_stage: string; count: number; expected_conversions: number; expected_revenue: number }>;
    }>({
      system: `You are a revenue forecasting engine for a financial recovery SaaS platform.

The platform earns revenue from:
1. Contingency fees (12% of confirmed savings from client engagements)
2. Rep commissions are paid OUT of the fee (not additional revenue)

Analyze the pipeline and predict next-month and next-quarter revenue.

${dataBlock}

Rules:
- Use stage-based conversion probabilities:
  lead: 15%, contacted: 25%, called: 35%, call_booked: 50%, diagnostic_sent: 40%, agreement_out: 65%, signed: 80%, in_engagement: 90%, recovery_tracking: 95%
- Apply the 12% contingency fee to estimated annual leak × probability
- For revenue forecast: (sum of pipeline entries × stage probability × 12% × 1/12 for monthly)
- Be conservative on the low end, optimistic on the high end
- Confidence: "high" if 20+ pipeline entries + 3+ months of conversion data, "medium" if 10+, "low" otherwise
- risks: things that could make actual < forecast
- opportunities: things that could make actual > forecast

Return the specified JSON structure.`,
      user: "Generate the revenue forecast.",
      maxTokens: 1200,
    });

    return NextResponse.json({
      success: true,
      forecast: result,
      pipelineSummary: stageCount,
      avgMonthlyFee,
      avgDaysToEngage,
      activeReps: reps.length,
    });
  } catch (err: any) {
    console.error("[RevenueForecast]", err.message);
    return NextResponse.json({ error: "Forecast generation failed" }, { status: 500 });
  }
}
