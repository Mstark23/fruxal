// app/v2/obligations/page.tsx — Enterprise-aligned
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Obligation {
  slug: string; title: string; category: string; risk_level: string;
  frequency?: string; deadline?: string; deadline_description?: string;
  days_until?: number; days_overdue?: number; penalty_max?: number;
  agency?: string; status?: string; next_deadline?: string;
}
interface CalendarData {
  overdue: Obligation[]; this_week: Obligation[]; this_month: Obligation[];
  next_3_months: Obligation[]; later: Obligation[]; continuous: Obligation[];
  summary: {
    total_tracked: number; overdue: number; due_this_week: number;
    due_this_month: number; completed_this_year: number; total_penalty_exposure: number;
  };
}
interface CompleteModal { slug: string; title: string; penalty_max?: number; }

const CATS = [
  { key:"all", en:"All", fr:"Tout" }, { key:"tax", en:"Tax", fr:"Impôts" },
  { key:"payroll", en:"Payroll", fr:"Paie" }, { key:"registration", en:"Registration", fr:"Immatriculation" },
  { key:"compliance", en:"Compliance", fr:"Conformité" }, { key:"permit", en:"Permits", fr:"Permis" },
  { key:"insurance", en:"Insurance", fr:"Assurance" }, { key:"contract", en:"Contracts", fr:"Contrats" },
  { key:"privacy", en:"Privacy", fr:"Vie privée" }, { key:"safety", en:"Safety", fr:"Sécurité" },
];

const fade = (i = 0) => ({ animationDelay: `${i * 0.04}s`, animationFillMode: "both" as const });

