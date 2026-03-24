"use client";
// =============================================================================
// app/join/page.tsx — Enterprise client invite landing
// Client clicks magic link from rep → creates account → enterprise dashboard
// Token contains: diagId, clientEmail, clientName, companyName, repId, exp
// =============================================================================

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const SECRET_CHECK_API = "/api/rep/client-access/verify";

function JoinContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get("token") || "";

  const [payload,  setPayload]  = useState<any>(null);
  const [invalid,  setInvalid]  = useState(false);
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [verifying,setVerifying]= useState(true);
  const [error,    setError]    = useState("");

  // Verify token on mount
  useEffect(() => {
    if (!token) { setInvalid(true); setVerifying(false); return; }
    fetch(`${SECRET_CHECK_API}?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) setPayload(d.payload);
        else setInvalid(true);
      })
      .catch(() => setInvalid(true))
      .finally(() => setVerifying(false));
  }, [token]);

  async function handleCreate() {
    if (!payload || !password) return;
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    setError("");

    try {
      // Create account
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:    payload.clientEmail,
          password,
          name:     payload.clientName || payload.companyName,
          inviteToken: token,
          isEnterpriseInvite: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }

      // Auto-login
      const loginResult = await signIn("credentials", {
        email: payload.clientEmail,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        router.push("/login");
        return;
      }

      // Link diagnostic to new account
      await fetch("/api/rep/client-access/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userId: data.userId }),
      });

      // Redirect to enterprise dashboard
      window.location.href = "/v2/dashboard/enterprise";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" />
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B34040" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="17" r="0.5" fill="#B34040"/>
            </svg>
          </div>
          <h2 className="font-serif text-[22px] text-[#1A1A18] font-normal mb-2">Link expired or invalid</h2>
          <p className="text-[14px] text-[#56554F] leading-relaxed mb-6">
            This invitation link has expired or is no longer valid. Please contact your Fruxal advisor to send a new one.
          </p>
          <a href="mailto:hello@fruxal.com"
            className="inline-block px-6 py-2.5 text-[13px] font-semibold text-white bg-[#1B3A2D] rounded-lg">
            Contact support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-[8px] bg-[#1B3A2D] flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/>
            </svg>
          </div>
          <span className="font-serif text-[17px] font-semibold text-[#1A1A18] tracking-tight">Fruxal</span>
        </div>

        {/* Welcome card */}
        <div className="bg-[#F0F7F4] border border-[#C8E0D4] rounded-2xl px-5 py-4 mb-8">
          <p className="text-[11px] font-bold text-[#1B3A2D] uppercase tracking-widest mb-1">Your dashboard is ready</p>
          <p className="text-[15px] font-semibold text-[#1A1A18]">{payload?.companyName}</p>
          <p className="text-[12px] text-[#56554F] mt-0.5">Prepared by {payload?.repName || "your Fruxal advisor"}</p>
        </div>

        <h1 className="font-serif text-[26px] text-[#1A1A18] font-normal mb-2">Create your account</h1>
        <p className="text-[14px] text-[#56554F] mb-8 leading-relaxed">
          Set a password to access your financial dashboard. Your email is pre-filled from the invitation.
        </p>

        {/* Email (pre-filled, read-only) */}
        <div className="mb-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E8C85] block mb-1.5">Email</label>
          <input
            type="email"
            value={payload?.clientEmail || ""}
            readOnly
            className="w-full px-4 py-3 bg-[#F0EFEB] border border-[#E5E3DD] rounded-lg text-[14px] text-[#8E8C85] font-sans"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E8C85] block mb-1.5">
            Set your password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full px-4 py-3 bg-white border border-[#E5E3DD] rounded-lg text-[14px] text-[#1A1A18] font-sans outline-none focus:border-[#1B3A2D] focus:ring-2 focus:ring-[#1B3A2D]/10 transition"
            onKeyDown={e => e.key === "Enter" && handleCreate()}
          />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={loading || !password}
          className="w-full py-3.5 text-[15px] font-bold text-white bg-[#1B3A2D] rounded-xl hover:bg-[#2A5A44] disabled:opacity-50 transition"
        >
          {loading ? "Creating your account…" : "Access my dashboard →"}
        </button>

        <p className="text-[11px] text-[#B5B3AD] text-center mt-4">
          By continuing you agree to Fruxal's{" "}
          <a href="/legal/terms" className="underline" target="_blank">Terms</a> and{" "}
          <a href="/legal/privacy" className="underline" target="_blank">Privacy Policy</a>.
        </p>

        <p className="text-[12px] text-[#8E8C85] text-center mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#1B3A2D] font-semibold hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" />
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
