// FRUXAL BUSINESS DASHBOARD — /v2/business
// Free teaser: leak #1 + fix, rest blurred, Business $150 CTA
// Business paid: full leaks, benchmarks, recovery, payroll, advisor call

"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCelebration } from "@/hooks/useCelebration";

function Ring({ pct, size = 44, sw = 4, color = "#2D7A50" }: { pct: number; size?: number; sw?: number; color?: string }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EFEB" strokeWidth={sw} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 1s ease" }} /></svg>;
}
function MiniBar({ yours, bench }: { yours: number; bench: number }) {
  const max = Math.max(yours, bench) * 1.3, over = yours > bench * 1.05;
  return <div className="flex items-end gap-[3px] h-6"><div className="w-[6px] rounded-t-sm" style={{ height: (yours / max) * 100 + "%", background: over ? "#B34040" : "#2D7A50" }} /><div className="w-[6px] rounded-t-sm" style={{ height: (bench / max) * 100 + "%", background: "#E0DED9" }} /></div>;
}
function LockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C5C2BB" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}
interface Leak { slug: string; title: string; title_fr?: string; severity: string; category: string; description: string; impact_min: number; impact_max: number; confidence: number | null; action?: string; action_fr?: string; affiliates?: Array<{ name: string; url: string }> }
interface CostItem { category: string; pct_of_revenue: number; benchmark_pct: number; status: string }
interface Deadline { title: string; days_until: number; penalty_max?: number }
interface ActionItem { id: string; leak_title: string; fix_description: string; estimated_value: number; status: string }
interface ActionStats { total_recovered: number; actions_completed: number; quickbooks_connected: boolean; bank_connected: boolean }
const SEV_DOT: Record<string, string> = { critical: "#B34040", high: "#C4841D", medium: "#8E8C85", low: "#C5C2BB" };

