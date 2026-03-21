// =============================================================================
// V2 SIMPLE DASHBOARD — To-Do List Style Leak Recovery Tracker
// =============================================================================
// Shows: total to recover, progress bar, grouped action items, connect CTA
// No charts. No analytics. No tabs. Just: what to do next.
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Action {
  id: string;
  action_type: string;
  source: string;
  leak_title: string;
  leak_description: string;
  leak_category: string;
  severity: string;
  estimated_value: number;
  verified: boolean;
  current_tool: string;
  current_price: number;
  recommended_tool: string;
  recommended_price: number;
  affiliate_url: string;
  savings_annual: number;
  fix_description: string;
  fix_tool_name: string;
  fix_tool_url: string;
  status: string;
  priority: string;
  completed_at: string;
  actual_savings: number;
}

interface Stats {
  total_leak: number;
  total_recovered: number;
  total_verified: number;
  actions_total: number;
  actions_completed: number;
  actions_in_progress: number;
  actions_remaining: number;
  quickbooks_connected: boolean;
  bank_connected: boolean;
  contracts_uploaded: number;
  last_scan: string;
}

interface GroupedActions {
  this_week: Action[];
  this_month: Action[];
  this_quarter: Action[];
  in_progress: Action[];
  completed: Action[];
  skipped: Action[];
}

