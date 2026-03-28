// =============================================================================
// src/app/v2/settings/page.tsx
// =============================================================================
// Unified settings page with tabs:
//   1. Profile — business info, industry, structure, province, city
//   2. Key Dates — all anchor dates for deadline engine
//   3. Notifications — email/in-app prefs, frequency, quiet hours
//   4. Language & Display — FR/EN, timezone
//   5. Billing — current plan, usage, Stripe portal link
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  business_name: string;
  industry: string;
  structure: string;
  province: string;
  city: string;
  monthly_revenue: string;
  employee_count: string;
  fiscal_year_end_month: string;
  has_payroll: boolean;
  handles_data: boolean;
  has_physical_location: boolean;
  sells_alcohol: boolean;
  handles_food: boolean;
  does_construction: boolean;
  has_professional_order: boolean;
  exports_goods: boolean;
  does_rd: boolean;
  has_accountant: boolean;
  has_bookkeeper: boolean;
  uses_payroll_software: boolean;
  uses_pos: boolean;
}

interface DatesData {
  incorporation_date: string;
  registration_date: string;
  gst_registration_date: string;
  qst_registration_date: string;
  first_employee_date: string;
  licence_renewal_date: string;
  insurance_renewal_date: string;
  lease_start_date: string;
  lease_end_date: string;
}

interface NotifPrefs {
  email_enabled: boolean;
  in_app_enabled: boolean;
  email_frequency: string;
  quiet_start_hour: number;
  quiet_end_hour: number;
  timezone: string;
  min_urgency_email: string;
}

interface BillingData {
  plan: string;
  status: string;
  current_period_end: string;
  diagnostics_used: number;
  diagnostics_limit: number;
  stripe_customer_id: string | null;
}

type Tab = "profile" | "dates" | "notifications" | "language" | "billing";

// ─── Constants ────────────────────────────────────────────────────────────────

const STRUCTURES = [
  { value: "sole_proprietor", en: "Sole Proprietor", fr: "Travailleur autonome" },
  { value: "corporation", en: "Corporation (Inc.)", fr: "Société par actions (Inc.)" },
  { value: "partnership", en: "Partnership", fr: "Société en nom collectif" },
  { value: "cooperative", en: "Cooperative", fr: "Coopérative" },
  { value: "npo", en: "Non-Profit", fr: "Organisme sans but lucratif" },
];

const PROVINCES = [
  { value: "QC", en: "Quebec", fr: "Québec" },
  { value: "ON", en: "Ontario", fr: "Ontario" },
  { value: "BC", en: "British Columbia", fr: "Colombie-Britannique" },
  { value: "AB", en: "Alberta", fr: "Alberta" },
  { value: "MB", en: "Manitoba", fr: "Manitoba" },
  { value: "SK", en: "Saskatchewan", fr: "Saskatchewan" },
  { value: "NS", en: "Nova Scotia", fr: "Nouvelle-Écosse" },
  { value: "NB", en: "New Brunswick", fr: "Nouveau-Brunswick" },
  { value: "PE", en: "Prince Edward Island", fr: "Île-du-Prince-Édouard" },
  { value: "NL", en: "Newfoundland & Labrador", fr: "Terre-Neuve-et-Labrador" },
];

const MONTHS = [
  { value: "1", en: "January", fr: "Janvier" }, { value: "2", en: "February", fr: "Février" },
  { value: "3", en: "March", fr: "Mars" }, { value: "4", en: "April", fr: "Avril" },
  { value: "5", en: "May", fr: "Mai" }, { value: "6", en: "June", fr: "Juin" },
  { value: "7", en: "July", fr: "Juillet" }, { value: "8", en: "August", fr: "Août" },
  { value: "9", en: "September", fr: "Septembre" }, { value: "10", en: "October", fr: "Octobre" },
  { value: "11", en: "November", fr: "Novembre" }, { value: "12", en: "December", fr: "Décembre" },
];

