// =============================================================================
// GET /api/rep/customer/[id]/briefing — Pre-call briefing cheat sheet
// =============================================================================
// Combines pipeline, diagnostics, debriefs, industry intel, and quick stats
// into a single structured response so the rep walks into every call prepared.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getIndustryScenario } from "@/lib/rep/industry-scenarios";

export const maxDuration = 15;

function fmt(n: number): string {
  return n.toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  const pipelineId = params.id;

  try {
    // ------------------------------------------------------------------
    // 1. Verify rep owns this client via tier3_rep_assignments
    // ------------------------------------------------------------------
    const { data: assignment } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("id")
      .eq("pipeline_id", pipelineId)
      .eq("rep_id", auth.repId!)
      .maybeSingle();

    // Also allow if the pipeline itself has this rep
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("*")
      .eq("id", pipelineId)
      .maybeSingle();

    if (!pipe) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const ownsClient = !!assignment || pipe.rep_id === auth.repId;
    if (!ownsClient) {
      return NextResponse.json({ success: false, error: "Not assigned to this client" }, { status: 403 });
    }

    // ------------------------------------------------------------------
    // 2. Load diagnostics (findings, scores, totals)
    // ------------------------------------------------------------------
    let findings: any[] = [];
    let healthScore = 0;
    let totalLeak = 0;

    if (pipe.diagnostic_id) {
      const { data: diag } = await supabaseAdmin
        .from("tier3_diagnostics")
        .select("result")
        .eq("id", pipe.diagnostic_id)
        .maybeSingle();

      if (diag?.result) {
        findings = diag.result.findings || [];
        healthScore = diag.result.health_score ?? diag.result.healthScore ?? 0;
        totalLeak = diag.result.total_annual_leak
          ?? diag.result.totalAnnualLeak
          ?? findings.reduce((s: number, f: any) => s + (f.impact_max || f.annual_impact || 0), 0);
      }
    }

    // Fallback: compute total from findings if still 0
    if (!totalLeak && findings.length) {
      totalLeak = findings.reduce((s: number, f: any) => s + (f.impact_max || f.annual_impact || 0), 0);
    }

    // Sort findings by amount descending
    const sortedFindings = [...findings].sort(
      (a, b) => (b.impact_max || b.annual_impact || 0) - (a.impact_max || a.annual_impact || 0)
    );
    const topFinding = sortedFindings[0] || null;

    // Recovery progress
    const recovered = pipe.recovered_amount || 0;
    const recoveryProgress = totalLeak > 0 ? Math.round((recovered / totalLeak) * 100) + "%" : "0%";

    // ------------------------------------------------------------------
    // 3. Load most recent call debrief
    // ------------------------------------------------------------------
    const { data: lastDebrief } = await supabaseAdmin
      .from("call_debriefs")
      .select("*")
      .eq("pipeline_id", pipelineId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // ------------------------------------------------------------------
    // 4. Industry intel
    // ------------------------------------------------------------------
    const industry = pipe.industry || "";
    const scenario = getIndustryScenario(industry);

    // ------------------------------------------------------------------
    // 5. Quick stats — same industry + province conversion
    // ------------------------------------------------------------------
    let similarClientsConverted = "N/A";
    let avgDealSize = "N/A";

    if (industry && pipe.province) {
      const { data: similarPipelines } = await supabaseAdmin
        .from("tier3_pipeline")
        .select("id, stage, total_leak")
        .ilike("industry", `%${industry}%`)
        .eq("province", pipe.province);

      if (similarPipelines && similarPipelines.length > 0) {
        const signed = similarPipelines.filter((p: any) =>
          ["signed", "recovering", "recovered", "agreement_signed", "closed_won"].includes(p.stage)
        );
        const total = similarPipelines.length;
        const provinceShort = pipe.province.length > 4 ? pipe.province.slice(0, 2).toUpperCase() : pipe.province;
        const industryLabel = scenario?.name || industry;

        similarClientsConverted = `${signed.length} of ${total} ${industryLabel.toLowerCase().split(" ")[0]}s in ${provinceShort} signed`;

        if (signed.length > 0) {
          const totalDeals = signed.reduce((s: number, p: any) => s + (p.total_leak || 0), 0);
          avgDealSize = "$" + fmt(Math.round(totalDeals / signed.length));
        }
      }
    }

    // ------------------------------------------------------------------
    // 6. Days since last contact
    // ------------------------------------------------------------------
    const lastContactDate = lastDebrief?.created_at || pipe.last_contact || pipe.updated_at;
    const daysSinceLastContact = lastContactDate
      ? Math.floor((Date.now() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // ------------------------------------------------------------------
    // 7. Build recommended approach
    // ------------------------------------------------------------------
    const topAmount = topFinding ? (topFinding.impact_max || topFinding.annual_impact || 0) : 0;
    const topTitle = topFinding?.title || topFinding?.category || "their biggest leak";
    const lowestFinding = sortedFindings.length > 1 ? sortedFindings[sortedFindings.length - 1] : null;
    const lowestTitle = lowestFinding?.title || lowestFinding?.category || null;
    const lowestSeverity = lowestFinding?.severity || "low";

    const keepAmount = totalLeak > 0 ? fmt(Math.round(totalLeak * 0.88)) : "88%";
    const contactFirst = pipe.contact_name?.split(" ")[0] || "there";

    const opener = totalLeak > 0
      ? `Hi ${contactFirst}, we found $${fmt(totalLeak)} in annual savings for ${pipe.company_name || "your business"} — the biggest one alone is worth $${fmt(topAmount)} a year.`
      : `Hi ${contactFirst}, our analysis flagged ${findings.length} areas where ${pipe.company_name || "your business"} is overspending.`;

    const avoidNote = lowestFinding && lowestSeverity === "low"
      ? `Don't lead with ${lowestTitle} — low severity, won't create urgency`
      : sortedFindings.length > 2
        ? `Don't get lost in all ${sortedFindings.length} findings — lead with the top 2-3 only`
        : "Cover all findings — the list is short enough to walk through fully";

    const objectionToExpect = totalLeak > 0
      ? `12% fee pushback — counter with their $${fmt(totalLeak)} total, keeping $${keepAmount}`
      : "12% fee pushback — emphasize zero risk, zero cost if nothing is found";

    // ------------------------------------------------------------------
    // 8. Assemble response
    // ------------------------------------------------------------------
    const briefing = {
      client: {
        company: pipe.company_name || "",
        contact: pipe.contact_name || "",
        industry: industry,
        province: pipe.province || "",
        revenue: pipe.annual_revenue ? "$" + fmt(pipe.annual_revenue) : "Unknown",
        stage: pipe.stage || "",
        daysSinceLastContact,
        followUpDate: pipe.follow_up_date || pipe.next_follow_up || null,
      },
      financials: {
        annualLeak: totalLeak,
        findingsCount: findings.length,
        topFinding: topFinding
          ? {
              title: topFinding.title || topFinding.category || "Unknown",
              amount: topAmount,
              category: topFinding.category || "",
            }
          : null,
        healthScore,
        recoveryProgress,
      },
      industryIntel: scenario
        ? {
            name: scenario.name,
            avgLeakPct: scenario.benchmarks.avgLeakPct + "%",
            conversionRate: scenario.benchmarks.conversionRate + "%",
            avgRecoveryTimeline: scenario.benchmarks.avgRecoveryTimeline + " days",
            seasonalNote: scenario.seasonalNotes,
            decisionMaker: scenario.decisionMakers,
            competitiveAngle: scenario.competitiveAngle,
          }
        : null,
      recommended_approach: {
        opener,
        leadWith: `${topTitle} — their biggest leak at $${fmt(topAmount)}/yr`,
        avoid: avoidNote,
        objectionToExpect,
        closeStrategy: findings.length > 2
          ? `Book 15-min review call to walk through top 3 findings`
          : `Book 15-min review call to walk through all ${findings.length} finding${findings.length !== 1 ? "s" : ""}`,
      },
      previousInteractions: lastDebrief
        ? {
            lastCallOutcome: lastDebrief.call_outcome || null,
            agreedFindings: (lastDebrief.agreed_findings || []).map((f: any) => f.title || f),
            clientConcerns: lastDebrief.client_concerns || null,
            notesPreview: lastDebrief.notes
              ? lastDebrief.notes.slice(0, 200) + (lastDebrief.notes.length > 200 ? "..." : "")
              : null,
          }
        : {
            lastCallOutcome: null,
            agreedFindings: [],
            clientConcerns: null,
            notesPreview: pipe.notes ? pipe.notes.slice(0, 200) : null,
          },
      quickStats: {
        similarClientsConverted,
        avgDealSize,
      },
    };

    return NextResponse.json({ success: true, briefing });
  } catch (err: any) {
    console.error("[briefing GET]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
