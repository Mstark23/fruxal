"use client";

import AppShell from "@/components/AppShell";

import { useState } from "react";

export default function StatsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");

  return (
    <AppShell>
    <div className="min-h-screen bg-[#f7f8fa] flex">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-200 p-3 sticky top-0 h-screen">
        <a href="/dashboard" className="flex items-center gap-2 px-3 py-3 mb-2 border-b border-gray-100">
          <span className="text-lg font-black">💧</span>
          <span className="text-sm font-black">Stats</span>
        </a>
        {["Overview", "Revenue", "Costs", "Labor", "Collections", "Margins"].map(s => (
          <button key={s} className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 mb-0.5">{s}</button>
        ))}
      </aside>

      <main className="flex-1 p-6 max-w-[1000px]">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-black">Business Stats</h1>
          <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
            {(["week", "month", "quarter"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`text-xs font-bold px-3 py-1.5 rounded-md ${period === p ? "bg-[#1a1a2e] text-white" : "text-gray-400"}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Gamification bar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-5">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-400">Your business level</div>
              <div className="text-xl font-black text-[#ff8f00]">Level 3: Recovering</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">1,068 XP</div>
              <div className="text-xs text-gray-400">432 to Level 4</div>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-[#ff8f00] rounded-full" style={{ width: "68%" }} />
          </div>
          <div className="flex gap-2 mt-3">
            {["🔥 First Fix", "💪 $10K Saver", "📉 Trend Setter", "⚡ Quick Start", "🎯 Target Hit"].map(b => (
              <span key={b} className="text-[10px] font-bold bg-[#fff8e1] px-2 py-1 rounded-md border border-[#ffab0022]">{b}</span>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Revenue", value: "$1.2M", change: "+8%", color: "#00c853", sub: "vs last year" },
            { label: "Total costs", value: "$980K", change: "-3%", color: "#00c853", sub: "improving" },
            { label: "Net margin", value: "18.3%", change: "+2.1pp", color: "#00c853", sub: "target: 20%" },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-xs text-gray-400 mb-1">{m.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{m.value}</span>
                <span className="text-xs font-bold" style={{ color: m.color }}>{m.change}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Stat cards - MBS style */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { stat: "Food Cost %", value: "31%", target: "30%", trend: "↓", trendColor: "#00c853", history: "38% → 36% → 34% → 33% → 31.5% → 31%" },
            { stat: "Labor Cost %", value: "34.5%", target: "34%", trend: "↓", trendColor: "#00c853", history: "37% → 36% → 35.5% → 35% → 34.8% → 34.5%" },
            { stat: "Avg Ticket", value: "$42.80", target: "$45", trend: "↑", trendColor: "#00c853", history: "$38 → $39.50 → $40.20 → $41 → $42 → $42.80" },
            { stat: "Table Turns", value: "2.8", target: "3.0", trend: "→", trendColor: "#ff8f00", history: "2.6 → 2.7 → 2.7 → 2.8 → 2.8 → 2.8" },
            { stat: "Days to Collect", value: "38", target: "28", trend: "↑", trendColor: "#ff3d57", history: "28 → 30 → 32 → 34 → 36 → 38" },
            { stat: "Overtime %", value: "8.2%", target: "4%", trend: "↓", trendColor: "#00c853", history: "14% → 12% → 10% → 9.5% → 8.8% → 8.2%" },
          ].map(s => (
            <div key={s.stat} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs text-gray-400">{s.stat}</div>
                  <div className="text-2xl font-black">{s.value}</div>
                </div>
                <span className="text-lg font-bold" style={{ color: s.trendColor }}>{s.trend}</span>
              </div>
              <div className="text-[10px] text-gray-400 mb-1">Target: {s.target}</div>
              <div className="text-[10px] text-gray-300 font-mono">{s.history}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
    </AppShell>
  );
}
