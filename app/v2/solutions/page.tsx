"use client";
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
  payment_processing: "💳", accounting: "📊", payroll: "👥",
  tax: "🧾", cash_flow: "💰", insurance: "🛡️",
  marketing: "📣", operations: "⚙️", inventory: "📦", hr: "👥",
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
  const icon = CATEGORY_ICONS[category] ?? "🔧";

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
              🍁 Canadian
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
            <span className="text-[10px] text-positive font-semibold px-3">✅ Added</span>
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
          💡 Solutions for {businessName}
        </h1>
        <p className="text-[11px] text-ink-faint mt-0.5">
          {totalSolutions} tools and services matched to your situation
          {industry && ` · ${industry}`}
          {province && ` · ${province}`}
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveCategory(null)}
          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${!activeCategory ? "bg-brand text-white" : "bg-bg-section text-ink-muted hover:text-ink"}`}>
          All
        </button>
        {groups.map(g => (
          <button key={g.category}
            onClick={() => setActiveCategory(activeCategory === g.category ? null : g.category)}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition ${activeCategory === g.category ? "bg-brand text-white" : "bg-bg-section text-ink-muted hover:text-ink"}`}>
            {CATEGORY_ICONS[g.category] ?? "🔧"} {CATEGORY_LABELS[g.category] ?? g.category}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setFilterFree(!filterFree)}
            className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition ${filterFree ? "border-positive bg-positive/5 text-positive" : "border-border-light text-ink-faint"}`}>
            Free only
          </button>
          <button onClick={() => setFilterCA(!filterCA)}
            className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition ${filterCA ? "border-red-400 bg-red-50 text-red-600" : "border-border-light text-ink-faint"}`}>
            🍁 Canadian
          </button>
        </div>
      </div>

      {/* Solution cards */}
      {displayGroups.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-[13px] font-bold text-ink mb-1">No solutions match your filters.</p>
          <p className="text-[11px] text-ink-faint">Try removing a filter or run your diagnostic to generate matched solutions.</p>
        </div>
      ) : (
        displayGroups.map(g => (
          <div key={g.category}>
            <h2 className="text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2">
              {CATEGORY_ICONS[g.category] ?? "🔧"} {CATEGORY_LABELS[g.category] ?? g.category}
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
