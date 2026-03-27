// =============================================================================
// /partners — Accountant & Bookkeeper Partner Program
// =============================================================================
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const EMBED_CODE = `<iframe 
  src="https://fruxal.ca/embed" 
  width="360" 
  height="500"
  frameborder="0" 
  scrolling="no"
  style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1)">
</iframe>`;

export default function PartnersPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", firm:"", clients:"" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(EMBED_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = async () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    try {
      await fetch("/api/partners/apply", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } finally { setSubmitting(false); }
  };

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
        <button onClick={() => router.push("/register")} className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition">
          Create account →
        </button>
      </nav>

      <div className="max-w-[800px] mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-soft rounded-full text-xs font-semibold text-brand mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-positive" />
            Partner Program — Accountants & Bookkeepers
          </div>
          <h1 className="font-serif text-[42px] font-normal text-ink leading-tight mb-4">
            Help your clients find money.<br/>Earn when they do.
          </h1>
          <p className="text-[18px] text-ink-secondary leading-relaxed max-w-[520px] mx-auto">
            Add Fruxal to your client portal. When a client scans and recovers money, 
            you earn a referral fee — no extra work required.
          </p>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {[
            { n:"1", title:"Embed the widget", body:"Add one line of HTML to your client portal, website, or newsletter. Clients see a free business scanner." },
            { n:"2", title:"Client scans", body:"Takes 3 minutes. They see their estimated financial leaks immediately, then get a full report if they register." },
            { n:"3", title:"You earn", body:"When a client's recovery engagement closes, you receive $500. Tracked automatically via your partner referral link." },
          ].map(s => (
            <div key={s.n} className="bg-white border border-border rounded-xl p-6">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center mb-4">
                <span className="text-[12px] font-black text-white">{s.n}</span>
              </div>
              <p className="text-[14px] font-bold text-ink mb-2">{s.title}</p>
              <p className="text-[13px] text-ink-secondary leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Embed code */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
            <p className="text-[13px] font-bold text-ink">Widget embed code</p>
            <button onClick={copy}
              className="text-[11px] font-semibold text-brand hover:underline">
              {copied ? "Copied!" : "Copy code →"}
            </button>
          </div>
          <div className="bg-[#F8F7F5] px-6 py-4">
            <pre className="text-[11px] text-ink-secondary font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">{EMBED_CODE}</pre>
          </div>
          <div className="px-6 py-4 border-t border-border-light">
            <p className="text-[11px] text-ink-faint">
              Add your partner code to the URL to track referrals: 
              <code className="bg-[#F0EFEB] px-1.5 py-0.5 rounded text-[10px] ml-1">?ref=YOUR_CODE</code>
            </p>
          </div>
        </div>

        {/* Apply */}
        {submitted ? (
          <div className="bg-white border border-border rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-positive/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="font-serif text-[22px] text-ink mb-2">Application received</h2>
            <p className="text-sm text-ink-secondary">We'll reach out within 1 business day with your partner code and setup instructions.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-2xl p-8">
            <h2 className="font-serif text-[22px] text-ink mb-1">Apply for partner access</h2>
            <p className="text-sm text-ink-secondary mb-6">Get your referral code, track earnings, and access partner resources.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key:"name", label:"Your name", ph:"Jane Smith" },
                { key:"email", label:"Email", ph:"jane@smithcpa.ca" },
                { key:"firm", label:"Firm / practice name", ph:"Smith CPA" },
                { key:"clients", label:"Approx. SMB clients", ph:"50" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))}
                    placeholder={f.ph}
                    className="w-full px-4 py-3 border border-border rounded-sm text-sm bg-white focus:outline-none focus:border-brand" />
                </div>
              ))}
            </div>
            <button onClick={submit} disabled={submitting || !form.name || !form.email}
              className="mt-6 w-full py-3 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition disabled:opacity-40">
              {submitting ? "Submitting…" : "Apply for partner access →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
