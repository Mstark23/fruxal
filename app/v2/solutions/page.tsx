"use client";

const CATEGORY_SVG: Record<string, JSX.Element> = {
  payment_processing: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  accounting:         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  payroll:            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  tax:                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
  cash_flow:          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>,
  insurance:          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  marketing:          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>,
  operations:         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
  inventory:          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  hr:                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
};

// =============================================================================
// app/v2/solutions/page.tsx
// Browse solutions matched to this business — filter by category, free/paid, CA
// "Add to my tasks" creates a diagnostic_tasks entry
// Affiliate disclosure footer note only
// =============================================================================

import { useState, useEffect, useCallback } from "react";

interface Solution {
  id:                  string;
  name:                string;
  description:         string;
  category:            string;
  url:                 string;
  savings_estimate:    string | null;
  is_free:             boolean;
  canadian_specific:   boolean;
  effort_to_implement: string | null;
  relevance_score:     number;
  match_reasons:       string[];
}

interface CategoryGroup { category: string; solutions: Solution[]; }

const CATEGORY_LABELS: Record<string, string> = {
  payment_processing: "Payment", accounting: "Accounting",
  payroll: "HR/Payroll", tax: "Tax", cash_flow: "Cash Flow",
  insurance: "Insurance", marketing: "Marketing", operations: "Operations",
  inventory: "Inventory", hr: "HR/Payroll",
};

const CATEGORY_ICONS: Record<string, string> = {
  payment_processing: "", accounting: "", payroll: "",
  tax: "", cash_flow: "", insurance: "",
  marketing: "", operations: "", inventory: "", hr: "",
};

function trackClick(sol: Solution, source: string, businessId: string, taskId?: string) {
  fetch("/api/v2/solutions/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      solutionId:   sol.id,
      solutionName: sol.name,
      url:          sol.url,
      source, businessId, taskId,
    }),
  }).catch(() => {});
  window.open(sol.url, "_blank", "noopener noreferrer");
}

