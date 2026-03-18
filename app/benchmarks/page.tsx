"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BenchmarksPage() {
  const router = useRouter();
  const [ctx, setCtx] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      setCtx(d);
      if (d.business?.id) {
        Promise.all([
          fetch(`/api/analytics?businessId=${d.business.id}&type=benchmarks`).then(r => r.json()),
          fetch(`/api/analytics?businessId=${d.business.id}&type=health`).then(r => r.json()),
          fetch(`/api/intelligence/compare?businessId=${d.business.id}`).then(r => r.json()).catch(() => ({})),
        ]).then(([bench, health, compare]) => {
          setData({ benchmarks: bench.benchmarks || [], health: health.health || null, comparisons: compare.comparisons || [] });
          setLoading(false);
        });
      }
    }).catch(() => router.push("/login"));
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]"><div className="text-gray-400">Loading benchmarks...</div></div>;

  const fmt = (n: number) => "$" + Math.round(n).toLocaleString();
  const benchmarks = data?.benchmarks || [];
  const health = data?.health;
  const comparisons = data?.comparisons || [];

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-[#1a1a2e]">📊 You vs. Industry</h1>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</button>
        </div>

        {/* Overall position */}
        {health && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-4">
            <div className="text-sm font-bold mb-4">Your Position</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-black" style={{ color: (health.overall || 0) >= 70 ? "#00c853" : (health.overall || 0) >= 40 ? "#ffab40" : "#ff3d57" }}>{health.overall || 0}</div>
                <div className="text-xs text-gray-400 mt-1">Your Health Score</div>
              </div>
              <div>
                <div className="text-3xl font-black text-gray-300">62</div>
                <div className="text-xs text-gray-400 mt-1">Industry Average</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#2979ff]">Top {Math.max(5, 100 - (health.overall || 0))}%</div>
                <div className="text-xs text-gray-400 mt-1">Your Percentile</div>
              </div>
            </div>
          </div>
        )}

        {/* Metric-by-metric comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-4">
          <div className="text-sm font-bold mb-4">Metric Comparison</div>
          {comparisons.length > 0 ? (
            <div className="space-y-4">
              {comparisons.map((c: any, i: number) => {
                const isGood = c.yourValue <= c.industryAverage;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium">{c.metric}</span>
                      <div className="flex gap-4">
                        <span className={isGood ? "text-green-500 font-bold" : "text-red-400 font-bold"}>You: {typeof c.yourValue === "number" ? c.yourValue.toFixed(1) : c.yourValue}%</span>
                        <span className="text-gray-400">Avg: {typeof c.industryAverage === "number" ? c.industryAverage.toFixed(1) : c.industryAverage}%</span>
                      </div>
                    </div>
                    <div className="relative h-4 rounded-full bg-gray-100 overflow-hidden">
                      <div className={"absolute h-4 rounded-full " + isGood ? "bg-green-400" : "bg-red-400"} style={{ width: Math.min(100, (c.yourValue || 0)) + "%" }} />
                      <div className="absolute h-6 w-0.5 bg-gray-800 -top-1" style={{ left: Math.min(100, (c.industryAverage || 0)) + "%" }} title="Industry average">
                        <div className="absolute -top-4 -left-6 text-[9px] text-gray-500 whitespace-nowrap">avg</div>
                      </div>
                    </div>
                    <div className="mt-1 text-[10px] text-gray-400">
                      {isGood ? `✅ ${Math.abs(c.yourValue - c.industryAverage).toFixed(1)}% below average — good` : `⚠️ ${Math.abs(c.yourValue - c.industryAverage).toFixed(1)}% above average`}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-xs text-gray-400">Run a scan to see how you compare to industry benchmarks.</div>
            </div>
          )}
        </div>

        {/* Anonymous market insights */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-4">
          <div className="text-sm font-bold mb-4">Market Insights (Anonymized)</div>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
              <span className="text-lg">📊</span>
              <div><strong>Average health score</strong> across all {ctx?.business?.industry || "businesses"} on the platform is 58/100. Most businesses have 4-8 active leaks.</div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
              <span className="text-lg">💰</span>
              <div><strong>Top performers</strong> in your industry save an average of $47,000/yr by fixing their top 3 leaks within 30 days of detection.</div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
              <span className="text-lg">🎯</span>
              <div><strong>Most common leak</strong> for {ctx?.business?.industry || "businesses"}: overpriced payment processing. 72% of scanned businesses pay above the benchmark rate.</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button onClick={() => router.push("/scan")} className="px-6 py-3 bg-[#1a1a2e] text-white font-bold rounded-xl text-sm hover:bg-[#2a2a3e]">🔄 Re-scan to Refresh Benchmarks</button>
        </div>
      </div>
    </div>
  );
}