const INDUSTRIES = [
  { value: "restaurant", en: "Restaurant / Food Service", fr: "Restaurant / Service alimentaire" },
  { value: "construction", en: "Construction / Renovation", fr: "Construction / Rénovation" },
  { value: "retail", en: "Retail", fr: "Commerce de détail" },
  { value: "ecommerce", en: "E-Commerce", fr: "Commerce en ligne" },
  { value: "consulting", en: "Consulting / Professional", fr: "Consultation / Professionnel" },
  { value: "software_development", en: "Software / SaaS / Tech", fr: "Logiciel / SaaS / Tech" },
  { value: "healthcare", en: "Healthcare / Clinic", fr: "Santé / Clinique" },
  { value: "salon", en: "Beauty / Salon / Spa", fr: "Beauté / Salon / Spa" },
  { value: "trucking", en: "Transport / Delivery", fr: "Transport / Livraison" },
  { value: "real_estate", en: "Real Estate", fr: "Immobilier" },
  { value: "manufacturing", en: "Manufacturing", fr: "Fabrication" },
  { value: "accounting", en: "Accounting", fr: "Comptabilité" },
  { value: "legal", en: "Legal", fr: "Services juridiques" },
  { value: "marketing", en: "Marketing / Agency", fr: "Marketing / Agence" },
  { value: "fitness", en: "Fitness / Coaching", fr: "Fitness / Coaching" },
  { value: "cleaning", en: "Cleaning", fr: "Nettoyage" },
  { value: "landscaping", en: "Landscaping", fr: "Aménagement paysager" },
  { value: "rideshare", en: "Rideshare / Delivery Driver", fr: "Chauffeur / Livreur" },
  { value: "photography", en: "Photography / Video", fr: "Photo / Vidéo" },
  { value: "other", en: "Other", fr: "Autre" },
];

const TIMEZONES = [
  { value: "America/St_Johns", label: "Newfoundland (UTC-3:30)" },
  { value: "America/Halifax", label: "Atlantic (UTC-4)" },
  { value: "America/Montreal", label: "Eastern (UTC-5)" },
  { value: "America/Toronto", label: "Eastern — Toronto (UTC-5)" },
  { value: "America/Winnipeg", label: "Central (UTC-6)" },
  { value: "America/Edmonton", label: "Mountain (UTC-7)" },
  { value: "America/Vancouver", label: "Pacific (UTC-8)" },
];

const EMAIL_FREQ = [
  { value: "realtime", en: "Every notification", fr: "Chaque notification" },
  { value: "smart", en: "Smart — critical immediately, others batched", fr: "Intelligent — critiques immédiat, autres groupés" },
  { value: "daily", en: "Daily digest", fr: "Résumé quotidien" },
  { value: "weekly", en: "Weekly digest only", fr: "Résumé hebdomadaire seulement" },
  { value: "none", en: "No emails (in-app only)", fr: "Aucun courriel (in-app seulement)" },
];

