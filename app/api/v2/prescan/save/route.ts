// =============================================================================
// POST /api/v2/prescan/save — Save prescan results into V2 tables
// =============================================================================
// Called after prescan completes AND user is authenticated.
// Saves to: prescan_results, user_actions, user_progress
// Can be called from:
//   1. Prescan results page (if user already logged in)
//   2. After register/login (with data from localStorage)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Auth check — must be logged in
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { prescanResult, industry, revenue, employees, tier } = body;

    if (!prescanResult || !industry) {
      return NextResponse.json({ error: "prescanResult and industry required" }, { status: 400 });
    }

    // Check if we already saved this scan (prevent duplicates)
    const { data: existing } = await supabase
      .from("prescan_results")
      .select("id")
      .eq("userId", userId)
      .eq("industry", industry)
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString()) // within last 10 min
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        scanId: existing[0].id,
        message: "Already saved",
        alreadyExists: true,
      });
    }

    // ─── 1. Save to prescan_results ──────────────────────────────────────────
    const allLeaks = [
      ...(prescanResult.confirmedLeaks || []),
      ...(prescanResult.probableLeaks || []),
      ...(prescanResult.possibleLeaks || []),
    ];

    const confirmedForStorage = allLeaks.map((l: any) => ({
      title: l.title,
      category: l.category,
      severity: l.severity,
      low: l.impactAnnual?.low || (l.impactMonthly?.low ?? 0) * 12,
      high: l.impactAnnual?.high || (l.impactMonthly?.high ?? 0) * 12,
      midpoint: l.impactAnnual?.likely || (l.impactMonthly?.likely ?? 0) * 12,
      benchmark: l.impactStatement || l.description || "",
      fix: l.fix || "",
      tool_name: null,
      tool_url: null,
      verified: false,
      source: l.type || "prescan",
      confidence: l.confidence ?? 0.7,
    }));

    const passedChecks = (prescanResult.confirmedLeaks || [])
      .filter((_: any, i: number) => false) // confirmed = problems, not passes
      .map((l: any) => l.title);
    // Actually, "removed" items from the prescan are the passes
    // We don't have them directly, but possibleLeaks with source "statistical_residual" = YES answers
    const passedFromPossible = (prescanResult.possibleLeaks || [])
      .filter((l: any) => l.source === "statistical_residual")
      .map((l: any) => ({ title: l.title, category: l.category }));

    const totalLeak = prescanResult.summary?.totalAnnual ?? 0;
    const leakCount = allLeaks.length;
    const questionCount = 5; // standard quiz size

    const categoryBreakdown: Record<string, number> = {};
    for (const l of allLeaks) {
      const cat = l.category || "Other";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (l.impactAnnual?.likely || (l.impactMonthly?.likely ?? 0) * 12);
    }

    const industryDisplay = prescanResult.industry?.name || industry;

    const { data: saved, error: saveErr } = await supabase
      .from("prescan_results")
      .insert({
        userId: userId,
        industry: industry,
        industry_display: industryDisplay,
        tier: tier || "mid-size-business",
        revenue_estimate: revenue ? revenue * 12 : null,
        total_leak_amount: totalLeak,
        leak_count: leakCount,
        question_count: questionCount,
        confirmed_leaks: confirmedForStorage,
        passed_checks: passedFromPossible,
        category_breakdown: categoryBreakdown,
        payment_status: "free",
      })
      .select("id")
      .single();

    if (saveErr) {
      console.error("Failed to save prescan_results:", saveErr);
      return NextResponse.json({ error: "Failed to save scan results" }, { status: 500 });
    }

    const scanId = saved.id;

    // ─── 2. Generate user_actions ────────────────────────────────────────────
    // Only from confirmed + probable (skip possible — too speculative)
    const actionLeaks = [
      ...(prescanResult.confirmedLeaks || []),
      ...(prescanResult.probableLeaks || []).slice(0, 10), // cap probable at 10
    ];

    // Sort by impact
    actionLeaks.sort((a: any, b: any) =>
      (b.impactMonthly?.likely ?? 0) - (a.impactMonthly?.likely ?? 0)
    );

    const actions = actionLeaks.map((leak: any, i: number) => ({
      userId: userId,
      scanId: scanId,
      action_type: "fix",
      source: "prescan",
      leak_title: leak.title,
      leak_description: leak.impactStatement || leak.description || "",
      leak_category: leak.category,
      severity: leak.severity || "medium",
      estimated_value: leak.impactAnnual?.likely || (leak.impactMonthly?.likely ?? 0) * 12,
      verified: false,
      fix_description: leak.fix || "",
      status: "pending",
      priority: i < 3 ? "this_week" : i < 8 ? "this_month" : "this_quarter",
      display_order: i + 1,
    }));

    if (actions.length > 0) {
      const { error: actErr } = await supabase.from("user_actions").insert(actions);
      if (actErr) console.error("Failed to insert user_actions:", actErr);
    }

    // ─── 3. Save fix plan tools as switch actions ────────────────────────────
    const fixPlan = prescanResult.fixPlan || [];
    const toolActions = fixPlan
      .filter((f: any) => f.type === "paid" && f.url)
      .slice(0, 5)
      .map((fix: any, i: number) => ({
        userId: userId,
        scanId: scanId,
        action_type: "switch",
        source: "prescan",
        leak_title: `Try ${fix.name}`,
        leak_description: fix.description,
        leak_category: fix.category || "Tool",
        severity: "medium",
        estimated_value: 0,
        verified: false,
        recommended_tool: fix.name,
        affiliate_url: fix.url,
        fix_description: fix.description,
        status: "pending",
        priority: "this_month",
        display_order: actions.length + i + 1,
      }));

    if (toolActions.length > 0) {
      const { error: toolErr } = await supabase.from("user_actions").insert(toolActions);
      if (toolErr) console.error("Failed to insert tool actions:", toolErr);
    }

    // ─── 4. Create/update user_progress ──────────────────────────────────────
    const { error: progErr } = await supabase
      .from("user_progress")
      .upsert({
        userId: userId,
        total_leak_found: totalLeak,
        total_recovered: 0,
        total_verified_leak: 0,
        actions_total: actions.length + toolActions.length,
        actions_completed: 0,
        actions_in_progress: 0,
        last_prescan_date: new Date().toISOString(),
        scan_count: 1,
        quickbooks_connected: false,
        bank_connected: false,
        contracts_uploaded: 0,
      }, { onConflict: "userId" });

    if (progErr) console.error("Failed to upsert user_progress:", progErr);

    // Auto-assign HOT leads (score >= 60) to best available rep
    try {
      const { scoreLeadQuality } = await import("@/lib/lead-score");
      const annualRev = revenue ? revenue * 12 : 0;
      const { score } = scoreLeadQuality({
        annualRevenue: annualRev,
        estimatedLeak: totalLeak,
        province:      (req as any)._parsedBody?.province || (prescanResult as any)?.province || null,
        hasAccountant: (prescanResult as any)?.has_accountant ?? null,
        lastTaxReview: (prescanResult as any)?.last_tax_review || null,
        doesRd:        (prescanResult as any)?.does_rd ?? null,
        employeeCount: employees ?? null,
        industry:      industry || null,
        daysInPipeline: 0,
      });

      if (score >= 60 && userId) {
        const { data: existingPipe } = await supabase
          .from("tier3_pipeline").select("id").eq("user_id", userId).maybeSingle();

        if (!existingPipe) {
          const { data: reps } = await supabase
            .from("tier3_reps").select("id, province").eq("status", "active")
            .order("created_at", { ascending: true });
          const prov = (prescanResult as any)?.province;
          const rep = (reps || []).find((r: any) => r.province === prov) || reps?.[0];
          if (rep) {
            const baseUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
            fetch(baseUrl + "/api/admin/assign-rep", {
              method: "POST",
              headers: { "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.CRON_SECRET },
              body: JSON.stringify({ userId, repId: rep.id,
                notes: "Auto-assigned. Score: " + score + ". Leak: $" + totalLeak }),
            }).catch(() => {});
          }
        }
      }
    } catch { /* non-fatal */ }

    return NextResponse.json({
      success: true,
      scanId,
      actionsGenerated: actions.length + toolActions.length,
      totalLeak,
    });

  } catch (error: any) {
    console.error("V2 prescan save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
