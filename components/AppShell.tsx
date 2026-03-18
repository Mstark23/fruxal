"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// ─── 8 items replaces 31. Intelligence Hub = one page for everything ─────────
const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard",         path: "/dashboard" },
  { icon: "⚡", label: "Fix This First",    path: "/fix-first" },
  { icon: "🔍", label: "Run Scan",          path: "/scan" },
  { icon: "🧠", label: "Intelligence Hub",   path: "/intelligence-hub", badge: "625" },
  { icon: "🏭", label: "My Industry",       path: "/industry" },
  { icon: "📊", label: "Analytics",          path: "/analytics" },
  { icon: "📈", label: "Trends",             path: "/trending" },
  { icon: "📄", label: "Reports",            path: "/exports" },
  { icon: "🔗", label: "Integrations",       path: "/integrations" },
  { icon: "🧰", label: "Tools",              path: "/tools" },
  { icon: "💸", label: "Rate Checker",       path: "/rates" },
];

interface AppShellProps {
  children: React.ReactNode;
  businessName?: string;
}

export default function AppShell({ children, businessName }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [bizName, setBizName] = useState(businessName || "");
  const [tier, setTier] = useState("");

  useEffect(() => {
    if (!bizName) {
      fetch("/api/me").then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.business?.name) setBizName(d.business.name);
          if (d?.business?.tier) setTier(d.business.tier);
        })
        .catch(() => {});
    }
  }, [bizName]);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  // ─── Collapsed sidebar ───────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="min-h-screen flex">
        <div className="w-14 bg-white border-r flex flex-col items-center py-3 shrink-0 sticky top-0 h-screen">
          <button onClick={() => setCollapsed(false)} className="text-lg mb-4 hover:scale-110 transition" title="Expand">💧</button>
          {NAV_ITEMS.map(item => (
            <button key={item.path} onClick={() => router.push(item.path)} title={item.label}
              className={`w-10 h-10 flex items-center justify-center rounded-lg mb-1 text-sm transition ${isActive(item.path) ? "bg-green-50" : "hover:bg-gray-100"}`}>
              {item.icon}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => router.push("/settings")} title="Settings" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-sm">⚙️</button>
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    );
  }

  // ─── Full sidebar ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      <div className="w-56 bg-white border-r flex flex-col shrink-0 h-screen sticky top-0">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="min-w-0">
            <button onClick={() => router.push("/dashboard")} className="text-lg font-black text-[#1a1a2e] hover:text-[#00c853] transition">💧 Fruxal</button>
            {bizName && <div className="text-xs text-gray-400 mt-0.5 truncate">{bizName}</div>}
            {tier && <div className={`text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${tier === "solo-entrepreneur" ? "bg-emerald-50 text-emerald-600" : tier === "growth-business" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>{tier === "solo-entrepreneur" ? "🧑‍💻 Solo" : tier === "growth-business" ? "🏢 Growth" : "🏪 Business"}</div>}
          </div>
          <button onClick={() => setCollapsed(true)} className="text-gray-400 hover:text-gray-600 text-xs ml-2 shrink-0">◀</button>
        </div>

        {/* Main Nav */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="space-y-0.5">
            {NAV_ITEMS.map(item => (
              <button key={item.path} onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive(item.path)
                    ? "bg-[#e8f9ef] text-[#00c853] font-bold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}>
                <span className="text-base shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-2 py-2 space-y-1">
          <button onClick={() => router.push("/personal")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-purple-600 hover:bg-purple-50 transition font-medium">
            <span>👤</span><span>Personal (Free)</span>
          </button>
          <button onClick={() => router.push("/settings")}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition text-left ${
              isActive("/settings") ? "bg-[#e8f9ef] text-[#00c853] font-bold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            <span>⚙️</span><span>Settings</span>
          </button>
          <button onClick={() => router.push("/scan")}
            className="w-full px-3 py-2 bg-[#00c853] text-white font-bold rounded-lg text-sm hover:bg-[#00b848] transition mt-1">
            🔄 Re-scan
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
