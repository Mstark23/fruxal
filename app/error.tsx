"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6 font-sans">
      <div className="text-center">
        <h1 className="font-serif text-[28px] text-ink font-normal mb-2">Something went wrong</h1>
        <p className="text-body text-ink-secondary mb-6">An error occurred. Please try again.</p>
        <button onClick={reset} className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition">Try again</button>
      </div>
    </div>
  );
}
