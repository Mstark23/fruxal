// =============================================================================
// /v2/referral — Customer referral program page
// =============================================================================
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function ReferralPage() {
  const { user } = useAuth();
  const [code,     setCode]    = useState<string>("");
  const [url,      setUrl]     = useState<string>("");
  const [signups,  setSignups] = useState(0);
  const [earned,   setEarned]  = useState(0);
  const [loading,  setLoading] = useState(true);
  const [copied,   setCopied]  = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch("/api/referral?userId=" + user.id)
      .then(r => r.json())
      .then(d => {
        setCode(d.code || "");
        setUrl(d.referralUrl || "");
        setSignups(d.signups ?? 0);
        setEarned(d.earned ?? 0);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const copy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-label uppercase text-brand font-semibold mb-2">Referral Program</p>
        <h1 className="font-serif text-h1 text-ink font-normal mb-3">Earn $500 per referral</h1>
        <p className="text-body text-ink-secondary leading-relaxed">
          Know another Canadian business owner who could benefit from a Fruxal recovery?
          Refer them. When their engagement closes — money is confirmed and fee collected —
          you earn <strong className="text-ink">$500</strong>.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6">
        <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-4">How it works</p>
        <div className="space-y-4">
          {[
            { n: "1", title: "Share your link", sub: "Send it to a business owner you know. They start their free prescan." },
            { n: "2", title: "They get matched with a rep", sub: "If they qualify, Fruxal assigns a recovery expert. No cost to them." },
            { n: "3", title: "Engagement closes", sub: "When their rep confirms savings and fee is collected, you earn $500." },
          ].map(s => (
            <div key={s.n} className="flex gap-4 items-start">
              <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-white">{s.n}</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-ink">{s.title}</p>
                <p className="text-[12px] text-ink-secondary mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral link */}
      {code && (
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-3">Your referral link</p>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-bg border border-border-light rounded-xl font-mono text-[13px] text-ink truncate">
              {url}
            </div>
            <button onClick={copy}
              className="shrink-0 px-4 py-3 font-semibold text-[13px] rounded-xl transition-all"
              style={{ background: copied ? "rgba(45,122,80,0.08)" : "#1B3A2D",
                       color: copied ? "#2D7A50" : "white" }}>
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-[11px] font-semibold text-brand hover:underline">
              Share on LinkedIn →
            </a>
            <span className="text-ink-faint">·</span>
            <a href={`mailto:?subject=Your business might be leaking money&body=I've been using Fruxal to find hidden financial leaks in my business. They found $X/year I was leaving on the table. Check it out: ${url}`}
              className="text-[11px] font-semibold text-brand hover:underline">
              Share by email →
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">Referrals</p>
          <p className="font-serif text-[32px] font-bold text-ink">{signups}</p>
          <p className="text-[11px] text-ink-faint">people signed up</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">Earned</p>
          <p className="font-serif text-[32px] font-bold text-positive">${earned.toLocaleString()}</p>
          <p className="text-[11px] text-ink-faint">from closed engagements</p>
        </div>
      </div>

      <p className="text-[11px] text-ink-faint text-center mt-6 leading-relaxed">
        Referral credits are paid out within 30 days of engagement closure.
        No limit on referrals. Program terms may change with 30 days notice.
      </p>
    </div>
  );
}
