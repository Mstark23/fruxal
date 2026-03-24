"use client";
// =============================================================================
// app/enterprise/page.tsx — Fruxal Enterprise
// Aesthetic: Dark institutional, editorial, commanding
// CTA: Calendly only — no form
// =============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CALENDLY = "https://calendly.com/admin-fruxal/30min";

const LEAKS = [
  { num: "01", title: "Tax Structure",        title_fr: "Structure fiscale",        desc: "Corporate inefficiencies, missed credits, owner compensation gaps, HST/QST exposure.",      desc_fr: "Inefficacités corporatives, crédits manqués, rémunération, exposition TVQ/TPS." },
  { num: "02", title: "Vendor & Procurement", title_fr: "Fournisseurs",              desc: "Contracts never renegotiated, duplicate vendors, pricing anchored to 2019 rates.",         desc_fr: "Contrats jamais renégociés, fournisseurs en double, prix ancrés à 2019." },
  { num: "03", title: "Payroll & HR",         title_fr: "Paie & RH",                 desc: "Payroll structure, misclassified employees, benefits plans that haven't been shopped.",   desc_fr: "Structure salariale, mauvaise classification, avantages non révisés." },
  { num: "04", title: "Banking & Treasury",   title_fr: "Banque & Trésorerie",        desc: "Processing fees, idle cash earning nothing, credit facility terms that can be halved.",  desc_fr: "Frais de traitement, liquidités dormantes, conditions de crédit améliorables." },
  { num: "05", title: "Insurance",            title_fr: "Assurance",                  desc: "Overpaid premiums, duplicate coverage, policies never updated to reflect current scale.", desc_fr: "Primes excessives, couvertures redondantes, polices non mises à jour." },
  { num: "06", title: "SR&ED & Grants",       title_fr: "SR&ED et Subventions",       desc: "R&D credits, federal and provincial grants your accountant hasn't surfaced yet.",        desc_fr: "Crédits R&D, subventions fédérales et provinciales non identifiées." },
  { num: "07", title: "SaaS & Compliance",    title_fr: "Technologies & Conformité",  desc: "Unused subscriptions, redundant tools, CRA exposure, payroll remittance gaps.",          desc_fr: "Abonnements inutilisés, exposition ARC, lacunes de remise salariale." },
];

const STEPS = [
  { n: "01", title: "30-minute discovery call",  title_fr: "Appel découverte de 30 min",  desc: "We confirm your revenue, industry, and whether we're the right fit. No pitch — just a frank conversation.",                                       desc_fr: "Nous confirmons vos revenus, votre secteur et si nous sommes le bon partenaire. Pas de pitch — une conversation franche." },
  { n: "02", title: "Structured diagnostic",     title_fr: "Diagnostic structuré",         desc: "A Fruxal analyst runs a full assessment across all 7 leak categories. Typically 2–3 weeks with document collection.",                             desc_fr: "Un analyste Fruxal effectue une évaluation complète sur 7 catégories. Typiquement 2–3 semaines." },
  { n: "03", title: "Performance agreement",     title_fr: "Accord de performance",        desc: "We align on scope and a contingency fee — typically 12–18% of confirmed savings. Nothing is paid until savings are documented and verified.",      desc_fr: "Nous définissons la portée et des honoraires de performance — typiquement 12–18% des économies confirmées." },
  { n: "04", title: "Recovery work",             title_fr: "Travail de récupération",      desc: "Your dedicated rep executes the findings — vendor renegotiations, CRA submissions, insurance shopping, banking term revisions.",                  desc_fr: "Votre représentant exécute les résultats — renégociations, soumissions ARC, assurances, révisions bancaires." },
  { n: "05", title: "Confirmed & invoiced",      title_fr: "Confirmé et facturé",          desc: "Every dollar of savings is documented. You receive an invoice for our fee only on what was actually recovered — and verified by your team.",      desc_fr: "Chaque dollar économisé est documenté. Vous ne payez que sur ce qui a été récupéré et vérifié par votre équipe." },
];

