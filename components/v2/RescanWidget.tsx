"use client";
// =============================================================================
// components/v2/RescanWidget.tsx
// Two exports:
//   RescanWidget    — "Since your last scan" comparison card
//   RescanNudge     — "It's been X days" prompt, tier-aware timing
// Both fetch from GET /api/v2/comparisons/history?businessId=XXX
// =============================================================================

import { useState, useEffect, useCallback } from "react";

interface ComparisonData {
  id:                       string;
  previous_score:           number;
  new_score:                number;
  score_delta:              number;
  savings_recovered_monthly: number;
  findings_new_count:       number;
  net_monthly_improvement:  number;
  days_between_scans:       number;
  leaks_fixed_count:        number;
  comparison_headline:      string;
  generated_at:             string;
  new_report_id:            string;
}

interface HistoryData {
  comparisons:      ComparisonData[];
  latestComparison: ComparisonData | null;
  daysSinceLast:    number | null;
}

interface RescanWidgetProps {
  businessId: string;
  tier?:      "solo" | "business" | "enterprise";
  lang?:      "en" | "fr";
}

function fmt(n: number) { return "$" + Math.round(Math.abs(n) ?? 0).toLocaleString(); }
function fmtDays(d: number) { return d === 1 ? "1 day" : `${d} days`; }

// ── Tier-aware nudge threshold ─────────────────────────────────────────────
const NUDGE_THRESHOLD: Record<string, number> = {
  solo:       60,
  business:   28,
  enterprise: 21,
};

// ── Shared data fetcher hook ───────────────────────────────────────────────
function useComparisonHistory(businessId: string) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await fetch(`/api/v2/comparisons?businessId=${businessId}`);
      if (res.ok) setData(await res.json());
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  return { data, loading };
}

// ── RescanWidget — "Since your last scan" card ────────────────────────────
export function RescanWidget({ businessId, tier = "solo", lang = "en" }: RescanWidgetProps) {
  const { data, loading } = useComparisonHistory(businessId);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  if (loading) return null;

  const latest = data?.latestComparison;
  if (!latest) return null;

  const delta = latest.score_delta ?? 0;
  const net   = latest.net_monthly_improvement ?? 0;
  const scoreColor = delta > 0 ? "#2D7A50" : delta < 0 ? "#C4841D" : "#8E8C85";

  // Tier 1: minimal
  if (tier === "solo") {
    return (
      <div className="bg-white rounded-xl border border-border-light px-4 py-3"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider mb-0.5">
              {t(`Since last scan (${fmtDays(latest.days_between_scans)} ago)`,
                 `Depuis le dernier scan (il y a ${fmtDays(latest.days_between_scans)})`)}
            </p>
            <p className="text-[12px] font-semibold text-ink">
              <span style={{ color: scoreColor }}>{t("Score", "Score")} {latest.previous_score} → {latest.new_score}{delta !== 0 ? ` (${delta > 0 ? "+" : ""}${delta})` : ""}{delta > 0 ? " ↑" : delta < 0 ? " ↓" : ""}</span>
              {latest.leaks_fixed_count > 0 && (
                <span className="text-ink-faint ml-2">· {t(`Fixed ${latest.leaks_fixed_count} leak${latest.leaks_fixed_count !== 1 ? "s" : ""}`, `${latest.leaks_fixed_count} correction${latest.leaks_fixed_count !== 1 ? "s" : ""}`)}</span>
              )}
            </p>
          </div>
          <a href={`/v2/diagnostic/${latest.new_report_id}`}
            className="text-[10px] font-bold text-brand hover:underline shrink-0">
            {t("View →", "Voir →")}
          </a>
        </div>
      </div>
    );
  }

  // Tier 3: with recommendation
  if (tier === "enterprise") {
    const daysSince = data?.daysSinceLast ?? 0;
    return (
      <div className="bg-white rounded-xl border border-border-light overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
          <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
            {t(`Scan comparison — ${fmtDays(latest.days_between_scans)} elapsed`, `Comparaison — il y a ${fmtDays(latest.days_between_scans)}`)}
          </span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-4 text-[12px]">
            <span>
              {t("Score", "Score")} <strong style={{ color: scoreColor }}>{latest.previous_score} → {latest.new_score}{delta !== 0 ? ` (${delta > 0 ? "+" : ""}${delta})` : ""}{delta > 0 ? " ↑" : delta < 0 ? " ↓" : ""}</strong>
            </span>
            <span>
              {t("Net", "Net")} <strong style={{ color: net >= 0 ? "#2D7A50" : "#C4841D" }}>{net >= 0 ? "+" : "-"}{fmt(net)}/mo</strong>
            </span>
          </div>
          {daysSince !== null && daysSince >= NUDGE_THRESHOLD.enterprise && (
            <p className="text-[10px] font-semibold" style={{ color: "#C4841D" }}>
              {t(`Rescan recommended (${fmtDays(daysSince)} — monthly cadence)`, `Rescan recommandé (${fmtDays(daysSince)})`)}
            </p>
          )}
        </div>
        <div className="px-4 pb-3 flex gap-2">
          <a href={`/v2/diagnostic/${latest.new_report_id}`}
            className="text-[10px] font-bold text-brand hover:underline">
            {t("View comparison →", "Voir la comparaison →")}
          </a>
          <span className="text-ink-faint text-[10px]">·</span>
          <a href="/v2/diagnostic"
            className="text-[10px] font-bold text-ink hover:underline">
            {t("Run new scan →", "Nouveau scan →")}
          </a>
        </div>
      </div>
    );
  }

  // Tier 2: full
  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className="px-4 py-2 border-b border-border-light">
        <span className="text-[9px] font-bold text-ink-faint uppercase tracking-wider">
          {t(`Since your last scan (${fmtDays(latest.days_between_scans)} ago)`,
             `Depuis le dernier scan (il y a ${fmtDays(latest.days_between_scans)})`)}
        </span>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <p className="text-[9px] text-ink-faint mb-0.5">{t("Score", "Score")}</p>
          <p className="text-[12px] font-bold" style={{ color: scoreColor }}>
            {delta > 0 ? "+" : ""}{delta}{delta > 0 ? " ↑" : delta < 0 ? " ↓" : ""}{" "}
            <span className="text-[10px] text-ink-faint font-normal">({latest.previous_score} → {latest.new_score})</span>
          </p>
        </div>
        {latest.savings_recovered_monthly > 0 && (
          <div>
            <p className="text-[9px] text-ink-faint mb-0.5">{t("Recovered", "Récupéré")}</p>
            <p className="text-[12px] font-bold text-positive">+{fmt(latest.savings_recovered_monthly)}/mo</p>
          </div>
        )}
        {latest.findings_new_count > 0 && (
          <div>
            <p className="text-[9px] text-ink-faint mb-0.5">{t("New issues", "Nouveaux")}</p>
            <p className="text-[12px] font-bold" style={{ color: "#C4841D" }}>{latest.findings_new_count} ⚠️</p>
          </div>
        )}
        <div>
          <p className="text-[9px] text-ink-faint mb-0.5">Net</p>
          <p className="text-[12px] font-bold" style={{ color: net >= 0 ? "#2D7A50" : "#C4841D" }}>
            {net >= 0 ? "+" : "-"}{fmt(net)}/mo
          </p>
        </div>
      </div>
      <div className="px-4 pb-3 flex items-center gap-3">
        <a href={`/v2/diagnostic/${latest.new_report_id}`}
          className="text-[10px] font-bold text-brand hover:underline">
          {t("View comparison →", "Voir la comparaison →")}
        </a>
        <span className="text-ink-faint text-[10px]">·</span>
        <a href="/v2/diagnostic" className="text-[10px] font-semibold text-ink-muted hover:underline">
          {t("Rescan now →", "Nouveau scan →")}
        </a>
      </div>
    </div>
  );
}

