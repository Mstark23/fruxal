"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_INDUSTRIES, POPULAR_INDUSTRIES, getLeakRate, getDisplayName } from "@/lib/industries";

export default function ROIPage() {
  const router = useRouter();
  const [revenue, setRevenue] = useState(500000);
  const [industry, setIndustry] = useState("restaurant");
  const [plan, setPlan] = useState<"pro" | "team">("pro");

  const leakRate = getLeakRate(industry);
  const estimatedLeaking = Math.round(revenue * leakRate);
  const fixRate = 0.65; // Average fix rate
  const recoverable = Math.round(estimatedLeaking * fixRate);
  const planCost = plan === "pro" ? 49 * 12 : 99 * 12;
  const netSavings = recoverable - planCost;
  const roi = planCost > 0 ? Math.round((netSavings / planCost) * 100) : 0;

  // Show top 18 popular + currently selected (if not in popular)
  const quickPicks = POPULAR_INDUSTRIES.slice(0, 18);
  const showCurrent = !quickPicks.find(i => i.id === industry);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5">
        <button onClick={() => router.push("/")} className="text-lg font-black">💧 LEAK &amp; GROW</button>
        <button onClick={() => router.push("/demo")} className="text-sm font-bold bg-[#00c853] text-black px-4 py-2 rounded-xl">Try Free →</button>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">ROI Calculator</h1>
          <p className="text-gray-400 text-sm">See how much Fruxal could save your business</p>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Annual Revenue</label>
            <input type="range" min={50000} max={5000000} step={25000} value={revenue} onChange={e => setRevenue(+e.target.value)} className="w-full accent-[#00c853]" />
            <div className="text-2xl font-black text-center mt-1">${(revenue ?? 0).toLocaleString()}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Industry</label>
            {/* Quick pick buttons */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {quickPicks.map(ind => (
                <button key={ind.id} onClick={() => setIndustry(ind.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs ${industry === ind.id ? "bg-[#00c853] text-black font-bold" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                  {ind.icon} {ind.name.length > 14 ? ind.name.slice(0, 13) + "…" : ind.name}
                </button>
              ))}
            </div>
            {/* Full dropdown for all 205 */}
            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none"
            >
              <optgroup label="🧑‍💻 Solo Entrepreneur">
                {ALL_INDUSTRIES.filter(i => i.tier === "solo-entrepreneur").map(i =>
                  <option key={i.id} value={i.id}>{i.icon} {i.name}</option>
                )}
              </optgroup>
              <optgroup label="🏪 Mid-Size Business">
                {ALL_INDUSTRIES.filter(i => i.tier === "mid-size-business").map(i =>
                  <option key={i.id} value={i.id}>{i.icon} {i.name}</option>
                )}
              </optgroup>
              <optgroup label="🏢 Growth Business">
                {ALL_INDUSTRIES.filter(i => i.tier === "growth-business").map(i =>
                  <option key={i.id} value={i.id}>{i.icon} {i.name}</option>
                )}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Plan</label>
            <div className="flex gap-2">
              <button onClick={() => setPlan("pro")} className={`flex-1 py-3 rounded-xl text-sm font-bold ${plan === "pro" ? "bg-[#00c853] text-black" : "bg-white/5 text-gray-400"}`}>Pro — $49/mo</button>
              <button onClick={() => setPlan("team")} className={`flex-1 py-3 rounded-xl text-sm font-bold ${plan === "team" ? "bg-[#00c853] text-black" : "bg-white/5 text-gray-400"}`}>Team — $99/mo</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-500">Estimated Annual Leakage</div>
              <div className="text-2xl font-black text-[#ff3d57]">${(estimatedLeaking ?? 0).toLocaleString()}</div>
              <div className="text-[10px] text-gray-600">{(leakRate * 100).toFixed(0)}% of revenue ({getDisplayName(industry)} avg)</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Recoverable (65% fix rate)</div>
              <div className="text-2xl font-black text-[#00c853]">${(recoverable ?? 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Annual plan cost</span>
              <span className="text-sm font-bold text-[#ff3d57]">-${(planCost ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Net annual savings</span>
              <span className="text-lg font-black text-[#00c853]">${(netSavings ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Return on Investment</span>
              <span className="text-xl font-black" style={{ color: roi > 0 ? "#00c853" : "#ff3d57" }}>{roi}%</span>
            </div>
          </div>
        </div>

        {/* Payback period */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-center">
          <div className="text-xs text-gray-500">Payback Period</div>
          <div className="text-2xl font-black text-white">
            {recoverable > 0 ? `${Math.max(1, Math.ceil(planCost / (recoverable / 12)))} months` : "—"}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            The tool pays for itself in {Math.max(1, Math.ceil(planCost / (recoverable / 12)))} month{Math.ceil(planCost / (recoverable / 12)) > 1 ? "s" : ""} of recovered revenue
          </div>
        </div>

        <button onClick={() => router.push("/demo")} className="w-full py-4 bg-[#00c853] text-black font-black text-lg rounded-2xl hover:bg-[#00e676] transition-all">
          Try It Free — See Your Real Number →
        </button>
        <p className="text-xs text-gray-600 text-center mt-3">No credit card required. See 3 leaks free.</p>
      </div>
    </div>
  );
}
