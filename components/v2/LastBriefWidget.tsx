"use client";
// =============================================================================
// components/v2/LastBriefWidget.tsx
// Shows last monthly brief on each dashboard.
// Zero state: explains when first brief will arrive.
// Has brief: shows subject + "Read brief" modal.
// =============================================================================

import { useState, useEffect } from "react";


function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .trim();
}

interface BriefRecord {
  id: string;
  brief_subject: string;
  brief_content: string;
  sent_at: string;
}

interface LastBriefWidgetProps {
  businessId: string;
  lang?: "en" | "fr";
}

export function LastBriefWidget({ businessId, lang = "en" }: LastBriefWidgetProps) {
  const [brief, setBrief] = useState<BriefRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => (isFR ? fr : en);

  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/v2/brief/latest?businessId=${businessId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setBrief(d?.brief ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border-light p-4 animate-pulse" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="h-3 w-32 bg-bg-section rounded mb-2" />
        <div className="h-3 w-48 bg-bg-section rounded" />
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", borderStyle: "dashed" }}>
        <div className="flex items-start gap-3">
          <span className="text-base shrink-0">📧</span>
          <div>
            <p className="text-[12px] font-semibold text-ink">
              {t("Monthly Brief", "Bilan mensuel")}
            </p>
            <p className="text-[10px] text-ink-faint mt-0.5 leading-relaxed">
              {t(
                "Your first brief arrives 28 days after your diagnostic — a personalised summary of your progress and next steps.",
                "Votre premier bilan arrive 28 jours après votre diagnostic — un résumé personnalisé de vos progrès."
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sentDate = new Date(brief.sent_at).toLocaleDateString(isFR ? "fr-CA" : "en-CA", {
    month: "long", day: "numeric", year: "numeric",
  });

  // Extract plain-text preview from subject
  const preview = brief.brief_subject;

  return (
    <>
      <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="flex items-start gap-3">
          <span className="text-base shrink-0">📧</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                {t("Last Monthly Brief", "Dernier bilan mensuel")} · {sentDate}
              </p>
            </div>
            <p className="text-[12px] font-semibold text-ink mt-0.5 leading-snug truncate">
              &ldquo;{preview}&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowModal(true)}
                className="text-[10px] font-semibold text-brand hover:underline"
              >
                {t("Read brief →", "Lire le bilan →")}
              </button>
              <a href="/v2/tasks" className="text-[10px] font-semibold text-ink-muted hover:text-ink">
                {t("View action plan →", "Plan d'action →")}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Brief modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
              <div>
                <p className="text-[13px] font-bold text-ink">{t("Monthly Brief", "Bilan mensuel")}</p>
                <p className="text-[10px] text-ink-faint">{sentDate}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 flex items-center justify-center text-ink-faint hover:text-ink rounded-lg hover:bg-bg-section transition text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Brief content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="text-[13px] text-ink leading-relaxed space-y-3">
                {stripHtml(brief.brief_content).split("\n\n").filter(Boolean).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-border-light flex gap-3">
              <a href="/v2/tasks"
                className="flex-1 text-center py-2 text-[11px] font-bold text-white rounded-lg hover:opacity-90 transition"
                style={{ background: "#1B3A2D" }}>
                {t("View action plan →", "Plan d'action →")}
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-[11px] font-semibold text-ink-muted border border-border-light rounded-lg hover:bg-bg-section transition"
              >
                {t("Close", "Fermer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
