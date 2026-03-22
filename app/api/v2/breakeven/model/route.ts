// =============================================================================
// app/api/v2/breakeven/model/route.ts
// POST /api/v2/breakeven/model — instant numbers + Claude narrative
// Numbers computed in pure functions (no wait), narrative from Claude (~1-2s)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  calculateBreakEven,
  calculateSafetyMargin,
  modelDecision,
  safetyLabel,
  type DecisionInput,
} from "@/lib/ai/break-even-calculator";

export const maxDuration = 30;

function fmt(n: number) { return "$" + Math.round(n ?? 0).toLocaleString(); }

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const body = await req.json();
    const { businessId, decision } = body as { businessId: string; decision: DecisionInput };

    if (!businessId || !decision) {
      return NextResponse.json({ error: "businessId and decision required" }, { status: 400 });
    }

    // Fetch current break-even data
    const { data: be } = await supabaseAdmin
      .from("break_even_data")
      .select("fixed_rent,fixed_salaries,fixed_software,fixed_insurance,fixed_loan_payments,fixed_other,variable_labour_pct,variable_materials_pct,variable_processing_pct,variable_other_pct,current_revenue,break_even_revenue,safety_margin_pct")
      .eq("business_id", businessId)
      .maybeSingle();

    if (!be) return NextResponse.json({ error: "No break-even data. Set up costs first." }, { status: 404 });

    // Verify ownership
    const { data: biz } = await supabaseAdmin.from("businesses").select("id").eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
    const { data: prof } = biz ? { data: null } : await supabaseAdmin.from("business_profiles").select("business_id").eq("business_id", businessId).eq("user_id", userId).maybeSingle();
    if (!biz && !prof) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const currentFixed = (be.fixed_rent ?? 0) + (be.fixed_salaries ?? 0) + (be.fixed_software ?? 0) + (be.fixed_insurance ?? 0) + (be.fixed_loan_payments ?? 0) + (be.fixed_other ?? 0);
    const currentVariablePct = (be.variable_labour_pct ?? 0) + (be.variable_materials_pct ?? 0) + (be.variable_processing_pct ?? 0) + (be.variable_other_pct ?? 0);
    const currentRevenue = be.current_revenue ?? 0;
    const currentBreakEven = be.break_even_revenue ?? calculateBreakEven(currentFixed, currentVariablePct);

    // Instant scenario calculation (pure functions)
    const scenario = modelDecision(currentFixed, currentVariablePct, currentRevenue, decision);
    const currentSafety = calculateSafetyMargin(currentRevenue, currentBreakEven);

    // Claude narrative (2-3 sentences, plain language)
    let narrative = "";
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      const beforeLabel = safetyLabel(currentSafety.percentage);
      const afterLabel = safetyLabel(scenario.newSafetyMargin.percentage);
      const revenueGap = scenario.newBreakEven - scenario.newRevenue;

      const prompt = `A Canadian SMB owner is modelling this decision: "${decision.label}"

BEFORE:
- Fixed costs: ${fmt(currentFixed)}/month
- Variable costs: ${Math.round(currentVariablePct)}% of revenue
- Current revenue: ${fmt(currentRevenue)}/month
- Break-even: ${fmt(currentBreakEven)}/month
- Safety margin: ${fmt(currentSafety.amount)} (${currentSafety.percentage.toFixed(1)}%) — ${beforeLabel}

AFTER THIS DECISION:
- New break-even: ${fmt(scenario.newBreakEven)}/month (${scenario.breakEvenDelta >= 0 ? "+" : ""}${fmt(scenario.breakEvenDelta)})
- New revenue: ${fmt(scenario.newRevenue)}/month
- New safety margin: ${fmt(scenario.newSafetyMargin.amount)} (${scenario.newSafetyMargin.percentage.toFixed(1)}%) — ${afterLabel}
${revenueGap > 0 ? `- Revenue gap to cover: ${fmt(revenueGap)}/month needed` : ""}

Write a 2-3 sentence plain English assessment of this decision. No markdown, no bullet points, no preamble. Lead with the key number. End with the strategic implication.`;

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 150,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          narrative = data.content?.[0]?.text?.trim() || "";
        }
      } catch { /* non-fatal — numbers still shown */ }
    }

    return NextResponse.json({
      before: {
        breakEven: Math.round(currentBreakEven),
        revenue: Math.round(currentRevenue),
        safetyMargin: currentSafety,
        safetyLabel: safetyLabel(currentSafety.percentage),
      },
      after: {
        breakEven: scenario.newBreakEven,
        revenue: scenario.newRevenue,
        safetyMargin: scenario.newSafetyMargin,
        safetyLabel: safetyLabel(scenario.newSafetyMargin.percentage),
        breakEvenDelta: scenario.breakEvenDelta,
        revenueNeededForSafety: scenario.revenueNeededForSafety,
      },
      narrative,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
