// =============================================================================
// lib/ai/business-context.ts
// Assembles full business context for the advisor chat system prompt.
// Server-side only — never exposed to the browser.
// All queries run in parallel. Any failure is non-fatal.
// Context is capped at ~1,800 tokens to leave room for conversation.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPrescanContext } from "./prescan-context";

export interface BusinessFinding {
  title: string;
  category: string;
  severity: string;
  annual_leak?: number;
  potential_savings?: number;
}

export interface OpenTask {
  title: string;
  action: string;
  savings_monthly: number;
  effort: string;
  status: string;
  category: string;
}

export interface CompletedTask {
  title: string;
  savings_monthly: number;
  completed_at: string;
}

export interface LiveScoreContext {
  current:             number | null;
  delta:               number | null;
  lastDiagnosticScore: number | null;
  daysSinceDiagnostic: number | null;
  needsRescan:         boolean;
}

export interface PrescanSummary {
  completedAt:            string;
  industry:               string;
  province:               string;
  topLeaks:               Array<{ category: string; title: string; estimatedMonthlyLoss: number }>;
  totalEstimatedLoss:     number;
  daysSincePrescan:       number;
  diagnosticConfirmedCount: number | null;
}

export interface RatiosContext {
  current_ratio:     number | null;
  dscr:              number | null;
  gross_margin_pct:  number | null;
  ebitda_margin_pct: number | null;
  dso_days:          number | null;
  dpo_days:          number | null;
  debt_to_equity:    number | null;
  data_completeness: number;
}

export interface BreakEvenContext {
  break_even_revenue: number;
  current_revenue: number;
  safety_margin: number;
  safety_margin_pct: number;
  data_source: string;
}

export interface UpcomingDeadline {
  title: string;
  due_date: string;
  category: string;
  risk_level: string;
}

export interface BusinessContext {
  business: {
    id: string;
    name: string;
    industry: string;
    province: string;
    monthly_revenue: number;
    annual_revenue: number;
    employees: number;
    structure: string;
  };
  latest_report: {
    score: number;
    tier: string;
    completed_at: string;
    top_findings: BusinessFinding[];
  } | null;
  open_tasks: OpenTask[];
  completed_tasks: CompletedTask[];
  recovery: {
    recovered: number;
    available: number;
    tasks_completed: number;
  };
  upcoming_deadlines: UpcomingDeadline[];
  tier: "solo" | "business" | "enterprise";
  break_even: BreakEvenContext | null;
  ratios: RatiosContext | null;
  prescan: PrescanSummary | null;
  liveScore: LiveScoreContext | null;
}

// Minimal context for when DB queries fail
function emptyContext(businessId: string): BusinessContext {
  return {
    business: { id: businessId, name: "this business", industry: "small business", province: "Canada", monthly_revenue: 0, annual_revenue: 0, employees: 0, structure: "" },
    latest_report: null,
    open_tasks: [],
    completed_tasks: [],
    recovery: { recovered: 0, available: 0, tasks_completed: 0 },
    upcoming_deadlines: [],
    tier: "solo",
    break_even: null,
    ratios: null,
    prescan: null,
    liveScore: null,
  };
}

