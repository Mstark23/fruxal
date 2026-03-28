// =============================================================================
// app/admin/tier3/[id]/accountant/page.tsx
// Clean accountant briefing — everything needed to execute recovery.
// Reads diagnostic findings + execution playbooks + document status.
// =============================================================================
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

function fmtM(n: number) {
  return n >= 1_000_000 ? "$" + (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000 ? "$" + Math.round(n / 1_000) + "K"
    : "$" + n.toLocaleString();
}

const SEV: Record<string, { dot: string; bg: string; text: string }> = {
  critical: { dot: "#B34040", bg: "rgba(179,64,64,0.07)",   text: "#B34040" },
  high:     { dot: "#C4841D", bg: "rgba(196,132,29,0.07)",  text: "#C4841D" },
  medium:   { dot: "#0369a1", bg: "rgba(3,105,161,0.07)",   text: "#0369a1" },
  low:      { dot: "#8E8C85", bg: "rgba(142,140,133,0.07)", text: "#8E8C85" },
};

export default function AccountantBriefingPage() {
  const router   = useRouter();
  const params   = useParams();
  const id       = params?.id as string;
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/admin/tier3/pipeline/${id}`).then(r => r.json()),
      fetch(`/api/admin/tier3/pipeline/${id}/execution`).then(r => r.json()),
    ]).then(([pipeData, execData]) => {
      setData({ pipe: pipeData, exec: execData });
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );

  const entry     = data?.pipe?.entry || {};
  const report    = data?.pipe?.diagnostic?.result_json || data?.pipe?.diagnostic?.result || {};
  const playbooks: any[] = data?.exec?.playbooks || [];
  const profile   = data?.pipe?.profile || {};
  const cpa       = report?.cpa_briefing || {};
  const findings  = report?.findings || [];
  const quickWins = playbooks.filter((p: any) => p.quick_win && p.status === "queued");
  const totalRecoverable = data?.exec?.summary?.total_recoverable || 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => router.push(`/admin/tier3/${id}`)}
            className="text-[12px] font-medium text-[#8E8C85] hover:text-[#1B3A2D] transition">
            ← {entry.companyName || "Client"}
          </button>
        </div>

        <AdminNav />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mt-5 mb-6">
          <div>
            <h1 className="font-serif text-[22px] font-bold text-[#1A1A18]">Accountant Briefing</h1>
            <p className="text-[12px] text-[#8E8C85] mt-1">
              {entry.companyName} · {entry.industry} · {entry.province} · {fmtM(totalRecoverable)} to recover
            </p>
          </div>
          <button onClick={() => router.push(`/admin/tier3/${id}/execution`)}
            className="h-8 px-4 text-[11px] font-bold text-[#1B3A2D] border border-[#1B3A2D]/20 rounded-lg hover:bg-[#1B3A2D]/5 transition">
            Execution Playbook →
          </button>
        </div>

        {/* Business snapshot */}
        <div className="bg-white border border-[#E8E6E1] rounded-xl px-5 py-4 mb-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Business Profile</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Revenue",   val: entry.revenueBracket || profile.annual_revenue ? fmtM(profile.exact_annual_revenue || profile.annual_revenue || 0) : "—" },
              { label: "Industry",  val: entry.industry || "—" },
              { label: "Province",  val: entry.province || "—" },
              { label: "Structure", val: profile.structure || "—" },
              { label: "Employees", val: profile.employee_count ? String(profile.employee_count) : "—" },
              { label: "Has accountant", val: profile.has_accountant ? "Yes" : "No" },
              { label: "Stage",     val: entry.stage || "—" },
              { label: "Signed",    val: entry.signedAt ? new Date(entry.signedAt).toLocaleDateString("en-CA") : "—" },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-[10px] text-[#8E8C85] uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className="text-[13px] font-semibold text-[#1A1A18]">{item.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick wins banner */}
        {quickWins.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
            style={{ background: "rgba(45,122,80,0.06)", border: "1px solid rgba(45,122,80,0.15)" }}>
            <span className="text-[16px]">⚡</span>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-[#1B3A2D]">
                {quickWins.length} quick win{quickWins.length !== 1 ? "s" : ""} — action these first
              </p>
              <p className="text-[11px] text-[#56554F]">
                {quickWins.map((p: any) => p.finding_title).join(" · ")}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

          {/* Left — findings + playbooks */}
          <div className="space-y-3">

            {/* CPA briefing summary */}
            {(cpa.intro || cpa.talking_points?.length > 0) && (
              <div className="bg-white border border-[#E8E6E1] rounded-xl px-5 py-4"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Diagnostic Summary</p>
                {cpa.intro && <p className="text-[13px] text-[#3A3935] leading-relaxed mb-3">{cpa.intro}</p>}
                {cpa.talking_points?.length > 0 && (
                  <div className="space-y-1.5">
                    {(cpa.talking_points as any[]).slice(0, 5).map((tp: any, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#1B3A2D] font-bold text-[12px] shrink-0 mt-0.5">→</span>
                        <p className="text-[12px] text-[#56554F] leading-relaxed">
                          {typeof tp === "string" ? tp : tp.point}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {cpa.forms_to_discuss?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(cpa.forms_to_discuss as string[]).map((f: string, i: number) => (
                      <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(3,105,161,0.07)", color: "#0369a1", border: "1px solid rgba(3,105,161,0.15)" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Findings with inline playbook */}
            {playbooks.length > 0 ? playbooks.map((pb: any) => {
              const sev = SEV[pb.severity] || SEV.low;
              const isOpen = active === pb.id;
              return (
                <div key={pb.id} className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <button
                    onClick={() => setActive(isOpen ? null : pb.id)}
                    className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-[#FAFAF8] transition">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: sev.dot }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-[#1A1A18]">{pb.finding_title}</span>
                        {pb.quick_win && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(45,122,80,0.08)", color: "#2D7A50" }}>⚡</span>
                        )}
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: sev.bg, color: sev.text }}>{pb.category}</span>
                      </div>
                      {pb.execution_steps?.[0] && !isOpen && (
                        <p className="text-[11px] text-[#8E8C85] mt-1 truncate">Step 1: {pb.execution_steps[0]}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <div className="text-[14px] font-bold text-[#B34040]">{fmtM(pb.amount_recoverable)}</div>
                        {pb.estimated_hours && <div className="text-[10px] text-[#8E8C85]">~{pb.estimated_hours}h</div>}
                      </div>
                      <span className="text-[12px] text-[#B5B3AD]">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#F0EFEB] px-5 py-4 space-y-4">
                      {pb.execution_steps?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">Execution Steps</p>
                          <div className="space-y-2">
                            {pb.execution_steps.map((step: string, i: number) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
                                  style={{ background: "rgba(27,58,45,0.08)", color: "#1B3A2D" }}>{i + 1}</span>
                                <p className="text-[12px] text-[#3A3935] leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {pb.documents_needed?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">Documents Needed</p>
                            <div className="space-y-1">
                              {pb.documents_needed.map((doc: string, i: number) => (
                                <div key={i} className="flex items-center gap-1.5 text-[12px] text-[#3A3935]">
                                  <div className="w-1 h-1 rounded-full bg-[#C5C2BB]" />
                                  {doc}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {pb.cra_forms?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">CRA Forms</p>
                            <div className="flex flex-wrap gap-1">
                              {pb.cra_forms.map((f: string, i: number) => (
                                <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: "rgba(3,105,161,0.07)", color: "#0369a1" }}>{f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {pb.draft_template && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Draft Template</p>
                            <button
                              onClick={() => navigator.clipboard?.writeText(pb.draft_template)}
                              className="text-[10px] font-semibold text-[#1B3A2D] hover:underline">
                              Copy
                            </button>
                          </div>
                          <div className="bg-[#FAFAF8] border border-[#E8E6E1] rounded-xl px-4 py-3 max-h-40 overflow-y-auto">
                            <pre className="text-[11px] text-[#3A3935] whitespace-pre-wrap font-sans leading-relaxed">
                              {pb.draft_template}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }) : findings.slice(0, 8).map((f: any, i: number) => {
              const sev = SEV[f.severity] || SEV.low;
              return (
                <div key={i} className="bg-white border border-[#E8E6E1] rounded-xl px-5 py-4"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", borderLeft: `3px solid ${sev.dot}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#1A1A18] mb-1">{f.title}</p>
                      {f.recommendation && (
                        <p className="text-[11px] text-[#56554F] leading-relaxed">{f.recommendation}</p>
                      )}
                    </div>
                    <div className="text-[14px] font-bold text-[#B34040] shrink-0">{fmtM(f.impact_max || 0)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Recovery totals */}
            <div className="bg-white border border-[#E8E6E1] rounded-xl px-5 py-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Recovery Summary</p>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#56554F]">Total identified</span>
                  <span className="font-bold text-[#B34040]">{fmtM(totalRecoverable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#56554F]">Quick wins</span>
                  <span className="font-semibold text-[#2D7A50]">{quickWins.length} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#56554F]">Fruxal fee</span>
                  <span className="font-semibold text-[#1A1A18]">12%</span>
                </div>
                <div className="h-px bg-[#F0EFEB]" />
                <div className="flex justify-between">
                  <span className="text-[#56554F]">Client keeps</span>
                  <span className="font-bold text-[#2D7A50]">{fmtM(Math.round(totalRecoverable * 0.88))}</span>
                </div>
              </div>
            </div>

            {/* Documents status */}
            {data?.pipe?.documents && (
              <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-5 py-3 border-b border-[#F0EFEB] flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Documents</span>
                  <span className="text-[11px] text-[#8E8C85]">
                    {data.pipe.documents.received}/{data.pipe.documents.total} received
                  </span>
                </div>
                <div className="divide-y divide-[#F0EFEB]">
                  {(data.pipe.documents.items || []).map((doc: any, i: number) => (
                    <div key={i} className="px-4 py-2.5 flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: doc.status === "received" ? "#2D7A50" : "#C5C2BB" }} />
                      <span className="text-[12px] text-[#3A3935] flex-1 truncate">{doc.label}</span>
                      <span className="text-[10px] font-semibold shrink-0"
                        style={{ color: doc.status === "received" ? "#2D7A50" : "#8E8C85" }}>
                        {doc.status === "received" ? "✓" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk matrix summary */}
            {report?.risk_matrix?.length > 0 && (
              <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-5 py-3 border-b border-[#F0EFEB]">
                  <span className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Risk Flags</span>
                </div>
                {(report.risk_matrix as any[]).slice(0, 4).map((r: any, i: number) => {
                  const sev = SEV[r.risk_level] || SEV.low;
                  return (
                    <div key={i} className="px-4 py-2.5 border-b border-[#F0EFEB] last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sev.dot }} />
                        <span className="text-[12px] font-medium text-[#3A3935] flex-1 truncate">{r.area}</span>
                        <span className="text-[10px] font-bold shrink-0" style={{ color: sev.text }}>{r.risk_level}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
