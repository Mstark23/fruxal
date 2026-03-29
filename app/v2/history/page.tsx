"use client";
// =============================================================================
// app/v2/history/page.tsx
// Financial history timeline — score progression chart + vertical event timeline
// Grouped by month, milestone events highlighted
// =============================================================================

import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TimelineEvent {
  id:                    string;
  event_type:            string;
  event_date:            string;
  title:                 string;
  description?:          string;
  score_at_event?:       number | null;
  score_delta?:          number;
  savings_monthly_delta?: number;
  source_id:             string;
  icon:                  string;
  color:                 string;
  is_milestone:          boolean;
}

interface ScorePoint {
  score:        number;
  trigger_type: string;
  calculated_at: string;
}

interface JourneyStats {
  totalDaysOnPlatform:        number;
  totalSavingsRecovered:      number;
  totalSavingsAnnualized:     number;
  scoreImprovement:           number;
  firstScore:                 number;
  latestScore:                number;
  tasksCompleted:             number;
  goalsCompleted:             number;
  rescansCompleted:           number;
  estimatedBusinessValueAdded: number;
  projectedDate:              string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) { return "$" + Math.round(n ?? 0).toLocaleString(); }

function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  try {
    return new Date(iso).toLocaleDateString("en-CA",
      opts ?? { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m)-1, 1).toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

const COLOR_MAP: Record<string, string> = {
  green:  "#2D7A50",
  blue:   "#3B82F6",
  amber:  "#C4841D",
  purple: "#8B5CF6",
  red:    "#EF4444",
};

// ── Score chart (SVG) ─────────────────────────────────────────────────────────
function ScoreChart({ points, projectedDate, latestScore }: {
  points: ScorePoint[];
  projectedDate: string | null;
  latestScore: number;
}) {
  if (points.length < 2) return null;

  const W = 600, H = 160, PX = 40, PY = 16;
  const minDate = new Date(points[0].calculated_at).getTime();
  const maxDate = new Date(points[points.length - 1].calculated_at).getTime();
  const dateRange = maxDate - minDate || 1;

  const x = (iso: string) =>
    PX + ((new Date(iso).getTime() - minDate) / dateRange) * (W - PX * 2);
  const y = (score: number) =>
    PY + (1 - score / 100) * (H - PY * 2);

  const polyline = points.map(p => `${x(p.calculated_at).toFixed(1)},${y(p.score).toFixed(1)}`).join(" ");
  const firstS = points[0].score;
  const lastS  = points[points.length - 1].score;
  const lineColor = lastS >= firstS ? "#10b981" : "#C4841D";
  const y70 = y(70);

  // X-axis labels (show up to 5)
  const step = Math.max(1, Math.ceil(points.length / 5));
  const labelPoints = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  return (
    <div className="relative overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H + 24}`}
        className="w-full"
        style={{ height: 140, minWidth: 240 }}
      >
        {/* Bg grid */}
        {[0, 25, 50, 70, 100].map(s => (
          <line key={s} x1={PX} x2={W - PX} y1={y(s)} y2={y(s)}
            stroke={s === 70 ? "#2D7A5030" : "#F0EFEB"} strokeWidth={s === 70 ? 1.5 : 1}
            strokeDasharray={s === 70 ? "4 3" : undefined}
          />
        ))}
        {/* Y-axis labels */}
        {[0, 50, 70, 100].map(s => (
          <text key={s} x={PX - 6} y={y(s) + 4} textAnchor="end"
            fontSize="9" fill="#8E8C85" fontFamily="monospace">{s}</text>
        ))}
        {/* 70 label */}
        <text x={W - PX + 4} y={y70 + 3} fontSize="8" fill="#2D7A5060">70</text>

        {/* Score line */}
        <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i}
            cx={x(p.calculated_at)} cy={y(p.score)}
            r={i === points.length - 1 ? 4 : 2.5}
            fill={lineColor}
          />
        ))}

        {/* Last score label */}
        <text
          x={x(points[points.length - 1].calculated_at)}
          y={y(lastS) - 8}
          textAnchor="middle" fontSize="10" fontWeight="700" fill={lineColor}>
          {lastS}
        </text>

        {/* X-axis dates */}
        {labelPoints.map((p, i) => (
          <text key={i} x={x(p.calculated_at)} y={H + 16}
            textAnchor="middle" fontSize="8" fill="#8E8C85">
            {fmtDate(p.calculated_at, { month: "short", day: "numeric" })}
          </text>
        ))}
      </svg>
      <p className="text-[10px] text-ink-faint mt-1 text-center">
        Score improved {lastS - firstS > 0 ? "+" : ""}{lastS - firstS} points since first scan.
        {projectedDate && latestScore < 80 && (
          <span className="text-positive ml-1">At this rate, you&apos;ll reach 80/100 by {projectedDate}.</span>
        )}
      </p>
    </div>
  );
}

