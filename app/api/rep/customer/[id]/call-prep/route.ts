// =============================================================================
// POST /api/rep/customer/[id]/call-prep — AI-generated call prep sheet
// =============================================================================
// id = pipeline_id or diagnostic_id
// Returns: opening line, top 3 talking points, objection responses
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  const clientId = params.id;

  try {
    // Load client data (same logic as customer route)
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("company_name, industry, province, contact_name, annual_revenue, notes")
      .eq("id", clientId)
      .maybeSingle();

    const { data: pipeByDiag } = !pipe ? await supabaseAdmin
      .from("tier3_pipeline")
      .select("company_name, industry, province, contact_name, annual_revenue")
      .eq("diagnostic_id", clientId)
      .maybeSingle() : { data: null };

    const clientData = pipe || pipeByDiag;
    const companyName = clientData?.company_name || "the business";
    const contactName = clientData?.contact_name?.split(" ")[0] || "there";
    const industry    = clientData?.industry || "your industry";
    const province    = clientData?.province || "Canada";
    const revenue     = clientData?.annual_revenue;

    // Get top findings
    let findings: any[] = [];
    try {
      const { data: diagPipe } = await supabaseAdmin
        .from("tier3_pipeline")
        .select("diagnostic_id")
        .eq("id", clientId)
        .maybeSingle();

      if (diagPipe?.diagnostic_id) {
        const { data: diag } = await supabaseAdmin
          .from("tier3_diagnostics")
          .select("result")
          .eq("id", diagPipe.diagnostic_id)
          .single();
        findings = diag?.result?.findings?.slice(0, 3) || [];
      }

      if (!findings.length) {
        const { data: leaks } = await supabaseAdmin
          .from("detected_leaks")
          .select("title, annual_impact_max, category, severity")
          .eq("business_id", clientData?.company_name || "")
          .order("annual_impact_max", { ascending: false })
          .limit(3);
        findings = (leaks || []).map(l => ({
          title: l.title, impact_max: l.annual_impact_max, category: l.category,
        }));
      }
    } catch { /* non-fatal */ }

    const totalLeak = findings.reduce((s, f) => s + (f.impact_max || f.annual_impact || 0), 0);
    const top3 = findings.slice(0, 3);

    // Build call prep with AI
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    const findingsText = top3.map((f, i) =>
      (i+1) + ". " + (f.title || f.category || "Finding") + " - ~$" + ((f.impact_max || f.impact_min || 0)).toLocaleString() + "/yr"
    ).join("\n");

    const revenueText = revenue ? "Annual revenue: ~$" + revenue.toLocaleString() : "";

    const prompt = [
      "You are preparing a Fruxal recovery rep for a cold call to a Canadian business owner.",
      "",
      "BUSINESS PROFILE:",
      "Company: " + companyName,
      "Contact first name: " + contactName,
      "Industry: " + industry,
      "Province: " + province,
      revenueText,
      "Total estimated annual leak: $" + totalLeak.toLocaleString(),
      "",
      "TOP 3 FINDINGS:",
      findingsText,
      "",
      "FRUXAL MODEL: 12% contingency. No cost until money is recovered. We take 12%, they keep 88%.",
      "",
      "Generate a call prep sheet in JSON with these exact keys:",
      '{"opening":"2-3 sentence cold call opener using their name and biggest dollar amount","talkingPoints":[{"point":"string","detail":"string"}],"objections":[{"objection":"string","response":"string"}],"closingAsk":"string"}',
      "",
      "Respond with ONLY the JSON, no other text.",
    ].filter(Boolean).join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await res.json();
    const raw = aiData.content?.[0]?.text || "{}";
    const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let callPrep;
    try { callPrep = JSON.parse(clean); }
    catch { callPrep = { opening: raw, talkingPoints: [], objections: [], closingAsk: "" }; }

    return NextResponse.json({
      success: true,
      callPrep,
      context: { companyName, contactName, industry, province, totalLeak, findingsCount: top3.length },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
