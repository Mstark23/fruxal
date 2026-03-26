"use client";
// =============================================================================
// app/v2/ratios/page.tsx — Financial Ratio Intelligence Dashboard
// 4 sections: Grade scorecard, Ratio cards (4 groups), Narrative, Missing data
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  RATIO_BENCHMARKS,
  getGrossMarginBenchmark,
  getRatioStatus,
  type CalculatedRatios,
  type RatioGrades,
} from "@/lib/ai/ratio-calculator";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtRatio(v: number | null, unit?: string): string {
  if (v === null || v === undefined) return "—";
  const n = Math.round(v * 100) / 100;
  if (unit === "%") return `${n}%`;
  if (unit === "days") return `${Math.round(v)}d`;
  if (unit === "x") return `${n}×`;
  return String(n);
}

type Status = "good" | "warning" | "danger";
const STATUS_COLORS: Record<Status, string> = { good: "#2D7A50", warning: "#C4841D", danger: "#B34040" };
const STATUS_BG: Record<Status, string>     = { good: "rgba(45,122,80,0.07)", warning: "rgba(196,132,29,0.07)", danger: "rgba(179,64,64,0.07)" };
const STATUS_ICON: Record<Status, string>   = { good: "✓", warning: "!", danger: "✗" };
const TREND_ICON: Record<string, string>    = { improving: "↑", stable: "→", declining: "↓" };
const TREND_COLOR: Record<string, string>   = { improving: "#2D7A50", stable: "#8E8C85", declining: "#B34040" };
const GRADE_COLOR: Record<string, string>   = { A: "#2D7A50", B: "#1B3A2D", C: "#C4841D", D: "#B34040", F: "#7B1F1F" };

