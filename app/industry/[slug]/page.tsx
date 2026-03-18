"use client";

import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getIndustryById, getDisplayName, getIcon } from "@/lib/industries";

function getDisplay(slug: string) {
  const ind = getIndustryById(slug);
  if (ind) return { name: ind.name, icon: ind.icon };
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  return { name, icon: "🏢" };
  return { name, icon: "🏢" };
}

// ─── Severity colors ─────────────────────────────────────────────────────────
const SEV = {
  colors: {
    critical: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  } as Record<string, string>,
  badges: {
    critical: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
  } as Record<string, string>,
};

interface LeakPattern {
  id: string;
  title: string;
  leak_category: string;
  annual_low: number;
  annual_high: number;
  probability_pct: number;
  description: string;
}

export default function IndustryDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const display = getDisplay(slug);

  const [patterns, setPatterns] = useState<LeakPattern[]>([]);
  const [stats, setStats] = useState({ patterns: 0, categories: 0, questions: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/industry-detail?industry=${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.patterns) setPatterns(d.patterns);
        if (d?.stats) setStats(d.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const categories = [...new Set(patterns.map(p => p.leak_category))].sort();
  const filtered = filter === "All" ? patterns : patterns.filter(p => p.leak_category === filter);

  // Group by severity based on probability
  const getSeverity = (p: LeakPattern) => {
    if (p.probability_pct >= 70) return "critical";
    if (p.probability_pct >= 40) return "warning";
    return "info";
  };

  const totalPotentialLoss = patterns.reduce((s, p) => s + ((p.annual_low + p.annual_high) / 2) * (p.probability_pct / 100), 0);
  const criticalCount = patterns.filter(p => p.probability_pct >= 70).length;
  const warningCount = patterns.filter(p => p.probability_pct >= 40 && p.probability_pct < 70).length;

  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n.toFixed(0)}`;

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-400 animate-pulse">Loading {display.name}...</div>
        </div>
      </AppShell>
    );
  }

  if (patterns.length === 0) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">{display.icon}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{display.name}</h1>
            <p className="text-gray-500 mb-6">No leak patterns found for this industry. Run a scan to get started.</p>
            <button onClick={() => router.push("/scan")} className="px-6 py-3 bg-[#00c853] text-white font-bold rounded-xl hover:bg-[#00b848] transition">
              Run a Scan →
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="bg-white border-b px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl">{display.icon}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{display.name}</h1>
                <p className="text-sm text-gray-500">{stats.patterns} checks · {stats.categories} categories · {stats.questions} quiz questions</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <div className="text-xs text-red-600 font-medium">Potential money lost</div>
                <div className="text-xl font-bold text-red-700">{fmt(totalPotentialLoss)}<span className="text-sm font-normal">/yr</span></div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <div className="text-xs text-red-600 font-medium">Big problems</div>
                <div className="text-xl font-bold text-red-700">{criticalCount}</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                <div className="text-xs text-yellow-700 font-medium">Worth looking at</div>
                <div className="text-xl font-bold text-yellow-700">{warningCount}</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <div className="text-xs text-blue-600 font-medium">Total checks</div>
                <div className="text-xl font-bold text-blue-700">{stats.patterns}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter pills ───────────────────────────────────────────── */}
        <div className="bg-white border-b px-6 py-3">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
            <button onClick={() => setFilter("All")}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${filter === "All" ? "bg-[#00c853] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              All ({patterns.length})
            </button>
            {categories.map(cat => {
              const count = patterns.filter(p => p.leak_category === cat).length;
              return (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${filter === cat ? "bg-[#00c853] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Leak cards ─────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto p-6 space-y-3">
          {filtered
            .sort((a, b) => b.probability_pct - a.probability_pct)
            .map(pattern => {
              const sev = getSeverity(pattern);
              const avgLoss = (pattern.annual_low + pattern.annual_high) / 2;
              const expanded = expandedId === pattern.id;

              return (
                <div key={pattern.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${SEV.colors[sev] || "bg-gray-50 border-gray-200"}`}
                  onClick={() => setExpandedId(expanded ? null : pattern.id)}>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${SEV.badges[sev]}`}>
                        {sev === "critical" ? "BIG" : sev === "warning" ? "MEDIUM" : "SMALL"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/60 text-gray-600 shrink-0">{pattern.leak_category}</span>
                      <h3 className="font-semibold text-sm truncate">{pattern.title}</h3>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="font-bold text-red-700">{fmt(avgLoss)}/yr</div>
                      <div className="text-[10px] text-gray-500">{pattern.probability_pct}% of businesses</div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-3 pt-3 border-t border-current/10 space-y-2">
                      <p className="text-sm opacity-80">{pattern.description}</p>
                      <div className="flex gap-4 text-xs">
                        <span>💰 Loss range: <strong>{fmt(pattern.annual_low)} – {fmt(pattern.annual_high)}/yr</strong></span>
                        <span>📊 Affects <strong>{pattern.probability_pct}%</strong> of {display.name.toLowerCase()} businesses</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Want to know which ones apply to YOU?</h3>
            <p className="text-sm text-gray-500 mb-4">Answer {stats.questions} quick questions and we&apos;ll pinpoint your exact problems</p>
            <button onClick={() => router.push("/scan")}
              className="px-8 py-3 bg-[#00c853] text-white font-bold rounded-xl hover:bg-[#00b848] transition shadow-lg shadow-green-200">
              Check My Business →
            </button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
