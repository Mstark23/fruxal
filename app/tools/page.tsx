"use client";

import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Tool {
  id: number; slug: string; name: string; type: "AFFILIATE" | "FREE";
  category: string; description: string; url: string | null;
  regions: string[]; relevance: number; matchedLeaks: string[]; whyYouNeed: string;
}
interface Category { name: string; tools: Tool[]; count: number; freeCount: number; paidCount: number; }
interface LeakSummary { id: string; category: string; title: string; annualImpact: number; severity: string; toolCount: number; }
interface ToolsData {
  region: { code: string; name: string; currency: { code: string; symbol: string } };
  industry: string; hasScanned: boolean; leakCategories: string[];
  recommended: Category[]; otherTools: Category[];
  totalTools: number;
  summary: { recommended: number; other: number; free: number; paid: number };
  leakSummary: LeakSummary[];
  availableRegions: string[];
}

const FLAGS: Record<string, { flag: string; name: string }> = {
  US: { flag: "🇺🇸", name: "USA" }, CA: { flag: "🇨🇦", name: "Canada" },
  UK: { flag: "🇬🇧", name: "UK" }, AU: { flag: "🇦🇺", name: "Australia" },
};

const CAT_ICONS: Record<string, string> = {
  Payments:"💳", Accounting:"📒", Payroll:"💰", Marketing:"📢", CRM:"👥",
  Scheduling:"📅", POS:"🏪", Government:"🏛️", DIY:"🔧", "E-commerce":"🛒",
  Analytics:"📊", Booking:"📋", Insurance:"🛡️", Inventory:"📦", Compliance:"✅",
  Email:"📧", SEO:"🔍", Security:"🔒", "Time Tracking":"⏱️", Invoicing:"📃",
  "Field Service":"🚐", "Tax PM":"📋", Bookkeeping:"📒", "Restaurant POS":"🍽️",
  "Auto Repair":"🔧", "Construction PM":"🏗️", "Dental PM":"🦷", "Legal PM":"⚖️",
  "Fitness Mgmt":"💪", "Gym Mgmt":"🏋️", "Home Care":"🏥", Other:"⚙️",
};

const fmt = (n: number) => n >= 1000 ? `$${Math.round(n/1000)}K` : `$${Math.round(n)}`;

