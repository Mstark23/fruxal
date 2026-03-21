"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface ClientProfit {
  clientId: string;
  clientName: string;
  revenue: number;
  revenueRank: number;
  paymentScore: number;
  growthRate: number;
  concentrationRisk: number;
  profitabilityScore: number;
  tier: string;
  insights: string[];
}

interface Benchmark {
  metric: string;
  yourValue: number;
  industryAvg: number;
  industryTop: number;
  unit: string;
  status: string;
  gap: number;
  recommendation: string;
}

interface ForecastMonth { month: string; projected: number; optimistic: number; pessimistic: number; atRisk: number; }
interface Forecast { months: ForecastMonth[]; totalProjected: number; totalAtRisk: number; growthTrend: number; churnRisk: number; expansionOpportunity: number; }

interface HealthComponent { name: string; score: number; weight: number; status: string; detail: string; }
interface HealthScore { overall: number; grade: string; components: HealthComponent[]; topActions: string[]; }

interface Recovery { totalDetected: number; totalImpactDetected: number; open: { count: number; impact: number }; inProgress: { count: number; impact: number }; fixed: { count: number; recovered: number }; dismissed: { count: number }; fixRate: number; roi: number; }

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
  PLATINUM: "bg-purple-100 text-purple-700 border-purple-200",
  GOLD: "bg-yellow-100 text-yellow-700 border-yellow-200",
  SILVER: "bg-gray-100 text-gray-600 border-gray-200",
  BRONZE: "bg-orange-100 text-orange-700 border-orange-200",
  AT_RISK: "bg-red-100 text-red-700 border-red-200",
};

const TIER_ICONS: Record<string, string> = {
  PLATINUM: "💎", GOLD: "🥇", SILVER: "🥈", BRONZE: "🥉", AT_RISK: "⚠️",
};

const STATUS_COLORS: Record<string, string> = {
  GOOD: "text-green-600", OK: "text-yellow-600", WARNING: "text-orange-600", CRITICAL: "text-red-600",
};

const BENCH_COLORS: Record<string, string> = {
  ABOVE: "text-green-600 bg-green-50", AT: "text-gray-600 bg-gray-50", BELOW: "text-red-600 bg-red-50",
};

