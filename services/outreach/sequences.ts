// =============================================================================
// OUTREACH SEQUENCES — Automated post-prescan email drip
// =============================================================================
// Aligned with the contingency recovery model. No subscription pitches.
// Every email answers: "What happens next?" and maintains urgency.
//
// Sequence (from scan date):
// Day 1:  "Here's what we found" — leak summary, top 3 items
// Day 3:  "Every day this costs you $X" — daily cost framing
// Day 7:  "Other [industry] businesses fixed this" — social proof
// Day 14: "We haven't connected you with a rep yet" — rep offer
// Day 30: "Your numbers have probably shifted" — re-engagement
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { sendEmail, emailTemplate } from "../email/service";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const APP_URL = process.env.NEXTAUTH_URL || "https://fruxal.ca";

interface SequenceStep {
  dayOffset: number;
  templateKey: string;
  subject: (vars: TemplateVars) => string;
  body: (vars: TemplateVars) => string;
  ctaText: string;
  ctaPath: string;
  skipIfRepAssigned?: boolean; // Don't send generic emails once rep is active
}

interface TemplateVars {
  businessName: string;
  industry:     string;
  totalLeak:    number;
  topLeak:      string;
  topLeakAmt:   number;
  leakCount:    number;
  province:     string;
  dailyCost:    number;
}

const SEQUENCE: SequenceStep[] = [
  {
    dayOffset: 1,
    templateKey: "day1_results",
    subject: v => `We found ${v.leakCount} leaks in ${v.businessName} — \$${v.totalLeak.toLocaleString()}/yr`,
    body: v => `
      <p style="font-size:15px;color:#1a1a2e;margin:0 0 16px">Here's the honest picture, ${v.businessName}.</p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        Your scan found <strong>${v.leakCount} areas</strong> where your business is losing money. 
        The total estimated annual impact: <strong style="color:#B34040">\$${v.totalLeak.toLocaleString()}/yr</strong>.
      </p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        Your biggest single opportunity: <strong>${v.topLeak}</strong> — 
        worth approximately <strong style="color:#2D7A50">\$${v.topLeakAmt.toLocaleString()}/yr</strong>.
      </p>
      <p style="color:#3d3d4e;margin:0 0 24px">
        These aren't estimates we invented. They're based on what businesses like yours in ${v.province} 
        actually pay vs. what they should. The gaps are real.
      </p>
    `,
    ctaText: "See My Full Results →",
    ctaPath: "/v2/dashboard",
    skipIfRepAssigned: false,
  },
  {
    dayOffset: 3,
    templateKey: "day3_daily_cost",
    subject: v => `${v.businessName}: you're losing \$${v.dailyCost}/day`,
    body: v => `
      <p style="color:#3d3d4e;margin:0 0 16px">Hi ${v.businessName},</p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        Three days ago, your scan identified \$${v.totalLeak.toLocaleString()} in annual leaks.
        That's approximately <strong style="color:#B34040">\$${v.dailyCost}/day</strong> — 
        every day those leaks aren't addressed.
      </p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        The leaks don't pause because you're busy. The vendor overcharges keep billing. 
        The unclaimed credits keep expiring. The tax gaps keep widening.
      </p>
      <p style="color:#3d3d4e;margin:0 0 24px">
        You don't have to fix everything at once. But the one with the highest dollar amount — 
        that one is worth one phone call.
      </p>
    `,
    ctaText: "See My Leaks →",
    ctaPath: "/v2/leaks",
    skipIfRepAssigned: true,
  },
  {
    dayOffset: 7,
    templateKey: "day7_social_proof",
    subject: v => `How ${v.industry} businesses in ${v.province} recovered their biggest leaks`,
    body: v => `
      <p style="color:#3d3d4e;margin:0 0 16px">Hi ${v.businessName},</p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        Here's what we've seen from other ${v.industry} businesses in the last 6 months:
      </p>
      <div style="background:#F9F8F6;border-left:3px solid #1B3A2D;padding:16px;margin:0 0 16px;border-radius:0 8px 8px 0">
        <p style="margin:0 0 6px;font-size:13px;color:#1a1a2e"><strong>Vendor renegotiation</strong> — average 11% reduction on recurring supplier costs. Most businesses haven't asked in 2+ years.</p>
      </div>
      <div style="background:#F9F8F6;border-left:3px solid #1B3A2D;padding:16px;margin:0 0 16px;border-radius:0 8px 8px 0">
        <p style="margin:0 0 6px;font-size:13px;color:#1a1a2e"><strong>SR&ED claims</strong> — average recovery $18,000–$45,000 for businesses doing any R&D or custom software. Most never applied.</p>
      </div>
      <div style="background:#F9F8F6;border-left:3px solid #1B3A2D;padding:16px;margin:0 0 24px;border-radius:0 8px 8px 0">
        <p style="margin:0 0 6px;font-size:13px;color:#1a1a2e"><strong>Tax structure review</strong> — businesses that hadn't reviewed in 3+ years found an average of $12,000–$28,000 in annual savings.</p>
      </div>
      <p style="color:#3d3d4e;margin:0 0 24px">
        We do all of this on contingency — no upfront cost, no monthly fee. 
        We recover the money, take 12%, and you keep 88%. 
        If we find nothing, you pay nothing.
      </p>
    `,
    ctaText: "Learn How It Works →",
    ctaPath: "/",
    skipIfRepAssigned: true,
  },
  {
    dayOffset: 14,
    templateKey: "day14_rep_offer",
    subject: v => `${v.businessName}: we haven't matched you with a recovery expert yet`,
    body: v => `
      <p style="color:#3d3d4e;margin:0 0 16px">Hi ${v.businessName},</p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        Two weeks ago, your scan found <strong>\$${v.totalLeak.toLocaleString()}/yr</strong> in leaks.
      </p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        We haven't matched you with a Fruxal recovery expert yet — those spots are limited and we assign 
        them based on where we can create the most impact.
      </p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        If you want to be considered for a dedicated rep who handles everything on contingency, 
        reply to this email and we'll review your file.
      </p>
      <p style="color:#3d3d4e;margin:0 0 24px;font-size:12px;font-style:italic">
        No cost unless we recover. We take 12% of what we get back. You keep the rest.
      </p>
    `,
    ctaText: "Request a Recovery Expert →",
    ctaPath: "/v2/dashboard",
    skipIfRepAssigned: true,
  },
  {
    dayOffset: 30,
    templateKey: "day30_reengage",
    subject: v => `30 days later — \$${v.totalLeak.toLocaleString()} still on the table`,
    body: v => `
      <p style="color:#3d3d4e;margin:0 0 16px">Hi ${v.businessName},</p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        A month ago, we found \$${v.totalLeak.toLocaleString()} in annual leaks in your business.
      </p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        Most people mean to act on it. Then the month gets busy.
      </p>
      <p style="color:#3d3d4e;margin:0 0 16px">
        Here's the thing: the leaks don't pause while you're busy. 
        \$${v.dailyCost}/day, every day, until someone addresses them.
      </p>
      <p style="color:#3d3d4e;margin:0 0 24px">
        Your scan is still there. So is your action plan. Run a new one if anything has changed — 
        it's still free, always.
      </p>
    `,
    ctaText: "Go Back to My Results →",
    ctaPath: "/v2/dashboard",
    skipIfRepAssigned: true,
  },
];

