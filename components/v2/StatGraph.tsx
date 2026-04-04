"use client";
// =============================================================================
// components/v2/StatGraph.tsx
// Reusable stat card with sparkline graph and condition badge.
// Exports: StatGraph (single card) and StatGraphGrid (responsive grid wrapper).
// Raw SVG sparkline — no chart library, fast and lightweight.
// =============================================================================

import { useState, useMemo } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface StatPoint {
  period: string;
  value: number;
}

interface StatCondition {
  condition: string;
  label: string;
  color: string;
  bg: string;
  formula: string;
  trend: string;
  delta: number;
  deltaLabel: string;
}

export interface StatGraphProps {
  label: string;
  points: StatPoint[];
  unit: "number" | "currency" | "percent" | "days";
  higherIsBetter?: boolean;
  condition: StatCondition;
}

// ── Formatters ───────────────────────────────────────────────────────────────

function fmtValue(value: number, unit: StatGraphProps["unit"]): string {
  switch (unit) {
    case "currency":
      if (value >= 1_000_000) return "$" + (value / 1_000_000).toFixed(1) + "M";
      if (value >= 1_000) return "$" + (value / 1_000).toFixed(1) + "K";
      return "$" + Math.round(value).toLocaleString();
    case "percent":
      return value.toFixed(0) + "%";
    case "days":
      return value.toFixed(0) + "d";
    default:
      return value >= 1_000 ? (value / 1_000).toFixed(1) + "K" : value.toFixed(0);
  }
}

function fmtDelta(delta: number, unit: StatGraphProps["unit"]): string {
  const sign = delta >= 0 ? "+" : "";
  switch (unit) {
    case "currency":
      if (Math.abs(delta) >= 1_000) return sign + "$" + (delta / 1_000).toFixed(1) + "K";
      return sign + "$" + Math.round(delta);
    case "percent":
      return sign + delta.toFixed(1) + "%";
    case "days":
      return sign + delta.toFixed(0) + "d";
    default:
      return sign + delta.toFixed(0);
  }
}

// ── Sparkline SVG ────────────────────────────────────────────────────────────

const SPARK_W = 120;
const SPARK_H = 40;
const SPARK_PAD = 4;

function Sparkline({ points, color }: { points: StatPoint[]; color: string }) {
  const polyline = useMemo(() => {
    if (points.length < 2) return "";
    const vals = points.map((p) => p.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const usableW = SPARK_W - SPARK_PAD * 2;
    const usableH = SPARK_H - SPARK_PAD * 2;
    return points
      .map((p, i) => {
        const x = SPARK_PAD + (i / (points.length - 1)) * usableW;
        const y = SPARK_PAD + usableH - ((p.value - min) / range) * usableH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [points]);

  if (points.length < 2) {
    return (
      <svg width={SPARK_W} height={SPARK_H} className="flex-shrink-0">
        <text x={SPARK_W / 2} y={SPARK_H / 2} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#999">
          No data
        </text>
      </svg>
    );
  }

  // Gradient fill under the line
  const gradId = `sg-${color.replace("#", "")}`;
  const firstPt = polyline.split(" ")[0];
  const lastPt = polyline.split(" ").at(-1)!;
  const fillPath = `M ${firstPt} ${polyline.split(" ").slice(1).map((p) => `L ${p}`).join(" ")} L ${lastPt.split(",")[0]},${SPARK_H} L ${firstPt.split(",")[0]},${SPARK_H} Z`;

  return (
    <svg width={SPARK_W} height={SPARK_H} className="flex-shrink-0" viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot on last point */}
      {(() => {
        const last = polyline.split(" ").at(-1)!;
        const [cx, cy] = last.split(",");
        return <circle cx={cx} cy={cy} r="3" fill={color} />;
      })()}
    </svg>
  );
}

// ── StatGraph Card ───────────────────────────────────────────────────────────

export default function StatGraph({ label, points, unit, higherIsBetter = true, condition }: StatGraphProps) {
  const [expanded, setExpanded] = useState(false);

  const currentValue = points.length > 0 ? points[points.length - 1].value : 0;

  // Delta direction & color
  const deltaUp = condition.delta >= 0;
  const deltaPositive = higherIsBetter ? deltaUp : !deltaUp;
  const deltaColor = deltaPositive ? "#2D7A50" : "#C4841D";
  const deltaArrow = deltaUp ? "\u2191" : "\u2193";

  // Sparkline color matches condition or defaults to brand green
  const sparkColor = condition.color || "#2D7A50";

  return (
    <div
      className="bg-white border border-[#E5E3DD] rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setExpanded((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setExpanded((v) => !v);
      }}
    >
      {/* Top row: label + sparkline */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Label */}
          <p className="text-[10px] uppercase tracking-wider text-[#1A1A18]/50 font-medium mb-1">
            {label}
          </p>

          {/* Value + delta */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold text-[#1A1A18] leading-none">
              {fmtValue(currentValue, unit)}
            </span>
            {condition.delta !== 0 && (
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{ color: deltaColor, backgroundColor: deltaColor + "15" }}
              >
                {fmtDelta(condition.delta, unit)} {deltaArrow}
              </span>
            )}
          </div>

          {/* Condition badge */}
          <span
            className="inline-block text-[10px] font-semibold uppercase tracking-wide mt-1.5 px-2 py-0.5 rounded-full"
            style={{ color: condition.color, backgroundColor: condition.bg }}
          >
            {condition.label}
          </span>
        </div>

        {/* Sparkline */}
        <Sparkline points={points} color={sparkColor} />
      </div>

      {/* Expanded: formula + trend */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#E5E3DD] text-xs text-[#1A1A18]/60 space-y-1 animate-fadeIn">
          <p>
            <span className="font-medium text-[#1A1A18]/80">Formula:</span> {condition.formula}
          </p>
          <p>
            <span className="font-medium text-[#1A1A18]/80">Trend:</span> {condition.trend}
          </p>
          {condition.deltaLabel && (
            <p>
              <span className="font-medium text-[#1A1A18]/80">Delta:</span> {condition.deltaLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── StatGraphGrid ────────────────────────────────────────────────────────────

export interface StatGraphGridProps {
  stats: StatGraphProps[];
}

export function StatGraphGrid({ stats }: StatGraphGridProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {stats.map((s, i) => (
        <StatGraph key={s.label + "-" + i} {...s} />
      ))}
    </div>
  );
}
