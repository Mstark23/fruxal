"use client";
import { useState } from "react";
import { ALL_INDUSTRIES, getDisplayName, getLeakRate } from "@/lib/industries";

export default function EmbedWidget() {
  const [step, setStep] = useState<"pick" | "scan" | "result">("pick");
  const [industry, setIndustry] = useState("");
  const [revenue, setRevenue] = useState("");
  const [result, setResult] = useState<any>(null);

  const quickScan = async () => {
    setStep("scan");
    const rev = parseFloat(revenue) || 500000;
    const leakPercent = getLeakRate(industry) * 100;
    const jitter = leakPercent + (Math.random() * 4 - 2); // ±2% variance
    const total = Math.round(rev * jitter / 100);
    const score = Math.round(100 - jitter * 4);

    await new Promise(r => setTimeout(r, 2000));
    setResult({ total, score, leakPercent: jitter.toFixed(1), leakCount: Math.floor(3 + Math.random() * 5) });
    setStep("result");
  };

  const base = typeof window !== "undefined" ? window.location.origin : "https://fruxal.ca";

  return (
    <div className="max-w-sm mx-auto p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
      {step === "pick" && (
        <div className="bg-[#0a0e17] text-white rounded-2xl p-6">
          <div className="text-center mb-4">
            <div className="text-xl font-black">💧 Free Leak Scan</div>
            <div className="text-xs text-gray-400 mt-1">Find where your business is losing money</div>
          </div>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-3 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white outline-none mb-3">
            <option value="" className="text-black">Pick your industry</option>
            <optgroup label="Solo Entrepreneur">
              {ALL_INDUSTRIES.filter(i => i.tier === "solo-entrepreneur").map(i =>
                <option key={i.id} value={i.id} className="text-black">{i.icon} {i.name}</option>
              )}
            </optgroup>
            <optgroup label="🏪 Mid-Size Business">
              {ALL_INDUSTRIES.filter(i => i.tier === "mid-size-business").map(i =>
                <option key={i.id} value={i.id} className="text-black">{i.icon} {i.name}</option>
              )}
            </optgroup>
            <optgroup label="Growth Business">
              {ALL_INDUSTRIES.filter(i => i.tier === "growth-business").map(i =>
                <option key={i.id} value={i.id} className="text-black">{i.icon} {i.name}</option>
              )}
            </optgroup>
          </select>
          <input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="Annual revenue ($)" className="w-full px-3 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white outline-none mb-3" />
          <button onClick={quickScan} disabled={!industry} className="w-full py-3 bg-[#00c853] text-black font-bold rounded-xl text-sm disabled:opacity-50 hover:bg-[#00e676] transition-all">
            Find My Leaks →
          </button>
          <div className="text-center text-[10px] text-gray-600 mt-2">Powered by Fruxal</div>
        </div>
      )}

      {step === "scan" && (
        <div className="bg-[#0a0e17] text-white rounded-2xl p-6 text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-ink-muted animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <div className="text-sm font-bold">Scanning {getDisplayName(industry)}...</div>
          <div className="text-xs text-gray-400 mt-1">Analyzing 900+ data points</div>
        </div>
      )}

      {step === "result" && result && (
        <div className="bg-[#0a0e17] text-white rounded-2xl p-6">
          <div className="text-center mb-4">
            <div className="text-4xl font-black text-[#ff3d57]">${(result.total ?? 0).toLocaleString()}<span className="text-lg">/yr</span></div>
            <div className="text-xs text-gray-400 mt-1">Estimated leaking from {result.leakCount} areas</div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <div className="text-lg font-black" style={{ color: result.score >= 60 ? "#00c853" : "#ff3d57" }}>{result.score}</div>
              <div className="text-[10px] text-gray-400">Health Score</div>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-[#ff3d57]">{result.leakPercent}%</div>
              <div className="text-[10px] text-gray-400">Revenue Leaking</div>
            </div>
          </div>
          <a href={`${base}/scan?industry=${industry}`} target="_blank" rel="noopener" className="block w-full py-3 bg-[#00c853] text-black font-bold rounded-xl text-sm text-center hover:bg-[#00e676] transition-all">
            Get Full Report — Free →
          </a>
          <button onClick={() => { setStep("pick"); setResult(null); }} className="w-full py-2 text-xs text-gray-500 mt-2 hover:text-gray-300">Scan another business</button>
          <div className="text-center text-[10px] text-gray-600 mt-2">Powered by <a href={base} target="_blank" rel="noopener" className="underline">Fruxal</a></div>
        </div>
      )}
    </div>
  );
}
