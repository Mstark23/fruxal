"use client";

import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FixItem {
  id: string;
  title: string;
  category: string;
  severity: string;
  annualImpact: number;
  monthlyImpact: number;
  status: string;
  confidence: number;
  fix: {
    action: string;
    days: number;
    effort: number;
    effort_label: string;
    tier: string;
    tier_label: string;
  };
  priority_score: number;
  roi_per_day: number;
  first_month_savings: number;
}

interface PriorityData {
  tiers: {
    this_week: FixItem[];
    this_month: FixItem[];
    this_quarter: FixItem[];
    long_term: FixItem[];
  };
  summary: {
    totalSavings: number;
    quickWinSavings: number;
    monthOneSavings: number;
    actionCount: number;
    quickWinCount: number;
  };
  timeline: Array<{ month: number; savings: number }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` :
  n >= 1000 ? `$${Math.round(n / 1000)}K` :
  `$${Math.round(n)}`;

const TIER_CONFIG = {
  this_week: {
    label: "Do This Week",
    sublabel: "Takes 1-7 days · Instant savings",
    color: "bg-green-600",
    lightBg: "bg-green-50 border-green-200",
    icon: "⚡",
    textColor: "text-green-700",
    badge: "bg-green-100 text-green-700",
  },
  this_month: {
    label: "Do This Month",
    sublabel: "Takes 1-4 weeks · Moderate effort",
    color: "bg-blue-600",
    lightBg: "bg-blue-50 border-blue-200",
    icon: "📅",
    textColor: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
  },
  this_quarter: {
    label: "Do This Quarter",
    sublabel: "Takes 1-3 months · Strategic moves",
    color: "bg-purple-600",
    lightBg: "bg-purple-50 border-purple-200",
    icon: "🎯",
    textColor: "text-purple-700",
    badge: "bg-purple-100 text-purple-700",
  },
  long_term: {
    label: "Plan for Later",
    sublabel: "Takes 3-6 months · Big structural changes",
    color: "bg-gray-500",
    lightBg: "bg-gray-50 border-gray-200",
    icon: "🗓️",
    textColor: "text-gray-700",
    badge: "bg-gray-100 text-gray-600",
  },
};

const EFFORT_DOTS = (effort: number) => {
  const filled = Math.ceil(effort / 2); // 1-5 dots from 1-10 scale
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i < filled ? "bg-current" : "bg-current/20"}`} />
  ));
};

