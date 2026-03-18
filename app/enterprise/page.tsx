// =============================================================================
// src/app/enterprise/page.tsx — Fruxal Enterprise Page
// Audience: $5M–$200M Canadian businesses
// Goal: qualify them and submit to Tier 3 pipeline
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LEAK_CATEGORIES = [
  { icon: "🏦", title: "Tax Structure", fr: "Structure fiscale", desc: "Corporate structure inefficiencies, missed credits, owner compensation gaps.", desc_fr: "Inefficacités de structure corporative, crédits manqués." },
  { icon: "📦", title: "Vendor & Procurement", fr: "Fournisseurs", desc: "Contract overcharges, duplicate vendors, pricing that hasn't been renegotiated.", desc_fr: "Surfacturations, fournisseurs en double, prix non renégociés." },
  { icon: "👥", title: "Payroll & HR", fr: "Paie & RH", desc: "Payroll structure, benefits inefficiencies, misclassified employees.", desc_fr: "Structure salariale, avantages inefficaces, mauvaise classification." },
  { icon: "🏛️", title: "Banking & Treasury", fr: "Banque & Trésorerie", desc: "Processing fees, idle cash, credit facility terms that can be improved.", desc_fr: "Frais de traitement, liquidités dormantes, conditions de crédit." },
  { icon: "🛡️", title: "Insurance", fr: "Assurance", desc: "Overpaid premiums, duplicate coverage, policies not adjusted for current scale.", desc_fr: "Primes trop élevées, couvertures redondantes." },
  { icon: "💻", title: "SaaS & Technology", fr: "Technologies", desc: "Unused subscriptions, redundant tools, licensing not optimized for your team size.", desc_fr: "Abonnements inutilisés, outils redondants." },
  { icon: "⚖️", title: "Compliance & Penalties", fr: "Conformité", desc: "CRA exposure, payroll remittance gaps, provincial obligations being missed.", desc_fr: "Exposition ARC, lacunes de remise salariale, obligations provinciales." },
];

const PROCESS_STEPS = [
  { num: "01", title: "Contact", fr_title: "Contact", desc: "Fill the form below. Your dedicated Fruxal rep reaches out within 1 business day.", fr_desc: "Remplissez le formulaire. Votre représentant vous contacte dans 1 jour ouvrable." },
  { num: "02", title: "Diagnostic", fr_title: "Diagnostic", desc: "A structured financial diagnostic across 7 leak categories. Typically 2–3 weeks with document collection.", fr_desc: "Diagnostic financier structuré sur 7 catégories. Typiquement 2–3 semaines." },
  { num: "03", title: "Agreement", fr_title: "Entente", desc: "We agree on scope and a contingency fee (typically 12–18% of confirmed savings). No upfront cost.", fr_desc: "Nous convenons d'une portée et d'honoraires de performance (12–18%). Aucun frais initial." },
  { num: "04", title: "Recovery", fr_title: "Récupération", desc: "Your rep works the findings — vendor renegotiations, CRA submissions, insurance shopping, banking terms.", fr_desc: "Votre représentant travaille les résultats — renégociations, soumissions ARC, assurances." },
  { num: "05", title: "Confirmed & Invoiced", fr_title: "Confirmé & Facturé", desc: "Savings are confirmed and documented. You receive an invoice for our fee only on what was recovered.", fr_desc: "Les économies sont confirmées et documentées. Vous recevez une facture uniquement sur ce qui a été récupéré." },
];

