"use client";
// =============================================================================
// components/v2/PlaidConnectBanner.tsx
// Drops into solo, business, and enterprise dashboards alongside QBConnectBanner.
// Opens Plaid Link modal inline — no redirect needed.
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import Script from "next/script";

interface PlaidStatus {
  connected:         boolean;
  status?:           string;
  institution_name?: string;
  last_sync_at?:     string;
  last_error?:       string;
  summary?: {
    bank_balance:   number;
    revenue_90d:    number;
    expenses_90d:   number;
    lowest_bal_30d: number;
    loan_payments:  number;
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

declare global {
  interface Window {
    Plaid?: { create: (cfg: any) => { open: () => void; destroy: () => void } };
  }
}

export default function PlaidConnectBanner() {
  const [status,    setStatus]    = useState<PlaidStatus | null>(null);
  const [syncing,   setSyncing]   = useState(false);
  const [syncMsg,   setSyncMsg]   = useState("");
  const [linkReady, setLinkReady] = useState(false);

  useEffect(() => {
    fetch("/api/plaid/status")
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  const openPlaidLink = useCallback(async () => {
    try {
      // Get a fresh link token
      const res   = await fetch("/api/plaid/link-token");
      const data  = await res.json();
      if (!data.success) throw new Error(data.error);

      const handler = window.Plaid!.create({
        token:    data.link_token,
        onSuccess: async (publicToken: string, metadata: any) => {
          setSyncing(true);
          const exchRes = await fetch("/api/plaid/exchange", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              publicToken,
              institutionId:   metadata.institution?.institution_id,
              institutionName: metadata.institution?.name,
            }),
          });
          const exchData = await exchRes.json();
          if (exchData.success) {
            setSyncMsg("Connected — syncing…");
            setTimeout(async () => {
              const fresh = await fetch("/api/plaid/status").then(r => r.json());
              setStatus(fresh);
              setSyncMsg("");
              setSyncing(false);
            }, 4000);
          } else {
            setSyncMsg(exchData.error || "Connection failed");
            setSyncing(false);
          }
        },
        onExit: () => {},
      });
      handler.open();
    } catch (err: any) {
      setSyncMsg(err.message);
    }
  }, []);

  async function resync() {
    setSyncing(true); setSyncMsg("");
    try {
      const res  = await fetch("/api/plaid/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMsg("Synced");
        const fresh = await fetch("/api/plaid/status").then(r => r.json());
        setStatus(fresh);
      } else {
        setSyncMsg(data.error || "Sync failed");
      }
    } catch {
      setSyncMsg("Sync failed");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 3000);
    }
  }

  if (status === null) return null;

  return (
    <>
      <Script
        src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"
        onReady={() => setLinkReady(true)}
      />

      {/* Not connected */}
      {!status.connected && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
          style={{ background: "rgba(27,58,45,0.03)", border: "1px solid rgba(27,58,45,0.12)" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "rgba(27,58,45,0.08)" }}>
              {/* Bank icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
                <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
                <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-ink">Connect Bank Account</p>
              <p className="text-[10px] text-ink-faint">Real cash flow, AR timing &amp; recurring expense data via Plaid</p>
            </div>
          </div>
          <button
            onClick={openPlaidLink}
            disabled={!linkReady || syncing}
            className="shrink-0 h-7 px-3 text-[11px] font-bold text-white rounded-lg transition disabled:opacity-40"
            style={{ background: "#1B3A2D" }}>
            {syncMsg || (syncing ? "Connecting…" : "Connect →")}
          </button>
        </div>
      )}

      {/* Error */}
      {status.connected && status.status === "error" && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
          style={{ background: "rgba(179,64,64,0.03)", border: "1px solid rgba(179,64,64,0.12)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-[6px] h-[6px] rounded-full bg-negative shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-negative">Bank sync error</p>
              <p className="text-[10px] text-ink-faint">{status.last_error || "Reconnect to restore live data"}</p>
            </div>
          </div>
          <button onClick={openPlaidLink} disabled={!linkReady}
            className="text-[11px] font-semibold text-negative border border-negative/20 px-2.5 py-1 rounded-lg hover:bg-negative/5 transition disabled:opacity-40">
            Reconnect
          </button>
        </div>
      )}

      {/* Connected */}
      {status.connected && status.status !== "error" && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
          style={{ background: "rgba(45,122,80,0.04)", border: "1px solid rgba(45,122,80,0.14)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-[6px] h-[6px] rounded-full bg-positive shrink-0" />
            <div className="flex items-center gap-4 min-w-0 flex-wrap">
              <span className="text-[11px] font-semibold text-positive whitespace-nowrap">
                Bank Live{status.institution_name ? ` · ${status.institution_name}` : ""}
              </span>
              {status.summary?.bank_balance != null && status.summary.bank_balance > 0 && (
                <span className="text-[10px] text-ink-secondary whitespace-nowrap">
                  {fmt(status.summary.bank_balance)} balance
                </span>
              )}
              {status.summary?.revenue_90d != null && status.summary.revenue_90d > 0 && (
                <span className="text-[10px] text-ink-secondary whitespace-nowrap">
                  {fmt(status.summary.revenue_90d)} in 90d
                </span>
              )}
              {status.summary?.lowest_bal_30d != null && status.summary.lowest_bal_30d < 10000 && (
                <span className="text-[10px] text-negative font-semibold whitespace-nowrap">
                  Low: {fmt(status.summary.lowest_bal_30d)}
                </span>
              )}
              {status.summary?.loan_payments != null && status.summary.loan_payments > 0 && (
                <span className="text-[10px] text-ink-faint whitespace-nowrap">
                  {fmt(status.summary.loan_payments)} debt svc
                </span>
              )}
              {status.last_sync_at && (
                <span className="text-[9px] text-ink-faint whitespace-nowrap">
                  {timeAgo(status.last_sync_at)}
                </span>
              )}
            </div>
          </div>
          <button onClick={resync} disabled={syncing}
            className="shrink-0 h-6 px-2.5 text-[10px] font-semibold text-ink-faint border border-border rounded-md hover:border-brand/30 hover:text-brand transition disabled:opacity-40">
            {syncing ? "Syncing…" : syncMsg || "Re-sync"}
          </button>
        </div>
      )}
    </>
  );
}
