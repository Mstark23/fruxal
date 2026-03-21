"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

const REVENUE_BRACKETS = ["1M_5M","5M_20M","20M_50M"];
const REVENUE_LABELS: Record<string,string> = { "1M_5M":"$1M – $5M","5M_20M":"$5M – $20M","20M_50M":"$20M – $50M" };
const PROVINCES = ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"];
const inputCls = "w-full px-3 py-2.5 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]";

export default function AdminDiagnosticPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pipelineId = searchParams.get("pipelineId") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [diagnosticId, setDiagnosticId] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [revenueBracket, setRevenueBracket] = useState("5M_20M");
  const [province, setProvince] = useState("QC");
  const [employeeCount, setEmployeeCount] = useState("10");

  const [vendorContracts, setVendorContracts] = useState("");
  const [taxStructure, setTaxStructure] = useState("");
  const [benefitsPlan, setBenefitsPlan] = useState("");
  const [primaryBank, setPrimaryBank] = useState("");
  const [monthlySaas, setMonthlySaas] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [hasCFO, setHasCFO] = useState(false);
  const [claimedSRED, setClaimedSRED] = useState(false);

  useEffect(() => {
    if (!pipelineId) return;
    fetch(`/api/admin/tier3/pipeline?pipelineId=${pipelineId}`)
      .then(r => r.json())
      .then(j => {
        const e = j.entries?.[0];
        if (!e) return;
        if (e.companyName) setCompanyName(e.companyName);
        if (e.industry) setIndustry(e.industry);
        if (e.province && PROVINCES.includes(e.province)) setProvince(e.province);
        if (e.revenueBracket) {
          const rev = e.revenueBracket;
          if (rev.includes("25M") || rev.includes("50M") || rev.includes("100M")) setRevenueBracket("20M_50M");
          else if (rev.includes("5M") || rev.includes("10M")) setRevenueBracket("5M_20M");
          else setRevenueBracket("1M_5M");
        }
      }).catch(() => {});
  }, [pipelineId]);

  const runDiagnostic = useCallback(async () => {
    setError("");
    setRunning(true);
    try {
      setIsLoading(true);
    const res = await fetch("/api/admin/tier3/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName, industry, revenueBracket, province,
          employeeCount: Number(employeeCount) || 10,
          pipelineId,
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
      if (!json.success) throw new Error(json.error || "Diagnostic failed");
      setResult(json.result);
      setDiagnosticId(json.id);
      setDone(true);
    setIsLoading(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }, [companyName, industry, revenueBracket, province, employeeCount, pipelineId, vendorContracts, taxStructure, benefitsPlan, hasCFO, primaryBank, monthlySaas, claimedSRED, painPoint]);

  if (running) if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#E8E6E1] border-t-[#1B3A2D] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-semibold text-[#1A1A18]">Running diagnostic for {companyName}…</p>
        <p className="text-sm text-[#8E8C85] mt-1">Analysing 7 leak categories</p>
      </div>
    </div>
  );

  if (done && result) return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A18] mb-1">Diagnostic Complete</h1>
        <p className="text-sm text-[#8E8C85] mb-6">{companyName} · {industry} · {province}</p>
        <AdminNav />
        <div className="mt-6 space-y-4">
          <div className="bg-white border border-[#EEECE8] rounded-xl p-6">
            <p className="font-serif text-3xl font-bold text-[#2D7A50]">
              ${(result.summary?.totalEstimatedLow ?? 0).toLocaleString()} – ${(result.summary?.totalEstimatedHigh ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-[#8E8C85] mt-1">{result.topLeaks?.length ?? 0} leaks · {result.summary?.highConfidenceCount ?? 0} high confidence</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => router.push(`/admin/tier3/${diagnosticId}`)} className="flex-1 py-2.5 bg-[#1B3A2D] text-white text-sm font-bold rounded-lg hover:bg-[#2A5A44] transition">
                View Full Report →
              </button>
              <button onClick={() => router.push("/admin/tier3")} className="flex-1 py-2.5 bg-white border border-[#E8E6E1] text-[#56554F] text-sm font-medium rounded-lg hover:bg-[#F8F7F5] transition">
                Back to Pipeline
              </button>
            </div>
          </div>
          {(result.topLeaks||[]).slice(0,5).map((l:any, i:number) => (
            <div key={i} className="bg-white border border-[#EEECE8] rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-serif text-lg font-bold text-[#1B3A2D]">#{i+1}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A18]">{l.name}</p>
                  <p className="text-[10px] text-[#8E8C85]">{l.category?.replace(/_/g," ")} · {l.confidence}</p>
                </div>
              </div>
              <p className="font-serif text-sm font-bold text-[#1A1A18]">${(l.estimatedLow ?? 0).toLocaleString()} – ${(l.estimatedHigh ?? 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => router.back()} className="mb-4 px-3 py-1.5 bg-white border border-[#E8E6E1] text-[#56554F] text-sm font-medium rounded-lg hover:bg-[#F8F7F5] transition">← Back</button>
        <h1 className="font-serif text-2xl font-bold text-[#1A1A18] mb-1">Start Diagnostic</h1>
        <p className="text-sm text-[#8E8C85] mb-6">Fill in the financial intake data to run a Tier 3 analysis.</p>
        <AdminNav />
        <div className="mt-6 space-y-6">

          {/* Company Profile */}
          <div className="bg-white border border-[#EEECE8] rounded-xl p-6">
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-4">Step 1 — Company Profile</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Company Name *</label>
                <input className={inputCls} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Industry *</label>
                <input className={inputCls} value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Construction, Retail…" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Revenue Bracket *</label>
                <select className={inputCls} value={revenueBracket} onChange={e => setRevenueBracket(e.target.value)}>
                  {REVENUE_BRACKETS.map(r => <option key={r} value={r}>{REVENUE_LABELS[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Province *</label>
                <select className={inputCls} value={province} onChange={e => setProvince(e.target.value)}>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Employee Count</label>
                <input className={inputCls} type="number" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} placeholder="10" />
              </div>
            </div>
          </div>

          {/* Discovery Call */}
          <div className="bg-white border border-[#EEECE8] rounded-xl p-6">
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-4">Step 2 — Discovery Call Answers</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Vendor contracts last renegotiated</label>
                <input className={inputCls} value={vendorContracts} onChange={e => setVendorContracts(e.target.value)} placeholder="e.g. 2 years ago, never…" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Tax structure last reviewed</label>
                <input className={inputCls} value={taxStructure} onChange={e => setTaxStructure(e.target.value)} placeholder="e.g. Last year, 3 years ago…" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Benefits plan last rebid</label>
                <input className={inputCls} value={benefitsPlan} onChange={e => setBenefitsPlan(e.target.value)} placeholder="e.g. Never, 2022…" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Primary bank</label>
                <input className={inputCls} value={primaryBank} onChange={e => setPrimaryBank(e.target.value)} placeholder="e.g. RBC, TD, Desjardins…" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Monthly SaaS spend ($)</label>
                <input className={inputCls} type="number" value={monthlySaas} onChange={e => setMonthlySaas(e.target.value)} placeholder="e.g. 5000" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Biggest pain point</label>
                <input className={inputCls} value={painPoint} onChange={e => setPainPoint(e.target.value)} placeholder="e.g. Cash flow, payroll costs…" />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="cfo" checked={hasCFO} onChange={e => setHasCFO(e.target.checked)} className="w-4 h-4 accent-[#1B3A2D]" />
                <label htmlFor="cfo" className="text-sm font-medium text-[#1A1A18]">Has dedicated CFO / controller</label>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="sred" checked={claimedSRED} onChange={e => setClaimedSRED(e.target.checked)} className="w-4 h-4 accent-[#1B3A2D]" />
                <label htmlFor="sred" className="text-sm font-medium text-[#1A1A18]">Has claimed SR&ED credits</label>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-[#B34040] font-medium">{error}</p>}

          <button
            onClick={runDiagnostic}
            disabled={!companyName || !industry}
            className="w-full py-3.5 bg-[#1B3A2D] text-white text-sm font-bold rounded-xl hover:bg-[#2A5A44] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Run Diagnostic →
          </button>
        </div>
      </div>
    </div>
  );
}