export default function ObligationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [calendar, setCalendar]     = useState<CalendarData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [businessId, setBizId]      = useState<string | null>(null);
  const [lang, setLang]             = useState<"en"|"fr">("fr");
  const [catFilter, setCatFilter]   = useState("all");
  const [search, setSearch]         = useState("");
  const [viewMode, setViewMode]     = useState<"timeline"|"list">("timeline");
  const [modal, setModal]           = useState<CompleteModal | null>(null);
  const [cost, setCost]             = useState("");
  const [notes, setNotes]           = useState("");
  const [saving, setSaving]         = useState(false);
  const [isEnt, setIsEnt]           = useState(false);

  const t = (en: string, fr: string) => lang === "fr" ? fr : en;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fruxal_lang");
      if (stored === "en" || stored === "fr") setLang(stored);
      else if (navigator.language?.startsWith("fr")) setLang("fr");
      setIsEnt(localStorage.getItem("fruxal_tier") === "enterprise");
    } catch { /* non-fatal */ }
    fetch("/api/me").then(r => r.json()).then(d => { if (d.business?.id) setBizId(d.business.id); }).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/v2/obligations/calendar?businessId=${businessId}&language=${lang}`);
      const j = await r.json();
      if (j.success) setCalendar(j.data);
    } catch { /* non-fatal */ } finally { setLoading(false); }
  }, [businessId, lang]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markDone = async () => {
    if (!modal || !businessId) return;
    setSaving(true);
    try {
      await fetch("/api/v2/obligations/complete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, obligationSlug: modal.slug,
          actualCost: cost ? parseFloat(cost) : null, notes: notes || null }),
      });
      setModal(null); setCost(""); setNotes(""); fetchData();
    } catch { /* non-fatal */ } finally { setSaving(false); }
  };

  const snooze = async (slug: string, days: number) => {
    if (!businessId) return;
    await fetch("/api/v2/obligations/snooze", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, obligationSlug: slug, days }),
    });
    fetchData();
  };

  const filterOb = (o: Obligation) => {
    if (catFilter !== "all" && o.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.title.toLowerCase().includes(q) || o.category.toLowerCase().includes(q) || (o.agency||"").toLowerCase().includes(q);
    }
    return true;
  };

  const allFlat = calendar ? [
    ...calendar.overdue.map(o => ({...o,_s:"overdue"})),
    ...calendar.this_week.map(o => ({...o,_s:"week"})),
    ...calendar.this_month.map(o => ({...o,_s:"month"})),
    ...calendar.next_3_months.map(o => ({...o,_s:"q"})),
    ...calendar.later.map(o => ({...o,_s:"later"})),
    ...calendar.continuous.map(o => ({...o,_s:"cont"})),
  ].filter(filterOb) : [];

  const sum = calendar?.summary;
  const penExposure = sum?.total_penalty_exposure ?? 0;

  const RISK_COLOR: Record<string, {dot:string; bg:string; text:string}> = {
    critical: { dot:"#B34040", bg:"rgba(179,64,64,0.07)", text:"#B34040" },
    high:     { dot:"#C4841D", bg:"rgba(196,132,29,0.07)", text:"#C4841D" },
    medium:   { dot:"#C4841D", bg:"rgba(196,132,29,0.05)", text:"#C4841D" },
    low:      { dot:"#2D7A50", bg:"rgba(45,122,80,0.06)", text:"#2D7A50" },
  };

  return (
    <div className="bg-bg min-h-screen font-sans">
      <div className="px-6 lg:px-8 py-5 max-w-[1100px]">

        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[15px] font-semibold text-ink">{t("Obligations", "Obligations")}</h1>
              {(sum?.overdue ?? 0) > 0 && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                  style={{ background:"rgba(179,64,64,0.08)", color:"#B34040", border:"1px solid rgba(179,64,64,0.15)" }}>
                  {sum!.overdue} {t("overdue","en retard")}
                </span>
              )}
            </div>
            <p className="text-[10px] text-ink-faint">
              {sum ? `${sum.total_tracked} ${t("tracked","suivies")} · ${sum.completed_this_year} ${t("completed this year","complétées cette année")}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEnt && (
              <button onClick={() => router.push("/v2/dashboard/enterprise")}
                className="text-[10px] font-semibold text-brand border border-brand/20 rounded px-2.5 py-1.5 hover:bg-brand/5 transition">
                ← {t("Dashboard","Tableau de bord")}
              </button>
            )}
            <div className="flex bg-bg-section border border-border-light rounded-[7px] p-[3px] gap-[2px]">
              {(["en","fr"] as const).map(l => (
                <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("fruxal_lang",l); } catch { /* non-fatal */ } }}
                  className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-[5px] transition-all ${
                    lang===l ? "bg-white text-ink shadow-sm" : "text-ink-muted"}`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={fetchData}
              className="w-7 h-7 flex items-center justify-center rounded border border-border-light bg-white text-ink-faint hover:text-ink transition">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── KPI strip ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { val: sum?.total_tracked??0,   label:t("Total Tracked","Total suivies"),   color:"#1A1A18" },
            { val: sum?.overdue ?? 0,          label:t("Overdue","En retard"),              color:"#B34040", pulse:!!(sum?.overdue) },
            { val: (sum?.due_this_week ?? 0)+(sum?.due_this_month ?? 0), label:t("Due This Month","Ce mois-ci"), color:"#C4841D" },
            { val: penExposure, label:t("Penalty Exposure","Exposition pénalités"), color:"#B34040", money:true },
          ].map((k,i) => (
            <div key={i} className={`bg-white rounded-xl px-4 py-3.5 border border-border-light ${k.pulse?"animate-pulse":""}`}
              style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="font-serif text-[28px] font-bold leading-none tracking-tight" style={{ color:k.color }}>
                {k.money ? `$${k.val.toLocaleString()}` : k.val}
              </div>
              <div className="text-[9px] text-ink-faint uppercase tracking-wider mt-1.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Penalty exposure bar (enterprise) */}
        {isEnt && penExposure > 0 && (
          <div className="mb-5 rounded-xl px-5 py-3.5 flex items-center gap-4"
            style={{ background:"rgba(179,64,64,0.04)", border:"1px solid rgba(179,64,64,0.12)" }}>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color:"#B34040" }}>
                  {t("Penalty exposure — overdue obligations","Exposition aux pénalités — obligations en retard")}
                </span>
                <span className="font-serif text-[18px] font-bold" style={{ color:"#B34040" }}>
                  ${(penExposure ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="h-1 bg-bg-section rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width:Math.min(100,((sum?.overdue ?? 0)/Math.max(sum?.total_tracked||1,1))*100) + "%",
                           background:"linear-gradient(90deg,#B34040,#C4841D)" }} />
              </div>
            </div>
            <button onClick={() => router.push("/v2/diagnostic/intake")}
              className="shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded border transition"
              style={{ color:"#B34040", borderColor:"rgba(179,64,64,0.25)", background:"rgba(179,64,64,0.04)" }}>
              {t("Run diagnostic →","Lancer diagnostic →")}
            </button>
          </div>
        )}

        {/* ── Filters ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={t("Search obligations…","Chercher une obligation…")}
              className="w-full pl-9 pr-4 py-2 bg-white border border-border-light rounded-lg text-[12px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand transition"
              style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }} />
          </div>
          <div className="flex bg-white border border-border-light rounded-lg overflow-hidden" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
            {(["timeline","list"] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-4 py-2 text-[11px] font-medium transition ${viewMode===m?"bg-brand-soft text-brand":"text-ink-muted hover:text-ink"}`}>
                {m==="timeline" ? t("Timeline","Chronologie") : t("List","Liste")}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 scrollbar-none">
          {CATS.map(c => {
            const cnt = c.key==="all" ? allFlat.length : allFlat.filter(o=>o.category===c.key).length;
            if (c.key!=="all" && cnt===0) return null;
            return (
              <button key={c.key} onClick={()=>setCatFilter(c.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all border ${
                  catFilter===c.key ? "text-brand border-brand/20 bg-brand/5" : "text-ink-muted border-border-light bg-white hover:border-brand/15"
                }`}
                style={{ boxShadow:"0 1px 2px rgba(0,0,0,0.02)" }}>
                {lang==="fr"?c.fr:c.en}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${catFilter===c.key?"bg-brand/10 text-brand":"bg-bg-section text-ink-faint"}`}>{cnt}</span>
              </button>
            );
          })}
        </div>

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
          </div>
        )}

        {/* ── Timeline view ─────────────────────────────────────────────── */}
        {!loading && viewMode==="timeline" && calendar && (
          <div className="space-y-5">
            {[
              { title:t("Overdue","En retard"), items:calendar.overdue.filter(filterOb), accent:"#B34040", open:true },
              { title:t("This Week","Cette semaine"), items:calendar.this_week.filter(filterOb), accent:"#C4841D", open:true },
              { title:t("This Month","Ce mois-ci"), items:calendar.this_month.filter(filterOb), accent:"#C4841D", open:true },
              { title:t("Next 3 Months","3 prochains mois"), items:calendar.next_3_months.filter(filterOb), accent:"#1B3A2D" },
              { title:t("Later","Plus tard"), items:calendar.later.filter(filterOb), accent:"#8E8C85" },
              { title:t("Continuous Compliance","Conformité continue"), items:calendar.continuous.filter(filterOb), accent:"#2D7A50", cont:true },
            ].map((sec) => {
              if (!sec.items.length) return null;
              return <TimelineSection key={sec.title} title={sec.title} items={sec.items} accentColor={sec.accent}
                lang={lang as string} onComplete={(s,ti,p)=>setModal({slug:s,title:ti,penalty_max:p})}
                onSnooze={(slug, days) => { snooze(slug, days); }} defaultOpen={sec.open} isCont={sec.cont} />;
            })}
          </div>
        )}

        {/* ── List view ─────────────────────────────────────────────────── */}
        {!loading && viewMode==="list" && (
          <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-border-light text-[9px] text-ink-faint uppercase tracking-wider font-semibold">
              <div className="col-span-1">{t("Risk","Risque")}</div>
              <div className="col-span-5">{t("Obligation","Obligation")}</div>
              <div className="col-span-2">{t("Deadline","Échéance")}</div>
              <div className="col-span-2">{t("Penalty","Pénalité")}</div>
              <div className="col-span-2 text-right">{t("Actions","Actions")}</div>
            </div>
            {allFlat.length===0 ? (
              <div className="px-5 py-12 text-center text-[11px] text-ink-faint">{t("No obligations found","Aucune obligation trouvée")}</div>
            ) : allFlat.map((ob,i) => {
              const rc = RISK_COLOR[ob.risk_level] || RISK_COLOR.low;
              return (
                <div key={ob.slug+i}
                  className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-border-light last:border-0 hover:bg-bg-warm transition-colors animate-fadeUp"
                  style={fade(i)}>
                  <div className="col-span-1 flex items-center">
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background:rc.bg, color:rc.text }}>{ob.risk_level}</span>
                  </div>
                  <div className="col-span-5 flex flex-col justify-center">
                    <p className="text-[12px] font-medium text-ink truncate">{ob.title}</p>
                    {ob.agency && <p className="text-[9px] text-ink-faint truncate">{ob.agency}</p>}
                  </div>
                  <div className="col-span-2 flex items-center">
                    {(ob.deadline||ob.next_deadline) ? (
                      <div>
                        <p className={`text-[11px] font-medium ${(ob._s as string)==="overdue"?"text-negative":"text-ink-secondary"}`}>
                          {formatDate(ob.deadline||ob.next_deadline||"",lang)}</p>
                        {ob.days_until!==undefined && ob.days_until>=0 && (
                          <p className={`text-[9px] ${ob.days_until<=7?"text-caution":"text-ink-faint"}`}>
                            {ob.days_until===0?t("Today!","Aujourd'hui!"):`${ob.days_until}d`}
                          </p>
                        )}
                      </div>
                    ) : <span className="text-[10px] text-ink-faint">—</span>}
                  </div>
                  <div className="col-span-2 flex items-center">
                    {(ob.penalty_max??0)>0
                      ? <span className="text-[11px] font-semibold" style={{ color:"#B34040" }}>${(ob.penalty_max??0).toLocaleString()}</span>
                      : <span className="text-[10px] text-ink-faint">—</span>}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <button onClick={()=>setModal({slug:ob.slug,title:ob.title,penalty_max:ob.penalty_max})}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded transition"
                      style={{ background:"rgba(27,58,45,0.06)", color:"#1B3A2D", border:"1px solid rgba(27,58,45,0.12)" }}>
                      ✓ {t("Done","Fait")}
                    </button>
                    <button onClick={()=>snooze(ob.slug,7)}
                      className="text-[9px] px-2 py-1 rounded border border-border-light bg-white text-ink-faint hover:bg-bg-warm transition" title={t("Snooze 7d","Reporter 7j")}>
                      7d
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sum?.completed_this_year && sum.completed_this_year > 0 ? (
          <div className="mt-6 text-center text-[10px] text-ink-faint">
            ✓ {sum.completed_this_year} {t("completed this year","complétées cette année")}
          </div>
        ) : null}
      </div>

      {/* ── Complete modal ────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:"rgba(26,26,24,0.35)", backdropFilter:"blur(6px)" }}
          onClick={()=>setModal(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-border-light"
            style={{ boxShadow:"0 24px 48px rgba(0,0,0,0.12)" }}
            onClick={e=>e.stopPropagation()}>
            <h3 className="text-[14px] font-bold text-ink mb-0.5">{t("Mark as Complete","Marquer comme complété")}</h3>
            <p className="text-[11px] text-ink-faint mb-5 line-clamp-2">{modal.title}</p>
            <div className="mb-4">
              <label className="block text-[10px] text-ink-faint mb-1.5">{t("Actual cost (optional)","Coût réel (optionnel)")}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-[12px]">$</span>
                <input type="number" value={cost} onChange={e=>setCost(e.target.value)} placeholder="0.00"
                  className="w-full pl-7 pr-4 py-2.5 bg-bg border border-border-light rounded-lg text-[12px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand transition" />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-[10px] text-ink-faint mb-1.5">{t("Notes (optional)","Notes (optionnel)")}</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
                placeholder={t("E.g., Filed with TurboTax, ref #12345","Ex: Produit avec TurboImpôt, réf #12345")}
                className="w-full px-3 py-2.5 bg-bg border border-border-light rounded-lg text-[12px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand transition resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setModal(null)}
                className="flex-1 py-2.5 rounded-lg text-[12px] text-ink-muted bg-bg-section hover:bg-bg-warm transition">
                {t("Cancel","Annuler")}
              </button>
              <button onClick={markDone} disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-white transition disabled:opacity-50"
                style={{ background:"#1B3A2D" }}>
                {saving ? "…" : `✓ ${t("Confirm","Confirmer")}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:translateY(0) } }
        .animate-fadeUp { animation: fadeUp 0.22s ease-out both; }
        .scrollbar-none::-webkit-scrollbar { display:none; }
        .scrollbar-none { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}

function TimelineSection({ title, items, accentColor, lang, onComplete, onSnooze, defaultOpen, isCont }: {
  title:string; items:any[]; accentColor:string; lang:string;
  onComplete:(slug:string,title:string,penalty?:number)=>void;
  onSnooze:(slug:string,days:number)=>void;
  defaultOpen?:boolean; isCont?:boolean;
}) {
  const [open, setOpen] = useState(defaultOpen??false);
  const t = (en:string,fr:string) => lang==="fr"?fr:en;
  const RISK_DOT: Record<string,string> = { critical:"#B34040", high:"#C4841D", medium:"#C4841D", low:"#2D7A50" };

  return (
    <div>
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center gap-3 mb-2 group">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:accentColor }} />
        <span className="text-[13px] font-semibold text-ink">{title}</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bg-section text-ink-faint">{items.length}</span>
        <div className="flex-1 h-px" style={{ background:"#E8E6E1" }} />
        <svg className={`w-3.5 h-3.5 text-ink-faint transition-transform ${open?"rotate-180":""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="ml-1.5 pl-5 space-y-1.5" style={{ borderLeft:`2px solid ${accentColor}25` }}>
          {items.map((ob,i) => {
            const dot = RISK_DOT[ob.risk_level] || "#8E8C85";
            return (
              <div key={ob.slug+i} className="bg-white rounded-xl border border-border-light px-4 py-3 animate-fadeUp"
                style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)", ...{ animationDelay:"" + i*0.04 + "s", animationFillMode:"both" } }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:dot }} />
                      <span className="text-[9px] font-bold uppercase text-ink-faint">{ob.risk_level}</span>
                      <span className="text-[9px] text-ink-faint">· {ob.category}</span>
                      {ob.frequency && <span className="text-[9px] text-ink-faint">· {ob.frequency}</span>}
                    </div>
                    <p className="text-[13px] font-medium text-ink">{ob.title}</p>
                    <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                      {(ob.deadline||ob.next_deadline) && (
                        <span className="text-[10px] text-ink-muted">{formatDate(ob.deadline||ob.next_deadline||"",lang)}</span>
                      )}
                      {ob.days_until!==undefined && ob.days_until>=0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background:ob.days_until<=7?"rgba(196,132,29,0.08)":"#F0EFEB",
                                   color:ob.days_until<=7?"#C4841D":"#8E8C85" }}>
                          {ob.days_until===0?t("Today","Aujourd'hui"):`${ob.days_until}${t("d","j")}`}
                        </span>
                      )}
                      {ob.days_overdue!==undefined && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background:"rgba(179,64,64,0.07)", color:"#B34040" }}>
                          {ob.days_overdue}{t("d overdue","j de retard")}
                        </span>
                      )}
                      {ob.agency && <span className="text-[9px] text-ink-faint">{ob.agency}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {(ob.penalty_max??0)>0 && (
                      <div className="text-right">
                        <div className="text-[11px] font-bold" style={{ color:"#B34040" }}>${(ob.penalty_max??0).toLocaleString()}</div>
                        <div className="text-[8px] text-ink-faint">{t("max penalty","pénalité max")}</div>
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <button onClick={()=>onComplete(ob.slug,ob.title,ob.penalty_max)}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded transition"
                        style={{ background:"rgba(27,58,45,0.06)", color:"#1B3A2D", border:"1px solid rgba(27,58,45,0.12)" }}>
                        ✓ {t("Done","Fait")}
                      </button>
                      {!isCont && (
                        <button onClick={()=>onSnooze(ob.slug,7)}
                          className="text-[10px] px-2 py-1 rounded border border-border-light bg-white text-ink-faint hover:bg-bg-warm transition"
                          title={t("Snooze 7d","Reporter 7j")}>
                          7d
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(d:string, lang:string) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString(lang==="fr"?"fr-CA":"en-CA",{month:"short",day:"numeric",year:"numeric"}); }
  catch { return d; }
}
