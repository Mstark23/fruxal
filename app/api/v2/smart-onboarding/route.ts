// =============================================================================
// POST /api/v2/smart-onboarding — AI-Personalized Onboarding
// =============================================================================
// After prescan, Claude determines which intake questions matter MOST
// for this specific business and skips irrelevant ones.
// Returns a prioritized list of questions + reasons.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { callClaudeJSON } from "@/lib/ai/client";

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get prescan results
    const { data: prescan } = await supabaseAdmin
      .from("prescan_results")
      .select("result_json, input_snapshot, tier")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("industry, province, country, annual_revenue, employee_count, business_structure")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: leaks } = await supabaseAdmin
      .from("detected_leaks")
      .select("title, category, severity, annual_impact_max")
      .eq("user_id", userId)
      .order("annual_impact_max", { ascending: false })
      .limit(8);

    const country = profile?.country || (prescan?.input_snapshot as any)?.country || "CA";
    const isUS = country === "US";
    const industry = profile?.industry || (prescan?.input_snapshot as any)?.industry || "unknown";
    const revenue = profile?.annual_revenue || 0;
    const employees = profile?.employee_count ?? 0;

    const result = await callClaudeJSON<{
      priority_questions: Array<{
        field: string;
        question: string;
        question_fr?: string;
        reason: string;
        impact: "high" | "medium" | "low";
        data_type: "date" | "number" | "boolean" | "text" | "select";
        options?: string[];
      }>;
      skip_sections: string[];
      estimated_time_minutes: number;
    }>({
      system: `You are an onboarding optimization engine for a financial diagnostic platform.

Given a user's prescan results and detected leaks, determine which intake questions will have the HIGHEST impact on diagnostic accuracy.

Rules:
- Maximum 8 priority questions (users abandon if > 10 minutes)
- Skip questions irrelevant to their industry (e.g., don't ask about fleet for a consulting firm)
- If they have tax-related leaks, prioritize tax dates (incorporation, fiscal year end)
- If they have payroll leaks, prioritize employee data
- If they have vendor leaks, prioritize contract renewal dates
- Country: ${isUS ? "US — ask about state filing, FEIN, S-corp election date" : "Canada — ask about incorporation date, GST registration, fiscal year end"}
- Include question_fr for Canadian users (bilingual support)
- Return skip_sections for parts of onboarding that don't apply

Return JSON:
{
  "priority_questions": [{ "field", "question", "question_fr", "reason", "impact", "data_type", "options" }],
  "skip_sections": ["section names to skip"],
  "estimated_time_minutes": number
}`,
      user: `Industry: ${industry}
Revenue: $${revenue.toLocaleString()}
Employees: ${employees}
Structure: ${profile?.business_structure || "unknown"}
Location: ${profile?.province || "unknown"}, ${country}
Prescan tier: ${prescan?.tier || "solo"}

Top leaks detected:
${(leaks || []).map(l => `- ${l.title} (${l.category}, ${l.severity}): $${(l.annual_impact_max || 0).toLocaleString()}/yr`).join("\n") || "None yet."}

Current profile completeness:
- Industry: ${industry !== "unknown" ? "Set" : "Missing"}
- Province/State: ${profile?.province ? "Set" : "Missing"}
- Revenue: ${revenue > 0 ? "Set" : "Missing"}
- Employees: ${employees > 0 ? "Set" : "Missing"}
- Structure: ${profile?.business_structure ? "Set" : "Missing"}`,
      maxTokens: 1000,
    });

    return NextResponse.json({
      success: true,
      questions: result.priority_questions || [],
      skipSections: result.skip_sections || [],
      estimatedMinutes: result.estimated_time_minutes || 5,
    });
  } catch (err: any) {
    console.error("[SmartOnboarding]", err.message);
    return NextResponse.json({ error: "Onboarding optimization failed" }, { status: 500 });
  }
}
