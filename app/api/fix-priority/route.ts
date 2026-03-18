// =============================================================================
// GET /api/fix-priority — "What to Fix First" Engine
// =============================================================================
// Takes user's detected leaks and ranks them by fastest ROI:
//   priority_score = annual_impact / (effort_days × difficulty)
// Groups: "This Week" / "This Month" / "This Quarter" / "Long-Term"
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

// ─── Fix Speed Classification ─────────────────────────────────────────────────
// Keywords in title/category → estimated days to fix and effort score (1-10)
const SPEED_RULES: Array<{ match: RegExp; days: number; effort: number; action: string }> = [
  // INSTANT (1-3 days) — change a number, flip a switch
  { match: /pric(e|ing)|raise.*price|charg(e|ing).*more|under.?pric|markup|mark.?up/i, days: 1, effort: 1, action: "Raise your prices" },
  { match: /no.?show.*polic|cancellation.*polic|cancellation.*fee|late.*fee|late pickup/i, days: 1, effort: 1, action: "Set a no-show/cancellation policy" },
  { match: /deposit|collect.*payment.*upfront|payment.*time.*service/i, days: 1, effort: 1, action: "Require deposits or payment upfront" },
  { match: /discount.*polic|stop.*discount|discount.*track/i, days: 2, effort: 1, action: "Tighten your discount policy" },
  { match: /emergency.*surcharge|surcharge/i, days: 1, effort: 1, action: "Add surcharges for rush/emergency work" },
  { match: /scope.*creep|change.*order|extra.*work.*charg/i, days: 2, effort: 2, action: "Charge for scope changes in writing" },

  // QUICK WINS (3-7 days) — sign up, turn on, ask for something
  { match: /google.*review|review.*google|ask.*review|4\.5.*star/i, days: 3, effort: 2, action: "Start asking every customer for a Google review" },
  { match: /google.*business|google.*profile|google.*listing/i, days: 3, effort: 2, action: "Optimize your Google Business listing" },
  { match: /gift.*card/i, days: 3, effort: 2, action: "Start selling gift cards" },
  { match: /upsell|add.?on|cross.?sell|bundle|package|suggest/i, days: 5, effort: 3, action: "Train staff to suggest extras on every sale" },
  { match: /referral.*program|reward.*referr/i, days: 5, effort: 3, action: "Launch a referral reward program" },
  { match: /loyalty|reward.*program|member.*program/i, days: 7, effort: 3, action: "Start a loyalty/rewards program" },
  { match: /rebook|re.?book|follow.*up.*auto|auto.*follow/i, days: 5, effort: 3, action: "Set up automatic follow-up messages" },
  { match: /reminder.*appoint|appoint.*remind|text.*remind|email.*remind/i, days: 3, effort: 2, action: "Turn on automatic appointment reminders" },
  { match: /abandoned.*cart|cart.*abandon/i, days: 5, effort: 3, action: "Set up abandoned cart emails" },
  { match: /insurance.*quot|shop.*insurance|compare.*insurance/i, days: 5, effort: 2, action: "Get 3 competing insurance quotes" },
  { match: /payment.*process|credit.*card.*rate|processing.*rate/i, days: 5, effort: 2, action: "Negotiate lower payment processing fees" },

  // MEDIUM (1-4 weeks) — needs planning, vendor calls, or training
  { match: /vendor|supplier|negotiat.*vendor|renegotiat/i, days: 14, effort: 4, action: "Renegotiate with your top vendors" },
  { match: /lease.*negotiat|rent.*negotiat/i, days: 21, effort: 5, action: "Renegotiate your lease terms" },
  { match: /marketing.*email|email.*market|text.*market|sms.*market/i, days: 14, effort: 4, action: "Start a monthly email/text campaign" },
  { match: /website|mobile.*friendly|site.*speed|load.*fast/i, days: 21, effort: 5, action: "Fix and speed up your website" },
  { match: /social.*media|digital.*market|online.*advertis/i, days: 21, effort: 5, action: "Start targeted online advertising" },
  { match: /brand|consistent.*brand/i, days: 21, effort: 5, action: "Clean up your branding across all platforms" },
  { match: /schedul.*software|invoic.*software|integrat.*software|crm|one.*system/i, days: 14, effort: 4, action: "Get an all-in-one business management tool" },
  { match: /tax.*review|tax.*deduct|tax.*profession|accountant|cpa/i, days: 7, effort: 3, action: "Schedule a tax review with your accountant" },
  { match: /energy.*audit|led|smart.*thermostat|electricity|utility/i, days: 14, effort: 3, action: "Do an energy audit and fix the easy stuff" },
  { match: /mainten.*plan|service.*agreement|service.*contract|recurr.*revenue|member.*plan/i, days: 21, effort: 5, action: "Create a maintenance plan or membership offer" },
  { match: /contract.*review|contract.*expir|auto.?renew/i, days: 7, effort: 3, action: "Review all your contracts before they auto-renew" },
  { match: /backup|disaster.*recov|cybersecur|data.*privac/i, days: 14, effort: 4, action: "Set up data backups and basic security" },

  // LONGER (1-3 months) — systems, people, structure
  { match: /staff.*turnover|employee.*turnov|retention.*strat|hire|recruit/i, days: 60, effort: 7, action: "Fix your hiring and retention strategy" },
  { match: /sop|standard.*operating|training.*program|documented.*process/i, days: 45, effort: 6, action: "Write down how things get done (SOPs)" },
  { match: /cross.?train|backup.*person|backup.*employee/i, days: 30, effort: 5, action: "Cross-train your team on each other's jobs" },
  { match: /business.*plan|quarterly.*goal|written.*plan/i, days: 30, effort: 5, action: "Create a simple business plan with quarterly goals" },
  { match: /cash.*flow.*forecast|13.*week|rolling.*forecast/i, days: 14, effort: 4, action: "Build a 13-week cash flow forecast" },
  { match: /pipeline|sales.*track|lead.*track|stage.*track/i, days: 21, effort: 5, action: "Set up a sales tracking system" },
  { match: /partner.*complement|referral.*partner|strategic.*partner/i, days: 45, effort: 6, action: "Build referral partnerships with complementary businesses" },
  { match: /business.*structure|llc|s.?corp|entity|sole.*prop/i, days: 30, effort: 4, action: "Review your business structure with a tax advisor" },
  { match: /government.*grant|tax.*credit|incentive|sr.?ed/i, days: 30, effort: 5, action: "Research government grants and tax credits" },
  { match: /separation.*duties|reconcil|internal.*theft|cash.*handl/i, days: 21, effort: 5, action: "Set up financial checks and balances" },
  { match: /business.*run.*without.*you|operate.*without|delegation/i, days: 90, effort: 8, action: "Build systems so the business runs without you" },
  { match: /slow.*season|seasonal/i, days: 45, effort: 6, action: "Create a slow-season revenue plan" },
];

