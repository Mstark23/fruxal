"use client";
// =============================================================================
// components/v2/QBConnectBanner.tsx
// Drops into solo, business, and enterprise dashboards.
// Shows connection status when connected; connect CTA when not.
// =============================================================================

import { useState, useEffect } from "react";

interface QBStatus {
  connected:    boolean;
  status?:      string;
  last_sync_at?: string;
  last_error?:  string;
  summary?: {
    revenue_ttm:   number;
    ar_overdue_90: number;
    payroll_ttm:   number;
  };
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

export default function QBConnectBanner() {
  const [status,   setStatus]   = useState<QBStatus | null>(null);
  const [syncing,  setSyncing]  = useState(false);
  const [syncMsg,  setSyncMsg]  = useState("");

  useEffect(() => {
    fetch("/api/quickbooks/status")
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  async function resync() {
    setSyncing(true); setSyncMsg("");
    try {
      const res  = await fetch("/api/quickbooks/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMsg("Synced");
        const fresh = await fetch("/api/quickbooks/status").then(r => r.json()).catch(() => null);
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

  if (status === null) return null; // loading — render nothing

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!status.connected) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
        style={{ background: "rgba(27,58,45,0.03)", border: "1px solid rgba(27,58,45,0.12)" }}>
        <div className="flex items-center gap-3">
          {/* QB logo mark */}
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "rgba(27,58,45,0.08)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M8 12h8M12 8v8"/>
            </svg>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-ink">Connect QuickBooks</p>
            <p className="text-[10px] text-ink-faint">Get real revenue, AR aging &amp; expense data — no more estimates</p>
          </div>
        </div>
        <a href="/api/quickbooks/connect"
          className="shrink-0 h-7 px-3 text-[11px] font-bold text-white rounded-lg flex items-center transition"
          style={{ background: "#1B3A2D" }}>
          Connect →
        </a>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (status.status === "error") {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
        style={{ background: "rgba(179,64,64,0.03)", border: "1px solid rgba(179,64,64,0.12)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-[6px] h-[6px] rounded-full bg-negative shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-negative">QuickBooks sync error</p>
            <p className="text-[10px] text-ink-faint">{status.last_error || "Reconnect to restore live data"}</p>
          </div>
        </div>
        <a href="/api/quickbooks/connect"
          className="text-[11px] font-semibold text-negative border border-negative/20 px-2.5 py-1 rounded-lg hover:bg-negative/5 transition">
          Reconnect
        </a>
      </div>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  const s = status.summary;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
      style={{ background: "rgba(45,122,80,0.04)", border: "1px solid rgba(45,122,80,0.14)" }}>

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-[6px] h-[6px] rounded-full bg-positive shrink-0" />
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-[11px] font-semibold text-positive whitespace-nowrap">QB Live</span>
          {s && s.revenue_ttm > 0 && (
            <span className="text-[10px] text-ink-secondary whitespace-nowrap">
              {fmt(s.revenue_ttm)} rev TTM
            </span>
          )}
          {s && s.ar_overdue_90 > 0 && (
            <span className="text-[10px] text-negative font-semibold whitespace-nowrap">
              {fmt(s.ar_overdue_90)} AR 90d+
            </span>
          )}
          {s && s.payroll_ttm > 0 && (
            <span className="text-[10px] text-ink-faint whitespace-nowrap">
              {fmt(s.payroll_ttm)} payroll
            </span>
          )}
          {status.last_sync_at && (
            <span className="text-[9px] text-ink-faint whitespace-nowrap">
              synced {timeAgo(status.last_sync_at)}
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