export default function EnterprisePage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en"|"fr">("en");
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  const [form, setForm] = useState({
    company: "", name: "", email: "", phone: "",
    revenue: "", industry: "", province: "",
    estimate: "", message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fruxal_lang");
      if (stored === "fr" || stored === "en") { setLang(stored); return; }
    } catch {}
    if (navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
  }, []);

  const handleSubmit = async () => {
    if (!form.company || !form.name || !form.email || !form.revenue) {
      setError(t("Please fill in all required fields.", "Veuillez remplir tous les champs requis."));
      return;
    }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/v2/enterprise/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang }),
      });
      const json = await res.json();
      if (json.success) setSubmitted(true);
      else setError(json.error || t("Something went wrong.","Une erreur s'est produite."));
    } catch {
      setError(t("Something went wrong. Please email us at enterprise@fruxal.com","Une erreur s'est produite. Envoyez-nous un courriel à enterprise@fruxal.com"));
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#FAFAF8", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sans { font-family: 'DM Sans', system-ui, sans-serif; }
        .serif { font-family: 'Playfair Display', Georgia, serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.4s}
        input,select,textarea { font-family: 'DM Sans', system-ui, sans-serif; }
        input:focus,select:focus,textarea:focus { outline: none; border-color: #1B3A2D !important; }
        .field { width:100%; padding:11px 14px; font-size:13px; color:#1A1A18; background:white; border:1px solid #EEECE8; border-radius:8px; transition:border-color 0.15s; }
        .cta:hover { opacity:0.92; transform:translateY(-1px); }
        .cta { transition:all 0.2s; }
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(27,58,45,0.15);border-radius:2px}
      ` }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(250,250,248,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EEECE8", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <button onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1B3A2D", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" /></svg>
          </div>
          <span className="serif" style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18" }}>Fruxal</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* EN / FR pill toggle */}
          <div style={{ display: "flex", alignItems: "center", background: "#EEECE8", borderRadius: 8, padding: 3, gap: 2 }}>
            {(["en", "fr"] as const).map(l => (
              <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("fruxal_lang", l); } catch {} }} className="sans"
                style={{
                  padding: "4px 12px", fontSize: 11, fontWeight: 700,
                  color: lang === l ? "#1A1A18" : "#8E8C85",
                  background: lang === l ? "white" : "transparent",
                  border: "none", borderRadius: 6, cursor: "pointer",
                  boxShadow: lang === l ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                {l}
              </button>
            ))}
          </div>
          <a href="#contact" className="sans cta"
            style={{ padding: "7px 16px", fontSize: 13, fontWeight: 600, color: "white", background: "#1B3A2D", borderRadius: 7, textDecoration: "none" }}>
            {t("Contact Sales", "Contacter les ventes")}
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "72px 24px 64px", maxWidth: 900, margin: "0 auto" }}>
        <div className="fu d1" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(27,58,45,0.06)", border: "1px solid rgba(27,58,45,0.1)", borderRadius: 100, padding: "4px 14px", marginBottom: 24 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2D7A50", display: "inline-block" }} />
          <span className="sans" style={{ fontSize: 10, fontWeight: 700, color: "#1B3A2D", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {t("Enterprise · $5M–$200M Revenue", "Entreprise · 5 M$–200 M$ de revenus")}
          </span>
        </div>

        <h1 className="fu d2 serif" style={{ fontSize: "clamp(34px,5vw,58px)", fontWeight: 900, color: "#1A1A18", lineHeight: 1.08, marginBottom: 20, maxWidth: 700 }}>
          {t("Your business is leaking", "Votre entreprise perd")}
          <br />
          <em style={{ fontStyle: "italic", color: "#1B3A2D" }}>{t("hundreds of thousands.", "des centaines de milliers.")}</em>
          <br />
          {t("We find it. You keep it.", "Nous le trouvons. Vous le gardez.")}
        </h1>

        <p className="fu d3 sans" style={{ fontSize: 17, color: "#56554F", lineHeight: 1.75, maxWidth: 560, marginBottom: 32 }}>
          {t(
            "Fruxal conducts a full financial diagnostic on businesses doing $5M–$200M in revenue. We identify every leak across 7 categories — and we only get paid when savings are confirmed.",
            "Fruxal effectue un diagnostic financier complet pour les entreprises faisant 5 M$–200 M$ de revenus. Nous identifions chaque fuite sur 7 catégories — et nous ne sommes payés que lorsque les économies sont confirmées."
          )}
        </p>

        <div className="fu d4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="#contact" className="cta sans"
            style={{ padding: "13px 28px", fontSize: 15, fontWeight: 700, color: "white", background: "#1B3A2D", borderRadius: 8, textDecoration: "none" }}>
            {t("Get your free diagnostic assessment →", "Obtenir votre évaluation gratuite →")}
          </a>
          <a href="#process" className="sans"
            style={{ padding: "13px 20px", fontSize: 14, fontWeight: 500, color: "#56554F", border: "1px solid #EEECE8", borderRadius: 8, textDecoration: "none", background: "white" }}>
            {t("See how it works", "Voir comment ça fonctionne")}
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 40, marginTop: 48, flexWrap: "wrap" }}>
          {[
            { val: "$180K–$420K", label: t("average savings per engagement", "économies moyennes par engagement") },
            { val: "12–18%", label: t("contingency fee — only on confirmed savings", "honoraires — seulement sur les économies confirmées") },
            { val: "7", label: t("leak categories analyzed", "catégories de fuites analysées") },
          ].map(s => (
            <div key={s.val}>
              <p className="serif" style={{ fontSize: 28, fontWeight: 800, color: "#1B3A2D", lineHeight: 1 }}>{s.val}</p>
              <p className="sans" style={{ fontSize: 12, color: "#8E8C85", marginTop: 4, maxWidth: 160 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leak categories */}
      <section style={{ background: "#1B3A2D", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p className="sans" style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
            {t("7 Leak Categories", "7 Catégories de fuites")}
          </p>
          <h2 className="serif" style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 800, color: "white", marginBottom: 8, lineHeight: 1.2 }}>
            {t("Where your money is going", "Où va votre argent")}
          </h2>
          <p className="sans" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 40, maxWidth: 500 }}>
            {t("Every engagement covers all 7 categories. Most businesses have significant leaks in 3–4.", "Chaque engagement couvre les 7 catégories. La plupart des entreprises ont des fuites importantes dans 3–4.")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
            {LEAK_CATEGORIES.map((cat, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px 18px" }}>
                <p style={{ fontSize: 20, marginBottom: 8 }}>{cat.icon}</p>
                <p className="sans" style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>{isFR ? cat.fr : cat.title}</p>
                <p className="sans" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{isFR ? cat.desc_fr : cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" style={{ padding: "72px 24px", maxWidth: 900, margin: "0 auto" }}>
        <p className="sans" style={{ fontSize: 10, fontWeight: 700, color: "#B5B3AD", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
          {t("The Process", "Le processus")}
        </p>
        <h2 className="serif" style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 800, color: "#1A1A18", marginBottom: 8 }}>
          {t("From first call to confirmed savings", "Du premier appel aux économies confirmées")}
        </h2>
        <p className="sans" style={{ fontSize: 14, color: "#8E8C85", marginBottom: 48, maxWidth: 460 }}>
          {t("No surprises. Here's exactly what happens at each step.", "Pas de surprises. Voici exactement ce qui se passe à chaque étape.")}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {PROCESS_STEPS.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 24, paddingBottom: 32, position: "relative" }}>
              {i < PROCESS_STEPS.length - 1 && (
                <div style={{ position: "absolute", left: 19, top: 40, bottom: 0, width: 2, background: "#EEECE8" }} />
              )}
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1B3A2D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                <span className="sans" style={{ fontSize: 11, fontWeight: 800, color: "white" }}>{step.num}</span>
              </div>
              <div style={{ paddingTop: 8 }}>
                <p className="sans" style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18", marginBottom: 4 }}>{isFR ? step.fr_title : step.title}</p>
                <p className="sans" style={{ fontSize: 13, color: "#56554F", lineHeight: 1.7 }}>{isFR ? step.fr_desc : step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fee model */}
      <section style={{ background: "white", borderTop: "1px solid #EEECE8", borderBottom: "1px solid #EEECE8", padding: "56px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p className="sans" style={{ fontSize: 10, fontWeight: 700, color: "#B5B3AD", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
            {t("Our Fee Model", "Notre modèle d'honoraires")}
          </p>
          <h2 className="serif" style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, color: "#1A1A18", marginBottom: 16 }}>
            {t("You only pay when we find your money", "Vous ne payez que lorsque nous trouvons votre argent")}
          </h2>
          <p className="sans" style={{ fontSize: 14, color: "#56554F", lineHeight: 1.8, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
            {t(
              "No retainer. No monthly fee. No payment until savings are confirmed and documented. Our fee is 12–18% of confirmed savings — your incentives and ours are perfectly aligned.",
              "Aucune provision. Aucun abonnement mensuel. Aucun paiement jusqu'à ce que les économies soient confirmées. Nos honoraires sont 12–18% des économies confirmées."
            )}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { val: "$0", label: t("upfront cost", "coût initial") },
              { val: "12–18%", label: t("of confirmed savings only", "des économies confirmées seulement") },
              { val: "100%", label: t("transparency — you see every dollar", "transparence — vous voyez chaque dollar") },
            ].map(s => (
              <div key={s.val} style={{ background: "#FAFAF8", border: "1px solid #EEECE8", borderRadius: 10, padding: "20px 16px" }}>
                <p className="serif" style={{ fontSize: 28, fontWeight: 800, color: "#1B3A2D", marginBottom: 6 }}>{s.val}</p>
                <p className="sans" style={{ fontSize: 11, color: "#8E8C85" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" style={{ padding: "72px 24px", maxWidth: 640, margin: "0 auto" }}>
        <p className="sans" style={{ fontSize: 10, fontWeight: 700, color: "#B5B3AD", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
          {t("Get Started", "Commencer")}
        </p>
        <h2 className="serif" style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, color: "#1A1A18", marginBottom: 8 }}>
          {t("Request your free assessment", "Demandez votre évaluation gratuite")}
        </h2>
        <p className="sans" style={{ fontSize: 14, color: "#8E8C85", marginBottom: 32, lineHeight: 1.7 }}>
          {t("Fill out the form below. A Fruxal rep will reach out within 1 business day to schedule a 30-minute intro call.", "Remplissez le formulaire. Un représentant Fruxal vous contactera dans 1 jour ouvrable.")}
        </p>

        {submitted ? (
          <div style={{ background: "rgba(27,58,45,0.05)", border: "1px solid rgba(27,58,45,0.12)", borderRadius: 12, padding: "32px 28px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(27,58,45,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1B3A2D" strokeWidth="2.5" strokeLinecap="round"><path d="M4 10l4 4 8-8" /></svg>
            </div>
            <p className="serif" style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", marginBottom: 8 }}>
              {t("We'll be in touch shortly", "Nous vous contacterons sous peu")}
            </p>
            <p className="sans" style={{ fontSize: 13, color: "#8E8C85", lineHeight: 1.7 }}>
              {t("Your request has been received. A Fruxal rep will reach out within 1 business day.", "Votre demande a été reçue. Un représentant vous contactera dans 1 jour ouvrable.")}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="sans" style={{ fontSize: 11, fontWeight: 600, color: "#56554F", display: "block", marginBottom: 5 }}>{t("Company Name *", "Nom de l'entreprise *")}</label>
                <input className="field" value={form.company} onChange={e => setForm(p => ({...p, company: e.target.value}))} placeholder={t("Acme Inc.", "Acme Inc.")} />
              </div>
              <div>
                <label className="sans" style={{ fontSize: 11, fontWeight: 600, color: "#56554F", display: "block", marginBottom: 5 }}>{t("Your Name *", "Votre nom *")}</label>
                <input className="field" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder={t("Jean Tremblay", "Jean Tremblay")} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="sans" style={{ fontSize: 11, fontWeight: 600, color: "#56554F", display: "block", marginBottom: 5 }}>{t("Business Email *", "Courriel professionnel *")}</label>
                <input className="field" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="jean@acme.ca" />
              </div>
              <div>
                <label className="sans" style={{ fontSize: 11, fontWeight: 600, color: "#56554F", display: "block", marginBottom: 5 }}>{t("Phone", "Téléphone")}</label>
                <input className="field" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="514-555-0100" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="sans" style={{ fontSize: 11, fontWeight: 600, color: "#56554F", display: "block", marginBottom: 5 }}>{t("Annual Revenue *", "Revenus annuels *")}</label>
                <select className="field" value={form.revenue} onChange={e => setForm(p => ({...p, revenue: e.target.value}))}>
                  <option value="">{t("Select range", "Sélectionner")}</option>
                  <option value="5M-10M">$5M – $10M</option>
                  <option value="10M-25M">$10M – $25M</option>
                  <option value="25M-50M">$25M – $50M</option>
                  <option value="50M-100M">$50M – $100M</option>
                  <option value="100M-200M">$100M – $200M</option>
                  <option value="200M+">$200M+</option>
                </select>
              </div>
              <div>
                <label className="sans" style={{ fontSize: 11, fontWeight: 600, color: "#56554F", display: "block", marginBottom: 5 }}>{t("Province", "Province")}</label>
                <select className="field" value={form.province} onChange={e => setForm(p => ({...p, province: e.target.value}))}>
                  <option value="">{t("Select", "Sélectionner")}</option>
                  {["QC","ON","BC","AB","MB","SK","NB","NS","NL","PEI"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="sans" style={{ fontSize: 11, fontWeight: 600, color: "#56554F", display: "block", marginBottom: 5 }}>{t("Industry", "Industrie")}</label>
              <input className="field" value={form.industry} onChange={e => setForm(p => ({...p, industry: e.target.value}))} placeholder={t("e.g. Manufacturing, Construction, Retail…", "ex. Manufacture, Construction, Commerce de détail…")} />
            </div>
            <div>
              <label className="sans" style={{ fontSize: 11, fontWeight: 600, color: "#56554F", display: "block", marginBottom: 5 }}>{t("What do you think your biggest leak is? (optional)", "Quelle est votre plus grande fuite selon vous? (optionnel)")}</label>
              <textarea className="field" rows={3} value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))}
                placeholder={t("e.g. We haven't renegotiated vendor contracts in 3 years…", "ex. Nous n'avons pas renégocié nos contrats fournisseurs depuis 3 ans…")}
                style={{ resize: "vertical" }} />
            </div>
            {error && <p className="sans" style={{ fontSize: 12, color: "#B34040" }}>{error}</p>}
            <button onClick={handleSubmit} disabled={submitting} className="cta sans"
              style={{ padding: "13px 24px", fontSize: 15, fontWeight: 700, color: "white", background: "#1B3A2D", border: "none", borderRadius: 8, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? t("Submitting…", "Envoi…") : t("Request free assessment →", "Demander l'évaluation gratuite →")}
            </button>
            <p className="sans" style={{ fontSize: 11, color: "#B5B3AD", textAlign: "center" }}>
              {t("No commitment. No cost. A rep will contact you within 1 business day.", "Aucun engagement. Aucun frais. Un représentant vous contacte dans 1 jour ouvrable.")}
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "20px 24px 36px", borderTop: "1px solid #EEECE8" }}>
        <p className="sans" style={{ fontSize: 11, color: "#B5B3AD" }}>
          © 2026 Fruxal Inc. · <a href="/privacy" style={{ color: "#8E8C85", textDecoration: "none" }}>{t("Privacy", "Confidentialité")}</a> · <a href="/" style={{ color: "#8E8C85", textDecoration: "none" }}>{t("Back to Fruxal", "Retour à Fruxal")}</a> · {t("Built in Quebec", "Construit au Québec")} 🇨🇦
        </p>
      </footer>
    </div>
  );
}
