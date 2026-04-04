// =============================================================================
// app/v2/diagnostic/intake/page.tsx
// Pre-diagnostic intake wizard — collects exact data before running AI analysis.
// Steps: Profile → Financials → Operations → Enterprise (tier-gated) → Documents → Review
// =============================================================================

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { US_STATES, CA_PROVINCES } from "@/lib/country";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntakeData {
  // Step 1 — Profile verify
  business_name: string;
  structure: string;
  province: string;
  country: string;
  industry: string;
  fiscal_year_end_month: number;
  gst_registration_date: string;

  // Step 2 — Exact financials
  exact_annual_revenue: number | null;
  gross_margin_pct: number | null;
  exact_payroll_total: number | null;
  owner_salary: number | null;
  net_income_last_year: number | null;
  ebitda_estimate: number | null;
  total_assets: number | null;
  total_liabilities: number | null;

  // Step 3 — Operations
  has_payroll: boolean;
  employee_count: number;
  has_accountant: boolean;
  has_bookkeeper: boolean;
  uses_payroll_software: boolean;
  does_rd: boolean;
  exports_goods: boolean;
  handles_data: boolean;
  has_physical_location: boolean;
  sells_alcohol: boolean;
  handles_food: boolean;
  does_construction: boolean;
  has_professional_order: boolean;

  // Step 4 — Enterprise extras
  has_holdco: boolean;
  passive_income_over_50k: boolean;
  exit_horizon: string;
  last_tax_review_year: number | null;
  lcge_eligible: boolean | null;
  shareholder_agreements: boolean;
  has_cda_balance: boolean;
  rdtoh_balance: number | null;
  sred_claimed_last_year: number | null;

  // Step 5 — Documents (extracted JSON from Claude)
  doc_t2_data: any;
  doc_financials_data: any;
  doc_gst_data: any;
  doc_t4_data: any;
  doc_bank_data: any;
}

interface DocUploadState {
  uploading: boolean;
  data: any;
  confidence: string;
  fileName: string;
  error: string | null;
}

const EMPTY_DOC: DocUploadState = { uploading: false, data: null, confidence: "", fileName: "", error: null };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (!n) return "";
  return n.toLocaleString("en-CA");
}

function parseNum(s: string): number | null {
  const n = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? null : n;
}

