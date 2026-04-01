// =============================================================================
// POST /api/v2/rate-intelligence — AI Competitor Rate Analysis
// =============================================================================
// Analyzes customer's vendor invoices/rates and generates a market rate
// comparison showing exactly what they should be paying.
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

    const { category } = await req.json();
    // Categories: processing, insurance, banking, telecom, software, rent, payroll_services

    const [profile, leaks, extractions, snapshots] = await Promise.all([
      supabaseAdmin.from("business_profiles").select("business_name, industry, province, country, annual_revenue, employee_count").eq("user_id", userId).maybeSingle().then(r => r.data),
      supabaseAdmin.from("detected_leaks").select("title, category, annual_impact_min, annual_impact_max, description")
        .eq("user_id", userId).eq("category", category || "general").limit(5).then(r => r.data || []),
      supabaseAdmin.from("document_extractions").select("extracted_data, document_type")
        .eq("user_id", userId).order("created_at", { ascending: false }).limit(3).then(r => r.data || []),
      supabaseAdmin.from("financial_snapshots").select("processing_fees, insurance, bank_fees, software_costs, rent")
        .eq("business_id", profile?.business_name ? undefined : "").order("snapshot_month", { ascending: false }).limit(3).then(r => r.data || []),
    ]);

    const country = profile?.country || "CA";
    const isUS = country === "US";
    const revenue = profile?.annual_revenue || 0;

    const dataBlock = `
BUSINESS: ${profile?.business_name} (${profile?.industry}, ${profile?.province} ${country})
Revenue: $${revenue.toLocaleString()}
Employees: ${profile?.employee_count ?? 0}
Category requested: ${category || "all"}

DETECTED LEAKS IN THIS CATEGORY:
${leaks.map(l => `- ${l.title}: $${(l.annual_impact_max || l.annual_impact_min || 0).toLocaleString()}/yr — ${l.description || ""}`).join("\n") || "None."}

EXTRACTED DOCUMENT DATA:
${extractions.map(e => `- ${e.document_type}: ${JSON.stringify(e.extracted_data).slice(0, 300)}`).join("\n") || "None uploaded."}

RECENT MONTHLY COSTS:
${snapshots.map(s => `Processing: $${s.processing_fees||0} | Insurance: $${s.insurance||0} | Banking: $${s.bank_fees||0} | Software: $${s.software_costs||0} | Rent: $${s.rent||0}`).join("\n") || "No financial data available."}
`.trim();

    const result = await callClaudeJSON<{
      comparisons: Array<{
        expense_category: string;
        current_estimated_annual: number;
        market_rate_low: number;
        market_rate_median: number;
        market_rate_high: number;
        potential_savings: number;
        benchmark_source: string;
        recommendation: string;
      }>;
      total_potential_savings: number;
      data_quality: "high" | "medium" | "low";
      note: string;
    }>({
      system: `You are a market rate intelligence engine for ${isUS ? "US" : "Canadian"} small businesses.

Compare the client's current costs against market rates for businesses of similar size, industry, and location.

Rules:
- Use real market data ranges — not made up numbers
- ${isUS ? "Reference US market rates, state-specific where relevant" : "Reference Canadian market rates, province-specific where relevant"}
- Processing rates: Interchange+ ranges from 1.5-1.8% for negotiated, 2.4-2.9% for flat-rate platforms
- Insurance: Benchmark by industry classification code and claim history
- Banking: Commercial account fees range from $20-80/month for SMBs
- Software: Per-seat pricing varies; cite common alternatives
- Be honest about data quality — if you're estimating, say so
- potential_savings = current_estimated_annual - market_rate_median

Return JSON:
{
  "comparisons": [{ "expense_category", "current_estimated_annual", "market_rate_low", "market_rate_median", "market_rate_high", "potential_savings", "benchmark_source", "recommendation" }],
  "total_potential_savings": number,
  "data_quality": "high" | "medium" | "low",
  "note": "one sentence about reliability of these comparisons"
}`,
      user: dataBlock,
      maxTokens: 1500,
    });

    return NextResponse.json({
      success: true,
      comparisons: result.comparisons || [],
      totalSavings: result.total_potential_savings || 0,
      dataQuality: result.data_quality || "low",
      note: result.note,
    });
  } catch (err: any) {
    console.error("[RateIntel]", err.message);
    return NextResponse.json({ error: "Rate analysis failed" }, { status: 500 });
  }
}
