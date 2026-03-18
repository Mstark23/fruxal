"use client";

import { useState, useEffect, useCallback } from "react";

interface Leak {
  id: string;
  category: string;
  title: string;
  severity: "critical" | "warning" | "info" | "ok";
  currentValue: string;
  benchmark: string;
  annualImpact: number;
  description: string;
  recommendation: string;
  source: string;
}

const SEVERITY_CONFIG = {
  critical: { bg: "bg-red-50", border: "border-red-300", badge: "bg-red-600", text: "text-red-800", label: "CRITICAL" },
  warning:  { bg: "bg-amber-50", border: "border-amber-300", badge: "bg-amber-500", text: "text-amber-800", label: "WARNING" },
  info:     { bg: "bg-blue-50", border: "border-blue-300", badge: "bg-blue-500", text: "text-blue-800", label: "INFO" },
  ok:       { bg: "bg-green-50", border: "border-green-300", badge: "bg-green-600", text: "text-green-800", label: "OK" },
};

const CATEGORIES = ["All", "Productivity", "Billing", "Collections", "Cash Flow", "Profitability", "Client Intake", "Marketing", "Staffing", "Compliance", "Risk"];

export default function LawFirmDashboard() {
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Fetch businessId from auth
  useEffect(() => {
    fetch("/api/user/business")
      .then(r => r.json())
      .then(d => { if (d.businessId) setBusinessId(d.businessId); })
      .catch(() => setError("Failed to load business context"));
  }, []);

  const loadLeaks = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/industry/law-firm?businessId=${businessId}`);
      const data = await res.json();
      setLeaks(data.leaks || []);
    } catch {
      setError("Failed to load analysis");
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => { if (businessId) loadLeaks(); }, [businessId, loadLeaks]);

  const seedDemo = async () => {
    if (!businessId) return;
    setSeeding(true);
    try {
      await fetch("/api/industry/law-firm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      await loadLeaks();
    } catch {
      setError("Seeding failed");
    }
    setSeeding(false);
  };

  const toggle = (id: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filtered = filter === "All" ? leaks : leaks.filter(l => l.category === filter);
  const totalImpact = leaks.reduce((s, l) => s + l.annualImpact, 0);
  const critCount = leaks.filter(l => l.severity === "critical").length;
  const warnCount = leaks.filter(l => l.severity === "warning").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">⚖️ Law Firm Intelligence</h1>
            <p className="text-sm text-gray-500 mt-1">Revenue leak detection powered by Clio, ABA & Thomson Reuters benchmarks</p>
          </div>
          <button
            onClick={seedDemo}
            disabled={seeding}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {seeding ? "Seeding..." : "Load Demo Data"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Annual Impact</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">${(totalImpact / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Critical Issues</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{critCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Warnings</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{warnCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Leaks Detected</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{leaks.length}</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                filter === cat
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {cat} {cat !== "All" && `(${leaks.filter(l => l.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Leak Cards */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
            Analyzing law firm data...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No leaks found</p>
            <p className="text-sm mt-1">Click "Load Demo Data" to see the engine in action</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(leak => {
              const cfg = SEVERITY_CONFIG[leak.severity];
              const isOpen = expanded.has(leak.id);
              return (
                <div key={leak.id} className={`${cfg.bg} border ${cfg.border} rounded-xl overflow-hidden`}>
                  <button
                    onClick={() => toggle(leak.id)}
                    className="w-full text-left px-5 py-4 flex items-start gap-4"
                  >
                    <span className={`${cfg.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 shrink-0`}>
                      {cfg.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">{leak.category}</span>
                      </div>
                      <h3 className={`font-semibold ${cfg.text} mt-0.5`}>{leak.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{leak.currentValue}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {leak.annualImpact > 0 && (
                        <p className="text-sm font-bold text-gray-900">${(leak.annualImpact / 1000).toFixed(0)}K/yr</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{isOpen ? "▲" : "▼"}</p>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 border-t border-gray-200/50 pt-3 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Benchmark</p>
                        <p className="text-sm text-gray-700">{leak.benchmark}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Analysis</p>
                        <p className="text-sm text-gray-700">{leak.description}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Recommendation</p>
                        <p className="text-sm text-gray-700">{leak.recommendation}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400">Source: {leak.source}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
