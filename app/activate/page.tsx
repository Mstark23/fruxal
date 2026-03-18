"use client";
import { useSearchParams, useRouter } from "next/navigation";

export default function ActivatePage() {
  const params = useSearchParams();
  const router = useRouter();
  const prescanRunId = params.get("prescanRunId");

  return (
    <div className="min-h-screen bg-bg font-sans flex items-center justify-center px-6">
      <div className="w-full max-w-[420px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-soft flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
        </div>
        <h1 className="font-serif text-[28px] text-ink font-normal mb-2">Account activated</h1>
        <p className="text-sm text-ink-secondary mb-8 leading-relaxed">Your account is ready. Access your financial dashboard to see your leak analysis and start protecting your margins.</p>
        <button
          onClick={() => router.push(prescanRunId ? `/dashboard?prescanRunId=${prescanRunId}` : "/dashboard")}
          className="px-7 py-3 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition"
        >
          Go to dashboard →
        </button>
      </div>
    </div>
  );
}
