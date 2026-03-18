// =============================================================================
// /tier3 — Rep Dashboard
// =============================================================================
// Lists all diagnostics. Table: company, industry, province, revenue,
// leak range, high confidence count, status, date, View button.
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DiagnosticRow {
  id: string;
  companyName: string;
  industry: string;
  province: string;
  revenueBracket: string;
  employeeCount: number;
  status: string;
  createdAt: string;
  summary: {
    totalEstimatedLow: number;
    totalEstimatedHigh: number;
    highConfidenceCount: number;
    feeRangeLow: number;
    feeRangeHigh: number;
  } | null;
  leakCount: number;
  highConfidenceCount: number;
}

const BRACKET_LABELS: Record<string, string> = {
  "1M_5M": "$1M–$5M", "5M_20M": "$5M–$20M", "20M_50M": "$20M–$50M",
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft:    { bg: "rgba(107,118,148,0.12)", text: "#6b7694" },
  sent:     { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa" },
  signed:   { bg: "rgba(0,200,83,0.12)",    text: "#00c853" },
  rejected: { bg: "rgba(239,68,68,0.12)",   text: "#f87171" },
  archived: { bg: "rgba(148,163,184,0.08)", text: "#475569" },
};

export default function Tier3DashboardPage() {
  const router = useRouter();
  const [diagnostics, setDiagnostics] = useState<DiagnosticRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/tier3/diagnostic")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setDiagnostics(json.diagnostics || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? diagnostics
    : diagnostics.filter((d) => d.status === filter);

  // Stats
  const totalPipeline = diagnostics.reduce((sum, d) => sum + (d.summary?.totalEstimatedHigh || 0), 0);
  const signedCount = diagnostics.filter((d) => d.status === "signed").length;
  const sentCount = diagnostics.filter((d) => d.status === "sent").length;

  return (
    <div className="min-h-screen bg-[#0d1320]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ═══ HEADER ═══ */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-[#00c853]/15 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00c853" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" /></svg>
              </div>
              <span className="text-xs font-bold text-[#4a5578] uppercase tracking-widest">Fruxal Tier 3</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Diagnostics</h1>
          </div>
          <button
            onClick={() => router.push("/tier3/diagnostic/new")}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: "linear-gradient(135deg, #00c853, #00a844)", color: "#fff" }}
          >
            + New Diagnostic
          </button>
        </div>

        {/* ═══ STAT CARDS ═══ */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl bg-[#0f1625] border border-[#1a2238] p-4">
            <div className="text-[10px] font-bold text-[#4a5578] uppercase tracking-widest">Total Diagnostics</div>
            <div className="text-2xl font-bold text-white mt-1 tabular-nums">{diagnostics.length}</div>
          </div>
          <div className="rounded-xl bg-[#0f1625] border border-[#1a2238] p-4">
            <div className="text-[10px] font-bold text-[#4a5578] uppercase tracking-widest">Pipeline Value</div>
            <div className="text-2xl font-bold text-white mt-1 tabular-nums">${(totalPipeline / 1000).toFixed(0)}K</div>
          </div>
          <div className="rounded-xl bg-[#0f1625] border border-[#1a2238] p-4">
            <div className="text-[10px] font-bold text-[#4a5578] uppercase tracking-widest">Sent</div>
            <div className="text-2xl font-bold text-blue-400 mt-1 tabular-nums">{sentCount}</div>
          </div>
          <div className="rounded-xl bg-[#0f1625] border border-[#1a2238] p-4">
            <div className="text-[10px] font-bold text-[#4a5578] uppercase tracking-widest">Signed</div>
            <div className="text-2xl font-bold text-[#00c853] mt-1 tabular-nums">{signedCount}</div>
          </div>
        </div>

        {/* ═══ FILTERS ═══ */}
        <div className="flex items-center gap-2 mb-5">
          {["all", "draft", "sent", "signed", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-[#00c853]/12 text-[#00c853] border border-[#00c853]/25"
                  : "bg-[#0f1625] text-[#4a5578] border border-[#1a2238] hover:border-[#2a3a5c]"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && (
                <span className="ml-1.5 opacity-60">
                  {diagnostics.filter((d) => d.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ TABLE ═══ */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-5 h-5 text-[#00c853]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" /><path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm text-[#6b7694] mb-1">
              {diagnostics.length === 0 ? "No diagnostics yet" : `No ${filter} diagnostics`}
            </p>
            {diagnostics.length === 0 && (
              <button
                onClick={() => router.push("/tier3/diagnostic/new")}
                className="mt-4 px-5 py-2 text-sm font-semibold text-[#00c853] bg-[#00c853]/10 rounded-lg hover:bg-[#00c853]/20 transition"
              >
                Create your first diagnostic
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-[#1a2238] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_100px_60px_90px_140px_50px_70px_60px] px-5 py-3 bg-[#0a0f1a] border-b border-[#1a2238] text-[9px] font-bold text-[#3a4560] uppercase tracking-widest">
              <div>Company</div>
              <div>Industry</div>
              <div>Prov</div>
              <div>Revenue</div>
              <div>Leak Range</div>
              <div className="text-center">High</div>
              <div className="text-center">Status</div>
              <div></div>
            </div>

            {/* Rows */}
            {filtered.map((d) => {
              const st = STATUS_STYLES[d.status] || STATUS_STYLES.draft;
              return (
                <div
                  key={d.id}
                  className="grid grid-cols-[1fr_100px_60px_90px_140px_50px_70px_60px] px-5 py-3.5 border-b border-[#141c2e] hover:bg-[#111827] transition-colors items-center"
                >
                  <div>
                    <div className="text-sm font-semibold text-white truncate">{d.companyName}</div>
                    <div className="text-[10px] text-[#3a4560] mt-0.5">
                      {new Date(d.createdAt).toLocaleDateString("en-CA")}
                    </div>
                  </div>
                  <div className="text-xs text-[#6b7694] truncate">{d.industry}</div>
                  <div className="text-xs text-[#6b7694]">{d.province}</div>
                  <div className="text-xs text-[#6b7694]">{BRACKET_LABELS[d.revenueBracket] || d.revenueBracket}</div>
                  <div className="text-xs font-semibold text-white tabular-nums">
                    {d.summary
                      ? `$${(d.summary.totalEstimatedLow / 1000).toFixed(0)}K – $${(d.summary.totalEstimatedHigh / 1000).toFixed(0)}K`
                      : "—"
                    }
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-[#00c853] tabular-nums">{d.highConfidenceCount}</span>
                  </div>
                  <div className="text-center">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {d.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => router.push(`/tier3/diagnostic/${d.id}`)}
                      className="text-xs font-semibold text-[#00c853] hover:underline"
                    >
                      View →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
