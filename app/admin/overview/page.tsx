"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

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

interface OverviewData {
  revenue: { thisMonth:number; lastMonth:number; tier1MRR:number; tier3FeesEarned:number; tier3FeePending:number; affiliateCommissions:number };
  prescan:  { today:number; last7Days:number; last30Days:number; allTime:number; conversionRate:number; topIndustries:Array<{industry:string;count:number}>; topProvinces:Array<{province:string;count:number}> };
  users:    { total:number; paid:number; free:number; newThisWeek:number; newThisMonth:number; activeToday:number };
  tier3:    { totalDiagnostics:number; pipelineValue:number; byStatus:Record<string,number>; feesThisMonth:number };
  system:   { lastUpdated:string };
}

const STAT_STAGE_COLORS: Record<string,string> = {
  draft:"#B5B3AD", sent:"#1B3A2D", signed:"#2D7A50", rejected:"#B34040", archived:"#8E8C85"
};

export default function AdminOverviewPage() {
  const [data, setData]       = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const timerRef              = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/overview", { cache: "no-store" });
      if (!r.ok) throw new Error("Unauthorized or server error");
      const j = await r.json();
      if (j.success) setData(j.data);
      else setError(j.error || "Failed to load");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [load]);

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
  const convPct = Math.min(100, Math.round(d.prescan.conversionRate || 0));

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">ADMIN</p>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">Business Overview</h1>
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

        {/* Revenue Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Revenue This Month",    value: fmt(d.revenue.thisMonth),          sub: `vs ${fmt(d.revenue.lastMonth)} last month`, green: true },
            { label: "MRR (Tier 1)",          value: fmt(d.revenue.tier1MRR),           sub: `${fmtNum(d.users.paid)} paid subscribers`, green: true },
            { label: "Tier 3 Fees Earned",    value: fmt(d.revenue.tier3FeesEarned),    sub: `${fmt(d.revenue.tier3FeePending)} pending`, green: false },
            { label: "Affiliate Commissions", value: fmt(d.revenue.affiliateCommissions),sub: "total earned", green: false },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-[#EEECE8] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-3">{c.label}</p>
              <p className={`font-serif text-[28px] font-bold leading-none tracking-tight ${c.green ? "text-[#2D7A50]" : "text-[#1A1A18]"}`}>{c.value}</p>
              <p className="text-[#8E8C85] text-xs mt-1.5">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Prescan Funnel */}
        <div className="bg-white rounded-xl border border-[#EEECE8] p-5 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">Prescan Funnel</p>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(45,122,80,0.08)", color: "#2D7A50" }}>{convPct}% conversion</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Today",    val: fmtNum(d.prescan.today) },
              { label: "7 Days",   val: fmtNum(d.prescan.last7Days) },
              { label: "30 Days",  val: fmtNum(d.prescan.last30Days) },
              { label: "All Time", val: fmtNum(d.prescan.allTime) },
            ].map(p => (
              <div key={p.label} className="border border-[#EEECE8] rounded-lg px-4 py-3 text-center">
                <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">{p.label}</p>
                <p className="font-serif text-xl font-bold text-[#1A1A18]">{p.val}</p>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-[10px] text-[#B5B3AD] mb-1">
              <span>Prescan → Paid conversion</span><span>{convPct}%</span>
            </div>
            <div className="h-2 bg-[#F0EFEB] rounded-full">
              <div className="h-full bg-[#1B3A2D] rounded-full transition-all" style={{ width: convPct + "%" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Top Industries", rows: d.prescan.topIndustries, key: "industry" },
              { title: "Top Provinces",  rows: d.prescan.topProvinces,  key: "province" },
            ].map(tbl => (
              <div key={tbl.title}>
                <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2">{tbl.title}</p>
                <div className="border border-[#EEECE8] rounded-lg overflow-hidden">
                  {(tbl.rows || []).slice(0, 5).map((r: any, i: number) => (
                    <div key={i} className="flex justify-between items-center px-3 py-2 border-b border-[#EEECE8] last:border-0 hover:bg-[#F8F7F5] transition-colors">
                      <span className="text-sm text-[#56554F]">{r[tbl.key]}</span>
                      <span className="text-sm font-semibold text-[#1A1A18]">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users + Tier 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Users */}
          <div className="bg-white rounded-xl border border-[#EEECE8] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-4">Users</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total",         val: fmtNum(d.users.total) },
                { label: "Paid",          val: fmtNum(d.users.paid), green: true },
                { label: "Free",          val: fmtNum(d.users.free) },
                { label: "New This Week", val: fmtNum(d.users.newThisWeek) },
                { label: "New This Month",val: fmtNum(d.users.newThisMonth) },
                { label: "Active Today",  val: fmtNum(d.users.activeToday) },
              ].map(u => (
                <div key={u.label} className="bg-[#FAFAF8] border border-[#EEECE8] rounded-lg p-3 text-center">
                  <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">{u.label}</p>
                  <p className={`font-serif text-lg font-bold ${(u as any).green ? "text-[#2D7A50]" : "text-[#1A1A18]"}`}>{u.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-white rounded-xl border border-[#EEECE8] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-4">Tier 3 Pipeline</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#FAFAF8] border border-[#EEECE8] rounded-lg p-3">
                <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">Pipeline Value</p>
                <p className="font-serif text-lg font-bold text-[#2D7A50]">{fmt(d.tier3.pipelineValue)}</p>
              </div>
              <div className="bg-[#FAFAF8] border border-[#EEECE8] rounded-lg p-3">
                <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">Fees This Month</p>
                <p className="font-serif text-lg font-bold text-[#1A1A18]">{fmt(d.tier3.feesThisMonth)}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {Object.entries(d.tier3.byStatus || {}).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm text-[#56554F] capitalize">{stage}</span>
                  <span className="text-sm font-semibold px-2 py-0.5 rounded text-[10px]"
                    style={{ background: "rgba(27,58,45,0.06)", color: STAT_STAGE_COLORS[stage] || "#1B3A2D" }}>
                    {count as number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white border border-[#EEECE8] rounded-xl px-5 py-3 flex items-center gap-2" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="w-2 h-2 rounded-full bg-[#2D7A50]" />
          <span className="text-sm text-[#56554F] font-medium">All Systems Operational</span>
        </div>

      </div>
    </div>
  );
}
