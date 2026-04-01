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

    // Batch fetch all related data (avoid N+1)
    const referralIds = (recs || []).map(r => r.referral_id).filter(Boolean) as string[];
    const pipelineIds = [...new Set((recs || []).map(r => r.pipeline_id).filter(Boolean))] as string[];

    const [referralsRes, pipelinesRes] = await Promise.all([
      referralIds.length > 0
        ? supabaseAdmin.from("affiliate_referrals").select("id, status, converted_at, actual_savings_monthly, partner_id").in("id", referralIds)
        : Promise.resolve({ data: [] }),
      pipelineIds.length > 0
        ? supabaseAdmin.from("tier3_pipeline").select("id, company_name").in("id", pipelineIds)
        : Promise.resolve({ data: [] }),
    ]);

    const refMap: Record<string, any> = {};
    for (const r of referralsRes.data || []) refMap[r.id] = r;
    const pipeMap: Record<string, string> = {};
    for (const p of (pipelinesRes.data || []) as any[]) pipeMap[p.id] = p.company_name;

    // Batch fetch partner commission data
    const partnerIds = [...new Set(Object.values(refMap).map(r => r.partner_id).filter(Boolean))];
    const { data: partners } = partnerIds.length > 0
      ? await supabaseAdmin.from("affiliate_partners").select("id, commission_type, commission_value").in("id", partnerIds)
      : { data: [] };
    const partnerMap: Record<string, any> = {};
    for (const p of partners || []) partnerMap[p.id] = p;

    // Enrich with pre-fetched data (no more N+1)
    const enriched = (recs || []).map((r) => {
      const ref = r.referral_id ? refMap[r.referral_id] : null;
      let status = "recommended";
      let convertedAt = null;
      let commissionEarned = 0;

      if (ref) {
        status = ref.status?.toLowerCase() || "recommended";
        convertedAt = ref.converted_at;
        if (ref.status === "CONVERTED" && ref.partner_id) {
          const partner = partnerMap[ref.partner_id];
          if (partner && ref.actual_savings_monthly) {
            commissionEarned = partner.commission_type === "percentage"
              ? Math.round(ref.actual_savings_monthly * 12 * (partner.commission_value / 100))
              : partner.commission_value;
          }
        }
      }

      return {
        partner: r.partner,
        category: r.vertical,
        client: r.pipeline_id ? (pipeMap[r.pipeline_id] || "Client") : "Client",
        date: r.created_at,
        status,
        converted_at: convertedAt,
        commission_earned: commissionEarned,
      };
    });

    // Summary stats
    const totalRecommendations = enriched.length;
    const totalConversions = enriched.filter(r => r.status === "converted" || r.status === "CONVERTED").length;
    const totalCommission = enriched.reduce((s, r) => s + r.commission_earned, 0);
    const conversionRate = totalRecommendations > 0 ? Math.round((totalConversions / totalRecommendations) * 100) : 0;

    // Group by partner for top performers
    const byPartner: Record<string, { recs: number; conversions: number; commission: number }> = {};
    for (const r of enriched) {
      if (!byPartner[r.partner]) byPartner[r.partner] = { recs: 0, conversions: 0, commission: 0 };
      byPartner[r.partner].recs++;
      if (r.status === "converted" || r.status === "CONVERTED") byPartner[r.partner].conversions++;
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
