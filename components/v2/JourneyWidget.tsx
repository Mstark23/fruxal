"use client";
// =============================================================================
// components/v2/JourneyWidget.tsx
// Compact "Your Journey" dashboard widget — fetches from /api/v2/history
// Tier-aware display: solo=minimal, business=full, enterprise=with value estimate
// =============================================================================
import { useState, useEffect } from "react";

interface JourneyWidgetProps {
  businessId: string;
  tier?: "solo" | "business" | "enterprise";
  lang?: "en" | "fr";
}

interface Stats {
  totalDaysOnPlatform: number;
  totalSavingsRecovered: number;
  totalSavingsAnnualized: number;
  scoreImprovement: number;
  firstScore: number;
  latestScore: number;
  tasksCompleted: number;
  goalsCompleted: number;
  estimatedBusinessValueAdded: number;
}

function fmt(n: number) { return "$" + Math.round(n ?? 0).toLocaleString(); }

export function JourneyWidget({ businessId, tier = "solo", lang = "en" }: JourneyWidgetProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/v2/history?businessId=${businessId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.stats) setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading || !stats || stats.totalDaysOnPlatform === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">📈</span>
            <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
              {t("Your Journey", "Votre parcours")} — {stats.totalDaysOnPlatform} {t("days", "jours")}
            </span>
          </div>
          <a href="/v2/history" className="text-[9px] font-bold text-brand hover:underline">
            {t("View history →", "Voir l\'historique →")}
          </a>
        </div>

        {tier === "solo" && (
          <p className="text-[11px] text-ink">
            <span className="font-semibold">
              {t("Score", "Score")}:{" "}
              <span style={{ color: stats.scoreImprovement > 0 ? "#2D7A50" : "#8E8C85" }}>
                {stats.firstScore} → {stats.latestScore}
              </span>
            </span>
            {stats.totalSavingsRecovered > 0 && (
              <span className="text-ink-faint ml-2">
                {t(`Recovered: ${fmt(stats.totalSavingsRecovered)}/mo`, `Récupéré : ${fmt(stats.totalSavingsRecovered)}/mois`)}
              </span>
            )}
          </p>
        )}

        {tier === "business" && (
          <div className="space-y-0.5">
            <p className="text-[11px] text-ink">
              {t(`Score improved ${stats.scoreImprovement > 0 ? "+" : ""}${stats.scoreImprovement} points`, `Score amélioré de ${stats.scoreImprovement > 0 ? "+" : ""}${stats.scoreImprovement} points`)}
            </p>
            {stats.totalSavingsRecovered > 0 && (
              <p className="text-[11px] text-positive font-semibold">
                {fmt(stats.totalSavingsRecovered)}/month recovered
                <span className="text-ink-faint font-normal ml-1">({fmt(stats.totalSavingsAnnualized)}/yr)</span>
              </p>
            )}
            <p className="text-[10px] text-ink-faint">
              {stats.tasksCompleted} {t("tasks completed", "tâches complétées")}
              {stats.goalsCompleted > 0 && ` · ${stats.goalsCompleted} ${t("goal", "objectif")}${stats.goalsCompleted !== 1 ? "s" : ""} ${t("reached", "atteint")}${stats.goalsCompleted !== 1 && isFR ? "s" : ""}`}
            </p>
          </div>
        )}

        {tier === "enterprise" && (
          <div className="space-y-0.5">
            <p className="text-[11px] text-ink">
              {stats.totalDaysOnPlatform} days · Score: {stats.scoreImprovement > 0 ? "+" : ""}{stats.scoreImprovement} · {fmt(stats.totalSavingsRecovered)}/mo rec
            </p>
            {stats.estimatedBusinessValueAdded > 0 && (
              <p className="text-[10px] text-ink-faint">
                Est. ~{fmt(stats.estimatedBusinessValueAdded)} in recovered savings over 24 months
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
