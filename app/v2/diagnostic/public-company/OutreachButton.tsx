"use client";
// =============================================================================
// app/v2/diagnostic/public-company/OutreachButton.tsx
// Drop this button anywhere in the public company report page.
// Usage: <OutreachButton reportId={reportId} companyName={companyName} />
// =============================================================================

import { useRouter } from "next/navigation";

interface Props {
  reportId: string;
  companyName?: string;
}

export default function OutreachButton({ reportId, companyName }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/v2/diagnostic/public-company/outreach?reportId=${reportId}`)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-sm font-medium transition-all group"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
      Generate CFO Outreach Email
      <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  );
}
