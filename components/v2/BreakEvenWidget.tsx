"use client";
// =============================================================================
// components/v2/BreakEvenWidget.tsx
// Compact break-even widget for dashboard injection
// Three display modes: solo (simple), business (full), enterprise (with annualized)
// Links to /v2/breakeven for full analysis
// Shows setup prompt when no data exists
// =============================================================================

import { useState, useEffect } from "react";

interface BreakEvenData {
  break_even_revenue: number;
  current_revenue: number;
  safety_margin: number;
  safety_margin_pct: number;
  data_source: string;
}

interface BreakEvenWidgetProps {
  businessId: string;
  tier: "solo" | "business" | "enterprise";
  lang?: "en" | "fr";
}

function fmt(n: number) { return "$" + Math.round(n ?? 0).toLocaleString(); }

function safetyStatus(pct: number): "comfortable" | "thin" | "below" {
  if (pct >= 20) return "comfortable";
  if (pct >= 0)  return "thin";
  return "below";
}

const STATUS_COLORS = {
  comfortable: { text: "#2D7A50", icon: "✅" },
  thin:        { text: "#C4841D", icon: "⚠️" },
  below:       { text: "#B34040", icon: "❌" },
};

export function BreakEvenWidget({ businessId, tier, lang = "en" }: BreakEvenWidgetProps) {
  const [data, setData] = useState<BreakEvenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => (isFR ? fr : en);

  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/v2/breakeven?businessId=${businessId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.data) setData(d.data);
        else setSetupRequired(true);
      })
      .catch(() => setSetupRequired(true))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border-light p-4 animate-pulse" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="h-3 w-24 bg-bg-section rounded mb-2" />
        <div className="h-6 w-32 bg-bg-section rounded" />
      </div>
    );
  }

  // Setup prompt — no break-even data yet
  if (setupRequired || !data) {
    return (
      <a href="/v2/breakeven"
        className="block bg-white rounded-xl border border-border-light p-4 hover:shadow-md transition-all group"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", borderStyle: "dashed" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(27,58,45,0.05)", border: "1px solid rgba(27,58,45,0.12)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-ink">
              {t("Know your break-even point", "Connaissez votre seuil de rentabilité")}
            </p>
            <p className="text-[10px] text-ink-faint mt-0.5">
              {t("2-minute setup →", "Configuration 2 minutes →")}
            </p>
          </div>
        </div>
      </a>
    );
  }

  const status = safetyStatus(data.safety_margin_pct ?? 0);
  const statusColor = STATUS_COLORS[status];

  // ── SOLO — simple version ────────────────────────────────────────────────────
  if (tier === "solo") {
    return (
      <a href="/v2/breakeven" className="block bg-white rounded-xl border border-border-light p-4 hover:shadow-md transition-all"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-2">
          {t("Break-Even", "Seuil de rentabilité")}
        </p>
        <p className="text-[18px] font-black text-ink">{fmt(data.break_even_revenue)}/{t("mo", "mois")}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px]">{statusColor.icon}</span>
          <span className="text-[11px] font-semibold" style={{ color: statusColor.text }}>
            {data.safety_margin >= 0 ? "+" : ""}{fmt(data.safety_margin)} {t("above this month", "au-dessus ce mois")}
          </span>
        </div>
      </a>
    );
  }

  // ── BUSINESS — full version ──────────────────────────────────────────────────
  if (tier === "business") {
    return (
      <div className="bg-white rounded-xl border border-border-light overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="px-4 py-3 flex items-center justify-between border-b border-border-light">
          <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
            {t("Break-Even", "Seuil de rentabilité")}
          </span>
          <a href="/v2/breakeven" className="text-[9px] font-semibold text-brand hover:underline">
            {t("Full analysis →", "Analyse complète →")}
          </a>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[22px] font-black text-ink">{fmt(data.break_even_revenue)}</span>
            <span className="text-[10px] text-ink-faint">/{t("month", "mois")}</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={status} />
            <span className="text-[11px] font-semibold" style={{ color: statusColor.text }}>
              {t("Safety margin:", "Marge de sécurité :")} {fmt(data.safety_margin)} ({Math.round(data.safety_margin_pct ?? 0)}%)
            </span>
            <span className="text-[11px]">{statusColor.icon}</span>
          </div>
          <a href="/v2/breakeven"
            className="block mt-1 text-center py-1.5 text-[10px] font-bold rounded-lg border border-brand/20 text-brand hover:bg-brand/5 transition">
            {t("Model a decision →", "Simuler une décision →")}
          </a>
        </div>
      </div>
    );
  }

  // ── ENTERPRISE — with annualized view ─────────────────────────────────────
  const annualBuffer = Math.round((data.safety_margin ?? 0) * 12);
  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-border-light">
        <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
          {t("Break-Even", "Seuil de rentabilité")}
        </span>
        <a href="/v2/breakeven" className="text-[9px] font-semibold text-brand hover:underline">
          {t("Full analysis →", "Analyse complète →")}
        </a>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[22px] font-black text-ink">{fmt(data.break_even_revenue)}</span>
          <span className="text-[10px] text-ink-faint">/{t("month", "mois")}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <span className="text-[11px] font-semibold" style={{ color: statusColor.text }}>
            {t("Safety margin:", "Marge :")} {fmt(data.safety_margin)} ({Math.round(data.safety_margin_pct ?? 0)}%) {statusColor.icon}
          </span>
        </div>
        {annualBuffer !== 0 && (
          <p className="text-[10px] text-ink-muted">
            {t("Annual safety buffer:", "Coussin annuel :")} <span className="font-bold text-ink">{fmt(annualBuffer)}</span>
          </p>
        )}
        <a href="/v2/breakeven"
          className="block mt-1 text-center py-1.5 text-[10px] font-bold rounded-lg border border-brand/20 text-brand hover:bg-brand/5 transition">
          {t("Model a decision →", "Simuler une décision →")}
        </a>
      </div>
    </div>
  );
}

// Helper dot used in business/enterprise views
function StatusDot({ status }: { status: "comfortable" | "thin" | "below" }) {
  const colors = { comfortable: "#2D7A50", thin: "#C4841D", below: "#B34040" };
  return <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: colors[status] }} />;
}
