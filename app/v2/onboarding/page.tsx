// =============================================================================
// src/app/v2/onboarding/page.tsx
// =============================================================================
// Post-signup onboarding wizard. Collects:
//   Step 1: Business basics (name, industry, structure, province)
//   Step 2: Financial info (revenue, fiscal year end, employees)
//   Step 3: Key dates (incorporation, registration, first employee, licences)
//   Step 4: Current situation (what do you handle today?)
//   Step 5: Confirmation + instant obligation sync + deadline compute
//
// After completion:
//   → saves business_profile with all anchor dates
//   → triggers sync_obligations_with_deadlines()
//   → redirects to /v2/dashboard
// =============================================================================

"use client";
import { getCountryFromCookie, US_STATES, CA_PROVINCES } from "@/lib/country";

import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingData {
  // Step 1: Basics
  business_name: string;
  industry: string;
  industry_naics: string;
  structure: string;
  province: string;
  country: string;
  city: string;

  // Step 2: Financial
  monthly_revenue: string;
  employee_count: string;
  fiscal_year_end_month: string;
  has_payroll: boolean;
  handles_data: boolean;
  has_physical_location: boolean;

  // Step 3: Key Dates
  incorporation_date: string;
  registration_date: string;
  gst_registration_date: string;
  qst_registration_date: string;
  first_employee_date: string;
  licence_renewal_date: string;
  insurance_renewal_date: string;
  lease_start_date: string;
  lease_end_date: string;

  // Step 4: Situation
  has_accountant: boolean;
  has_bookkeeper: boolean;
  uses_payroll_software: boolean;
  uses_pos: boolean;
  sells_alcohol: boolean;
  handles_food: boolean;
  does_construction: boolean;
  has_professional_order: boolean;
  exports_goods: boolean;
  does_rd: boolean;
}

const INITIAL_DATA: OnboardingData = {
  business_name: "", industry: "", industry_naics: "", structure: "", province: "", city: "", country: getCountryFromCookie(),
  monthly_revenue: "", employee_count: "0", fiscal_year_end_month: "12",
  has_payroll: false, handles_data: false, has_physical_location: false,
  incorporation_date: "", registration_date: "", gst_registration_date: "",
  qst_registration_date: "", first_employee_date: "", licence_renewal_date: "",
  insurance_renewal_date: "", lease_start_date: "", lease_end_date: "",
  has_accountant: false, has_bookkeeper: false, uses_payroll_software: false,
  uses_pos: false, sells_alcohol: false, handles_food: false,
  does_construction: false, has_professional_order: false, exports_goods: false, does_rd: false,
};


const ONBOARDING_STEP_ICONS: Record<string, JSX.Element> = {
  business:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  finances:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  dates:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  situation: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  launch:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
};
const STEPS = [
  { key: "basics", label: "Business", labelFr: "Entreprise", icon: "" },
  { key: "financial", label: "Finances", labelFr: "Finances", icon: "" },
  { key: "dates", label: "Key Dates", labelFr: "Dates clés", icon: "" },
  { key: "situation", label: "Situation", labelFr: "Situation", icon: "" },
  { key: "confirm", label: "Launch", labelFr: "Lancement", icon: "" },
];

const CA_STRUCTURES = [
  { value: "sole_proprietor", label: "Sole Proprietor", labelFr: "Travailleur autonome" },
  { value: "corporation", label: "Corporation (Inc.)", labelFr: "Société par actions (Inc.)" },
  { value: "partnership", label: "Partnership", labelFr: "Société en nom collectif" },
  { value: "cooperative", label: "Cooperative", labelFr: "Coopérative" },
  { value: "npo", label: "Non-Profit", labelFr: "Organisme sans but lucratif" },
];
const US_STRUCTURES = [
  { value: "sole_proprietor", label: "Sole Proprietor", labelFr: "Sole Proprietor" },
  { value: "llc", label: "LLC (Limited Liability Company)", labelFr: "LLC" },
  { value: "s_corp", label: "S-Corporation", labelFr: "S-Corporation" },
  { value: "c_corp", label: "C-Corporation", labelFr: "C-Corporation" },
  { value: "partnership", label: "Partnership", labelFr: "Partnership" },
  { value: "npo", label: "Non-Profit (501c3)", labelFr: "Non-Profit" },
];

