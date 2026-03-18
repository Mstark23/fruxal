// =============================================================================
// /tier3/diagnostic/new — Post-Call Data Entry Form
// =============================================================================
// After a LinkedIn call with a CFO, open this page, enter everything,
// submit → diagnostic engine runs → redirect to result preview.
// =============================================================================

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const INDUSTRIES = [
  "Construction", "Manufacturing", "Hospitality", "Healthcare",
  "Legal Services", "Accounting Firms", "Logistics & Trucking", "Retail",
  "Real Estate", "Dental Clinics", "Engineering Firms", "IT Services",
  "Marketing Agencies", "Food & Beverage", "Property Management",
  "Staffing Agencies", "Auto Dealerships", "HVAC & Trades",
  "E-Commerce", "Pharmaceutical Distribution", "Other",
];

const PROVINCES = [
  { value: "ON", label: "Ontario" },
  { value: "QC", label: "Quebec" },
  { value: "BC", label: "British Columbia" },
  { value: "AB", label: "Alberta" },
  { value: "MB", label: "Manitoba" },
];

const BRACKETS = [
  { value: "1M_5M", label: "$1M – $5M" },
  { value: "5M_20M", label: "$5M – $20M" },
  { value: "20M_50M", label: "$20M – $50M" },
];

export default function NewDiagnosticPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Company profile
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [revenueBracket, setRevenueBracket] = useState("");
  const [province, setProvince] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");

  // Call notes
  const [vendorContracts, setVendorContracts] = useState("");
  const [taxStructure, setTaxStructure] = useState("");
  const [benefitsPlan, setBenefitsPlan] = useState("");
  const [hasCFO, setHasCFO] = useState(false);
  const [primaryBank, setPrimaryBank] = useState("");
  const [monthlySaas, setMonthlySaas] = useState("");
  const [claimedSRED, setClaimedSRED] = useState(false);
  const [painPoint, setPainPoint] = useState("");

  const industryRef = useRef<HTMLDivElement>(null);

  const filteredIndustries = INDUSTRIES.filter((i) =>
    i.toLowerCase().includes(industrySearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!companyName.trim()) return setError("Company name is required");
    if (!industry) return setError("Select an industry");
    if (!revenueBracket) return setError("Select a revenue bracket");
    if (!province) return setError("Select a province");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tier3/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          industry,
          revenueBracket,
          province,
          employeeCount: Number(employeeCount) || 10,
          callAnswers: {
            vendorContractsLastRenegotiated: vendorContracts,
            taxStructureLastReviewed: taxStructure,
            benefitsPlanLastRebid: benefitsPlan,
            hasDedicatedCFO: hasCFO,
            primaryBank,
            monthlySaasSpend: Number(monthlySaas) || 0,
            claimedSRED,
            biggestPainPoint: painPoint,
          },
        }),
      });

      const json = await res.json();

      if (json.success && json.id) {
        router.push(`/tier3/diagnostic/${json.id}`);
      } else {
        setError(json.error || "Failed to generate diagnostic");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#131a2b] border border-[#1e2a42] rounded-lg px-4 py-3 text-sm text-white placeholder-[#4a5578] focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 outline-none transition-colors";
  const labelCls = "block text-xs font-semibold text-[#8892a8] uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen bg-[#0d1320]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push("/tier3")}
            className="text-xs text-[#4a5578] hover:text-[#00c853] transition-colors mb-4 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">New Diagnostic</h1>
          <p className="text-sm text-[#6b7694] mt-1">Enter the company details from your CFO call.</p>
        </div>

        {/* ═══ SECTION 1: Company Profile ═══ */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 rounded-lg bg-[#00c853]/10 flex items-center justify-center">
              <span className="text-xs font-bold text-[#00c853]">1</span>
            </div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Company Profile</h2>
          </div>

          <div className="space-y-5">
            {/* Company Name */}
            <div>
              <label className={labelCls}>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Bélanger Construction Inc."
                className={inputCls}
              />
            </div>

            {/* Industry — searchable select */}
            <div className="relative" ref={industryRef}>
              <label className={labelCls}>Industry</label>
              <div
                className={`${inputCls} cursor-pointer flex items-center justify-between`}
                onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
              >
                <span className={industry ? "text-white" : "text-[#4a5578]"}>
                  {industry || "Select industry…"}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5578" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
              {showIndustryDropdown && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#131a2b] border border-[#1e2a42] rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  <div className="sticky top-0 p-2 bg-[#131a2b] border-b border-[#1e2a42]">
                    <input
                      type="text"
                      autoFocus
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                      placeholder="Search…"
                      className="w-full bg-[#0d1320] border border-[#1e2a42] rounded-md px-3 py-2 text-sm text-white placeholder-[#4a5578] outline-none focus:border-[#00c853]"
                    />
                  </div>
                  {filteredIndustries.map((ind) => (
                    <button
                      key={ind}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        industry === ind
                          ? "bg-[#00c853]/10 text-[#00c853]"
                          : "text-[#c0c8d8] hover:bg-[#1a2238]"
                      }`}
                      onClick={() => {
                        setIndustry(ind);
                        setIndustrySearch("");
                        setShowIndustryDropdown(false);
                      }}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue + Province row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Annual Revenue</label>
                <select
                  value={revenueBracket}
                  onChange={(e) => setRevenueBracket(e.target.value)}
                  className={`${inputCls} ${!revenueBracket ? "text-[#4a5578]" : ""}`}
                >
                  <option value="" className="text-[#4a5578]">Select…</option>
                  {BRACKETS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Province</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className={`${inputCls} ${!province ? "text-[#4a5578]" : ""}`}
                >
                  <option value="" className="text-[#4a5578]">Select…</option>
                  {PROVINCES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee Count */}
            <div>
              <label className={labelCls}>Employee Count</label>
              <input
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="e.g. 45"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* ═══ SECTION 2: Call Notes ═══ */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 rounded-lg bg-[#00c853]/10 flex items-center justify-center">
              <span className="text-xs font-bold text-[#00c853]">2</span>
            </div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Call Notes</h2>
            <span className="text-[10px] text-[#4a5578] ml-1">(all optional — improves accuracy)</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>When were vendor contracts last renegotiated?</label>
              <input
                type="text"
                value={vendorContracts}
                onChange={(e) => setVendorContracts(e.target.value)}
                placeholder="e.g. never, 2 years ago, last year"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>When was tax structure last reviewed?</label>
              <input
                type="text"
                value={taxStructure}
                onChange={(e) => setTaxStructure(e.target.value)}
                placeholder="e.g. 3+ years ago, last year, never"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>When was benefits plan last rebid?</label>
              <input
                type="text"
                value={benefitsPlan}
                onChange={(e) => setBenefitsPlan(e.target.value)}
                placeholder="e.g. never, 2 years ago"
                className={inputCls}
              />
            </div>

            {/* Toggle row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Dedicated CFO on staff?</label>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => setHasCFO(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      !hasCFO
                        ? "bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30"
                        : "bg-[#131a2b] text-[#4a5578] border border-[#1e2a42] hover:border-[#2a3a5c]"
                    }`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => setHasCFO(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      hasCFO
                        ? "bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30"
                        : "bg-[#131a2b] text-[#4a5578] border border-[#1e2a42] hover:border-[#2a3a5c]"
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Claimed SR&ED credits?</label>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => setClaimedSRED(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      !claimedSRED
                        ? "bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30"
                        : "bg-[#131a2b] text-[#4a5578] border border-[#1e2a42] hover:border-[#2a3a5c]"
                    }`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => setClaimedSRED(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      claimedSRED
                        ? "bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30"
                        : "bg-[#131a2b] text-[#4a5578] border border-[#1e2a42] hover:border-[#2a3a5c]"
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Primary Bank</label>
                <input
                  type="text"
                  value={primaryBank}
                  onChange={(e) => setPrimaryBank(e.target.value)}
                  placeholder="e.g. RBC, TD, Desjardins"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Monthly SaaS Spend</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578] text-sm">$</span>
                  <input
                    type="number"
                    value={monthlySaas}
                    onChange={(e) => setMonthlySaas(e.target.value)}
                    placeholder="0"
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Biggest pain point mentioned on the call</label>
              <textarea
                value={painPoint}
                onChange={(e) => setPainPoint(e.target.value)}
                placeholder="e.g. We keep losing good workers and our insurance premiums went up 15% this year"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* ═══ SUBMIT ═══ */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: loading ? "#1a2238" : "linear-gradient(135deg, #00c853, #00a844)",
            color: loading ? "#4a5578" : "#fff",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" /><path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
              Running Diagnostic Engine…
            </span>
          ) : (
            "Generate Diagnostic →"
          )}
        </button>

        <p className="text-center text-[10px] text-[#3a4560] mt-4">
          Results are generated using the Fruxal mid-market leak database (57 leaks × 7 categories × 5 provinces).
        </p>
      </div>
    </div>
  );
}