function SolutionCard({
  sol, category, businessId, onAddTask,
}: {
  sol: Solution; category: string; businessId: string;
  onAddTask: (sol: Solution, cat: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const icon = "";

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden hover:shadow-sm transition"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-[13px] font-bold text-ink">{sol.name}</span>
          {sol.canadian_specific && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(227,0,0,0.07)", color: "#CC0000" }}>
              Canadian
            </span>
          )}
          {sol.is_free && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(45,122,80,0.08)", color: "#2D7A50" }}>
              Free
            </span>
          )}
        </div>
        <span className="text-[9px] font-semibold text-ink-faint">
          {sol.relevance_score}% match
        </span>
      </div>

      <div className="px-4 py-3">
        <p className="text-[11px] text-ink-muted leading-relaxed mb-2">{sol.description}</p>

        {sol.savings_estimate && (
          <div className="mb-2">
            <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-0.5">Why it matches you</p>
            <p className="text-[11px] text-positive">{sol.savings_estimate}</p>
          </div>
        )}

        {sol.match_reasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {sol.match_reasons.slice(0, 2).map((r, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-bg-section text-ink-faint">
                {r}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => trackClick(sol, "solutions_page", businessId)}
            className="flex-1 py-2 text-[11px] font-bold text-white rounded-lg hover:opacity-90 transition"
            style={{ background: "#1B3A2D" }}>
            Learn more →
          </button>
          {!added ? (
            <button
              onClick={async () => {
                setAdding(true);
                await onAddTask(sol, category);
                setAdded(true);
                setAdding(false);
              }}
              disabled={adding}
              className="px-3 py-2 text-[10px] font-semibold border border-border-light text-ink-muted rounded-lg hover:bg-bg-section transition disabled:opacity-40">
              {adding ? "Adding…" : "Add to tasks"}
            </button>
          ) : (
            <span className="text-[10px] text-positive font-semibold px-3">Added</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SolutionsPage() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [businessName, setBusinessName] = useState("Your Business");
  const [industry, setIndustry] = useState("");
  const [province, setProvince] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterFree, setFilterFree] = useState(false);
  const [filterCA, setFilterCA] = useState(false);

  useEffect(() => {
    fetch("/api/v2/dashboard")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const bid = d?.data?.businessId ?? "";
        setBusinessId(bid);
        setIndustry(d?.data?.industry ?? "");
        setProvince(d?.data?.province ?? "QC");
        if (bid) return fetch(`/api/v2/solutions?businessId=${bid}&action=browse`);
        return null;
      })
      .then(r => r?.ok ? r.json() : null)
      .then(d => {
        if (d?.categories) setGroups(d.categories);
        if (d?.businessName) setBusinessName(d.businessName);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddTask = useCallback(async (sol: Solution, category: string) => {
    if (!businessId) return;
    await fetch("/api/v2/solutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        solutionId:   sol.id,
        solutionName: sol.name,
        solutionUrl:  sol.url,
        category,
      }),
    }).catch(() => {});
  }, [businessId]);

  const totalSolutions = groups.reduce((s, g) => s + g.solutions.length, 0);
  const displayGroups = groups
    .filter(g => !activeCategory || g.category === activeCategory)
    .map(g => ({
      ...g,
      solutions: g.solutions.filter(s =>
        (!filterFree || s.is_free) && (!filterCA || s.canadian_specific)
      ),
    }))
    .filter(g => g.solutions.length > 0);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-64 bg-bg-section rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-bg-section rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-[18px] font-black text-ink">
          Solutions for {businessName}
        </h1>
        <p className="text-[11px] text-ink-faint mt-0.5">
          {totalSolutions} tools and services matched to your situation
          {industry && ` · ${industry}`}
          {province && ` · ${province}`}
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setActiveCategory(null)}
          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${!activeCategory ? "bg-brand text-white" : "bg-bg-section text-ink-muted hover:text-ink"}`}>
          All
        </button>
        {groups.map(g => (
          <button key={g.category}
            onClick={() => setActiveCategory(activeCategory === g.category ? null : g.category)}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeCategory === g.category ? "bg-brand text-white" : "bg-bg-section text-ink-muted hover:text-ink"}`}>
            <>{CATEGORY_SVG[g.category] ? <span className="mr-1.5 inline-flex items-center opacity-60">{CATEGORY_SVG[g.category]}</span> : null}{CATEGORY_LABELS[g.category] ?? g.category}</>
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setFilterFree(!filterFree)}
            className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition ${filterFree ? "border-positive bg-positive/5 text-positive" : "border-border-light text-ink-faint"}`}>
            Free only
          </button>
          <button onClick={() => setFilterCA(!filterCA)}
            className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition ${filterCA ? "border-red-400 bg-red-50 text-red-600" : "border-border-light text-ink-faint"}`}>
            Canadian
          </button>
        </div>
      </div>

      {/* Solution cards */}
      {displayGroups.length === 0 ? (
        <div className="text-center py-10">
          <svg className="w-6 h-6 mx-auto mb-2 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p className="text-[13px] font-bold text-ink mb-1">No solutions match your filters.</p>
          <p className="text-[11px] text-ink-faint">Try removing a filter or run your diagnostic to generate matched solutions.</p>
        </div>
      ) : (
        displayGroups.map(g => (
          <div key={g.category}>
            <h2 className="text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2">
              <>{CATEGORY_SVG[g.category] ? <span className="mr-1.5 inline-flex items-center opacity-60">{CATEGORY_SVG[g.category]}</span> : null}{CATEGORY_LABELS[g.category] ?? g.category}</>
            </h2>
            <div className="space-y-3">
              {g.solutions.map(s => (
                <SolutionCard key={s.id} sol={s} category={g.category}
                  businessId={businessId} onAddTask={handleAddTask} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Affiliate disclosure */}
      {totalSolutions > 0 && (
        <p className="text-[9px] text-ink-faint text-center pb-2">
          Some recommendations may include affiliate relationships.
          We only recommend solutions we&apos;d genuinely suggest.
        </p>
      )}
    </div>
  );
}
