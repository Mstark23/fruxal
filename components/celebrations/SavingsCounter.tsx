// =============================================================================
// src/components/celebrations/SavingsCounter.tsx
// =============================================================================
// Running total of annual savings. Lives on the dashboard.
// Animates upward when new leaks are fixed.
//
// Usage:
//   <SavingsCounter total={14200} recent={2400} />
// =============================================================================

"use client";

import { useState, useEffect } from "react";

interface SavingsCounterProps {
  total: number;       // Total annual savings so far
  recent?: number;     // Most recent addition (triggers animation)
  leaksFixed: number;  // Count of leaks addressed
  totalLeaks: number;  // Total leaks detected
}

export default function SavingsCounter({ total, recent, leaksFixed, totalLeaks }: SavingsCounterProps) {
  const [displayTotal, setDisplayTotal] = useState(total - (recent ?? 0));
  const [showRecent, setShowRecent] = useState(false);
  const pct = totalLeaks > 0 ? Math.round((leaksFixed / totalLeaks) * 100) : 0;

  useEffect(() => {
    if (!recent || recent <= 0) {
      setDisplayTotal(total);
      return;
    }

    // Animate the counter up
    setShowRecent(true);
    const start = total - recent;
    const duration = 1500;
    const steps = 35;
    let current = start;
    const increment = recent / steps;

    const interval = setInterval(() => {
      current += increment;
      if (current >= total) {
        setDisplayTotal(total);
        clearInterval(interval);
      } else {
        setDisplayTotal(Math.round(current));
      }
    }, duration / steps);

    const hideTimer = setTimeout(() => setShowRecent(false), 3000);

    return () => { clearInterval(interval); clearTimeout(hideTimer); };
  }, [total, recent]);

  return (
    <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-2xl p-5 relative overflow-hidden">
      {/* Floating +amount badge */}
      {showRecent && recent && recent > 0 && (
        <div className="absolute top-3 right-3" style={{ animation: "floatUp 2s ease-out forwards" }}>
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg">
            +${(Number(recent) || 0).toLocaleString()}/yr
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">💰</span>
        <span className="text-emerald-400/40 text-[9px] font-bold uppercase tracking-widest">Annual Savings</span>
      </div>

      {/* Big number */}
      <p className="text-emerald-400 text-3xl font-black mb-1">
        ${(Number(displayTotal) || 0).toLocaleString()}
        <span className="text-sm font-normal text-emerald-400/30">/yr</span>
      </p>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between mb-1">
          <span className="text-white/15 text-[9px]">{leaksFixed} of {totalLeaks} leaks addressed</span>
          <span className="text-emerald-400/40 text-[9px] font-bold">{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500/50 rounded-full transition-all duration-1000 ease-out"
            style={{ width: pct + "%" }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
