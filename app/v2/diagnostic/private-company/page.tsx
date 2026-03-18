"use client";
// =============================================================================
// app/v2/diagnostic/private-company/page.tsx
// Rep-facing intake form for private (non-public) companies.
// Fruxal brand color system — matches enterprise dashboard exactly.
// =============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROVINCES = [
  { value:"ON", label:"Ontario"          },{ value:"QC", label:"Québec"           },
  { value:"BC", label:"British Columbia" },{ value:"AB", label:"Alberta"          },
  { value:"SK", label:"Saskatchewan"     },{ value:"MB", label:"Manitoba"         },
  { value:"NS", label:"Nova Scotia"      },{ value:"NB", label:"New Brunswick"    },
  { value:"NL", label:"Newfoundland"     },{ value:"PE", label:"PEI"              },
];

const STRUCTURES = [
  { value:"ccpc",        label:"CCPC (private corp)"  },
  { value:"corporation", label:"Corporation (other)"   },
  { value:"partnership", label:"Partnership"           },
  { value:"sole_prop",   label:"Sole proprietorship"   },
];

const INDUSTRIES = [
  "Technology / SaaS","Manufacturing","Construction","Healthcare",
  "Professional Services","Retail","Food & Beverage","Real Estate",
  "Transportation / Logistics","Finance / Accounting","Legal",
  "Engineering","Agriculture","Education","Media / Creative","Other",
];

const EXIT_HORIZONS = [
  { value:"1-2 years",  label:"1–2 years"  },
  { value:"3-5 years",  label:"3–5 years"  },
  { value:"5-10 years", label:"5–10 years" },
  { value:"10+ years",  label:"10+ years"  },
  { value:"unknown",    label:"No plan yet" },
];

