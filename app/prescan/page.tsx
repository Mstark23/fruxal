"use client";

import React, { useEffect, useRef, useState } from "react";

type ChatRole = "assistant" | "user";
interface ChatMessage { id: string; role: ChatRole; content: string; }
interface PrescanChatResponse {
  sessionId: string | null;
  message: string;
  tags: Record<string, any>;
  analysis: any;
  prescanRunId: string | null;
  completed: boolean;
  tier?: string;
  pricing?: number;
}

const LEAK_META: Record<string, { icon: string; title: string; desc: string }> = {
  processing_rate_high: { icon: "💳", title: "Card Processing Fees Too High", desc: "Your card processing rate is above benchmark. Switching providers could recover this annually." },
  rent_or_chair_high:   { icon: "🏠", title: "Rent / Space Cost Too High",    desc: "Your space cost exceeds typical for your industry. Renegotiating could free up significant cash." },
  tax_optimization_gap: { icon: "📋", title: "Tax Deductions Being Missed",   desc: "Without tracking tools, most businesses miss 2–4% in deductions annually." },
  cash_management_risk: { icon: "💵", title: "Cash Handling Risk",             desc: "Cash usage without tracking creates invisible leakage through errors and shrinkage." },
  labor_cost_high:      { icon: "👥", title: "Labour Cost Above Benchmark",    desc: "Your payroll ratio is higher than similar businesses in your sector." },
  payroll_ratio_high:   { icon: "👥", title: "Labour Cost Above Benchmark",    desc: "Your payroll ratio is higher than similar businesses in your sector." },
  insurance_overpayment:  { icon: "🛡️", title: "Insurance Premiums Too High",  desc: "Shopping your coverage annually typically yields significant savings." },
  fuel_vehicle_high:       { icon: "⛽", title: "Fuel / Vehicle Costs High",      desc: "Your fuel costs are above benchmark. Route optimization or fuel cards can reduce this." },
  subscription_bloat:   { icon: "💻", title: "Software Subscriptions Bloat",   desc: "Auditing unused SaaS tools typically reveals quick savings." },
  software_bloat:       { icon: "💻", title: "Software Subscriptions Bloat",   desc: "Auditing unused SaaS tools typically reveals quick savings." },
  banking_fees_high:    { icon: "🏦", title: "Banking Fees Too High",          desc: "Your banking fees are above average. Switching to a better business account can save money." },
  inventory_cogs_high:  { icon: "📦", title: "Cost of Goods Too High",         desc: "Your COGS ratio exceeds the benchmark. Renegotiating supplier terms could reduce this." },
  marketing_waste:      { icon: "📣", title: "Marketing Spend Inefficient",    desc: "Your marketing costs are high relative to revenue. Focusing on higher-ROI channels helps." },
  marketing_overspend:  { icon: "📣", title: "Marketing Overspend",            desc: "Your marketing costs are high relative to revenue." },
};

const fmt = (n: number) => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n).toLocaleString();

function HealthRing({ score }: { score: number }) {
  const color = score >= 70 ? "#00c853" : score >= 40 ? "#ff8f00" : "#ff3d57";
  return (
    <div className="relative w-20 h-20">
      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#1e293b" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.91" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">{score}</span>
    </div>
  );
}

