// app/v2/chat/page.tsx - Enterprise-aligned, light theme
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts?: string;
}

interface DiagContext {
  businessName?: string;
  industry?: string;
  province?: string;
  revenue?: number;
  savingsAnchor?: string;
  overallScore?: number;
  topFindings?: string[];
  totalLeaks?: number;
  totalSavings?: number;
}

const STARTERS = [
  { en: "What's the biggest tax savings opportunity for my business?",
    fr: "Quelle est la plus grande économie fiscale pour mon entreprise?" },
  { en: "Walk me through the SR&ED credit eligibility for my industry.",
    fr: "Expliquez-moi l'admissibilité au crédit RS&DE pour mon industrie." },
  { en: "How do I structure a holdco to reduce my corporate tax?",
    fr: "Comment structurer une holdco pour réduire mon impôt corporatif?" },
  { en: "What should I prioritize before my next fiscal year-end?",
    fr: "Que dois-je prioriser avant ma prochaine fin d'exercice?" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0,1,2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-ink-faint"
          style={{ animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusLeak = searchParams.get("focus");

  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [sending, setSending]       = useState(false);
  const [userId, setUserId]         = useState<string|null>(null);
  const [convId, setConvId]         = useState<string|null>(null);
  const [lang, setLang]             = useState<"en"|"fr">("fr");
  const [ctx, setCtx]               = useState<DiagContext>({});
  const [isEnt, setIsEnt]           = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string|null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const t = (en: string, fr: string) => lang === "fr" ? fr : en;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fruxal_lang");
      if (stored === "en" || stored === "fr") setLang(stored as "en"|"fr");
      else if (navigator.language?.startsWith("fr")) setLang("fr");
      setIsEnt(localStorage.getItem("fruxal_tier") === "enterprise");
    } catch {}

    async function init() {
      try {
        // Auth
        const meRes = await fetch("/api/me");
        if (!meRes.ok) { router.push("/login?redirect=/v2/chat"); return; }
        const me = await meRes.json();
        setUserId(me.user?.id || me.id);

        // Load diagnostic context for richer AI responses
        const [dashRes, reportRes] = await Promise.all([
          fetch("/api/v2/dashboard").then(r => r.ok ? r.json() : null).catch(() => null),
          fetch("/api/v2/diagnostic/latest").then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        const diagCtx: DiagContext = {};
        if (dashRes?.data) {
          const d = dashRes.data;
          diagCtx.businessName = d.profile?.business_name;
          diagCtx.industry     = d.profile?.industry;
          diagCtx.province     = d.profile?.province;
        }
        if (reportRes?.data) {
          const r = reportRes.data;
          diagCtx.savingsAnchor  = r.savings_anchor;
          diagCtx.overallScore   = r.scores?.overall ?? r.overall_score;
          diagCtx.totalLeaks     = r.totals?.annual_leaks ?? r.total_annual_leaks;
          diagCtx.totalSavings   = r.totals?.potential_savings ?? r.total_potential_savings;
          diagCtx.topFindings    = (r.findings || []).slice(0, 3).map((f: any) => f.title || f.finding);
        }
        setCtx(diagCtx);

        // Seed with focus leak if present
        if (focusLeak) {
          setMessages([{ role:"user", content:`Tell me more about this and how to fix it: ${focusLeak}`, ts: new Date().toISOString() }]);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, focusLeak]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending || !userId) return;
    setInput("");
    const userMsg: Message = { role:"user", content:msg, ts:new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const body: any = {
        message: msg, conversationId: convId, language: lang,
      };
      // Inject diagnostic context into first message so AI knows the business
      if (messages.length === 0 && ctx) {
        body.context = ctx;
      }
      const res = await fetch("/api/v2/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.conversationId) setConvId(json.conversationId);
      const reply = json.reply || json.message || json.response || json.content || t("Sorry, try again.","Désolé, réessayez.");
      setMessages(prev => [...prev, { role:"assistant", content:reply, ts:new Date().toISOString() }]);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:t("Network error. Please try again.","Erreur réseau. Réessayez."), ts:new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  }, [input, sending, userId, convId, lang, ctx, messages.length, t]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? t("Good morning","Bonjour") : h < 18 ? t("Good afternoon","Bon après-midi") : t("Good evening","Bonsoir");
  })();

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-xs">
        <p className="text-[14px] font-semibold text-ink mb-2">{t("Something went wrong","Une erreur s'est produite")}</p>
        <p className="text-[11px] text-ink-faint mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 text-[11px] font-semibold text-white rounded-lg"
          style={{ background:"#1B3A2D" }}>
          {t("Try again","Réessayer")}
        </button>
      </div>
    </div>
  );

  const showEmpty = messages.length === 0 && !sending;

  return (
    <div className="bg-bg min-h-screen font-sans flex flex-col" style={{ height:"100dvh" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 lg:px-8 py-4 bg-white border-b border-border-light shrink-0"
        style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background:"rgba(27,58,45,0.08)", border:"1px solid rgba(27,58,45,0.12)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink leading-none">
              {t("Fruxal AI","Fruxal IA")}
            </p>
            <p className="text-[9px] text-ink-faint mt-0.5">
              {isEnt
                ? t("Enterprise CFO-level advisor","Conseiller de niveau DAF entreprise")
                : t("Financial intelligence assistant","Assistant intelligence financière")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEnt && ctx.overallScore !== undefined && (
            <div className="text-[9px] font-semibold px-2 py-1 rounded"
              style={{ background:"rgba(27,58,45,0.06)", color:"#1B3A2D", border:"1px solid rgba(27,58,45,0.10)" }}>
              {t("Score","Score")} {ctx.overallScore}/100
            </div>
          )}
          <div className="flex bg-bg-section border border-border-light rounded-[7px] p-[3px] gap-[2px]">
            {(["en","fr"] as const).map(l => (
              <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("fruxal_lang", l); } catch {} }}
                className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-[5px] transition-all ${
                  lang === l ? "bg-white text-ink shadow-sm" : "text-ink-muted"}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <button onClick={() => { setMessages([]); setConvId(null); }}
              className="w-7 h-7 flex items-center justify-center rounded border border-border-light bg-white text-ink-faint hover:text-ink transition"
              title={t("New chat","Nouvelle conversation")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Context bar (enterprise, when report exists) ─────────────────── */}
      {isEnt && ctx.savingsAnchor && (
        <div className="px-6 lg:px-8 py-2.5 border-b border-border-light bg-white shrink-0">
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-ink-faint">{t("Context:","Contexte :")}</span>
            <span className="text-ink-muted font-medium">{ctx.savingsAnchor}</span>
            {ctx.topFindings && ctx.topFindings.length > 0 && (
              <span className="text-ink-faint">·</span>
            )}
            {ctx.topFindings?.slice(0,2).map((f, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[9px]"
                style={{ background:"rgba(27,58,45,0.05)", color:"#1B3A2D", border:"1px solid rgba(27,58,45,0.08)" }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-5">
        <div className="max-w-[760px] mx-auto">

          {/* Empty state */}
          {showEmpty && (
            <div className="pt-4 pb-8">
              <div className="mb-6">
                <p className="text-[22px] font-serif font-semibold text-ink tracking-tight mb-1">
                  {greeting}{ctx.businessName ? `, ${ctx.businessName.split(" ")[0]}` : ""}
                </p>
                <p className="text-[12px] text-ink-muted">
                  {isEnt
                    ? t("Ask anything about your enterprise finances, tax strategy, or diagnostic findings.",
                        "Posez n'importe quelle question sur vos finances d'entreprise, stratégie fiscale ou résultats du diagnostic.")
                    : t("Ask me anything about your business finances.",
                        "Posez-moi n'importe quelle question sur vos finances d'entreprise.")}
                </p>
              </div>

              {/* Starter prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTERS.map((s, i) => (
                  <button key={i} onClick={() => send(lang === "fr" ? s.fr : s.en)}
                    className="text-left px-4 py-3 bg-white rounded-xl border border-border-light hover:border-brand/20 hover:bg-brand/[0.02] transition-all group"
                    style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                    <p className="text-[11px] text-ink-secondary group-hover:text-ink transition-colors leading-relaxed">
                      {lang === "fr" ? s.fr : s.en}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message thread */}
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 shrink-0 mt-0.5"
                    style={{ background:"rgba(27,58,45,0.08)", border:"1px solid rgba(27,58,45,0.10)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-[12px] leading-relaxed ${
                  m.role === "user"
                    ? "text-white rounded-br-sm"
                    : "bg-white border border-border-light text-ink rounded-bl-sm"
                }`}
                  style={m.role === "user"
                    ? { background:"#1B3A2D", boxShadow:"0 1px 3px rgba(27,58,45,0.2)" }
                    : { boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                  {m.content.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < m.content.split("\n").length - 1 && <br/>}</span>
                  ))}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 shrink-0 mt-0.5"
                  style={{ background:"rgba(27,58,45,0.08)", border:"1px solid rgba(27,58,45,0.10)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <div className="bg-white border border-border-light rounded-2xl rounded-bl-sm"
                  style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 lg:px-8 py-4 bg-white border-t border-border-light">
        <div className="max-w-[760px] mx-auto">
          <div className="flex items-end gap-3 bg-bg border border-border-light rounded-xl px-4 py-3"
            style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder={isEnt
                ? t("Ask about tax strategy, EBITDA, exit planning…","Posez une question sur la fiscalité, BAIIA, planification de sortie…")
                : t("Ask about your finances…","Posez une question sur vos finances…")}
              className="flex-1 bg-transparent text-[12px] text-ink placeholder:text-ink-faint resize-none focus:outline-none leading-relaxed"
              style={{ maxHeight:"120px", overflowY:"auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button onClick={() => send()} disabled={!input.trim() || sending}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
              style={{ background: input.trim() && !sending ? "#1B3A2D" : "#E8E6E1" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && !sending ? "white" : "#8E8C85"}
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="text-[9px] text-ink-faint text-center mt-2">
            {t("AI may make mistakes. Verify with a qualified advisor.","L'IA peut faire des erreurs. Vérifiez avec un conseiller qualifié.")}
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce {
          0%,100% { transform:translateY(0); opacity:.4 }
          50% { transform:translateY(-3px); opacity:1 }
        }
      `}</style>
    </div>
  );
}
