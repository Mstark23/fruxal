// =============================================================================
// app/agreement/[token]/page.tsx — Client-facing e-signature page
// No auth required. Token is the auth.
// =============================================================================
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCountryFromCookie } from "@/lib/country";

function fmtM(n: number) {
  return n >= 1_000_000 ? "$" + (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000 ? "$" + Math.round(n / 1_000) + "K"
    : "$" + n.toLocaleString();
}

const SEV_COLOR: Record<string, string> = {
  critical: "#B34040", high: "#C4841D", medium: "#0369a1", low: "#8E8C85",
};

export default function AgreementPage() {
  const { token } = useParams() as { token: string };
  const [data, setData]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [name, setName]           = useState("");
  const [title, setTitle]         = useState("");
  const [signing, setSigning]     = useState(false);
  const [signed, setSigned]       = useState(false);
  const [checked, setChecked]     = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/agreement/${token}`)
      .then(r => r.json())
      .then(d => {
        if (!d.success) { setError(d.error || "Invalid link"); }
        else if (d.already_signed) { setSigned(true); setData(d); }
        else { setData(d); }
      })
      .catch(() => setError("Failed to load agreement"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSign() {
    if (!name.trim() || !checked) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/agreement/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatory_name: name.trim(), signatory_title: title.trim() || null }),
      });
      const json = await res.json();
      if (json.success) setSigned(true);
      else setError(json.error || "Signature failed");
    } catch { setError("Network error — please try again"); }
    setSigning(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E1] p-8 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-full bg-[rgba(179,64,64,0.08)] flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B34040" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p className="font-semibold text-[#1A1A18] mb-2">Link issue</p>
        <p className="text-sm text-[#8E8C85]">{error}</p>
      </div>
    </div>
  );

  if (signed) return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E1] p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-[rgba(45,122,80,0.08)] flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-[20px] font-bold text-[#1A1A18] mb-2">Agreement signed</h2>
        <p className="text-[14px] text-[#56554F] mb-1">
          {data?.company_name ? `${data.company_name} is now engaged.` : "You're now engaged."}
        </p>
        <p className="text-[13px] text-[#8E8C85]">Your Fruxal team will be in touch within 1 business day to begin the recovery work.</p>
      </div>
    </div>
  );

  const rate = data?.contingency_rate ?? 12;
  const keep = 100 - rate;

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-12 px-4">
      <div className="max-w-[540px] mx-auto">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-7 h-7 rounded-[7px] bg-[#1B3A2D] flex items-center justify-center">
            <span className="text-white font-black text-[11px]">F</span>
          </div>
          <span className="font-serif text-[17px] font-bold text-[#1A1A18]">Fruxal</span>
        </div>

        {/* Hero card */}
        <div className="rounded-2xl overflow-hidden shadow-sm mb-4"
          style={{ background: "linear-gradient(135deg, #0F2419, #1B3A2D)" }}>
          <div className="px-6 py-6">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2">Engagement Agreement</p>
            <h1 className="text-[20px] font-bold text-white leading-snug mb-1">
              {data?.company_name}
            </h1>
            {data?.total_recoverable > 0 && (
              <p className="text-[14px] text-white/70">
                {fmtM(data.total_recoverable)} in identified recoverable savings
              </p>
            )}
          </div>
        </div>

        {/* Findings */}
        {data?.findings?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm mb-4 overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F0EFEB]">
              <span className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">
                What we'll recover
              </span>
            </div>
            {data.findings.map((f: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3 border-b border-[#F0EFEB] last:border-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: SEV_COLOR[f.severity] || "#8E8C85" }} />
                <span className="text-[13px] text-[#3A3935] flex-1">{f.title}</span>
                <span className="text-[13px] font-bold text-[#B34040] shrink-0">
                  {fmtM(f.impact_max || f.impact_min || 0)}/yr
                </span>
              </div>
            ))}
            <div className="px-5 py-3 bg-[#FAFAF8] flex justify-between items-center">
              <span className="text-[12px] font-semibold text-[#56554F]">Total identified</span>
              <span className="text-[15px] font-bold text-[#2D7A50]">{fmtM(data.total_recoverable)}/yr</span>
            </div>
          </div>
        )}

        {/* Terms */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm mb-4 px-5 py-5">
          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Agreement Terms</p>
          <div className="space-y-3">
            {[
              { icon: "✓", text: `Fruxal charges ${rate}% of confirmed savings only — nothing upfront.` },
              { icon: "✓", text: `You keep ${keep}% of every dollar we recover.` },
              { icon: "✓", text: getCountryFromCookie() === "US"
                ? "Our CPA handles all IRS filings, vendor negotiations, and program applications."
                : "Our accountant handles all CRA calls, vendor negotiations, and grant applications." },
              { icon: "✓", text: "Savings are only confirmed when money is in your account or obligation is formally reduced." },
              { icon: "✓", text: "You can withdraw from any individual finding at any time before submission." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-[#2D7A50] font-bold text-[13px] shrink-0 mt-0.5">{item.icon}</span>
                <span className="text-[13px] text-[#3A3935] leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signature form */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm mb-4 px-5 py-5">
          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-4">Your Signature</p>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8C85] mb-1">Full name *</label>
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full text-[13px] border border-[#E8E6E1] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20 text-[#1A1A18]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8C85] mb-1">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="CEO / Owner"
                className="w-full text-[13px] border border-[#E8E6E1] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20 text-[#1A1A18]"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer mb-4">
            <div
              onClick={() => setChecked(!checked)}
              className="w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition"
              style={{
                background:  checked ? "#1B3A2D" : "white",
                borderColor: checked ? "#1B3A2D" : "#E8E6E1",
              }}>
              {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <span className="text-[12px] text-[#56554F] leading-relaxed">
              I agree to Fruxal's contingency terms. I understand payment ({rate}%) is only due when savings are confirmed, and I authorize Fruxal to act on the findings listed above.
            </span>
          </label>

          <button
            onClick={handleSign}
            disabled={!name.trim() || !checked || signing}
            className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white transition disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)" }}>
            {signing ? "Signing…" : "Sign Agreement →"}
          </button>

          {error && <p className="text-[12px] text-[#B34040] mt-2 text-center">{error}</p>}

          <p className="text-center text-[11px] text-[#B5B3AD] mt-3">
            Signed electronically · {new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <p className="text-center text-[11px] text-[#B5B3AD]">
          Fruxal Financial Recovery · <a href="https://fruxal.ca" className="text-[#B5B3AD]">fruxal.ca</a>
        </p>
      </div>
    </div>
  );
}
