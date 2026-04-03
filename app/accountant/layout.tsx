// =============================================================================
// app/accountant/layout.tsx
// Shell layout for the accountant portal — sidebar (desktop) + bottom nav (mobile).
// Skipped on /accountant/login and /accountant/verify paths.
// =============================================================================
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

function I({ d, s = 20 }: { d: string; s?: number }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}

const NAV = [
  {
    path: "/accountant/dashboard",
    icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    label: "Dashboard",
  },
  {
    path: "/accountant/client",
    icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    label: "AI Assistant",
  },
  {
    path: "/accountant/settings",
    icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
    label: "Settings",
  },
];

const NO_SHELL_PATHS = ["/accountant/login", "/accountant/verify"];

export default function AccountantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [accountant, setAccountant] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/accountant/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) setAccountant(d.accountant);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // No shell on login / verify pages
  const showShell = !NO_SHELL_PATHS.some(
    (p) => pathname === p || pathname?.startsWith(p + "/")
  );

  if (!showShell) return <>{children}</>;

  // Still loading auth — show spinner
  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" />
      </div>
    );
  }

  async function handleSignOut() {
    await fetch("/api/accountant/auth/logout", { method: "POST" });
    window.location.href = "/accountant/login";
  }

  const isActive = (path: string) =>
    pathname === path || (path !== "/accountant/dashboard" && pathname?.startsWith(path + "/"));

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex font-sans">
      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-white border-r border-[#E5E3DD] sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <div className="w-8 h-8 rounded-[8px] bg-[#1B3A2D] flex items-center justify-center">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
            </svg>
          </div>
          <div>
            <p className="font-serif text-[15px] font-semibold text-[#1A1A18] tracking-tight leading-none">
              Fruxal
            </p>
            <p className="text-[10px] text-[#8E8C85] mt-0.5">Accountant Portal</p>
          </div>
        </div>

        {/* Accountant badge */}
        {accountant && (
          <div
            className="mx-3 mb-2 px-3 py-1.5 rounded-md flex items-center gap-2"
            style={{
              background: "rgba(27,58,45,0.05)",
              border: "1px solid rgba(27,58,45,0.12)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#2D7A50" }}
            />
            <span
              className="text-[10px] font-bold tracking-wide uppercase truncate"
              style={{ color: "#1B3A2D" }}
            >
              {accountant.name}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-[9px] rounded-lg transition-all ${
                  active
                    ? "bg-[rgba(27,58,45,0.06)] text-[#1B3A2D] font-semibold"
                    : "text-[#8E8C85] hover:bg-[#FAFAF8] hover:text-[#1A1A18]"
                }`}
              >
                <span className={active ? "text-[#1B3A2D]" : "text-[#B5B3AD]"}>
                  <I d={item.icon} s={18} />
                </span>
                <span className="text-[13px] flex-1">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom — sign out + user card */}
        <div className="px-3 pb-4">
          <div className="border-t border-[#F0EFEB] pt-3 space-y-0.5">
            <button
              onClick={handleSignOut}
              className="w-full text-left flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[#8E8C85] hover:bg-[#FAFAF8] hover:text-[#1A1A18] transition"
            >
              <I
                d='<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'
                s={18}
              />
              <span className="text-[13px]">Sign out</span>
            </button>
          </div>

          {/* User card */}
          {accountant && (
            <div className="mt-3 px-3 py-2.5 bg-[#FAFAF8] rounded-lg border border-[#F0EFEB] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(27,58,45,0.08)] flex items-center justify-center text-[11px] font-bold text-[#1B3A2D]">
                {(accountant.name || "A")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A1A18] text-[11px] font-semibold truncate">
                  {accountant.name}
                </p>
                <p className="text-[#B5B3AD] text-[9px] truncate">
                  {accountant.email || "Accountant"}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-white border-b border-[#E5E3DD]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[7px] bg-[#1B3A2D] flex items-center justify-center">
                <span className="text-white font-black text-[11px]">F</span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1A1A18]">Fruxal</p>
                <p className="text-[9px] text-[#8E8C85]">Accountant Portal</p>
              </div>
            </div>
            {accountant && (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-[#8E8C85]">
                  {accountant.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-[11px] font-medium text-[#8E8C85] hover:text-[#1A1A18] transition"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {children}
      </main>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#E5E3DD] z-50">
        <div className="flex justify-around px-2 py-2">
          {NAV.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition flex-1 ${
                  active ? "text-[#1B3A2D]" : "text-[#B5B3AD]"
                }`}
              >
                <I d={item.icon} s={20} />
                <span className="text-[9px] font-semibold mt-0.5 truncate max-w-[60px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
