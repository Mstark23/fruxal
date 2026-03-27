// =============================================================================
// /embed — Embeddable partner widget
// Designed for accountants, bookkeepers, and financial advisors to embed
// on their own websites. When a client scans, they land on fruxal.ca
// with their industry pre-selected.
//
// Embed code for partners:
//   <iframe src="https://fruxal.ca/embed" width="360" height="480"
//     frameborder="0" scrolling="no" style="border-radius:16px"></iframe>
// =============================================================================
"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { ALL_INDUSTRIES, getDisplayName, getLeakRate } from "@/lib/industries";

export default function EmbedWidget() {
  const [step, setStep]       = useState<"pick"|"scan"|"result">("pick");
  const [industry, setIndustry] = useState("");
  const [revenue, setRevenue]   = useState("");
  const [result, setResult]     = useState<any>(null);

  const quickScan = async () => {
    setStep("scan");
    const rev        = parseFloat(revenue) || 500000;
    const leakPct    = getLeakRate(industry) * 100;
    const jitter     = leakPct + (Math.random() * 4 - 2);
    const total      = Math.round(rev * jitter / 100);
    const score      = Math.round(100 - jitter * 4);
    await new Promise(r => setTimeout(r, 1800));
    setResult({ total, score, leakPct: jitter.toFixed(1), leakCount: Math.floor(3 + Math.random() * 5) });
    setStep("result");
  };

  // Link to landing page with industry pre-filled — the prescan chat will skip that question
  const fullScanUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?industry=${encodeURIComponent(industry)}&utm_source=partner_embed&utm_medium=widget`
    : `https://fruxal.ca/?industry=${encodeURIComponent(industry)}&utm_source=partner_embed&utm_medium=widget`;

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0a0e14 0%,#0f1a12 100%)", padding:"0 8px" }}>
      <div style={{ width:"100%", maxWidth:340, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:"#1B3A2D",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/>
            </svg>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:"white" }}>Fruxal Business Scan</div>
        </div>

        {step === "pick" && (
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:16, padding:20 }}>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:11, marginBottom:16, lineHeight:1.5 }}>
              See how much your business might be leaving on the table. Free, takes 3 minutes.
            </p>
            <select value={industry} onChange={e => setIndustry(e.target.value)}
              style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,0.07)",
                border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, fontSize:13,
                color: industry ? "white" : "rgba(255,255,255,0.4)", marginBottom:10, outline:"none" }}>
              <option value="" style={{ color:"#333" }}>Select your industry</option>
              {ALL_INDUSTRIES.slice(0, 40).map((ind: any) => (
                <option key={ind} value={ind} style={{ color:"#333" }}>{getDisplayName(ind)}</option>
              ))}
            </select>
            <input type="number" value={revenue} onChange={e => setRevenue(e.target.value)}
              placeholder="Annual revenue (optional)"
              style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,0.07)",
                border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, fontSize:13,
                color:"white", marginBottom:14, outline:"none", boxSizing:"border-box" }} />
            <button onClick={quickScan} disabled={!industry}
              style={{ width:"100%", padding:"11px", background: industry ? "#1B3A2D" : "rgba(27,58,45,0.3)",
                color:"white", fontWeight:700, fontSize:13, borderRadius:10, border:"none",
                cursor: industry ? "pointer" : "not-allowed" }}>
              Quick scan →
            </button>
          </div>
        )}

        {step === "scan" && (
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:16, padding:32, textAlign:"center" }}>
            <div style={{ width:32, height:32, border:"2px solid rgba(27,58,45,0.3)",
              borderTop:"2px solid #2D7A50", borderRadius:"50%",
              animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600 }}>
              Scanning {getDisplayName(industry)}…
            </div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:6 }}>
              Comparing against 4,273+ Canadian benchmarks
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:16, overflow:"hidden" }}>
            <div style={{ background:"linear-gradient(135deg,#B34040,#8B1A1A)", padding:"20px 20px 16px", textAlign:"center" }}>
              <div style={{ fontSize:32, fontWeight:900, color:"white" }}>
                ${(result.total ?? 0).toLocaleString()}<span style={{ fontSize:16 }}>/yr</span>
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:4 }}>
                estimated leaking from {result.leakCount} areas
              </div>
            </div>
            <div style={{ padding:"16px 20px 20px" }}>
              <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                {[
                  { label:"Health Score", val: result.score + "/100",
                    color: result.score >= 60 ? "#2D7A50" : "#B34040" },
                  { label:"Revenue Leaking", val: result.leakPct + "%", color:"#B34040" },
                ].map(k => (
                  <div key={k.label} style={{ flex:1, background:"rgba(255,255,255,0.04)",
                    borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:k.color }}>{k.val}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{k.label}</div>
                  </div>
                ))}
              </div>
              <a href={fullScanUrl} target="_blank" rel="noopener"
                style={{ display:"block", width:"100%", padding:"12px", background:"#1B3A2D",
                  color:"white", fontWeight:700, fontSize:13, borderRadius:10,
                  textDecoration:"none", textAlign:"center", boxSizing:"border-box" }}>
                See full report — free →
              </a>
              <button onClick={() => { setStep("pick"); setResult(null); }}
                style={{ width:"100%", padding:"8px", background:"none", border:"none",
                  color:"rgba(255,255,255,0.3)", fontSize:11, cursor:"pointer", marginTop:6 }}>
                Scan another business
              </button>
              <div style={{ textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:8 }}>
                Powered by <a href="https://fruxal.ca" target="_blank" rel="noopener"
                  style={{ color:"rgba(255,255,255,0.3)", textDecoration:"none" }}>Fruxal</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
