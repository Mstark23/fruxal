"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientsPage() {
  const router = useRouter();
  const [ctx, setCtx] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"leaking" | "health" | "name">("leaking");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(async d => {
      setCtx(d);
      const allBiz = d.businesses || [];
      // Fetch dashboard data for each business
      const enriched = await Promise.all(allBiz.map(async (b: any) => {
        try {
          const res = await fetch(`/api/dashboard?businessId=${b.id}`);
          const dash = await res.json();
          return { ...b, ...dash };
        } catch { return b; }
      }));
      setBusinesses(enriched);
      setLoading(false);
    }).catch(() => router.push("/login"));
  }, [router]);

  const sorted = [...businesses].sort((a, b) => {
    if (sortBy === "leaking") return (b.totalLeaking || 0) - (a.totalLeaking || 0);
    if (sortBy === "health") return (a.healthScore || 0) - (b.healthScore || 0);
    return (a.name || "").localeCompare(b.name || "");
  });

  const totalLeaking = businesses.reduce((s, b) => s + (b.totalLeaking || 0), 0);
  const totalSaved = businesses.reduce((s, b) => s + (b.totalSaved || 0), 0);
  const avgHealth = businesses.length > 0 ? Math.round(businesses.reduce((s, b) => s + (b.healthScore || 0), 0) / businesses.length) : 0;

  if (loading) return <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center text-gray-400">Loading clients...</div>;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-[#1a1a2e]">👥 Client Portal</h1>
            <p className="text-sm text-gray-400">{businesses.length} businesses under management</p>
          </div>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</button>
        </div>

        {/* Portfolio summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-xs text-gray-400">Total Clients</div>
            <div className="text-2xl font-black text-[#1a1a2e]">{businesses.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-xs text-gray-400">Total Leaking</div>
            <div className="text-2xl font-black text-[#ff3d57]">${totalLeaking.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-xs text-gray-400">Total Saved</div>
            <div className="text-2xl font-black text-[#00c853]">${totalSaved.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-xs text-gray-400">Avg Health</div>
            <div className="text-2xl font-black" style={{ color: avgHealth >= 70 ? "#00c853" : avgHealth >= 40 ? "#ff8f00" : "#ff3d57" }}>{avgHealth}/100</div>
          </div>
        </div>

        {/* Add client */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4 flex gap-2">
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Add client by email..." className="flex-1 px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200" />
          <button onClick={async () => {
            if (!inviteEmail) return;
            setInviting(true);
            try {
              await fetch("/api/business", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name: inviteEmail.split("@")[0] + "'s Business", industry: "consulting", inviteEmail }) });
              alert("Client invited!");
              setInviteEmail("");
            } catch {}
            setInviting(false);
          }} disabled={inviting} className="px-4 py-2 bg-[#1a1a2e] text-white font-bold rounded-xl text-sm">{inviting ? "..." : "+ Add Client"}</button>
        </div>

        {/* Sort controls */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "leaking" as const, label: "Most Leaking" },
            { key: "health" as const, label: "Worst Health" },
            { key: "name" as const, label: "Name" },
          ].map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${sortBy === s.key ? "bg-[#1a1a2e] text-white" : "bg-white text-gray-400 border"}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Client list */}
        <div className="space-y-2">
          {sorted.map(biz => {
            const health = biz.healthScore || 0;
            const leaking = biz.totalLeaking || 0;
            const saved = biz.totalSaved || 0;
            const openLeaks = biz.openLeaks || 0;
            const urgentLeaks = biz.urgentLeaks || 0;
            return (
              <div key={biz.id} className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md transition-all cursor-pointer" onClick={() => {
                // Switch to this business context
                sessionStorage.setItem("switchBusiness", biz.id);
                router.push("/dashboard");
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{
                      background: health >= 70 ? "#e8f9ef" : health >= 40 ? "#fff8e8" : "#fff0f2"
                    }}>
                      {health >= 70 ? "🟢" : health >= 40 ? "🟡" : "🔴"}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1a1a2e]">{biz.name}</div>
                      <div className="text-xs text-gray-400">{biz.industry} · {biz.plan || "free"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-sm font-black text-[#ff3d57]">${leaking.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">leaking</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#00c853]">${saved.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">saved</div>
                    </div>
                    <div>
                      <div className="text-sm font-black">{health}</div>
                      <div className="text-xs text-gray-400">score</div>
                    </div>
                    <div className="text-xs">
                      {urgentLeaks > 0 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{urgentLeaks} urgent</span>}
                      {urgentLeaks === 0 && openLeaks > 0 && <span className="bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full font-bold">{openLeaks} open</span>}
                      {openLeaks === 0 && <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold">Clean</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {businesses.length <= 1 && (
          <div className="text-center py-8 text-gray-400 mt-4">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm">Add more businesses to use the Client Portal.</div>
            <div className="text-xs mt-1">Great for accountants, consultants, and agencies managing multiple clients.</div>
          </div>
        )}
      </div>
    </div>
  );
}
