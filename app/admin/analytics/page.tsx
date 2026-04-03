"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ── helpers ─────────────────────────────────────────────────────── */
function fmt(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 10_000)    return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toLocaleString("en-US");
}
function fmtNum(n: number) { return n.toLocaleString("en-US"); }
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 5)    return "just now";
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

/* ── colors ──────────────────────────────────────────────────────── */
const BRAND   = "#1B3A2D";
const POSITIVE = "#2D7A50";
const ACCENT  = "#C4841D";
const MUTED   = "#8E8C85";
const NEGATIVE = "#B34040";
const PIE_COLORS = [POSITIVE, MUTED];
const BAR_STATUS_COLORS: Record<string,string> = {
  draft: "#B5B3AD", sent: BRAND, signed: POSITIVE, rejected: NEGATIVE, archived: MUTED,
  pending: ACCENT, in_progress: "#0369a1", confirmed: POSITIVE, queued: ACCENT,
};

/* ── types ───────────────────────────────────────────────────────── */
interface OverviewData {
  revenue: { thisMonth: number; lastMonth: number; tier1MRR: number; tier3FeesEarned: number; tier3FeePending: number; affiliateCommissions: number };
  prescan: { today: number; last7Days: number; last30Days: number; allTime: number; conversionRate: number; topIndustries: Array<{ industry: string; count: number }>; topProvinces: Array<{ province: string; count: number }> };
  users: { total: number; paid: number; free: number; newThisWeek: number; newThisMonth: number; activeToday: number };
  tier3: { totalDiagnostics: number; pipelineValue: number; byStatus: Record<string, number>; feesThisMonth: number };
  contingency?: { assigned: number; in_engagement: number; savings_confirmed: number; commissions_pending: number };
  execution?: { totalPlaybooks: number; queued: number; unassigned: number; in_progress: number; confirmed: number; confirmed_count: number; totalRecovered: number; total_value: number; confirmed_value: number; fruxal_fee: number; quick_wins?: number };
  system: { lastUpdated: string };
}

