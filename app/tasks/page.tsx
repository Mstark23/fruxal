"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

interface Task { id: string; title: string; description?: string; status: string; priority: string; category: string; client_name?: string; leak_type?: string; due_date?: string; impact_amount: number; recovered_amount: number; auto_generated: boolean; notes?: string; created_at: string; }
interface Stats { todo: number; in_progress: number; done: number; dismissed: number; overdue: number; open_impact: number; total_recovered: number; total: number; }

const PRIORITY_COLORS: Record<string, string> = { CRITICAL: "bg-red-100 text-red-700 border-red-300", HIGH: "bg-orange-100 text-orange-700 border-orange-300", MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-300", LOW: "bg-gray-100 text-gray-500 border-gray-300" };
const STATUS_LABELS: Record<string, string> = { TODO: "📋 To Do", IN_PROGRESS: "🔄 In Progress", DONE: "✅ Done", DISMISSED: "🚫 Dismissed" };
const CATEGORY_ICONS: Record<string, string> = { LEAK_FIX: "💧", COLLECTION: "💰", PRICING: "💲", RETENTION: "🤝", MANUAL: "📝" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ todo: 0, in_progress: 0, done: 0, dismissed: 0, overdue: 0, open_impact: 0, total_recovered: 0, total: 0 });
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "MEDIUM", category: "MANUAL", due_date: "" });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?status=${filter}`);
      if (res.ok) { const data = await res.json(); setTasks(data.tasks || []); setStats(data.stats || {}); }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const autoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "auto_generate" }) });
      if (res.ok) { const data = await res.json(); alert(`Created ${data.result.created} tasks from leaks`); await loadTasks(); }
    } catch (err) { console.error(err); }
    setGenerating(false);
  };

  const updateTask = async (taskId: string, updates: any) => {
    try {
      await fetch("/api/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, ...updates }) });
      await loadTasks();
    } catch (err) { console.error(err); }
  };

  const createTask = async () => {
    if (!newTask.title) return;
    try {
      await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTask) });
      setNewTask({ title: "", description: "", priority: "MEDIUM", category: "MANUAL", due_date: "" });
      setShowNewTask(false);
      await loadTasks();
    } catch (err) { console.error(err); }
  };

  const isOverdue = (task: Task) => task.due_date && new Date(task.due_date) < new Date() && !["DONE", "DISMISSED"].includes(task.status);

  return (
    <AppShell>
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-[#0F2B46] to-blue-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm">L</div>
          <span className="text-lg font-extrabold text-white tracking-tight">Fruxal</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-blue-200 hover:text-white transition">← Dashboard</Link>
          <Link href="/trending" className="text-sm font-semibold text-blue-200 hover:text-white transition">📈 Trends</Link>
          <Link href="/exports" className="text-sm font-semibold text-blue-200 hover:text-white transition">📄 Reports</Link>
          <Link href="/integrations" className="text-sm font-semibold text-blue-200 hover:text-white transition">🔌 Integrations</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">✅ Action Workflows</h1>
            <p className="text-gray-500 text-sm mt-1">Every leak becomes a task. No revenue left behind.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowNewTask(true)} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">+ New Task</button>
            <button onClick={autoGenerate} disabled={generating} className="px-4 py-2 rounded-lg bg-[#0F2B46] text-white font-bold text-sm hover:bg-blue-800 transition disabled:opacity-50">
              {generating ? "Generating..." : "⚡ Auto-Generate from Leaks"}
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: "To Do", value: Number(stats.todo), color: "text-blue-600", bg: "bg-blue-50" },
            { label: "In Progress", value: Number(stats.in_progress), color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Done", value: Number(stats.done), color: "text-green-600", bg: "bg-green-50" },
            { label: "Overdue", value: Number(stats.overdue), color: "text-red-600", bg: "bg-red-50" },
            { label: "$ at Risk", value: `$${Number(stats.open_impact).toLocaleString()}`, color: "text-orange-600", bg: "bg-orange-50", raw: true },
            { label: "$ Recovered", value: `$${Number(stats.total_recovered).toLocaleString()}`, color: "text-green-600", bg: "bg-green-50", raw: true },
          ].map((s: any, i) => (
            <div key={i} className={`${s.bg} rounded-xl p-3 text-center border border-gray-100`}>
              <div className={`text-xl font-black ${s.color}`}>{s.raw ? s.value : s.value}</div>
              <div className="text-xs text-gray-500 font-bold mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4">
          {["ALL", "TODO", "IN_PROGRESS", "DONE", "DISMISSED"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filter === s ? "bg-[#0F2B46] text-white" : "bg-white text-gray-500 hover:text-gray-700 border border-gray-200"}`}>
              {STATUS_LABELS[s] || "All"}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? <div className="text-center py-20 text-gray-400">Loading tasks...</div> : tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-gray-500 font-bold">No tasks yet</div>
            <div className="text-gray-400 text-sm mt-1">Click &quot;Auto-Generate from Leaks&quot; to create tasks from detected revenue leaks</div>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className={`bg-white rounded-xl border p-4 transition hover:shadow-md ${isOverdue(task) ? "border-red-300 ring-1 ring-red-100" : "border-gray-200"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg mt-0.5">{CATEGORY_ICONS[task.category] || "📋"}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{task.title}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                        {task.auto_generated && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">Auto</span>}
                        {isOverdue(task) && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">OVERDUE</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {task.client_name && <span className="text-xs text-gray-400">👤 {task.client_name}</span>}
                        {task.due_date && <span className="text-xs text-gray-400">📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                        {task.impact_amount > 0 && <span className="text-xs text-orange-500 font-bold">${Number(task.impact_amount).toLocaleString()} at risk</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {task.status === "TODO" && (
                      <button onClick={() => updateTask(task.id, { status: "IN_PROGRESS" })} className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-600 font-bold hover:bg-yellow-100">Start</button>
                    )}
                    {task.status === "IN_PROGRESS" && (
                      <button onClick={() => updateTask(task.id, { status: "DONE" })} className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 font-bold hover:bg-green-100">Complete</button>
                    )}
                    {task.status !== "DISMISSED" && task.status !== "DONE" && (
                      <button onClick={() => updateTask(task.id, { status: "DISMISSED" })} className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-400 font-bold hover:bg-gray-100">Dismiss</button>
                    )}
                    <button onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)} className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-400 hover:bg-gray-100">
                      {expandedTask === task.id ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {expandedTask === task.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {task.description && <p className="text-sm text-gray-600 whitespace-pre-line mb-3">{task.description}</p>}
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Category: {task.category.replace("_", " ")}</span>
                      {task.leak_type && <span className="text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded">Leak: {task.leak_type.replace("_", " ")}</span>}
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Created: {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                    {task.status === "IN_PROGRESS" && (
                      <div className="mt-3 flex items-center gap-2">
                        <input type="number" placeholder="$ recovered" className="text-sm border border-gray-300 rounded-lg px-3 py-1 w-32"
                          onKeyDown={(e) => { if (e.key === "Enter") updateTask(task.id, { recovered_amount: parseFloat((e.target as HTMLInputElement).value) || 0, status: "DONE" }); }} />
                        <span className="text-xs text-gray-400">Enter recovered amount + press Enter to complete</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewTask(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">Create New Task</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" />
              <textarea placeholder="Description (optional)" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 h-20" />
              <div className="grid grid-cols-3 gap-2">
                <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="text-sm border border-gray-300 rounded-lg px-3 py-2">
                  <option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                </select>
                <select value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value })} className="text-sm border border-gray-300 rounded-lg px-3 py-2">
                  <option value="MANUAL">Manual</option><option value="COLLECTION">Collection</option><option value="PRICING">Pricing</option><option value="RETENTION">Retention</option>
                </select>
                <input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} className="text-sm border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={createTask} disabled={!newTask.title} className="flex-1 px-4 py-2 rounded-lg bg-[#0F2B46] text-white font-bold text-sm disabled:opacity-50">Create Task</button>
              <button onClick={() => setShowNewTask(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AppShell>
  );
}