// ── Timeline event card ───────────────────────────────────────────────────────
function EventCard({ event }: { event: TimelineEvent }) {
  const color = COLOR_MAP[event.color] ?? "#3B82F6";

  if (event.is_milestone) {
    return (
      <div className="rounded-xl border p-3 mb-2"
        style={{ borderColor: `${color}30`, background: `${color}05` }}>
        <div className="flex items-start gap-2">
          <span className="text-base shrink-0 mt-0.5">{event.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-bold text-ink leading-snug">{event.title}</p>
              <p className="text-[9px] text-ink-faint shrink-0 mt-0.5">
                {fmtDate(event.event_date, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            {event.description && (
              <p className="text-[10px] text-ink-muted mt-0.5 leading-relaxed">{event.description}</p>
            )}
            {event.score_at_event != null && (
              <p className="text-[10px] font-semibold mt-1" style={{ color }}>
                Score: {event.score_at_event}/100
                {event.score_delta != null && event.score_delta !== 0 && (
                  <span className="ml-1">({event.score_delta > 0 ? "+" : ""}{event.score_delta})</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 py-1.5 pl-1">
      <span className="text-sm shrink-0 mt-0.5">{event.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold text-ink leading-snug">{event.title}</p>
          <p className="text-[9px] text-ink-faint shrink-0 mt-0.5">
            {fmtDate(event.event_date, { month: "short", day: "numeric" })}
          </p>
        </div>
        {event.description && (
          <p className="text-[10px] text-ink-faint mt-0.5">{event.description}</p>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([]);
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [businessId, setBusinessId] = useState("");
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState("solo");

  useEffect(() => {
    // Get businessId from dashboard API
    fetch("/api/v2/dashboard")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const bid = d?.data?.businessId ?? "";
        const t   = d?.data?.tier ?? "solo";
        setBusinessId(bid);
        setTier(t);
        if (bid) return fetch(`/api/v2/history?businessId=${bid}`);
        return null;
      })
      .then(r => r?.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setEvents(d.events ?? []);
          setScoreHistory(d.scoreHistory ?? []);
          setStats(d.stats ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group events by month
  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, e) => {
    const key = monthKey(e.event_date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const monthKeys = Object.keys(grouped).sort();

  // Month summary (savings + score delta)
  function monthSummary(key: string) {
    const evts = grouped[key];
    const savings = evts.reduce((s, e) => s + (e.savings_monthly_delta && e.savings_monthly_delta > 0 ? e.savings_monthly_delta : 0), 0);
    const scoreDelta = evts.reduce((s, e) => s + (e.score_delta ?? 0), 0);
    const parts: string[] = [];
    if (savings > 0) parts.push(`${fmt(savings)} recovered`);
    if (scoreDelta !== 0) parts.push(`score ${scoreDelta > 0 ? "+" : ""}${scoreDelta}`);
    return parts.join(" · ");
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-48 bg-bg-section rounded animate-pulse" />
        <div className="h-40 bg-bg-section rounded-xl animate-pulse" />
        {[1,2,3].map(i => (
          <div key={i} className="h-16 bg-bg-section rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-4xl mb-4">📈</p>
        <p className="text-[15px] font-bold text-ink mb-2">Your financial journey starts here.</p>
        <p className="text-[12px] text-ink-faint mb-4">
          Run your first diagnostic to begin tracking your progress over time.
        </p>
        <a href="/v2/diagnostic"
          className="inline-block px-5 py-2.5 text-[12px] font-bold text-white rounded-xl hover:opacity-90 transition"
          style={{ background: "#1B3A2D" }}>
          Run your first diagnostic →
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[18px] font-black text-ink">📈 Your Financial Journey</h1>
        {stats && (
          <p className="text-[11px] text-ink-faint mt-0.5">
            {stats.totalDaysOnPlatform} days on Fruxal
          </p>
        )}
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border-light">
            {[
              { label: "Score improvement", value: `${stats.scoreImprovement > 0 ? "+" : ""}${stats.scoreImprovement} pts`, sub: `${stats.firstScore} → ${stats.latestScore}`, color: stats.scoreImprovement > 0 ? "#2D7A50" : "#8E8C85" },
              { label: "Monthly recovered", value: fmt(stats.totalSavingsRecovered), sub: `${fmt(stats.totalSavingsAnnualized)}/year`, color: "#2D7A50" },
              { label: "Recoveries confirmed", value: String(stats.tasksCompleted), sub: `${stats.rescansCompleted} rescan${stats.rescansCompleted !== 1 ? "s" : ""}` },
              { label: tier === "enterprise" ? "Est. value added" : "Intakes run", value: tier === "enterprise" ? `~${fmt(stats.estimatedBusinessValueAdded)}` : String(stats.rescansCompleted), sub: tier === "enterprise" ? "over 24 months" : "completed" },
            ].map((s, i) => (
              <div key={i} className="px-4 py-3">
                <p className="text-[9px] text-ink-faint uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className="text-[16px] font-black" style={{ color: s.color ?? "#1a1a2e" }}>{s.value}</p>
                <p className="text-[9px] text-ink-faint">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score chart */}
      {scoreHistory.length >= 2 && (
        <div className="bg-white rounded-xl border border-border-light px-4 py-3"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-3">Score progression</p>
          <ScoreChart
            points={scoreHistory}
            projectedDate={stats?.projectedDate ?? null}
            latestScore={stats?.latestScore ?? 0}
          />
        </div>
      )}

      {/* Timeline */}
      <div>
        <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-3">Timeline</p>
        <div className="space-y-5">
          {monthKeys.map(key => (
            <div key={key}>
              {/* Month header */}
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-[12px] font-black text-ink">{monthLabel(key)}</h3>
                {monthSummary(key) && (
                  <span className="text-[9px] text-ink-faint">— {monthSummary(key)}</span>
                )}
              </div>
              {/* Events */}
              <div className="pl-1 border-l-2 border-border-light space-y-1 ml-2">
                {grouped[key].map(e => (
                  <EventCard key={e.id as string} event={e as TimelineEvent} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
