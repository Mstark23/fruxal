"use client";
// =============================================================================
// app/v2/benchmarks/page.tsx
// How does your business compare to peers in your industry?
//
// Shows 6 core metrics vs Canadian industry benchmarks.
// Data sources: Fruxal real customer data (when n≥5) OR seeded industry data.
// =============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BenchmarkMetric {
  metric_key:    string;
  metric_name:   string;
  unit:          string;
  lower_is_better: boolean;
  your_value:    number | null;
  effective_avg: number | null;
  effective_p75: number | null;
  sample_size:   number;
  confidence:    string;
  status:        string;
}

interface BenchmarkData {
  industry_slug:   string;
  province:        string;
  revenue_band:    string;
  benchmarks:      BenchmarkMetric[];
  total_contributions_in_industry: number;
  has_diagnostic:  boolean;
  diagnostic_score: number | null;
  diagnostic_date:  string | null;
}

const BAND_LABELS: Record<string, string> = {
  "0_150k":    "$0–$150K",
  "150k_500k": "$150K–$500K",
  "500k_1m":   "$500K–$1M",
  "1m_3m":     "$1M–$3M",
  "3m_10m":    "$3M–$10M",
  "10m_plus":  "$10M+",
};

const CONFIDENCE_BADGE: Record<string, { label: string; labelFr: string; color: string }> = {
  high:     { label: "High confidence",    labelFr: "Haute fiabilité",    color: "text-positive bg-positive/10" },
  medium:   { label: "Medium confidence",  labelFr: "Fiabilité moyenne",  color: "text-amber-600 bg-amber-500/10" },
  low:      { label: "Low confidence",     labelFr: "Faible fiabilité",   color: "text-orange-500 bg-orange-500/10" },
  estimate: { label: "Industry estimate",  labelFr: "Estimation secteur", color: "text-ink-muted bg-border-light" },
};

const STATUS_COLORS: Record<string, string> = {
  top_quartile: "text-positive",
  above_avg:    "text-brand-accent",
  below_avg:    "text-negative",
  unknown:      "text-ink-muted",
};

const STATUS_LABELS: Record<string, { en: string; fr: string }> = {
  top_quartile: { en: "Top 25%", fr: "Top 25 %" },
  above_avg:    { en: "Above avg", fr: "Au-dessus" },
  below_avg:    { en: "Below avg", fr: "En dessous" },
  unknown:      { en: "No data yet", fr: "Pas encore de données" },
};

