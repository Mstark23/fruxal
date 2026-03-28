"use client";
// =============================================================================
// components/v2/RecoveryCounter.tsx
// Three modes: hero (dashboard), compact (sidebar), milestone (popup on complete)
// Count-up animation via requestAnimationFrame — no external libs needed
// Listens for 'fruxal:task:completed' custom events across the page
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { MetricTooltip } from "@/components/v2/Tooltip";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RecoveryData {
  savings_recovered: number;
  savings_available: number;
  tasks_completed: number;
  tasks_open: number;
  monthly_delta: number;
  this_month_recovered: number;
  months_on_platform: number;
  annualized_savings: number;
  all_time_recovered: number;
}

export interface RecoveryCounterProps {
  businessId: string;
  mode: "hero" | "compact" | "milestone";
  lang?: "en" | "fr";
  onUpdate?: () => void;
}

// Cache: { businessId → { data, fetchedAt } }
const _cache = new Map<string, { data: RecoveryData; at: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Count-up animation ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(target);
  const prev = useRef(target);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (prev.current === target) return;
    const start = prev.current;
    const delta = target - start;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + delta * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else {
        setValue(target);
        prev.current = target;
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return "$" + Math.round(n ?? 0).toLocaleString();
}

// ── Main component ────────────────────────────────────────────────────────────
export function RecoveryCounter({ businessId, mode, lang = "en", onUpdate }: RecoveryCounterProps) {
  const [data, setData] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneAmount, setMilestoneAmount] = useState(0);
  const milestoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => (isFR ? fr : en);

  const animatedRecovered = useCountUp(data?.savings_recovered ?? 0);

  // ── Fetch recovery data ────────────────────────────────────────────────────
  const fetchRecovery = useCallback(async (force = false) => {
    if (!businessId) return;

    // Check cache
    const cached = _cache.get(businessId);
    if (!force && cached && Date.now() - cached.at < CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/v2/recovery?businessId=${businessId}`);
      if (!res.ok) return;
      const d: RecoveryData = await res.json();
      _cache.set(businessId, { data: d, at: Date.now() });
      setData(d);
      onUpdate?.();
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }, [businessId, onUpdate]);

  // ── Listen for task completion events ─────────────────────────────────────
  useEffect(() => {
    if (!businessId) return;
    fetchRecovery();

    function onTaskCompleted(e: Event) {
      const detail = (e as CustomEvent).detail as { savings_monthly?: number };
      const amount = detail?.savings_monthly ?? 0;

      // Bust cache and refetch
      _cache.delete(businessId);
      fetchRecovery(true);

      // Show milestone popup for milestone mode or if amount > 0
      if (mode === "milestone" || (amount > 0 && mode !== "compact")) {
        setMilestoneAmount(amount);
        setShowMilestone(true);
        if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
        milestoneTimer.current = setTimeout(() => setShowMilestone(false), 4000);
      }
    }

    window.addEventListener("fruxal:task:completed", onTaskCompleted);
    return () => {
      window.removeEventListener("fruxal:task:completed", onTaskCompleted);
      if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
    };
  }, [businessId, fetchRecovery, mode]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    if (mode === "compact") {
      return <div className="h-4 w-32 bg-bg-section rounded animate-pulse" />;
    }
    return (
      <div className="rounded-xl border border-border-light bg-white p-4 animate-pulse"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="h-3 w-24 bg-bg-section rounded mb-3" />
        <div className="h-8 w-32 bg-bg-section rounded mb-2" />
        <div className="h-3 w-40 bg-bg-section rounded" />
      </div>
    );
  }

  // ── Milestone popup (MODE C) ───────────────────────────────────────────────
  if (mode === "milestone") {
    if (!showMilestone) return null;
    return (
      <div
        className="fixed bottom-6 right-4 left-4 sm:left-auto sm:w-80 z-50 animate-in"
        style={{
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <div className="rounded-xl p-4 shadow-xl"
          style={{ background: "#1B3A2D", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[12px] font-bold text-white/70 mb-1">
                ✅ {t("Fix confirmed", "Correctif confirmé")}
              </p>
              {milestoneAmount > 0 && (
                <p className="text-[15px] font-black text-white">
                  {fmt(milestoneAmount)}/{t("month added to your recovery", "mois ajouté à votre récupération")}
                </p>
              )}
              {data && data.savings_recovered > 0 && (
                <p className="text-[11px] text-white/60 mt-1">
                  {t("Total recovered:", "Total récupéré :")} {fmt(data.savings_recovered)}/{t("mo", "mois")}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowMilestone(false)}
              className="text-white/75 hover:text-white/70 transition text-[18px] leading-none"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Compact mode (MODE B — sidebar) ───────────────────────────────────────
  if (mode === "compact") {
    if (!data || data.savings_recovered === 0) return null;
    return (
      <div className="px-3 py-2 rounded-md mx-3 mb-2"
        style={{ background: "rgba(45,122,80,0.06)", border: "1px solid rgba(45,122,80,0.12)" }}>
        <p className="text-[11px] font-bold text-positive uppercase tracking-wider mb-0.5">
          💰 {t("Recovered", "Récupéré")}<MetricTooltip id="recovery_counter" lang={lang} size={12} />
        </p>
        <p className="text-[13px] font-black text-positive">
          {fmt(animatedRecovered)}/{t("mo", "mois")}
        </p>
        {data.savings_available > 0 && (
          <p className="text-[11px] text-ink-faint mt-0.5">
            {fmt(data.savings_available)} {t("available", "disponible")}
          </p>
        )}
      </div>
    );
  }

  // ── Hero mode (MODE A — dashboard) ────────────────────────────────────────
  const annualizedAnimated = useCountUp(data?.annualized_savings ?? 0);
  const animatedDisplay = viewMode === "year" ? annualizedAnimated : animatedRecovered;

  // Zero state
  if (!data || data.savings_recovered === 0) {
    return (
      <div className="rounded-xl border border-border-light bg-white p-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
            💰 {t("Recovery", "Récupération")}
          </span>
        </div>
        <p className="text-[12px] text-ink-muted leading-snug">
          {t(
            "Your first fix will appear here. Start with your easiest task.",
            "Votre premier correctif apparaîtra ici. Commencez par la tâche la plus facile."
          )}
        </p>
        {(data?.savings_available ?? 0) > 0 && (
          <p className="text-[11px] font-semibold mt-2" style={{ color: "#1B3A2D" }}>
            {fmt(data?.savings_available ?? 0)}/{t("mo available to capture →", "mois disponibles →")}
          </p>
        )}
      </div>
    );
  }

  const deltaPositive = (data.monthly_delta ?? 0) >= 0;

  return (
    <div className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: "rgba(45,122,80,0.15)", boxShadow: "0 1px 6px rgba(45,122,80,0.06)" }}>

      {/* Top strip */}
      <div className="px-4 pt-3.5 pb-3 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-positive uppercase tracking-wider">
              💰 {t("Total Recovered", "Total récupéré")}<MetricTooltip id="recovery_counter" lang={lang} size={12} />
            </span>
            {data.tasks_completed > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: "rgba(45,122,80,0.08)", color: "#2D7A50" }}>
                {data.tasks_completed} {t("fix", "correctif")}{data.tasks_completed !== 1 ? (isFR ? "s" : "es") : ""}
              </span>
            )}
          </div>

          {/* Main number with toggle */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => setViewMode(v => v === "month" ? "year" : "month")}
              title={t("Click to toggle month/year view", "Cliquez pour basculer mois/année")}
              className="group text-left"
            >
              <span className="font-black tabular-nums leading-none group-hover:opacity-80 transition"
                style={{ fontSize: "28px", color: "#1B3A2D" }}>
                {fmt(animatedDisplay)}
              </span>
              <span className="text-[11px] font-medium ml-1"
                style={{ color: "#2D7A50" }}>
                /{viewMode === "year" ? t("yr", "an") : t("mo", "mois")} ↕
              </span>
            </button>
          </div>

          {/* Delta */}
          {data.monthly_delta !== 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-bold"
                style={{ color: deltaPositive ? "#2D7A50" : "#B34040" }}>
                {deltaPositive ? "↑" : "↓"} {fmt(Math.abs(data.monthly_delta ?? 0))}
              </span>
              <span className="text-[10px] text-ink-faint">
                {t("vs last month", "vs mois dernier")}
              </span>
            </div>
          )}
        </div>

        {/* Available */}
        {data.savings_available > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-0.5">
              {t("Still available", "Encore disponible")}
            </p>
            <a href="/v2/recovery"
              className="font-black tabular-nums text-ink hover:text-brand transition"
              style={{ fontSize: "18px" }}>
              {fmt(data.savings_available)}
            </a>
            <p className="text-[11px] text-ink-faint">/{t("mo →", "mois →")}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {data.savings_available > 0 && (
        <div className="px-4 pb-3.5">
          <div className="flex justify-between text-[11px] text-ink-muted mb-1">
            <span>{t("Recovered", "Récupéré")}</span>
            <span>{t("Available", "Disponible")}</span>
          </div>
          <div className="h-1.5 bg-bg-section rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.round(
                  ((data.savings_recovered ?? 0) /
                    Math.max((data.savings_recovered ?? 0) + (data.savings_available ?? 0), 1)) * 100
                )}%`,
                background: "linear-gradient(90deg, #2D7A50, #1B3A2D)",
              }}
            />
          </div>
          {data.months_on_platform > 0 && (
            <p className="text-[11px] text-ink-muted mt-1.5">
              {t(`Based on ${data.tasks_completed} completed fix${data.tasks_completed !== 1 ? "es" : ""} · ${data.months_on_platform} month${data.months_on_platform !== 1 ? "s" : ""} on platform`,
                `Basé sur ${data.tasks_completed} correctif${data.tasks_completed !== 1 ? "s" : ""} · ${data.months_on_platform} mois sur la plateforme`)}
            </p>
          )}
        </div>
      )}

      {/* Milestone toast: shown inline in hero mode when a task completes */}
      {showMilestone && milestoneAmount > 0 && (
        <div className="border-t px-4 py-2.5 flex items-center gap-2"
          style={{ borderColor: "rgba(45,122,80,0.12)", background: "rgba(45,122,80,0.04)" }}>
          <span className="text-positive font-bold text-[11px]">
            ✅ +{fmt(milestoneAmount)}/{t("mo added to recovery", "mois ajouté")}
          </span>
        </div>
      )}
    </div>
  );
}

