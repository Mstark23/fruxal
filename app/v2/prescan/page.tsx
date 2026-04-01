// =============================================================================
// src/app/v2/prescan/page.tsx
// =============================================================================
// The free hook. Questions that collect calculable data.
// Each answer feeds directly into the results engine.
// No account required — this is the top of funnel.
// =============================================================================

"use client";
import { getCountryFromCookie, US_STATES, CA_PROVINCES, getUSStateInsight, type Country } from "@/lib/country";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrescanAnswers {
  province: string;  // CA: province code | US: state code
  country: Country;  // "CA" | "US"
  industry: string;
  structure: string;
  monthly_revenue: number;
  employee_count: number;
  has_accountant: boolean;
  has_payroll: boolean;
  handles_data: boolean;
  handles_food: boolean;
  does_construction: boolean;
  sells_alcohol: boolean;
  // Smart follow-up fields
  does_rd: boolean;
  exports_goods: boolean;
  has_physical_location: boolean;
  uses_payroll_software: boolean;
  tax_last_reviewed: string;
  vendor_contracts_stale: boolean;
  has_business_insurance: boolean;
}

type Step = 0 | 1 | 2 | 3 | 4 | 5;

// Regions are dynamically selected based on country (see getRegions below)

const INDUSTRIES = [
  { value: "restaurant", label: "Restaurant / Food", fr: "Restaurant / Alimentation" },
  { value: "construction", label: "Construction", fr: "Construction" },
  { value: "retail", label: "Retail", fr: "Commerce de détail" },
  { value: "ecommerce", label: "E-Commerce", fr: "Commerce en ligne" },
  { value: "consulting", label: "Consulting", fr: "Consultation" },
  { value: "software_development", label: "Tech / SaaS", fr: "Tech / SaaS" },
  { value: "healthcare", label: "Healthcare", fr: "Santé" },
  { value: "salon", label: "Beauty / Salon", fr: "Beauté / Salon" },
  { value: "trucking", label: "Transport", fr: "Transport" },
  { value: "real_estate", label: "Real Estate", fr: "Immobilier" },
  { value: "accounting", label: "Accounting", fr: "Comptabilité" },
  { value: "legal", label: "Legal", fr: "Services juridiques" },
  { value: "fitness", label: "Fitness", fr: "Conditionnement physique" },
  { value: "cleaning", label: "Cleaning", fr: "Nettoyage" },
  { value: "photography", label: "Photo / Video", fr: "Photo / Vidéo" },
  { value: "rideshare", label: "Rideshare / Delivery", fr: "Transport / Livraison" },
  { value: "other", label: "Other", fr: "Autre" },
];

const CA_STRUCTS = [
  { value: "sole_proprietor", label: "Sole Proprietor / Self-employed", fr: "Travailleur autonome / Propriétaire unique" },
  { value: "corporation", label: "Incorporated (Inc. / Ltd.)", fr: "Incorporé (Inc. / Ltée)" },
  { value: "partnership", label: "Partnership", fr: "Société de personnes" },
];
const US_STRUCTS = [
  { value: "sole_proprietor", label: "Sole Proprietor / Self-employed", fr: "Sole Proprietor" },
  { value: "llc", label: "LLC (Limited Liability Company)", fr: "LLC" },
  { value: "s_corp", label: "S-Corporation", fr: "S-Corporation" },
  { value: "c_corp", label: "C-Corporation", fr: "C-Corporation" },
  { value: "partnership", label: "Partnership", fr: "Partnership" },
];

function getRevenueRanges(isFR: boolean) { return [
  { value: 3000,   label: isFR ? "Moins de 3 000 $/mois"    : "Under $3K/mo",      sub: "< $36K/yr" },
  { value: 7000,   label: isFR ? "3 000 - 10 000 $/mois"    : "$3K - $10K/mo",     sub: "$36K - $120K/yr" },
  { value: 20000,  label: isFR ? "10 000 - 30 000 $/mois"   : "$10K - $30K/mo",    sub: "$120K - $360K/yr" },
  { value: 50000,  label: isFR ? "30 000 - 80 000 $/mois"   : "$30K - $80K/mo",    sub: "$360K - $960K/yr" },
  { value: 120000, label: isFR ? "80 000 $/mois+"           : "$80K+/mo",           sub: "$960K+/yr" },
]; }

