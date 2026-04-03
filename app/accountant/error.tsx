"use client";

export default function AccountantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-[#FAFAF8]">
      <div className="text-center max-w-md px-6">
        <div className="w-14 h-14 rounded-2xl bg-[#B34040]/8 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B34040" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#1A1A18] mb-2">Something went wrong</h2>
        <p className="text-[13px] text-[#8E8C85] mb-6">{error.message || "An unexpected error occurred."}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="bg-[#1B3A2D] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#2A5A44] transition text-[13px]">Try Again</button>
          <a href="/accountant/dashboard" className="bg-white border border-[#E5E3DD] text-[#56554F] font-semibold px-6 py-2.5 rounded-xl hover:bg-[#F0EFEB] transition text-[13px]">Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
