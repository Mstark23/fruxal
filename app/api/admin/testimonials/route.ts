// =============================================================================
// GET /api/admin/testimonials — Fetch NPS scores + testimonials
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { data } = await supabaseAdmin
      .from("tier3_engagements")
      .select("id, company_name, nps_score, testimonial_text, nps_submitted_at, fee_percentage")
      .not("nps_score", "is", null)
      .order("nps_submitted_at", { ascending: false })
      .limit(50);

    const all = data || [];
    const promoters = all.filter(e => (e.nps_score ?? 0) >= 9);
    const passive   = all.filter(e => (e.nps_score ?? 0) >= 7 && (e.nps_score ?? 0) <= 8);
    const detractor = all.filter(e => (e.nps_score ?? 0) <= 6);
    const npsScore = all.length
      ? Math.round(((promoters.length - detractor.length) / all.length) * 100)
      : null;

    return NextResponse.json({
      success: true,
      npsScore,
      totalResponses: all.length,
      promoters: promoters.length,
      passive:   passive.length,
      detractors: detractor.length,
      testimonials: all.filter(e => e.testimonial_text),
      all,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
