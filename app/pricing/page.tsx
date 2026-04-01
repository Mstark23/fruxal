// =============================================================================
// app/pricing/page.tsx — Contingency model pricing
// =============================================================================
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCountryFromCookie } from "@/lib/country";

const lang = () => { try { return localStorage.getItem("fruxal_lang") === "fr"; } catch { return false; } };
const isUS = typeof document !== "undefined" && getCountryFromCookie() === "US";
const prof = isUS ? "CPA" : "accountant";
const agency = isUS ? "IRS" : "CRA";
function t(en: string, fr: string, isFr: boolean) { return isFr ? fr : en; }

const FAQS = [
  {
    q:   "Is there really no upfront cost?",
    qFR: "Il n'y a vraiment aucun frais initiaux?",
    a:   "Correct. You pay nothing to start. No subscription, no retainer, no deposit. Our fee is 12% of savings we confirm — only after they're in your pocket.",
    aFR: "Correct. Vous ne payez rien pour commencer. Pas d'abonnement, pas de retenue, pas de dépôt. Notre commission est de 12% des économies confirmées — seulement après qu'elles soient dans votre poche.",
  },
  {
    q:   "What does 12% mean in practice?",
    qFR: "Que signifie 12% en pratique?",
    a:   "If your rep recovers $50,000 in a year, you pay $6,000 and keep $44,000. If they recover nothing, you pay nothing. It's that simple.",
    aFR: "Si votre expert récupère 50 000$, vous payez 6 000$ et gardez 44 000$. S'ils ne récupèrent rien, vous ne payez rien. C'est aussi simple que ça.",
  },
  {
    q:   isUS ? "How is this different from hiring a CPA?" : "How is this different from hiring an accountant?",
    qFR: "En quoi est-ce différent d'un comptable?",
    a:   isUS ? "CPAs charge by the hour whether or not they find savings. Fruxal only earns when you do. We're incentivized to find every dollar." : "Accountants charge by the hour whether or not they find savings. Fruxal only earns when you do. We're incentivized to find every dollar.",
    aFR: "Les comptables facturent à l'heure qu'ils trouvent des économies ou non. Fruxal ne gagne que quand vous gagnez. Nous sommes incités à trouver chaque dollar.",
  },
  {
    q:   "What kinds of savings do you find?",
    qFR: "Quel type d'économies trouvez-vous?",
    a:   isUS ? "Tax structure gaps, unclaimed R&D credits, government programs, vendor overcharges, payroll optimizations, IRS payment plans, insurance gaps, and more. Across 245 industries." : "Tax structure gaps, unclaimed SR&ED credits, government grants, vendor overcharges, payroll optimizations, CRA payment plans, insurance gaps, and more. Across 245 industries.",
    aFR: "Écarts de structure fiscale, crédits SR&ED non réclamés, subventions gouvernementales, surcharges fournisseurs, optimisations de paie, plans de paiement ARC, lacunes d'assurance, et plus. Dans 245 secteurs.",
  },
  {
    q:   "Who is assigned as my recovery expert?",
    qFR: "Qui est désigné comme mon expert en récupération?",
    a:   isUS ? "A Fruxal-trained financial recovery expert matched to your state and industry. They have direct experience with IRS processes and US business finance." : "A Fruxal-trained financial recovery expert matched to your province and industry. They have direct experience with CRA processes and Canadian business finance.",
    aFR: "Un expert en récupération financière formé par Fruxal, adapté à votre province et secteur. Ils ont une expérience directe des processus de l'ARC et des finances d'entreprise canadiennes.",
  },
  {
    q:   "Can I still use the free tools?",
    qFR: "Puis-je encore utiliser les outils gratuits?",
    a:   "Yes. The prescan, health score, obligations tracker, AI advisor, and programs directory are free forever. The contingency engagement is an additional service for businesses that want active recovery.",
    aFR: "Oui. Le prescan, le score de santé, le suivi des obligations, le conseiller IA et le répertoire des programmes sont gratuits pour toujours. L'engagement contingent est un service additionnel pour les entreprises qui souhaitent une récupération active.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [isFr, setIsFr] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] px-6 flex items-center justify-between bg-bg/90 backdrop-blur border-b border-border-light">
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="font-serif text-[17px] font-semibold">Fruxal</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/login")} className="text-sm text-ink-secondary hover:text-ink">Sign in</button>
          <button onClick={() => router.push("/")} className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition">
            {t("Try free", "Essai gratuit", isFr)}
          </button>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6 max-w-[720px] mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-soft rounded-full text-xs font-semibold text-brand mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-positive" />
            {t("No subscription · No upfront cost · We only earn when you do", "Pas d'abonnement · Pas de frais initiaux · On gagne seulement quand vous gagnez", isFr)}
          </div>
          <h1 className="font-serif text-[42px] font-normal text-ink leading-tight mb-4">
            {t("Simple, honest pricing.", "Une tarification simple et honnête.", isFr)}
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-[480px] mx-auto">
            {t("Free to use. 12% of savings we confirm — paid only after recovery.", "Gratuit à utiliser. 12% des économies confirmées — payé seulement après récupération.", isFr)}
          </p>
        </div>

        {/* Two columns: Free tools + Recovery service */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">

          {/* Free tools */}
          <div className="bg-white border border-border rounded-2xl p-7">
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-3">Free tools</p>
            <div className="font-serif text-[36px] text-ink font-normal mb-1">$0</div>
            <p className="text-sm text-ink-secondary mb-6">Forever free. No credit card.</p>
            <ul className="space-y-3 mb-8">
              {[
                "Prescan + financial leak report",
                "Financial Health Score",
                "Obligations tracker + deadline alerts",
                "AI advisor chat",
                "Government programs directory",
                "Industry benchmarks",
                "Monthly brief",
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                  <svg className="w-4 h-4 text-positive shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push("/")}
              className="w-full py-3 border border-border text-sm font-semibold rounded-sm hover:bg-bg transition">
              {t("Start free scan →", "Commencer le scan gratuit →", isFr)}
            </button>
          </div>

          {/* Recovery service */}
          <div className="bg-brand rounded-2xl p-7 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3 text-white/60">Recovery service</p>
              <div className="font-serif text-[36px] font-normal mb-1">12%</div>
              <p className="text-sm text-white/70 mb-6">of confirmed savings. Zero if we find nothing.</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Dedicated recovery expert assigned",
                  isUS ? "IRS filings and correspondence handled" : "CRA calls and correspondence handled",
                  isUS ? "R&D credit + program applications filed" : "SR&ED + grant applications filed",
                  "Vendor renegotiation support",
                  "Tax structure optimization",
                  "Insurance + payroll gaps fixed",
                  "No cost until savings confirmed",
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                    <svg className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push("/")}
                className="w-full py-3 bg-white text-brand text-sm font-bold rounded-sm hover:bg-white/90 transition">
                {t("Get a free recovery call →", "Obtenir un appel gratuit →", isFr)}
              </button>
              <p className="text-center text-[11px] text-white/30 mt-2">
                {t("Qualified based on scan results", "Admissible selon les résultats du scan", isFr)}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-serif text-[28px] text-ink font-normal text-center mb-8">
            {t("Common questions", "Questions fréquentes", isFr)}
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-bg transition">
                  <span className="text-sm font-semibold text-ink">{isFr ? faq.qFR : faq.q}</span>
                  <svg className={`w-4 h-4 text-ink-muted shrink-0 ml-3 transition-transform ${open === i ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {open === i && (
                  <div className="px-5 pb-4 text-sm text-ink-secondary leading-relaxed border-t border-border-light">
                    {isFr ? faq.aFR : faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
