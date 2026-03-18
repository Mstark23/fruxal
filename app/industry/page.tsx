"use client";

import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getIndustryById, getDisplayName, getIcon } from "@/lib/industries";

function getDisplay(slug: string) {
  const ind = getIndustryById(slug);
  if (ind) return { name: ind.name, icon: ind.icon, desc: ind.cat + " · " + ind.tier.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) };
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  return { name, icon: "🏢", desc: name };
}

// All 205 industries use the dynamic [slug] route

interface LeakPattern {
  id: string; title: string; leak_category: string;
  annual_low: number; annual_high: number;
  probability_pct: number; description: string;
}

export default function MyIndustryPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState<string | null>(null);
  const [bizName, setBizName] = useState("");
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState<LeakPattern[]>([]);
  const [stats, setStats] = useState({ patterns: 0, categories: 0, questions: 0 });

  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.business?.industry) {
          setIndustry(d.business.industry);
          setBizName(d.business.name || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!industry) return;
    fetch(`/api/industry-detail?industry=${industry}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.patterns) setPatterns(d.patterns);
        if (d?.stats) setStats(d.stats);
      })
      .catch(() => {});
  }, [industry]);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-400 animate-pulse">Loading your industry...</div>
        </div>
      </AppShell>
    );
  }

  if (!industry) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No industry selected yet</h1>
            <p className="text-gray-500 mb-6">Run a scan first and we&apos;ll set up your industry automatically.</p>
            <button onClick={() => router.push("/scan")} className="px-6 py-3 bg-[#00c853] text-white font-bold rounded-xl hover:bg-[#00b848] transition">
              Run Your First Scan →
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const display = getDisplay(industry);
  const categories = [...new Set(patterns.map(p => p.leak_category))].sort();
  const hasDetailPage = true; // all 156 industries use dynamic [slug] route

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl">{display.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{display.name}</h1>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">✅ Active</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{display.desc}</p>
                {bizName && <p className="text-xs text-gray-400 mt-0.5">{bizName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{stats.patterns || patterns.length}</div>
                <div className="text-xs text-blue-600">Things We Check</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-700">{stats.categories || categories.length}</div>
                <div className="text-xs text-purple-600">Categories</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-orange-700">{stats.questions || 0}</div>
                <div className="text-xs text-orange-600">Quiz Questions</div>
              </div>
            </div>
          </div>

          {hasDetailPage && (
            <button onClick={() => router.push(`/industry/${industry}`)}
              className="w-full bg-white rounded-xl shadow-sm border p-4 mb-6 flex items-center justify-between hover:bg-gray-50 transition group">
              <div>
                <div className="text-sm font-bold text-gray-900">View detailed industry dashboard</div>
                <div className="text-xs text-gray-500">Deep-dive analytics and recommendations for {display.name}</div>
              </div>
              <span className="text-gray-400 group-hover:text-[#00c853] transition text-xl">→</span>
            </button>
          )}

          {categories.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">What We Check For Your Business</h2>
              <p className="text-sm text-gray-500 mb-4">Every area where {display.name.toLowerCase()} businesses commonly lose money</p>
              <div className="space-y-3">
                {categories.map(cat => {
                  const catPatterns = patterns.filter(p => p.leak_category === cat);
                  return (
                    <div key={cat} className="border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-800">{cat}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{catPatterns.length} checks</span>
                      </div>
                      <div className="space-y-1">
                        {catPatterns.slice(0, 5).map(p => (
                          <div key={p.id} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0" />
                            <span>{p.title}</span>
                          </div>
                        ))}
                        {catPatterns.length > 5 && (
                          <div className="text-xs text-gray-400 pl-3">+{catPatterns.length - 5} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Ready to find where the money goes?</h3>
            <p className="text-sm text-gray-500 mb-4">We&apos;ll check your {display.name.toLowerCase()} business against {stats.patterns || patterns.length} common problems</p>
            <button onClick={() => router.push("/scan")}
              className="px-8 py-3 bg-[#00c853] text-white font-bold rounded-xl hover:bg-[#00b848] transition shadow-lg shadow-green-200">
              Run a Scan →
            </button>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
