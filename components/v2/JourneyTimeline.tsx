"use client";
// =============================================================================
// components/v2/JourneyTimeline.tsx
// Shows prescan → diagnostics → tasks as a timeline on the dashboard.
// Only renders if prescan data exists. Fully optional — zero state = no render.
// =============================================================================

import { useState, useEffect } from "react";

interface TimelineEntry {
  type:     "prescan" | "diagnostic" | "tasks";
  date:     string;
  reportId?: string;
  title:    string;
  subtitle?: string | null;
  narrative?: string | null;
  meta:     Record<string, any>;
}

interface JourneyTimelineProps {
  businessId: string;
  lang?: "en" | "fr";
}

const TYPE_ICON: Record<string, string> = {
  prescan:    "🔍",
  diagnostic: "📊",
  tasks:      "✅",
};

const TYPE_COLOR: Record<string, string> = {
  prescan:    "rgba(196,132,29,0.12)",
  diagnostic: "rgba(27,58,45,0.10)",
  tasks:      "rgba(45,122,80,0.10)",
};

const TYPE_BORDER: Record<string, string> = {
  prescan:    "#C4841D",
  diagnostic: "#1B3A2D",
  tasks:      "#2D7A50",
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

export function JourneyTimeline({ businessId, lang = "en" }: JourneyTimelineProps) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [hasPrescan, setHasPrescan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => (isFR ? fr : en);

  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/v2/timeline?businessId=${businessId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.entries) setEntries(d.entries);
        setHasPrescan(d?.hasPrescan ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  // Only render if there's a prescan — this is the continuity feature
  if (loading || !hasPrescan || entries.length === 0) return null;

  const SHOW_LIMIT = 3;
  const visibleEntries = expanded ? entries : entries.slice(-SHOW_LIMIT);

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

      <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
        <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
          {t("Your Journey", "Votre parcours")}
        </span>
        {entries.length > SHOW_LIMIT && (
          <button onClick={() => setExpanded(!expanded)}
            className="text-[9px] font-semibold text-brand hover:underline">
            {expanded ? t("Show less", "Voir moins") : t(`Show all ${entries.length}`, `Tout voir (${entries.length})`)}
          </button>
        )}
      </div>

      <div className="px-4 py-3 space-y-0">
        {visibleEntries.map((entry, i) => {
          const isLast = i === visibleEntries.length - 1;
          const color  = TYPE_BORDER[entry.type] ?? "#888";
          const bg     = TYPE_COLOR[entry.type]  ?? "rgba(0,0,0,0.04)";

          return (
            <div key={i} className="flex gap-3">
              {/* Timeline spine */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] mt-0.5"
                  style={{ background: bg, border: `1px solid ${color}40` }}>
                  {TYPE_ICON[entry.type]}
                </div>
                {!isLast && <div className="w-px flex-1 my-1" style={{ background: "#E8E6E1", minHeight: "12px" }} />}
              </div>

              {/* Entry content */}
              <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-3"}`}>
                <p className="text-[9px] text-ink-faint mb-0.5">{fmtDate(entry.date)}</p>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-ink leading-snug">
                      {entry.type === "diagnostic" && entry.reportId ? (
                        <a href={`/v2/diagnostic/${entry.reportId}`}
                          className="hover:text-brand transition-colors">
                          {entry.title}
                        </a>
                      ) : entry.title}
                    </p>
                    {entry.subtitle && (
                      <p className="text-[10px] text-ink-faint mt-0.5">{entry.subtitle}</p>
                    )}
                    {entry.narrative && (
                      <p className="text-[10px] text-ink-muted mt-1 italic">&ldquo;{entry.narrative}&rdquo;</p>
                    )}
                  </div>
                  {entry.type === "diagnostic" && entry.meta?.score && (
                    <span className="text-[10px] font-bold shrink-0"
                      style={{ color: entry.meta.score >= 70 ? "#2D7A50" : entry.meta.score >= 50 ? "#C4841D" : "#B34040" }}>
                      {entry.meta.score}/100
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
