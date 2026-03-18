// =============================================================================
// src/app/v2/tier3/page.tsx — Fruxal Tier 3 Client Dashboard
// Read-only view for $50M–$200M business owners
// Shows: engagement progress, diagnostic findings, confirmed savings, docs, invoice
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Finding { id: string; category: string; description: string; confirmedAmount: number; confirmedAt: string; notes?: string }
interface DocItem { id: string; label: string; type: string; status: "pending"|"received"|"reviewed"; uploadedAt?: string }
interface DiagLeak { title?: string; amount?: number; category?: string; confidence?: number }

interface EngagementData {
  id: string; companyName: string; status: string;
  startedAt: string; targetCompletion?: string;
  feePercentage: number; stageIndex: number; stages: string[];
  estimatedLow: number; estimatedHigh: number;
  confirmedSavings: number; feeOwed: number;
  documents: { total: number; received: number; items: DocItem[] };
  findings: Finding[];
  invoice: { confirmedSavings: number; feePercentage: number; feeOwed: number; paidAt?: string; status: string };
  agreementSigned: boolean; agreementId?: string;
}

interface DiagnosticData {
  companyName: string; createdAt: string;
  summary?: { totalEstimatedLow: number; totalEstimatedHigh: number; feeRangeLow: number; feeRangeHigh: number };
  leaks: DiagLeak[];
}

const STAGE_LABELS: Record<string, { en: string; fr: string; icon: string }> = {
  intake:              { en: "Intake",           fr: "Admission",         icon: "📋" },
  diagnostic:          { en: "Diagnostic",       fr: "Diagnostic",        icon: "🔍" },
  agreement:           { en: "Agreement",        fr: "Entente",           icon: "📝" },
  document_collection: { en: "Documents",        fr: "Documents",         icon: "📁" },
  active_recovery:     { en: "Active Recovery",  fr: "Récupération",      icon: "⚡" },
  confirmed:           { en: "Confirmed",        fr: "Confirmé",          icon: "✅" },
  invoiced:            { en: "Invoiced",         fr: "Facturé",           icon: "💳" },
  complete:            { en: "Complete",         fr: "Terminé",           icon: "🎉" },
};

const CAT_LABELS: Record<string, { en: string; fr: string }> = {
  tax_structure:        { en: "Tax Structure",          fr: "Structure fiscale" },
  vendor_procurement:   { en: "Vendor & Procurement",   fr: "Fournisseurs" },
  payroll_hr:           { en: "Payroll & HR",           fr: "Paie & RH" },
  banking_treasury:     { en: "Banking & Treasury",     fr: "Banque & Trésorerie" },
  insurance:            { en: "Insurance",              fr: "Assurance" },
  saas_technology:      { en: "SaaS & Technology",      fr: "Technologies" },
  compliance_penalties: { en: "Compliance",             fr: "Conformité" },
};

