// =============================================================================
// lib/ai/goal-suggester.ts
// suggestGoal(businessId, userId, tier) — Claude-powered 90-day goal suggestion
// Safe fallback if Claude fails — never throws, always returns a suggestion
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";

export interface GoalSuggestion {
  goal_type:           "recovery_amount" | "score_improvement" | "tasks_completed";
  goal_title:          string;
  goal_description:    string;
  target_amount:       number | null;
  target_score:        number | null;
  target_count:        number | null;
  target_date:         string;    // ISO date string
  suggestion_rationale: string;
  was_suggested_by_claude: boolean;
}

function targetDate90Days(): string {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().split("T")[0];
}

function fmt(n: number) { return "$" + Math.round(n ?? 0).toLocaleString(); }

export async function suggestGoal(
  businessId: string,
  userId:     string,
  tier:       string
): Promise<GoalSuggestion | null> {
  try {
    // ── Assemble context ─────────────────────────────────────────────────────
    const [profileRow, openTasksRows, scoreRow, bizRow] = await Promise.all([
      supabaseAdmin
        .from("business_profiles")
        .select("industry, industry_label, province, employee_count")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .maybeSingle()
        .then(r => r.data),

      supabaseAdmin
        .from("diagnostic_tasks")
        .select("title, savings_monthly, effort")
        .eq("business_id", businessId)
        .in("status", ["open", "in_progress"])
        .order("savings_monthly", { ascending: false })
        .limit(10)
        .then(r => r.data ?? []),

      supabaseAdmin
        .from("score_history")
        .select("score")
        .eq("business_id", businessId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(r => r.data),

      supabaseAdmin
        .from("diagnostic_reports")
        .select("overall_score")
        .eq("business_id", businessId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(r => r.data),
    ]);

    const industry   = profileRow?.industry_label || profileRow?.industry || "small business";
    const province   = profileRow?.province || "Canada";
    const employees  = profileRow?.employee_count ?? 0;
    const openTasks  = openTasksRows as any[];
    const totalAvail = openTasks.reduce((s, t) => s + (t.savings_monthly ?? 0), 0);
    const currentScore = scoreRow?.score ?? bizRow?.overall_score ?? 0;
    const top3 = openTasks.slice(0, 3).map(t =>
      `${t.title} (${fmt(t.savings_monthly ?? 0)}/mo, ${t.effort})`
    ).join("; ");

    // Safe fallback (used if Claude fails)
    const fallbackAmount = Math.round(totalAvail * 0.35);
    const fallback: GoalSuggestion = {
      goal_type:           "recovery_amount",
      goal_title:          `Recover ${fmt(fallbackAmount)}/month in 90 days`,
      goal_description:    `Based on your open findings, recovering ${fmt(fallbackAmount)}/month is an achievable 90-day target. That's ${fmt(fallbackAmount * 12)}/year staying in your business.`,
      target_amount:       fallbackAmount,
      target_score:        null,
      target_count:        null,
      target_date:         targetDate90Days(),
      suggestion_rationale: `35% of available ${fmt(totalAvail)}/month in savings is realistic for 90 days.`,
      was_suggested_by_claude: false,
    };

    if (totalAvail === 0 && currentScore === 0) return fallback;

    // ── Build tier-aware prompt ───────────────────────────────────────────────
    const normalTier = (tier || "solo").toLowerCase();
    let userPrompt = "";

    if (normalTier === "enterprise") {
      userPrompt = `Business: ${industry} in ${province}, ${employees || "a team of"} employees
Available savings: ${fmt(totalAvail)}/month across ${openTasks.length} open tasks
Current score: ${currentScore}/100

Suggest ONE goal appropriate for a growth-stage business.
Enterprise businesses should aim for either a meaningful recovery amount (${fmt(Math.round(totalAvail * 0.45))}-${fmt(Math.round(totalAvail * 0.6))}/month) or a clear score milestone.`;
    } else if (normalTier === "business") {
      userPrompt = `Business: ${industry} in ${province}, ${employees || "some"} employees
Available savings: ${fmt(totalAvail)}/month across ${openTasks.length} open tasks
Current score: ${currentScore}/100
Top 3 tasks by value: ${top3 || "none yet"}

Suggest ONE ambitious but achievable goal for 90 days.
For a small business, ${fmt(Math.round(totalAvail * 0.35))}-${fmt(Math.round(totalAvail * 0.5))} in recovery or a score improvement of 10-15 points are both realistic.`;
    } else {
      userPrompt = `Business: ${industry} in ${province}
Available savings from findings: ${fmt(totalAvail)}/month total
Current score: ${currentScore}/100
Open tasks: ${openTasks.length}

Suggest ONE simple goal for the next 90 days.
For a solo operator, a recovery_amount goal of 30-50% of available savings (${fmt(Math.round(totalAvail * 0.3))}-${fmt(Math.round(totalAvail * 0.5))}/month) is realistic and motivating.`;
    }

    // ── Claude call ───────────────────────────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return fallback;

    let res;
    try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: `You are suggesting a realistic 90-day financial goal for a Canadian SMB owner based on their diagnostic results.

Rules:
- The goal must be specific, measurable, and achievable in 90 days
- Use dollar amounts — abstract goals don't motivate
- Base the goal on what is actually available in their findings
- Be encouraging but realistic — not too easy, not impossible
- Respond with JSON only, no preamble, no markdown fences:
{"goal_type":"recovery_amount"|"score_improvement"|"tasks_completed","goal_title":"...","goal_description":"...","target_amount":number|null,"target_score":number|null,"target_count":number|null,"suggestion_rationale":"..."}`,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    } catch { return fallback; }
    if (!res.ok) return fallback;
    const data = await res.json().catch(() => null);
    const raw = data?.content?.[0]?.text?.trim() ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: any;
    try { parsed = JSON.parse(cleaned); }
    catch { return fallback; }

    if (!parsed.goal_type || !parsed.goal_title) return fallback;

    return {
      goal_type:           parsed.goal_type,
      goal_title:          String(parsed.goal_title).slice(0, 80),
      goal_description:    String(parsed.goal_description || "").slice(0, 300),
      target_amount:       parsed.target_amount ?? null,
      target_score:        parsed.target_score ?? null,
      target_count:        parsed.target_count ?? null,
      target_date:         targetDate90Days(),
      suggestion_rationale: String(parsed.suggestion_rationale || "").slice(0, 200),
      was_suggested_by_claude: true,
    };
  } catch (err: any) {
    console.error("[suggestGoal] Error:", err?.message);
    return null;
  }
}