function BarComparison({ metric, isFr }: { metric: BenchmarkMetric; isFr: boolean }) {
  const { your_value, effective_avg, effective_p75, unit, lower_is_better } = metric;

  if (!effective_avg && !effective_p75) {
    return (
      <div className="h-8 bg-border-light rounded-full flex items-center px-4">
        <span className="text-[11px] text-ink-muted">{isFr ? "Pas encore de données" : "No benchmark data yet"}</span>
      </div>
    );
  }

  const max = Math.max(
    (your_value ?? 0) * 1.3,
    (effective_p75 ?? 0) * 1.3,
    (effective_avg ?? 0) * 1.5,
    1
  );

  const fmt = (v: number | null) => v == null ? "—"
    : unit === "$" ? `$${Math.round(v).toLocaleString()}`
    : unit === "days" ? `${Math.round(v)}d`
    : `${v.toFixed(1)}%`;

  const pct = (v: number | null) => v == null ? 0 : Math.min(100, Math.round((v / max) * 100));

  return (
    <div className="space-y-2">
      {/* Bars */}
      {your_value != null && (
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-ink-muted w-24 text-right shrink-0">{isFr ? "Vous" : "You"}</span>
          <div className="flex-1 bg-border-light rounded-full h-5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                metric.status === "top_quartile" ? "bg-positive" :
                metric.status === "above_avg"    ? "bg-brand-accent" : "bg-negative"
              }`}
              style={{ width: `${pct(your_value)}%` }}
            />
          </div>
          <span className={`text-[12px] font-bold w-16 shrink-0 ${STATUS_COLORS[metric.status]}`}>{fmt(your_value)}</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-ink-muted w-24 text-right shrink-0">{isFr ? "Moyenne" : "Industry avg"}</span>
        <div className="flex-1 bg-border-light rounded-full h-5 overflow-hidden">
          <div className="h-full rounded-full bg-border" style={{ width: `${pct(effective_avg)}%` }} />
        </div>
        <span className="text-[12px] text-ink-muted w-16 shrink-0">{fmt(effective_avg)}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-ink-muted w-24 text-right shrink-0">{isFr ? "Top 25 %" : "Top 25%"}</span>
        <div className="flex-1 bg-border-light rounded-full h-5 overflow-hidden">
          <div className="h-full rounded-full bg-brand/30" style={{ width: `${pct(effective_p75)}%` }} />
        </div>
        <span className="text-[12px] text-ink-muted w-16 shrink-0">{fmt(effective_p75)}</span>
      </div>
    </div>
  );
}

export default function BenchmarksPage() {
  const router = useRouter();
  const [lang, setLang]       = useState<"en" | "fr">("en");
  const [data, setData]       = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const isFr = lang === "fr";
  const t = (en: string, fr: string) => isFr ? fr : en;

  useEffect(() => {
    try { const l = localStorage.getItem("fruxal_lang"); if (l === "fr") setLang("fr"); } catch {}
    fetch("/api/v2/benchmarks")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { if (d.success) setData(d.data); else setError(d.error); })
      .catch(() => setError("Failed to load benchmarks"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-ink-muted text-sm mb-4">{t("Run a diagnostic first to see your benchmarks.", "Lancez un diagnostic pour voir vos repères.")}</p>
        <button onClick={() => router.push("/v2/diagnostic")}
          className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-light transition">
          {t("Run diagnostic →", "Lancer le diagnostic →")}
        </button>
      </div>
    </div>
  );

  const confBadge = (confidence: string) => CONFIDENCE_BADGE[confidence] || CONFIDENCE_BADGE.estimate;
  const totalPeers = data.total_contributions_in_industry;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[860px] mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-serif text-[26px] text-ink font-normal">
              {t("Industry Benchmarks", "Repères de l'industrie")}
            </h1>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-brand-soft text-brand font-semibold">
              {data.province} · {BAND_LABELS[data.revenue_band] || data.revenue_band}
            </span>
          </div>
          <p className="text-sm text-ink-muted">
            {totalPeers >= 5
              ? t(
                  `Compared against ${totalPeers} Canadian businesses in your sector.`,
                  `Comparé à ${totalPeers} entreprises canadiennes de votre secteur.`
                )
              : t(
                  "Based on Canadian industry averages. More Fruxal users in your sector will make these more precise.",
                  "Basé sur les moyennes canadiennes. Plus d'utilisateurs Fruxal dans votre secteur amélioreront la précision."
                )
            }
          </p>
        </div>

        {/* No diagnostic banner */}
        {!data.has_diagnostic && (
          <div className="mb-6 p-4 rounded-xl border border-brand/20 bg-brand-soft">
            <p className="text-sm text-brand font-medium">
              {t(
                "Run a full diagnostic to see where you stand on each metric.",
                "Lancez un diagnostic complet pour voir votre position sur chaque indicateur."
              )}
            </p>
            <button onClick={() => router.push("/v2/diagnostic")}
              className="mt-2 text-[12px] font-bold text-brand underline">
              {t("Run diagnostic →", "Lancer le diagnostic →")}
            </button>
          </div>
        )}

        {/* Metric cards */}
        <div className="space-y-4">
          {data.benchmarks.map(metric => {
            const badge = confBadge(metric.confidence);
            return (
              <div key={metric.metric_key}
                className="bg-white border border-border-light rounded-2xl p-6"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink mb-0.5">{metric.metric_name}</h3>
                    <div className="flex items-center gap-2">
                      {metric.your_value != null && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                          {STATUS_LABELS[metric.status]?.[isFr ? "fr" : "en"]}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.color}`}>
                        {isFr ? badge.labelFr : badge.label}
                        {metric.sample_size > 0 ? ` · n=${metric.sample_size}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-ink-muted">{t("Your value", "Votre valeur")}</div>
                    <div className={`text-[20px] font-bold ${STATUS_COLORS[metric.status]}`}>
                      {metric.your_value != null
                        ? metric.unit === "$"
                          ? `$${Math.round(metric.your_value).toLocaleString()}`
                          : metric.unit === "days"
                          ? `${Math.round(metric.your_value)}d`
                          : `${metric.your_value.toFixed(1)}%`
                        : "—"
                      }
                    </div>
                  </div>
                </div>

                <BarComparison metric={metric} isFr={isFr} />

                {metric.lower_is_better && (
                  <p className="text-[10px] text-ink-muted mt-2">
                    {t("↓ Lower is better for this metric", "↓ Plus bas est mieux pour cet indicateur")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Flywheel note */}
        <div className="mt-8 p-5 rounded-2xl border border-border-light bg-white text-center">
          <p className="text-[13px] text-ink-muted leading-relaxed">
            {t(
              "These benchmarks improve as more Canadian businesses use Fruxal. Your anonymized metrics help make the platform more accurate for everyone.",
              "Ces repères s'améliorent à mesure que davantage d'entreprises canadiennes utilisent Fruxal. Vos données anonymisées aident à améliorer la précision pour tous."
            )}
          </p>
          {totalPeers < 20 && (
            <p className="text-[11px] text-ink-faint mt-2">
              {t(
                `${totalPeers} businesses in your sector so far. Share Fruxal to improve accuracy.`,
                `${totalPeers} entreprises dans votre secteur jusqu'à présent. Partagez Fruxal pour améliorer la précision.`
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
