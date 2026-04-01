// =============================================================================
// POST /api/rep/customer/[id]/recommend — Rep recommends a solution to client
// Tracks the recommendation + generates tracked affiliate link
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify rep auth (cookie-based)
    const repSession = req.cookies.get("fruxal_rep_session")?.value;
    if (!repSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Decode rep from session token
    let repId: string | null = null;
    try {
      const { verifyMagicToken } = await import("@/lib/rep-auth");
      const decoded = verifyMagicToken(repSession);
      repId = decoded?.repId || null;
    } catch { return NextResponse.json({ error: "Invalid session" }, { status: 401 }); }
    if (!repId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const clientId = params.id; // pipeline_id
    const { partner_slug, finding_id, category } = await req.json();
    if (!partner_slug) return NextResponse.json({ error: "partner_slug required" }, { status: 400 });

    // Look up partner
    const { data: partner } = await supabaseAdmin
      .from("affiliate_partners")
      .select("id, name, slug, referral_url, website_url, referral_code, commission_type, commission_value, commission_recurring, category")
      .eq("slug", partner_slug)
      .eq("active", true)
      .single();

    if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

    // Get client info from pipeline
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("user_id, company_name, contact_email")
      .eq("id", clientId)
      .single();

    // Create referral record
    const referralId = crypto.randomUUID();
    const baseUrl = partner.referral_url || partner.website_url || "#";
    const separator = baseUrl.includes("?") ? "&" : "?";
    const trackedUrl = `${baseUrl}${separator}utm_source=fruxal&utm_medium=rep_recommendation&utm_campaign=${category || partner.category}&lg_ref=${referralId}${partner.referral_code ? `&ref=${partner.referral_code}` : ""}`;

    // Save to affiliate_referrals
    await supabaseAdmin.from("affiliate_referrals").insert({
      id: referralId,
      user_id: pipe?.user_id || null,
      business_id: null,
      partner_id: partner.id,
      leak_id: finding_id || null,
      category: category || partner.category,
      referral_url: trackedUrl,
      status: "RECOMMENDED", // new status: RECOMMENDED → CLICKED → CONVERTED
      current_cost_monthly: null,
      projected_savings_monthly: null,
      projected_savings_annual: null,
      created_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.warn("[Rep:Recommend] referral insert:", error.message); });

    // Track the recommendation with rep_id
    await supabaseAdmin.from("affiliate_clicks").insert({
      business_id: null,
      user_id: pipe?.user_id || "rep-recommendation",
      leak_id: finding_id || null,
      vertical: category || partner.category,
      partner: partner.name,
      source: "rep_recommendation",
      rep_id: repId,
      pipeline_id: clientId,
      referral_id: referralId,
      created_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.warn("[Rep:Recommend] click insert:", error.message); });

    return NextResponse.json({
      success: true,
      recommendation: {
        referral_id: referralId,
        partner_name: partner.name,
        partner_slug: partner.slug,
        tracked_url: trackedUrl,
        commission_type: partner.commission_type,
        commission_value: partner.commission_value,
        commission_recurring: partner.commission_recurring,
      },
    });
  } catch (err: any) {
    console.error("[Rep:Recommend]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — list all recommendations rep has made for this client
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const repSession = req.cookies.get("fruxal_rep_session")?.value;
    if (!repSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = params.id;

    const { data: recs } = await supabaseAdmin
      .from("affiliate_clicks")
      .select("referral_id, partner, vertical, source, created_at, pipeline_id")
      .eq("pipeline_id", clientId)
      .eq("source", "rep_recommendation")
      .order("created_at", { ascending: false });

    // Enrich with referral status
    const enriched = await Promise.all((recs || []).map(async (r) => {
      if (!r.referral_id) return { ...r, status: "RECOMMENDED" };
      const { data: ref } = await supabaseAdmin
        .from("affiliate_referrals")
        .select("status, converted_at, actual_savings_monthly")
        .eq("id", r.referral_id)
        .maybeSingle();
      return {
        ...r,
        status: ref?.status || "RECOMMENDED",
        converted_at: ref?.converted_at || null,
        actual_savings: ref?.actual_savings_monthly ? ref.actual_savings_monthly * 12 : null,
      };
    }));

    return NextResponse.json({ success: true, recommendations: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
