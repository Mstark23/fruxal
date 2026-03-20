// =============================================================================
// app/api/v2/diagnostic/run/route.ts
// POST { businessId, language? }
// Tiered AI diagnostic engine — solo / business / enterprise
//
// Logic extracted to:
//   lib/ai/tier.ts     — tier resolution + token limits
//   lib/ai/context.ts  — DB context fetching
//   lib/ai/prompts.ts  — system + user prompt builders
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken }        from "next-auth/jwt";
import { supabaseAdmin }   from "@/lib/supabase-admin";
import Anthropic           from "@anthropic-ai/sdk";
import crypto              from "crypto";
import { resolveTier, tierMaxTokens } from "@/lib/ai/tier";
import { fetchDiagnosticContext }      from "@/lib/ai/context";
import { buildSystemPrompt, buildUserPrompt, PromptInputs } from "@/lib/ai/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const maxDuration = 120;

// Per-user rate limiter for diagnostic runs
const _diagRl = new Map<string, { c: number; r: number }>();

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body       = await req.json();
    const { businessId } = body;
    const language: string = body.language || "en";

    if (!businessId) {
      return NextResponse.json({ success: false, error: "businessId required" }, { status: 400 });
    }

    // Prevent duplicate concurrent runs — if one is already analyzing, return it
    const { data: existingRun } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, status, created_at")
      .eq("business_id", businessId)
      .eq("status", "analyzing")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .catch(() => ({ data: null }));

    if (existingRun?.id) {
      const ageMs = Date.now() - new Date(existingRun.created_at).getTime();
      // If less than 3 minutes old, it's still running — return early
      if (ageMs < 180000) {
        return NextResponse.json({ success: true, reportId: existingRun.id, status: "analyzing" });
      }
      // Older than 3 min — stale, fall through and create a new one
    }

    // ── 1. Fetch profile ──────────────────────────────────────────────────
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("*")
      .eq("business_id", businessId)
      .single();

    if (!profile) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("billing_tier, tier")
      .eq("id", businessId)
      .maybeSingle();

    const tier     = resolveTier(profile, business);
    const isFr     = language === "fr";
    const province = profile.province || "ON";
    const employees = profile.employee_count || 0;

    // ── 2. Derived financials ─────────────────────────────────────────────
    // Revenue: QB actuals > intake exact > Stripe ARR > Plaid annualised > onboarding estimate
    const annualRevenue: number =
      profile.exact_annual_revenue ||
      profile.qb_revenue_ttm       ||
      profile.stripe_arr           ||
      (profile.plaid_revenue_90d ? Math.round(profile.plaid_revenue_90d * (12 / 3)) : 0) ||
      profile.annual_revenue       ||
      (profile.monthly_revenue ? profile.monthly_revenue * 12 : 0) ||
      0;

    const revenueSource = profile.doc_financials_data?.total_revenue  ? "verified financial statements (uploaded)"
      : profile.doc_t2_data?.net_income_before_tax                   ? "verified T2 return (uploaded)"
      : profile.exact_annual_revenue                                  ? "intake (exact)"
      : profile.qb_revenue_ttm                                        ? "QuickBooks TTM"
      : profile.stripe_arr                                            ? "Stripe ARR"
      : profile.plaid_revenue_90d                                     ? "Plaid 90d annualised"
      : profile.annual_revenue                                        ? "onboarding estimate"
      : "monthly x 12 estimate";

    // Gross margin: QB actuals > intake > industry default
    const grossMarginPct: number = profile.gross_margin_pct ??
      (profile.qb_revenue_ttm && profile.qb_gross_profit_ttm
        ? Math.round((profile.qb_gross_profit_ttm / profile.qb_revenue_ttm) * 100)
        : tier === "enterprise" ? 35 : tier === "business" ? 40 : 50);

    // EBITDA: intake > QB net income > Plaid-derived > estimate
    const estimatedEBITDA: number =
      profile.ebitda_estimate ||
      profile.qb_net_income_ttm ||
      (profile.plaid_revenue_90d && profile.plaid_expenses_90d
        ? Math.round((profile.plaid_revenue_90d - profile.plaid_expenses_90d) * 4)
        : 0) ||
      Math.round(annualRevenue * (grossMarginPct / 100) * 0.25);

    const ebitdaSource = profile.ebitda_estimate    ? "intake-provided"
      : profile.qb_net_income_ttm                   ? "QuickBooks net income TTM"
      : profile.plaid_revenue_90d                   ? "Plaid 90d net flows x4"
      : "estimated (gross margin x 25%)";

    // Payroll: QB actuals > intake > Plaid deposits > headcount estimate
    const estimatedPayroll: number =
      profile.exact_payroll_total ||
      profile.qb_payroll_ttm ||
      profile.plaid_payroll_deposits ||
      (employees > 0 ? Math.round(employees * 55_000) : 0);

    const estimatedTaxDrag: number = Math.round(
      annualRevenue * (tier === "enterprise" ? 0.027 : tier === "business" ? 0.031 : 0.038)
    );

    // ── 3. Fetch DB context ───────────────────────────────────────────────
    const ctx = await fetchDiagnosticContext(
      businessId,
      province,
      profile.industry_slug || profile.industry || "",
      tier,
      language
    );

    // ── 4. Build prompts ──────────────────────────────────────────────────
    const promptInputs: PromptInputs = {
      profile, tier, isFr, province, employees,
      annualRevenue,    revenueSource,
      grossMarginPct,   estimatedEBITDA,  ebitdaSource,
      estimatedPayroll, estimatedTaxDrag,
      ownerSalary:    profile.owner_salary          || 0,
      exactNetIncome: profile.net_income_last_year  || 0,
      exitHorizon:    profile.exit_horizon          || "unknown",
      lcgeEligible:   profile.lcge_eligible         ?? false,
      passiveOver50k: profile.passive_income_over_50k ?? false,
      hasHoldco:      profile.has_holdco            ?? false,
      rdtohBalance:   profile.rdtoh_balance         || 0,
      hasCDA:         profile.has_cda_balance       ?? false,
      sredLastYear:   profile.sred_claimed_last_year || 0,
      // QB/Plaid/Stripe signals — enriches diagnostic accuracy
      qbArOverdue:    profile.qb_ar_overdue_30 || 0,
      qbBankBalance:  profile.qb_bank_balance || profile.plaid_bank_balance_total || 0,
      qbTopExpenses:  profile.qb_top_expense_cats || [],
      plaidRecurring: profile.plaid_recurring_expenses || [],
      stripeChurnRate:  profile.stripe_churn_rate_pct || 0,
      stripeRefundRate: profile.stripe_refund_rate_pct || 0,
      dataSource:     revenueSource,
      // Parsed document data from intake uploads — feed directly to Claude as authoritative
      docData: {
        t2:         profile.doc_t2_data         || null,
        financials: profile.doc_financials_data || null,
        gst:        profile.doc_gst_data        || null,
        t4:         profile.doc_t4_data         || null,
        bank:       profile.doc_bank_data       || null,
      },
      ctx,
    };

    if (ctx.benchmarks.length === 0) {
      console.warn(`[Diagnostic] No industry benchmarks in DB for industry="${profile.industry_slug || profile.industry}" — AI will use Canadian averages`);
    }

    const systemPrompt = buildSystemPrompt(promptInputs);
    const userPrompt   = buildUserPrompt(promptInputs);

    // ── 5. Create report record ───────────────────────────────────────────
    const { data: report, error: createErr } = await supabaseAdmin
      .from("diagnostic_reports")
      .insert({
        business_id: businessId,
        user_id:     ((token as any)?.id || token?.sub),
        language,
        status:      "analyzing",
        tier,
        input_snapshot: {
          profile: {
            business_name:   profile.business_name,
            industry:        profile.industry,
            industry_naics:  profile.industry_naics,
            structure:       profile.structure || profile.business_structure,
            province,
            city:            profile.city,
            annual_revenue:  annualRevenue,
            employee_count:  employees,
          },
          obligations_count:    ctx.obligations.length,
          overdue_count:        ctx.overdue,
          penalty_exposure:     ctx.penaltyExposure,
          leak_detectors_count: ctx.leakDetectors.length,
          programs_count:       ctx.programs.length,
          benchmarks_count:     ctx.benchmarks.length,
          benchmarks_estimated: ctx.benchmarks.length === 0,
        },
      })
      .select("id")
      .single();

    if (createErr) throw createErr;
    const reportId = report.id;

    // ── 6. Call Claude ────────────────────────────────────────────────────
    let aiResult: any;

    try {
      const response = await anthropic.messages.create({
        model:      "claude-sonnet-4-6",
        max_tokens: tierMaxTokens(tier),
        system:     systemPrompt,
        messages:   [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find(b => b.type === "text") as { type: "text"; text: string } | undefined;
      const rawText   = textBlock?.text || "";
      // Strip markdown fences, extract just the JSON object
      let jsonStr = rawText.replace(/```json\n?|```\n?/g, "").trim();
      // If Claude added text before/after the JSON, extract the {...} block
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];
      aiResult = JSON.parse(jsonStr);

      // Schema validation: if Claude returned empty or schema-invalid output, retry once
      if (!aiResult?.scores || !Array.isArray(aiResult?.findings) || aiResult.findings.length === 0) {
        console.error("[Diagnostic] AI returned invalid schema:", JSON.stringify(aiResult).slice(0, 200));
        await supabaseAdmin.from("diagnostic_reports")
          .update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", reportId);
        return NextResponse.json(
          { success: false, error: "AI returned an incomplete analysis. Please try again.", reportId },
          { status: 422 }
        );
      }

    } catch (aiErr: any) {
      console.error("[Diagnostic] AI error:", aiErr);
      await supabaseAdmin
        .from("diagnostic_reports")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", reportId);
      return NextResponse.json(
        { success: false, error: "AI analysis failed: " + aiErr.message, reportId },
        { status: 500 }
      );
    }

    // ── 7. Save result ────────────────────────────────────────────────────
    const scores = aiResult?.scores || {};

    await supabaseAdmin
      .from("diagnostic_reports")
      .update({
        status:               "completed",
        result_json:          aiResult,
        overall_score:        scores.overall        || 0,
        compliance_score:     scores.compliance     || 0,
        efficiency_score:     scores.efficiency     || 0,
        optimization_score:   scores.optimization   || 0,
        growth_score:         scores.growth         || 0,
        bankability_score:    scores.bankability    || 0,
        exit_readiness_score: scores.exit_readiness || 0,
        findings_count:       aiResult?.findings?.length || 0,
        critical_findings:    (aiResult?.findings || []).filter((f: any) => f.severity === "critical").length,
        total_potential_savings: aiResult?.total_potential_savings || 0,
        total_annual_leaks:      aiResult?.total_annual_leaks      || 0,
        total_penalty_exposure:  aiResult?.total_penalty_exposure  || 0,
        total_programs_value:    aiResult?.total_programs_value    || 0,
        ebitda_impact:           aiResult?.ebitda_impact           || 0,
        enterprise_value_impact: aiResult?.enterprise_value_impact || 0,
        model_used:           "claude-sonnet-4-6",
        completed_at:         new Date().toISOString(),
        updated_at:           new Date().toISOString(),
      })
      .eq("id", reportId);

    // ── 8. Persist detected leaks ─────────────────────────────────────────
    if (aiResult?.findings?.length) {
      const leakRows = aiResult.findings.map((f: any) => ({
        business_id:           businessId,
        leak_name:             f.title,
        category:              f.category,
        severity:              f.severity,
        annual_leak:           f.annual_leak        || 0,
        potential_savings:     f.potential_savings  || 0,
        status:                "detected",
        diagnostic_report_id:  reportId,
        created_at:            new Date().toISOString(),
      }));
      try { await supabaseAdmin.from("detected_leaks").insert(leakRows); } catch {}
    }

    // ── 9. Auto-create tier3_pipeline entry (enterprise) ─────────────────
    if (tier === "enterprise") {
      try {
        const userId    = (token as any)?.id || token?.sub;
        const userEmail = (token as any)?.email as string | undefined;

        // Find best available active rep — match by province first, fallback to any active rep
        const { data: reps } = await supabaseAdmin
          .from("tier3_reps")
          .select("id, province")
          .eq("status", "active")
          .order("created_at", { ascending: true });

        const rep = reps?.find(r => r.province === province) || reps?.[0] || null;

        const { data: existingPipe } = await supabaseAdmin
          .from("tier3_pipeline")
          .select("id")
          .or(`report_id.eq.${reportId},user_id.eq.${userId}`)
          .maybeSingle();

        if (!existingPipe) {
          const pipeId = crypto.randomUUID();
          await supabaseAdmin.from("tier3_pipeline").insert({
            id:            pipeId,
            report_id:     reportId,
            business_id:   businessId,
            user_id:       userId,          // ← required for status API lookup
            contact_email: userEmail || null, // ← fallback lookup
            company_name:  profile.business_name || null,
            industry:      profile.industry_label || profile.industry || null,
            province:      province || null,
            rep_id:        rep?.id || null,
            stage:         "lead",
            created_at:    new Date().toISOString(),
            updated_at:    new Date().toISOString(),
          });

          if (rep?.id) {
            await supabaseAdmin.from("tier3_rep_assignments").insert({
              id:                   crypto.randomUUID(),
              rep_id:               rep.id,
              pipeline_id:          pipeId,
              diagnostic_id:        reportId,
              report_id:            reportId,
              stage_at_assignment:  "lead",
              assigned_at:          new Date().toISOString(),
            });
          }
        }
      } catch (pipeErr: any) {
        console.warn("[Diagnostic] Pipeline auto-create failed:", pipeErr.message);
      }
    }

    // ── 10. Return ────────────────────────────────────────────────────────
    return NextResponse.json({
      success:                 true,
      reportId,
      duration_ms:             Date.now() - start,
      tier,
      findings_count:          aiResult?.findings?.length || 0,
      critical_findings:       (aiResult?.findings || []).filter((f: any) => f.severity === "critical").length,
      total_potential_savings: aiResult?.total_potential_savings || 0,
      total_annual_leaks:      aiResult?.total_annual_leaks      || 0,
      ebitda_impact:           aiResult?.ebitda_impact           || 0,
      enterprise_value_impact: aiResult?.enterprise_value_impact || 0,
      overall_score:           scores.overall || 0,
    });

  } catch (err: any) {
    console.error("[Diagnostic] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
