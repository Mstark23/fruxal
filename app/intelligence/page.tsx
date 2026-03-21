"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface WaterfallStep { label: string; value: number; type: string; percentage: number; color: string; detail: string; }
interface Waterfall { steps: WaterfallStep[]; grossRevenue: number; netCollected: number; secureRevenue: number; totalLeakage: number; leakagePercent: number; pocketMargin: number; }

interface SegClient { clientId: string; clientName: string; revenue: number; revenueNormalized: number; healthScore: number; growthRate: number; paymentScore: number; quadrant: string; strategy: string; actions: string[]; riskFactors: string[]; }
interface Matrix { clients: SegClient[]; quadrantCounts: { stars: number; cashCows: number; potentials: number; atRisk: number }; quadrantRevenue: { stars: number; cashCows: number; potentials: number; atRisk: number }; medianRevenue: number; medianHealth: number; }

interface CohortMonth { month: number; revenue: number; retainedClients: number; retentionPct: number; }
interface CohortRow { cohortLabel: string; clientCount: number; months: CohortMonth[]; totalRevenue: number; avgRevenuePerClient: number; trend: string; }

interface VarItem { clientId: string; clientName: string; expectedRevenue: number; actualRevenue: number; totalVariance: number; priceVariance: number; volumeVariance: number; variancePercent: number; status: string; explanation: string; }
interface Variance { items: VarItem[]; totalExpected: number; totalActual: number; totalVariance: number; totalPriceVariance: number; totalVolumeVariance: number; favorableCount: number; unfavorableCount: number; }

const QUADRANT_STYLES: Record<string, { bg: string; border: string; text: string; icon: string; label: string }> = {
  STAR: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", icon: "⭐", label: "Star" },
  CASH_COW: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", icon: "🐄", label: "Cash Cow" },
  POTENTIAL: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", icon: "❓", label: "Potential" },
  AT_RISK: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", icon: "💀", label: "At Risk" },
};

