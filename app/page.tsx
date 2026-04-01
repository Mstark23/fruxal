"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */
interface ChatMsg { id: string; role: "assistant" | "user"; content: string }
interface PrescanChatResponse {
  sessionId: string | null;
  message: string;
  rawMessage?: string;
  completed: boolean;
  prescanRunId?: string;
  analysis?: { fhScore: number; dhScore: number; totalLeak: number; leaks: any[]; bhs?: { score: number; band: string; confidence: number; leakImpactPct: number } };
  tier?: string;
  pricing?: number;
  inputs?: Record<string, any>;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "fr">("en");
  const isFR = lang === "fr";

  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [rawHistory, setRawHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatStarted, setChatStarted] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [result, setResult] = useState<{ analysis: any; prescanRunId: string } | null>(null);
  const searchParams = useSearchParams();
  const prefilledIndustry = searchParams?.get("industry") || "";
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fruxal_lang");
      if (stored === "fr" || stored === "en") { setLang(stored); return; }
    } catch { /* non-fatal */ }
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
  }, []);

  // ─── Restore prescan state from sessionStorage (survives page navigation) ───
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem("lg_prescan_result");
      if (saved) {
        const parsed = JSON.parse(saved);
        setResult(parsed);
        setChatStarted(true);
      }
      const savedMsgs = sessionStorage.getItem("lg_prescan_messages");
      try { if (savedMsgs) setMessages(JSON.parse(savedMsgs)); } catch { /* non-fatal */ }
      const savedSid = sessionStorage.getItem("lg_prescan_sessionId");
      if (savedSid) setSessionId(savedSid);
      const savedHist = sessionStorage.getItem("lg_prescan_rawHistory");
      try { if (savedHist) setRawHistory(JSON.parse(savedHist)); } catch { /* non-fatal */ }
      const savedLang = sessionStorage.getItem("lg_prescan_lang");
      if (savedLang === "fr" || savedLang === "en") setLang(savedLang);
    } catch { /* sessionStorage read failed — start fresh */ }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    // Persist chat state to sessionStorage
    if (messages.length > 0) {
      try {
        sessionStorage.setItem("lg_prescan_messages", JSON.stringify(messages));
        if (sessionId) sessionStorage.setItem("lg_prescan_sessionId", sessionId);
        if (rawHistory.length > 0) sessionStorage.setItem("lg_prescan_rawHistory", JSON.stringify(rawHistory));
      } catch { /* non-fatal */ }
    }
  }, [messages, chatLoading, sessionId, rawHistory]);

  // Scroll to results
  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [result]);

  // Start prescan
  const startPrescan = async () => {
    if (chatStarted) return;
    setChatStarted(true);
    setChatLoading(true);
    try {
      const res = await fetch("/api/v3/prescan-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: null, message: isFR ? "Bonjour, je suis prêt à commencer." : "Hi, I'm ready to start.", history: [], lang, country: "CA", prefilledIndustry: prefilledIndustry || undefined }),
      });
      const data: PrescanChatResponse = await res.json();
      setSessionId(data.sessionId);
      setMessages([{ id: "a-0", role: "assistant", content: data.message }]);
      setRawHistory([
        { role: "user", content: isFR ? "Bonjour, je suis prêt à commencer." : "Hi, I'm ready to start." },
        { role: "assistant", content: data.rawMessage || data.message },
      ]);
    } catch {
      setMessages([{ id: "err", role: "assistant", content: isFR ? "Une erreur est survenue. Veuillez rafraîchir la page." : "Something went wrong. Please refresh." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    const text = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", content: text }]);
    setChatLoading(true);

    try {
      // Send rawHistory (with tags intact) so backend can parse all accumulated tags
      // Don't include current user message — backend adds it from 'message' param
      const history = rawHistory;
      const res = await fetch("/api/v3/prescan-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, history, lang, country: "CA" }),
      });
      const data: PrescanChatResponse = await res.json();
      if (!sessionId && data.sessionId) setSessionId(data.sessionId);

      // Update rawHistory with user message + raw assistant response
      setRawHistory(prev => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: data.rawMessage || data.message },
      ]);

      if (data.completed && data.prescanRunId && data.analysis) {
        setPreparing(true);
        setTimeout(() => {
          setPreparing(false);
          const prescanResult = { analysis: data.analysis, prescanRunId: data.prescanRunId!, tier: data.tier, inputs: data.inputs };
          setResult(prescanResult);
          // Persist to sessionStorage so it survives page navigation
          try {
            sessionStorage.setItem("lg_prescan_result", JSON.stringify(prescanResult));
            sessionStorage.setItem("lg_prescan_lang", lang);
          } catch { /* non-fatal */ }
        }, 1500);
      } else {
        setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: data.message }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: "err2", role: "assistant", content: isFR ? "Une erreur est survenue." : "Something went wrong." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const t = (en: string, fr: string) => isFR ? fr : en;

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">

      {/* ══════ NAV ══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] px-6 lg:px-12 flex items-center justify-between bg-bg/85 backdrop-blur-xl border-b border-border-light">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="font-serif text-[17px] font-semibold tracking-tight">Fruxal</span>
        </div>
        <div className="hidden md:flex items-center gap-9">
          <a href="#features" className="text-sm font-medium text-ink-secondary hover:text-ink transition">{t("Features", "Fonctionnalités")}</a>
          <a href="#how" className="text-sm font-medium text-ink-secondary hover:text-ink transition">{t("How it works", "Comment ça marche")}</a>
          <a href="/pricing" className="text-sm font-medium text-ink-secondary hover:text-ink transition">{t("Pricing", "Tarification")}</a>
          <a href="/faq" className="text-sm font-medium text-ink-secondary hover:text-ink transition">{t("FAQ", "FAQ")}</a>
          <a href="/partners" className="text-sm font-medium text-ink-secondary hover:text-ink transition">{t("Partners", "Partenaires")}</a>
          <a href="/roi" className="text-sm font-medium text-ink-secondary hover:text-ink transition">{t("ROI Calculator", "Calculateur ROI")}</a>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-border-light rounded-[7px] p-[3px] gap-[2px]">
            {(["en", "fr"] as const).map(l => (
              <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("fruxal_lang", l); } catch { /* non-fatal */ } }}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-[5px] transition-all ${lang === l ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink bg-transparent"}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => router.push("/login")} className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink transition">{t("Sign in", "Connexion")}</button>
          <button onClick={startPrescan} className="px-5 py-2 text-sm font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition">{t("Get started", "Commencer")}</button>
        </div>
      </nav>

      {/* ══════ HERO — Split ══════ */}
      <section className="pt-[100px] pb-20 px-6 lg:px-12 max-w-[1280px] mx-auto grid lg:grid-cols-[1fr_440px] gap-16 items-center min-h-screen">

        {/* LEFT */}
        <div className="pt-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-soft rounded-full text-xs font-semibold text-brand tracking-wide mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-positive" />
            {t("Trusted by 500+ Canadian businesses · $12M+ in leaks identified", "Plus de 500 PME canadiennes · 12 M$+ de fuites identifiées")}
          </div>
          <h1 className="font-serif text-h1 text-ink font-normal mb-5 max-w-[560px]">
            {t("Most Canadian businesses are quietly losing ", "La plupart des entreprises canadiennes perdent silencieusement ")}
            <em className="italic text-brand-accent">{t("$40K–$120K a year.", "40 000 $–120 000 $ par année.")}</em>
            {t(" Most owners have no idea where.", " La plupart des propriétaires ne savent pas où.")}</h1>
          <p className="text-[17px] leading-relaxed text-ink-secondary max-w-[440px] mb-9">
            {t(
              "Find out if you're one of them.",
              "Découvrez si c'est votre cas."
            )}
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-14">
            <button onClick={startPrescan} className="px-7 py-3.5 text-[15px] font-semibold text-white bg-brand rounded-sm hover:bg-brand-light hover:-translate-y-px hover:shadow-lg hover:shadow-brand/15 transition-all">
              {t("Scan My Business — Free →", "Scanner mon entreprise — Gratuit →")}
            </button>
            <a href="#how" className="px-6 py-3.5 text-[15px] font-medium text-ink-secondary bg-white border border-border rounded-sm hover:border-border-focus hover:text-ink transition">
              {t("See how it works", "Comment ça marche")}
            </a>
          </div>
          <div className="flex gap-10">
            {[
              { v: "$13,000", l: t("Avg. leak / year", "Fuite moy. / an") },
              { v: "3 min", l: t("To first insight", "Premier résultat") },
              { v: "$0", l: t("Always free", "Toujours gratuit") },
            ].map(m => (
              <div key={m.l} className="flex flex-col gap-0.5">
                <span className="font-serif text-[28px] font-semibold text-ink tracking-tight">{m.v}</span>
                <span className="text-xs text-ink-muted font-medium">{m.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — CHAT */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_32px_rgba(0,0,0,0.04)]">
          {/* Chat header */}
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-border-light">
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-sm bg-brand flex items-center justify-center">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
              </div>
              <div>
                <div className="text-body font-semibold text-ink">{t("Free Business Scan", "Analyse gratuite")}</div>
                <div className="text-[11.5px] text-ink-muted font-medium">{t("Quick chat · takes ~3 min", "Chat rapide · environ 3 min")}</div>
              </div>
            </div>
            <div className="flex items-center bg-white/10 rounded-[7px] p-[3px] gap-[2px]">
              {(["en", "fr"] as const).map(l => (
                <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("fruxal_lang", l); } catch { /* non-fatal */ } }}
                  className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-[5px] transition-all ${lang === l ? "bg-white text-brand shadow-sm" : "text-white/60 hover:text-white bg-transparent"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Chat body — green background */}
          <div ref={chatBodyRef} className="h-[380px] overflow-y-auto p-5 bg-brand scrollbar-thin">
            {!chatStarted && messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 rounded-card bg-white/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
                </div>
                <p className="text-[15px] font-medium text-white/90 mb-2">
                  {t("Is your business leaking money?", "Votre entreprise perd-elle de l'argent ?")}
                </p>
                <p className="text-[13px] text-white/50 mb-5 max-w-[260px]">
                  {t("Let's take 60 seconds to find out. I'll ask you 6 quick questions — what you see might surprise you.", "Prenons 60 secondes pour le découvrir. Je vous poserai 6 questions rapides — ce que vous verrez pourrait vous surprendre.")}
                </p>
                <button
                  onClick={startPrescan}
                  className="px-5 py-2.5 text-[13px] font-semibold text-brand bg-white rounded-sm hover:bg-white/90 transition"
                >
                  {t("Find My Leaks →", "Trouver mes fuites →")}
                </button>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`mb-3 ${msg.role === "user" ? "flex justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="max-w-[88%]">
                    <div className="text-[11px] font-semibold text-white/40 mb-1.5 tracking-wide">{t("Fruxal", "Fruxal")}</div>
                    <div className="bg-white/[0.12] text-white rounded-[2px_12px_12px_12px] px-4 py-3.5 text-body leading-relaxed">{msg.content}</div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="max-w-[80%]">
                    <div className="bg-white text-ink rounded-[12px_12px_2px_12px] px-4 py-3 text-body leading-relaxed">{msg.content}</div>
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-white/40 mb-1.5 tracking-wide">{t("Fruxal", "Fruxal")}</div>
                <div className="bg-white/[0.12] rounded-[2px_12px_12px_12px] px-4 py-3 inline-flex gap-1">
                  <span className="w-[5px] h-[5px] rounded-full bg-white/50 animate-bounce [animation-delay:0ms]" />
                  <span className="w-[5px] h-[5px] rounded-full bg-white/50 animate-bounce [animation-delay:150ms]" />
                  <span className="w-[5px] h-[5px] rounded-full bg-white/50 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {preparing && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                <p className="text-[13px] text-white/70">{t("Running your scan against 4,200+ leak patterns…", "Analyse de votre entreprise selon 4 200+ modèles de fuites…")}</p>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="px-4 py-3.5 border-t border-border-light bg-white">
            <div className="flex items-center gap-2.5 bg-bg border border-border rounded-[10px] pl-4 pr-1 py-0.5 focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand-soft transition-all">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder={t("Type your answer...", "Tapez votre réponse...")}
                className="flex-1 py-2.5 text-body text-ink bg-transparent border-none outline-none font-sans placeholder:text-ink-faint"
                disabled={!chatStarted || chatLoading || preparing || !!result}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || chatLoading || preparing}
                className="w-[34px] h-[34px] rounded-sm bg-brand flex items-center justify-center hover:bg-brand-light transition disabled:opacity-40 shrink-0"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
            <p className="text-[11px] text-ink-faint text-center mt-2 font-medium">
              {t("Free · No account required · Confidential", "Gratuit · Sans compte · Confidentiel")}
            </p>
          </div>
        </div>
      </section>

      {/* ══════ PRESCAN RESULTS (inline) ══════ */}
      {result && (
        <section ref={resultRef} className="px-6 lg:px-12 pb-20 max-w-[1280px] mx-auto">
          <div className="bg-white border border-border rounded-2xl p-8 lg:p-12">
            <div className="text-label uppercase text-brand font-semibold mb-3">{t("Your Results", "Vos résultats")}</div>
            <h2 className="font-serif text-[32px] text-ink font-normal mb-2 tracking-tight">
              {t("Financial Leak Snapshot", "Aperçu de vos fuites financières")}
            </h2>
            <p className="text-body text-ink-secondary mb-8">{t("Based on your answers, here is what we found.", "Voici ce que nous avons trouvé.")}</p>

            <div className="grid md:grid-cols-3 gap-px bg-border-light rounded-card overflow-hidden mb-8">
              <div className="bg-white p-6">
                <div className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">{t("Health Score", "Score de santé")}</div>
                {(() => {
                  const score = result.analysis.fhScore;
                  const band = result.analysis.bhs?.band;
                  const color = score >= 65 ? "#2D7A50" : score >= 45 ? "#C4841D" : "#B34040";
                  const bandLabel = isFR
                    ? (score >= 65 ? "En bonne santé" : score >= 45 ? "À risque" : "Critique")
                    : (score >= 65 ? "Healthy" : score >= 45 ? "At Risk" : "Critical");
                  return (
                    <div>
                      <div className="font-serif text-[40px] tracking-tight" style={{ color }}>{score}<span className="text-ink-muted text-lg font-sans">/100</span></div>
                      <div className="text-xs font-semibold mt-1" style={{ color }}>{bandLabel}</div>
                    </div>
                  );
                })()}
              </div>
              <div className="bg-white p-6">
                <div className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">{t("Estimated Annual Leak", "Fuite annuelle estimée")}</div>
                <div className="font-serif text-[40px] text-negative tracking-tight">${(result.analysis.totalLeak ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-white p-6">
                <div className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">{t("Leaks Found", "Fuites trouvées")}</div>
                <div className="font-serif text-[40px] text-ink tracking-tight">{(result.analysis.leaks || []).length}</div>
              </div>
            </div>

            {(result.analysis.leaks || []).length === 0 && (
              <div className="mb-8 p-6 bg-positive/5 border border-positive/20 rounded-2xl text-center">
                <svg className="w-8 h-8 mx-auto mb-3 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <p className="font-semibold text-ink mb-1">{t("No major leaks detected from your answers", "Aucune fuite majeure détectée selon vos réponses")}</p>
                <p className="text-sm text-ink-secondary">{t("The full diagnostic may reveal more with your real financial data.", "Le diagnostic complet peut en révéler davantage avec vos données réelles.")}</p>
              </div>
            )}

            {(result.analysis.leaks || []).length > 0 && (() => {
              const VISIBLE = 5;
              const visibleLeaks = (result.analysis.leaks || []).slice(0, VISIBLE);
              const hiddenCount = (result.analysis.leaks || []).length - VISIBLE;

              return (
                <div className="mb-8">
                  <div className="space-y-4">
                    {visibleLeaks.map((leak: any, i: number) => (
                      <div key={i} className="bg-bg rounded-card border border-border-light overflow-hidden">
                        <div className="flex items-center justify-between p-5 pb-3">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-brand-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>
                            <div>
                              <div className="text-[15px] font-semibold text-ink">{isFR ? leak.title_fr : leak.title}</div>
                              <div className="text-xs text-ink-muted mt-0.5">{t("Confidence", "Confiance")}: {Math.round(leak.confidence)}%</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-serif text-xl text-negative font-semibold">${(leak.amount ?? 0).toLocaleString()}<span className="text-xs text-ink-muted font-sans">{t("/yr", "/an")}</span></div>
                          </div>
                        </div>
                        <div className="px-5 pb-3">
                          <p className="text-sm text-ink-secondary leading-relaxed">{isFR ? leak.explanation_fr : leak.explanation}</p>
                        </div>
                        <div className="mx-5 px-3.5 py-2.5 bg-white rounded-sm border border-border-light mb-3">
                          <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold mb-1">{t("How we calculated this", "Comment nous avons calculé ceci")}</div>
                          <p className="text-xs text-ink-muted leading-relaxed">{isFR ? leak.proof_fr : leak.proof}</p>
                        </div>
                        <div className="px-5 pb-4">
                          <div className="flex items-start gap-2">
                            <svg className="w-3 h-3 text-positive mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            <p className="text-xs text-ink-secondary leading-relaxed"><strong className="text-ink font-medium">{t("What you can do:", "Ce que vous pouvez faire :")}</strong> {isFR ? leak.action_fr : leak.action}</p>
                          </div>
                          {leak.affiliates && leak.affiliates.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {leak.affiliates.map((aff: any, j: number) => (
                                <a key={j} href={aff.url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/5 border border-brand/15 rounded-sm text-xs font-medium text-brand hover:bg-brand/10 transition">
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{display:"inline",marginRight:4,verticalAlign:"middle"}}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>{aff.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Locked leaks gate */}
                  {hiddenCount > 0 && (
                    <div className="relative mt-4">
                      {/* Blurred ghost cards */}
                      <div className="space-y-3 pointer-events-none select-none" aria-hidden="true">
                        {(result.analysis.leaks || []).slice(VISIBLE, VISIBLE + 3).map((_: any, i: number) => (
                          <div key={i} className="bg-bg rounded-card border border-border-light overflow-hidden blur-[6px] opacity-60 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-border-light" />
                              <div className="space-y-1.5">
                                <div className="h-3 w-40 bg-border-light rounded" />
                                <div className="h-2 w-24 bg-border-light rounded" />
                              </div>
                            </div>
                            <div className="h-6 w-20 bg-border-light rounded" />
                          </div>
                        ))}
                      </div>

                      {/* Gradient fade + CTA overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(249,248,246,0.85) 30%, rgba(249,248,246,0.98) 60%)" }}>
                        <div className="mt-auto pb-6 px-6 text-center w-full max-w-sm mx-auto">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-negative/8 border border-negative/15 rounded-full text-xs font-semibold text-negative mb-3">
                            {hiddenCount} {t("more leaks hidden", `autres fuites masquées`)}
                          </div>
                          <p className="text-sm text-ink-secondary mb-4">
                            {t(
                              `${hiddenCount} additional leaks worth $${(result.analysis.leaks || []).slice(VISIBLE).reduce((s: number, l: any) => s + (l.amount ?? 0), 0).toLocaleString()}/yr are waiting. Create a free account to unlock them.`,
                              `${hiddenCount} fuites supplémentaires valant $${(result.analysis.leaks || []).slice(VISIBLE).reduce((s: number, l: any) => s + (l.amount ?? 0), 0).toLocaleString()}/an vous attendent. Créez un compte gratuit pour les débloquer.`
                            )}
                          </p>
                          <button
                            onClick={() => router.push(`/register?prescanRunId=${result?.prescanRunId || ""}`)}
                            className="w-full px-6 py-3 text-[15px] font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition">
                            {t("Unlock all leaks — Free →", "Débloquer toutes les fuites — Gratuit →")}
                          </button>
                          <p className="text-[11px] text-ink-faint mt-2">{t("No credit card required", "Aucune carte de crédit requise")}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => router.push(`/register?prescanRunId=${result?.prescanRunId || ""}`)}
                className="flex-1 px-7 py-3.5 text-[15px] font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition text-center">
                {t("Create free account & get a recovery expert →", "Créer un compte gratuit et obtenir un expert en récupération →")}
              </button>
              <button
                onClick={() => window.open(`/api/prescan/report?prescanRunId=${result?.prescanRunId || ""}&lang=${lang}`, "_blank")}
                className="px-6 py-3.5 text-[15px] font-medium text-ink-secondary bg-white border border-border rounded-sm hover:border-border-focus transition flex items-center justify-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{display:"inline",marginRight:6,verticalAlign:"middle"}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>{t("Download report", "Télécharger le rapport")}
              </button>
            </div>
            <p className="text-[11px] text-ink-faint mt-2">{t("Free PDF · No account required · Full report unlocked on signup", "PDF gratuit · Aucun compte requis · Rapport complet sur inscription")}</p>
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  try {
                    sessionStorage.removeItem("lg_prescan_result");
                    sessionStorage.removeItem("lg_prescan_messages");
                    sessionStorage.removeItem("lg_prescan_sessionId");
                    sessionStorage.removeItem("lg_prescan_rawHistory");
                    sessionStorage.removeItem("lg_prescan_lang");
                  } catch { /* non-fatal */ }
                  window.location.reload();
                }}
                className="text-[12px] text-ink-faint hover:text-ink-secondary transition underline-offset-2 hover:underline"
              >
                {t("↩ Start a new analysis", "↩ Lancer une nouvelle analyse")}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════ WHY FREE STRIP ══════ */}
      <section className="py-14 px-6 border-y border-border-light bg-white">
        <div className="max-w-[900px] mx-auto">
          <p className="text-label uppercase text-brand font-semibold text-center mb-10">
            {t("Why is it free?", "Pourquoi c'est gratuit ?")}
          </p>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {[
              {
                icon: <svg className="w-6 h-6 mx-auto mb-4 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
                h: t("We earn when you fix leaks", "On gagne quand vous corrigez"),
                p: t("When we match you with a payroll service, insurer, or accounting firm that solves your exact issue — they pay us a small referral fee. You pay them nothing extra.", "Quand nous vous connectons avec un service qui résout votre problème — ils nous versent des frais de référence. Vous ne payez rien de plus.")
              },
              {
                icon: <svg className="w-6 h-6 mx-auto mb-4 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                h: t("If we find nothing, we earn nothing", "Si on trouve rien, on gagne rien"),
                p: t("Our incentives are completely aligned with yours. We have no reason to exaggerate your leaks — we only make money when a real solution actually helps you.", "Nos intérêts sont alignés avec les vôtres. Nous n'avons aucune raison d'exagérer — on gagne de l'argent seulement quand une solution vous aide vraiment.")
              },
              {
                icon: <svg className="w-6 h-6 mx-auto mb-4 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
                h: t("You own your data. Always.", "Vos données vous appartiennent."),
                p: t("We never sell your data to advertisers. We never share your financials without your consent. The diagnostic exists to help you — full stop.", "On ne vend jamais vos données à des annonceurs. On ne partage jamais vos finances sans votre accord. Le diagnostic existe pour vous aider — point final.")
              },
            ].map((item, i) => (
              <div key={i}>
                {item.icon}
                <h3 className="font-serif text-[18px] text-ink font-normal mb-2">{item.h}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{item.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-[1200px] mx-auto">
        <div className="text-label uppercase text-brand font-semibold mb-3.5">{t("Capabilities", "Fonctionnalités")}</div>
        <h2 className="font-serif text-h2 text-ink font-normal max-w-[520px] mb-3.5">{t("What your accountant charges $300/hr to find — we find free", "Ce que votre comptable facture 300 $/h pour trouver — on le trouve gratuitement")}</h2>
        <p className="text-[16px] leading-relaxed text-ink-secondary max-w-[460px] mb-14">{t("Compared against 4,000+ Canadian industry benchmarks. Specific dollar amounts. Real solutions. No subscription required.", "Comparé à plus de 4 000 repères de l'industrie canadienne. Montants précis. Solutions réelles. Aucun abonnement requis.")}</p>

        <div className="grid md:grid-cols-3 gap-px bg-border-light border border-border-light rounded-card overflow-hidden">
          {[
            { n: "01", h: t("Leak detection", "Détection de fuites"), p: t("Compares your costs against benchmarks for your industry, province, and revenue level.", "Compare vos coûts aux repères de votre industrie, province et niveau de revenus.") },
            { n: "02", h: t("Financial Health Score", "Score de santé financière"), p: t("A single score combining profitability, cost efficiency, revenue stability, and leak pressure.", "Un score unique combinant rentabilité, efficacité, stabilité et pression des fuites.") },
            { n: "03", h: t("Smart alerts", "Alertes intelligentes"), p: t("Get notified when costs spike, margins drop, or new leaks appear.", "Soyez notifié quand les coûts augmentent ou que de nouvelles fuites apparaissent.") },
            { n: "04", h: t("Revenue monitoring", "Suivi des revenus"), p: t("Month-over-month and year-over-year trends with volatility analysis.", "Tendances mensuelles et annuelles avec analyse de la volatilité.") },
            { n: "05", h: t("Cost benchmarking", "Comparaison des coûts"), p: t("See where you stand on payroll, rent, processing, insurance — versus businesses like yours.", "Comparez vos coûts de paie, loyer, traitement et assurance à des entreprises similaires.") },
            { n: "06", h: t("Continuous monitoring", "Surveillance continue"), p: t("Monthly re-scans track your situation and update your rep on any new leaks.", "Des analyses mensuelles informent votre rep des nouvelles fuites détectées.") },
          ].map(f => (
            <div key={f.n} className="bg-white p-8 hover:bg-surface-hover transition-colors">
              <div className="font-serif text-[13px] text-ink-faint mb-4">{f.n}</div>
              <h3 className="font-serif text-h3 text-ink font-normal mb-2">{f.h}</h3>
              <p className="text-sm text-ink-secondary">{f.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how" className="bg-white border-y border-border-light">
        <div className="py-24 px-6 lg:px-12 max-w-[1200px] mx-auto">
          <div className="text-label uppercase text-brand font-semibold mb-3.5">{t("Process", "Processus")}</div>
          <h2 className="font-serif text-h2 text-ink font-normal max-w-[520px] mb-3.5">{t("From first question to financial clarity", "De la première question à la clarté financière")}</h2>
          <p className="text-[16px] leading-relaxed text-ink-secondary max-w-[460px] mb-14">{t("No spreadsheets. No forms. A short conversation and you're in control.", "Pas de tableurs. Pas de formulaires. Une courte conversation et vous avez le contrôle.")}</p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { n: "01", h: t("Quick conversation", "Conversation rapide"), p: t("Answer a few questions about your business — type, revenue, costs, and tools.", "Répondez à quelques questions sur votre entreprise — type, revenus, coûts et outils.") },
              { n: "02", h: t("Instant analysis", "Analyse instantanée"), p: t("We compare your structure to benchmarks and detect where money leaks.", "Nous comparons votre structure aux références et détectons les fuites.") },
              { n: "03", h: t("See your leaks", "Voyez vos fuites"), p: t("Get your Financial Health Score and a breakdown of each leak.", "Obtenez votre score de santé et le détail de chaque fuite.") },
              { n: "04", h: t("Fix it — free match included", "Corrigez — mise en relation incluse"), p: t("We match you with vetted Canadian partners who solve your exact leak type. No commissions charged to you. We handle the referral.", "On vous connecte avec des partenaires canadiens vérifiés qui résolvent votre fuite spécifique. Aucune commission à votre charge. On gère la mise en relation.") },
            ].map(s => (
              <div key={s.n}>
                <div className="w-full h-px bg-border mb-6 relative">
                  <span className="absolute left-0 -top-[3px] w-[7px] h-[7px] rounded-full bg-brand" />
                </div>
                <div className="font-serif text-xs text-ink-faint font-semibold mb-2.5">{t("Step", "Étape")} {s.n}</div>
                <h3 className="font-serif text-[18px] text-ink font-normal mb-2">{s.h}</h3>
                <p className="text-sm text-ink-secondary">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════ SOCIAL PROOF ══════ */}
      <section className="py-16 px-6 lg:px-12 border-y border-border-light bg-bg-section">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-10">
            {t("Trusted by Canadian small businesses", "Fait confiance par les PME canadiennes")}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            {[
              { v: "24", l: t("Businesses analyzed", "Entreprises analysées") },
              { v: "$13,000", l: t("Avg. annual leak found", "Fuite annuelle moy. trouvée") },
              { v: "4,273+", l: t("Leak detectors running", "Détecteurs actifs") },
              { v: "PIPEDA", l: t("Compliant & secure", "Conforme et sécurisé") },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="font-serif text-[32px] text-ink font-semibold tracking-tight">{s.v}</div>
                <div className="text-[11px] text-ink-muted font-medium mt-1">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: t(
                  "I didn't realize how much we were overpaying on payment processing. Fruxal found $4,800/year in 5 minutes.",
                  "Je ne réalisais pas à quel point nous surpayions pour le traitement des paiements. Fruxal a trouvé 4 800 $/an en 5 minutes."
                ),
                name: "Marie T.",
                role: t("Restaurant owner, Montréal", "Propriétaire de restaurant, Montréal"),
              },
              {
                quote: t(
                  "The SR&ED finding alone was worth the subscription. Our accountant missed it for two years.",
                  "La découverte SR&ED à elle seule valait l'abonnement. Notre comptable l'avait manqué pendant deux ans."
                ),
                name: "David K.",
                role: t("IT services, Toronto", "Services TI, Toronto"),
              },
              {
                quote: t(
                  "Finally a tool built for Canadian businesses. The bilingual support and provincial tax matching are exactly what we needed.",
                  "Enfin un outil conçu pour les entreprises canadiennes. Le support bilingue et les correspondances fiscales provinciales sont exactement ce dont nous avions besoin."
                ),
                name: "Sophie L.",
                role: t("Construction, Québec City", "Construction, Québec"),
              },
            ].map(t2 => (
              <div key={t2.name} className="bg-white border border-border-light rounded-xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-[13px]">★</span>)}
                </div>
                <p className="text-[13px] text-ink-secondary leading-relaxed mb-4">"{t2.quote}"</p>
                <div>
                  <p className="text-[12px] font-semibold text-ink">{t2.name}</p>
                  <p className="text-[11px] text-ink-faint">{t2.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PRICING ══════ */}
      <section id="pricing" className="py-24 px-6 lg:px-12 max-w-[1200px] mx-auto">
        <div className="text-label uppercase text-brand font-semibold mb-3.5">{t("Pricing", "Tarification")}</div>
        <h2 className="font-serif text-h2 text-ink font-normal max-w-[560px] mb-3.5">
          {t("Free forever for T1 and T2. Enterprise is performance-only.", "Gratuit pour T1 et T2. L'entreprise est à la performance uniquement.")}
        </h2>
        <p className="text-[16px] leading-relaxed text-ink-secondary max-w-[480px] mb-14">
          {t("No trial. No credit card. No hidden fees. Solo and Business are free forever — we earn a small referral fee from partners only when you choose to fix a leak.", "Pas d'essai. Pas de carte. Pas de frais cachés. Solo et Business sont gratuits pour toujours — on touche des frais de référence de partenaires uniquement si vous choisissez de corriger une fuite.")}
        </p>

        <div className="grid md:grid-cols-3 gap-6 items-start">

          {/* TIER 1: SOLO */}
          <div className="relative bg-white border border-border-light rounded-[16px] p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-2.5 py-1 rounded-full">
                {t("Tier 1", "Niveau 1")}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-positive bg-positive/10 px-2.5 py-1 rounded-full">
                {t("Most popular", "Plus populaire")}
              </span>
            </div>
            <div className="text-[13px] font-bold uppercase tracking-widest text-ink-muted mb-2">Solo</div>
            <div className="font-serif text-[42px] text-ink tracking-tight font-normal leading-none mb-1">
              {t("Free", "Gratuit")}
            </div>
            <p className="text-[12px] text-positive font-semibold mb-5 mt-1">{t("✶ Free forever · No credit card", "✶ Gratuit pour toujours · Aucune carte")}</p>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              {t("For self-employed and solo operators. Full diagnostic, all leaks, government programs — free forever.", "Pour travailleurs autonomes. Diagnostic complet, toutes les fuites, programmes gouvernementaux — gratuit pour toujours.")}
            </p>
            <ul className="mb-8 flex-1">
              {[
                t("Full prescan + leak report", "Prescan complet + rapport de fuites"),
                t("Financial Health Score", "Score de santé financière"),
                t("All leaks with dollar amounts", "Toutes les fuites avec montants"),
                t("Recovery expert assigned to your file", "Expert en récupération assigné"),
                t("12% only on confirmed savings", "12% uniquement sur économies confirmées"),
                t("Smart deadline alerts", "Alertes d’échéances intelligentes"),
                t("Government programs matched", "Programmes gouvernementaux"),
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 py-2.5 border-b border-border-light text-sm text-ink-secondary last:border-0">
                  <span className="text-positive shrink-0 text-[13px] mt-px">&#10003;</span>{f}
                </li>
              ))}
            </ul>
            <a href="/register" className="w-full py-3.5 text-sm font-semibold rounded-[8px] bg-brand text-white hover:bg-brand-light transition text-center block">
              {t("Get started free →", "Commencer gratuitement →")}
            </a>
            <p className="text-[10px] text-ink-faint text-center mt-2">{t("No credit card · Always free", "Aucune carte · Toujours gratuit")}</p>
          </div>

          {/* TIER 2: BUSINESS */}
          <div className="relative bg-bg border-2 border-brand rounded-[16px] p-8 flex flex-col shadow-xl shadow-brand/10">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-2.5 py-1 rounded-full">
                {t("Tier 2", "Niveau 2")}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-brand px-2.5 py-1 rounded-full">
                {t("Most complete", "Plus complet")}
              </span>
            </div>
            <div className="text-[13px] font-bold uppercase tracking-widest text-ink-muted mb-2">Business</div>
            <div className="font-serif text-[42px] text-ink tracking-tight font-normal leading-none mb-1">
              {t("Free", "Gratuit")}
            </div>
            <p className="text-[12px] text-positive font-semibold mb-5 mt-1">{t("✶ Free forever · No credit card", "✶ Gratuit pour toujours · Aucune carte")}</p>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              {t("For growing businesses with employees. Mid-market diagnostic, benchmarks, payroll audit — free forever.", "Pour entreprises en croissance avec employés. Diagnostic mid-market, repères, audit paie — gratuit pour toujours.")}
            </p>
            <ul className="mb-8 flex-1">
              {[
                t("Everything in Solo", "Tout du Solo"),
                t("Mid-market AI leak engine", "Moteur IA fuites mid-market"),
                t("Industry benchmarks", "Repères de l’industrie"),
                t("Payroll & compliance audit", "Audit paie et conformité"),
                t("Multi-business support", "Multi-entreprises"),
                t("QuickBooks integration", "Intégration QuickBooks"),
                t("Monthly advisor call", "Appel conseiller mensuel"),
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 py-2.5 border-b border-border-light text-sm text-ink-secondary last:border-0">
                  <span className="text-positive shrink-0 text-[13px] mt-px">&#10003;</span>{f}
                </li>
              ))}
            </ul>
            <a href="/register" className="w-full py-3.5 text-sm font-semibold rounded-[8px] bg-brand text-white hover:bg-brand-light transition text-center block">
              {t("Get started free →", "Commencer gratuitement →")}
            </a>
            <p className="text-[10px] text-ink-faint text-center mt-2">{t("No credit card · Always free", "Aucune carte · Toujours gratuit")}</p>
          </div>

          {/* TIER 3: ENTERPRISE */}
          <div className="relative bg-white border border-border-light rounded-[16px] p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                {t("Tier 3", "Niveau 3")}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                {t("Performance fee", "À la performance")}
              </span>
            </div>
            <div className="text-[13px] font-bold uppercase tracking-widest text-ink-muted mb-2">Enterprise</div>
            <div className="font-serif text-[38px] text-ink tracking-tight font-normal leading-none mb-1">
              {t("Let’s talk", "Parlons-en")}
            </div>
            <p className="text-[12px] text-emerald-400 font-semibold mb-6 mt-1">
              {t("✶ You only pay on confirmed savings", "✶ Vous payez uniquement sur les économies confirmées")}
            </p>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              {t(
                "For Canadian businesses doing $1M+. A dedicated Fruxal analyst runs a full forensic audit across every financial leak category — and gets paid only when we recover money.",
                "Pour les entreprises canadiennes à 5 M$+. Un analyste Fruxal dédié effectue un audit forensique complet — rémunéré uniquement sur les économies récupérées."
              )}
            </p>
            <ul className="mb-8 flex-1">
              {([
                [t("Tax structure audit", "Audit de structure fiscale"), t("Corporate inefficiencies, missed credits, owner compensation gaps.", "Inefficacités corporatives, crédits manqués, rémunération des actionnaires.")],
                [t("Vendor & procurement review", "Analyse fournisseurs"), t("Contract overcharges, duplicate vendors, pricing not renegotiated.", "Surfacturations, fournisseurs en double, prix non renégociés.")],
                [t("Payroll & HR forensics", "Forensique paie et RH"), t("Payroll structure, benefits, misclassified employees.", "Structure salariale, avantages, mauvaise classification.")],
                [t("Banking & treasury optimization", "Optimisation banque et trésorerie"), t("Processing fees, idle cash, credit facility terms.", "Frais de traitement, liquidités dormantes, conditions de crédit.")],
                [t("CRA & compliance exposure", "Exposition ARC et conformité"), t("Audit risk, payroll remittances, provincial obligations.", "Risque de vérification, remises salariales, obligations provinciales.")],
                [t("SR&ED & grant maximization", "Maximisation SR&ED et subventions"), t("R&D credits, federal and provincial grants you qualify for.", "Crédits R&D, subventions fédérales et provinciales admissibles.")],
                [t("SaaS & insurance audit", "Audit logiciels et assurances"), t("Unused subscriptions, overpaid premiums, redundant coverage.", "Abonnements inutilisés, primes excessives, couvertures redondantes.")],
              ] as [string, string][]).map(([title, desc]) => (
                <li key={title} className="py-3 border-b border-border-light last:border-0">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0 text-[13px] mt-0.5">&#10003;</span>
                    <div>
                      <div className="text-[13px] font-semibold text-ink">{title}</div>
                      <div className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <a href="/enterprise" className="w-full py-3.5 text-sm font-semibold rounded-[8px] bg-emerald-600 text-white hover:bg-emerald-500 transition text-center block">
              {t("Learn more & apply →", "En savoir plus et postuler →")}
            </a>
            <p className="text-[10px] text-ink-faint text-center mt-2">
              {t("Qualification call · $1M+ revenue · No upfront cost", "Appel de qualification · 5 M$+ de revenus · Aucun frais initial")}
            </p>
          </div>

        </div>
      </section>

            {/* ══════ CTA BAND ══════ */}
      <section className="text-center py-24 px-6 bg-brand">
        <h2 className="font-serif text-[38px] text-white font-normal tracking-tight mb-3.5">{t("Start free. Stay free.", "Commencez gratuitement. Restez gratuit.")}</h2>
        <p className="text-[16px] text-white/60 max-w-[480px] mx-auto mb-8 leading-relaxed">{t("3 minutes. No credit card. No subscription. Find out exactly what your business is losing — and who can fix it.", "3 minutes. Sans carte. Sans abonnement. Découvrez exactement ce que votre entreprise perd — et qui peut y remédier.")}</p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-8 py-3.5 text-[15px] font-semibold text-brand bg-white rounded-sm hover:-translate-y-px hover:shadow-lg transition-all">
          {t("Get your free analysis →", "Obtenez votre analyse gratuite →")}
        </button>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="py-10 px-6 text-center border-t border-border-light bg-bg">
        <p className="text-[13px] text-ink-muted">© 2026 Fruxal Inc. · <a href="/legal/privacy" className="text-ink-secondary hover:text-ink transition">{t("Privacy", "Confidentialité")}</a> · <a href="/legal/terms" className="text-ink-secondary hover:text-ink transition">{t("Terms", "Conditions")}</a> · <a href="/faq" className="text-ink-secondary hover:text-ink transition">{t("FAQ", "FAQ")}</a> · {t("Built in Quebec", "Construit au Québec")} 🇨🇦</p>
      </footer>

    </div>
  );
}