// Shared input / select class — matches enterprise dashboard inputs
const INP = "w-full bg-white border border-border rounded-lg px-3 py-2.5 text-[13px] text-ink placeholder-ink-faint/60 focus:outline-none focus:border-brand/40 transition";
const SEL = INP + " appearance-none cursor-pointer";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider block mb-1.5">
        {label}
        {hint && <span className="text-ink-faint/50 normal-case font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function MoneyInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-[13px] pointer-events-none">$</span>
      <input
        className={INP + " pl-6"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <button
        type="button"
        onClick={onChange}
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
          checked ? "bg-brand border-brand" : "border-border bg-white group-hover:border-brand/40"
        }`}>
        {checked && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>
      <span className="text-[12px] text-ink-secondary group-hover:text-ink transition">{label}</span>
    </label>
  );
}

export default function PrivateCompanyPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    business_name:    "",
    industry:         "",
    province:         "ON",
    structure:        "ccpc",
    annual_revenue:   "",
    employee_count:   "",
    gross_margin_pct: "",
    ebitda_estimate:  "",
    owner_salary:     "",
    exit_horizon:     "unknown",
    has_holdco:       false,
    lcge_eligible:    false,
    passive_over_50k: false,
    has_cda:          false,
    rdtoh_balance:    "",
    sred_last_year:   "",
    does_rd:          false,
    has_payroll:      true,
    has_accountant:   false,
    language:         "en",
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }

  function parseNum(s: string) { return Number(s.replace(/,/g, "")) || undefined; }

  async function submit() {
    if (!form.business_name || !form.annual_revenue || !form.industry) {
      setError("Business name, revenue, and industry are required.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/v2/diagnostic/private-company", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          annual_revenue:   parseNum(form.annual_revenue) || 0,
          employee_count:   Number(form.employee_count || 0),
          gross_margin_pct: Number(form.gross_margin_pct || 0),
          ebitda_estimate:  parseNum(form.ebitda_estimate),
          owner_salary:     parseNum(form.owner_salary),
          rdtoh_balance:    parseNum(form.rdtoh_balance),
          sred_last_year:   parseNum(form.sred_last_year),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed");
      router.push(`/v2/dashboard/enterprise?reportId=${data.reportId}`);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="bg-bg min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-border-light bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="text-ink-faint hover:text-ink text-[13px] transition">← Back</button>
            <span className="text-border">|</span>
            <span className="text-ink-secondary text-[13px]">Private Company Diagnostic</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: "rgba(27,58,45,0.07)", color: "#1B3A2D", border: "1px solid rgba(27,58,45,0.15)" }}>
            Rep Tool
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="mb-7">
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Private Company Intake</h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            Enter the company's financials to run an enterprise CCPC diagnostic and generate a cold email.
            No public filings needed.
          </p>
        </div>

        <div className="space-y-4">

          {/* ── Section: Company ─────────────────────────────────────────── */}
          <div className="bg-white border border-border-light rounded-xl p-5 space-y-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

            <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider">Company</p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Business Name" hint="required">
                <input className={INP} value={form.business_name}
                  onChange={e => set("business_name", e.target.value)} placeholder="Acme Corp Inc." />
              </Field>
              <Field label="Province">
                <select className={SEL} value={form.province} onChange={e => set("province", e.target.value)}>
                  {PROVINCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Industry" hint="required">
                <select className={SEL} value={form.industry} onChange={e => set("industry", e.target.value)}>
                  <option value="">Select…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Corporate Structure">
                <select className={SEL} value={form.structure} onChange={e => set("structure", e.target.value)}>
                  {STRUCTURES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* ── Section: Financials ──────────────────────────────────────── */}
          <div className="bg-white border border-border-light rounded-xl p-5 space-y-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

            <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider">Financials</p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Annual Revenue" hint="required">
                <MoneyInput value={form.annual_revenue} onChange={v => set("annual_revenue", v)} placeholder="2,500,000" />
              </Field>
              <Field label="Employees">
                <input className={INP} type="number" min="0" value={form.employee_count}
                  onChange={e => set("employee_count", e.target.value)} placeholder="25" />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Gross Margin %" hint="estimate">
                <input className={INP} type="number" min="0" max="100" value={form.gross_margin_pct}
                  onChange={e => set("gross_margin_pct", e.target.value)} placeholder="45" />
              </Field>
              <Field label="EBITDA" hint="if known">
                <MoneyInput value={form.ebitda_estimate} onChange={v => set("ebitda_estimate", v)} placeholder="350,000" />
              </Field>
              <Field label="Owner T4 Salary" hint="if known">
                <MoneyInput value={form.owner_salary} onChange={v => set("owner_salary", v)} placeholder="180,000" />
              </Field>
            </div>
          </div>

          {/* ── Section: Tax & Corp Flags ────────────────────────────────── */}
          <div className="bg-white border border-border-light rounded-xl p-5 space-y-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

            <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider">Tax & Corporate Flags</p>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Exit Horizon">
                <select className={SEL} value={form.exit_horizon} onChange={e => set("exit_horizon", e.target.value)}>
                  {EXIT_HORIZONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
              </Field>
              <Field label="RDTOH Balance" hint="if known">
                <MoneyInput value={form.rdtoh_balance} onChange={v => set("rdtoh_balance", v)} placeholder="0" />
              </Field>
              <Field label="SR&ED Claimed Last Year">
                <MoneyInput value={form.sred_last_year} onChange={v => set("sred_last_year", v)} placeholder="0" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-1">
              {[
                { key:"has_holdco",       label:"Has holdco structure"             },
                { key:"lcge_eligible",    label:"LCGE eligible (QSBC shares)"      },
                { key:"passive_over_50k", label:"Passive income > $50K / yr"       },
                { key:"has_cda",          label:"CDA balance present"              },
                { key:"does_rd",          label:"Does R&D or software development" },
                { key:"has_payroll",      label:"Has payroll / employees"          },
                { key:"has_accountant",   label:"Has external accountant"          },
              ].map(f => (
                <Toggle key={f.key} checked={(form as any)[f.key]}
                  onChange={() => set(f.key, !(form as any)[f.key])}
                  label={f.label} />
              ))}
            </div>
          </div>

          {/* ── Section: Language ────────────────────────────────────────── */}
          <div className="bg-white border border-border-light rounded-xl p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="flex items-center gap-6">
              <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider">Report Language</p>
              <div className="flex gap-2">
                {[{ v:"en", l:"English" },{ v:"fr", l:"Français" }].map(o => (
                  <button key={o.v} onClick={() => set("language", o.v)}
                    className={`h-7 px-3 text-[11px] font-semibold rounded-md border transition ${
                      form.language === o.v
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-ink-secondary border-border hover:border-brand/30"}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-negative text-[12px] bg-negative/5 border border-negative/15 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button onClick={submit} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 text-white"
            style={{ background: loading ? "rgba(27,58,45,0.35)" : "#1B3A2D", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Running diagnostic — this takes ~30 seconds…
              </>
            ) : "Run Enterprise Diagnostic →"}
          </button>

        </div>
      </div>
    </div>
  );
}
