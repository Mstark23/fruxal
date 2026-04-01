// =============================================================================
// FRUXAL DASHBOARD - SOLO TIER
// =============================================================================
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCelebration } from "@/hooks/useCelebration";


function Ring({ pct, size = 44, sw = 4, color = "#2D7A50" }: { pct: number; size?: number; sw?: number; color?: string }) {
  const r = (size - sw) / 2, circ = 2 * Math.PI * r;
  return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EFEB" strokeWidth={sw} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" transform={"rotate(-90 " + (size/2) + " " + (size/2) + ")"} style={{ transition: "stroke-dashoffset 1s ease" }} /></svg>;
}
function LockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C5C2BB" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}

interface Leak { slug: string; title: string; title_fr?: string; severity: string; category: string; description: string; description_fr?: string; impact_min: number; impact_max: number; confidence: number | null; proof?: string; action?: string; action_fr?: string; affiliates?: Array<{ name: string; url: string }> }
interface Deadline { title: string; days_until: number; penalty_max?: number }
const SEV_DOT: Record<string, string> = { critical: "#B34040", high: "#C4841D", medium: "#8E8C85", low: "#C5C2BB" };

export default function SoloDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { progress } = useCelebration();
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [mounted, setMounted] = useState(false);

  const [score, setScore] = useState(0);
  const [totalLeak, setTotalLeak] = useState(0);
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [tier, setTier] = useState("solo");
  const [recommendedPlan, setRecommendedPlan] = useState("solo");
  const [profile, setProfile] = useState({ province: "", country: "", industry: "Small Business", structure: "" });
  const [overdue, setOverdue] = useState(0);
  const [penaltyExposure, setPenaltyExposure] = useState(0);
  const [obligationsTotal, setObligationsTotal] = useState(0);
  const [programsAvailable, setProgramsAvailable] = useState(0);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [leaksFixed, setLeaksFixed] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [diagPrograms, setDiagPrograms] = useState<Array<{ slug: string; name: string; name_fr?: string; value: number }>>([]);
  const [diagFindings, setDiagFindings] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assignedRep, setAssignedRep] = useState<{ name: string; calendly_url: string | null; contingency_rate: number; pipeline_stage: string | null } | null>(null);

  const t = useCallback((en: string, fr: string) => lang === "fr" ? fr : en, [lang]);
  const isFR = lang === "fr";
  // T1/T2 are free — no paywalls, no upgrade CTAs except enterprise upsell

  useEffect(() => {
    let redirected = false;
    try { const s = sessionStorage.getItem("lg_prescan_lang"); if (s === "en" || s === "fr") setLang(s); else if (navigator.language?.startsWith("fr")) setLang("fr"); } catch { /* non-fatal */ }

    let prescanLoaded = false;
    try {
      const raw = sessionStorage.getItem("lg_prescan_result");
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.analysis?.leaks) {
          setScore(p.analysis.fhScore || 50);
          setTotalLeak(p.analysis.totalLeak ?? 0);
          const CAT_MAP: Record<string, string> = { processing_rate_high: "Paiements", rent_or_chair_high: "Immobilier", tax_optimization_gap: "Fiscalite", payroll_ratio_high: "Personnel", insurance_overpayment: "Assurance", fuel_vehicle_high: "Transport", software_bloat: "Operations", banking_fees_high: "Bancaire", inventory_cogs_high: "Inventaire", marketing_waste: "Marketing", cash_shrinkage: "Comptabilite", utilities_overspend: "Utilitaires", revenue_underpricing: "Revenus", accounting_gap: "Comptabilite", tax_credit_missed: "Fiscalite", compliance_gap: "Conformite" };
          const sev = (s: any) => typeof s === "string" ? s : Number(s) >= 80 ? "critical" : Number(s) >= 60 ? "high" : Number(s) >= 30 ? "medium" : "low";
          setLeaks(p.analysis.leaks.map((l: any) => ({ slug: l.type || l.slug || "unknown", title: l.title || "", title_fr: l.title_fr, severity: sev(l.severity), category: CAT_MAP[l.type] || l.category || "General", description: l.explanation || l.description || "", description_fr: l.explanation_fr, impact_min: l.amount ?? 0, impact_max: l.amount ?? 0, confidence: l.confidence || null, proof: l.proof, action: l.action, action_fr: l.action_fr, affiliates: l.affiliates || [] })));
          prescanLoaded = true;
        }
      }
    } catch { /* non-fatal */ }

    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const rid = params.get("prescanRunId");
    const v2Url = rid ? "/api/v2/dashboard?prescanRunId=" + rid : "/api/v2/dashboard";

    const v2P = fetch(v2Url).then(r => r.json()).catch(() => ({})).then(json => {
      if (!json.success || !json.data) return;
      const d = json.data;
      const detectedTier = (d.tier || "free").toLowerCase();
      const detectedPlan = (d.recommended_plan || "").toLowerCase();
      if (detectedTier === "enterprise" || detectedTier === "corp") { redirected = true; router.replace("/v2/dashboard/enterprise"); return; }
      if (detectedTier === "business" || detectedTier === "growth" || detectedTier === "team") { redirected = true; router.replace("/v2/dashboard/business"); return; }
      // NOTE: Do NOT redirect on recommended_plan — that caused a redirect loop.
      // Free users who qualify by revenue stay on solo and see upgrade CTAs.
      setTier(detectedTier);
      if (d.recommended_plan) setRecommendedPlan(d.recommended_plan);
      setProfile(d.profile || { province: "", country: "", industry: "Small Business", structure: "" });
      setObligationsTotal(d.obligations?.total ?? 0);
      setOverdue(d.obligations?.overdue ?? 0);
      setPenaltyExposure(d.obligations?.penalty_exposure ?? 0);
      setDeadlines(d.obligations?.upcoming_deadlines || []);
      setProgramsAvailable(d.programs?.available ?? 0);
      setLeaksFixed(d.leaks?.fixed ?? 0);
      setTotalSavings(d.leaks?.total_savings ?? 0);
      if (d.assigned_rep) setAssignedRep(d.assigned_rep);
      if (!prescanLoaded && d.leaks?.top_unfixed?.length > 0) {
        setScore(d.health_score || 50);
        setTotalLeak(d.total_leak_estimate ?? 0);
        const sev = (s: any) => { if (typeof s === "string" && ["critical","high","medium","low"].includes(s)) return s; const n = Number(s); return isNaN(n) ? "medium" : n >= 80 ? "critical" : n >= 60 ? "high" : n >= 30 ? "medium" : "low"; };
        setLeaks(d.leaks.top_unfixed.map((l: any) => ({ slug: l.slug, title: l.title, title_fr: l.title_fr, severity: sev(l.severity), category: l.category || "General", description: l.description || "", description_fr: l.description_fr, impact_min: l.impact_min ?? 0, impact_max: (l.impact_max || l.impact_min) ?? 0, confidence: l.confidence, proof: l.proof, action: l.action, action_fr: l.action_fr, affiliates: l.affiliates || [] })));
      }
    }).catch(() => {});

    let analyzePoll: ReturnType<typeof setInterval> | null = null;
    let isAnalyzingNow = false;

    const loadDiag = async () => {
      try {
        const json = await fetch("/api/v2/diagnostic/latest").then(r => r.json());
        if (redirected || !json.success) return;
        if (json.status === "analyzing" || json.data?.status === "analyzing") {
          setIsAnalyzing(true);
          isAnalyzingNow = true;
          return;
        }
        if (!json.data) return;
        setIsAnalyzing(false);
        const r = json.data;
      const diagScore = r.scores?.overall ?? r.overall_score ?? 0;
      if (diagScore > 0) setScore(diagScore);
      const diagLeak = (r.total_annual_leaks || r.totals?.annual_leaks) ?? 0;
      if (diagLeak > 0) setTotalLeak(diagLeak);
      // action_plan not used in contingency model
      if (r.findings?.length > 0) {
        setDiagFindings(r.findings);
        const slugs: string[] = [];
        r.findings.forEach((f: any) => { (f.program_slugs || []).forEach((s: string) => { if (!slugs.includes(s)) slugs.push(s); }); });
        if (slugs.length > 0) {
          fetch("/api/v2/affiliates?type=government&limit=50").then(res => res.json()).then(aff => {
            const matched = (aff.affiliates || aff.data || []).filter((a: any) => slugs.includes(a.slug)).map((a: any) => ({ slug: a.slug, name: a.name, name_fr: a.name_fr, value: (a.annual_value_max || a.annual_value_min) ?? 0 }));
            if (matched.length > 0) setDiagPrograms(matched);
          }).catch(() => {});
        }
        if (r.programs?.length > 0) {
          const progs = r.programs.slice(0, 5).map((p: any) => ({ slug: p.slug, name: p.name, name_fr: p.name_fr, value: p.max_amount ?? 0 }));
          setDiagPrograms(prev => prev.length > 0 ? prev : progs);
        }
      }
      } catch { /* non-fatal */ }
    };
    const diagP = loadDiag();

    Promise.all([v2P, diagP]).finally(() => {
      setLoading(false);
      requestAnimationFrame(() => setMounted(true));
      // Only poll when actually analyzing
      if (isAnalyzingNow) {
        analyzePoll = setInterval(async () => {
          try {
            const json = await fetch("/api/v2/diagnostic/latest").then(r => r.json());
            if (json.status === "analyzing" || json.data?.status === "analyzing") return;
            clearInterval(analyzePoll!);
            setIsAnalyzing(false);
            await loadDiag();
          } catch { /* non-fatal */ }
        }, 4000);
      }
    });

    return () => { if (analyzePoll) clearInterval(analyzePoll); };
  }, [user?.id]);

  const recovered = (totalSavings) ?? 0;
  const recovPct = totalLeak > 0 ? Math.min(100, Math.round((recovered / totalLeak) * 100)) : 0;
  const streak = (progress as any)?.streak;
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? t("Good morning", "Bonjour") : h < 18 ? t("Good afternoon", "Bon apres-midi") : t("Good evening", "Bonsoir"); })();

  // fade must be declared before early returns so it is not between returns
  function fadeDelay(d: number) {
    return { opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1) " + d + "s" };
  }

  // Gap 2+6 fix: compute allLeaks inside render using current isFR — not stale at mount time
  const allLeaks = (() => {
    if (diagFindings.length > 0) {
      return diagFindings.map((f: any) => ({
        slug: f.id || f.slug || "f",
        title: f.title, title_fr: f.title_fr,
        severity: f.severity, category: f.category,
        description: isFR ? (f.description_fr || f.description) : f.description,
        description_fr: f.description_fr,
        impact_min: (f.annual_leak || f.impact_min) ?? 0,
        impact_max: (f.potential_savings || f.impact_max || f.annual_leak) ?? 0,
        confidence: null,
        action: isFR ? (f.action_items_fr?.[0] || f.action_items?.[0]) : f.action_items?.[0],
        action_fr: f.action_items_fr?.[0],
        affiliates: [],
      }));
    }
    return leaks;
  })();
  const displayLeaks = allLeaks.slice(0, 6); // show all, no gating

  if (loading || authLoading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" /></div>
  );

  if (leaks.length === 0 && diagFindings.length === 0 && !totalLeak) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-brand/8 flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.5" strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-ink mb-2">
          {t("Run your first diagnostic", "Lancez votre premier diagnostic")}
        </h2>
        <p className="text-[14px] text-ink-muted mb-2">
          {t("Get your financial health score and every detected leak with exact dollar amounts — in 5 minutes. Your rep handles the rest.", "Obtenez votre score de santé financière et chaque fuite avec les montants exacts — en 5 minutes. Votre rep s'occupe du reste.")}
        </p>
        <p className="text-[12px] text-ink-faint mb-6">
          {profile.country === "US" ? "Takes about 5 minutes · No CPA needed" : t("Takes about 5 minutes · No accountant needed", "Environ 5 minutes · Sans comptable")}
        </p>
        <button onClick={() => router.push("/v2/diagnostic")}
          className="px-7 py-3 text-[14px] font-bold text-white bg-brand rounded-xl hover:bg-brand/90 transition">
          {t("Run my diagnostic →", "Lancer mon diagnostic →")}
        </button>
        <p className="text-[11px] text-ink-faint mt-4">
          {t("Complete the prescan on the home page first, then come back.", "Faites d'abord le préscan sur la page d'accueil, puis revenez.")}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-bg min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-[1100px]">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-5" style={fadeDelay(0)}>
          <div>
            <h1 className="text-[15px] font-semibold text-ink">{greeting}{user?.name ? ", " + user.name.split(" ")[0] : ""}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-ink-faint">{profile.industry} · {profile.province}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(45,122,80,0.08)", color: "#1B3A2D" }}>
                Solo
              </span>
              {streak && streak.current > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-[2px]">{streak.week_map?.map((a: boolean, i: number) => <div className={"w-[4px] h-[4px] rounded-[1px] " + (a ? "bg-positive" : "bg-border")} />)}</div>
                  <span className="text-[11px] text-ink-faint">{streak.current}{t("d", "j")}</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="h-6 px-2.5 text-[11px] font-bold text-ink-muted bg-white border border-border-light rounded-md hover:bg-bg-section transition">{lang === "fr" ? "EN" : "FR"}</button>
        </div>

        {/* ANALYZING BANNER */}
        {isAnalyzing && (
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
            style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)", ...fadeDelay(0.01) }}>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-white">{t("Diagnostic in progress…", "Diagnostic en cours…")}</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>{t("This takes 30–60 seconds. Page will refresh automatically.", "Cela prend 30 à 60 secondes. La page se rafraîchira automatiquement.")}</p>
            </div>
          </div>
        )}

        {/* ═══ INTAKE GATE — dominant when no real diagnostic yet ═══ */}
        {!isAnalyzing && diagFindings.length === 0 && allLeaks.length > 0 && (
          <div className="w-full rounded-2xl mb-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2419 0%, #1B3A2D 60%, #1F4A36 100%)", border: "1px solid rgba(45,122,80,0.25)", ...fadeDelay(0.02) }}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">
                      {t("Estimates Only — Real Numbers Waiting", "Estimations seulement — vrais chiffres disponibles")}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-white leading-snug">
                    {t("Your leaks are real.", "Vos fuites sont réelles.")}
                    <br />
                    {t("Run the intake to confirm exact amounts.", "Lancez l'analyse pour confirmer les montants exacts.")}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { n: "1", text: t("Complete the 5-min intake form", "Remplissez le formulaire de 5 min") },
                  { n: "2", text: t("Get exact dollar amounts per leak", "Obtenez les montants exacts par fuite") },
                  { n: "3", text: t("Your rep gets the full picture to recover it", "Votre rep récupère le tout pour vous") },
                ].map(s => (
                  <div key={s.n} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-[10px] font-black text-amber-400 mb-1">STEP {s.n}</div>
                    <div className="text-[11px] text-white/70 leading-tight">{s.text}</div>
                  </div>
                ))}
              </div>
              {totalLeak > 0 && (
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <p className="text-[12px] text-white/60 flex-1">
                    {t("Estimated leak based on prescan:", "Fuite estimée selon le préscan :")}
                    <span className="text-red-400 font-black ml-1.5">${totalLeak.toLocaleString()}/yr</span>
                    <span className="text-white/30 text-[11px] ml-1.5">{t("— confirm with intake", "— confirmer avec l'analyse")}</span>
                  </p>
                </div>
              )}
              <button onClick={() => router.push("/v2/diagnostic")}
                className="w-full py-3 rounded-xl text-center text-[13px] font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0F2419" }}>
                {t("Run My Full Intake Now →", "Lancer mon analyse complète →")}
              </button>
              <p className="text-center text-[10px] text-white/20 mt-2">
                {t("Takes ~5 min · Your rep is waiting for these numbers", "~5 min · Votre rep attend ces chiffres")}
              </p>
            </div>
          </div>
        )}

        {/* OVERDUE ALERT */}
        {overdue > 0 && (
          <button onClick={() => router.push("/v2/obligations")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-left" style={{ background: "rgba(179,64,64,0.03)", border: "1px solid rgba(179,64,64,0.1)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1) 0.02s" }}>
            <div className="w-[6px] h-[6px] rounded-full bg-negative animate-pulse" />
            <span className="text-[11px] font-semibold text-negative flex-1">{overdue} {t("overdue obligation", "obligation en retard")}{overdue > 1 ? "s" : ""} - ${penaltyExposure.toLocaleString()} {t("at risk", "à risque")}</span>
            <span className="text-[10px] font-semibold text-negative">{t("Resolve", "Résoudre")}</span>
          </button>
        )}

        {/* ═══ REP BOOKING BANNER — only after intake done ═══ */}
        {diagFindings.length > 0 && assignedRep && assignedRep.pipeline_stage !== "completed" && assignedRep.pipeline_stage !== "in_engagement" && assignedRep.pipeline_stage !== "recovery_tracking" && (
          <div className="w-full rounded-2xl mb-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2419 0%, #1B3A2D 60%, #1F4A36 100%)", border: "1px solid rgba(45,122,80,0.25)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s" }}>
            <div className="px-5 pt-5 pb-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">
                      {t("Recovery Expert Assigned", "Expert en récupération assigné")}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-white leading-snug">
                    {t("We found your leaks.", "Nous avons trouvé vos fuites.")}
                    <br />
                    {t("We'll fix them for you.", "Nous allons les corriger pour vous.")}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-[15px] font-bold text-emerald-300">
                  {assignedRep.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* How it works */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { n: "1", text: t("Book a free call with your rep", "Réservez un appel gratuit") },
                  { n: "2", text: profile.country === "US" ? "We handle all the work & IRS filings" : t("We handle all the work & CRA calls", "On s'occupe de tout") },
                  { n: "3", text: t(`You keep ${100 - (assignedRep.contingency_rate ?? 12)}% of what we recover`, `Vous gardez ${100 - (assignedRep.contingency_rate ?? 12)}% de ce qu'on récupère`) },
                ].map(s => (
                  <div key={s.n} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-[10px] font-black text-emerald-400 mb-1">STEP {s.n}</div>
                    <div className="text-[11px] text-white/70 leading-tight">{s.text}</div>
                  </div>
                ))}
              </div>

              {/* Leak estimate + contingency math */}
              {totalLeak > 0 && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{t("Your estimated annual leak", "Fuite annuelle estimée")}</div>
                    <div className="text-[18px] font-black text-red-400">${totalLeak.toLocaleString()}/yr</div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  <div className="text-right">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{t("You keep", "Vous gardez")}</div>
                    <div className="text-[18px] font-black text-emerald-400">${Math.round(totalLeak * (1 - (assignedRep.contingency_rate ?? 12) / 100)).toLocaleString()}/yr</div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-2">
                {assignedRep.calendly_url ? (
                  <a
                    href={assignedRep.calendly_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl text-center text-[13px] font-bold text-[#0F2419] transition-all hover:opacity-90 hover:-translate-y-px"
                    style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}
                  >
                    {t(`Book a Free Call with ${assignedRep.name} →`, `Réserver un appel gratuit avec ${assignedRep.name} →`)}
                  </a>
                ) : (
                  <button
                    className="flex-1 py-3 rounded-xl text-center text-[13px] font-bold text-white/40 cursor-not-allowed"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    disabled
                  >
                    {t("Your rep will reach out shortly", "Votre rep vous contactera sous peu")}
                  </button>
                )}
                <div className="flex items-center justify-center gap-1 text-[10px] text-white/20 sm:w-auto">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  {t(`No cost until you recover. We take ${assignedRep.contingency_rate ?? 12}%.`, `Aucun frais avant récupération. On prend ${assignedRep.contingency_rate ?? 12}%.`)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ACTIVE ENGAGEMENT BANNER (rep is working on it) ═══ */}
        {assignedRep && (assignedRep.pipeline_stage === "in_engagement" || assignedRep.pipeline_stage === "recovery_tracking") && (
          <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-4" style={{ background: "rgba(27,58,45,0.06)", border: "1px solid rgba(27,58,45,0.15)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1) 0.04s" }}>
            <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-[12px] font-bold text-brand">
              {assignedRep.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-ink">{t(`${assignedRep.name} is working on your recovery`, `${assignedRep.name} travaille sur votre récupération`)}</p>
              <p className="text-[10px] text-ink-faint mt-0.5">{t("We'll notify you as amounts are confirmed and recovered.", "Nous vous informerons au fur et à mesure des récupérations.")}</p>
            </div>
            {assignedRep.calendly_url && (
              <a href={assignedRep.calendly_url} target="_blank" rel="noopener noreferrer"
                className="shrink-0 h-8 px-3 text-[11px] font-bold text-brand border border-brand/20 rounded-lg hover:bg-brand/5 transition">
                {t("Check in →", "Suivi →")}
              </a>
            )}
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5" style={fadeDelay(0.04)}>
          <button onClick={() => router.push("/v2/diagnostic")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all group" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Business Health", "Santé entreprise")}</div>
            {score > 0 ? (
              <>
                <div className="flex items-end gap-1.5">
                  <span className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: score >= 60 ? "#1B3A2D" : "#C4841D" }}>{score}</span>
                  <span className="text-xs text-ink-muted mb-1">/100</span>
                </div>
                <div className="mt-3 h-[3px] bg-bg-section rounded-full"><div className="h-full rounded-full transition-all duration-1000" style={{ width: score + "%", background: score >= 70 ? "#2D7A50" : score >= 40 ? "#C4841D" : "#B34040" }} /></div>
              </>
            ) : (
              <>
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-ink-faint">—</div>
                <div className="text-[11px] text-ink-muted mt-1.5">{t("Run diagnostic →", "Lancer →")}</div>
              </>
            )}
          </button>

          <button onClick={() => router.push("/v2/leaks")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Still Leaking", "Encore en fuite")}</div>
            <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-negative">${(totalLeak ?? 0).toLocaleString()}</div>
            <div className="text-[11px] text-ink-muted mt-1.5">
              {displayLeaks.length} {t("leaks still costing you", "fuites encore actives")}

            </div>
          </button>

          <div className="bg-white rounded-xl p-5 border border-border-light" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Money Recovered", "Argent récupéré")}</div>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-positive">${(recovered ?? 0).toLocaleString()}</div>
                <div className="text-[11px] text-ink-muted mt-1.5">{leaksFixed} {t("fixed", "corriges")}</div>
              </div>
              <div className="relative mt-1"><Ring pct={recovPct / 100} /><div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-bold text-positive">{recovPct}%</span></div></div>
            </div>
          </div>

          <button onClick={() => router.push("/v2/obligations")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">OBLIGATIONS</div>
            <div className="flex items-end gap-2">
              <span className="font-serif text-[36px] font-bold leading-none tracking-tight">{obligationsTotal}</span>
              {overdue > 0 && <span className="text-[10px] font-bold text-negative mb-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(179,64,64,0.05)" }}>{overdue} {t("late", "retard")}</span>}
            </div>
          </button>
        </div>

        {/* MAIN 3-COL */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-3" style={fadeDelay(0.1)}>

          {/* COL 1: LEAKS */}
          <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Detected Leaks", "Fuites detectees")}</span>
              <button onClick={() => router.push("/v2/leaks")} className="text-[11px] font-semibold text-brand hover:underline">{t("View all", "Tout voir")}</button>
            </div>

            {false ? (
              <>
                {displayLeaks.slice(0, 1).map((l, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border-light" style={{ background: "rgba(179,64,64,0.015)" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-[7px] h-[7px] rounded-full shrink-0 mt-1.5" style={{ background: "#B34040" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-white bg-negative px-1.5 py-0.5 rounded">#1</span>
                          <span className="text-[12px] font-semibold text-ink">{isFR ? (l.title_fr || l.title) : l.title}</span>
                        </div>
                        <div className="text-[11px] text-ink-muted mb-2">{l.category}</div>
                        {(isFR ? (l.action_fr || l.action) : l.action) && (
                          <div className="p-2 rounded-lg text-[11px] text-ink-secondary mb-2" style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.06)" }}>
                            <span className="font-semibold text-brand">{t("Fix: ", "Correction : ")}</span>{isFR ? (l.action_fr || l.action) : l.action}
                          </div>
                        )}
                        {l.affiliates && l.affiliates.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {l.affiliates.slice(0, 3).map((a, ai) => (
                              <a key={ai} href={a.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-brand border border-brand/20 px-2 py-0.5 rounded-full hover:bg-brand/5 transition">{a.name}</a>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max ?? l.impact_min ?? 0).toLocaleString()}</div>
                        <div className="text-[10px] text-ink-faint">/{t("yr", "an")}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="relative">
                  {displayLeaks.slice(1, 4).map((l, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center gap-3 border-b border-border-light" style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }}>
                      <div className="w-[7px] h-[7px] rounded-full shrink-0 bg-border" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-ink truncate">{isFR ? (l.title_fr || l.title) : l.title}</div>
                        <div className="text-[11px] text-ink-faint">{l.category}</div>
                      </div>
                      <div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max ?? l.impact_min ?? 0).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                {allLeaks.length > 1 && null}
              </>
            ) : (
              <>
                {displayLeaks.slice(0, 6).map((l, i) => (
                  <div key={i} onClick={() => router.push("/v2/leaks")} className="px-4 py-2.5 flex items-center gap-3 border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors cursor-pointer group" style={{ background: l.severity === "critical" ? "rgba(179,64,64,0.02)" : "transparent" }}>
                    <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: SEV_DOT[l.severity] || "#8E8C85" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-ink truncate group-hover:text-brand transition-colors">{isFR ? (l.title_fr || l.title) : l.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-ink-faint">{l.category}</span>
                        {l.confidence && (<div className="flex items-center gap-1"><div className="w-5 h-[3px] bg-bg-section rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: l.confidence + "%", background: l.confidence >= 70 ? "#2D7A50" : "#C4841D" }} /></div><span className="text-[10px] text-ink-faint">{Math.round(l.confidence)}%</span></div>)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max ?? l.impact_min ?? 0).toLocaleString()}</div>
                      <div className="text-[10px] text-ink-faint">/{t("yr", "an")}</div>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2.5 bg-bg flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-ink-muted">Total</span>
                  <span className="font-serif text-[14px] font-bold text-negative">${(totalLeak ?? 0).toLocaleString()}/{t("yr", "an")}</span>
                </div>
              </>
            )}
          </div>

          {/* COL 2: REP STATUS + RECOVERY PROGRESS */}
          <div className="flex flex-col gap-3">

            {/* Rep working status */}
            {assignedRep && (assignedRep.pipeline_stage === "in_engagement" || assignedRep.pipeline_stage === "recovery_tracking") ? (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Recovery in Progress", "Récupération en cours")}</span>
                </div>
                <div className="px-4 py-4">
                  <p className="text-[13px] font-semibold text-ink mb-1">
                    {t(`${assignedRep.name} is working on your file`, `${assignedRep.name} travaille sur votre dossier`)}
                  </p>
                  <p className="text-[11px] text-ink-muted mb-4">
                    {profile.country === "US" ? "Our CPA is handling the IRS filings, vendor negotiations, and federal program applications. You'll be notified as amounts are confirmed." : t("Our accountant is handling the CRA calls, vendor negotiations, and grant applications. You'll be notified as amounts are confirmed.", "Notre comptable s'occupe des appels à l'ARC, des négociations fournisseurs et des demandes de subventions. Vous serez notifié au fur et à mesure des confirmations.")}
                  </p>
                  {recovered > 0 && (
                    <div className="p-3 rounded-xl mb-3" style={{ background: "rgba(45,122,80,0.04)", border: "1px solid rgba(45,122,80,0.10)" }}>
                      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">{t("Recovered So Far", "Récupéré jusqu'à présent")}</p>
                      <p className="font-serif text-[24px] font-bold text-positive">${recovered.toLocaleString()}</p>
                    </div>
                  )}
                  {assignedRep.calendly_url && (
                    <a href={assignedRep.calendly_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[12px] font-semibold text-brand border border-brand/20 hover:bg-brand/5 transition">
                      {t("Check In with Your Rep →", "Faire le point avec votre rep →")}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              /* Not yet engaged — show what happens next */
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("What Happens Next", "Ce qui se passe ensuite")}</span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {[
                    { n: "1", en: "Book a free call with your assigned rep", fr: "Réservez un appel gratuit avec votre rep" },
                    { n: "2", en: "We review your full diagnostic together", fr: "Nous examinons votre diagnostic ensemble" },
                    { n: "3", en: profile.country === "US" ? "Our CPA contacts the IRS & vendors" : "Our accountant contacts CRA & vendors", fr: "Notre comptable contacte l'ARC et les fournisseurs" },
                    { n: "4", en: "We invoice 12% of what we actually recover", fr: "Nous facturons 12% de ce que nous récupérons" },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.07)" }}>
                        <span className="text-[9px] font-bold text-brand">{s.n}</span>
                      </div>
                      <span className="text-[12px] text-ink-secondary leading-tight">{isFR ? s.fr : s.en}</span>
                    </div>
                  ))}
                </div>
                {assignedRep?.calendly_url && (
                  <div className="px-4 pb-4">
                    <a href={assignedRep.calendly_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-[13px] font-bold text-white transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)" }}>
                      {t(`Book a Call with ${assignedRep.name} →`, `Réserver un appel avec ${assignedRep.name} →`)}
                    </a>
                    <p className="text-center text-[10px] text-ink-faint mt-2">{t("No cost until we recover. We take 12%.", "Aucun frais avant récupération. On prend 12%.")}</p>
                  </div>
                )}
              </div>
            )}

            {/* Recovery scoreboard */}
            {recovered > 0 && (
              <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3">{t("Recovery Scoreboard", "Tableau de récupération")}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-ink-secondary">{t("Total identified", "Total identifié")}</span>
                    <span className="font-semibold text-negative">${(totalLeak ?? 0).toLocaleString()}/yr</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-ink-secondary">{t("Recovered so far", "Récupéré jusqu'ici")}</span>
                    <span className="font-semibold text-positive">+${recovered.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border-light" />
                  <div className="flex justify-between text-[12px]">
                    <span className="text-ink-secondary">{t("Still available", "Encore disponible")}</span>
                    <span className="font-semibold text-ink">${Math.max(0, (totalLeak ?? 0) - recovered).toLocaleString()}/yr</span>
                  </div>
                </div>
                <div className="mt-3 h-[4px] bg-bg-section rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-positive transition-all duration-1000" style={{ width: recovPct + "%" }} />
                </div>
                <p className="text-[10px] text-ink-faint mt-1.5 text-right">{recovPct}% {t("recovered", "récupéré")}</p>
              </div>
            )}


          </div>

          {/* COL 3: SIDEBAR */}
          <div className="flex flex-col gap-3">

            {/* Deadlines */}
            <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-2.5 border-b border-border-light flex justify-between items-center">
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Deadlines", "Echeances")}</span>
                <button onClick={() => router.push("/v2/obligations")} className="text-[11px] font-semibold text-brand hover:underline">{t("All", "Tout")}</button>
              </div>
              {deadlines.length === 0 ? (
                <div className="px-4 py-4 text-[11px] text-ink-faint text-center">{t("None upcoming", "Aucune echeance")}</div>
              ) : deadlines.slice(0, 4).map((dl, i) => (
                <div key={i} onClick={() => router.push("/v2/obligations")} className="px-4 py-2.5 flex items-center justify-between border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="text-[11px] font-medium text-ink truncate">{dl.title}</div>
                    {(dl.penalty_max ?? 0) > 0 && <div className="text-[10px] text-ink-faint mt-0.5">${dl.penalty_max!.toLocaleString()}</div>}
                  </div>
                  <div className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-md shrink-0" style={{ background: dl.days_until <= 3 ? "#B34040" : dl.days_until <= 7 ? "rgba(179,64,64,0.06)" : "#F0EFEB", color: dl.days_until <= 3 ? "white" : dl.days_until <= 7 ? "#B34040" : "#8E8C85" }}>{dl.days_until}{t("d", "j")}</div>
                </div>
              ))}
            </div>

            {/* Programs */}
            <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-2.5 border-b border-border-light flex justify-between items-center">
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Government Programs", "Programmes gouvernementaux")}</span>
                <button onClick={() => router.push("/v2/programs")} className="text-[11px] font-semibold text-brand hover:underline">{t("All", "Tout")}</button>
              </div>
              {diagPrograms.length > 0 ? (
                <>
                  {diagPrograms.slice(0, 3).map((p, i) => (
                    <div key={i} className="px-4 py-2.5 border-b border-border-light last:border-0">
                      <div className="text-[11px] font-semibold text-ink truncate">{isFR ? (p.name_fr || p.name) : p.name}</div>
                      {p.value > 0 && <div className="text-[10px] text-positive font-semibold mt-0.5">{t("up to", "jusqu'à")} ${(p.value ?? 0).toLocaleString()}</div>}
                    </div>
                  ))}
                  {diagPrograms.length > 3 && (
                    <button onClick={() => router.push("/v2/programs")} className="w-full px-4 py-2.5 text-[10px] font-semibold text-brand hover:bg-bg transition text-left">
                      +{diagPrograms.length - 3} {t("more programs", "autres programmes")}
                    </button>
                  )}
                </>
              ) : (
                <div className="px-4 py-4 text-center">
                  <span className="font-serif text-[28px] font-bold leading-none tracking-tight text-positive">{programsAvailable || "?"}</span>
                  <p className="text-[11px] text-ink-muted mt-1">{t("Run diagnostic for matched programs", "Lancez le diagnostic pour vos programmes")}</p>
                </div>
              )}
            </div>

            {/* Recovery bar */}
            <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3">{t("Recovery", "Recuperation")}</div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 bg-bg-section rounded-full overflow-hidden"><div className="h-full rounded-full bg-positive transition-all duration-700" style={{ width: Math.max(recovPct, 1) + "%" }} /></div>
                  <span className="text-[12px] font-bold text-ink tabular-nums">{recovPct}%</span>
                </div>
                <div className="flex justify-between text-[11px] text-ink-faint">
                  <span>${(recovered ?? 0).toLocaleString()} {t("recovered", "récupéré")}</span>
                  <span>${(totalLeak ?? 0).toLocaleString()} total</span>
                </div>
              </div>

            {/* AI Chat */}
            <button onClick={() => router.push("/v2/chat")} className="w-full bg-white rounded-xl border border-brand/15 p-4 text-left hover:shadow-[0_4px_16px_rgba(27,58,45,0.08)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-ink">{t("Ask Fruxal AI", "Demander a Fruxal IA")}</div>
                  <div className="text-[11px] text-ink-faint">{t("Get answers about your finances", "Posez vos questions financieres")}</div>
                </div>
                
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
