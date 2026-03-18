"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Leak {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  annualImpact: number;
  status: string;
  yours: string;
  benchmark: string;
  fixAction: string;
  affiliateVertical: string | null;
  affiliatePartner: string | null;
  dataSource: string;
  confidence: number;
  owner: string | null;
  layerId?: string;
  layerName?: string;
  industry?: string;
}

interface HubData {
  businessId: string;
  business: { id: string; name: string; industry: string } | null;
  summary: {
    totalLeaking: number; totalSaved: number; healthScore: number;
    totalLeaks: number; openLeaks: number; fixedLeaks: number; fixingLeaks: number;
    industryLeaks: number; intelligenceLeaks: number;
    affiliateMatched: number; matchRate: number;
    categoriesHit: number; categoriesCovered: number; totalPartners: number;
  };
  leaks: Leak[];
  categoryStats: Array<{
    category: string; total: number; open: number; fixed: number;
    amount: number; hasPartner: boolean; topPartner: string | null;
  }>;
  layers: {
    lastScanDepth: string | null; lastScanAt: string | null;
    totalLayersRun: number; totalDetectorsRun: number;
    layerResults: Array<{ id: string; name: string; tier: number; status: string; leaks: number; ms: number; error?: string }>;
  };
  affiliate: {
    totalPartners: number; coveredCategories: number;
    totalClicks: number; totalConversions: number; conversionRate: string;
    topPartners: Array<{ id: string; name: string; category: string; total_clicks: number; total_conversions: number; commission_value: number }>;
    categoryBreakdown: Record<string, number>;
  };
}

// ─── Design System ───────────────────────────────────────────────────────────
const C = {
  green: "#00c853", greenBg: "#e8f9ef",
  red: "#ff3d57", redBg: "#fff0f2",
  orange: "#ff8f00", orangeBg: "#fff8e8",
  blue: "#2979ff", blueBg: "#e8f0ff",
  purple: "#7c4dff", purpleBg: "#f3eeff",
  dim: "#8890a4", bg: "#f7f8fa", text: "#1a1a2e",
};

const TIER_META: Record<number, { name: string; color: string; bg: string; icon: string }> = {
  1: { name: "Financial Foundation",    color: "#2979ff", bg: "#e8f0ff", icon: "💰" },
  2: { name: "Operational & Strategic", color: "#00c853", bg: "#e8f9ef", icon: "⚡" },
  3: { name: "Ecosystem & Analysis",   color: "#7c4dff", bg: "#f3eeff", icon: "🔮" },
  4: { name: "Behavioral & Quantum",   color: "#ff8f00", bg: "#fff8e8", icon: "🧠" },
};

const LAYER_NAMES = [
  "Transaction Intelligence","Advanced Tracking","Financial Blindspots","Deep Tracking","Ultra Deep",
  "Sentinel","Phantom","Apex","Omega","Genesis",
  "Nexus","Axiom","Substrate","Catalyst","Meridian",
  "Graviton","Quantum","Singularity","Void","Paradox",
];

const LAYER_ICONS: Record<string, string> = {
  "Transaction Intelligence": "💳", "Advanced Tracking": "📡", "Financial Blindspots": "💸",
  "Deep Tracking": "🔎", "Ultra Deep": "🔬", "Sentinel": "🛡️", "Phantom": "👻",
  "Apex": "⚙️", "Omega": "🔚", "Genesis": "🌱", "Nexus": "🌌", "Axiom": "🏛️",
  "Substrate": "🧬", "Catalyst": "⚡", "Meridian": "🧭", "Graviton": "🌊",
  "Quantum": "🔮", "Singularity": "🌀", "Void": "🕳️", "Paradox": "🎭",
};

