"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */
interface DataSource {
  id: string; source_type: string; source_name: string; status: string;
  total_rows: number; mapped_rows: number; last_sync_at: string | null;
  metadata: any; created_at: string;
}

interface Transaction {
  id: string; transaction_date: string; description: string; amount: number;
  category_code: string | null; auto_categorized: boolean; user_confirmed: boolean;
}

interface UploadStats {
  total_parsed: number; inserted: number; duplicates: number; skipped: number;
  categorized: number; uncategorized: number; date_range: { from: string; to: string };
}

const CATEGORIES = [
  { code: "revenue", label: "Revenue" }, { code: "rent", label: "Rent / Lease" },
  { code: "chair_rent", label: "Chair Rent" }, { code: "payroll", label: "Payroll" },
  { code: "processing_fees", label: "Processing Fees" }, { code: "insurance", label: "Insurance" },
  { code: "utilities", label: "Utilities" }, { code: "supplies", label: "Supplies" },
  { code: "tools_equipment", label: "Tools & Equipment" }, { code: "software", label: "Software" },
  { code: "marketing", label: "Marketing" }, { code: "fuel", label: "Fuel / Vehicle" },
  { code: "food_cost", label: "Food / COGS" }, { code: "bank_fees", label: "Bank Fees" },
  { code: "professional_fees", label: "Professional Fees" }, { code: "taxes", label: "Taxes" },
  { code: "maintenance", label: "Maintenance" }, { code: "travel", label: "Travel / Meals" },
  { code: "other_income", label: "Other Income" }, { code: "other_expense", label: "Other Expense" },
  { code: "transfer", label: "Transfer" }, { code: "owner_draw", label: "Owner Draw" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function ConnectionsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txSummary, setTxSummary] = useState<any>(null);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadStats | null>(null);
  const [uploadError, setUploadError] = useState("");

  const [tab, setTab] = useState<"sources" | "transactions">("sources");
  const [loading, setLoading] = useState(true);
  const [showUncategorized, setShowUncategorized] = useState(false);

  // Load business
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) { router.push("/login"); return; }
        const me = await res.json();
        setBusinessId(me.business?.id || null);
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    };
    load();
  }, [router]);

  // Load sources
  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/v3/data-sources?businessId=${businessId}`)
      .then(r => r.json())
      .then(d => setSources(d.sources || []))
      .catch(() => {});
  }, [businessId, uploadResult]);

  // Load transactions
  useEffect(() => {
    if (!businessId) return;
    const params = new URLSearchParams({
      businessId, page: String(txPage), limit: "30",
      ...(showUncategorized ? { uncategorized: "true" } : {}),
    });
    fetch(`/api/v3/transactions?${params}`)
      .then(r => r.json())
      .then(d => {
        setTransactions(d.transactions || []);
        setTxSummary(d.summary || null);
        setTxTotal(d.pagination?.total ?? 0);
      })
      .catch(() => {});
  }, [businessId, txPage, showUncategorized, uploadResult]);

  // Upload CSV
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setUploadResult(null);

    const form = new FormData();
    form.append("file", file);
    form.append("source_name", file.name);

    try {
      const res = await fetch("/api/v3/upload-csv", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error || "Upload failed"); }
      else { setUploadResult(data.stats); setTab("transactions"); }
    } catch { setUploadError("Network error"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  // Update category
  const updateCategory = async (txId: string, code: string) => {
    await fetch("/api/v3/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [txId], category_code: code }),
    });
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, category_code: code, user_confirmed: true } : t));
  };

  // Delete source
  const deleteSource = async (id: string) => {
    if (!confirm("Delete this data source and all its transactions?")) return;
    await fetch("/api/v3/data-sources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSources(prev => prev.filter(s => s.id !== id));
    setUploadResult(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );

  const tabs = [
    { key: "sources" as const, label: "Data Sources" },
    { key: "transactions" as const, label: "Transactions", badge: txSummary?.total_transactions },
  ];

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-brand">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[5px] bg-white/10 flex items-center justify-center">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
            </div>
            <span className="text-[14px] font-semibold text-white tracking-tight font-serif">Fruxal</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push("/dashboard")} className="px-3.5 py-1.5 rounded-[6px] text-[12.5px] font-medium text-white/40 hover:text-white/70 transition">← Dashboard</button>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-[6px] text-[12.5px] font-medium transition-all ${tab === t.key ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70"}`}>
                {t.label}
                {t.badge !== undefined && t.badge > 0 && <span className="ml-1.5 px-1.5 py-px rounded-full bg-white/10 text-[10px] text-white/60">{t.badge}</span>}
              </button>
            ))}
          </div>
          <div />
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 lg:px-8 py-8 space-y-6">

        {/* ══════ UPLOAD AREA ══════ */}
        <div className="bg-white border border-border rounded-card p-6">
          <h2 className="font-serif text-h3 text-ink mb-1">Connect your financial data</h2>
          <p className="text-sm text-ink-secondary mb-5">Upload a bank statement or accounting export (CSV format). We'll auto-categorize your transactions.</p>

          <div className="flex flex-wrap items-center gap-4">
            <label className={`inline-flex items-center gap-2 px-5 py-3 bg-brand text-white text-sm font-semibold rounded-sm cursor-pointer hover:bg-brand-light transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {uploading ? "Processing…" : "Upload CSV"}
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>

            <div className="flex items-center gap-3 text-xs text-ink-faint">
              <span>Supported: Bank statements, QuickBooks, Wave, Stripe exports</span>
            </div>
          </div>

          {uploadError && (
            <div className="mt-4 px-4 py-3 bg-negative/8 text-negative text-sm rounded-sm">{uploadError}</div>
          )}

          {uploadResult && (
            <div className="mt-4 px-4 py-3 bg-positive/8 text-positive text-sm rounded-sm space-y-1">
              <p className="font-semibold">Upload complete</p>
              <p>{uploadResult.inserted} transactions imported ({uploadResult.date_range.from} → {uploadResult.date_range.to})</p>
              <p>{uploadResult.categorized} auto-categorized · {uploadResult.uncategorized} need review{uploadResult.duplicates > 0 ? ` · ${uploadResult.duplicates} duplicates skipped` : ""}</p>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-border-light">
            <p className="text-xs text-ink-faint mb-3 font-semibold uppercase tracking-wider">Coming soon</p>
            <div className="flex flex-wrap gap-3">
              {["QuickBooks", "Stripe", "Square", "Wave", "Plaid (Bank)", "Desjardins"].map(n => (
                <span key={n} className="px-3 py-1.5 bg-bg border border-border-light rounded-xs text-xs text-ink-muted font-medium">{n}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ══════ DATA SOURCES TAB ══════ */}
        {tab === "sources" && (
          <div className="bg-white border border-border rounded-card overflow-hidden">
            <div className="px-6 pt-5 pb-0">
              <h3 className="font-serif text-h3 text-ink">Connected sources</h3>
              <p className="text-xs text-ink-muted mt-0.5">{sources.length} source{sources.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="px-6 py-5">
              {sources.length === 0 ? (
                <p className="text-sm text-ink-muted py-4">No data sources connected yet. Upload a CSV to get started.</p>
              ) : (
                <div className="space-y-2">
                  {sources.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-bg rounded-sm border border-border-light">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-body font-medium text-ink">{s.source_name || s.source_type}</span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.status === "active" ? "bg-positive/8 text-positive" : s.status === "processing" ? "bg-caution/10 text-caution" : "bg-ink-muted/8 text-ink-muted"}`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="text-xs text-ink-muted mt-1 flex gap-4">
                          <span>{s.total_rows} transactions</span>
                          <span>{s.mapped_rows} categorized</span>
                          {s.last_sync_at && <span>Synced {new Date(s.last_sync_at).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteSource(s.id)} className="text-[11px] text-negative/60 hover:text-negative transition font-medium">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════ TRANSACTIONS TAB ══════ */}
        {tab === "transactions" && (
          <div className="bg-white border border-border rounded-card overflow-hidden">
            <div className="px-6 pt-5 pb-0 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-h3 text-ink">Transactions</h3>
                {txSummary && (
                  <p className="text-xs text-ink-muted mt-0.5">
                    {txSummary.total_transactions} total · {txSummary.categorization_pct}% categorized ·
                    Income ${(txSummary.total_income ?? 0).toLocaleString()} · Expenses ${(txSummary.total_expenses ?? 0).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => { setShowUncategorized(!showUncategorized); setTxPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition ${showUncategorized ? "bg-brand text-white border-brand" : "bg-bg text-ink-muted border-border"}`}
              >
                {showUncategorized ? "Show all" : `Needs review (${txSummary?.uncategorized ?? 0})`}
              </button>
            </div>
            <div className="px-6 py-5">
              {transactions.length === 0 ? (
                <p className="text-sm text-ink-muted py-4">No transactions yet.</p>
              ) : (
                <>
                  {/* Header */}
                  <div className="grid grid-cols-[100px_1fr_120px_160px] gap-3 pb-2 border-b border-border-light text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
                    <span>Date</span><span>Description</span><span className="text-right">Amount</span><span>Category</span>
                  </div>

                  {/* Rows */}
                  {transactions.map(tx => (
                    <div key={tx.id} className="grid grid-cols-[100px_1fr_120px_160px] gap-3 py-3 border-b border-border-light last:border-0 items-center">
                      <span className="text-xs text-ink-muted font-medium">{tx.transaction_date}</span>
                      <span className="text-body text-ink truncate" title={tx.description}>{tx.description}</span>
                      <span className={`text-body text-right font-medium ${tx.amount >= 0 ? "text-positive" : "text-ink"}`}>
                        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <select
                        value={tx.category_code || ""}
                        onChange={e => updateCategory(tx.id, e.target.value)}
                        className={`text-xs py-1 px-2 border rounded-xs bg-bg font-sans outline-none cursor-pointer transition ${
                          tx.user_confirmed ? "border-positive/30 text-ink" :
                          tx.auto_categorized ? "border-border text-ink" :
                          "border-caution/40 text-caution bg-caution/[0.03]"
                        }`}
                      >
                        <option value="">— Select —</option>
                        {CATEGORIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>
                  ))}

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4 mt-2">
                    <span className="text-xs text-ink-muted">
                      Page {txPage} of {Math.ceil(txTotal / 30) || 1} ({txTotal} total)
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage <= 1}
                        className="px-3 py-1.5 text-xs font-medium border border-border rounded-xs disabled:opacity-30 hover:bg-bg transition">← Prev</button>
                      <button onClick={() => setTxPage(p => p + 1)} disabled={txPage >= Math.ceil(txTotal / 30)}
                        className="px-3 py-1.5 text-xs font-medium border border-border rounded-xs disabled:opacity-30 hover:bg-bg transition">Next →</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
