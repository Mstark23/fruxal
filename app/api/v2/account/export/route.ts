// =============================================================================
// app/api/v2/account/export/route.ts
// GET /api/v2/account/export — GDPR/PIPEDA data export
// =============================================================================
// Returns a downloadable JSON file containing ALL user data stored by Fruxal.
// =============================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 60;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const email = session.user.email ?? "";
    const name = session.user.name ?? "";

    // Look up business owned by this user
    const { data: businesses } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("owner_user_id", userId);

    const businessId = businesses?.[0]?.id as string | undefined;

    // Query all user data in parallel
    const [
      profileResult,
      diagnosticsResult,
      tasksResult,
      leaksResult,
      obligationsResult,
      scoreHistoryResult,
      goalsResult,
      timelineResult,
      conversationsResult,
      memoriesResult,
    ] = await Promise.all([
      businessId
        ? supabaseAdmin.from("business_profiles").select("*").eq("business_id", businessId)
        : Promise.resolve({ data: null }),
      businessId
        ? supabaseAdmin.from("diagnostic_reports").select("id, tier, overall_score, completed_at, status").eq("business_id", businessId)
        : Promise.resolve({ data: [] }),
      businessId
        ? supabaseAdmin.from("diagnostic_tasks").select("title, category, status, savings_monthly, effort, completed_at").eq("business_id", businessId)
        : Promise.resolve({ data: [] }),
      businessId
        ? supabaseAdmin.from("detected_leaks").select("title, severity, category, annual_impact_min, annual_impact_max, status").eq("business_id", businessId)
        : Promise.resolve({ data: [] }),
      supabaseAdmin.from("user_obligations").select("obligation_slug, status, next_deadline, completed_at").eq("user_id", userId),
      businessId
        ? supabaseAdmin.from("score_history").select("score, score_delta, calculated_at").eq("business_id", businessId)
        : Promise.resolve({ data: [] }),
      businessId
        ? supabaseAdmin.from("business_goals").select("*").eq("business_id", businessId)
        : Promise.resolve({ data: [] }),
      businessId
        ? supabaseAdmin.from("business_timeline").select("*").eq("business_id", businessId)
        : Promise.resolve({ data: [] }),
      supabaseAdmin.from("chat_conversations").select("messages, updated_at").eq("user_id", userId),
      businessId
        ? supabaseAdmin.from("business_memories").select("category, content, importance, created_at").eq("business_id", businessId)
        : Promise.resolve({ data: [] }),
    ]);

    const exportData = {
      export_date: new Date().toISOString(),
      account: { email, name },
      business_profile: profileResult.data?.[0] ?? null,
      diagnostics: diagnosticsResult.data ?? [],
      tasks: tasksResult.data ?? [],
      leaks: leaksResult.data ?? [],
      obligations: obligationsResult.data ?? [],
      score_history: scoreHistoryResult.data ?? [],
      goals: goalsResult.data ?? [],
      timeline: timelineResult.data ?? [],
      conversations: conversationsResult.data ?? [],
      memories: memoriesResult.data ?? [],
    };

    const dateStr = new Date().toISOString().split("T")[0];
    const body = JSON.stringify(exportData, null, 2);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="fruxal-data-export-${dateStr}.json"`,
      },
    });
  } catch (err: any) {
    console.error("[Account Export]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