function MoneyInput({ label, labelFr, value, onChange, isFr, hint, hintFr }: {
  label: string; labelFr: string; value: number | null; onChange: (v: number | null) => void;
  isFr: boolean; hint?: string; hintFr?: string;
}) {
  const [raw, setRaw] = useState(value ? fmt(value) : "");
  return (
    <div>
      <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
        {isFr ? labelFr : label}
      </label>
      {(hint || hintFr) && (
        <p className="text-[10px] text-ink-faint mb-1">{isFr ? hintFr : hint}</p>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-xs">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={e => {
            const v = e.target.value.replace(/[^0-9]/g, "");
            setRaw(v ? parseInt(v).toLocaleString("en-CA") : "");
            onChange(v ? parseInt(v) : null);
          }}
          className="w-full pl-7 pr-3 py-2.5 text-sm text-ink bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function Toggle({ label, labelFr, value, onChange, isFr }: {
  label: string; labelFr: string; value: boolean; onChange: (v: boolean) => void; isFr: boolean;
}) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg border text-left transition-all ${
        value ? "bg-brand/5 border-brand/30 text-ink" : "bg-white border-border text-ink-muted"
      }`}>
      <span className="text-xs font-medium">{isFr ? labelFr : label}</span>
      <span className={`w-4 h-4 rounded border flex items-center justify-center text-[9px] font-bold transition-all ${
        value ? "bg-brand border-brand text-white" : "border-border-light"
      }`}>
        {value ? "✓" : ""}
      </span>
    </button>
  );
}

function ConfidenceBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    low: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-semibold uppercase ${colors[level] || colors.medium}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${level === "high" ? "bg-green-500" : level === "medium" ? "bg-yellow-500" : "bg-red-500"}`} />
      {level}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DiagnosticIntakePage() {
  const router = useRouter();
  const { lang, isFR } = useLang();
  const isFr = isFR;
  const t = (en: string, fr: string) => isFr ? fr : en;

  const [step, setStep] = useState(1);
  const [tier, setTier] = useState("solo");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Doc upload states
  const [docs, setDocs] = useState<Record<string, DocUploadState>>({
    t2: { ...EMPTY_DOC },
    financials: { ...EMPTY_DOC },
    gst: { ...EMPTY_DOC },
    t4: { ...EMPTY_DOC },
    bank: { ...EMPTY_DOC },
  });

  const fileRefs = {
    t2: useRef<HTMLInputElement>(null),
    financials: useRef<HTMLInputElement>(null),
    gst: useRef<HTMLInputElement>(null),
    t4: useRef<HTMLInputElement>(null),
    bank: useRef<HTMLInputElement>(null),
  };

  const [data, setData] = useState<IntakeData>({
    business_name: "", structure: "", province: "", country: "", industry: "",
    fiscal_year_end_month: 12, gst_registration_date: "",
    exact_annual_revenue: null, gross_margin_pct: null, exact_payroll_total: null,
    owner_salary: null, net_income_last_year: null, ebitda_estimate: null,
    total_assets: null, total_liabilities: null,
    has_payroll: false, employee_count: 0, has_accountant: false, has_bookkeeper: false,
    uses_payroll_software: false, does_rd: false, exports_goods: false, handles_data: false,
    has_physical_location: false, sells_alcohol: false, handles_food: false,
    does_construction: false, has_professional_order: false,
    has_holdco: false, passive_income_over_50k: false, exit_horizon: "none",
    last_tax_review_year: null, lcge_eligible: null, shareholder_agreements: false,
    has_cda_balance: false, rdtoh_balance: null, sred_claimed_last_year: null,
    doc_t2_data: null, doc_financials_data: null, doc_gst_data: null,
    doc_t4_data: null, doc_bank_data: null,
  });

  // Determine steps based on tier
  const isEnterprise = tier === "enterprise" || tier === "enterprise_plus";
  const isBusiness = isEnterprise || tier === "business" || tier === "growth" || tier === "team";
  const totalSteps = isEnterprise ? 6 : 5;

  // Step labels
  const STEPS = [
    { num: 1, en: "Profile",    fr: "Profil" },
    { num: 2, en: "Financials", fr: "Finances" },
    { num: 3, en: "Operations", fr: "Opérations" },
    ...(isEnterprise ? [{ num: 4, en: "Enterprise", fr: "Entreprise" }] : []),
    { num: isEnterprise ? 5 : 4, en: "Documents",  fr: "Documents" },
    { num: isEnterprise ? 6 : 5, en: "Review",     fr: "Révision" },
  ];

  const DOC_STEP = isEnterprise ? 5 : 4;
  const REVIEW_STEP = isEnterprise ? 6 : 5;

  // ── Load profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        // Get tier from dashboard
        const dashRes = await fetch("/api/v2/dashboard");
        const dashJson = await dashRes.json();
        const dashData = dashJson.data || dashJson;
        const dashTier = dashData.tier || null;
        // Only set enterprise tier if API confirmed it (not just recommended_plan)
        // This prevents solo/business users seeing the LCGE/holdco/RDTOH enterprise step
        if (dashTier && ["solo","business","enterprise","corp"].includes(dashTier)) {
          setTier(dashTier);
        }

        // Get full profile — authoritative source for businessId
        const profileRes = await fetch("/api/v2/diagnostic/intake");
        const profileJson = await profileRes.json();
        if (profileJson.success && profileJson.profile) {
          const p = profileJson.profile;
          // Set businessId directly from profile row
          if (p.business_id) setBusinessId(p.business_id);
          setData(prev => ({
            ...prev,
            business_name:    p.business_name    || "",
            structure:        p.structure        || "",
            province:         p.province         || "",
            country:          p.country          || "CA",
            industry:         p.industry         || "",
            fiscal_year_end_month: p.fiscal_year_end_month || 12,
            gst_registration_date: p.gst_registration_date || "",
            exact_annual_revenue:  p.exact_annual_revenue  || (p.monthly_revenue ? p.monthly_revenue * 12 : null),
            gross_margin_pct:      p.gross_margin_pct      || null,
            exact_payroll_total:   p.exact_payroll_total   || null,
            owner_salary:          p.owner_salary          || null,
            net_income_last_year:  p.net_income_last_year  || null,
            ebitda_estimate:       p.ebitda_estimate       || null,
            total_assets:          p.total_assets          || null,
            total_liabilities:     p.total_liabilities     || null,
            has_payroll:           p.has_payroll           ?? false,
            employee_count:        p.employee_count        ?? 0,
            has_accountant:        p.has_accountant        ?? false,
            has_bookkeeper:        p.has_bookkeeper        ?? false,
            uses_payroll_software: p.uses_payroll_software ?? false,
            does_rd:               p.does_rd              ?? false,
            exports_goods:         p.exports_goods         ?? false,
            handles_data:          p.handles_data          ?? false,
            has_physical_location: p.has_physical_location ?? false,
            sells_alcohol:         p.sells_alcohol         ?? false,
            handles_food:          p.handles_food          ?? false,
            does_construction:     p.does_construction     ?? false,
            has_professional_order:p.has_professional_order ?? false,
            has_holdco:            p.has_holdco            ?? false,
            passive_income_over_50k: p.passive_income_over_50k ?? false,
            exit_horizon:          p.exit_horizon          || "none",
            last_tax_review_year:  p.last_tax_review_year  || null,
            lcge_eligible:         p.lcge_eligible         ?? null,
            shareholder_agreements:p.shareholder_agreements ?? false,
            has_cda_balance:       p.has_cda_balance       ?? false,
            rdtoh_balance:         p.rdtoh_balance         || null,
            sred_claimed_last_year:p.sred_claimed_last_year || null,
            doc_t2_data:           p.doc_t2_data           || null,
            doc_financials_data:   p.doc_financials_data   || null,
            doc_gst_data:          p.doc_gst_data          || null,
            doc_t4_data:           p.doc_t4_data           || null,
            doc_bank_data:         p.doc_bank_data         || null,
          }));

          // Restore previous doc states if data exists
          if (p.doc_t2_data)         setDocs(d => ({ ...d, t2: { ...EMPTY_DOC, data: p.doc_t2_data, confidence: p.doc_t2_data.confidence || "medium", fileName: "Previously uploaded" } }));
          if (p.doc_financials_data) setDocs(d => ({ ...d, financials: { ...EMPTY_DOC, data: p.doc_financials_data, confidence: p.doc_financials_data.confidence || "medium", fileName: "Previously uploaded" } }));
          if (p.doc_gst_data)        setDocs(d => ({ ...d, gst: { ...EMPTY_DOC, data: p.doc_gst_data, confidence: p.doc_gst_data.confidence || "medium", fileName: "Previously uploaded" } }));
          if (p.doc_t4_data)         setDocs(d => ({ ...d, t4: { ...EMPTY_DOC, data: p.doc_t4_data, confidence: p.doc_t4_data.confidence || "medium", fileName: "Previously uploaded" } }));
          if (p.doc_bank_data)       setDocs(d => ({ ...d, bank: { ...EMPTY_DOC, data: p.doc_bank_data, confidence: p.doc_bank_data.confidence || "medium", fileName: "Previously uploaded" } }));
        }
      } catch (e) {
        console.error("intake load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Document upload handler ────────────────────────────────────────────────
  async function handleDocUpload(docType: string, file: File) {
    setDocs(d => ({ ...d, [docType]: { ...EMPTY_DOC, uploading: true } }));

    const form = new FormData();
    form.append("file", file);
    form.append("docType", docType);

    try {
      const res = await fetch("/api/v2/diagnostic/parse-doc", { method: "POST", body: form });
      const json = await res.json();

      if (json.success) {
        const docKey = `doc_${docType}_data` as keyof IntakeData;
        setData(prev => ({ ...prev, [docKey]: json.data }));
        setDocs(d => ({
          ...d,
          [docType]: { uploading: false, data: json.data, confidence: json.confidence, fileName: file.name, error: null }
        }));
      } else {
        setDocs(d => ({ ...d, [docType]: { ...EMPTY_DOC, error: json.error } }));
      }
    } catch (e: any) {
      setDocs(d => ({ ...d, [docType]: { ...EMPTY_DOC, error: e.message } }));
    }
  }

  // ── Save intake + launch diagnostic ───────────────────────────────────────
  async function launchDiagnostic() {
    if (!businessId) { setError("Business not found"); return; }
    if (!data.industry) { setError(t("Please select an industry before launching.", "Veuillez sélectionner une industrie avant de lancer.")); return; }
    if (!data.structure) { setError(t("Please select a legal structure before launching.", "Veuillez sélectionner une structure légale avant de lancer.")); return; }
    setSaving(true);
    setError(null);

    // Client-side 130s timeout — just over Vercel's 120s limit
    const controller = new AbortController();
    const clientTimeout = setTimeout(() => controller.abort(), 300_000); // 5 min — matches Pro plan timeout

    try {
      console.log("[Intake:Launch] Step 1: Saving intake. industry =", data.industry, "businessId =", businessId);
      // Save intake data
      const saveRes = await fetch("/api/v2/diagnostic/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, intakeData: data }),
        signal: controller.signal,
      });
      const saveJson = await saveRes.json();
      console.log("[Intake:Launch] Step 1 result:", JSON.stringify(saveJson).slice(0, 200));
      if (!saveJson.success) throw new Error("Intake save failed: " + (saveJson.error || "unknown"));

      console.log("[Intake:Launch] Step 2: Running diagnostic...");
      // Wait for the diagnostic to complete — Pro plan has 300s timeout
      const runRes = await fetch("/api/v2/diagnostic/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, language: lang }),
        signal: controller.signal,
      });
      const runText = await runRes.text();
      console.log("[Intake:Launch] Step 2 response:", runText.slice(0, 300));
      let runJson;
      try { runJson = JSON.parse(runText); } catch { runJson = null; }

      clearTimeout(clientTimeout);

      if (runJson?.success) {
        router.push("/v2/dashboard");
      } else {
        // Even if it failed, redirect to dashboard — it may have created the report
        // and the dashboard will poll for completion
        console.warn("[Intake:Launch] Diagnostic response:", runJson?.error || runText.slice(0, 200));
        router.push("/v2/dashboard");
      }
    } catch (e: any) {
      clearTimeout(clientTimeout);
      const msg = e?.name === "AbortError"
        ? "The analysis is taking longer than expected. Please try again — your data has been saved."
        : e.message;
      console.error("[Intake:Launch] Error caught:", msg, "| Full error:", e);
      console.error("[Intake:Launch] data.industry =", data.industry, "| data.structure =", data.structure);
      setError(msg);
      setSaving(false);
    }
  }

  // Progress animation during diagnostic run
  useEffect(() => {
    if (!saving) { setProgressStep(0); setProgressPct(0); return; }
    const STEPS_EN = [
      { label: "Saving your intake data…",           labelFR: "Sauvegarde de vos données…",             pct: 8  },
      { label: "Analyzing your financial profile…",  labelFR: "Analyse de votre profil financier…",     pct: 20 },
      { label: "Running 4,273 leak detectors…",      labelFR: "Activation de 4 273 détecteurs…",        pct: 38 },
      { label: "Calculating your health score…",     labelFR: "Calcul de votre score de santé…",        pct: 52 },
      { label: "Matching government programs…",      labelFR: "Recherche de programmes gouvernementaux…",pct: 64 },
      { label: "Identifying recovery opportunities…",       labelFR: "Identification des opportunités de récupération…",     pct: 76 },
      { label: "Building fix recommendations…",      labelFR: "Création des recommandations…",           pct: 88 },
      { label: "Finalizing your report…",            labelFR: "Finalisation de votre rapport…",          pct: 96 },
    ];
    let idx = 0;
    setProgressStep(0);
    setProgressPct(STEPS_EN[0].pct);
    const iv = setInterval(() => {
      idx = Math.min(idx + 1, STEPS_EN.length - 1);
      setProgressStep(idx);
      setProgressPct(STEPS_EN[idx].pct);
      if (idx === STEPS_EN.length - 1) clearInterval(iv);
    }, 15000); // 15s per step × 8 steps = 120s — matches Vercel limit
    return () => clearInterval(iv);
  }, [saving]);

  const PROGRESS_STEPS = [
    { label: "Saving your intake data…",           labelFR: "Sauvegarde de vos données…"             },
    { label: "Analyzing your financial profile…",  labelFR: "Analyse de votre profil financier…"     },
    { label: "Running 4,273 leak detectors…",      labelFR: "Activation de 4 273 détecteurs…"        },
    { label: "Calculating your health score…",     labelFR: "Calcul de votre score de santé…"        },
    { label: "Matching government programs…",      labelFR: "Recherche de programmes gouvernementaux…"},
    { label: "Identifying recovery opportunities…",       labelFR: "Identification des opportunités de récupération…"     },
    { label: "Building fix recommendations…",      labelFR: "Création des recommandations…"           },
    { label: "Finalizing your report…",            labelFR: "Finalisation de votre rapport…"          },
  ];

  // ── Calculate quality score for review step ────────────────────────────────
  function calcQuality(): number {
    let score = 0;
    if (data.exact_annual_revenue)    score += 15;
    if (data.gross_margin_pct)        score += 10;
    if (data.exact_payroll_total || !data.has_payroll) score += 10;
    if (data.net_income_last_year)    score += 10;
    if (data.owner_salary !== null)   score += 5;
    if (data.ebitda_estimate)         score += 5;
    if (data.total_assets)            score += 5;
    if (docs.financials.data)         score += 15;
    if (docs.t2.data)                 score += 15;
    if (docs.gst.data)                score += 5;
    if (docs.t4.data)                 score += 5;
    return Math.min(score, 100);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-border-light bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-ink-faint uppercase font-semibold tracking-wide">{t("AI Diagnostic", "Diagnostic IA")}</p>
            <p className="text-sm font-bold text-ink">{t("Business Intelligence Intake", "Collecte de données d'affaires")}</p>
          </div>
          <button onClick={() => router.push("/v2/diagnostic")}
            className="text-[10px] text-ink-faint hover:text-ink-secondary transition">
            {t("Skip →", "Passer →")}
          </button>
        </div>

        {/* Step progress bar */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-1">
            {STEPS.map((s) => (
              <div key={s.num} className="flex-1">
                <div className={`h-1 rounded-full transition-all ${
                  step >= s.num ? "bg-brand" : "bg-border"
                }`} />
                <p className={`text-[8px] mt-1 font-medium text-center transition-all ${
                  step === s.num ? "text-brand" : step > s.num ? "text-ink-faint" : "text-border"
                }`}>{isFr ? s.fr : s.en}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ══ STEP 1: Profile Verify ══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.25s ease-out" }}>
            <div>
              <h2 className="text-lg font-bold text-ink mb-1">{t("Verify your business profile", "Vérifiez votre profil d'entreprise")}</h2>
              <p className="text-xs text-ink-faint">{t("We pre-filled this from your profile. Correct anything that's wrong.", "Nous avons pré-rempli depuis votre profil. Corrigez ce qui est inexact.")}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{t("Business name", "Nom de l'entreprise")}</label>
                <input value={data.business_name} onChange={e => setData(d => ({ ...d, business_name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20" />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{t("Industry", "Industrie")}</label>
                <select value={data.industry} onChange={e => {
                  const sel = e.target.value;
                  const naicsMap: Record<string, string> = { restaurant:"7225", construction:"236", retail:"441", ecommerce:"4541", consulting:"5416", software_development:"5112", healthcare:"621", salon:"8121", trucking:"484", real_estate:"531", manufacturing:"31-33", accounting:"5412", legal:"5411", marketing:"5418", fitness:"71394", cleaning:"5617", landscaping:"5617", rideshare:"4853", photography:"54192" };
                  setData(d => ({ ...d, industry: sel, industry_naics: naicsMap[sel] || "" }));
                }}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50">
                  <option value="">{t("Select your industry...", "Sélectionnez votre industrie...")}</option>
                  <option value="restaurant">{t("Restaurant / Food Service", "Restaurant / Service alimentaire")}</option>
                  <option value="construction">{t("Construction / Renovation", "Construction / Rénovation")}</option>
                  <option value="retail">{t("Retail", "Commerce de détail")}</option>
                  <option value="ecommerce">{t("E-Commerce", "Commerce en ligne")}</option>
                  <option value="consulting">{t("Consulting / Professional Services", "Consultation / Services professionnels")}</option>
                  <option value="software_development">{t("Software / SaaS / Tech", "Logiciel / SaaS / Tech")}</option>
                  <option value="healthcare">{t("Healthcare / Clinic", "Santé / Clinique")}</option>
                  <option value="salon">{t("Beauty / Salon / Spa", "Beauté / Salon / Spa")}</option>
                  <option value="trucking">{t("Transport / Delivery", "Transport / Livraison")}</option>
                  <option value="real_estate">{t("Real Estate", "Immobilier")}</option>
                  <option value="manufacturing">{t("Manufacturing", "Fabrication")}</option>
                  <option value="accounting">{t("Accounting / Bookkeeping", "Comptabilité / Tenue de livres")}</option>
                  <option value="legal">{t("Legal Services", "Services juridiques")}</option>
                  <option value="marketing">{t("Marketing / Design / Agency", "Marketing / Design / Agence")}</option>
                  <option value="fitness">{t("Fitness / Gym / Coaching", "Fitness / Gym / Coaching")}</option>
                  <option value="cleaning">{t("Cleaning / Janitorial", "Nettoyage / Entretien")}</option>
                  <option value="landscaping">{t("Landscaping", "Aménagement paysager")}</option>
                  <option value="rideshare">{t("Rideshare / Delivery Driver", "Chauffeur / Livreur")}</option>
                  <option value="photography">{t("Photography / Videography", "Photo / Vidéo")}</option>
                  <option value="other">{t("Other", "Autre")}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{t("Legal structure", "Structure légale")}</label>
                <select value={data.structure} onChange={e => setData(d => ({ ...d, structure: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50">
                  <option value="">{t("Select...", "Choisir...")}</option>
                  {data.country === "US" ? (<>
                    <option value="sole_proprietor">Sole Proprietor</option>
                    <option value="llc">LLC (Limited Liability Company)</option>
                    <option value="s_corp">S-Corporation</option>
                    <option value="c_corp">C-Corporation</option>
                    <option value="partnership">Partnership</option>
                    <option value="npo">Non-Profit (501c3)</option>
                  </>) : (<>
                    <option value="sole_proprietor">{t("Sole Proprietor", "Travailleur autonome")}</option>
                    <option value="corporation">{t("Corporation (Inc.)", "Société par actions")}</option>
                    <option value="partnership">{t("Partnership", "Société en nom collectif")}</option>
                    <option value="cooperative">{t("Cooperative", "Coopérative")}</option>
                    <option value="npo">{t("Non-Profit", "OSBL")}</option>
                  </>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{data.country === "US" ? "State" : t("Province", "Province")}</label>
                <select value={data.province} onChange={e => setData(d => ({ ...d, province: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50">
                  <option value="">{t("Select...", "Sélectionner...")}</option>
                  {(data.country === "US" ? US_STATES : CA_PROVINCES).map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{t("Fiscal year end (month)", "Fin d'exercice (mois)")}</label>
                <select value={data.fiscal_year_end_month} onChange={e => setData(d => ({ ...d, fiscal_year_end_month: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50">
                  {["January","February","March","April","May","June","July","August","September","October","November","December"]
                    .map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{data.country === "US" ? "Sales Tax Registration Date" : t("GST/HST registration date", "Date d'inscription TPS/TVQ")}</label>
                <input type="date" value={data.gst_registration_date} onChange={e => setData(d => ({ ...d, gst_registration_date: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50" />
                <p className="text-[9px] text-ink-faint mt-1">{t("Leave blank if unknown", "Laisser vide si inconnu")}</p>
              </div>
              {data.province === "QC" && data.country !== "US" && (
                <div>
                  <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{t("QST registration date", "Date d'inscription TVQ")}</label>
                  <input type="date" value={(data as any).qst_registration_date || ""} onChange={e => setData(d => ({ ...d, qst_registration_date: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50" />
                </div>
              )}
            </div>

            {/* Warning if no structure */}
            {!data.structure && (
              <div className="flex gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-amber-500 text-sm">⚠</span>
                <p className="text-[11px] text-amber-700">{t("Legal structure affects your biggest findings (tax drag, entity optimization, R&D credit eligibility).", "La structure légale affecte vos plus grandes économies potentielles.")}</p>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 2: Exact Financials ════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.25s ease-out" }}>
            <div>
              <h2 className="text-lg font-bold text-ink mb-1">{t("Exact financial figures", "Chiffres financiers exacts")}</h2>
              <p className="text-xs text-ink-faint">{t("The more precise your numbers, the more accurate your findings — down to the dollar.", "Plus vos chiffres sont précis, plus vos constats seront exacts — au dollar près.")}</p>
            </div>

            {/* Revenue */}
            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Revenue", "Revenus")}</h3>
              <MoneyInput label="Annual revenue (last full year)" labelFr="Revenus annuels (dernière année complète)"
                value={data.exact_annual_revenue} onChange={v => setData(d => ({ ...d, exact_annual_revenue: v }))} isFr={isFr}
                hint="Exact figure from your financial statements or tax return"
                hintFr="Chiffre exact de vos états financiers ou déclaration fiscale" />
              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                  {t("Gross margin %", "Marge brute %")}
                </label>
                <p className="text-[10px] text-ink-faint mb-1">{t("(Revenue − COGS) ÷ Revenue × 100", "(Revenus − CMV) ÷ Revenus × 100")}</p>
                <input type="number" min="0" max="100" step="0.5"
                  value={data.gross_margin_pct ?? ""} onChange={e => setData(d => ({ ...d, gross_margin_pct: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
                  placeholder="e.g. 42" />
              </div>
            </div>

            {/* Profitability */}
            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Profitability", "Rentabilité")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <MoneyInput label="Net income (last year)" labelFr="Revenu net (dernière année)"
                  value={data.net_income_last_year} onChange={v => setData(d => ({ ...d, net_income_last_year: v }))} isFr={isFr} />
                <MoneyInput label="EBITDA (if known)" labelFr="BAIIA (si connu)"
                  value={data.ebitda_estimate} onChange={v => setData(d => ({ ...d, ebitda_estimate: v }))} isFr={isFr} />
              </div>
            </div>

            {/* Payroll */}
            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Payroll & Compensation", "Masse salariale et rémunération")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <MoneyInput label="Total payroll (all employees)" labelFr="Masse salariale totale (tous employés)"
                  value={data.exact_payroll_total} onChange={v => setData(d => ({ ...d, exact_payroll_total: v }))} isFr={isFr} />
                <MoneyInput label="Your own salary / dividends" labelFr="Votre salaire / dividendes"
                  value={data.owner_salary} onChange={v => setData(d => ({ ...d, owner_salary: v }))} isFr={isFr} />
              </div>
            </div>

            {/* Balance sheet */}
            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Balance Sheet (optional)", "Bilan (facultatif)")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <MoneyInput label="Total assets" labelFr="Total de l'actif"
                  value={data.total_assets} onChange={v => setData(d => ({ ...d, total_assets: v }))} isFr={isFr} />
                <MoneyInput label="Total liabilities" labelFr="Total du passif"
                  value={data.total_liabilities} onChange={v => setData(d => ({ ...d, total_liabilities: v }))} isFr={isFr} />
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3: Operations ══════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.25s ease-out" }}>
            <div>
              <h2 className="text-lg font-bold text-ink mb-1">{t("Operations & activities", "Opérations et activités")}</h2>
              <p className="text-xs text-ink-faint">{t("These flags determine which deductions, credits, and programs apply to you.", "Ces indicateurs déterminent quelles déductions, crédits et programmes s'appliquent.")}</p>
            </div>

            {/* Employees */}
            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("People", "Personnel")}</h3>
              <Toggle label="Has employees on payroll" labelFr="A des employés à la paie"
                value={data.has_payroll} onChange={v => setData(d => ({ ...d, has_payroll: v }))} isFr={isFr} />
              {data.has_payroll && (
                <div>
                  <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{t("Number of employees", "Nombre d'employés")}</label>
                  <input type="number" min="0" value={data.employee_count}
                    onChange={e => setData(d => ({ ...d, employee_count: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20" />
                </div>
              )}
              {data.has_payroll && (
                <Toggle label="Uses payroll software (Wagepoint, Payroll Hero, etc.)" labelFr="Utilise un logiciel de paie"
                  value={data.uses_payroll_software} onChange={v => setData(d => ({ ...d, uses_payroll_software: v }))} isFr={isFr} />
              )}
            </div>

            {/* Advisors */}
            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Financial advisors", "Conseillers financiers")}</h3>
              <Toggle label="Has a CPA / accountant" labelFr="A un comptable CPA"
                value={data.has_accountant} onChange={v => setData(d => ({ ...d, has_accountant: v }))} isFr={isFr} />
              <Toggle label="Has a bookkeeper" labelFr="A un teneur de livres"
                value={data.has_bookkeeper} onChange={v => setData(d => ({ ...d, has_bookkeeper: v }))} isFr={isFr} />
            </div>

            {/* Quebec-specific compliance */}
            {data.province === "QC" && data.country !== "US" && (
              <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
                <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Quebec compliance", "Conformité québécoise")}</h3>
                <Toggle label="Registered with CNESST (workers comp)" labelFr="Inscrit à la CNESST"
                  value={(data as any).has_cnesst} onChange={v => setData(d => ({ ...d, has_cnesst: v }))} isFr={isFr} />
                <Toggle label="Compliant with Law 25 (privacy)" labelFr="Conforme à la Loi 25 (vie privée)"
                  value={(data as any).has_law25} onChange={v => setData(d => ({ ...d, has_law25: v }))} isFr={isFr} />
              </div>
            )}

            {/* Business activities */}
            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Business activities", "Activités commerciales")}</h3>
              <div className="grid grid-cols-1 gap-2">
                <Toggle label="Conducts R&D or innovation activities (R&D credit eligible)" labelFr="Fait de la R&D ou des activités d'innovation (RS&DE)"
                  value={data.does_rd} onChange={v => setData(d => ({ ...d, does_rd: v }))} isFr={isFr} />
                <Toggle label={data.country === "US" ? "Exports goods or services outside the United States" : "Exports goods or services outside Canada"} labelFr="Exporte des biens ou services hors Canada"
                  value={data.exports_goods} onChange={v => setData(d => ({ ...d, exports_goods: v }))} isFr={isFr} />
                <Toggle label="Collects or stores customer personal data" labelFr="Collecte ou stocke des données personnelles clients"
                  value={data.handles_data} onChange={v => setData(d => ({ ...d, handles_data: v }))} isFr={isFr} />
                <Toggle label="Has a physical commercial location" labelFr="A un emplacement commercial physique"
                  value={data.has_physical_location} onChange={v => setData(d => ({ ...d, has_physical_location: v }))} isFr={isFr} />
                <Toggle label="Sells or serves alcohol" labelFr="Vend ou sert de l'alcool"
                  value={data.sells_alcohol} onChange={v => setData(d => ({ ...d, sells_alcohol: v }))} isFr={isFr} />
                <Toggle label="Handles or prepares food" labelFr="Manipule ou prépare des aliments"
                  value={data.handles_food} onChange={v => setData(d => ({ ...d, handles_food: v }))} isFr={isFr} />
                <Toggle label="Does construction, renovation, or trades work" labelFr="Fait de la construction ou des travaux"
                  value={data.does_construction} onChange={v => setData(d => ({ ...d, does_construction: v }))} isFr={isFr} />
                <Toggle label="Is a member of a professional order (doctors, lawyers, engineers, etc.)" labelFr="Membre d'un ordre professionnel"
                  value={data.has_professional_order} onChange={v => setData(d => ({ ...d, has_professional_order: v }))} isFr={isFr} />
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 4: Enterprise Extras (gated) ══════════════════════════════ */}
        {step === 4 && isEnterprise && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.25s ease-out" }}>
            <div>
              <h2 className="text-lg font-bold text-ink mb-1">{t("Enterprise structure", "Structure d'entreprise")}</h2>
              <p className="text-xs text-ink-faint">{data.country === "US" ? "These fields unlock enterprise-level findings — exit planning, QSBS, entity structure, holding company strategies." : t("These fields unlock enterprise-level findings — exit planning, LCGE, RDTOH, holdco strategies.", "Ces champs permettent des constats de niveau entreprise — planification de sortie, ECGC, IMRTD, stratégies de société de portefeuille.")}</p>
            </div>

            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Corporate structure", "Structure corporative")}</h3>
              <Toggle label="Has a holding company (Holdco / Opco structure)" labelFr="A une société de portefeuille (Holdco / Opco)"
                value={data.has_holdco} onChange={v => setData(d => ({ ...d, has_holdco: v }))} isFr={isFr} />
              <Toggle label="Passive investment income exceeds $50,000/year" labelFr="Revenus de placement passifs dépassent 50 000 $/an"
                value={data.passive_income_over_50k} onChange={v => setData(d => ({ ...d, passive_income_over_50k: v }))} isFr={isFr} />
              <Toggle label="Has shareholder agreements in place" labelFr="A des conventions entre actionnaires"
                value={data.shareholder_agreements} onChange={v => setData(d => ({ ...d, shareholder_agreements: v }))} isFr={isFr} />
              {data.country === "CA" && <Toggle label="Has a Capital Dividend Account (CDA) balance" labelFr="A un compte de dividende en capital (CDC)"
                value={data.has_cda_balance} onChange={v => setData(d => ({ ...d, has_cda_balance: v }))} isFr={isFr} />}
              {data.country === "US" && <Toggle label="Currently structured as S-Corp (vs C-Corp or LLC)" labelFr="Actuellement structuré en S-Corp"
                value={(data as any).is_scorp ?? false} onChange={v => setData(d => ({ ...d, is_scorp: v } as any))} isFr={isFr} />}
              {data.country === "US" && <Toggle label="Has accumulated retained earnings / E&P over $250K" labelFr="Bénéfices non répartis accumulés > 250K$"
                value={(data as any).has_accumulated_ep ?? false} onChange={v => setData(d => ({ ...d, has_accumulated_ep: v } as any))} isFr={isFr} />}
            </div>

            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Exit planning", "Planification de sortie")}</h3>
              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-2">{t("Exit horizon", "Horizon de sortie")}</label>
                <div className="grid grid-cols-4 gap-2">
                  {[["1yr", "< 1 year", "< 1 an"],["3yr","1–3 years","1–3 ans"],["5yr","3–5 years","3–5 ans"],["none","Not planned","Non planifié"]].map(([v,en,fr]) => (
                    <button key={v} type="button" onClick={() => setData(d => ({ ...d, exit_horizon: v }))}
                      className={`px-2 py-2 rounded-lg text-[10px] font-semibold border text-center transition-all ${
                        data.exit_horizon === v ? "bg-brand text-white border-brand" : "bg-white text-ink-muted border-border hover:border-brand/30"
                      }`}>
                      {isFr ? fr : en}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                  {data.country === "US" ? "Eligible for QSBS? (Section 1202 Qualified Small Business Stock — up to $10M exclusion)" : t("Eligible for LCGE? (Lifetime Capital Gains Exemption — $1.016M)", "Admissible à l'ECGC? (Exonération cumulative des gains en capital — 1,016 M$)")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[["true","Yes","Oui"],["false","No","Non"],["null","Unknown","Inconnu"]].map(([v,en,fr]) => (
                    <button key={v} type="button" onClick={() => setData(d => ({ ...d, lcge_eligible: v === "null" ? null : v === "true" }))}
                      className={`py-2 rounded-lg text-[10px] font-semibold border transition-all ${
                        String(data.lcge_eligible) === v ? "bg-brand text-white border-brand" : "bg-white text-ink-muted border-border"
                      }`}>
                      {isFr ? fr : en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <h3 className="text-[11px] font-bold text-ink uppercase tracking-wide">{t("Tax history", "Historique fiscal")}</h3>
              <div>
                <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{t("Last year a full tax review was done", "Dernière année d'une révision fiscale complète")}</label>
                <input type="number" min="2015" max={new Date().getFullYear()} value={data.last_tax_review_year ?? ""}
                  onChange={e => setData(d => ({ ...d, last_tax_review_year: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20"
                  placeholder="e.g. 2022" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MoneyInput label={data.country === "US" ? "R&D credit claimed last year (Section 41)" : "SR&ED credit claimed last year"} labelFr="Crédit RS&DE réclamé l'an dernier"
                  value={data.sred_claimed_last_year} onChange={v => setData(d => ({ ...d, sred_claimed_last_year: v }))} isFr={isFr} />
                {data.country === "CA" && <MoneyInput label="RDTOH balance" labelFr="Solde IMRTD"
                  value={data.rdtoh_balance} onChange={v => setData(d => ({ ...d, rdtoh_balance: v }))} isFr={isFr} />}
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 5 (or 4 for non-enterprise): Documents ═══════════════════ */}
        {step === DOC_STEP && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.25s ease-out" }}>
            <div>
              <h2 className="text-lg font-bold text-ink mb-1">{t("Upload your documents", "Téléversez vos documents")}</h2>
              <p className="text-xs text-ink-faint">{t("Claude reads your documents and extracts the exact numbers. All documents are optional — more = better accuracy.", "Claude lit vos documents et extrait les chiffres exacts. Tous les documents sont facultatifs — plus = meilleure précision.")}</p>
            </div>

            {/* Quality indicator */}
            {(() => {
              const q = calcQuality();
              return (
                <div className="flex items-center gap-3 px-4 py-3 bg-white border border-border-light rounded-xl">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#E8E6E1" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke={q >= 70 ? "#2D7A50" : q >= 40 ? "#C4841D" : "#B34040"}
                        strokeWidth="4" strokeLinecap="round" strokeDasharray={`${q * 1.257} 125.7`}
                        style={{ transition: "stroke-dasharray 0.5s ease" }} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-ink">{q}%</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-ink">{t("Data quality score", "Score de qualité des données")}</p>
                    <p className="text-[10px] text-ink-faint">
                      {q >= 80 ? t("Excellent — precise findings guaranteed", "Excellent — constats précis garantis")
                        : q >= 50 ? t("Good — upload financials for better accuracy", "Bien — téléversez les états financiers pour plus de précision")
                        : t("Upload documents to unlock precise dollar figures", "Téléversez des documents pour des chiffres exacts")}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Document upload cards */}
            {[
              {
                key: "financials",
                title: t("Financial Statements", "États financiers"),
                subtitle: t("Notice to Reader, Review Engagement, or Audited Financials", "Avis au lecteur, mission d'examen, ou vérification"),
                impact: t("Revenue, COGS, EBITDA, net income, assets/liabilities", "Revenus, CMV, BAIIA, revenu net, actif/passif"),
                priority: t("Highest impact", "Impact le plus élevé"),
              },
              {
                key: "t2",
                title: data.country === "US" ? "Corporate Tax Return (Form 1120 / 1120-S)" : t("Corporate Tax Return (T2)", "Déclaration de revenus T2"),
                subtitle: data.country === "US" ? "Last filed Form 1120 or 1120-S" : t("Last filed T2 (corporations only)", "Dernier T2 produit (sociétés par actions seulement)"),
                impact: t("Taxable income, entity structure, R&D credits", "Revenu imposable, DPE, IMRTD, CDC, crédits RS&DE"),
                priority: t("Highest impact", "Impact le plus élevé"),
              },
              {
                key: "gst",
                title: data.country === "US"
                  ? "Sales Tax / Payroll Return (State Sales Tax, Form 941)"
                  : t("Sales Tax Return (GST34)", "Déclaration TPS/TVQ (GST34)"),
                subtitle: data.country === "US"
                  ? "Most recent state sales tax or quarterly payroll filing"
                  : t("Most recent sales tax filing", "Dernière déclaration TPS/TVQ"),
                impact: data.country === "US"
                  ? "Sales tax collected, payroll deposits, FUTA status"
                  : t("Total sales, ITC claims, quick method check", "Ventes totales, CTI, vérification méthode rapide"),
                priority: t("High impact", "Impact élevé"),
              },
              {
                key: "t4",
                title: data.country === "US" ? "W-2 / Payroll Summary" : t("T4 Summary", "Sommaire T4"),
                subtitle: t("Employer payroll summary (if you have employees)", "Sommaire de la paie employeur (si vous avez des employés)"),
                impact: data.country === "US" ? "Payroll totals, FICA optimization, WOTC eligibility" : t("Payroll totals, CPP/EI optimization, EHT exposure", "Masse salariale, optimisation RPC/AE, exposition ISE"),
                priority: t("Medium impact", "Impact moyen"),
              },
              {
                key: "bank",
                title: t("Bank Statements (last 3 months)", "Relevés bancaires (3 derniers mois)"),
                subtitle: t("Business chequing account", "Compte chèque d'entreprise"),
                impact: t("Revenue patterns, expense categories, cash flow", "Tendances revenus, catégories dépenses, flux de trésorerie"),
                priority: t("Medium impact", "Impact moyen"),
              },
            ].map(({ key, title, subtitle, impact, priority }) => {
              const docState = docs[key];
              const ref = fileRefs[key as keyof typeof fileRefs];
              const hasData = !!docState.data;
              return (
                <div key={key} className={`bg-white border rounded-xl p-4 transition-all ${
                  hasData ? "border-green-200 bg-green-50/30" : "border-border-light"
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[12px] font-bold text-ink">{title}</p>
                        {hasData && <ConfidenceBadge level={docState.confidence} />}
                        {(priority.includes("Highest") || priority.includes("plus élevé")) && !hasData && (
                          <span className="text-[9px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full">{priority}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-ink-faint mb-1">{subtitle}</p>
                      <p className="text-[10px] text-ink-secondary">→ {impact}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {hasData ? (
                        <button type="button" onClick={() => ref.current?.click()}
                          className="text-[10px] text-ink-faint hover:text-ink border border-border-light rounded-lg px-2 py-1.5 transition">
                          {t("Replace", "Remplacer")}
                        </button>
                      ) : (
                        <button type="button" onClick={() => ref.current?.click()}
                          disabled={docState.uploading}
                          className="px-3 py-1.5 rounded-lg bg-brand text-white text-[10px] font-semibold hover:opacity-90 transition disabled:opacity-50">
                          {docState.uploading ? t("Reading...", "Lecture...") : t("Upload", "Téléverser")}
                        </button>
                      )}
                      <input ref={ref} type="file" accept=".pdf,image/*" className="hidden"
                        onChange={e => { if (e.target.files?.[0]) handleDocUpload(key, e.target.files[0]); }} />
                    </div>
                  </div>

                  {/* Uploading spinner */}
                  {docState.uploading && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border border-brand border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] text-ink-faint">{t("Claude is reading your document...", "Claude lit votre document...")}</p>
                    </div>
                  )}

                  {/* Error */}
                  {docState.error && (
                    <div className="mt-2 px-2 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-[10px] text-red-600">{docState.error}</p>
                    </div>
                  )}

                  {/* Extracted data preview */}
                  {hasData && !docState.uploading && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-[9px] text-green-700 font-semibold uppercase mb-2">
                        ✓ {t("Extracted from", "Extrait de")} {docState.fileName}
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {Object.entries(docState.data)
                          .filter(([k, v]) => v !== null && v !== undefined && !["confidence","notes","largest_recurring_expenses"].includes(k))
                          .slice(0, 6)
                          .map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-[9px] text-ink-faint capitalize">{k.replace(/_/g," ")}</span>
                              <span className="text-[9px] font-semibold text-ink">
                                {typeof v === "number" ? (k.includes("pct") || k.includes("margin") ? `${v}%` : `$${v.toLocaleString()}`) : String(v)}
                              </span>
                            </div>
                          ))}
                      </div>
                      {docState.data.notes && (
                        <p className="text-[9px] text-amber-600 mt-2">{docState.data.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ STEP 6 (or 5): Review & Launch ═════════════════════════════════ */}
        {step === REVIEW_STEP && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.25s ease-out" }}>
            <div>
              <h2 className="text-lg font-bold text-ink mb-1">{t("Review & launch", "Révision et lancement")}</h2>
              <p className="text-xs text-ink-faint">{t("Here's what Claude will analyze. Everything looks accurate? Launch your diagnostic.", "Voici ce que Claude analysera. Tout semble exact? Lancez votre diagnostic.")}</p>
            </div>

            {/* Quality score */}
            {(() => {
              const q = calcQuality();
              return (
                <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border ${
                  q >= 70 ? "bg-green-50 border-green-200" : q >= 40 ? "bg-amber-50 border-amber-200" : "bg-white border-border"
                }`}>
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="5" />
                      <circle cx="28" cy="28" r="24" fill="none" stroke={q >= 70 ? "#2D7A50" : q >= 40 ? "#C4841D" : "#B34040"}
                        strokeWidth="5" strokeLinecap="round" strokeDasharray={`${q * 1.508} 150.8`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-ink">{q}%</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">{t("Data quality:", "Qualité des données:")} {
                      q >= 80 ? t("Excellent", "Excellente") : q >= 60 ? t("Good", "Bonne") : q >= 40 ? t("Fair", "Acceptable") : t("Minimal", "Minimale")
                    }</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">{
                      q >= 70
                        ? t("Precise dollar findings guaranteed", "Constats précis en dollars garantis")
                        : t("Findings will be estimates — upload documents for exact numbers", "Les constats seront des estimations — téléversez des documents pour des chiffres exacts")
                    }</p>
                  </div>
                </div>
              );
            })()}

            {/* Summary of what was collected */}
            <div className="bg-white border border-border-light rounded-xl divide-y divide-border-light overflow-hidden">
              {[
                { label: t("Business", "Entreprise"), value: `${data.business_name} • ${data.structure} • ${data.province}` },
                { label: t("Industry", "Industrie"), value: data.industry ? data.industry.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : t("Not selected", "Non sélectionnée") },
                { label: t("Annual revenue", "Revenus annuels"), value: data.exact_annual_revenue ? `$${data.exact_annual_revenue.toLocaleString()}` : t("Estimate only", "Estimation seulement") },
                { label: t("Net income", "Revenu net"), value: data.net_income_last_year ? `$${data.net_income_last_year.toLocaleString()}` : "—" },
                { label: t("EBITDA", "BAIIA"), value: data.ebitda_estimate ? `$${data.ebitda_estimate.toLocaleString()}` : "—" },
                { label: t("Gross margin", "Marge brute"), value: data.gross_margin_pct ? `${data.gross_margin_pct}%` : "—" },
                { label: t("Payroll", "Masse salariale"), value: data.exact_payroll_total ? `$${data.exact_payroll_total.toLocaleString()}` : (!data.has_payroll ? t("No employees", "Aucun employé") : "—") },
                { label: t("Documents uploaded", "Documents téléversés"), value: Object.values(docs).filter((d: any) => d.data).length + t(" / 5 documents", " / 5 documents") },
                ...(isEnterprise ? [{ label: t("Exit horizon", "Horizon de sortie"), value: data.exit_horizon }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-[11px] text-ink-faint">{label}</span>
                  <span className="text-[11px] font-semibold text-ink text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>

            {/* Docs uploaded list */}
            {Object.values(docs).some((d: any) => d.data) && (
              <div className="bg-white border border-border-light rounded-xl p-4">
                <p className="text-[10px] font-bold text-ink uppercase mb-2">{t("Documents read by Claude", "Documents lus par Claude")}</p>
                <div className="space-y-1">
                  {[["t2", data.country === "US" ? "Form 1120 / 1120-S" : "T2 Corporate Return"],["financials","Financial Statements"],["gst", data.country === "US" ? "State Sales Tax / Form 941" : "GST/HST Return"],["t4", data.country === "US" ? "W-2 Summary" : "T4 Summary"],["bank","Bank Statements"]].map(([k,label]) =>
                    docs[k].data ? (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-[10px] text-ink-muted">✓ {label}</span>
                        <ConfidenceBadge level={docs[k].confidence} />
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-700 font-semibold">{error}</p>
              </div>
            )}

            {/* Progress overlay during analysis */}
            {saving && (
              <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm">
                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-brand rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
                </div>

                {/* Current step */}
                <p className="text-sm font-semibold text-ink mb-1">
                  {isFr ? PROGRESS_STEPS[progressStep]?.labelFR : PROGRESS_STEPS[progressStep]?.label}
                </p>
                <p className="text-[11px] text-ink-faint mb-4">{progressPct}% complete</p>

                {/* Step checklist */}
                <div className="space-y-2">
                  {PROGRESS_STEPS.slice(0, progressStep + 1).map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${i < progressStep ? "bg-brand" : "bg-brand/20 animate-pulse"}`}>
                        {i < progressStep ? (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                        )}
                      </div>
                      <span className={`text-[11px] ${i < progressStep ? "text-ink-faint line-through" : "text-ink font-medium"}`}>
                        {isFr ? s.labelFR : s.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-ink-faint mt-4 text-center">Analysis takes 60–120 seconds. Your data has been saved.</p>
              </div>
            )}

            {/* Launch button */}
            {!saving && (
              <button onClick={launchDiagnostic} disabled={saving}
                className="w-full py-4 rounded-xl bg-brand text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-60 shadow-lg shadow-brand/20">
                {isFr ? "Lancer le diagnostic →" : "Launch Diagnostic →"}
              </button>
            )}
            <p className="text-center text-[10px] text-ink-faint">
              {t("Analysis takes 60–120 seconds", "L'analyse prend 60–120 secondes")}
            </p>
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        {step < REVIEW_STEP && (
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 rounded-lg border border-border text-ink-muted text-sm font-medium hover:border-brand/30 hover:text-ink transition">
                ← {t("Back", "Retour")}
              </button>
            ) : <div />}
            <button
              onClick={() => {
                // Step 1 validation: require industry and structure
                if (step === 1) {
                  if (!data.industry) {
                    alert(t("Please select your industry before continuing.", "Veuillez sélectionner votre industrie avant de continuer."));
                    return;
                  }
                  if (!data.structure) {
                    alert(t("Please select your legal structure before continuing.", "Veuillez sélectionner votre structure légale avant de continuer."));
                    return;
                  }
                }
                // Step 2 validation: require revenue
                if (step === 2 && !data.exact_annual_revenue) {
                  alert(t("Please enter your annual revenue before continuing.", "Veuillez entrer votre revenu annuel avant de continuer."));
                  return;
                }
                // Auto-skip enterprise step if not enterprise
                if (step === 3 && !isEnterprise) {
                  setStep(DOC_STEP);
                } else {
                  setStep(s => s + 1);
                }
              }}
              className="px-6 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:opacity-90 transition shadow-sm shadow-brand/20">
              {t("Continue", "Continuer")} →
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}