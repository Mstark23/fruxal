// components/ui/LangToggle.tsx
"use client";
import { Lang } from "@/hooks/useLang";

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** "light" = white pill on dark bg (chat panel), "dark" = border pill on light bg (nav) */
  variant?: "light" | "dark";
}

export function LangToggle({ lang, setLang, variant = "dark" }: Props) {
  const isDark = variant === "dark";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2, padding: 3,
      background: isDark ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
      borderRadius: 8, border: isDark ? "1px solid rgba(0,0,0,0.08)" : "none",
    }}>
      {(["en", "fr"] as Lang[]).map(l => (
        <button key={l} onClick={() => setLang(l)}
          style={{
            padding: "3px 10px", fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.04em",
            color: lang === l
              ? (isDark ? "#1a1a2e" : "#1B3A2D")
              : (isDark ? "#9ca3af" : "rgba(255,255,255,0.55)"),
            background: lang === l ? "white" : "transparent",
            border: "none", borderRadius: 6, cursor: "pointer",
            boxShadow: lang === l ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
            transition: "all 0.15s",
          }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
