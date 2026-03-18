"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

interface ReportPreview { businessName: string; reportDate: string; summary: any; leaks: any[]; clients: any[]; tasks: any[]; snapshots: any[]; }

export default function ExportsPage() {
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/exports");
        if (res.ok) setPreview(await res.json());
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, []);

  const downloadReport = async (format: "pdf" | "excel") => {
    setGenerating(format);
    try {
      const res = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = format === "pdf" ? "leak-grow-report.pdf" : "leak-grow-export.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const err = await res.json();
        alert(`Export failed: ${err.error}`);
      }
    } catch (err) { console.error(err); }
    setGenerating(null);
  };

  const fmt = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;

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
          <Link href="/trending" className="text-sm font-semibold text-blue-200 hover:text-white transition">📈 Trends</Link>
          <Link href="/integrations" className="text-sm font-semibold text-blue-200 hover:text-white transition">🔌 Integrations</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">📄 Export & Reporting</h1>
          <p className="text-gray-500 text-sm mt-1">Download professional reports to share with accountants, partners, and stakeholders.</p>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-red-300 hover:shadow-lg transition cursor-pointer" onClick={() => downloadReport("pdf")}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl">📕</div>
              <div>
                <div className="font-extrabold text-gray-900">PDF Report</div>
                <div className="text-xs text-gray-400">Professional revenue intelligence report</div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Multi-page report with executive summary, leak details, client performance, action items, and trend history. Perfect for sharing with accountants and stakeholders.
            </div>
            <button disabled={generating === "pdf"} className="w-full px-4 py-3 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition disabled:opacity-50">
              {generating === "pdf" ? "Generating..." : "⬇ Download PDF Report"}
            </button>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-green-300 hover:shadow-lg transition cursor-pointer" onClick={() => downloadReport("excel")}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">📊</div>
              <div>
                <div className="font-extrabold text-gray-900">Excel Export</div>
                <div className="text-xs text-gray-400">Full data with 5 tabs</div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Complete spreadsheet with Summary, Leaks, Clients, Action Items, and Trends tabs. Color-coded, formatted, ready for your own analysis and pivot tables.
            </div>
            <button disabled={generating === "excel"} className="w-full px-4 py-3 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition disabled:opacity-50">
              {generating === "excel" ? "Generating..." : "⬇ Download Excel Export"}
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {loading ? <div className="text-center py-10 text-gray-400">Loading preview...</div> : preview && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-extrabold text-gray-900">Report Preview</div>
                <div className="text-xs text-gray-400">{preview.businessName} | {preview.reportDate}</div>
              </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[
                { label: "Revenue", value: fmt(preview.summary.totalRevenue), color: "text-gray-900" },
                { label: "Collected", value: fmt(preview.summary.totalCollected), color: "text-green-600" },
                { label: "Collection Rate", value: `${preview.summary.collectionRate}%`, color: "text-blue-600" },
                { label: "Leaks", value: `${preview.summary.openLeaks} ($${(preview.summary.leakImpact / 1000).toFixed(0)}k/yr)`, color: "text-red-600" },
                { label: "Health", value: preview.summary.healthScore, color: "text-purple-600" },
              ].map((m, i) => (
                <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-gray-500">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Included Data Summary */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: "💧", label: "Leaks", count: preview.leaks.length, desc: "Revenue leak details with priority and fix recommendations" },
                { icon: "👥", label: "Clients", count: preview.clients.length, desc: "Client performance with collection rates" },
                { icon: "✅", label: "Tasks", count: preview.tasks.length, desc: "Open action items with deadlines" },
                { icon: "📈", label: "Snapshots", count: preview.snapshots.length, desc: "Historical data points for trend analysis" },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{s.icon}</span>
                    <span className="font-bold text-gray-900 text-sm">{s.count} {s.label}</span>
                  </div>
                  <div className="text-xs text-gray-400">{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Top Leaks Preview */}
            {preview.leaks.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-bold text-gray-500 uppercase mb-2">Top Leaks in Report</div>
                <div className="space-y-1">
                  {preview.leaks.slice(0, 5).map((l, i) => (
                    <div key={i} className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${l.priority === "HIGH" || l.priority === "CRITICAL" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>{l.priority}</span>
                        <span className="text-sm text-gray-700">{l.clientName}: {l.description?.slice(0, 60)}</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">${Number(l.annualImpact).toLocaleString()}/yr</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </AppShell>
  );
}
