"use client";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { path: "/admin/overview",          label: "Overview" },
  { path: "/admin/users",             label: "Users" },
  { path: "/admin/tier3",             label: "Tier 3 Pipeline" },
  { path: "/admin/tier3/engagements", label: "Engagements" },
  { path: "/admin/enterprise",        label: "Enterprise" },
  { path: "/admin/diagnostic-test",   label: "Engine Tester" },
  { path: "/admin/tier3/reps",        label: "Reps" },
  { path: "/admin/accountants",        label: "Accountants" },
  { path: "/admin/invoices",           label: "Invoices" },
  { path: "/admin/settings",          label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();
  return (
    <div className="flex gap-6 border-b border-[#EEECE8] mb-6 overflow-x-auto">
      {TABS.map(tab => {
        let active = pathname === tab.path;
        if (!active && tab.path === "/admin/tier3/reps")
          active = pathname?.startsWith("/admin/tier3/reps") || false;
        else if (!active && tab.path === "/admin/tier3/engagements")
          active = (pathname?.startsWith("/admin/tier3/engagements") && !pathname?.startsWith("/admin/tier3/reps")) || false;
        else if (!active && tab.path === "/admin/tier3")
          active = (pathname?.startsWith("/admin/tier3") && !pathname?.startsWith("/admin/tier3/engagements") && !pathname?.startsWith("/admin/tier3/reps") && !pathname?.startsWith("/admin/tier3/diagnostic")) || false;
        else if (!active && tab.path === "/admin/accountants")
          active = pathname?.startsWith("/admin/accountants") || false;
        else if (!active && tab.path === "/admin/invoices")
          active = pathname?.startsWith("/admin/invoices") || false;
        else if (!active)
          active = pathname?.startsWith(tab.path + "/") || false;

        const disabled = tab.path === "/admin/settings";
        return (
          <button key={tab.path} onClick={() => !disabled && router.push(tab.path)} disabled={disabled}
            className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              active    ? "text-[#1A1A18] font-semibold border-b-2 border-[#1B3A2D]"
              : disabled ? "text-[#B5B3AD] cursor-not-allowed"
              : "text-[#8E8C85] hover:text-[#56554F]"
            }`}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
