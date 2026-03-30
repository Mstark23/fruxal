// =============================================================================
// src/lib/find-user-leaks.ts — Find leaks for a user across ALL data paths
// =============================================================================
// Path 0: prescan_results (teaser_leaks / confirmed_leaks JSONB)
// Path 1: prescan_runs.user_id → detected_leaks
// Path 2: prescan_runs.business_id → detected_leaks
// Path 3: detected_leaks.business_id directly
// Path 3.5: Orphan prescan repair (timing match)
// Path 4: provincial_leak_detectors (generic fallback)
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";

export interface LeakResult {
  slug: string;
  title: string;
  severity: string;
  category: string;
  description: string;
  impact_min: number;
  impact_max: number;
  impact_pct: number | null;
  solution_type: string;
  solution_steps: any[];
  status: string;
  savings_amount: number;
  fixed_at: string | null;
  confidence: number | null;
  priority: number;
  affiliates: { name: string; slug: string; url: string; description: string; category: string }[];
}

export interface LeakLookupResult {
  leaks: LeakResult[];
  healthScore: number | null;
  province: string;
  industry: string;
  businessId: string | null;
}

export async function findUserLeaks(userId: string): Promise<LeakLookupResult> {
  // ─── Profile ───────────────────────────────────────────
  const { data: profile } = await supabaseAdmin
    .from("business_profiles")
    .select("business_id, province, industry, industry_label")
    .eq("user_id", userId)
    .single();

  const businessId = profile?.business_id || null;
  const province = profile?.province || "";
  const industry = profile?.industry_label || profile?.industry || "Small Business";

  // ─── Status tracking map ───────────────────────────────
  const { data: statusRows } = await supabaseAdmin
    .from("user_leak_status")
    .select("leak_slug, status, savings_amount, fixed_at")
    .eq("user_id", userId);
  const statusMap: Record<string, any> = {};
  for (const s of statusRows || []) statusMap[s.leak_slug] = s;

  let rawLeaks: any[] = [];
  let healthScore: number | null = null;

  // ═══ PATH 0: prescan_results table ═══════════════════════
  // This is THE table the prescan page reads from. Contains JSONB
  // with teaser_leaks and/or confirmed_leaks. Two column naming
  // conventions exist: user_id (087 schema) and userId (save route).
  if (rawLeaks.length === 0) {
    try {
      let pr: any = null;

      const { data: pr1 } = await supabaseAdmin
        .from("prescan_results")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (pr1?.[0]) pr = pr1[0];

      if (!pr) {
        const { data: pr2 } = await supabaseAdmin
          .from("prescan_results")
          .select("*")
          .eq("userId", userId)
          .order("created_at", { ascending: false })
          .limit(1);
        if (pr2?.[0]) pr = pr2[0];
      }

      if (pr) {
        const summary = pr.summary || {};
        healthScore = summary.health_score || pr.health_score || null;

        // teaser_leaks: [{slug, title, title_fr, severity, impact_min, impact_max, category}]
        const teaser = pr.teaser_leaks || [];
        // confirmed_leaks: [{title, category, severity, low, high, midpoint, benchmark, fix, confidence}]
        const confirmed = pr.confirmed_leaks || [];

        if (teaser.length > 0) {
          rawLeaks = teaser.map((l: any) => ({
            leak_type_code: l.slug || l.title?.toLowerCase().replace(/\s+/g, "_"),
            title: l.title || l.title_fr || "Unknown", // EN primary, FR fallback
            severity: l.severity || "medium",
            category: l.category || "general",
            description: l.description || "",
            annual_impact_min: l.impact_min ?? 0,
            annual_impact_max: l.impact_max ?? 0,
            evidence: { confidence_score: l.confidence || null },
            priority_score: l.severity === "critical" ? 90 : l.severity === "high" ? 70 : 50,
            affiliates: l.affiliates || [],
          }));
        } else if (confirmed.length > 0) {
          rawLeaks = confirmed.map((l: any) => ({
            leak_type_code: l.title?.toLowerCase().replace(/\s+/g, "_") || "unknown",
            title: l.title || "Unknown",
            severity: l.severity || "medium",
            category: l.category || "general",
            description: l.benchmark || "",
            annual_impact_min: l.low ?? 0,
            annual_impact_max: l.high ?? 0,
            evidence: { confidence_score: l.confidence || null },
            priority_score: l.severity === "critical" ? 90 : l.severity === "high" ? 70 : 50,
            affiliates: l.affiliates || [],
          }));
        }

        if (rawLeaks.length > 0) {
          process.env.NODE_ENV !== "production" && console.log(`✅ findUserLeaks PATH 0: ${rawLeaks.length} leaks from prescan_results`);
        }
      }
    } catch (e: any) {
      console.warn("⚠️ PATH 0 prescan_results:", e.message);
    }
  }

  // ═══ PATH 1: prescan_runs by user_id ═══════════════════
  if (rawLeaks.length === 0) {
    const { data: runByUser } = await supabaseAdmin
      .from("prescan_runs")
      .select("id, health_score")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (runByUser?.[0]) {
      healthScore = runByUser[0].health_score;
      const { data: dl } = await supabaseAdmin
        .from("detected_leaks")
        .select("*")
        .eq("prescan_run_id", runByUser[0].id)
        .order("priority_score", { ascending: false });
      if (dl && dl.length > 0) rawLeaks = dl;
    }
  }

  // ═══ PATH 2: prescan_runs by business_id ═══════════════
  if (rawLeaks.length === 0 && businessId) {
    const { data: runByBiz } = await supabaseAdmin
      .from("prescan_runs")
      .select("id, health_score")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (runByBiz?.[0]) {
      healthScore = runByBiz[0].health_score;
      const { data: dl } = await supabaseAdmin
        .from("detected_leaks")
        .select("*")
        .eq("prescan_run_id", runByBiz[0].id)
        .order("priority_score", { ascending: false });
      if (dl && dl.length > 0) rawLeaks = dl;
    }
  }

  // ═══ PATH 3: detected_leaks.business_id directly ═══════
  if (rawLeaks.length === 0 && businessId) {
    const { data: dl } = await supabaseAdmin
      .from("detected_leaks")
      .select("*")
      .eq("business_id", businessId)
      .order("priority_score", { ascending: false });
    if (dl && dl.length > 0) rawLeaks = dl;
  }

  // ═══ PATH 3.5: ORPHAN REPAIR ═══════════════════════════
  if (rawLeaks.length === 0) {
    try {
      const { data: userRecord } = await supabaseAdmin
        .from("users")
        .select("created_at")
        .eq("id", userId)
        .single();

      if (userRecord?.created_at) {
        const regTime = new Date(userRecord.created_at);
        const windowStart = new Date(regTime.getTime() - 24 * 60 * 60 * 1000);

        const { data: orphans } = await supabaseAdmin
          .from("prescan_runs")
          .select("id, health_score, province, industry_slug")
          .is("user_id", null)
          .gte("created_at", windowStart.toISOString())
          .lte("created_at", regTime.toISOString())
          .order("created_at", { ascending: false })
          .limit(5);

        if (orphans && orphans.length > 0) {
          let best = orphans[0];
          if (province !== "QC") {
            const matched = orphans.find(o => o.province === province);
            if (matched) best = matched;
          }
          healthScore = best.health_score;

          await supabaseAdmin.from("prescan_runs").update({
            user_id: userId, business_id: businessId,
          }).eq("id", best.id).then(null, () => {});

          if (businessId) {
            await supabaseAdmin.from("detected_leaks").update({
              business_id: businessId,
            }).eq("prescan_run_id", best.id).then(null, () => {});
          }

          const { data: dl } = await supabaseAdmin
            .from("detected_leaks")
            .select("*")
            .eq("prescan_run_id", best.id)
            .order("priority_score", { ascending: false });
          if (dl && dl.length > 0) rawLeaks = dl;
        }
      }
    } catch (e: any) {
      console.warn("⚠️ Orphan repair:", e.message);
    }
  }

  // ═══ PATH 4: provincial_leak_detectors (generic) ═══════
  if (rawLeaks.length === 0) {
    const { data: generic } = await supabaseAdmin
      .from("provincial_leak_detectors")
      .select("*")
      .in("province", province ? [province, "ALL"] : ["ALL"])
      .eq("is_active", true)
      .order("annual_impact_max", { ascending: false });

    if (generic && generic.length > 0) {
      const leaks: LeakResult[] = generic.map(g => {
        const tracked = statusMap[g.slug];
        return {
          slug: g.slug, title: g.title || g.slug,
          severity: g.severity || "medium", category: g.category || "general",
          description: g.description || "",
          impact_min: g.annual_impact_min ?? 0, impact_max: g.annual_impact_max ?? 0,
          impact_pct: null, solution_type: g.solution_type || "professional",
          solution_steps: g.solution_steps || [],
          status: tracked?.status || "detected", savings_amount: tracked?.savings_amount ?? 0,
          fixed_at: tracked?.fixed_at || null, confidence: null, priority: 50,
          affiliates: [],
        };
      });
      return { leaks, healthScore, province, industry, businessId };
    }
  }

  // ─── Map rawLeaks → LeakResult ─────────────────────────
  const leaks: LeakResult[] = rawLeaks.map(dl => {
    const slug = dl.leak_type_code || dl.slug || "unknown";
    const tracked = statusMap[slug];
    const evidence = dl.evidence || {};
    return {
      slug,
      title: dl.title || slug.replace(/_/g, " "),
      severity: dl.severity || "medium",
      category: dl.category || "general",
      description: dl.description || "",
      impact_min: dl.annual_impact_min ?? 0,
      impact_max: dl.annual_impact_max ?? 0,
      impact_pct: dl.impact_pct || null,
      solution_type: "professional",
      solution_steps: [],
      status: tracked?.status || "detected",
      savings_amount: tracked?.savings_amount ?? 0,
      fixed_at: tracked?.fixed_at || null,
      confidence: evidence.confidence_score || null,
      priority: dl.priority_score || 50,
      affiliates: dl.affiliates || [],
    };
  });

  return { leaks, healthScore, province, industry, businessId };
}
