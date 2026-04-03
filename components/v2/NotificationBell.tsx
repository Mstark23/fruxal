"use client";
import { useState, useEffect, useRef } from "react";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: "saving" | "deadline" | "document" | "anomaly" | "rep" | "system";
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, { bg: string; color: string; icon: string }> = {
  saving:   { bg: "rgba(45,122,80,0.1)", color: "#2D7A50", icon: "$" },
  deadline: { bg: "rgba(179,64,64,0.1)", color: "#B34040", icon: "!" },
  document: { bg: "rgba(3,105,161,0.1)", color: "#0369a1", icon: "D" },
  anomaly:  { bg: "rgba(196,132,29,0.1)", color: "#C4841D", icon: "~" },
  rep:      { bg: "rgba(27,58,45,0.1)", color: "#1B3A2D", icon: "R" },
  system:   { bg: "rgba(142,140,133,0.1)", color: "#8E8C85", icon: "i" },
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetch("/api/v2/notifications?limit=15")
      .then(r => r.json())
      .then(d => { if (d.notifications) setNotifications(d.notifications); })
      .catch(() => {});
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    setLoading(true);
    await fetch("/api/v2/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAllRead: true }) }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setLoading(false);
  };

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F0EFEB] transition">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#56554F" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#B34040] text-white text-[8px] font-black flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-[340px] bg-white border border-[#E5E3DD] rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div className="px-4 py-3 border-b border-[#E5E3DD] flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#1A1A18]">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} disabled={loading}
                className="text-[10px] font-semibold text-[#1B3A2D] hover:underline disabled:opacity-40">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[12px] text-[#8E8C85]">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const t = TYPE_ICON[n.type] || TYPE_ICON.system;
                return (
                  <div key={n.id} className={`px-4 py-3 border-b border-[#F0EFEB] last:border-0 ${!n.read ? "bg-[#F0FBF5]/30" : ""}`}>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5"
                        style={{ background: t.bg, color: t.color }}>
                        {t.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#1A1A18]">{n.title}</p>
                        <p className="text-[11px] text-[#8E8C85] mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[9px] text-[#B5B3AD] mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-[#2D7A50] shrink-0 mt-2" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
