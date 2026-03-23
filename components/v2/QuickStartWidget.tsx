"use client";
// =============================================================================
// components/v2/QuickStartWidget.tsx
// Floating bottom-right button with progress ring that opens a checklist panel.
// Shows 5 onboarding steps, marks each done based on real DB data.
// Dismisses when all steps are complete. Remembers open/closed state.
// =============================================================================

import { useState, useEffect } from "react";

interface Step {
  id: string; label: string; label_fr: string;
  description: string; desc_fr: string;
  href: string; done: boolean; points: number;
}

interface Props { businessId: string; lang?: "en" | "fr"; }

// SVG progress ring
function Ring({ pct }: { pct: number }) {
  const r = 18, c = 2 * Math.PI * r;
  const dash = c * (pct / 100);
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3.5"/>
      <circle cx="24" cy="24" r={r} fill="none" stroke="white" strokeWidth="3.5"
        strokeDasharray={`${dash} ${c}`} strokeDashoffset={c / 4}
        strokeLinecap="round" style={{ transition: "stroke-dasharray .5s ease" }}/>
      <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export function QuickStartWidget({ businessId, lang = "en" }: Props) {
  const [open, setOpen]       = useState(false);
  const [steps, setSteps]     = useState<Step[]>([]);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal]     = useState(5);
  const [allDone, setAllDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  useEffect(() => {
    if (!businessId) return;
    // Check if user dismissed
    try {
      if (localStorage.getItem("fruxal_qs_dismissed") === "1") { setDismissed(true); return; }
    } catch { /* noop */ }

    fetch(`/api/v2/quickstart?businessId=${businessId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setSteps(d.steps ?? []);
        setProgress(d.progress ?? 0);
        setCompleted(d.completed ?? 0);
        setTotal(d.total ?? 5);
        setAllDone(d.allDone ?? false);
      })
      .catch(() => {});
  }, [businessId]);

  const handleDismiss = () => {
    try { localStorage.setItem("fruxal_qs_dismissed", "1"); } catch { /* noop */ }
    setDismissed(true);
    setOpen(false);
  };

  // Hide if dismissed or all done (with 1 day grace)
  if (dismissed) return null;
  if (allDone && completed >= total) return null;
  if (steps.length === 0) return null;

  return (
    <>
      {/* Floating panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: "calc(72px + 64px + 8px)", right: 16, width: "min(320px, calc(100vw - 32px))", zIndex: 999,
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: "#1B3A2D", padding: "14px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>
                {t("Getting started", "Premiers pas")}
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: "2px 0 0" }}>
                {completed}/{total} {t("steps complete", "étapes complétées")}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                background: "rgba(255,255,255,0.12)", borderRadius: 99,
                padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "white",
              }}>
                {Math.round(progress)}%
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6,
                color: "white", cursor: "pointer", padding: "4px 6px", fontSize: 14, lineHeight: 1,
              }}>×</button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: "rgba(27,58,45,0.08)" }}>
            <div style={{
              height: "100%", background: "#2D7A50", width: `${progress}%`,
              transition: "width .5s ease", borderRadius: 99,
            }}/>
          </div>

          {/* Steps */}
          <div style={{ padding: "8px 0" }}>
            {steps.map((step, i) => (
              <a key={step.id} href={step.done ? undefined : step.href}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 16px", textDecoration: "none",
                  cursor: step.done ? "default" : "pointer",
                  opacity: step.done ? 0.6 : 1,
                  background: step.done ? "transparent" : "transparent",
                  transition: "background .15s",
                }}
                onMouseEnter={e => { if (!step.done) (e.currentTarget as HTMLElement).style.background = "var(--color-background-secondary)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {/* Step indicator */}
                <div style={{
                  width: 24, height: 24, borderRadius: 12, flexShrink: 0, marginTop: 1,
                  background: step.done ? "#2D7A50" : "var(--color-background-secondary)",
                  border: step.done ? "none" : "1.5px solid var(--color-border-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {step.done
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-secondary)" }}>{i + 1}</span>
                  }
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: step.done ? 400 : 500,
                    color: step.done ? "var(--color-text-secondary)" : "var(--color-text-primary)",
                    margin: 0, lineHeight: 1.3,
                    textDecoration: step.done ? "line-through" : "none",
                  }}>
                    {isFR ? step.label_fr : step.label}
                  </p>
                  {!step.done && (
                    <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                      {isFR ? step.desc_fr : step.description}
                    </p>
                  )}
                </div>
                {/* Arrow */}
                {!step.done && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 4 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                )}
              </a>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: "10px 16px", borderTop: "0.5px solid var(--color-border-tertiary)",
            display: "flex", justifyContent: "flex-end",
          }}>
            <button onClick={handleDismiss} style={{
              background: "none", border: "none", fontSize: 11,
              color: "var(--color-text-secondary)", cursor: "pointer",
              textDecoration: "underline",
            }}>
              {t("Dismiss", "Fermer")}
            </button>
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title={t("Getting started", "Premiers pas")}
        style={{
          position: "fixed", bottom: "calc(72px + 16px)", right: 16, zIndex: 1000,
        // On lg screens the bottom nav is hidden, so revert (handled via className below)
          width: 56, height: 56, borderRadius: 28,
          background: "#1B3A2D", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(27,58,45,0.35)",
          transition: "transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.06)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(27,58,45,0.45)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(27,58,45,0.35)";
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <Ring pct={progress} />
        )}
      </button>
    </>
  );
}
