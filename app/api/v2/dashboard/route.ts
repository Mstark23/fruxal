// =============================================================================
// app/api/v2/dashboard/route.ts — DASHBOARD DATA API
// =============================================================================
// Every non-critical query is wrapped in try/catch.
// If a table doesn't exist or is empty, we return safe defaults.
// Only two things matter: profile + leaks. Everything else is optional.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { findUserLeaks } from "@/lib/find-user-leaks";
import crypto from "crypto";

export const maxDuration = 30; // Vercel function timeout (seconds)

// Safe import — leak-explanations may not be deployed yet
let getLeakExplanation: any = null;
try { getLeakExplanation = require("@/lib/leak-explanations").getLeakExplanation; } catch { /* non-fatal */ }

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const prescanRunId = req.nextUrl.searchParams.get("prescanRunId");

    // ═══════════════════════════════════════════════════════════
    // 1. PROFILE — try user's business_profiles first
    // ═══════════════════════════════════════════════════════════
    let profile: any = null;
    try {
      const { data } = await supabaseAdmin
        .from("business_profiles")
        .select("province, country, industry, industry_label, business_structure, annual_revenue, exact_annual_revenue, employee_count, has_accountant, business_id, business_name")
        .eq("user_id", userId)
        .single();
      profile = data;
    } catch { /* non-fatal */ }

    // If no profile but we have prescanRunId, build one from prescan_runs
    if (!profile && prescanRunId) {
      try {
        const { data: run } = await supabaseAdmin
          .from("prescan_runs")
          .select("industry_slug, province, annual_revenue, health_score")
          .eq("id", prescanRunId)
          .single();

        if (run) {
          const newBizId = crypto.randomUUID();

          await supabaseAdmin.from("business_profiles").upsert({
            business_id: newBizId, user_id: userId,
            industry: run.industry_slug || "generic_small_business",
            industry_slug: run.industry_slug || "generic_small_business",
            province: run.province || "QC",
            annual_revenue: run.annual_revenue || null,
            onboarding_completed: true,
            tour_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" }).throwOnError();

          // Bridge prescan data to user
          await supabaseAdmin.from("prescan_runs")
            .update({ user_id: userId, business_id: newBizId })
            .eq("id", prescanRunId).is("user_id", null);
          await supabaseAdmin.from("detected_leaks")
            .update({ business_id: newBizId })
            .eq("prescan_run_id", prescanRunId);
          // Also update prescan_results so getPrescanContext can find it by user_id
          await supabaseAdmin.from("prescan_results")
            .update({ user_id: userId })
            .eq("prescan_run_id", prescanRunId)
            .is("user_id", null);

          profile = {
            province: run.province || "QC",
            industry: run.industry_slug || "generic_small_business",
            industry_label: null,
            business_structure: null,
            annual_revenue: run.annual_revenue,
            has_accountant: false,
            business_id: newBizId,
          };
        }
      } catch (e: any) {
        console.warn("[Dashboard] prescan bridge failed:", e.message);
      }
    }

    // Still no profile — return minimal empty state
    if (!profile) {
      return NextResponse.json({
        success: true,
        data: {
          tier: "solo",
          profile: { province: "QC", industry: "Small Business", structure: "" },
          health_score: 50, total_leak_estimate: 0,
          leaks: { total: 0, detected: 0, fixed: 0, total_savings: 0, potential_savings: 0, top_unfixed: [] },
          obligations: { total: 0, overdue: 0, upcoming_deadlines: [], penalty_exposure: 0 },
          programs: { available: 0 },
        },
      });
    }

    // businessId is always available from here on — profile is guaranteed non-null
    const businessId: string = profile.business_id || "";

    // ═══════════════════════════════════════════════════════════
    // 2. LEAKS — the core data
    // ═══════════════════════════════════════════════════════════
    let allLeaks: any[] = [];

    // Path A: findUserLeaks (multi-path)
    try {
      const result = await findUserLeaks(userId);
      allLeaks = result.leaks || [];
    } catch (e: any) {
      console.warn("[Dashboard] findUserLeaks failed:", e.message);
    }

    // Path B: direct prescanRunId lookup if Path A returned nothing
    if (allLeaks.length === 0 && prescanRunId) {
      try {
        const { data: directLeaks } = await supabaseAdmin
          .from("detected_leaks")
          .select("*")
          .eq("prescan_run_id", prescanRunId);

        if (directLeaks && directLeaks.length > 0) {
          allLeaks = directLeaks.map((dl: any) => ({
            slug: dl.leak_type_code || "unknown",
            title: dl.title || (dl.leak_type_code || "").replace(/_/g, " "),
            severity: dl.severity || "medium",
            category: dl.category || "general",
            description: dl.description || "",
            impact_min: dl.annual_impact_min ?? 0,
            impact_max: (dl.annual_impact_max || dl.annual_impact_min) ?? 0,
            solution_type: "professional",
            status: "detected", savings_amount: 0,
            confidence: dl.evidence?.confidence_score || null,
            affiliates: dl.affiliates || [],
          }));
        }
      } catch { /* non-fatal */ }
    }

    // Path C: prescan_results JSONB by prescanRunId
    if (allLeaks.length === 0 && prescanRunId) {
      try {
        const { data: pr } = await supabaseAdmin
          .from("prescan_results")
          .select("teaser_leaks, confirmed_leaks")
          .eq("prescan_run_id", prescanRunId) // was temp_user_id — wrong column for prescan_results
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const jsonLeaks = pr?.confirmed_leaks || pr?.teaser_leaks || [];
        if (Array.isArray(jsonLeaks) && jsonLeaks.length > 0) {
          allLeaks = jsonLeaks.map((jl: any) => ({
            slug: jl.slug || jl.leak_type_code || "unknown",
            title: jl.title || (jl.slug || "").replace(/_/g, " "),
            severity: jl.severity || "medium",
            category: jl.category || "general",
            description: jl.description || "",
            impact_min: (jl.annual_impact_min || jl.amount) ?? 0,
            impact_max: (jl.annual_impact_max || jl.amount) ?? 0,
            solution_type: "professional",
            status: "detected", savings_amount: 0,
            confidence: jl.confidence || null,
            affiliates: jl.affiliates || [],
          }));
        }
      } catch { /* non-fatal */ }
    }

    // Path D: prescan_results JSONB by user_id
    if (allLeaks.length === 0) {
      try {
        const { data: pr } = await supabaseAdmin
          .from("prescan_results")
          .select("teaser_leaks, confirmed_leaks")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const jsonLeaks = pr?.confirmed_leaks || pr?.teaser_leaks || [];
        if (Array.isArray(jsonLeaks) && jsonLeaks.length > 0) {
          allLeaks = jsonLeaks.map((jl: any) => ({
            slug: jl.slug || jl.leak_type_code || "unknown",
            title: jl.title || (jl.slug || "").replace(/_/g, " "),
            severity: jl.severity || "medium",
            category: jl.category || "general",
            description: jl.description || "",
            impact_min: (jl.annual_impact_min || jl.amount) ?? 0,
            impact_max: (jl.annual_impact_max || jl.amount) ?? 0,
            solution_type: "professional",
            status: "detected", savings_amount: 0,
            confidence: jl.confidence || null,
            affiliates: jl.affiliates || [],
          }));
        }
      } catch { /* non-fatal */ }
    }

    const detected = allLeaks.filter(l => l.status === "detected");
    const fixed = allLeaks.filter(l => l.status === "fixed");
    const totalLeak = detected.reduce((s, l) => s + (l.impact_min ?? 0), 0);

    // Enrich top leaks with explanation/proof/action
    const topUnfixed = detected
      .sort((a, b) => ((b.impact_max || b.impact_min) ?? 0) - ((a.impact_max || a.impact_min) ?? 0))
      .slice(0, 10)
      .map(l => {
        let proof = "", action = "", description = l.description || "";
        if (getLeakExplanation) {
          try {
            const expl = getLeakExplanation(l.slug, {}, l.impact_min ?? 0, "en");
            proof = expl?.proof || "";
            action = expl?.action || "";
            if (!description) description = expl?.explanation || "";
          } catch { /* non-fatal */ }
        }
        return {
          slug: l.slug, title: l.title, severity: l.severity,
          category: l.category, description,
          impact_min: l.impact_min ?? 0, impact_max: (l.impact_max || l.impact_min) ?? 0,
          confidence: l.confidence || null, solution_type: l.solution_type || "professional",
          proof, action, affiliates: l.affiliates || [],
        };
      });

    // ═══════════════════════════════════════════════════════════
    // 3. OPTIONAL DATA — all wrapped in try/catch
    // ═══════════════════════════════════════════════════════════

    // Obligations
    let obligations: any = { total: 0, overdue: 0, upcoming_deadlines: [], penalty_exposure: 0 };
    try {
      const { data: obs } = await supabaseAdmin
        .from("user_obligations")
        .select("id, obligation_slug, status, next_deadline, obligation_rules ( title, category, risk_level, penalty_max )")
        .eq("user_id", userId)
        .order("next_deadline", { ascending: true, nullsFirst: false });

      if (obs && obs.length > 0) {
        const overdueObs = obs.filter(o => o.status === "overdue");
        const upcoming = obs.filter(o => o.status === "upcoming" && o.next_deadline);
        const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

        obligations = {
          total: obs.length,
          overdue: overdueObs.length,
          penalty_exposure: obs
            .filter(o => o.status !== "completed")
            .reduce((s, o) => s + ((o as any).obligation_rules?.penalty_max ?? 0), 0),
          upcoming_deadlines: upcoming
            .filter(o => o.next_deadline! <= thirtyDays)
            .slice(0, 5)
            .map(o => ({
              slug: o.obligation_slug,
              title: (o as any).obligation_rules?.title || o.obligation_slug,
              category: (o as any).obligation_rules?.category || "general",
              risk_level: (o as any).obligation_rules?.risk_level || "medium",
              deadline: o.next_deadline,
              days_until: Math.ceil((new Date(o.next_deadline!).getTime() - Date.now()) / 86400000),
              penalty_max: (o as any).obligation_rules?.penalty_max ?? 0,
            })),
        };
      }
    } catch { /* non-fatal */ }

    // Tier — T1/T2 are always "solo" or "business" (free).
    // "enterprise" tier is ONLY set when a business is manually enrolled in T3
    // by Jhordan (via the admin pipeline). Revenue size alone never gates to enterprise.
    let tier = "solo";
    try {
      const { data: biz } = await supabaseAdmin
        .from("businesses")
        .select("tier")
        .eq("owner_user_id", userId)
        .single();

      if (biz?.tier) {
        const rawTier = biz.tier.toLowerCase();
        if (rawTier === "enterprise" || rawTier === "corp") {
          // Only honour enterprise tier if they're in the T3 pipeline
          // (i.e. Jhordan has actively enrolled them, not just revenue-detected)
          const { data: pipe } = await supabaseAdmin
            .from("tier3_pipeline")
            .select("id, stage")
            .eq("user_id", userId)
            .in("stage", ["active", "onboarding", "engaged", "closed_won"])
            .maybeSingle();
          tier = pipe ? "enterprise" : "solo"; // not in active T3 = stays solo/free
        } else {
          tier = rawTier;
        }
      }
    } catch { /* non-fatal */ }
    // "free" tier → treat as "solo"
    if (tier === "free") tier = "solo";

    // Recommended plan -- from revenue + prescan tier + paid tier
    let recommended_plan = "solo";
    try {
      // Use exact_annual_revenue (from intake) first, fall back to annual_revenue (from prescan)
      const rev = (profile?.exact_annual_revenue || profile?.annual_revenue) ?? 0;
      const empCount = profile?.employee_count ?? 0;

      // Revenue-based qualification — solo threshold raised to avoid false enterprise routing
      if (rev >= 1_000_000 || empCount >= 50)   recommended_plan = "enterprise";
      else if (rev >= 150_000 || empCount >= 3)  recommended_plan = "business";

      // Paid tier overrides if higher
      if (tier === "business" || tier === "enterprise") recommended_plan = tier;

      // Prescan fallback
      if (recommended_plan === "solo") {
        const { data: pr } = await supabaseAdmin
          .from("prescan_results")
          .select("tier")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (pr?.tier) {
          const pt = pr.tier.toLowerCase();
          if (pt === "growth" || pt === "business" || pt === "small") recommended_plan = "business";
          else if (pt === "enterprise") recommended_plan = "enterprise";
        }
      }
    } catch { /* non-fatal */ }

    // Programs count — use affiliate_partners with is_government_program flag
    let programsAvailable = 0;
    try {
      const { count } = await supabaseAdmin
        .from("affiliate_partners")
        .select("*", { count: "exact", head: true })
        .eq("is_government_program", true)
        .eq("active", true);
      programsAvailable = count || 7; // fallback to known count
    } catch { programsAvailable = 7; }

    // Health score — use prescan BHS as base when available, adjust live
    // Pull rep-confirmed recovery total from user_progress (set by rep confirmation flow)
    let repConfirmedRecovered = 0;
    try {
      const { data: prog } = await supabaseAdmin
        .from("user_progress")
        .select("total_recovered")
        .eq("user_id", userId)
        .maybeSingle();
      repConfirmedRecovered = prog?.total_recovered ?? 0;
    } catch { /* non-fatal */ }

    const struct = profile.business_structure || "";
    let score = 72;
    try {
      const { data: latestRun } = await supabaseAdmin
        .from("prescan_runs")
        .select("health_score")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (latestRun?.health_score) score = latestRun.health_score;
    } catch { /* use default 72 */ }
    score -= Math.min(20, (obligations.overdue ?? 0) * 4);
    score += Math.min(8, fixed.length * 2);
    score = Math.max(8, Math.min(95, score));

    // ═══════════════════════════════════════════════════════════
    // 4. RESPONSE
    // ═══════════════════════════════════════════════════════════

    // Fetch assigned rep (non-fatal)
    // Lookup path: user_id → tier3_pipeline(user_id) → pipeline_id
    //              → tier3_rep_assignments(pipeline_id) → rep_id → tier3_reps
    let assigned_rep: { name: string; calendly_url: string | null; contingency_rate: number; pipeline_stage: string | null } | null = null;
    try {
      // Step 1: find the user's active pipeline entry
      const { data: pipeline } = await supabaseAdmin
        .from("tier3_pipeline")
        .select("id, stage")
        .eq("user_id", userId)
        .in("stage", ["contacted", "called", "diagnostic_sent", "agreement_out",
                       "signed", "in_engagement", "recovery_tracking", "engaged",
                       "onboarding", "active", "closed_won"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pipeline?.id) {
        // Step 2: find rep assignment for this pipeline entry
        const { data: assignment } = await supabaseAdmin
          .from("tier3_rep_assignments")
          .select("rep_id, call_booked_at, tier3_reps(name, calendly_url, contingency_rate)")
          .eq("pipeline_id", pipeline.id)
          .maybeSingle();

        if (assignment?.rep_id) {
          const rep = (assignment as any).tier3_reps;
          assigned_rep = {
            name: rep?.name || "Your Fruxal Rep",
            calendly_url: rep?.calendly_url || null,
            contingency_rate: rep?.contingency_rate ?? 12,
            pipeline_stage: pipeline.stage || null,
          };
        }
      }
    } catch { /* non-fatal — rep assignment is optional */ }

    return NextResponse.json({
      success: true,
      data: {
        tier,
        recommended_plan,
        businessId,
        profile: {
          province:      profile.province || "QC",
          country:       profile.country || "CA",
          industry:      profile.industry_label || profile.industry || "Small Business",
          structure:     struct,
          business_name: profile.business_name || "",
        },
        health_score: score,
        total_leak_estimate: totalLeak,
        leaks: {
          total: allLeaks.length,
          detected: detected.length,
          fixed: fixed.length,
          total_savings: Math.max(
            fixed.reduce((s, l) => s + (l.savings_amount ?? 0), 0),
            repConfirmedRecovered
          ),
          potential_savings: detected.reduce((s, l) => s + (l.impact_max ?? 0), 0),
          top_unfixed: topUnfixed,
        },
        obligations,
        programs: { available: programsAvailable },
        assigned_rep,
      },
    });

  } catch (err: any) {
    console.error("[Dashboard:GET] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
