"use client";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

function I({d,s=20}:{d:string;s?:number}){
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:d}}/>
}

// ── Nav definitions ───────────────────────────────────────────────────────────
const NAV_STANDARD = [
  { path:"/v2/dashboard",   icon:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', label:"Dashboard" },
  { path:"/v2/obligations", icon:'<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>', label:"Obligations" },
  { path:"/v2/leaks",       icon:'<path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>', label:"Leaks" },
  { path:"/v2/diagnostic",  icon:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>', label:"Diagnostic" },
  { path:"/v2/programs",    icon:'<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>', label:"Programs" },
  { path:"/v2/chat",        icon:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>', label:"AI Chat" },
];

// Enterprise nav — Leaks replaced by Run Intake (T2/financials upload CTA)
const NAV_ENTERPRISE = [
  { path:"/v2/dashboard/enterprise", icon:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', label:"Dashboard" },
  { path:"/v2/diagnostic/intake",    icon:'<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>', label:"Run Intake", cta:true },
  { path:"/v2/obligations",          icon:'<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>', label:"Obligations" },
  { path:"/v2/diagnostic",           icon:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>', label:"Diagnostic" },
  { path:"/v2/programs",             icon:'<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>', label:"Programs" },
  { path:"/v2/chat",                 icon:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>', label:"AI Chat" },
];

// Routes that always force enterprise nav regardless of pathname
const ENTERPRISE_PATHS = ["/v2/dashboard/enterprise", "/v2/diagnostic/intake", "/v2/diagnostic/run"];
// Routes where enterprise nav stays active (user is navigating around while enterprise)
const ALL_SHELL = ["/v2/dashboard", "/v2/obligations", "/v2/leaks", "/v2/diagnostic", "/v2/programs", "/v2/settings", "/v2/chat", "/v2/integrations"];

export default function V2Layout({children}:{children:React.ReactNode}) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  // ── Enterprise tier persisted in localStorage so nav stays consistent ────
  // When enterprise dashboard loads it calls: localStorage.setItem("fruxal_tier","enterprise")
  // Layout reads it here so ALL pages show enterprise nav for enterprise users
  // Start with false to match SSR, then hydrate from localStorage in useEffect
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);

  // Hydrate tier from localStorage after mount (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const t = localStorage.getItem("fruxal_tier");
      setIsEnterprise(t === "enterprise");
      setIsBusiness(t === "business");
    } catch {}
  }, []);

  useEffect(() => {
    const onEnterprisePath = ENTERPRISE_PATHS.some(p => pathname === p || pathname?.startsWith(p + "/"));
    const onBusinessPath   = pathname === "/v2/dashboard/business";
    if (onEnterprisePath) {
      setIsEnterprise(true);
      setIsBusiness(false);
      try { localStorage.setItem("fruxal_tier", "enterprise"); } catch {}
    } else if (onBusinessPath) {
      setIsBusiness(true);
      setIsEnterprise(false);
      try { localStorage.setItem("fruxal_tier", "business"); } catch {}
    } else {
      try {
        const stored = localStorage.getItem("fruxal_tier");
        if (stored === "enterprise") { setIsEnterprise(true); setIsBusiness(false); }
        else if (stored === "business") { setIsBusiness(true); setIsEnterprise(false); }
        else { setIsEnterprise(false); setIsBusiness(false); }
      } catch {}
    }
  }, [pathname]);

  // Paths that render standalone without the sidebar shell
  const NO_SHELL = ["/v2/diagnostic/public-company"];
  const showShell = !NO_SHELL.some(p => pathname?.startsWith(p)) && ALL_SHELL.some(r => pathname === r || pathname?.startsWith(r + "/"));
  const normPath  = pathname === "/dashboard" ? "/v2/dashboard" : pathname;
  // Business nav — same as standard but dashboard link goes to /business
  const NAV_BUSINESS = NAV_STANDARD.map(item =>
    item.path === "/v2/dashboard" ? { ...item, path: "/v2/dashboard/business" } : item
  );
  const NAV     = isEnterprise ? NAV_ENTERPRISE : isBusiness ? NAV_BUSINESS : NAV_STANDARD;
  const navRoot = isEnterprise ? "/v2/dashboard/enterprise" : isBusiness ? "/v2/dashboard/business" : "/v2/dashboard";

  if (!showShell) return <>{children}</>;

  // ── Shared NavButton renderer ─────────────────────────────────────────────
  function NavItem({ item }: { item: typeof NAV[0] }) {
    const active = normPath === item.path || (item.path !== navRoot && normPath?.startsWith(item.path + "/"))
                || (item.path === navRoot && normPath === navRoot);

    if ((item as any).cta) {
      return (
        <button onClick={() => router.push(item.path)}
          className={`w-full text-left flex items-center gap-2.5 px-3 py-[9px] rounded-sm transition-all mt-1 mb-1 ${
            active ? "bg-brand text-white" : "text-brand hover:bg-brand/5"
          }`}
          style={active ? {} : { border: "1px solid rgba(27,58,45,0.2)" }}>
          <span className={active ? "text-white" : "text-brand"}><I d={item.icon} s={16}/></span>
          <span className="text-[12px] font-semibold">{item.label}</span>
          {!active && <span className="ml-auto text-[8px] font-bold uppercase tracking-wide" style={{ color: "rgba(27,58,45,0.45)" }}>T2 ↑</span>}
        </button>
      );
    }

    return (
      <button onClick={() => router.push(item.path)}
        className={`w-full text-left flex items-center gap-2.5 px-3 py-[9px] rounded-sm transition-all ${
          active ? "bg-brand-soft text-brand font-semibold" : "text-ink-secondary hover:bg-bg-warm hover:text-ink"
        }`}>
        <span className={active ? "text-brand" : "text-ink-muted"}><I d={item.icon} s={18}/></span>
        <span className="text-[13px]">{item.label}</span>
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex font-sans">

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-white border-r border-border sticky top-0 h-screen">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <div className="w-8 h-8 rounded-[8px] bg-brand flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/>
            </svg>
          </div>
          <div>
            <p className="font-serif text-[15px] font-semibold text-ink tracking-tight leading-none">Fruxal</p>
            <p className="text-[10px] text-ink-faint mt-0.5">Business Intelligence</p>
          </div>
        </div>

        {/* Enterprise tier badge */}
        {isEnterprise && (
          <div className="mx-3 mb-2 px-3 py-1.5 rounded-md flex items-center gap-2"
            style={{ background: "rgba(27,58,45,0.05)", border: "1px solid rgba(27,58,45,0.12)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1B3A2D" }} />
            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#1B3A2D" }}>Enterprise</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => <NavItem key={item.path} item={item} />)}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4">
          <div className="border-t border-border-light pt-3 space-y-0.5">
            <button onClick={() => router.push("/v2/settings")}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-[9px] rounded-sm transition-all ${
                normPath?.startsWith("/v2/settings") ? "bg-brand-soft text-brand font-semibold" : "text-ink-muted hover:bg-bg-warm hover:text-ink-secondary"
              }`}>
              <I d='<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' s={18}/>
              <span className="text-[13px]">Settings</span>
            </button>
            <button onClick={logout}
              className="w-full text-left flex items-center gap-2.5 px-3 py-[9px] rounded-sm text-ink-muted hover:bg-bg-warm hover:text-ink-secondary transition">
              <I d='<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>' s={18}/>
              <span className="text-[13px]">Sign out</span>
            </button>
          </div>

          {/* User card */}
          <div className="mt-3 px-3 py-2.5 bg-bg rounded-sm border border-border-light flex items-center gap-2.5">
            {isLoading ? (
              <div className="w-8 h-8 rounded-sm bg-border-light animate-pulse"/>
            ) : user?.image ? (
              <img src={user.image} alt="" className="w-8 h-8 rounded-sm object-cover"/>
            ) : (
              <div className="w-8 h-8 rounded-sm bg-brand-soft flex items-center justify-center text-[11px] font-bold text-brand">
                {(user?.name||user?.email||"?")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <><div className="h-2.5 w-20 bg-border-light rounded animate-pulse mb-1"/><div className="h-2 w-28 bg-bg-section rounded animate-pulse"/></>
              ) : (
                <><p className="text-ink text-[11px] font-semibold truncate">{user?.name||user?.email}</p><p className="text-ink-faint text-[9px] truncate">{user?.email}</p></>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border-light z-50">
        <div className="flex justify-around px-2 py-2">
          {NAV.map(item => {
            const active = normPath === item.path
              || (item.path !== navRoot && normPath?.startsWith(item.path + "/"))
              || (item.path === navRoot && normPath === navRoot);
            return (
              <button key={item.path} onClick={() => router.push(item.path)}
                className={`flex flex-col items-center py-1 px-2 rounded-sm transition ${
                  active ? "text-brand" : (item as any).cta ? "text-brand/60" : "text-ink-faint"
                }`}>
                <I d={item.icon} s={18}/>
                <span className="text-[8px] font-semibold mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
