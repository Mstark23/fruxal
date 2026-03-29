"use client";
// /v2/notifications — full notification history
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 1)  return "Just now";
  if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d/60)}h ago`;
  return `${Math.floor(d/1440)}d ago`;
}

const PRIORITY_STYLE: Record<string, { dot: string }> = {
  critical:    { dot: "#B34040" },
  alert:       { dot: "#C4841D" },
  celebration: { dot: "#2D7A50" },
  report:      { dot: "#0369a1" },
  nudge:       { dot: "#8E8C85" },
  routine:     { dot: "#B5B3AD" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v2/notifications?limit=50")
      .then(r => r.json())
      .then(d => setNotifs(d.notifications || []))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await fetch("/api/v2/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  }

  async function markAllRead() {
    await Promise.all(notifs.filter(n => !n.readAt).map(n => markRead(n.id)));
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[640px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => router.push("/v2/dashboard")}
              className="text-[11px] text-ink-faint hover:text-ink mb-1 block">← Dashboard</button>
            <h1 className="text-[20px] font-bold text-ink">Notifications</h1>
          </div>
          {notifs.some(n => !n.readAt) && (
            <button onClick={markAllRead}
              className="text-[11px] font-semibold text-brand hover:underline">
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-faint text-[13px]">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifs.map((n: any) => {
              const ps = PRIORITY_STYLE[n.priority] || PRIORITY_STYLE.routine;
              return (
                <button key={n.id} onClick={() => { markRead(n.id); if (n.ctaUrl) router.push(n.ctaUrl); }}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all ${
                    !n.readAt ? "bg-white border border-border-light" : "hover:bg-white/50"
                  }`}
                  style={!n.readAt ? { boxShadow: "0 1px 3px rgba(0,0,0,0.03)" } : {}}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                    style={{ background: n.readAt ? "#E5E3DD" : ps.dot }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-snug ${!n.readAt ? "font-semibold text-ink" : "text-ink-muted"}`}>
                      {n.title}
                    </p>
                    {n.body && <p className="text-[11px] text-ink-faint mt-0.5 leading-relaxed">{n.body}</p>}
                  </div>
                  <span className="text-[10px] text-ink-faint shrink-0 mt-0.5">{relDate(n.createdAt || n.sentAt || "")}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