export default function FixFirstPage() {
  const router = useRouter();
  const [data, setData] = useState<PriorityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/fix-priority")
      .then(r => r.ok ? r.json() : r.json().then(e => { throw new Error(e.error); }))
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Toggle completed
  const toggleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl animate-bounce mb-4">🧠</div>
            <div className="text-gray-500 font-medium">Analyzing your business...</div>
            <div className="text-sm text-gray-400 mt-1">Building your personalized action plan</div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ─── No data ────────────────────────────────────────────────────────────────
  if (error || !data || data.summary.actionCount === 0) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No scan results yet</h1>
            <p className="text-gray-500 mb-6">Run a scan first so we can figure out what to fix and in what order.</p>
            <button onClick={() => router.push("/scan")} className="px-6 py-3 bg-[#00c853] text-white font-bold rounded-xl hover:bg-[#00b848] transition">
              Scan My Business →
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const { tiers, summary, timeline } = data;
  const allItems = [...tiers.this_week, ...tiers.this_month, ...tiers.this_quarter, ...tiers.long_term];
  const completedSavings = allItems.filter(i => completedIds.has(i.id)).reduce((s, i) => s + i.annualImpact, 0);
  const progress = summary.actionCount > 0 ? Math.round((completedIds.size / summary.actionCount) * 100) : 0;

  // Savings at month 12
  const yearEndSavings = timeline.length > 0 ? timeline[timeline.length - 1].savings : 0;

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">

        {/* ── Hero Header ──────────────────────────────────────────── */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🧠</span>
              <h1 className="text-2xl font-bold text-gray-900">Fix This First</h1>
            </div>
            <p className="text-sm text-gray-500 ml-12">Your personalized action plan, ranked by what saves you the most money the fastest</p>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="text-[11px] text-green-600 font-medium uppercase tracking-wide">Quick Wins</div>
                <div className="text-xl font-bold text-green-700">{tiers.this_week.length}</div>
                <div className="text-xs text-green-600">saves {fmt(summary.quickWinSavings)}/yr</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="text-[11px] text-blue-600 font-medium uppercase tracking-wide">Month 1 Savings</div>
                <div className="text-xl font-bold text-blue-700">{fmt(summary.monthOneSavings)}</div>
                <div className="text-xs text-blue-600">if you start today</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <div className="text-[11px] text-purple-600 font-medium uppercase tracking-wide">Year Total</div>
                <div className="text-xl font-bold text-purple-700">{fmt(summary.totalSavings)}</div>
                <div className="text-xs text-purple-600">{summary.actionCount} things to fix</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <div className="text-[11px] text-orange-600 font-medium uppercase tracking-wide">Your Progress</div>
                <div className="text-xl font-bold text-orange-700">{progress}%</div>
                <div className="text-xs text-orange-600">{completedIds.size} of {summary.actionCount} done</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: progress + "%" }} />
            </div>
            {completedIds.size > 0 && (
              <div className="mt-1 text-xs text-gray-500 text-right">
                You&apos;ve saved {fmt(completedSavings)}/yr so far — keep going!
              </div>
            )}
          </div>
        </div>

        {/* ── Savings Timeline ─────────────────────────────────────── */}
        {timeline.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 pt-6">
            <div className="bg-white rounded-2xl border p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Your savings if you follow this plan</h2>
              <div className="flex items-end gap-1 h-24">
                {timeline.map((t, i) => {
                  const maxSav = yearEndSavings || 1;
                  const pct = Math.max(4, (t.savings / maxSav) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div key={i} className="text-[9px] text-gray-500 font-medium">
                        {t.savings > 0 ? fmt(t.savings) : ""}
                      </div>
                      <div key={i} className="w-full rounded-t-md bg-gradient-to-t from-green-500 to-emerald-400 transition-all duration-300"
                        style={{ height: pct + "%" }} />
                      <div key={i} className="text-[9px] text-gray-400">M{t.month}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-500">By month 12, you could save </span>
                <span className="text-sm font-bold text-green-700">{fmt(yearEndSavings)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Action Tiers ─────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          {(["this_week", "this_month", "this_quarter", "long_term"] as const).map(tierKey => {
            const items = tiers[tierKey];
            if (items.length === 0) return null;
            const config = TIER_CONFIG[tierKey];
            const tierSavings = items.reduce((s, i) => s + i.annualImpact, 0);
            const tierCompleted = items.filter(i => completedIds.has(i.id)).length;

            return (
              <div key={tierKey}>
                {/* Tier header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{config.label}</h2>
                      <p className="text-xs text-gray-500">{config.sublabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700">{fmt(tierSavings)}/yr</div>
                    <div className="text-xs text-gray-500">{items.length} actions · {tierCompleted} done</div>
                  </div>
                </div>

                {/* Tier items */}
                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const isDone = completedIds.has(item.id);
                    const isExpanded = expandedId === item.id;

                    if (isDone && !showCompleted) return null;

                    return (
                      <div key={item.id}
                        className={`bg-white border rounded-xl transition-all ${isDone ? "opacity-50 border-green-200 bg-green-50/30" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}>

                        {/* Main row */}
                        <div key={idx} className="flex items-center gap-3 p-4 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}>

                          {/* Checkbox */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleComplete(item.id); }}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isDone ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-green-400"
                            }`}>
                            {isDone && <span className="text-xs font-bold">✓</span>}
                          </button>

                          {/* Rank number */}
                          <div key={idx} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${config.badge}`}>
                            {idx + 1}
                          </div>

                          {/* Content */}
                          <div key={idx} className="flex-1 min-w-0">
                            <div key={idx} className={`text-sm font-semibold ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
                              {item.fix.action}
                            </div>
                            <div key={idx} className="text-xs text-gray-500 mt-0.5 truncate">{item.title}</div>
                          </div>

                          {/* Right side stats */}
                          <div key={idx} className="text-right shrink-0 ml-2">
                            <div key={idx} className="text-sm font-bold text-red-600">{fmt(item.annualImpact)}/yr</div>
                            <div key={idx} className="flex items-center gap-1 justify-end mt-0.5">
                              <span className="text-[10px] text-gray-400">effort</span>
                              <span className={`flex gap-0.5 ${config.textColor}`}>
                                {EFFORT_DOTS(item.fix.effort)}
                              </span>
                            </div>
                          </div>

                          {/* Expand arrow */}
                          <div key={idx} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>▾</div>
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && !isDone && (
                          <div key={idx} className="px-4 pb-4 pt-0 border-t border-gray-100">
                            <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                              <div key={idx} className="bg-gray-50 rounded-lg p-2.5">
                                <div key={idx} className="text-[10px] text-gray-500 uppercase">You lose</div>
                                <div key={idx} className="text-sm font-bold text-red-600">{fmt(item.monthlyImpact)}/mo</div>
                              </div>
                              <div key={idx} className="bg-gray-50 rounded-lg p-2.5">
                                <div key={idx} className="text-[10px] text-gray-500 uppercase">Per day</div>
                                <div key={idx} className="text-sm font-bold text-red-600">{fmt(item.roi_per_day)}/day</div>
                              </div>
                              <div key={idx} className="bg-gray-50 rounded-lg p-2.5">
                                <div key={idx} className="text-[10px] text-gray-500 uppercase">Time to fix</div>
                                <div key={idx} className="text-sm font-bold text-gray-900">
                                  {item.fix.days <= 1 ? "Today" : item.fix.days <= 7 ? `${item.fix.days} days` : item.fix.days <= 30 ? `${Math.round(item.fix.days / 7)} weeks` : `${Math.round(item.fix.days / 30)} months`}
                                </div>
                              </div>
                              <div key={idx} className="bg-gray-50 rounded-lg p-2.5">
                                <div key={idx} className="text-[10px] text-gray-500 uppercase">Difficulty</div>
                                <div key={idx} className="text-sm font-bold text-gray-900">{item.fix.effort_label}</div>
                              </div>
                            </div>

                            {item.first_month_savings > 0 && (
                              <div key={idx} className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                <div key={idx} className="text-sm text-green-800">
                                  💰 <strong>If you do this now:</strong> you&apos;ll save roughly <strong>{fmt(item.first_month_savings)}</strong> in your first month alone
                                </div>
                              </div>
                            )}

                            <div key={idx} className="mt-3 flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                                {item.category}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                Priority score: {item.priority_score} · Confidence: {Math.round(item.confidence * 100)}%
                              </span>
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); toggleComplete(item.id); }}
                              className="mt-3 w-full py-2.5 bg-[#00c853] text-white font-bold rounded-lg text-sm hover:bg-[#00b848] transition">
                              ✅ Mark as Done
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Show hidden completed items count */}
                  {!showCompleted && tierCompleted > 0 && (
                    <button onClick={() => setShowCompleted(true)}
                      className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition">
                      + {tierCompleted} completed {tierCompleted === 1 ? "item" : "items"} hidden
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {showCompleted && (
            <button onClick={() => setShowCompleted(false)}
              className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition">
              Hide completed items
            </button>
          )}

        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-center text-white">
            <h3 className="text-lg font-bold mb-1">Every day you wait costs you {fmt(Math.round(summary.totalSavings / 365))}</h3>
            <p className="text-sm text-gray-300 mb-4">Start with the top item — it takes {tiers.this_week.length > 0 ? `${tiers.this_week[0]?.fix.days || 1} day${(tiers.this_week[0]?.fix.days || 1) > 1 ? "s" : ""}` : "less than a week"} and saves you {tiers.this_week.length > 0 ? fmt(tiers.this_week[0]?.annualImpact ?? 0) : fmt(summary.quickWinSavings)}/yr</p>
            <button onClick={() => router.push("/scan")} className="px-8 py-3 bg-[#00c853] text-white font-bold rounded-xl hover:bg-[#00b848] transition">
              Re-scan for Updated Results →
            </button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
