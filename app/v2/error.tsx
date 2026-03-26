"use client";

export default function V2Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full bg-[#0a0e17]">
      <div className="text-center max-w-md px-6">
        <svg className="w-12 h-12 mx-auto mb-4 text-negative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-400 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#00c853] text-black font-bold px-6 py-2.5 rounded-xl hover:bg-[#00e676] transition-colors text-sm"
          >
            Try Again
          </button>
          <a
            href="/v2/dashboard"
            className="bg-white/5 border border-white/10 text-gray-300 px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
