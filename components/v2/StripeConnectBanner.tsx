"use client";
// =============================================================================
// components/v2/StripeConnectBanner.tsx
// Shows Stripe revenue signals when connected; connect CTA when not.
// Uses a redirect (same as QB) — no modal needed.
// =============================================================================

import { useState, useEffect } from "react";

interface StripeStatus {
  connected:    boolean;
  status?:      string;
  livemode?:    boolean;
  last_sync_at?: string;
  last_error?:  string;
  summary?: {
    mrr:             number;
    arr:             number;
    revenue_ttm:     number;
    refund_rate_pct: number;
    churn_rate_pct:  number;
    active_subs:     number;
    customer_count:  number;
    stripe_fees_ttm: number;
    failed_pct:      number;
  };
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

export default function StripeConnectBanner() {
  const [status,  setStatus]  = useState<StripeStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    fetch("/api/stripe-connect/status")
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  async function resync() {
    setSyncing(true); setSyncMsg("");
    try {
      const res  = await fetch("/api/stripe-connect/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMsg("Synced");
        const fresh = await fetch("/api/stripe-connect/status").then(r => r.json()).catch(() => null);
      if (!fresh) return;
        setStatus(fresh);
      } else {
        setSyncMsg(data.error || "Sync failed");
      }
    } catch {
      setSyncMsg("Sync failed");
    } finally {
      setSyncing(false);
      const _to = setTimeout(() => setSyncMsg(""), 3000);
    }
  }

  if (status === null) return null;

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!status.connected) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
        style={{ background: "rgba(27,58,45,0.03)", border: "1px solid rgba(27,58,45,0.12)" }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "rgba(27,58,45,0.08)" }}>
            {/* Stripe-like icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-ink">Connect Stripe</p>
            <p className="text-[10px] text-ink-faint">Real MRR, churn rate, refunds &amp; processing fees from your Stripe account</p>
          </div>
        </div>
        <a href="/api/stripe-connect/connect"
          className="shrink-0 h-7 px-3 text-[11px] font-bold text-white rounded-lg transition"
          style={{ background: "#1B3A2D" }}>
          Connect →
        </a>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (status.status === "error") {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
        style={{ background: "rgba(179,64,64,0.03)", border: "1px solid rgba(179,64,64,0.12)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-[6px] h-[6px] rounded-full bg-negative shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-negative">Stripe sync error</p>
            <p className="text-[10px] text-ink-faint">{status.last_error || "Reconnect to restore live data"}</p>
          </div>
        </div>
        <a href="/api/stripe-connect/connect"
          className="text-[11px] font-semibold text-negative border border-negative/20 px-2.5 py-1 rounded-lg hover:bg-negative/5 transition">
          Reconnect
        </a>
      </div>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  const s = status.summary!;
  const hasLeaks = (s.refund_rate_pct > 3) || (s.churn_rate_pct > 5) || (s.failed_pct > 2) || (s.stripe_fees_ttm > 5000);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
      style={{ background: "rgba(45,122,80,0.04)", border: "1px solid rgba(45,122,80,0.14)" }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-[6px] h-[6px] rounded-full bg-positive shrink-0" />
        <div className="flex items-center gap-4 min-w-0 flex-wrap">
          <span className="text-[11px] font-semibold text-positive whitespace-nowrap">
            Stripe Live{!status.livemode ? " (test)" : ""}
          </span>
          {s.mrr > 0 && (
            <span className="text-[10px] text-ink-secondary whitespace-nowrap">
              {fmt(s.mrr)}/mo MRR
            </span>
          )}
          {s.revenue_ttm > 0 && s.mrr === 0 && (
            <span className="text-[10px] text-ink-secondary whitespace-nowrap">
              {fmt(s.revenue_ttm)} TTM
            </span>
          )}
          {s.churn_rate_pct > 0 && (
            <span className={`text-[10px] font-semibold whitespace-nowrap ${s.churn_rate_pct > 5 ? "text-negative" : "text-ink-faint"}`}>
              {s.churn_rate_pct}% churn
            </span>
          )}
          {s.refund_rate_pct > 0 && (
            <span className={`text-[10px] whitespace-nowrap ${s.refund_rate_pct > 3 ? "text-caution font-semibold" : "text-ink-faint"}`}>
              {s.refund_rate_pct}% refunds
            </span>
          )}
          {s.stripe_fees_ttm > 0 && (
            <span className="text-[10px] text-ink-faint whitespace-nowrap">
              {fmt(s.stripe_fees_ttm)} fees
            </span>
          )}
          {status.last_sync_at && (
            <span className="text-[9px] text-ink-faint whitespace-nowrap">
              {timeAgo(status.last_sync_at)}
            </span>
          )}
          {hasLeaks && (
            <span className="text-[9px] font-bold text-caution uppercase tracking-wider whitespace-nowrap">
              ⚠ leaks detected
            </span>
          )}
        </div>
      </div>
      <button onClick={resync} disabled={syncing}
        className="shrink-0 h-6 px-2.5 text-[10px] font-semibold text-ink-faint border border-border rounded-md hover:border-brand/30 hover:text-brand transition disabled:opacity-40">
        {syncing ? "Syncing…" : syncMsg || "Re-sync"}
      </button>
    </div>
  );
}
