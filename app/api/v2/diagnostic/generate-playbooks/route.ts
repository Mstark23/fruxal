// =============================================================================
// POST /api/v2/diagnostic/generate-playbooks
// Called non-blocking after diagnostic completes.
// Reads findings from diagnostic_reports, calls Claude with execution prompt,
// stores one execution_playbooks row per finding.
//
// Auth: CRON_SECRET header (internal only — never called by client).
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Anthropic from "@anthropic-ai/sdk";
import { buildExecutionPrompt } from "@/lib/ai/prompts/diagnostic/execution";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // Internal auth — only callable from our own server
  const auth = req.headers.get("Authorization") || "";
  const secret = process.env.CRON_SECRET || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reportId, businessId, language = "en" } = await req.json();
    if (!reportId || !businessId) {
      return NextResponse.json({ success: false, error: "reportId + businessId required" }, { status: 400 });
    }

    // ── Fetch the diagnostic report ───────────────────────────────────────
    const { data: report } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, result_json, status")
      .eq("id", reportId)
      .single();

    if (!report || report.status !== "completed") {
      return NextResponse.json({ success: false, error: "Report not found or not completed" }, { status: 404 });
    }

    const findings = (report.result_json?.findings || []).filter((f: any) => f.id && f.title);
    if (findings.length === 0) {
      return NextResponse.json({ success: false, error: "No findings in report" }, { status: 422 });
    }

    // ── Fetch business context ─────────────────────────────────────────────
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_name, industry, province, exact_annual_revenue, annual_revenue, monthly_revenue, structure, has_accountant, owner_name")
      .eq("business_id", businessId)
      .single();

    const revenue =
      profile?.exact_annual_revenue ||
      profile?.annual_revenue ||
      (profile?.monthly_revenue ? profile.monthly_revenue * 12 : 0) || 0;

    const ctx = {
      business_name:  profile?.business_name  || "Client",
      industry:       profile?.industry        || "Business",
      province:       profile?.province        || "ON",
      annual_revenue: revenue,
      structure:      profile?.structure       || "corporation",
      has_accountant: profile?.has_accountant  ?? false,
      owner_name:     profile?.owner_name      || undefined,
    };

    // ── Skip if playbooks already generated for this report ──────────────
    const { count: existing } = await supabaseAdmin
      .from("execution_playbooks")
      .select("id", { count: "exact", head: true })
      .eq("diagnostic_report_id", reportId);

    if ((existing ?? 0) > 0) {
      return NextResponse.json({ success: true, skipped: true, message: "Playbooks already exist for this report" });
    }

    // ── Build prompt and call Claude ───────────────────────────────────────
    const systemPrompt = buildExecutionPrompt(findings, ctx, language);

    const response = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages:   [{ role: "user", content: "Generate the execution playbooks for all findings as a JSON array." }],
      system:     systemPrompt,
    });

    const textBlock = response.content.find((b: any) => b.type === "text") as { type: "text"; text: string } | undefined;
    const rawText   = textBlock?.text || "";
    const jsonStr   = rawText.replace(/```json\n?|```\n?/g, "").trim();
    const match     = jsonStr.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Claude returned no valid JSON array");

    const playbooks: any[] = JSON.parse(match[0]);

    // ── Map findings to playbooks and insert ───────────────────────────────
    const findingMap: Record<string, any> = {};
    for (const f of findings) findingMap[f.id] = f;

    const rows = playbooks.map((pb: any) => {
      const finding = findingMap[pb.finding_id] || {};
      return {
        diagnostic_report_id: reportId,
        business_id:          businessId,
        finding_id:           pb.finding_id,
        finding_title:        finding.title || pb.finding_id,
        category:             finding.category || "general",
        severity:             finding.severity || "medium",
        amount_recoverable:   finding.impact_max || 0,
        status:               "queued",
        execution_steps:      pb.execution_steps || [],
        documents_needed:     pb.documents_needed || [],
        draft_template:       pb.draft_template || "",
        cra_forms:            pb.cra_forms || [],
        who_executes:         pb.who_executes || "accountant",
        estimated_hours:      pb.estimated_hours || null,
        quick_win:            pb.quick_win || false,
        created_at:           new Date().toISOString(),
        updated_at:           new Date().toISOString(),
      };
    });

    const { error: insertErr } = await supabaseAdmin
      .from("execution_playbooks")
      .insert(rows);

    if (insertErr) throw insertErr;

    return NextResponse.json({
      success:         true,
      playbooks_created: rows.length,
      report_id:       reportId,
    });

  } catch (err: any) {
    console.error("[generate-playbooks]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
