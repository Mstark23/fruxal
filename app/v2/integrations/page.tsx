"use client";
// =============================================================================
// app/v2/integrations/page.tsx
// Central hub for all data source connections.
// =============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

interface ConnStatus {
  connected:    boolean;
  status?:      string;
  last_sync_at?: string;
  last_error?:  string;
  summary?:     Record<string, any>;
  institution_name?: string;
  livemode?: boolean;
}

function fmt(n: number) {
  if (!n) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

function timeAgo(iso?: string) {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 2)    return "just now";
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function qualityScore(qb: ConnStatus, plaid: ConnStatus, stripe: ConnStatus): number {
  let score = 20;
  if (qb.connected     && qb.status     !== "error") score += 35;
  if (plaid.connected  && plaid.status  !== "error") score += 25;
  if (stripe.connected && stripe.status !== "error") score += 20;
  return Math.min(100, score);
}

function StatusDot({ status }: { status?: string }) {
  const color = !status || status === "disconnected"
    ? "#B5B3AD"
    : status === "error" || status === "pending_expiration"
    ? "#B34040"
    : status === "syncing"
    ? "#A68B2B"
    : "#2D7A50";
  const pulse = status === "syncing";
  return (
    <div className={`w-[7px] h-[7px] rounded-full shrink-0 ${pulse ? "animate-pulse" : ""}`}
      style={{ background: color }} />
  );
}

function IntCard({
  name, desc, icon, status, signals, onConnect, onSync, onReconnect, connectHref, loading,
}: {
  name: string;
  desc: string;
  icon: React.ReactNode;
  status: ConnStatus;
  signals?: { label: string; value: string; alert?: boolean }[];
  onConnect?:    () => void;
  onSync?:       () => void;
  onReconnect?:  () => void;
  connectHref?:  string;
  loading?:      boolean;
}) {
  const isConnected = status.connected && status.status !== "error" && status.status !== "disconnected";
  const isError     = status.connected && status.status === "error";

  return (
    <div className="bg-white border border-border-light rounded-xl overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(27,58,45,0.07)" }}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-ink">{name}</p>
              <StatusDot status={isConnected ? "active" : isError ? "error" : undefined} />
            </div>
            <p className="text-[10px] text-ink-faint mt-0.5">{desc}</p>
          </div>
        </div>
        <div className="shrink-0">
          {!status.connected && !isError && (
            connectHref ? (
              <a href={connectHref}
                className="h-7 px-3 text-[11px] font-bold text-white rounded-lg inline-flex items-center transition"
                style={{ background: "#1B3A2D" }}>
                Connect →
              </a>
            ) : (
              <button onClick={onConnect} disabled={loading}
                className="h-7 px-3 text-[11px] font-bold text-white rounded-lg transition disabled:opacity-40"
                style={{ background: "#1B3A2D" }}>
                {loading ? "Connecting…" : "Connect →"}
              </button>
            )
          )}
          {isError && (
            connectHref ? (
              <a href={connectHref}
                className="h-7 px-3 text-[11px] font-semibold text-negative border border-negative/20 rounded-lg inline-flex items-center hover:bg-negative/5 transition">
                Reconnect
              </a>
            ) : (
              <button onClick={onReconnect}
                className="h-7 px-3 text-[11px] font-semibold text-negative border border-negative/20 rounded-lg hover:bg-negative/5 transition">
                Reconnect
              </button>
            )
          )}
          {isConnected && (
            <button onClick={onSync} disabled={loading}
              className="h-7 px-2.5 text-[10px] font-semibold text-ink-faint border border-border rounded-lg hover:border-brand/30 hover:text-brand transition disabled:opacity-40">
              {loading ? "Syncing…" : "Re-sync"}
            </button>
          )}
        </div>
      </div>

      {isConnected && signals && signals.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-x-5 gap-y-1.5">
          {signals.filter(s => s.value && s.value !== "—").map(s => (
            <div key={s.label}>
              <span className="text-[9px] text-ink-faint uppercase tracking-wider">{s.label} </span>
              <span className={`text-[11px] font-semibold ${s.alert ? "text-negative" : "text-ink-secondary"}`}>
                {s.value}
              </span>
            </div>
          ))}
          {status.last_sync_at && (
            <div className="ml-auto">
              <span className="text-[9px] text-ink-faint">synced {timeAgo(status.last_sync_at)}</span>
            </div>
          )}
        </div>
      )}

      {isError && status.last_error && (
        <div className="px-5 pb-4">
          <p className="text-[10px] text-negative">{status.last_error}</p>
        </div>
      )}

      {!status.connected && !isError && (
        <div className="px-5 pb-4 border-t border-border-light pt-3">
          <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">Unlocks</p>
          <div className="flex flex-wrap gap-1.5">
            {signals?.map(s => (
              <span key={s.label} className="text-[10px] text-ink-faint bg-bg-section border border-border-light px-2 py-0.5 rounded-full">
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const QBIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
    <path d="M8 12h8M12 8v8"/>
  </svg>
);

const BankIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
  </svg>
);

const CardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

export default function IntegrationsPage() {
  const router = useRouter();

  const [qb,     setQb]     = useState<ConnStatus>({ connected: false });
  const [plaid,  setPlaid]  = useState<ConnStatus>({ connected: false });
  const [stripe, setStripe] = useState<ConnStatus>({ connected: false });

  const [plaidLinkReady, setPlaidLinkReady] = useState(false);
  const [loadingId,      setLoadingId]      = useState<string | null>(null);
  const [syncMsg,        setSyncMsg]        = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/quickbooks/status").then(r => r.json()).catch(() => ({ connected: false })),
      fetch("/api/plaid/status").then(r => r.json()).catch(() => ({ connected: false })),
      fetch("/api/stripe-connect/status").then(r => r.json()).catch(() => ({ connected: false })),
    ]).then(([q, p, s]) => {
      setQb(q);
      setPlaid(p);
      setStripe(s);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const sp      = new URLSearchParams(window.location.search);
    const qbParam = sp.get("qb");
    const stParam = sp.get("stripe");
    if (qbParam === "connected" || stParam === "connected") {
      const _to = setTimeout(() => {
      return () => clearTimeout(_to);
        fetch("/api/quickbooks/status").then(r => r.json()).then(setQb).catch(() => {});
        fetch("/api/stripe-connect/status").then(r => r.json()).then(setStripe).catch(() => {});
        window.history.replaceState({}, "", "/v2/integrations");
      }, 2000);
    }
  }, []);

  async function openPlaid() {
    setLoadingId("plaid");
    try {
      const res  = await fetch("/api/plaid/link-token");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const handler = (window as any).Plaid.create({
        token: data.link_token,
        onSuccess: async (publicToken: string, meta: any) => {
          const ex = await fetch("/api/plaid/exchange", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              publicToken,
              institutionId:   meta.institution?.institution_id,
              institutionName: meta.institution?.name,
            }),
          }).then(r => r.json());

          if (ex.success) {
            setSyncMsg(m => ({ ...m, plaid: "Connected — syncing…" }));
            setTimeout(async () => {
              const fresh = await fetch("/api/plaid/status").then(r => r.json()).catch(() => null);
      if (!fresh) return;
              setPlaid(fresh);
              setSyncMsg(m => ({ ...m, plaid: "" }));
            }, 4000);
          }
          setLoadingId(null);
        },
        onExit: () => setLoadingId(null),
      });
      handler.open();
    } catch (err: any) {
      setSyncMsg(m => ({ ...m, plaid: err.message }));
      setLoadingId(null);
    }
  }

  async function resync(id: "qb" | "plaid" | "stripe") {
    const endpoints = {
      qb:     { sync: "/api/quickbooks/sync",     status: "/api/quickbooks/status",     set: setQb     },
      plaid:  { sync: "/api/plaid/sync",           status: "/api/plaid/status",           set: setPlaid  },
      stripe: { sync: "/api/stripe-connect/sync",  status: "/api/stripe-connect/status",  set: setStripe },
    };
    const ep = endpoints[id];
    setLoadingId(id);
    try {
      await fetch(ep.sync, { method: "POST" });
      const fresh = await fetch(ep.status).then(r => r.json());
      ep.set(fresh);
      setSyncMsg(m => ({ ...m, [id]: "Synced" }));
      setTimeout(() => setSyncMsg(m => ({ ...m, [id]: "" })), 3000);
    } catch {
      setSyncMsg(m => ({ ...m, [id]: "Sync failed" }));
    }
    setLoadingId(null);
  }

  const score      = qualityScore(qb, plaid, stripe);
  const scoreColor = score >= 80 ? "#2D7A50" : score >= 50 ? "#A68B2B" : "#8E8C85";

  return (
    <div className="bg-bg min-h-screen">
      <Script
        src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"
        onReady={() => setPlaidLinkReady(true)}
      />

      <div className="border-b border-border-light bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="text-ink-faint hover:text-ink text-[13px] transition">← Back</button>
            <span className="text-border">|</span>
            <span className="text-ink-secondary text-[13px]">Data Sources</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ink-faint">Diagnostic accuracy</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
              style={{ background: scoreColor + "10", borderColor: scoreColor + "25" }}>
              <div className="w-[6px] h-[6px] rounded-full" style={{ background: scoreColor }} />
              <span className="text-[11px] font-bold" style={{ color: scoreColor }}>{score}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Data Sources</h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            Connect your accounts to replace estimates with real numbers.
            Each connection improves diagnostic accuracy.
          </p>
        </div>

        <div className="bg-white border border-border-light rounded-xl p-5 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">
            How connections improve your diagnostic
          </p>
          <div className="space-y-2">
            {[
              { label: "Prescan only (estimates)",   pct: 20,  active: true },
              { label: "+ QuickBooks (GL actuals)",  pct: 55,  active: qb.connected     && qb.status     !== "error" },
              { label: "+ Bank / Plaid (cash flow)", pct: 80,  active: plaid.connected  && plaid.status  !== "error" },
              { label: "+ Stripe (revenue detail)",  pct: 100, active: stripe.connected && stripe.status !== "error" },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${row.active ? "" : "opacity-25"}`}
                  style={{ background: row.active ? "#2D7A50" : "#B5B3AD" }} />
                <div className="flex-1 h-[3px] rounded-full bg-bg-section overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: row.active ? row.pct + "%" : "0%", background: row.active ? "#2D7A50" : "transparent" }} />
                </div>
                <span className={`text-[10px] w-[32px] text-right tabular-nums ${row.active ? "text-positive font-semibold" : "text-ink-faint"}`}>
                  {row.active ? `${row.pct}%` : ""}
                </span>
                <span className={`text-[11px] w-56 ${row.active ? "text-ink-secondary" : "text-ink-faint"}`}>{row.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">

          {/* QuickBooks */}
          <IntCard
            name="QuickBooks Online"
            desc="P&L actuals, AR aging, expense categories, COGS — replaces all estimated financials"
            icon={<QBIcon />}
            status={qb}
            connectHref="/api/quickbooks/connect"
            onSync={() => resync("qb")}
            loading={loadingId === "qb"}
            signals={qb.connected ? [
              { label: "Revenue TTM", value: fmt(qb.summary?.revenue_ttm) },
              { label: "AR 90d+",     value: fmt(qb.summary?.ar_overdue_90), alert: (qb.summary?.ar_overdue_90 ?? 0) > 0 },
              { label: "Payroll TTM", value: fmt(qb.summary?.payroll_ttm) },
            ] : [
              { label: "Revenue TTM",   value: "" },
              { label: "AR aging",      value: "" },
              { label: "COGS",          value: "" },
              { label: "Payroll total", value: "" },
              { label: "Top expenses",  value: "" },
            ]}
          />

          {/* Plaid */}
          <IntCard
            name="Bank Account (Plaid)"
            desc="Verified cash flow, recurring charges, lowest balance, debt service, tax payments"
            icon={<BankIcon />}
            status={plaid}
            onConnect={plaidLinkReady ? openPlaid : undefined}
            onSync={() => resync("plaid")}
            onReconnect={plaidLinkReady ? openPlaid : undefined}
            loading={loadingId === "plaid"}
            signals={plaid.connected ? [
              { label: "Bank balance", value: fmt(plaid.summary?.bank_balance) },
              { label: "Revenue 90d",  value: fmt(plaid.summary?.revenue_90d) },
              { label: "Low balance",  value: fmt(plaid.summary?.lowest_bal_30d), alert: (plaid.summary?.lowest_bal_30d ?? 0) < 10000 },
              { label: "Debt service", value: fmt(plaid.summary?.loan_payments) },
            ] : [
              { label: "Cash balance",      value: "" },
              { label: "Revenue (cash)",    value: "" },
              { label: "Recurring charges", value: "" },
              { label: "Debt payments",     value: "" },
              { label: "Tax remittances",   value: "" },
            ]}
          />

          {/* Stripe */}
          <IntCard
            name="Stripe"
            desc="MRR, ARR, churn rate, refund rate, failed payments, processing fees"
            icon={<CardIcon />}
            status={stripe}
            connectHref="/api/stripe-connect/connect"
            onSync={() => resync("stripe")}
            loading={loadingId === "stripe"}
            signals={stripe.connected ? [
              { label: "MRR",         value: stripe.summary?.mrr ? fmt(stripe.summary.mrr) + "/mo" : "—" },
              { label: "Churn",       value: stripe.summary?.churn_rate_pct ? `${stripe.summary.churn_rate_pct}%` : "—", alert: (stripe.summary?.churn_rate_pct ?? 0) > 5 },
              { label: "Refund rate", value: stripe.summary?.refund_rate_pct ? `${stripe.summary.refund_rate_pct}%` : "—", alert: (stripe.summary?.refund_rate_pct ?? 0) > 3 },
              { label: "Stripe fees", value: fmt(stripe.summary?.stripe_fees_ttm) },
              { label: "Customers",   value: stripe.summary?.customer_count ? String(stripe.summary.customer_count) : "—" },
            ] : [
              { label: "MRR / ARR",       value: "" },
              { label: "Churn rate",      value: "" },
              { label: "Refund rate",     value: "" },
              { label: "Processing fees", value: "" },
              { label: "Failed payments", value: "" },
            ]}
          />
        </div>

        <div className="mt-6 border-t border-border-light pt-6">
          <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">Coming Soon</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "Gusto / Humi",    desc: "Exact payroll & benefits"     },
              { name: "Shopify",         desc: "GMV, returns, abandoned cart"  },
              { name: "CRA My Business", desc: "Tax balances & filing history" },
            ].map(i => (
              <div key={i.name} className="bg-white border border-border-light rounded-xl px-4 py-3 opacity-50">
                <p className="text-[12px] font-semibold text-ink-secondary">{i.name}</p>
                <p className="text-[10px] text-ink-faint mt-0.5">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
