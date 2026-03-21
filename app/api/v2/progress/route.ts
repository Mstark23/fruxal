// GET /api/v2/progress — User streak and celebration data
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const { data: biz } = await supabaseAdmin
      .from("businesses")
      .select("id, streak_days, last_active_date, leaks_fixed, total_recovered")
      .eq("owner_user_id", userId)
      .single();

    // Build progress data matching ProgressState interface in useCelebration hook
    const progressData = {
      total_savings:          biz?.total_recovered     ?? 0,
      leaks_fixed:            biz?.leaks_fixed ?? 0,
      total_leaks:            0,
      obligations_completed:  0,
      overdue_count:          0,
      critical_overdue:       0,
      programs_applied:       0,
      diagnostic_count:       0,
      streak: {
        current:      biz?.streak_days ?? 0,
        longest:      biz?.streak_days ?? 0,
        today_active: biz?.last_active_date === new Date().toISOString().split("T")[0],
        week_map:     [false, false, false, false, false, false, false],
      },
      milestones:   [],
      health_score: 0,
    };

    return NextResponse.json({ success: true, data: progressData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, data } = body;

    // Log the celebration action — extend later for milestones/streak logic
    return NextResponse.json({
      success: true,
      progress: null,      // null = no state update needed
      celebration: null,   // null = no celebration overlay
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
