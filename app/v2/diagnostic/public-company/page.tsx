"use client";
// =============================================================================
// app/v2/diagnostic/public-company/page.tsx
// Ticker-based diagnostic launcher for TSX/publicly listed companies.
// No intake form — data pulled directly from public filings via FMP.
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchResult { symbol: string; name: string; exchange: string; currency: string; }

export default function PublicCompanyDiagnosticPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (selected || query.length < 2) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/v2/diagnostic/public-company/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.results || []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
  }, [query, selected]);

  async function runDiagnostic() {
    if (!selected) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/v2/diagnostic/public-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: selected.symbol, language: lang }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.push(`/v2/diagnostic/${json.reportId}`);
    } catch (e: any) {
      setError(e.message);
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE PUBLIC FILINGS
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Public Company Diagnostic</h1>
          <p className="text-sm text-white/40">
            Search any TSX-listed company. We pull their audited financials directly — no forms, no estimates.
          </p>
        </div>

        {/* Search box */}
        <div className="relative mb-3">
          <div className={`flex items-center gap-3 bg-white/[0.04] border ${selected ? "border-emerald-500/50" : "border-white/[0.08]"} rounded-xl px-4 py-3 transition-colors`}>
            <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {selected ? (
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="text-white font-medium text-sm">{selected.name}</span>
                  <span className="ml-2 text-xs text-emerald-400 font-mono">{selected.symbol}</span>
                  <span className="ml-2 text-xs text-white/30">{selected.exchange}</span>
                </div>
                <button onClick={() => { setSelected(null); setQuery(""); }} className="text-white/30 hover:text-white/60 text-xs ml-3">✕</button>
              </div>
            ) : (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by company name or ticker (e.g. Royal Bank, RY)"
                className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none"
              />
            )}
            {searching && <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin shrink-0" />}
          </div>

          {/* Dropdown results */}
          {results.length > 0 && !selected && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#111827] border border-white/[0.08] rounded-xl overflow-hidden z-50 shadow-2xl">
              {results.map((r) => (
                <button key={r.symbol}
                  onClick={() => { setSelected(r); setQuery(r.name); setResults([]); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors text-left group">
                  <div>
                    <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{r.name}</span>
                    <span className="ml-2 text-xs text-white/30">{r.currency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">{r.exchange}</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{r.symbol}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language toggle */}
        <div className="flex gap-2 mb-6">
          {(["en", "fr"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${lang === l ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "border-white/[0.06] text-white/30 hover:text-white/50"}`}>
              {l === "en" ? "🇨🇦 English" : "🇨🇦 Français"}
            </button>
          ))}
        </div>

        {/* What you get */}
        {!selected && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mb-6">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">What we pull from their filings</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Real revenue & COGS", "Actual EBITDA margin", "Effective tax rate",
                "Free cash flow", "Debt structure", "3-year trend",
                "R&D spend (SR&ED)", "Working capital", "Return on equity",
                "Accounts receivable", "CapEx pattern", "Peer benchmarks",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-white/50">
                  <span className="text-emerald-500">✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected company preview */}
        {selected && !running && (
          <div className="bg-white/[0.02] border border-emerald-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold">{selected.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{selected.exchange} · {selected.currency}</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{selected.symbol}</span>
            </div>
            <div className="text-xs text-white/40 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Pulling 3 years of audited financials from public filings · No manual input required
            </div>
          </div>
        )}

        {/* Running state */}
        {running && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-6 text-center">
            <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-sm font-semibold mb-1">Analyzing {selected?.name}</p>
            <p className="text-xs text-white/30">Pulling audited financials → running diagnostic → calculating real impacts</p>
            <p className="text-xs text-white/20 mt-2">~30–60 seconds</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* CTA */}
        {!running && (
          <button onClick={runDiagnostic} disabled={!selected}
            className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
              selected
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                : "bg-white/[0.04] text-white/20 cursor-not-allowed"
            }`}>
            {selected ? `Run Diagnostic on ${selected.name} →` : "Search for a company to begin"}
          </button>
        )}

        <p className="text-center text-xs text-white/20 mt-4">
          Data sourced from public SEDAR+ filings via Financial Modeling Prep · {new Date().getFullYear()} fiscal year
        </p>
      </div>
    </div>
  );
}
