"use client";
// =============================================================================
// app/pricing/page.tsx — Standalone pricing page
// =============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";

const isFR = () => {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem("fruxal_lang") === "fr"; } catch { return false; }
};

function t(en: string, fr: string, lang: boolean) { return lang ? fr : en; }

const FEATURES_SOLO = [
  ["Full prescan + leak report",    "Prescan complet + rapport de fuites"],
  ["Financial Health Score",         "Score de santé financière"],
  ["All leaks with dollar amounts",  "Toutes les fuites avec montants"],
  ["90-day action plan",             "Plan d'action 90 jours"],
  ["Monthly re-scans",               "Analyses mensuelles"],
  ["Smart deadline alerts",          "Alertes d'échéances intelligentes"],
  ["Government programs matched",    "Programmes gouvernementaux"],
  ["AI financial advisor chat",      "Chat conseiller IA"],
];

const FEATURES_BUSINESS = [
  ["Everything in Solo",             "Tout du Solo"],
  ["Mid-market AI leak engine",      "Moteur IA fuites mid-market"],
  ["Industry benchmarks",            "Repères de l'industrie"],
  ["Payroll & compliance audit",     "Audit paie et conformité"],
  ["Multi-business support",         "Multi-entreprises"],
  ["QuickBooks integration",         "Intégration QuickBooks"],
  ["Monthly advisor call",           "Appel conseiller mensuel"],
];