const URGENCY_LEVELS = [
  { value: "info", en: "All (including info)", fr: "Tout (incluant info)" },
  { value: "warning", en: "Warnings and above", fr: "Avertissements et plus" },
  { value: "critical", en: "Critical only", fr: "Critiques seulement" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    if (deleteInput !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/v2/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (res.ok) { router.push("/?deleted=1"); }
      else { const d = await res.json(); setDeleteError(d.error || "Deletion failed — contact privacy@fruxal.ca"); }
    } catch { setDeleteError("Deletion failed — contact privacy@fruxal.ca"); }
    setDeleting(false);
  }

  const [tab, setTab] = useState<Tab>("profile");
  const { lang, setLang, t, isFR } = useLang();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [dates, setDates] = useState<DatesData | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs | null>(null);
  const [billing, setBilling] = useState<BillingData | null>(null);

  const isFr = lang === "fr";

  // ─── Load all settings ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/v2/settings");
        const json = await res.json();
        if (json.success) {
          // If no profile yet (new user), provide empty defaults so tabs render
          setProfile(json.data.profile ?? {
            business_name: "", industry: "", structure: "", province: "", city: "",
            monthly_revenue: "", employee_count: "0", fiscal_year_end_month: "12",
            has_payroll: false, handles_data: false, has_physical_location: false,
            sells_alcohol: false, handles_food: false, does_construction: false,
            has_professional_order: false, exports_goods: false, does_rd: false,
            has_accountant: false, has_bookkeeper: false,
            uses_payroll_software: false, uses_pos: false,
          });
          setDates(json.data.dates ?? {
            incorporation_date: "", registration_date: "", gst_registration_date: "",
            qst_registration_date: "", first_employee_date: "", licence_renewal_date: "",
            insurance_renewal_date: "", lease_start_date: "", lease_end_date: "",
          });
          setNotifPrefs(json.data.notifications ?? {
            email_enabled: true, in_app_enabled: true, email_frequency: "smart",
            quiet_start_hour: 20, quiet_end_hour: 8, timezone: "America/Montreal",
            min_urgency_email: "warning",
          });
          setBilling(json.data.billing ?? {
            plan: "solo", status: "active", current_period_end: "",
            diagnostics_used: 0, diagnostics_limit: 5, stripe_customer_id: null,
          });
          if (json.data.profile?.province === "QC") setLang("fr");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ─── Save handler ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/v2/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, dates, notifications: notifPrefs, language: lang }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (key: keyof ProfileData, val: any) => {
    setProfile(prev => prev ? { ...prev, [key]: val } : prev);
  };
  const toggleProfile = (key: keyof ProfileData) => {
    setProfile(prev => prev ? { ...prev, [key]: !prev[key] } : prev);
  };
  const updateDates = (key: keyof DatesData, val: string) => {
    setDates(prev => prev ? { ...prev, [key]: val } : prev);
  };
  const updateNotif = (key: keyof NotifPrefs, val: any) => {
    setNotifPrefs(prev => prev ? { ...prev, [key]: val } : prev);
  };

  // ─── Stripe portal ─────────────────────────────────────────────────────
  const openBillingPortal = async () => {
    try {
      const res = await fetch("/api/v2/billing/portal", { method: "POST" });
      const json = await res.json();
      if (json.url && typeof window !== "undefined") window.location.href = json.url;
    } catch (err: any) {
      setError(err.message);
    }
  };

  // SVG icons for tabs — no emoji
  const TAB_ICONS: Record<string, JSX.Element> = {
    profile:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    dates:         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    notifications: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    language:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
    billing:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  };
  const TABS: { key: Tab; label: string; labelFr: string }[] = [
    { key: "profile",       label: "Profile",       labelFr: "Profil" },
    { key: "dates",         label: "Key Dates",     labelFr: "Dates clés" },
    { key: "notifications", label: "Notifications", labelFr: "Notifications" },
    { key: "language",      label: "Language",      labelFr: "Langue" },
    { key: "billing",       label: "Billing",       labelFr: "Facturation" },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-border-light">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar tabs */}
            <div className="w-48 shrink-0 space-y-1 hidden sm:block">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-left transition-all ${
                    tab === t.key
                      ? "bg-brand-soft text-brand border border-brand/15"
                      : "text-ink-muted hover:text-ink-secondary hover:bg-white"
                  }`}>
                  {TAB_ICONS[t.key]}
                  <span className="font-medium">{isFr ? t.labelFr : t.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 sm:hidden mb-4">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] whitespace-nowrap ${
                    tab === t.key ? "bg-brand-soft text-brand" : "bg-white text-ink-faint"
                  }`}>
                  {TAB_ICONS[t.key]}
                  <span>{isFr ? t.labelFr : t.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {/* ═══ PROFILE TAB ═══ */}
              {tab === "profile" && profile && (
                <div className="space-y-5" style={{ animation: "fadeUp 0.25s ease-out" }}>
                  <SectionTitle title={isFr ? "Informations de l'entreprise" : "Business Information"} />

                  <Field label={isFr ? "Nom de l'entreprise" : "Business name"}>
                    <input type="text" value={profile.business_name} onChange={e => updateProfile("business_name", e.target.value)} className="input-field" />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label={isFr ? "Industrie" : "Industry"}>
                      <select value={profile.industry} onChange={e => updateProfile("industry", e.target.value)} className="input-field">
                        {INDUSTRIES.map(i => <option key={i.value} value={i.value}>{isFr ? i.fr : i.en}</option>)}
                      </select>
                    </Field>
                    <Field label={isFr ? "Structure" : "Structure"}>
                      <select value={profile.structure} onChange={e => updateProfile("structure", e.target.value)} className="input-field">
                        {STRUCTURES.map(s => <option key={s.value} value={s.value}>{isFr ? s.fr : s.en}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label={isFr ? "Province" : "Province"}>
                      <select value={profile.province} onChange={e => updateProfile("province", e.target.value)} className="input-field">
                        {PROVINCES.map(p => <option key={p.value} value={p.value}>{isFr ? p.fr : p.en}</option>)}
                      </select>
                    </Field>
                    <Field label={isFr ? "Ville" : "City"}>
                      <input type="text" value={profile.city} onChange={e => updateProfile("city", e.target.value)} className="input-field" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Field label={isFr ? "Revenu mensuel" : "Monthly revenue"}>
                      <input type="number" value={profile.monthly_revenue} onChange={e => updateProfile("monthly_revenue", e.target.value)}
                        className="input-field" placeholder="$" />
                    </Field>
                    <Field label={isFr ? "Employés" : "Employees"}>
                      <input type="number" value={profile.employee_count} onChange={e => updateProfile("employee_count", e.target.value)}
                        className="input-field" min="0" />
                    </Field>
                    <Field label={isFr ? "Fin d'exercice" : "Fiscal year-end"}>
                      <select value={profile.fiscal_year_end_month} onChange={e => updateProfile("fiscal_year_end_month", e.target.value)} className="input-field">
                        {MONTHS.map(m => <option key={m.value} value={m.value}>{isFr ? m.fr : m.en}</option>)}
                      </select>
                    </Field>
                  </div>

                  <SectionTitle title={isFr ? "Activités & outils" : "Activities & Tools"} />
                  <div className="grid grid-cols-2 gap-2">
                    <Toggle on={profile.has_payroll} onClick={() => toggleProfile("has_payroll")} label={isFr ? "Paie active" : "Active payroll"} />
                    <Toggle on={profile.handles_data} onClick={() => toggleProfile("handles_data")} label={isFr ? "Données clients" : "Customer data"} />
                    <Toggle on={profile.has_physical_location} onClick={() => toggleProfile("has_physical_location")} label={isFr ? "Local physique" : "Physical location"} />
                    <Toggle on={profile.sells_alcohol} onClick={() => toggleProfile("sells_alcohol")} label={isFr ? "Vente d'alcool" : "Sells alcohol"} />
                    <Toggle on={profile.handles_food} onClick={() => toggleProfile("handles_food")} label={isFr ? "Manipulation aliments" : "Handles food"} />
                    <Toggle on={profile.does_construction} onClick={() => toggleProfile("does_construction")} label={isFr ? "Construction" : "Construction"} />
                    <Toggle on={profile.has_professional_order} onClick={() => toggleProfile("has_professional_order")} label={isFr ? "Ordre professionnel" : "Professional order"} />
                    <Toggle on={profile.does_rd} onClick={() => toggleProfile("does_rd")} label="R&D" />
                    <Toggle on={profile.exports_goods} onClick={() => toggleProfile("exports_goods")} label={isFr ? "Exportation" : "Exports"} />
                    <Toggle on={profile.has_accountant} onClick={() => toggleProfile("has_accountant")} label={isFr ? "Comptable" : "Accountant"} />
                    <Toggle on={profile.has_bookkeeper} onClick={() => toggleProfile("has_bookkeeper")} label={isFr ? "Teneur de livres" : "Bookkeeper"} />
                    <Toggle on={profile.uses_payroll_software} onClick={() => toggleProfile("uses_payroll_software")} label={isFr ? "Logiciel paie" : "Payroll software"} />
                    <Toggle on={profile.uses_pos} onClick={() => toggleProfile("uses_pos")} label="POS" />
                  </div>
                </div>
              )}

              {/* ═══ DATES TAB ═══ */}
              {tab === "dates" && dates && (
                <div className="space-y-5" style={{ animation: "fadeUp 0.25s ease-out" }}>
                  <SectionTitle title={isFr ? "Dates clés" : "Key Dates"} />
                  <div className="bg-brand-accent/6 border border-brand-accent/15 rounded-xl px-4 py-3 mb-1">
                    <p className="text-xs text-brand-accent/80">
                      {isFr ? "Ces dates servent à calculer vos échéances exactes. Modifier une date recalcule automatiquement le calendrier." : "These dates compute your exact deadlines. Changing a date auto-recalculates the calendar."}
                    </p>
                  </div>

                  <DateField label={isFr ? "Date d'incorporation" : "Incorporation date"} value={dates.incorporation_date}
                    onChange={v => updateDates("incorporation_date", v)}
                    hint={isFr ? "Rapport annuel, renouvellements" : "Annual return, renewals"} />
                  <DateField label={isFr ? "Date d'immatriculation (REQ/SO)" : "Registration date"} value={dates.registration_date}
                    onChange={v => updateDates("registration_date", v)}
                    hint={isFr ? "Renouvellement REQ (5 ans QC)" : "Registration renewal (5yr)"} />

                  <div className="grid grid-cols-2 gap-4">
                    <DateField label={isFr ? "Inscription TPS/TVH" : "GST/HST registration"} value={dates.gst_registration_date}
                      onChange={v => updateDates("gst_registration_date", v)} />
                    <DateField label={isFr ? "Inscription TVQ" : "QST registration"} value={dates.qst_registration_date}
                      onChange={v => updateDates("qst_registration_date", v)} />
                  </div>

                  <DateField label={isFr ? "Premier employé" : "First employee date"} value={dates.first_employee_date}
                    onChange={v => updateDates("first_employee_date", v)}
                    hint={isFr ? "CNESST/WSIB, équité salariale, comité SST" : "CNESST/WSIB, pay equity, safety committee"} />

                  <div className="grid grid-cols-2 gap-4">
                    <DateField label={isFr ? "Renouvellement permis" : "Licence renewal"} value={dates.licence_renewal_date}
                      onChange={v => updateDates("licence_renewal_date", v)} />
                    <DateField label={isFr ? "Renouvellement assurance" : "Insurance renewal"} value={dates.insurance_renewal_date}
                      onChange={v => updateDates("insurance_renewal_date", v)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DateField label={isFr ? "Début bail" : "Lease start"} value={dates.lease_start_date}
                      onChange={v => updateDates("lease_start_date", v)} />
                    <DateField label={isFr ? "Fin bail" : "Lease end"} value={dates.lease_end_date}
                      onChange={v => updateDates("lease_end_date", v)}
                      hint={isFr ? "Rappel de négociation 90 jours avant" : "Negotiation reminder 90 days before"} />
                  </div>
                </div>
              )}

              {/* ═══ NOTIFICATIONS TAB ═══ */}
              {tab === "notifications" && notifPrefs && (
                <div className="space-y-5" style={{ animation: "fadeUp 0.25s ease-out" }}>
                  <SectionTitle title={isFr ? "Canaux de notification" : "Notification Channels"} />
                  <div className="space-y-2">
                    <Toggle on={notifPrefs.email_enabled} onClick={() => updateNotif("email_enabled", !notifPrefs.email_enabled)}
                      label={isFr ? "Notifications par courriel" : "Email notifications"} />
                    <Toggle on={notifPrefs.in_app_enabled} onClick={() => updateNotif("in_app_enabled", !notifPrefs.in_app_enabled)}
                      label={isFr ? "Notifications in-app (cloche)" : "In-app notifications (bell)"} />
                  </div>

                  <SectionTitle title={isFr ? "Fréquence des courriels" : "Email Frequency"} />
                  <div className="space-y-1">
                    {EMAIL_FREQ.map(f => (
                      <button key={f.value} onClick={() => updateNotif("email_frequency", f.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left transition-all ${
                          notifPrefs.email_frequency === f.value
                            ? "bg-brand-soft text-brand border border-brand/15"
                            : "bg-white text-ink-muted border border-transparent hover:bg-bg-section"
                        }`}>
                        <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                          notifPrefs.email_frequency === f.value ? "border-brand-light" : "border-white/15"
                        }`}>
                          {notifPrefs.email_frequency === f.value && <span className="w-1.5 h-1.5 rounded-full bg-brand-light" />}
                        </span>
                        {isFr ? f.fr : f.en}
                      </button>
                    ))}
                  </div>

                  <SectionTitle title={isFr ? "Seuil de courriel minimum" : "Minimum Email Urgency"} />
                  <div className="space-y-1">
                    {URGENCY_LEVELS.map(u => (
                      <button key={u.value} onClick={() => updateNotif("min_urgency_email", u.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left transition-all ${
                          notifPrefs.min_urgency_email === u.value
                            ? "bg-brand-soft text-brand border border-brand/15"
                            : "bg-white text-ink-muted border border-transparent hover:bg-bg-section"
                        }`}>
                        <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                          notifPrefs.min_urgency_email === u.value ? "border-brand-light" : "border-white/15"
                        }`}>
                          {notifPrefs.min_urgency_email === u.value && <span className="w-1.5 h-1.5 rounded-full bg-brand-light" />}
                        </span>
                        {isFr ? u.fr : u.en}
                      </button>
                    ))}
                  </div>

                  <SectionTitle title={isFr ? "Heures tranquilles" : "Quiet Hours"} />
                  <p className="text-[10px] text-ink-faint -mt-3">
                    {isFr ? "Pas de notifications pendant ces heures" : "No notifications during these hours"}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={isFr ? "Début (heure)" : "Start (hour)"}>
                      <select value={notifPrefs.quiet_start_hour} onChange={e => updateNotif("quiet_start_hour", parseInt(e.target.value))} className="input-field">
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                        ))}
                      </select>
                    </Field>
                    <Field label={isFr ? "Fin (heure)" : "End (hour)"}>
                      <select value={notifPrefs.quiet_end_hour} onChange={e => updateNotif("quiet_end_hour", parseInt(e.target.value))} className="input-field">
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {/* ═══ LANGUAGE TAB ═══ */}
              {tab === "language" && (
                <div className="space-y-5" style={{ animation: "fadeUp 0.25s ease-out" }}>
                  <SectionTitle title={isFr ? "Langue de l'interface" : "Interface Language"} />
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setLang("fr")}
                      className={`px-4 py-4 rounded-xl text-center transition-all ${
                        lang === "fr" ? "bg-brand-soft border border-brand/20 text-brand" : "bg-white border border-transparent text-ink-faint hover:bg-bg-section"
                      }`}>
                      <span className="text-lg block mb-1 font-serif font-bold">FR</span>
                      <span className="text-sm font-semibold">Français</span>
                    </button>
                    <button onClick={() => setLang("en")}
                      className={`px-4 py-4 rounded-xl text-center transition-all ${
                        lang === "en" ? "bg-brand-soft border border-brand/20 text-brand" : "bg-white border border-transparent text-ink-faint hover:bg-bg-section"
                      }`}>
                      <span className="text-lg block mb-1 font-serif font-bold">EN</span>
                      <span className="text-sm font-semibold">English</span>
                    </button>
                  </div>

                  <SectionTitle title={isFr ? "Fuseau horaire" : "Timezone"} />
                  <Field label={isFr ? "Fuseau" : "Timezone"}>
                    <select value={notifPrefs?.timezone || "America/Montreal"}
                      onChange={e => updateNotif("timezone", e.target.value)} className="input-field">
                      {TIMEZONES.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}

              {/* ═══ BILLING TAB ═══ */}
              {tab === "billing" && (
                <div className="space-y-5" style={{ animation: "fadeUp 0.25s ease-out" }}>
                  <SectionTitle title={isFr ? "Compte et facturation" : "Account & Billing"} />

                  <div className="bg-white border border-border-light rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-ink">
                          {billing?.plan === "enterprise" || billing?.plan === "corp" ? "Enterprise" : "Solo"}
                        </h3>
                        <p className="text-xs text-ink-faint">
                          {billing?.status === "active" ? (isFr ? "Actif" : "Active") :
                           billing?.status === "trialing" ? (isFr ? "Essai" : "Trial") :
                           billing?.status === "past_due" ? (isFr ? "Paiement en retard" : "Past due") :
                           (isFr ? "Gratuit" : "Free")}
                        </p>
                      </div>
                      {billing?.plan !== "free" && (
                        <span className="px-3 py-1 rounded-lg bg-brand-soft text-brand text-xs font-semibold">
                          {billing?.plan?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {billing?.current_period_end && (
                      <p className="text-[10px] text-ink-faint">
                        {isFr ? "Prochaine facturation" : "Next billing"}: {new Date(billing.current_period_end).toLocaleDateString(isFr ? "fr-CA" : "en-CA")}
                      </p>
                    )}
                  </div>



                  {/* Recovery fee model info */}
                  <div className="bg-white border border-border-light rounded-xl p-5">
                    <h4 className="text-xs text-ink-muted font-semibold mb-3">{isFr ? "Modèle de rémunération" : "How billing works"}</h4>
                    <div className="space-y-2.5">
                      {[
                        { icon: "✓", text: isFr ? "Tous les outils de diagnostic sont gratuits — aucune carte requise" : "All diagnostic tools are free — no credit card required" },
                        { icon: "✓", text: isFr ? "Le service de récupération fonctionne à 12% des économies confirmées" : "Recovery service runs at 12% of confirmed savings" },
                        { icon: "✓", text: isFr ? "Vous ne payez rien tant que l'argent n'est pas dans votre compte" : "You pay nothing until money is actually in your account" },
                        { icon: "✓", text: isFr ? "Si nous ne récupérons rien, vous ne payez rien" : "If we recover nothing, you pay nothing" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="text-positive text-[12px] mt-px shrink-0">{item.icon}</span>
                          <span className="text-[12px] text-ink-secondary leading-snug">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stripe portal button */}
                  {billing?.stripe_customer_id && (
                    <button onClick={openBillingPortal}
                      className="w-full py-3 rounded-xl bg-bg-section border border-border text-xs text-ink-muted hover:text-ink-secondary transition-colors">
                      {isFr ? "Gérer la facturation (Stripe)" : "Manage Billing (Stripe)"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .input-field { width:100%; padding:10px 14px; background:#FAFAF8; border:1px solid #E5E2DC; border-radius:8px; font-size:13px; color:#1A1A18; outline:none; transition:border-color 0.2s; }
        .input-field:focus { border-color:#1B3A2D; }
        .input-field::placeholder { color:#B5B0A8; }
        .input-field option { background:white; color:#1A1A18; }
      `}</style>

      {/* ── Danger Zone ─────────────────────────────────────────────────── */}
      <div id="danger-zone" className="mt-8 rounded-xl border border-red-200 overflow-hidden">
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">⚠️ Danger zone</p>
        </div>
        <div className="px-4 py-4">
          <p className="text-[13px] font-semibold text-ink mb-1">Delete account</p>
          <p className="text-[12px] text-ink-muted mb-3">
            This permanently deletes your account, all diagnostic history, and all associated data. This cannot be undone.
          </p>
          <button onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-[12px] font-bold text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition">
            Delete my account →
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <p className="text-[17px] font-bold text-ink mb-2">Are you sure?</p>
            <p className="text-[13px] text-ink-muted mb-4">
              This will permanently delete all your diagnostic reports, completed tasks, and financial history.
            </p>
            <p className="text-[12px] font-semibold text-ink mb-1">Type DELETE to confirm:</p>
            <input type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="w-full border border-border rounded-lg px-3 py-2 text-[13px] mb-4 focus:outline-none focus:border-red-400"
            />
            {deleteError && <p className="text-[11px] text-red-600 mb-2">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeleteInput(""); setDeleteError(""); }}
                className="flex-1 py-2 text-[13px] font-semibold border border-border rounded-lg hover:bg-bg-section transition">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteInput !== "DELETE" || deleting}
                className="flex-1 py-2 text-[13px] font-bold text-white rounded-lg transition disabled:opacity-40"
                style={{ background: deleteInput === "DELETE" ? "#B34040" : "#ccc" }}>
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-xs font-semibold text-ink-faint uppercase tracking-wider pt-2">{title}</h3>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-ink-faint mb-1 font-medium">{label}</label>
      {children}
    </div>
  );
}

function DateField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <Field label={label}>
      <input type="date" value={value || ""} onChange={e => onChange(e.target.value)} className="input-field" />
      {hint && <p className="text-[9px] text-ink-faint mt-0.5">{hint}</p>}
    </Field>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-all ${
        on ? "bg-brand-soft text-brand/80 border border-brand/12" : "bg-white text-ink-faint border border-transparent hover:bg-bg-section"
      }`}>
      <div className={`w-7 h-4 rounded-full flex items-center transition-all ${on ? "bg-brand justify-end" : "bg-bg-warm justify-start"}`}>
        <div className={`w-3 h-3 rounded-full mx-0.5 transition-all ${on ? "bg-white" : "bg-white/30"}`} />
      </div>
      <span className="flex-1">{label}</span>
    </button>
  );
}