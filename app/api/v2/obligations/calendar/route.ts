import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const userId   = (token as any)?.id || token?.sub;
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId") || "";
    const language   = searchParams.get("language") || "en";

    // ── Try RPC first (works when businessId is in businesses table) ──────
    if (businessId) {
      try {
        const { data, error } = await supabaseAdmin.rpc("get_deadline_calendar", {
          p_business_id: businessId,
          p_language: language,
        });
        if (!error && data) {
          return NextResponse.json({ success: true, data });
        }
      } catch { /* non-fatal */ }
    }

    // ── Fallback: query user_obligations directly by userId ───────────────
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const in7  = new Date(now.getTime() + 7  * 86400000).toISOString().split("T")[0];
    const in30 = new Date(now.getTime() + 30 * 86400000).toISOString().split("T")[0];
    const in90 = new Date(now.getTime() + 90 * 86400000).toISOString().split("T")[0];

    const { data: rows } = await supabaseAdmin
      .from("user_obligations")
      .select(`
        id, obligation_slug, status, next_deadline, snoozed_until,
        obligation_rules ( title, title_fr, category, risk_level, penalty_max, frequency, agency )
      `)
      .eq("user_id", userId)
      .neq("status", "completed")
      .order("next_deadline", { ascending: true, nullsFirst: false });

    const obs = (rows || []).map((o: any) => {
      const rule = o.obligation_rules || {};
      const deadline = o.next_deadline;
      const daysUntil = deadline
        ? Math.ceil((new Date(deadline).getTime() - now.getTime()) / 86400000)
        : null;
      return {
        slug:               o.obligation_slug,
        title:              language === "fr" ? (rule.title_fr || rule.title) : rule.title,
        category:           rule.category  || "general",
        risk_level:         rule.risk_level || "medium",
        frequency:          rule.frequency  || null,
        agency:             rule.agency     || null,
        penalty_max:        rule.penalty_max ?? 0,
        deadline,
        days_until:         daysUntil,
        days_overdue:       daysUntil !== null && daysUntil < 0 ? Math.abs(daysUntil) : 0,
        status:             o.status,
        snoozed_until:      o.snoozed_until,
      };
    });

    const overdue      = obs.filter(o => o.days_until !== null && o.days_until < 0);
    const this_week    = obs.filter(o => o.days_until !== null && o.days_until >= 0 && o.deadline! <= in7);
    const this_month   = obs.filter(o => o.days_until !== null && o.days_until >= 0 && o.deadline! > in7 && o.deadline! <= in30);
    const next_3_months= obs.filter(o => o.days_until !== null && o.days_until >= 0 && o.deadline! > in30 && o.deadline! <= in90);
    const later        = obs.filter(o => o.days_until !== null && o.days_until >= 0 && o.deadline! > in90);
    const continuous   = obs.filter(o => !o.deadline);

    const totalPenalty = obs
      .filter(o => o.status !== "completed")
      .reduce((s, o) => s + (o.penalty_max ?? 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        overdue,
        this_week,
        this_month,
        next_3_months,
        later,
        continuous,
        summary: {
          total_tracked:      obs.length,
          overdue:            overdue.length,
          due_this_week:      this_week.length,
          due_this_month:     this_month.length,
          completed_this_year:0,
          total_penalty_exposure: totalPenalty,
        },
      },
    });
  } catch (err: any) {
    console.error("[Calendar] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
