// =============================================================================
// src/components/celebrations/DashboardProgressPanel.tsx
// =============================================================================
// Drop-in panel for the V2 dashboard sidebar. Combines:
//   • SavingsCounter
//   • StreakTracker
//   • MilestoneCards
//
// Pulls data from useCelebration hook's progress state.
//
// Usage in dashboard:
//   import DashboardProgressPanel from "@/components/celebrations/DashboardProgressPanel";
//   import { useCelebration } from "@/hooks/useCelebration";
//   import CelebrationOverlay from "@/components/celebrations/CelebrationOverlay";
//
//   const { progress, celebrating, celebrationProps, dismissCelebration } = useCelebration();
//
//   return (
//     <>
//       {celebrating && celebrationProps && (
//         <CelebrationOverlay {...celebrationProps} onDone={dismissCelebration} />
//       )}
//       <DashboardProgressPanel progress={progress} />
//     </>
//   );
// =============================================================================

"use client";

import SavingsCounter from "./SavingsCounter";
import StreakTracker from "./StreakTracker";
import MilestoneCards, { MILESTONE_DEFINITIONS } from "./MilestoneCards";

interface ProgressState {
  total_savings: number;
  leaks_fixed: number;
  total_leaks: number;
  obligations_completed: number;
  overdue_count: number;
  programs_applied: number;
  streak: {
    current: number;
    longest: number;
    today_active: boolean;
    week_map: boolean[];
  };
  milestones: { id: string; earned_at: string }[];
  health_score: number;
}

interface Props {
  progress: ProgressState | null;
  recentSavings?: number;  // Set when a leak was just fixed (triggers animation)
}

export default function DashboardProgressPanel({ progress, recentSavings }: Props) {
  if (!progress) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/[0.015] border border-white/[0.04] rounded-2xl p-4 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  // Map earned milestone IDs to full definitions
  const earnedMilestones = progress.milestones
    .map(m => {
      const def = MILESTONE_DEFINITIONS.find(d => d.id === m.id);
      return def ? { ...def, earned_at: m.earned_at } : null;
    })
    .filter(Boolean) as { id: string; icon: string; label: string; description: string; earned_at: string }[];

  // Find next unearned milestone
  const earnedIds = new Set(progress.milestones.map(m => m.id));
  const nextMilestone = MILESTONE_DEFINITIONS.find(d => !earnedIds.has(d.id)) || null;

  return (
    <div className="space-y-3">
      {/* Savings Counter */}
      <SavingsCounter
        total={progress.total_savings}
        recent={recentSavings}
        leaksFixed={progress.leaks_fixed}
        totalLeaks={progress.total_leaks}
      />

      {/* Streak */}
      <StreakTracker
        current={progress.streak.current}
        longest={progress.streak.longest}
        todayActive={progress.streak.today_active}
        weekMap={progress.streak.week_map}
      />

      {/* Milestones */}
      <MilestoneCards
        earned={earnedMilestones}
        nextUp={nextMilestone}
        totalAvailable={MILESTONE_DEFINITIONS.length}
      />

      {/* Quick stats footer */}
      <div className="grid grid-cols-3 gap-2">
        <QuickStat
          value={progress.obligations_completed}
          label="Done"
          color={progress.overdue_count === 0 ? "emerald" : "amber"}
        />
        <QuickStat
          value={progress.overdue_count}
          label="Overdue"
          color={progress.overdue_count > 0 ? "red" : "emerald"}
        />
        <QuickStat
          value={progress.programs_applied}
          label="Applied"
          color="blue"
        />
      </div>
    </div>
  );
}

function QuickStat({ value, label, color }: { value: number; label: string; color: string }) {
  const c = color === "emerald" ? "text-emerald-400/50 bg-emerald-500/5" :
            color === "red" ? "text-red-400/50 bg-red-500/5" :
            color === "amber" ? "text-amber-400/50 bg-amber-500/5" :
            "text-blue-400/50 bg-blue-500/5";
  return (
    <div className={`${c} rounded-lg py-2 text-center`}>
      <p className="text-sm font-black">{value}</p>
      <p className="text-[7px] uppercase tracking-wider opacity-60">{label}</p>
    </div>
  );
}
