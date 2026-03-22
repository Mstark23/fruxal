"use client";
// =============================================================================
// app/v2/tasks/page.tsx
// Full tasks management page — grouped by status, filterable
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TaskCard, Task } from "@/components/v2/TaskCard";
import { useLang } from "@/hooks/useLang";

type FilterEffort = "all" | "easy" | "medium" | "hard";
type FilterStatus = "all" | "open" | "in_progress" | "done";
type SortBy = "priority" | "savings" | "effort";

const EFFORT_ORDER = { easy: 0, medium: 1, hard: 2 };

export default function TasksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { lang } = useLang();
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => (isFR ? fr : en);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalRecovered, setTotalRecovered] = useState(0);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterEffort, setFilterEffort] = useState<FilterEffort>("all");
  const [sortBy, setSortBy] = useState<SortBy>("priority");

  // Step 1: get businessId from dashboard API
  useEffect(() => {
    if (authLoading || !user) return;
    fetch("/api/v2/dashboard")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data?.businessId) setBusinessId(d.data.businessId); })
      .catch(() => {});
  }, [authLoading, user]);

  // Step 2: load tasks once businessId is known
  const loadTasks = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await fetch(`/api/v2/tasks?businessId=${businessId}`);
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks || []);
      setTotalAvailable(data.total_savings_available || 0);
      setTotalRecovered(data.total_savings_recovered || 0);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) loadTasks();
    else if (!authLoading && user && businessId === null) {
      // If we tried and still no businessId, stop loading
      const _tid = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(_tid);
    }
  }, [businessId, loadTasks, authLoading, user]);

  async function handleStatusChange(taskId: string, newStatus: Task["status"]) {
    setTasks(prev =>
      prev.map(t => t.id === taskId
        ? { ...t, status: newStatus, completed_at: newStatus === "done" ? new Date().toISOString() : null }
        : t)
    );
    try {
      await fetch(`/api/v2/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      loadTasks();
    }
  }

  const filtered = tasks
    .filter(t => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterEffort !== "all" && t.effort !== filterEffort) return false;
      if (t.status === "dismissed") return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "savings") return (b.savings_monthly ?? 0) - (a.savings_monthly ?? 0);
      if (sortBy === "effort") return EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort];
      return (a.priority ?? 99) - (b.priority ?? 99);
    });

  const groups: { label: string; labelFr: string; status: FilterStatus; items: Task[] }[] = [
    { label: "In Progress", labelFr: "En cours", status: "in_progress", items: filtered.filter(t => t.status === "in_progress") },
    { label: "Open", labelFr: "À faire", status: "open", items: filtered.filter(t => t.status === "open") },
    { label: "Completed", labelFr: "Complété", status: "done", items: filtered.filter(t => t.status === "done") },
  ];

  const totalDone = tasks.filter(t => t.status === "done").length;
  const totalOpen = tasks.filter(t => t.status === "open" || t.status === "in_progress").length;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => router.back()} className="text-[10px] text-ink-faint hover:text-ink mb-2 flex items-center gap-1">
              ← {t("Dashboard", "Tableau de bord")}
            </button>
            <h1 className="text-[22px] font-black text-ink leading-none">
              {t("Your Action Plan", "Votre plan d'action")}
            </h1>
            <p className="text-[11px] text-ink-faint mt-1">
              {totalOpen} {t("fixes identified", "correctifs identifiés")}
              {totalDone > 0 && ` · ${totalDone} ${t("completed", "complétés")}`}
            </p>
          </div>
        </div>

        {(totalAvailable > 0 || totalRecovered > 0) && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {totalAvailable > 0 && (
              <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider mb-1">{t("Available savings", "Économies disponibles")}</p>
                <p className="text-[20px] font-black text-ink tabular-nums">
                  ${(totalAvailable ?? 0).toLocaleString()}<span className="text-[10px] font-normal text-ink-faint">/{t("mo", "mois")}</span>
                </p>
              </div>
            )}
            {totalRecovered > 0 && (
              <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider mb-1">{t("Recovered", "Récupéré")}</p>
                <p className="text-[20px] font-black text-positive tabular-nums">
                  ${(totalRecovered ?? 0).toLocaleString()}<span className="text-[10px] font-normal text-ink-faint">/{t("mo", "mois")}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex rounded-lg border border-border-light overflow-hidden">
            {(["all", "open", "in_progress", "done"] as FilterStatus[]).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-[10px] font-semibold transition ${filterStatus === s ? "bg-brand text-white" : "bg-white text-ink-faint hover:text-ink"}`}>
                {s === "all" ? t("All", "Tous") : s === "in_progress" ? t("In progress", "En cours") : s === "done" ? t("Done", "Fait") : t("Open", "À faire")}
              </button>
            ))}
          </div>
          <select value={filterEffort} onChange={e => setFilterEffort(e.target.value as FilterEffort)}
            className="h-8 px-2 text-[10px] text-ink border border-border-light rounded-lg bg-white focus:outline-none">
            <option value="all">{t("Any effort", "Tout effort")}</option>
            <option value="easy">{t("Easy", "Facile")}</option>
            <option value="medium">{t("Medium", "Moyen")}</option>
            <option value="hard">{t("Hard", "Complexe")}</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
            className="h-8 px-2 text-[10px] text-ink border border-border-light rounded-lg bg-white focus:outline-none">
            <option value="priority">{t("Priority", "Priorité")}</option>
            <option value="savings">{t("Highest savings", "Plus d'économies")}</option>
            <option value="effort">{t("Easiest first", "Plus facile d'abord")}</option>
          </select>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-[14px] font-semibold text-ink mb-1">{t("No tasks yet", "Aucune tâche pour l'instant")}</p>
            <p className="text-[11px] text-ink-faint mb-4">{t("Run your diagnostic to generate your action plan.", "Lancez votre diagnostic pour générer votre plan d'action.")}</p>
            <button onClick={() => router.push("/v2/diagnostic")}
              className="px-5 py-2.5 text-[12px] font-semibold text-white rounded-lg hover:opacity-90 transition" style={{ background: "#1B3A2D" }}>
              {t("Run diagnostic →", "Lancer le diagnostic →")}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(group => {
              if (group.items.length === 0) return null;
              return (
                <div key={group.status}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                      {isFR ? group.labelFr : group.label}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-bg-section text-ink-faint font-bold">{group.items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map(task => (
                      <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} lang={lang} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
