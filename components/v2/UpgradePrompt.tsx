"use client";
// =============================================================================
// components/v2/UpgradePrompt.tsx
// Contingency model — no paid plans. Prompts user to book a recovery call.
// Bilingual (EN/FR) and country-aware (US/CA).
// =============================================================================
import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { getCountryFromCookie } from "@/lib/country";

interface UpgradePromptProps {
  feature?:      string;
  requiredPlan?: string;
  onDismiss?:    () => void;
}

const STEPS_EN_CA = [
  "We assign you a recovery expert",
  "Our accountant handles CRA filings and claims",
  "You pay nothing until money is recovered",
  "We take 12% of what we get back — you keep 88%",
];

const STEPS_FR = [
  "On vous assigne un expert en récupération",
  "Notre comptable s'occupe des réclamations auprès de l'ARC",
  "Vous ne payez rien avant récupération",
  "On prend 12% de ce qu'on récupère — vous gardez 88%",
];

const STEPS_EN_US = [
  "We assign you a recovery expert",
  "Our CPA handles IRS filings and claims",
  "You pay nothing until money is recovered",
  "We take 12% of what we get back — you keep 88%",
];

export function UpgradePrompt({ feature, onDismiss }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const { t, isFR } = useLang();
  const country = getCountryFromCookie();
  const isUS = country === "US";

  if (dismissed) return null;

  const handleDismiss = () => { setDismissed(true); onDismiss?.(); };
  const steps = isFR ? STEPS_FR : isUS ? STEPS_EN_US : STEPS_EN_CA;

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
          <div style={{ fontSize: 28, marginBottom: 8 }}>💰</div>
          <p style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
            {t("Ready to recover your money?", "Prêt à récupérer votre argent?")}
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {feature
              ? t(`${feature} — let our experts handle the recovery.`, `${feature} — laissez nos experts s'en occuper.`)
              : t("We do all the work. You keep 88%.", "On s'occupe de tout. Vous gardez 88%.")}
          </p>
        </div>

        <div style={{
          background: "var(--color-background-secondary, #f7f8fa)",
          borderRadius: 10, padding: "1rem", marginBottom: "1.25rem",
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>
            {t("How it works", "Comment ça marche")}
          </p>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#2D7A50", fontSize: 12, fontWeight: 700, width: 18, textAlign: "center" }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{step}</span>
            </div>
          ))}
        </div>

        <a href="/v2/recovery" style={{
          display: "block", width: "100%", padding: "0.75rem",
          background: "#1B3A2D", color: "#fff", textAlign: "center",
          borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14,
          marginBottom: 10,
        }}>
          {t("Book a Free Recovery Call →", "Réservez un appel de récupération gratuit →")}
        </a>
        <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", textAlign: "center", marginBottom: 10 }}>
          {t("No cost until we recover. We handle everything.", "Aucun frais avant récupération. On s'occupe de tout.")}
        </p>
        <button onClick={handleDismiss} style={{
          display: "block", width: "100%", padding: "0.6rem",
          background: "none", border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10, cursor: "pointer", fontSize: 13,
          color: "var(--color-text-secondary)",
        }}>
          {t("Not now", "Pas maintenant")}
        </button>
      </div>
    </div>
  );
}
