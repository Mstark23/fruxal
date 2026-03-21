// =============================================================================
// /v2/collect — Post-Paywall Data Collection
// =============================================================================
// After user pays, this page asks them to connect/upload real business data
// so we can generate a verified report with actual numbers.
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CollectionItem {
  id: string;
  title: string;
  description: string;
  data_type: string; // 'quickbooks', 'upload', 'form', 'connect'
  icon: string;
  priority: number;
  status: "pending" | "done" | "skipped";
}

export default function CollectPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // Check auth + load collection items
    Promise.all([
      fetch("/api/me").then(r => r.json()),
      fetch("/api/v2/data-collect").then(r => r.json()),
    ]).then(([me, data]) => {
      setUserId(me.user?.id);
      setItems((data.items || []).map((i: any) => ({ ...i, status: "pending" })));
      setCompletedCount(data.completedCount ?? 0);
      setLoading(false);
    }).catch(() => {
      router.push("/login?redirect=/v2/collect");
    });
  }, [router]);

  const handleQuickBooksConnect = () => {
    if (typeof window !== "undefined") window.location.href = "/api/quickbooks/connect";
  };

  const handleFileUpload = async (itemId: string, file: File) => {
    setUploading(itemId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemId", itemId);
      formData.append("userId", userId || "");

      const res = await fetch("/api/v2/data-collect/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setItems(prev => prev.map(i =>
          i.id === itemId ? { ...i, status: "done" } : i
        ));
        setCompletedCount(prev => prev + 1);
      }
    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setUploading(null);
    }
  };

  const handleSkip = (itemId: string) => {
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, status: "skipped" } : i
    ));
  };

  const handleGenerateReport = () => {
    // Trigger deep scan + redirect to dashboard
    fetch("/api/v2/deep-scan", { method: "POST" })
      .then(() => router.push("/v2/dashboard?report=generating"))
      .catch(() => router.push("/v2/dashboard"));
  };

  const doneItems = items.filter(i => i.status === "done").length;
  const totalItems = items.length;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0e17]">
        <div className="w-8 h-8 border-2 border-[#00c853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0a0e17]">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="text-3xl mb-3">📊</div>
          <h1 className="text-2xl font-black text-white">Let&apos;s get your real numbers</h1>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            The more data you share, the more accurate your report. Each item takes 1-2 minutes.
            Skip anything you don&apos;t have — we&apos;ll work with what you give us.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">{doneItems} of {totalItems} completed</span>
            <span className="text-[#00c853] font-bold">{progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00c853] rounded-full transition-all duration-500"
              style={{ width: Math.max(5, progress) + "%" }}
            />
          </div>
          <div className="text-[10px] text-gray-500 mt-2">
            {doneItems === 0 ? "Start with the first item — it has the biggest impact on your report." :
             doneItems < totalItems ? "Good progress! Each item makes your report more accurate." :
             "All done! Generate your personalized report below."}
          </div>
        </div>

        {/* Collection Items */}
        <div className="space-y-3">
          {items.map((item, _ki) => (
            <div key={item.id}
              className={`rounded-xl border p-4 transition-all ${
                item.status === "done"
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : item.status === "skipped"
                  ? "bg-white/2 border-white/5 opacity-50"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">
                  {item.status === "done" ? "✅" : item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    {item.status === "done" && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Done</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>

                  {item.status === "pending" && (
                    <div className="flex items-center gap-2 mt-3">
                      {item.data_type === "quickbooks" && (
                        <button
                          onClick={handleQuickBooksConnect}
                          className="text-xs bg-[#00c853]/15 text-[#00c853] px-4 py-2 rounded-lg hover:bg-[#00c853]/25 transition-colors font-medium"
                        >
                          📗 Connect QuickBooks
                        </button>
                      )}

                      {item.data_type === "upload" && (
                        <label className="text-xs bg-blue-500/15 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/25 transition-colors font-medium cursor-pointer">
                          {uploading === item.id ? "Uploading..." : "📎 Upload File"}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(item.id, file);
                            }}
                            disabled={uploading === item.id}
                          />
                        </label>
                      )}

                      {item.data_type === "form" && (
                        <button
                          onClick={() => router.push(`/v2/collect/${item.id}`)}
                          className="text-xs bg-purple-500/15 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-500/25 transition-colors font-medium"
                        >
                          📝 Fill Out
                        </button>
                      )}

                      <button
                        onClick={() => handleSkip(item.id)}
                        className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
                      >
                        Skip for now
                      </button>
                    </div>
                  )}

                  {item.status === "skipped" && (
                    <button
                      onClick={() => setItems(prev => prev.map(i =>
                        i.id === item.id ? { ...i, status: "pending" } : i
                      ))}
                      className="text-[10px] text-gray-500 hover:text-gray-300 mt-2 underline"
                    >
                      Undo skip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Generate Report Button */}
        <div className="sticky bottom-4">
          <button
            onClick={handleGenerateReport}
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              doneItems > 0
                ? "bg-[#00c853] text-black hover:bg-[#00e676] shadow-[#00c853]/20"
                : "bg-white/10 text-gray-400 hover:bg-white/15"
            }`}
          >
            <span>📊</span>
            <span>
              {doneItems === 0
                ? "Generate Report (with estimates)"
                : doneItems < totalItems
                ? `Generate Report (${doneItems} data sources)`
                : "Generate Full Verified Report"}
            </span>
          </button>
          <div className="text-center text-[10px] text-gray-600 mt-2">
            {doneItems === 0
              ? "You can generate now and add data later. More data = more accuracy."
              : "You can always add more data later from your dashboard."}
          </div>
        </div>
      </div>
    </div>
  );
}
