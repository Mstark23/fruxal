// =============================================================================
// src/components/notifications/NotificationBell.tsx
// =============================================================================
// Drop into your header/nav. Shows unread count badge + dropdown feed.
//
// Usage:
//   import { NotificationBell } from "@/components/notifications/NotificationBell";
//   <NotificationBell language="fr" />
// =============================================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Notification {
  id: string;
  type: string;
  title: string;
  title_fr?: string;
  body: string;
  body_fr?: string;
  urgency: string;
  obligation_slug?: string;
  category?: string;
  action_url?: string;
  action_label?: string;
  action_label_fr?: string;
  penalty_amount?: number;
  days_until?: number;
  read: boolean;
  reminder_tier?: string;
  created_at: string;
}

interface Props {
  language?: "fr" | "en";
}

export function NotificationBell({ language = "fr" }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFr = language === "fr";

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/v2/notifications?limit=15");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.items || []);
        setUnreadCount(json.data.unread_count || 0);
      }
    } catch {}
  }, []);

  // Poll every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Mark single as read
  const markRead = async (id: string) => {
    await fetch("/api/v2/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllRead = async () => {
    await fetch("/api/v2/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const urgencyStyle = (u: string) => {
    switch (u) {
      case "critical": return { bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-500" };
      case "warning": return { bg: "bg-orange-500/8", border: "border-orange-500/15", dot: "bg-orange-500" };
      case "success": return { bg: "bg-emerald-500/8", border: "border-emerald-500/15", dot: "bg-emerald-500" };
      default: return { bg: "bg-white/[0.03]", border: "border-white/[0.06]", dot: "bg-blue-500" };
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isFr ? "à l'instant" : "just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/40">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-[#12161e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
          style={{ animation: "fadeUp 0.15s ease-out" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">
              {isFr ? "Notifications" : "Notifications"}
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-white/30 font-normal">({unreadCount} {isFr ? "non lues" : "unread"})</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors">
                {isFr ? "Tout marquer lu" : "Mark all read"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-xs text-white/20">{isFr ? "Aucune notification" : "No notifications"}</p>
              </div>
            ) : (
              notifications.map((notif, i) => {
                const us = urgencyStyle(notif.urgency);
                const title = isFr ? (notif.title_fr || notif.title) : notif.title;
                const body = isFr ? (notif.body_fr || notif.body) : notif.body;
                const actionLabel = isFr ? (notif.action_label_fr || notif.action_label) : notif.action_label;

                return (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer ${!notif.read ? "bg-white/[0.02]" : ""}`}
                    onClick={() => {
                      if (!notif.read) markRead(notif.id);
                      if (notif.action_url) window.location.href = notif.action_url;
                    }}
                  >
                    <div className="flex gap-3">
                      {/* Dot */}
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read ? "bg-white/10" : us.dot}`} />

                      <div className="flex-1 min-w-0">
                        {/* Title + time */}
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-medium leading-tight ${notif.read ? "text-white/40" : "text-white/80"}`}>{title}</p>
                          <span className="text-[10px] text-white/15 shrink-0">{timeAgo(notif.created_at)}</span>
                        </div>

                        {/* Body */}
                        <p className={`text-[11px] mt-0.5 line-clamp-2 ${notif.read ? "text-white/20" : "text-white/35"}`}>{body}</p>

                        {/* Footer: penalty + action */}
                        <div className="flex items-center gap-2 mt-1.5">
                          {notif.penalty_amount && notif.penalty_amount > 0 && (
                            <span className="text-[10px] text-red-400/60">${Number(notif.penalty_amount).toLocaleString()}</span>
                          )}
                          {actionLabel && notif.action_url && (
                            <span className="text-[10px] text-emerald-400/60">{actionLabel}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/[0.06] text-center">
              <a href="/v2/notifications" className="text-[11px] text-white/25 hover:text-white/40 transition-colors">
                {isFr ? "Voir toutes les notifications" : "View all notifications"}
              </a>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
