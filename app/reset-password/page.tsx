// =============================================================================
// /reset-password?token=XXX — Set new password
// =============================================================================
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get("token") || "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const submit = async () => {
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const j = await res.json();
      if (j.success) setSuccess(true);
      else setError(j.error || "Something went wrong.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center mb-8">
          <div className="w-9 h-9 rounded-[9px] bg-brand flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-positive/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 className="font-serif text-h2 text-ink mb-2">Password updated</h1>
            <p className="text-body text-ink-secondary mb-6">You can now sign in with your new password.</p>
            <button onClick={() => router.push("/login")}
              className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition">
              Sign in →
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-h2 text-ink text-center mb-2">Set a new password</h1>
            <p className="text-body text-ink-secondary text-center mb-8">Choose a strong password for your account.</p>

            <div className="space-y-4">
              <input type="password" placeholder="New password (8+ characters)" value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-sm text-sm bg-white focus:outline-none focus:border-brand" />
              <input type="password" placeholder="Confirm password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                className="w-full px-4 py-3 border border-border rounded-sm text-sm bg-white focus:outline-none focus:border-brand" />

              {error && <p className="text-sm text-negative">{error}</p>}

              <button onClick={submit} disabled={loading || !password || !confirm}
                className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition disabled:opacity-50">
                {loading ? "Updating…" : "Update password →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
