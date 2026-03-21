import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, rateLimitResponse } from "@/lib/security";

export const maxDuration = 60; // Vercel function timeout (seconds)

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { max: 3, windowSeconds: 3600 });
  if (!rl.allowed) return rateLimitResponse();

  try {
    const { businessId, competitors } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const [{ data: biz }, { data: leaks }, { data: snapshot }] = await Promise.all([
      sb.from("businesses").select("*").eq("id", businessId).single(),
      sb.from("leaks").select("*").eq("businessId", businessId),
      sb.from("scan_snapshots").select("*").eq("businessId", businessId).order("scannedAt", { ascending: false }).limit(1).single(),
    ]);

    const open = (leaks || []).filter(l => l.status !== "FIXED" && l.status !== "fixed");
    const totalLeaking = open.reduce((s, l) => s + (l.annualImpact ?? 0), 0);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Algorithmic fallback
      const categories = [...new Set(open.map(l => l.category).filter(Boolean))];
      return NextResponse.json({
        analysis: {
          strengths: categories.length < 3 ? ["Low leak concentration — problems are focused, not systemic"] : [],
          weaknesses: categories.slice(0, 3).map(c => `${String(c).replace(/_/g, " ")} needs attention`),
          opportunities: ["Address top 3 leaks to recover $" + Math.round(open.slice(0, 3).reduce((s, l) => s + (l.annualImpact ?? 0), 0)).toLocaleString() + "/yr"],
          threats: totalLeaking > 50000 ? ["Total leakage exceeds $50K/yr — competitors with tighter operations have a cost advantage"] : [],
          recommendation: `Focus on ${String(categories[0] ?? "").replace(/_/g, " ") || "operational efficiency"} first. Quick wins available.`,
        },
      });
    }

    const prompt = `You are a business strategy consultant. Analyze this business's competitive position.

BUSINESS: ${biz?.name} (${biz?.industry})
HEALTH SCORE: ${snapshot?.healthScore ?? 0}/100
TOTAL LEAKING: $${(totalLeaking ?? 0).toLocaleString()}/yr
TOP LEAKS:
${open.slice(0, 10).map((l, i) => `${i + 1}. ${l.title} — $${l.annualImpact}/yr [${l.category}]`).join("\n")}
${competitors ? `\nCOMPETITORS MENTIONED: ${competitors}` : ""}

Return ONLY valid JSON:
{
  "strengths": ["3-5 competitive strengths based on which areas have NO leaks"],
  "weaknesses": ["3-5 competitive weaknesses from leak patterns"],
  "opportunities": ["3-5 actionable opportunities with $ estimates"],
  "threats": ["2-3 competitive threats if leaks aren't addressed"],
  "recommendation": "One-paragraph strategic recommendation",
  "competitiveGap": "How much competitors might be saving by NOT having these leaks",
  "urgentActions": ["Top 3 actions ranked by competitive impact"]
}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    let analysis: any = {};
    try { analysis = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { analysis = {}; }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
