// =============================================================================
// /roi — Recovery ROI calculator (contingency model)
// =============================================================================
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_INDUSTRIES, POPULAR_INDUSTRIES, getLeakRate, getDisplayName } from "@/lib/industries";

const FEE_PCT = 12;

export default function ROIPage() {
  const router = useRouter();
  const [revenue, setRevenue] = useState(500000);
  const [industry, setIndustry] = useState("restaurant");

  const leakRate   = getLeakRate(industry);
  const estimated  = Math.round(revenue * leakRate);
  const recovered  = Math.round(estimated * 0.65);   // typical recovery rate
  const fruxalFee  = Math.round(recovered * FEE_PCT / 100);
  const youKeep    = recovered - fruxalFee;
  const daily      = Math.round(estimated / 365);
  const monthly    = Math.round(estimated / 12);

  const popular = POPULAR_INDUSTRIES.slice(0, 16);

  return (
    <div className="min-h-screen bg-bg font-sans">
      {/* Nav */}
      <nav className="h-[60px] px-6 flex items-center justify-between border-b border-border-light bg-white">
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="font-serif text-[17px] font-semibold text-ink">Fruxal</span>
        </button>
        <button onClick={() => router.push("/")} className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition">
          Scan My Business — Free →
        </button>
      </nav>

      <div className="max-w-[680px] mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h1 className="font-serif text-[40px] font-normal text-ink leading-tight mb-3">
            What could your business recover?
          </h1>
          <p className="text-[17px] text-ink-secondary">
            Adjust your revenue and industry. See the math on 12% contingency.
          </p>
        </div>

        {/* Revenue slider */}
        <div className="bg-white border border-border rounded-2xl p-7 mb-5">
          <div className="flex items-baseline justify-between mb-3">
            <label className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">Annual revenue</label>
            <span className="font-serif text-[28px] font-semibold text-ink">
              ${revenue.toLocaleString()}
            </span>
          </div>
          <input type="range" min={75000} max={5000000} step={25000} value={revenue}
            onChange={e => setRevenue(+e.target.value)}
            className="w-full accent-brand mb-4" />
          <div className="flex justify-between text-[10px] text-ink-faint">
            <span>$75K</span><span>$500K</span><span>$1M</span><span>$2.5M</span><span>$5M</span>
          </div>
        </div>

        {/* Industry */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <label className="block text-[12px] font-bold text-ink-muted uppercase tracking-wider mb-3">Industry</label>
          <div className="flex flex-wrap gap-2">
            {popular.map((ind: any) => (
              <button key={ind.id} onClick={() => setIndustry(ind.id)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition"
                style={{
                  background: industry === ind.id ? "#1B3A2D" : "#F0EFEB",
                  color:      industry === ind.id ? "white"    : "#56554F",
                }}>
                {getDisplayName(ind.id)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden mb-6">
          <div className="bg-negative/5 border-b border-negative/10 px-6 py-4">
            <p className="text-[11px] font-bold text-negative/70 uppercase tracking-wider mb-1">What you're currently losing</p>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-[40px] font-semibold text-negative">${estimated.toLocaleString()}</span>
              <span className="text-ink-secondary">/year</span>
            </div>
            <p className="text-[12px] text-ink-faint mt-1">
              ~${monthly.toLocaleString()}/month · ${daily.toLocaleString()}/day
            </p>
          </div>

          <div className="px-6 py-5 space-y-4">
            {[
              { label: "Estimated recoverable (65% avg recovery rate)", value: "$" + recovered.toLocaleString(), color: "#1A1A18" },
              { label: `Fruxal fee (${FEE_PCT}% of what we recover)`,     value: "−$" + fruxalFee.toLocaleString(), color: "#B34040", note: "Only paid after recovery" },
              { label: "You keep",                                          value: "$" + youKeep.toLocaleString(), color: "#2D7A50", bold: true },
            ].map(row => (
              <div key={row.label} className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-ink">{row.label}</p>
                  {row.note && <p className="text-[11px] text-ink-faint">{row.note}</p>}
                </div>
                <p className={`text-[18px] font-bold shrink-0 ml-4 ${row.bold ? "text-[22px]" : ""}`} style={{ color: row.color }}>
                  {row.value}
                </p>
              </div>
            ))}

            <div className="pt-3 border-t border-border-light">
              <p className="text-[11px] text-ink-faint text-center">
                No cost until money is confirmed recovered. Fee is ${FEE_PCT}% of actual savings, not estimates.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button onClick={() => router.push("/")}
            className="px-8 py-4 bg-brand text-white text-[15px] font-semibold rounded-sm hover:bg-brand-light transition">
            See my actual leaks — free scan →
          </button>
          <p className="text-[11px] text-ink-faint mt-3">Takes 3 minutes. No credit card. No cost unless we recover.</p>
        </div>
      </div>
    </div>
  );
}
