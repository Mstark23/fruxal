// =============================================================================
// /forgot-password — Request password reset
// =============================================================================
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json();
      if (j.success) setSent(true);
      else setError(j.error || "Something went wrong. Try again.");
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

        {sent ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-positive/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 className="font-serif text-h2 text-ink mb-2">Check your email</h1>
            <p className="text-body text-ink-secondary mb-6">
              If an account exists for <strong>{email}</strong>, we sent a reset link. Check your inbox — it expires in 1 hour.
            </p>
            <button onClick={() => router.push("/login")} className="text-sm text-brand hover:underline">
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-h2 text-ink text-center mb-2">Forgot your password?</h1>
            <p className="text-body text-ink-secondary text-center mb-8">
              Enter your email and we'll send you a reset link.
            </p>

            <div className="space-y-4">
              <input type="email" placeholder="you@company.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                className="w-full px-4 py-3 border border-border rounded-sm text-sm text-ink bg-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
              />

              {error && <p className="text-sm text-negative">{error}</p>}

              <button onClick={submit} disabled={loading || !email.trim()}
                className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition disabled:opacity-50">
                {loading ? "Sending…" : "Send reset link →"}
              </button>

              <div className="text-center">
                <a href="/login" className="text-sm text-ink-secondary hover:text-ink transition">
                  Back to sign in
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
