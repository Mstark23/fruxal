// =============================================================================
// /nps?token=XXX — NPS survey page for completed engagement clients
// =============================================================================
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NPSContent() {
  const params = useSearchParams();
  const token  = params.get("token") || "";

  const [company, setCompany]         = useState("");
  const [submitted, setSubmitted]     = useState(false);
  const [score, setScore]             = useState<number | null>(null);
  const [testimonial, setTestimonial] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [isPromoter, setIsPromoter]   = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!token) { setError("Invalid survey link."); setLoading(false); return; }
    fetch(`/api/v2/nps?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setCompany(d.companyName || "");
          if (d.alreadySubmitted) setSubmitted(true);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async () => {
    if (score == null) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v2/nps", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, score, testimonial }),
      });
      const j = await res.json();
      if (j.success) { setSubmitted(true); setIsPromoter(j.isPromoter); }
      else setError(j.error || "Something went wrong.");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" /></div>;

  if (error) return <div className="min-h-screen bg-bg flex items-center justify-center px-6"><div className="text-center"><p className="text-ink-secondary">{error}</p><a href="/" className="mt-4 text-sm text-brand hover:underline block">Return home</a></div></div>;

  if (submitted) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-[400px]">
        <div className="w-14 h-14 rounded-full bg-positive/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 className="font-serif text-[28px] text-ink mb-3">Thank you{company ? `, ${company}` : ""}.</h1>
        <p className="text-body text-ink-secondary mb-6">
          {isPromoter
            ? "We're glad we could help. If you know another business owner who could benefit, your referral means a lot — and earns you $500 when their engagement closes."
            : "Your feedback helps us improve for every client. If there's anything we could have done better, please reach out directly."}
        </p>
        {isPromoter && (
          <a href="/v2/referral" className="inline-block px-6 py-3 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition">
            Refer a business owner →
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
          <div className="w-9 h-9 rounded-[9px] bg-brand flex items-center justify-center mx-auto mb-5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <h1 className="font-serif text-[28px] text-ink mb-2">How did we do{company ? `, ${company}` : ""}?</h1>
          <p className="text-body text-ink-secondary">Your honest feedback helps us improve.</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-7 space-y-6">
          <div>
            <p className="text-[13px] font-semibold text-ink mb-3">How likely are you to recommend Fruxal to another business owner?</p>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => setScore(n)}
                  className="w-9 h-9 rounded-lg text-[13px] font-bold transition-all"
                  style={{
                    background: score === n ? "#1B3A2D" : "#F0EFEB",
                    color: score === n ? "white" : "#56554F",
                    transform: score === n ? "scale(1.1)" : "scale(1)",
                  }}>
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-ink-faint">
              <span>Not likely</span><span>Very likely</span>
            </div>
          </div>

          {score != null && (
            <div>
              <p className="text-[13px] font-semibold text-ink mb-2">
                {score >= 9 ? "What did we do especially well?" : score >= 7 ? "What could we improve?" : "What fell short of your expectations?"}
              </p>
              <textarea value={testimonial} onChange={e => setTestimonial(e.target.value)}
                rows={3} placeholder="Optional — but your words help the next business owner make their decision."
                className="w-full px-4 py-3 border border-border rounded-xl text-[13px] text-ink bg-bg-subtle focus:outline-none focus:border-brand resize-none"
              />
            </div>
          )}

          {error && <p className="text-sm text-negative">{error}</p>}

          <button onClick={submit} disabled={score == null || submitting}
            className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition disabled:opacity-40">
            {submitting ? "Submitting…" : "Submit feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NPSPage() {
  return <Suspense fallback={null}><NPSContent /></Suspense>;
}
