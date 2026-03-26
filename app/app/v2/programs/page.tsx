// app/v2/programs/page.tsx — Enterprise-aligned
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Program {
  slug: string; name: string; name_fr?: string;
  description: string; description_fr?: string;
  category: string; level: string; max_amount?: number;
  eligibility_summary?: string; eligibility_summary_fr?: string;
  url?: string; deadline?: string; match_score?: number; match_reason?: string;
}

interface Affiliate {
  id: string; name: string; description?: string; description_fr?: string;
  category: string; url?: string; commission_type?: string;
  commission_rate?: number; tags?: string[];
}

const LEVELS = ["all","federal","provincial","municipal"] as const;
const GOV_CATS = ["all","tax_credit","grant","loan","wage_subsidy","training"] as const;

export default function ProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms]     = useState<Program[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lang, setLang]             = useState<"en"|"fr">("en");
  const [tab, setTab]               = useState<"gov"|"partners">("gov");
  const [level, setLevel]           = useState<string>("all");
  const [expanded, setExpanded]     = useState<string|null>(null);
  const [isEnt, setIsEnt]           = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  const t = (en: string, fr: string) => lang === "fr" ? fr : en;
  const isFr = lang === "fr";

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fruxal_lang");
      if (stored === "en" || stored === "fr") setLang(stored as "en"|"fr");
      else if (navigator.language?.startsWith("fr")) setLang("fr");
      setIsEnt(localStorage.getItem("fruxal_tier") === "enterprise");
      setIsBusiness(localStorage.getItem("fruxal_tier") === "business");
    } catch { /* non-fatal */ }

    // Load programs from API (returns hardcoded Canadian programs + AI diagnostic results)
    // and commercial affiliates in parallel
    Promise.all([
      fetch("/api/v2/programs").then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/v2/affiliates?type=partner").then(r => r.json()).catch(() => ({})),
    ]).then(([progJson, affJson]: any) => {
      const progs = progJson?.data?.programs || [];
      setPrograms(progs);
      setTotalValue(progs.reduce((s: number, p: Program) => s + (p.max_amount ?? 0), 0));
      setAffiliates(affJson?.data || affJson?.affiliates || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = level === "all" ? programs : programs.filter(p => p.level === level);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-bg min-h-screen font-sans">
      <div className="px-6 lg:px-8 py-5 max-w-[1100px]">

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[15px] font-semibold text-ink mb-0.5">
              {t("Programs & Partners", "Programmes et partenaires")}
            </h1>
            <p className="text-[10px] text-ink-faint">
              {programs.length} {t("government programs matched","programmes gouvernementaux correspondants")}
              {totalValue > 0 && ` · $${(totalValue ?? 0).toLocaleString()} ${t("total potential value","valeur potentielle totale")}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(isEnt || isBusiness) && (
              <button onClick={() => router.push(isEnt ? "/v2/dashboard/enterprise" : "/v2/dashboard/business")}
                className="text-[10px] font-semibold text-brand border border-brand/20 rounded px-2.5 py-1.5 hover:bg-brand/5 transition">
                {t("Dashboard","Tableau de bord")}
              </button>
            )}
            <div className="flex bg-bg-section border border-border-light rounded-[7px] p-[3px] gap-[2px]">
              {(["en","fr"] as const).map(l => (
                <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("fruxal_lang", l); } catch { /* non-fatal */ } }}
                  className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-[5px] transition-all ${
                    lang === l ? "bg-white text-ink shadow-sm" : "text-ink-muted"}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { val: programs.length,    label: t("Gov Programs","Programmes gov."),     color:"#1B3A2D" },
            { val: affiliates.length,  label: t("Partner Firms","Cabinets partenaires"), color:"#1B3A2D" },
            { val: totalValue,         label: t("Total Potential","Valeur potentielle"), color:"#2D7A50", money:true },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-xl px-4 py-3.5 border border-border-light"
              style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="font-serif text-[28px] font-bold leading-none tracking-tight"
                style={{ color: k.color }}>
                {k.money ? `$${k.val.toLocaleString()}` : k.val}
              </div>
              <div className="text-[9px] text-ink-faint uppercase tracking-wider mt-1.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-5 bg-white border border-border-light rounded-lg p-1"
          style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)", width:"fit-content" }}>
          {([
            { key:"gov",      en:"Government Programs",  fr:"Programmes gouvernementaux" },
            { key:"partners", en:"Affiliate Partners",   fr:"Partenaires affiliés" },
          ] as const).map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`px-4 py-2 rounded-md text-[11px] font-semibold transition-all ${
                tab === tb.key
                  ? "bg-brand-soft text-brand"
                  : "text-ink-muted hover:text-ink"
              }`}>
              {isFr ? tb.fr : tb.en}
              <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full ${
                tab === tb.key ? "bg-brand/10" : "bg-bg-section"
              }`}>
                {tb.key === "gov" ? programs.length : affiliates.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Government Programs tab ──────────────────────────────────── */}
        {tab === "gov" && (
          <>
            {/* Level filter */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {LEVELS.map(lv => {
                const cnt = lv === "all" ? programs.length : programs.filter(p => p.level === lv).length;
                if (lv !== "all" && cnt === 0) return null;
                return (
                  <button key={lv} onClick={() => setLevel(lv)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all border ${
                      level === lv
                        ? "text-brand border-brand/20 bg-brand/5"
                        : "text-ink-muted border-border-light bg-white hover:border-brand/15"
                    }`}
                    style={{ boxShadow:"0 1px 2px rgba(0,0,0,0.02)" }}>
                    {lv === "all" ? t("All","Tout") :
                     lv === "federal" ? t("Federal","Fédéral") :
                     lv === "provincial" ? t("Provincial","Provincial") : t("Municipal","Municipal")}
                    <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full ${
                      level === lv ? "bg-brand/10 text-brand" : "bg-bg-section text-ink-faint"
                    }`}>{cnt}</span>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-bg-section border border-border-light flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="text-ink-faint">
                    <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>
                  </svg>
                </div>
                <p className="text-[12px] text-ink-muted font-medium mb-1">{t("No programs found","Aucun programme trouvé")}</p>
                <p className="text-[10px] text-ink-faint">{t("Complete your profile to get matched.","Complétez votre profil.")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((prog) => {
                  const isOpen = expanded === prog.slug;
                  const isHighMatch = (prog.match_score ?? 0) > 80;
                  return (
                    <div key={prog.slug} className="bg-white border border-border-light rounded-xl overflow-hidden"
                      style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                      <button onClick={() => setExpanded(isOpen ? null : prog.slug)}
                        className="w-full text-left px-5 py-4 flex items-start gap-4">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background:"rgba(27,58,45,0.06)", border:"1px solid rgba(27,58,45,0.10)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                              style={{ background:"rgba(27,58,45,0.06)", color:"#1B3A2D" }}>{prog.level}</span>
                            <span className="text-[9px] text-ink-faint">{prog.category}</span>
                            {isHighMatch && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                                style={{ background:"rgba(45,122,80,0.08)", color:"#2D7A50" }}>
                                {t("High match","Forte correspondance")}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] font-semibold text-ink">{isFr ? (prog.name_fr || prog.name) : prog.name}</p>
                          <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-1">
                            {isFr ? (prog.description_fr || prog.description) : prog.description}
                          </p>
                          {(prog as any).match_reason && (
                            <p className="text-[9px] font-medium mt-1 px-2 py-0.5 rounded-full inline-block"
                              style={{ background:"rgba(27,58,45,0.06)", color:"#2D7A50" }}>
                              ✓ {(prog as any).match_reason}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {prog.max_amount ? (
                            <div className="font-serif text-[16px] font-bold" style={{ color:"#2D7A50" }}>
                              ${(prog.max_amount ?? 0).toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-[10px] text-ink-faint">{t("Varies","Variable")}</span>
                          )}
                          <svg className={`w-3.5 h-3.5 text-ink-faint ml-auto mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-3 border-t border-border-light">
                          <p className="text-[12px] text-ink-secondary leading-relaxed mb-4">
                            {isFr ? (prog.description_fr || prog.description) : prog.description}
                          </p>
                          {(prog.eligibility_summary || prog.eligibility_summary_fr) && (
                            <div className="bg-bg rounded-lg border border-border-light px-4 py-3 mb-4">
                              <div className="text-[9px] uppercase tracking-wider text-ink-faint font-semibold mb-1">
                                {t("Eligibility","Admissibilité")}
                              </div>
                              <p className="text-[11px] text-ink-muted leading-relaxed">
                                {isFr ? (prog.eligibility_summary_fr || prog.eligibility_summary) : prog.eligibility_summary}
                              </p>
                            </div>
                          )}
                          {prog.deadline && (
                            <p className="text-[11px] text-ink-faint mb-4">
                              {t("Deadline:","Date limite :")} <span className="text-ink-muted font-medium">{prog.deadline}</span>
                            </p>
                          )}
                          {prog.url && (
                            <a href={prog.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-white text-[11px] font-semibold rounded-lg hover:opacity-90 transition"
                              style={{ background:"#1B3A2D" }}>
                              {t("Apply now","Postuler")}
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Affiliate Partners tab ───────────────────────────────────── */}
        {tab === "partners" && (
          <>
            {affiliates.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-bg-section border border-border-light flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="text-ink-faint">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <p className="text-[12px] text-ink-muted font-medium mb-1">{t("No partners yet","Aucun partenaire")}</p>
                <p className="text-[10px] text-ink-faint">{t("Run a diagnostic to get matched with advisors.","Lancez un diagnostic pour être jumelé.")}</p>
                <button onClick={() => router.push("/v2/diagnostic/intake")}
                  className="mt-4 px-4 py-2 text-[11px] font-semibold text-white rounded-lg hover:opacity-90 transition"
                  style={{ background:"#1B3A2D" }}>
                  {t("Run Intake →","Lancer le diagnostic →")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {affiliates.map((aff) => (
                  <div key={aff.id} className="bg-white border border-border-light rounded-xl px-5 py-4"
                    style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                            style={{ background:"rgba(27,58,45,0.06)", color:"#1B3A2D" }}>
                            {aff.category}
                          </span>
                          {aff.commission_type && (
                            <span className="text-[9px] text-ink-faint">{aff.commission_type}</span>
                          )}
                        </div>
                        <p className="text-[13px] font-semibold text-ink">{aff.name}</p>
                        {(aff.description || aff.description_fr) && (
                          <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-2">
                            {isFr ? (aff.description_fr || aff.description) : aff.description}
                          </p>
                        )}
                      </div>
                      {aff.commission_rate && (
                        <div className="shrink-0 text-right">
                          <div className="font-serif text-[15px] font-bold" style={{ color:"#2D7A50" }}>
                            {aff.commission_rate}%
                          </div>
                          <div className="text-[8px] text-ink-faint uppercase tracking-wide">
                            {t("referral","référence")}
                          </div>
                        </div>
                      )}
                    </div>
                    {aff.tags && aff.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {aff.tags.slice(0, 4).map((tag, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded-full"
                            style={{ background:"#F0EFEB", color:"#56554F" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {aff.url && (
                      <div className="mt-3 pt-3 border-t border-border-light">
                        <a href={aff.url} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-brand hover:underline">
                          {t("Learn more →","En savoir plus →")}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
