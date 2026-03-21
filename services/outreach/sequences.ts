// =============================================================================
// OUTREACH SEQUENCES — Automated email drip campaigns
// =============================================================================
// Day 0: Scan complete (already handled)
// Day 1: "Quick wins" — top 3 easiest fixes
// Day 3: "You're losing $X/day" — urgency nudge
// Day 7: Case study — "How [industry] saved $47K"
// Day 14: Discount offer (if still on free plan)
// Day 30: Monthly re-engagement
// =============================================================================
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface SequenceStep {
  dayOffset: number;
  template: string;
  subject: string;
  onlyFree?: boolean; // Only send to free-plan users
}

const SEQUENCE: SequenceStep[] = [
  { dayOffset: 1, template: "quick_wins", subject: "Your 3 quickest wins — start saving today" },
  { dayOffset: 3, template: "urgency", subject: "You're losing ${dailyLoss}/day" },
  { dayOffset: 7, template: "case_study", subject: "How a {industry} saved $47,200/yr" },
  { dayOffset: 14, template: "discount", subject: "50% off Pro — this week only", onlyFree: true },
  { dayOffset: 30, template: "reengage", subject: "Your monthly leak check-in" },
];

export async function processOutreachSequences(): Promise<{ sent: number; skipped: number }> {
  let sent = 0, skipped = 0;

  try {
    // Get all businesses with a scan
    const { data: businesses } = await sb.from("businesses").select("id, name, industry, plan, createdAt");
    if (!businesses) return { sent, skipped };

    const now = Date.now();

    for (const biz of businesses) {
      const bizAge = Math.floor((now - new Date(biz.createdAt).getTime()) / 86400000);

      for (const step of SEQUENCE) {
        // Check if today matches the offset
        if (bizAge !== step.dayOffset) continue;
        if (step.onlyFree && biz.plan !== "free") { skipped++; continue; }

        // Check if already sent
        const { data: existing } = await sb.from("outreach_log").select("id").eq("businessId", biz.id).eq("template", step.template).limit(1);
        if (existing && existing.length > 0) { skipped++; continue; }

        // Get user email
        const { data: member } = await sb.from("business_members").select("userId, users(email)").eq("businessId", biz.id).limit(1).single();
        if (!member?.users) { skipped++; continue; }
        const email = (member.users as any).email;

        // Get leak data for template
        const { data: leaks } = await sb.from("leaks").select("title, annualImpact, severity, fixAction").eq("businessId", biz.id).neq("status", "FIXED").order("annualImpact", { ascending: false });
        const totalLeaking = (leaks || []).reduce((s, l) => s + (l.annualImpact ?? 0), 0);
        const dailyLoss = Math.round(totalLeaking / 365);

        // Build email content
        const { emailTemplate, sendEmail } = await import("@/services/email/service");
        let body = "";
        let subject = step.subject.replace("{dailyLoss}", `$${dailyLoss}`).replace("{industry}", biz.industry || "business");

        switch (step.template) {
          case "quick_wins":
            const top3 = (leaks || []).slice(0, 3);
            body = `<p>Here are your 3 quickest wins to start saving money today:</p>
              ${top3.map((l, i) => `<p><strong>${i + 1}. ${l.title}</strong> — $${l.annualImpact?.toLocaleString()}/yr<br/><span style="color:#666">${l.fixAction || "Fix this to save money"}</span></p>`).join("")}
              <p>Total potential savings: <strong style="color:#00c853">$${top3.reduce((s, l) => s + (l.annualImpact ?? 0), 0).toLocaleString()}/yr</strong></p>`;
            break;
          case "urgency":
            body = `<p>Every day you wait, you're losing approximately <strong style="color:#ff3d57">$${dailyLoss}</strong>.</p>
              <p>That's <strong>$${(dailyLoss * 7).toLocaleString()}/week</strong> or <strong>$${(dailyLoss * 30).toLocaleString()}/month</strong> walking out the door.</p>
              <p>Your biggest leak — <strong>${leaks?.[0]?.title || "unknown"}</strong> — alone costs $${(leaks?.[0]?.annualImpact ?? 0).toLocaleString()}/yr.</p>`;
            break;
          case "case_study":
            body = `<p>A ${biz.industry || "business"} just like yours used Fruxal to find $47,200 in annual leaks. Within 30 days, they had fixed their top 3 issues and were already saving $18,400/yr.</p>
              <p><strong>Their #1 fix?</strong> Renegotiating their payment processing rate — a 20-minute phone call that saved $7,200/yr.</p>
              <p>You have ${(leaks || []).length} open leaks totaling $${(totalLeaking ?? 0).toLocaleString()}/yr. What if you fixed just one this week?</p>`;
            break;
          case "discount":
            body = `<p>We noticed you haven't upgraded yet, so here's something special:</p>
              <p style="text-align:center;padding:16px;background:#f0f9ff;border-radius:12px"><strong style="font-size:24px;color:#7c4dff">50% OFF Pro</strong><br/>First month just $24.50</p>
              <p>With Pro you get: all ${(leaks || []).length} leaks unlocked, fix recommendations, AI intelligence, reports & exports.</p>
              <p>Your leaks are costing $${(totalLeaking ?? 0).toLocaleString()}/yr. Pro pays for itself in the first hour.</p>`;
            break;
          case "reengage":
            body = `<p>It's been a month since your last scan. Business conditions change — new costs creep in, rates shift, and new leaks appear.</p>
              <p>A quick re-scan takes 30 seconds and might find new savings opportunities.</p>`;
            break;
        }

        const html = emailTemplate(subject, body, "Open Dashboard", `${process.env.NEXTAUTH_URL || "https://fruxal.com"}/dashboard`);
        await sendEmail({ to: email, subject, html });

        // Log it
        await sb.from("outreach_log").insert({
          id: `outreach_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          businessId: biz.id,
          template: step.template,
          sentAt: new Date().toISOString(),
        }).then(null, () => {});

        sent++;
      }
    }
  } catch (e) {
    console.error("Outreach error:", e);
  }

  return { sent, skipped };
}