export default function Tier3ClientDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [lang, setLang] = useState<"en"|"fr">("en");
  const isFR = lang === "fr";
  const t = useCallback((en: string, fr: string) => isFR ? fr : en, [isFR]);

  const [loading, setLoading] = useState(true);
  const [engagement, setEngagement] = useState<EngagementData|null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticData|null>(null);
  const [stage, setStage] = useState<string>("");
  const [tab, setTab] = useState<"overview"|"findings"|"documents"|"invoice">("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("lg_prescan_lang");
      if (s === "en" || s === "fr") setLang(s as "en"|"fr");
      else if (navigator.language?.startsWith("fr")) setLang("fr");
    } catch {}
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v2/tier3/client");
      const json = await res.json();
      if (json.success) {
        setStage(json.stage || "");
        setDiagnostic(json.diagnostic || null);
        setEngagement(json.engagement || null);
      }
    } catch {}
    finally {
      setLoading(false);
      requestAnimationFrame(() => setMounted(true));
    }
  };

  const fade = (d = 0) => ({ opacity: mounted?1:0, transform: mounted?"none":"translateY(8px)", transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${d}s` });

  const stageList = engagement?.stages || Object.keys(STAGE_LABELS);
  const currentStageIdx = engagement?.stageIndex ?? 0;

  const recoveryPct = engagement && engagement.estimatedHigh > 0
    ? Math.min(100, Math.round((engagement.confirmedSavings / engagement.estimatedHigh) * 100))
    : 0;

  const TABS = [
    { id:"overview",   label: t("Overview","Aperçu") },
    { id:"findings",   label: t("Findings","Résultats") },
    { id:"documents",  label: t("Documents","Documents") },
    { id:"invoice",    label: t("Invoice","Facture") },
  ];

  if (loading || authLoading) return (
    <div style={{minHeight:"100vh",background:"#FAFAF8",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:28,height:28,border:"2px solid #EEECE8",borderTopColor:"#1B3A2D",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // No engagement yet — show waiting state
  if (!engagement && !diagnostic) return (
    <div style={{minHeight:"100vh",background:"#FAFAF8",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{textAlign:"center",maxWidth:380}}>
        <div style={{width:48,height:48,borderRadius:14,background:"rgba(27,58,45,0.07)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <p style={{fontSize:18,fontWeight:700,color:"#1A1A18",fontFamily:"Georgia,serif",marginBottom:8}}>
          {t("Your engagement is being set up","Votre engagement est en cours de configuration")}
        </p>
        <p style={{fontSize:13,color:"#8E8C85",lineHeight:1.7,marginBottom:20}}>
          {t("Your Fruxal rep will reach out shortly to begin the diagnostic process.","Votre représentant Fruxal vous contactera sous peu pour démarrer le processus.")}
        </p>
        <a href="mailto:hello@fruxal.com" style={{fontSize:13,fontWeight:600,color:"#1B3A2D",textDecoration:"underline"}}>
          {t("Questions? Contact your rep →","Questions? Contactez votre représentant →")}
        </a>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#FAFAF8",fontFamily:"system-ui,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .row-hover:hover{background:#F8F7F5;}
        .tab-btn{background:none;border:none;cursor:pointer;font-family:inherit;}
      `}</style>

      <div style={{maxWidth:900,margin:"0 auto",padding:"24px 20px 60px"}}>

        {/* Header */}
        <div style={{,marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12, opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(8px)", transition: "all 0.5s ease 0s" }}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:10,fontWeight:700,color:"#1B3A2D",background:"rgba(27,58,45,0.07)",padding:"2px 10px",borderRadius:100,textTransform:"uppercase",letterSpacing:"0.08em"}}>
                Tier 3
              </span>
              <span style={{fontSize:10,fontWeight:600,color:"#8E8C85",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                {engagement ? STAGE_LABELS[engagement.status]?.[isFR?"fr":"en"] || engagement.status : t("Pending","En attente")}
              </span>
            </div>
            <h1 style={{fontSize:24,fontWeight:700,color:"#1A1A18",fontFamily:"Georgia,serif",marginBottom:2}}>
              {engagement?.companyName || diagnostic?.companyName || t("Your Engagement","Votre engagement")}
            </h1>
            {engagement?.startedAt && (
              <p style={{fontSize:12,color:"#8E8C85"}}>
                {t("Engagement started","Engagement démarré")} {new Date(engagement.startedAt).toLocaleDateString(isFR?"fr-CA":"en-CA",{month:"long",day:"numeric",year:"numeric"})}
              </p>
            )}
          </div>
          <button onClick={() => setLang(isFR?"en":"fr")}
            style={{padding:"4px 10px",fontSize:10,fontWeight:600,color:"#8E8C85",background:"white",border:"1px solid #EEECE8",borderRadius:6,cursor:"pointer"}}>
            {isFR?"EN":"FR"}
          </button>
        </div>

        {/* Stage progress bar */}
        {engagement && (
          <div style={{,background:"white",border:"1px solid #EEECE8",borderRadius:12,padding:"18px 20px",marginBottom:20,overflowX:"auto", opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(8px)", transition: "all 0.5s ease 0.05s" }}>
            <p style={{fontSize:10,fontWeight:700,color:"#B5B3AD",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>
              {t("Engagement Progress","Progression de l'engagement")}
            </p>
            <div style={{display:"flex",alignItems:"center",gap:0,minWidth:500}}>
              {stageList.map((s, i) => {
                const isDone = i < currentStageIdx;
                const isCurrent = i === currentStageIdx;
                const info = STAGE_LABELS[s];
                return (
                  <div key={s} style={{display:"flex",alignItems:"center",flex:i<stageList.length-1?1:"initial"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                      <div style={{
                        width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                        background: isDone?"#1B3A2D":isCurrent?"rgba(27,58,45,0.1)":"#F5F4F1",
                        border: isCurrent?"2px solid #1B3A2D":"2px solid transparent",
                        flexShrink:0,
                      }}>
                        {isDone ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
                        ) : (
                          <span style={{fontSize:10}}>{info?.icon||"•"}</span>
                        )}
                      </div>
                      <p style={{fontSize:9,fontWeight:isCurrent?700:400,color:isCurrent?"#1B3A2D":isDone?"#56554F":"#B5B3AD",whiteSpace:"nowrap",textAlign:"center"}}>
                        {info?.[isFR?"fr":"en"]||s}
                      </p>
                    </div>
                    {i < stageList.length-1 && (
                      <div style={{flex:1,height:2,background:isDone?"#1B3A2D":"#EEECE8",margin:"0 4px",marginBottom:18}}/>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KPI row */}
        {engagement && (
          <div style={{,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20, opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(8px)", transition: "all 0.5s ease 0.1s" }}>
            {[
              {
                label: t("Est. Savings Range","Économies estimées"),
                val: `$${(engagement.estimatedLow/1000).toFixed(0)}K–$${(engagement.estimatedHigh/1000).toFixed(0)}K`,
                sub: t("from diagnostic","du diagnostic"), color:"#1A1A18"
              },
              {
                label: t("Confirmed Savings","Économies confirmées"),
                val: `$${engagement.confirmedSavings.toLocaleString()}`,
                sub: `${recoveryPct}% ${t("of estimate","de l'estimation")}`, color:"#2D7A50"
              },
              {
                label: t("Documents", "Documents"),
                val: `${engagement.documents.received}/${engagement.documents.total}`,
                sub: t("submitted","soumis"), color:"#1A1A18"
              },
              {
                label: t("Fee Owed","Honoraires"),
                val: `$${engagement.feeOwed.toLocaleString()}`,
                sub: `${engagement.feePercentage}% ${t("of confirmed","des confirmées")}`, color: engagement.invoice.status==="paid"?"#2D7A50":"#C4841D"
              },
            ].map(k => (
              <div key={k.label} style={{background:"white",border:"1px solid #EEECE8",borderRadius:10,padding:"16px 16px"}}>
                <p style={{fontSize:9,fontWeight:700,color:"#B5B3AD",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{k.label}</p>
                <p style={{fontSize:20,fontWeight:800,color:k.color,lineHeight:1,fontFamily:"Georgia,serif",marginBottom:4}}>{k.val}</p>
                <p style={{fontSize:10,color:"#B5B3AD"}}>{k.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{,display:"flex",gap:0,borderBottom:"1px solid #EEECE8",marginBottom:20, opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(8px)", transition: "all 0.5s ease 0.12s" }}>
          {TABS.map(tb => (
            <button key={tb.id} className="tab-btn" onClick={() => setTab(tb.id as any)}
              style={{padding:"10px 18px",fontSize:13,fontWeight:tab===tb.id?600:400,color:tab===tb.id?"#1A1A18":"#8E8C85",borderBottom:tab===tb.id?"2px solid #1B3A2D":"2px solid transparent",marginBottom:-1,transition:"all 0.15s"}}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

            {/* Diagnostic Findings Summary */}
            <div style={{background:"white",border:"1px solid #EEECE8",borderRadius:10,overflow:"hidden"}}>
              <div style={{padding:"14px 18px",borderBottom:"1px solid #EEECE8"}}>
                <p style={{fontSize:11,fontWeight:700,color:"#B5B3AD",textTransform:"uppercase",letterSpacing:"0.08em"}}>{t("Diagnostic Findings","Résultats du diagnostic")}</p>
              </div>
              {(diagnostic?.leaks||[]).slice(0,5).map((lk,i) => (
                <div key={i} className="row-hover" style={{padding:"12px 18px",borderBottom:"1px solid #F5F4F1",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <p style={{fontSize:12,fontWeight:600,color:"#1A1A18"}}>{lk.title||t("Finding","Résultat")} {i+1}</p>
                    <p style={{fontSize:10,color:"#8E8C85"}}>{lk.category||""}</p>
                  </div>
                  {lk.amount && <p style={{fontSize:13,fontWeight:700,color:"#B34040"}}>${lk.amount.toLocaleString()}</p>}
                </div>
              ))}
              {!diagnostic?.leaks?.length && (
                <p style={{fontSize:12,color:"#B5B3AD",padding:"16px 18px",textAlign:"center"}}>{t("Diagnostic in progress","Diagnostic en cours")}</p>
              )}
              {(diagnostic?.leaks?.length||0) > 5 && (
                <div style={{padding:"10px 18px",background:"#FAFAF8"}}>
                  <button onClick={() => setTab("findings")} style={{fontSize:11,fontWeight:600,color:"#1B3A2D",background:"none",border:"none",cursor:"pointer"}}>
                    {t(`View all ${diagnostic?.leaks?.length} findings →`,`Voir les ${diagnostic?.leaks?.length} résultats →`)}
                  </button>
                </div>
              )}
            </div>

            {/* Recovery progress */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              <div style={{background:"white",border:"1px solid #EEECE8",borderRadius:10,padding:"18px"}}>
                <p style={{fontSize:11,fontWeight:700,color:"#B5B3AD",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>{t("Recovery Progress","Progression de récupération")}</p>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{flex:1,height:8,background:"#F0EFEB",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:Math.max(recoveryPct,1) + "%",background:"#2D7A50",borderRadius:4,transition:"width 1s ease"}}/>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:"#2D7A50",width:36,textAlign:"right"}}>{recoveryPct}%</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#B5B3AD"}}>
                  <span>${(engagement?.confirmedSavings||0).toLocaleString()} {t("confirmed","confirmées")}</span>
                  <span>${(engagement?.estimatedHigh||0).toLocaleString()} {t("potential","potentiel")}</span>
                </div>
              </div>

              {/* Confirmed findings list */}
              <div style={{background:"white",border:"1px solid #EEECE8",borderRadius:10,overflow:"hidden",flex:1}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid #EEECE8",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <p style={{fontSize:11,fontWeight:700,color:"#B5B3AD",textTransform:"uppercase",letterSpacing:"0.08em"}}>{t("Confirmed Recoveries","Récupérations confirmées")}</p>
                  <span style={{fontSize:10,fontWeight:700,color:"#2D7A50",background:"rgba(45,122,80,0.08)",padding:"2px 8px",borderRadius:100}}>
                    ${(engagement?.confirmedSavings||0).toLocaleString()}
                  </span>
                </div>
                {(engagement?.findings||[]).slice(0,4).map((f,i) => (
                  <div key={f.id||i} className="row-hover" style={{padding:"12px 18px",borderBottom:"1px solid #F5F4F1",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1,marginRight:12}}>
                      <p style={{fontSize:12,fontWeight:600,color:"#1A1A18",marginBottom:2}}>{f.description}</p>
                      <p style={{fontSize:10,color:"#8E8C85"}}>{CAT_LABELS[f.category]?.[isFR?"fr":"en"]||f.category} · {new Date(f.confirmedAt).toLocaleDateString(isFR?"fr-CA":"en-CA")}</p>
                    </div>
                    <p style={{fontSize:14,fontWeight:700,color:"#2D7A50",flexShrink:0}}>${f.confirmedAmount.toLocaleString()}</p>
                  </div>
                ))}
                {!engagement?.findings?.length && (
                  <p style={{fontSize:12,color:"#B5B3AD",padding:"16px 18px",textAlign:"center"}}>{t("No confirmed recoveries yet","Aucune récupération confirmée pour l'instant")}</p>
                )}
              </div>
            </div>

            {/* Rep contact */}
            <div style={{background:"#1B3A2D",borderRadius:10,padding:"20px",gridColumn:"1/3"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div>
                  <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>
                    {t("Your Fruxal Rep","Votre représentant Fruxal")}
                  </p>
                  <p style={{fontSize:15,fontWeight:700,color:"white",marginBottom:4}}>
                    {t("Questions about your engagement?","Des questions sur votre engagement?")}
                  </p>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>
                    {t("Your rep manages all the details. Reach out any time for a status update.","Votre représentant gère tous les détails. Contactez-le en tout temps.")}
                  </p>
                </div>
                <a href="mailto:hello@fruxal.com"
                  style={{padding:"10px 20px",fontSize:13,fontWeight:600,color:"#1B3A2D",background:"white",borderRadius:8,textDecoration:"none",flexShrink:0}}>
                  {t("Contact rep →","Contacter le représentant →")}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── FINDINGS TAB ── */}
        {tab === "findings" && (
          <div style={{background:"white",border:"1px solid #EEECE8",borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #EEECE8",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:"#1A1A18"}}>{t("All Diagnostic Findings","Tous les résultats du diagnostic")}</p>
                <p style={{fontSize:12,color:"#8E8C85",marginTop:2}}>
                  {t("Identified during your Fruxal diagnostic.","Identifiés lors de votre diagnostic Fruxal.")}
                  {diagnostic?.summary && ` $${(diagnostic.summary.totalEstimatedLow/1000).toFixed(0)}K–$${(diagnostic.summary.totalEstimatedHigh/1000).toFixed(0)}K ${t("estimated","estimé")}`}
                </p>
              </div>
            </div>
            {(diagnostic?.leaks||[]).map((lk, i) => (
              <div key={i} className="row-hover" style={{padding:"16px 20px",borderBottom:"1px solid #F5F4F1",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <p style={{fontSize:13,fontWeight:600,color:"#1A1A18"}}>{lk.title||`Finding ${i+1}`}</p>
                    {lk.category && (
                      <span style={{fontSize:9,fontWeight:700,color:"#8E8C85",background:"#F5F4F1",padding:"1px 6px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                        {CAT_LABELS[lk.category]?.[isFR?"fr":"en"]||lk.category}
                      </span>
                    )}
                  </div>
                  {lk.confidence && (
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{height:3,width:48,background:"#EEECE8",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",width:lk.confidence + "%",background:lk.confidence>70?"#2D7A50":lk.confidence>40?"#d97706":"#B34040",borderRadius:2}}/>
                      </div>
                      <p style={{fontSize:10,color:"#B5B3AD"}}>{lk.confidence}% {t("confidence","confiance")}</p>
                    </div>
                  )}
                </div>
                {lk.amount && (
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <p style={{fontSize:16,fontWeight:700,color:"#B34040"}}>${lk.amount.toLocaleString()}</p>
                    <p style={{fontSize:10,color:"#B5B3AD"}}>{t("estimated","estimé")}</p>
                  </div>
                )}
              </div>
            ))}
            {!diagnostic?.leaks?.length && (
              <p style={{padding:40,textAlign:"center",fontSize:13,color:"#B5B3AD"}}>{t("Diagnostic in progress","Diagnostic en cours")}</p>
            )}
          </div>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {tab === "documents" && (
          <div style={{background:"white",border:"1px solid #EEECE8",borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #EEECE8",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:"#1A1A18"}}>{t("Document Checklist","Liste de documents")}</p>
                <p style={{fontSize:12,color:"#8E8C85",marginTop:2}}>
                  {engagement?.documents.received||0}/{engagement?.documents.total||0} {t("submitted","soumis")}
                </p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:10,color:"#8E8C85",marginBottom:4}}>{t("Send documents to:","Envoyez les documents à:")}</p>
                <a href="mailto:docs@fruxal.com" style={{fontSize:12,fontWeight:600,color:"#1B3A2D",textDecoration:"underline"}}>docs@fruxal.com</a>
              </div>
            </div>

            {(engagement?.documents.items||[]).map((doc, i) => (
              <div key={doc.id||i} className="row-hover" style={{padding:"14px 20px",borderBottom:"1px solid #F5F4F1",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                  <div style={{
                    width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                    background: doc.status==="reviewed"?"rgba(27,58,45,0.08)":doc.status==="received"?"rgba(45,122,80,0.06)":"rgba(179,64,64,0.05)",
                  }}>
                    {doc.status==="reviewed" ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#1B3A2D" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
                    ) : doc.status==="received" ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#2D7A50" strokeWidth="2" strokeLinecap="round"><path d="M6 2v6M3 6l3 3 3-3"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#B34040" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="8" height="8" rx="1"/></svg>
                    )}
                  </div>
                  <div>
                    <p style={{fontSize:13,fontWeight:600,color:"#1A1A18"}}>{doc.label}</p>
                    {doc.uploadedAt && (
                      <p style={{fontSize:10,color:"#8E8C85"}}>{t("Received","Reçu")} {new Date(doc.uploadedAt).toLocaleDateString(isFR?"fr-CA":"en-CA")}</p>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:100,textTransform:"uppercase",letterSpacing:"0.06em",flexShrink:0,
                  color: doc.status==="reviewed"?"#1B3A2D":doc.status==="received"?"#2D7A50":"#B34040",
                  background: doc.status==="reviewed"?"rgba(27,58,45,0.08)":doc.status==="received"?"rgba(45,122,80,0.08)":"rgba(179,64,64,0.07)",
                }}>
                  {doc.status==="reviewed"?t("Reviewed","Examiné"):doc.status==="received"?t("Received","Reçu"):t("Pending","Requis")}
                </span>
              </div>
            ))}
            {!engagement?.documents.items?.length && (
              <p style={{padding:40,textAlign:"center",fontSize:13,color:"#B5B3AD"}}>{t("No documents requested yet.","Aucun document demandé pour l'instant.")}</p>
            )}
          </div>
        )}

        {/* ── INVOICE TAB ── */}
        {tab === "invoice" && (
          <div style={{maxWidth:520,margin:"0 auto"}}>
            <div style={{background:"white",border:"1px solid #EEECE8",borderRadius:12,overflow:"hidden"}}>

              {/* Invoice header */}
              <div style={{background:"#1B3A2D",padding:"24px 24px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Fruxal Inc.</p>
                    <p style={{fontSize:18,fontWeight:700,color:"white"}}>{t("Performance Fee Statement","État des honoraires de performance")}</p>
                  </div>
                  <span style={{
                    fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:100,textTransform:"uppercase",
                    background: engagement?.invoice.status==="paid"?"rgba(45,122,80,0.3)":"rgba(196,132,29,0.3)",
                    color: engagement?.invoice.status==="paid"?"#7EC8A0":"#F5C97A",
                  }}>
                    {engagement?.invoice.status==="paid"?t("Paid","Payé"):t("Outstanding","En attente")}
                  </span>
                </div>
              </div>

              <div style={{padding:"24px"}}>
                {/* Line items */}
                <div style={{marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F5F4F1"}}>
                    <p style={{fontSize:12,color:"#56554F"}}>{t("Confirmed savings recovered","Économies confirmées récupérées")}</p>
                    <p style={{fontSize:12,fontWeight:600,color:"#1A1A18"}}>${(engagement?.invoice.confirmedSavings||0).toLocaleString()}</p>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F5F4F1"}}>
                    <p style={{fontSize:12,color:"#56554F"}}>{t("Performance fee rate","Taux d'honoraires")}</p>
                    <p style={{fontSize:12,fontWeight:600,color:"#1A1A18"}}>{engagement?.invoice.feePercentage||12}%</p>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",background:"#FAFAF8",borderRadius:8,marginTop:8,paddingLeft:12,paddingRight:12}}>
                    <p style={{fontSize:14,fontWeight:700,color:"#1A1A18"}}>{t("Total fee owed","Total des honoraires")}</p>
                    <p style={{fontSize:20,fontWeight:800,color:"#1A1A18",fontFamily:"Georgia,serif"}}>${(engagement?.invoice.feeOwed||0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Fee model explanation */}
                <div style={{background:"rgba(27,58,45,0.04)",border:"1px solid rgba(27,58,45,0.08)",borderRadius:8,padding:"14px 16px",marginBottom:20}}>
                  <p style={{fontSize:11,fontWeight:700,color:"#1B3A2D",marginBottom:4}}>{t("How our fee works","Comment nos honoraires fonctionnent")}</p>
                  <p style={{fontSize:12,color:"#56554F",lineHeight:1.7}}>
                    {t(
                      `You only pay when savings are confirmed. Our ${engagement?.invoice.feePercentage||12}% fee is calculated on the actual dollars recovered for your business — nothing more.`,
                      `Vous ne payez que lorsque les économies sont confirmées. Nos honoraires de ${engagement?.invoice.feePercentage||12}% sont calculés sur les dollars réellement récupérés.`
                    )}
                  </p>
                </div>

                {/* Payment status */}
                {engagement?.invoice.status === "paid" ? (
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"rgba(45,122,80,0.06)",borderRadius:8,border:"1px solid rgba(45,122,80,0.12)"}}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#2D7A50" strokeWidth="2.5" strokeLinecap="round"><path d="M2 8l4 4 8-8"/></svg>
                    <p style={{fontSize:12,fontWeight:600,color:"#2D7A50"}}>
                      {t("Paid","Payé")} {engagement.invoice.paidAt ? new Date(engagement.invoice.paidAt).toLocaleDateString(isFR?"fr-CA":"en-CA") : ""}
                    </p>
                  </div>
                ) : (
                  <a href="mailto:billing@fruxal.com?subject=Fee Payment"
                    style={{display:"block",textAlign:"center",padding:"12px 20px",fontSize:14,fontWeight:600,color:"white",background:"#1B3A2D",borderRadius:8,textDecoration:"none"}}>
                    {t("Questions about your invoice? Contact billing →","Questions sur votre facture? Contactez la facturation →")}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}