export default function EnterprisePage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en"|"fr">("en");
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  useEffect(() => {
    try {
      const s = localStorage.getItem("fruxal_lang");
      if (s === "fr" || s === "en") { setLang(s); return; }
    } catch { /* noop */ }
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
  }, []);

  function openCalendly() { window.open(CALENDLY, "_blank", "noopener noreferrer"); }

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#FAFAF8", color: "#1A1A18", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .sans{font-family:'Inter',system-ui,sans-serif}
        .serif{font-family:'DM Serif Display',Georgia,serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .fu{animation:fadeUp .8s cubic-bezier(0.16,1,0.3,1) both}
        .d1{animation-delay:.1s}.d2{animation-delay:.25s}.d3{animation-delay:.4s}.d4{animation-delay:.55s}.d5{animation-delay:.7s}
        .cta-btn{transition:all .2s;cursor:pointer;border:none}
        .cta-btn:hover{background:#2A5A44!important;transform:translateY(-1px)}
        .outline-btn{transition:all .2s;cursor:pointer;text-decoration:none}
        .outline-btn:hover{background:#F0EFEB!important}
        .leak-card{transition:background .2s,border-color .2s}
        .leak-card:hover{background:#F5F4F0!important}
        .nav-link{color:#B5B3AD;text-decoration:none;font-size:11px;font-weight:300;transition:color .15s}
        .nav-link:hover{color:#56554F}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* NAV */}
      <nav style={{ position:"sticky",top:0,zIndex:50,background:"rgba(250,250,248,0.96)",backdropFilter:"blur(16px)",borderBottom:"1px solid #EEECE8",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px" }}>
        <button onClick={() => router.push("/")} style={{ display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer" }}>
          <div style={{ width:28,height:28,borderRadius:6,background:"#1B3A2D",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="serif" style={{ fontSize:15,color:"#1A1A18",letterSpacing:"-0.3px" }}>Fruxal</span>
          <span className="sans" style={{ fontSize:9,fontWeight:600,color:"#8E8C85",textTransform:"uppercase",letterSpacing:"0.12em",marginLeft:2 }}>Enterprise</span>
        </button>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ display:"flex",background:"#EEECE8",borderRadius:6,padding:2,gap:1 }}>
            {(["en","fr"] as const).map(l => (
              <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("fruxal_lang",l); } catch {} }}
                className="sans"
                style={{ padding:"4px 11px",fontSize:10,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:lang===l?"#1A1A18":"rgba(255,255,255,0.3)",background:lang===l?"white":"transparent",border:"none",borderRadius:4,cursor:"pointer",transition:"all .15s" }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={openCalendly} className="cta-btn sans"
            style={{ padding:"8px 18px",fontSize:12,fontWeight:600,color:"white",background:"#1B3A2D",borderRadius:6 }}>
            {t("Book a call","Réserver un appel")}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position:"relative",padding:"96px 32px 72px",maxWidth:1100,margin:"0 auto",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,right:-80,width:480,height:480,borderRadius:"50%",background:"radial-gradient(circle, rgba(27,58,45,0.06) 0%, transparent 70%)",pointerEvents:"none" }} />
        <div style={{ position:"absolute",bottom:0,left:-160,width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle, rgba(27,58,45,0.04) 0%, transparent 70%)",pointerEvents:"none" }} />

        <div className="fu d1" style={{ display:"inline-flex",alignItems:"center",gap:7,background:"rgba(27,58,45,0.12)",border:"1px solid rgba(27,58,45,0.06)",borderRadius:100,padding:"5px 14px",marginBottom:28 }}>
          <span style={{ width:5,height:5,borderRadius:"50%",background:"#1B3A2D",display:"inline-block",animation:"pulse 2s ease infinite" }} />
          <span className="sans" style={{ fontSize:10,fontWeight:600,color:"#1B3A2D",textTransform:"uppercase",letterSpacing:"0.1em" }}>
            {t("Canadian Enterprise · $1M+ Revenue","Entreprise canadienne · 1 M$+ de revenus")}
          </span>
        </div>

        <h1 className="fu d2 serif" style={{ fontSize:"clamp(42px,5.5vw,70px)",fontWeight:400,color:"#1A1A18",lineHeight:1.05,marginBottom:24,maxWidth:740,letterSpacing:"-1.5px" }}>
          {t("Your business is leaking","Votre entreprise perd")}
          <br />
          <em style={{ fontStyle:"italic",color:"#1B3A2D" }}>{t("hundreds of thousands.","des centaines de milliers.")}</em>
          <br />
          <span style={{ color:"#56554F" }}>{t("We find it. You keep it.","Nous le trouvons. Vous le gardez.")}</span>
        </h1>

        <p className="fu d3 sans" style={{ fontSize:18,color:"#56554F",lineHeight:1.75,maxWidth:540,marginBottom:40,fontWeight:300 }}>
          {t(
            "Fruxal runs a full forensic financial diagnostic across 7 leak categories. We only get paid when savings are confirmed and documented.",
            "Fruxal effectue un diagnostic financier forensique sur 7 catégories. Nous ne sommes payés que lorsque les économies sont confirmées et documentées."
          )}
        </p>

        <div className="fu d4" style={{ display:"flex",gap:12,flexWrap:"wrap",marginBottom:64 }}>
          <button onClick={openCalendly} className="cta-btn sans"
            style={{ padding:"15px 32px",fontSize:15,fontWeight:600,color:"white",background:"#1B3A2D",borderRadius:8 }}>
            {t("Book your free discovery call →","Réserver votre appel découverte gratuit →")}
          </button>
          <a href="#process" className="outline-btn sans"
            style={{ padding:"15px 22px",fontSize:14,fontWeight:400,color:"#56554F",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,background:"transparent" }}>
            {t("See how it works","Voir comment ça fonctionne")}
          </a>
        </div>

        <div className="fu d5" style={{ display:"flex",gap:0,flexWrap:"wrap",borderTop:"1px solid #EEECE8",paddingTop:40 }}>
          {[
            { val:"$180K–$420K", label:t("average savings per engagement","économies moyennes par engagement") },
            { val:"12–18%",      label:t("contingency fee — confirmed savings only","honoraires — économies confirmées seulement") },
            { val:"$0",          label:t("upfront cost","coût initial") },
            { val:"7",           label:t("leak categories analyzed","catégories de fuites analysées") },
          ].map((s,i) => (
            <div key={i} style={{ flex:"1 1 150px",padding:"0 32px 0 0",borderRight:i<3?"1px solid #EEECE8":"none",marginRight:i<3?32:0 }}>
              <p className="serif" style={{ fontSize:30,color:"#1A1A18",letterSpacing:"-1px",marginBottom:6 }}>{s.val}</p>
              <p className="sans" style={{ fontSize:11,color:"#8E8C85",lineHeight:1.5,fontWeight:300 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEAK CATEGORIES */}
      <section style={{ borderTop:"1px solid #EEECE8",padding:"72px 32px" }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:44,flexWrap:"wrap",gap:16 }}>
            <div>
              <p className="sans" style={{ fontSize:10,fontWeight:600,color:"#B5B3AD",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10 }}>
                {t("7 Leak Categories","7 Catégories de fuites")}
              </p>
              <h2 className="serif" style={{ fontSize:"clamp(26px,3.5vw,42px)",color:"#1A1A18",fontWeight:400,letterSpacing:"-0.8px",lineHeight:1.1 }}>
                {t("Where your money is going","Où va votre argent")}
              </h2>
            </div>
            <p className="sans" style={{ fontSize:13,color:"#8E8C85",maxWidth:300,lineHeight:1.7,fontWeight:300 }}>
              {t("Most businesses have significant leaks in 3–4 categories. Every engagement covers all 7.","La plupart des entreprises ont des fuites dans 3–4 catégories. Chaque engagement couvre les 7.")}
            </p>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:1,border:"1px solid #EEECE8",borderRadius:14,overflow:"hidden" }}>
            {LEAKS.map((l,i) => (
              <div key={i} className="leak-card"
                style={{ background:"white",padding:"26px 22px",borderRight:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid #EEECE8" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                  <span className="sans" style={{ fontSize:10,fontWeight:600,color:"#B5B3AD",letterSpacing:"0.1em" }}>{l.num}</span>
                  <div style={{ flex:1,height:1,background:"#EEECE8" }} />
                </div>
                <p className="serif" style={{ fontSize:16,color:"#1A1A18",marginBottom:8,letterSpacing:"-0.3px" }}>{isFR?l.title_fr:l.title}</p>
                <p className="sans" style={{ fontSize:12,color:"#8E8C85",lineHeight:1.7,fontWeight:300 }}>{isFR?l.desc_fr:l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEE MODEL */}
      <section style={{ margin:"0 32px",background:"rgba(27,58,45,0.04)",border:"1px solid rgba(27,58,45,0.1)",borderRadius:16,padding:"60px 48px" }}>
        <div style={{ maxWidth:760,margin:"0 auto",textAlign:"center" }}>
          <p className="sans" style={{ fontSize:10,fontWeight:600,color:"#1B3A2D",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:14 }}>
            {t("Our Fee Model","Notre modèle d'honoraires")}
          </p>
          <h2 className="serif" style={{ fontSize:"clamp(24px,3vw,38px)",color:"#1A1A18",fontWeight:400,marginBottom:14,letterSpacing:"-0.8px" }}>
            {t("You only pay when we find your money","Vous ne payez que lorsque nous trouvons votre argent")}
          </h2>
          <p className="sans" style={{ fontSize:14,color:"#56554F",lineHeight:1.8,maxWidth:480,margin:"0 auto 44px",fontWeight:300 }}>
            {t(
              "No retainer. No monthly fee. No payment until savings are confirmed and documented by your team.",
              "Aucune provision. Aucun abonnement. Aucun paiement jusqu'à ce que les économies soient confirmées par votre équipe."
            )}
          </p>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
            {[
              { val:"$0",    label:t("upfront cost","coût initial") },
              { val:"12–18%",label:t("of confirmed savings only","des économies confirmées seulement") },
              { val:"100%",  label:t("transparency","transparence totale") },
            ].map(s => (
              <div key={s.val} style={{ background:"white",border:"1px solid #EEECE8",borderRadius:12,padding:"26px 18px" }}>
                <p className="serif" style={{ fontSize:34,color:"#1B3A2D",letterSpacing:"-1px",marginBottom:8 }}>{s.val}</p>
                <p className="sans" style={{ fontSize:11,color:"#8E8C85",fontWeight:300 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" style={{ padding:"72px 32px" }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <p className="sans" style={{ fontSize:10,fontWeight:600,color:"#B5B3AD",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10 }}>
            {t("The Process","Le processus")}
          </p>
          <h2 className="serif" style={{ fontSize:"clamp(26px,3.5vw,42px)",color:"#1A1A18",fontWeight:400,marginBottom:52,letterSpacing:"-0.8px" }}>
            {t("From first call to confirmed savings","Du premier appel aux économies confirmées")}
          </h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:0 }}>
            {STEPS.map((s,i) => (
              <div key={i} style={{ padding:"0 24px 0 0",position:"relative" }}>
                {i < STEPS.length-1 && (
                  <div style={{ position:"absolute",top:18,left:"calc(100% - 24px)",right:0,height:1,background:"#EEECE8" }} />
                )}
                <div style={{ width:36,height:36,borderRadius:8,background:"rgba(27,58,45,0.08)",border:"1px solid rgba(27,58,45,0.15)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18,position:"relative",zIndex:1 }}>
                  <span className="sans" style={{ fontSize:10,fontWeight:600,color:"#1B3A2D" }}>{s.n}</span>
                </div>
                <p className="serif" style={{ fontSize:14,color:"#1A1A18",marginBottom:8,letterSpacing:"-0.2px",lineHeight:1.3 }}>{isFR?s.title_fr:s.title}</p>
                <p className="sans" style={{ fontSize:11,color:"#8E8C85",lineHeight:1.75,fontWeight:300 }}>{isFR?s.desc_fr:s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ padding:"72px 32px",borderTop:"1px solid #EEECE8" }}>
        <div style={{ maxWidth:640,margin:"0 auto",textAlign:"center" }}>
          <h2 className="serif" style={{ fontSize:"clamp(28px,4vw,50px)",color:"#1A1A18",fontWeight:400,letterSpacing:"-1px",marginBottom:14,lineHeight:1.1 }}>
            {t("Ready to find what you're missing?","Prêt à trouver ce que vous manquez ?")}
          </h2>
          <p className="sans" style={{ fontSize:14,color:"#56554F",marginBottom:32,fontWeight:300,lineHeight:1.7 }}>
            {t(
              "Book a free 30-minute call. We'll tell you whether we're the right fit — before any commitment.",
              "Réservez un appel gratuit de 30 minutes. Nous vous dirons si nous sommes le bon partenaire — avant tout engagement."
            )}
          </p>
          <button onClick={openCalendly} className="cta-btn sans"
            style={{ padding:"15px 36px",fontSize:15,fontWeight:600,color:"white",background:"#1B3A2D",borderRadius:8,display:"inline-block" }}>
            {t("Book your free 30-min call →","Réserver votre appel gratuit de 30 min →")}
          </button>
          <p className="sans" style={{ fontSize:11,color:"#B5B3AD",marginTop:12,fontWeight:300 }}>
            {t("No commitment · No upfront cost · Canadian businesses only","Aucun engagement · Aucun frais initial · Entreprises canadiennes uniquement")}
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid #EEECE8",padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
        <p className="sans" style={{ fontSize:11,color:"#B5B3AD",fontWeight:300 }}>
          © 2026 Fruxal Inc. · {t("Built in Québec","Construit au Québec")} 🇨🇦
        </p>
        <div style={{ display:"flex",gap:20 }}>
          {[{label:t("Back to Fruxal","Retour à Fruxal"),href:"/"},{label:t("Privacy","Confidentialité"),href:"/legal/privacy"},{label:t("Terms","Conditions"),href:"/legal/terms"}].map(l => (
            <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
