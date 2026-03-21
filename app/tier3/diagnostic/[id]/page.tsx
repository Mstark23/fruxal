// =============================================================================
// /tier3/diagnostic/[id] — Diagnostic Result Preview
// =============================================================================
// Displays the full diagnostic output: summary banner, ranked leaks, actions.
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  tax_structure:        { bg: "rgba(99,102,241,0.12)", text: "#818cf8" },
  vendor_procurement:   { bg: "rgba(245,158,11,0.12)", text: "#fbbf24" },
  payroll_hr:           { bg: "rgba(236,72,153,0.12)", text: "#f472b6" },
  banking_treasury:     { bg: "rgba(34,211,238,0.12)", text: "#22d3ee" },
  insurance:            { bg: "rgba(168,85,247,0.12)", text: "#c084fc" },
  saas_technology:      { bg: "rgba(59,130,246,0.12)", text: "#60a5fa" },
  compliance_penalties: { bg: "rgba(239,68,68,0.12)",  text: "#f87171" },
};

const CAT_LABELS: Record<string, string> = {
  tax_structure: "Tax", vendor_procurement: "Vendor", payroll_hr: "Payroll",
  banking_treasury: "Banking", insurance: "Insurance", saas_technology: "SaaS",
  compliance_penalties: "Compliance",
};

const CONF_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  HIGH:        { bg: "rgba(0,200,83,0.12)", text: "#00c853", dot: "#00c853" },
  MEDIUM:      { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" },
  SPECULATIVE: { bg: "rgba(148,163,184,0.10)", text: "#94a3b8", dot: "#94a3b8" },
};

const BRACKET_LABELS: Record<string, string> = {
  "1M_5M": "$1M–$5M", "5M_20M": "$5M–$20M", "20M_50M": "$20M–$50M",
};

interface Leak {
  rank: number; leak_id: string; category: string; name: string; description: string;
  estimatedLow: number; estimatedHigh: number; confidence: string;
  confidenceReason: string; dataNeeded: string[]; recoveryTimeline: string;
}

interface Summary {
  totalEstimatedLow: number; totalEstimatedHigh: number; highConfidenceCount: number;
  topCategory: string; feeRangeLow: number; feeRangeHigh: number;
}

interface DiagnosticData {
  companyName: string; industry: string; province: string; revenueBracket: string;
  generatedAt: string; topLeaks: Leak[]; summary: Summary;
}

