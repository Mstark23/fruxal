"use client";

interface TimelineStep {
  label: string;
  sublabel?: string;
  status: "completed" | "active" | "upcoming";
  date?: string;
}

export default function RecoveryTimeline({ steps }: { steps: TimelineStep[] }) {
  const statusIcon = (s: string) => {
    if (s === "completed") return <div className="w-6 h-6 rounded-full bg-[#2D7A50] flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>;
    if (s === "active") return <div className="w-6 h-6 rounded-full bg-[#1B3A2D] flex items-center justify-center shrink-0 animate-pulse"><div className="w-2 h-2 rounded-full bg-white"/></div>;
    return <div className="w-6 h-6 rounded-full border-2 border-[#E5E3DD] bg-white shrink-0"/>;
  };

  return (
    <div className="bg-white border border-[#E5E3DD] rounded-xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-4">Recovery Progress</p>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              {statusIcon(step.status)}
              {i < steps.length - 1 && (
                <div className="w-0.5 flex-1 min-h-[24px]" style={{ background: step.status === "completed" ? "#2D7A50" : "#E5E3DD" }} />
              )}
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <p className={`text-[13px] font-semibold ${step.status === "upcoming" ? "text-[#B5B3AD]" : "text-[#1A1A18]"}`}>{step.label}</p>
              {step.sublabel && <p className="text-[11px] text-[#8E8C85] mt-0.5">{step.sublabel}</p>}
              {step.date && <p className="text-[10px] text-[#B5B3AD] mt-0.5">{step.date}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function buildTimelineSteps(data: {
  prescanDate?: string; diagnosticDate?: string; repAssigned?: boolean; repName?: string;
  engagementStarted?: boolean; confirmedSavings?: number; totalLeaks?: number;
  documentsReceived?: number; documentsTotal?: number;
}): TimelineStep[] {
  const steps: TimelineStep[] = [];
  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : undefined;

  // Step 1: Scan
  steps.push({
    label: "Business Scan Complete",
    sublabel: "Your financial health was analyzed against industry benchmarks",
    status: data.prescanDate ? "completed" : "active",
    date: fmt(data.prescanDate),
  });

  // Step 2: Diagnostic
  steps.push({
    label: "Full Diagnostic",
    sublabel: data.totalLeaks ? `${data.totalLeaks} leaks identified` : "Deep analysis of your financials",
    status: data.diagnosticDate ? "completed" : data.prescanDate ? "active" : "upcoming",
    date: fmt(data.diagnosticDate),
  });

  // Step 3: Rep assigned
  steps.push({
    label: data.repName ? `Rep Assigned: ${data.repName}` : "Recovery Expert Assigned",
    sublabel: "Your dedicated rep handles all recovery work",
    status: data.repAssigned ? "completed" : data.diagnosticDate ? "active" : "upcoming",
  });

  // Step 4: Engagement started
  steps.push({
    label: "Recovery In Progress",
    sublabel: data.documentsTotal ? `${data.documentsReceived || 0}/${data.documentsTotal} documents received` : "Documents collected, recovery work started",
    status: data.engagementStarted ? "completed" : data.repAssigned ? "active" : "upcoming",
  });

  // Step 5: Money recovered
  steps.push({
    label: data.confirmedSavings ? `$${data.confirmedSavings.toLocaleString()} Recovered` : "Savings Confirmed",
    sublabel: data.confirmedSavings ? "Money confirmed in your account — you keep 88%" : "Confirmed savings deposited to your account",
    status: (data.confirmedSavings || 0) > 0 ? "completed" : data.engagementStarted ? "active" : "upcoming",
  });

  return steps;
}
