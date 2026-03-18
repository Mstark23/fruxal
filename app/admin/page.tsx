// =============================================================================
// src/app/admin/page.tsx — ADMIN COMMAND CENTER
// =============================================================================
// Full analytics dashboard:
//   • Revenue metrics (MRR, ARR, churn, LTV)
//   • Conversion funnel (prescan → signup → diagnostic → paid)
//   • Prescan analytics (by province, industry, conversion rate)
//   • Plan distribution (free/pro/growth)
//   • Recent activity feed
//   • Top leaks detected across platform
//
// Protected route — admin only
// =============================================================================

"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminStats {
  revenue: {
    mrr: number;
    arr: number;
    mrr_growth: number;  // % change from last month
    total_revenue: number;
    avg_revenue_per_user: number;
    churn_rate: number;
    ltv: number;
  };
  funnel: {
    prescans_total: number;
    prescans_30d: number;
    signups_total: number;
    signups_30d: number;
    diagnostics_total: number;
    diagnostics_30d: number;
    paid_total: number;
    paid_30d: number;
    prescan_to_signup: number;    // % conversion
    signup_to_diagnostic: number;
    diagnostic_to_paid: number;
    overall_conversion: number;
  };
  plans: {
    free: number;
    pro: number;
    growth: number;
  };
  prescan: {
    total: number;
    avg_health_score: number;
    avg_leak_max: number;
    by_province: { province: string; count: number; conversion: number }[];
    by_industry: { industry: string; count: number; conversion: number }[];
    recent: { id: string; province: string; industry: string; score: number; leak_max: number; converted: boolean; created_at: string }[];
  };
  obligations: {
    total_tracked: number;
    overdue: number;
    upcoming_7d: number;
    completion_rate: number;
  };
  top_leaks: { title: string; count: number; avg_impact: number; severity: string }[];
  activity: { type: string; message: string; time: string }[];
  daily_prescans: { date: string; count: number; conversions: number }[];
  daily_revenue: { date: string; amount: number }[];
}

type Tab = "overview" | "funnel" | "prescan" | "revenue";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVINCE_NAMES: Record<string, string> = {
  QC: "Quebec", ON: "Ontario", BC: "British Columbia", AB: "Alberta",
  SK: "Saskatchewan", MB: "Manitoba", NS: "Nova Scotia", NB: "New Brunswick",
  PE: "PEI", NL: "Newfoundland",
};

// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/stats?period=${period}`);
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-[#060a10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const r = stats.revenue;
  const f = stats.funnel;

  return (
    <div className="min-h-screen bg-[#060a10] text-white">
      {/* ═══ HEADER ═══ */}
      <header className="border-b border-white/[0.04] bg-[#060a10]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm font-black text-emerald-400">L</div>
            <div>
              <h1 className="text-sm font-bold text-white/70">Fruxal</h1>
              <p className="text-[9px] text-white/15 uppercase tracking-widest">Admin Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex bg-white/[0.03] rounded-lg p-0.5">
              {(["7d", "30d", "90d"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                    period === p ? "bg-emerald-500/15 text-emerald-400" : "text-white/20 hover:text-white/30"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px]">👤</div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {([
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "funnel", label: "Funnel", icon: "🔄" },
            { id: "prescan", label: "Prescans", icon: "🔍" },
            { id: "revenue", label: "Revenue", icon: "💰" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 ${
                tab === t.id
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-white/20 hover:text-white/30"
              }`}>
              <span className="mr-1.5">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ═══ CONTENT ═══ */}
      <main className="max-w-7xl mx-auto px-6 py-6">

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                                    */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.3s ease-out" }}>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="MRR" value={`$${r.mrr.toLocaleString()}`}
                change={r.mrr_growth} positive />
              <KpiCard label="Active Paid" value={`${f.paid_total}`}
                sub={`${f.paid_30d} new this month`} />
              <KpiCard label="Prescans (30d)" value={`${f.prescans_30d}`}
                sub={`${f.overall_conversion}% overall conversion`} />
              <KpiCard label="Churn Rate" value={`${r.churn_rate}%`}
                change={-0.3} positive={r.churn_rate < 5} />
            </div>

            {/* Revenue + Funnel side by side */}
            <div className="grid md:grid-cols-2 gap-3">
              {/* Revenue chart */}
              <Card title="Revenue (30d)" icon="💰">
                <div className="flex items-end gap-[2px] h-32">
                  {stats.daily_revenue.map((d, i) => {
                    const max = Math.max(...stats.daily_revenue.map(x => x.amount), 1);
                    const h = (d.amount / max) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end group relative">
                        <div className="bg-emerald-500/60 hover:bg-emerald-400/80 rounded-t transition-all"
                          style={{ height: Math.max(h, 2) + "%" }} />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/10 px-1.5 py-0.5 rounded text-[8px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ${d.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[8px] text-white/10">{stats.daily_revenue[0]?.date}</span>
                  <span className="text-[8px] text-white/10">{stats.daily_revenue[stats.daily_revenue.length - 1]?.date}</span>
                </div>
              </Card>

              {/* Funnel visualization */}
              <Card title="Conversion Funnel" icon="🔄">
                <FunnelBar label="Prescans" count={f.prescans_30d} pct={100} color="bg-blue-500" />
                <FunnelBar label="Signups" count={f.signups_30d} pct={f.prescan_to_signup} color="bg-indigo-500" />
                <FunnelBar label="Diagnostics" count={f.diagnostics_30d} pct={f.signup_to_diagnostic * f.prescan_to_signup / 100} color="bg-violet-500" />
                <FunnelBar label="Paid" count={f.paid_30d} pct={f.overall_conversion} color="bg-emerald-500" />
              </Card>
            </div>

            {/* Plan distribution + Top Leaks */}
            <div className="grid md:grid-cols-3 gap-3">
              {/* Plan distribution */}
              <Card title="Plan Distribution" icon="📋">
                <div className="space-y-3">
                  <PlanBar label="Free" count={stats.plans.free} total={stats.plans.free + stats.plans.pro + stats.plans.growth} color="bg-white/20" />
                  <PlanBar label="Pro ($29)" count={stats.plans.pro} total={stats.plans.free + stats.plans.pro + stats.plans.growth} color="bg-emerald-500" />
                  <PlanBar label="Growth ($79)" count={stats.plans.growth} total={stats.plans.free + stats.plans.pro + stats.plans.growth} color="bg-amber-500" />
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.04] grid grid-cols-2 gap-2">
                  <MiniStat label="ARPU" value={`$${r.avg_revenue_per_user}`} />
                  <MiniStat label="LTV" value={`$${r.ltv}`} />
                </div>
              </Card>

              {/* Top leaks */}
              <Card title="Top Leaks Detected" icon="🔥" className="md:col-span-2">
                <div className="space-y-2">
                  {stats.top_leaks.slice(0, 6).map((leak, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black ${
                        leak.severity === "critical" ? "bg-red-500/10 text-red-400" :
                        leak.severity === "high" ? "bg-orange-500/10 text-orange-400" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-[11px] truncate group-hover:text-white/60 transition-colors">{leak.title}</p>
                      </div>
                      <span className="text-white/15 text-[9px] font-mono">{leak.count}x</span>
                      <span className="text-red-400/50 text-[9px] font-mono">${leak.avg_impact.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Activity Feed + Obligations */}
            <div className="grid md:grid-cols-3 gap-3">
              {/* Activity */}
              <Card title="Recent Activity" icon="⚡" className="md:col-span-2">
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {stats.activity.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-xs mt-0.5">{
                        a.type === "prescan" ? "🔍" : a.type === "signup" ? "👤" :
                        a.type === "diagnostic" ? "🔬" : a.type === "payment" ? "💳" :
                        a.type === "upgrade" ? "⬆️" : "📌"
                      }</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/30 text-[11px]">{a.message}</p>
                        <p className="text-white/10 text-[9px]">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Obligations overview */}
              <Card title="Obligations Health" icon="📅">
                <div className="grid grid-cols-2 gap-3">
                  <StatCircle value={stats.obligations.total_tracked} label="Tracked" color="emerald" />
                  <StatCircle value={stats.obligations.overdue} label="Overdue" color="red" />
                  <StatCircle value={stats.obligations.upcoming_7d} label="Due 7d" color="amber" />
                  <StatCircle value={`${stats.obligations.completion_rate}%`} label="Complete" color="blue" />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FUNNEL TAB                                                      */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {tab === "funnel" && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.3s ease-out" }}>

            {/* Funnel KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Prescan → Signup" value={`${f.prescan_to_signup}%`} sub={`${f.signups_30d} signups in ${period}`} />
              <KpiCard label="Signup → Diagnostic" value={`${f.signup_to_diagnostic}%`} sub={`${f.diagnostics_30d} diagnostics run`} />
              <KpiCard label="Diagnostic → Paid" value={`${f.diagnostic_to_paid}%`} sub={`${f.paid_30d} conversions`} />
              <KpiCard label="Overall Prescan → Paid" value={`${f.overall_conversion}%`} sub="End-to-end conversion" highlight />
            </div>

            {/* Visual funnel */}
            <Card title="Conversion Funnel — Visual" icon="🔄">
              <div className="py-4 space-y-1">
                {[
                  { label: "Prescans", count: f.prescans_30d, pct: 100, color: "bg-blue-500/70", desc: "Free scan completed" },
                  { label: "Signups", count: f.signups_30d, pct: f.prescan_to_signup, color: "bg-indigo-500/70", desc: "Account created" },
                  { label: "Diagnostics", count: f.diagnostics_30d, pct: Math.round(f.prescan_to_signup * f.signup_to_diagnostic / 100), color: "bg-violet-500/70", desc: "AI analysis run" },
                  { label: "Paid", count: f.paid_30d, pct: f.overall_conversion, color: "bg-emerald-500/70", desc: "Subscription started" },
                ].map((step, i) => (
                  <div key={i} className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-24 text-right">
                        <p className="text-white/40 text-xs font-semibold">{step.label}</p>
                        <p className="text-white/15 text-[9px]">{step.desc}</p>
                      </div>
                      <div className="flex-1 relative h-10">
                        <div className={`${step.color} h-full rounded-lg transition-all duration-1000 flex items-center px-3`}
                          style={{ width: Math.max(step.pct, 3) + "%" }}>
                          <span className="text-white/80 text-[10px] font-bold whitespace-nowrap">
                            {step.count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 text-right">
                        <span className="text-white/20 text-[10px] font-mono">{step.pct}%</span>
                      </div>
                    </div>
                    {i < 3 && (
                      <div className="flex items-center gap-4 py-0.5">
                        <div className="w-24" />
                        <div className="flex-1 flex items-center gap-2 pl-2">
                          <span className="text-red-400/30 text-[9px]">
                            ↓ {i === 0 ? (100 - f.prescan_to_signup) : i === 1 ? (100 - f.signup_to_diagnostic) : (100 - f.diagnostic_to_paid)}% drop-off
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Daily prescan chart */}
            <Card title="Daily Prescans & Conversions" icon="📈">
              <div className="flex items-end gap-[3px] h-40">
                {stats.daily_prescans.map((d, i) => {
                  const max = Math.max(...stats.daily_prescans.map(x => x.count), 1);
                  const hTotal = (d.count / max) * 100;
                  const hConv = d.count > 0 ? (d.conversions / d.count) * hTotal : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end group relative">
                      <div className="relative rounded-t overflow-hidden" style={{ height: Math.max(hTotal, 2) + "%" }}>
                        <div className="absolute inset-0 bg-blue-500/30" />
                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/60" style={{ height: hConv + "%" }} />
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 px-1.5 py-0.5 rounded text-[7px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {d.count} scans / {d.conversions} conv
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/30" />
                  <span className="text-[9px] text-white/15">Prescans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
                  <span className="text-[9px] text-white/15">Conversions</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* PRESCAN TAB                                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {tab === "prescan" && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.3s ease-out" }}>

            {/* Prescan KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Total Prescans" value={stats.prescan.total.toLocaleString()} />
              <KpiCard label="Avg Health Score" value={`${stats.prescan.avg_health_score}`} sub="Lower = more leaks found" />
              <KpiCard label="Avg Leak Exposure" value={`$${stats.prescan.avg_leak_max.toLocaleString()}`} sub="Per business" />
              <KpiCard label="Prescan → Signup" value={`${f.prescan_to_signup}%`} highlight />
            </div>

            {/* By Province + By Industry */}
            <div className="grid md:grid-cols-2 gap-3">
              <Card title="By Province" icon="🗺️">
                <div className="space-y-2">
                  {stats.prescan.by_province.sort((a, b) => b.count - a.count).map(p => {
                    const max = Math.max(...stats.prescan.by_province.map(x => x.count), 1);
                    return (
                      <div key={p.province} className="group">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-white/30 text-[11px] font-medium">{PROVINCE_NAMES[p.province] || p.province}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white/15 text-[9px] font-mono">{p.count}</span>
                            <span className={`text-[9px] font-mono ${p.conversion > 5 ? "text-emerald-400/50" : "text-white/10"}`}>
                              {p.conversion}% conv
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500/40 rounded-full transition-all duration-700"
                            style={{ width: (p.count / max) * 100 + "%" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title="By Industry" icon="🏭">
                <div className="space-y-2">
                  {stats.prescan.by_industry.sort((a, b) => b.count - a.count).map(ind => {
                    const max = Math.max(...stats.prescan.by_industry.map(x => x.count), 1);
                    return (
                      <div key={ind.industry} className="group">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-white/30 text-[11px] font-medium capitalize">{ind.industry.replace(/_/g, " ")}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white/15 text-[9px] font-mono">{ind.count}</span>
                            <span className={`text-[9px] font-mono ${ind.conversion > 5 ? "text-emerald-400/50" : "text-white/10"}`}>
                              {ind.conversion}% conv
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500/40 rounded-full transition-all duration-700"
                            style={{ width: (ind.count / max) * 100 + "%" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Recent prescans table */}
            <Card title="Recent Prescans" icon="🔍">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-white/15 text-left border-b border-white/[0.04]">
                      <th className="pb-2 pr-3 font-medium">Province</th>
                      <th className="pb-2 pr-3 font-medium">Industry</th>
                      <th className="pb-2 pr-3 font-medium text-right">Score</th>
                      <th className="pb-2 pr-3 font-medium text-right">Leak $</th>
                      <th className="pb-2 pr-3 font-medium">Status</th>
                      <th className="pb-2 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.prescan.recent.map(p => (
                      <tr key={p.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                        <td className="py-2 pr-3 text-white/30">{PROVINCE_NAMES[p.province] || p.province}</td>
                        <td className="py-2 pr-3 text-white/25 capitalize">{p.industry.replace(/_/g, " ")}</td>
                        <td className={`py-2 pr-3 text-right font-mono ${
                          p.score < 40 ? "text-red-400/60" : p.score < 70 ? "text-amber-400/60" : "text-emerald-400/60"
                        }`}>{p.score}</td>
                        <td className="py-2 pr-3 text-right text-red-400/40 font-mono">${p.leak_max.toLocaleString()}</td>
                        <td className="py-2 pr-3">
                          {p.converted ? (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400/60">CONVERTED</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-white/[0.03] text-white/15">pending</span>
                          )}
                        </td>
                        <td className="py-2 text-white/10">{p.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* REVENUE TAB                                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {tab === "revenue" && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.3s ease-out" }}>

            {/* Revenue KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="MRR" value={`$${r.mrr.toLocaleString()}`} change={r.mrr_growth} positive highlight />
              <KpiCard label="ARR" value={`$${r.arr.toLocaleString()}`} />
              <KpiCard label="Total Revenue" value={`$${r.total_revenue.toLocaleString()}`} sub="All time" />
              <KpiCard label="LTV" value={`$${r.ltv}`} sub={`ARPU: $${r.avg_revenue_per_user}`} />
            </div>

            {/* Revenue chart */}
            <Card title="Daily Revenue" icon="💰">
              <div className="flex items-end gap-[2px] h-48">
                {stats.daily_revenue.map((d, i) => {
                  const max = Math.max(...stats.daily_revenue.map(x => x.amount), 1);
                  const h = (d.amount / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end group relative">
                      <div className="bg-emerald-500/50 hover:bg-emerald-400/70 rounded-t transition-all"
                        style={{ height: Math.max(h, 1) + "%" }} />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/10 px-1.5 py-0.5 rounded text-[8px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${d.amount}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[8px] text-white/10">{stats.daily_revenue[0]?.date}</span>
                <span className="text-[8px] text-white/10">{stats.daily_revenue[stats.daily_revenue.length - 1]?.date}</span>
              </div>
            </Card>

            {/* Revenue breakdown */}
            <div className="grid md:grid-cols-3 gap-3">
              <Card title="Revenue by Plan" icon="📊">
                <div className="space-y-4 py-2">
                  <RevenuePlanRow label="Pro ($29/mo)" count={stats.plans.pro}
                    revenue={stats.plans.pro * 29} color="emerald" />
                  <RevenuePlanRow label="Growth ($79/mo)" count={stats.plans.growth}
                    revenue={stats.plans.growth * 79} color="amber" />
                  <div className="pt-3 border-t border-white/[0.04]">
                    <div className="flex justify-between">
                      <span className="text-white/20 text-[10px]">Total MRR</span>
                      <span className="text-emerald-400 text-sm font-black">${r.mrr.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Key Metrics" icon="📐">
                <div className="space-y-3 py-2">
                  <MetricRow label="Churn Rate" value={`${r.churn_rate}%`} status={r.churn_rate < 5 ? "good" : r.churn_rate < 10 ? "warn" : "bad"} />
                  <MetricRow label="MRR Growth" value={`${r.mrr_growth > 0 ? "+" : ""}${r.mrr_growth}%`} status={r.mrr_growth > 0 ? "good" : "bad"} />
                  <MetricRow label="ARPU" value={`$${r.avg_revenue_per_user}`} status="neutral" />
                  <MetricRow label="LTV" value={`$${r.ltv}`} status={r.ltv > 200 ? "good" : "warn"} />
                  <MetricRow label="LTV:CAC" value="TBD" status="neutral" />
                </div>
              </Card>

              <Card title="Growth Targets" icon="🎯">
                <div className="space-y-4 py-2">
                  <TargetRow label="$1K MRR" current={r.mrr} target={1000} />
                  <TargetRow label="$5K MRR" current={r.mrr} target={5000} />
                  <TargetRow label="$10K MRR" current={r.mrr} target={10000} />
                  <TargetRow label="100 Paid Users" current={f.paid_total} target={100} />
                  <TargetRow label="1000 Prescans" current={f.prescans_total} target={1000} />
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function KpiCard({ label, value, sub, change, positive, highlight }: {
  label: string; value: string; sub?: string; change?: number; positive?: boolean; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "bg-emerald-500/5 border-emerald-500/10" : "bg-white/[0.015] border-white/[0.04]"}`}>
      <p className="text-white/15 text-[9px] uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className={`text-xl font-black ${highlight ? "text-emerald-400" : "text-white/60"}`}>{value}</p>
      {change !== undefined && (
        <span className={`text-[10px] font-bold ${positive ? "text-emerald-400/60" : "text-red-400/60"}`}>
          {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
        </span>
      )}
      {sub && <p className="text-white/10 text-[9px] mt-0.5">{sub}</p>}
    </div>
  );
}

function Card({ title, icon, children, className = "" }: {
  title: string; icon: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white/[0.015] border border-white/[0.04] rounded-xl p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs">{icon}</span>
        <h3 className="text-white/30 text-[10px] font-bold uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FunnelBar({ label, count, pct, color }: {
  label: string; count: number; pct: number; color: string;
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-0.5">
        <span className="text-white/30 text-[10px]">{label}</span>
        <span className="text-white/15 text-[9px] font-mono">{count.toLocaleString()} ({pct}%)</span>
      </div>
      <div className="h-5 bg-white/[0.02] rounded overflow-hidden">
        <div className={"h-full " + color + "/40 rounded transition-all duration-1000"} style={{ width: Math.max(pct, 2) + "%" }} />
      </div>
    </div>
  );
}

function PlanBar({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-white/30 text-[10px]">{label}</span>
        <span className="text-white/15 text-[9px] font-mono">{count} ({pct}%)</span>
      </div>
      <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden">
        <div className={"h-full " + color + " rounded-full"} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-white/10 text-[8px] uppercase tracking-wider">{label}</p>
      <p className="text-white/40 text-sm font-bold">{value}</p>
    </div>
  );
}

function StatCircle({ value, label, color }: { value: string | number; label: string; color: string }) {
  const c = color === "emerald" ? "text-emerald-400 bg-emerald-500/8" :
            color === "red" ? "text-red-400 bg-red-500/8" :
            color === "amber" ? "text-amber-400 bg-amber-500/8" :
            "text-blue-400 bg-blue-500/8";
  return (
    <div className={`${c} rounded-xl p-3 text-center`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[8px] opacity-50 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function RevenuePlanRow({ label, count, revenue, color }: {
  label: string; count: number; revenue: number; color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/30 text-[11px] font-medium">{label}</p>
        <p className="text-white/10 text-[9px]">{count} subscribers</p>
      </div>
      <p className={`text-sm font-black ${color === "emerald" ? "text-emerald-400/70" : "text-amber-400/70"}`}>
        ${revenue.toLocaleString()}/mo
      </p>
    </div>
  );
}

function MetricRow({ label, value, status }: {
  label: string; value: string; status: "good" | "warn" | "bad" | "neutral";
}) {
  const c = status === "good" ? "text-emerald-400/60" : status === "warn" ? "text-amber-400/60" :
            status === "bad" ? "text-red-400/60" : "text-white/30";
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/20 text-[10px]">{label}</span>
      <span className={`text-xs font-bold ${c}`}>{value}</span>
    </div>
  );
}

function TargetRow({ label, current, target }: {
  label: string; current: number; target: number;
}) {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  const done = current >= target;
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className={`text-[10px] ${done ? "text-emerald-400/60" : "text-white/20"}`}>{done ? "✓ " : ""}{label}</span>
        <span className="text-white/10 text-[9px] font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${done ? "bg-emerald-500/60" : "bg-white/10"}`}
          style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}
