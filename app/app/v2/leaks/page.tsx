// =============================================================================
// src/app/v2/leaks/page.tsx — LEAKS LIST
// =============================================================================
// Full list of detected leaks with filters, actions, savings tracking.
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";
import { useCelebration } from "@/hooks/useCelebration";
import CelebrationOverlay from "@/components/celebrations/CelebrationOverlay";

const SEVERITY_COLORS: Record<string, { text: string; bg: string }> = {
  critical: { text: "text-negative", bg: "bg-negative/8" },
  high: { text: "text-caution", bg: "bg-orange-500/8" },
  medium: { text: "text-amber-400", bg: "bg-amber-500/8" },
  low: { text: "text-brand-accent", bg: "bg-brand-accent/6" },
};

const SOLUTION_LABELS: Record<string, { icon: string; label: string; fr: string }> = {
  free: { icon: "—", label: "Free / DIY", fr: "Gratuit / Soi-même" },
  government: { icon: "—", label: "Gov Program", fr: "Programme gouvernemental" },
  professional: { icon: "—", label: "Professional", fr: "Professionnel" },
  tool: { icon: "—", label: "Tool / Software", fr: "Outil / Logiciel" },
};

const STATUS_TABS = [
  { value: "all",         label: "All",         fr: "Tous" },
  { value: "detected",    label: "Unfixed",      fr: "Non corrigés" },
  { value: "in_progress", label: "In Progress",  fr: "En cours" },
  { value: "fixed",       label: "Fixed",        fr: "Corrigés" },
];

interface Leak {
  slug: string; title: string; severity: string; category: string;
  description: string; impact_min: number; impact_max: number;
  solution_type: string; solution_steps: string[];
  status: string; savings_amount: number; fixed_at: string | null;
}

