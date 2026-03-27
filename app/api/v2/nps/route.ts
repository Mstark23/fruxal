// =============================================================================
// POST /api/v2/nps — Submit NPS score + optional testimonial
// GET  /api/v2/nps?token=XXX — Load NPS survey (tokenized, no auth needed)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { notifyAdmin } from "@/lib/admin-notify";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  const { data: eng } = await supabaseAdmin
    .from("tier3_engagements")
    .select("id, company_name, nps_score")
    .eq("nps_token", token)
    .maybeSingle();

  if (!eng) return NextResponse.json({ error: "Invalid survey link" }, { status: 404 });
  return NextResponse.json({ success: true, companyName: eng.company_name, alreadySubmitted: eng.nps_score != null });
}

export async function POST(req: NextRequest) {
  try {
    const { token, score, testimonial } = await req.json();
    if (!token || score == null) return NextResponse.json({ error: "token and score required" }, { status: 400 });

    const { data: eng } = await supabaseAdmin
      .from("tier3_engagements")
      .select("id, company_name, nps_score")
      .eq("nps_token", token)
      .maybeSingle();

    if (!eng) return NextResponse.json({ error: "Invalid survey link" }, { status: 404 });
    if (eng.nps_score != null) return NextResponse.json({ success: true, alreadySubmitted: true });

    await supabaseAdmin
      .from("tier3_engagements")
      .update({
        nps_score:        score,
        testimonial_text: testimonial?.trim() || null,
        nps_submitted_at: new Date().toISOString(),
      })
      .eq("id", eng.id);

    // Notify admin of promoters (9-10) with testimonials
    if (score >= 9 && testimonial?.trim()) {
      notifyAdmin({
        type: "hot_lead_assigned",
        company: eng.company_name || "client",
        extra: `NPS ${score}/10 · Testimonial: "${testimonial.trim().slice(0, 120)}..."`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, isPromoter: score >= 9 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
