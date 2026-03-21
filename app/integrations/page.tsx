"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const INTEGRATIONS = [
  { id: "quickbooks", name: "QuickBooks", icon: "📗", desc: "Sync income, expenses, and invoices automatically", status: "available", accuracy: "95%" },
  { id: "xero", name: "Xero", icon: "📘", desc: "Pull real financial data from your Xero account", status: "available", accuracy: "95%" },
  { id: "shopify", name: "Shopify", icon: "🛒", desc: "E-commerce sales, orders, and product data", status: "available", accuracy: "90%" },
  { id: "stripe_int", name: "Stripe", icon: "💳", desc: "Payment processing data and transaction fees", status: "available", accuracy: "90%" },
  { id: "plaid", name: "Bank (Plaid)", icon: "🏦", desc: "Connect bank accounts for real transaction data", status: "coming_soon", accuracy: "85%" },
  { id: "csv", name: "CSV Upload", icon: "📄", desc: "Upload any spreadsheet with financial data", status: "available", accuracy: "75%" },
  { id: "square", name: "Square", icon: "⬛", desc: "POS data, payments, and inventory", status: "coming_soon", accuracy: "85%" },
  { id: "freshbooks", name: "FreshBooks", icon: "📒", desc: "Invoicing and expense tracking", status: "coming_soon", accuracy: "85%" },
  { id: "wave", name: "Wave", icon: "🌊", desc: "Free accounting software integration", status: "coming_soon", accuracy: "80%" },
  { id: "zapier", name: "Zapier", icon: "⚡", desc: "Connect to 5,000+ apps via webhook", status: "available", accuracy: "varies" },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [ctx, setCtx] = useState<any>(null);
  const [connected, setConnected] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      setCtx(d);
      // Check connected integrations
      if (d.business?.id) {
        fetch(`/api/integrations/connect?businessId=${d.business.id}`).then(r => r.json())
          .then(d => setConnected(d.connected || []))
          .catch(() => {});
      }
    }).catch(() => router.push("/login"));
  }, [router]);

  const connect = async (integrationId: string) => {
    if (!ctx?.business?.id) return;
    if (integrationId === "csv") { router.push("/scan"); return; }
    if (integrationId === "zapier") { router.push("/settings"); return; }
    try {
      setIsLoading(true);
    const res = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: ctx.business.id, provider: integrationId }),
      });
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    setIsLoading(false);
    } catch (e) { alert("Connection failed"); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-[#1a1a2e]">🔌 Integrations</h1>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Connect your data sources for more accurate leak detection.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INTEGRATIONS.map(int => {
            const isConnected = connected.includes(int.id);
            const isComingSoon = int.status === "coming_soon";
            return (
              <div key={int.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${isComingSoon ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{int.icon}</span>
                    <div>
                      <div className="text-sm font-bold">{int.name}</div>
                      <div className="text-xs text-gray-400">{int.accuracy} accuracy</div>
                    </div>
                  </div>
                  {isConnected && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Connected</span>}
                </div>
                <p className="text-xs text-gray-500 mb-3">{int.desc}</p>
                <button
                  onClick={() => !isComingSoon && !isConnected && connect(int.id)}
                  disabled={isComingSoon || isConnected}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    isConnected ? "bg-green-50 text-green-600" :
                    isComingSoon ? "bg-gray-100 text-gray-400" :
                    "bg-[#1a1a2e] text-white hover:bg-[#2a2a3e]"
                  }`}
                >
                  {isConnected ? "✓ Connected" : isComingSoon ? "Coming Soon" : "Connect →"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
