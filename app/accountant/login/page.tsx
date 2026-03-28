"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERRORS: Record<string, string> = {
  missing_token: "No login token. Use the link sent to your email.",
  expired:       "Link expired. Request a new one below.",
  inactive:      "Account inactive. Contact your admin.",
};

function LoginForm() {
  const params  = useSearchParams();
  const errKey  = params.get("error");
  const [email, setEmail]   = useState("");
  const [sent,  setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim()) return;
    setLoading(true);
    await fetch("/api/accountant/auth/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E5E3DD] rounded-2xl px-8 py-10 max-w-md w-full text-center"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-[#1B3A2D] flex items-center justify-center">
            <span className="text-white font-black text-[11px]">F</span>
          </div>
          <span className="text-[17px] font-bold text-[#1B3A2D]">Fruxal</span>
          <span className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider">Accountant</span>
        </div>

        {errKey && !sent && (
          <div className="mb-4 px-4 py-3 rounded-xl text-left"
            style={{ background: "rgba(179,64,64,0.05)", border: "1px solid rgba(179,64,64,0.15)" }}>
            <p className="text-[12px] text-[#B34040]">{ERRORS[errKey] || "Something went wrong."}</p>
          </div>
        )}

        {sent ? (
          <>
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(27,58,45,0.08)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 className="text-[16px] font-bold text-[#1A1A18] mb-2">Check your email</h2>
            <p className="text-[13px] text-[#56554F]">If that email is registered, a login link is on its way. Expires in 15 minutes.</p>
          </>
        ) : (
          <>
            <h2 className="text-[18px] font-bold text-[#1A1A18] mb-2">Sign in</h2>
            <p className="text-[13px] text-[#8E8C85] mb-6">We'll send a login link to your email.</p>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && submit()}
              placeholder="your@email.com"
              className="w-full text-[13px] border border-[#E8E6E1] rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20"
            />
            <button onClick={submit} disabled={!email.trim() || loading}
              className="w-full py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 transition"
              style={{ background: "#1B3A2D" }}>
              {loading ? "Sending…" : "Send Login Link →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AccountantLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