// Default for anything not matched
const DEFAULT_SPEED = { days: 21, effort: 5, action: "Address this issue" };

function classifyFix(title: string, category: string): { days: number; effort: number; action: string } {
  const text = `${title} ${category}`;
  for (const rule of SPEED_RULES) {
    if (rule.match.test(text)) return rule;
  }
  return DEFAULT_SPEED;
}

// ─── Tier Assignment ──────────────────────────────────────────────────────────
type Tier = "this_week" | "this_month" | "this_quarter" | "long_term";
function getTier(days: number): Tier {
  if (days <= 7) return "this_week";
  if (days <= 30) return "this_month";
  if (days <= 90) return "this_quarter";
  return "long_term";
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const supabase = getSupabase();

    // Get user's business
    const { data: membership } = await supabase
      .from("business_members")
      .select("businessId")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    // Get all detected leaks for this business
    const { data: leaks } = await supabase
      .from("detected_leaks")
      .select("*")
      .eq("businessId", membership.businessId)
      .order("annualImpact", { ascending: false });

    if (!leaks || leaks.length === 0) {
      return NextResponse.json({ 
        tiers: { this_week: [], this_month: [], this_quarter: [], long_term: [] },
        summary: { totalSavings: 0, quickWinSavings: 0, actionCount: 0 },
      });
    }

    // Score and classify each leak
    const scored = leaks
      .filter(l => (l.status || "OPEN").toUpperCase() !== "FIXED")
      .map(leak => {
        const fix = classifyFix(leak.title || "", leak.category || "");
        const impact = leak.annualImpact || 0;
        const priority_score = impact / Math.max(1, fix.days * fix.effort);
        const tier = getTier(fix.days);
        const monthlyImpact = Math.round(impact / 12);

        return {
          id: leak.id,
          title: leak.title,
          category: leak.category,
          severity: leak.severity,
          annualImpact: impact,
          monthlyImpact,
          status: leak.status,
          source: leak.dataSource || leak.source || "scan",
          confidence: leak.confidence || 0.7,
          fix: {
            action: fix.action,
            days: fix.days,
            effort: fix.effort,
            effort_label: fix.effort <= 2 ? "Easy" : fix.effort <= 5 ? "Medium" : "Hard",
            tier,
            tier_label: tier === "this_week" ? "This Week" : tier === "this_month" ? "This Month" : tier === "this_quarter" ? "This Quarter" : "Long Term",
          },
          priority_score: Math.round(priority_score),
          roi_per_day: Math.round(impact / 365),
          first_month_savings: tier === "this_week" ? monthlyImpact : tier === "this_month" ? Math.round(monthlyImpact * 0.5) : 0,
        };
      })
      .sort((a, b) => b.priority_score - a.priority_score);

    // Group by tier
    const tiers = {
      this_week: scored.filter(s => s.fix.tier === "this_week"),
      this_month: scored.filter(s => s.fix.tier === "this_month"),
      this_quarter: scored.filter(s => s.fix.tier === "this_quarter"),
      long_term: scored.filter(s => s.fix.tier === "long_term"),
    };

    // Summary stats
    const totalSavings = scored.reduce((s, l) => s + l.annualImpact, 0);
    const quickWinSavings = tiers.this_week.reduce((s, l) => s + l.annualImpact, 0);
    const monthOneSavings = [...tiers.this_week, ...tiers.this_month].reduce((s, l) => s + l.first_month_savings, 0);

    // Cumulative savings timeline (monthly)
    const timeline = [];
    let cumulative = 0;
    for (let month = 1; month <= 12; month++) {
      // Quick wins kick in month 1
      if (month >= 1) cumulative += tiers.this_week.reduce((s, l) => s + l.monthlyImpact, 0);
      // Month fixes kick in month 2
      if (month >= 2) cumulative += tiers.this_month.reduce((s, l) => s + l.monthlyImpact, 0);
      // Quarter fixes kick in month 4
      if (month >= 4) cumulative += tiers.this_quarter.reduce((s, l) => s + l.monthlyImpact, 0);
      // Long term kick in month 7
      if (month >= 7) cumulative += tiers.long_term.reduce((s, l) => s + l.monthlyImpact, 0);
      timeline.push({ month, savings: cumulative });
    }

    return NextResponse.json({
      tiers,
      summary: {
        totalSavings,
        quickWinSavings,
        monthOneSavings,
        actionCount: scored.length,
        quickWinCount: tiers.this_week.length,
      },
      timeline,
    });
  } catch (error: any) {
    console.error("[Fix Priority API]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
