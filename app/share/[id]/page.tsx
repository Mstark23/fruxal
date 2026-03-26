"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SharePage() {
  const router = useRouter();
  const params = useParams();
  const shareId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/share?id=${shareId}`).then(r => {
      if (!r.ok) throw new Error(r.status === 410 ? "This link has expired." : "Not found.");
      return r.json();
    }).then(setData).catch(e => setError(e.message));
  }, [shareId]);

  const sevColor = (s: string) => s === "CRITICAL" || s === "urgent" ? "#ff3d57" : s === "HIGH" || s === "important" ? "#ff8f00" : "#2979ff";

  if (error) return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center">
      <div className="text-center">
        <svg className="w-10 h-10 mx-auto mb-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        <div className="text-xl font-bold mb-2">{error}</div>
        <button onClick={() => router.push("/")} className="mt-4 px-6 py-3 bg-[#00c853] text-black font-bold rounded-xl">Try Fruxal Free →</button>
      </div>
    </div>
  );

  if (!data) return <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5">
        <button onClick={() => router.push("/")} className="text-lg font-black">Fruxal</button>
        <button onClick={() => router.push("/demo")} className="text-sm font-bold bg-[#00c853] text-black px-4 py-2 rounded-xl">Try Free →</button>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{data.industry} Business</div>
          <h1 className="text-2xl font-black mb-2">{data.businessName}</h1>
          <div className="text-4xl font-black text-[#ff3d57]">${(data.totalLeaking ?? 0).toLocaleString()}<span className="text-lg text-gray-400">/yr leaking</span></div>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <span className="text-gray-400">{data.leakCount} leaks</span>
            <span className="text-gray-600">·</span>
            <span style={{ color: data.healthScore >= 70 ? "#00c853" : data.healthScore >= 40 ? "#ff8f00" : "#ff3d57" }}>{data.healthScore}/100 health</span>
            <span className="text-gray-600">·</span>
            <span className="text-[#00c853]">${(data.totalSaved ?? 0).toLocaleString()} saved</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {(data.topLeaks || []).map((leak: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-bold pr-2">{leak.title}</div>
                <div className="text-sm font-black whitespace-nowrap" style={{ color: sevColor(leak.severity) }}>${(leak.annualImpact ?? 0).toLocaleString()}/yr</div>
              </div>
              <div className="text-xs text-gray-500">You: {leak.yours} → Benchmark: {leak.benchmark}</div>
            </div>
          ))}
        </div>

        <button onClick={() => router.push("/demo")} className="w-full py-4 bg-[#00c853] text-black font-black text-lg rounded-2xl hover:bg-[#00e676] transition-all">
          Scan Your Business Free →
        </button>
        <p className="text-xs text-gray-600 text-center mt-3">No credit card. No signup needed to try.</p>
      </div>
    </div>
  );
}