const FAQS = [
  {
    q: "Do I need a credit card to start?",
    qFR: "Ai-je besoin d'une carte de crédit pour commencer ?",
    a: "No. You can run a free prescan and create a free account without entering any payment information.",
    aFR: "Non. Vous pouvez faire un prescan gratuit et créer un compte gratuit sans entrer vos informations de paiement.",
  },
  {
    q: "Can I cancel anytime?",
    qFR: "Puis-je annuler à tout moment ?",
    a: "Yes. Cancel anytime from your account settings. No cancellation fees, no questions asked.",
    aFR: "Oui. Annulez à tout moment depuis vos paramètres. Aucun frais d'annulation.",
  },
  {
    q: "What's the difference between Solo and Business?",
    qFR: "Quelle est la différence entre Solo et Business ?",
    a: "Solo is designed for self-employed and freelancers under $500K revenue. Business adds industry benchmarking, QuickBooks integration, payroll auditing, and a monthly advisor call — for businesses with employees.",
    aFR: "Solo est conçu pour les travailleurs autonomes sous 500 K$. Business ajoute les repères sectoriels, l'intégration QuickBooks, l'audit de paie et un appel conseiller mensuel.",
  },
  {
    q: "How does the Enterprise tier work?",
    qFR: "Comment fonctionne le niveau Enterprise ?",
    a: "Enterprise is a fully managed service for Canadian businesses doing $1M+. A dedicated Fruxal analyst runs a full forensic audit. You only pay a percentage of confirmed savings — no savings, no fee.",
    aFR: "Enterprise est un service entièrement géré pour les entreprises canadiennes à 1 M$+. Vous ne payez qu'un pourcentage des économies confirmées.",
  },
  {
    q: "Is my financial data secure?",
    qFR: "Mes données financières sont-elles sécurisées ?",
    a: "Yes. All data is encrypted at rest and in transit. We are PIPEDA compliant. We never sell or share your data. You can delete your account and all data at any time.",
    aFR: "Oui. Toutes les données sont chiffrées. Nous sommes conformes à la LPRPDE. Nous ne vendons ni ne partageons vos données.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [lang] = useState(false); // SSR safe — hydrates on client
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-bg font-sans">

      {/* Nav */}
      <nav className="border-b border-border-light px-6 py-4 flex items-center justify-between max-w-[1200px] mx-auto">
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="font-serif text-[17px] font-semibold text-ink tracking-tight">Fruxal</span>
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/login")} className="text-sm text-ink-secondary hover:text-ink transition">Sign in</button>
          <button onClick={() => router.push("/")} className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition">Try free</button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-soft rounded-full text-xs font-semibold text-brand mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-positive" />
            Free forever — no credit card required
          </div>
          <h1 className="font-serif text-[40px] sm:text-[52px] text-ink font-normal mb-4 leading-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-[18px] text-ink-secondary max-w-[480px] mx-auto leading-relaxed">
            Start free. Pay only when you see the value. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 items-start mb-20">

          {/* Solo */}
          <div className="bg-white border border-border-light rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-2.5 py-1 rounded-full">Solo</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-positive bg-positive/10 px-2.5 py-1 rounded-full">Most popular</span>
            </div>
            <div className="font-serif text-[44px] text-ink tracking-tight font-normal leading-none mb-1">
              Free
            </div>
            <p className="text-[12px] text-positive font-semibold mb-2">✶ Free forever · No credit card</p>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">For self-employed and solo operators under $500K revenue.</p>
            <ul className="mb-8 flex-1 space-y-0">
              {FEATURES_SOLO.map(([en]) => (
                <li key={en} className="flex items-start gap-2.5 py-2.5 border-b border-border-light text-sm text-ink-secondary last:border-0">
                  <span className="text-positive shrink-0 text-[13px] mt-px">✓</span>{en}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push("/register")}
              className="w-full py-3.5 text-sm font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition text-center">
              Get started free →
            </button>
            <p className="text-[10px] text-ink-faint text-center mt-2">No credit card · Cancel anytime</p>
          </div>

          {/* Business */}
          <div className="bg-bg border-2 border-brand rounded-2xl p-8 flex flex-col shadow-xl shadow-brand/10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Best value</div>
            <div className="flex items-center gap-2 mb-5 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-2.5 py-1 rounded-full">Business</span>
            </div>
            <div className="font-serif text-[44px] text-ink tracking-tight font-normal leading-none mb-1">
              Free
            </div>
            <p className="text-[12px] text-positive font-semibold mb-2">✶ Free forever · No credit card</p>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">For businesses with employees doing $150K–$1M revenue.</p>
            <ul className="mb-8 flex-1 space-y-0">
              {FEATURES_BUSINESS.map(([en]) => (
                <li key={en} className="flex items-start gap-2.5 py-2.5 border-b border-border-light text-sm text-ink-secondary last:border-0">
                  <span className="text-positive shrink-0 text-[13px] mt-px">✓</span>{en}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push("/register")}
              className="w-full py-3.5 text-sm font-semibold rounded-xl bg-brand text-white hover:bg-brand-light transition text-center">
              Get started free →
            </button>
            <p className="text-[10px] text-ink-faint text-center mt-2">No credit card · Cancel anytime</p>
          </div>

          {/* Enterprise */}
          <div className="bg-white border border-border-light rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">Enterprise</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">Performance fee</span>
            </div>
            <div className="font-serif text-[36px] text-ink tracking-tight font-normal leading-none mb-1">Let's talk</div>
            <p className="text-[12px] text-positive font-semibold mb-2">✶ You only pay on confirmed savings</p>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">For Canadian businesses doing $1M+. A dedicated analyst runs a full forensic audit — paid only when we recover money.</p>
            <ul className="mb-8 flex-1 space-y-0">
              {[
                "Full forensic financial audit",
                "Tax structure optimization",
                "Vendor & procurement review",
                "Payroll & HR forensics",
                "SR&ED & grant maximization",
                "Dedicated Fruxal analyst",
                "No upfront cost",
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 py-2.5 border-b border-border-light text-sm text-ink-secondary last:border-0">
                  <span className="text-positive shrink-0 text-[13px] mt-px">✓</span>{f}
                </li>
              ))}
            </ul>
            <a href="https://calendly.com/admin-fruxal/30min" target="_blank" rel="noopener noreferrer"
              className="w-full py-3.5 text-sm font-semibold rounded-xl border-2 border-brand text-brand hover:bg-brand-soft transition text-center block">
              Book a free 30-min discovery call →
            </a>
          </div>
        </div>

        {/* Social proof bar */}
        <div className="border border-border-light rounded-2xl px-8 py-6 mb-20 flex flex-wrap justify-center gap-10 text-center">
          {[
            { v: "24", l: "Businesses analyzed" },
            { v: "$13,000", l: "Avg. annual leak found" },
            { v: "5 min", l: "To your first insight" },
            { v: "PIPEDA", l: "Compliant & secure" },
          ].map(s => (
            <div key={s.l}>
              <div className="font-serif text-[28px] text-ink font-semibold">{s.v}</div>
              <div className="text-[11px] text-ink-muted font-medium mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-[640px] mx-auto">
          <h2 className="font-serif text-[28px] text-ink font-normal mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border-light rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-semibold text-ink hover:bg-bg-section transition"
                >
                  {faq.q}
                  <span className="text-ink-muted ml-4 shrink-0">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-ink-secondary leading-relaxed border-t border-border-light pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <h2 className="font-serif text-[32px] text-ink font-normal mb-3">Ready to stop the leaks?</h2>
          <p className="text-ink-secondary mb-6">Start with a free 2-minute prescan. No credit card required.</p>
          <button onClick={() => router.push("/")}
            className="px-8 py-4 text-[15px] font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition">
            Start free analysis →
          </button>
        </div>
      </div>
    </div>
  );
}