export default function AnalyticsPage() {
  const [tab, setTab] = useState<"health" | "clients" | "benchmarks" | "forecast" | "recovery">("health");
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [clients, setClients] = useState<ClientProfit[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [recovery, setRecovery] = useState<Recovery | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, pRes, bRes, fRes, rRes] = await Promise.all([
        fetch("/api/analytics/health-score"),
        fetch("/api/analytics/profitability"),
        fetch("/api/analytics/benchmarks"),
        fetch("/api/analytics/forecast"),
        fetch("/api/leaks/fix"),
      ]);
      if (hRes.ok) { const d = await hRes.json(); setHealth(d.healthScore); }
      if (pRes.ok) { const d = await pRes.json(); setClients(d.profitability); }
      if (bRes.ok) { const d = await bRes.json(); setBenchmarks(d.benchmarks); }
      if (fRes.ok) { const d = await fRes.json(); setForecast(d.forecast); }
      if (rRes.ok) { const d = await rRes.json(); setRecovery(d.recovery); }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const maxForecast = forecast ? Math.max(...forecast.months.map((m) => m.optimistic)) : 0;

  return (
    <AppShell>
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <div className="bg-gradient-to-r from-navy to-blue-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-black text-sm">L</div>
          <span className="text-lg font-extrabold text-white tracking-tight">Fruxal</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-blue-200 hover:text-white transition">← Dashboard</Link>
          <Link href="/contracts" className="text-sm font-semibold text-blue-200 hover:text-white transition">📄 Contracts</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">📊 Revenue Intelligence</h1>
            <p className="text-gray-500 text-sm mt-1">Enterprise-grade analytics powered by your real data</p>
          </div>
          <button onClick={loadAll} className="px-4 py-2 text-sm font-bold text-brand-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition">
            ↻ Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {[
            { key: "health", label: "🏥 Health Score" },
            { key: "clients", label: "👥 Client Profitability" },
            { key: "benchmarks", label: "📈 Benchmarks" },
            { key: "forecast", label: "🔮 Forecast" },
            { key: "recovery", label: "💰 Recovery" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${tab === t.key ? "bg-navy text-white" : "bg-white text-gray-500 hover:text-gray-700 border border-gray-200"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading analytics...</div>
        ) : (
          <>
            {/* ═══ HEALTH SCORE ═══ */}
            {tab === "health" && health && (
              <div className="space-y-6">
                {/* Main Score */}
                <div className="bg-gradient-to-r from-navy to-blue-800 rounded-xl p-8 text-white text-center">
                  <div className="text-sm font-bold text-blue-200 uppercase tracking-wide mb-2">Revenue Health Score</div>
                  <div className="text-7xl font-black mb-2">{health.overall}</div>
                  <div className={`inline-block text-2xl font-black px-4 py-1 rounded-full ${
                    health.overall >= 80 ? "bg-green-500/20 text-green-300" : health.overall >= 60 ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"
                  }`}>Grade: {health.grade}</div>
                </div>

                {/* Components */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-4">Score Breakdown</h3>
                  <div className="space-y-4">
                    {health.components.map((comp, _ki) => (
                      <div key={comp.name}>
                        <div key={_ki} className="flex items-center justify-between mb-1">
                          <div className="text-sm font-bold text-gray-900">{comp.name} <span className="text-gray-400 font-normal">({comp.weight}%)</span></div>
                          <div className={`text-sm font-extrabold ${STATUS_COLORS[comp.status]}`}>{comp.score}/100</div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${
                            comp.score >= 80 ? "bg-green-500" : comp.score >= 60 ? "bg-yellow-500" : comp.score >= 40 ? "bg-orange-500" : "bg-red-500"
                          }`} style={{ width: comp.score + "%" }} />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{comp.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Actions */}
                {health.topActions.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-4">🎯 Priority Actions</h3>
                    <div className="space-y-3">
                      {health.topActions.map((action, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <span key={i} className="text-lg font-bold text-brand-blue">#{i + 1}</span>
                          <span className="text-sm text-gray-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ CLIENT PROFITABILITY ═══ */}
            {tab === "clients" && (
              <div className="space-y-4">
                {/* Tier Summary */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {["PLATINUM", "GOLD", "SILVER", "BRONZE", "AT_RISK"].map((tier) => {
                    const count = clients.filter((c) => c.tier === tier).length;
                    return (
                      <div key={tier} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <div className="text-2xl mb-1">{TIER_ICONS[tier]}</div>
                        <div className="text-2xl font-black text-gray-900">{count}</div>
                        <div className="text-xs font-bold text-gray-400">{tier.replace("_", " ")}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Client Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Client</th>
                          <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-3">Revenue</th>
                          <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Score</th>
                          <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Payment</th>
                          <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Growth</th>
                          <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Tier</th>
                          <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Insights</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {clients.map((c, _ki) => (
                          <tr key={_ki} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-900">{c.clientName}</div>
                              <div className="text-xs text-gray-400">#{c.revenueRank} by revenue</div>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">${(c.revenue ?? 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-extrabold ${c.profitabilityScore >= 70 ? "text-green-600" : c.profitabilityScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                {c.profitabilityScore}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-xs font-bold border-2" style={{
                                borderColor: c.paymentScore >= 70 ? "#22c55e" : c.paymentScore >= 40 ? "#eab308" : "#ef4444",
                                color: c.paymentScore >= 70 ? "#22c55e" : c.paymentScore >= 40 ? "#eab308" : "#ef4444",
                              }}>{c.paymentScore}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-bold ${c.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {c.growthRate >= 0 ? "+" : ""}{c.growthRate}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${TIER_COLORS[c.tier]}`}>
                                {TIER_ICONS[c.tier]} {c.tier.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              {c.insights.length > 0 ? (
                                <div className="text-xs text-gray-500 leading-tight">{c.insights[0]}</div>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ BENCHMARKS ═══ */}
            {tab === "benchmarks" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benchmarks.map((b, _ki) => (
                    <div key={b.metric} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div key={_ki} className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold text-gray-900">{b.metric}</div>
                        <span key={String(Math.random())} className={`text-xs font-bold px-2.5 py-1 rounded-full ${BENCH_COLORS[b.status]}`}>
                          {b.status === "ABOVE" ? "✓ Above avg" : b.status === "AT" ? "— On par" : "✗ Below avg"}
                        </span>
                      </div>

                      {/* Bar visualization */}
                      <div className="relative mb-3">
                        <div className="flex items-end gap-2 h-16">
                          {/* Your value */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="text-lg font-black text-gray-900">{(b.yourValue ?? 0).toLocaleString()}<span className="text-xs font-normal text-gray-400"> {b.unit}</span></div>
                            <div className={`w-full rounded-t transition-all ${b.status === "ABOVE" ? "bg-green-500" : b.status === "AT" ? "bg-yellow-500" : "bg-red-400"}`}
                              style={{ height: Math.min(100, Math.max(20, (b.yourValue / Math.max(b.industryTop, 1)) * 100)) + "%" }} />
                            <div className="text-xs font-bold text-gray-500 mt-1">You</div>
                          </div>
                          {/* Industry avg */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="text-sm font-bold text-gray-400">{(b.industryAvg ?? 0).toLocaleString()}</div>
                            <div className="w-full bg-gray-300 rounded-t"
                              style={{ height: Math.min(100, Math.max(20, (b.industryAvg / Math.max(b.industryTop, 1)) * 100)) + "%" }} />
                            <div className="text-xs font-bold text-gray-400 mt-1">Avg</div>
                          </div>
                          {/* Top performers */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="text-sm font-bold text-gray-400">{(b.industryTop ?? 0).toLocaleString()}</div>
                            <div className="w-full bg-blue-200 rounded-t"
                              style={{ height: "100%" }} />
                            <div className="text-xs font-bold text-gray-400 mt-1">Top 10%</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 leading-snug">{b.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ FORECAST ═══ */}
            {tab === "forecast" && forecast && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">6-Month Projected</div>
                    <div className="text-2xl font-black text-gray-900">${(forecast.totalProjected ?? 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Growth Trend</div>
                    <div className={`text-2xl font-black ${forecast.growthTrend >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {forecast.growthTrend >= 0 ? "+" : ""}{forecast.growthTrend}%
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-red-200 p-5">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Churn Risk</div>
                    <div className="text-2xl font-black text-red-600">${(forecast.churnRisk ?? 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-green-200 p-5">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Expansion Opp.</div>
                    <div className="text-2xl font-black text-green-600">${(forecast.expansionOpportunity ?? 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* Forecast Chart (CSS bars) */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-6">Revenue Forecast — Next 6 Months</h3>
                  <div className="space-y-4">
                    {forecast.months.map((m, _ki) => (
                      <div key={_ki}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-gray-700 w-20">{m.month}</span>
                          <span className="text-sm font-extrabold text-gray-900">${(m.projected ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                          {/* Pessimistic (light red background) */}
                          <div className="absolute left-0 top-0 h-full bg-red-100 rounded-lg" style={{ width: (m.pessimistic / maxForecast) * 100 + "%" }} />
                          {/* Projected (blue) */}
                          <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-lg opacity-80" style={{ width: (m.projected / maxForecast) * 100 + "%" }} />
                          {/* Optimistic (green outline) */}
                          <div className="absolute left-0 top-0 h-full border-r-2 border-green-500 border-dashed" style={{ width: (m.optimistic / maxForecast) * 100 + "%" }} />
                          {/* At Risk marker */}
                          {m.atRisk > 0 && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-red-600 bg-white px-1.5 py-0.5 rounded">
                              -${(m.atRisk ?? 0).toLocaleString()} at risk
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded" /> Projected</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 border-2 border-green-500 border-dashed rounded" /> Optimistic</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 rounded" /> Pessimistic</div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ RECOVERY ═══ */}
            {tab === "recovery" && recovery && (
              <div className="space-y-6">
                {/* Pipeline */}
                <div className="bg-gradient-to-r from-navy to-blue-800 rounded-xl p-6 text-white">
                  <div className="text-sm font-bold text-blue-200 uppercase tracking-wide mb-4">Leak Recovery Pipeline</div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-black">{recovery.open.count}</div>
                      <div className="text-xs text-blue-200">Open</div>
                      <div className="text-sm font-bold text-blue-200">${(recovery.open.impact ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black">{recovery.inProgress.count}</div>
                      <div className="text-xs text-blue-200">In Progress</div>
                      <div className="text-sm font-bold text-blue-200">${(recovery.inProgress.impact ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-green-300">{recovery.fixed.count}</div>
                      <div className="text-xs text-blue-200">Fixed</div>
                      <div className="text-sm font-bold text-green-300">${(recovery.fixed.recovered ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-gray-400">{recovery.dismissed.count}</div>
                      <div className="text-xs text-blue-200">Dismissed</div>
                    </div>
                  </div>
                </div>

                {/* ROI Card */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-green-200 p-6 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">💰 Total Recovered</div>
                    <div className="text-3xl font-black text-green-600">${(recovery.roi ?? 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">Direct ROI from fixes</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">📊 Fix Rate</div>
                    <div className="text-3xl font-black text-gray-900">{recovery.fixRate}%</div>
                    <div className="text-xs text-gray-400 mt-1">Of detected leaks resolved</div>
                  </div>
                  <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">🔴 Still Leaking</div>
                    <div className="text-3xl font-black text-red-600">${((recovery.open.impact ?? 0) + (recovery.inProgress?.impact ?? 0)).toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">/year until resolved</div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <p className="text-gray-500 text-sm mb-4">
                    Mark leaks as Fixed from the Dashboard → Leaks tab. Enter the amount recovered to track your ROI.
                  </p>
                  <Link href="/dashboard" className="inline-block px-6 py-2.5 text-sm font-bold text-white bg-navy rounded-lg hover:bg-blue-900 transition">
                    Go to Leaks →
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </AppShell>
  );
}
