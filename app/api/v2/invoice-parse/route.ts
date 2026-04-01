// =============================================================================
// POST /api/v2/invoice-parse — AI Vendor Invoice Analyzer
// =============================================================================
// Customer forwards a vendor invoice (insurance, processing, lease, SaaS).
// Claude extracts: current rate, contract terms, renewal date, cancellation window.
// Auto-compares against market rates from rate-intelligence.
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "File required" }, { status: 400 });
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });

    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_name, industry, province, country, annual_revenue")
      .eq("user_id", userId)
      .maybeSingle();

    const isUS = profile?.country === "US";

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const result = await callClaudeJSON<{
      vendor_name: string;
      invoice_type: "insurance" | "processing" | "lease" | "saas" | "telecom" | "utilities" | "professional_services" | "other";
      invoice_date: string | null;
      invoice_amount: number;
      billing_period: string | null;
      annual_cost: number;
      key_rates: Array<{ description: string; rate: string; amount: number }>;
      contract_terms: {
        start_date: string | null;
        end_date: string | null;
        renewal_date: string | null;
        cancellation_window: string | null;
        auto_renew: boolean | null;
        notice_period: string | null;
      };
      market_comparison: {
        current_rate: string;
        market_low: string;
        market_median: string;
        potential_annual_savings: number;
        recommendation: string;
      };
      red_flags: string[];
      confidence: "high" | "medium" | "low";
    }>({
      system: `You are a vendor invoice analysis engine for ${isUS ? "US" : "Canadian"} small businesses.

Extract all key data from this invoice and compare against market rates.

Business context: ${profile?.business_name || "Unknown"} (${profile?.industry || "Unknown"}, ${profile?.province || "?"} ${profile?.country || "CA"}, $${(profile?.annual_revenue || 0).toLocaleString()} revenue)

Rules:
- Extract exact amounts and dates from the document
- For annual_cost: extrapolate monthly invoices to annual
- For market_comparison: use real market rate ranges for this business size and industry
- red_flags: late fees, auto-renewal traps, above-market rates, hidden charges, rate increases
- If you can't determine a field, use null
- confidence reflects how much of the invoice you could actually read

Return the specified JSON structure.`,
      user: `Analyze this vendor invoice. Filename: ${file.name}`,
      maxTokens: 1200,
    });

    // Store parsed invoice
    await supabaseAdmin.from("parsed_invoices").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      vendor_name: result.vendor_name,
      invoice_type: result.invoice_type,
      annual_cost: result.annual_cost,
      potential_savings: result.market_comparison?.potential_annual_savings || 0,
      extracted_data: result,
      filename: file.name,
      created_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.warn("[InvoiceParse] Insert:", error.message); });

    return NextResponse.json({ success: true, analysis: result });
  } catch (err: any) {
    console.error("[InvoiceParse]", err.message);
    return NextResponse.json({ error: "Invoice analysis failed" }, { status: 500 });
  }
}