export default function BusinessDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { progress } = useCelebration();
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalLeak, setTotalLeak] = useState(0);
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [tier, setTier] = useState("free");
  const [profile, setProfile] = useState({ province: "QC", industry: "Small Business" });
  const [overdue, setOverdue] = useState(0);
  const [penaltyExposure, setPenaltyExposure] = useState(0);
  const [obligationsTotal, setObligationsTotal] = useState(0);
  const [programsAvailable, setProgramsAvailable] = useState(0);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [leaksFixed, setLeaksFixed] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [costBreakdown, setCostBreakdown] = useState<CostItem[]>([]);
  const [actionStats, setActionStats] = useState<ActionStats | null>(null);
  const [inProgressActions, setInProgressActions] = useState<ActionItem[]>([]);
  const [thisWeekActions, setThisWeekActions] = useState<ActionItem[]>([]);
  const fetchedRef = useRef(false);

  const t = useCallback((en: string, fr: string) => lang === "fr" ? fr : en, [lang]);
  const isFR = lang === "fr";
  const isFree = tier === "free";
  const isPaid = !isFree;
  const recovered = (actionStats?.total_recovered || totalSavings) ?? 0;
  const recovPct = totalLeak > 0 ? Math.min(100, Math.round((recovered / totalLeak) * 100)) : 0;
  const streak = progress?.streak;
  const fade = (d = 0) => ({ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: `all 0.45s cubic-bezier(0.16,1,0.3,1) ${d}s` });
  const allActions = [...inProgressActions, ...thisWeekActions];
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? t("Good morning", "Bonjour") : h < 18 ? t("Good afternoon", "Bon après-midi") : t("Good evening", "Bonsoir"); })();

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    try { const stored = localStorage.getItem("fruxal_lang"); if (stored === "en" || stored === "fr") { setLang(stored as "en"|"fr"); } else { const s = sessionStorage.getItem("lg_prescan_lang"); if (s === "en" || s === "fr") setLang(s as "en"|"fr"); else if (navigator.language?.startsWith("fr")) setLang("fr"); } } catch { /* non-fatal */ }
    let prescanLoaded = false;
    try {
      const raw = sessionStorage.getItem("lg_prescan_result");
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.analysis?.leaks) {
          setScore(p.analysis.fhScore || 50);
          // On /v2/business we always show at least business-tier UI
          const prescanTier = (p.tier || p.analysis?.tier || "business").toLowerCase();
          setTier(["business","growth","team","enterprise"].includes(prescanTier) ? prescanTier : "business");
          const sev = (s: any) => typeof s === "string" ? s : Number(s) >= 80 ? "critical" : Number(s) >= 60 ? "high" : Number(s) >= 30 ? "medium" : "low";
          const CAT: Record<string, string> = { processing_rate_high: "Paiements", payroll_ratio_high: "Personnel", tax_optimization_gap: "Fiscalité", insurance_overpayment: "Assurance", software_bloat: "Opérations", banking_fees_high: "Bancaire", inventory_cogs_high: "Inventaire", marketing_waste: "Marketing", utilities_overspend: "Utilitaires", revenue_underpricing: "Revenus", accounting_gap: "Comptabilité", tax_credit_missed: "Fiscalité", compliance_gap: "Conformité", fuel_vehicle_high: "Transport", rent_or_chair_high: "Immobilier" };
          const leakList = p.analysis.leaks.map((l: any) => ({ slug: l.type || l.slug || "unknown", title: l.title || "", title_fr: l.title_fr, severity: sev(l.severity), category: CAT[l.type] || l.category || "Général", description: l.explanation || l.description || "", impact_min: l.amount ?? 0, impact_max: l.amount ?? 0, confidence: l.confidence || null, action: l.action, action_fr: l.action_fr, affiliates: l.affiliates || [] }));
          const derivedTotal = leakList.reduce((s: number, l: any) => s + (l.impact_max ?? 0), 0);
          setTotalLeak((p.analysis.totalLeak || derivedTotal) ?? 0);
          setLeaks(leakList);
          prescanLoaded = true;
        }
      }
    } catch { /* non-fatal */ }
    const params = new URLSearchParams(window.location.search);
    const rid = params.get("prescanRunId");
    fetch(rid ? `/api/v2/dashboard?prescanRunId=${rid}` : "/api/v2/dashboard").then(r => r.json()).catch(() => ({})).then(json => {
      if (!json.success || !json.data) return;
      const d = json.data;
      const t2 = (d.tier || "free").toLowerCase();
      // Only redirect if no prescanRunId — with prescanRunId this is a preview, always show business tier
      if (!rid) {
        const qp2 = (d.qualified_plan || "solo").toLowerCase();
        if (!["business","growth","team"].includes(t2) && qp2 === "solo") {
          router.replace("/v2/dashboard");
          return;
        }
      }
      setTier(t2);
      setProfile(d.profile || { province: "QC", industry: "Small Business" });
      setObligationsTotal(d.obligations?.total ?? 0); setOverdue(d.obligations?.overdue ?? 0);
      setPenaltyExposure(d.obligations?.penalty_exposure ?? 0); setDeadlines(d.obligations?.upcoming_deadlines || []);
      setProgramsAvailable(d.programs?.available ?? 0); setLeaksFixed(d.leaks?.fixed ?? 0); setTotalSavings(d.leaks?.total_savings ?? 0);
      if (!prescanLoaded && d.leaks?.top_unfixed?.length > 0) {
        setScore(d.health_score || 50); setTotalLeak(d.total_leak_estimate ?? 0);
        const sev = (s: any) => { if (typeof s === "string" && ["critical","high","medium","low"].includes(s)) return s; const n = Number(s); return isNaN(n) ? "medium" : n >= 80 ? "critical" : n >= 60 ? "high" : n >= 30 ? "medium" : "low"; };
        setLeaks(d.leaks.top_unfixed.map((l: any) => ({ slug: l.slug, title: l.title, title_fr: l.title_fr, severity: sev(l.severity), category: l.category || "Général", description: l.description || "", impact_min: l.impact_min ?? 0, impact_max: (l.impact_max || l.impact_min) ?? 0, confidence: l.confidence, action: l.action, action_fr: l.action_fr, affiliates: l.affiliates || [] })));
      }
    }).catch(() => {});
    const v3Url = rid ? `/api/v3/dashboard?prescanRunId=${rid}` : null;
    if (v3Url) fetch(v3Url).then(r => r.ok ? r.json() : null).then(json => { if (json?.snapshot?.cost_breakdown?.length) setCostBreakdown(json.snapshot.cost_breakdown); }).catch(() => {});
    if (user?.id) fetch(`/api/v2/actions?userId=${user.id}`).then(r => r.json()).then(json => { if (json.stats) setActionStats(json.stats); if (json.actions) { setThisWeekActions(json.actions.this_week || []); setInProgressActions(json.actions.in_progress || []); } }).catch(() => {});
    setLoading(false); requestAnimationFrame(() => setMounted(true));
  }, []); // fetchedRef guard prevents double-fire in StrictMode

  if (loading || authLoading) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" /></div>;
  if (leaks.length === 0 && !totalLeak) return <div className="min-h-screen bg-bg flex items-center justify-center px-6"><div className="text-center max-w-xs"><p className="font-serif text-xl text-ink mb-2">{t("No analysis yet", "Aucune analyse")}</p><p className="text-sm text-ink-muted mb-6">{t("Run your free prescan.", "Lancez votre préscan.")}</p><button onClick={() => router.push("/")} className="px-6 py-2.5 text-sm font-semibold text-white bg-brand rounded-lg">{t("Start →", "Lancer →")}</button></div></div>;

  return (
    <div className="bg-bg min-h-screen">
      <div className="px-6 lg:px-8 py-5 max-w-[1100px]">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-5" style={fade(0)}>
          <div>
            <h1 className="text-[15px] font-semibold text-ink">{greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-ink-faint">{profile.industry} · {profile.province}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: isFree ? "#F0EFEB" : "rgba(27,58,45,0.10)", color: isFree ? "#8E8C85" : "#1B3A2D" }}>{isFree ? t("Free", "Gratuit") : "Business"}</span>
              {isPaid && actionStats && (
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1"><div className={`w-[5px] h-[5px] rounded-full ${actionStats.quickbooks_connected ? "bg-positive" : "bg-border"}`} /><span className="text-[9px] text-ink-faint">QB</span>{!actionStats.quickbooks_connected && <a href="/api/quickbooks/connect" className="text-[9px] text-brand font-semibold">+</a>}</div>
                  <div className="flex items-center gap-1"><div className={`w-[5px] h-[5px] rounded-full ${actionStats.bank_connected ? "bg-positive" : "bg-border"}`} /><span className="text-[9px] text-ink-faint">{t("Bank", "Banque")}</span></div>
                </div>
              )}
              {streak && streak.current > 0 && <div className="flex items-center gap-1"><div className="flex gap-[2px]">{streak.week_map?.map((a: boolean, i: number) => <div className={`w-[4px] h-[4px] rounded-[1px] ${a ? "bg-positive" : "bg-border"}`} />)}</div><span className="text-[9px] text-ink-faint">{streak.current}j</span></div>}
            </div>
          </div>
          <div className="flex items-center bg-border-light rounded-[7px] p-[3px] gap-[2px]">{(["en","fr"] as const).map(l => (<button key={l} onClick={() => { setLang(l); try { localStorage.setItem("fruxal_lang", l); sessionStorage.setItem("lg_prescan_lang", l); } catch { /* non-fatal */ } }} className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-[5px] transition-all ${lang === l ? "bg-white text-ink shadow-sm" : "text-ink-muted bg-transparent"}`}>{l.toUpperCase()}</button>))}</div>
        </div>
        {isPaid && overdue > 0 && (
          <button onClick={() => router.push("/v2/obligations")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-left" style={{ background: "rgba(179,64,64,0.03)", border: "1px solid rgba(179,64,64,0.1)" , opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(8px)", transition: "all 0.5s ease 0.02s" }}>
            <div className="w-[6px] h-[6px] rounded-full bg-negative animate-pulse" /><span className="text-[11px] font-semibold text-negative flex-1">{overdue} {t("overdue", "en retard")} · ${(penaltyExposure ?? 0).toLocaleString()} {t("at risk", "à risque")}</span><span className="text-[10px] font-semibold text-negative">{t("Resolve →", "Résoudre →")}</span>
          </button>
        )}
        {/* BUSINESS UPGRADE BANNER */}
        {isFree && (
          <div className="rounded-xl mb-5 p-5 flex items-center justify-between gap-4 flex-wrap" style={{ background: "linear-gradient(135deg, #1B3A2D, #2A5A44)" , opacity: mounted?1:0, transform: mounted?"translateY(0)":"translateY(8px)", transition: "all 0.5s ease 0.03s" }}>
            <div>
              <p className="text-[13px] font-bold text-white mb-1">{t(`Your business is leaking $${(totalLeak ?? 0).toLocaleString()}/year`, `Votre entreprise perd ${(totalLeak ?? 0).toLocaleString()} $/an`)}</p>
              <p className="text-[11px] text-white/60">{t("Full report · Payroll benchmarks · Fix steps · Advisor call · QuickBooks", "Rapport · Benchmarks · Corrections · Appel conseiller · QuickBooks")}</p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => router.push("/v2/checkout?plan=business")} className="px-5 py-2.5 text-[13px] font-bold text-brand bg-white rounded-lg hover:opacity-90 transition">
                {t("Unlock Business — $150/mo →", "Débloquer Business — 150 $/mois →")}
              </button>
              <button onClick={() => router.push("/v2/checkout?plan=solo")} className="text-[10px] font-semibold text-white/50 hover:text-white/80 transition text-center">
                {t("Or start with Solo — $49/mo", "Ou commencer avec Solo — 49 $/mois")}
              </button>
            </div>
          </div>
        )}
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5" style={fade(0.04)}>
          <button onClick={() => isPaid ? router.push("/v2/diagnostic") : router.push("/v2/checkout?plan=business")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{t("Health Score", "Score santé")}</div>
            <div className="flex items-end gap-1.5"><span className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: score >= 60 ? "#1B3A2D" : "#C4841D" }}>{score}</span><span className="text-xs text-ink-faint mb-1">/100</span></div>
            <div className="mt-3 h-[3px] bg-bg-section rounded-full"><div className="h-full rounded-full transition-all duration-1000" style={{ width: score + "%", background: score >= 70 ? "#2D7A50" : score >= 40 ? "#C4841D" : "#B34040" }} /></div>
          </button>
          <button onClick={() => isPaid ? router.push("/v2/leaks") : router.push("/v2/checkout?plan=business")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{t("Annual Leak", "Fuite annuelle")}</div>
            <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-negative">${(totalLeak ?? 0).toLocaleString()}</div>
            <div className="text-[10px] text-ink-faint mt-1.5">{leaks.length} {t("leaks detected", "fuites détectées")}</div>
          </button>
          <div className="bg-white rounded-xl p-5 border border-border-light" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{t("Recovered", "Récupéré")}</div>
            {isPaid ? <div className="flex items-start justify-between"><div><div className="font-serif text-[36px] font-bold leading-none tracking-tight text-positive">${recovered.toLocaleString()}</div><div className="text-[10px] text-ink-faint mt-1.5">{leaksFixed} {t("fixed", "corrigés")}</div></div><div className="relative mt-1"><Ring pct={recovPct / 100} /><div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-bold text-positive">{recovPct}%</span></div></div></div> : <div className="flex items-center gap-2 mt-2"><LockIcon /><span className="text-[11px] text-ink-faint">{t("Upgrade to track", "Mettre à niveau")}</span></div>}
          </div>
          <button onClick={() => isPaid ? router.push("/v2/obligations") : router.push("/v2/checkout?plan=business")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">OBLIGATIONS</div>
            {isPaid ? <div className="flex items-end gap-2"><span className="font-serif text-[36px] font-bold leading-none tracking-tight">{obligationsTotal}</span>{overdue > 0 && <span className="text-[10px] font-bold text-negative mb-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(179,64,64,0.05)" }}>{overdue} {t("late", "retard")}</span>}</div> : <div className="flex items-center gap-2 mt-2"><LockIcon /><span className="text-[11px] text-ink-faint">{t("Upgrade to see", "Mettre à niveau")}</span></div>}
          </button>
        </div>
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-3" style={fade(0.1)}>
          {/* COL 1: LEAKS */}
          <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Detected Leaks", "Fuites détectées")}</span>
              {isPaid && <button onClick={() => router.push("/v2/leaks")} className="text-[9px] font-semibold text-brand hover:underline">{t("View all →", "Tout voir →")}</button>}
            </div>
            {isFree ? (
              <>
                {leaks.slice(0, 1).map((l, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border-light" style={{ background: "rgba(179,64,64,0.02)" }}>
                    <div key={i} className="flex items-center gap-2 mb-2"><span className="text-[9px] font-bold text-white bg-negative px-1.5 py-0.5 rounded">#1</span><div className="text-[12px] font-semibold text-ink">{isFR ? (l.title_fr || l.title) : l.title}</div></div>
                    <div className="text-[10px] text-ink-faint mb-2">{l.category}</div>
                    {l.action && <div className="p-2 rounded-lg text-[10px] text-ink-secondary mb-2" style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.06)" }}><span className="font-semibold text-brand">{t("Fix: ", "Correction : ")}</span>{isFR ? (l.action_fr || l.action) : l.action}</div>}
                    {l.affiliates && l.affiliates.length > 0 && <div className="flex gap-1.5 flex-wrap">{l.affiliates.slice(0, 3).map((a, ai) => <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-brand border border-brand/20 px-2 py-0.5 rounded-full hover:bg-brand/5 transition">🔗 {a.name}</a>)}</div>}
                    <div key={`aff-${i}`} className="mt-2 text-right font-serif text-[14px] font-bold text-negative">${(l.impact_max ?? l.impact_min ?? 0).toLocaleString()}/{t("yr", "an")}</div>
                  </div>
                ))}
                {leaks.slice(1, 4).map((l, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3 border-b border-border-light" style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
                    <div className="w-[7px] h-[7px] rounded-full shrink-0 bg-border" /><div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-ink truncate">{isFR ? (l.title_fr || l.title) : l.title}</div><div className="text-[10px] text-ink-faint">{l.category}</div></div>
                    <div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max ?? l.impact_min ?? 0).toLocaleString()}</div>
                  </div>
                ))}
                {leaks.length > 1 && <div className="px-4 py-4 text-center" style={{ background: "rgba(250,250,248,0.95)" }}><p className="text-[11px] font-semibold text-ink-muted mb-2">{leaks.length - 1} {t("more leaks hidden", "fuites cachées")}</p><button onClick={() => router.push("/v2/checkout?plan=business")} className="text-[11px] font-bold text-white bg-brand px-4 py-2 rounded-lg hover:opacity-90 transition">{t("Unlock full report — $150/mo →", "Débloquer — 150 $/mois →")}</button></div>}
              </>
            ) : (
              <>
                {leaks.slice(0, 6).map((l, i) => (
                  <div key={i} onClick={() => router.push("/v2/leaks")} className="px-4 py-2.5 flex items-center gap-3 border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer group" style={{ background: l.severity === "critical" ? "rgba(179,64,64,0.02)" : "transparent" }}>
                    <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: SEV_DOT[l.severity] || "#8E8C85" }} />
                    <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-ink truncate group-hover:text-brand">{isFR ? (l.title_fr || l.title) : l.title}</div><span className="text-[9px] text-ink-faint">{l.category}</span></div>
                    <div className="text-right shrink-0"><div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max ?? l.impact_min ?? 0).toLocaleString()}</div><div className="text-[7px] text-ink-faint">/{t("yr", "an")}</div></div>
                  </div>
                ))}
                <div className="px-4 py-2.5 bg-bg flex justify-between items-center"><span className="text-[10px] font-semibold text-ink-muted">Total</span><span className="font-serif text-[14px] font-bold text-negative">${(totalLeak ?? 0).toLocaleString()}/{t("yr", "an")}</span></div>
              </>
            )}
          </div>
          {/* COL 2: RECOVERY + BENCHMARKS */}
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl border border-border-light overflow-hidden flex-1" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-3 border-b border-border-light"><span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Recovery Plan", "Plan de récupération")}</span></div>
              {!isPaid ? (
                <div className="px-4 py-6 text-center"><div className="flex justify-center mb-2"><LockIcon /></div><p className="text-[11px] text-ink-muted mb-3">{t("Unlock fix steps, payroll benchmarks and more.", "Débloquez corrections et benchmarks.")}</p><button onClick={() => router.push("/v2/checkout?plan=business")} className="text-[11px] font-bold text-brand border border-brand/20 px-3 py-1.5 rounded-lg hover:bg-brand/5 transition">{t("Unlock for $150/mo →", "Débloquer pour 150 $/mois →")}</button></div>
              ) : allActions.length === 0 ? (
                <div className="px-4 py-6 text-center text-[11px] text-ink-muted">{t("Actions will appear after your first diagnostic.", "Actions après votre diagnostic.")}</div>
              ) : allActions.slice(0, 4).map((a, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 border-b border-border-light last:border-0">
                  <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0" style={{ border: `2px solid ${a.status === "in_progress" ? "#C4841D" : "#E8E6E1"}` }}>{a.status === "in_progress" ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#C4841D" }} /> : <span className="text-[9px] font-bold text-ink-faint">{i + 1}</span>}</div>
                  <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-ink truncate">{a.leak_title}</div>{a.fix_description && <div className="text-[9px] text-ink-faint truncate mt-0.5">{a.fix_description}</div>}</div>
                  <div className="text-right shrink-0"><div className="font-serif text-[13px] font-bold text-positive">+${a.estimated_value.toLocaleString()}</div><span className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ color: a.status === "in_progress" ? "#C4841D" : "#8E8C85", background: a.status === "in_progress" ? "rgba(196,132,29,0.06)" : "#F0EFEB" }}>{a.status === "in_progress" ? t("Active", "En cours") : t("To do", "À faire")}</span></div>
                </div>
              ))}
            </div>
            {/* Cost Benchmarks (paid only) */}
            {isPaid && costBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
                  <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Costs vs Industry", "Coûts vs industrie")}</span>
                  <div className="flex items-center gap-2"><div className="flex items-center gap-1"><div className="w-[6px] h-[6px] rounded-[1px]" style={{ background: "#2D7A50" }} /><span className="text-[8px] text-ink-faint">{t("You", "Vous")}</span></div><div className="flex items-center gap-1"><div className="w-[6px] h-[6px] rounded-[1px]" style={{ background: "#E0DED9" }} /><span className="text-[8px] text-ink-faint">{t("Ref.", "Réf.")}</span></div></div>
                </div>
                <div className="px-4 py-2">
                  {costBreakdown.map((c, i) => {
                    const over = c.pct_of_revenue > c.benchmark_pct * 1.05;
                    return <div key={i} className="flex items-center gap-3 py-[5px]"><span className="text-[11px] font-medium text-ink-secondary w-[72px] shrink-0 truncate">{c.category}</span><MiniBar yours={c.pct_of_revenue} bench={c.benchmark_pct} /><span className={`text-[11px] font-bold w-9 text-right tabular-nums ${over ? "text-negative" : "text-positive"}`}>{c.pct_of_revenue.toFixed(1)}%</span><span className="text-[9px] text-ink-faint w-8 text-right tabular-nums">{c.benchmark_pct.toFixed(1)}%</span></div>;
                  })}
                </div>
              </div>
            )}
          </div>
          {/* COL 3: SIDEBAR */}
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-2.5 border-b border-border-light flex justify-between items-center"><span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Deadlines", "Échéances")}</span>{isPaid && <button onClick={() => router.push("/v2/obligations")} className="text-[9px] font-semibold text-brand hover:underline">{t("All →", "Tout →")}</button>}</div>
              {!isPaid ? <div className="px-4 py-4 text-center"><div className="flex justify-center mb-1"><LockIcon /></div><p className="text-[10px] text-ink-faint">{t("Upgrade to see deadlines", "Mettre à niveau")}</p></div>
              : deadlines.length === 0 ? <div className="px-4 py-4 text-[11px] text-ink-faint text-center">{t("None upcoming", "Aucune échéance")}</div>
              : deadlines.slice(0, 4).map((dl, i) => (
                <div key={i} onClick={() => router.push("/v2/obligations")} className="px-4 py-2.5 flex items-center justify-between border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer">
                  <div className="flex-1 min-w-0 mr-2"><div className="text-[11px] font-medium text-ink truncate">{dl.title}</div>{(dl.penalty_max ?? 0) > 0 && <div className="text-[8px] text-ink-faint">${dl.penalty_max!.toLocaleString()}</div>}</div>
                  <div className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-md shrink-0" style={{ background: dl.days_until <= 3 ? "#B34040" : dl.days_until <= 7 ? "rgba(179,64,64,0.06)" : "#F0EFEB", color: dl.days_until <= 3 ? "white" : dl.days_until <= 7 ? "#B34040" : "#8E8C85" }}>{dl.days_until}{t("d", "j")}</div>
                </div>
              ))}
            </div>
            <button onClick={() => isPaid ? router.push("/v2/programs") : router.push("/v2/checkout?plan=business")} className="w-full bg-white rounded-xl border border-border-light p-4 text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-2">{t("Government Programs", "Programmes")}</div>
              {isPaid ? <div className="flex items-end gap-2"><span className="font-serif text-[28px] font-bold leading-none tracking-tight text-positive">{programsAvailable}</span><span className="text-[10px] text-ink-faint mb-0.5">{t("available", "disponibles")}</span></div> : <div className="flex items-center gap-2"><LockIcon /><span className="text-[11px] text-ink-faint">{t("Unlock to see grants", "Débloquer")}</span></div>}
            </button>
            {isPaid && (
              <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-3">{t("Recovery", "Récupération")}</div>
                <div className="flex items-center gap-3 mb-2"><div className="flex-1 h-2 bg-bg-section rounded-full overflow-hidden"><div className="h-full rounded-full bg-positive transition-all duration-700" style={{ width: Math.max(recovPct, 1) + "%" }} /></div><span className="text-[12px] font-bold text-ink tabular-nums">{recovPct}%</span></div>
                <div className="flex justify-between text-[9px] text-ink-faint"><span>${(recovered ?? 0).toLocaleString()} {t("recovered", "récupéré")}</span><span>${(totalLeak ?? 0).toLocaleString()} total</span></div>
              </div>
            )}
            {/* Advisor call (paid Business only) */}
            {isPaid && (
              <a href="https://calendly.com/fruxal/advisor" target="_blank" rel="noopener noreferrer" className="w-full bg-white rounded-xl border border-brand/15 p-4 text-left hover:shadow-[0_4px_16px_rgba(27,58,45,0.08)] transition-all block" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg></div>
                  <div><div className="text-[12px] font-semibold text-ink">{t("Book advisor call", "Réserver un appel")}</div><div className="text-[9px] text-ink-faint">{t("Monthly 30-min session included", "Session 30 min mensuelle incluse")}</div></div>
                </div>
              </a>
            )}
            <button onClick={() => isPaid ? router.push("/v2/chat") : router.push("/v2/checkout?plan=business")} className="w-full bg-white rounded-xl border border-brand/15 p-4 text-left hover:shadow-[0_4px_16px_rgba(27,58,45,0.08)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg></div>
                <div><div className="text-[12px] font-semibold text-ink">{t("Ask Fruxal AI", "Demander à Fruxal IA")}</div><div className="text-[9px] text-ink-faint">{!isPaid ? t("Upgrade to unlock", "Mettre à niveau") : t("Get answers about your finances", "Posez vos questions")}</div></div>
                {!isPaid && <div className="ml-auto"><LockIcon /></div>}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}