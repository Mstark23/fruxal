"use client";

import { useState, useEffect, useRef } from "react";
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
  analysis?: { fhScore: number; dhScore: number; totalLeak: number; leaks: any[] };
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
        body: JSON.stringify({ sessionId: null, message: isFR ? "Bonjour, je suis prêt à commencer." : "Hi, I'm ready to start.", history: [], lang }),
      });
      const data: PrescanChatResponse = await res.json();
      setSessionId(data.sessionId);
      setMessages([{ id: "a-0", role: "assistant", content: data.message }]);
      setRawHistory([
        { role: "user", content: isFR ? "Bonjour, je suis prêt à commencer." : "Hi, I'm ready to start." },
        { role: "assistant", content: data.rawMessage || data.message },
      ]);
    } catch {
      setMessages([{ id: "err", role: "assistant", content: "Something went wrong. Please refresh." }]);
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
        body: JSON.stringify({ sessionId, message: text, history, lang }),
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
      setMessages(prev => [...prev, { id: "err2", role: "assistant", content: "Something went wrong." }]);
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
            {t("Financial Operating System", "Système financier intelligent")}
          </div>
          <h1 className="font-serif text-h1 text-ink font-normal mb-5 max-w-[560px]">
            {t("Your business is ", "Votre entreprise ")}
            <em className="italic text-brand-accent">{t("leaking money.", "perd de l'argent.")}</em>
            {t(" Find out how much.", " Découvrez combien.")}</h1>
          <p className="text-[17px] leading-relaxed text-ink-secondary max-w-[440px] mb-9">
            {t(
              "The average Canadian SMB loses $13,000/year to hidden financial leaks — tax inefficiencies, vendor overcharges, payroll gaps. We find them in 5 minutes. Free.",
              "La PME canadienne moyenne perd 13 000 $/an en fuites financières cachées — inefficacités fiscales, surfacturations, écarts de paie. On les trouve en 5 minutes. Gratuitement."
            )}
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-14">
            <button onClick={startPrescan} className="px-7 py-3.5 text-[15px] font-semibold text-white bg-brand rounded-sm hover:bg-brand-light hover:-translate-y-px hover:shadow-lg hover:shadow-brand/15 transition-all">
              {t("Start free analysis →", "Analyse gratuite →")}
            </button>
            <a href="#how" className="px-6 py-3.5 text-[15px] font-medium text-ink-secondary bg-white border border-border rounded-sm hover:border-border-focus hover:text-ink transition">
              {t("See how it works", "Comment ça marche")}
            </a>
          </div>
          <div className="flex gap-10">
            {[
              { v: "$13,000", l: t("Avg. leak / year", "Fuite moy. / an") },
              { v: "5 min", l: t("To first insight", "Premier résultat") },
              { v: "200+", l: t("Industries", "Industries") },
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
                <div className="text-body font-semibold text-ink">{t("Financial Analysis", "Analyse financière")}</div>
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
                  {t("Ready to find your leaks?", "Prêt à trouver vos fuites ?")}
                </p>
                <p className="text-[13px] text-white/50 mb-5 max-w-[260px]">
                  {t("Click the button below to start your free financial analysis.", "Cliquez ci-dessous pour lancer votre analyse gratuite.")}
                </p>
                <button
                  onClick={startPrescan}
                  className="px-5 py-2.5 text-[13px] font-semibold text-brand bg-white rounded-sm hover:bg-white/90 transition"
                >
                  {t("Start analysis", "Lancer l'analyse")}
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
                <p className="text-[13px] text-white/70">{t("Analyzing your business…", "Analyse en cours…")}</p>
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
                disabled={!chatStarted || chatLoading || !!result}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || chatLoading}
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
                <div className="font-serif text-[40px] text-ink tracking-tight">{result.analysis.fhScore}<span className="text-ink-muted text-lg font-sans">/100</span></div>
              </div>
              <div className="bg-white p-6">
                <div className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">{t("Estimated Annual Leak", "Fuite annuelle estimée")}</div>
                <div className="font-serif text-[40px] text-negative tracking-tight">${(result.analysis.totalLeak ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-white p-6">
                <div className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">{t("Leaks Found", "Fuites trouvées")}</div>
                <div className="font-serif text-[40px] text-ink tracking-tight">{result.analysis.leaks.length}</div>
              </div>
            </div>

            {result.analysis.leaks.length > 0 && (() => {
              const VISIBLE = 5;
              const visibleLeaks = result.analysis.leaks.slice(0, VISIBLE);
              const hiddenCount = result.analysis.leaks.length - VISIBLE;

              return (
                <div className="mb-8">
                  <div className="space-y-4">
                    {visibleLeaks.map((leak: any, i: number) => (
                      <div key={i} className="bg-bg rounded-card border border-border-light overflow-hidden">
                        <div className="flex items-center justify-between p-5 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{leak.icon || '📊'}</span>
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
                            <span className="text-positive text-xs mt-0.5 shrink-0">💡</span>
                            <p className="text-xs text-ink-secondary leading-relaxed"><strong className="text-ink font-medium">{t("What you can do:", "Ce que vous pouvez faire :")}</strong> {isFR ? leak.action_fr : leak.action}</p>
                          </div>
                          {leak.affiliates && leak.affiliates.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {leak.affiliates.map((aff: any, j: number) => (
                                <a key={j} href={aff.url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/5 border border-brand/15 rounded-sm text-xs font-medium text-brand hover:bg-brand/10 transition">
                                  <span>🔗</span> {aff.name}
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
                        {result.analysis.leaks.slice(VISIBLE, VISIBLE + 3).map((_: any, i: number) => (
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
                            🔒 {hiddenCount} {t("more leaks hidden", `autres fuites masquées`)}
                          </div>
                          <p className="text-sm text-ink-secondary mb-4">
                            {t(
                              `${hiddenCount} additional leaks worth $${result.analysis.leaks.slice(VISIBLE).reduce((s: number, l: any) => s + (l.amount ?? 0), 0).toLocaleString()}/yr are waiting. Create a free account to unlock them.`,
                              `${hiddenCount} fuites supplémentaires valant $${result.analysis.leaks.slice(VISIBLE).reduce((s: number, l: any) => s + (l.amount ?? 0), 0).toLocaleString()}/an vous attendent. Créez un compte gratuit pour les débloquer.`
                            )}
                          </p>
                          <button
                            onClick={() => router.push(`/register?prescanRunId=${result!.prescanRunId}`)}
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
                onClick={() => router.push(`/register?prescanRunId=${result!.prescanRunId}`)}
                className="flex-1 px-7 py-3.5 text-[15px] font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition text-center">
                {t("Create free account & unlock full report →", "Créer un compte gratuit et débloquer le rapport complet →")}
              </button>
              <button
                onClick={() => window.open(`/api/prescan/report?prescanRunId=${result!.prescanRunId}&lang=${lang}`, "_blank")}
                className="px-6 py-3.5 text-[15px] font-medium text-ink-secondary bg-white border border-border rounded-sm hover:border-border-focus transition flex items-center justify-center gap-2">
                <span>📄</span> {t("Download report", "Télécharger le rapport")}
              </button>
            </div>
            <p className="text-[11px] text-ink-faint mt-2">{t("Free PDF · No account required · Full report unlocked on signup", "PDF gratuit · Aucun compte requis · Rapport complet sur inscription")}</p>
          </div>
        </section>
      )}

      {/* ══════ TRUST STRIP ══════ */}
      <section className="py-12 px-6 border-y border-border-light text-center bg-white">
        <p className="text-label uppercase text-ink-faint font-semibold mb-6">{t("Connects with the tools you already use", "Se connecte aux outils que vous utilisez déjà")}</p>
        <div className="flex justify-center items-center gap-12 flex-wrap opacity-[0.22]">
          {["QuickBooks", "Stripe", "Square", "Desjardins", "Plaid", "Wave"].map(n => (
            <span key={n} className="font-serif text-[17px] text-ink font-semibold">{n}</span>
          ))}
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-[1200px] mx-auto">
        <div className="text-label uppercase text-brand font-semibold mb-3.5">{t("Capabilities", "Fonctionnalités")}</div>
        <h2 className="font-serif text-h2 text-ink font-normal max-w-[520px] mb-3.5">{t("Everything a CFO would monitor — automated for you", "Tout ce qu'un directeur financier surveille — automatisé")}</h2>
        <p className="text-[16px] leading-relaxed text-ink-secondary max-w-[460px] mb-14">{t("We analyze your costs, revenue, and operations against industry benchmarks to surface what matters.", "Nous analysons vos coûts, revenus et opérations par rapport aux références de votre industrie.")}</p>

        <div className="grid md:grid-cols-3 gap-px bg-border-light border border-border-light rounded-card overflow-hidden">
          {[
            { n: "01", h: t("Leak detection", "Détection de fuites"), p: t("Compares your costs against benchmarks for your industry, province, and revenue level.", "Compare vos coûts aux repères de votre industrie, province et niveau de revenus.") },
            { n: "02", h: t("Financial Health Score", "Score de santé financière"), p: t("A single score combining profitability, cost efficiency, revenue stability, and leak pressure.", "Un score unique combinant rentabilité, efficacité, stabilité et pression des fuites.") },
            { n: "03", h: t("Smart alerts", "Alertes intelligentes"), p: t("Get notified when costs spike, margins drop, or new leaks appear.", "Soyez notifié quand les coûts augmentent ou que de nouvelles fuites apparaissent.") },
            { n: "04", h: t("Revenue monitoring", "Suivi des revenus"), p: t("Month-over-month and year-over-year trends with volatility analysis.", "Tendances mensuelles et annuelles avec analyse de la volatilité.") },
            { n: "05", h: t("Cost benchmarking", "Comparaison des coûts"), p: t("See where you stand on payroll, rent, processing, insurance — versus businesses like yours.", "Comparez vos coûts de paie, loyer, traitement et assurance à des entreprises similaires.") },
            { n: "06", h: t("Continuous monitoring", "Surveillance continue"), p: t("Monthly re-scans detect new leaks and track resolved ones.", "Des analyses mensuelles détectent de nouvelles fuites et suivent celles résolues.") },
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
              { n: "04", h: t("Take action", "Passez à l'action"), p: t("Connect your data for live monitoring, or use the snapshot to fix leaks now.", "Connectez vos données pour un suivi en direct ou corrigez les fuites maintenant.") },
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
          {t("One platform. Three tiers. Built for every Canadian business.", "Une plateforme. Trois niveaux. Conçue pour chaque PME canadienne.")}
        </h2>
        <p className="text-[16px] leading-relaxed text-ink-secondary max-w-[480px] mb-14">
          {t("Try free for 7 days — no credit card required. Cancel anytime.", "Essayez gratuitement pendant 7 jours — aucune carte requise. Annulez à tout moment.")}
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
              $49<span className="font-sans text-[15px] text-ink-muted font-normal ml-1">{t("/ month", "/ mois")}</span>
            </div>
            <p className="text-[12px] text-positive font-semibold mb-5 mt-1">{t("✶ Try free for 7 days", "✶ Essai gratuit 7 jours")}</p>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              {t("For self-employed and solo operators under $500K revenue.", "Pour travailleurs autonomes et solopreneurs sous 500 K$ de revenus.")}
            </p>
            <ul className="mb-8 flex-1">
              {[
                t("Full prescan + leak report", "Prescan complet + rapport de fuites"),
                t("Financial Health Score", "Score de santé financière"),
                t("All leaks with dollar amounts", "Toutes les fuites avec montants"),
                t("90-day action plan", "Plan d’action 90 jours"),
                t("Monthly re-scans", "Analyses mensuelles"),
                t("Smart deadline alerts", "Alertes d’échéances intelligentes"),
                t("Government programs matched", "Programmes gouvernementaux"),
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 py-2.5 border-b border-border-light text-sm text-ink-secondary last:border-0">
                  <span className="text-positive shrink-0 text-[13px] mt-px">&#10003;</span>{f}
                </li>
              ))}
            </ul>
            <a href="/v2/checkout?plan=solo" className="w-full py-3.5 text-sm font-semibold rounded-[8px] bg-brand text-white hover:bg-brand-light transition text-center block">
              {t("Try free for 7 days →", "Essayer gratuitement 7 jours →")}
            </a>
            <p className="text-[10px] text-ink-faint text-center mt-2">{t("No credit card · Cancel anytime", "Aucune carte · Annulez à tout moment")}</p>
          </div>

          {/* TIER 2: BUSINESS */}
          <div className="relative bg-bg border-2 border-brand rounded-[16px] p-8 flex flex-col shadow-xl shadow-brand/10">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-2.5 py-1 rounded-full">
                {t("Tier 2", "Niveau 2")}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-brand px-2.5 py-1 rounded-full">
                {t("Best value", "Meilleure valeur")}
              </span>
            </div>
            <div className="text-[13px] font-bold uppercase tracking-widest text-ink-muted mb-2">Business</div>
            <div className="font-serif text-[42px] text-ink tracking-tight font-normal leading-none mb-1">
              $149<span className="font-sans text-[15px] text-ink-muted font-normal ml-1">{t("/ month", "/ mois")}</span>
            </div>
            <p className="text-[12px] text-positive font-semibold mb-5 mt-1">{t("✶ Try free for 7 days", "✶ Essai gratuit 7 jours")}</p>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              {t("For businesses with employees doing $150K–$1M.", "Pour entreprises avec employés entre 500 K$ et 5 M$.")}
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
            <a href="/v2/checkout?plan=business" className="w-full py-3.5 text-sm font-semibold rounded-[8px] bg-brand text-white hover:bg-brand-light transition text-center block">
              {t("Try free for 7 days →", "Essayer gratuitement 7 jours →")}
            </a>
            <p className="text-[10px] text-ink-faint text-center mt-2">{t("No credit card · Cancel anytime", "Aucune carte · Annulez à tout moment")}</p>
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
        <h2 className="font-serif text-[38px] text-white font-normal tracking-tight mb-3.5">{t("Your business is leaking money right now.", "Votre entreprise perd de l'argent en ce moment.")}</h2>
        <p className="text-[16px] text-white/60 max-w-[400px] mx-auto mb-8 leading-relaxed">{t("5 minutes. No credit card. Find out exactly how much.", "5 minutes. Sans carte de crédit. Découvrez exactement combien.")}</p>
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