export default function LeaksPage() {
  const { lang, setLang, t, isFR } = useLang();
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"impact"|"effort"|"severity">("impact");
  const [effortFilter, setEffortFilter] = useState<"all"|"easy"|"medium"|"hard">("all");
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { celebrate, celebrating, celebrationProps, dismissCelebration } = useCelebration();
  const [isPaid, setIsPaid] = useState(true); // optimistic — avoids flash of gate
  const [gated, setGated] = useState(false);
  const [lockedCount, setLockedCount] = useState(0);
  const [lockedValue, setLockedValue] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v2/leaks/list");
        const json = await res.json();
        if (json.success) {
          setLeaks(json.data);
          if (json.meta) {
            setIsPaid(json.meta.isPaid);
            setGated(json.meta.gated);
            setLockedCount(json.meta.lockedCount ?? 0);
            setLockedValue(json.meta.lockedValue ?? 0);
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleAction = async (slug: string, action: string) => {
    const leak = leaks.find(l => l.slug === slug);
    const res = await fetch(`/api/v2/leaks/${slug}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, savings: leak?.impact_min ?? 0 }),
    });
    const json = await res.json();

    if (json.success) {
      setLeaks(prev => prev.map(l =>
        l.slug === slug ? {
          ...l,
          status: action === "fix" ? "fixed" : action === "progress" ? "in_progress" : action === "dismiss" ? "dismissed" : "detected",
          savings_amount: action === "fix" ? json.savings : l.savings_amount,
        } : l
      ));
      if (action === "fix") {
        await celebrate("leak_fixed", { leak_slug: slug, title: json.title, savings: json.savings });
      }
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/v2/leaks/report");
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-fuites-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
    finally { setDownloading(false); }
  };

  const filtered = leaks
    .filter(l => filter === "all" || l.status === filter)
    .filter(l => effortFilter === "all" || (l as any).effort === effortFilter)
    .sort((a, b) => {
      if (sortBy === "impact") return (b.impact_max ?? 0) - (a.impact_max ?? 0);
      if (sortBy === "severity") {
        const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
      }
      if (sortBy === "effort") {
        const order: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
        return (order[(a as any).effort] ?? 1) - (order[(b as any).effort] ?? 1);
      }
      return 0;
    });
  const totalSavings = leaks.filter(l => l.status === "fixed").reduce((s, l) => s + l.savings_amount, 0);
  const potentialSavings = leaks.filter(l => l.status === "detected").reduce((s, l) => s + l.impact_max, 0);

  return (
    <div className="min-h-screen bg-bg px-4 pb-24">
      {celebrating && celebrationProps && (
        <CelebrationOverlay {...celebrationProps} onDone={dismissCelebration} />
      )}

      <div className="max-w-2xl mx-auto">
        <header className="pt-5 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-ink-secondary text-lg font-bold">Money Leaks</h1>
            <p className="text-ink-faint text-xs mt-0.5">{leaks.length} detected for your business</p>
          </div>
          <button onClick={handleDownload} disabled={downloading}
            className="px-3 py-1.5 bg-brand-soft border border-brand/15 rounded-lg text-brand/60 text-[10px] font-bold hover:bg-brand-soft transition disabled:opacity-30">
            {downloading ? "..." : "PDF"}
          </button>
        </header>

        {/* Savings summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-brand-soft border border-brand/10 rounded-xl px-3 py-2.5 text-center">
            <p className="text-brand text-lg font-black">${(totalSavings ?? 0).toLocaleString()}</p>
            <p className="text-brand/20 text-[10px] uppercase tracking-wider">Saved / Year</p>
          </div>
          <div className="bg-red-500/[0.03] border border-negative/10 rounded-xl px-3 py-2.5 text-center">
            <p className="text-negative/60 text-lg font-black">${(potentialSavings ?? 0).toLocaleString()}</p>
            <p className="text-negative/20 text-[10px] uppercase tracking-wider">Still Leaking</p>
          </div>
        </div>

        {/* Filter tabs — only shown for paid users (free users only see detected) */}
        {isPaid && (
        <div className="flex gap-1.5 mb-4">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                filter === tab.value
                  ? "bg-brand-soft text-brand/80"
                  : "bg-bg-section text-ink-faint hover:text-ink-faint"
              }`}>{isFR ? tab.fr : tab.label}</button>
          ))}
        </div>
        )}

        {/* Sort + effort filter */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* Effort filter */}
          <div className="flex gap-1 flex-wrap">
            {([
              { v: "all",    en: "All",    fr: "Tous"    },
              { v: "easy",   en: "Easy",   fr: "Facile"  },
              { v: "medium", en: "Medium", fr: "Moyen"   },
              { v: "hard",   en: "Hard",   fr: "Difficile"},
            ] as const).map(e => (
              <button key={e.v} onClick={() => setEffortFilter(e.v)}
                className={"px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all " + (effortFilter === e.v ? (e.v === "easy" ? "bg-emerald-500/10 text-emerald-600" : e.v === "hard" ? "bg-orange-500/10 text-orange-600" : e.v === "medium" ? "bg-amber-500/10 text-amber-600" : "bg-brand-soft text-brand/80") : "bg-bg-section text-ink-faint hover:text-ink-muted")}>
                {isFR ? e.fr : e.en}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-border-light mx-1 hidden sm:block" />

          {/* Sort */}
          <div className="flex gap-1 flex-wrap">
            <span className="text-[9px] text-ink-faint self-center mr-1">{isFR ? "Trier:" : "Sort:"}</span>
            {([
              { v: "impact",   en: "Highest impact", fr: "Impact"    },
              { v: "effort",   en: "Easiest first",  fr: "Plus facile"},
              { v: "severity", en: "Most urgent",    fr: "Urgence"   },
            ] as const).map(s => (
              <button key={s.v} onClick={() => setSortBy(s.v)}
                className={"px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all " + (sortBy === s.v ? "bg-brand-soft text-brand/80" : "bg-bg-section text-ink-faint hover:text-ink-muted")}>
                {isFR ? s.fr : s.en}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.015] rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">filter === "fixed" ? "—" : "—"</p>
            <p className="text-ink-faint text-sm">{filter === "fixed" ? "No fixed leaks yet. Start plugging!" : "No leaks found."}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((leak, i) => {
              const sc = SEVERITY_COLORS[leak.severity] || SEVERITY_COLORS.medium;
              const sol = SOLUTION_LABELS[leak.solution_type] || SOLUTION_LABELS.professional;
              const isFixed = leak.status === "fixed";
              const isExpanded = expanded === leak.slug;

              return (
                <div key={leak.slug}
                  className={`bg-white/[0.015] border border-border-light rounded-xl overflow-hidden transition-all ${
                    isFixed ? "opacity-50" : ""
                  }`}
                  style={{ animation: `fadeUp 0.3s ease-out ${i * 0.03}s both` }}>

                  {/* Main row */}
                  <button onClick={() => setExpanded(isExpanded ? null : leak.slug)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3">
                    <div key={i} className="flex-1 min-w-0">
                      <div key={i} className="flex items-center gap-1.5 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${sc.bg} ${sc.text}`}>{leak.severity}</span>
                        <span className="text-ink-faint text-[10px]">{sol.label}</span>
                      </div>
                      <p className={`text-xs font-medium ${isFixed ? "text-ink-faint line-through" : "text-ink-muted"}`}>{leak.title}</p>
                    </div>
                    <div key={i} className="text-right">
                      {isFixed ? (
                        <p className="text-brand/40 text-xs font-bold">+${(leak.savings_amount ?? 0).toLocaleString()}<span className="text-[9px]">/yr</span></p>
                      ) : (
                        <p className="text-negative/50 text-xs font-bold">${(leak.impact_max ?? 0).toLocaleString()}<span className="text-[9px]">/yr</span></p>
                      )}
                      <span className="text-ink-faint text-[8px]">{isExpanded ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg> : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>}</span>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div key={i} className="px-4 pb-3 border-t border-white/[0.03] pt-3" style={{ animation: "fadeUp 0.2s ease-out" }}>
                      {leak.description && (
                        <p className="text-ink-faint text-[11px] mb-3">{leak.description}</p>
                      )}

                      <div key={i} className="flex items-center gap-2 mb-3">
                        <span className="text-ink-faint text-[9px]">Impact range:</span>
                        <span className="text-negative/40 text-[10px] font-bold">
                          ${(leak.impact_min ?? 0).toLocaleString()} — ${(leak.impact_max ?? 0).toLocaleString()}/yr
                        </span>
                      </div>

                      {leak.solution_steps && leak.solution_steps.length > 0 && (
                        <div key={i} className="mb-3">
                          <p className="text-ink-faint text-[9px] font-bold uppercase tracking-wider mb-1.5">How to Fix</p>
                          <div key={i} className="space-y-1">
                            {leak.solution_steps.map((step: string, si: number) => (
                              <div key={si} className="flex gap-2">
                                <span className="text-brand/30 text-[9px] font-bold mt-0.5">{si + 1}.</span>
                                <span className="text-ink-faint text-[10px]">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {!isFixed && leak.status !== "dismissed" && (
                        <div key={i} className="flex gap-2">
                          <button onClick={() => handleAction(leak.slug, "fix")}
                            className="flex-1 py-2 rounded-lg bg-brand-soft text-brand/60 text-[10px] font-bold hover:bg-brand-soft transition-colors">
                            ✓ I Fixed This
                          </button>
                          {leak.status !== "in_progress" && (
                            <button onClick={() => handleAction(leak.slug, "progress")}
                              className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400/40 text-[10px] font-bold hover:bg-amber-500/15 transition-colors">
                              Working On It
                            </button>
                          )}
                          <button onClick={() => handleAction(leak.slug, "dismiss")}
                            className="px-3 py-2 rounded-lg bg-bg-section text-ink-faint text-[10px] hover:text-ink-faint transition-colors">
                            ✕
                          </button>
                        </div>
                      )}
                      {isFixed && (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-brand/30 text-[10px]">✓ Fixed · Saving ${(leak.savings_amount ?? 0).toLocaleString()}/yr</span>
                          <button onClick={() => handleAction(leak.slug, "reset")}
                            className="text-ink-faint text-[9px] hover:text-ink-faint transition-colors">Undo</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Gate card — shown when free/solo user has locked leaks */}
        {false && lockedCount > 0 && ( // disabled — leaks are free
          <div className="mt-4 rounded-xl overflow-hidden border"
            style={{ borderColor: "rgba(27,58,45,0.15)" }}>
            {/* Blurred ghost rows */}
            {[...Array(Math.min(lockedCount, 2))].map((_, i) => (
              <div key={i} className="px-4 py-3 border-b border-border-light select-none"
                style={{ filter: "blur(4px)", opacity: 0.3, background: "white" }}>
                <div key={i} className="flex items-center gap-3">
                  <div key={i} className="w-12 h-3 bg-gray-200 rounded" />
                  <div key={i} className="flex-1 h-3 bg-gray-200 rounded" />
                  <div key={i} className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
            {/* Lock overlay */}
            <div className="px-5 py-6 text-center"
              style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <p className="text-[13px] font-bold text-white mb-1">
                {lockedCount} more {lockedCount === 1 ? "leak" : "leaks"} locked
              </p>
              {lockedValue > 0 && (
                <p className="text-[11px] mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Additional <span className="font-bold text-white">${(lockedValue ?? 0).toLocaleString()}</span> in recoverable savings
                </p>
              )}
              <a href="/register"
                className="inline-block px-5 py-2.5 text-[12px] font-bold text-brand bg-white rounded-lg hover:opacity-90 transition">
                {isFR ? "Créer mon compte — Gratuit →" : "Create account — Free →"}
              </a>
              <p className="text-[9px] mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>{isFR ? "Toujours gratuit · Aucune carte" : "Always free · No credit card"}</p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}