// Provinces/states loaded dynamically via CA_PROVINCES / US_STATES from lib/country

const REVENUE_RANGES = [
  { value: "0", label: "Pre-revenue", labelFr: "Pré-revenu" },
  { value: "2500", label: "$1K – $5K/mo", labelFr: "1K – 5K$/mo" },
  { value: "10000", label: "$5K – $15K/mo", labelFr: "5K – 15K$/mo" },
  { value: "25000", label: "$15K – $40K/mo", labelFr: "15K – 40K$/mo" },
  { value: "60000", label: "$40K – $80K/mo", labelFr: "40K – 80K$/mo" },
  { value: "125000", label: "$80K – $175K/mo", labelFr: "80K – 175K$/mo" },
  { value: "250000", label: "$175K+/mo", labelFr: "175K+$/mo" },
];

const EMPLOYEE_RANGES = [
  { value: "0", label: "Just me", labelFr: "Juste moi" },
  { value: "2", label: "1–4", labelFr: "1–4" },
  { value: "7", label: "5–9", labelFr: "5–9" },
  { value: "15", label: "10–24", labelFr: "10–24" },
  { value: "37", label: "25–49", labelFr: "25–49" },
  { value: "75", label: "50–99", labelFr: "50–99" },
  { value: "150", label: "100+", labelFr: "100+" },
];

const MONTHS = [
  { value: "1", label: "January", labelFr: "Janvier" },
  { value: "2", label: "February", labelFr: "Février" },
  { value: "3", label: "March", labelFr: "Mars" },
  { value: "4", label: "April", labelFr: "Avril" },
  { value: "5", label: "May", labelFr: "Mai" },
  { value: "6", label: "June", labelFr: "Juin" },
  { value: "7", label: "July", labelFr: "Juillet" },
  { value: "8", label: "August", labelFr: "Août" },
  { value: "9", label: "September", labelFr: "Septembre" },
  { value: "10", label: "October", labelFr: "Octobre" },
  { value: "11", label: "November", labelFr: "Novembre" },
  { value: "12", label: "December", labelFr: "Décembre" },
];

