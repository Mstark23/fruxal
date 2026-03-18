// =============================================================================
// i18n — Internationalization (English + French)
// =============================================================================
// Usage: import { t, useLocale } from "@/lib/i18n";
//        t("hero.title") → "Your business is leaking money."
// =============================================================================

const translations: Record<string, Record<string, string>> = {
  en: {
    // Landing
    "hero.title": "Your business is leaking money.",
    "hero.subtitle": "Answer a few questions. We'll show you exactly how much you're losing per year — and how to fix every dollar of it.",
    "hero.cta": "Find My Leaks — It's Free →",
    "hero.no_cc": "No credit card · No QuickBooks needed · See 3 leaks free",
    "nav.login": "Log In",
    "nav.free_scan": "Free Scan →",
    "how.title": "How it works",
    "how.subtitle": "Four steps. Under a minute. Real money found.",
    "pricing.title": "Simple pricing",
    "pricing.subtitle": "Start free. Upgrade when you see the number.",
    "cta.title": "Stop leaking. Start growing.",
    "cta.subtitle": "Every day you wait costs money. The scan takes 30 seconds.",
    // Dashboard
    "dash.leaking": "Leaking",
    "dash.saved": "Saved",
    "dash.health": "Health Score",
    "dash.fix_next": "Fix next",
    "dash.all_leaks": "All Leaks",
    "dash.fix_list": "Fix List",
    "dash.intelligence": "Intelligence",
    "dash.reports": "Reports",
    "dash.trends": "Trends",
    "dash.team": "Team",
    "dash.settings": "Settings",
    "dash.upgrade": "Upgrade to Pro",
    // Common
    "common.loading": "Loading...",
    "common.save": "Save Changes",
    "common.cancel": "Cancel",
    "common.back": "← Back",
    "common.year": "/yr",
    "common.month": "/mo",
  },
  fr: {
    // Landing
    "hero.title": "Votre entreprise perd de l'argent.",
    "hero.subtitle": "Répondez à quelques questions. Nous vous montrerons exactement combien vous perdez par an — et comment récupérer chaque dollar.",
    "hero.cta": "Trouver mes fuites — C'est gratuit →",
    "hero.no_cc": "Sans carte de crédit · Sans QuickBooks · 3 fuites gratuites",
    "nav.login": "Connexion",
    "nav.free_scan": "Scan gratuit →",
    "how.title": "Comment ça marche",
    "how.subtitle": "Quatre étapes. Moins d'une minute. De l'argent réel trouvé.",
    "pricing.title": "Tarification simple",
    "pricing.subtitle": "Commencez gratuitement. Passez au Pro quand vous voyez le chiffre.",
    "cta.title": "Arrêtez de fuir. Commencez à grandir.",
    "cta.subtitle": "Chaque jour d'attente vous coûte de l'argent. Le scan prend 30 secondes.",
    // Dashboard
    "dash.leaking": "En fuite",
    "dash.saved": "Économisé",
    "dash.health": "Score de santé",
    "dash.fix_next": "Réparer ensuite",
    "dash.all_leaks": "Toutes les fuites",
    "dash.fix_list": "Liste de réparations",
    "dash.intelligence": "Intelligence",
    "dash.reports": "Rapports",
    "dash.trends": "Tendances",
    "dash.team": "Équipe",
    "dash.settings": "Paramètres",
    "dash.upgrade": "Passer au Pro",
    // Common
    "common.loading": "Chargement...",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.back": "← Retour",
    "common.year": "/an",
    "common.month": "/mois",
  },
};

let currentLocale = "en";

export function setLocale(locale: string) {
  currentLocale = locale;
  if (typeof window !== "undefined") localStorage.setItem("locale", locale);
}

export function getLocale(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("locale") || "en";
  }
  return currentLocale;
}

export function t(key: string, locale?: string): string {
  const lang = locale || getLocale();
  return translations[lang]?.[key] || translations.en[key] || key;
}

export function getAvailableLocales() {
  return [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];
}
