// =============================================================================
// GET /api/rep/commissions — Rep's affiliate commission dashboard
// Shows: recommendations made, clicks, conversions, estimated commissions
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const repSession = req.cookies.get("fruxal_rep_session")?.value;
    if (!repSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let repId: string | null = null;
    try {
      const { verifyMagicToken } = await import("@/lib/rep-auth");
      const decoded = verifyMagicToken(repSession);
      repId = decoded?.repId || null;
    } catch { return NextResponse.json({ error: "Invalid session" }, { status: 401 }); }
    if (!repId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    // Get all recommendations this rep has made
    const { data: recs } = await supabaseAdmin
      .from("affiliate_clicks")
      .select("referral_id, partner, vertical, pipeline_id, created_at")
      .eq("rep_id", repId)
      .eq("source", "rep_recommendation")
      .order("created_at", { ascending: false });

    // Enrich with referral status + partner commission data
    const enriched = await Promise.all((recs || []).map(async (r) => {
      let status = "recommended";
      let convertedAt = null;
      let commissionEarned = 0;

      if (r.referral_id) {
        const { data: ref } = await supabaseAdmin
          .from("affiliate_referrals")
          .select("status, converted_at, actual_savings_monthly, partner_id")
          .eq("id", r.referral_id)
          .maybeSingle();

        if (ref) {
          status = ref.status?.toLowerCase() || "recommended";
          convertedAt = ref.converted_at;

          if (ref.status === "CONVERTED" && ref.partner_id) {
            // Get partner commission
            const { data: partner } = await supabaseAdmin
              .from("affiliate_partners")
              .select("commission_type, commission_value, commission_recurring")
              .eq("id", ref.partner_id)
              .maybeSingle();

            if (partner && ref.actual_savings_monthly) {
              if (partner.commission_type === "percentage") {
                commissionEarned = Math.round(ref.actual_savings_monthly * 12 * (partner.commission_value / 100));
              } else {
                commissionEarned = partner.commission_value;
              }
            }
          }
        }
      }

      // Get client name from pipeline
      let clientName = "Client";
      if (r.pipeline_id) {
        const { data: pipe } = await supabaseAdmin
          .from("tier3_pipeline")
          .select("company_name")
          .eq("id", r.pipeline_id)
          .maybeSingle();
        if (pipe?.company_name) clientName = pipe.company_name;
      }

      return {
        partner: r.partner,
        category: r.vertical,
        client: clientName,
        date: r.created_at,
        status,
        converted_at: convertedAt,
        commission_earned: commissionEarned,
      };
    }));

    // Summary stats
    const totalRecommendations = enriched.length;
    const totalConversions = enriched.filter(r => r.status === "converted").length;
    const totalCommission = enriched.reduce((s, r) => s + r.commission_earned, 0);
    const conversionRate = totalRecommendations > 0 ? Math.round((totalConversions / totalRecommendations) * 100) : 0;

    // Group by partner for top performers
    const byPartner: Record<string, { recs: number; conversions: number; commission: number }> = {};
    for (const r of enriched) {
      if (!byPartner[r.partner]) byPartner[r.partner] = { recs: 0, conversions: 0, commission: 0 };
      byPartner[r.partner].recs++;
      if (r.status === "converted") byPartner[r.partner].conversions++;
      byPartner[r.partner].commission += r.commission_earned;
    }
    const topPartners = Object.entries(byPartner)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      summary: {
        total_recommendations: totalRecommendations,
        total_conversions: totalConversions,
        conversion_rate: conversionRate,
        total_commission: totalCommission,
      },
      top_partners: topPartners,
      recommendations: enriched,
    });
  } catch (err: any) {
    console.error("[Rep:Commissions]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