const INDUSTRIES = [
  { value: "restaurant", naics: "7225", label: "Restaurant / Food Service", labelFr: "Restaurant / Service alimentaire" },
  { value: "construction", naics: "236", label: "Construction / Renovation", labelFr: "Construction / Rénovation" },
  { value: "retail", naics: "441", label: "Retail", labelFr: "Commerce de détail" },
  { value: "ecommerce", naics: "4541", label: "E-Commerce", labelFr: "Commerce en ligne" },
  { value: "consulting", naics: "5416", label: "Consulting / Professional Services", labelFr: "Consultation / Services professionnels" },
  { value: "software_development", naics: "5112", label: "Software / SaaS / Tech", labelFr: "Logiciel / SaaS / Tech" },
  { value: "healthcare", naics: "621", label: "Healthcare / Clinic", labelFr: "Santé / Clinique" },
  { value: "salon", naics: "8121", label: "Beauty / Salon / Spa", labelFr: "Beauté / Salon / Spa" },
  { value: "trucking", naics: "484", label: "Transport / Delivery", labelFr: "Transport / Livraison" },
  { value: "real_estate", naics: "531", label: "Real Estate", labelFr: "Immobilier" },
  { value: "manufacturing", naics: "31-33", label: "Manufacturing", labelFr: "Fabrication" },
  { value: "accounting", naics: "5412", label: "Accounting / Bookkeeping", labelFr: "Comptabilité / Tenue de livres" },
  { value: "legal", naics: "5411", label: "Legal Services", labelFr: "Services juridiques" },
  { value: "marketing", naics: "5418", label: "Marketing / Design / Agency", labelFr: "Marketing / Design / Agence" },
  { value: "fitness", naics: "71394", label: "Fitness / Gym / Coaching", labelFr: "Fitness / Gym / Coaching" },
  { value: "cleaning", naics: "5617", label: "Cleaning / Janitorial", labelFr: "Nettoyage / Entretien" },
  { value: "landscaping", naics: "5617", label: "Landscaping", labelFr: "Aménagement paysager" },
  { value: "rideshare", naics: "4853", label: "Rideshare / Delivery Driver", labelFr: "Chauffeur / Livreur" },
  { value: "photography", naics: "54192", label: "Photography / Videography", labelFr: "Photo / Vidéo" },
  { value: "other", naics: "", label: "Other", labelFr: "Autre" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { lang, setLang, t, isFR } = useLang();
  const isFr = lang === "fr";

  // Auto-detect language from province
  useEffect(() => {
    if (data.province === "QC") setLang("fr");
    else if (data.province) setLang("en");
  }, [data.province]);

  const update = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleBool = (field: keyof OnboardingData) => {
    setData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ─── Validation per step ────────────────────────────────────────────────
  const canAdvance = () => {
    switch (step) {
      case 0: return data.business_name && data.industry && data.structure && data.province;
      case 1: return data.monthly_revenue && data.fiscal_year_end_month;
      case 2: return true; // dates are optional
      case 3: return true; // situation is optional
      case 4: return true;
      default: return true;
    }
  };

  // ─── Save & Sync ────────────────────────────────────────────────────────
  const handleComplete = async () => {
    setSaving(true);
    setError(null);
    try {
      // Step 1: Save business profile
      const saveRes = await fetch("/api/v2/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const saveJson = await saveRes.json();
      if (!saveJson.success) throw new Error(saveJson.error);

      setSaving(false);
      setSyncing(true);

      // Step 2: Sync obligations + compute deadlines
      const syncRes = await fetch("/api/v2/onboarding/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: saveJson.businessId }),
      });
      const syncJson = await syncRes.json();
      setSyncResult(syncJson.data);

      // Short delay for animation
      await new Promise(r => setTimeout(r, 1500));

      // Redirect to dashboard
      router.push("/v2/dashboard");

    } catch (err: any) {
      setError(err.message);
      setSaving(false);
      setSyncing(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col">

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="px-4 py-4 flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm">L</div>
          <span className="text-white/70 font-semibold text-sm tracking-tight">Fruxal</span>
        </div>
        <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="text-xs text-white/25 hover:text-white/50 px-2 py-1 rounded border border-white/[0.06] transition-colors">
          {isFr ? "EN" : "FR"}
        </button>
      </header>

      {/* ─── Progress bar ────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-6">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-full h-1 rounded-full transition-all duration-500 ${
                i < step ? "bg-emerald-500" : i === step ? "bg-emerald-500/50" : "bg-white/[0.06]"
              }`} />
              <div className="flex items-center gap-1">
                {ONBOARDING_STEP_ICONS[s.icon] ?? null}
                <span className={`text-[10px] transition-colors ${
                  i <= step ? "text-white/50" : "text-white/15"
                }`}>{isFr ? s.labelFr : s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Step content ────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pb-32">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 sm:p-8"
          style={{ animation: "fadeUp 0.3s ease-out" }}>

          {/* ═══ STEP 0: Business Basics ═══ */}
          {step === 0 && (
            <div className="space-y-5">
              <StepHeader
                title={isFr ? "Parlons de votre entreprise" : "Tell us about your business"}
                subtitle={isFr ? "Ces informations déterminent quelles obligations s'appliquent à vous." : "This determines which obligations apply to you."}
              />

              <Field label={isFr ? "Nom de l'entreprise" : "Business name"}>
                <input type="text" value={data.business_name} onChange={e => update("business_name", e.target.value)}
                  placeholder={isFr ? "Ex: Boulangerie Chez Marie" : "E.g., Marie's Bakery"}
                  className="input-field" />
              </Field>

              <Field label={isFr ? "Industrie" : "Industry"}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {INDUSTRIES.map(ind => (
                    <button key={ind.value} onClick={() => { update("industry", ind.value); update("industry_naics", ind.naics); }}
                      className={`px-3 py-2 rounded-lg text-xs text-left transition-all ${
                        data.industry === ind.value
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-white/[0.03] text-white/40 border border-transparent hover:bg-white/[0.06] hover:text-white/60"
                      }`}>
                      {isFr ? ind.labelFr : ind.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={isFr ? "Structure juridique" : "Legal structure"}>
                <div className="grid grid-cols-2 gap-1.5">
                  {(data.country === "US" ? US_STRUCTURES : CA_STRUCTURES).map(s => (
                    <button key={s.value} onClick={() => update("structure", s.value)}
                      className={`px-3 py-2.5 rounded-lg text-xs transition-all ${
                        data.structure === s.value
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-white/[0.03] text-white/40 border border-transparent hover:bg-white/[0.06]"
                      }`}>
                      {isFr ? s.labelFr : s.label}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label={data.country === "US" ? "State" : (isFr ? "Province" : "Province")}>
                  <select value={data.province} onChange={e => update("province", e.target.value)} className="input-field">
                    <option value="">{isFr ? "Sélectionner..." : "Select..."}</option>
                    {(data.country === "US" ? US_STATES : CA_PROVINCES).map(p => (
                      <option key={p.value} value={p.value}>{isFr && "labelFr" in p ? (p as any).labelFr : p.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label={isFr ? "Ville" : "City"}>
                  <input type="text" value={data.city} onChange={e => update("city", e.target.value)}
                    placeholder={isFr ? "Ex: Montréal" : "E.g., Toronto"}
                    className="input-field" />
                </Field>
              </div>
            </div>
          )}

          {/* ═══ STEP 1: Financial Info ═══ */}
          {step === 1 && (
            <div className="space-y-5">
              <StepHeader
                title={isFr ? "Informations financières" : "Financial Information"}
                subtitle={isFr ? "Aide à déterminer votre niveau d'obligations et les programmes disponibles." : "Helps determine your obligation level and available programs."}
              />

              <Field label={isFr ? "Revenu mensuel approximatif" : "Approximate monthly revenue"}>
                <div className="grid grid-cols-2 gap-1.5">
                  {REVENUE_RANGES.map(r => (
                    <button key={r.value} onClick={() => update("monthly_revenue", r.value)}
                      className={`px-3 py-2.5 rounded-lg text-xs transition-all ${
                        data.monthly_revenue === r.value
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-white/[0.03] text-white/40 border border-transparent hover:bg-white/[0.06]"
                      }`}>
                      {isFr ? r.labelFr : r.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={isFr ? "Nombre d'employés" : "Number of employees"}>
                <div className="grid grid-cols-4 gap-1.5">
                  {EMPLOYEE_RANGES.map(e => (
                    <button key={e.value} onClick={() => update("employee_count", e.value)}
                      className={`px-3 py-2.5 rounded-lg text-xs transition-all ${
                        data.employee_count === e.value
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-white/[0.03] text-white/40 border border-transparent hover:bg-white/[0.06]"
                      }`}>
                      {isFr ? e.labelFr : e.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={isFr ? "Fin d'exercice fiscal" : "Fiscal year-end month"}>
                <select value={data.fiscal_year_end_month} onChange={e => update("fiscal_year_end_month", e.target.value)} className="input-field">
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{isFr ? m.labelFr : m.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-white/20 mt-1">
                  {isFr ? "La plupart des PME: décembre. Les sociétés peuvent choisir un autre mois." : "Most small businesses: December. Corporations can choose any month."}
                </p>
              </Field>

              <div className="grid grid-cols-3 gap-2">
                <ToggleCard active={data.has_payroll} onClick={() => toggleBool("has_payroll")}
                  label={isFr ? "J'ai des employés sur la paie" : "I run payroll"} icon="👥" />
                <ToggleCard active={data.handles_data} onClick={() => toggleBool("handles_data")}
                  label={isFr ? "Je collecte des données clients" : "I collect customer data"} />
                <ToggleCard active={data.has_physical_location} onClick={() => toggleBool("has_physical_location")}
                  label={isFr ? "J'ai un local physique" : "I have a physical location"} icon="🏪" />
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Key Dates ═══ */}
          {step === 2 && (
            <div className="space-y-5">
              <StepHeader
                title={isFr ? "Dates clés de votre entreprise" : "Key Business Dates"}
                subtitle={isFr ? "Ces dates permettent de calculer vos échéances exactes. Laissez vide si inconnu — on estimera." : "These dates enable exact deadline calculations. Leave blank if unknown — we'll estimate."}
              />

              <div className="bg-blue-500/8 border border-blue-500/15 rounded-xl px-4 py-3 mb-2">
                <p className="text-xs text-blue-400/80">
                  {isFr ? "Plus vous remplissez de dates, plus vos échéances seront précises. Ne vous inquiétez pas si vous n'avez pas tout — vous pourrez les ajouter plus tard." : "The more dates you fill in, the more accurate your deadlines. Don't worry if you don't have everything — you can add them later."}
                </p>
              </div>

              {data.structure === "corporation" && (
                <Field label={isFr ? "Date d'incorporation" : "Incorporation date"}>
                  <input type="date" value={data.incorporation_date} onChange={e => update("incorporation_date", e.target.value)} className="input-field" />
                  <p className="text-[10px] text-white/15 mt-1">{isFr ? "Utilisée pour: rapport annuel, renouvellements" : "Used for: annual returns, renewals"}</p>
                </Field>
              )}

              <Field label={isFr ? "Date d'immatriculation (REQ/ServiceOntario)" : "Business registration date"}>
                <input type="date" value={data.registration_date} onChange={e => update("registration_date", e.target.value)} className="input-field" />
                <p className="text-[10px] text-white/15 mt-1">{isFr ? "Utilisée pour: renouvellement REQ (5 ans QC)" : "Used for: registration renewal (5yr QC, 5yr ON)"}</p>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label={data.country === "US" ? "Sales Tax Registration Date" : isFr ? "Date d'inscription TPS/TVH" : "GST/HST Registration Date"}>
                  <input type="date" value={data.gst_registration_date} onChange={e => update("gst_registration_date", e.target.value)} className="input-field" />
                </Field>
                {data.province === "QC" && data.country !== "US" && (
                  <Field label="Date d'inscription TVQ">
                    <input type="date" value={data.qst_registration_date} onChange={e => update("qst_registration_date", e.target.value)} className="input-field" />
                  </Field>
                )}
              </div>

              {(parseInt(data.employee_count) > 0 || data.has_payroll) && (
                <Field label={isFr ? "Date du premier employé" : "First employee start date"}>
                  <input type="date" value={data.first_employee_date} onChange={e => update("first_employee_date", e.target.value)} className="input-field" />
                  <p className="text-[10px] text-white/15 mt-1">{(typeof document !== "undefined" && document.cookie.includes("fruxal_country=US")) ? "Used for: workers comp, WOTC eligibility, FICA optimization" : isFr ? "Utilisée pour: CNESST/WSIB, équité salariale, comité SST" : "Used for: CNESST/WSIB, pay equity, safety committee deadlines"}</p>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label={isFr ? "Renouvellement permis/licence" : "Permit/licence renewal date"}>
                  <input type="date" value={data.licence_renewal_date} onChange={e => update("licence_renewal_date", e.target.value)} className="input-field" />
                </Field>
                <Field label={isFr ? "Renouvellement assurance" : "Insurance renewal date"}>
                  <input type="date" value={data.insurance_renewal_date} onChange={e => update("insurance_renewal_date", e.target.value)} className="input-field" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label={isFr ? "Début du bail" : "Lease start date"}>
                  <input type="date" value={data.lease_start_date} onChange={e => update("lease_start_date", e.target.value)} className="input-field" />
                </Field>
                <Field label={isFr ? "Fin du bail" : "Lease end date"}>
                  <input type="date" value={data.lease_end_date} onChange={e => update("lease_end_date", e.target.value)} className="input-field" />
                </Field>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Current Situation ═══ */}
          {step === 3 && (
            <div className="space-y-5">
              <StepHeader
                title={isFr ? "Votre situation actuelle" : "Your Current Situation"}
                subtitle={isFr ? "Cochez tout ce qui s'applique. Aide à détecter les obligations spécifiques à votre industrie." : "Check all that apply. Helps detect industry-specific obligations."}
              />

              <div className="grid grid-cols-2 gap-2">
                <ToggleCard active={data.has_accountant} onClick={() => toggleBool("has_accountant")}
                  label={isFr ? "J'ai un comptable" : data.country === "US" ? "I have a CPA" : "I have an accountant"} icon="🧮" />
                <ToggleCard active={data.has_bookkeeper} onClick={() => toggleBool("has_bookkeeper")}
                  label={isFr ? "J'ai un teneur de livres" : "I have a bookkeeper"} icon="📒" />
                <ToggleCard active={data.uses_payroll_software} onClick={() => toggleBool("uses_payroll_software")}
                  label={isFr ? "J'utilise un logiciel de paie" : "I use payroll software"} />
                <ToggleCard active={data.uses_pos} onClick={() => toggleBool("uses_pos")}
                  label={isFr ? "J'ai un système de point de vente (POS)" : "I use a POS system"} icon="🖥️" />
              </div>

              <p className="text-xs text-white/25 font-medium pt-2">
                {isFr ? "Activités spécifiques" : "Specific activities"}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <ToggleCard active={data.sells_alcohol} onClick={() => toggleBool("sells_alcohol")}
                  label={isFr ? "Je vends/sers de l'alcool" : "I sell/serve alcohol"} icon="🍷" />
                <ToggleCard active={data.handles_food} onClick={() => toggleBool("handles_food")}
                  label={isFr ? "Je manipule des aliments" : "I handle food"} icon="🍽️" />
                <ToggleCard active={data.does_construction} onClick={() => toggleBool("does_construction")}
                  label={isFr ? "Je fais de la construction" : "I do construction work"} icon="🏗️" />
                <ToggleCard active={data.has_professional_order} onClick={() => toggleBool("has_professional_order")}
                  label={isFr ? "Membre d'un ordre professionnel" : "Professional order member"} icon="⚖️" />
                <ToggleCard active={data.exports_goods} onClick={() => toggleBool("exports_goods")}
                  label={isFr ? "J'exporte des biens/services" : "I export goods/services"} icon="🌍" />
                <ToggleCard active={data.does_rd} onClick={() => toggleBool("does_rd")}
                  label={isFr ? "Je fais de la R&D" : "I do R&D"} icon="🔬" />
              </div>
            </div>
          )}

          {/* ═══ STEP 4: Confirmation ═══ */}
          {step === 4 && !syncing && (
            <div className="space-y-5">
              <StepHeader
                title={isFr ? "Tout est prêt!" : "All Set!"}
                subtitle={isFr ? "Voici un résumé. On va maintenant analyser vos obligations et calculer vos échéances." : "Here's a summary. We'll now analyze your obligations and calculate your deadlines."}
              />

              <div className="space-y-2">
                <SummaryRow label={isFr ? "Entreprise" : "Business"} value={data.business_name} />
                <SummaryRow label={isFr ? "Industrie" : "Industry"} value={INDUSTRIES.find(i => i.value === data.industry)?.[isFr ? "labelFr" : "label"] || data.industry} />
                <SummaryRow label={isFr ? "Structure" : "Structure"} value={STRUCTURES.find(s => s.value === data.structure)?.[isFr ? "labelFr" : "label"] || data.structure} />
                <SummaryRow label={isFr ? "Province" : "Province"} value={(data.country === "US" ? US_STATES : CA_PROVINCES).find(p => p.value === data.province)?.label || data.province} />
                <SummaryRow label={isFr ? "Revenu mensuel" : "Monthly revenue"} value={REVENUE_RANGES.find(r => r.value === data.monthly_revenue)?.[isFr ? "labelFr" : "label"] || data.monthly_revenue} />
                <SummaryRow label={isFr ? "Employés" : "Employees"} value={EMPLOYEE_RANGES.find(e => e.value === data.employee_count)?.[isFr ? "labelFr" : "label"] || data.employee_count} />
                <SummaryRow label={isFr ? "Fin d'exercice" : "Fiscal year-end"} value={MONTHS.find(m => m.value === data.fiscal_year_end_month)?.[isFr ? "labelFr" : "label"] || data.fiscal_year_end_month} />

                {/* Dates provided */}
                {data.incorporation_date && <SummaryRow label={isFr ? "Incorporation" : "Incorporation"} value={data.incorporation_date} />}
                {data.registration_date && <SummaryRow label={isFr ? "Immatriculation" : "Registration"} value={data.registration_date} />}
                {data.first_employee_date && <SummaryRow label={isFr ? "Premier employé" : "First employee"} value={data.first_employee_date} />}

                {/* Flags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {data.has_payroll && <FlagBadge label={isFr ? "Paie" : "Payroll"} />}
                  {data.handles_data && <FlagBadge label={isFr ? "Données" : "Data"} />}
                  {data.has_physical_location && <FlagBadge label={isFr ? "Local" : "Location"} />}
                  {data.sells_alcohol && <FlagBadge label={isFr ? "Alcool" : "Alcohol"} />}
                  {data.handles_food && <FlagBadge label={isFr ? "Aliments" : "Food"} />}
                  {data.does_construction && <FlagBadge label={isFr ? "Construction" : "Construction"} />}
                  {data.has_professional_order && <FlagBadge label={isFr ? "Ordre pro" : "Prof. order"} />}
                  {data.does_rd && <FlagBadge label="R&D" />}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ SYNCING STATE ═══ */}
          {syncing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-white">
                  {isFr ? "Analyse en cours..." : "Analyzing..."}
                </p>
                <p className="text-xs text-white/30">
                  {isFr ? "Détection des obligations • Calcul des échéances • Recherche de programmes" : "Detecting obligations • Computing deadlines • Finding programs"}
                </p>
              </div>
              {syncResult && (
                <div className="text-center space-y-1 pt-4" style={{ animation: "fadeUp 0.5s ease-out" }}>
                  <p className="text-emerald-400 text-sm font-semibold">
                    ✓ {syncResult.total_matched ?? 0} {isFr ? "obligations détectées" : "obligations detected"}
                  </p>
                  <p className="text-xs text-white/30">
                    {syncResult.overdue ?? 0} {isFr ? "en retard" : "overdue"} · {syncResult.upcoming_30_days ?? 0} {isFr ? "dans 30 jours" : "in 30 days"}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ─── Bottom nav ──────────────────────────────────────────────────── */}
      {!syncing && (
        <div className="fixed bottom-0 inset-x-0 bg-[#0a0e14]/95 backdrop-blur-xl border-t border-white/[0.04]">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/60 transition-colors">
                ← {isFr ? "Retour" : "Back"}
              </button>
            ) : <div />}

            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                {isFr ? "Continuer" : "Continue"} →
              </button>
            ) : (
              <button onClick={handleComplete} disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-all">
                {saving ? "..." : isFr ? "Lancer l'analyse →" : "Launch Analysis →"}
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .input-field {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          font-size: 14px;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: rgba(16,185,129,0.3); }
        .input-field::placeholder { color: rgba(255,255,255,0.15); }
        .input-field option { background: #12161e; color: white; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="text-xs text-white/30 mt-1">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/35 mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  );
}

function ToggleCard({ active, onClick, label, icon }: {
  active: boolean; onClick: () => void; label: string; icon?: string;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-left transition-all ${
        active
          ? "bg-emerald-500/12 text-emerald-400 border border-emerald-500/20"
          : "bg-white/[0.03] text-white/35 border border-transparent hover:bg-white/[0.05]"
      }`}>
      <span className="text-sm">{icon}</span>
      <span className="flex-1">{label}</span>
      {active && <span className="text-emerald-400">✓</span>}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
      <span className="text-xs text-white/30">{label}</span>
      <span className="text-xs text-white/70 font-medium">{value}</span>
    </div>
  );
}

function FlagBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15">
      {label}
    </span>
  );
}
