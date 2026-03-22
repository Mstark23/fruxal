"use client";
// =============================================================================
// components/v2/GoalProgressCard.tsx
// Central engagement widget — pinned to every dashboard
// States: active (on-pace/behind), no-goal, completed
// Refreshes on 'fruxal:task:completed' event
// Confetti animation is CSS-only — no library
// =============================================================================

import { useState, useEffect, useCallback, useRef } from "react";

interface GoalProgress {
  current:            number;
  target:             number;
  pct:                number;
  onPace:             boolean;
  daysRemaining:      number;
  projectedCompletion: string | null;
  weeklyPaceNeeded:   number;
}

interface EasiestTask {
  id:              string;
  title:           string;
  savings_monthly: number;
}

interface GoalData {
  activeGoal:     any | null;
  progress:       GoalProgress | null;
  easiestTask:    EasiestTask | null;
  completedGoals: any[];
  goalCompleted:  boolean;
}

interface GoalProgressCardProps {
  businessId: string;
  tier?:      "solo" | "business" | "enterprise";
  lang?:      "en" | "fr";
}

function fmt(n: number) { return "$" + Math.round(n ?? 0).toLocaleString(); }
function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-CA", { month: "long", day: "numeric" }); }
  catch { return iso; }
}

// ── CSS-only confetti (20 dots, keyframe animation) ───────────────────────────
const CONFETTI_COLORS = ["#2D7A50","#C4841D","#3B82F6","#EC4899","#1B3A2D","#F59E0B"];
function Confetti({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: `${5 + i * 4.5}%`,
              width: 6,
              height: 6,
              borderRadius: i % 3 === 0 ? "50%" : 2,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animation: `confettiFall ${1.2 + (i % 5) * 0.2}s ease-out ${i * 0.08}s forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ── Goal creation / edit form ─────────────────────────────────────────────────
function GoalForm({ businessId, tier, suggestion, onSaved, onDismiss }:
  { businessId: string; tier: string; suggestion?: any; onSaved: () => void; onDismiss: () => void }
) {
  const [type, setType] = useState(suggestion?.goal_type ?? "recovery_amount");
  const [amount, setAmount] = useState(String(suggestion?.target_amount ?? ""));
  const [score, setScore] = useState(String(suggestion?.target_score ?? ""));
  const [count, setCount] = useState(String(suggestion?.target_count ?? ""));
  const [title, setTitle] = useState(suggestion?.goal_title ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const d90 = new Date(); d90.setDate(d90.getDate() + 90);
  const [targetDate, setTargetDate] = useState(d90.toISOString().split("T")[0]);

  async function save() {
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/v2/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId, tier,
          goal: {
            goal_type:           type,
            goal_title:          title || (type === "recovery_amount" ? `Recover ${fmt(Number(amount))}/month` : type === "score_improvement" ? `Reach score ${score}` : `Complete ${count} fixes`),
            target_amount:       type === "recovery_amount" ? Number(amount) || null : null,
            target_score:        type === "score_improvement" ? Number(score) || null : null,
            target_count:        type === "tasks_completed" ? Number(count) || null : null,
            target_date:         targetDate,
            was_suggested_by_claude: suggestion?.was_suggested_by_claude ?? false,
            suggestion_rationale:   suggestion?.suggestion_rationale ?? null,
          },
        }),
      });
      if (!res.ok) { const d = await res.json(); setErr(d.error); return; }
      onSaved();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Goal type</label>
        <select value={type} onChange={e => setType(e.target.value)}
          className="w-full mt-1 px-3 py-2 text-[12px] border border-border-light rounded-lg bg-white focus:outline-none">
          <option value="recovery_amount">Recover savings ($/month)</option>
          <option value="score_improvement">Improve health score</option>
          <option value="tasks_completed">Complete a number of fixes</option>
          <option value="custom">Custom goal</option>
        </select>
      </div>

      {type === "recovery_amount" && (
        <div>
          <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Target amount ($/month)</label>
          <div className="flex items-center border border-border-light rounded-lg mt-1 bg-white">
            <span className="px-3 text-[12px] text-ink-faint border-r border-border-light">$</span>
            <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 px-3 py-2 text-[12px] bg-transparent focus:outline-none" placeholder="e.g. 680" />
            <span className="px-3 text-[11px] text-ink-faint border-l border-border-light">/mo</span>
          </div>
        </div>
      )}
      {type === "score_improvement" && (
        <div>
          <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Target score</label>
          <input type="number" min="1" max="100" value={score} onChange={e => setScore(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-[12px] border border-border-light rounded-lg bg-white focus:outline-none" placeholder="e.g. 80" />
        </div>
      )}
      {type === "tasks_completed" && (
        <div>
          <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Number of fixes to complete</label>
          <input type="number" min="1" value={count} onChange={e => setCount(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-[12px] border border-border-light rounded-lg bg-white focus:outline-none" placeholder="e.g. 5" />
        </div>
      )}
      {type === "custom" && (
        <div>
          <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Goal description</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-[12px] border border-border-light rounded-lg bg-white focus:outline-none"
            placeholder="e.g. Set up automated bookkeeping" />
        </div>
      )}

      <div>
        <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Target date</label>
        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full mt-1 px-3 py-2 text-[12px] border border-border-light rounded-lg bg-white focus:outline-none" />
      </div>

      {err && <p className="text-[10px] text-negative">{err}</p>}

      <div className="flex gap-2">
        <button onClick={save} disabled={saving}
          className="flex-1 py-2 text-[12px] font-bold text-white rounded-lg disabled:opacity-40 transition hover:opacity-90"
          style={{ background: "#1B3A2D" }}>
          {saving ? "Saving…" : "Save goal →"}
        </button>
        <button onClick={onDismiss}
          className="px-4 py-2 text-[11px] font-semibold text-ink-muted border border-border-light rounded-lg hover:bg-bg-section transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function GoalProgressCard({ businessId, tier = "solo", lang = "en" }: GoalProgressCardProps) {
  const [data, setData] = useState<GoalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedPct, setAnimatedPct] = useState(0);
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  const load = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await fetch(`/api/v2/goals?businessId=${businessId}`);
      if (res.ok) {
        const d: GoalData = await res.json();
        setData(d);
        if (d.goalCompleted && !showCelebration) {
          setShowCelebration(true);
          if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
          celebrationTimer.current = setTimeout(() => setShowCelebration(false), 5000);
        }
      }
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }, [businessId, showCelebration]);

  useEffect(() => {
    load();
    const handler = () => { load(); };
    window.addEventListener("fruxal:task:completed", handler);
    window.addEventListener("fruxal:goal:completed", handler);
    return () => {
      window.removeEventListener("fruxal:task:completed", handler);
      window.removeEventListener("fruxal:goal:completed", handler);
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    };
  }, [load]);

  // Animate progress bar on data change
  useEffect(() => {
    if (!data?.progress) return;
    const target = data.progress.pct;
    let start = 0;
    const step = () => {
      start = Math.min(start + 2, target);
      setAnimatedPct(start);
      if (start < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [data?.progress?.pct]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border-light p-4 animate-pulse" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div className="h-3 w-32 bg-bg-section rounded mb-3" />
        <div className="h-2 bg-bg-section rounded w-full mb-2" />
        <div className="h-2 bg-bg-section rounded w-2/3" />
      </div>
    );
  }

  // ── GOAL COMPLETED ────────────────────────────────────────────────────────
  if (data?.goalCompleted || showCelebration) {
    const goal = data?.activeGoal;
    const recovered = data?.progress?.current ?? 0;
    return (
      <div className="relative bg-white rounded-xl border overflow-hidden"
        style={{ borderColor: "#2D7A5080", boxShadow: "0 1px 6px rgba(45,122,80,0.12)" }}>
        <Confetti visible={showCelebration} />
        <div className="px-4 py-4 text-center">
          <p className="text-2xl mb-2">🏆</p>
          <p className="text-[14px] font-black text-ink mb-1">
            {t("Goal Achieved!", "Objectif atteint !")}
          </p>
          {goal?.goal_type === "recovery_amount" && (
            <>
              <p className="text-[12px] text-ink-muted mb-1">
                {t(`You recovered ${fmt(recovered)}/month`, `Vous avez récupéré ${fmt(recovered)}/mois`)}
              </p>
              <p className="text-[11px] text-positive font-semibold">
                {t(`That's ${fmt(recovered * 12)}/year staying in your business.`, `C'est ${fmt(recovered * 12)}/an qui reste dans votre entreprise.`)}
              </p>
            </>
          )}
          <button
            onClick={() => { setShowForm(true); setSuggestion(null); }}
            className="mt-3 px-4 py-2 text-[11px] font-bold text-white rounded-lg hover:opacity-90 transition"
            style={{ background: "#1B3A2D" }}>
            {t("Set your next goal →", "Fixer le prochain objectif →")}
          </button>
        </div>
        {showForm && (
          <div className="border-t border-border-light p-4">
            <GoalForm businessId={businessId} tier={tier} onSaved={() => { setShowForm(false); load(); }} onDismiss={() => setShowForm(false)} />
          </div>
        )}
      </div>
    );
  }

  // ── NO GOAL ───────────────────────────────────────────────────────────────
  if (!data?.activeGoal) {
    return (
      <div className="bg-white rounded-xl border border-border-light overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", borderStyle: showForm ? undefined : "dashed" }}>
        {!showForm ? (
          <div className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">🎯</span>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-ink mb-0.5">
                  {t("Set a 90-day goal", "Fixer un objectif de 90 jours")}
                </p>
                <p className="text-[10px] text-ink-faint mb-2">
                  {t("Run your diagnostic to get a personalized goal suggestion, or set your own.",
                     "Lancez votre diagnostic pour obtenir une suggestion personnalisée.")}
                </p>
                <button onClick={() => setShowForm(true)}
                  className="text-[11px] font-bold text-brand hover:underline">
                  {t("Set a goal →", "Fixer un objectif →")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-[12px] font-bold text-ink mb-3">🎯 {t("Create a 90-day goal", "Créer un objectif de 90 jours")}</p>
            <GoalForm businessId={businessId} tier={tier} suggestion={suggestion}
              onSaved={() => { setShowForm(false); load(); }}
              onDismiss={() => setShowForm(false)} />
          </div>
        )}
      </div>
    );
  }

  // ── ACTIVE GOAL ───────────────────────────────────────────────────────────
  const goal = data.activeGoal;
  const progress = data.progress!;
  const barColor = progress.onPace ? "#2D7A50" : "#C4841D";

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border-light">
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
            {t("Your 90-day goal", "Votre objectif de 90 jours")}
          </span>
        </div>
        <span className="text-[9px] font-semibold text-ink-faint">
          {progress.daysRemaining} {t("days left", "jours restants")}
        </span>
      </div>

      {/* Goal title */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[13px] font-bold text-ink">{goal.goal_title}</p>
        {goal.goal_type === "recovery_amount" && (
          <p className="text-[10px] text-ink-faint mt-0.5">
            {t(`By ${fmtDate(goal.target_date)}`, `D'ici le ${fmtDate(goal.target_date)}`)}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-4 py-3">
        <div className="flex justify-between text-[10px] text-ink-faint mb-1.5">
          <span>
            {goal.goal_type === "recovery_amount" && fmt(progress.current)}
            {goal.goal_type === "score_improvement" && `+${progress.current} pts`}
            {goal.goal_type === "tasks_completed" && `${progress.current} fixes`}
          </span>
          <span className="font-semibold text-ink">{Math.round(animatedPct)}% {t("complete", "complété")}</span>
          <span>
            {goal.goal_type === "recovery_amount" && fmt(progress.target)}
            {goal.goal_type === "score_improvement" && `${progress.target} pts`}
            {goal.goal_type === "tasks_completed" && `${progress.target} fixes`}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0EFEB" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${animatedPct}%`, background: barColor }} />
        </div>
      </div>

      {/* Status */}
      <div className="px-4 pb-3 space-y-2">
        {progress.onPace ? (
          <p className="text-[11px] font-semibold text-positive">
            ✅ {t("On pace", "Dans les délais")}
            {progress.projectedCompletion && (
              <span className="text-ink-faint font-normal">
                {" "}— {t(`projected completion ${fmtDate(progress.projectedCompletion)}`,
                         `fin prévue le ${fmtDate(progress.projectedCompletion)}`)}
              </span>
            )}
          </p>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold" style={{ color: "#C4841D" }}>
              ⚠️ {t("Behind pace", "En retard")}
              {progress.weeklyPaceNeeded > 0 && (
                <span className="font-normal text-ink-faint">
                  {" "}— {goal.goal_type === "recovery_amount" ? fmt(progress.weeklyPaceNeeded) : progress.weeklyPaceNeeded} {t("needed this week", "nécessaire cette semaine")}
                </span>
              )}
            </p>
            {data.easiestTask && (
              <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-ink-muted truncate">
                    {t("Easiest fix:", "Correctif le plus facile :")} {data.easiestTask.title}
                    <span className="text-positive font-semibold ml-1">(~{fmt(data.easiestTask.savings_monthly)}/mo)</span>
                  </p>
                </div>
                <a href="/v2/tasks"
                  className="ml-2 text-[9px] font-bold text-brand shrink-0 hover:underline">
                  {t("Start →", "Commencer →")}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Enterprise: annualized */}
        {tier === "enterprise" && goal.goal_type === "recovery_amount" && goal.target_amount > 0 && (
          <p className="text-[10px] text-ink-faint">
            {t(`At goal completion: ${fmt(goal.target_amount * 12)}/year secured`,
               `À l'achèvement de l'objectif : ${fmt(goal.target_amount * 12)}/an`)}
          </p>
        )}

        {/* Abandon link */}
        <div className="flex justify-end">
          <button
            onClick={async () => {
              if (!confirm("Abandon this goal?")) return;
              await fetch(`/api/v2/goals/${goal.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "abandoned" }),
              });
              load();
            }}
            className="text-[9px] text-ink-faint hover:text-negative transition">
            {t("Abandon goal", "Abandonner l'objectif")}
          </button>
        </div>
      </div>
    </div>
  );
}
