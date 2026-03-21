import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const _ip_actplanRl = new Map<string, {c: number; r: number}>();
function ip_actplanCheck(ip: string): boolean {
  const now = Date.now();
  const e = _ip_actplanRl.get(ip);
  if (!e || e.r < now) { _ip_actplanRl.set(ip, {c: 1, r: now + 3600000}); return true; }
  e.c++; return e.c <= 10;
}



export const maxDuration = 60; // Vercel function timeout (seconds)

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const _ip_ip_actplan = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!ip_actplanCheck(_ip_ip_actplan)) return NextResponse.json({error: "Too many requests"}, {status: 429});
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    const { data: leaks } = await sb.from("leaks").select("*").eq("businessId", businessId).neq("status", "FIXED");
    const { data: biz } = await sb.from("businesses").select("*").eq("id", businessId).single();
    if (!leaks || leaks.length === 0) return NextResponse.json({ plan: null, message: "No open leaks to plan for" });

    const sorted = leaks.sort((a, b) => (b.annualImpact ?? 0) - (a.annualImpact ?? 0));
    const totalLeaking = sorted.reduce((s, l) => s + (l.annualImpact ?? 0), 0);

    // Generate plan using Claude if available, otherwise use rules-based approach
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      const prompt = `You are a business efficiency consultant. Generate a specific 30/60/90 day action plan for this business.

Business: ${biz?.name} (${biz?.industry})
Total leaking: $${(totalLeaking ?? 0).toLocaleString()}/yr

Open leaks (sorted by impact):
${sorted.slice(0, 15).map((l, i) => `${i+1}. ${l.title} — $${l.annualImpact?.toLocaleString()}/yr (${l.severity}) — Fix: ${l.fixAction}`).join("\n")}

Return ONLY valid JSON with this exact structure:
{
  "summary": "One sentence overview",
  "phases": [
    { "period": "Days 1-30", "title": "Quick Wins", "actions": [{ "leak": "leak title", "action": "specific step", "expectedSavings": 1000, "effort": "low" }] },
    { "period": "Days 31-60", "title": "Core Fixes", "actions": [...] },
    { "period": "Days 61-90", "title": "Optimization", "actions": [...] }
  ],
  "projectedSavings": { "month1": 0, "month3": 0, "month6": 0, "month12": 0 }
}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      try {
        const plan = JSON.parse(text.replace(/```json|```/g, "").trim());
        return NextResponse.json({ plan });
      } catch (e) { /* fall through to rules-based */ }
    }

    // Rules-based fallback
    const quickWins = sorted.filter(l => l.severity === "CRITICAL" || l.severity === "urgent").slice(0, 3);
    const coreFixes = sorted.filter(l => l.severity === "HIGH" || l.severity === "important").slice(0, 4);
    const optimization = sorted.filter(l => l.severity === "MEDIUM" || l.severity === "minor").slice(0, 3);

    const plan = {
      summary: `Fix ${sorted.length} leaks to recover up to $${(totalLeaking ?? 0).toLocaleString()}/yr in 90 days.`,
      phases: [
        { period: "Days 1-30", title: "Quick Wins", actions: quickWins.map(l => ({ leak: l.title, action: l.fixAction || "Address this leak", expectedSavings: l.annualImpact, effort: "low" })) },
        { period: "Days 31-60", title: "Core Fixes", actions: coreFixes.map(l => ({ leak: l.title, action: l.fixAction || "Address this leak", expectedSavings: l.annualImpact, effort: "medium" })) },
        { period: "Days 61-90", title: "Optimization", actions: optimization.map(l => ({ leak: l.title, action: l.fixAction || "Address this leak", expectedSavings: l.annualImpact, effort: "low" })) },
      ],
      projectedSavings: {
        month1: Math.round(quickWins.reduce((s, l) => s + l.annualImpact, 0)),
        month3: Math.round((quickWins.reduce((s, l) => s + l.annualImpact, 0) + coreFixes.reduce((s, l) => s + l.annualImpact, 0))),
        month6: Math.round(totalLeaking * 0.7),
        month12: Math.round(totalLeaking * 0.85),
      },
    };

    return NextResponse.json({ plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
