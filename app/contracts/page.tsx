"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  docType: string;
  status: string;
  extractedData: any;
  analyzedAt: string | null;
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  UPLOADED: "bg-gray-100 text-gray-600",
  ANALYZING: "bg-yellow-100 text-yellow-700",
  ANALYZED: "bg-green-100 text-green-700",
  ERROR: "bg-red-100 text-red-700",
};

export default function ContractsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents/list");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch { /* non-fatal */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchDocs();
      } else {
        const data = await res.json();
        alert(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      alert("Upload failed");
    }
    setUploading(false);
  };

  const handleAnalyze = async (documentId: string) => {
    setAnalyzing(documentId);
    try {
      const res = await fetch("/api/documents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (res.ok) {
        await fetchDocs();
        setExpandedDoc(documentId);
      } else {
        const data = await res.json();
        alert(`Analysis failed: ${data.error}`);
      }
    } catch (err) {
      alert("Analysis failed");
    }
    setAnalyzing(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <AppShell>
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <div className="bg-gradient-to-r from-navy to-blue-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-black text-sm">L</div>
          <span className="text-lg font-extrabold text-white tracking-tight">Fruxal</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-blue-200 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">📄 Contract Reader</h1>
            <p className="text-gray-500 text-sm mt-1">Upload contracts and agreements. Our AI extracts rates, terms, and finds billing gaps.</p>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`mb-8 border-2 border-dashed rounded-xl p-10 text-center transition ${
            dragActive ? "border-brand-blue bg-blue-50" : "border-gray-300 bg-white"
          }`}
        >
          <div className="text-4xl mb-3">📤</div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-2">
            {uploading ? "Uploading..." : "Drop your contract here"}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            PDF, PNG, or JPEG — fee schedules, engagement letters, service agreements
          </p>
          <label className="inline-block px-6 py-2.5 text-sm font-bold text-white bg-navy rounded-lg hover:bg-blue-900 transition cursor-pointer">
            Browse Files
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">No documents uploaded yet. Upload a contract to get started.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                    {doc.fileType.includes("pdf") ? "📕" : "🖼️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{doc.fileName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {doc.docType.replace(/_/g, " ")} · Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_BADGE[doc.status] || STATUS_BADGE.UPLOADED}`}>
                    {doc.status === "ANALYZING" ? "⏳ Analyzing..." : doc.status}
                  </span>
                  {doc.status === "UPLOADED" && (
                    <button
                      onClick={() => handleAnalyze(doc.id)}
                      disabled={analyzing === doc.id}
                      className="px-4 py-2 text-sm font-bold text-white bg-accent rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {analyzing === doc.id ? "⏳ Reading..." : "🤖 Analyze with AI"}
                    </button>
                  )}
                  {doc.status === "ANALYZED" && (
                    <button
                      onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      className="px-4 py-2 text-sm font-bold text-brand-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      {expandedDoc === doc.id ? "Hide Results" : "View Results"}
                    </button>
                  )}
                </div>

                {/* Expanded Analysis Results */}
                {expandedDoc === doc.id && doc.extractedData && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50">
                    <div className="space-y-6">
                      {/* Parties */}
                      {doc.extractedData.parties && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Parties</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-400">Provider</div>
                              <div className="text-sm font-bold text-gray-900">{doc.extractedData.parties.provider || "—"}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-400">Client</div>
                              <div className="text-sm font-bold text-gray-900">{doc.extractedData.parties.client || "—"}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Key Terms */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Key Terms</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-400">Effective Date</div>
                            <div className="text-sm font-bold text-gray-900">{doc.extractedData.effectiveDate || "—"}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-400">Expiration</div>
                            <div className="text-sm font-bold text-gray-900">{doc.extractedData.expirationDate || "—"}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-400">Auto-Renew</div>
                            <div className="text-sm font-bold text-gray-900">{doc.extractedData.autoRenewal ? "✅ Yes" : "❌ No"}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-400">Contract Value</div>
                            <div className="text-sm font-bold text-gray-900">
                              {doc.extractedData.totalContractValue ? `$${doc.extractedData.totalContractValue.toLocaleString()}` : "—"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Terms */}
                      {doc.extractedData.paymentTerms && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Payment Terms</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-400">Net Days</div>
                              <div className="text-sm font-bold text-gray-900">Net {doc.extractedData.paymentTerms.netDays || "?"}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-400">Early Payment</div>
                              <div className="text-sm font-bold text-gray-900">{doc.extractedData.paymentTerms.earlyPaymentDiscount || "None"}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-400">Late Fee</div>
                              <div className="text-sm font-bold text-gray-900">{doc.extractedData.paymentTerms.lateFee || "None"}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pricing */}
                      {doc.extractedData.pricing && doc.extractedData.pricing.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Pricing ({doc.extractedData.pricing.length} items)
                          </h4>
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-2">Item</th>
                                  <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-2">Rate</th>
                                  <th className="text-right text-xs font-bold text-gray-500 uppercase px-4 py-2">Unit</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {doc.extractedData.pricing.map((item: any, i: number) => (
                                  <tr key={i}>
                                    <td className="px-4 py-2 text-gray-900">{item.item}</td>
                                    <td className="px-4 py-2 text-right font-bold text-gray-900">
                                      ${typeof item.rate === "number" ? item.rate.toLocaleString() : item.rate}
                                    </td>
                                    <td className="px-4 py-2 text-right text-gray-500">{item.unit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Red Flags */}
                      {doc.extractedData.redFlags && doc.extractedData.redFlags.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            ⚠️ Red Flags ({doc.extractedData.redFlags.length})
                          </h4>
                          <div className="space-y-2">
                            {doc.extractedData.redFlags.map((flag: any, i: number) => (
                              <div key={i} className={`rounded-lg p-4 border ${
                                flag.severity === "HIGH" ? "bg-red-50 border-red-200" : flag.severity === "MEDIUM" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"
                              }`}>
                                <div className="text-sm font-bold text-gray-900">{flag.issue}</div>
                                <div className="text-xs text-gray-500 mt-1">{flag.recommendation}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Billing Gaps */}
                      {doc.extractedData.billingGaps && doc.extractedData.billingGaps.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            💰 Billing Gaps Found ({doc.extractedData.billingGaps.length})
                          </h4>
                          <div className="space-y-2">
                            {doc.extractedData.billingGaps.map((gap: any, i: number) => (
                              <div key={i} className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-bold text-gray-900">{gap.issue}</div>
                                  {gap.estimatedImpact && (
                                    <span className="text-sm font-extrabold text-accent">${(gap.estimatedImpact ?? 0).toLocaleString()}</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{gap.recommendation}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Special Terms */}
                      {doc.extractedData.specialTerms && doc.extractedData.specialTerms.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Special Terms</h4>
                          <ul className="space-y-1">
                            {doc.extractedData.specialTerms.map((term: string, i: number) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">•</span>
                                {term}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </AppShell>
  );
}
