// =============================================================================
// POST /api/v2/anomaly-detect — AI Anomaly Detection
// =============================================================================
// Compares current month's QuickBooks/Plaid/Stripe data against prior months.
// Claude identifies unusual patterns: fee spikes, revenue drops, new charges.
// Called by cron or manually by rep.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaudeJSON } from "@/lib/ai/client";
import { buildVoiceBlock, FRUXAL_JSON_RULES } from "@/lib/ai/prompts/shared/voice";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { businessId } = await req.json().catch(() => ({ businessId: null }));

    // Get business profile
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id, business_name, industry, province, country, annual_revenue")
      .eq("user_id", userId)
      .maybeSingle();

    const bid = businessId || profile?.business_id;
    if (!bid) return NextResponse.json({ error: "No business found" }, { status: 400 });

    // Fetch last 6 months of financial snapshots
    const { data: snapshots } = await supabaseAdmin
      .from("financial_snapshots")
      .select("snapshot_month, revenue, total_expenses, processing_fees, payroll_total, rent, insurance, bank_fees, software_costs")
      .eq("business_id", bid)
      .order("snapshot_month", { ascending: false })
      .limit(6);

    // Fetch recent transactions from Plaid (if connected)
    const { data: recentTxns } = await supabaseAdmin
      .from("plaid_transactions")
      .select("date, amount, name, category")
      .eq("business_id", bid)
      .gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0])
      .order("amount", { ascending: false })
      .limit(20);

    if ((!snapshots || snapshots.length < 2) && (!recentTxns || recentTxns.length === 0)) {
      return NextResponse.json({
        success: true,
        anomalies: [],
        message: "Not enough data for anomaly detection. Connect QuickBooks or a bank account for monitoring.",
      });
    }

    const country = (profile?.country === "US" ? "US" : "CA") as "CA" | "US";
    const isUS = country === "US";
    const revenue = profile?.annual_revenue || 0;

    // Build analysis prompt
    const dataBlock = `
BUSINESS: ${profile?.business_name} (${profile?.industry}, ${profile?.province} ${profile?.country})
Annual Revenue: $${revenue.toLocaleString()}

MONTHLY SNAPSHOTS (most recent first):
${(snapshots || []).map(s => `${s.snapshot_month}: Rev $${(s.revenue||0).toLocaleString()} | Exp $${(s.total_expenses||0).toLocaleString()} | Processing $${(s.processing_fees||0).toLocaleString()} | Payroll $${(s.payroll_total||0).toLocaleString()} | Rent $${(s.rent||0).toLocaleString()} | Insurance $${(s.insurance||0).toLocaleString()} | Bank $${(s.bank_fees||0).toLocaleString()}`).join("\n") || "No snapshots available."}

RECENT TRANSACTIONS (last 30 days, largest first):
${(recentTxns || []).map(t => `${t.date}: ${t.name} — $${Math.abs(t.amount).toLocaleString()} (${t.category || "uncategorized"})`).join("\n") || "No transactions available."}
`.trim();

    const result = await callClaudeJSON<{
      anomalies: Array<{
        type: "spike" | "new_charge" | "revenue_drop" | "fee_increase" | "duplicate" | "pattern";
        title: string;
        description: string;
        estimated_impact: number;
        severity: "critical" | "high" | "medium" | "low";
        action: string;
      }>;
      summary: string;
    }>({
      system: buildVoiceBlock(country) + FRUXAL_JSON_RULES + `\nYou are a financial anomaly detection engine. Analyze the data and find REAL anomalies — not normal business fluctuations.

Rules:
- Only flag changes that are 15%+ above the prior 3-month average
- New recurring charges that didn't exist before ARE anomalies
- Revenue drops of 10%+ from trailing average ARE anomalies
- Duplicate charges or unusual vendors ARE anomalies
- Normal seasonal variation is NOT an anomaly
- Be specific with dollar amounts
- Return empty anomalies array if nothing unusual

Return JSON:
{
  "anomalies": [{ "type", "title", "description", "estimated_impact" (annual), "severity", "action" }],
  "summary": "one sentence overall assessment"
}`,
      user: dataBlock,
      maxTokens: 1200,
    });

    // Store anomalies
    if (result.anomalies?.length > 0) {
      await supabaseAdmin.from("anomaly_alerts").insert(
        result.anomalies.map(a => ({
          id: crypto.randomUUID(),
          business_id: bid,
          user_id: userId,
          type: a.type,
          title: a.title,
          description: a.description,
          estimated_impact: a.estimated_impact,
          severity: a.severity,
          action: a.action,
          status: "new",
          created_at: new Date().toISOString(),
        }))
      ).then(({ error }) => { if (error) console.warn("[AnomalyDetect] Insert failed:", error.message); });
    }

    return NextResponse.json({
      success: true,
      anomalies: result.anomalies || [],
      summary: result.summary,
    });
  } catch (err: any) {
    console.error("[AnomalyDetect]", err.message);
    return NextResponse.json({ error: "Anomaly detection failed" }, { status: 500 });
  }
}
