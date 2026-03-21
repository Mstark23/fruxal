"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ALL_INDUSTRIES, POPULAR_INDUSTRIES, getDisplayName } from "@/lib/industries";

export default function DemoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [industry, setIndustry] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [step, setStep] = useState<"pick" | "scanning" | "results">("pick");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return POPULAR_INDUSTRIES;
    return ALL_INDUSTRIES.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.id.includes(search.toLowerCase())
    );
  }, [search]);

  const runDemo = async (ind: string) => {
    setIndustry(ind);
    setStep("scanning");
    setScanning(true);

    // Animated delay for UX
    await new Promise(r => setTimeout(r, 2500));

    try {
      setIsLoading(true);
    const res = await fetch("/api/demo/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: ind }),
      });
      const data = await res.json();
      setResults(data);
      // Store for use after signup
      sessionStorage.setItem("demoResults", JSON.stringify({ ...data, industry: ind }));
    setIsLoading(false);
    } catch {
      setResults({ leaks: [], totalAmount: 0, healthScore: 50, leakCount: 0, urgentCount: 0, lockedCount: 0, isDemo: true });
    }
    setScanning(false);
    setStep("results");
  };

  const sevColor = (s: string) => s === "CRITICAL" || s === "urgent" ? "#ff3d57" : s === "HIGH" || s === "important" ? "#ff8f00" : "#2979ff";

  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5">
        <button onClick={() => router.push("/")} className="text-lg font-black">💧 LEAK &amp; GROW</button>
        <button onClick={() => router.push("/login")} className="text-sm text-gray-400 hover:text-white">Log In</button>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Step 1: Pick industry */}
        {step === "pick" && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-black mb-3">Try it free. No signup.</h1>
              <p className="text-gray-400">Pick your industry and see real leaks in 30 seconds.</p>
            </div>

            <input
              type="text" placeholder="Search 205 industries..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm text-center focus:border-[#00c853]/50 focus:outline-none mb-4"
            />

            <div className="grid grid-cols-2 gap-2">
              {filtered.slice(0, 18).map(ind => (
                <button key={ind.id} onClick={() => runDemo(ind.id)}
                  className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#00c853]/30 transition-all text-left">
                  <span className="text-2xl">{ind.icon}</span>
                  <span className="text-sm font-medium">{ind.name}</span>
                </button>
              ))}
            </div>

            {filtered.length > 18 && (
              <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02]">
                {filtered.slice(18).map(ind => (
                  <button key={ind.id} onClick={() => runDemo(ind.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0">
                    <span className="text-lg">{ind.icon}</span>
                    <span className="text-sm text-gray-300">{ind.name}</span>
                  </button>
                ))}
              </div>
            )}

            {search && filtered.length === 0 && (
              <p className="text-gray-500 text-sm mt-4 text-center">No match for "{search}"</p>
            )}
          </>
        )}

        {/* Step 2: Scanning animation */}
        {step === "scanning" && (
          <div className="text-center py-20">
            <div className="text-5xl mb-6 animate-bounce">🔍</div>
            <div className="text-xl font-black mb-3">Scanning your {getDisplayName(industry)}...</div>
            <div className="text-gray-400 text-sm mb-8">Checking 900+ data points against industry benchmarks</div>
            <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#00c853] rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === "results" && results && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">💸</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Your {getDisplayName(industry)} is leaking</div>
              <div className="text-5xl sm:text-6xl font-black text-[#ff3d57]">${(results.totalAmount ?? 0).toLocaleString()}<span className="text-lg text-gray-400">/yr</span></div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-black">{results.leakCount}</div>
                  <div className="text-xs text-gray-500">leaks found</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black" style={{ color: results.healthScore >= 70 ? "#00c853" : results.healthScore >= 40 ? "#ff8f00" : "#ff3d57" }}>{results.healthScore}</div>
                  <div className="text-xs text-gray-500">health score</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-[#ff3d57]">{results.urgentCount}</div>
                  <div className="text-xs text-gray-500">urgent</div>
                </div>
              </div>
            </div>

            {/* Visible leaks */}
            <div className="space-y-2 mb-4">
              {(results.leaks || []).map((leak: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-bold pr-2">{leak.title}</div>
                    <div className="text-sm font-black whitespace-nowrap" style={{ color: sevColor(leak.severity) }}>${(leak.annualImpact ?? 0).toLocaleString()}/yr</div>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">You: {leak.yours} → Benchmark: {leak.benchmark}</div>
                  <div className="text-xs text-[#00c853] bg-[#00c853]/10 rounded-lg p-2">{leak.fixAction}</div>
                </div>
              ))}
            </div>

            {/* Locked leaks */}
            {results.lockedCount > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center mb-6 opacity-60">
                <div className="text-lg mb-1">🔒</div>
                <div className="text-sm font-medium">+{results.lockedCount} more leaks found</div>
                <div className="text-xs text-gray-500">Sign up free to see all leaks and fix recommendations</div>
              </div>
            )}

            {/* CTA */}
            <button onClick={() => router.push(`/register?demo=${industry}`)}
              className="w-full py-4 bg-[#00c853] text-black font-black text-lg rounded-2xl hover:bg-[#00e676] transition-all mb-3">
              Sign Up Free — See All {results.leakCount} Leaks →
            </button>
            <button onClick={() => { setStep("pick"); setSearch(""); }} className="w-full py-3 text-gray-500 text-sm hover:text-white">
              ← Try a different industry
            </button>

            {/* Share */}
            <div className="mt-6 text-center">
              <button onClick={() => {
                const url = `${window.location.origin}/demo?i=${industry}`;
                navigator.clipboard.writeText(url);
                alert("Link copied!");
              }} className="text-xs text-gray-500 hover:text-gray-300">
                📎 Share this result
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
