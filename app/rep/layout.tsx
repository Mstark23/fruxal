"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function I({ d, s = 20 }: { d: string; s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />;
}

const NAV = [
  { path: "/rep/dashboard", icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', label: "Dashboard" },
  { path: "/rep/training", icon: '<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>', label: "Training" },
  { path: "/rep/scripts", icon: '<path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>', label: "Scripts" },
  { path: "/rep/commissions", icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>', label: "Commissions" },
];

// Pages that don't show the shell (login, verify, onboarding)
const NO_SHELL = ["/rep/login", "/rep/verify", "/rep/onboarding"];

export default function RepLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [repName, setRepName] = useState("");

  const showShell = !NO_SHELL.some(p => pathname === p || pathname?.startsWith(p + "/"));

  useEffect(() => {
    if (!showShell) return;
    fetch("/api/rep/me")
      .then(r => r.json())
      .then(d => { if (d.success && d.rep?.name) setRepName(d.rep.name); })
      .catch(() => {});
  }, [showShell]);

  if (!showShell) return <>{children}</>;

  const normPath = pathname || "";

  // Mobile bottom nav — 4 most important items
  const MOBILE_NAV = NAV;

  function NavItem({ item }: { item: typeof NAV[0] }) {
    const active = normPath === item.path || normPath?.startsWith(item.path + "/");
    return (
      <button onClick={() => router.push(item.path)}
        className={`w-full text-left flex items-center gap-2.5 px-3 py-[9px] rounded-sm transition-all ${
          active ? "bg-[#1B3A2D]/8 text-[#1B3A2D] font-semibold" : "text-[#8E8C85] hover:bg-[#F0EFEB] hover:text-[#1A1A18]"
        }`}>
        <span className={active ? "text-[#1B3A2D]" : "text-[#B5B3AD]"}><I d={item.icon} s={18} /></span>
        <span className="text-[13px] flex-1">{item.label}</span>
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex font-sans">

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-white border-r border-[#E5E3DD] sticky top-0 h-screen">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <div className="w-8 h-8 rounded-[8px] bg-[#1B3A2D] flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
            </svg>
          </div>
          <div>
            <p className="font-serif text-[15px] font-semibold text-[#1A1A18] tracking-tight leading-none">Fruxal</p>
            <p className="text-[10px] text-[#8E8C85] mt-0.5">Rep Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => <NavItem key={item.path} item={item} />)}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4">
          <div className="border-t border-[#F0EFEB] pt-3 space-y-0.5">
            <button onClick={() => {
              fetch("/api/rep/auth/quick-login", { method: "POST", body: JSON.stringify({ action: "logout" }) })
                .finally(() => { document.cookie = "fruxal_rep_session=; Max-Age=0; Path=/"; window.location.href = "/rep/login"; });
            }}
              className="w-full text-left flex items-center gap-2.5 px-3 py-[9px] rounded-sm text-[#8E8C85] hover:bg-[#F0EFEB] hover:text-[#56554F] transition">
              <I d='<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>' s={18} />
              <span className="text-[13px]">Sign out</span>
            </button>
          </div>

          {/* Rep card */}
          {repName && (
            <div className="mt-3 px-3 py-2.5 bg-[#FAFAF8] rounded-sm border border-[#F0EFEB] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-[#1B3A2D]/8 flex items-center justify-center text-[11px] font-bold text-[#1B3A2D]">
                {repName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A1A18] text-[11px] font-semibold truncate">{repName}</p>
                <p className="text-[#8E8C85] text-[9px]">Recovery Advisor</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#E5E3DD] z-50">
        <div className="flex justify-around px-2 py-2">
          {MOBILE_NAV.map(item => {
            const active = normPath === item.path || normPath?.startsWith(item.path + "/");
            return (
              <button key={item.path} onClick={() => router.push(item.path)}
                className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition flex-1 ${
                  active ? "text-[#1B3A2D]" : "text-[#B5B3AD]"
                }`}>
                <I d={item.icon} s={20} />
                <span className="text-[9px] font-semibold mt-0.5 truncate max-w-[52px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
