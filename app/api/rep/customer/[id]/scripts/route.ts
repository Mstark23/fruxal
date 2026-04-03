// =============================================================================
// GET /api/rep/customer/[id]/scripts — Dynamic sales script generator
// =============================================================================
// Query: ?type=cold_outreach|post_prescan|review_call|objection_handling
// Returns fully-filled, industry-specific scripts with real client data.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getIndustryScenario,
  type IndustryScenario,
} from "@/lib/rep/industry-scenarios";

type ScriptType = "cold_outreach" | "post_prescan" | "review_call" | "objection_handling";

const VALID_TYPES: ScriptType[] = [
  "cold_outreach",
  "post_prescan",
  "review_call",
  "objection_handling",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

function nextBusinessDay(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  if (day === 5) d.setDate(d.getDate() + 3); // Fri → Mon
  else if (day === 6) d.setDate(d.getDate() + 2); // Sat → Mon
  else d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-CA", { weekday: "long" });
}

// ---------------------------------------------------------------------------
// Script builders
// ---------------------------------------------------------------------------

interface ClientContext {
  companyName: string;
  contactName: string;
  industry: string;
  province: string;
  annualLeak: number;
  findings: Array<{
    title: string;
    amount: number;
    category: string;
  }>;
  repName: string;
  calendlyUrl: string;
  scenario: IndustryScenario | null;
}

function buildColdOutreach(ctx: ClientContext) {
  const s = ctx.scenario;
  const topFinding = ctx.findings[0];
  const topLeak = s?.topLeakCategories[0];
  const avgRange = topLeak?.typicalAmountRange || `$${fmt(Math.round(ctx.annualLeak * 0.4))}\u2013$${fmt(ctx.annualLeak)}`;

  const hook = topLeak?.opener || `Most ${ctx.industry} businesses are leaving $${fmt(ctx.annualLeak)} or more on the table every year.`;
  const day = nextBusinessDay();

  return {
    call_opening: `Hi ${ctx.contactName}, this is ${ctx.repName} from Fruxal. I work with ${ctx.industry} businesses in ${ctx.province} and most are losing ${avgRange} a year on ${topLeak?.category?.replace(/_/g, " ") || "hidden cost leaks"}. Got 30 seconds?`,
    hook,
    transition: `We ran a quick analysis on ${ctx.companyName} and found ${ctx.findings.length} area${ctx.findings.length !== 1 ? "s" : ""} where you're leaving money on the table \u2014 about $${fmt(ctx.annualLeak)}/year.${topFinding ? ` The biggest one is ${topFinding.title} at $${fmt(topFinding.amount)}/year.` : ""}`,
    ask: `I can walk you through the full breakdown in 15 minutes \u2014 does ${day} work?${ctx.calendlyUrl ? ` Or grab a time here: ${ctx.calendlyUrl}` : ""}`,
    email_subject: `${ctx.companyName} \u2014 $${fmt(ctx.annualLeak)} recovery opportunity`,
    email_body: [
      `Hi ${ctx.contactName},`,
      "",
      `I work with ${ctx.industry} businesses in ${ctx.province} to find and recover hidden cost leaks \u2014 things like ${(s?.topLeakCategories.slice(0, 3).map(c => c.category.replace(/_/g, " ")).join(", ")) || "processing fees, insurance, and tax structure"}.`,
      "",
      `We ran a quick analysis on ${ctx.companyName} and found ${ctx.findings.length} area${ctx.findings.length !== 1 ? "s" : ""} totaling about $${fmt(ctx.annualLeak)}/year in potential savings:`,
      "",
      ...ctx.findings.slice(0, 3).map((f, i) => `${i + 1}. ${f.title} \u2014 $${fmt(f.amount)}/yr`),
      "",
      "We work on contingency \u2014 12% of what we actually recover, nothing upfront. If we don't find savings, you pay nothing.",
      "",
      `Do you have 15 minutes this week? I'd love to walk you through the numbers.${ctx.calendlyUrl ? `\n\nBook a time: ${ctx.calendlyUrl}` : ""}`,
      "",
      "Best,",
      ctx.repName,
      "Fruxal Recovery Team",
    ].join("\n"),
    pain_points: s?.painPoints || [],
    seasonal_notes: s?.seasonalNotes || "",
  };
}

function buildPostPrescan(ctx: ClientContext) {
  const s = ctx.scenario;

  const findingsWalkthrough = ctx.findings.map((f) => {
    const matchingCat = s?.topLeakCategories.find(
      (c) => c.category === f.category || f.title.toLowerCase().includes(c.category.replace(/_/g, " "))
    );
    return {
      finding: f.title,
      amount: `$${fmt(f.amount)}/yr`,
      explanation: matchingCat?.opener || `This is a common issue in ${ctx.industry} businesses \u2014 and it is recoverable.`,
    };
  });

  return {
    opening: `Hi ${ctx.contactName}, this is ${ctx.repName} \u2014 we did a financial health check on ${ctx.companyName} and found some things I want to walk you through.`,
    findings_walkthrough: findingsWalkthrough,
    close: `The good news is we handle everything on contingency \u2014 12% of what we actually recover, nothing upfront. If we don't find savings, you pay nothing. That means you keep $${fmt(Math.round(ctx.annualLeak * 0.88))}/year of the $${fmt(ctx.annualLeak)} we found.`,
    day1_email: [
      `Hi ${ctx.contactName},`,
      "",
      `Great speaking with you. As discussed, here's a summary of what we found for ${ctx.companyName}:`,
      "",
      ...ctx.findings.map((f, i) => `${i + 1}. **${f.title}** \u2014 $${fmt(f.amount)}/yr`),
      "",
      `**Total potential recovery: $${fmt(ctx.annualLeak)}/yr**`,
      "",
      "Next step: a 15-minute review call to walk through each finding and answer any questions. No commitment required.",
      "",
      `${ctx.calendlyUrl ? `Book a time: ${ctx.calendlyUrl}\n\n` : ""}Best,`,
      ctx.repName,
      "Fruxal Recovery Team",
    ].join("\n"),
    day3_email: [
      `Hi ${ctx.contactName},`,
      "",
      `Just following up on the financial health check we did for ${ctx.companyName}. We identified $${fmt(ctx.annualLeak)}/year in potential savings across ${ctx.findings.length} areas.`,
      "",
      `The biggest opportunity is ${ctx.findings[0]?.title || "cost optimization"} at $${fmt(ctx.findings[0]?.amount || 0)}/yr.`,
      "",
      `${s?.seasonalNotes ? `Timing note: ${s.seasonalNotes}\n\n` : ""}I'd love to walk you through the numbers \u2014 15 minutes is all it takes.${ctx.calendlyUrl ? ` Book here: ${ctx.calendlyUrl}` : ""}`,
      "",
      "Best,",
      ctx.repName,
    ].join("\n"),
    day7_email: [
      `Hi ${ctx.contactName},`,
      "",
      `Last note on this \u2014 the $${fmt(ctx.annualLeak)} in annual savings we found for ${ctx.companyName} is real money that's leaving your business every month (about $${fmt(Math.round(ctx.annualLeak / 12))}/mo).`,
      "",
      "I don't want you to miss out. A 15-minute call is all it takes to see if these savings are worth pursuing.",
      "",
      "If now isn't the right time, no worries \u2014 just let me know and I'll circle back in a few months.",
      "",
      `${ctx.calendlyUrl ? `Book a time: ${ctx.calendlyUrl}\n\n` : ""}Best,`,
      ctx.repName,
    ].join("\n"),
    email_subjects: {
      day1: `${ctx.companyName} \u2014 Financial health check results`,
      day3: `Quick follow-up: ${ctx.companyName}'s $${fmt(ctx.annualLeak)} in savings`,
      day7: `Last note on the $${fmt(ctx.annualLeak)} we found for ${ctx.companyName}`,
    },
  };
}

function buildReviewCall(ctx: ClientContext) {
  const s = ctx.scenario;

  const perFindingTalkTrack = ctx.findings.map((f) => {
    const matchingCat = s?.topLeakCategories.find(
      (c) => c.category === f.category || f.title.toLowerCase().includes(c.category.replace(/_/g, " "))
    );
    return {
      finding: f.title,
      amount: `$${fmt(f.amount)}/yr`,
      talk_track: matchingCat?.opener || `This is one of the most common cost leaks we see in ${ctx.industry} \u2014 and it is fully recoverable.`,
      monthly_impact: `$${fmt(Math.round(f.amount / 12))}/mo`,
    };
  });

  const objectionResponses = (s?.objections || []).map((obj) => ({
    they_say: obj.objection,
    you_say: obj.response + (ctx.annualLeak > 0 ? ` In your case, we're looking at $${fmt(ctx.annualLeak)}/year \u2014 so the math works strongly in your favour.` : ""),
  }));

  return {
    opening: `Hey ${ctx.contactName}, thanks for making time. I know ${ctx.industry} owners are busy so I'll keep this tight \u2014 15 minutes.`,
    walkthrough: `So we analyzed ${ctx.companyName}'s financials and found ${ctx.findings.length} area${ctx.findings.length !== 1 ? "s" : ""} where money is leaking \u2014 totaling about $${fmt(ctx.annualLeak)} a year. That's roughly $${fmt(Math.round(ctx.annualLeak / 12))} every month leaving your business.`,
    per_finding_talk_track: perFindingTalkTrack,
    summary_transition: `So altogether, we're looking at $${fmt(ctx.annualLeak)}/year. On contingency at 12%, our fee would be $${fmt(Math.round(ctx.annualLeak * 0.12))}/year and you keep $${fmt(Math.round(ctx.annualLeak * 0.88))}/year. And you only pay once savings are confirmed.`,
    objection_responses: objectionResponses,
    close: `The next step is signing a simple engagement letter \u2014 it authorizes us to work with your ${ctx.industry.toLowerCase().includes("real estate") ? "property manager and accountant" : "accountant/CPA"} to verify and recover these amounts. No cost unless we find real savings.`,
    benchmarks: s
      ? {
          industry_avg_leak: `${s.benchmarks.avgLeakPct}% of revenue`,
          typical_recovery_timeline: `${s.benchmarks.avgRecoveryTimeline} days`,
          note: `The average ${s.name} client recovers savings within ${s.benchmarks.avgRecoveryTimeline} days of engagement.`,
        }
      : null,
  };
}

function buildObjectionHandling(ctx: ClientContext) {
  const s = ctx.scenario;
  const annualFmt = `$${fmt(ctx.annualLeak)}`;
  const feeFmt = `$${fmt(Math.round(ctx.annualLeak * 0.12))}`;
  const keepFmt = `$${fmt(Math.round(ctx.annualLeak * 0.88))}`;
  const monthlyFmt = `$${fmt(Math.round(ctx.annualLeak / 12))}`;

  // Universal objections with real numbers
  const universalObjections = [
    {
      they_say: "12% is too much",
      you_say: `I hear you. Let me put it in real numbers: we found ${annualFmt}/year in savings for ${ctx.companyName}. Our 12% fee is ${feeFmt} \u2014 you keep ${keepFmt}. That's money you're currently losing entirely. Would you rather keep 0% of it or 88%?`,
    },
    {
      they_say: "My accountant handles this",
      you_say: `Your accountant is great at taxes and compliance \u2014 we specialize in cost recovery. ${s ? `For ${s.name.toLowerCase()} businesses specifically, we audit ${s.topLeakCategories.slice(0, 3).map(c => c.category.replace(/_/g, " ")).join(", ")}` : "We look at vendor contracts, insurance benchmarking, and operational cost optimization"} \u2014 areas most accountants don't proactively review. We actually work alongside your accountant.`,
    },
    {
      they_say: "I need to think about it",
      you_say: `Absolutely \u2014 take the time you need. Just keep in mind that every month you wait, that's ${monthlyFmt} in savings you don't get back. The engagement is zero-risk: if we don't find real savings, you pay nothing. What specific concerns can I address?`,
    },
    {
      they_say: "Send me some information",
      you_say: `Happy to \u2014 I'll send over the full breakdown of the ${ctx.findings.length} areas we found for ${ctx.companyName}, totaling ${annualFmt}/year. But a 5-minute call would let me answer your specific questions and save you reading time. Can we do a quick call ${nextBusinessDay()}?`,
    },
    {
      they_say: "We tried something like this before",
      you_say: `I get that. What makes Fruxal different is we work on contingency \u2014 we only earn when you save. ${s ? s.competitiveAngle : "We also cover the full cost stack, not just one area."} If we can't beat what you've already done, you pay nothing.`,
    },
    {
      they_say: "We're doing fine financially",
      you_say: `That's great to hear \u2014 profitable businesses are actually our best clients because the savings go straight to the bottom line. Even healthy ${ctx.industry} businesses average ${s ? s.benchmarks.avgLeakPct + "%" : "12-15%"} in hidden cost leaks. We found ${annualFmt} for ${ctx.companyName}. Wouldn't hurt to take a look, especially at zero risk.`,
    },
    {
      they_say: "I don't have time right now",
      you_say: `I totally understand \u2014 running a ${ctx.industry} business is demanding. The prescan is already done. All I need is 15 minutes to walk you through the findings. ${s?.seasonalNotes ? "Timing-wise: " + s.seasonalNotes : ""} When would work better this week or next?`,
    },
  ];

  // Industry-specific objections from the scenario
  const industryObjections = (s?.objections || []).map((obj) => ({
    they_say: obj.objection,
    you_say: obj.response,
  }));

  // Merge: industry-specific first, then universal (skip duplicates)
  const seenObjections = new Set<string>();
  const allObjections: Array<{ they_say: string; you_say: string }> = [];

  for (const obj of industryObjections) {
    const key = obj.they_say.toLowerCase().replace(/[^a-z]/g, "");
    if (!seenObjections.has(key)) {
      seenObjections.add(key);
      allObjections.push(obj);
    }
  }
  for (const obj of universalObjections) {
    const key = obj.they_say.toLowerCase().replace(/[^a-z]/g, "");
    if (!seenObjections.has(key)) {
      seenObjections.add(key);
      allObjections.push(obj);
    }
  }

  return {
    objections: allObjections,
    quick_stats: {
      total_annual_leak: annualFmt,
      fee_amount: feeFmt,
      client_keeps: keepFmt,
      monthly_leak: monthlyFmt,
      findings_count: ctx.findings.length,
    },
    competitive_angle: s?.competitiveAngle || "Fruxal covers the full cost stack on contingency \u2014 no risk, no upfront cost.",
  };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  const clientId = params.id;
  const repId = auth.repId!;
  const scriptType = (req.nextUrl.searchParams.get("type") || "cold_outreach") as ScriptType;

  if (!VALID_TYPES.includes(scriptType)) {
    return NextResponse.json(
      { success: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // -----------------------------------------------------------------------
    // 1. Verify rep owns this client
    // -----------------------------------------------------------------------
    const { data: assignment } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("id")
      .eq("rep_id", repId)
      .or(`pipeline_id.eq.${clientId},diagnostic_id.eq.${clientId}`)
      .maybeSingle();

    // Also allow if the rep created the pipeline entry
    const { data: pipelineOwner } = !assignment
      ? await supabaseAdmin
          .from("tier3_pipeline")
          .select("id")
          .eq("id", clientId)
          .eq("rep_id", repId)
          .maybeSingle()
      : { data: null };

    if (!assignment && !pipelineOwner) {
      return NextResponse.json(
        { success: false, error: "Client not found or not assigned to you" },
        { status: 403 }
      );
    }

    // -----------------------------------------------------------------------
    // 2. Load client data
    // -----------------------------------------------------------------------
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, company_name, contact_name, industry, province, diagnostic_id, annual_revenue, rep_id")
      .eq("id", clientId)
      .maybeSingle();

    const { data: pipeByDiag } = !pipe
      ? await supabaseAdmin
          .from("tier3_pipeline")
          .select("id, company_name, contact_name, industry, province, diagnostic_id, annual_revenue, rep_id")
          .eq("diagnostic_id", clientId)
          .maybeSingle()
      : { data: null };

    const clientData = pipe || pipeByDiag;
    const companyName = clientData?.company_name || "the business";
    const contactName = clientData?.contact_name?.split(" ")[0] || "there";
    const industry = clientData?.industry || "business";
    const province = clientData?.province || "Canada";

    // Load findings from diagnostics or detected_leaks
    let findings: Array<{ title: string; amount: number; category: string }> = [];

    if (clientData?.diagnostic_id) {
      const { data: diag } = await supabaseAdmin
        .from("tier3_diagnostics")
        .select("result")
        .eq("id", clientData.diagnostic_id)
        .maybeSingle();

      if (diag?.result?.findings) {
        findings = diag.result.findings
          .sort((a: any, b: any) => (b.impact_max ?? b.annual_impact ?? 0) - (a.impact_max ?? a.annual_impact ?? 0))
          .slice(0, 5)
          .map((f: any) => ({
            title: f.title || f.category || "Cost optimization",
            amount: f.impact_max || f.annual_impact || f.impact_min || 0,
            category: f.category || "general",
          }));
      }
    }

    // Fallback: try detected_leaks if diagnostic findings are empty
    if (!findings.length && clientData?.id) {
      const { data: pipeUser } = await supabaseAdmin
        .from("tier3_pipeline")
        .select("user_id")
        .eq("id", clientData.id)
        .maybeSingle();

      if (pipeUser?.user_id) {
        const { data: profile } = await supabaseAdmin
          .from("business_profiles")
          .select("business_id")
          .eq("user_id", pipeUser.user_id)
          .maybeSingle();

        if (profile?.business_id) {
          const { data: leaks } = await supabaseAdmin
            .from("detected_leaks")
            .select("title, annual_impact_max, annual_impact_min, category")
            .eq("business_id", profile.business_id)
            .order("annual_impact_max", { ascending: false })
            .limit(5);

          if (leaks?.length) {
            findings = leaks.map((l: any) => ({
              title: l.title || "Cost optimization",
              amount: l.annual_impact_max || l.annual_impact_min || 0,
              category: l.category || "general",
            }));
          }
        }
      }
    }

    const annualLeak = findings.reduce((s, f) => s + f.amount, 0);

    // -----------------------------------------------------------------------
    // 3. Load rep profile
    // -----------------------------------------------------------------------
    const rep = auth.rep;
    const repName = rep?.name || "your Fruxal representative";

    // Try to get calendly URL from rep metadata
    let calendlyUrl = "";
    try {
      const { data: repMeta } = await supabaseAdmin
        .from("tier3_reps")
        .select("calendly_url, booking_url")
        .eq("id", repId)
        .maybeSingle();
      calendlyUrl = repMeta?.calendly_url || repMeta?.booking_url || "";
    } catch {
      // non-fatal — columns may not exist yet
    }

    // -----------------------------------------------------------------------
    // 4. Match industry scenario
    // -----------------------------------------------------------------------
    const scenario = getIndustryScenario(industry);

    // -----------------------------------------------------------------------
    // 5. Build context and generate script
    // -----------------------------------------------------------------------
    const ctx: ClientContext = {
      companyName,
      contactName,
      industry: scenario?.name || industry,
      province,
      annualLeak,
      findings,
      repName,
      calendlyUrl,
      scenario,
    };

    let script: any;

    switch (scriptType) {
      case "cold_outreach":
        script = buildColdOutreach(ctx);
        break;
      case "post_prescan":
        script = buildPostPrescan(ctx);
        break;
      case "review_call":
        script = buildReviewCall(ctx);
        break;
      case "objection_handling":
        script = buildObjectionHandling(ctx);
        break;
    }

    return NextResponse.json({
      success: true,
      type: scriptType,
      script,
      context: {
        companyName,
        contactName,
        industry,
        province,
        annualLeak,
        findingsCount: findings.length,
        repName,
        industryMatch: scenario?.name || null,
      },
    });
  } catch (err: any) {
    console.error("[scripts] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
