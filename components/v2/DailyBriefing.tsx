// =============================================================================
// components/v2/DailyBriefing.tsx — Proactive AI Daily Briefing Card
// =============================================================================
// Fetches /api/v2/ai-briefing on mount and renders 2-4 insight bullet points.
// "Ask AI about this" buttons open the chat widget with a pre-filled prompt.
// =============================================================================

"use client";

import { useState, useEffect } from "react";

interface Insight {
  icon: string;
  text: string;
  chatPrompt?: string;
}

interface DailyBriefingProps {
  lang?: "en" | "fr";
  onAskAi?: (prompt: string) => void;
}

export default function DailyBriefing({ lang = "en", onAskAi }: DailyBriefingProps) {
  const [briefing, setBriefing] = useState<{ date: string; insights: Insight[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const isFr = lang === "fr";

  useEffect(() => {
    fetch("/api/v2/ai-briefing")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.success && d.briefing) setBriefing(d.briefing);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border-light p-5 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />
          <span className="text-[11px] text-ink-faint">{isFr ? "Chargement du briefing..." : "Loading briefing..."}</span>
        </div>
      </div>
    );
  }

  if (!briefing || briefing.insights.length === 0) return null;

  const dateStr = briefing.date
    ? new Date(briefing.date + "T12:00:00").toLocaleDateString(isFr ? "fr-CA" : "en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden mb-5"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-border-light/50">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "linear-gradient(135deg, rgba(27,58,45,0.08), rgba(45,122,80,0.12))" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <div>
            <h3 className="text-[13px] font-bold text-ink leading-tight">
              {isFr ? "Briefing du jour" : "Today's Briefing"}
            </h3>
            {dateStr && (
              <p className="text-[10px] text-ink-faint">{dateStr}</p>
            )}
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-ink-faint px-2 py-1 rounded-full bg-bg-section">
          AI
        </span>
      </div>

      {/* Insights */}
      <div className="px-5 py-3 space-y-2.5">
        {briefing.insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 group">
            <span className="text-[16px] leading-none mt-0.5 shrink-0">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-ink leading-relaxed">{insight.text}</p>
              {insight.chatPrompt && onAskAi && (
                <button
                  onClick={() => onAskAi(insight.chatPrompt!)}
                  className="text-[10px] font-semibold text-brand hover:underline mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isFr ? "Demander \u00e0 l'IA \u2192" : "Ask AI about this \u2192"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