function Snapshot({ analysis, prescanRunId }: { analysis: any; prescanRunId: string | null }) {
  const leaks = (analysis.leaks || []).map((l: any, i: number) => {
    const meta = LEAK_META[l.type] || { icon: "💧", title: l.type, desc: "" };
    return { ...meta, id: i, amount: l.amount || 0, severity: l.severity || 0, confidence: l.confidence || 0 };
  });
  const totalLeak = leaks.reduce((s: number, l: any) => s + l.amount, 0);
  const fhScore = analysis.fhScore || 0;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-lg font-black">💧 Fruxal</div>
            <div className="text-xs text-white/40 mt-0.5">Your Financial Leak Snapshot</div>
          </div>
          <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-bold uppercase tracking-wider">Free Preview</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Summary */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-2">Estimated Annual Leak</div>
              {totalLeak > 0 ? (
                <>
                  <div className="text-4xl font-black text-red-400">
                    {fmt(Math.round(totalLeak * 0.8))}
                    <span className="text-2xl text-white/30 mx-2">–</span>
                    {fmt(Math.round(totalLeak * 1.2))}
                    <span className="text-base text-white/40 font-normal ml-1">/yr</span>
                  </div>
                  <div className="text-xs text-white/30 mt-2">Based on similar businesses in your area</div>
                </>
              ) : (
                <div className="text-3xl font-black text-emerald-400">No major leaks detected</div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <HealthRing score={fhScore} />
              <div className="text-xs text-white/40">Financial Health</div>
            </div>
          </div>
        </div>

        {/* Leaks */}
        {leaks.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider">
              {leaks.length} leak{leaks.length !== 1 ? "s" : ""} detected
            </div>
            {leaks.map((leak: any) => (
              <div key={leak.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl mt-0.5 shrink-0">{leak.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-white">{leak.title}</div>
                      <div className="text-sm text-white/50 mt-1 leading-relaxed">{leak.desc}</div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: leak.severity >= 60 ? "#ff3d5722" : "#ff8f0022", color: leak.severity >= 60 ? "#ff3d57" : "#ff8f00" }}>
                          {leak.severity >= 60 ? "High" : "Medium"}
                        </span>
                        <span className="text-xs text-white/30">{leak.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                  {leak.amount > 0 && (
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-red-400">{fmt(leak.amount)}</div>
                      <div className="text-xs text-white/30">/yr</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900/80 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0">🔌</div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg mb-1">These are estimates. Connect your real data.</div>
              <div className="text-sm text-white/55 mb-4">Link your accounting software or bank statements for exact leaks, monitored every month.</div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: "📊", label: "Exact leaks" },
                  { icon: "🔔", label: "Drift alerts" },
                  { icon: "📈", label: "Monthly tracking" },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2">
                    <span>{f.icon}</span>
                    <span className="text-xs text-white/70 font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
              <a
                href={`/register${prescanRunId ? `?prescanRunId=${prescanRunId}&from=prescan` : ""}`}
                className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all"
              >
                Connect my real data →
              </a>
              <div className="text-xs text-white/25 mt-2">Free to start · No credit card required</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-4">
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-white/20 hover:text-white/50 transition"
          >
            Run a new prescan
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PrescanChatPage() {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<{ analysis: any; prescanRunId: string | null } | null>(null);
  const [lang, setLang]           = useState<"en" | "fr">("en");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Detect page language from <html lang=""> or browser locale
  useEffect(() => {
    const htmlLang = document.documentElement.lang?.toLowerCase();
    if (htmlLang?.startsWith("fr")) { setLang("fr"); return; }
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v3/prescan-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: null, message: "Hi, I'm ready to start.", history: [], lang }),
        });
        const data: PrescanChatResponse = await res.json();
        setSessionId(data.sessionId);
        setMessages([{ id: "assistant-0", role: "assistant", content: data.message }]);
      } catch {
        setMessages([{ id: "err", role: "assistant", content: lang === "fr" ? "J'ai un problème de démarrage. Veuillez rafraîchir." : "I'm having trouble starting. Please refresh." }]);
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: "user", content: userText }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/v3/prescan-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: userText, history, lang }),
      });
      const data: PrescanChatResponse = await res.json();
      if (!sessionId && data.sessionId) setSessionId(data.sessionId);

      if (data.completed && data.analysis) {
        // Render snapshot inline — zero routing, zero redirects
        setResult({ analysis: data.analysis, prescanRunId: data.prescanRunId });
      } else {
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`, role: "assistant",
          content: data.message,
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, role: "assistant",
        content: "Something went wrong. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Show snapshot inline — no navigation needed
  if (result) return <Snapshot analysis={result.analysis} prescanRunId={result.prescanRunId} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <header className="border-b border-white/10 px-4 py-3 sm:px-8 sm:py-4">
        <h1 className="text-lg sm:text-xl font-semibold">💧 Fruxal</h1>
        <p className="text-xs sm:text-sm text-white/60">
          {lang === "fr" ? "Répondez à quelques questions pour voir où votre entreprise perd de l'argent." : "Answer a few questions to see where your business is losing money."}
        </p>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 py-4">
        <div className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 sm:p-6 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] ${m.role === "assistant" ? "" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="text-[11px] font-semibold text-white/40 mb-1 tracking-wide">Fruxal</div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed ${
                      m.role === "assistant"
                        ? "bg-white/5 border border-white/10"
                        : "bg-emerald-500 text-black font-medium"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10">
                  <span className="inline-flex items-center gap-1.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-2 h-2 rounded-full bg-white/40 animate-pulse"
                        style={{ animationDelay: d + "ms" }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="mt-4 border-t border-white/10 pt-3 flex gap-2">
            <input
              type="text"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder={loading ? (lang === "fr" ? "Laissez-moi réfléchir..." : "Let me think...") : (lang === "fr" ? "Tapez votre réponse ici..." : "Type your answer here...")}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-sm disabled:opacity-40 hover:bg-emerald-400 transition"
            >
              {lang === "fr" ? "Envoyer" : "Send"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
