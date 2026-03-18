// =============================================================================
// src/components/celebrations/MilestoneCards.tsx
// =============================================================================
// Achievement system. Milestones unlock based on user actions.
// Shows earned + next upcoming milestone.
//
// Usage:
//   <MilestoneCards earned={milestones} nextUp={next} />
// =============================================================================

"use client";

interface Milestone {
  id: string;
  icon: string;
  label: string;
  description: string;
  earned_at?: string;
}

interface MilestoneCardsProps {
  earned: Milestone[];
  nextUp: Milestone | null;
  totalAvailable: number;
}

export default function MilestoneCards({ earned, nextUp, totalAvailable }: MilestoneCardsProps) {
  return (
    <div className="bg-white/[0.015] border border-white/[0.04] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🏆</span>
          <span className="text-white/25 text-[9px] font-bold uppercase tracking-widest">Milestones</span>
        </div>
        <span className="text-white/10 text-[9px]">{earned.length}/{totalAvailable}</span>
      </div>

      {/* Earned milestones (show last 3) */}
      {earned.length > 0 && (
        <div className="flex gap-2 mb-3">
          {earned.slice(-3).map(m => (
            <div key={m.id} className="flex-1 bg-amber-500/5 border border-amber-500/10 rounded-xl p-2.5 text-center group relative">
              <span className="text-xl block mb-0.5">{m.icon}</span>
              <p className="text-amber-400/50 text-[8px] font-bold leading-tight">{m.label}</p>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-[#0f1318] border border-white/10 rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                <p className="text-white/50 text-[10px] font-semibold">{m.label}</p>
                <p className="text-white/20 text-[8px]">{m.description}</p>
                {m.earned_at && <p className="text-white/10 text-[7px] mt-0.5">Earned {m.earned_at}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {earned.length === 0 && (
        <div className="flex gap-2 mb-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 bg-white/[0.02] border border-white/[0.03] rounded-xl p-2.5 text-center">
              <span className="text-xl block mb-0.5 grayscale opacity-20">🔒</span>
              <p className="text-white/10 text-[8px]">Locked</p>
            </div>
          ))}
        </div>
      )}

      {/* Next milestone */}
      {nextUp && (
        <div className="bg-white/[0.02] border border-dashed border-white/[0.06] rounded-xl px-3 py-2.5 flex items-center gap-2.5">
          <span className="text-lg grayscale opacity-40">{nextUp.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white/20 text-[10px] font-semibold">{nextUp.label}</p>
            <p className="text-white/10 text-[8px] truncate">{nextUp.description}</p>
          </div>
          <span className="text-white/10 text-[9px]">Next →</span>
        </div>
      )}
    </div>
  );
}

// ─── Milestone definitions ────────────────────────────────────────────────────

export const MILESTONE_DEFINITIONS: { id: string; icon: string; label: string; description: string; condition: string }[] = [
  // Onboarding
  { id: "first_login", icon: "🚀", label: "First Steps", description: "Completed onboarding", condition: "onboarding_complete" },
  { id: "first_scan", icon: "🔍", label: "First Scan", description: "Ran your first prescan", condition: "prescan_count >= 1" },
  { id: "first_diagnostic", icon: "🔬", label: "Deep Dive", description: "Ran your first AI diagnostic", condition: "diagnostic_count >= 1" },

  // Obligations
  { id: "first_obligation", icon: "✅", label: "On It", description: "Completed your first obligation", condition: "obligations_completed >= 1" },
  { id: "five_obligations", icon: "📋", label: "Diligent", description: "Completed 5 obligations", condition: "obligations_completed >= 5" },
  { id: "all_critical", icon: "🛡️", label: "Safe & Sound", description: "All critical obligations up to date", condition: "critical_overdue == 0" },
  { id: "zero_overdue", icon: "⭐", label: "Perfect Record", description: "Zero overdue obligations", condition: "overdue_count == 0" },

  // Leaks
  { id: "first_leak", icon: "🔧", label: "Plugged", description: "Fixed your first money leak", condition: "leaks_fixed >= 1" },
  { id: "five_leaks", icon: "💧", label: "Leak Hunter", description: "Fixed 5 money leaks", condition: "leaks_fixed >= 5" },
  { id: "saved_1k", icon: "💵", label: "$1K Saved", description: "Saved $1,000+ per year", condition: "total_savings >= 1000" },
  { id: "saved_5k", icon: "💰", label: "$5K Saved", description: "Saved $5,000+ per year", condition: "total_savings >= 5000" },
  { id: "saved_10k", icon: "🤑", label: "$10K Club", description: "Saved $10,000+ per year", condition: "total_savings >= 10000" },
  { id: "saved_25k", icon: "🏆", label: "Leak Master", description: "Saved $25,000+ per year", condition: "total_savings >= 25000" },

  // Streaks
  { id: "streak_3", icon: "🔥", label: "On Fire", description: "3-day streak", condition: "streak >= 3" },
  { id: "streak_7", icon: "🔥", label: "Week Warrior", description: "7-day streak", condition: "streak >= 7" },
  { id: "streak_30", icon: "🔥", label: "Monthly Master", description: "30-day streak", condition: "streak >= 30" },

  // Programs
  { id: "first_program", icon: "🏛️", label: "Free Money", description: "Applied for your first government program", condition: "programs_applied >= 1" },

  // Score
  { id: "score_50", icon: "📈", label: "Getting There", description: "Health score reached 50+", condition: "health_score >= 50" },
  { id: "score_70", icon: "📈", label: "Healthy", description: "Health score reached 70+", condition: "health_score >= 70" },
  { id: "score_85", icon: "🌟", label: "Optimized", description: "Health score reached 85+", condition: "health_score >= 85" },
];