export function SimpleDashboard({ userId, userName, deepScanning, scanResult, onTriggerDeepScan }: {
  userId: string;
  userName?: string;
  deepScanning?: boolean;
  scanResult?: any;
  onTriggerDeepScan?: () => void;
}) {
  const router = useRouter();
  const [actions, setActions] = useState<GroupedActions | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showScanBanner, setShowScanBanner] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/v2/actions?userId=${userId}`);
      const data = await res.json();
      setActions(data.actions);
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Refresh data after deep scan completes
  useEffect(() => {
    if (scanResult && !deepScanning) {
      setShowScanBanner(true);
      fetchData();
      const _to = setTimeout(() => setShowScanBanner(false), 8000);
      return () => clearTimeout(_to);
    }
  }, [scanResult, deepScanning, fetchData]);

  const updateAction = async (actionId: string, status: string) => {
    setUpdating(actionId);
    try {
      await fetch("/api/v2/actions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, userId, status }),
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#00c853] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-gray-400">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!stats || stats.actions_total === 0) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">No scan results yet</h2>
          <p className="text-gray-400 text-sm mb-6">
            Take your free scan to find where your business is leaking money.
          </p>
          <button
            onClick={() => router.push("/prescan")}
            className="bg-[#00c853] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#00e676] transition-all"
          >
            Find My Leaks →
          </button>
        </div>
      </div>
    );
  }

  const progressPct = stats.actions_total > 0
    ? Math.round((stats.actions_completed / stats.actions_total) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* ═══ HERO STATS ═══ */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="text-sm text-gray-400 mb-1">
          {userName ? `Hey ${userName},` : "Hey,"} you have
        </div>
        <div className="text-3xl sm:text-4xl font-black text-white mb-1">
          ${Math.round(stats.total_leak - stats.total_recovered).toLocaleString()}
          <span className="text-lg text-gray-400 font-normal"> left to recover</span>
        </div>
        {stats.total_recovered > 0 && (
          <div className="text-sm text-[#00c853] font-medium">
            ✅ ${Math.round(stats.total_recovered).toLocaleString()} already recovered
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00c853] rounded-full transition-all duration-500"
              style={{ width: progressPct + "%" }}
            />
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{progressPct}% done</span>
        </div>

        {/* Quick stats */}
        <div className="mt-3 flex gap-4 text-xs text-gray-400">
          <span>✅ {stats.actions_completed} fixed</span>
          <span>🔄 {stats.actions_in_progress} in progress</span>
          <span>⬚ {stats.actions_remaining} remaining</span>
        </div>
      </div>

      {/* ═══ DEEP SCAN OVERLAY ═══ */}
      {deepScanning && (
        <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <div>
              <div className="text-sm font-bold text-blue-300">Analyzing your QuickBooks data...</div>
              <div className="text-xs text-gray-400 mt-0.5">Scanning invoices, expenses, and transactions for verified leaks</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCAN RESULT BANNER ═══ */}
      {showScanBanner && scanResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div>
                <div className="text-sm font-bold text-emerald-300">
                  Deep scan complete — {scanResult.newActions} verified leaks found
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  ${scanResult.totalVerifiedLeak?.toLocaleString()}/year in verified savings from {scanResult.dataAnalyzed?.invoices ?? 0} invoices + {scanResult.dataAnalyzed?.transactions ?? 0} transactions
                </div>
              </div>
            </div>
            <button onClick={() => setShowScanBanner(false)} className="text-gray-500 hover:text-gray-300 text-sm">✕</button>
          </div>
        </div>
      )}

      {/* ═══ CONNECT ACCOUNTS CTA ═══ */}
      {!stats.quickbooks_connected && !stats.bank_connected && !deepScanning && (
        <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔗</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-blue-300">Find hidden leaks with exact numbers</div>
              <div className="text-xs text-gray-400 mt-1">
                Connect your accounts to find 2-3x more savings with exact dollar amounts from real data.
              </div>
              <div className="flex gap-2 mt-3">
                <a
                  href="/api/quickbooks/connect"
                  className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-500/30 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>📗</span> Connect QuickBooks
                </a>
                <button
                  onClick={() => router.push("/contracts")}
                  className="text-xs bg-white/5 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Upload Contract
                </button>
              </div>
            </div>
            <button className="text-gray-600 hover:text-gray-400 text-xs">Skip</button>
          </div>
        </div>
      )}

      {/* ═══ QB CONNECTED — RESCAN OPTION ═══ */}
      {stats.quickbooks_connected && !deepScanning && (
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">📗</span>
              <span className="text-xs text-emerald-300/80">QuickBooks connected</span>
              {stats.total_verified > 0 && (
                <span className="text-xs text-gray-500">· ${(Number(stats.total_verified) || 0).toLocaleString()} verified</span>
              )}
            </div>
            <button
              onClick={onTriggerDeepScan}
              className="text-[10px] text-gray-500 hover:text-emerald-300 transition-colors"
            >
              Re-scan
            </button>
          </div>
        </div>
      )}

      {/* ═══ THIS WEEK ═══ */}
      {actions && actions.this_week.length > 0 && (
        <ActionSection
          title="Do This Week"
          emoji="⚡"
          subtitle="Quick wins — biggest savings for least effort"
          actions={actions.this_week}
          updating={updating}
          onUpdateAction={updateAction}
          onChat={(action) => router.push(`/v2/chat?focus=${action.leak_title}`)}
        />
      )}

      {/* ═══ IN PROGRESS ═══ */}
      {actions && actions.in_progress.length > 0 && (
        <ActionSection
          title="In Progress"
          emoji="🔄"
          actions={actions.in_progress}
          updating={updating}
          onUpdateAction={updateAction}
          onChat={(action) => router.push(`/v2/chat?focus=${action.leak_title}`)}
        />
      )}

      {/* ═══ THIS MONTH ═══ */}
      {actions && actions.this_month.length > 0 && (
        <ActionSection
          title="Do This Month"
          emoji="📅"
          actions={actions.this_month}
          updating={updating}
          onUpdateAction={updateAction}
          onChat={(action) => router.push(`/v2/chat?focus=${action.leak_title}`)}
        />
      )}

      {/* ═══ THIS QUARTER ═══ */}
      {actions && actions.this_quarter.length > 0 && (
        <ActionSection
          title="Later"
          emoji="📋"
          actions={actions.this_quarter}
          updating={updating}
          onUpdateAction={updateAction}
          onChat={(action) => router.push(`/v2/chat?focus=${action.leak_title}`)}
          collapsed
        />
      )}

      {/* ═══ COMPLETED ═══ */}
      {actions && actions.completed.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            ✅ Done ({actions.completed.length})
          </div>
          {actions.completed.slice(0, 5).map(a => (
            <div key={a.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/3">
              <span className="text-[#00c853]">✅</span>
              <span className="text-sm text-gray-500 line-through flex-1">{a.leak_title}</span>
              {a.actual_savings && (
                <span className="text-xs text-[#00c853]">
                  +${Math.round(a.actual_savings).toLocaleString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ AI ADVISOR BUTTON ═══ */}
      <div className="sticky bottom-4">
        <button
          onClick={() => router.push("/v2/chat")}
          className="w-full bg-[#00c853] text-black font-bold py-4 rounded-2xl hover:bg-[#00e676] transition-all shadow-lg shadow-[#00c853]/20 flex items-center justify-center gap-2"
        >
          <span>💬</span>
          <span>Talk to AI Advisor</span>
        </button>
      </div>
    </div>
  );
}

// ─── Action Section Component ────────────────────────────────────────────────
function ActionSection({
  title, emoji, subtitle, actions, updating, onUpdateAction, onChat, collapsed = false
}: {
  title: string;
  emoji: string;
  subtitle?: string;
  actions: Action[];
  updating: string | null;
  onUpdateAction: (id: string, status: string) => void;
  onChat: (action: Action) => void;
  collapsed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(!collapsed);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left px-1"
      >
        <span>{emoji}</span>
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{title}</span>
        <span className="text-xs text-gray-500">({actions.length})</span>
        {subtitle && <span className="text-xs text-gray-600 hidden sm:inline">— {subtitle}</span>}
        <span className="text-xs text-gray-600 ml-auto">{isOpen ? "▼" : "▶"}</span>
      </button>

      {isOpen && actions.map(action => (
        <ActionItem
          key={action.id}
          action={action}
          updating={updating === action.id}
          onStart={() => onUpdateAction(action.id, "in_progress")}
          onComplete={() => onUpdateAction(action.id, "completed")}
          onSkip={() => onUpdateAction(action.id, "skipped")}
          onChat={() => onChat(action)}
        />
      ))}
    </div>
  );
}

// ─── Single Action Item ──────────────────────────────────────────────────────
function ActionItem({
  action, updating, onStart, onComplete, onSkip, onChat
}: {
  action: Action;
  updating: boolean;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onChat: () => void;
}) {
  const sevColor: Record<string, string> = {
    critical: "border-red-400/25 bg-red-500/5",
    high: "border-orange-400/20 bg-orange-500/5",
    medium: "border-yellow-400/15 bg-yellow-500/5",
    low: "border-blue-400/15 bg-blue-500/5",
  };
  const sevDot: Record<string, string> = {
    critical: "bg-red-400",
    high: "bg-orange-400",
    medium: "bg-yellow-400",
    low: "bg-blue-400",
  };

  const isSwitch = action.action_type === "switch";

  return (
    <div className={`border rounded-xl p-3 sm:p-4 ${sevColor[action.severity] || sevColor.medium} transition-all`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={action.status === "in_progress" ? onComplete : onStart}
          disabled={updating}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            action.status === "in_progress"
              ? "border-[#00c853] bg-[#00c853]/20"
              : "border-gray-600 hover:border-gray-400"
          }`}
        >
          {action.status === "in_progress" && <span className="text-[#00c853] text-xs">⟳</span>}
          {updating && <span className="text-xs animate-spin">⟳</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${sevDot[action.severity]}`} />
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{action.leak_title}</div>
              {action.fix_description && (
                <div className="text-xs text-gray-400 mt-1 line-clamp-2">{action.fix_description}</div>
              )}
            </div>
          </div>

          {/* Value + Actions */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-bold ${
              action.verified ? "text-[#00c853]" : "text-gray-300"
            }`}>
              {action.verified ? "✓ " : "~"}${Math.round(action.estimated_value).toLocaleString()}/yr
            </span>

            {isSwitch && action.affiliate_url && (
              <a
                href={action.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md hover:bg-emerald-500/30 transition-colors"
              >
                {action.recommended_tool || "See alternative"} →
              </a>
            )}

            {action.fix_tool_url && (
              <a
                href={action.fix_tool_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md hover:bg-blue-500/30 transition-colors"
              >
                {action.fix_tool_name || "See tool"} →
              </a>
            )}

            <button
              onClick={onChat}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              💬 Ask AI
            </button>

            <button
              onClick={onSkip}
              className="text-xs text-gray-600 hover:text-gray-400 ml-auto transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleDashboard;
