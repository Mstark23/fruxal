"use client";

import AppShell from "@/components/AppShell";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ALL_INDUSTRIES, getIcon, getDisplayName, POPULAR_INDUSTRIES } from "@/lib/industries";

const DATA_SOURCES = [
  { id: "quickbooks", name: "QuickBooks", icon: "📗", desc: "Best accuracy — connects in 30 seconds", confidence: "95%" },
  { id: "xero", name: "Xero", icon: "📘", desc: "Full accounting data sync", confidence: "95%" },
  { id: "bank", name: "Bank Statements", icon: "🏦", desc: "Upload CSV or connect via Plaid", confidence: "85%" },
  { id: "csv", name: "Upload CSV", icon: "📄", desc: "Any spreadsheet with your financial data", confidence: "75%" },
  { id: "estimate", name: "Quick Questions", icon: "⚡", desc: "No setup — answer a few questions", confidence: "60%" },
];

const SCAN_STEPS = [
  "Connecting to your data...",
  "Checking vendor rates against market...",
  "Analyzing cash flow patterns...",
  "Comparing to industry benchmarks...",
  "Matching with fix partners...",
  "Generating your report...",
];

export default function ScanPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pick" | "name" | "connect" | "questions" | "scanning" | "results">("pick");
  const [industry, setIndustry] = useState<string | null>(null);
  const [bizName, setBizName] = useState("");
  const [dataSource, setDataSource] = useState<string>("estimate");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingBiz, setExistingBiz] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [questions, setQuestions] = useState<Array<{ key: string; question: string; type: string; placeholder: string }>>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Check if user is logged in and has a business already
  useEffect(() => {
    fetch("/api/me")
      .then(r => { if (!r.ok) throw new Error("Not logged in"); return r.json(); })
      .then(data => {
        setUserId(data.user.id);
        if (data.business) {
          setExistingBiz(data.business);
          setIndustry(data.business.industry.toLowerCase());
          setBizName(data.business.name);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Filtered industries
  const filtered = useMemo(() => {
    if (!search) return showAll ? ALL_INDUSTRIES : POPULAR_INDUSTRIES;
    return ALL_INDUSTRIES.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.id.includes(search.toLowerCase()) ||
      i.cat.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, showAll]);

  // Load questions when industry is selected
  const loadQuestions = async (ind: string) => {
    try {
      const res = await fetch(`/api/scan/questions?industry=${ind}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (e) { console.error(e); }
  };

  // ─── Run the actual scan ───────────────────────────────────────────────────
  const runScan = async () => {
    setStep("scanning");
    setError(null);
    setScanProgress(0);

    // Animate progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + Math.random() * 8 + 2;
        const step = Math.min(Math.floor(next / 17), SCAN_STEPS.length - 1);
        setScanMessage(SCAN_STEPS[step]);
        return Math.min(next, 92);
      });
    }, 400);

    try {
      let businessId = existingBiz?.id;

      // Create business if new
      if (!businessId) {
        const ind = ALL_INDUSTRIES.find(i => i.id === industry);
        const bizRes = await fetch("/api/business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bizName || `My ${ind?.name || "Business"}`,
            industry,
            tier: ind?.tier || "mid-size-business",
          }),
        });
        if (!bizRes.ok) throw new Error("Failed to create business");
        const bizData = await bizRes.json();
        businessId = bizData.businessId;
      }

      // Run scan
      const scanRes = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          industry,
          dataSource,
          answers: dataSource === "estimate" ? answers : undefined,
        }),
      });

      clearInterval(interval);
      setScanProgress(100);
      setScanMessage("Done!");

      if (!scanRes.ok) {
        const errBody = await scanRes.json().catch(() => ({}));
        throw new Error(errBody.error || `Scan returned ${scanRes.status}`);
      }
      const result = await scanRes.json();
      setScanResult({ ...result, businessId });

      // Store results for dashboard fallback (in case DB save failed)
      try {
        sessionStorage.setItem("lastScanResult", JSON.stringify({ ...result, businessId, timestamp: Date.now() }));
      } catch (e) {}

      setTimeout(() => setStep("results"), 800);
    } catch (e: any) {
      clearInterval(interval);
      const msg = e.message || "Unknown error";
      setError(`Scan failed: ${msg}. Check browser console for details.`);
      console.error("SCAN ERROR:", e);
      setStep("pick");
    }
  };

  // ─── Colors & helpers ──────────────────────────────────────────────────────
  const fmt = (n: number) => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + n.toLocaleString();
  const G = "#00c853";

  return (
    <AppShell>
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">

        {/* STEP 1: Pick Industry */}
        {step === "pick" && (
          <div className="text-center">
            <div className="text-5xl mb-4">💧</div>
            <h1 className="text-3xl font-black text-white mb-2">
              {existingBiz ? `Re-scan ${existingBiz.name}` : "What kind of business?"}
            </h1>
            <p className="text-gray-400 mb-6">
              {existingBiz ? "We'll check for new leaks with the latest data." : "We'll check 900+ leak patterns specific to your industry."}
            </p>
            {error && <div className="bg-red-900/30 text-red-400 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            {existingBiz ? (
              <div className="space-y-3">
                <button onClick={() => { setStep("connect"); }} className="w-full p-4 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105" style={{ background: G }}>
                  🔄 Re-scan {existingBiz.name} →
                </button>
                <button onClick={() => { setExistingBiz(null); setIndustry(null); setBizName(""); }} className="text-gray-400 text-sm hover:text-white">
                  Or scan a different business
                </button>
              </div>
            ) : (
              <>
                {/* Search */}
                <input
                  type="text" placeholder="Search 205 industries..."
                  value={search} onChange={e => { setSearch(e.target.value); setShowAll(true); }}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white text-sm text-center focus:border-green-400 focus:outline-none mb-4"
                />

                <div className="grid grid-cols-3 gap-2">
                  {filtered.slice(0, 18).map(ind => (
                    <button key={ind.id} onClick={() => { setIndustry(ind.id); setStep("name"); }}
                      className={`p-3 rounded-2xl border-2 transition-all hover:scale-105 text-center ${industry === ind.id ? "border-green-400 bg-green-900/20" : "border-gray-700 bg-gray-800/50 hover:border-gray-500"}`}>
                      <div className="text-xl mb-1">{ind.icon}</div>
                      <div className="text-[10px] text-gray-300 font-medium leading-tight">{ind.name}</div>
                    </button>
                  ))}
                </div>

                {!search && !showAll && (
                  <button onClick={() => setShowAll(true)} className="mt-4 text-sm text-[#00c853] hover:underline">
                    Show all 205 industries →
                  </button>
                )}
                {showAll && filtered.length > 18 && (
                  <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-gray-700 bg-gray-800/50">
                    {filtered.slice(18).map(ind => (
                      <button key={ind.id} onClick={() => { setIndustry(ind.id); setStep("name"); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/50 transition-all text-left border-b border-gray-700/30 last:border-0">
                        <span className="text-lg">{ind.icon}</span>
                        <span className="text-sm text-gray-300">{ind.name}</span>
                        <span className="text-[10px] text-gray-600 ml-auto">{ind.tier === "solo-entrepreneur" ? "🧑‍💻" : ind.tier === "growth-business" ? "🏢" : ""}</span>
                      </button>
                    ))}
                  </div>
                )}
                {search && filtered.length === 0 && (
                  <p className="text-gray-500 text-sm mt-4">No industries match "{search}". Try a different term.</p>
                )}
              </>
            )}
          </div>
        )}

        {/* STEP 2: Business Name */}
        {step === "name" && (
          <div className="text-center">
            <div className="text-5xl mb-4">{getIcon(industry || "")}</div>
            <h1 className="text-2xl font-black text-white mb-2">What's your business called?</h1>
            <p className="text-gray-400 mb-6">This is just for your dashboard. You can change it later.</p>
            <input
              type="text" value={bizName} onChange={e => setBizName(e.target.value)}
              placeholder={`My ${getDisplayName(industry || "")} Business`}
              className="w-full p-4 rounded-xl bg-gray-800 border border-gray-600 text-white text-lg text-center focus:border-green-400 focus:outline-none mb-4"
              autoFocus
            />
            <button onClick={() => setStep("connect")} className="w-full p-4 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105" style={{ background: G }}>
              Continue →
            </button>
            <button onClick={() => setStep("pick")} className="mt-3 text-gray-400 text-sm hover:text-white">← Back</button>
          </div>
        )}

        {/* STEP 3: Connect Data */}
        {step === "connect" && (
          <div className="text-center">
            <h1 className="text-2xl font-black text-white mb-2">Connect your data</h1>
            <p className="text-gray-400 mb-6">The more data we have, the more accurate your leak detection.</p>
            <div className="space-y-3">
              {DATA_SOURCES.map(ds => (
                <button key={ds.id} onClick={() => { setDataSource(ds.id); }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${dataSource === ds.id ? "border-green-400 bg-green-900/20" : "border-gray-700 bg-gray-800/50 hover:border-gray-500"}`}>
                  <span className="text-2xl">{ds.icon}</span>
                  <div className="flex-1">
                    <div className="text-white font-bold">{ds.name}</div>
                    <div className="text-xs text-gray-400">{ds.desc}</div>
                  </div>
                  <span className="text-xs font-bold" style={{ color: G }}>{ds.confidence}</span>
                </button>
              ))}
            </div>
            <button onClick={() => {
              if (dataSource === "estimate") {
                loadQuestions(industry || existingBiz?.industry?.toLowerCase() || "");
                setStep("questions");
              } else {
                runScan();
              }
            }} className="w-full mt-6 p-4 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105" style={{ background: G }}>
              {dataSource === "estimate" ? "Answer 5 Questions →" : "Start Scan →"}
            </button>
            <button onClick={() => setStep(existingBiz ? "pick" : "name")} className="mt-3 text-gray-400 text-sm hover:text-white">← Back</button>
          </div>
        )}

        {/* STEP 4: Quick Questions */}
        {step === "questions" && (
          <div className="text-center">
            <h1 className="text-2xl font-black text-white mb-2">Quick scan — {questions.length} questions</h1>
            <p className="text-gray-400 mb-6">Answer honestly. The more accurate your numbers, the better we can find leaks.</p>
            <div className="space-y-4 text-left">
              {questions.map((q, i) => (
                <div key={q.key}>
                  <label className="text-sm text-gray-300 font-medium block mb-1">{i + 1}. {q.question}</label>
                  <div className="flex items-center gap-2">
                    {q.type === "dollars" && <span className="text-gray-400 text-lg">$</span>}
                    <input
                      type="number"
                      value={answers[q.key] || ""}
                      onChange={e => setAnswers({ ...answers, [q.key]: parseFloat(e.target.value) || 0 })}
                      placeholder={q.placeholder}
                      className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-green-400 focus:outline-none"
                    />
                    {q.type === "percent" && <span className="text-gray-400 text-lg">%</span>}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={runScan}
              disabled={Object.keys(answers).length < 2}
              className="w-full mt-6 p-4 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: G }}
            >
              Find My Leaks →
            </button>
            <button onClick={() => setStep("connect")} className="mt-3 text-gray-400 text-sm hover:text-white">← Back</button>
          </div>
        )}

        {/* STEP 5: Scanning */}
        {step === "scanning" && (
          <div className="text-center">
            <div className="text-6xl mb-6 animate-pulse">🔍</div>
            <h1 className="text-2xl font-black text-white mb-4">Scanning your business...</h1>
            <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
              <div className="h-3 rounded-full transition-all duration-300" style={{ width: scanProgress + "%", background: G }} />
            </div>
            <div className="text-sm text-gray-400">{scanMessage}</div>
            <div className="text-xs text-gray-600 mt-2">{Math.round(scanProgress)}%</div>
          </div>
        )}

        {/* STEP 6: Results */}
        {step === "results" && scanResult && (
          <div className="text-center">
            <div className="text-6xl mb-4">💸</div>
            <h1 className="text-5xl font-black text-white mb-2">{fmt(scanResult.totalAmount)}<span className="text-xl text-gray-400">/yr</span></h1>
            <p className="text-gray-400 mb-6">That's how much your business is leaking right now.</p>

            <div className="flex justify-center gap-4 mb-6">
              {scanResult.urgentCount > 0 && <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-2"><div className="text-2xl font-black text-red-400">{scanResult.urgentCount}</div><div className="text-xs text-red-400">Urgent</div></div>}
              {scanResult.importantCount > 0 && <div className="bg-orange-900/30 border border-orange-500/30 rounded-xl px-4 py-2"><div className="text-2xl font-black text-orange-400">{scanResult.importantCount}</div><div className="text-xs text-orange-400">Important</div></div>}
              {scanResult.minorCount > 0 && <div className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-2"><div className="text-2xl font-black text-gray-400">{scanResult.minorCount}</div><div className="text-xs text-gray-400">Minor</div></div>}
            </div>

            <div className="text-sm text-gray-500 mb-6">{scanResult.leakCount} leaks found across your business</div>

            <button onClick={() => router.push("/dashboard")} className="w-full p-4 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105" style={{ background: G }}>
              See My Dashboard →
            </button>

            {/* Preview top 3 leaks */}
            {scanResult.leaks?.slice(0, 3).map((l: any) => (
              <div key={l.id} className="mt-3 bg-gray-800/50 rounded-xl p-3 flex items-center justify-between text-left">
                <div>
                  <div className="text-sm text-white font-medium">{l.title}</div>
                  <div className="text-xs text-gray-400">{l.fixAction}</div>
                </div>
                <span className="text-sm font-bold text-red-400">{fmt(l.annualImpact)}/yr</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AppShell>
  );
}
