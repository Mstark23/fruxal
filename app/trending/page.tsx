"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

interface Snapshot { snapshot_date: string; total_revenue: number; total_collected: number; collection_rate: number; open_leak_count: number; total_leak_impact: number; fixed_leak_count: number; recovered_amount: number; active_clients: number; overdue_invoices: number; overdue_amount: number; avg_days_to_pay: number; overall_health: number; }
interface Trends { revenue: any; collection_rate: any; leak_impact: any; health: any; clients: any; }

export default function TrendingPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadTrends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trending?months=${months}`);
      if (res.ok) { const data = await res.json(); setSnapshots(data.snapshots || []); setTrends(data.trends || null); }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [months]);

  useEffect(() => { loadTrends(); }, [loadTrends]);

  const captureNow = async () => {
    setCapturing(true);
    try {
      await fetch("/api/trending", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "capture" }) });
      await loadTrends();
    } catch (err) { console.error(err); }
    setCapturing(false);
  };

  const seedHistory = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/trending", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "seed" }) });
      if (res.ok) { const data = await res.json(); if (data.seeded > 0) await loadTrends(); }
    } catch (err) { console.error(err); }
    setSeeding(false);
  };

  const trendArrow = (dir: string) => dir === "up" ? "↑" : dir === "down" ? "↓" : "→";
  const trendColor = (dir: string, invert = false) => {
    if (dir === "up") return invert ? "text-red-600" : "text-green-600";
    if (dir === "down") return invert ? "text-green-600" : "text-red-600";
    return "text-gray-500";
  };

  // Bar chart helper
  const maxVal = (key: keyof Snapshot) => Math.max(...snapshots.map((s) => Number(s[key]) || 0), 1);

  const BarChart = ({ data, valueKey, label, color = "#0F2B46", format = "money" }: { data: Snapshot[]; valueKey: keyof Snapshot; label: string; color?: string; format?: string }) => {
    const max = maxVal(valueKey);
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-sm font-extrabold text-gray-900 mb-3">{label}</div>
        <div className="flex items-end gap-1 h-32">
          {data.map((s, i) => {
            const val = Number(s[valueKey]) || 0;
            const height = max > 0 ? (val / max) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-gray-400 font-bold">
                  {format === "money" ? `$${(val / 1000).toFixed(0)}k` : format === "pct" ? `${val.toFixed(0)}%` : val.toFixed(0)}
                </div>
                <div className="w-full rounded-t" style={{ height: Math.max(height, 2) + "%", backgroundColor: color, minHeight: "2px" }} />
                <div className="text-xs text-gray-400">{new Date(s.snapshot_date).toLocaleDateString("en", { month: "short" })}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-[#0F2B46] to-blue-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm">L</div>
          <span className="text-lg font-extrabold text-white tracking-tight">Fruxal</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-blue-200 hover:text-white transition">← Dashboard</Link>
          <Link href="/tasks" className="text-sm font-semibold text-blue-200 hover:text-white transition">✅ Tasks</Link>
          <Link href="/exports" className="text-sm font-semibold text-blue-200 hover:text-white transition">📄 Reports</Link>
          <Link href="/integrations" className="text-sm font-semibold text-blue-200 hover:text-white transition">🔌 Integrations</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">📈 Historical Trends</h1>
            <p className="text-gray-500 text-sm mt-1">Track your revenue health over time. See if you&apos;re improving.</p>
          </div>
          <div className="flex gap-2">
            <select value={months} onChange={(e) => setMonths(parseInt(e.target.value))} className="text-sm border border-gray-300 rounded-lg px-3 py-2">
              <option value={3}>3 Months</option><option value={6}>6 Months</option><option value={12}>12 Months</option>
            </select>
            {snapshots.length === 0 && (
              <button onClick={seedHistory} disabled={seeding} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition disabled:opacity-50">
                {seeding ? "Seeding..." : "🌱 Seed Demo History"}
              </button>
            )}
            <button onClick={captureNow} disabled={capturing} className="px-4 py-2 rounded-lg bg-[#0F2B46] text-white font-bold text-sm hover:bg-blue-800 transition disabled:opacity-50">
              {capturing ? "Capturing..." : "📸 Capture Snapshot"}
            </button>
          </div>
        </div>

        {/* Trend Summary Cards */}
        {trends && snapshots.length > 1 && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: "Revenue", trend: trends.revenue, format: "money" },
              { label: "Collection Rate", trend: trends.collection_rate, format: "pct" },
              { label: "Leak Impact", trend: trends.leak_impact, format: "money", invert: true },
              { label: "Health Score", trend: trends.health, format: "pts" },
              { label: "Active Clients", trend: trends.clients, format: "num" },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div key={i} className="text-xs text-gray-500 font-bold uppercase mb-1">{t.label}</div>
                <div className={`text-lg font-black ${trendColor(t.trend.direction, t.label === "Leak Impact")}`}>
                  {trendArrow(t.trend.direction)} {t.format === "money" ? `$${Math.abs(t.trend.change).toLocaleString()}` : t.format === "pct" ? `${Math.abs(t.trend.change).toFixed(1)}%` : Math.abs(t.trend.change)}
                </div>
                <div className="text-xs text-gray-400">{t.trend.changePercent > 0 ? "+" : ""}{t.trend.changePercent}% vs {months}mo ago</div>
              </div>
            ))}
          </div>
        )}

        {loading ? <div className="text-center py-20 text-gray-400">Loading trends...</div> : snapshots.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📈</div>
            <div className="text-gray-500 font-bold">No snapshots yet</div>
            <div className="text-gray-400 text-sm mt-1">Click &quot;Capture Snapshot&quot; to record today&apos;s metrics, or &quot;Seed Demo History&quot; for sample data</div>
          </div>
        ) : (
          <>
            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <BarChart data={snapshots} valueKey="total_revenue" label="Revenue" color="#0F2B46" format="money" />
              <BarChart data={snapshots} valueKey="total_collected" label="Collected" color="#16A34A" format="money" />
              <BarChart data={snapshots} valueKey="collection_rate" label="Collection Rate %" color="#2563EB" format="pct" />
              <BarChart data={snapshots} valueKey="overall_health" label="Health Score" color="#7C3AED" format="number" />
              <BarChart data={snapshots} valueKey="total_leak_impact" label="Leak Impact (lower = better)" color="#DC2626" format="money" />
              <BarChart data={snapshots} valueKey="active_clients" label="Active Clients" color="#F97316" format="number" />
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm font-extrabold text-gray-900 mb-3">Snapshot History</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Date", "Revenue", "Collected", "Rate", "Leaks", "Impact", "Fixed", "Recovered", "Clients", "Overdue", "Health"].map((h, _ki) => (
                        <th key={_ki} className="px-2 py-2 text-left font-bold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {snapshots.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-2 py-2 font-bold text-gray-700">{new Date(s.snapshot_date).toLocaleDateString()}</td>
                        <td className="px-2 py-2">${Number(s.total_revenue).toLocaleString()}</td>
                        <td className="px-2 py-2">${Number(s.total_collected).toLocaleString()}</td>
                        <td className="px-2 py-2">{Number(s.collection_rate).toFixed(1)}%</td>
                        <td className="px-2 py-2">{s.open_leak_count}</td>
                        <td className="px-2 py-2 text-red-600">${Number(s.total_leak_impact).toLocaleString()}</td>
                        <td className="px-2 py-2 text-green-600">{s.fixed_leak_count}</td>
                        <td className="px-2 py-2 text-green-600">${Number(s.recovered_amount).toLocaleString()}</td>
                        <td className="px-2 py-2">{s.active_clients}</td>
                        <td className="px-2 py-2">{s.overdue_invoices}</td>
                        <td className="px-2 py-2 font-bold">{Number(s.overall_health).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </AppShell>
  );
}
