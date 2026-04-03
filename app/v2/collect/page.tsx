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
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    // Check auth + load collection items
    Promise.all([
      fetch("/api/me").then(r => r.json()),
      fetch("/api/v2/data-collect").then(r => r.json()),
      fetch("/api/v2/rep-document-requests").then(r => r.ok ? r.json() : { requests: [] }).catch(() => ({ requests: [] })),
    ]).then(([me, data, repData]) => {
      setUserId(me.user?.id);
      // Merge rep-requested documents into items list
      const repRequests = (repData?.requests || []).map((r: any) => ({
        id: "rep_" + r.id, title: r.label, description: r.notes || "Requested by your recovery rep",
        data_type: "upload", priority: 0, status: r.status === "received" ? "done" : "pending",
        _repRequested: true, _engDocId: r.id,
      }));
      const mergedItems = [...repRequests, ...(data.items || []).map((i: any) => ({ ...i, status: "pending" }))];
      setItems(mergedItems);
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

  const handleGenerateReport = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/v2/deep-scan", { method: "POST" });
      if (res.ok) {
        router.push("/v2/dashboard?report=generating");
      } else {
        setGenerateError(
          "Report generation failed. Your data is saved \u2014 you can try again from your dashboard."
        );
      }
    } catch {
      setGenerateError(
        "Report generation failed. Your data is saved \u2014 you can try again from your dashboard."
      );
    } finally {
      setGenerating(false);
    }
  };

  const doneItems = items.filter(i => i.status === "done").length;
  const totalItems = items.length;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#FAFAF8]">
        <div className="w-8 h-8 border-2 border-[#2D7A50] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAF8]">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-[#2D7A50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>
          <h1 className="text-2xl font-black text-[#1A1A18]">Documents for Your Rep</h1>
          <p className="text-sm text-[#8E8C85] mt-2 max-w-md mx-auto">
            Your recovery expert needs these to start working on your file. Each item takes 1-2 minutes.
            Skip anything you don&apos;t have — your rep will follow up directly if something is critical.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-[#E5E3DD] p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#8E8C85]">{doneItems} of {totalItems} completed</span>
            <span className="text-[#2D7A50] font-bold">{progress}%</span>
          </div>
          <div className="h-2 bg-[#F0EFE9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D7A50] rounded-full transition-all duration-500"
              style={{ width: Math.max(5, progress) + "%" }}
            />
          </div>
          <div className="text-[10px] text-[#8E8C85] mt-2">
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
                  ? "bg-[#F0FAF4] border-[#2D7A50]/20"
                  : item.status === "skipped"
                  ? "bg-[#F5F5F3] border-[#E5E3DD] opacity-50"
                  : "bg-white border-[#E5E3DD]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">
                  {item.status === "done" ? "\u2713" : ""}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1A1A18]">{item.title}</h3>
                    {item.status === "done" && (
                      <span className="text-[10px] text-[#2D7A50] bg-[#2D7A50]/10 px-2 py-0.5 rounded-full">Done</span>
                    )}
                  </div>
                  <p className="text-xs text-[#8E8C85] mt-1">{item.description}</p>

                  {item.status === "pending" && (
                    <div className="flex items-center gap-2 mt-3">
                      {item.data_type === "quickbooks" && (
                        <button
                          onClick={handleQuickBooksConnect}
                          className="text-xs bg-[#2D7A50]/10 text-[#2D7A50] px-4 py-2 rounded-lg hover:bg-[#2D7A50]/20 transition-colors font-medium"
                        >
                          Connect QuickBooks
                        </button>
                      )}

                      {item.data_type === "upload" && (
                        <label className="text-xs bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium cursor-pointer">
                          {uploading === item.id ? "Uploading..." : "Upload File"}
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
                          className="text-xs bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                        >
                          Fill Out
                        </button>
                      )}

                      <button
                        onClick={() => handleSkip(item.id)}
                        className="text-[10px] text-[#B0AEA6] hover:text-[#8E8C85] transition-colors"
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
                      className="text-[10px] text-[#8E8C85] hover:text-[#1A1A18] mt-2 underline"
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
            disabled={generating}
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              generating
                ? "bg-[#1B3A2D]/70 text-white cursor-not-allowed"
                : doneItems > 0
                ? "bg-[#1B3A2D] text-white hover:bg-[#24503B] shadow-[#1B3A2D]/20"
                : "bg-[#E5E3DD] text-[#8E8C85] hover:bg-[#D9D7D0]"
            }`}
          >
            {generating && (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>
              {generating
                ? "Generating..."
                : doneItems === 0
                ? "Generate Report (with estimates)"
                : doneItems < totalItems
                ? `Generate Report (${doneItems} data sources)`
                : "Generate Full Verified Report"}
            </span>
          </button>
          {generateError && (
            <p className="text-sm text-red-600 text-center mt-3">{generateError}</p>
          )}
          <div className="text-center text-[10px] text-[#B0AEA6] mt-2">
            {doneItems === 0
              ? "You can generate now and add data later. More data = more accuracy."
              : "You can always add more data later from your dashboard."}
          </div>
        </div>
      </div>
    </div>
  );
}
