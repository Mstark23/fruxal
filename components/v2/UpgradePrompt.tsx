"use client";
// =============================================================================
// components/v2/UpgradePrompt.tsx
// Shown when a user hits a gated feature — modal/banner
// =============================================================================
import { useState } from "react";

interface UpgradePromptProps {
  feature:      string;
  requiredPlan: string;
  onDismiss?:   () => void;
}

const PLAN_FEATURES: Record<string, string[]> = {
  default: [
    "Unlimited full diagnostics",
    "Month-over-month comparisons",
    "90-day goals & progress tracking",
    "AI advisor chat (unlimited)",
    "Personalized monthly brief",
    "Solutions library (33,000+ tools)",
  ],
};

export function UpgradePrompt({ feature, requiredPlan, onDismiss }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const handleDismiss = () => { setDismissed(true); onDismiss?.(); };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "1rem",
    }} onClick={handleDismiss}>
      <div style={{
        background: "var(--color-background-primary, #fff)",
        borderRadius: 16, padding: "1.75rem", maxWidth: 400, width: "100%",
        border: "0.5px solid var(--color-border-tertiary)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <p style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
            This feature requires an upgrade
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            <strong>{feature}</strong> is available on {requiredPlan} and above.
          </p>
        </div>

        <div style={{
          background: "var(--color-background-secondary, #f7f8fa)",
          borderRadius: 10, padding: "1rem", marginBottom: "1.25rem",
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>
            What&apos;s included
          </p>
          {PLAN_FEATURES.default.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#2D7A50", fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{f}</span>
            </div>
          ))}
        </div>

        <a href="/v2/checkout?plan=business" style={{
          display: "block", width: "100%", padding: "0.75rem",
          background: "#1B3A2D", color: "#fff", textAlign: "center",
          borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14,
          marginBottom: 10,
        }}>
          Upgrade now →
        </a>
        <button onClick={handleDismiss} style={{
          display: "block", width: "100%", padding: "0.6rem",
          background: "none", border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10, cursor: "pointer", fontSize: 13,
          color: "var(--color-text-secondary)",
        }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
