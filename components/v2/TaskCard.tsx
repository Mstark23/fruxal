"use client";
// =============================================================================
// components/v2/TaskCard.tsx
// Displays a single diagnostic task with status controls
// Mobile-first, uses Fruxal design tokens
// =============================================================================

import { useState } from "react";

export interface Task {
  id: string;
  title: string;
  action: string;
  why: string;
  savings_monthly: number;
  effort: "easy" | "medium" | "hard";
  time_to_implement: string;
  solution_name?: string | null;
  solution_url?: string | null;
  solution_description?: string | null;
  category: string;
  priority: number;
  status: "open" | "in_progress" | "done" | "dismissed";
  completed_at?: string | null;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task["status"]) => Promise<void>;
  lang?: "en" | "fr";
  businessId?: string;
}

const EFFORT_CONFIG = {
  easy:   { label: "Easy",   labelFr: "Facile",   color: "#2D7A50", bg: "rgba(45,122,80,0.08)"   },
  medium: { label: "Medium", labelFr: "Moyen",    color: "#C4841D", bg: "rgba(196,132,29,0.08)"  },
  hard:   { label: "Hard",   labelFr: "Complexe", color: "#B34040", bg: "rgba(179,64,64,0.08)"   },
};

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function TaskCard({ task, onStatusChange, lang = "en", businessId: onBusinessId }: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isFR = lang === "fr";

  const effort = EFFORT_CONFIG[task.effort] || EFFORT_CONFIG.medium;
  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";

  const t = (en: string, fr: string) => (isFR ? fr : en);

  async function handleStatus(newStatus: Task["status"]) {
    setLoading(true);
    try {
      await onStatusChange(task.id, newStatus);

      // Dispatch global event for RecoveryCounter on task completion or un-done
      if (typeof window !== "undefined") {
        if (newStatus === "done") {
          window.dispatchEvent(new CustomEvent("fruxal:task:completed", {
            detail: { taskId: task.id, savings_monthly: task.savings_monthly ?? 0 },
          }));
        } else if (task.status === "done") {
          // Task reverted from done — signal counter to update
          window.dispatchEvent(new CustomEvent("fruxal:task:completed", {
            detail: { taskId: task.id, savings_monthly: 0 },
          }));
        }
      }
      // Update monthly recovery snapshot (non-blocking)
      if (onBusinessId && (newStatus === "done" || task.status === "done")) {
        fetch("/api/v2/recovery/snapshot", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: onBusinessId }),
        }).catch(() => {});
      }
      // Recalculate live score after task completion (non-blocking)
      if (onBusinessId && newStatus === "done") {
        fetch("/api/v2/score/recalculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: onBusinessId,
            triggerType: "task_completed",
            triggerDetail: `Fixed: ${task.title} ($${(task.savings_monthly ?? 0).toLocaleString()}/mo)`,
            taskId: task.id,
          }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (d && typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("fruxal:score:updated", { detail: d }));
            }
          })
          .catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isDone
          ? "border-border-light bg-bg opacity-70"
          : "border-border-light bg-white"
      }`}
      style={{ boxShadow: isDone ? "none" : "0 1px 3px rgba(0,0,0,0.03)" }}
    >
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <button
        className="w-full px-4 py-3.5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* Status indicator */}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              isDone
                ? "border-positive bg-positive text-white"
                : isInProgress
                ? "border-brand bg-brand/10"
                : "border-border"
            }`}
          >
            {isDone && <CheckIcon size={10} />}
            {isInProgress && (
              <div className="w-2 h-2 rounded-full bg-brand" />
            )}
          </div>

          {/* Title + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p
                className={`text-[13px] font-semibold leading-snug ${
                  isDone ? "text-ink-muted line-through" : "text-ink"
                }`}
              >
                {task.title}
              </p>

              {/* Savings badge */}
              {task.savings_monthly > 0 && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: "rgba(45,122,80,0.08)", color: "#2D7A50" }}
                >
                  {fmt(task.savings_monthly)}/{t("mo", "mois")}
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: effort.bg, color: effort.color }}
              >
                {isFR ? effort.labelFr : effort.label}
              </span>
              <span className="text-[9px] text-ink-faint">
                ⏱ {task.time_to_implement}
              </span>
              <span className="text-[9px] text-ink-faint">
                {task.category}
              </span>
            </div>
          </div>

          {/* Expand chevron */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C5C2BB"
            strokeWidth="2"
            strokeLinecap="round"
            className={`shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* ── Expanded body ───────────────────────────────────────────────── */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border-light pt-3 space-y-3">
          {/* Action — main content */}
          <div>
            <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1">
              {t("What to do", "Quoi faire")}
            </p>
            <p className="text-[12px] text-ink leading-relaxed">{task.action}</p>
          </div>

          {/* Why it matters */}
          {task.why && (
            <div>
              <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1">
                {t("Why it matters", "Pourquoi c'est important")}
              </p>
              <p className="text-[12px] text-ink-muted leading-relaxed">{task.why}</p>
            </div>
          )}

          {/* Solution recommendation — upgraded with click tracking */}
          {task.solution_name && (
            <div className="rounded-lg overflow-hidden"
              style={{ background: "rgba(27,58,45,0.03)", border: "1px solid rgba(27,58,45,0.10)" }}>
              <div className="px-3 py-1.5 border-b flex items-center gap-1.5"
                style={{ borderColor: "rgba(27,58,45,0.08)", background: "rgba(27,58,45,0.05)" }}>
                <span className="text-[10px]">💡</span>
                <span className="text-[9px] font-bold text-ink-faint uppercase tracking-wider">
                  {t("Recommended solution", "Solution recommandée")}
                </span>
              </div>
              <div className="px-3 py-2 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-ink leading-snug">{task.solution_name}</p>
                  {task.solution_description && (
                    <p className="text-[10px] text-ink-faint mt-0.5">{task.solution_description}</p>
                  )}
                </div>
                {task.solution_url && (
                  <button
                    className="shrink-0 text-[10px] font-bold text-brand hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Track click then open
                      fetch("/api/v2/solutions/click", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          solutionId:   task.id,
                          solutionName: task.solution_name,
                          url:          task.solution_url,
                          source:       "task_card",
                          taskId:       task.id,
                          businessId:   onBusinessId ?? "",
                        }),
                      }).catch(() => {});
                      window.open(task.solution_url ?? "", "_blank", "noopener noreferrer");
                    }}
                  >
                    {t("Learn more →", "En savoir plus →")}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Done completion date */}
          {isDone && task.completed_at && (
            <p className="text-[10px] text-ink-faint">
              ✓ {t("Completed", "Complété")}{" "}
              {new Date(task.completed_at).toLocaleDateString(
                isFR ? "fr-CA" : "en-CA",
                { month: "short", day: "numeric" }
              )}
            </p>
          )}

          {/* ── Action buttons ─────────────────────────────────────────── */}
          {!isDone && (
            <div className="flex items-center gap-2 pt-1">
              {/* Primary CTA */}
              {task.status === "open" && (
                <button
                  disabled={loading}
                  onClick={() => handleStatus("in_progress")}
                  className="flex-1 h-8 text-[11px] font-semibold text-white rounded-lg transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#1B3A2D" }}
                >
                  {loading ? "…" : t("Start this →", "Commencer →")}
                </button>
              )}

              {task.status === "in_progress" && (
                <button
                  disabled={loading}
                  onClick={() => handleStatus("done")}
                  className="flex-1 h-8 text-[11px] font-semibold text-white rounded-lg transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style={{ background: "#2D7A50" }}
                >
                  {loading ? "…" : <><CheckIcon size={11} /> {t("Mark done", "Marquer fait")}</>}
                </button>
              )}

              {/* Dismiss */}
              <button
                disabled={loading}
                onClick={() => handleStatus("dismissed")}
                className="h-8 px-3 text-[10px] text-ink-faint border border-border-light rounded-lg hover:text-negative hover:border-negative/30 transition disabled:opacity-50"
              >
                {t("Not relevant", "Non pertinent")}
              </button>
            </div>
          )}

          {/* Reopen if done */}
          {isDone && (
            <button
              disabled={loading}
              onClick={() => handleStatus("open")}
              className="text-[10px] text-ink-faint hover:text-ink transition"
            >
              {t("↩ Reopen", "↩ Rouvrir")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── TaskList: renders a collection of task cards with summary ─────────────────
interface TaskListProps {
  tasks: Task[];
  totalAvailable: number;
  totalRecovered: number;
  businessId: string;
  lang?: "en" | "fr";
}

export function TaskList({
  tasks,
  totalAvailable,
  totalRecovered,
  businessId,
  lang = "en",
}: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [showAll, setShowAll] = useState(false);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => (isFR ? fr : en);

  const activeTasks = localTasks.filter(
    (t) => t.status !== "dismissed" && t.status !== "done"
  );
  const displayTasks = showAll ? activeTasks : activeTasks.slice(0, 5);
  const doneTasks = localTasks.filter((t) => t.status === "done");

  async function handleStatusChange(taskId: string, newStatus: Task["status"]) {
    // Optimistic update
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completed_at:
                newStatus === "done" ? new Date().toISOString() : null,
            }
          : t
      )
    );

    // Server update
    try {
      const res = await fetch(`/api/v2/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      // Revert on error
      setLocalTasks(tasks);
    }
  }

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4 flex-wrap">
          {totalAvailable > 0 && (
            <div>
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                {t("Available", "Disponible")}
              </span>
              <div className="text-[15px] font-black text-ink tabular-nums">
                ${(totalAvailable ?? 0).toLocaleString()}/{t("mo", "mois")}
              </div>
            </div>
          )}
          {totalRecovered > 0 && (
            <div>
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                {t("Recovered", "Récupéré")}
              </span>
              <div className="text-[15px] font-black text-positive tabular-nums">
                ${(totalRecovered ?? 0).toLocaleString()}/{t("mo", "mois")}
              </div>
            </div>
          )}
          {doneTasks.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                {t("Done", "Fait")}
              </span>
              <div className="text-[15px] font-black text-positive tabular-nums">
                {doneTasks.length} ✓
              </div>
            </div>
          )}
        </div>

        <a
          href="/v2/tasks"
          className="text-[10px] font-semibold text-brand hover:underline"
        >
          {t("All tasks →", "Toutes →")}
        </a>
      </div>

      {/* Task cards */}
      {displayTasks.length === 0 ? (
        <div
          className="px-4 py-6 rounded-xl text-center text-[12px] text-ink-faint"
          style={{ border: "1px dashed #E8E6E1" }}
        >
          {activeTasks.length === 0 && doneTasks.length > 0
            ? t("All tasks completed! 🎉", "Toutes les tâches complétées ! 🎉")
            : t(
                "Run your diagnostic to generate your action plan.",
                "Lancez votre diagnostic pour générer votre plan d'action."
              )}
        </div>
      ) : (
        displayTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={handleStatusChange}
            businessId={businessId}
            lang={lang}
          />
        ))
      )}

      {/* Show more */}
      {activeTasks.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-[11px] font-semibold text-brand hover:underline"
        >
          {showAll
            ? t("Show fewer", "Voir moins")
            : t(
                `See all ${activeTasks.length} tasks →`,
                `Voir les ${activeTasks.length} tâches →`
              )}
        </button>
      )}
    </div>
  );
}
