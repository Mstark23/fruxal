// =============================================================================
// src/app/api/admin/stats/route.ts
// =============================================================================
// GET — Returns all admin dashboard data in a single call.
//
// Protected: admin-only (check session role)
// Query params: ?period=7d|30d|90d
//
// Returns:
//   revenue    — MRR, ARR, churn, LTV, ARPU, growth
//   funnel     — prescan→signup→diagnostic→paid counts + conversion rates
//   plans      — free/pro/growth distribution
//   prescan    — by province, by industry, recent list, avg scores
//   obligations — tracked, overdue, upcoming, completion rate
//   top_leaks  — most frequently detected leaks
//   activity   — recent platform activity feed
//   daily_*    — time series for charts
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30; // Vercel function timeout (seconds)

const PERIOD_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

export async function GET(req: NextRequest) {
  try {
    // ─── Auth check — use ADMIN_EMAILS (same as requireAdmin()) ─────
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    const userEmail = (session.user.email || "").toLowerCase();
    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ success: false, error: "Forbidden — admin access required" }, { status: 403 });
    }

    const period = req.nextUrl.searchParams.get("period") || "30d";
    const days = PERIOD_DAYS[period] || 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const prevSince = new Date(Date.now() - days * 2 * 86400000).toISOString();

    // ─── Revenue metrics ─────────────────────────────────────────

    // Current active subscriptions
    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select("plan, status, amount, created_at, canceled_at")
      .eq("status", "active");

    const activeSubs = subs || [];
    const proCount = activeSubs.filter(s => s.plan === "pro").length;
    const growthCount = activeSubs.filter(s => s.plan === "growth").length;
    const mrr = (proCount * 29) + (growthCount * 79);
    const arr = mrr * 12;

    // Previous period MRR for growth calc
    const { count: prevPaidCount } = await supabaseAdmin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .lt("created_at", since);

    const prevMrr = ((prevPaidCount ?? 0) * 29); // Rough estimate
    const mrrGrowth = prevMrr > 0 ? Math.round(((mrr - prevMrr) / prevMrr) * 100 * 10) / 10 : 0;

    // Churn: canceled in period / active at start of period
    const { count: canceledCount } = await supabaseAdmin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "canceled")
      .gte("canceled_at", since);

    const activeAtStart = (prevPaidCount ?? 0) + (canceledCount ?? 0);
    const churnRate = activeAtStart > 0 ? Math.round(((canceledCount ?? 0) / activeAtStart) * 100 * 10) / 10 : 0;

    // Total revenue (all payments)
    const { data: payments } = await supabaseAdmin
      .from("payments")
      .select("amount")
      .eq("status", "succeeded");

    const totalRevenue = (payments || []).reduce((sum, p) => sum + (p.amount ?? 0), 0);
    const paidTotal = proCount + growthCount;
    const arpu = paidTotal > 0 ? Math.round(mrr / paidTotal) : 0;
    const ltv = churnRate > 0 ? Math.round(arpu / (churnRate / 100)) : arpu * 24;

    // Free users
    const { count: totalUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    const freeCount = (totalUsers ?? 0) - paidTotal;

    // ─── Funnel metrics ──────────────────────────────────────────

    // Prescans total + period
    const { count: prescansTotal } = await supabaseAdmin
      .from("prescan_results")
      .select("*", { count: "exact", head: true });

    const { count: prescans30d } = await supabaseAdmin
      .from("prescan_results")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);

    // Signups total + period
    const { count: signupsTotal } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: signups30d } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);

    // Diagnostics total + period
    const { count: diagTotal } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("*", { count: "exact", head: true });

    const { count: diag30d } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);

    // Paid total + period
    const { count: paid30d } = await supabaseAdmin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .gte("created_at", since);

    // Conversion rates
    const prescanToSignup = (prescans30d ?? 0) > 0
      ? Math.round(((signups30d ?? 0) / (prescans30d || 1)) * 100 * 10) / 10 : 0;
    const signupToDiag = (signups30d ?? 0) > 0
      ? Math.round(((diag30d ?? 0) / (signups30d || 1)) * 100 * 10) / 10 : 0;
    const diagToPaid = (diag30d ?? 0) > 0
      ? Math.round(((paid30d ?? 0) / (diag30d || 1)) * 100 * 10) / 10 : 0;
    const overallConversion = (prescans30d ?? 0) > 0
      ? Math.round(((paid30d ?? 0) / (prescans30d || 1)) * 100 * 10) / 10 : 0;

    // ─── Prescan analytics ───────────────────────────────────────

    // By province
    const { data: byProvinceRaw } = await supabaseAdmin
      .rpc("prescan_by_province", { p_days: days });

    const byProvince = (byProvinceRaw || []).map((r: any) => ({
      province: r.province,
      count: Number(r.scan_count),
      conversion: Number(r.conversion_rate ?? 0),
    }));

    // By industry
    const { data: byIndustryRaw } = await supabaseAdmin
      .from("prescan_results")
      .select("industry")
      .gte("created_at", since);

    const industryCounts: Record<string, number> = {};
    (byIndustryRaw || []).forEach((r: any) => {
      industryCounts[r.industry] = (industryCounts[r.industry] || 0) + 1;
    });

    const { data: convertedByIndustry } = await supabaseAdmin
      .from("prescan_results")
      .select("industry")
      .gte("created_at", since)
      .not("converted_at", "is", null);

    const industryConversions: Record<string, number> = {};
    (convertedByIndustry || []).forEach((r: any) => {
      industryConversions[r.industry] = (industryConversions[r.industry] || 0) + 1;
    });

    const byIndustry = Object.entries(industryCounts)
      .map(([industry, count]) => ({
        industry,
        count,
        conversion: count > 0 ? Math.round(((industryConversions[industry] || 0) / count) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    // Avg scores
    const { data: avgScoreData } = await supabaseAdmin
      .rpc("prescan_funnel_stats", { p_days: days });

    const avgStats = avgScoreData?.[0] || {};

    // Recent prescans
    const { data: recentPrescans } = await supabaseAdmin
      .from("prescan_results")
      .select("id, province, industry, summary, converted_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    const recentPrescanList = (recentPrescans || []).map((p: any) => ({
      id: p.id,
      province: p.province,
      industry: p.industry,
      score: p.summary?.health_score ?? 0,
      leak_max: p.summary?.leak_range_max ?? 0,
      converted: !!p.converted_at,
      created_at: new Date(p.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    }));

    // ─── Obligations health ──────────────────────────────────────

    const { count: totalTracked } = await supabaseAdmin
      .from("user_obligations")
      .select("*", { count: "exact", head: true });

    const { count: overdueCount } = await supabaseAdmin
      .from("user_obligations")
      .select("*", { count: "exact", head: true })
      .eq("status", "overdue");

    const { count: upcoming7d } = await supabaseAdmin
      .from("user_obligations")
      .select("*", { count: "exact", head: true })
      .eq("status", "upcoming")
      .lte("next_deadline", new Date(Date.now() + 7 * 86400000).toISOString());

    const { count: completedCount } = await supabaseAdmin
      .from("user_obligations")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    const completionRate = (totalTracked ?? 0) > 0
      ? Math.round(((completedCount ?? 0) / (totalTracked || 1)) * 100) : 0;

    // ─── Top leaks detected ──────────────────────────────────────

    const { data: leakStats } = await supabaseAdmin
      .from("provincial_leak_detectors")
      .select("title, severity, annual_impact_max, detection_count")
      .order("detection_count", { ascending: false })
      .limit(10);

    const topLeaks = (leakStats || []).map((l: any) => ({
      title: l.title,
      count: l.detection_count ?? 0,
      avg_impact: l.annual_impact_max ?? 0,
      severity: l.severity,
    }));

    // ─── Activity feed ───────────────────────────────────────────

    const activities: { type: string; message: string; time: string }[] = [];

    // Recent prescans as activity
    (recentPrescans || []).slice(0, 5).forEach((p: any) => {
      activities.push({
        type: "prescan",
        message: `New prescan: ${p.province} ${p.industry.replace(/_/g, " ")} (score: ${p.summary?.health_score || "?"})`,
        time: new Date(p.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      });
    });

    // Recent signups
    const { data: recentSignups } = await supabaseAdmin
      .from("users")
      .select("name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    (recentSignups || []).forEach((u: any) => {
      activities.push({
        type: "signup",
        message: `New signup: ${u.name || "Anonymous"}`,
        time: new Date(u.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      });
    });

    // Recent diagnostics
    const { data: recentDiags } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("user_id, created_at, status")
      .order("created_at", { ascending: false })
      .limit(5);

    (recentDiags || []).forEach((d: any) => {
      activities.push({
        type: "diagnostic",
        message: `Diagnostic ${d.status === "completed" ? "completed" : "started"}`,
        time: new Date(d.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      });
    });

    // Sort by time (newest first)
    activities.sort((a, b) => b.time.localeCompare(a.time));

    // ─── Daily time series ───────────────────────────────────────

    // Daily prescans
    const dailyPrescans: { date: string; count: number; conversions: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split("T")[0];
      const nextDate = new Date(date.getTime() + 86400000).toISOString().split("T")[0];

      const { count: dayCount } = await supabaseAdmin
        .from("prescan_results")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dateStr)
        .lt("created_at", nextDate);

      const { count: dayConv } = await supabaseAdmin
        .from("prescan_results")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dateStr)
        .lt("created_at", nextDate)
        .not("converted_at", "is", null);

      dailyPrescans.push({
        date: date.toLocaleDateString("en-CA", { month: "short", day: "numeric" }),
        count: dayCount ?? 0,
        conversions: dayConv ?? 0,
      });
    }

    // Daily revenue (from payments table)
    const dailyRevenue: { date: string; amount: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split("T")[0];
      const nextDate = new Date(date.getTime() + 86400000).toISOString().split("T")[0];

      const { data: dayPayments } = await supabaseAdmin
        .from("payments")
        .select("amount")
        .eq("status", "succeeded")
        .gte("created_at", dateStr)
        .lt("created_at", nextDate);

      const dayTotal = (dayPayments || []).reduce((sum, p) => sum + (p.amount ?? 0), 0);

      dailyRevenue.push({
        date: date.toLocaleDateString("en-CA", { month: "short", day: "numeric" }),
        amount: dayTotal,
      });
    }

    // ─── Return everything ───────────────────────────────────────

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          mrr, arr, mrr_growth: mrrGrowth, total_revenue: totalRevenue,
          avg_revenue_per_user: arpu, churn_rate: churnRate, ltv,
        },
        funnel: {
          prescans_total: prescansTotal ?? 0, prescans_30d: prescans30d ?? 0,
          signups_total: signupsTotal ?? 0, signups_30d: signups30d ?? 0,
          diagnostics_total: diagTotal ?? 0, diagnostics_30d: diag30d ?? 0,
          paid_total: paidTotal, paid_30d: paid30d ?? 0,
          prescan_to_signup: prescanToSignup, signup_to_diagnostic: signupToDiag,
          diagnostic_to_paid: diagToPaid, overall_conversion: overallConversion,
        },
        plans: { free: freeCount, pro: proCount, growth: growthCount },
        prescan: {
          total: prescansTotal ?? 0,
          avg_health_score: Number(avgStats.avg_health_score ?? 0),
          avg_leak_max: Number(avgStats.avg_leak_max ?? 0),
          by_province: byProvince,
          by_industry: byIndustry,
          recent: recentPrescanList,
        },
        obligations: {
          total_tracked: totalTracked ?? 0,
          overdue: overdueCount ?? 0,
          upcoming_7d: upcoming7d ?? 0,
          completion_rate: completionRate,
        },
        top_leaks: topLeaks,
        activity: activities.slice(0, 15),
        daily_prescans: dailyPrescans,
        daily_revenue: dailyRevenue,
      },
    });

  } catch (err: any) {
    console.error("[Admin:Stats] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
