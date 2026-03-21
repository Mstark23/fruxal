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
import { buildSystemPrompt, buildUserPrompt, buildTaxContext, PromptInputs } from "@/lib/ai/prompts";
import { buildEnterprisePrompts } from "@/lib/ai/prompts/diagnostic/enterprise";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const maxDuration = 120;

// Per-user rate limiter for diagnostic runs
const _diagRl = new Map<string, { c: number; r: number }>();

function diagRateCheck(userId: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000; // 10 minutes
  const max = 3; // max 3 diagnostic runs per 10 min per user
  const entry = _diagRl.get(userId);
  if (!entry || entry.r < now) {
    _diagRl.set(userId, { c: 1, r: now + window });
    return true;
  }
  entry.c++;
  return entry.c <= max;
}

// Cleanup stale entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _diagRl) { if (v.r < now) _diagRl.delete(k); }
}, 900_000);

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
    const userId = ((token as any)?.id || token?.sub) as string;

    // Rate limit: max 3 diagnostic runs per 10 min per user
    if (!diagRateCheck(userId)) {
      return NextResponse.json(
        { success: false, error: "Too many diagnostic requests. Please wait a few minutes." },
        { status: 429 }
      );
    }

    if (!businessId) {
      return NextResponse.json({ success: false, error: "businessId required" }, { status: 400 });
    }

    // ── IDOR fix: verify the caller owns this businessId before any data access ──
    // Fetch profile scoped to BOTH businessId AND userId — prevents any authenticated
    // user from running a diagnostic on another user's business by guessing a UUID.
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("*")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .single();

    if (!profile) {
      // Return 404 not 403 — don't confirm whether the businessId exists at all
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    // Prevent duplicate concurrent runs — if one is already analyzing, return it
    const { data: existingRun } = await Promise.resolve(await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, status, created_at")
      .eq("business_id", businessId)
      .eq("status", "analyzing")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      ).catch(() => ({ data: null }));

    if (existingRun?.id) {
      const ageMs = Date.now() - new Date(existingRun.created_at).getTime();
      // If less than 3 minutes old, it's still running — return early
      if (ageMs < 180000) {
        return NextResponse.json({ success: true, reportId: existingRun.id, status: "analyzing" });
      }
      // Older than 3 min — stale, fall through and create a new one
    }

    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("billing_tier, tier")
      .eq("id", businessId)
      .maybeSingle();

    const tier     = resolveTier(profile, business);
    const isFr     = language === "fr";
    const province = profile.province || "ON";
    const employees = profile.employee_count ?? 0;

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
      ownerSalary:    profile.owner_salary ?? 0,
      exactNetIncome: profile.net_income_last_year ?? 0,
      exitHorizon:    profile.exit_horizon          || "unknown",
      lcgeEligible:   profile.lcge_eligible         ?? false,
      passiveOver50k: profile.passive_income_over_50k ?? false,
      hasHoldco:      profile.has_holdco            ?? false,
      rdtohBalance:   profile.rdtoh_balance ?? 0,
      hasCDA:         profile.has_cda_balance       ?? false,
      sredLastYear:   profile.sred_claimed_last_year ?? 0,
      // QB/Plaid/Stripe signals — enriches diagnostic accuracy
      qbArOverdue:    profile.qb_ar_overdue_30 ?? 0,
      qbBankBalance:  (profile.qb_bank_balance || profile.plaid_bank_balance_total) ?? 0,
      qbTopExpenses:  profile.qb_top_expense_cats || [],
      plaidRecurring: profile.plaid_recurring_expenses || [],
      stripeChurnRate:  profile.stripe_churn_rate_pct ?? 0,
      stripeRefundRate: profile.stripe_refund_rate_pct ?? 0,
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

    let systemPrompt: string;
    let userPrompt: string;

    if (tier === "enterprise") {
      // Format DB context lists for the enterprise prompt
      const leakList = ctx.leakDetectors.slice(0, 60).map((l: any) =>
        `- ${l.leak_type_code || l.slug}: ${l.title || l.description} (impact: $${(l.annual_impact_min ?? 0).toLocaleString()}–$${(l.annual_impact_max ?? 0).toLocaleString()})`
      ).join("\n");

      const programList = ctx.programs.slice(0, 20).map((p: any) =>
        `- [${p.slug}] ${isFr ? (p.name_fr || p.name) : p.name}: ${isFr ? (p.description_fr || p.description) : p.description} (up to $${(p.annual_value_max ?? 0).toLocaleString()})`
      ).join("\n");

      const benchmarkList = ctx.benchmarks.slice(0, 10).map((b: any) =>
        `- ${b.metric_name}: avg ${b.avg_value}${b.unit || "%"}, top quartile ${b.top_performer}${b.unit || "%"}`
      ).join("\n");

      const taxCtx = buildTaxContext(promptInputs);

      // Build docData section to append to enterprise user prompt
      const docSection = (() => {
        const d = promptInputs.docData;
        if (!d) return "";
        const lines: string[] = [];
        if (d.t2) {
          lines.push("\nVERIFIED T2 CORPORATE RETURN DATA (treat as authoritative — from actual CRA filing):");
          if (d.t2.tax_year)                 lines.push(`  Tax year: ${d.t2.tax_year}`);
          if (d.t2.net_income_before_tax)    lines.push(`  Net income before tax: $${d.t2.net_income_before_tax.toLocaleString()}`);
          if (d.t2.taxable_income)           lines.push(`  Taxable income: $${d.t2.taxable_income.toLocaleString()}`);
          if (d.t2.total_tax_payable)        lines.push(`  Total tax payable: $${d.t2.total_tax_payable.toLocaleString()}`);
          if (d.t2.small_business_deduction) lines.push(`  SBD claimed: $${d.t2.small_business_deduction.toLocaleString()}`);
          if (d.t2.sred_credit_claimed)      lines.push(`  SR&ED credit: $${d.t2.sred_credit_claimed.toLocaleString()}`);
          if (d.t2.rdtoh_balance)            lines.push(`  RDTOH balance: $${d.t2.rdtoh_balance.toLocaleString()}`);
          if (d.t2.passive_income)           lines.push(`  Passive income: $${d.t2.passive_income.toLocaleString()}`);
        }
        if (d.financials) {
          lines.push("\nVERIFIED FINANCIAL STATEMENTS (treat as authoritative):");
          if (d.financials.total_revenue)    lines.push(`  Revenue: $${d.financials.total_revenue.toLocaleString()}`);
          if (d.financials.gross_profit)     lines.push(`  Gross profit: $${d.financials.gross_profit.toLocaleString()}`);
          if (d.financials.ebitda)           lines.push(`  EBITDA: $${d.financials.ebitda.toLocaleString()}`);
          if (d.financials.net_income)       lines.push(`  Net income: $${d.financials.net_income.toLocaleString()}`);
          if (d.financials.total_assets)     lines.push(`  Total assets: $${d.financials.total_assets.toLocaleString()}`);
          if (d.financials.total_liabilities)lines.push(`  Total liabilities: $${d.financials.total_liabilities.toLocaleString()}`);
          if (d.financials.accounts_receivable) lines.push(`  AR: $${d.financials.accounts_receivable.toLocaleString()}`);
        }
        if (d.gst) {
          lines.push("\nVERIFIED GST/HST RETURN DATA:");
          if (d.gst.total_sales_and_other_revenue) lines.push(`  Reported sales: $${d.gst.total_sales_and_other_revenue.toLocaleString()}`);
          if (d.gst.gst_hst_collected)             lines.push(`  GST/HST collected: $${d.gst.gst_hst_collected.toLocaleString()}`);
          if (d.gst.input_tax_credits)             lines.push(`  ITCs claimed: $${d.gst.input_tax_credits.toLocaleString()}`);
          if (d.gst.quick_method !== undefined)    lines.push(`  Quick method: ${d.gst.quick_method ? "YES" : "NO"}`);
        }
        if (d.t4) {
          lines.push("\nVERIFIED T4 SUMMARY DATA:");
          if (d.t4.total_employment_income) lines.push(`  Total payroll: $${d.t4.total_employment_income.toLocaleString()}`);
          if (d.t4.number_of_t4s)           lines.push(`  T4s issued: ${d.t4.number_of_t4s}`);
          if (d.t4.total_cpp_deducted)      lines.push(`  CPP deducted: $${d.t4.total_cpp_deducted.toLocaleString()}`);
        }
        if (d.bank) {
          lines.push("\nVERIFIED BANK STATEMENT DATA:");
          if (d.bank.average_monthly_balance) lines.push(`  Avg monthly balance: $${d.bank.average_monthly_balance.toLocaleString()}`);
          if (d.bank.monthly_revenue_deposits) lines.push(`  Monthly revenue deposits: $${d.bank.monthly_revenue_deposits.toLocaleString()}`);
          if (d.bank.nsf_count)               lines.push(`  NSF count: ${d.bank.nsf_count}`);
        }
        return lines.join("\n");
      })();

      const diagCtx = {
        profile,
        province,
        annualRevenue,
        revenueSource,
        employees,
        isFr,
        estimatedPayroll,
        estimatedEBITDA,
        ebitdaSource,
        grossMarginPct,
        ownerSalary:    profile.owner_salary ?? 0,
        exactNetIncome: profile.net_income_last_year ?? 0,
        estimatedTaxDrag: promptInputs.estimatedTaxDrag,
        taxCtx,
        leakList,
        programList,
        benchmarkList,
        overdue:          ctx.overdue,
        penaltyExposure:  ctx.penaltyExposure,
        obligationsCount: ctx.obligations.length,
        exitHorizon:    profile.exit_horizon && profile.exit_horizon !== "none" ? profile.exit_horizon : "unknown",
        hasHoldco:      profile.has_holdco            ?? false,
        passiveOver50k: profile.passive_income_over_50k ?? false,
        lcgeEligible:   profile.lcge_eligible         ?? false,
        rdtohBalance:   profile.rdtoh_balance ?? 0,
        hasCDA:         profile.has_cda_balance       ?? false,
        sredLastYear:   profile.sred_claimed_last_year ?? 0,
        docData: promptInputs.docData ?? { t2: null, financials: null, gst: null, t4: null, bank: null },
      };

      const entPrompts = buildEnterprisePrompts(diagCtx);
      systemPrompt = entPrompts.systemPrompt;
      // Append verified doc data to enterprise user prompt if available
      userPrompt = docSection ? entPrompts.userPrompt + docSection : entPrompts.userPrompt;

    } else {
      systemPrompt = buildSystemPrompt(promptInputs);
      userPrompt   = buildUserPrompt(promptInputs);
    }

    // ── 5. Create report record ───────────────────────────────────────────
    const { data: report, error: createErr } = await supabaseAdmin
      .from("diagnostic_reports")
      .insert({
        business_id: businessId,
        user_id:     userId,
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

      const textBlock = response.content.find((b: any) => b.type === "text") as { type: "text"; text: string } | undefined;
      const rawText   = textBlock?.text || "";
      // Strip markdown fences, extract just the JSON object
      let jsonStr = rawText.replace(/```json\n?|```\n?/g, "").trim();
      // If Claude added text before/after the JSON, extract the {...} block
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];
      try { aiResult = JSON.parse(jsonStr); } catch { throw new Error('AI returned invalid JSON — not parseable'); }

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
    const totals = aiResult?.totals || {};

    await supabaseAdmin
      .from("diagnostic_reports")
      .update({
        status:               "completed",
        result_json:          aiResult,
        overall_score:        scores.overall ?? 0,
        compliance_score:     scores.compliance ?? 0,
        efficiency_score:     scores.efficiency ?? 0,
        optimization_score:   scores.optimization ?? 0,
        growth_score:         scores.growth ?? 0,
        bankability_score:    scores.bankability ?? 0,
        exit_readiness_score: scores.exit_readiness ?? 0,
        findings_count:       aiResult?.findings?.length ?? 0,
        critical_findings:    (aiResult?.findings || []).filter((f: any) => f.severity === "critical").length,
        total_potential_savings: (totals.potential_savings || aiResult?.total_potential_savings) ?? 0,
        total_annual_leaks:      (totals.annual_leaks || aiResult?.total_annual_leaks) ?? 0,
        total_penalty_exposure:  (totals.penalty_exposure || aiResult?.total_penalty_exposure) ?? 0,
        total_programs_value:    (totals.programs_value || aiResult?.total_programs_value) ?? 0,
        ebitda_impact:           (totals.ebitda_impact || aiResult?.ebitda_impact) ?? 0,
        enterprise_value_impact: (totals.enterprise_value_impact || aiResult?.enterprise_value_impact) ?? 0,
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
        annual_leak:           f.annual_leak ?? 0,
        potential_savings:     f.potential_savings ?? 0,
        status:                "detected",
        diagnostic_report_id:  reportId,
        created_at:            new Date().toISOString(),
      }));
      try { // NOTE: Multi-step write — not atomic. Partial failure leaves inconsistent state.
    await supabaseAdmin.from("detected_leaks").insert(leakRows); } catch { /* non-fatal */ }
    }

    // ── 9. Auto-create tier3_pipeline entry (enterprise) ─────────────────
    if (tier === "enterprise") {
      try {
        const userEmail = (token as any)?.email as string | undefined;

        // Find best available active rep — match by province first, fallback to any active rep
        const { data: reps } = await supabaseAdmin
          .from("tier3_reps")
          .select("id, province")
          .eq("status", "active")
          .order("created_at", { ascending: true });

        const rep = reps?.find((r: any) => r.province === province) || reps?.[0] || null;

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
      findings_count:          aiResult?.findings?.length ?? 0,
      critical_findings:       (aiResult?.findings || []).filter((f: any) => f.severity === "critical").length,
      total_potential_savings: aiResult?.total_potential_savings ?? 0,
      total_annual_leaks:      aiResult?.total_annual_leaks      ?? 0,
      ebitda_impact:           aiResult?.ebitda_impact ?? 0,
      enterprise_value_impact: aiResult?.enterprise_value_impact ?? 0,
      overall_score:           scores.overall ?? 0,
    });

  } catch (err: any) {
    console.error("[Diagnostic] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
