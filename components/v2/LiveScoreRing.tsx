"use client";
// =============================================================================
// components/v2/LiveScoreRing.tsx
// Three exports:
//   LiveScoreRing    — animated SVG ring with delta label + rescan badge
//   ScoreBreakdown   — collapsible breakdown panel
//   ScoreSparkline   — SVG history chart (last 6 records)
// All listen for 'fruxal:score:updated' browser event to update in real-time.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScoreData {
  currentScore:        number | null;
  lastDiagnosticScore: number | null;
  delta:               number | null;
  deltaLabel:          string;
  breakdown:           Array<{ type: string; label: string; points: number }>;
  history:             Array<{ score: number; trigger_type: string; trigger_detail: string | null; calculated_at: string }>;
  daysSinceDiagnostic: number | null;
  needsRescan:         boolean;
  taskBonus?:          number;
  deadlinePenalty?:    number;
  decayPenalty?:       number;
}

interface LiveScoreRingProps {
  businessId:    string;
  size?:         number;
  showBreakdown?: boolean;
  showSparkline?: boolean;
  lang?:         "en" | "fr";
}

// ── Count-up animation hook ───────────────────────────────────────────────────
function useCountUp(target: number | null, duration = 300): number {
  const [value, setValue] = useState(target ?? 0);
  const prev = useRef(target ?? 0);
  const frame = useRef(0);

  useEffect(() => {
    const t = target ?? 0;
    if (prev.current === t) return;
    const start = prev.current;
    const delta = t - start;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(start + delta * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
      else { setValue(t); prev.current = t; }
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}

// ── Score color ───────────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 85) return "#059669";
  if (score >= 70) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

// ── Main ring component ───────────────────────────────────────────────────────
export function LiveScoreRing({ businessId, size = 120, showBreakdown = true, showSparkline = false, lang = "en" }: LiveScoreRingProps) {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  const animatedScore = useCountUp(data?.currentScore ?? null);

  const fetch_ = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await fetch(`/api/v2/score?businessId=${businessId}`);
      if (res.ok) setData(await res.json());
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }, [businessId]);

  useEffect(() => {
    fetch_();
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as ScoreData;
      if (d) setData(d);
      else fetch_();
    };
    window.addEventListener("fruxal:score:updated", handler);
    return () => window.removeEventListener("fruxal:score:updated", handler);
  }, [fetch_]);

  const score = data?.currentScore;
  const delta = data?.delta ?? null;
  const sw = size * 0.09;
  const r  = (size - sw) / 2;
  const c  = 2 * Math.PI * r;
  const pct = score != null ? score / 100 : 0;
  const color = score != null ? scoreColor(score) : "#E8E6E1";

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EFEB" strokeWidth={sw} />
          {/* Fill */}
          {!loading && score != null && (
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
              strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
              strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{ transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease" }}
            />
          )}
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {loading ? (
            <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" />
          ) : score != null ? (
            <>
              <span className="font-serif font-bold leading-none tabular-nums"
                style={{ fontSize: size * 0.28, color }}>
                {animatedScore}
              </span>
              <span className="text-ink-faint font-medium" style={{ fontSize: size * 0.1 }}>
                {t("/100", "/100")}
              </span>
            </>
          ) : (
            <span className="text-ink-faint" style={{ fontSize: size * 0.1 }}>—</span>
          )}
        </div>
      </div>

      {/* Delta label */}
      {delta !== null && delta !== 0 && !loading && (
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold" style={{ color: delta > 0 ? "#2D7A50" : "#C4841D" }}>
            {delta > 0 ? "↑" : "↓"} {data?.deltaLabel}
          </span>
        </div>
      )}

      {/* Rescan badge */}
      {data?.needsRescan && !loading && (
        <div className="px-2 py-0.5 rounded text-[8px] font-semibold"
          style={{ background: "rgba(196,132,29,0.10)", color: "#C4841D", border: "1px solid rgba(196,132,29,0.20)" }}>
          {t(`Rescan recommended (${data.daysSinceDiagnostic} days)`,
             `Rescan recommandé (${data.daysSinceDiagnostic} jours)`)}
        </div>
      )}

      {/* Breakdown panel */}
      {showBreakdown && data && !loading && (
        <ScoreBreakdown data={data} lang={lang} />
      )}

      {/* Sparkline */}
      {showSparkline && data?.history && data.history.length > 1 && (
        <ScoreSparkline history={data.history} />
      )}
    </div>
  );
}

