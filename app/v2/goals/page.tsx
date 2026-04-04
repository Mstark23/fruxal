// =============================================================================
// app/v2/goals/page.tsx — Business Goals management
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface GoalProgress {
  current: number;
  target: number;
  pct: number;
  onPace: boolean;
  daysRemaining: number;
  projectedCompletion: string | null;
  weeklyPaceNeeded: number;
}

interface ActiveGoal {
  id: string;
  goal_type: string;
  goal_title: string;
  goal_description: string | null;
  target_amount: number | null;
  target_score: number | null;
  target_count: number | null;
  target_date: string;
  progress_pct: number;
  status: string;
  created_at: string;
}

interface CompletedGoal {
  id: string;
  goal_title: string;
  goal_type: string;
  completed_at: string;
  progress_pct: number;
  target_amount: number | null;
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  recovery_amount: "Recovery Amount",
  score_improvement: "Score Improvement",
  tasks_completed: "Tasks Completed",
};

const GOAL_TYPE_UNITS: Record<string, string> = {
  recovery_amount: "$",
  score_improvement: "pts",
  tasks_completed: "tasks",
};

function ProgressRing({ pct, size = 56, stroke = 5 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E3DD" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={pct >= 100 ? "#22C55E" : "#1B3A2D"}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

export default function GoalsPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState("");
  const [activeGoal, setActiveGoal] = useState<ActiveGoal | null>(null);
  const [progress, setProgress] = useState<GoalProgress | null>(null);
  const [completedGoals, setCompletedGoals] = useState<CompletedGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("recovery_amount");
  const [formTitle, setFormTitle] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formDate, setFormDate] = useState("");
  const [creating, setCreating] = useState(false);

  // Resolve businessId
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("fruxal_businessId");
      if (cached) { setBusinessId(cached); return; }
    } catch { /* non-fatal */ }
    fetch("/api/v2/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.data?.businessId) {
          setBusinessId(d.data.businessId);
          try { sessionStorage.setItem("fruxal_businessId", d.data.businessId); } catch { /* */ }
        }
      })
      .catch(() => {});
  }, []);

  const fetchGoals = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v2/goals?businessId=${businessId}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to load goals");
      }
      const data = await res.json();
      setActiveGoal(data.activeGoal || null);
      setProgress(data.progress || null);
      setCompletedGoals(data.completedGoals || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setCreating(true);
    setError("");
    setSuccess("");

    const targetNum = parseFloat(formTarget);
    if (isNaN(targetNum) || targetNum <= 0) {
      setError("Target must be a positive number");
      setCreating(false);
      return;
    }

    const goal: any = {
      goal_type: formType,
      goal_title: formTitle || GOAL_TYPE_LABELS[formType],
      target_date: formDate,
    };

    if (formType === "recovery_amount") goal.target_amount = targetNum;
    else if (formType === "score_improvement") goal.target_score = targetNum;
    else goal.target_count = Math.round(targetNum);

    try {
      const tier = localStorage.getItem("fruxal_tier") || "solo";
      const res = await fetch("/api/v2/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, goal, tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create goal");

      setSuccess("Goal created successfully");
      setShowForm(false);
      setFormTitle("");
      setFormTarget("");
      setFormDate("");
      fetchGoals();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const targetValue = activeGoal
    ? activeGoal.target_amount ?? activeGoal.target_score ?? activeGoal.target_count ?? 0
    : 0;

  const unit = activeGoal ? GOAL_TYPE_UNITS[activeGoal.goal_type] || "" : "";

  // Default target date: 90 days from now
  const defaultDate = new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/v2/dashboard")}
              className="w-8 h-8 rounded-lg border border-[#E5E3DD] bg-white flex items-center justify-center text-[#6B6560] hover:bg-[#F5F3EF] transition"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-serif font-semibold text-[#1B3A2D]">Business Goals</h1>
              <p className="text-sm text-[#6B6560] mt-0.5">Track and hit your recovery targets</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-[#1B3A2D] text-white text-sm font-medium hover:bg-[#1B3A2D]/90 transition"
            >
              + Create Goal
            </button>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-600 ml-2">&times;</button>
          </div>
        )}

        {/* Create goal form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#E5E3DD] p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#1B3A2D]">New Goal</h2>
              <button onClick={() => setShowForm(false)} className="text-[#6B6560] hover:text-[#1B3A2D] text-lg leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#6B6560] mb-1">Goal Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E3DD] bg-[#FAFAF8] text-sm text-[#1B3A2D] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20"
                  >
                    <option value="recovery_amount">Recovery Amount ($)</option>
                    <option value="score_improvement">Score Improvement (pts)</option>
                    <option value="tasks_completed">Tasks Completed (count)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6560] mb-1">Title</label>
                  <input
                    type="text"
                    placeholder={GOAL_TYPE_LABELS[formType]}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E3DD] bg-[#FAFAF8] text-sm text-[#1B3A2D] placeholder:text-[#A09A93] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#6B6560] mb-1">
                    Target {formType === "recovery_amount" ? "Amount ($)" : formType === "score_improvement" ? "Score (pts)" : "Count"}
                  </label>
                  <input
                    type="number"
                    placeholder={formType === "recovery_amount" ? "5000" : formType === "score_improvement" ? "15" : "10"}
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    required
                    min="1"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E3DD] bg-[#FAFAF8] text-sm text-[#1B3A2D] placeholder:text-[#A09A93] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B6560] mb-1">Target Date</label>
                  <input
                    type="date"
                    value={formDate || defaultDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E3DD] bg-[#FAFAF8] text-sm text-[#1B3A2D] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-[#6B6560] hover:bg-[#F5F3EF] transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="px-5 py-2 rounded-lg bg-[#1B3A2D] text-white text-sm font-medium hover:bg-[#1B3A2D]/90 transition disabled:opacity-50">
                  {creating ? "Creating..." : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" />
            <p className="text-sm text-[#6B6560] mt-3">Loading goals...</p>
          </div>
        ) : (
          <>
            {/* Active goal */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-[#1B3A2D] uppercase tracking-wide mb-3">Active Goal</h2>

              {!activeGoal ? (
                <div className="bg-white rounded-xl border border-[#E5E3DD] p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1B3A2D]/5 flex items-center justify-center">
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#6B6560]">No active goal yet</p>
                  <p className="text-xs text-[#A09A93] mt-1">Create one to start tracking your progress</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#E5E3DD] p-5">
                  <div className="flex items-start gap-4">
                    {/* Progress ring */}
                    <div className="flex-shrink-0 relative">
                      <ProgressRing pct={progress?.pct ?? 0} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#1B3A2D]">
                        {Math.round(progress?.pct ?? 0)}%
                      </span>
                    </div>

                    {/* Goal info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#1B3A2D]">{activeGoal.goal_title}</h3>
                      <p className="text-xs text-[#6B6560] mt-0.5">
                        {GOAL_TYPE_LABELS[activeGoal.goal_type] || activeGoal.goal_type}
                      </p>

                      {/* Stats row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs">
                        <span className="text-[#1B3A2D] font-medium">
                          {unit === "$" ? `$${(progress?.current ?? 0).toLocaleString()}` : `${progress?.current ?? 0} ${unit}`}
                          {" / "}
                          {unit === "$" ? `$${targetValue.toLocaleString()}` : `${targetValue} ${unit}`}
                        </span>

                        {/* Pace indicator */}
                        {progress && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            progress.onPace
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${progress.onPace ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {progress.onPace ? "On Track" : "Behind"}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 h-2 rounded-full bg-[#E5E3DD] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, progress?.pct ?? 0)}%`,
                            background: (progress?.pct ?? 0) >= 100 ? "#22C55E" : "#1B3A2D",
                          }}
                        />
                      </div>

                      {/* Details row */}
                      {progress && (
                        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px] text-[#6B6560]">
                          <span>{progress.daysRemaining} days remaining</span>
                          {progress.weeklyPaceNeeded > 0 && (
                            <span>
                              Weekly target: {unit === "$" ? `$${progress.weeklyPaceNeeded.toLocaleString()}` : `${progress.weeklyPaceNeeded} ${unit}`}
                            </span>
                          )}
                          {progress.projectedCompletion && (
                            <span>
                              Projected: {new Date(progress.projectedCompletion).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Completed goals */}
            <section>
              <h2 className="text-sm font-semibold text-[#1B3A2D] uppercase tracking-wide mb-3">Completed Goals</h2>

              {completedGoals.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E5E3DD] p-6 text-center">
                  <p className="text-sm text-[#6B6560]">No completed goals yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="bg-white rounded-xl border border-[#E5E3DD] px-5 py-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1B3A2D] truncate">{goal.goal_title}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#6B6560]">
                          <span>{GOAL_TYPE_LABELS[goal.goal_type] || goal.goal_type}</span>
                          {goal.completed_at && (
                            <span>
                              Completed {new Date(goal.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                          {goal.target_amount && <span>${goal.target_amount.toLocaleString()}</span>}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{Math.round(goal.progress_pct ?? 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
