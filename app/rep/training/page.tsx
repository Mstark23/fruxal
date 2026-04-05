"use client";
import { useRouter } from "next/navigation";

const MODULES = [
  {
    step: 1,
    title: "Know the Product",
    subtitle: "What Fruxal does, how the model works, what you're selling",
    href: "/rep/training/product",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    color: "#1B3A2D",
    bg: "rgba(27,58,45,0.06)",
    tag: "Start here",
    tagColor: "#2D7A50",
  },
  {
    step: 2,
    title: "Daily Structure",
    subtitle: "Hour-by-hour schedule, daily targets, weekly rhythm",
    href: "/rep/training/daily",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "#C4841D",
    bg: "rgba(196,132,29,0.06)",
    tag: "Your routine",
    tagColor: "#C4841D",
  },
  {
    step: 3,
    title: "Sales Methodology",
    subtitle: "Straight Line Persuasion — the Three 10s, looping, tonal patterns",
    href: "/rep/training/learn",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "#0369a1",
    bg: "rgba(3,105,161,0.06)",
    tag: "Core system",
    tagColor: "#0369a1",
  },
  {
    step: 4,
    title: "Playbook",
    subtitle: "Scenario-by-scenario guides — cold, referral, inbound, post-prescan, close",
    href: "/rep/training/playbook",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
    tag: "Scenarios",
    tagColor: "#7c3aed",
  },
  {
    step: 5,
    title: "Scripts Library",
    subtitle: "30+ ready-to-use scripts — cold call, email, voicemail, objections, close",
    href: "/rep/scripts",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    color: "#1B3A2D",
    bg: "rgba(27,58,45,0.06)",
    tag: "Copy & use",
    tagColor: "#1B3A2D",
  },
  {
    step: 6,
    title: "AI Drill",
    subtitle: "Practice objection handling against AI prospects — get scored on SLP mastery",
    href: "/rep/training/drill",
    icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "#B34040",
    bg: "rgba(179,64,64,0.06)",
    tag: "Practice",
    tagColor: "#B34040",
  },
];

export default function TrainingHub() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push("/rep/dashboard")}
            className="text-[11px] text-[#8E8C85] hover:text-[#1B3A2D] mb-3 flex items-center gap-1 transition">
            ← Dashboard
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1B3A2D] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A18]">Rep Training System</h1>
              <p className="text-[12px] text-[#8E8C85]">Follow the modules in order. Master each before moving to the next.</p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1 mb-6">
          {MODULES.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-[#E5E3DD]">
              <div className="h-full rounded-full bg-[#1B3A2D]" style={{ width: "100%" }} />
            </div>
          ))}
        </div>

        {/* Module cards */}
        <div className="space-y-3">
          {MODULES.map((mod) => (
            <button key={mod.step}
              onClick={() => router.push(mod.href)}
              className="w-full bg-white border border-[#E5E3DD] rounded-xl p-5 text-left hover:border-[#1B3A2D]/30 hover:shadow-md transition-all group"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="flex items-start gap-4">
                {/* Step number */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-bold"
                  style={{ background: mod.bg, color: mod.color }}>
                  {mod.step}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-bold text-[#1A1A18] group-hover:text-[#1B3A2D] transition">{mod.title}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: mod.bg, color: mod.tagColor }}>
                      {mod.tag}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#8E8C85]">{mod.subtitle}</p>
                </div>

                {/* Arrow */}
                <div className="shrink-0 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B5B3AD" strokeWidth="2" strokeLinecap="round" className="group-hover:stroke-[#1B3A2D] transition">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom tip */}
        <div className="mt-8 px-5 py-4 rounded-xl border border-[#E5E3DD] bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-[12px] font-bold text-[#1A1A18] mb-1">New rep? Start with Module 1.</p>
              <p className="text-[11px] text-[#8E8C85] leading-relaxed">
                Know the product first, then learn the daily routine, then master the sales system. Scripts and drills come last — they're tools you use after you understand the foundation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