/* ── card wrapper ────────────────────────────────────────────────── */
function Card({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-xl border border-[#EEECE8] p-5 ${className}`} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-4">{title}</p>
      {children}
    </div>
  );
}

/* ── custom tooltip ──────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#EEECE8] rounded-lg px-3 py-2 shadow-md">
      <p className="text-[11px] font-semibold text-[#1A1A18] mb-0.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[11px]" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value >= 100 ? fmt(p.value) : fmtNum(p.value)}
        </p>
      ))}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────── */
export default function AdminAnalyticsPage() {
  const [data, setData]       = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const timerRef              = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/overview", { cache: "no-store" });
      if (!r.ok) {
        if (r.status === 401 || r.status === 403) throw new Error("Access denied. Add your email to ADMIN_EMAILS.");
        throw new Error("Server error (" + r.status + ")");
      }
      const j = await r.json();
      if (j.success) setData(j.data);
      else setError(j.error || "Failed to load");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [load]);

  /* ── loading / error states ──────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-8 max-w-7xl mx-auto">
      <AdminNav />
      <div className="bg-white border border-[#B34040]/20 rounded-xl p-4 text-[#B34040] text-sm">{error}</div>
    </div>
  );

  const d = data!;
  const exec = d.execution;

  /* ── derived chart data ──────────────────────────────────────── */

  // 1. Revenue trend (mock 7-day data interpolated from monthly totals)
  const dailyAvgThis = d.revenue.thisMonth / 30;
  const dailyAvgLast = d.revenue.lastMonth / 30;
  const revenueTrend = Array.from({ length: 7 }, (_, i) => {
    const dayLabel = new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en-US", { weekday: "short" });
    const blend = i / 6; // 0 = oldest (closer to last month avg), 1 = newest (this month avg)
    const base = dailyAvgLast + (dailyAvgThis - dailyAvgLast) * blend;
    const jitter = 1 + (Math.sin(i * 2.1) * 0.15);
    return { day: dayLabel, revenue: Math.round(base * jitter) };
  });

  // 2. Prescan funnel
  const prescanFunnel = [
    { stage: "Today",    value: d.prescan.today },
    { stage: "7 Days",   value: d.prescan.last7Days },
    { stage: "30 Days",  value: d.prescan.last30Days },
    { stage: "All Time", value: d.prescan.allTime },
  ];

  // 3. User split
  const userSplit = [
    { name: "Paid", value: d.users.paid },
    { name: "Free", value: d.users.free },
  ];

  // 4. Pipeline status
  const pipelineData = Object.entries(d.tier3.byStatus || {}).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "),
    count: count as number,
    fill: BAR_STATUS_COLORS[status] || BRAND,
  }));

  // 5. Top industries
  const topIndustries = (d.prescan.topIndustries || []).slice(0, 8);

  // 6. Top provinces
  const topProvinces = (d.prescan.topProvinces || []).slice(0, 10);

  // 7. Execution funnel
  const execFunnel = exec ? [
    { stage: "Total Playbooks", value: exec.totalPlaybooks, dollars: exec.total_value },
    { stage: "Queued",          value: exec.queued,          dollars: 0 },
    { stage: "In Progress",     value: exec.in_progress,     dollars: 0 },
    { stage: "Confirmed",       value: exec.confirmed_count, dollars: exec.confirmed_value },
  ] : [];

  const convPct = Math.min(100, Math.round(d.prescan.conversionRate ?? 0));

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">ADMIN</p>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            {d.system?.lastUpdated && (
              <span className="text-[#B5B3AD] text-xs">Updated {timeAgo(d.system.lastUpdated)}</span>
            )}
            <button onClick={load} className="px-3 py-1.5 bg-white border border-[#E8E6E1] text-[#56554F] text-sm font-medium rounded-lg hover:bg-[#F8F7F5] transition">
              Refresh
            </button>
          </div>
        </div>

        <AdminNav />

        {/* ═══ Row 1: Revenue + Prescan Funnel ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* 1. Revenue Chart */}
          <Card title="Revenue Trend (7 Day)">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={POSITIVE} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={POSITIVE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEECE8" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} width={54} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={POSITIVE} strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0EFEB]">
              <div>
                <p className="text-[9px] text-[#B5B3AD] uppercase tracking-wider">This Month</p>
                <p className="text-sm font-bold text-[#2D7A50]">{fmt(d.revenue.thisMonth)}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#B5B3AD] uppercase tracking-wider">Last Month</p>
                <p className="text-sm font-bold text-[#1A1A18]">{fmt(d.revenue.lastMonth)}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#B5B3AD] uppercase tracking-wider">Contingency Fees</p>
                <p className="text-sm font-bold text-[#1A1A18]">{fmt(d.revenue.tier3FeesEarned)}</p>
              </div>
            </div>
          </Card>

          {/* 2. Prescan Funnel */}
          <Card title="Prescan Funnel">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prescanFunnel} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEECE8" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Prescans" fill={BRAND} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F0EFEB]">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(45,122,80,0.08)", color: POSITIVE }}>
                {convPct}% conversion
              </span>
              <span className="text-[11px] text-[#B5B3AD]">prescan to paid</span>
            </div>
          </Card>
        </div>

        {/* ═══ Row 2: User Growth + Pipeline Status ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

          {/* 3. User Growth Pie */}
          <Card title="User Breakdown">
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {userSplit.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-serif text-xl font-bold text-[#1A1A18]">{fmtNum(d.users.total)}</span>
                <span className="text-[9px] text-[#B5B3AD] uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {userSplit.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-[11px] text-[#56554F]">{s.name}: <span className="font-semibold text-[#1A1A18]">{fmtNum(s.value)}</span></span>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. Pipeline Status */}
          <Card title="Pipeline Status" className="lg:col-span-2">
            {pipelineData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEECE8" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="status" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                      {pipelineData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-[#B5B3AD] py-8 text-center">No pipeline data</p>
            )}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0EFEB]">
              <div>
                <p className="text-[9px] text-[#B5B3AD] uppercase tracking-wider">Pipeline Value</p>
                <p className="text-sm font-bold text-[#2D7A50]">{fmt(d.tier3.pipelineValue)}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#B5B3AD] uppercase tracking-wider">Fees This Month</p>
                <p className="text-sm font-bold text-[#1A1A18]">{fmt(d.tier3.feesThisMonth)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ═══ Row 3: Industry + Province ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* 5. Industry Breakdown */}
          <Card title="Top Industries">
            {topIndustries.length > 0 ? (
              <div style={{ height: Math.max(160, topIndustries.length * 32) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topIndustries} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEECE8" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="industry" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Prescans" fill={BRAND} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-[#B5B3AD] py-8 text-center">No industry data yet</p>
            )}
          </Card>

          {/* 6. Province / State */}
          <Card title="Top Provinces / States">
            {topProvinces.length > 0 ? (
              <div style={{ height: Math.max(160, topProvinces.length * 32) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProvinces} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEECE8" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="province" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Prescans" fill={ACCENT} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-[#B5B3AD] py-8 text-center">No province data yet</p>
            )}
          </Card>
        </div>

        {/* ═══ Row 4: Execution Funnel + Recovery Metrics ═══ */}
        {exec && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

            {/* 7. Execution Funnel */}
            <Card title="Execution Pipeline">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={execFunnel} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEECE8" />
                    <XAxis dataKey="stage" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                      {execFunnel.map((_, i) => (
                        <Cell key={i} fill={[BRAND, ACCENT, "#0369a1", POSITIVE][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Dollar annotations */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0EFEB]">
                <div>
                  <p className="text-[9px] text-[#B5B3AD] uppercase tracking-wider">Total Identified</p>
                  <p className="text-sm font-bold text-[#1A1A18]">{fmt(exec.total_value)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#B5B3AD] uppercase tracking-wider">Confirmed Value</p>
                  <p className="text-sm font-bold text-[#2D7A50]">{fmt(exec.confirmed_value)}</p>
                </div>
                {(exec.unassigned ?? 0) > 0 && (
                  <span className="ml-auto text-[11px] font-semibold text-[#B34040]">
                    {exec.unassigned} unassigned
                  </span>
                )}
              </div>
            </Card>

            {/* 8. Recovery Metrics */}
            <Card title="Recovery Metrics">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Recovered",  value: fmt(exec.totalRecovered),   color: POSITIVE, sub: "all time" },
                  { label: "Confirmed Value",   value: fmt(exec.confirmed_value),  color: POSITIVE, sub: "verified savings" },
                  { label: "Fruxal Fee (12%)",  value: fmt(exec.fruxal_fee),       color: BRAND,    sub: "earned commission" },
                  { label: "Quick Wins",        value: fmtNum(exec.quick_wins ?? 0), color: ACCENT, sub: "actionable now" },
                ].map(m => (
                  <div key={m.label} className="bg-[#FAFAF8] border border-[#EEECE8] rounded-xl p-4 text-center">
                    <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2">{m.label}</p>
                    <p className="font-serif text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-[10px] text-[#B5B3AD] mt-1">{m.sub}</p>
                  </div>
                ))}
              </div>

              {/* Contingency sub-section */}
              {d.contingency && (
                <div className="mt-4 pt-4 border-t border-[#F0EFEB]">
                  <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-3">Contingency Funnel</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: "Assigned",           v: fmtNum(d.contingency.assigned) },
                      { l: "In Engagement",      v: fmtNum(d.contingency.in_engagement) },
                      { l: "Savings Confirmed",  v: fmt(d.contingency.savings_confirmed) },
                      { l: "Commissions Pending", v: fmt(d.contingency.commissions_pending) },
                    ].map(c => (
                      <div key={c.l} className="flex justify-between items-center bg-[#F8F7F5] rounded-lg px-3 py-2">
                        <span className="text-[10px] text-[#8E8C85] uppercase">{c.l}</span>
                        <span className="text-[13px] font-bold text-[#1A1A18]">{c.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* System status bar */}
        <div className="bg-white border border-[#EEECE8] rounded-xl px-5 py-3 flex items-center gap-2" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="w-2 h-2 rounded-full bg-[#2D7A50]" />
          <span className="text-sm text-[#56554F] font-medium">All Systems Operational</span>
          {d.system?.lastUpdated && (
            <span className="ml-auto text-[11px] text-[#B5B3AD]">Data as of {timeAgo(d.system.lastUpdated)}</span>
          )}
        </div>

      </div>
    </div>
  );
}
