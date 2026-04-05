"use client";
import { useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine,
} from "recharts";

/* ── Deterministic pseudo-random (consistent across renders) ─────────── */
const pr = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };

/* ── Daily data: March 2026 ──────────────────────────────────────────── */
interface DayRow {
  day: number; label: string; fullLabel: string;
  rev: number; leads: number; newCust: number; convRate: number;
  aov: number; costs: number; score: number;
}

const generateDaily = (): DayRow[] => {
  const data: DayRow[] = [];
  for (let i = 0; i < 31; i++) {
    const r = (s: number) => pr(i * 13 + s);
    const revBase = 3800 + i * 30;
    const rev     = Math.round(revBase * (0.62 + r(1) * 0.76));
    const leads   = Math.round(55 + r(2) * 50);
    const convRate = +(2.2 + r(3) * 3.5).toFixed(1);
    const newCust = Math.max(0, Math.round(leads * convRate / 100));
    const aov     = Math.round(128 + r(4) * 80);
    const costs   = Math.round(rev * (0.55 + r(5) * 0.2));

    const revScore  = Math.min(100, (rev / 4600) * 100);
    const custScore = Math.min(100, (newCust / 5) * 100);
    const convScore = Math.min(100, (convRate / 3.8) * 100);
    const aovScore  = Math.min(100, (aov / 168) * 100);
    const costRatio = costs / rev;
    const costScr   = Math.min(100, Math.max(0, (1 - (costRatio - 0.55) / 0.3) * 100));
    const score     = Math.round(revScore * 0.35 + custScore * 0.25 + convScore * 0.25 + aovScore * 0.10 + costScr * 0.05);

    data.push({ day: i + 1, label: "M" + (i + 1), fullLabel: "Mar " + (i + 1), rev, leads, newCust, convRate, aov, costs, score });
  }
  return data;
};

const DAILY     = generateDaily();
const TODAY     = DAILY[DAILY.length - 1];
const YESTERDAY = DAILY[DAILY.length - 2];

const scoreColor = (s: number) => s >= 75 ? "#2D7A50" : s >= 50 ? "#A68B2B" : "#B34040";
const scoreLabel = (s: number) => s >= 75 ? "Good" : s >= 50 ? "Watch" : "Bad";

/* ── Monthly KPI data ────────────────────────────────────────────────── */
interface Kpi { id: string; label: string; current: number; prev: number; fmt: "dollar"|"pct"|"number"; lowerBetter: boolean }

const KPIS: Kpi[] = [
  { id: "revenue",    label: "Revenue",          current: 142500, prev: 118200, fmt: "dollar",  lowerBetter: false },
  { id: "customers",  label: "Active Customers", current: 847,    prev: 721,    fmt: "number",  lowerBetter: false },
  { id: "margin",     label: "Gross Margin",     current: 42.3,   prev: 38.1,   fmt: "pct",     lowerBetter: false },
  { id: "conversion", label: "Conversion Rate",  current: 3.8,    prev: 2.9,    fmt: "pct",     lowerBetter: false },
  { id: "aov",        label: "Avg Order Value",  current: 168,    prev: 164,    fmt: "dollar",  lowerBetter: false },
  { id: "churn",      label: "Churn Rate",       current: 4.2,    prev: 5.8,    fmt: "pct",     lowerBetter: true  },
  { id: "nps",        label: "NPS Score",        current: 67,     prev: 54,     fmt: "number",  lowerBetter: false },
  { id: "costs",      label: "Op. Costs",        current: 98400,  prev: 89300,  fmt: "dollar",  lowerBetter: true  },
];

const MONTHLY = [
  { m: "Oct", rev: 98000,  cost: 71000, cust: 680 },
  { m: "Nov", rev: 105000, cost: 74000, cust: 701 },
  { m: "Dec", rev: 134000, cost: 88000, cust: 742 },
  { m: "Jan", rev: 118000, cost: 82000, cust: 771 },
  { m: "Feb", rev: 129000, cost: 89000, cust: 810 },
  { m: "Mar", rev: 142500, cost: 98400, cust: 847 },
];

