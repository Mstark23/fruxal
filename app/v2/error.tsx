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
        <div className="text-4xl mb-4">😵</div>
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
