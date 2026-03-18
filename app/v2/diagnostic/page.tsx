// =============================================================================
// app/v2/diagnostic/page.tsx
// =============================================================================
// Diagnostic launcher. Shows what the paid report includes,
// triggers analysis, shows progress, redirects to report.
// =============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "en" | "fr";

export default function DiagnosticLauncherPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    try {
      const stored = localStorage.getItem("fruxal_lang") as Lang | null;
      if (stored === "en" || stored === "fr") return stored;
      if (navigator.language?.toLowerCase().startsWith("fr")) return "fr";
    } catch {}
    return "en";
  });
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isFr = lang === "fr";

  const toggleLang = () => {
    const next: Lang = lang === "fr" ? "en" : "fr";
    setLang(next);
    try { localStorage.setItem("fruxal_lang", next); } catch {}
  };

  const PROGRESS_STEPS = isFr
    ? ["Chargement du profil...", "Analyse des obligations...", "Détection des fuites...", "Recherche de programmes...", "Génération du rapport IA...", "Finalisation..."]
    : ["Loading profile...", "Analyzing obligations...", "Detecting leaks...", "Finding programs...", "AI report generation...", "Finalizing..."];

  const runDiagnostic = async () => {
    setRunning(true);
    setError(null);
    setProgress(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.min(step * 15, 90));
      setProgressLabel(PROGRESS_STEPS[Math.min(step, PROGRESS_STEPS.length - 1)]);
    }, 3000);

    try {
      const statusRes = await fetch("/api/v2/onboarding/status");
      const statusJson = await statusRes.json();

      // If no businessId from onboarding status, try the dashboard API which
      // also resolves businessId from business_profiles directly
      let businessId = statusJson.businessId;
      if (!businessId) {
        try {
          const dashRes = await fetch("/api/v2/dashboard");
          const dashJson = await dashRes.json();
          businessId = dashJson?.data?.business_id || dashJson?.data?.businessId;
        } catch {}
      }

      if (!businessId) {
        clearInterval(interval);
        // Check if user is enterprise (has been through intake) before redirecting
        // to onboarding — enterprise users should go to intake instead
        try {
          const stored = localStorage.getItem("fruxal_tier");
          if (stored === "enterprise") {
            router.push("/v2/diagnostic/intake");
            return;
          }
        } catch {}
        router.push("/v2/onboarding");
        return;
      }

      setProgress(10);
      setProgressLabel(PROGRESS_STEPS[0]);

      const res = await fetch("/api/v2/diagnostic/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, language: lang }),
      });

      clearInterval(interval);
      const json = await res.json();

      if (json.success) {
        setProgress(100);
        setProgressLabel(isFr ? "Rapport prêt!" : "Report ready!");
        await new Promise(r => setTimeout(r, 800));
        router.push(`/v2/diagnostic/${json.reportId}`);
      } else {
        setError(json.error || "Unknown error");
        setRunning(false);
      }
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message);
      setRunning(false);
    }
  };

  const FEATURES = [
    { icon: "→", en: "Deep analysis of every financial dimension", fr: "Analyse approfondie de chaque dimension financière" },
    { icon: "→", en: "Exact dollar impact for every finding", fr: "Impact exact en dollars pour chaque constat" },
    { icon: "→", en: "Prioritized 90-day action plan", fr: "Plan d'action priorisé sur 90 jours" },
    { icon: "→", en: "Risk matrix with compliance gaps", fr: "Matrice de risques avec lacunes de conformité" },
    { icon: "→", en: "Industry benchmark comparisons", fr: "Comparaisons avec les benchmarks de l'industrie" },
    { icon: "→", en: "Government programs you're missing", fr: "Programmes gouvernementaux que vous manquez" },
    { icon: "→", en: "Downloadable PDF report", fr: "Rapport PDF téléchargeable" },
    { icon: "→", en: "Powered by Claude AI", fr: "Propulsé par Claude IA" },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="px-4 py-4 flex items-center justify-between max-w-3xl mx-auto w-full">
        <span className="font-serif text-sm font-semibold text-ink">Fruxal Diagnostic</span>
        <button
          onClick={toggleLang}
          className="text-xs text-ink-faint hover:text-ink-secondary px-2 py-1 rounded-sm border border-border-light"
        >
          {isFr ? "EN" : "FR"}
        </button>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {!running ? (
          <>
            {/* Hero */}
            <div className="text-center mb-8" style={{ animation: "fadeUp 0.3s ease-out" }}>
              <h1 className="text-2xl font-bold text-ink mb-2">
                {isFr ? "Diagnostic IA complet" : "Full AI Diagnostic"}
              </h1>
              <p className="text-sm text-ink-muted max-w-md mx-auto">
                {isFr
                  ? "Notre IA analyse chaque aspect de votre entreprise pour identifier les fuites, optimisations et programmes auxquels vous êtes éligible."
                  : "Our AI analyzes every aspect of your business to identify leaks, optimizations, and programs you're eligible for."}
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-2 mb-8" style={{ animation: "fadeUp 0.4s ease-out" }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 bg-white border border-border-light rounded-xl">
                  <span className="text-sm mt-0.5">{f.icon}</span>
                  <span className="text-xs text-ink-muted">{isFr ? f.fr : f.en}</span>
                </div>
              ))}
            </div>

            {/* Example findings preview */}
            <div className="bg-white border border-border-light rounded-xl p-5 mb-6" style={{ animation: "fadeUp 0.45s ease-out" }}>
              <h3 className="text-xs text-ink-faint uppercase font-semibold mb-3">
                {isFr ? "Exemple de constats" : "Example findings"}
              </h3>
              <div className="space-y-2">
                {[
                  { sev: "critical", title: isFr ? "Crédit RS&DE non réclamé" : "SR&ED Credit Not Claimed", impact: "$15K–$500K" },
                  { sev: "high", title: isFr ? "Exemption ISE manquée" : "EHT Exemption Missed", impact: "$2K–$9.5K" },
                  { sev: "medium", title: isFr ? "Surfacturation paiements" : "Payment Processing Overcharge", impact: "$1.2K–$18K" },
                ].map((ex, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-bg rounded-lg">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      ex.sev === "critical" ? "bg-red-500" : ex.sev === "high" ? "bg-orange-500" : "bg-yellow-500"
                    }`} />
                    <span className="text-xs text-ink-muted flex-1">{ex.title}</span>
                    <span className="text-[10px] text-brand/50 font-semibold">{ex.impact}/yr</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center" style={{ animation: "fadeUp 0.5s ease-out" }}>
              <button
                onClick={runDiagnostic}
                className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-light text-ink font-bold text-sm transition-all shadow-lg shadow-brand/20"
              >
                {isFr ? "Lancer le diagnostic IA" : "Launch AI Diagnostic"}
              </button>
              {error && <p className="text-negative text-xs mt-3">{error}</p>}
            </div>
          </>
        ) : (
          /* Running state */
          <div className="flex flex-col items-center justify-center py-16" style={{ animation: "fadeUp 0.3s ease-out" }}>
            <div className="relative w-20 h-20 mb-6">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                <circle cx="40" cy="40" r="35" fill="none" stroke="#10b981" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={"" + progress * 2.2 + " 220"} style={{ transition: "stroke-dasharray 0.5s ease-out" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-ink">{progress}%</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-ink mb-1">
              {isFr ? "Analyse en cours..." : "Analyzing..."}
            </p>
            <p className="text-xs text-ink-faint transition-all">{progressLabel}</p>

            <div className="mt-8 space-y-1 text-center">
              {PROGRESS_STEPS.map((stepLabel, i) => {
                const done = progress >= (i + 1) * 15;
                const active = progress >= i * 15 && progress < (i + 1) * 15;
                return (
                  <div key={i} className={`flex items-center gap-2 text-[10px] transition-all ${
                    done ? "text-brand/50" : active ? "text-ink-muted" : "text-ink-faint"
                  }`}>
                    <span>{done ? "✓" : active ? "●" : "○"}</span>
                    <span>{stepLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