const CHANNELS = [
  { name: "Organic",  value: 38, color: "#4f7cff" },
  { name: "Paid Ads", value: 27, color: "#2D7A50" },
  { name: "Referral", value: 18, color: "#A68B2B" },
  { name: "Direct",   value: 11, color: "#a78bfa" },
  { name: "Social",   value: 6,  color: "#fb923c" },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */
const fmtVal = (v: number | undefined | null, type: string) => {
  if (v == null) return "—";
  if (type === "dollar") return "$" + v.toLocaleString();
  if (type === "pct")    return v + "%";
  return v.toLocaleString();
};

const getChange = (kpi: Kpi) => {
  const raw  = ((kpi.current - kpi.prev) / kpi.prev * 100);
  const diff = Math.abs(raw).toFixed(1);
  const up   = kpi.current > kpi.prev;
  const good = kpi.lowerBetter ? !up : up;
  return { diff, up, good };
};

/* ── Alerts engine ────────────────────────────────────────────────────── */
interface Alert { id: string; severity: "critical"|"warning"; label: string; summary: string; aiContext: string }

const buildAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  KPIS.forEach(kpi => {
    const { good, diff, up } = getChange(kpi);
    if (!good) {
      alerts.push({
        id: kpi.id, severity: parseFloat(diff) > 10 ? "critical" : "warning",
        label: kpi.label,
        summary: `${up ? "Up" : "Down"} ${diff}% — ${fmtVal(kpi.prev, kpi.fmt)} → ${fmtVal(kpi.current, kpi.fmt)}`,
        aiContext: `"${kpi.label}" is trending in the wrong direction. It ${up ? "increased" : "decreased"} by ${diff}% — from ${fmtVal(kpi.prev, kpi.fmt)} to ${fmtVal(kpi.current, kpi.fmt)}. ${kpi.lowerBetter ? "Should be going DOWN." : "Should be going UP."}`,
      });
    }
  });
  const costGrowth = ((MONTHLY[5].cost - MONTHLY[0].cost) / MONTHLY[0].cost * 100);
  const revGrowth  = ((MONTHLY[5].rev  - MONTHLY[0].rev)  / MONTHLY[0].rev  * 100);
  if (costGrowth > revGrowth) {
    alerts.push({
      id: "cost-vs-rev", severity: "warning",
      label: "Costs Outpacing Revenue Growth",
      summary: `Costs +${costGrowth.toFixed(1)}% vs revenue +${revGrowth.toFixed(1)}% over 6 months`,
      aiContext: `Operating costs grew ${costGrowth.toFixed(1)}% while revenue grew ${revGrowth.toFixed(1)}% over Oct–Mar. Cost-to-revenue ratio is expanding.`,
    });
  }
  const janDip = ((MONTHLY[2].rev - MONTHLY[3].rev) / MONTHLY[2].rev * 100);
  if (janDip > 0) {
    alerts.push({
      id: "jan-dip", severity: "warning",
      label: "Revenue Dip — Dec to Jan",
      summary: `Revenue dropped ${janDip.toFixed(1)}% from $134K (Dec) to $118K (Jan)`,
      aiContext: `Revenue dropped ${janDip.toFixed(1)}% from December ($134,000) to January ($118,000). Could be seasonal or structural.`,
    });
  }
  if (TODAY.score < 60) {
    alerts.push({
      id: "daily-score-low", severity: TODAY.score < 40 ? "critical" : "warning",
      label: `Today's Score is Low (${TODAY.score}/100)`,
      summary: `Mar 31 scored ${TODAY.score} — ${TODAY.score < 40 ? "critical attention needed" : "needs monitoring"}`,
      aiContext: `Today (Mar 31) daily business score is ${TODAY.score}/100. Revenue $${TODAY.rev.toLocaleString()} (target $4,600), New customers ${TODAY.newCust} (target 5), Conversion rate ${TODAY.convRate}% (target 3.8%), AOV $${TODAY.aov} (target $168).`,
    });
  }
  return alerts;
};

const ALERTS       = buildAlerts();
const HEALTH_SCORE = Math.max(0, 100 - ALERTS.reduce((a, x) => a + (x.severity === "critical" ? 20 : 10), 0));
const HEALTH_COLOR = HEALTH_SCORE >= 80 ? "#2D7A50" : HEALTH_SCORE >= 60 ? "#A68B2B" : "#B34040";
const HEALTH_LABEL = HEALTH_SCORE >= 80 ? "Healthy" : HEALTH_SCORE >= 60 ? "At Risk" : "Critical";

