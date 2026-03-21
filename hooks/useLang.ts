// hooks/useLang.ts — shared language state synced via localStorage
"use client";
import { useState, useEffect, useCallback } from "react";

export type Lang = "en" | "fr";
const KEY = "fruxal_lang";

export function useLang() {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as Lang | null;
      if (stored === "en" || stored === "fr") { setLangState(stored); return; }
    } catch { /* non-fatal */ }
    // Fallback: browser locale
    try {
      if (navigator.language?.toLowerCase().startsWith("fr")) setLangState("fr");
    } catch { /* non-fatal */ }
    // Also read sessionStorage for backwards compat with prescan flow
    try {
      const s = sessionStorage.getItem("lg_prescan_lang") as Lang | null;
      if (s === "en" || s === "fr") setLangState(s);
    } catch { /* non-fatal */ }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* non-fatal */ }
    try { sessionStorage.setItem("lg_prescan_lang", l); } catch { /* non-fatal */ }
  }, []);

  const t = useCallback((en: string, fr: string) => lang === "fr" ? fr : en, [lang]);
  const isFR = lang === "fr";

  return { lang, setLang, t, isFR };
}
