// =============================================================================
// /v2/recovery — Customer recovery timeline
// Shows rep-confirmed savings, timeline, and current engagement status
// =============================================================================
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

function fmt(n: number) { return "$" + Math.round(n).toLocaleString(); }
function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

const STAGE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  lead:             { label: "New Lead",        color: "#8E8C85", bg: "rgba(142,140,133,0.1)" },
  contacted:        { label: "Contacted",       color: "#C4841D", bg: "rgba(196,132,29,0.1)"  },
  called:           { label: "Call Completed",  color: "#C4841D", bg: "rgba(196,132,29,0.1)"  },
  diagnostic_sent:  { label: "Diagnostic Sent", color: "#1B3A2D", bg: "rgba(27,58,45,0.08)"   },
  agreement_out:    { label: "Agreement Out",   color: "#1B3A2D", bg: "rgba(27,58,45,0.08)"   },
  signed:           { label: "Signed",          color: "#2D7A50", bg: "rgba(45,122,80,0.1)"   },
  in_engagement:    { label: "In Engagement",   color: "#2D7A50", bg: "rgba(45,122,80,0.1)"   },
  recovery_tracking:{ label: "Recovering",      color: "#2D7A50", bg: "rgba(45,122,80,0.1)"   },
  fee_collected:    { label: "Complete",        color: "#2D7A50", bg: "rgba(45,122,80,0.08)"  },
};

export default function RecoveryPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v2/recovery/timeline")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.success) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="max-w-[600px] mx-auto px-6 py-10 text-center">
      <p className="text-ink-secondary text-[14px]">No recovery data yet. Once your rep confirms savings, they'll appear here.</p>
    </div>
  );

  const { rep, pipeline, findings, totals } = data;
  const stage = pipeline?.stage ? (STAGE_LABELS[pipeline.stage] || STAGE_LABELS.lead) : null;

  return (
    <div className="max-w-[640px] mx-auto px-6 py-10 space-y-6">

      {/* Header */}
      <div>
        <p className="text-label uppercase text-brand font-semibold mb-1">Recovery</p>
        <h1 className="font-serif text-h1 text-ink font-normal">Your Money Back</h1>
        <p className="text-body text-ink-secondary mt-1 leading-relaxed">
          Every dollar below was confirmed recovered by your Fruxal rep.
        </p>
      </div>

      {/* Rep card */}
      {rep && (
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">Your Recovery Expert</p>
              <p className="text-[16px] font-bold text-ink">{rep.name}</p>
              {stage && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background: stage.bg, color: stage.color }}>
                  {stage.label}
                </span>
              )}
            </div>
            {rep.calendly_url && (
              <a href={rep.calendly_url} target="_blank" rel="noopener noreferrer"
                className="text-[12px] font-semibold text-brand hover:underline">
                Book a check-in →
              </a>
            )}
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Recovered", value: fmt(totals.confirmed), color: "#2D7A50" },
          { label: "Your Fee",        value: fmt(totals.fee_paid),  color: "#8E8C85"  },
          { label: "You Kept",        value: fmt(totals.net),       color: "#1A1A18"  },
        ].map(k => (
          <div key={k.label} className="bg-white border border-border rounded-xl p-4">
            <p className="text-[9px] font-bold text-ink-muted uppercase tracking-wider">{k.label}</p>
            <p className="text-[20px] font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {findings.length > 0 ? (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light">
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Confirmed Recoveries</p>
          </div>
          <div className="divide-y divide-border-light">
            {findings.map((f: any, i: number) => (
              <div key={i} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{f.leak_name || f.category || "Recovery"}</p>
                  <p className="text-[10px] text-ink-muted mt-0.5">
                    {f.category} · {relDate(f.created_at)}
                    {f.confidence_note && ` · ${f.confidence_note}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[16px] font-bold text-positive">{fmt(f.confirmed_amount)}</p>
                  <p className="text-[9px] text-ink-faint">confirmed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl px-5 py-10 text-center">
          <p className="text-[13px] font-semibold text-ink mb-1">No confirmed recoveries yet</p>
          <p className="text-[12px] text-ink-secondary">
            {rep
              ? `${rep.name} is working your file. Recoveries will appear here as they're confirmed.`
              : "Once your rep confirms savings, they'll appear here."}
          </p>
        </div>
      )}

      {totals.confirmed > 0 && (
        <p className="text-[11px] text-ink-faint text-center">
          All amounts are annual savings. Fee of {totals.fee_pct}% applied to confirmed recoveries only.
          You kept {100 - totals.fee_pct}% of everything recovered.
        </p>
      )}
    </div>
  );
}
