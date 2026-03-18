// =============================================================================
// src/hooks/useCelebration.ts
// =============================================================================
// Hook that manages celebration state across the app.
//
// Usage:
//   const { celebrate, celebrating, celebrationProps, progress } = useCelebration();
//
//   // When user completes an obligation:
//   await celebrate("obligation_completed", {
//     obligation_slug: "qc-gst-return",
//     title: "GST Return Filed",
//   });
//
//   // When user fixes a leak:
//   await celebrate("leak_fixed", {
//     leak_slug: "qc-sole-prop-incorporation",
//     title: "Incorporated your business",
//     savings: 8400,
//   });
//
//   // In your layout, render the overlay:
//   {celebrating && <CelebrationOverlay {...celebrationProps} onDone={() => setCelebrating(false)} />}
// =============================================================================

"use client";

import { useState, useCallback, useEffect } from "react";

interface CelebrationData {
  type: "obligation_complete" | "leak_fixed" | "milestone" | "score_up";
  data: {
    title?: string;
    savings?: number;
    oldScore?: number;
    newScore?: number;
    milestone?: { icon: string; label: string; description: string };
    category?: string;
  };
}

interface ProgressState {
  total_savings: number;
  leaks_fixed: number;
  total_leaks: number;
  obligations_completed: number;
  overdue_count: number;
  critical_overdue: number;
  programs_applied: number;
  diagnostic_count: number;
  streak: {
    current: number;
    longest: number;
    today_active: boolean;
    week_map: boolean[];
  };
  milestones: { id: string; earned_at: string }[];
  health_score: number;
}

export function useCelebration() {
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationProps, setCelebrationProps] = useState<CelebrationData | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial progress state
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v2/progress");
        const json = await res.json();
        if (json.success) setProgress(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Record action and trigger celebration
  const celebrate = useCallback(async (
    action: string,
    data?: Record<string, any>
  ) => {
    try {
      const res = await fetch("/api/v2/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });

      const json = await res.json();

      if (json.success) {
        // Update progress state
        if (json.progress) setProgress(json.progress);

        // Trigger celebration if API returned one
        if (json.celebration) {
          setCelebrationProps(json.celebration);
          setCelebrating(true);
        }
      }

      return json;
    } catch (err) {
      console.error("[celebrate] Error:", err);
      return { success: false };
    }
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebrating(false);
    setCelebrationProps(null);
  }, []);

  return {
    celebrate,
    celebrating,
    celebrationProps,
    dismissCelebration,
    progress,
    loading,
  };
}
