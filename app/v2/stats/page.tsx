"use client";
// =============================================================================
// app/v2/stats/page.tsx — Customer Statistics Page
// Management by Statistics — each area of your business has a measurable stat.
// =============================================================================

import { useState, useEffect } from "react";
import StatGraph, { StatGraphGrid, StatGraphProps } from "@/components/v2/StatGraph";
import { CUSTOMER_STATS, getStatCondition, Condition } from "@/lib/stats/condition-engine";

const CONDITION_GUIDE: { condition: Condition; label: string; color: string; bg: string; description: string }[] = [
  { condition: "power",         label: "Power",         color: "#7c3aed", bg: "rgba(124,58,237,0.08)", description: "Stat at an all-time high. Maintain your winning actions." },
  { condition: "affluence",     label: "Affluence",     color: "#2D7A50", bg: "rgba(45,122,80,0.08)",  description: "Clearly trending in the right direction. Reinforce what is working." },
  { condition: "normal",        label: "Normal",        color: "#0369a1", bg: "rgba(3,105,161,0.08)",  description: "Stable and not changing much. Look for incremental improvements." },
  { condition: "emergency",     label: "Emergency",     color: "#C4841D", bg: "rgba(196,132,29,0.08)", description: "Trending the wrong way. Identify the cause and act this week." },
  { condition: "danger",        label: "Danger",        color: "#B34040", bg: "rgba(179,64,64,0.08)",  description: "Steep decline. Requires immediate attention and intervention." },
  { condition: "non_existence", label: "Non-Existence", color: "#8E8C85", bg: "rgba(142,140,133,0.08)", description: "No data or activity. Establish a baseline by taking first action." },
];

export default function StatsPage() {
  const [stats, setStats] = useState<Record<string, { points: { period: string; value: number }[]; current: number }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v2/stats/customer")
      .then(r => r.json())
      .then(j => {
        if (j.success) setStats(j.stats);
        else setError(j.error || "Failed to load stats");
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white border border-[#B34040]/20 rounded-xl p-4 text-[#B34040] text-sm">{error}</div>
    </div>
  );

  // Build StatGraphProps from the API data + condition engine
  const graphStats: StatGraphProps[] = CUSTOMER_STATS.map(def => {
    const data = stats?.[def.key];
    const points = data?.points || [];
    const condition = getStatCondition(points, def);
    return {
      label: def.label,
      points,
      unit: def.unit,
      higherIsBetter: def.higherIsBetter,
      condition,
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">Your Statistics</h1>
        <p className="text-[13px] text-[#8E8C85] mt-1">
          Management by Statistics — each area of your business has a measurable stat
        </p>
      </div>

      {/* Stat graphs grid */}
      <StatGraphGrid stats={graphStats} />

      {/* Condition Guide */}
      <div className="mt-8 bg-white border border-[#E5E3DD] rounded-xl p-5">
        <h2 className="text-[11px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Condition Guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {CONDITION_GUIDE.map(c => (
            <div key={c.condition} className="flex items-start gap-2.5 px-3 py-2 rounded-lg" style={{ background: c.bg }}>
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                style={{ color: c.color, backgroundColor: c.color + "18" }}
              >
                {c.label}
              </span>
              <p className="text-[11px] text-[#56554F] leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