const CONTEXT = `Company: Fruxal | Period: Q1 2026
Revenue: $142,500 (↑20.6% from $118,200)
Active Customers: 847 (↑17.5% from 721) | Gross Margin: 42.3% | Conversion: 3.8% | AOV: $168
Churn: 4.2% (improved) | NPS: 67 | Op. Costs: $98,400 (↑10.2%)
Monthly Revenue (Oct–Mar): $98K, $105K, $134K, $118K, $129K, $142.5K
Channels: Organic 38%, Paid 27%, Referral 18%, Direct 11%, Social 6%
Today (Mar 31) daily score: ${TODAY.score}/100
Today's revenue: $${TODAY.rev.toLocaleString()} | New customers: ${TODAY.newCust} | Conversion: ${TODAY.convRate}% | AOV: $${TODAY.aov}
Yesterday score: ${YESTERDAY.score}/100 | Score trend (last 7 days): ${DAILY.slice(-7).map(d => d.score).join(", ")}`;

/* ── Claude API (via server route) ────────────────────────────────────── */
async function callClaude(messages: Array<{role:string;content:string}>, sysOverride?: string) {
  const system = sysOverride ||
    `You are an AI business optimization consultant for Fruxal. Data:\n\n${CONTEXT}\n\nBe concise, data-driven, actionable. Use **bold** for key points. Max 320 words.`;
  const res = await fetch("/api/admin/statistics/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });
  const data = await res.json();
  return data.text || "Unable to generate response.";
}

/* ── Sub-components ───────────────────────────────────────────────────── */
function RichText({ text }: { text: string }) {
  return (
    <div className="text-sm leading-7 text-[#1A1A18]">
      {text.split("\n").filter(l => l.trim()).map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="mb-2.5">
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} className="font-semibold">{p.slice(2, -2)}</strong>
                : p
            )}
          </p>
        );
      })}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const { diff, up, good } = getChange(kpi);
  return (
    <div className={`bg-[#F5F4F0] rounded-xl px-4 py-3.5 ${!good ? "border border-[#B34040]/30" : "border border-transparent"}`}>
      <div className="flex justify-between mb-1.5">
        <p className="text-[11px] text-[#8E8C85] uppercase tracking-wider">{kpi.label}</p>
        {!good && <span className="text-xs">⚠</span>}
      </div>
      <p className="text-xl font-medium font-mono text-[#1A1A18] mb-2">{fmtVal(kpi.current, kpi.fmt)}</p>
      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${good ? "bg-[#2D7A50]/10 text-[#2D7A50]" : "bg-[#B34040]/10 text-[#B34040]"}`}>
        {up ? "↑" : "↓"} {diff}%
      </span>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);

  const diagnose = async () => {
    setLoading(true); setOpen(true);
    try {
      const sys = `You are diagnosing a specific business problem for Fruxal.\n\n${CONTEXT}\n\nBe specific, actionable. Use **bold** for key points.`;
      const t = await callClaude([{ role: "user", content: `Diagnose this issue and how to fix it:\n\n${alert.aiContext}\n\nProvide: 1) Root cause(s), 2) What to investigate, 3) Two concrete action steps.` }], sys);
      setDiagnosis(t);
    } catch { setDiagnosis("Error. Please try again."); }
    setLoading(false);
  };

  const isCritical = alert.severity === "critical";
  const borderCls  = isCritical ? "border-[#B34040]/40" : "border-[#A68B2B]/40";
  const badgeCls   = isCritical ? "bg-[#B34040]/10 text-[#B34040]" : "bg-[#A68B2B]/10 text-[#A68B2B]";
  const btnCls     = isCritical ? "border-[#B34040]/40 text-[#B34040]" : "border-[#A68B2B]/40 text-[#A68B2B]";

  return (
    <div className={`border ${borderCls} rounded-xl overflow-hidden mb-3`}>
      <div className={`flex items-center justify-between px-4 py-3 bg-white gap-3 flex-wrap ${open ? `border-b ${borderCls}` : ""}`}>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full tracking-wider shrink-0 ${badgeCls}`}>
            {isCritical ? "CRITICAL" : "WARNING"}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1A1A18]">{alert.label}</p>
            <p className="text-xs text-[#8E8C85]">{alert.summary}</p>
          </div>
        </div>
        <button onClick={diagnosis ? () => setOpen(o => !o) : diagnose} disabled={loading}
          className={`text-[13px] px-3.5 py-1.5 rounded-lg border font-medium shrink-0 ${btnCls} ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}>
          {loading ? "Diagnosing..." : diagnosis ? (open ? "Hide ↑" : "Show Fix ↓") : "Diagnose & Fix →"}
        </button>
      </div>
      {open && (
        <div className="p-4 bg-white">
          {loading ? <p className="text-sm text-[#8E8C85]">Analyzing this issue...</p> : <RichText text={diagnosis} />}
        </div>
      )}
    </div>
  );
}

function ScoreTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const s = payload[0].value;
  return (
    <div className="bg-white border border-[#E8E6E1] rounded-lg px-3 py-2 text-[13px] shadow-sm">
      <p className="font-medium text-[#1A1A18] mb-1">{payload[0].payload.fullLabel}</p>
      <p className="font-mono font-medium" style={{ color: scoreColor(s) }}>{s}/100 — {scoreLabel(s)}</p>
    </div>
  );
}

function DailyMetric({ label, value, target, unit, lowerBetter }: { label:string; value:number; target:number; unit:string; lowerBetter:boolean }) {
  const pct   = Math.round((value / target) * 100);
  const good  = lowerBetter ? value <= target : value >= target;
  const color = good ? "#2D7A50" : "#B34040";
  const barW  = Math.min(100, pct);
  return (
    <div className="bg-[#F5F4F0] rounded-xl px-3.5 py-3">
      <div className="flex justify-between items-baseline mb-1.5">
        <p className="text-[11px] text-[#8E8C85] uppercase tracking-wider">{label}</p>
        <span className="text-[11px] font-medium" style={{ color }}>{good ? "✓ On target" : "⚠ Off target"}</span>
      </div>
      <p className="text-lg font-medium font-mono text-[#1A1A18] mb-2">
        {unit === "$" ? "$" + value.toLocaleString() : unit === "%" ? value + "%" : value.toLocaleString()}
      </p>
      <div className="h-1 rounded-full bg-[#EEECE8] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-400" style={{ width: barW + "%", background: color }} />
      </div>
      <p className="mt-1 text-[11px] text-[#8E8C85]">
        Target: {unit === "$" ? "$" + target.toLocaleString() : unit === "%" ? target + "%" : target} ({pct}%)
      </p>
    </div>
  );
}

const SUGGESTIONS = ["What's driving revenue growth?","How can we reduce cost growth?","Which channel to invest in more?","What caused the January dip?"];

/* ── Main Page ────────────────────────────────────────────────────────── */
export default function StatisticsPage() {
  const [tab, setTab]                         = useState("overview");
  const [insights, setInsights]               = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [forecast, setForecast]               = useState("");
  const [forecastLoading, setForecastLoading] = useState(false);
  const [chat, setChat]                       = useState<Array<{role:string;content:string}>>([]);
  const [input, setInput]                     = useState("");
  const [chatLoading, setChatLoading]         = useState(false);
  const [selectedDay, setSelectedDay]         = useState<DayRow | null>(null);

  const generateInsights = async () => {
    setInsightsLoading(true); setInsights("");
    try { const t = await callClaude([{ role: "user", content: "Analyze Fruxal's performance. 1) Executive summary, 2) Top 3 strengths with data, 3) Top 3 risks, 4) Two prioritized recommendations." }]); setInsights(t); }
    catch { setInsights("Error generating insights."); }
    setInsightsLoading(false);
  };

  const generateForecast = async () => {
    setForecastLoading(true); setForecast("");
    try { const t = await callClaude([{ role: "user", content: "Forecast Q2 2026 (Apr–Jun). 1) Monthly revenue projections, 2) Customer growth, 3) Margin and cost outlook, 4) Key risks and opportunities." }]); setForecast(t); }
    catch { setForecast("Error generating forecast."); }
    setForecastLoading(false);
  };

  const sendChat = async (override?: string) => {
    const msg = override || input;
    if (!msg.trim() || chatLoading) return;
    const newMsg  = { role: "user", content: msg };
    const updated = [...chat, newMsg];
    setChat(updated); setInput(""); setChatLoading(true);
    try { const t = await callClaude(updated); setChat([...updated, { role: "assistant", content: t }]); }
    catch { setChat([...updated, { role: "assistant", content: "Error. Try again." }]); }
    setChatLoading(false);
  };

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "daily",    label: "Daily Score" },
    { id: "alerts",   label: "Alerts", badge: ALERTS.length },
    { id: "insights", label: "AI Insights" },
    { id: "ask",      label: "Ask AI" },
    { id: "forecast", label: "Forecast" },
  ];

  const dayData = selectedDay || TODAY;

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-8 max-w-7xl mx-auto">
      <AdminNav />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A18] font-serif">Business Statistics</h1>
          <p className="text-sm text-[#8E8C85]">Business Intelligence · Mar 2026</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-[#8E8C85] uppercase tracking-wider">Today&apos;s Score</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-medium font-mono" style={{ color: scoreColor(TODAY.score) }}>{TODAY.score}</span>
              <span className="text-xs font-medium" style={{ color: scoreColor(TODAY.score) }}>{scoreLabel(TODAY.score)}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-[#E8E6E1]" />
          <div className="text-right">
            <p className="text-[10px] text-[#8E8C85] uppercase tracking-wider">Monthly Health</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-medium font-mono" style={{ color: HEALTH_COLOR }}>{HEALTH_SCORE}</span>
              <span className="text-xs font-medium" style={{ color: HEALTH_COLOR }}>{HEALTH_LABEL}</span>
            </div>
          </div>
          {ALERTS.length > 0 && (
            <button onClick={() => setTab("alerts")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#B34040]/30 bg-[#B34040]/5 text-[#B34040] text-[13px] font-medium cursor-pointer hover:bg-[#B34040]/10 transition-colors">
              ⚠ {ALERTS.length}
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0.5 mb-6 border-b border-[#E8E6E1] pb-2.5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
              tab === t.id ? "bg-[#F5F4F0] text-[#1A1A18] font-medium" : "text-[#8E8C85] hover:text-[#56554F]"
            }`}>
            {t.label}
            {(t.badge ?? 0) > 0 && <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-[#B34040]/10 text-[#B34040]">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ── DAILY SCORE ────────────────────────────────────────────────── */}
      {tab === "daily" && (
        <div>
          {/* Hero */}
          <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 mb-3.5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <p className="text-[10px] text-[#8E8C85] uppercase tracking-wider mb-1">Mar {dayData.day} Score</p>
                  <div className="w-[88px] h-[88px] rounded-full flex flex-col items-center justify-center" style={{ border: `3px solid ${scoreColor(dayData.score)}` }}>
                    <span className="text-[28px] font-medium font-mono leading-none" style={{ color: scoreColor(dayData.score) }}>{dayData.score}</span>
                    <span className="text-[11px] font-medium" style={{ color: scoreColor(dayData.score) }}>{scoreLabel(dayData.score)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A18] mb-1.5">
                    {dayData.day === TODAY.day ? "Today vs Yesterday" : `Mar ${dayData.day} vs Mar ${dayData.day - 1}`}
                  </p>
                  {(() => {
                    const prev = DAILY[dayData.day - 2] || DAILY[0];
                    const diff = dayData.score - prev.score;
                    const good = diff >= 0;
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[22px] font-medium font-mono" style={{ color: scoreColor(prev.score) }}>{prev.score}</span>
                          <span className="text-[13px] text-[#8E8C85]">→</span>
                          <span className="text-[22px] font-medium font-mono" style={{ color: scoreColor(dayData.score) }}>{dayData.score}</span>
                          <span className={`text-[13px] px-2 py-0.5 rounded-full font-medium ${good ? "bg-[#2D7A50]/10 text-[#2D7A50]" : "bg-[#B34040]/10 text-[#B34040]"}`}>
                            {good ? "+" : ""}{diff} pts
                          </span>
                        </div>
                        <p className="text-xs text-[#8E8C85]">Mar {dayData.day - 1 || 1} score: {prev.score}</p>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-[#8E8C85]">
                <p className="font-medium text-[#1A1A18] text-[13px] mb-1">Score breakdown</p>
                {[["Revenue vs target","35%"],["New customers","25%"],["Conversion rate","25%"],["Avg order value","10%"],["Cost efficiency","5%"]].map(([k,v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span>{k}</span><span className="font-medium text-[#1A1A18]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily metrics */}
          <div className="grid grid-cols-4 gap-2.5 mb-3.5">
            <DailyMetric label="Revenue"         value={dayData.rev}      target={4600} unit="$"  lowerBetter={false} />
            <DailyMetric label="New Customers"    value={dayData.newCust}  target={5}    unit=""   lowerBetter={false} />
            <DailyMetric label="Conversion Rate"  value={dayData.convRate} target={3.8}  unit="%"  lowerBetter={false} />
            <DailyMetric label="Avg Order Value"  value={dayData.aov}      target={168}  unit="$"  lowerBetter={false} />
          </div>

          {/* Score chart */}
          <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
            <div className="flex justify-between items-start mb-3.5">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A18] mb-0.5">Daily Score — March 2026</p>
                <p className="text-xs text-[#8E8C85]">Click any day to inspect its metrics</p>
              </div>
              <div className="flex gap-3 text-xs">
                {[["#2D7A50","≥75 Good"],["#A68B2B","50–74 Watch"],["#B34040","<50 Bad"]].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1 text-[#8E8C85]">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />{l}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DAILY} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                  onClick={(e: any) => { if (e?.activePayload?.[0]) setSelectedDay(e.activePayload[0].payload); }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888" }} interval={3} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#888" }} />
                  <Tooltip content={<ScoreTooltip />} />
                  <ReferenceLine y={75} stroke="#2D7A50" strokeDasharray="4 4" strokeOpacity={0.5} />
                  <ReferenceLine y={50} stroke="#A68B2B" strokeDasharray="4 4" strokeOpacity={0.5} />
                  <Line type="monotone" dataKey="score" strokeWidth={2} stroke="#888"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (cx == null || cy == null || !payload) return <circle key={Math.random()} r={0} />;
                      const isSelected = selectedDay?.day === payload.day || (!selectedDay && payload.day === TODAY.day);
                      const color = scoreColor(payload.score);
                      return <circle key={payload.day} cx={cx} cy={cy} r={isSelected ? 6 : 3} fill={color} stroke={isSelected ? "#fff" : color} strokeWidth={isSelected ? 2 : 0} />;
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {selectedDay && (
              <div className="mt-2.5 px-3 py-2 bg-[#F5F4F0] rounded-lg flex items-center justify-between">
                <span className="text-[13px] text-[#8E8C85]">Viewing <strong className="text-[#1A1A18] font-medium">{selectedDay.fullLabel}</strong> — metrics shown above</span>
                <button onClick={() => setSelectedDay(null)} className="text-xs px-2.5 py-1 rounded-lg border border-[#E8E6E1] text-[#8E8C85] cursor-pointer hover:bg-white transition-colors">Back to today</button>
              </div>
            )}
          </div>

          {/* Low-score days */}
          {(() => {
            const badDays = DAILY.filter(d => d.score < 60);
            if (badDays.length === 0) return null;
            return (
              <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 mt-3.5">
                <p className="text-[13px] font-medium text-[#1A1A18] mb-3">Days that need attention ({badDays.length})</p>
                <div className="flex flex-col gap-1.5">
                  {badDays.map(d => (
                    <div key={d.day} onClick={() => setSelectedDay(d)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#F5F4F0] cursor-pointer hover:bg-[#EEECE8] transition-colors">
                      <span className="text-[13px] text-[#1A1A18] font-medium">{d.fullLabel}</span>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-[#8E8C85]">${d.rev.toLocaleString()} rev · {d.newCust} customers · {d.convRate}% conv</span>
                        <span className="text-xs font-medium font-mono min-w-[48px] text-right" style={{ color: scoreColor(d.score) }}>{d.score}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-4 gap-2.5 mb-5">
            {KPIS.map(k => <KpiCard key={k.id} kpi={k} />)}
          </div>
          <div className="grid grid-cols-[2fr_1fr] gap-3.5 mb-3.5">
            {/* Revenue vs Costs */}
            <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
              <p className="text-[13px] font-medium text-[#1A1A18] mb-0.5">Revenue vs Costs</p>
              <p className="text-xs text-[#8E8C85] mb-3.5">6-month trend</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f7cff" stopOpacity={0.2} /><stop offset="95%" stopColor="#4f7cff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B34040" stopOpacity={0.15} /><stop offset="95%" stopColor="#B34040" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} tickFormatter={(v: any) => "$" + ((v ?? 0) / 1000).toFixed(0) + "k"} />
                    <Tooltip formatter={(v: any, n: string) => ["$" + (v ?? 0).toLocaleString(), n === "rev" ? "Revenue" : "Costs"]} />
                    <Area type="monotone" dataKey="rev"  stroke="#4f7cff" fill="url(#gRev)"  strokeWidth={2} name="rev" />
                    <Area type="monotone" dataKey="cost" stroke="#B34040" fill="url(#gCost)" strokeWidth={2} name="cost" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-2.5">
                {[["#4f7cff","Revenue"],["#B34040","Costs"]].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1.5 text-xs text-[#8E8C85]">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />{l}
                  </span>
                ))}
              </div>
            </div>
            {/* Channels pie */}
            <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
              <p className="text-[13px] font-medium text-[#1A1A18] mb-0.5">Acquisition Channels</p>
              <p className="text-xs text-[#8E8C85] mb-2.5">Traffic share</p>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={CHANNELS} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                      {CHANNELS.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => (v ?? 0) + "%"} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {CHANNELS.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-[#8E8C85]">
                      <span className="w-2 h-2 rounded-sm inline-block" style={{ background: c.color }} />{c.name}
                    </span>
                    <span className="font-medium text-[#1A1A18] font-mono">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Customer growth */}
          <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
            <p className="text-[13px] font-medium text-[#1A1A18] mb-0.5">Customer Growth</p>
            <p className="text-xs text-[#8E8C85] mb-3.5">680 → 847 customers (+24.6%)</p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gCust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D7A50" stopOpacity={0.2} /><stop offset="95%" stopColor="#2D7A50" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#888" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#888" }} domain={[600, 900]} />
                  <Tooltip formatter={(v: any) => [v ?? 0, "Customers"]} />
                  <Area type="monotone" dataKey="cust" stroke="#2D7A50" fill="url(#gCust)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── ALERTS ─────────────────────────────────────────────────────── */}
      {tab === "alerts" && (
        <div>
          <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 mb-5 flex items-center gap-5 flex-wrap">
            <div className="text-center min-w-[64px]">
              <p className="text-[32px] font-medium font-mono" style={{ color: HEALTH_COLOR }}>{HEALTH_SCORE}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: HEALTH_COLOR }}>{HEALTH_LABEL}</p>
            </div>
            <div className="border-l border-[#E8E6E1] pl-5 flex-1 min-w-[200px]">
              <p className="text-sm font-medium text-[#1A1A18] mb-1">{ALERTS.length} issue{ALERTS.length !== 1 ? "s" : ""} detected</p>
              <p className="text-[13px] text-[#8E8C85]">Click &quot;Diagnose &amp; Fix&quot; to get root cause analysis and action steps.</p>
            </div>
            <div className="flex gap-5 text-center">
              <div>
                <p className="text-xl font-medium font-mono text-[#B34040]">{ALERTS.filter(a => a.severity === "critical").length}</p>
                <p className="text-[11px] text-[#8E8C85]">Critical</p>
              </div>
              <div>
                <p className="text-xl font-medium font-mono text-[#A68B2B]">{ALERTS.filter(a => a.severity === "warning").length}</p>
                <p className="text-[11px] text-[#8E8C85]">Warning</p>
              </div>
            </div>
          </div>
          {ALERTS.length === 0
            ? <div className="bg-white border border-[#E8E6E1] rounded-xl text-center py-12"><p className="text-lg text-[#2D7A50]">✓ All clear</p></div>
            : ALERTS.map(a => <AlertCard key={a.id} alert={a} />)
          }
        </div>
      )}

      {/* ── AI INSIGHTS ────────────────────────────────────────────────── */}
      {tab === "insights" && (
        <div>
          <p className="text-sm text-[#8E8C85] mb-4">Full AI analysis — strengths, risks, and prioritized recommendations.</p>
          <button onClick={generateInsights} disabled={insightsLoading}
            className={`px-5 py-2 rounded-lg border border-[#E8E6E1] bg-white text-[#1A1A18] text-sm font-medium mb-4 ${insightsLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#F5F4F0]"} transition-colors`}>
            {insightsLoading ? "Analyzing..." : insights ? "Regenerate →" : "Generate AI Analysis →"}
          </button>
          {insightsLoading && <div className="bg-white border border-[#E8E6E1] rounded-xl text-center py-10"><p className="text-sm text-[#8E8C85]">Analyzing...</p></div>}
          {insights && <div className="bg-white border border-[#E8E6E1] rounded-xl p-5"><RichText text={insights} /></div>}
        </div>
      )}

      {/* ── ASK AI ─────────────────────────────────────────────────────── */}
      {tab === "ask" && (
        <div>
          <p className="text-sm text-[#8E8C85] mb-4">Ask any question about metrics, channels, or strategy.</p>
          {chat.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTIONS.map(q => (
                <button key={q} onClick={() => sendChat(q)}
                  className="text-[13px] px-3.5 py-1.5 rounded-full border border-[#E8E6E1] bg-[#F5F4F0] text-[#8E8C85] cursor-pointer hover:bg-[#EEECE8] transition-colors">{q}</button>
              ))}
            </div>
          )}
          <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 min-h-[260px] mb-4 flex flex-col gap-2.5">
            {chat.length === 0 && !chatLoading && <p className="text-[#8E8C85] text-sm text-center m-auto py-8">Select a suggestion or type your question</p>}
            {chat.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[88%] px-3.5 py-2.5 rounded-lg text-sm leading-relaxed ${
                  m.role === "user" ? "bg-[#1B3A2D]/10 text-[#1B3A2D]" : "bg-[#F5F4F0] text-[#1A1A18]"
                }`}>
                  {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
                </div>
              </div>
            ))}
            {chatLoading && <div><div className="inline-block px-3.5 py-2.5 rounded-lg bg-[#F5F4F0] text-sm text-[#8E8C85]">Thinking...</div></div>}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder="Ask about your business..."
              className="flex-1 text-sm px-4 py-2 rounded-lg border border-[#E8E6E1] bg-white text-[#1A1A18] placeholder-[#B5B3AD] focus:outline-none focus:border-[#1B3A2D]/40" />
            <button onClick={() => sendChat()} disabled={chatLoading || !input.trim()}
              className={`px-5 py-2 rounded-lg border border-[#E8E6E1] bg-white text-[#1A1A18] text-sm font-medium ${chatLoading || !input.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#F5F4F0]"} transition-colors`}>
              Send →
            </button>
          </div>
        </div>
      )}

      {/* ── FORECAST ───────────────────────────────────────────────────── */}
      {tab === "forecast" && (
        <div>
          <p className="text-sm text-[#8E8C85] mb-4">AI-generated Q2 2026 forecast based on 6 months of trend data.</p>
          <button onClick={generateForecast} disabled={forecastLoading}
            className={`px-5 py-2 rounded-lg border border-[#E8E6E1] bg-white text-[#1A1A18] text-sm font-medium mb-4 ${forecastLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#F5F4F0]"} transition-colors`}>
            {forecastLoading ? "Generating..." : forecast ? "Regenerate →" : "Generate Q2 Forecast →"}
          </button>
          {forecastLoading && <div className="bg-white border border-[#E8E6E1] rounded-xl text-center py-10"><p className="text-sm text-[#8E8C85]">Generating...</p></div>}
          {forecast && <div className="bg-white border border-[#E8E6E1] rounded-xl p-5"><RichText text={forecast} /></div>}
        </div>
      )}
    </div>
  );
}
