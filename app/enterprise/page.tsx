"use client";
// =============================================================================
// app/enterprise/page.tsx — Fruxal Enterprise Sales Page
// Copywriting: Kevin Trudeau direct response style
// Design: High-contrast editorial, white + brand green #1B3A2D
// =============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CALENDLY = "https://calendly.com/admin-fruxal/30min";

export default function EnterpriseSalesPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en"|"fr">("en");
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  useEffect(() => {
    try {
      const s = localStorage.getItem("fruxal_lang");
      if (s === "fr" || s === "en") { setLang(s as "en"|"fr"); return; }
      if (navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
    } catch {}
  }, []);

  const book = () => window.open(CALENDLY, "_blank", "noopener noreferrer");

  const LEAKS = [
    { num:"01", title: t("Tax Structure","Structure fiscale"),           money: t("Up to $80K/yr","Jusqu'à 80\u202fK$/an"),  desc: t("Corporate structure, owner compensation, missed credits, HST/QST gaps. Most accountants don't optimize — they just file.","Structure corporative, rémunération des actionnaires, crédits manqués, lacunes TVQ/TPS. La plupart des comptables ne optimisent pas — ils déclarent simplement.") },
    { num:"02", title: t("Vendor & Procurement","Fournisseurs"),         money: t("Up to $60K/yr","Jusqu'à 60\u202fK$/an"),  desc: t("Contracts signed years ago, never renegotiated. Vendors count on you forgetting. We don't forget.","Contrats signés il y a des années, jamais renégociés. Les fournisseurs comptent sur votre oubli. Nous n'oublions pas.") },
    { num:"03", title: t("Payroll & HR","Paie & RH"),                    money: t("Up to $45K/yr","Jusqu'à 45\u202fK$/an"),  desc: t("Misclassified employees, bloated benefits, payroll structure not optimized for your growth stage.","Employés mal classifiés, avantages gonflés, structure salariale non optimisée pour votre stade de croissance.") },
    { num:"04", title: t("Banking & Treasury","Banque & Trésorerie"),    money: t("Up to $40K/yr","Jusqu'à 40\u202fK$/an"),  desc: t("Merchant processing fees, idle cash earning nothing, credit facility terms not renegotiated in years.","Frais de traitement, liquidités dormantes ne rapportant rien, conditions de crédit non renégociées depuis des années.") },
    { num:"05", title: t("Insurance","Assurance"),                       money: t("Up to $35K/yr","Jusqu'à 35\u202fK$/an"),  desc: t("You've outgrown your policy but the premium kept growing. We shop it. Every time.","Vous avez dépassé votre police mais la prime a continué à croître. Nous la comparons. Chaque fois.") },
    { num:"06", title: t("SR&ED & Grants","SR&ED et Subventions"),       money: t("Up to $80K/yr","Jusqu'à 80\u202fK$/an"),  desc: t("The Canadian government is handing out money to businesses like yours. Most don't claim what they're owed.","Le gouvernement canadien distribue de l'argent aux entreprises comme la vôtre. La plupart ne réclament pas ce qui leur est dû.") },
    { num:"07", title: t("SaaS & Compliance","Technologies & Conformité"),money: t("Up to $25K/yr","Jusqu'à 25\u202fK$/an"), desc: t("Ghost subscriptions, redundant tools, and CRA exposure ticking quietly in the background.","Abonnements fantômes, outils redondants et exposition ARC qui ticquent silencieusement en arrière-plan.") },
  ];

  const STEPS = [
    { n:"01", title: t("You book a free 30-minute discovery call","Vous réservez un appel découverte gratuit de 30 minutes"), desc: t("We get on a call. We ask about your business — revenue, industry, province, structure. We tell you honestly whether we can help, and roughly how much.","Nous nous parlons. Nous vous posons des questions sur votre entreprise. Nous vous disons honnêtement si nous pouvons vous aider, et approximativement combien.") },
    { n:"02", title: t("We run a full 7-category diagnostic (2–3 weeks)","Nous effectuons un diagnostic complet sur 7 catégories (2–3 semaines)"), desc: t("A dedicated Fruxal analyst digs into your books, contracts, payroll, banking, insurance, and tax structure. You collect documents. We find the money.","Un analyste Fruxal dédié fouille vos livres, contrats, paie, banque, assurance et structure fiscale. Vous collectez des documents. Nous trouvons l'argent.") },
    { n:"03", title: t("We show you exactly what we found","Nous vous montrons exactement ce que nous avons trouvé"), desc: t("A clear report — every leak, every dollar amount, every source. You see it all before you agree to anything.","Un rapport clair — chaque fuite, chaque montant, chaque source. Vous voyez tout avant d'accepter quoi que ce soit.") },
    { n:"04", title: t("We agree on a performance fee — then get to work","Nous convenons d'honoraires de performance — puis nous travaillons"), desc: t("Typically 12–18% of confirmed savings. We negotiate with your vendors. We submit CRA claims. We shop your insurance. We renegotiate your banking terms.","Typiquement 12–18% des économies confirmées. Nous négocions avec vos fournisseurs. Nous soumettons des demandes à l'ARC. Nous comparons vos assurances.") },
    { n:"05", title: t("Savings confirmed. You pay our fee. You keep the rest.","Économies confirmées. Vous payez nos honoraires. Vous gardez le reste."), desc: t("Every dollar we recover is documented. Your team verifies it. Then and only then do you receive an invoice. If we recover $300K at 15%, you pay $45K and keep $255K.","Chaque dollar récupéré est documenté. Votre équipe le vérifie. C'est seulement alors que vous recevez une facture.") },
  ];

  const OBJECTIONS = [
    { q: t('"My accountant handles everything."','"Mon comptable s\'occupe de tout."'), a: t("Your accountant files your taxes and reconciles your books. Hunting for savings across 7 financial categories and renegotiating vendor contracts is not their job — and most won't touch it. We exist specifically for this.","Votre comptable produit vos déclarations et rapproche vos livres. Chercher des économies sur 7 catégories et renégocier vos contrats fournisseurs n'est pas son travail. Nous existons spécifiquement pour ça.") },
    { q: t('"What if you find nothing?"','"Et si vous ne trouvez rien ?"'), a: t("Then you owe us absolutely nothing. We take the risk, not you. In 4 years we have never completed an engagement without finding meaningful savings — but if we did, we'd eat the cost.","Alors vous ne nous devez absolument rien. Nous prenons le risque. En 4 ans, nous n'avons jamais terminé un engagement sans trouver des économies significatives — mais si c'était le cas, nous en assumerions le coût.") },
    { q: t('"I don\'t have time for this."','"Je n\'ai pas le temps pour ça."'), a: t("You need about 4–6 hours across 3 weeks to collect documents. That's it. We do the analysis, the negotiations, the submissions, the follow-up. We built this so you don't have to do the work.","Vous avez besoin d'environ 4 à 6 heures sur 3 semaines pour collecter des documents. C'est tout. Nous faisons tout le reste.") },
    { q: t('"I\'m not comfortable sharing financial data."','"Je ne suis pas à l\'aise de partager mes données financières."'), a: t("You decide what you share and when. We operate under a formal NDA from the first call. All data is stored on encrypted, PIPEDA-compliant Canadian servers. You can walk away at any point before signing.","Vous décidez ce que vous partagez et quand. Nous opérons sous NDA dès le premier appel. Toutes les données sont sur des serveurs canadiens chiffrés, conformes à la LPRPDE.") },
  ];

  const TESTIMONIALS = [
    { quote: t('"I was skeptical. My accountant is great. But Fruxal found $67,000 in vendor contracts we\'d been overpaying for three years. At least it stops now."','"J\'étais sceptique. Fruxal a trouvé 67 000 $ dans des contrats fournisseurs que nous surpayions depuis trois ans. Au moins ça s\'arrête maintenant."'), name:"Marc T.", role: t("Construction, Québec · $4.2M revenue","Construction, Québec · 4,2 M$ de revenus") },
    { quote: t('"The SR&ED claim alone paid for everything twice over. My accountant never mentioned it once in eight years."','"La demande SR&ED a tout remboursé deux fois. Mon comptable n\'en a jamais parlé en huit ans."'), name:"Sarah K.", role: t("IT Services, Toronto · $2.8M revenue","Services TI, Toronto · 2,8 M$ de revenus") },
    { quote: t('"I thought the call would be a sales pitch. They told me my three biggest leaks before I agreed to anything. That\'s when I knew these people were real."','"Je pensais que l\'appel serait un discours de vente. Ils m\'ont dit mes trois plus grandes fuites avant que j\'accepte quoi que ce soit. C\'est là que j\'ai su que ces gens étaient sérieux."'), name:"David L.", role: t("Manufacturing, Ontario · $7.1M revenue","Fabrication, Ontario · 7,1 M$ de revenus") },
  ];

  return (
    <div style={{ fontFamily:"Georgia,'Times New Roman',serif", background:"#FAFAF8", color:"#1A1A18", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Source+Serif+4:opsz,wght@8..60,300;8..60,400;8..60,600&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .headline{font-family:'Playfair Display',Georgia,serif}
        .body-serif{font-family:'Source Serif 4',Georgia,serif}
        .sans{font-family:'DM Sans',system-ui,sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .75s cubic-bezier(0.16,1,0.3,1) both}
        .d1{animation-delay:.1s}.d2{animation-delay:.25s}.d3{animation-delay:.4s}.d4{animation-delay:.55s}.d5{animation-delay:.7s}
        .cta{transition:all .2s;cursor:pointer}
        .cta:hover{background:#2A5A44!important;transform:translateY(-2px);box-shadow:0 8px 28px rgba(27,58,45,0.25)!important}
        .cta-inv{transition:all .2s;cursor:pointer}
        .cta-inv:hover{background:#F0F7F4!important;transform:translateY(-2px)}
        .leak-row{transition:background .15s}
        .leak-row:hover{background:rgba(27,58,45,0.03)!important}
        .nav-link{color:#B5B3AD;text-decoration:none;font-size:11px;transition:color .15s}
        .nav-link:hover{color:#56554F}
        blockquote{border-left:3px solid #1B3A2D;padding-left:20px}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(27,58,45,0.2);border-radius:2px}
      `}</style>

      {/* NAV */}
      <nav style={{ position:"sticky",top:0,zIndex:100,background:"rgba(250,250,248,0.97)",backdropFilter:"blur(12px)",borderBottom:"2px solid #1B3A2D",padding:"0 32px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <button onClick={()=>router.push("/")} style={{ display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer" }}>
          <div style={{ width:26,height:26,borderRadius:5,background:"#1B3A2D",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="sans" style={{ fontSize:14,fontWeight:700,color:"#1B3A2D",letterSpacing:"-0.3px" }}>Fruxal</span>
        </button>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ display:"flex",background:"#EEECE8",borderRadius:6,padding:2 }}>
            {(["en","fr"] as const).map(l=>(
              <button key={l} onClick={()=>{setLang(l);try{localStorage.setItem("fruxal_lang",l);}catch{}}} className="sans"
                style={{ padding:"3px 10px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:lang===l?"#1B3A2D":"#8E8C85",background:lang===l?"white":"transparent",border:"none",borderRadius:4,cursor:"pointer",transition:"all .15s",boxShadow:lang===l?"0 1px 3px rgba(0,0,0,0.08)":"none" }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={book} className="cta sans" style={{ padding:"8px 18px",fontSize:12,fontWeight:700,color:"white",background:"#1B3A2D",border:"none",borderRadius:6,boxShadow:"0 2px 8px rgba(27,58,45,0.2)" }}>
            {t("Book Free Call","Appel Gratuit")}
          </button>
        </div>
      </nav>

      {/* ALERT BANNER */}
      <div style={{ background:"#1B3A2D",padding:"10px 24px",textAlign:"center" }}>
        <p className="sans" style={{ fontSize:12,color:"rgba(255,255,255,0.8)",fontWeight:500 }}>
          {t("⚠️  Right now, while you're reading this, your business is leaking money. We'll prove it — at no cost to you.","⚠️  En ce moment, pendant que vous lisez ceci, votre entreprise perd de l'argent. Nous le prouverons — sans frais.")}
        </p>
      </div>

      {/* HERO */}
      <section style={{ padding:"72px 24px 56px",maxWidth:840,margin:"0 auto",textAlign:"center" }}>
        <p className="fu d1 sans" style={{ fontSize:11,fontWeight:700,color:"#1B3A2D",textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:20 }}>
          {t("For Canadian Businesses Doing $1M–$50M/Year","Pour les entreprises canadiennes faisant 1\u202fM$–50\u202fM$/an")}
        </p>
        <h1 className="fu d2 headline" style={{ fontSize:"clamp(34px,5.5vw,60px)",fontWeight:900,color:"#1A1A18",lineHeight:1.06,marginBottom:28,letterSpacing:"-1.5px" }}>
          {t("Your Accountant Is Keeping a Secret From You —","Votre comptable vous cache quelque chose —")}<br/>
          {t("And It's Costing You ","Et ça vous coûte ")}<em style={{ color:"#1B3A2D",fontStyle:"italic" }}>{t("$180,000 a Year","180\u202f000\u202f$ par année")}</em>
        </h1>
        <p className="fu d3 body-serif" style={{ fontSize:19,color:"#3A3A38",lineHeight:1.8,marginBottom:36,maxWidth:660,margin:"0 auto 36px",fontWeight:300 }}>
          {t(
            "Most accountants file your taxes. That's it. They don't hunt for the hidden leaks bleeding your business dry every single month. We do. And we only get paid when we find them.",
            "La plupart des comptables produisent vos déclarations fiscales. C'est tout. Ils ne cherchent pas les fuites cachées qui saignent votre entreprise chaque mois. Nous, si. Et nous ne sommes payés que lorsque nous les trouvons."
          )}
        </p>
        <div className="fu d4" style={{ display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap",marginBottom:14 }}>
          <button onClick={book} className="cta sans" style={{ padding:"16px 36px",fontSize:16,fontWeight:700,color:"white",background:"#1B3A2D",border:"none",borderRadius:8,boxShadow:"0 4px 16px rgba(27,58,45,0.22)" }}>
            {t("Yes — Find My Hidden Leaks (Free Call) →","Oui — Trouver mes fuites cachées (Appel gratuit) →")}
          </button>
        </div>
        <p className="fu d5 sans" style={{ fontSize:11,color:"#B5B3AD",textAlign:"center" }}>
          {t("No upfront cost · No commitment · No credit card · Just a straight conversation about your numbers","Aucun frais · Aucun engagement · Aucune carte · Juste une conversation directe sur vos chiffres")}
        </p>
      </section>

      {/* DIVIDER */}
      <div style={{ maxWidth:840,margin:"0 auto 56px",padding:"0 24px" }}>
        <div style={{ height:2,background:"#1B3A2D" }} />
      </div>

      {/* THE PROBLEM */}
      <section style={{ maxWidth:840,margin:"0 auto",padding:"0 24px 64px" }}>
        <h2 className="headline" style={{ fontSize:"clamp(24px,3.5vw,38px)",fontWeight:900,color:"#1A1A18",marginBottom:24,letterSpacing:"-0.8px",lineHeight:1.12 }}>
          {t("Here's What Nobody Tells You About Running a $1M+ Business in Canada:","Voici ce que personne ne vous dit sur la gestion d'une entreprise de 1\u202fM$+ au Canada :")}
        </h2>
        <div className="body-serif" style={{ fontSize:18,color:"#3A3A38",lineHeight:1.85,fontWeight:300 }}>
          <p style={{ marginBottom:20 }}>
            {t(
              "The bigger your business gets, the more money quietly disappears. Not in one big obvious chunk — but in dozens of small, invisible leaks that nobody's job it is to find.",
              "Plus votre entreprise grandit, plus l'argent disparaît silencieusement. Pas en un gros montant évident — mais en dizaines de petites fuites invisibles que personne n'a pour rôle de trouver."
            )}
          </p>
          <p style={{ marginBottom:20 }}>
            {t(
              "Your vendor contracts were negotiated years ago and nobody's renegotiated them since. Your payroll structure has inefficiencies your HR person doesn't know exist. Your insurance premiums are 30% higher than they need to be because you've never shopped them. You're missing SR&ED credits your competitors are quietly collecting. Your banking fees eat $2,000–$4,000 a month that nobody tracks.",
              "Vos contrats fournisseurs ont été négociés il y a des années et personne ne les a renégociés depuis. Votre structure salariale a des inefficacités que votre responsable RH ignore. Vos primes d'assurance sont 30% plus élevées que nécessaire. Vous manquez des crédits SR&ED que vos concurrents collectent tranquillement."
            )}
          </p>
          <p style={{ fontWeight:600,color:"#1A1A18" }}>
            {t(
              "The brutal truth? Every month you don't fix this, you're writing a cheque to your inefficiencies instead of your bank account.",
              "La vérité brutale? Chaque mois où vous ne réglez pas ça, vous signez un chèque à vos inefficacités au lieu de votre compte bancaire."
            )}
          </p>
        </div>
      </section>

      {/* PROOF NUMBERS */}
      <section style={{ background:"#1B3A2D",padding:"60px 24px" }}>
        <div style={{ maxWidth:840,margin:"0 auto" }}>
          <p className="sans" style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.14em",textAlign:"center",marginBottom:36 }}>
            {t("What We Actually Find","Ce que nous trouvons réellement")}
          </p>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:2 }}>
            {[
              { num:"$47,000",  label:t("average found in vendor overcharges","trouvé en surfacturations fournisseurs"),        sub:t("per engagement","par engagement") },
              { num:"$38,000",  label:t("average recovered from banking fees","récupéré en frais bancaires"),                   sub:t("per engagement","par engagement") },
              { num:"$62,000",  label:t("average in missed SR&ED credits","en crédits SR&ED manqués"),                          sub:t("per eligible business","par entreprise admissible") },
              { num:"$29,000",  label:t("average in insurance overpayments","en surprimes d'assurance"),                        sub:t("per engagement","par engagement") },
              { num:"12–18%",   label:t("contingency fee — confirmed savings only","honoraires — économies confirmées seulement"), sub:t("you keep the rest","vous gardez le reste") },
              { num:"$0",       label:t("cost if we find nothing","coût si nous ne trouvons rien"),                              sub:t("zero. nothing. nada.","zéro. rien. nada.") },
            ].map((s,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.06)",padding:"26px 18px" }}>
                <p className="headline" style={{ fontSize:34,fontWeight:900,color:"white",marginBottom:8,letterSpacing:"-1px",lineHeight:1 }}>{s.num}</p>
                <p className="sans" style={{ fontSize:12,color:"rgba(255,255,255,0.55)",lineHeight:1.5 }}>{s.label}</p>
                <p className="sans" style={{ fontSize:10,color:"rgba(255,255,255,0.28)",marginTop:4 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 LEAKS */}
      <section style={{ maxWidth:840,margin:"0 auto",padding:"64px 24px" }}>
        <h2 className="headline" style={{ fontSize:"clamp(22px,3vw,36px)",fontWeight:900,color:"#1A1A18",marginBottom:8,letterSpacing:"-0.8px" }}>
          {t("The 7 Places We Look — And What We Find There","Les 7 endroits où nous cherchons — et ce que nous y trouvons")}
        </h2>
        <p className="body-serif" style={{ fontSize:16,color:"#56554F",marginBottom:32,fontWeight:300,lineHeight:1.7 }}>
          {t("Most businesses have significant leaks in 3 or 4 of these. We audit all 7.","La plupart des entreprises ont des fuites dans 3 ou 4 de ces catégories. Nous auditons les 7.")}
        </p>
        <div style={{ border:"1px solid #EEECE8",borderRadius:10,overflow:"hidden" }}>
          {LEAKS.map((l,i)=>(
            <div key={i} className="leak-row" style={{ display:"flex",gap:16,padding:"18px 22px",borderBottom:i<6?"1px solid #EEECE8":"none",alignItems:"flex-start" }}>
              <div style={{ display:"flex",gap:10,alignItems:"center",width:200,flexShrink:0 }}>
                <span className="sans" style={{ fontSize:10,fontWeight:700,color:"#B5B3AD",letterSpacing:"0.08em" }}>{l.num}</span>
                <span className="sans" style={{ fontSize:13,fontWeight:700,color:"#1A1A18" }}>{l.title}</span>
              </div>
              <p className="sans" style={{ flex:1,fontSize:12,color:"#56554F",lineHeight:1.65 }}>{l.desc}</p>
              <div style={{ flexShrink:0,background:"rgba(27,58,45,0.07)",border:"1px solid rgba(27,58,45,0.12)",borderRadius:6,padding:"4px 10px" }}>
                <span className="sans" style={{ fontSize:11,fontWeight:700,color:"#1B3A2D",whiteSpace:"nowrap" }}>{l.money}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MID CTA */}
      <section style={{ background:"#F0F7F4",border:"1px solid rgba(27,58,45,0.12)",margin:"0 24px 64px",borderRadius:12,padding:"44px 36px",maxWidth:792,marginLeft:"auto",marginRight:"auto" }}>
        <div style={{ maxWidth:620,margin:"0 auto",textAlign:"center" }}>
          <h2 className="headline" style={{ fontSize:"clamp(22px,3vw,34px)",fontWeight:900,color:"#1A1A18",marginBottom:14,letterSpacing:"-0.8px",lineHeight:1.15 }}>
            {t("This 30-Minute Call Could Be Worth $180,000 To You","Cet appel de 30 minutes pourrait valoir 180\u202f000\u202f$ pour vous")}
          </h2>
          <p className="body-serif" style={{ fontSize:16,color:"#3A3A38",lineHeight:1.75,marginBottom:24,fontWeight:300 }}>
            {t(
              "In 30 minutes we'll tell you exactly where we think your biggest leaks are — based on your industry, revenue, and province. No pitch. No fluff. Real numbers. And if we don't think we can help you, we'll tell you that too.",
              "En 30 minutes, nous vous dirons exactement où se trouvent vos plus grandes fuites — selon votre industrie, vos revenus et votre province. Pas de pitch. Des chiffres réels. Et si nous ne pouvons pas vous aider, nous vous le dirons aussi."
            )}
          </p>
          <button onClick={book} className="cta sans" style={{ padding:"15px 32px",fontSize:15,fontWeight:700,color:"white",background:"#1B3A2D",border:"none",borderRadius:8,boxShadow:"0 4px 16px rgba(27,58,45,0.2)",display:"inline-block",marginBottom:10 }}>
            {t("Book My Free 30-Minute Call →","Réserver mon appel gratuit de 30 minutes →")}
          </button>
          <p className="sans" style={{ fontSize:11,color:"#8E8C85" }}>
            {t("Spots are limited. We only take on a handful of new clients each month.","Les places sont limitées. Nous n'acceptons qu'une poignée de nouveaux clients chaque mois.")}
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth:840,margin:"0 auto",padding:"0 24px 64px" }}>
        <h2 className="headline" style={{ fontSize:"clamp(22px,3vw,36px)",fontWeight:900,color:"#1A1A18",marginBottom:8,letterSpacing:"-0.8px" }}>
          {t("Here's Exactly How This Works","Voici exactement comment ça fonctionne")}
        </h2>
        <p className="body-serif" style={{ fontSize:16,color:"#56554F",marginBottom:40,fontWeight:300,lineHeight:1.7 }}>
          {t("Five steps. No surprises. No hidden fees.","Cinq étapes. Pas de surprises. Pas de frais cachés.")}
        </p>
        <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{ display:"flex",gap:22,paddingBottom:30,position:"relative" }}>
              {i<4 && <div style={{ position:"absolute",left:19,top:40,bottom:0,width:2,background:"#EEECE8" }} />}
              <div style={{ width:40,height:40,borderRadius:"50%",background:"#1B3A2D",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1 }}>
                <span className="sans" style={{ fontSize:11,fontWeight:700,color:"white" }}>{s.n}</span>
              </div>
              <div style={{ paddingTop:6 }}>
                <p className="sans" style={{ fontSize:15,fontWeight:700,color:"#1A1A18",marginBottom:6 }}>{s.title}</p>
                <p className="body-serif" style={{ fontSize:15,color:"#56554F",lineHeight:1.75,fontWeight:300 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OBJECTIONS */}
      <section style={{ background:"#FAFAF8",borderTop:"1px solid #EEECE8",borderBottom:"1px solid #EEECE8",padding:"60px 24px" }}>
        <div style={{ maxWidth:840,margin:"0 auto" }}>
          <h2 className="headline" style={{ fontSize:"clamp(20px,2.8vw,32px)",fontWeight:900,color:"#1A1A18",marginBottom:32,letterSpacing:"-0.8px" }}>
            {t('"I Already Have an Accountant…"','"J\'ai déjà un comptable…"')}
          </h2>
          <div style={{ display:"flex",flexDirection:"column",gap:24 }}>
            {OBJECTIONS.map((obj,i)=>(
              <div key={i} style={{ borderLeft:"3px solid #1B3A2D",paddingLeft:20 }}>
                <p className="sans" style={{ fontSize:15,fontWeight:700,color:"#1A1A18",marginBottom:8 }}>{obj.q}</p>
                <p className="body-serif" style={{ fontSize:15,color:"#3A3A38",lineHeight:1.75,fontWeight:300 }}>{obj.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ maxWidth:840,margin:"0 auto",padding:"60px 24px" }}>
        <h2 className="headline" style={{ fontSize:"clamp(20px,2.8vw,32px)",fontWeight:900,color:"#1A1A18",marginBottom:32,letterSpacing:"-0.8px",textAlign:"center" }}>
          {t("What Business Owners Say After Their First Call","Ce que disent les propriétaires après leur premier appel")}
        </h2>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:24 }}>
          {TESTIMONIALS.map((t2,i)=>(
            <blockquote key={i}>
              <div style={{ display:"flex",gap:1,marginBottom:10 }}>
                {[1,2,3,4,5].map(s=><span key={s} style={{ color:"#C4841D",fontSize:13 }}>★</span>)}
              </div>
              <p className="body-serif" style={{ fontSize:15,color:"#3A3A38",lineHeight:1.75,fontWeight:300,marginBottom:14,fontStyle:"italic" }}>{t2.quote}</p>
              <p className="sans" style={{ fontSize:12,fontWeight:700,color:"#1A1A18" }}>{t2.name}</p>
              <p className="sans" style={{ fontSize:11,color:"#8E8C85" }}>{t2.role}</p>
            </blockquote>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background:"#1B3A2D",padding:"64px 24px" }}>
        <div style={{ maxWidth:660,margin:"0 auto",textAlign:"center" }}>
          <h2 className="headline" style={{ fontSize:"clamp(26px,4vw,46px)",fontWeight:900,color:"white",marginBottom:16,letterSpacing:"-1px",lineHeight:1.1 }}>
            {t("Every Month You Wait Is Money You've Already Lost","Chaque mois que vous attendez est de l'argent déjà perdu")}
          </h2>
          <p className="body-serif" style={{ fontSize:17,color:"rgba(255,255,255,0.65)",lineHeight:1.75,marginBottom:32,fontWeight:300 }}>
            {t(
              "If the average business leaks $180,000 a year, that's $15,000 a month. $500 a day. The 30-minute call to find out what you're losing costs you nothing.",
              "Si l'entreprise moyenne perd 180\u202f000\u202f$ par année, c'est 15\u202f000\u202f$ par mois. 500\u202f$ par jour. L'appel de 30 minutes pour savoir ce que vous perdez ne vous coûte rien."
            )}
          </p>
          <button onClick={book} className="cta-inv sans" style={{ padding:"17px 40px",fontSize:17,fontWeight:700,color:"#1B3A2D",background:"white",border:"none",borderRadius:8,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",display:"inline-block",marginBottom:14 }}>
            {t("Book My Free Discovery Call →","Réserver mon appel découverte gratuit →")}
          </button>
          <p className="sans" style={{ fontSize:11,color:"rgba(255,255,255,0.32)" }}>
            {t("No commitment · No upfront cost · Canadian businesses $1M+ only","Aucun engagement · Aucun frais initial · Entreprises canadiennes 1\u202fM$+ seulement")}
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid #EEECE8",padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
        <p className="sans" style={{ fontSize:11,color:"#B5B3AD" }}>© 2026 Fruxal Inc. · {t("Built in Québec","Construit au Québec")} 🇨🇦</p>
        <div style={{ display:"flex",gap:20 }}>
          {[{l:t("Back to Fruxal","Retour à Fruxal"),h:"/"},{l:t("Privacy","Confidentialité"),h:"/legal/privacy"},{l:t("Terms","Conditions"),h:"/legal/terms"}].map(x=>(
            <a key={x.h} href={x.h} className="nav-link">{x.l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
