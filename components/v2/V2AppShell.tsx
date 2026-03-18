// =============================================================================
// V2 APP SHELL — Simplified 2-Tab Navigation
// =============================================================================
// Only two tabs: Dashboard + AI Advisor
// Clean, minimal, no sidebar clutter.
// =============================================================================

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function V2AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isChat = pathname?.includes("/chat");
  const isDashboard = pathname?.includes("/dashboard") || pathname === "/v2";

  return (
    <div className="h-screen flex flex-col bg-[#0a0e17] text-white">
      {/* ═══ TOP NAV ═══ */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-[#0a0e17]/95 backdrop-blur-xl z-50">
        {/* Logo */}
        <button
          onClick={() => router.push("/v2/dashboard")}
          className="text-lg font-black tracking-tight hover:opacity-80 transition-opacity"
        >
          💧 LEAK & GROW
        </button>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-xl p-1">
          <button
            onClick={() => router.push("/v2/dashboard")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isDashboard
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => router.push("/v2/chat")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isChat
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            💬 AI Advisor
          </button>
        </div>

        {/* Profile / Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/settings")}
            className="text-gray-400 hover:text-white transition-colors text-sm hidden sm:block"
          >
            ⚙️
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden text-gray-400 hover:text-white"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-white/5 bg-[#0d1320] px-4 py-2 space-y-1">
          <button
            onClick={() => { router.push("/v2/dashboard"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              isDashboard ? "bg-white/10 text-white" : "text-gray-400"
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => { router.push("/v2/chat"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              isChat ? "bg-white/10 text-white" : "text-gray-400"
            }`}
          >
            💬 AI Advisor
          </button>
          <button
            onClick={() => { router.push("/settings"); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400"
          >
            ⚙️ Settings
          </button>
        </div>
      )}

      {/* ═══ CONTENT ═══ */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* ═══ MOBILE BOTTOM TAB BAR ═══ */}
      <div className="sm:hidden flex border-t border-white/5 bg-[#0a0e17]">
        <button
          onClick={() => router.push("/v2/dashboard")}
          className={`flex-1 py-3 text-center ${
            isDashboard ? "text-[#00c853]" : "text-gray-500"
          }`}
        >
          <div className="text-lg">📊</div>
          <div className="text-[10px]">Dashboard</div>
        </button>
        <button
          onClick={() => router.push("/v2/chat")}
          className={`flex-1 py-3 text-center ${
            isChat ? "text-[#00c853]" : "text-gray-500"
          }`}
        >
          <div className="text-lg">💬</div>
          <div className="text-[10px]">AI Advisor</div>
        </button>
      </div>
    </div>
  );
}

export default V2AppShell;
