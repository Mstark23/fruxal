// =============================================================================
// lib/ai/task-generator.ts
// Second Claude call: converts diagnostic findings → structured task cards
// Called after diagnostic/run completes — never blocks the main response
// =============================================================================

import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { findSolutionsForTask } from "@/lib/solutions/matcher";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface DiagnosticTask {
  id?: string;
  business_id: string;
  report_id: string;
  title: string;
  action: string;
  why: string;
  savings_monthly: number;
  effort: "easy" | "medium" | "hard";
  time_to_implement: string;
  solution_name?: string;
  solution_url?: string;
  category: string;
  priority: number;
  status: "open" | "in_progress" | "done" | "dismissed";
}

function buildTaskPrompt(
  findings: any[],
  profile: any,
  tier: string,
  language: string
): string {
  const tierConfig = {
    solo: {
      maxTasks: 3,
      tone:
        "plain language, no jargon. Focus on easy wins the owner can do themselves.",
      context: "solo operator or small self-employed business",
    },
    business: {
      maxTasks: 8,
      tone:
        "ROI context, effort vs return trade-offs. Business owner with some staff.",
      context: "business with employees, looking for systematic improvements",
    },
    enterprise: {
      maxTasks: 12,
      tone:
        "Include CRA/SR&ED flags, accountant prep tasks, and high-value restructuring opportunities.",
      context: "enterprise business with complex tax and operational needs",
    },
  };

  const cfg = tierConfig[tier as keyof typeof tierConfig] || tierConfig.solo;
  const isFR = language === "fr";

  const findingsSummary = findings
    .slice(0, 15)
    .map(
      (f: any, i: number) =>
        `${i + 1}. ${f.title || f.finding} — ${f.severity || "medium"} severity — $${(f.potential_savings || f.annual_leak || 0).toLocaleString()}/yr — Category: ${f.category || "general"}`
    )
    .join("\n");

  return `You are a financial efficiency expert generating action tasks for a Canadian small business.

BUSINESS CONTEXT:
- Industry: ${profile.industry || "small business"}
- Province: ${profile.province || "QC"}
- Revenue: ~$${(((profile.annual_revenue ?? 0)) / 1000).toFixed(0)}K/year
- Tier: ${cfg.context}
- Language preference: ${isFR ? "French (respond in French)" : "English"}

FINDINGS TO CONVERT INTO TASKS:
${findingsSummary}

INSTRUCTIONS:
Generate up to ${cfg.maxTasks} prioritized tasks from these findings.
Tone: ${cfg.tone}
${tier === "enterprise" ? "Include at least 1 CRA/SR&ED or accountant task if relevant findings exist." : ""}

Output ONLY valid JSON — no preamble, no markdown fences, no explanation.
Return this exact structure:

{
  "tasks": [
    {
      "title": "short action-oriented title max 8 words",
      "action": "Exactly what to do in 2-3 plain sentences. Be specific.",
      "why": "One sentence explaining the financial impact.",
      "savings_monthly": 150,
      "effort": "easy",
      "time_to_implement": "20 minutes",
      "solution_name": "Name of specific tool or service if applicable, else null",
      "solution_url": "URL if applicable, else null",
      "category": "same category as the finding",
      "priority": 1
    }
  ]
}

Rules:
- savings_monthly must be a number (annual_savings / 12, rounded)
- effort must be exactly "easy", "medium", or "hard"
- priority starts at 1 (highest) — order by highest savings × ease of implementation
- solution_name should be a real Canadian-available tool (e.g. Helcim/Moneris for payments, Wave/Quickbooks for accounting, Wagepoint/Humi for payroll, Wealthsimple Tax for tax, Jobber for field service)
- For Canadian payment processing: Helcim saves 1-2% vs most processors
- For free accounting: Wave is excellent for SMBs
- For payroll: Wagepoint is purpose-built for Canadian businesses
- If French: title, action, why must be in French; all other fields stay in English`;
}

export async function generateTasksFromFindings(
  findings: any[],
  profile: any,
  tier: string,
  reportId: string,
  businessId: string,
  language: string = "en"
): Promise<DiagnosticTask[]> {
  if (!findings || findings.length === 0) return [];

  try {
    const prompt = buildTaskPrompt(findings, profile, tier, language);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system:
        "You are a financial efficiency expert. Output ONLY valid JSON. No markdown, no preamble, no explanation. Just the JSON object.",
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b: any) => b.type === "text") as
      | { type: "text"; text: string }
      | undefined;
    const rawText = textBlock?.text || "";

    // Sanitize: strip markdown fences, extract JSON object
    let jsonStr = rawText.replace(/```json\n?|```\n?/g, "").trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let parsed: { tasks: any[] };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("[TaskGenerator] JSON parse failed:", rawText.slice(0, 200));
      return [];
    }

    if (!Array.isArray(parsed?.tasks) || parsed.tasks.length === 0) return [];

    // Validate and sanitize each task
    const validEfforts = ["easy", "medium", "hard"] as const;
    const validStatuses = ["open", "in_progress", "done", "dismissed"] as const;

    const sanitized: DiagnosticTask[] = parsed.tasks
      .filter((t: any) => t.title && t.action)
      .map((t: any, i: number) => ({
        business_id: businessId,
        report_id: reportId,
        title: String(t.title).slice(0, 120),
        action: String(t.action).slice(0, 600),
        why: String(t.why || "").slice(0, 300),
        savings_monthly: Math.max(0, Math.round(Number(t.savings_monthly) ?? 0)),
        effort: validEfforts.includes(t.effort) ? t.effort : "medium",
        time_to_implement: String(t.time_to_implement || "1–2 hours").slice(0, 80),
        solution_name: t.solution_name ? String(t.solution_name).slice(0, 120) : undefined,
        solution_url: t.solution_url ? String(t.solution_url).slice(0, 300) : undefined,
        category: String(t.category || "general").slice(0, 80),
        priority: Math.max(1, Math.min(20, Number(t.priority) || i + 1)),
        status: "open" as const,
      }));

    if (sanitized.length === 0) return [];

    // Insert into database — use service role, non-blocking caller handles errors
    const rows = sanitized.map((t) => ({
      ...t,
      solution_name: t.solution_name || null,
      solution_url: t.solution_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error: insertErr } = await supabaseAdmin
      .from("diagnostic_tasks")
      .insert(rows);

    if (insertErr) {
      console.error("[TaskGenerator] DB insert failed:", insertErr.message);
      // Return tasks even if DB insert failed — caller may log
      return sanitized;
    }

    process.env.NODE_ENV !== "production" && console.log(
      `[TaskGenerator] ✅ ${sanitized.length} tasks created for report ${reportId}`
    );
    return sanitized;
  } catch (err: any) {
    console.error("[TaskGenerator] Error:", err?.message);
    return [];
  }
}
