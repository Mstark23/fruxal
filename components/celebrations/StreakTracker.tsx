// =============================================================================
// src/components/celebrations/StreakTracker.tsx
// =============================================================================
// Tracks daily engagement streaks. Shows in dashboard sidebar.
// Streak = logged in and completed at least 1 action (obligation check,
// leak review, diagnostic view, settings update).
//
// Usage:
//   <StreakTracker current={7} longest={14} todayActive={true} />
// =============================================================================

"use client";

interface StreakTrackerProps {
  current: number;      // Current consecutive days
  longest: number;      // All-time longest streak
  todayActive: boolean; // Has the user taken an action today?
  weekMap: boolean[];   // Last 7 days [Mon..Sun] true = active
}

export default function StreakTracker({ current, longest, todayActive, weekMap }: StreakTrackerProps) {
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const flameSize = current >= 30 ? "text-3xl" : current >= 14 ? "text-2xl" : current >= 7 ? "text-xl" : "text-lg";
  const flameColor = current >= 30 ? "text-orange-400" : current >= 14 ? "text-amber-400" : current >= 7 ? "text-yellow-400" : "text-white/20";

  return (
    <div className="bg-white border border-[#E5E3DD] rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`${flameSize} ${current > 0 ? "" : "grayscale opacity-30"}`}
            style={current > 0 ? { animation: "flicker 1.5s ease-in-out infinite" } : {}}>
            🔥
          </span>
          <div>
            <p className="text-[#1A1A18] text-sm font-black">{current} day{current !== 1 ? "s" : ""}</p>
            <p className="text-[#8E8C85] text-[8px] uppercase tracking-wider">Current streak</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#B5B3AD] text-[10px]">Best: {longest}d</p>
        </div>
      </div>

      {/* Week dots */}
      <div className="flex justify-between px-1">
        {weekMap.map((active, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
              active
                ? "bg-[#2D7A50]/10 text-[#2D7A50] border border-[#2D7A50]/20"
                : i === weekMap.length - 1 && !todayActive
                ? "bg-[#C4841D]/10 text-[#C4841D] border border-[#C4841D]/20 border-dashed"
                : "bg-[#F0EFEB] text-[#B5B3AD]"
            }`}>
              {active ? "✓" : i === weekMap.length - 1 && !todayActive ? "?" : ""}
            </div>
            <span className="text-[7px] text-[#B5B3AD]">{dayLabels[i]}</span>
          </div>
        ))}
      </div>

      {/* Motivation nudge */}
      {!todayActive && current > 0 && (
        <div className="mt-3 pt-2 border-t border-[#F0EFEB]">
          <p className="text-[#C4841D] text-[10px] text-center">
            Complete an action to keep your {current}-day streak!
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes flicker {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(-2deg); }
          50% { transform: scale(0.97) rotate(1deg); }
          75% { transform: scale(1.03) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
}
