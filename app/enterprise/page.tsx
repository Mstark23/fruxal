"use client";
// =============================================================================
// app/enterprise/page.tsx — Enterprise Lead Capture + Conversion Page
// Form submits to /api/v2/enterprise/contact → saves to tier3_pipeline
// After submit: shows Calendly embed inline (no new tab = higher conversion)
// =============================================================================

import { useState, useEffect } from "react";

const CALENDLY = "https://calendly.com/admin-fruxal/30min";

const PROVINCES = [
  "Alberta","British Columbia","Manitoba","New Brunswick",
  "Newfoundland","Nova Scotia","Ontario","PEI",
  "Quebec","Saskatchewan",
];

const REVENUE_BANDS = [
  { value: "1m_3m",  label: "$1M – $3M" },
  { value: "3m_10m", label: "$3M – $10M" },
  { value: "10m_50m",label: "$10M – $50M" },
  { value: "50m_plus",label: "$50M+" },
];

export default function EnterprisePage() {
  const [lang, setLang] = useState<"en"|"fr">("en");
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  const [form, setForm] = useState({
    company: "", name: "", email: "", phone: "",
    revenue: "", industry: "", province: "", message: "",
  });
  const [state, setState] = useState<"idle"|"submitting"|"done"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    try {
      const s = localStorage.getItem("fruxal_lang");
      if (s === "fr" || s === "en") { setLang(s as "en"|"fr"); return; }
      if (navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
    } catch {}
  }, []);

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/v2/enterprise/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Submission failed");
      setState("done");
      // Inject Calendly script for inline embed
      if (typeof window !== "undefined" && !(window as any).Calendly) {
        const s = document.createElement("script");
        s.src = "https://assets.calendly.com/assets/external/widget.js";
        s.async = true;
        document.head.appendChild(s);
      }
    } catch (err: any) {
      setState("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  const PROOF = [
    { n: "$340K", l: t("average savings found", "économies moyennes trouvées") },
    { n: "12–18%", l: t("performance fee only", "honoraires de performance seulement") },
    { n: "2–3 wks", l: t("full diagnostic", "diagnostic complet") },
    { n: "$0", l: t("upfront cost", "coût initial") },
  ];

  const LEAKS = [
    { icon: "audit_tax", title: t("Tax Structure","Structure fiscale"), money: t("up to $80K/yr","jusqu'à 80\u202fK$/an") },
    { icon: "🤝", title: t("Vendor Contracts","Contrats fournisseurs"), money: t("up to $60K/yr","jusqu'à 60\u202fK$/an") },
    { icon: "👥", title: t("Payroll & HR","Paie & RH"), money: t("up to $45K/yr","jusqu'à 45\u202fK$/an") },
    { icon: "audit_bank", title: t("Banking & Treasury","Banque & Trésorerie"), money: t("up to $40K/yr","jusqu'à 40\u202fK$/an") },
    { icon: "🧾", title: t("SR&ED & Grants","SR&ED & Subventions"), money: t("up to $80K/yr","jusqu'à 80\u202fK$/an") },
    { icon: "🛡️", title: t("Insurance","Assurance"), money: t("up to $35K/yr","jusqu'à 35\u202fK$/an") },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#1a1a2e]">

      {/* ── NAV ── */}
      <nav className="h-[60px] px-6 lg:px-12 flex items-center justify-between bg-white/90 backdrop-blur border-b border-[#E8E6E1] sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-[#1B3A2D] flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="font-serif text-[17px] font-semibold text-[#1a1a2e]">Fruxal</span>
        </a>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#F0EDE8] rounded-[7px] p-[3px] gap-[2px]">
            {(["en","fr"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1 text-[11px] font-bold uppercase rounded-[5px] transition ${lang===l ? "bg-white text-[#1B3A2D] shadow-sm" : "text-[#8E8C85]"}`}>
                {l}
              </button>
            ))}
          </div>
          <a href="/" className="text-[13px] font-medium text-[#8E8C85] hover:text-[#1a1a2e] transition">
            {t("← Back","← Retour")}
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-20 pb-16 px-6 lg:px-12 max-w-[1200px] mx-auto">
        <div className="max-w-[720px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1B3A2D]/8 rounded-full text-xs font-semibold text-[#1B3A2D] tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t("Enterprise · $1M+ Revenue","Entreprise · 1 M$+ de revenus")}
          </div>
          <h1 className="font-serif text-[48px] lg:text-[64px] text-[#1a1a2e] font-normal leading-[1.05] tracking-tight mb-6">
            {t("Your business has","Votre entreprise")} <em className="italic text-[#1B3A2D]">{t("$100K–$340K","100–340\u202fK$")}</em> {t("in recoverable leaks.","de fuites récupérables.")}
          </h1>
          <p className="text-[18px] text-[#5C5A55] leading-relaxed max-w-[560px] mb-8">
            {t(
              "We find it. We recover it. You pay us a percentage of what we save — nothing else, nothing upfront.",
              "Nous les trouvons. Nous les récupérons. Vous nous payez un pourcentage de ce que nous économisons — rien d'autre, aucun frais initial."
            )}
          </p>
          {/* Proof bar */}
          <div className="flex flex-wrap gap-6">
            {PROOF.map(p => (
              <div key={p.n} className="flex flex-col gap-0.5">
                <span className="font-serif text-[28px] font-semibold text-[#1B3A2D]">{p.n}</span>
                <span className="text-[11px] text-[#8E8C85] font-medium uppercase tracking-wide">{p.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN GRID: FORM + WHAT WE FIND ── */}
      <section className="px-6 lg:px-12 max-w-[1200px] mx-auto pb-24">
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 items-start">

          {/* LEFT: What we find */}
          <div>
            <h2 className="font-serif text-[28px] font-normal text-[#1a1a2e] mb-2">
              {t("Where we find the money","Où nous trouvons l'argent")}
            </h2>
            <p className="text-[14px] text-[#8E8C85] mb-8">
              {t("7 financial categories. Every engagement. Guaranteed.","7 catégories financières. Chaque engagement. Garanti.")}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {LEAKS.map(l => (
                <div key={l.title} className="bg-white rounded-2xl p-5 border border-[#E8E6E1]">
                  <div className="text-2xl mb-3">{l.icon}</div>
                  <div className="text-[14px] font-semibold text-[#1a1a2e] mb-1">{l.title}</div>
                  <div className="text-[13px] font-semibold text-emerald-600">{l.money}</div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="bg-[#1B3A2D] rounded-2xl p-8 text-white">
              <h3 className="font-serif text-[22px] font-normal mb-6">
                {t("How it works","Comment ça marche")}
              </h3>
              <div className="space-y-5">
                {[
                  ["01", t("You fill out the form","Vous remplissez le formulaire"), t("2 minutes. We qualify you for a call.","2 minutes. Nous vous qualifions pour un appel.")],
                  ["02", t("Discovery call (30 min)","Appel découverte (30 min)"), t("We tell you what we expect to find — before you commit to anything.","Nous vous disons ce que nous espérons trouver — avant que vous vous engagiez.")],
                  ["03", t("Full diagnostic (2–3 weeks)","Diagnostic complet (2–3 semaines)"), t("We dig into your financials. You collect documents. We find the leaks.","Nous analysons vos finances. Vous collectez des documents. Nous trouvons les fuites.")],
                  ["04", t("Performance fee on confirmed savings","Honoraires sur économies confirmées"), t("Typically 12–18% of what we recover. Nothing until you verify the numbers.","Typiquement 12–18% de ce que nous récupérons. Rien avant que vous ne vérifiez.")],
                ].map(([n, title, desc]) => (
                  <div key={n as string} className="flex gap-4">
                    <span className="text-[11px] font-bold text-white/40 w-6 shrink-0 pt-0.5">{n}</span>
                    <div>
                      <div className="text-[14px] font-semibold text-white mb-0.5">{title}</div>
                      <div className="text-[13px] text-white/60 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Form / Calendly */}
          <div className="lg:sticky lg:top-[76px]">
            {state !== "done" ? (
              <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.05)]">
                <div className="px-7 py-6 border-b border-[#E8E6E1]">
                  <h3 className="font-serif text-[22px] font-normal text-[#1a1a2e]">
                    {t("See if you qualify","Vérifiez si vous êtes admissible")}
                  </h3>
                  <p className="text-[13px] text-[#8E8C85] mt-1">
                    {t("Takes 2 minutes. No commitment.","Prend 2 minutes. Sans engagement.")}
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
                  {state === "error" && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider block mb-1.5">
                        {t("Company name","Nom de l'entreprise")} *
                      </label>
                      <input required value={form.company} onChange={e => set("company", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E6E1] rounded-lg text-[14px] text-[#1a1a2e] outline-none focus:border-[#1B3A2D] focus:ring-[3px] focus:ring-[#1B3A2D]/8 transition"
                        placeholder={t("Acme Inc.","Acme inc.")} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider block mb-1.5">
                        {t("Your name","Votre nom")} *
                      </label>
                      <input required value={form.name} onChange={e => set("name", e.target.value)}
                        autoComplete="name"
                        className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E6E1] rounded-lg text-[14px] text-[#1a1a2e] outline-none focus:border-[#1B3A2D] focus:ring-[3px] focus:ring-[#1B3A2D]/8 transition"
                        placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider block mb-1.5">
                        {t("Phone","Téléphone")}
                      </label>
                      <input value={form.phone} onChange={e => set("phone", e.target.value)}
                        autoComplete="tel" type="tel"
                        className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E6E1] rounded-lg text-[14px] text-[#1a1a2e] outline-none focus:border-[#1B3A2D] focus:ring-[3px] focus:ring-[#1B3A2D]/8 transition"
                        placeholder="514-555-0100" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider block mb-1.5">
                        Email *
                      </label>
                      <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
                        autoComplete="email"
                        className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E6E1] rounded-lg text-[14px] text-[#1a1a2e] outline-none focus:border-[#1B3A2D] focus:ring-[3px] focus:ring-[#1B3A2D]/8 transition"
                        placeholder="jane@company.com" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider block mb-1.5">
                        {t("Annual revenue","Revenus annuels")} *
                      </label>
                      <select required value={form.revenue} onChange={e => set("revenue", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E6E1] rounded-lg text-[14px] text-[#1a1a2e] outline-none focus:border-[#1B3A2D] focus:ring-[3px] focus:ring-[#1B3A2D]/8 transition">
                        <option value="">{t("Select range","Choisir")}</option>
                        {REVENUE_BANDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider block mb-1.5">
                        {t("Province","Province")}
                      </label>
                      <select value={form.province} onChange={e => set("province", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E6E1] rounded-lg text-[14px] text-[#1a1a2e] outline-none focus:border-[#1B3A2D] focus:ring-[3px] focus:ring-[#1B3A2D]/8 transition">
                        <option value="">{t("Select","Choisir")}</option>
                        {PROVINCES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider block mb-1.5">
                        {t("Industry","Industrie")}
                      </label>
                      <input value={form.industry} onChange={e => set("industry", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E6E1] rounded-lg text-[14px] text-[#1a1a2e] outline-none focus:border-[#1B3A2D] focus:ring-[3px] focus:ring-[#1B3A2D]/8 transition"
                        placeholder={t("e.g. Construction, IT Services, Manufacturing","ex. Construction, Services TI, Fabrication")} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider block mb-1.5">
                        {t("Anything you want us to know?","Quelque chose à nous dire ?")}
                      </label>
                      <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={2}
                        className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E6E1] rounded-lg text-[14px] text-[#1a1a2e] outline-none focus:border-[#1B3A2D] focus:ring-[3px] focus:ring-[#1B3A2D]/8 transition resize-none"
                        placeholder={t("Industry, biggest cost concerns, current challenges…","Industrie, principales préoccupations de coûts…")} />
                    </div>
                  </div>

                  <button type="submit" disabled={state === "submitting"}
                    className="w-full py-3.5 bg-[#1B3A2D] text-white text-[15px] font-semibold rounded-lg hover:bg-[#254d3d] disabled:opacity-60 transition">
                    {state === "submitting"
                      ? t("Sending…","Envoi…")
                      : t("Book my discovery call →","Réserver mon appel découverte →")}
                  </button>
                  <p className="text-[11px] text-[#8E8C85] text-center">
                    {t("No upfront cost · NDA on first call · Cancel anytime","Aucun frais initial · NDA dès le premier appel · Annulez à tout moment")}
                  </p>
                </form>
              </div>
            ) : (
              /* ── SUCCESS: show Calendly inline ── */
              <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.05)]">
                <div className="px-7 py-5 border-b border-[#E8E6E1] bg-emerald-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm">✓</div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1a1a2e]">
                        {t("You're qualified. Now pick a time.","Vous êtes qualifié(e). Choisissez un moment.")}
                      </p>
                      <p className="text-[12px] text-[#8E8C85]">
                        {t("Your info has been sent to our team.","Vos informations ont été envoyées à notre équipe.")}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Calendly inline widget */}
                <div
                  className="calendly-inline-widget"
                  data-url={`${CALENDLY}?hide_gdpr_banner=1&primary_color=1B3A2D`}
                  style={{ minWidth: "320px", height: "630px" }}
                />
                <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
              </div>
            )}

            {/* Trust row */}
            <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
              {[
                t("NDA on day 1","NDA dès le jour 1"),
                t("Canadian data servers","Serveurs canadiens"),
                t("No upfront fees","Aucun frais initial"),
              ].map(item => (
                <span key={item} className="text-[11px] text-[#8E8C85] font-medium">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white border-y border-[#E8E6E1] py-20 px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-serif text-[28px] font-normal text-center text-[#1a1a2e] mb-12">
            {t("What businesses like yours found","Ce que des entreprises comme la vôtre ont trouvé")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: t('"Fruxal found $67K in vendor contracts we\'d been overpaying for three years. The call was 30 minutes. The savings are permanent."','"Fruxal a trouvé 67\u202fK$ dans des contrats que nous surpayions depuis trois ans. L\'appel a duré 30 minutes. Les économies sont permanentes."'),
                name: "Marc T.", role: t("Construction · Québec · $4.2M revenue","Construction · Québec · 4,2\u202fM$"),
              },
              {
                quote: t('"The SR&ED claim alone was $94K. My accountant of 8 years never brought it up. Not once."','"La demande SR&ED seule était de 94\u202fK$. Mon comptable de 8 ans n\'en avait jamais parlé."'),
                name: "Sarah K.", role: t("IT Services · Toronto · $2.8M revenue","Services TI · Toronto · 2,8\u202fM$"),
              },
              {
                quote: lang === "fr" ? "«\u202fIls m\'ont dit mes trois fuites avant que je signe. C\'est là que j\'ai su.\u202f»" : "\u201cThey told me my three biggest leaks before I signed anything. I knew they were real.\u201d",
                name: "David L.", role: lang === "fr" ? "Fabrication · Ontario · 7,1\u202fM$" : "Manufacturing · Ontario · $7.1M revenue",
              },
            ].map(({ quote, name, role }) => (
              <div key={name} className="bg-[#F9F8F6] rounded-2xl p-6 border border-[#E8E6E1]">
                <p className="text-[14px] text-[#1a1a2e] leading-relaxed mb-5 italic">{quote}</p>
                <div>
                  <div className="text-[13px] font-semibold text-[#1a1a2e]">{name}</div>
                  <div className="text-[11px] text-[#8E8C85]">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OBJECTIONS ── */}
      <section className="py-20 px-6 lg:px-12 max-w-[800px] mx-auto">
        <h2 className="font-serif text-[28px] font-normal text-[#1a1a2e] mb-10 text-center">
          {t("Common questions","Questions fréquentes")}
        </h2>
        <div className="space-y-4">
          {[
            [
              t('"My accountant handles everything."','"Mon comptable s\'occupe de tout."'),
              t("Your accountant files taxes and reconciles books. Hunting for savings across 7 categories and renegotiating vendor contracts isn\'t their job — and most won\'t touch it.","Votre comptable produit des déclarations et rapproche des livres. Chasser des économies sur 7 catégories et renégocier des contrats n'est pas son travail.")
            ],
            [
              t('"What if you find nothing?"','"Et si vous ne trouvez rien ?"'),
              t("Then you owe us nothing. Zero. We take the risk entirely. In practice, we\'ve never completed an engagement without finding meaningful savings.","Vous ne nous devez rien. Zéro. Nous prenons tout le risque. En pratique, nous n'avons jamais terminé un engagement sans trouver des économies significatives.")
            ],
            [
              t('"I don\'t have time."','"Je n\'ai pas le temps."'),
              t("You need 4–6 hours over 3 weeks to collect documents. That\'s it. We do the analysis, negotiations, submissions, and follow-up.","Vous avez besoin de 4 à 6 heures sur 3 semaines pour collecter des documents. C'est tout. Nous faisons tout le reste.")
            ],
            [
              t('"I\'m not comfortable sharing financial data."','"Je ne suis pas à l\'aise avec le partage de données."'),
              t("NDA from the first call. All data on encrypted, PIPEDA-compliant Canadian servers. You can walk away at any point before signing.","NDA dès le premier appel. Toutes les données sur des serveurs canadiens chiffrés, conformes à la LPRPDE. Vous pouvez partir avant de signer.")
            ],
          ].map(([q, a]) => (
            <details key={q as string} className="group bg-white rounded-xl border border-[#E8E6E1] overflow-hidden">
              <summary className="px-5 py-4 text-[14px] font-semibold text-[#1a1a2e] cursor-pointer list-none flex items-center justify-between hover:bg-[#F9F8F6] transition">
                {q}
                <span className="text-[#8E8C85] group-open:rotate-180 transition-transform text-lg">↓</span>
              </summary>
              <div className="px-5 pb-4 text-[13px] text-[#5C5A55] leading-relaxed border-t border-[#E8E6E1] pt-3">
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-[#1B3A2D] py-16 px-6 text-center">
        <h2 className="font-serif text-[32px] text-white font-normal mb-3">
          {t("Ready to find your leaks?","Prêt à trouver vos fuites ?")}
        </h2>
        <p className="text-[15px] text-white/60 mb-8">
          {t("Fill out the form above. 2 minutes. No commitment.","Remplissez le formulaire ci-dessus. 2 minutes. Sans engagement.")}
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="px-8 py-3.5 bg-white text-[#1B3A2D] text-[15px] font-semibold rounded-lg hover:bg-white/90 transition">
          {t("Apply now →","Postuler maintenant →")}
        </button>
      </section>

    </div>
  );
}
