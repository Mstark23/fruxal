"use client";
// =============================================================================
// app/v2/quickstart/page.tsx
// Full-page onboarding checklist at /v2/quickstart
// =============================================================================

import { useState, useEffect } from "react";

interface Step {
  id: string; label: string; label_fr: string;
  description: string; desc_fr: string;
  href: string; done: boolean; points: number;
}

function StepCard({ step, index, isFR }: { step: Step; index: number; isFR: boolean }) {
  const label = isFR ? step.label_fr : step.label;
  const desc  = isFR ? step.desc_fr  : step.description;

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: `1.5px solid ${step.done ? "#2D7A50" : "var(--color-border-tertiary)"}`,
      borderRadius: 16, padding: "1.25rem 1.5rem",
      display: "flex", alignItems: "flex-start", gap: 16,
      opacity: step.done ? 0.75 : 1,
      transition: "border-color .2s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    }}>
      {/* Number / check */}
      <div style={{
        width: 40, height: 40, borderRadius: 20, flexShrink: 0,
        background: step.done ? "#2D7A50" : "var(--color-background-secondary)",
        border: step.done ? "none" : "1.5px solid var(--color-border-secondary)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {step.done
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          : <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-secondary)" }}>{index + 1}</span>
        }
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 15, fontWeight: 500, margin: "0 0 4px",
          color: "var(--color-text-primary)",
          textDecoration: step.done ? "line-through" : "none",
        }}>
          {label}
        </p>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>{desc}</p>
      </div>

      {/* CTA */}
      {step.done ? (
        <span style={{
          fontSize: 11, fontWeight: 600, color: "#2D7A50",
          background: "rgba(45,122,80,0.08)", padding: "4px 10px",
          borderRadius: 99, flexShrink: 0, marginTop: 4,
        }}>
          Done ✓
        </span>
      ) : (
        <a href={step.href} style={{
          flexShrink: 0, marginTop: 4,
          fontSize: 12, fontWeight: 600, color: "white",
          background: "#1B3A2D", padding: "6px 14px",
          borderRadius: 8, textDecoration: "none",
          whiteSpace: "nowrap",
        }}>
          {isFR ? "Commencer →" : "Start →"}
        </a>
      )}
    </div>
  );
}

export default function QuickStartPage() {
  const [steps, setSteps]       = useState<Step[]>([]);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal]       = useState(5);
  const [loading, setLoading]   = useState(true);
  const [lang, setLang]         = useState<"en" | "fr">("en");
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  useEffect(() => {
    // Detect language
    try {
      const l = localStorage.getItem("fruxal_lang");
      if (l === "fr") setLang("fr");
    } catch { /* noop */ }

    // Get businessId from dashboard
    fetch("/api/v2/dashboard")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const bid = d?.data?.businessId;
        if (!bid) { setLoading(false); return; }
        return fetch(`/api/v2/quickstart?businessId=${bid}`);
      })
      .then(r => r?.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setSteps(d.steps ?? []);
          setProgress(d.progress ?? 0);
          setCompleted(d.completed ?? 0);
          setTotal(d.total ?? 5);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "3rem", display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 24, height: 24, border: "2px solid var(--color-border-secondary)",
          borderTopColor: "#1B3A2D", borderRadius: 12,
          animation: "spin .7s linear infinite",
        }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
          {t("Getting started", "Premiers pas")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: "1.25rem" }}>
          {t(
            "Complete these steps to get the most out of Fruxal.",
            "Complétez ces étapes pour tirer le maximum de Fruxal."
          )}
        </p>

        {/* Progress bar */}
        <div style={{
          background: "var(--color-background-secondary)", borderRadius: 99,
          height: 8, overflow: "hidden", marginBottom: 6,
        }}>
          <div style={{
            height: "100%", background: "#1B3A2D", width: `${progress}%`,
            borderRadius: 99, transition: "width .5s ease",
          }}/>
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {completed}/{total} {t("steps complete", "étapes complétées")} · {Math.round(progress)}%
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((step, i) => (
          <StepCard key={step.id} step={step} index={i} isFR={isFR} />
        ))}
      </div>

      {/* All done state */}
      {completed === total && total > 0 && (
        <div style={{
          marginTop: "2rem", padding: "1.5rem", textAlign: "center",
          background: "rgba(45,122,80,0.05)", border: "1px solid rgba(45,122,80,0.2)",
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#1B3A2D", marginBottom: 4 }}>
            {t("You're all set!", "Vous êtes prêt !")}
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {t(
              "You've completed all onboarding steps. Your financial recovery is underway.",
              "Vous avez complété toutes les étapes. Votre récupération financière est en cours."
            )}
          </p>
        </div>
      )}
    </div>
  );
}
