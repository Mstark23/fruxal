"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface ChatMsg { id: string; role: "assistant" | "user"; content: string }
interface PrescanResponse {
  sessionId: string | null; message: string; rawMessage?: string;
  completed: boolean; prescanRunId?: string;
  analysis?: { fhScore: number; dhScore: number; totalLeak: number; leaks: any[] };
}

export default function GoPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en"|"fr">("en");
  const isFR = lang === "fr";
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [rawHistory, setRawHistory] = useState<Array<{role:string;content:string}>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string|null>(null);
  const [preparing, setPreparing] = useState(false);
  const [result, setResult] = useState<{analysis:any;prescanRunId:string}|null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
  }, []);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("lg_go_result");
      if (s) { setResult(JSON.parse(s)); setStarted(true); }
      const m = sessionStorage.getItem("lg_go_msgs");
      try { if (m) setMessages(JSON.parse(m)); } catch { /* non-fatal */ }
      const sid = sessionStorage.getItem("lg_go_sid");
      if (sid) setSessionId(sid);
      const h = sessionStorage.getItem("lg_go_hist");
      try { if (h) setRawHistory(JSON.parse(h)); } catch { /* non-fatal */ }
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    if (messages.length > 0) {
      try {
        sessionStorage.setItem("lg_go_msgs", JSON.stringify(messages));
        if (sessionId) sessionStorage.setItem("lg_go_sid", sessionId);
        if (rawHistory.length > 0) sessionStorage.setItem("lg_go_hist", JSON.stringify(rawHistory));
      } catch { /* non-fatal */ }
    }
  }, [messages, loading, sessionId, rawHistory]);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const start = async () => {
    if (started) return;
    setStarted(true); setLoading(true);
    try {
      const res = await fetch("/api/v3/prescan-chat", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ sessionId: null, message: isFR ? "Bonjour, prêt à commencer." : "Hi, ready to start.", history: [], lang, country: "CA" }),
      });
      const d: PrescanResponse = await res.json();
      setSessionId(d.sessionId);
      setMessages([{ id:"a0", role:"assistant", content:d.message }]);
      setRawHistory([
        { role:"user", content: isFR ? "Bonjour, prêt à commencer." : "Hi, ready to start." },
        { role:"assistant", content: d.rawMessage || d.message },
      ]);
    } catch { setMessages([{id:"err",role:"assistant",content:"Something went wrong. Please refresh."}]); }
    finally { setLoading(false); }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim(); setInput("");
    setMessages(p => [...p, {id:`u${Date.now()}`,role:"user",content:text}]);
    setLoading(true);
    try {
      const res = await fetch("/api/v3/prescan-chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ sessionId, message: text, history: rawHistory, lang, country: "CA" }),
      });
      const d: PrescanResponse = await res.json();
      if (!sessionId && d.sessionId) setSessionId(d.sessionId);
      setRawHistory(p => [...p, {role:"user",content:text}, {role:"assistant",content:d.rawMessage||d.message}]);
      if (d.completed && d.prescanRunId && d.analysis) {
        setPreparing(true);
        setTimeout(() => {
          setPreparing(false);
          const r = {analysis:d.analysis!,prescanRunId:d.prescanRunId!};
          setResult(r);
          try { sessionStorage.setItem("lg_go_result", JSON.stringify(r)); } catch { /* non-fatal */ }
        }, 1800);
      } else {
        setMessages(p => [...p, {id:`a${Date.now()}`,role:"assistant",content:d.message}]);
      }
    } catch { setMessages(p => [...p, {id:"err2",role:"assistant",content:"Something went wrong."}]); }
    finally { setLoading(false); }
  };

  const t = (en:string, fr:string) => isFR ? fr : en;

  return (
    <div style={{fontFamily:"'Georgia',serif",background:"#FAFAF8",minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .serif{font-family:'Playfair Display',Georgia,serif;}
        .sans{font-family:'DM Sans',system-ui,sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounceD{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .fu{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;}
        .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.45s}
        .b1{animation:bounceD 1s ease-in-out infinite;animation-delay:0ms}
        .b2{animation:bounceD 1s ease-in-out infinite;animation-delay:150ms}
        .b3{animation:bounceD 1s ease-in-out infinite;animation-delay:300ms}
        input:focus{outline:none;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(27,58,45,0.15);border-radius:2px}
      `}</style>

      {/* Nav */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,background:"rgba(250,250,248,0.94)",backdropFilter:"blur(12px)",borderBottom:"1px solid #EEECE8",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:26,height:26,borderRadius:6,background:"#1B3A2D",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="serif" style={{fontSize:15,fontWeight:700,color:"#1A1A18"}}>Fruxal</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={() => setLang(isFR?"en":"fr")} className="sans"
            style={{padding:"3px 9px",fontSize:10,fontWeight:600,color:"#8E8C85",background:"white",border:"1px solid #E8E6E1",borderRadius:5,cursor:"pointer"}}>
            {isFR?"EN":"FR"}
          </button>
          <a href="/login" className="sans" style={{padding:"5px 12px",fontSize:12,fontWeight:500,color:"#56554F",textDecoration:"none"}}>
            {t("Sign in","Connexion")}
          </a>
        </div>
      </nav>

      {/* Hero + Chat */}
      <section style={{paddingTop:72,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 20px 40px"}}>
        <div style={{maxWidth:600,width:"100%"}}>

          {/* Badge */}
          <div className="fu d1 sans" style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(27,58,45,0.06)",border:"1px solid rgba(27,58,45,0.1)",borderRadius:100,padding:"4px 12px",fontSize:10,fontWeight:600,color:"#1B3A2D",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:20}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#2D7A50",display:"inline-block"}}/>
            {t("Free · No account required · 5 minutes","Gratuit · Sans compte · 5 minutes")}
          </div>

          {/* Headline */}
          <h1 className="fu d2 serif" style={{fontSize:"clamp(32px,5vw,52px)",fontWeight:900,color:"#1A1A18",lineHeight:1.1,marginBottom:16}}>
            {t("Your business is","Votre entreprise")}
            <br/>
            <em style={{fontStyle:"italic",color:"#1B3A2D"}}>{t("leaking money.","perd de l'argent.")}</em>
            <br/>
            {t("Find out how much.","Découvrez combien.")}
          </h1>

          {/* Sub */}
          <p className="fu d3 sans" style={{fontSize:16,color:"#56554F",lineHeight:1.7,marginBottom:28,maxWidth:460}}>
            {t(
              "Answer 5 quick questions. We'll show you exactly where your business is losing money and how much — specific to your industry and province.",
              "Répondez à 5 questions rapides. Nous vous montrerons exactement où votre entreprise perd de l'argent — selon votre industrie et province."
            )}
          </p>

          {/* Chat widget */}
          <div className="fu d4" style={{background:"white",border:"1px solid #EEECE8",borderRadius:16,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.03),0 8px 32px rgba(0,0,0,0.05)"}}>

            {/* Chat header */}
            <div style={{padding:"12px 16px",borderBottom:"1px solid #EEECE8",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:28,height:28,borderRadius:7,background:"#1B3A2D",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
                </div>
                <div>
                  <p className="sans" style={{fontSize:13,fontWeight:600,color:"#1A1A18"}}>{t("Financial Analysis","Analyse financière")}</p>
                  <p className="sans" style={{fontSize:10,color:"#B5B3AD"}}>Fruxal · {t("~5 min","~5 min")}</p>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#2D7A50",display:"inline-block"}}/>
                <span className="sans" style={{fontSize:10,color:"#8E8C85"}}>{t("Live","En direct")}</span>
              </div>
            </div>

            {/* Chat body */}
            <div ref={chatRef} style={{height:320,overflowY:"auto",padding:16,background:"#1B3A2D"}}>
              {!started && messages.length === 0 && (
                <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 24px"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
                  </div>
                  <p className="sans" style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.9)",marginBottom:6}}>
                    {t("Ready to find your leaks?","Prêt à trouver vos fuites?")}
                  </p>
                  <p className="sans" style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:18,lineHeight:1.6}}>
                    {t("Takes about 5 minutes. Free. No account needed.","Environ 5 minutes. Gratuit. Sans compte.")}
                  </p>
                  <button onClick={start} className="sans"
                    style={{padding:"10px 24px",fontSize:13,fontWeight:600,color:"#1B3A2D",background:"white",border:"none",borderRadius:8,cursor:"pointer"}}>
                    {t("Start my free analysis →","Lancer mon analyse →")}
                  </button>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} style={{marginBottom:12,display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
                  {msg.role === "assistant" && (
                    <div style={{maxWidth:"88%"}}>
                      <p className="sans" style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.35)",marginBottom:5,letterSpacing:"0.06em"}}>FRUXAL</p>
                      <div className="sans" style={{background:"rgba(255,255,255,0.1)",color:"white",borderRadius:"2px 12px 12px 12px",padding:"10px 14px",fontSize:13,lineHeight:1.6}}>
                        {msg.content}
                      </div>
                    </div>
                  )}
                  {msg.role === "user" && (
                    <div style={{maxWidth:"80%"}}>
                      <div className="sans" style={{background:"white",color:"#1A1A18",borderRadius:"12px 12px 2px 12px",padding:"10px 14px",fontSize:13,lineHeight:1.6}}>
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{marginBottom:12}}>
                  <p className="sans" style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.35)",marginBottom:5,letterSpacing:"0.06em"}}>FRUXAL</p>
                  <div style={{background:"rgba(255,255,255,0.1)",borderRadius:"2px 12px 12px 12px",padding:"10px 14px",display:"inline-flex",gap:4}}>
                    <span className="b1" style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.5)",display:"inline-block"}}/>
                    <span className="b2" style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.5)",display:"inline-block"}}/>
                    <span className="b3" style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.5)",display:"inline-block"}}/>
                  </div>
                </div>
              )}

              {preparing && (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 0",textAlign:"center"}}>
                  <div style={{width:20,height:20,border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite",marginBottom:10}}/>
                  <p className="sans" style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>{t("Analyzing your business…","Analyse en cours…")}</p>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{padding:"12px 14px",borderTop:"1px solid #EEECE8",background:"white"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#FAFAF8",border:"1px solid #E8E6E1",borderRadius:10,padding:"4px 4px 4px 14px"}}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                  placeholder={t("Type your answer…","Tapez votre réponse…")}
                  disabled={!started||loading||!!result}
                  className="sans"
                  style={{flex:1,padding:"7px 0",fontSize:13,color:"#1A1A18",background:"transparent",border:"none",fontFamily:"inherit"}}/>
                <button onClick={started?send:start} disabled={started&&(!input.trim()||loading)}
                  style={{width:32,height:32,borderRadius:8,background:"#1B3A2D",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:(started&&(!input.trim()||loading))?0.4:1,flexShrink:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
              <p className="sans" style={{fontSize:10,color:"#B5B3AD",textAlign:"center",marginTop:7}}>
                {t("Free · Confidential · No account required","Gratuit · Confidentiel · Sans compte")}
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="fu" style={{display:"flex",gap:20,marginTop:20,justifyContent:"center",flexWrap:"wrap"}}>
            {[
              t("Built for businesses like yours","Conçu pour votre type d'entreprise"),
              t("200+ industries covered","200+ industries couvertes"),
              t("All 10 provinces","Les 10 provinces"),
            ].map(s => (
              <span key={s} className="sans" style={{fontSize:11,color:"#8E8C85",fontWeight:500}}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section ref={resultRef} style={{padding:"0 20px 60px",maxWidth:640,margin:"0 auto"}}>
          <div style={{background:"white",border:"1px solid #EEECE8",borderRadius:16,padding:28,boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>

            <p className="sans" style={{fontSize:10,fontWeight:700,color:"#1B3A2D",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>
              {t("Your results","Vos résultats")}
            </p>
            <h2 className="serif" style={{fontSize:26,fontWeight:700,color:"#1A1A18",marginBottom:4}}>
              {t("Financial Leak Snapshot","Aperçu de vos fuites financières")}
            </h2>
            <p className="sans" style={{fontSize:13,color:"#8E8C85",marginBottom:20}}>
              {t("Based on your answers — specific to your business.","Basé sur vos réponses — propre à votre entreprise.")}
            </p>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"#EEECE8",borderRadius:10,overflow:"hidden",marginBottom:20}}>
              {[
                {label:t("Health Score","Score santé"), val:`${result.analysis.fhScore}/100`, color:"#1A1A18"},
                {label:t("Est. Annual Leak","Fuite annuelle est."), val:`$${(result.analysis.totalLeak ?? 0).toLocaleString()}`, color:"#B34040"},
                {label:t("Leaks Found","Fuites trouvées"), val:String((result.analysis.leaks || []).length), color:"#1A1A18"},
              ].map(s => (
                <div key={s.label} style={{background:"white",padding:"16px 14px",textAlign:"center"}}>
                  <p className="sans" style={{fontSize:9,fontWeight:700,color:"#B5B3AD",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{s.label}</p>
                  <p className="serif" style={{fontSize:28,fontWeight:700,color:s.color,lineHeight:1}}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Top leaks */}
            <div style={{marginBottom:20}}>
              {(result.analysis.leaks || []).slice(0,3).map((leak:any,i:number) => (
                <div key={i} style={{padding:"12px 0",borderBottom:"1px solid #EEECE8",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <p className="sans" style={{fontSize:13,fontWeight:600,color:"#1A1A18",marginBottom:3}}>{isFR?leak.title_fr:leak.title}</p>
                    <p className="sans" style={{fontSize:11,color:"#8E8C85",lineHeight:1.5}}>{isFR?leak.action_fr:leak.action}</p>
                  </div>
                  <p className="serif" style={{fontSize:16,fontWeight:700,color:"#B34040",whiteSpace:"nowrap"}}>${(leak.amount ?? 0).toLocaleString()}<span className="sans" style={{fontSize:10,color:"#B5B3AD",fontWeight:400}}>{t("/yr","/an")}</span></p>
                </div>
              ))}
              {(result.analysis.leaks || []).length > 3 && (
                <p className="sans" style={{fontSize:12,color:"#8E8C85",textAlign:"center",paddingTop:10}}>
                  {t(`+ ${(result.analysis.leaks || []).length - 3} more leaks in your full report`,`+ ${(result.analysis.leaks || []).length - 3} autres fuites dans votre rapport complet`)}
                </p>
              )}
            </div>

            {/* CTA */}
            <div style={{background:"#1B3A2D",borderRadius:10,padding:20,textAlign:"center"}}>
              <p className="serif" style={{fontSize:18,fontWeight:700,color:"white",marginBottom:6}}>
                {t("Save your results & see the full report","Enregistrez vos résultats et voyez le rapport complet")}
              </p>
              <p className="sans" style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:16,lineHeight:1.6}}>
                {t("Free account. See every leak with exact dollar amounts — your rep handles the recovery.","Compte gratuit. Voyez chaque fuite avec les montants exacts — votre rep s'occupe de la récupération.")}
              </p>
              <button onClick={() => router.push(`/register?prescanRunId=${result.prescanRunId || ""}`)} className="sans"
                style={{padding:"12px 28px",fontSize:14,fontWeight:600,color:"#1B3A2D",background:"white",border:"none",borderRadius:8,cursor:"pointer",width:"100%"}}>
                {t("Create free account & see dashboard →","Créer un compte gratuit et voir le tableau de bord →")}
              </button>
            </div>

          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{textAlign:"center",padding:"20px 20px 32px",borderTop:"1px solid #EEECE8"}}>
        <p className="sans" style={{fontSize:11,color:"#B5B3AD"}}>
          © 2026 Fruxal Inc. · <a href="/legal/privacy" style={{color:"#8E8C85",textDecoration:"none"}}>{t("Privacy","Confidentialité")}</a> · {t("Built in Quebec","Construit au Québec")} 🇨🇦
        </p>
      </footer>
    </div>
  );
}