export default function ToolsPage() {
  const router = useRouter();
  const [data, setData] = useState<ToolsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRegion, setActiveRegion] = useState("");
  const [search, setSearch] = useState("");
  const [changingRegion, setChangingRegion] = useState(false);
  const [showOther, setShowOther] = useState(false);

  const fetchTools = (region?: string) => {
    setLoading(true);
    fetch(region ? `/api/tools?region=${region}` : "/api/tools")
      .then(r => r.ok ? r.json() : r.json().then(e => { throw new Error(e.error); }))
      .then(d => { setData(d); setActiveRegion(d.region.code); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { fetchTools(); }, []);

  const changeRegion = async (code: string) => {
    setChangingRegion(true);
    try { await fetch("/api/tools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ region: code }) }); } catch { /* non-fatal */ }
    fetchTools(code);
    setChangingRegion(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl animate-pulse mb-4">🧰</div>
            <div className="text-gray-500">Finding tools for your business...</div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">🔧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan your business first</h1>
            <p className="text-gray-500 mb-6">We need to know what problems you have before we can recommend the right tools.</p>
            <button onClick={() => router.push("/scan")} className="px-6 py-3 bg-[#00c853] text-white font-bold rounded-xl hover:bg-[#00b848] transition">
              Scan My Business →
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Search filter
  const filterCats = (cats: Category[]) => {
    if (!search) return cats;
    const q = search.toLowerCase();
    return cats.map(c => ({
      ...c,
      tools: c.tools.filter(t => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
    })).filter(c => c.tools.length > 0);
  };

  const recCats = filterCats(data.recommended);
  const otherCats = filterCats(data.otherTools);
  const regionInfo = FLAGS[activeRegion] || FLAGS.US;

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🧰</span>
              <h1 className="text-2xl font-bold text-gray-900">Your Toolbox</h1>
            </div>
            <p className="text-sm text-gray-500 ml-12">
              {data.hasScanned
                ? `${data.summary.recommended} tools that fix your specific problems · ${data.summary.other} other tools available`
                : "Run a scan first to get personalized tool recommendations"}
            </p>

            {/* Region + Search */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="flex items-center gap-1">
                {Object.entries(FLAGS).map(([code, info]) => (
                  <button key={code} onClick={() => changeRegion(code)} disabled={changingRegion}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition ${
                      activeRegion === code ? "bg-[#00c853] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    <span>{info.flag}</span><span>{code}</span>
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Search tools..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]" />
            </div>
          </div>
        </div>

        {/* ── Problems Found (scan summary) ───────────────────────── */}
        {data.hasScanned && data.leakSummary.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 pt-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-red-800 mb-3">Problems found in your business</h2>
              <div className="flex flex-wrap gap-2">
                {[...new Set(data.leakSummary.map(l => l.category))].map(cat => {
                  const catLeaks = data.leakSummary.filter(l => l.category === cat);
                  const totalImpact = catLeaks.reduce((s, l) => s + l.annualImpact, 0);
                  const toolCount = Math.max(...catLeaks.map(l => l.toolCount));
                  return (
                    <div key={cat} className="bg-white border border-red-100 rounded-xl px-3 py-2">
                      <div className="text-xs font-bold text-red-700">{cat}</div>
                      <div className="text-[10px] text-red-500">{fmt(totalImpact)}/yr · {toolCount} tools to fix</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Recommended For You ─────────────────────────────────── */}
        {data.hasScanned && recCats.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⭐</span>
              <h2 className="text-lg font-bold text-gray-900">Recommended For You</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{data.summary.recommended} tools</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 ml-8">These tools directly fix the problems we found in your scan</p>

            <div className="space-y-3">
              {recCats.map(cat => (
                <ToolCategory key={cat.name} cat={cat} isRecommended />
              ))}
            </div>
          </div>
        )}

        {/* ── Not Scanned Banner ──────────────────────────────────── */}
        {!data.hasScanned && (
          <div className="max-w-5xl mx-auto px-6 pt-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Scan first for personalized recommendations</h2>
              <p className="text-sm text-gray-500 mb-4">Right now you&apos;re seeing all tools. After a scan, we&apos;ll only show the ones that fix YOUR problems.</p>
              <button onClick={() => router.push("/scan")} className="px-6 py-2.5 bg-[#00c853] text-white font-bold rounded-xl hover:bg-[#00b848] transition">
                Scan My Business →
              </button>
            </div>
          </div>
        )}

        {/* ── Other Available Tools ───────────────────────────────── */}
        {otherCats.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 pt-6 pb-4">
            <button onClick={() => setShowOther(!showOther)}
              className="flex items-center gap-2 mb-3 group">
              <span className="text-lg">📦</span>
              <h2 className="text-lg font-bold text-gray-900">
                {data.hasScanned ? "Other Tools Available" : "All Tools For Your Industry"}
              </h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{data.summary.other || data.totalTools}</span>
              <span className={`text-gray-400 transition-transform ${showOther ? "rotate-180" : ""}`}>▾</span>
            </button>

            {(showOther || !data.hasScanned) && (
              <div className="space-y-3">
                {otherCats.map(cat => (
                  <ToolCategory key={cat.name} cat={cat} isRecommended={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Region Notice ───────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 pb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl shrink-0">{regionInfo.flag}</span>
            <div>
              <h3 className="text-sm font-bold text-blue-800">Showing tools for {FLAGS[activeRegion]?.name || activeRegion}</h3>
              <p className="text-xs text-blue-600 mt-0.5">
                We filter out tools that don&apos;t work in your country. Switch regions above if you need different results.
              </p>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

// ─── Tool Category Component ──────────────────────────────────────────────────
function ToolCategory({ cat, isRecommended }: { cat: Category; isRecommended: boolean }) {
  const [expanded, setExpanded] = useState(isRecommended);
  const icon = CAT_ICONS[cat.name] || "⚙️";

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${isRecommended ? "border-green-200 shadow-sm" : ""}`}>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon}</span>
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
            <p className="text-[11px] text-gray-500">
              {cat.count} {cat.count === 1 ? "tool" : "tools"}
              {cat.freeCount > 0 && <span className="text-green-600"> · {cat.freeCount} free</span>}
            </p>
          </div>
        </div>
        <span className={`text-gray-400 transition-transform text-sm ${expanded ? "rotate-180" : ""}`}>▾</span>
      </button>

      {expanded && (
        <div className="border-t">
          {cat.tools.map((tool, i) => (
            <div key={tool.slug + i}
              className={`flex items-center gap-3 px-4 py-3 ${i < cat.tools.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/50 transition`}>

              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                tool.type === "FREE" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}>
                {tool.type === "FREE" ? "FREE" : "PAID"}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900">{tool.name}</h4>
                  {!tool.regions?.includes("GLOBAL") && (
                    <div className="flex gap-0.5">
                      {tool.regions?.map(r => <span key={r} className="text-[9px] px-1 rounded bg-gray-100 text-gray-500">{r}</span>)}
                    </div>
                  )}
                </div>
                {tool.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{tool.description}</p>}
                {isRecommended && tool.whyYouNeed && (
                  <p className="text-[11px] text-green-600 font-medium mt-0.5">✓ {tool.whyYouNeed}</p>
                )}
              </div>

              {tool.url ? (
                <a href={tool.url} target="_blank" rel="noopener noreferrer"
                  className={`text-xs px-3.5 py-2 rounded-lg font-medium shrink-0 transition ${
                    tool.type === "FREE" ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}>
                  {tool.type === "FREE" ? "Get Free →" : "Try It →"}
                </a>
              ) : (
                <span className="text-xs px-3.5 py-2 rounded-lg bg-gray-50 text-gray-400 shrink-0">DIY Tip</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