// ── RescanNudge — days-elapsed banner ────────────────────────────────────────
export function RescanNudge({ businessId, tier = "solo", lang = "en" }: RescanWidgetProps) {
  const { data, loading } = useComparisonHistory(businessId);
  const [dismissed, setDismissed] = useState(false);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  if (loading || dismissed) return null;

  const daysSince = data?.daysSinceLast;
  if (daysSince === null || daysSince === undefined) return null;

  const threshold = NUDGE_THRESHOLD[tier] ?? 28;
  if (daysSince < threshold) return null;

  const monthName = new Date().toLocaleDateString("en-CA", { month: "long" });

  return (
    <div className="rounded-xl border overflow-hidden mb-3"
      style={{ borderColor: "rgba(196,132,29,0.25)", background: "rgba(196,132,29,0.04)", animation: "fadeUp 0.3s ease-out both" }}>
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-base shrink-0">📅</span>
          <div>
            <p className="text-[12px] font-bold text-ink">
              {t(`It's been ${fmtDays(daysSince)} since your last scan`, `Votre dernier scan remonte à ${fmtDays(daysSince)}`)}
            </p>
            <p className="text-[10px] text-ink-faint mt-0.5">
              {t("Your score may have shifted. Run your monthly scan to track your progress.",
                 "Votre score a peut-être évolué. Lancez votre scan mensuel pour suivre vos progrès.")}
            </p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)}
          className="text-[10px] text-ink-faint hover:text-ink shrink-0 mt-0.5">✕</button>
      </div>
      <div className="px-4 pb-3">
        <a href="/v2/diagnostic"
          className="inline-block px-4 py-2 text-[11px] font-bold text-white rounded-lg hover:opacity-90 transition"
          style={{ background: "#1B3A2D" }}>
          {t(`Run your ${monthName} diagnostic →`, `Lancer le diagnostic de ${monthName} →`)}
        </a>
      </div>
    </div>
  );
}
