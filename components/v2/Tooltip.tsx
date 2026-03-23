"use client";
// =============================================================================
// components/v2/Tooltip.tsx
// Lightweight hover tooltip for metric explanations.
// Usage: <Tooltip text="What this means">
//          <span>Hover me</span>
//        </Tooltip>
// Or inline: <MetricTooltip id="health_score" />
// =============================================================================

import { useState, useRef, useEffect } from "react";

// ── Base tooltip wrapper ──────────────────────────────────────────────────────
interface TooltipProps {
  text:       string;
  children:   React.ReactNode;
  position?:  "top" | "bottom" | "left" | "right";
  maxWidth?:  number;
}

export function Tooltip({ text, children, position = "top", maxWidth = 240 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const pos: React.CSSProperties = position === "top"
    ? { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" }
    : position === "bottom"
    ? { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" }
    : position === "left"
    ? { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" }
    : { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" };

  return (
    <div
      ref={ref}
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: "absolute", zIndex: 9999,
          ...pos,
          maxWidth, width: "max-content",
          background: "#1A1A18",
          color: "#F5F4F2",
          fontSize: 12, lineHeight: 1.5,
          padding: "7px 10px",
          borderRadius: 8,
          pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          whiteSpace: "pre-wrap",
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

// ── Question mark icon ────────────────────────────────────────────────────────
function QuestionIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

// ── Pre-built metric tooltips ─────────────────────────────────────────────────
const METRIC_TOOLTIPS: Record<string, { en: string; fr: string }> = {
  health_score: {
    en: "Your financial health score (0–100) measures how efficiently your business manages money. Under 50 = urgent leaks. 50–69 = common for unreviewed businesses. 70+ = well-run. Updates as you complete fixes.",
    fr: "Votre score de santé financière (0–100) mesure l'efficacité de gestion. Moins de 50 = fuites urgentes. 50–69 = courant. 70+ = bien géré. Se met à jour avec chaque correction.",
  },
  recovery_counter: {
    en: "Total monthly savings you've confirmed by completing tasks. Every task you mark done adds to this number. The annualized amount shows the yearly impact of your fixes.",
    fr: "Économies mensuelles confirmées par vos tâches complétées. Chaque tâche ajoutée augmente ce chiffre. Le montant annualisé montre l'impact annuel de vos corrections.",
  },
  total_leak: {
    en: "Estimated monthly amount your business is losing through inefficiencies, overpriced services, and missed optimizations. Based on your revenue and industry benchmarks.",
    fr: "Montant mensuel estimé perdu en inefficacités et services trop coûteux. Basé sur vos revenus et les références de votre secteur.",
  },
  savings_available: {
    en: "Monthly savings you could recover by completing your open tasks. This is money still available — it decreases as you complete fixes.",
    fr: "Économies mensuelles disponibles en complétant vos tâches ouvertes. Ce montant diminue à mesure que vous effectuez vos corrections.",
  },
  annualized_savings: {
    en: "Your recovered savings multiplied by 12 — the yearly value of fixes you've already made. This is real money staying in your business.",
    fr: "Vos économies récupérées multipliées par 12 — la valeur annuelle des corrections déjà effectuées.",
  },
  score_delta: {
    en: "Change in your health score since your last diagnostic. A positive number means your fixes are working. Run a new diagnostic to see your updated score.",
    fr: "Évolution de votre score depuis votre dernier diagnostic. Un nombre positif signifie que vos corrections fonctionnent.",
  },
  task_bonus: {
    en: "Points added to your health score for completing high-value tasks. Each completed task worth more than $300/month adds extra points.",
    fr: "Points ajoutés à votre score pour les tâches à haute valeur complétées. Chaque tâche de plus de 300$/mois ajoute des points.",
  },
  deadline_penalty: {
    en: "Points deducted from your score for upcoming or missed deadlines. Fix these first — penalties increase as deadlines pass.",
    fr: "Points déduits pour les échéances manquées ou imminentes. Traitez-les en premier — les pénalités augmentent avec le temps.",
  },
  prescan_score: {
    en: "A quick estimate based on your 5-question prescan. Run your full diagnostic for a precise score based on your actual financials.",
    fr: "Une estimation rapide basée sur votre prescan de 5 questions. Lancez le diagnostic complet pour un score précis.",
  },
  mrr: {
    en: "Monthly Recurring Revenue — the predictable monthly income from your active paid subscriptions.",
    fr: "Revenu mensuel récurrent — le revenu mensuel prévisible de vos abonnements actifs.",
  },
  goals_progress: {
    en: "Progress toward your 90-day savings goal. The bar fills as you complete tasks that recover money. On pace means you'll hit your target by the deadline.",
    fr: "Progression vers votre objectif d'épargne de 90 jours. La barre se remplit à mesure que vous complétez des tâches.",
  },
};

// ── MetricTooltip — drop-in ? icon with built-in content ─────────────────────
interface MetricTooltipProps {
  id:        keyof typeof METRIC_TOOLTIPS;
  lang?:     "en" | "fr";
  size?:     number;
  position?: "top" | "bottom" | "left" | "right";
}

export function MetricTooltip({ id, lang = "en", size = 13, position = "top" }: MetricTooltipProps) {
  const tip = METRIC_TOOLTIPS[id];
  if (!tip) return null;
  const text = lang === "fr" ? tip.fr : tip.en;

  return (
    <Tooltip text={text} position={position} maxWidth={260}>
      <span style={{
        color: "var(--color-text-secondary)",
        cursor: "help",
        display: "inline-flex",
        alignItems: "center",
        marginLeft: 4,
        opacity: 0.6,
        transition: "opacity .15s",
      }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.6"}
      >
        <QuestionIcon size={size} />
      </span>
    </Tooltip>
  );
}
