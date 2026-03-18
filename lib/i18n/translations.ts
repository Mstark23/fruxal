// =============================================================================
// i18n — Simple English/French translations for V2 UI
// =============================================================================
// Usage: import { t } from "@/lib/i18n/translations";
//        t("dashboard.title", "fr") → "Tableau de bord"
// =============================================================================

const translations: Record<string, Record<string, string>> = {
  // ─── Dashboard ──────────────────────────────────────────────────────────
  "dashboard.title": {
    en: "Your Leak Recovery Plan",
    fr: "Votre plan de récupération",
  },
  "dashboard.left_to_recover": {
    en: "left to recover",
    fr: "à récupérer",
  },
  "dashboard.fixed": {
    en: "fixed",
    fr: "corrigé",
  },
  "dashboard.in_progress": {
    en: "in progress",
    fr: "en cours",
  },
  "dashboard.remaining": {
    en: "remaining",
    fr: "restant",
  },
  "dashboard.do_this_week": {
    en: "Do This Week",
    fr: "À faire cette semaine",
  },
  "dashboard.do_this_month": {
    en: "Do This Month",
    fr: "À faire ce mois-ci",
  },
  "dashboard.later": {
    en: "Later",
    fr: "Plus tard",
  },
  "dashboard.completed": {
    en: "Completed",
    fr: "Complété",
  },
  "dashboard.skipped": {
    en: "Skipped",
    fr: "Ignoré",
  },
  "dashboard.quick_wins": {
    en: "Quick wins — biggest savings for least effort",
    fr: "Gains rapides — les plus grosses économies pour le moins d'effort",
  },
  "dashboard.connect_title": {
    en: "Find hidden leaks with exact numbers",
    fr: "Trouvez des fuites cachées avec des chiffres exacts",
  },
  "dashboard.connect_desc": {
    en: "Connect your accounts to find 2-3x more savings with exact dollar amounts from real data.",
    fr: "Connectez vos comptes pour trouver 2-3x plus d'économies avec des montants exacts.",
  },
  "dashboard.connect_qb": {
    en: "Connect QuickBooks",
    fr: "Connecter QuickBooks",
  },
  "dashboard.upload_contract": {
    en: "Upload Contract",
    fr: "Téléverser un contrat",
  },
  "dashboard.talk_to_ai": {
    en: "Talk to AI Advisor",
    fr: "Parler au conseiller IA",
  },

  // ─── Chat ───────────────────────────────────────────────────────────────
  "chat.title": {
    en: "AI Business Advisor",
    fr: "Conseiller d'affaires IA",
  },
  "chat.specialist": {
    en: "specialist",
    fr: "spécialiste",
  },
  "chat.leaks_found": {
    en: "leaks found",
    fr: "fuites trouvées",
  },
  "chat.placeholder": {
    en: "Ask about your leaks, fixes, or tools...",
    fr: "Posez vos questions sur vos fuites, corrections ou outils...",
  },
  "chat.send": {
    en: "Send",
    fr: "Envoyer",
  },
  "chat.analyzing": {
    en: "Analyzing your data...",
    fr: "Analyse de vos données...",
  },
  "chat.disclaimer": {
    en: "AI responses are based on industry benchmarks. Connect QuickBooks for exact numbers.",
    fr: "Les réponses IA sont basées sur des références sectorielles. Connectez QuickBooks pour des chiffres exacts.",
  },

  // ─── Paywall ────────────────────────────────────────────────────────────
  "paywall.title": {
    en: "You're finding real savings",
    fr: "Vous trouvez de vraies économies",
  },
  "paywall.desc": {
    en: "Unlock your full fix plan with tool recommendations, priority actions, and unlimited Fruxal access.",
    fr: "Débloquez votre plan complet avec des recommandations d'outils, des actions prioritaires et un accès illimité au conseiller IA.",
  },
  "paywall.report": {
    en: "Get Full Report — $47 CAD",
    fr: "Obtenir le rapport complet — 47 $ CAD",
  },
  "paywall.advisor": {
    en: "AI Advisor — $79/mo CAD",
    fr: "Conseiller IA — 79 $/mois CAD",
  },
  "paywall.report_desc": {
    en: "One-time report includes all leaks + fixes.",
    fr: "Le rapport unique inclut toutes les fuites + corrections.",
  },
  "paywall.advisor_desc": {
    en: "Monthly advisor adds unlimited AI chat + re-scans.",
    fr: "Le conseiller mensuel ajoute un chat IA illimité + re-analyses.",
  },

  // ─── Actions ────────────────────────────────────────────────────────────
  "action.start": {
    en: "Start",
    fr: "Commencer",
  },
  "action.done": {
    en: "Done",
    fr: "Terminé",
  },
  "action.skip": {
    en: "Skip",
    fr: "Passer",
  },
  "action.undo": {
    en: "Undo",
    fr: "Annuler",
  },
  "action.ask_ai": {
    en: "Ask AI",
    fr: "Demander à l'IA",
  },
  "action.verified": {
    en: "verified",
    fr: "vérifié",
  },
  "action.estimated": {
    en: "estimated",
    fr: "estimé",
  },

  // ─── Navigation ─────────────────────────────────────────────────────────
  "nav.dashboard": {
    en: "Dashboard",
    fr: "Tableau de bord",
  },
  "nav.chat": {
    en: "AI Advisor",
    fr: "Conseiller IA",
  },
  "nav.settings": {
    en: "Settings",
    fr: "Paramètres",
  },
  "nav.logout": {
    en: "Log Out",
    fr: "Déconnexion",
  },

  // ─── Prescan ────────────────────────────────────────────────────────────
  "prescan.title": {
    en: "Free Business Leak Scan",
    fr: "Analyse gratuite des fuites d'entreprise",
  },
  "prescan.cta": {
    en: "Fix My Leaks",
    fr: "Corriger mes fuites",
  },
  "prescan.results_title": {
    en: "Your Leak Report",
    fr: "Votre rapport de fuites",
  },
  "prescan.per_year": {
    en: "per year",
    fr: "par année",
  },

  // ─── Deep Scan ──────────────────────────────────────────────────────────
  "deepscan.scanning": {
    en: "Analyzing your QuickBooks data...",
    fr: "Analyse de vos données QuickBooks...",
  },
  "deepscan.scanning_desc": {
    en: "Scanning invoices, expenses, and transactions for verified leaks",
    fr: "Analyse des factures, dépenses et transactions pour les fuites vérifiées",
  },
  "deepscan.complete": {
    en: "Deep scan complete",
    fr: "Analyse approfondie terminée",
  },
  "deepscan.verified_leaks": {
    en: "verified leaks found",
    fr: "fuites vérifiées trouvées",
  },
};

type Lang = "en" | "fr";

export function t(key: string, lang: Lang = "en"): string {
  return translations[key]?.[lang] || translations[key]?.en || key;
}

// Helper to detect language from browser
export function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const browserLang = navigator.language?.toLowerCase() || "en";
  return browserLang.startsWith("fr") ? "fr" : "en";
}

export default translations;
