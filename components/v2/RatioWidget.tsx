"use client";
// =============================================================================
// components/v2/RatioWidget.tsx — compact ratio summary for dashboards
// Tier 1: grade only | Tier 2: key ratios | Tier 3: scorecard with bank status
// =============================================================================

import { useState, useEffect } from "react";
import { getRatioStatus, RATIO_BENCHMARKS, getGrossMarginBenchmark } from "@/lib/ai/ratio-calculator";

interface RatioWidgetProps {
  businessId: string;
  tier: "solo" | "business" | "enterprise";
  industrySlug?: string;
  lang?: "en" | "fr";
}

function fmtR(v: number | null, unit?: string): string {
  if (v === null || v === undefined) return "—";
  const n = Math.round(v * 100) / 100;
  if (unit === "%") return `${n}%`;
  if (unit === "days") return `${Math.round(v)}d`;
  return `${n}×`;
}

type Status = "good" | "warning" | "danger";
const STATUS_ICON: Record<Status, string> = { good: "✅", warning: "⚠️", danger: "❌" };
const GRADE_COLOR: Record<string, string> = { A: "#2D7A50", B: "#1B3A2D", C: "#C4841D", D: "#B34040", F: "#7B1F1F" };

export function RatioWidget({ businessId, tier, industrySlug = "generic", lang = "en" }: RatioWidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => (isFR ? fr : en);

  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/v2/ratios?businessId=${businessId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border-light p-4 animate-pulse" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="h-3 w-28 bg-bg-section rounded mb-2" />
        <div className="h-5 w-20 bg-bg-section rounded" />
      </div>
    );
  }

  if (!data || data.setup_required) {
    return (
      <a href="/v2/ratios"
        className="block bg-white rounded-xl border border-border-light p-4 hover:shadow-md transition-all group"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", borderStyle: "dashed" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(27,58,45,0.05)", border: "1px solid rgba(27,58,45,0.12)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-ink">{t("Financial Ratios", "Ratios financiers")}</p>
            <p className="text-[10px] text-ink-faint">{t("Run diagnostic to calculate →", "Lancer le diagnostic →")}</p>
          </div>
        </div>
      </a>
    );
  }

  const grades = data.grades;
  const current = data.current;
  const gmBenchmark = getGrossMarginBenchmark(industrySlug);

  // Bank qualifying
  const bankRatios = [
    { v: current?.dscr, req: 1.25 },
    { v: current?.currentRatio, req: 1.2 },
    { v: current?.interestCoverage, req: 2.0 },
  ];
  const bankFailing = bankRatios.filter(r => r.v !== null && r.v !== undefined && r.v < r.req).length;

  // ── Solo: grade only ─────────────────────────────────────────────────────
  if (tier === "solo") {
    return (
      <a href="/v2/ratios" className="block bg-white rounded-xl border border-border-light p-4 hover:shadow-md transition-all"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1">
              {t("Financial Ratios", "Ratios financiers")}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-[20px] font-black" style={{ color: GRADE_COLOR[grades?.overall] ?? "#555" }}>
                {grades?.overall ?? "—"}
              </span>
              {grades?.overallScore && (
                <span className="text-[12px] text-ink-muted">{grades.overallScore}/100</span>
              )}
            </div>
          </div>
          <span className="text-[10px] text-brand font-semibold">{t("View →", "Voir →")}</span>
        </div>
      </a>
    );
  }

  // ── Business: key ratios inline ──────────────────────────────────────────
  if (tier === "business") {
    const keyRatios = [
      { label: "DSCR",   value: current?.dscr,          unit: "x",   bm: RATIO_BENCHMARKS.dscr },
      { label: "DSO",    value: current?.dsoDays,        unit: "days",bm: RATIO_BENCHMARKS.dsoDays },
      { label: "Margin", value: current?.grossMarginPct, unit: "%",   bm: gmBenchmark },
      { label: "D/E",    value: current?.debtToEquity,   unit: "x",   bm: RATIO_BENCHMARKS.debtToEquity },
    ];

    return (
      <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-border-light">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
              {t("Key Ratios", "Ratios clés")}
            </span>
            {grades?.overall && (
              <span className="text-[13px] font-black" style={{ color: GRADE_COLOR[grades.overall] }}>
                {grades.overall}
              </span>
            )}
          </div>
          <a href="/v2/ratios" className="text-[9px] font-semibold text-brand hover:underline">
            {t("Full dashboard →", "Tableau complet →")}
          </a>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-2">
          {keyRatios.map(r => {
            const status: Status = r.value !== null && r.value !== undefined
              ? getRatioStatus(r.value as number, r.bm) : "warning";
            return (
              <div key={r.label} className="flex items-center justify-between py-1">
                <span className="text-[10px] text-ink-muted">{r.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: r.value !== null ? "#1B3A2D" : "#C5C2BB" }}>
                    {fmtR(r.value as number | null, r.unit)}
                  </span>
                  <span className="text-[9px]">{r.value !== null ? STATUS_ICON[status] : ""}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Enterprise: scorecard with bank status ───────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-border-light">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Ratio Scorecard</span>
          {grades?.overall && (
            <span className="text-[13px] font-black" style={{ color: GRADE_COLOR[grades.overall] }}>{grades.overall}</span>
          )}
        </div>
        <a href="/v2/ratios" className="text-[9px] font-semibold text-brand hover:underline">Full analysis →</a>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            { label: "Liquidity",     grade: grades?.liquidity },
            { label: "Leverage",      grade: grades?.leverage },
            { label: "Efficiency",    grade: grades?.efficiency },
            { label: "Profitability", grade: grades?.profitability },
          ].map(g => (
            <div key={g.label} className="flex items-center justify-between">
              <span className="text-[10px] text-ink-muted">{g.label}</span>
              <span className="text-[12px] font-black" style={{ color: GRADE_COLOR[g.grade ?? ""] ?? "#555" }}>{g.grade ?? "—"}</span>
            </div>
          ))}
        </div>
        {bankFailing === 0 && current?.dscr !== null && current?.dscr !== undefined ? (
          <p className="text-[10px] font-semibold text-positive">✅ Bank qualifying — all key thresholds met</p>
        ) : bankFailing > 0 ? (
          <p className="text-[10px] font-semibold text-negative">⚠️ {bankFailing} ratio{bankFailing > 1 ? "s" : ""} below bank threshold</p>
        ) : null}
      </div>
    </div>
  );
}