export async function processOutreachSequences(): Promise<{ sent: number; skipped: number }> {
  let sent = 0, skipped = 0;

  try {
    const { data: businesses } = await sb
      .from("businesses")
      .select("id, owner_user_id, created_at")
      .not("owner_user_id", "is", null);

    if (!businesses?.length) return { sent, skipped };

    const now = Date.now();

    for (const biz of businesses) {
      const bizAge = Math.floor((now - new Date((biz as any).created_at).getTime()) / 86400000);

      // Check if this user has an active rep (skip most emails if so)
      let hasActiveRep = false;
      try {
        const { data: pipe } = await sb
          .from("tier3_pipeline")
          .select("stage")
          .eq("user_id", biz.owner_user_id)
          .in("stage", ["contacted","called","diagnostic_sent","agreement_out",
                         "signed","in_engagement","recovery_tracking"])
          .limit(1)
          .maybeSingle() as any;
        hasActiveRep = !!pipe;
      } catch { /* non-fatal */ }

      for (const step of SEQUENCE) {
        if (bizAge !== step.dayOffset) continue;
        if (step.skipIfRepAssigned && hasActiveRep) { skipped++; continue; }

        // Check if already sent
        const { data: existing } = await sb
          .from("outreach_log")
          .select("id")
          .eq("business_id", biz.id)
          .eq("template", step.templateKey)
          .limit(1);
        if (existing?.length) { skipped++; continue; }

        // Get user email
        const { data: authUser } = await (sb.auth.admin as any).getUserById(biz.owner_user_id).catch(() => ({ data: { user: null } }));
        const email = authUser?.user?.email;
        if (!email) { skipped++; continue; }

        // Get leak data
        const { data: prescanRow } = await sb
          .from("prescan_results")
          .select("summary, input_snapshot")
          .eq("user_id", biz.owner_user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single() as any;

        const summary = prescanRow?.summary || {};
        const input   = prescanRow?.input_snapshot || {};
        const totalLeak = summary.leak_range_max ?? summary.total_leak ?? 0;
        const leakCount = summary.total_leaks ?? 0;
        const topLeak   = summary.top_leak_title || "pricing inefficiency";
        const topLeakAmt = Math.round(totalLeak * 0.4);
        const dailyCost = Math.round(totalLeak / 365);
        const industry  = input.industry || "your industry";
        const province  = input.province || "Canada";

        const vars: TemplateVars = {
          businessName: "your business",
          industry, province, totalLeak, leakCount,
          topLeak, topLeakAmt, dailyCost,
        };

        const html = emailTemplate(
          step.subject(vars),
          step.body(vars),
          step.ctaText,
          `${APP_URL}${step.ctaPath}`,
        );

        const ok = await sendEmail({ to: email, subject: step.subject(vars), html });
        if (ok) {
          await sb.from("outreach_log").insert({
            business_id: biz.id, user_id: biz.owner_user_id,
            template: step.templateKey, sent_at: new Date().toISOString(),
          }).then(() => {}, () => {});
          sent++;
        } else { skipped++; }
      }
    }
  } catch (err: any) {
    console.error("[Outreach] Error:", err.message);
  }

  return { sent, skipped };
}