const CAT_META: Record<string, { label: string; icon: string }> = {
  "vendor-costs":           { label: "Vendor Costs",      icon: "📦" },
  "collections":            { label: "Collections",       icon: "💰" },
  "insurance":              { label: "Insurance",         icon: "🛡️" },
  "payroll-labor":          { label: "Payroll & Labor",   icon: "👥" },
  "software-subscriptions": { label: "Software",          icon: "💻" },
  "processing-fees":        { label: "Processing Fees",   icon: "💳" },
  "contracts":              { label: "Contracts",         icon: "📋" },
  "compliance-tax":         { label: "Tax & Compliance",  icon: "📑" },
  "pricing-margins":        { label: "Pricing",           icon: "🏷️" },
  "operations":             { label: "Operations",        icon: "⚙️" },
  "strategy-alignment":     { label: "Strategy",          icon: "🎯" },
  "leadership-decisions":   { label: "Leadership",        icon: "👔" },
  "customer-intelligence":  { label: "Customer Intel",    icon: "🤝" },
  "talent-culture":         { label: "Talent & Culture",  icon: "🧑‍🤝‍🧑" },
  "technology-debt":        { label: "Tech Debt",         icon: "🔧" },
  "market-position":        { label: "Market Position",   icon: "📊" },
  "growth-blockers":        { label: "Growth Blockers",   icon: "🚧" },
  "risk-exposure":          { label: "Risk Exposure",     icon: "⚠️" },
  "knowledge-capital":      { label: "Knowledge Capital", icon: "📚" },
  "hidden-revenue":         { label: "Hidden Revenue",    icon: "💎" },
};

const sevColor = (s: string) =>
  s === "CRITICAL" || s === "urgent" ? C.red :
  s === "HIGH" || s === "important" ? C.orange : C.dim;

const fmt = (n: number) =>
  n >= 1000000 ? "$" + (n / 1000000).toFixed(1) + "M" :
  n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + n.toLocaleString();

const catLabel = (c: string) => CAT_META[c]?.label || c.split("-").map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");
const catIcon = (c: string) => CAT_META[c]?.icon || "📌";