// ── Sparkline SVG (last 3 data points) ───────────────────────────────────────
function Sparkline({ values, good }: { values: (number | null)[]; good: boolean }) {
  const valid = values.filter(v => v !== null) as number[];
  if (valid.length < 2) return null;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const W = 64, H = 24;
  const pts = valid.map((v, i) => `${Math.round((i / (valid.length - 1)) * W)},${Math.round(H - ((v - min) / range) * (H - 4) - 2)}`).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      <polyline points={pts} fill="none" stroke={good ? "#2D7A50" : "#B34040"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Ratio card ────────────────────────────────────────────────────────────────
interface RatioCardProps {
  label: string;
  value: number | null;
  unit?: string;
  benchmark: ReturnType<typeof getRatioStatus> extends infer S ? any : any;
  description: string;
  trend?: "improving" | "stable" | "declining";
  history?: (number | null)[];
  bankReq?: number;
  higherIsBetter: boolean;
}

function RatioCard({ label, value, unit, benchmark, description, trend, history = [], bankReq, higherIsBetter }: RatioCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status: Status = value !== null ? getRatioStatus(value, benchmark) : "warning";
  const color = STATUS_COLORS[status];
  const bg    = STATUS_BG[status];

  // Progress bar: position within benchmark ranges
  const barPct = value !== null ? Math.min(100, Math.max(0,
    benchmark.higherIsBetter
      ? Math.min(100, (value / (benchmark.good.min * 1.5)) * 100)
      : Math.max(0, 100 - (value / (benchmark.danger.max || 999)) * 100)
  )) : 0;

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <button className="w-full px-4 py-3 text-left" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-semibold text-ink">{label}</span>
              {trend && (
                <span className="text-[10px] font-bold" style={{ color: TREND_COLOR[trend] }}>
                  {TREND_ICON[trend]} {trend}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {history.length >= 2 && (
              <Sparkline values={history} good={status !== "danger"} />
            )}
            <div className="text-right">
              <span className="text-[18px] font-black tabular-nums" style={{ color: value !== null ? color : "#C5C2BB" }}>
                {fmtRatio(value, unit)}
              </span>
              {value !== null && (
                <span className="text-[11px] ml-1">{STATUS_ICON[status]}</span>
              )}
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C5C2BB" strokeWidth="2" strokeLinecap="round"
              className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "#F0EFEB" }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barPct}%`, background: color }} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1 space-y-2 border-t border-border-light" style={{ background: bg }}>
          <p className="text-[11px] text-ink leading-relaxed">&ldquo;{description}&rdquo;</p>
          {bankReq !== undefined && value !== null && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-ink-faint uppercase tracking-wider">Bank requirement:</span>
              <span className="text-[10px] font-semibold" style={{ color: value >= bankReq ? "#2D7A50" : "#B34040" }}>
                {value >= bankReq ? "✓" : "✗"} &gt;{bankReq}{unit === "%" ? "%" : "×"}
              </span>
            </div>
          )}
          <div className="flex gap-3 text-[9px] text-ink-faint">
            <span style={{ color: "#2D7A50" }}>✓ Good: {benchmark.good.min}{unit === "x" ? "×" : unit === "%" ? "%" : ""}+</span>
            <span style={{ color: "#C4841D" }}>! Watch: {benchmark.warning.min}{unit === "x" ? "×" : unit === "%" ? "%" : ""}+</span>
            <span style={{ color: "#B34040" }}>✗ Danger: &lt;{benchmark.warning.min}{unit === "x" ? "×" : unit === "%" ? "%" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Grade badge ───────────────────────────────────────────────────────────────
function GradeBadge({ grade }: { grade: string }) {
  return (
    <span className="text-[20px] font-black" style={{ color: GRADE_COLOR[grade] ?? "#555" }}>{grade}</span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RatiosPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading]     = useState(true);
  const [ratioData, setRatioData] = useState<any>(null);
  const [narrative, setNarrative] = useState<string>("");
  const [narLoading, setNarLoading] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const [industrySlug, setIndustrySlug] = useState("generic");

  const load = useCallback(async () => {
    try {
      const dash = await fetch("/api/v2/dashboard").then(r => r.ok ? r.json() : null).catch(() => null);
      const bid = dash?.data?.businessId;
      if (!bid) return;
      setBusinessId(bid);

      // Get industry for gross margin benchmarks
      const prof = await fetch(`/api/v2/dashboard`).then(r => r.ok ? r.json() : null).catch(() => null);
      if (prof?.data?.profile?.industry) setIndustrySlug(prof.data.profile.industry);

      const r = await fetch(`/api/v2/ratios?businessId=${bid}`).then(r => r.ok ? r.json() : null).catch(() => null);
      setRatioData(r);
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  const fetchNarrative = useCallback(async () => {
    if (!businessId || narLoading) return;
    if (ratioData?.narrative) { setNarrative(ratioData.narrative); return; }
    setNarLoading(true);
    try {
      const r = await fetch("/api/v2/ratios/narrative", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (r.ok) { const d = await r.json(); setNarrative(d.narrative || ""); }
    } catch { /* non-fatal */ }
    finally { setNarLoading(false); }
  }, [businessId, ratioData, narLoading]);

  useEffect(() => { if (ratioData?.current && businessId) fetchNarrative(); }, [ratioData, businessId]);

  if (loading || authLoading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" /></div>;
  }

  const setup_required = ratioData?.setup_required ?? true;
  const current: CalculatedRatios | null = ratioData?.current ?? null;
  const grades: RatioGrades | null = ratioData?.grades ?? null;
  const trend: Record<string, string> = ratioData?.trend ?? {};
  const completeness: number = ratioData?.dataCompleteness ?? 0;
  const history: any[] = ratioData?.history ?? [];
  const gmBenchmark = getGrossMarginBenchmark(industrySlug);

  function sparkFor(key: string): (number | null)[] {
    return history.map((h: any) => h[key] ?? null).reverse();
  }

  // Groups of ratios
  const GROUPS = [
    {
      label: "Liquidity", grade: grades?.liquidity, ratios: [
        { key: "currentRatio",  label: "Current Ratio",  unit: "x",   bm: RATIO_BENCHMARKS.currentRatio },
        { key: "quickRatio",    label: "Quick Ratio",    unit: "x",   bm: RATIO_BENCHMARKS.quickRatio },
        { key: "cashRatio",     label: "Cash Ratio",     unit: "x",   bm: RATIO_BENCHMARKS.cashRatio },
      ],
    },
    {
      label: "Profitability", grade: grades?.profitability, ratios: [
        { key: "grossMarginPct",        label: "Gross Margin",     unit: "%", bm: gmBenchmark },
        { key: "ebitdaMarginPct",       label: "EBITDA Margin",    unit: "%", bm: RATIO_BENCHMARKS.ebitdaMarginPct },
        { key: "netProfitMarginPct",    label: "Net Profit Margin",unit: "%", bm: RATIO_BENCHMARKS.netProfitMarginPct },
        { key: "returnOnAssetsPct",     label: "Return on Assets", unit: "%", bm: RATIO_BENCHMARKS.returnOnAssetsPct },
      ],
    },
    {
      label: "Efficiency", grade: grades?.efficiency, ratios: [
        { key: "dsoDays",       label: "Days Sales Outstanding", unit: "days", bm: RATIO_BENCHMARKS.dsoDays },
        { key: "dpoDays",       label: "Days Payable Outstanding",unit: "days",bm: RATIO_BENCHMARKS.dpoDays },
        { key: "assetTurnover", label: "Asset Turnover",         unit: "x",   bm: RATIO_BENCHMARKS.assetTurnover },
        { key: "inventoryDays", label: "Inventory Days",         unit: "days", bm: RATIO_BENCHMARKS.inventoryDays },
      ],
    },
    {
      label: "Leverage", grade: grades?.leverage, ratios: [
        { key: "dscr",             label: "DSCR",              unit: "x", bm: RATIO_BENCHMARKS.dscr,             bankReq: 1.25 },
        { key: "debtToEquity",     label: "Debt-to-Equity",    unit: "x", bm: RATIO_BENCHMARKS.debtToEquity },
        { key: "interestCoverage", label: "Interest Coverage", unit: "x", bm: RATIO_BENCHMARKS.interestCoverage, bankReq: 2.0 },
      ],
    },
  ];

  // Bank qualifying check (for enterprise-style display)
  const bankRatios = [
    { key: "dscr", req: 1.25, v: current?.dscr },
    { key: "currentRatio", req: 1.2, v: current?.currentRatio },
    { key: "interestCoverage", req: 2.0, v: current?.interestCoverage },
  ];
  const bankFailing = bankRatios.filter(r => r.v !== null && r.v !== undefined && r.v < r.req).length;

  return (
    <div className="bg-bg min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Header */}
        <div>
          <button onClick={() => router.back()} className="text-[10px] text-ink-faint hover:text-ink mb-2 flex items-center gap-1">← Dashboard</button>
          <h1 className="text-[22px] font-black text-ink leading-none">Financial Ratio Scorecard</h1>
          {ratioData && <p className="text-[11px] text-ink-faint mt-1">{completeness}% data completeness · {ratioData.dataSource === "diagnostic" ? "From diagnostic" : "Manually entered"}</p>}
        </div>

        {/* Setup required */}
        {setup_required && (
          <div className="bg-white rounded-xl border border-border-light p-6 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <svg className="w-8 h-8 mx-auto mb-3 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>
            <h2 className="text-[15px] font-bold text-ink mb-1">No ratio data yet</h2>
            <p className="text-[12px] text-ink-faint mb-4">Run your diagnostic to auto-populate financial ratios, or add balance sheet data manually.</p>
            <div className="flex gap-3 justify-center">
              <a href="/v2/diagnostic" className="px-4 py-2 text-[12px] font-bold text-white rounded-lg hover:opacity-90 transition" style={{ background: "#1B3A2D" }}>Run diagnostic →</a>
              <a href="/v2/breakeven" className="px-4 py-2 text-[12px] font-semibold text-ink-muted border border-border-light rounded-lg hover:bg-bg-section transition">Enter costs manually →</a>
            </div>
          </div>
        )}

        {/* Section 1 — Grade scorecard */}
        {grades && (
          <div className="bg-white rounded-xl border border-border-light p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1">Overall Grade</p>
                <div className="flex items-baseline gap-2">
                  <GradeBadge grade={grades.overall} />
                  <span className="text-[14px] font-bold text-ink-muted">{grades.overallScore}/100</span>
                </div>
                {bankFailing === 0 && current?.dscr !== null ? (
                  <p className="text-[10px] font-semibold text-positive mt-1">✅ Bank qualifying — all key thresholds met</p>
                ) : bankFailing > 0 ? (
                  <p className="text-[10px] font-semibold text-negative mt-1">{`! ${bankFailing} ratio${bankFailing > 1 ? "s" : ""} below bank threshold`}</p>
                ) : null}
              </div>
              {completeness < 80 && (
                <div className="text-right">
                  <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider mb-0.5">Data completeness</p>
                  <p className="text-[16px] font-black" style={{ color: completeness < 50 ? "#B34040" : "#C4841D" }}>{completeness}%</p>
                  <p className="text-[9px] text-ink-faint">Add balance sheet data</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GROUPS.map(g => (
                <div key={g.label} className="text-center py-2 rounded-lg" style={{ background: "#F9F8F6" }}>
                  <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider">{g.label}</p>
                  <GradeBadge grade={g.grade ?? "—"} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2 — Ratio cards by group */}
        {current && GROUPS.map(group => (
          <div key={group.label}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-ink">{group.label}</span>
              {group.grade && <GradeBadge grade={group.grade} />}
            </div>
            <div className="space-y-2">
              {group.ratios.map(r => {
                const value = current[r.key as keyof CalculatedRatios] as number | null;
                return (
                  <RatioCard
                    key={r.key}
                    label={r.label}
                    value={value}
                    unit={r.unit}
                    benchmark={r.bm}
                    description={r.bm.description}
                    trend={trend[r.key] as any}
                    history={sparkFor(r.key)}
                    bankReq={(r as any).bankReq}
                    higherIsBetter={r.bm.higherIsBetter}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Section 3 — Claude narrative */}
        {current && (
          <div className="bg-white rounded-xl border border-border-light p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <h3 className="text-[13px] font-bold text-ink mb-3">What this means for you</h3>
            {narLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                <p className="text-[11px] text-ink-faint">Analysing your ratio picture…</p>
              </div>
            ) : narrative ? (
              <p className="text-[12px] text-ink leading-relaxed whitespace-pre-line">{narrative}</p>
            ) : (
              <button onClick={fetchNarrative} className="text-[11px] font-semibold text-brand hover:underline">Generate analysis →</button>
            )}
          </div>
        )}

        {/* Section 4 — Missing data (when completeness < 80%) */}
        {current && completeness < 80 && (
          <div className="bg-white rounded-xl border border-border-light p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <h3 className="text-[13px] font-bold text-ink mb-1">Improve accuracy</h3>
            <p className="text-[11px] text-ink-faint mb-3">Connect your accounting software or enter the missing data to unlock all ratios.</p>
            <div className="space-y-1.5">
              {[
                { label: "Balance sheet (assets, liabilities, equity)", missing: !current.currentRatio },
                { label: "Accounts receivable balance", missing: current.dsoDays === null },
                { label: "Accounts payable balance", missing: current.dpoDays === null },
                { label: "Monthly debt payments", missing: current.dscr === null },
                { label: "Inventory value", missing: current.inventoryDays === null },
              ].filter(i => i.missing).map(item => (
                <div key={item.label} className="flex items-center gap-2 text-[11px] text-ink-muted">
                  <span className="text-negative">→</span> {item.label}
                </div>
              ))}
            </div>
            <a href="/v2/breakeven" className="inline-block mt-3 text-[11px] font-semibold text-brand hover:underline">
              Enter financial data →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
