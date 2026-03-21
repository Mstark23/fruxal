"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecoveryPage() {
  const router = useRouter();
  const [ctx, setCtx] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      setCtx(d);
      if (d.business?.id) {
        fetch(`/api/timeline?businessId=${d.business.id}`).then(r => r.json())
          .then(t => { setTimeline(t.timeline || []); setStats(t.stats || {}); setLoading(false); })
          .catch(() => setLoading(false));
      }
    }).catch(() => router.push("/login"));
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center text-gray-400">Loading...</div>;

  const fixEvents = timeline.filter(e => e.type === "fix");
  const maxRunning = Math.max(...fixEvents.map(e => e.runningTotal ?? 0), 1);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-[#1a1a2e]">📈 Recovery Tracker</h1>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-xs text-gray-400">Total Found</div>
            <div className="text-xl font-black text-[#ff3d57]">${(stats.totalFound ?? 0).toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-xs text-gray-400">Total Saved</div>
            <div className="text-xl font-black text-[#00c853]">${(stats.totalSaved ?? 0).toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-xs text-gray-400">Fix Rate</div>
            <div className="text-xl font-black text-[#2979ff]">{stats.fixRate ?? 0}%</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-xs text-gray-400">Days Active</div>
            <div className="text-xl font-black text-[#7c4dff]">{stats.daysActive ?? 0}</div>
          </div>
        </div>

        {/* Savings growth chart */}
        {fixEvents.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <div className="text-sm font-bold mb-4">Cumulative Savings</div>
            <div className="flex items-end gap-1 h-32">
              {fixEvents.reverse().map((e, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end">
                  <div className="w-full bg-[#00c853] rounded-t-md min-h-[4px]"
                    style={{ height: Math.max(4, ((e.runningTotal ?? 0) / maxRunning) * 100) + "%" }} />
                  <div className="text-[9px] text-gray-400 mt-1 truncate w-full text-center">
                    {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>$0</span>
              <span>${(maxRunning ?? 0).toLocaleString()}/yr saved</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="text-sm font-bold mb-4">Activity Timeline</div>
          {timeline.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm">No activity yet. Run your first scan to start tracking.</div>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-4">
                {timeline.map((event, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 z-10 ${
                      event.type === "fix" ? "bg-green-50" :
                      event.type === "scan" ? "bg-blue-50" : "bg-red-50"
                    }`}>
                      {event.icon}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-[#1a1a2e]">{event.title}</div>
                        <div className={`text-xs font-bold ${
                          event.type === "fix" ? "text-[#00c853]" :
                          event.type === "scan" ? "text-[#2979ff]" : "text-[#ff3d57]"
                        }`}>
                          {event.type === "fix" ? "+" : ""}${(event.amount ?? 0).toLocaleString()}/yr
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{event.detail}</div>
                      <div className="text-xs text-gray-300 mt-1">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