const EMPLOYEE_RANGES = [
  { value: 0, label: "Just me", fr: "Juste moi" },
  { value: 3, label: "1-5 employees", fr: "1-5 employés" },
  { value: 12, label: "6-20 employees", fr: "6-20 employés" },
  { value: 35, label: "20-50 employees", fr: "20-50 employés" },
  { value: 75, label: "50+ employees", fr: "50+ employés" },
];

// ═══════════════════════════════════════════════════════════════════════════════

export default function PrescanPage() {
  const router = useRouter();
  const { lang, setLang, t, isFR } = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<PrescanAnswers>({
    province: "", industry: "", structure: "", country: getCountryFromCookie(),
    monthly_revenue: 0, employee_count: 0,
    has_accountant: false, has_payroll: false,
    handles_data: false, handles_food: false,
    does_construction: false, sells_alcohol: false,
    does_rd: false, exports_goods: false,
    has_physical_location: false, uses_payroll_software: false,
    tax_last_reviewed: "", vendor_contracts_stale: false,
    has_business_insurance: false,
  });

  const set = (key: keyof PrescanAnswers, val: any) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
  };

  const canAdvance = () => {
    switch (step) {
      case 0: return answers.province && answers.industry;
      case 1: return answers.structure;
      case 2: return answers.monthly_revenue > 0;
      case 3: return true;
      case 4: return true;
      case 5: return answers.tax_last_reviewed !== "";
    }
  };

  const next = () => {
    if (step < 5) setStep((step + 1) as Step);
    else submit();
  };

  const back = () => {
    if (step > 0) setStep((step - 1) as Step);
  };

  const [errorMsg, setErrorMsg] = useState("");

  const submit = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v2/prescan/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, country: answers.country ?? getCountryFromCookie() }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.resultId) {
        router.push(`/v2/prescan/results/${json.resultId}`);
        return;
      }
      throw new Error(json.error || "Scan failed — please try again.");
    } catch (err: any) {
      console.error("[Prescan] submit error:", err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / 6) * 100;

  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
          <div>
            <h1 className="text-white/80 text-sm font-semibold">Fruxal Free Scan</h1>
            <p className="text-white/20 text-[10px]">Quick chat · 60 seconds · No account needed</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" style={{ width: progress + "%" }} />
        </div>
        <div className="flex justify-between mt-1">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <span key={n} className={`text-[9px] ${n <= step + 1 ? "text-emerald-400/60" : "text-white/10"}`}>{n}/5</span>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 max-w-lg mx-auto w-full">
        <div className="flex-1 py-6" style={{ animation: "fadeUp 0.3s ease-out" }} key={step}>

          {/* ═══ STEP 0: Province + Industry ═══ */}
          {step === 0 && (
            <div className="space-y-6">
              <Question
                q={answers.country === "US"
                  ? "Which state are you based in? (State affects which tax credits and programs apply to you.)"
                  : "Where are you based? (Province affects which grants and credits apply to you.)"}
                qfr="Où êtes-vous établi(e)? (La province détermine les subventions et crédits disponibles.)"
                isFR={isFR}
              />
              <div className="grid grid-cols-2 gap-2">
                {(answers.country === "US" ? US_STATES : CA_PROVINCES).map(p => (
                  <OptionButton key={p.value} selected={answers.province === p.value}
                    onClick={() => set("province", p.value)} label={"fr" in p && isFR ? (p as any).fr : p.label} />
                ))}
              </div>

              {answers.province && (
                <div style={{ animation: "fadeUp 0.3s ease-out" }}>
                  <Question q="What kind of business do you run? (Your industry changes which leaks to look for first.)" qfr="Quel type d'entreprise exploitez-vous? (Votre secteur détermine les fuites prioritaires.)" isFR={isFR} />
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map(i => (
                      <OptionButton selected={answers.industry === i.value}
                        onClick={() => set("industry", i.value)} label={isFR && i.fr ? i.fr : i.label} icon="" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 1: Structure ═══ */}
          {step === 1 && (
            <div className="space-y-6">
              <Question q="How is your business set up legally? (This affects which tax strategies are available to you.)" qfr="Comment votre entreprise est-elle structurée juridiquement? (Cela détermine les stratégies fiscales disponibles.)" isFR={isFR} />
              <div className="space-y-2">
                {(answers.country === "US" ? US_STRUCTS : CA_STRUCTS).map(s => (
                  <OptionButton selected={answers.structure === s.value}
                    onClick={() => set("structure", s.value)} label={s.label} icon="" wide />
                ))}
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
                <p className="text-[11px] text-amber-400/60">
                  {answers.country === "US"
                    ? getUSStateInsight(answers.province)
                    : answers.province === "SK" ? "Saskatchewan has 0% provincial corporate tax on the first $600K — the best rate in Canada."
                    : answers.province === "AB" ? "Alberta has the lowest corporate rate in Canada at 8%."
                    : answers.province === "NL" ? "NL has the biggest gap between personal (54.8%) and corporate (12%) rates in Canada."
                    : "Your business structure directly affects how much tax you pay. We'll check if you're optimized."}
                </p>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Revenue ═══ */}
          {step === 2 && (
            <div className="space-y-6">
              <Question q="Roughly how much does your business bring in per month? (We use this to calculate the dollar impact of each leak.)" qfr="Combien votre entreprise génère-t-elle par mois environ? (Nous l'utilisons pour calculer l'impact en dollars de chaque fuite.)" isFR={isFR} />
              <div className="space-y-2">
                {getRevenueRanges(isFR).map(r => (
                  <OptionButton key={r.value} selected={answers.monthly_revenue === r.value}
                    onClick={() => set("monthly_revenue", r.value)} label={r.label} sub={r.sub} wide />
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Employees ═══ */}
          {step === 3 && (
            <div className="space-y-6">
              <Question q="How many people work in your business? (Payroll is one of the top sources of both savings and compliance risk.)" qfr="Combien de personnes travaillent dans votre entreprise? (La paie est l'une des principales sources d'économies et de risque.)" isFR={isFR} />
              <div className="space-y-2">
                {EMPLOYEE_RANGES.map(e => (
                  <OptionButton key={e.value} selected={answers.employee_count === e.value}
                    onClick={() => { set("employee_count", e.value); if (e.value > 0) set("has_payroll", true); }}
                    label={e.label} icon="" wide />
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 4: Killer flags ═══ */}
          {step === 4 && (
            <div className="space-y-6">
              <Question q="Check what applies — these flags directly change your results:" qfr="Cochez ce qui s'applique — ces indicateurs modifient directement vos résultats :" isFR={isFR} />
              <div className="space-y-2">
                <FlagToggle on={answers.has_accountant} onClick={() => set("has_accountant", !answers.has_accountant)} label={answers.country === "US" ? "I have a CPA or bookkeeper" : "I have an accountant or bookkeeper"}  />
                <FlagToggle on={answers.handles_data} onClick={() => set("handles_data", !answers.handles_data)} label="I collect customer data (emails, payments)" icon="" />
                <FlagToggle on={answers.has_physical_location} onClick={() => set("has_physical_location", !answers.has_physical_location)} label="I have a physical office, store or warehouse"  />
                <FlagToggle on={answers.exports_goods} onClick={() => set("exports_goods", !answers.exports_goods)} label={answers.country === "US" ? "I sell to clients outside the United States" : "I sell to clients outside Canada"} icon="" />
                <FlagToggle on={answers.does_rd} onClick={() => set("does_rd", !answers.does_rd)} label="I do any R&D, innovation, or custom software" icon="" />
                {["restaurant","salon","fitness","healthcare"].includes(answers.industry) && (
                  <FlagToggle on={answers.handles_food} onClick={() => set("handles_food", !answers.handles_food)} label="I handle or serve food" icon="" />
                )}
                {answers.industry === "construction" && (
                  <FlagToggle on={answers.does_construction} onClick={() => set("does_construction", !answers.does_construction)} label="I do construction or renovation work" icon="" />
                )}
                {["restaurant","salon"].includes(answers.industry) && (
                  <FlagToggle on={answers.sells_alcohol} onClick={() => set("sells_alcohol", !answers.sells_alcohol)} label="I sell or serve alcohol" icon="" />
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 5: Smart follow-up ═══ */}
          {step === 5 && (
            <div className="space-y-6">
              <Question q="Last few — these often reveal the biggest gaps:" qfr="Dernières questions — elles révèlent souvent les plus grands écarts :" isFR={isFR} />
              <div className="space-y-4">

                {/* Tax reviewed */}
                <div>
                  <p className="text-white/50 text-[11px] font-medium mb-2">When did you last have a professional look at your full tax setup — not just file your return, but actually review your structure and strategy? (This single question often reveals the largest gap.)</p>
                  <div className="space-y-2">
                    {[
                      { value: "this_year", label: "This year" },
                      { value: "1_2_years", label: "1–2 years ago" },
                      { value: "3_plus_years", label: "3+ years ago" },
                      { value: "never", label: "Never / Not sure" },
                    ].map(opt => (
                      <OptionButton key={opt.value} selected={answers.tax_last_reviewed === opt.value}
                        onClick={() => set("tax_last_reviewed", opt.value)}
                        label={opt.label} icon="" wide />
                    ))}
                  </div>
                </div>

                {/* Vendor contracts */}
                <FlagToggle
                  on={answers.vendor_contracts_stale}
                  onClick={() => set("vendor_contracts_stale", !answers.vendor_contracts_stale)}
                  label="My supplier/vendor contracts haven't been renegotiated in the last 2 years (most businesses save 8–15% when they do)"
                  icon="pdf"
                />

                {/* Payroll software */}
                {answers.employee_count > 0 && (
                  <FlagToggle
                    on={answers.uses_payroll_software}
                    onClick={() => set("uses_payroll_software", !answers.uses_payroll_software)}
                    label={answers.country === "US" ? "I use payroll software (ADP, Gusto, Paychex, etc.)" : "I use payroll software (Ceridian, ADP, Payworks, etc.)"}
                    
                  />
                )}

                {/* Insurance */}
                <FlagToggle
                  on={answers.has_business_insurance}
                  onClick={() => set("has_business_insurance", !answers.has_business_insurance)}
                  label="I have business liability insurance"
                  icon=""
                />
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3 mt-2">
                <p className="text-xs text-emerald-400/70 font-medium">
                  {"Scanning " + (isFR ? (answers.country === "US" ? US_STATES : CA_PROVINCES).find(p => p.value === answers.province)?.label : (answers.country === "US" ? US_STATES : CA_PROVINCES).find(p => p.value === answers.province)?.label) + " " + (isFR ? "réglementations," : "regulations,") + " " + (answers.monthly_revenue >= 10000 ? "mid-market" : "small business") + " tax rules, and government programs for " + (INDUSTRIES.find(i => i.value === answers.industry)?.label?.toLowerCase()) + " businesses."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Navigation */}
        <div className="pb-8 flex gap-3">
          {step > 0 && (
            <button onClick={back} className="px-6 py-3 rounded-xl bg-white/[0.03] text-white/30 text-sm hover:bg-white/[0.06] transition-colors">
              ←
            </button>
          )}
          <button onClick={next} disabled={!canAdvance() || submitting}
            className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all ${
              canAdvance()
                ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                : "bg-white/[0.04] text-white/15 cursor-not-allowed"
            }`}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning your business...
              </span>
            ) : step === 5 ? t("Scan My Business — Free →", "Scanner mon entreprise — Gratuit →") : t("Continue →", "Continuer →")}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Question({ q, qfr, isFR }: { q: string; qfr?: string; isFR?: boolean }) {
  return <h2 className="text-white/80 text-base font-semibold leading-snug">{q}</h2>;
}

function OptionButton({ selected, onClick, label, icon, sub, wide }: {
  selected: boolean; onClick: () => void; label: string; icon?: string; sub?: string; wide?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2.5 px-4 ${wide ? "py-3.5" : "py-2.5"} rounded-xl text-xs text-left transition-all border ${
        selected
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5"
          : "bg-white/[0.02] text-white/40 border-transparent hover:bg-white/[0.04] hover:text-white/50"
      }`}>
      {icon && <span className="text-sm">{icon}</span>}
      <div className="flex-1">
        <span className="font-medium">{label}</span>
        {sub && <span className="block text-[10px] text-white/15 mt-0.5">{sub}</span>}
      </div>
      {selected && <span className="text-emerald-400">✓</span>}
    </button>
  );
}

function FlagToggle({ on, onClick, label, icon = "" }: { on: boolean; onClick: () => void; label: string; icon?: string }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs text-left transition-all border ${
        on ? "bg-emerald-500/8 text-emerald-400/80 border-emerald-500/12" : "bg-white/[0.02] text-white/30 border-transparent hover:bg-white/[0.04]"
      }`}>
      <span className="text-base">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      <div className={`w-8 h-5 rounded-full flex items-center transition-all ${on ? "bg-emerald-500 justify-end" : "bg-white/10 justify-start"}`}>
        <div className={`w-3.5 h-3.5 rounded-full mx-0.5 ${on ? "bg-white" : "bg-white/30"}`} />
      </div>
    </button>
  );
}
