"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtM = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : `$${(n ?? 0).toLocaleString()}`;

export default function RepCommissionsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rep/commissions", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );

  const summary = data?.summary || {};
  const topPartners = data?.top_partners || [];
  const recs = data?.recommendations || [];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[17px] font-bold text-[#1B3A2D] tracking-tight">Fruxal</span>
            <span className="text-[10px] font-semibold text-[#8E8C85] uppercase tracking-wider bg-[#F0EFEB] px-2 py-0.5 rounded-full">Commissions</span>
          </div>
          <button onClick={() => router.push("/rep/dashboard")}
            className="text-[11px] font-semibold text-[#1B3A2D] hover:underline">
            Dashboard →
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Recommendations", value: summary.total_recommendations ?? 0, sub: "total sent" },
            { label: "Conversions", value: summary.total_conversions ?? 0, sub: "clients converted" },
            { label: "Conversion Rate", value: `${summary.conversion_rate ?? 0}%`, sub: "success rate" },
            { label: "Total Earned", value: fmtM(summary.total_commission ?? 0), sub: "commission" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E5E3DD] rounded-xl px-4 py-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">{s.label}</p>
              <p className="text-[20px] font-bold text-[#1A1A18] mt-0.5">{s.value}</p>
              <p className="text-[9px] text-[#B5B3AD]">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Top partners */}
        {topPartners.length > 0 && (
          <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Top Partners by Commission</p>
            <div className="space-y-2">
              {topPartners.map((p: any) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-[12px] font-medium text-[#1A1A18] flex-1 truncate">{p.name}</span>
                  <span className="text-[10px] text-[#8E8C85]">{p.recs} recs</span>
                  <span className="text-[10px] text-[#8E8C85]">{p.conversions} conv</span>
                  <span className="text-[12px] font-bold text-[#2D7A50]">{fmtM(p.commission)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation history */}
        <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">All Recommendations</p>
          {recs.length === 0 ? (
            <p className="text-[12px] text-[#8E8C85] text-center py-6">No recommendations yet. Recommend solutions from client finding cards.</p>
          ) : (
            <div className="space-y-2">
              {recs.map((r: any, i: number) => {
                const statusColor = r.status === "CONVERTED" ? "#2D7A50" : r.status === "CLICKED" ? "#C4841D" : "#8E8C85";
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-[#F0EFEB] last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1A1A18] truncate">{r.partner}</p>
                      <p className="text-[10px] text-[#8E8C85]">
                        {r.category} · {new Date(r.date || r.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                        {r.client && ` · ${r.client}`}
                      </p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ color: statusColor, background: statusColor + "12" }}>
                      {r.status}
                    </span>
                    {r.commission_earned > 0 && (
                      <span className="text-[11px] font-bold text-[#2D7A50] shrink-0">{fmtM(r.commission_earned)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