export async function buildBusinessContext(
  businessId: string,
  userId: string
): Promise<BusinessContext> {
  if (!businessId || !userId) return emptyContext(businessId || "");

  try {
    // All queries in parallel — 3-second timeout on the whole bundle
    const [profileRes, reportRes, tasksRes, snapRes, obligRes, bizRes, beRes, ratioRes, prescanCtxRes, liveScoreRes] = await Promise.all([
      // 1. Business profile
      supabaseAdmin
        .from("business_profiles")
        .select("business_name, industry, industry_label, province, annual_revenue, exact_annual_revenue, employee_count, business_structure")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .maybeSingle()
        .then(r => r.data),

      // 2. Latest completed diagnostic report
      supabaseAdmin
        .from("diagnostic_reports")
        .select("overall_score, tier, completed_at, result_json")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(r => r.data),

      // 3. Open + in-progress tasks (Build 02)
      supabaseAdmin
        .from("diagnostic_tasks")
        .select("title, action, savings_monthly, effort, status, category")
        .eq("business_id", businessId)
        .in("status", ["open", "in_progress"])
        .order("priority", { ascending: true })
        .order("savings_monthly", { ascending: false })
        .limit(10)
        .then(r => r.data || []),

      // 4. Recovery snapshot (Build 03) — fallback to live calc if missing
      supabaseAdmin
        .from("recovery_snapshots")
        .select("savings_recovered, savings_available, tasks_completed")
        .eq("business_id", businessId)
        .order("month", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(r => r.data),

      // 5. Upcoming obligations (next 60 days)
      supabaseAdmin
        .from("user_obligations")
        .select("obligation_slug, next_deadline, status, obligation_rules ( title, category, risk_level )")
        .eq("user_id", userId)
        .in("status", ["upcoming", "overdue"])
        .order("next_deadline", { ascending: true })
        .limit(5)
        .then(r => r.data || []),

      // 6. Tier from businesses table
      supabaseAdmin
        .from("businesses")
        .select("tier")
        .eq("id", businessId)
        .eq("owner_user_id", userId)
        .maybeSingle()
        .then(r => r.data),

      // 7. Break-even data (Build 112)
      supabaseAdmin
        .from("break_even_data")
        .select("break_even_revenue, current_revenue, safety_margin, safety_margin_pct, data_source")
        .eq("business_id", businessId)
        .maybeSingle()
        .then(r => r.data),

      // 8. Financial ratios (Build 142)
      supabaseAdmin
        .from("financial_ratios")
        .select("current_ratio, dscr, gross_margin_pct, ebitda_margin_pct, dso_days, dpo_days, debt_to_equity, data_completeness_pct")
        .eq("business_id", businessId)
        .order("period_month", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(r => r.data),

      // 9. Prescan context (Build 13)
      getPrescanContext(businessId, userId).catch(() => null),

      // 10. Live score (Build 04)
      supabaseAdmin
        .from("score_history")
        .select("score, score_delta, calculated_at")
        .eq("business_id", businessId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(r => r.data),
    ]);

    // -- Profile
    const profile = profileRes;
    const annualRevenue = (profile?.exact_annual_revenue ?? profile?.annual_revenue) ?? 0;
    const monthlyRevenue = Math.round(annualRevenue / 12);

    // -- Tier resolution
    const rawTier = (bizRes?.tier || "free").toLowerCase();
    const tier: BusinessContext["tier"] =
      rawTier === "enterprise" ? "enterprise"
      : ["business", "growth", "team", "corp", "advisor"].includes(rawTier) ? "business"
      : "solo";

    // -- Latest report findings (cap at 5)
    let latestReport: BusinessContext["latest_report"] = null;
    if (reportRes) {
      const rj = reportRes.result_json as any;
      const findings: BusinessFinding[] = (rj?.findings || [])
        .slice(0, 5)
        .map((f: any) => ({
          title: String(f.title || f.finding || "").slice(0, 80),
          category: String(f.category || "general").slice(0, 40),
          severity: String(f.severity || "medium"),
          annual_leak: f.annual_leak ?? f.potential_savings ?? 0,
          potential_savings: f.potential_savings ?? f.annual_leak ?? 0,
        }));

      latestReport = {
        score: reportRes.overall_score ?? rj?.scores?.overall ?? 0,
        tier: reportRes.tier || "solo",
        completed_at: reportRes.completed_at || "",
        top_findings: findings,
      };
    }

    // -- Recovery: use snapshot or fall back to live task calc
    let recovery = { recovered: 0, available: 0, tasks_completed: 0 };
    if (snapRes) {
      recovery = {
        recovered: Math.round(snapRes.savings_recovered ?? 0),
        available: Math.round(snapRes.savings_available ?? 0),
        tasks_completed: snapRes.tasks_completed ?? 0,
      };
    } else if (tasksRes.length > 0) {
      // Live fallback from tasks
      const { data: allTasks } = await supabaseAdmin
        .from("diagnostic_tasks")
        .select("status, savings_monthly")
        .eq("business_id", businessId)
        .neq("status", "dismissed");

      const at = allTasks || [];
      recovery = {
        recovered: Math.round(at.filter(t => t.status === "done").reduce((s, t) => s + (t.savings_monthly ?? 0), 0)),
        available: Math.round(at.filter(t => ["open", "in_progress"].includes(t.status)).reduce((s, t) => s + (t.savings_monthly ?? 0), 0)),
        tasks_completed: at.filter(t => t.status === "done").length,
      };
    }

    // -- Completed tasks (top 5 by savings)
    const { data: doneTasks } = await supabaseAdmin
      .from("diagnostic_tasks")
      .select("title, savings_monthly, completed_at")
      .eq("business_id", businessId)
      .eq("status", "done")
      .order("savings_monthly", { ascending: false })
      .limit(5);

    // -- Deadlines
    const deadlines: UpcomingDeadline[] = (obligRes || [])
      .filter((o: any) => o.next_deadline)
      .map((o: any) => ({
        title: (o.obligation_rules as any)?.title || o.obligation_slug,
        due_date: o.next_deadline,
        category: (o.obligation_rules as any)?.category || "general",
        risk_level: (o.obligation_rules as any)?.risk_level || "medium",
      }));

    return {
      business: {
        id: businessId,
        name: profile?.business_name || "your business",
        industry: profile?.industry_label || profile?.industry || "small business",
        province: profile?.province || "Canada",
        monthly_revenue: monthlyRevenue,
        annual_revenue: annualRevenue,
        employees: (profile?.employee_count) ?? 0,
        structure: profile?.business_structure || "",
      },
      latest_report: latestReport,
      open_tasks: (tasksRes as OpenTask[]).slice(0, 8),
      completed_tasks: (doneTasks || []).slice(0, 5) as CompletedTask[],
      recovery,
      upcoming_deadlines: deadlines.slice(0, 5),
      tier,
      liveScore: liveScoreRes ? {
        current:             liveScoreRes.score ?? null,
        delta:               liveScoreRes.score_delta ?? null,
        lastDiagnosticScore: latestReport?.score ?? null,
        daysSinceDiagnostic: latestReport?.completed_at
          ? Math.floor((Date.now() - new Date(latestReport.completed_at).getTime()) / 86400000)
          : null,
        needsRescan: latestReport?.completed_at
          ? Math.floor((Date.now() - new Date(latestReport.completed_at).getTime()) / 86400000) >= 90
          : false,
      } : null,
      prescan: prescanCtxRes ? {
        completedAt:          prescanCtxRes.completedAt.toISOString(),
        industry:             prescanCtxRes.industry,
        province:             prescanCtxRes.province,
        topLeaks:             prescanCtxRes.topLeaks.map(l => ({
          category: l.category, title: l.title, estimatedMonthlyLoss: l.estimatedMonthlyLoss,
        })),
        totalEstimatedLoss:   prescanCtxRes.totalEstimatedLoss,
        daysSincePrescan:     prescanCtxRes.daysSincePrescan,
        diagnosticConfirmedCount: null, // enriched by linker after diagnostic runs
      } : null,
      ratios: ratioRes ? {
        current_ratio:     ratioRes.current_ratio     ?? null,
        dscr:              ratioRes.dscr              ?? null,
        gross_margin_pct:  ratioRes.gross_margin_pct  ?? null,
        ebitda_margin_pct: ratioRes.ebitda_margin_pct ?? null,
        dso_days:          ratioRes.dso_days          ?? null,
        dpo_days:          ratioRes.dpo_days          ?? null,
        debt_to_equity:    ratioRes.debt_to_equity    ?? null,
        data_completeness: ratioRes.data_completeness_pct ?? 0,
      } : null,
      break_even: beRes ? {
        break_even_revenue: Math.round(beRes.break_even_revenue ?? 0),
        current_revenue:    Math.round(beRes.current_revenue ?? 0),
        safety_margin:      Math.round(beRes.safety_margin ?? 0),
        safety_margin_pct:  Math.round((beRes.safety_margin_pct ?? 0) * 10) / 10,
        data_source:        beRes.data_source || "manual",
      } : null,
    };
  } catch (err: any) {
    console.error("[buildBusinessContext] Error:", err.message);
    return emptyContext(businessId);
  }
}