export default function DiagnosticResultPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<DiagnosticData | null>(null);
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLeak, setExpandedLeak] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Agreement modal
  const [showAgreement, setShowAgreement] = useState(false);
  const [agContactName, setAgContactName] = useState("");
  const [agContactTitle, setAgContactTitle] = useState("");
  const [agFee, setAgFee] = useState(12);
  const [agScope, setAgScope] = useState<string[]>([]);
  const [agGenerating, setAgGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tier3/diagnostic/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.diagnostic) {
          setData(json.diagnostic.result);
          setStatus(json.diagnostic.status);
          // Pre-select scope categories from top 5 leaks
          const top5Cats = [...new Set((json.diagnostic.result?.topLeaks || []).slice(0, 5).map((l: any) => l.category))];
          setAgScope(top5Cats as string[]);
        } else {
          setError(json.error || "Diagnostic not found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const markAsSent = async () => {
    setMarking(true);
    try {
      await fetch("/api/tier3/diagnostic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "sent" }),
      });
      setStatus("sent");
    } catch { /* non-fatal */ }
    setMarking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1320] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-5 h-5 text-[#00c853]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" /><path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
          <span className="text-sm text-[#6b7694]">Loading diagnostic…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0d1320] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-bold text-white mb-2">Diagnostic not found</p>
          <p className="text-sm text-[#6b7694] mb-6">{error}</p>
          <button onClick={() => router.push("/tier3")} className="px-6 py-2.5 text-sm font-semibold text-[#00c853] bg-[#00c853]/10 rounded-lg hover:bg-[#00c853]/20 transition">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="min-h-screen bg-[#0d1320]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* ═══ HEADER ═══ */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button onClick={() => router.push("/tier3")} className="text-xs text-[#4a5578] hover:text-[#00c853] transition-colors mb-3 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
              Dashboard
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">{data.companyName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-[#6b7694]">{data.industry}</span>
              <span className="w-1 h-1 rounded-full bg-[#2a3552]" />
              <span className="text-xs text-[#6b7694]">{data.province}</span>
              <span className="w-1 h-1 rounded-full bg-[#2a3552]" />
              <span className="text-xs text-[#6b7694]">{BRACKET_LABELS[data.revenueBracket] || data.revenueBracket}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md ${
              status === "sent" ? "bg-blue-500/15 text-blue-400" :
              status === "signed" ? "bg-[#00c853]/15 text-[#00c853]" :
              status === "rejected" ? "bg-red-500/15 text-red-400" :
              "bg-[#1a2238] text-[#6b7694]"
            }`}>
              {status}
            </span>
          </div>
        </div>

        {/* ═══ SUMMARY BANNER ═══ */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: "linear-gradient(135deg, #0f1a2e 0%, #0d2818 100%)", border: "1px solid rgba(0,200,83,0.12)" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] font-bold text-[#4a5578] uppercase tracking-widest mb-1.5">Total Recoverable</div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ${(s.totalEstimatedLow ?? 0).toLocaleString()} <span className="text-[#4a5578] font-normal">–</span> ${(s.totalEstimatedHigh ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-[#4a5578] mt-1">{data.topLeaks.length} identified leaks</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#4a5578] uppercase tracking-widest mb-1.5">High Confidence</div>
              <div className="text-2xl font-bold text-[#00c853] tracking-tight">{s.highConfidenceCount}</div>
              <div className="text-xs text-[#4a5578] mt-1">of {data.topLeaks.length} findings</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#4a5578] uppercase tracking-widest mb-1.5">Your Fee (12%)</div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ${(s.feeRangeLow ?? 0).toLocaleString()} <span className="text-[#4a5578] font-normal">–</span> ${(s.feeRangeHigh ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-[#4a5578] mt-1">contingency basis</div>
            </div>
          </div>
        </div>

        {/* ═══ LEAK CARDS ═══ */}
        <div className="space-y-3">
          {data.topLeaks.map((leak) => {
            const cat = CAT_COLORS[leak.category] || { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
            const conf = CONF_STYLES[leak.confidence] || CONF_STYLES.SPECULATIVE;
            const isExpanded = expandedLeak === leak.leak_id;

            return (
              <div key={idx}
                key={leak.leak_id}
                className="rounded-xl border transition-all cursor-pointer"
                style={{
                  background: isExpanded ? "#111927" : "#0f1625",
                  borderColor: isExpanded ? "rgba(0,200,83,0.15)" : "#1a2238",
                }}
                onClick={() => setExpandedLeak(isExpanded ? null : leak.leak_id)}
              >
                <div key={idx} className="px-5 py-4 flex items-center gap-4">
                  {/* Rank */}
                  <div key={idx} className="w-8 h-8 rounded-lg bg-[#1a2238] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#6b7694]">#{leak.rank}</span>
                  </div>

                  {/* Name + meta */}
                  <div key={idx} className="flex-1 min-w-0">
                    <div key={idx} className="text-sm font-semibold text-white truncate">{leak.name}</div>
                    <div key={idx} className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: cat.bg, color: cat.text }}>
                        {CAT_LABELS[leak.category] || leak.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: conf.bg, color: conf.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: conf.dot }} />
                        {leak.confidence}
                      </span>
                    </div>
                  </div>

                  {/* Dollar range */}
                  <div key={idx} className="text-right shrink-0">
                    <div key={idx} className="text-sm font-bold text-white tabular-nums">
                      ${(leak.estimatedLow ?? 0).toLocaleString()} – ${(leak.estimatedHigh ?? 0).toLocaleString()}
                    </div>
                    <div key={idx} className="text-[10px] text-[#4a5578]">/yr</div>
                  </div>

                  {/* Chevron */}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a5578" strokeWidth="2" strokeLinecap="round"
                    className={`shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div key={idx} className="px-5 pb-5 pt-0 border-t border-[#1a2238]">
                    <div key={idx} className="pt-4 space-y-4">
                      <div key={idx}>
                        <div key={idx} className="text-[10px] font-bold text-[#4a5578] uppercase tracking-wider mb-1">Description</div>
                        <p className="text-xs text-[#94a3b8] leading-relaxed">{leak.description}</p>
                      </div>
                      <div key={idx}>
                        <div key={idx} className="text-[10px] font-bold text-[#4a5578] uppercase tracking-wider mb-1">Confidence Reason</div>
                        <p className="text-xs text-[#94a3b8] leading-relaxed">{leak.confidenceReason}</p>
                      </div>
                      <div key={idx} className="grid grid-cols-2 gap-4">
                        <div key={idx}>
                          <div key={idx} className="text-[10px] font-bold text-[#4a5578] uppercase tracking-wider mb-1.5">Data Needed</div>
                          <ul className="space-y-1">
                            {leak.dataNeeded.map((d, i) => (
                              <li key={i} className="text-xs text-[#6b7694] flex items-start gap-2">
                                <span key={i} className="w-1 h-1 rounded-full bg-[#2a3552] mt-1.5 shrink-0" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-[#4a5578] uppercase tracking-wider mb-1.5">Recovery Timeline</div>
                          <p className="text-xs text-[#6b7694]">{leak.recoveryTimeline}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══ ACTIONS ═══ */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={async () => {
              setDownloading(true);
              try {
                const res = await fetch(`/api/tier3/diagnostic/${id}/pdf`);
                if (!res.ok) throw new Error("PDF generation failed");
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                const safeName = (data.companyName || "company").replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").toLowerCase();
                a.download = `fruxal-diagnostic-${safeName}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
                setStatus("sent");
              } catch (err) {
                console.error("PDF download failed:", err);
              }
              setDownloading(false);
            }}
            disabled={downloading}
            className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
            style={{ background: downloading ? "#1a2238" : "linear-gradient(135deg, #00c853, #00a844)", color: downloading ? "#6b7694" : "#fff" }}
          >
            {downloading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" /><path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                Generating PDF…
              </span>
            ) : "Download Executive Report (PDF)"}
          </button>
          {status === "draft" && (
            <button
              onClick={markAsSent}
              disabled={marking}
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-[#1a2238] text-[#6b7694] border border-[#1e2a42] hover:border-[#00c853]/30 hover:text-[#00c853] transition-all disabled:opacity-50"
            >
              {marking ? "Updating…" : "Mark as Sent"}
            </button>
          )}
          <button
            onClick={() => setShowAgreement(true)}
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-[#1a2238] text-[#6b7694] border border-[#1e2a42] hover:border-purple-500/30 hover:text-purple-400 transition-all"
          >
            Generate Agreement
          </button>
          <button
            onClick={() => router.push("/tier3/diagnostic/new")}
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-[#1a2238] text-[#6b7694] border border-[#1e2a42] hover:border-[#2a3a5c] transition-all"
          >
            New
          </button>
        </div>

        <div className="text-center text-[10px] text-[#2a3552] mt-6">
          Generated {new Date(data.generatedAt).toLocaleString()} · Fruxal Tier 3 Engine
        </div>
      </div>

      {/* ═══ AGREEMENT MODAL ═══ */}
      {showAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => !agGenerating && setShowAgreement(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl border border-[#1e2a42] bg-[#0d1320] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2238]">
              <div>
                <h3 className="text-sm font-bold text-white">Generate Contingency Agreement</h3>
                <p className="text-[10px] text-[#4a5578] mt-0.5">{data.companyName}</p>
              </div>
              <button onClick={() => setShowAgreement(false)} className="w-7 h-7 rounded-lg bg-[#1a2238] flex items-center justify-center text-[#4a5578] hover:text-white transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Contact fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7694] uppercase tracking-wider mb-1.5">Contact Name</label>
                  <input
                    type="text" value={agContactName} onChange={(e) => setAgContactName(e.target.value)}
                    placeholder="CFO's full name"
                    className="w-full bg-[#131a2b] border border-[#1e2a42] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#3a4560] focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7694] uppercase tracking-wider mb-1.5">Contact Title</label>
                  <input
                    type="text" value={agContactTitle} onChange={(e) => setAgContactTitle(e.target.value)}
                    placeholder="Chief Financial Officer"
                    className="w-full bg-[#131a2b] border border-[#1e2a42] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#3a4560] focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 outline-none transition"
                  />
                </div>
              </div>

              {/* Fee percentage */}
              <div>
                <label className="block text-[10px] font-semibold text-[#6b7694] uppercase tracking-wider mb-1.5">Fee Percentage</label>
                <div className="relative w-32">
                  <input
                    type="number" min={10} max={15} value={agFee} onChange={(e) => setAgFee(Math.min(15, Math.max(10, Number(e.target.value) || 12)))}
                    className="w-full bg-[#131a2b] border border-[#1e2a42] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 outline-none transition pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5578] text-sm">%</span>
                </div>
              </div>

              {/* Scope categories */}
              <div>
                <label className="block text-[10px] font-semibold text-[#6b7694] uppercase tracking-wider mb-2">Scope Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries({
                    tax_structure: "Tax Structure",
                    vendor_procurement: "Vendor & Procurement",
                    payroll_hr: "Payroll & HR",
                    banking_treasury: "Banking & Treasury",
                    insurance: "Insurance",
                    saas_technology: "SaaS & Technology",
                    compliance_penalties: "Compliance & Penalties",
                  }) as [string, string][]).map(([key, label]) => {
                    const checked = agScope.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => setAgScope(checked ? agScope.filter(c => c !== key) : [...agScope, key])}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                          checked
                            ? "bg-[#00c853]/10 border-[#00c853]/25 text-[#00c853]"
                            : "bg-[#131a2b] border-[#1e2a42] text-[#4a5578] hover:border-[#2a3a5c]"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          checked ? "bg-[#00c853] border-[#00c853]" : "border-[#2a3a5c]"
                        }`}>
                          {checked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>}
                        </div>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#1a2238] flex items-center justify-between">
              <button
                onClick={() => setShowAgreement(false)}
                className="px-4 py-2 text-xs font-semibold text-[#4a5578] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                disabled={agGenerating || agScope.length === 0}
                onClick={async () => {
                  setAgGenerating(true);
                  try {
                    const res = await fetch("/api/tier3/agreement", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        diagnosticId: id,
                        contactName: agContactName,
                        contactTitle: agContactTitle,
                        feePercentage: agFee,
                        scopeCategories: agScope,
                      }),
                    });
                    if (!res.ok) throw new Error("Agreement generation failed");
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    const safeName = (data.companyName || "company").replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").toLowerCase();
                    a.download = `fruxal-agreement-${safeName}.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setShowAgreement(false);
                  } catch (err) {
                    console.error("Agreement download failed:", err);
                  }
                  setAgGenerating(false);
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{
                  background: agGenerating ? "#1a2238" : "linear-gradient(135deg, #00c853, #00a844)",
                  color: agGenerating ? "#4a5578" : "#fff",
                }}
              >
                {agGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                    Generating…
                  </span>
                ) : "Generate Agreement PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
