// =============================================================================
// GET /api/v2/tax-calendar — Personalized 12-Month Tax & Compliance Calendar
// =============================================================================
// Based on their structure, province/state, incorporation date, fiscal year end.
// Claude generates every filing deadline, estimated payment, penalty for missing.
// Returns iCal-compatible events.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaudeJSON } from "@/lib/ai/client";

export const maxDuration = 20;

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [profile, obligations] = await Promise.all([
      supabaseAdmin.from("business_profiles").select("business_name, industry, province, country, business_structure, employee_count, fiscal_year_end_month, incorporation_date, gst_registration_date, has_payroll").eq("user_id", userId).maybeSingle().then(r => r.data),
      supabaseAdmin.from("user_obligations").select("obligation_slug, status, next_deadline, obligation_rules(title, category, penalty_max, frequency)").eq("user_id", userId).then(r => r.data || []),
    ]);

    if (!profile) return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });

    const country = profile.country || "CA";
    const isUS = country === "US";
    const now = new Date();
    const yearStart = now.getFullYear();

    const result = await callClaudeJSON<{
      events: Array<{
        title: string;
        date: string; // YYYY-MM-DD
        category: "tax_filing" | "payment" | "compliance" | "renewal" | "reporting";
        penalty_if_missed: number;
        description: string;
        government_body: string;
        recurring: "monthly" | "quarterly" | "annually" | "one_time";
      }>;
      total_penalties_at_risk: number;
    }>({
      system: `Generate a 12-month tax and compliance calendar for a ${isUS ? "US" : "Canadian"} small business.

BUSINESS PROFILE:
- Name: ${profile.business_name || "Business"}
- Structure: ${profile.business_structure || "corporation"}
- Location: ${profile.province}, ${country}
- Industry: ${profile.industry || "general"}
- Employees: ${profile.employee_count ?? 0}
- Has payroll: ${profile.has_payroll ? "Yes" : "No"}
- Fiscal year end: Month ${profile.fiscal_year_end_month || 12}
- Incorporated: ${profile.incorporation_date || "Unknown"}
${!isUS ? `- GST registered: ${profile.gst_registration_date || "Unknown"}` : ""}

EXISTING OBLIGATIONS TRACKED:
${(obligations as any[]).slice(0, 10).map(o => `- ${(o as any).obligation_rules?.title || o.obligation_slug}: ${o.next_deadline || "no date"} (${(o as any).obligation_rules?.frequency || "?"})`).join("\n") || "None tracked yet."}

Generate ALL relevant deadlines for the next 12 months starting from ${now.toISOString().split("T")[0]}.

Include:
${isUS ? `- Federal income tax (Form 1120/1120-S) filing + estimated payments (quarterly)
- State income tax filing (if applicable for ${profile.province})
- Sales tax filings (monthly/quarterly based on state)
- Payroll tax deposits (941) + annual (940)
- W-2/1099 filing deadlines
- State unemployment (SUTA) filings
- Workers comp audit
- Business license renewals
- Form 5500 (if applicable)` : `- Corporate tax (T2) filing deadline (6 months after fiscal year end)
- GST/HST filing (quarterly or annual based on revenue)
- Payroll remittances (monthly or quarterly based on size)
- T4/T5 slip filing deadlines
- Provincial corporate tax
- WSIB/CNESST premiums and reporting
- Business licence renewals
- Annual return filing
- Provincial sales tax (QST, PST) if applicable`}

Rules:
- Use EXACT dates based on their fiscal year end and province/state
- penalty_if_missed: use the actual statutory penalty (e.g., 5% + 1%/month for late T2)
- government_body: "CRA", "IRS", "Revenu Quebec", "[State] DOR", etc.
- Don't include events that don't apply to their structure/size
- Return events sorted by date

Return JSON: { events: [...], total_penalties_at_risk: number }`,
      user: `Generate the calendar for year ${yearStart}-${yearStart + 1}.`,
      maxTokens: 2000,
    });

    return NextResponse.json({
      success: true,
      events: result.events || [],
      totalPenaltyRisk: result.total_penalties_at_risk || 0,
      businessName: profile.business_name,
      country,
    });
  } catch (err: any) {
    console.error("[TaxCalendar]", err.message);
    return NextResponse.json({ error: "Calendar generation failed" }, { status: 500 });
  }
}