// ─── Fix Button with affiliate partner matching ──────────────────────────────
function FixButton({ leak, businessId, userId }: { leak: Leak; businessId: string; userId: string }) {
  const [partners, setPartners] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (partners.length > 0) { setShow(!show); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/leaks/fix?leakId=${leak.id}`);
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
        setShow(true);
      }
    } catch {}
    setLoading(false);
  };

  const fix = async (partner: any) => {
    try {
      const res = await fetch("/api/leaks/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leakId: leak.id, partnerId: partner.id, businessId, userId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.redirectUrl) window.open(data.redirectUrl, "_blank");
      }
    } catch {}
  };

  const status = (leak.status || "").toUpperCase();
  if (status === "FIXED") return <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: C.greenBg, color: C.green }}>✅ Fixed</span>;
  if (status === "FIXING") return <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: C.orangeBg, color: C.orange }}>🔧 Fixing</span>;

  return (
    <div>
      <button onClick={load}
        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
        style={{ background: leak.affiliatePartner ? C.green : C.blue }}>
        {loading ? "..." : leak.affiliatePartner ? `Fix with ${leak.affiliatePartner} →` : "See fix options →"}
      </button>
      {show && partners.length > 0 && (
        <div className="mt-2 space-y-1.5 animate-in fade-in">
          {partners.map((p: any) => (
            <button key={p.id} onClick={() => fix(p)}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-white hover:bg-blue-50 border border-gray-200 transition text-xs group">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 group-hover:text-blue-700">{p.name}</span>
                <span className="font-black" style={{ color: C.green }}>Save {fmt(p.estimatedSavingsDollars || 0)}/yr</span>
              </div>
              <div className="text-gray-500 mt-0.5">{p.description?.slice(0, 80)}</div>
              <div className="flex gap-2 mt-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100">⭐ {p.rating?.toFixed(1)}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100">💰 {p.estimatedSavingsPercent}% savings</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {show && partners.length === 0 && (
        <div className="mt-2 text-xs text-gray-400 italic">No partners mapped for this category yet</div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN: INTELLIGENCE HUB
// =============================================================================
export default function IntelligenceHub() {
  const [data, setData] = useState<HubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanDepth, setScanDepth] = useState("standard");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");

  // View & filters
  const [view, setView] = useState<"leaks" | "layers" | "categories" | "affiliates">("leaks");
  const [filterSource, setFilterSource] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAffiliate, setFilterAffiliate] = useState("all");
  const [expandedLeak, setExpandedLeak] = useState<string | null>(null);

  // ─── Load data ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      // Get user info
      const meRes = await fetch("/api/me");
      if (meRes.ok) {
        const me = await meRes.json();
        setUserId(me.user?.id || "");
        const bizId = me.business?.id;
        if (bizId) {
          const hubRes = await fetch(`/api/intelligence/hub?businessId=${bizId}`);
          if (hubRes.ok) {
            const hubData = await hubRes.json();
            setData(hubData);
          }
        }
      }
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Run scan ──────────────────────────────────────────────────────────
  const runScan = async () => {
    if (!data?.businessId) return;
    setScanning(true); setError("");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: data.businessId,
          industry: data.business?.industry || "restaurant",
          dataSource: "estimate",
          scanDepth,
        }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      await loadData(); // Refresh everything
    } catch (e: any) { setError(e.message); }
    setScanning(false);
  };

  // ─── Filter leaks ─────────────────────────────────────────────────────
  const leaks = data?.leaks || [];
  const filtered = leaks.filter(l => {
    const sev = (l.severity || "").toUpperCase();
    if (filterSeverity !== "all" && sev !== filterSeverity) return false;
    if (filterCategory !== "all" && l.category !== filterCategory) return false;
    if (filterSource === "industry" && l.dataSource !== "estimate" && l.dataSource !== "industry") return false;
    if (filterSource === "intelligence" && l.dataSource !== "intelligence") return false;
    if (filterSource === "tax" && l.dataSource !== "tax-engine") return false;
    if (filterAffiliate === "matched" && !l.affiliatePartner) return false;
    if (filterAffiliate === "unmatched" && l.affiliatePartner) return false;
    return true;
  }).sort((a, b) => b.annualImpact - a.annualImpact);

  const s = data?.summary;
  const categories = [...new Set(leaks.map(l => l.category))].sort();

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
          <div className="text-center">
            <div className="text-4xl mb-3 animate-pulse">🧠</div>
            <div className="text-lg font-bold" style={{ color: C.text }}>Loading Intelligence Hub...</div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell businessName={data?.business?.name}>
      <div className="min-h-screen" style={{ background: C.bg }}>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* HEADER                                                          */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border-b px-6 py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black" style={{ color: C.text }}>🧠 Intelligence Hub</h1>
                <p className="text-sm mt-1" style={{ color: C.dim }}>
                  {s?.totalPartners || 48} partners · {s?.categoriesCovered || 20} categories · 625 detectors · 20 layers · 11 industries
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select value={scanDepth} onChange={e => setScanDepth(e.target.value)}
                  className="text-xs border rounded-lg px-3 py-2 bg-white font-medium" style={{ color: C.text }}>
                  <option value="quick">⚡ Quick (Layers 1-5)</option>
                  <option value="standard">🔍 Standard (Layers 1-10)</option>
                  <option value="deep">🔮 Deep (Layers 1-15)</option>
                  <option value="ultra">🧠 Ultra (All 20 Layers)</option>
                </select>
                <button onClick={runScan} disabled={scanning || !data?.businessId}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.purple})` }}>
                  {scanning ? "🔄 Scanning..." : "🔍 Run Full Scan"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: C.redBg, color: C.red }}>{error}</div>
            )}

            {/* ─── Stats Grid ───────────────────────────────────────────── */}
            <div className="grid grid-cols-6 gap-3 mt-5">
              {[
                { label: "Total Leaking",      value: fmt(s?.totalLeaking || 0), sub: `${s?.openLeaks || 0} open`, color: C.red },
                { label: "Total Saved",         value: fmt(s?.totalSaved || 0),   sub: `${s?.fixedLeaks || 0} fixed`, color: C.green },
                { label: "Health Score",         value: `${s?.healthScore || 0}%`, sub: `${s?.categoriesHit || 0} categories`, color: (s?.healthScore || 0) >= 70 ? C.green : (s?.healthScore || 0) >= 40 ? C.orange : C.red },
                { label: "Industry Detections",  value: String(s?.industryLeaks || 0),  sub: data?.business?.industry || "—", color: C.blue },
                { label: "Intelligence Detections", value: String(s?.intelligenceLeaks || 0), sub: `${data?.layers.totalLayersRun || 0} layers ran`, color: C.purple },
                { label: "Partner Matched",      value: `${s?.matchRate || 0}%`,  sub: `${s?.affiliateMatched || 0}/${s?.totalLeaks || 0} leaks`, color: C.green },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl p-3.5 border shadow-sm">
                  <div className="text-[10px] font-bold" style={{ color: C.dim }}>{stat.label}</div>
                  <div className="text-xl font-black mt-0.5" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px]" style={{ color: C.dim }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* VIEW TABS + FILTERS                                             */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-white rounded-lg border p-1">
              {([
                { key: "leaks",      label: `📋 All Leaks (${filtered.length})` },
                { key: "layers",     label: "🧠 20 Layers" },
                { key: "categories", label: `📊 ${categories.length} Categories` },
                { key: "affiliates", label: `🤝 ${s?.totalPartners || 0} Partners` },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setView(tab.key)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                    view === tab.key ? "text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
                  style={view === tab.key ? { background: C.text } : undefined}>
                  {tab.label}
                </button>
              ))}
            </div>

            {view === "leaks" && (
              <div className="flex gap-2">
                <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="text-xs border rounded-lg px-2 py-1.5 bg-white">
                  <option value="all">All Sources</option>
                  <option value="industry">🏭 Industry</option>
                  <option value="intelligence">🧠 Intelligence</option>
                  <option value="tax">📑 Tax Engine</option>
                </select>
                <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="text-xs border rounded-lg px-2 py-1.5 bg-white">
                  <option value="all">All Severity</option>
                  <option value="CRITICAL">🔴 Critical</option>
                  <option value="HIGH">🟠 High</option>
                  <option value="MEDIUM">🟡 Medium</option>
                </select>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="text-xs border rounded-lg px-2 py-1.5 bg-white">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{catIcon(c)} {catLabel(c)}</option>)}
                </select>
                <select value={filterAffiliate} onChange={e => setFilterAffiliate(e.target.value)} className="text-xs border rounded-lg px-2 py-1.5 bg-white">
                  <option value="all">All</option>
                  <option value="matched">🔗 Has Partner</option>
                  <option value="unmatched">❌ No Partner</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* VIEW CONTENT                                                    */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-6 pb-8">

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* VIEW: ALL LEAKS                                                */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {view === "leaks" && (
            <div className="space-y-2">
              {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-4xl mb-3">🔍</div>
                  <div className="text-lg font-bold">No leaks found</div>
                  <div className="text-sm mt-1">Run a scan to detect revenue leaks across all 20 layers</div>
                </div>
              )}

              {filtered.map(leak => (
                <div key={leak.id}
                  className={`bg-white rounded-xl border shadow-sm transition-all ${expandedLeak === leak.id ? "ring-2 ring-blue-200" : "hover:shadow-md"}`}>
                  {/* Header Row */}
                  <div className="flex items-center gap-2.5 px-5 py-3 cursor-pointer"
                    onClick={() => setExpandedLeak(expandedLeak === leak.id ? null : leak.id)}>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sevColor(leak.severity) }} />

                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{
                        background: leak.dataSource === "intelligence" ? C.purpleBg : leak.dataSource === "tax-engine" ? C.orangeBg : C.blueBg,
                        color: leak.dataSource === "intelligence" ? C.purple : leak.dataSource === "tax-engine" ? C.orange : C.blue,
                      }}>
                      {leak.dataSource === "intelligence"
                        ? `${LAYER_ICONS[leak.layerName || ""] || "🧠"} ${leak.layerName || "Intel"}`
                        : leak.dataSource === "tax-engine"
                        ? "📑 Tax Engine"
                        : "🏭 Industry"}
                    </span>

                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-gray-100 text-gray-600">
                      {catIcon(leak.category)} {catLabel(leak.category)}
                    </span>

                    <span className="text-sm font-semibold truncate flex-1" style={{ color: C.text }}>{leak.title}</span>

                    <span className="text-sm font-black shrink-0" style={{ color: sevColor(leak.severity) }}>{fmt(leak.annualImpact)}/yr</span>

                    {leak.affiliatePartner && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: C.greenBg, color: C.green }}>🔗 {leak.affiliatePartner}</span>
                    )}

                    <span className="text-gray-400 text-[10px] shrink-0">{expandedLeak === leak.id ? "▼" : "▶"}</span>
                  </div>

                  {/* Expanded Detail */}
                  {expandedLeak === leak.id && (
                    <div className="px-5 pb-4 pt-2 border-t bg-gray-50/50">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div><div className="text-[10px] font-bold text-gray-400 uppercase">Your Value</div><div className="text-xs text-gray-700 mt-0.5">{leak.yours || "—"}</div></div>
                        <div><div className="text-[10px] font-bold text-gray-400 uppercase">Benchmark</div><div className="text-xs text-gray-700 mt-0.5">{leak.benchmark || "—"}</div></div>
                      </div>
                      {leak.description && (
                        <div className="mb-3"><div className="text-[10px] font-bold text-gray-400 uppercase">Analysis</div><div className="text-xs text-gray-600 mt-0.5 leading-relaxed">{leak.description}</div></div>
                      )}
                      {leak.fixAction && (
                        <div className="mb-3"><div className="text-[10px] font-bold text-gray-400 uppercase">Recommended Fix</div><div className="text-xs text-gray-600 mt-0.5">{leak.fixAction}</div></div>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <div className="flex gap-2">
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">Confidence: {leak.confidence}%</span>
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">Source: {leak.dataSource}</span>
                          {leak.layerId && <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-500">Layer: {leak.layerId}</span>}
                        </div>
                        <FixButton leak={leak} businessId={data?.businessId || ""} userId={userId} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* VIEW: 20 LAYERS                                                */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {view === "layers" && (
            <div className="space-y-6">
              {/* Industry Engine */}
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">🏭 Industry Engine</div>
                <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold" style={{ color: C.text }}>
                      {(data?.business?.industry || "Not set").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Industry-specific leak detection · estimate + real data</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ color: C.blue }}>{s?.industryLeaks || 0}</div>
                    <div className="text-[10px] text-gray-500">leaks detected</div>
                  </div>
                </div>
              </div>

              {/* Tiers 1-4 */}
              {[1, 2, 3, 4].map(tier => {
                const meta = TIER_META[tier];
                const layerResults = data?.layers.layerResults || [];
                const tierLayers = layerResults.filter((l: any) => l.tier === tier);

                // Fallback if no scan has been run yet
                const displayLayers = tierLayers.length > 0 ? tierLayers : Array.from({ length: 5 }, (_, i) => ({
                  id: `L${String((tier - 1) * 5 + i + 1).padStart(2, "0")}`,
                  name: LAYER_NAMES[(tier - 1) * 5 + i] || `Layer ${(tier - 1) * 5 + i + 1}`,
                  tier, status: "skipped", leaks: 0, ms: 0,
                }));

                const tierLeakCount = leaks.filter(l => {
                  if (l.dataSource !== "intelligence") return false;
                  const num = parseInt(l.layerId?.replace("L", "") || "0");
                  return num > (tier - 1) * 5 && num <= tier * 5;
                }).length;

                return (
                  <div key={tier}>
                    <div className="text-xs font-bold uppercase mb-2 flex items-center gap-2" style={{ color: meta.color }}>
                      {meta.icon} Tier {tier}: {meta.name}
                      <span className="text-gray-400 font-normal">· Layers {(tier-1)*5+1}–{tier*5} · {tierLeakCount} leaks</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {displayLayers.map((layer: any) => (
                        <div key={layer.id} className="bg-white rounded-xl border p-3 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-base">{LAYER_ICONS[layer.name] || "🔬"}</span>
                            <span className="text-[10px] font-bold truncate" style={{ color: C.text }}>{layer.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: layer.status === "success" ? C.greenBg : layer.status === "empty" ? C.orangeBg : layer.status === "error" ? C.redBg : "#f3f4f6",
                                color: layer.status === "success" ? C.green : layer.status === "empty" ? C.orange : layer.status === "error" ? C.red : C.dim,
                              }}>
                              {layer.status === "success" ? "✅ Active" : layer.status === "empty" ? "⚪ No data" : layer.status === "error" ? "❌ Error" : "⏭️ Waiting"}
                            </span>
                            {layer.leaks > 0 && <span className="text-sm font-black" style={{ color: meta.color }}>{layer.leaks}</span>}
                          </div>
                          {layer.ms > 0 && <div className="text-[9px] text-gray-400 mt-1">{layer.ms}ms</div>}
                          {layer.error && <div className="text-[9px] text-red-400 mt-1 truncate">{layer.error}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* VIEW: CATEGORIES                                               */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {view === "categories" && (
            <div className="grid grid-cols-2 gap-3">
              {(data?.categoryStats || []).map(cat => (
                <div key={cat.category}
                  className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => { setFilterCategory(cat.category); setView("leaks"); }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{catIcon(cat.category)}</span>
                      <div>
                        <span className="text-sm font-bold" style={{ color: C.text }}>{catLabel(cat.category)}</span>
                        {cat.topPartner && (
                          <div className="text-[9px]" style={{ color: C.green }}>🔗 {cat.topPartner}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black" style={{ color: cat.amount > 10000 ? C.red : cat.amount > 3000 ? C.orange : C.dim }}>
                        {fmt(cat.amount)}
                      </div>
                      <div className="text-[10px] text-gray-400">/yr leaking</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{cat.open} open · {cat.fixed} fixed</span>
                    {cat.hasPartner
                      ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.greenBg, color: C.green }}>🔗 Partners available</span>
                      : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">No partners yet</span>
                    }
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: cat.total > 0 ? (cat.fixed / cat.total * 100) : 0 + "%", background: C.green }} />
                  </div>
                </div>
              ))}

              {(data?.categoryStats || []).length === 0 && (
                <div className="col-span-2 text-center py-20 text-gray-400">
                  <div className="text-4xl mb-3">📊</div>
                  <div className="text-lg font-bold">No categories yet</div>
                  <div className="text-sm mt-1">Run a scan to see leak breakdown</div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* VIEW: AFFILIATE PARTNERS & REVENUE                             */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {view === "affiliates" && (
            <div className="space-y-6">
              {/* Revenue Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border shadow-sm p-4">
                  <div className="text-[10px] font-bold" style={{ color: C.dim }}>Total Clicks</div>
                  <div className="text-2xl font-black mt-1" style={{ color: C.blue }}>{data?.affiliate.totalClicks || 0}</div>
                </div>
                <div className="bg-white rounded-xl border shadow-sm p-4">
                  <div className="text-[10px] font-bold" style={{ color: C.dim }}>Conversions</div>
                  <div className="text-2xl font-black mt-1" style={{ color: C.green }}>{data?.affiliate.totalConversions || 0}</div>
                </div>
                <div className="bg-white rounded-xl border shadow-sm p-4">
                  <div className="text-[10px] font-bold" style={{ color: C.dim }}>Conversion Rate</div>
                  <div className="text-2xl font-black mt-1" style={{ color: C.orange }}>{data?.affiliate.conversionRate || "0%"}</div>
                </div>
                <div className="bg-white rounded-xl border shadow-sm p-4">
                  <div className="text-[10px] font-bold" style={{ color: C.dim }}>Categories Covered</div>
                  <div className="text-2xl font-black mt-1" style={{ color: C.purple }}>{data?.affiliate.coveredCategories || 0}/20</div>
                </div>
              </div>

              {/* Top Partners */}
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Top Partners by Clicks</div>
                <div className="bg-white rounded-xl border shadow-sm divide-y">
                  {(data?.affiliate.topPartners || []).length === 0 && (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      No affiliate clicks tracked yet. When users click "Fix with [Partner]", stats appear here.
                    </div>
                  )}
                  {(data?.affiliate.topPartners || []).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                      <span className="text-lg font-black w-6 text-right" style={{ color: C.dim }}>#{i + 1}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold" style={{ color: C.text }}>{p.name}</div>
                        <div className="text-xs text-gray-500">{p.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: C.blue }}>{p.total_clicks} clicks</div>
                        <div className="text-xs text-gray-500">{p.total_conversions} conversions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: C.green }}>${p.commission_value}</div>
                        <div className="text-xs text-gray-500">per conversion</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clicks by Category */}
              {Object.keys(data?.affiliate.categoryBreakdown || {}).length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-2">Clicks by Leak Category</div>
                  <div className="bg-white rounded-xl border shadow-sm p-4">
                    <div className="space-y-2">
                      {Object.entries(data?.affiliate.categoryBreakdown || {})
                        .sort(([, a], [, b]) => b - a)
                        .map(([cat, clicks]) => {
                          const maxClicks = Math.max(...Object.values(data?.affiliate.categoryBreakdown || {}));
                          return (
                            <div key={cat} className="flex items-center gap-3">
                              <span className="text-xs font-medium w-32 truncate" style={{ color: C.text }}>{catIcon(cat)} {catLabel(cat)}</span>
                              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all"
                                  style={{ width: maxClicks > 0 ? (clicks / maxClicks * 100) : 0 + "%", background: C.blue }} />
                              </div>
                              <span className="text-xs font-bold w-8 text-right" style={{ color: C.blue }}>{clicks}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
