// =============================================================================
// GET /api/admin/overview — Admin Business Overview
// =============================================================================
// Aggregates revenue, prescan funnel, users, tier 3 pipeline, and system status.
// All queries run in parallel. Individual failures default to 0.
// Cached for 60 seconds via Cache-Control header.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30; // Vercel function timeout (seconds)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function startOfLastMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString();
}

function endOfLastMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59).toISOString();
}

function startOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString();
}

function startOfToday(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString();
}

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[Admin:Overview] Query failed:", e);
    return fallback;
  }
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const now = new Date().toISOString();
  const monthStart = startOfMonth();
  const lastMonthStart = startOfLastMonth();
  const lastMonthEnd = endOfLastMonth();
  const weekStart = startOfWeek();
  const todayStart = startOfToday();
  const d7 = daysAgo(7);
  const d30 = daysAgo(30);
  const h24 = hoursAgo(24);

  // ═══════════════════════════════════════════════════════════════════════════
  // ALL QUERIES IN PARALLEL
  // ═══════════════════════════════════════════════════════════════════════════

  const [
    // Users
    usersTotal,
    usersPaid,
    usersNewWeek,
    usersNewMonth,
    usersActiveToday,

    // Prescans
    prescansToday,
    prescans7d,
    prescans30d,
    prescansAll,
    prescanIndustries,
    prescanProvinces,

    // Tier 3
    tier3All,
    tier3Agreements,

    // Affiliate
    affiliateThisMonth,
  ] = await Promise.all([
    // ─── USERS ───
    safeQuery(async () => {
      const { count } = await supabaseAdmin.from("users").select("id", { count: "exact", head: true });
      return count ?? 0;
    }, 0),

    safeQuery(async () => {
      const { count } = await supabaseAdmin.from("user_progress").select("userId", { count: "exact", head: true }).neq("paid_plan", null).neq("paid_plan", "free").neq("paid_plan", "");
      return count ?? 0;
    }, 0),

    safeQuery(async () => {
      const { count } = await supabaseAdmin.from("users").select("id", { count: "exact", head: true }).gte("created_at", weekStart);
      return count ?? 0;
    }, 0),

    safeQuery(async () => {
      const { count } = await supabaseAdmin.from("users").select("id", { count: "exact", head: true }).gte("created_at", monthStart);
      return count ?? 0;
    }, 0),

    safeQuery(async () => {
      const { count } = await supabaseAdmin.from("users").select("id", { count: "exact", head: true }).gte("last_sign_in_at", h24);
      return count ?? 0;
    }, 0),

    // ─── PRESCANS ───
    safeQuery(async () => {
      const { count } = await supabaseAdmin.from("prescan_runs").select("id", { count: "exact", head: true }).gte("created_at", todayStart);
      return count ?? 0;
    }, 0),

    safeQuery(async () => {
      const { count } = await supabaseAdmin.from("prescan_runs").select("id", { count: "exact", head: true }).gte("created_at", d7);
      return count ?? 0;
    }, 0),

    safeQuery(async () => {
      const { count } = await supabaseAdmin.from("prescan_runs").select("id", { count: "exact", head: true }).gte("created_at", d30);
      return count ?? 0;
    }, 0),

    safeQuery(async () => {
      const { count } = await supabaseAdmin.from("prescan_runs").select("id", { count: "exact", head: true });
      return count ?? 0;
    }, 0),

    safeQuery(async () => {
      const { data } = await supabaseAdmin.from("prescan_runs").select("industry_slug").not("industry_slug", "is", null);
      if (!data) return [];
      const counts: Record<string, number> = {};
      for (const r of data) {
        const ind = r.industry_slug || "unknown";
        counts[ind] = (counts[ind] || 0) + 1;
      }
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([industry, count]) => ({ industry, count }));
    }, [] as Array<{ industry: string; count: number }>),

    safeQuery(async () => {
      const { data } = await supabaseAdmin.from("prescan_runs").select("province").not("province", "is", null);
      if (!data) return [];
      const counts: Record<string, number> = {};
      for (const r of data) {
        const prov = r.province || "unknown";
        counts[prov] = (counts[prov] || 0) + 1;
      }
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([province, count]) => ({ province, count }));
    }, [] as Array<{ province: string; count: number }>),

    // ─── TIER 3 ───
    safeQuery(async () => {
      const { data } = await supabaseAdmin.from("tier3_diagnostics").select("id, status, result, created_at");
      return data || [];
    }, [] as any[]),

    safeQuery(async () => {
      const { data } = await supabaseAdmin.from("tier3_agreements").select("id, status, fee_percentage, diagnostic_id, created_at");
      return data || [];
    }, [] as any[]),

    // ─── AFFILIATE ───
    safeQuery(async () => {
      const { data } = await supabaseAdmin.from("affiliate_referrals").select("commission_amount").gte("created_at", monthStart).not("commission_amount", "is", null);
      if (!data) return 0;
      return data.reduce((sum: number, r: any) => sum + (r.commission_amount ?? 0), 0);
    }, 0),
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTE DERIVED METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  // Users
  const usersFree = Math.max(0, usersTotal - usersPaid);

  // Activation rate: registered users who ran at least one diagnostic
  let activationRate = 0;
  let usersWithDiagnostic = 0;
  try {
    const [{ count: totalUsers }, { count: withDiag }] = await Promise.all([
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("diagnostic_reports")
        .select("user_id", { count: "exact", head: true })
        .not("user_id", "is", null),
    ]);
    usersWithDiagnostic = withDiag ?? 0;
    activationRate = totalUsers && totalUsers > 0
      ? Math.round((usersWithDiagnostic / totalUsers) * 100)
      : 0;
  } catch { /* non-fatal */ }

  // UTM source breakdown (last 30 days)
  let sourceBreakdown: Array<{ source: string; count: number }> = [];
  try {
    const { data: utmData } = await supabaseAdmin
      .from("users")
      .select("utm_source")
      .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
      .not("utm_source", "is", null);
    const counts: Record<string, number> = {};
    for (const u of utmData || []) {
      const s = u.utm_source || "direct";
      counts[s] = (counts[s] || 0) + 1;
    }
    sourceBreakdown = Object.entries(counts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  } catch { /* non-fatal */ }

  // Intelligence cron last run summary
  let intelligenceStats = { patternsDiscovered: 0, patternsAbsorbed: 0, lastRun: null as string | null, topIndustries: [] as string[] };
  try {
    const { data: intLog } = await supabaseAdmin
      .from("cron_logs")
      .select("result_json, ran_at")
      .eq("cron_name", "intelligence")
      .order("ran_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (intLog?.result_json) {
      const r = intLog.result_json as any;
      intelligenceStats = {
        patternsDiscovered: r.patternsDiscovered ?? 0,
        patternsAbsorbed:   r.patternsAbsorbed   ?? 0,
        lastRun:            intLog.ran_at,
        topIndustries:      (r.industriesCovered || []).slice(0, 5),
      };
    }
  } catch { /* table may not exist — non-fatal */ }

  // Contingency funnel metrics
  let contingencyStats = { assigned: 0, in_engagement: 0, savings_confirmed: 0, commissions_pending: 0 };
  try {
    const [pipeAll, confirmedAll, commissionsAll] = await Promise.all([
      supabaseAdmin.from("tier3_pipeline").select("stage").then(r => r.data || []),
      supabaseAdmin.from("tier3_confirmed_findings").select("confirmed_amount").then(r => r.data || []),
      supabaseAdmin.from("tier3_rep_commissions").select("commission_amount, status").then(r => r.data || []),
    ]);
    const activeStages = ["contacted","called","diagnostic_sent","agreement_out","signed","in_engagement","recovery_tracking","engaged","active"];
    contingencyStats = {
      assigned:            pipeAll.filter((p: any) => activeStages.includes(p.stage)).length,
      in_engagement:       pipeAll.filter((p: any) => ["in_engagement","recovery_tracking"].includes(p.stage)).length,
      savings_confirmed:   Math.round(confirmedAll.reduce((s: number, c: any) => s + (c.confirmed_amount ?? 0), 0)),
      commissions_pending: Math.round(commissionsAll.filter((c: any) => c.status === "pending").reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0)),
    };
  } catch { /* non-fatal */ }

  // Prescan conversion
  const conversionRate = prescansAll > 0 ? Math.round((usersPaid / prescansAll) * 10000) / 100 : 0;

  // Tier 3 breakdowns
  const tier3ByStatus = { draft: 0, sent: 0, signed: 0, rejected: 0, archived: 0 };
  let tier3PipelineValue = 0;
  let tier3Total = tier3All.length;

  for (const d of tier3All) {
    const s = d.status as keyof typeof tier3ByStatus;
    if (s in tier3ByStatus) tier3ByStatus[s]++;
    if (s !== "archived") {
      const high = d.result?.summary?.totalEstimatedHigh ?? 0;
      tier3PipelineValue += high;
    }
  }

  // Agreements
  const agTotal = tier3Agreements.length;
  const agByStatus = { pending: 0, signed: 0, rejected: 0 };
  for (const a of tier3Agreements) {
    const s = a.status as keyof typeof agByStatus;
    if (s in agByStatus) agByStatus[s]++;
  }

  // Tier 3 fees — signed agreements: fee_percentage × diagnostic summary.feeRangeLow
  let tier3FeesEarned = 0;
  let tier3FeePending = 0;
  let tier3FeesThisMonth = 0;

  for (const ag of tier3Agreements) {
    // Look up the diagnostic to get the estimated savings
    const diag = tier3All.find((d: any) => d.id === ag.diagnostic_id);
    const feeRangeLow = diag?.result?.summary?.feeRangeLow ?? 0;

    if (ag.status === "signed") {
      tier3FeesEarned += feeRangeLow;
      if (ag.created_at >= monthStart) tier3FeesThisMonth += feeRangeLow;
    } else if (ag.status === "pending") {
      tier3FeePending += feeRangeLow;
    }
  }

  // Revenue
  const tier1MRR = usersPaid * 49; // $49/mo Solo plan
  const thisMonthRevenue = tier1MRR + tier3FeesThisMonth + affiliateThisMonth;
  // Last month: approximate — we don't have historical subscription count
  const lastMonthRevenue = tier1MRR; // simplified

  // ═══════════════════════════════════════════════════════════════════════════
  // RESPONSE
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Accountant / execution stats ──────────────────────────────────────
  const execPlaybooks: any[] = await safeQuery(async () => {
    const { data } = await supabaseAdmin
      .from("execution_playbooks")
      .select("status, amount_recoverable, confirmed_amount, quick_win, assigned_to");
    return data || [];
  }, [] as any[]);
  const accountantCount: number = await safeQuery(async () => {
    const { count } = await supabaseAdmin.from("accountants").select("id", { count: "exact", head: true }).eq("status", "active");
    return count || 0;
  }, 0);
  const execUnassigned     = execPlaybooks.filter((p: any) => !p.assigned_to).length;
  const execQueued         = execPlaybooks.filter((p: any) => p.status === "queued").length;
  const execInProgress     = execPlaybooks.filter((p: any) => p.status === "in_progress").length;
  const execConfirmed      = execPlaybooks.filter((p: any) => p.status === "confirmed");
  const execConfirmedValue = execConfirmed.reduce((sum: number, p: any) => sum + (p.confirmed_amount || p.amount_recoverable || 0), 0);
  const execTotalValue     = execPlaybooks.reduce((sum: number, p: any) => sum + (p.amount_recoverable || 0), 0);
  const execQuickWins      = execPlaybooks.filter((p: any) => p.quick_win && p.status === "queued").length;

  const result = {
    revenue: {
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      tier1Subscriptions: usersPaid,
      tier1MRR,
      tier3FeesEarned,
      tier3FeePending,
      affiliateCommissions: affiliateThisMonth,
    },
    prescan: {
      today: prescansToday,
      last7Days: prescans7d,
      last30Days: prescans30d,
      allTime: prescansAll,
      conversionRate,
      topIndustries: prescanIndustries,
      topProvinces: prescanProvinces,
    },
    users: {
      total: usersTotal,
      paid: usersPaid,
      free: usersFree,
      newThisWeek: usersNewWeek,
      newThisMonth: usersNewMonth,
      activeToday: usersActiveToday,
    },
    tier3: {
      totalDiagnostics: tier3Total,
      pipelineValue: tier3PipelineValue,
      byStatus: tier3ByStatus,
      agreements: {
        total: agTotal,
        ...agByStatus,
      },
      feesThisMonth: tier3FeesThisMonth,
    },
    execution: {
      total_playbooks:   execPlaybooks.length,
      unassigned:        execUnassigned,
      queued:            execQueued,
      in_progress:       execInProgress,
      confirmed_count:   execConfirmed.length,
      confirmed_value:   execConfirmedValue,
      total_value:       execTotalValue,
      quick_wins:        execQuickWins,
      active_accountants: accountantCount,
      fruxal_fee:        Math.round(execConfirmedValue * 0.12),
    },
    system: {
      lastUpdated: now,
    },
  };

  const response = NextResponse.json({ success: true, data: result });
  response.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
  return response;
}
