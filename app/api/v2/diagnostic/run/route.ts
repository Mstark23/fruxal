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
import { CLAUDE_MODEL }               from "@/lib/ai/client";
import { resolveTier, tierMaxTokens } from "@/lib/ai/tier";
import { fetchDiagnosticContext }      from "@/lib/ai/context";
import { buildTaxContext, PromptInputs } from "@/lib/ai/prompts"; // buildTaxContext still needed for diagCtx assembly
import { buildDiagnosticPrompts } from "@/lib/ai/prompts/diagnostic/index";
// buildDiagnosticTool import removed — tool_use mode not currently active
import { getPrescanContext, type PrescanContext } from "@/lib/ai/prescan-context";
import { buildTimeline }         from "@/lib/ai/timeline-builder";
import { contributeBenchmarks } from "@/lib/benchmark/contribute";
import { linkPrescanToDiagnostic } from "@/lib/ai/prescan-linker";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
export const maxDuration = 300; // Vercel Pro allows up to 300s

// Supabase-based rate limiter — works correctly on Vercel (no module-level state)
async function diagRateCheck(userId: string): Promise<boolean> {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("diagnostic_reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .or(`status.eq.analyzing,created_at.gte.${tenMinAgo}`);
  return (count ?? 0) <= 3;
}

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

    // Rate limit: max 3 diagnostic runs per 10 min per user (Supabase-based, works on Vercel)
    if (!(await diagRateCheck(userId))) {
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
    // Country: profile > request body > host header > default CA
    const bodyCountry = body?.country;
    const hostHeader = req.headers.get("host") || "";
    const detectedCountry = profile.country
      || bodyCountry
      || (hostHeader.includes("fruxal.com") && !hostHeader.includes("fruxal.ca") ? "US" : "CA");
    const country  = (detectedCountry === "US" ? "US" : "CA") as "CA" | "US";
    const province = profile.province || (country === "US" ? "TX" : "ON");
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
      : profile.doc_t2_data?.net_income_before_tax                   ? `verified ${profile.country === "US" ? "Form 1120/1120-S" : "T2 return"} (uploaded)`
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

    // ── DATA QUALITY GATE — refuse to run on empty data ─────────────────────────
    // A diagnostic with annualRevenue=0 produces meaningless output: all
    // dollar amounts are $0 or hallucinated. Force the user to complete their
    // profile first.
    if (annualRevenue === 0) {
      return NextResponse.json({
        success: false,
        error: "incomplete_profile",
        message: isFr
          ? "Veuillez compléter votre profil d'entreprise (revenus annuels requis) avant de lancer le diagnostic."
          : "Please complete your business profile (annual revenue required) before running the diagnostic.",
        redirect: "/v2/diagnostic/intake",
      }, { status: 422 });
    }

    // Default industry if missing — try prescan data first, then fallback to "general"
    const INDUSTRY_LABELS: Record<string, string> = {
      restaurant: "Restaurant / Food Service", construction: "Construction / Renovation",
      retail: "Retail", ecommerce: "E-Commerce", consulting: "Consulting / Professional Services",
      software_development: "Software / SaaS / Tech", healthcare: "Healthcare / Clinic",
      salon: "Beauty / Salon / Spa", trucking: "Transport / Delivery",
      real_estate: "Real Estate", manufacturing: "Manufacturing",
      accounting: "Accounting / Bookkeeping", legal: "Legal Services",
      marketing: "Marketing / Design / Agency", fitness: "Fitness / Gym / Coaching",
      cleaning: "Cleaning / Janitorial", landscaping: "Landscaping",
      rideshare: "Rideshare / Delivery Driver", photography: "Photography / Videography",
      other: "General Business", general: "General Business",
    };

    if (!profile.industry && !profile.industry_label) {
      // Try to recover industry from prescan_runs
      const { data: prescanRow } = await supabaseAdmin
        .from("prescan_runs")
        .select("industry_slug")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prescanRow?.industry_slug) {
        profile.industry = prescanRow.industry_slug;
        profile.industry_slug = prescanRow.industry_slug;
        profile.industry_label = INDUSTRY_LABELS[prescanRow.industry_slug] || prescanRow.industry_slug;
        // NOTE: only 'industry' column exists in business_profiles table
        await supabaseAdmin.from("business_profiles").update({
          industry: prescanRow.industry_slug,
        }).eq("user_id", userId).eq("business_id", businessId);
        console.log("[Diagnostic] Backfilled industry from prescan:", prescanRow.industry_slug);
      } else {
        console.warn("[Diagnostic] No industry set for businessId:", businessId, "— defaulting to 'General Business'");
        profile.industry = "general";
        profile.industry_label = "General Business";
      }
    }
    // Always ensure industry_label is human-readable (not a slug)
    if (profile.industry && !profile.industry_label) {
      profile.industry_label = INDUSTRY_LABELS[profile.industry] || profile.industry;
    }
    // Final safety: if industry is empty string, treat as missing
    if (!profile.industry || profile.industry === "") {
      profile.industry = "general";
      profile.industry_slug = "general";
      profile.industry_label = "General Business";
    }
    if (!profile.industry_label || profile.industry_label === "") {
      profile.industry_label = INDUSTRY_LABELS[profile.industry] || profile.industry || "General Business";
    }
    console.log(`[Diagnostic] Industry resolved: industry="${profile.industry}" label="${profile.industry_label}" slug="${profile.industry_slug}"`);

    // ALWAYS backfill DB if industry was missing or empty — persistent fix
    // This ensures the profile row is permanently updated so dashboards,
    // chat prompts, and future diagnostics all see the correct industry.
    if (profile._industryBackfilled !== false) {
      const dbUpdate: Record<string, any> = {};
      // Check what's actually in DB (profile object may have been mutated above)
      const { data: dbRow } = await supabaseAdmin
        .from("business_profiles")
        .select("industry")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .maybeSingle();
      if (!dbRow?.industry || dbRow.industry === "") {
        dbUpdate.industry = profile.industry;
        // NOTE: only 'industry' column exists in business_profiles (per Prisma schema)
        await supabaseAdmin.from("business_profiles")
          .update(dbUpdate)
          .eq("business_id", businessId)
          .eq("user_id", userId);
        console.log(`[Diagnostic] Backfilled industry in DB: ${JSON.stringify(dbUpdate)}`);
      }
    }

    // ── 3. Fetch DB context ───────────────────────────────────────────────
    const ctx = await fetchDiagnosticContext(
      businessId,
      province,
      profile.industry_slug || profile.industry || "general",
      tier,
      language,
      country
    );

    // ── 4. Build prompts ──────────────────────────────────────────────────
    const promptInputs: PromptInputs = {
      profile, tier, isFr, country, province, employees,
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
      console.warn(`[Diagnostic] No industry benchmarks in DB for industry="${profile.industry_slug || profile.industry}" — AI will use regional industry averages`);
    }

    // ── 4b. Fetch prescan context (2s timeout — never blocks diagnostic) ────
    let prescanCtx: PrescanContext | null = null;
    try {
      prescanCtx = await Promise.race([
        getPrescanContext(businessId, userId),
        new Promise<null>((_res, rej) => setTimeout(() => rej(new Error("prescan timeout")), 2000)),
      ]) as PrescanContext | null;
    } catch { /* non-fatal — prescan context optional */ }

    let systemPrompt: string;
    let userPrompt: string;

    // ── Build DiagCtx for all tiers — routes to solo/business/enterprise prompt ──
    const leakList = ctx.leakDetectors.slice(0, tier === "enterprise" ? 60 : 30).map((l: any) =>
      `- ${l.leak_type_code || l.slug}: ${l.title || l.description} (impact: $${(l.annual_impact_min ?? 0).toLocaleString()}–$${(l.annual_impact_max ?? 0).toLocaleString()})`
    ).join("\n");

    const programList = ctx.programs.slice(0, tier === "enterprise" ? 20 : 12).map((p: any) =>
      `- [${p.slug}] ${isFr ? (p.name_fr || p.name) : p.name}: ${isFr ? (p.description_fr || p.description) : p.description} (up to $${(p.annual_value_max ?? 0).toLocaleString()})`
    ).join("\n");

    const benchmarkList = ctx.benchmarks.slice(0, 10).map((b: any) =>
      `- ${b.metric_name}: avg ${b.avg_value}${b.unit || "%"}, top quartile ${b.top_performer}${b.unit || "%"}`
    ).join("\n");

    const taxCtx = buildTaxContext(promptInputs);

    const diagCtx = {
      profile,
      country,
      province,
      annualRevenue,
      revenueSource,
      employees,
      isFr,
      estimatedPayroll,
      estimatedEBITDA,
      ebitdaSource,
      grossMarginPct,
      ownerSalary:      profile.owner_salary ?? 0,
      exactNetIncome:   profile.net_income_last_year ?? 0,
      estimatedTaxDrag: promptInputs.estimatedTaxDrag,
      taxCtx,
      leakList,
      programList,
      benchmarkList,
      overdue:          ctx.overdue,
      penaltyExposure:  ctx.penaltyExposure,
      obligationsCount: ctx.obligations.length,
      exitHorizon:      profile.exit_horizon && profile.exit_horizon !== "none" ? profile.exit_horizon : "unknown",
      hasHoldco:        profile.has_holdco            ?? false,
      passiveOver50k:   profile.passive_income_over_50k ?? false,
      lcgeEligible:     profile.lcge_eligible         ?? false,
      rdtohBalance:     profile.rdtoh_balance ?? 0,
      hasCDA:           profile.has_cda_balance       ?? false,
      sredLastYear:     profile.sred_claimed_last_year ?? 0,
      docData:          promptInputs.docData ?? { t2: null, financials: null, gst: null, t4: null, bank: null },
    };

    // Single call — routes to correct tier prompt (solo / business / enterprise)
    let prompts;
    try {
      prompts = buildDiagnosticPrompts(tier, diagCtx);
      systemPrompt = prompts.systemPrompt;
      userPrompt   = prompts.userPrompt;
    } catch (promptErr: any) {
      console.error("[Diagnostic] PROMPT BUILD FAILED:", promptErr.message, "\nStack:", promptErr.stack?.slice(0, 800));
      // Include stack trace to identify exact file and line
      const stackLines = (promptErr.stack || "").split("\n").slice(0, 8).join(" | ");
      console.error("[Diagnostic] PROMPT BUILD STACK:", promptErr.stack);
      return NextResponse.json({ success: false, error: "Prompt build failed: " + promptErr.message + " [at: " + stackLines + "]" }, { status: 500 });
    }


    // ── Append prescan baseline data to system prompt (under 400 tokens) ────
    if (prescanCtx) {
      const leakLines = prescanCtx.topLeaks.slice(0, 5)
        .map(l => `  - [${l.category}] ${l.title}: ~$${(l.estimatedMonthlyLoss ?? 0).toLocaleString()}/month (${l.severity})`)
        .join("\n");

      const prescanSection = [
        "",
        "═══════════════════════════════════════════════════",
        "PRESCAN BASELINE DATA:",
        `This business completed an initial scan ${prescanCtx.daysSincePrescan} day${prescanCtx.daysSincePrescan !== 1 ? "s" : ""} ago.`,
        "The prescan identified these potential issues:",
        leakLines,
        `Total estimated monthly loss from prescan: ~$${(prescanCtx.totalEstimatedLoss ?? 0).toLocaleString()}`,
        "",
        "INSTRUCTIONS FOR PRESCAN CONTINUITY:",
        "- For each finding in your diagnostic, check if it matches a prescan leak.",
        "  If it does: add a field confirmed_from_prescan: true and include the text",
        "  'Confirmed from your initial scan' in the finding description.",
        "- If you find issues the prescan missed: these are new discoveries — do not",
        "  add confirmed_from_prescan. They are genuinely new findings.",
        "- If a prescan leak is NOT confirmed by your full analysis: still include it",
        "  as a finding but mark it prescan_only: true with a brief note.",
        "- Open your diagnostic findings section with 1-2 sentences acknowledging",
        "  the prescan: 'Your initial scan identified [X] potential issues. Our full",
        "  diagnostic confirms [Y] of them and found [Z] additional areas requiring attention.'",
        "- This continuity language builds user trust — they should feel Fruxal",
        "  remembered and validated what they shared in the prescan.",
        "═══════════════════════════════════════════════════",
      ].join("\n");

      systemPrompt = systemPrompt + prescanSection;
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
      if (process.env.NODE_ENV !== "production") console.log(`[Diagnostic:Run] tier=${tier} country=${country} province=${province} sysPromptLen=${systemPrompt.length} userPromptLen=${userPrompt.length}`);

      const createParams: any = {
        model: CLAUDE_MODEL,
        max_tokens: tierMaxTokens(tier),
        system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: userPrompt }],
      };

      // Use streaming internally to prevent Vercel timeout.
      // Collect all chunks server-side, then parse the full JSON.
      const stream = getAnthropic().messages.stream(createParams);
      let rawText = "";
      for await (const event of stream) {
        if (event.type === "content_block_delta" && (event.delta as any)?.type === "text_delta") {
          rawText += (event.delta as any).text;
        }
      }

      // Check if response was truncated by max_tokens
      const finalMsg = await stream.finalMessage();
      if (finalMsg.stop_reason === "max_tokens") {
        console.warn("[Diagnostic] Claude hit max_tokens — response may be truncated");
        // Try to close the JSON by finding the last complete object
        if (!rawText.endsWith("}")) {
          const lastBrace = rawText.lastIndexOf("}");
          if (lastBrace > 0) {
            rawText = rawText.slice(0, lastBrace + 1);
            // Try to close open arrays/objects
            const openBrackets = (rawText.match(/\[/g) || []).length - (rawText.match(/\]/g) || []).length;
            const openBraces = (rawText.match(/\{/g) || []).length - (rawText.match(/\}/g) || []).length;
            rawText += "]".repeat(Math.max(0, openBrackets)) + "}".repeat(Math.max(0, openBraces));
          }
        }
      }

      if (!rawText || rawText.length < 50) {
        throw new Error("AI returned an incomplete response (length=" + rawText.length + ")");
      }
      // Strip markdown fences and parse JSON
      let jsonStr = rawText.replace(/```json\n?|```\n?/g, "").trim();
      // Handle case where Claude wraps in extra text before/after JSON
      const jsonStart = jsonStr.indexOf("{");
      const jsonEnd = jsonStr.lastIndexOf("}");
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
      }
      try {
        aiResult = JSON.parse(jsonStr);
      } catch (parseErr: any) {
        console.error("[Diagnostic] JSON parse failed:", parseErr.message);
        console.error("[Diagnostic] Raw text (first 500):", rawText.slice(0, 500));
        console.error("[Diagnostic] JSON extract (first 500):", jsonStr.slice(0, 500));
        // Retry: ask Claude to fix its JSON
        try {
          const retryStream = getAnthropic().messages.stream({
            model: CLAUDE_MODEL,
            max_tokens: tierMaxTokens(tier),
            system: "Fix this broken JSON. Return ONLY valid JSON, nothing else.",
            messages: [{ role: "user", content: "Fix this JSON:\n\n" + rawText.slice(0, 6000) }],
          });
          let retryText = "";
          for await (const evt of retryStream) {
            if (evt.type === "content_block_delta" && (evt.delta as any)?.type === "text_delta") {
              retryText += (evt.delta as any).text;
            }
          }
          const retryJson = retryText.replace(/```json\n?|```\n?/g, "").trim();
          const rStart = retryJson.indexOf("{");
          const rEnd = retryJson.lastIndexOf("}");
          if (rStart >= 0 && rEnd > rStart) {
            aiResult = JSON.parse(retryJson.slice(rStart, rEnd + 1));
            console.log("[Diagnostic] Retry parse succeeded");
          } else {
            throw new Error("Retry also failed");
          }
        } catch (retryErr: any) {
          console.error("[Diagnostic] Retry also failed:", retryErr.message);
          throw new Error("AI returned invalid JSON after retry. Raw start: " + rawText.slice(0, 200));
        }
      }

      // Schema validation: verify essential fields are present
      const hasValidScores = aiResult?.scores && typeof aiResult.scores.overall === 'number';
      const hasFindings = Array.isArray(aiResult?.findings) && aiResult.findings.length > 0;
      const hasTotals = aiResult?.totals && typeof aiResult.totals.annual_leaks === 'number';
      const hasExecSummary = typeof aiResult?.executive_summary === 'string' && aiResult.executive_summary.length > 20;

      if (!hasValidScores || !hasFindings) {
        // Critical failure — can't display anything
        console.error("[Diagnostic] Missing critical fields: scores=", !!hasValidScores, "findings=", !!hasFindings);
        await supabaseAdmin.from("diagnostic_reports")
          .update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", reportId);
        return NextResponse.json(
          { success: false, error: "AI returned an incomplete analysis. Please try again.", reportId },
          { status: 422 }
        );
      }

      // Backfill missing optional fields with defaults
      if (!aiResult.totals) aiResult.totals = { annual_leaks: 0, potential_savings: 0, penalty_exposure: 0, programs_value: 0, ebitda_impact: 0, enterprise_value_impact: 0 };
      if (!aiResult.executive_summary) aiResult.executive_summary = "Diagnostic completed. Review your findings below.";
      if (!Array.isArray(aiResult.risk_matrix)) aiResult.risk_matrix = [];
      if (!Array.isArray(aiResult.benchmark_comparisons)) aiResult.benchmark_comparisons = [];
      if (!aiResult.cpa_briefing) aiResult.cpa_briefing = { intro: "", talking_points: [], forms_to_file: [] };

      // Validate each finding has required fields
      aiResult.findings = aiResult.findings.map((f: any) => ({
        ...f,
        title: f.title || "Untitled Finding",
        category: f.category || "general",
        severity: ["critical","high","medium","low"].includes(f.severity) ? f.severity : "medium",
        impact_min: f.impact_min ?? f.annual_leak ?? 0,
        impact_max: f.impact_max ?? f.potential_savings ?? f.impact_min ?? f.annual_leak ?? 0,
        description: f.description || "",
        recommendation: f.recommendation || "",
      }));

      // Compute totals from findings if totals are missing/zero
      if (!aiResult.totals.annual_leaks || aiResult.totals.annual_leaks === 0) {
        aiResult.totals.annual_leaks = aiResult.findings.reduce((s: number, f: any) => s + (f.impact_max || 0), 0);
      }
      if (!aiResult.totals.potential_savings || aiResult.totals.potential_savings === 0) {
        aiResult.totals.potential_savings = Math.round(aiResult.totals.annual_leaks * 0.85);
      }

    } catch (aiErr: any) {
      console.error("[Diagnostic] AI error:", aiErr.message, aiErr.stack?.slice(0, 500));
      await supabaseAdmin
        .from("diagnostic_reports")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", reportId);
      return NextResponse.json(
        { success: false, error: "AI error: " + (aiErr.message || "Unknown error"), reportId },
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
        model_used:           "claude-sonnet-4-20250514",
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
        annual_leak:           f.impact_max ?? f.annual_leak ?? f.potential_savings ?? 0,
        potential_savings:     f.impact_max ?? f.potential_savings ?? f.annual_leak ?? 0,
        annual_impact_min:     f.impact_min ?? f.annual_leak ?? 0,
        annual_impact_max:     f.impact_max ?? f.potential_savings ?? f.annual_leak ?? 0,
        title:                 f.title || f.leak_name || "Unknown",
        description:           f.description || "",
        recommendation:        f.recommendation || "",
        status:                "detected",
        diagnostic_report_id:  reportId,
        created_at:            new Date().toISOString(),
      }));
      try {
        const { error: leakErr } = await supabaseAdmin.from("detected_leaks").insert(leakRows);
        if (leakErr) console.error("[Diagnostic:Run] detected_leaks insert failed:", leakErr.message);
      } catch (e: any) { console.error("[Diagnostic:Run] detected_leaks insert error:", e.message); }
    }

    // ── 9b. Auto-extract break-even data from diagnostic (non-blocking) ──────
    const bgController = new AbortController();
    setTimeout(() => bgController.abort(), 10_000);
    if (aiResult?.findings?.length) {
    fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/v2/breakeven/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.CRON_SECRET || ""}` },
      body: JSON.stringify({ businessId }),
      signal: bgController.signal,
    }).catch(() => { /* non-fatal */ });
    }

    // ── 9d. Link prescan to diagnostic (non-blocking) ────────────────────────
    if (prescanCtx && reportId) {
      const finalReportData = aiResult;
      linkPrescanToDiagnostic(
        prescanCtx.prescanRunId,
        businessId,
        reportId,
        finalReportData,
        prescanCtx
      ).catch((e: any) =>
        console.warn("[Diagnostic] Prescan link failed (non-blocking):", e?.message)
      );
    }

    // ── 9g. Rebuild timeline (non-blocking)
    buildTimeline(businessId, userId).catch((e) => console.warn('[Diagnostic] timeline build failed:', e.message));

    // ── 9h. Contribute anonymized metrics to benchmark flywheel (non-blocking) ──
    // Strips all PII — only stores industry+province+revenue_band+metric_value.
    // Powers benchmark_aggregates table used by Claude and /v2/benchmarks page.
    contributeBenchmarks({
      reportId,
      industrySlug:     profile.industry_slug || profile.industry || "",
      province,
      tier,
      annualRevenue,
      revenueSource,
      grossMarginPct,
      estimatedEBITDA,
      ebitdaSource,
      estimatedPayroll,
      employees,
      exactNetIncome:   profile.net_income_last_year ?? 0,
      estimatedTaxDrag: promptInputs.estimatedTaxDrag,
      // Pass AI-computed benchmark values — highest quality since AI used real docs/QB data
      aiBenchmarks:     aiResult?.benchmark_comparisons ?? [],
    }).catch((e: any) =>
      console.warn("[BenchmarkFlywheel] Non-blocking contribution failed:", e?.message)
    );

    // ── 9c. Auto-extract financial ratios from diagnostic (non-blocking) ──────
    const bgController2 = new AbortController();
    setTimeout(() => bgController2.abort(), 10_000);
    fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/v2/ratios/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
      signal: bgController2.signal,
    }).catch(() => { /* non-fatal */ });

    // ── 10. Auto-create tier3_pipeline entry (enterprise) ─────────────────
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

    // ── 11. Return ────────────────────────────────────────────────────────
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
