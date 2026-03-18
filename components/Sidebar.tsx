"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

// Same clean 8-item nav used in AppShell
const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard",         path: "/dashboard" },
  { icon: "🔍", label: "Run Scan",          path: "/scan" },
  { icon: "🧠", label: "Intelligence Hub",   path: "/intelligence-hub", badge: "625" },
  { icon: "🏭", label: "Industries",         path: "/industry" },
  { icon: "📊", label: "Analytics",          path: "/analytics" },
  { icon: "📈", label: "Trends",             path: "/trending" },
  { icon: "📄", label: "Reports",            path: "/exports" },
  { icon: "🔗", label: "Integrations",       path: "/integrations" },
];

interface SidebarProps {
  businessName?: string;
  collapsed?: boolean;
}

export default function Sidebar({ businessName, collapsed: initialCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed ?? false);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  if (collapsed) {
    return (
      <div className="w-14 bg-white border-r flex flex-col items-center py-3 shrink-0">
        <button onClick={() => setCollapsed(false)} className="text-lg mb-4 hover:scale-110 transition">💧</button>
        {NAV_ITEMS.map(item => (
          <button key={item.path} onClick={() => router.push(item.path)} title={item.label}
            className={`w-10 h-10 flex items-center justify-center rounded-lg mb-1 text-base transition ${isActive(item.path) ? "bg-green-50" : "hover:bg-gray-100"}`}>
            {item.icon}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={() => router.push("/settings")} title="Settings" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-base">⚙️</button>
      </div>
    );
  }

  return (
    <div className="w-56 bg-white border-r flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="text-lg font-black text-[#1a1a2e]">💧 Fruxal</div>
          {businessName && <div className="text-xs text-gray-400 mt-0.5 truncate">{businessName}</div>}
        </div>
        <button onClick={() => setCollapsed(true)} className="text-gray-400 hover:text-gray-600 text-xs">◀</button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button key={item.path} onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                isActive(item.path) ? "bg-[#e8f9ef] text-[#00c853] font-bold" : "text-gray-600 hover:bg-gray-100"
              }`}>
              <span className="text-sm shrink-0">{item.icon}</span>
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
  );
}
