// =============================================================================
// lib/ai/prescan-context.ts
// getPrescanContext(businessId, userId) — assembles prescan summary for
// injection into the diagnostic prompt and advisor chat context.
//
// Entirely defensive: every field access uses optional chaining.
// Returns null on ANY error — a broken prescan must never break a diagnostic.
// 180-day staleness cutoff enforced.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";

export interface PrescanLeak {
  category:              string;
  title:                 string;
  estimatedMonthlyLoss:  number;
  severity:              "high" | "medium" | "low";
  slug?:                 string;
}

export interface PrescanContext {
  prescanRunId:         string;
  completedAt:          Date;
  industry:             string;
  province:             string;
  revenueBand:          string;
  employeeCount:        string;
  topLeaks:             PrescanLeak[];
  rawAnswers:           Record<string, any>;
  totalEstimatedLoss:   number;
  daysSincePrescan:     number;
}

const MAX_PRESCAN_AGE_DAYS = 180;

// ── Severity normalizer ───────────────────────────────────────────────────────
function normalizeSeverity(raw: any): "high" | "medium" | "low" {
  const s = String(raw || "").toLowerCase();
  if (s === "critical" || s === "high" || Number(raw) >= 60) return "high";
  if (s === "medium" || Number(raw) >= 30) return "medium";
  return "low";
}

// ── Monthly loss from annual impact ──────────────────────────────────────────
function toMonthly(annual: any): number {
  const n = Number(annual ?? 0);
  return isFinite(n) ? Math.round(n / 12) : 0;
}

export async function getPrescanContext(
  businessId: string,
  userId: string
): Promise<PrescanContext | null> {
  try {
    if (!userId) return null;

    // ── Try prescan_results first (richer data) ───────────────────────────
    // Query by user_id (most common — after bridge) OR by prescan_run_id in business_profiles
    const { data: resultRows } = await supabaseAdmin
      .from("prescan_results")
      .select("prescan_run_id, user_id, input_snapshot, summary, teaser_leaks, province, industry, created_at, tier")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    const resultRow = resultRows?.[0] ?? null;

    // ── Also fetch detected_leaks for richer leak data ────────────────────
    let detectedLeaks: any[] = [];
    if (resultRow?.prescan_run_id) {
      const { data: dl } = await supabaseAdmin
        .from("detected_leaks")
        .select("title, category, severity, annual_impact_min, annual_impact_max, leak_type_code")
        .eq("prescan_run_id", resultRow.prescan_run_id)
        .limit(10);
      detectedLeaks = dl ?? [];
    }

    // ── Fall back to prescan_runs if no prescan_results ───────────────────
    let prescanRunId: string | null = resultRow?.prescan_run_id ?? null;
    let createdAt: string | null = resultRow?.created_at ?? null;
    let industry: string = resultRow?.industry ?? resultRow?.input_snapshot?.industry ?? "business";
    let province: string = resultRow?.province ?? resultRow?.input_snapshot?.province ?? "Canada";
    let monthlyRevenue: number = Number(resultRow?.input_snapshot?.monthly_revenue ?? 0);

    if (!prescanRunId) {
      // Try prescan_runs directly
      const { data: runRows } = await supabaseAdmin
        .from("prescan_runs")
        .select("id, user_id, industry_slug, province, annual_revenue, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      const run = runRows?.[0] ?? null;
      if (!run) return null;

      prescanRunId = run.id;
      createdAt    = run.created_at;
      industry     = run.industry_slug ?? "business";
      province     = run.province ?? "Canada";
      monthlyRevenue = Math.round(Number(run.annual_revenue ?? 0) / 12);
    }

    if (!prescanRunId || !createdAt) return null;

    // ── Staleness check ───────────────────────────────────────────────────
    const completedAt = new Date(createdAt);
    if (isNaN(completedAt.getTime())) return null;

    const daysSincePrescan = Math.floor((Date.now() - completedAt.getTime()) / 86400000);
    if (daysSincePrescan > MAX_PRESCAN_AGE_DAYS) return null;

    // ── Build topLeaks from teaser_leaks + detected_leaks ────────────────
    const teaserLeaks: any[] = Array.isArray(resultRow?.teaser_leaks)
      ? resultRow.teaser_leaks : [];

    // Prefer detected_leaks (more detail), fall back to teaser_leaks
    const leakSource = detectedLeaks.length > 0 ? detectedLeaks : teaserLeaks;

    const topLeaks: PrescanLeak[] = leakSource
      .slice(0, 5)
      .map((l: any) => ({
        category:             String(l?.category ?? l?.leak_type ?? "general").slice(0, 50),
        title:                String(l?.title ?? l?.leak_type_code ?? "Unknown issue").slice(0, 80),
        estimatedMonthlyLoss: detectedLeaks.length > 0
          ? toMonthly(l?.annual_impact_min ?? l?.annual_impact_max)
          : Math.round(Number(l?.amount ?? l?.monthly_impact ?? 0)),
        severity:             normalizeSeverity(l?.severity ?? l?.severity_score),
        slug:                 String(l?.leak_type_code ?? l?.slug ?? "").slice(0, 50) || undefined,
      }))
      .filter(l => l.title && l.title !== "Unknown issue");

    // ── Total estimated loss ──────────────────────────────────────────────
    const summaryMin = Number(resultRow?.summary?.leak_range_min ?? 0);
    const totalAnnualFromLeaks = detectedLeaks.reduce(
      (s, l) => s + Number(l?.annual_impact_min ?? 0), 0
    );
    const totalEstimatedLoss = Math.round(
      detectedLeaks.length > 0
        ? totalAnnualFromLeaks / 12
        : summaryMin / 12
    );

    // ── Revenue band label ────────────────────────────────────────────────
    const revenueBand = monthlyRevenue > 100000 ? "$100K+/mo"
      : monthlyRevenue > 50000 ? "$50K–$100K/mo"
      : monthlyRevenue > 15000 ? "$15K–$50K/mo"
      : monthlyRevenue > 5000  ? "$5K–$15K/mo"
      : monthlyRevenue > 0 ? `~$${(monthlyRevenue ?? 0).toLocaleString()}/mo`
      : "Not specified";

    return {
      prescanRunId,
      completedAt,
      industry,
      province,
      revenueBand,
      employeeCount: String(resultRow?.input_snapshot?.employee_count ?? "unknown"),
      topLeaks,
      rawAnswers: (resultRow?.input_snapshot ?? {}) as Record<string, any>,
      totalEstimatedLoss,
      daysSincePrescan,
    };
  } catch (err: any) {
    // Never throw — log and return null
    console.error("[getPrescanContext] Error:", err?.message ?? "unknown");
    return null;
  }
}
