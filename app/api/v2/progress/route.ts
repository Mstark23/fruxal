// GET & POST /api/v2/progress — User progress, streaks, milestones, celebrations
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ---------------------------------------------------------------------------
// Milestone definitions (server-side mirror of MilestoneCards.tsx)
// ---------------------------------------------------------------------------
const MILESTONE_DEFINITIONS = [
  { id: "first_login",      icon: "🚀", label: "First Steps",     description: "Completed onboarding",                    condition: "onboarding_complete" },
  { id: "first_scan",       icon: "🔍", label: "First Scan",      description: "Ran your first prescan",                   condition: "prescan_count >= 1" },
  { id: "first_diagnostic", icon: "🔬", label: "Deep Dive",       description: "Ran your first AI diagnostic",             condition: "diagnostic_count >= 1" },
  { id: "first_obligation", icon: "✅", label: "On It",            description: "Completed your first obligation",          condition: "obligations_completed >= 1" },
  { id: "five_obligations", icon: "📋", label: "Diligent",         description: "Completed 5 obligations",                  condition: "obligations_completed >= 5" },
  { id: "all_critical",     icon: "🛡️", label: "Safe & Sound",    description: "All critical obligations up to date",      condition: "critical_overdue == 0" },
  { id: "zero_overdue",     icon: "⭐", label: "Perfect Record",   description: "Zero overdue obligations",                 condition: "overdue_count == 0" },
  { id: "first_leak",       icon: "🔧", label: "Plugged",          description: "Fixed your first money leak",              condition: "leaks_fixed >= 1" },
  { id: "five_leaks",       icon: "💧", label: "Leak Hunter",      description: "Fixed 5 money leaks",                      condition: "leaks_fixed >= 5" },
  { id: "saved_1k",         icon: "💵", label: "$1K Saved",         description: "Saved $1,000+ per year",                   condition: "total_savings >= 1000" },
  { id: "saved_5k",         icon: "💰", label: "$5K Saved",         description: "Saved $5,000+ per year",                   condition: "total_savings >= 5000" },
  { id: "saved_10k",        icon: "🤑", label: "$10K Club",         description: "Saved $10,000+ per year",                  condition: "total_savings >= 10000" },
  { id: "saved_25k",        icon: "🏆", label: "Leak Master",       description: "Saved $25,000+ per year",                  condition: "total_savings >= 25000" },
  { id: "streak_3",         icon: "🔥", label: "On Fire",           description: "3-day streak",                             condition: "streak >= 3" },
  { id: "streak_7",         icon: "🔥", label: "Week Warrior",      description: "7-day streak",                             condition: "streak >= 7" },
  { id: "streak_30",        icon: "🔥", label: "Monthly Master",    description: "30-day streak",                            condition: "streak >= 30" },
  { id: "first_program",    icon: "🏛️", label: "Free Money",       description: "Applied for your first government program", condition: "programs_applied >= 1" },
  { id: "score_50",         icon: "📈", label: "Getting There",     description: "Health score reached 50+",                 condition: "health_score >= 50" },
  { id: "score_70",         icon: "📈", label: "Healthy",           description: "Health score reached 70+",                 condition: "health_score >= 70" },
  { id: "score_85",         icon: "🌟", label: "Optimized",         description: "Health score reached 85+",                 condition: "health_score >= 85" },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

/** Evaluate milestone conditions against current stats */
function evaluateMilestones(stats: Record<string, number>): { id: string; earned_at: string }[] {
  const now = new Date().toISOString();
  const earned: { id: string; earned_at: string }[] = [];

  for (const m of MILESTONE_DEFINITIONS) {
    if (m.condition === "onboarding_complete") {
      // Always considered earned once the user exists
      earned.push({ id: m.id, earned_at: now });
      continue;
    }

    // Parse condition: "field >= value" or "field == value"
    const match = m.condition.match(/^(\w+)\s*(>=|==)\s*(\d+)$/);
    if (!match) continue;

    const [, field, op, rawVal] = match;
    const val = Number(rawVal);
    const actual = stats[field] ?? 0;

    if (op === ">=" && actual >= val) {
      earned.push({ id: m.id, earned_at: now });
    } else if (op === "==" && actual === val) {
      earned.push({ id: m.id, earned_at: now });
    }
  }

  return earned;
}

/** Safe query wrapper — returns null on error */
async function safe<T = any>(promise: Promise<{ data: T | null; error: any }>): Promise<T | null> {
  try {
    const { data, error } = await promise;
    if (error) console.error("[progress] query error:", error.message);
    return data;
  } catch (e: any) {
    console.error("[progress] query exception:", e.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Build full progress state for a business
// ---------------------------------------------------------------------------
async function buildProgressState(userId: string, businessId: string, biz: any) {
  const today = todayStr();
  const weekAgo = dateNDaysAgo(7);

  // Run all queries in parallel
  const [
    tasks,
    obligations,
    diagnosticReports,
    latestScore,
    completedGoals,
    prescans,
    programsApplied,
    timelineWeek,
  ] = await Promise.all([
    // 1. diagnostic_tasks — count by status
    safe(
      supabaseAdmin
        .from("diagnostic_tasks")
        .select("status")
        .eq("business_id", businessId)
    ),
    // 2. user_obligations — count completed, overdue, critical_overdue
    safe(
      supabaseAdmin
        .from("user_obligations")
        .select("status, priority, due_date")
        .eq("user_id", userId)
    ),
    // 3. diagnostic_reports completed
    safe(
      supabaseAdmin
        .from("diagnostic_reports")
        .select("id")
        .eq("business_id", businessId)
        .eq("status", "completed")
    ),
    // 4. score_history — latest score
    safe(
      supabaseAdmin
        .from("score_history")
        .select("overall_score")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
    ),
    // 5. business_goals — completed
    safe(
      supabaseAdmin
        .from("business_goals")
        .select("id")
        .eq("business_id", businessId)
        .eq("status", "completed")
    ),
    // 6. prescan count (diagnostic_reports with type prescan, or business_timeline prescan events)
    safe(
      supabaseAdmin
        .from("business_timeline")
        .select("id")
        .eq("business_id", businessId)
        .eq("event_type", "prescan")
    ),
    // 7. programs applied (grant_applied events)
    safe(
      supabaseAdmin
        .from("business_timeline")
        .select("id")
        .eq("business_id", businessId)
        .eq("event_type", "grant_applied")
    ),
    // 8. timeline events last 7 days for week_map
    safe(
      supabaseAdmin
        .from("business_timeline")
        .select("event_date")
        .eq("business_id", businessId)
        .gte("event_date", weekAgo + "T00:00:00Z")
    ),
  ]);

  // --- Compute task counts ---
  let leaksFixed = biz?.leaks_fixed ?? 0;
  let totalLeaks = 0;
  if (tasks && Array.isArray(tasks)) {
    totalLeaks = tasks.length;
    const doneCount = tasks.filter((t: any) => t.status === "done" || t.status === "completed").length;
    // Use whichever is higher — biz.leaks_fixed or task count
    if (doneCount > leaksFixed) leaksFixed = doneCount;
  }

  // --- Obligation counts ---
  let obligationsCompleted = 0;
  let overdueCount = 0;
  let criticalOverdue = 0;
  if (obligations && Array.isArray(obligations)) {
    for (const ob of obligations) {
      if (ob.status === "completed" || ob.status === "done") {
        obligationsCompleted++;
      } else if (ob.status !== "completed" && ob.due_date && ob.due_date < today) {
        overdueCount++;
        if (ob.priority === "critical" || ob.priority === "high") {
          criticalOverdue++;
        }
      }
    }
  }

  // --- Diagnostic & prescan counts ---
  const diagnosticCount = Array.isArray(diagnosticReports) ? diagnosticReports.length : 0;
  const prescanCount = Array.isArray(prescans) ? prescans.length : 0;
  const programsAppliedCount = Array.isArray(programsApplied) ? programsApplied.length : 0;

  // --- Health score ---
  const healthScore = (Array.isArray(latestScore) && latestScore.length > 0)
    ? (latestScore[0].overall_score ?? 0)
    : 0;

  // --- Streak ---
  const streakDays = biz?.streak_days ?? 0;
  const lastActive = biz?.last_active_date ?? null;
  const todayActive = lastActive === today;
  const longestStreak = biz?.longest_streak ?? streakDays;

  // --- Week map (last 7 days, index 0 = 6 days ago, index 6 = today) ---
  const weekMap = [false, false, false, false, false, false, false];
  if (timelineWeek && Array.isArray(timelineWeek)) {
    const activeDays = new Set(
      timelineWeek.map((e: any) => (e.event_date ? e.event_date.split("T")[0] : ""))
    );
    // Also count today if business is active today
    if (todayActive) activeDays.add(today);
    for (let i = 0; i < 7; i++) {
      const d = dateNDaysAgo(6 - i);
      weekMap[i] = activeDays.has(d);
    }
  }
  // Even if timeline query failed, mark today
  if (todayActive) weekMap[6] = true;

  // --- Total savings ---
  const totalSavings = biz?.total_recovered ?? 0;

  // --- Build stats for milestone evaluation ---
  const stats: Record<string, number> = {
    prescan_count: prescanCount,
    diagnostic_count: diagnosticCount,
    obligations_completed: obligationsCompleted,
    critical_overdue: criticalOverdue,
    overdue_count: overdueCount,
    leaks_fixed: leaksFixed,
    total_savings: totalSavings,
    streak: streakDays,
    programs_applied: programsAppliedCount,
    health_score: healthScore,
  };

  const milestones = evaluateMilestones(stats);

  return {
    total_savings: totalSavings,
    leaks_fixed: leaksFixed,
    total_leaks: totalLeaks,
    obligations_completed: obligationsCompleted,
    overdue_count: overdueCount,
    critical_overdue: criticalOverdue,
    programs_applied: programsAppliedCount,
    diagnostic_count: diagnosticCount,
    prescan_count: prescanCount,
    streak: {
      current: streakDays,
      longest: longestStreak > streakDays ? longestStreak : streakDays,
      today_active: todayActive,
      week_map: weekMap,
    },
    milestones,
    health_score: healthScore,
  };
}

// ---------------------------------------------------------------------------
// GET /api/v2/progress
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const biz = await safe(
      supabaseAdmin
        .from("businesses")
        .select("id, streak_days, last_active_date, leaks_fixed, total_recovered, longest_streak")
        .eq("owner_user_id", userId)
        .single()
    );

    if (!biz) {
      return NextResponse.json({ success: true, data: emptyProgress() });
    }

    const progressData = await buildProgressState(userId, biz.id, biz);
    return NextResponse.json({ success: true, data: progressData });
  } catch (err: any) {
    console.error("[GET /api/v2/progress] Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/v2/progress
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    const { action, data } = body;

    // Fetch business
    const biz = await safe(
      supabaseAdmin
        .from("businesses")
        .select("id, streak_days, last_active_date, leaks_fixed, total_recovered, longest_streak")
        .eq("owner_user_id", userId)
        .single()
    );

    if (!biz) {
      return NextResponse.json({ success: false, error: "No business found" }, { status: 404 });
    }

    const businessId = biz.id;
    const today = todayStr();
    const yesterday = dateNDaysAgo(1);

    // -----------------------------------------------------------------------
    // 1. Snapshot milestones BEFORE update
    // -----------------------------------------------------------------------
    const beforeProgress = await buildProgressState(userId, businessId, biz);
    const beforeMilestoneIds = new Set(beforeProgress.milestones.map(m => m.id));

    // -----------------------------------------------------------------------
    // 2. Update streak
    // -----------------------------------------------------------------------
    let newStreakDays = biz.streak_days ?? 0;
    const lastActive = biz.last_active_date ?? null;

    if (lastActive !== today) {
      if (lastActive === yesterday) {
        // Streak continues
        newStreakDays += 1;
      } else if (lastActive && lastActive < yesterday) {
        // Streak broken — reset
        newStreakDays = 1;
      } else if (!lastActive) {
        newStreakDays = 1;
      }

      const longestStreak = Math.max(biz.longest_streak ?? 0, newStreakDays);

      await safe(
        supabaseAdmin
          .from("businesses")
          .update({
            streak_days: newStreakDays,
            last_active_date: today,
            longest_streak: longestStreak,
          })
          .eq("id", businessId)
      );

      // Update biz in-memory for progress rebuild
      biz.streak_days = newStreakDays;
      biz.last_active_date = today;
      biz.longest_streak = longestStreak;
    }

    // -----------------------------------------------------------------------
    // 3. Update counters based on action
    // -----------------------------------------------------------------------
    let celebration: any = null;

    if (action === "leak_fixed") {
      const savings = data?.savings ?? 0;
      const newLeaksFixed = (biz.leaks_fixed ?? 0) + 1;
      const newTotalRecovered = (biz.total_recovered ?? 0) + savings;

      await safe(
        supabaseAdmin
          .from("businesses")
          .update({
            leaks_fixed: newLeaksFixed,
            total_recovered: newTotalRecovered,
          })
          .eq("id", businessId)
      );

      biz.leaks_fixed = newLeaksFixed;
      biz.total_recovered = newTotalRecovered;

      celebration = {
        type: "leak_fixed",
        data: {
          title: data?.title ?? "Leak Fixed!",
          savings,
        },
      };
    }

    if (action === "score_up" && data?.oldScore != null && data?.newScore != null) {
      celebration = {
        type: "score_up",
        data: {
          oldScore: data.oldScore,
          newScore: data.newScore,
        },
      };
    }

    // -----------------------------------------------------------------------
    // 4. Re-evaluate milestones AFTER update
    // -----------------------------------------------------------------------
    const afterProgress = await buildProgressState(userId, businessId, biz);
    const afterMilestoneIds = new Set(afterProgress.milestones.map(m => m.id));

    // Find newly earned milestones
    const newMilestones = afterProgress.milestones.filter(m => !beforeMilestoneIds.has(m.id));

    // If a new milestone was earned, override celebration with milestone celebration
    if (newMilestones.length > 0) {
      const newest = newMilestones[newMilestones.length - 1];
      const def = MILESTONE_DEFINITIONS.find(d => d.id === newest.id);
      if (def) {
        celebration = {
          type: "milestone",
          data: {
            milestone: {
              icon: def.icon,
              label: def.label,
              description: def.description,
            },
          },
        };
      }
    }

    return NextResponse.json({
      success: true,
      progress: afterProgress,
      celebration,
    });
  } catch (err: any) {
    console.error("[POST /api/v2/progress] Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Empty progress fallback
// ---------------------------------------------------------------------------
function emptyProgress() {
  return {
    total_savings: 0,
    leaks_fixed: 0,
    total_leaks: 0,
    obligations_completed: 0,
    overdue_count: 0,
    critical_overdue: 0,
    programs_applied: 0,
    diagnostic_count: 0,
    prescan_count: 0,
    streak: { current: 0, longest: 0, today_active: false, week_map: [false, false, false, false, false, false, false] },
    milestones: [],
    health_score: 0,
  };
}
