// =============================================================================
// POST /api/v2/scenario-model — AI "What-If" Scenario Analysis
// =============================================================================
// Customer asks: "What if I incorporate?" "What if I hire 3 people?"
// "What if I move to Alberta?" — Claude runs the numbers with their real data.
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

    const { scenario } = await req.json();
    if (!scenario?.trim()) return NextResponse.json({ error: "Scenario description required" }, { status: 400 });

    const [profile, leaks, obligations] = await Promise.all([
      supabaseAdmin.from("business_profiles").select("business_name, industry, province, country, annual_revenue, employee_count, business_structure, owner_salary, exact_annual_revenue, gross_margin_pct, net_income_last_year, has_accountant, has_holdco").eq("user_id", userId).maybeSingle().then(r => r.data),
      supabaseAdmin.from("detected_leaks").select("title, category, annual_impact_max, severity").eq("user_id", userId).order("annual_impact_max", { ascending: false }).limit(8).then(r => r.data || []),
      supabaseAdmin.from("user_obligations").select("obligation_slug, status, next_deadline").eq("user_id", userId).limit(10).then(r => r.data || []),
    ]);

    const country = profile?.country || "CA";
    const isUS = country === "US";
    const revenue = profile?.exact_annual_revenue || profile?.annual_revenue || 0;

    const result = await callClaudeJSON<{
      scenario_title: string;
      current_state: { description: string; annual_cost: number; tax_burden: number };
      projected_state: { description: string; annual_cost: number; tax_burden: number };
      net_impact: { annual_savings: number; one_time_cost: number; payback_months: number; risk_level: "low" | "medium" | "high" };
      new_obligations: string[];
      new_programs_eligible: string[];
      recommendation: string;
      caveats: string[];
    }>({
      system: `You are a financial scenario modeler for ${isUS ? "US" : "Canadian"} small businesses.

The client wants to know the financial impact of a business change. Use their ACTUAL data to model both states.

CURRENT BUSINESS STATE:
- Name: ${profile?.business_name || "Unknown"}
- Industry: ${profile?.industry || "Unknown"}
- Location: ${profile?.province}, ${country}
- Revenue: $${revenue.toLocaleString()}
- Employees: ${profile?.employee_count ?? 0}
- Structure: ${profile?.business_structure || "sole_proprietor"}
- Owner salary: ${profile?.owner_salary ? "$" + profile.owner_salary.toLocaleString() : "Unknown"}
- Gross margin: ${profile?.gross_margin_pct ? Math.round(profile.gross_margin_pct * 100) + "%" : "Unknown"}
- Net income: ${profile?.net_income_last_year ? "$" + profile.net_income_last_year.toLocaleString() : "Unknown"}
- Has holdco: ${profile?.has_holdco ? "Yes" : "No"}
- Has accountant: ${profile?.has_accountant ? "Yes" : "No"}

CURRENT LEAKS:
${leaks.map(l => `- ${l.title}: $${(l.annual_impact_max || 0).toLocaleString()}/yr`).join("\n") || "None detected."}

CURRENT OBLIGATIONS: ${obligations.length} active

Rules:
- Use ${isUS ? "US federal + state" : "Canadian federal + provincial"} tax rates for the math
- Be specific with dollar amounts — show the actual calculation
- Include one-time transition costs (legal, accounting, registration)
- Flag new compliance obligations the change would trigger
- Flag new programs they'd become eligible for
- Risk level: how complex/risky is this change to execute
- Caveats: what assumptions are you making
- payback_months: how long until the savings cover the transition cost

Return JSON with the structure specified.`,
      user: `Model this scenario: ${scenario}`,
      maxTokens: 1500,
    });

    return NextResponse.json({ success: true, model: result });
  } catch (err: any) {
    console.error("[ScenarioModel]", err.message);
    return NextResponse.json({ error: "Scenario modeling failed" }, { status: 500 });
  }
}