// ── Score breakdown collapsible panel ────────────────────────────────────────
export function ScoreBreakdown({ data, lang = "en" }: { data: ScoreData; lang?: "en" | "fr" }) {
  const [expanded, setExpanded] = useState(false);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;
  const score = data.currentScore;
  const base  = data.lastDiagnosticScore;
  const delta = data.delta;

  if (!score || !base) return null;

  return (
    <div className="w-full mt-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition hover:bg-bg-section"
        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <span className="text-[10px] font-semibold text-ink-muted">
          {t("What's affecting this?", "Qu'est-ce qui affecte ce score ?")}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8E8C85" strokeWidth="2.2" strokeLinecap="round"
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div className="mt-1 rounded-xl border border-border-light bg-white p-3 space-y-2 text-[11px]"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

          {/* Base */}
          <div className="flex justify-between text-ink-muted">
            <span>{t("Base score (last diagnostic)", "Score de base (dernier diagnostic)")}</span>
            <span className="font-bold text-ink">{base}</span>
          </div>

          {/* Task bonuses */}
          {data.taskBonus != null && data.taskBonus > 0 && (
            <div>
              <div className="flex justify-between font-semibold text-positive mb-1">
                <span>✅ {t("Completed fixes", "Corrections effectuées")}</span>
                <span>+{data.taskBonus}</span>
              </div>
              {data.breakdown.filter(b => b.type === "task" && b.points > 0).map((b, i) => (
                <div key={i} className="flex justify-between text-ink-faint pl-3">
                  <span className="truncate max-w-[180px]">{b.label}</span>
                  <span>+{b.points}</span>
                </div>
              ))}
            </div>
          )}

          {/* Deadline penalties */}
          {data.deadlinePenalty != null && data.deadlinePenalty > 0 && (
            <div>
              <div className="flex justify-between font-semibold text-negative mb-1">
                <span>⚠️ {t("Missed deadlines", "Échéances manquées")}</span>
                <span>−{data.deadlinePenalty}</span>
              </div>
              {data.breakdown.filter(b => b.type === "deadline").map((b, i) => (
                <div key={i} className="flex justify-between text-ink-faint pl-3">
                  <span className="truncate max-w-[180px]">{b.label}</span>
                  <span>{b.points}</span>
                </div>
              ))}
            </div>
          )}

          {/* Decay */}
          {data.breakdown.filter(b => b.type === "decay").map((b, i) => (
            <div key={i} className="flex justify-between text-ink-faint">
              <span>📅 {b.label}</span>
              <span>{b.points === 0 ? "0" : b.points}</span>
            </div>
          ))}

          {/* Final */}
          <div className="border-t border-border-light pt-2 flex justify-between font-bold text-ink">
            <span>{t("Current score", "Score actuel")}</span>
            <span style={{ color: scoreColor(score) }}>
              {score}
              {delta !== null && delta !== 0 && (
                <span className="ml-1 text-[10px] font-normal" style={{ color: delta > 0 ? "#2D7A50" : "#C4841D" }}>
                  ({delta > 0 ? "+" : ""}{delta} {t("from last scan", "depuis le dernier scan")})
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score sparkline ───────────────────────────────────────────────────────────
export function ScoreSparkline({ history }: { history: Array<{ score: number; trigger_type: string; calculated_at: string }> }) {
  if (history.length < 2) return null;

  const W = 200, H = 60, PAD = 8;
  const scores = history.map(h => h.score);
  const minS = Math.max(0, Math.min(...scores) - 5);
  const maxS = Math.min(100, Math.max(...scores) + 5);
  const range = maxS - minS || 1;

  const pts = scores.map((s, i) => {
    const x = PAD + (i / (scores.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - (s - minS) / range) * (H - PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const first = scores[0], last = scores[scores.length - 1];
  const lineColor = last >= first ? "#2D7A50" : "#C4841D";

  // Trend label
  const diff = last - first;
  const trendText = diff === 0 ? "" : `${diff > 0 ? "↑" : "↓"} ${Math.abs(diff)} pts since first record`;
  const lastX = PAD + ((scores.length - 1) / (scores.length - 1)) * (W - PAD * 2);
  const lastY = PAD + (1 - (last - minS) / range) * (H - PAD * 2);

  return (
    <div className="w-full mt-2">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <polyline points={pts.join(" ")} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Last point dot */}
        <circle cx={lastX} cy={lastY} r="3" fill={lineColor} />
        {/* Last score label */}
        <text x={lastX} y={lastY - 6} textAnchor="middle" fontSize="8" fill={lineColor} fontWeight="700">{last}</text>
      </svg>
      {trendText && (
        <p className="text-[9px] text-ink-faint text-center mt-0.5" style={{ color: lineColor }}>{trendText}</p>
      )}
    </div>
  );
}

// =============================================================================
// ScoreRingAddons — injects only the delta label + breakdown + sparkline
// below the EXISTING score ring on each dashboard (doesn't duplicate the ring)
// =============================================================================

export function ScoreRingAddons({ businessId, lang = "en" }: { businessId: string; lang?: "en" | "fr" }) {
  const [data, setData] = useState<ScoreData | null>(null);
  const isFR = lang === "fr";
  const t = (en: string, fr: string) => isFR ? fr : en;

  const load = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await fetch(`/api/v2/score?businessId=${businessId}`);
      if (res.ok) setData(await res.json());
    } catch { /* non-fatal */ }
  }, [businessId]);

  useEffect(() => {
    load();
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as ScoreData;
      if (d) setData(d);
      else load();
    };
    window.addEventListener("fruxal:score:updated", handler);
    return () => window.removeEventListener("fruxal:score:updated", handler);
  }, [load]);

  if (!data?.currentScore) return null;

  const delta = data.delta;
  const score = data.currentScore;

  return (
    <div className="w-full space-y-1">
      {/* Delta label */}
      {delta !== null && delta !== 0 && (
        <p className="text-[10px] font-bold text-center" style={{ color: delta > 0 ? "#2D7A50" : "#C4841D" }}>
          {delta > 0 ? "↑ +" : "↓ "}{Math.abs(delta)} {t("from last scan", "depuis le dernier scan")}
        </p>
      )}

      {/* Rescan badge */}
      {data.needsRescan && (
        <p className="text-[8px] text-center font-semibold px-2 py-0.5 rounded"
          style={{ background: "rgba(196,132,29,0.08)", color: "#C4841D" }}>
          {t(`Rescan recommended (${data.daysSinceDiagnostic}d)`, `Rescan recommandé (${data.daysSinceDiagnostic}j)`)}
        </p>
      )}

      {/* Breakdown (collapsible) */}
      <ScoreBreakdown data={data} lang={lang} />

      {/* Sparkline if history */}
      {data.history.length >= 2 && (
        <ScoreSparkline history={data.history} />
      )}
    </div>
  );
}