export default function IntelligencePage() {
  const [tab, setTab] = useState<"waterfall" | "matrix" | "cohort" | "variance">("waterfall");
  const [loading, setLoading] = useState(true);
  const [waterfall, setWaterfall] = useState<Waterfall | null>(null);
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [variance, setVariance] = useState<Variance | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, mRes, cRes, vRes] = await Promise.all([
        fetch("/api/analytics/waterfall"),
        fetch("/api/analytics/segmentation"),
        fetch("/api/analytics/cohort"),
        fetch("/api/analytics/variance"),
      ]);
      if (wRes.ok) { const d = await wRes.json(); setWaterfall(d.waterfall); }
      if (mRes.ok) { const d = await mRes.json(); setMatrix(d.matrix); }
      if (cRes.ok) { const d = await cRes.json(); setCohorts(d.cohorts); }
      if (vRes.ok) { const d = await vRes.json(); setVariance(d.variance); }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

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
          <Link href="/analytics" className="text-sm font-semibold text-blue-200 hover:text-white transition">📊 Analytics</Link>
          <Link href="/industry" className="text-sm font-semibold text-blue-200 hover:text-white transition">🏭 Industry</Link>
          <Link href="/contracts" className="text-sm font-semibold text-blue-200 hover:text-white transition">📄 Contracts</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">🔬 Enterprise Intelligence</h1>
            <p className="text-gray-500 text-sm mt-1">The 4 frameworks that Fortune 500 companies pay $200K/year for</p>
          </div>
          <button onClick={load} className="px-4 py-2 text-sm font-bold text-brand-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition">↻ Refresh</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {[
            { key: "waterfall", label: "💧 Revenue Waterfall", sub: "Vendavo" },
            { key: "matrix", label: "📊 Client Matrix", sub: "McKinsey" },
            { key: "cohort", label: "📈 Cohort Analysis", sub: "ChartMogul" },
            { key: "variance", label: "📐 Variance Analysis", sub: "Caseware" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${tab === t.key ? "bg-navy text-white" : "bg-white text-gray-500 hover:text-gray-700 border border-gray-200"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading enterprise analytics...</div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* REVENUE WATERFALL                                              */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {tab === "waterfall" && waterfall && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Gross Revenue</div>
                    <div className="text-2xl font-black text-gray-900">${(waterfall.grossRevenue ?? 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Net Collected</div>
                    <div className="text-2xl font-black text-blue-600">${(waterfall.netCollected ?? 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-red-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Total Leakage</div>
                    <div className="text-2xl font-black text-red-600">${(waterfall.totalLeakage ?? 0).toLocaleString()}</div>
                    <div className="text-xs text-red-400">{waterfall.leakagePercent}% of gross</div>
                  </div>
                  <div className="bg-white rounded-xl border border-green-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Secure Revenue</div>
                    <div className="text-2xl font-black text-green-600">${(waterfall.secureRevenue ?? 0).toLocaleString()}</div>
                    <div className="text-xs text-green-500">Pocket margin: {waterfall.pocketMargin}%</div>
                  </div>
                </div>

                {/* Waterfall Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">Revenue Waterfall</h3>
                  <p className="text-sm text-gray-400 mb-6">Every dollar from billing to secure revenue — where the leaks happen</p>
                  <div className="space-y-3">
                    {waterfall.steps.map((step, i) => {
                      const maxVal = waterfall.grossRevenue;
                      const barWidth = maxVal > 0 ? Math.abs(step.value) / maxVal * 100 : 0;
                      const isLoss = step.type === "loss";
                      const isSubtotal = step.type === "subtotal" || step.type === "end";

                      return (
                        <div key={i} className={`flex items-center gap-4 ${isSubtotal ? "pt-2 border-t border-gray-200" : ""}`}>
                          <div className="w-48 text-right shrink-0">
                            <div className={`text-sm font-bold ${isLoss ? "text-gray-600" : "text-gray-900"}`}>{step.label}</div>
                          </div>
                          <div className="flex-1 relative">
                            <div className={`h-10 rounded-lg flex items-center transition-all ${isLoss ? "justify-end" : ""}`}
                              style={{
                                width: `${Math.max(barWidth, 2)}%`,
                                backgroundColor: step.color + (isLoss ? "30" : ""),
                                borderLeft: isLoss ? `4px solid ${step.color}` : "none",
                                borderRight: !isLoss ? `4px solid ${step.color}` : "none",
                              }}>
                              <span className={`px-3 text-sm font-extrabold ${isLoss ? "text-red-700" : step.type === "end" ? "text-green-700" : "text-gray-900"}`}>
                                {isLoss ? "−" : ""}${Math.abs(step.value).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="w-16 text-right shrink-0">
                            <span className={`text-xs font-bold ${isLoss ? "text-red-500" : "text-gray-400"}`}>
                              {isLoss ? `−${step.percentage}%` : `${step.percentage}%`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detail cards for losses */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {waterfall.steps.filter((s) => s.type === "loss" && s.value !== 0).map((step, i) => (
                      <div key={i} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: step.color }} />
                          <span className="text-xs font-bold text-gray-700">{step.label}</span>
                          <span className="text-xs font-extrabold text-red-600 ml-auto">−${Math.abs(step.value).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500">{step.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CLIENT SEGMENTATION MATRIX                                     */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {tab === "matrix" && matrix && (
              <div className="space-y-6">
                {/* Quadrant Summary */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { key: "stars", label: "Stars", icon: "⭐", count: matrix.quadrantCounts.stars, rev: matrix.quadrantRevenue.stars, color: "green" },
                    { key: "cashCows", label: "Cash Cows", icon: "🐄", count: matrix.quadrantCounts.cashCows, rev: matrix.quadrantRevenue.cashCows, color: "yellow" },
                    { key: "potentials", label: "Potentials", icon: "❓", count: matrix.quadrantCounts.potentials, rev: matrix.quadrantRevenue.potentials, color: "blue" },
                    { key: "atRisk", label: "At Risk", icon: "💀", count: matrix.quadrantCounts.atRisk, rev: matrix.quadrantRevenue.atRisk, color: "red" },
                  ].map((q, _ki) => (
                    <div key={q.key} className={`bg-white rounded-xl border border-${q.color}-200 p-5 text-center`}>
                      <div key={_ki} className="text-2xl mb-1">{q.icon}</div>
                      <div className="text-2xl font-black text-gray-900">{q.count}</div>
                      <div className="text-xs font-bold text-gray-500">{q.label}</div>
                      <div className="text-sm font-bold text-gray-400 mt-1">${(q.rev ?? 0).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                {/* Visual Matrix */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">Client Segmentation Matrix</h3>
                  <p className="text-sm text-gray-400 mb-6">X = Revenue | Y = Health Score | Size = Revenue amount</p>

                  <div className="relative" style={{ height: "420px" }}>
                    {/* Quadrant backgrounds */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
                      <div className="bg-blue-50/50 border-b border-r border-gray-200 flex items-center justify-center">
                        <span className="text-3xl opacity-20">❓</span>
                      </div>
                      <div className="bg-green-50/50 border-b border-gray-200 flex items-center justify-center">
                        <span className="text-3xl opacity-20">⭐</span>
                      </div>
                      <div className="bg-red-50/50 border-r border-gray-200 flex items-center justify-center">
                        <span className="text-3xl opacity-20">💀</span>
                      </div>
                      <div className="bg-yellow-50/50 flex items-center justify-center">
                        <span className="text-3xl opacity-20">🐄</span>
                      </div>
                    </div>

                    {/* Axis labels */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 uppercase">Revenue →</div>
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-gray-400 uppercase">Health →</div>

                    {/* Quadrant labels */}
                    <div className="absolute top-2 left-2 text-xs font-bold text-blue-400">Potentials</div>
                    <div className="absolute top-2 right-2 text-xs font-bold text-green-500">Stars</div>
                    <div className="absolute bottom-2 left-2 text-xs font-bold text-red-400">At Risk</div>
                    <div className="absolute bottom-2 right-2 text-xs font-bold text-yellow-500">Cash Cows</div>

                    {/* Client dots */}
                    {matrix.clients.map((c, _ci) => {
                      const x = (c.revenueNormalized / 100) * 90 + 5; // 5-95% range
                      const y = 95 - (c.healthScore / 100) * 90; // Invert for CSS (top=0)
                      const size = Math.max(24, Math.min(48, (c.revenue / Math.max(...matrix.clients.map(cc => cc.revenue))) * 48));
                      const qs = QUADRANT_STYLES[c.quadrant] || QUADRANT_STYLES.AT_RISK;

                      return (
                        <button key={c.clientId ?? _ci}
                          onClick={() => setSelectedClient(selectedClient === c.clientId ? null : c.clientId)}
                          className={`absolute rounded-full border-2 ${qs.border} ${qs.bg} flex items-center justify-center text-xs font-bold ${qs.text} hover:scale-125 hover:z-20 transition-all shadow-sm ${selectedClient === c.clientId ? "ring-2 ring-navy scale-125 z-20" : ""}`}
                          style={{ left: x + "%", top: y + "%", width: size + "px", height: size + "px", transform: "translate(-50%, -50%)" }}
                          title={`${c.clientName}: $${(c.revenue ?? 0).toLocaleString()} | Health: ${c.healthScore}`}
                        >
                          {c.clientName.slice(0, 2)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Client Detail */}
                {selectedClient && (() => {
                  const c = matrix.clients.find((cl) => cl.clientId === selectedClient);
                  if (!c) return null;
                  const qs = QUADRANT_STYLES[c.quadrant];
                  return (
                    <div className={`rounded-xl border-2 ${qs.border} ${qs.bg} p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-lg font-extrabold text-gray-900">{qs.icon} {c.clientName}</div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${qs.border} ${qs.text}`}>{qs.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-400">Revenue</div>
                          <div className="text-xl font-black text-gray-900">${(c.revenue ?? 0).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-400">Health Score</div>
                          <div className="text-lg font-black text-gray-900">{c.healthScore}/100</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-400">Growth Rate</div>
                          <div className={`text-lg font-black ${c.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>{c.growthRate >= 0 ? "+" : ""}{c.growthRate}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-400">Payment Score</div>
                          <div className="text-lg font-black text-gray-900">{c.paymentScore}/100</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm font-bold text-gray-700 mb-1">Strategy: {c.strategy}</div>
                      </div>
                      {c.riskFactors.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-bold text-red-600 uppercase mb-1">Risk Factors</div>
                          <div className="flex flex-wrap gap-2">
                            {c.riskFactors.map((r, i) => (
                              <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Recommended Actions</div>
                        <div className="grid grid-cols-2 gap-2">
                          {c.actions.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-white rounded-lg p-2 border border-gray-200">
                              <span className="text-green-500 font-bold shrink-0">#{i + 1}</span> {a}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Client List by Quadrant */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Client</th>
                        <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Quadrant</th>
                        <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-3">Revenue</th>
                        <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Health</th>
                        <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Growth</th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Strategy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {matrix.clients.sort((a, b) => b.revenue - a.revenue).map((c) => {
                        const qs = QUADRANT_STYLES[c.quadrant];
                        return (
                          <tr key={c.clientId ?? c.clientName} className="hover:bg-gray-50 cursor-pointer transition" onClick={() => setSelectedClient(c.clientId)}>
                            <td className="px-4 py-3 font-bold text-gray-900">{c.clientName}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${qs.border} ${qs.text} ${qs.bg}`}>
                                {qs.icon} {qs.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">${(c.revenue ?? 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-extrabold ${c.healthScore >= 70 ? "text-green-600" : c.healthScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>{c.healthScore}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-bold ${c.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>{c.growthRate >= 0 ? "+" : ""}{c.growthRate}%</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{c.strategy}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* COHORT ANALYSIS                                                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {tab === "cohort" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">Client Cohort Analysis</h3>
                  <p className="text-sm text-gray-400 mb-6">Clients grouped by start month. Track how revenue evolves over time per cohort.</p>

                  {cohorts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">Not enough data for cohort analysis.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left text-xs font-bold text-gray-500 uppercase px-3 py-2 sticky left-0 bg-gray-50">Cohort</th>
                            <th className="text-center text-xs font-bold text-gray-500 uppercase px-3 py-2">Clients</th>
                            <th className="text-center text-xs font-bold text-gray-500 uppercase px-3 py-2">Trend</th>
                            {Array.from({ length: Math.max(...cohorts.map((c) => c.months.length)) }, (_, i) => (
                              <th key={`th-${Math.random()}`} className="text-center text-xs font-bold text-gray-500 uppercase px-3 py-2">M{i + 1}</th>
                            ))}
                            <th className="text-right text-xs font-bold text-gray-500 uppercase px-3 py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {cohorts.map((cohort) => {
                            const maxMonthRev = Math.max(...cohort.months.map((m, _ki) => m.revenue), 1);
                            return (
                              <tr key={cohort.cohortLabel}>
                                <td key={cohort.cohortLabel} className="px-3 py-3 font-bold text-gray-900 sticky left-0 bg-white whitespace-nowrap">{cohort.cohortLabel}</td>
                                <td key={`td-${cohort.cohortLabel}`} className="px-3 py-3 text-center text-gray-600">{cohort.clientCount}</td>
                                <td className="px-3 py-3 text-center">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    cohort.trend === "GROWING" ? "bg-green-100 text-green-700" : cohort.trend === "DECLINING" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                                  }`}>{cohort.trend === "GROWING" ? "↑" : cohort.trend === "DECLINING" ? "↓" : "→"}</span>
                                </td>
                                {cohort.months.map((m) => {
                                  const intensity = maxMonthRev > 0 ? m.revenue / maxMonthRev : 0;
                                  const r = Math.round(34 + (1 - intensity) * 200);
                                  const g = Math.round(120 + (1 - intensity) * 100);
                                  const b = Math.round(200 - intensity * 100);
                                  return (
                                    <td className="px-3 py-3 text-center" title={`${m.retainedClients} clients (${m.retentionPct}% retention)`}>
                                      <div className="rounded px-2 py-1 text-xs font-bold" style={{
                                        backgroundColor: `rgba(${15 + Math.round(intensity * 20)}, ${43 + Math.round(intensity * 50)}, ${70 + Math.round(intensity * 100)}, ${0.1 + intensity * 0.3})`,
                                        color: intensity > 0.5 ? "#0F2B46" : "#9CA3AF",
                                      }}>
                                        {m.revenue > 0 ? `$${(m.revenue / 1000).toFixed(1)}K` : "—"}
                                      </div>
                                    </td>
                                  );
                                })}
                                {/* Pad empty months */}
                                {Array.from({ length: Math.max(...cohorts.map((c) => c.months.length)) }, (_, i) => (
                                  <td key={`pad-${i}`} className="px-3 py-3 text-center text-xs text-gray-300">—</td>
                                ))}
                                <td className="px-3 py-3 text-right font-extrabold text-gray-900">${(cohort.totalRevenue ?? 0).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Cohort insights */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Total Cohorts</div>
                    <div className="text-2xl font-black text-gray-900">{cohorts.length}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-green-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Growing Cohorts</div>
                    <div className="text-2xl font-black text-green-600">{cohorts.filter((c) => c.trend === "GROWING").length}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-red-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Declining Cohorts</div>
                    <div className="text-2xl font-black text-red-600">{cohorts.filter((c) => c.trend === "DECLINING").length}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VARIANCE ANALYSIS                                              */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {tab === "variance" && variance && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Expected Revenue</div>
                    <div className="text-xl font-black text-gray-900">${(variance.totalExpected ?? 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Actual Revenue</div>
                    <div className="text-xl font-black text-blue-600">${(variance.totalActual ?? 0).toLocaleString()}</div>
                  </div>
                  <div className={`bg-white rounded-xl border p-5 text-center ${variance.totalVariance >= 0 ? "border-green-200" : "border-red-200"}`}>
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Total Variance</div>
                    <div className={`text-xl font-black ${variance.totalVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {variance.totalVariance >= 0 ? "+" : ""}${variance.totalVariance.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Unfavorable</div>
                    <div className="text-xl font-black text-red-600">{variance.unfavorableCount}</div>
                    <div className="text-xs text-gray-400">clients below expected</div>
                  </div>
                </div>

                {/* Price vs Volume Breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-4">Variance Decomposition</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 rounded-lg border border-gray-200">
                      <div className="text-xs font-bold text-gray-500 uppercase mb-2">Price Variance</div>
                      <div className={`text-3xl font-black ${variance.totalPriceVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {variance.totalPriceVariance >= 0 ? "+" : ""}${variance.totalPriceVariance.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Difference from charging above/below expected rates</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-gray-200">
                      <div className="text-xs font-bold text-gray-500 uppercase mb-2">Volume Variance</div>
                      <div className={`text-3xl font-black ${variance.totalVolumeVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {variance.totalVolumeVariance >= 0 ? "+" : ""}${variance.totalVolumeVariance.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Difference from selling more/less volume than expected</div>
                    </div>
                  </div>
                </div>

                {/* Client Variance Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Client</th>
                        <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-3">Expected</th>
                        <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-3">Actual</th>
                        <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-3">Variance</th>
                        <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-3">Price</th>
                        <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-3">Volume</th>
                        <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {variance.items.map((item, _ki) => (
                        <tr key={item.clientId} className="hover:bg-gray-50 transition group">
                          <td key={_ki} className="px-4 py-3">
                            <div className="font-bold text-gray-900">{item.clientName}</div>
                            <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition">{item.explanation}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">${(item.expectedRevenue ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">${(item.actualRevenue ?? 0).toLocaleString()}</td>
                          <td className={`px-4 py-3 text-right font-extrabold ${item.totalVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {item.totalVariance >= 0 ? "+" : ""}${item.totalVariance.toLocaleString()}
                          </td>
                          <td className={`px-4 py-3 text-right text-xs font-bold ${item.priceVariance >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {item.priceVariance >= 0 ? "+" : ""}${item.priceVariance.toLocaleString()}
                          </td>
                          <td className={`px-4 py-3 text-right text-xs font-bold ${item.volumeVariance >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {item.volumeVariance >= 0 ? "+" : ""}${item.volumeVariance.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              item.status === "FAVORABLE" ? "bg-green-100 text-green-700" : item.status === "UNFAVORABLE" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                            }`}>{item.status === "FAVORABLE" ? "✓" : item.status === "UNFAVORABLE" ? "✗" : "—"} {item.variancePercent}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
