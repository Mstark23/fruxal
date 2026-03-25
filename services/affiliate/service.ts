// =============================================================================
// AFFILIATE SERVICE — DB-connected partner matching & tracking
// =============================================================================
// Replaces hardcoded partner maps. Queries affiliate_partners +
// affiliate_partner_leak_mappings tables for real-time matching.
// =============================================================================

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AffiliatePartner {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subCategory: string | null;
  referralUrl: string;
  commissionType: string;
  commissionValue: number;
  qualityScore: number;
  avgUserSatisfaction: number;
  estimatedSavingsPercent: number;
}

export interface AffiliateMatch {
  leakId: string;
  leakCategory: string;
  partners: AffiliatePartner[];
  bestPartner: AffiliatePartner | null;
}

// ─── Find best partners for a leak category ──────────────────────────────────
export async function findPartnersForLeak(leakCategory: string): Promise<AffiliatePartner[]> {
  // Query mappings → join partners
  const { data, error } = await supabase
    .from("affiliate_partner_leak_mappings")
    .select(`
      estimated_savings_percentage,
      partner:partner_id (
        id, name, slug, description, category, sub_category,
        referral_url, commission_type, commission_value,
        quality_score, avg_user_satisfaction, active
      )
    `)
    .eq("leak_type", leakCategory)
    .eq("active", true);

  if (error || !data) return [];

  return data
    .filter((d: any) => d.partner?.active)
    .map((d: any) => ({
      id: d.partner.id,
      name: d.partner.name,
      slug: d.partner.slug,
      description: d.partner.description,
      category: d.partner.category,
      subCategory: d.partner.sub_category,
      referralUrl: d.partner.referral_url,
      commissionType: d.partner.commission_type,
      commissionValue: d.partner.commission_value,
      qualityScore: d.partner.quality_score,
      avgUserSatisfaction: d.partner.avg_user_satisfaction,
      estimatedSavingsPercent: d.estimated_savings_percentage,
    }))
    .sort((a: AffiliatePartner, b: AffiliatePartner) =>
      (b.qualityScore * 0.6 + b.avgUserSatisfaction / 5 * 0.4) -
      (a.qualityScore * 0.6 + a.avgUserSatisfaction / 5 * 0.4)
    );
}

// ─── Match partners for multiple leaks at once ───────────────────────────────
export async function matchPartnersToLeaks(
  leaks: Array<{ id: string; category: string; annualImpact: number }>
): Promise<AffiliateMatch[]> {
  // Get unique categories
  const categories = [...new Set(leaks.map(l => l.category))];

  // Batch fetch all mappings for these categories
  const { data: mappings } = await supabase
    .from("affiliate_partner_leak_mappings")
    .select(`
      leak_type,
      estimated_savings_percentage,
      partner:partner_id (
        id, name, slug, description, category, sub_category,
        referral_url, commission_type, commission_value,
        quality_score, avg_user_satisfaction, active
      )
    `)
    .in("leak_type", categories)
    .eq("active", true);

  if (!mappings) return [];

  // Build category → partners map
  const categoryPartners: Record<string, AffiliatePartner[]> = {};
  for (const m of mappings as any[]) {
    if (!m.partner?.active) continue;
    if (!categoryPartners[m.leak_type]) categoryPartners[m.leak_type] = [];
    categoryPartners[m.leak_type].push({
      id: m.partner.id,
      name: m.partner.name,
      slug: m.partner.slug,
      description: m.partner.description,
      category: m.partner.category,
      subCategory: m.partner.sub_category,
      referralUrl: m.partner.referral_url,
      commissionType: m.partner.commission_type,
      commissionValue: m.partner.commission_value,
      qualityScore: m.partner.quality_score,
      avgUserSatisfaction: m.partner.avg_user_satisfaction,
      estimatedSavingsPercent: m.estimated_savings_percentage,
    });
  }

  // Match each leak
  return leaks.map(leak => {
    const partners = (categoryPartners[leak.category] || [])
      .sort((a, b) =>
        (b.qualityScore * 0.6 + b.avgUserSatisfaction / 5 * 0.4) -
        (a.qualityScore * 0.6 + a.avgUserSatisfaction / 5 * 0.4)
      );

    return {
      leakId: leak.id,
      leakCategory: leak.category,
      partners,
      bestPartner: partners[0] || null,
    };
  });
}

// ─── Track affiliate click ───────────────────────────────────────────────────
export async function trackClick(params: {
  businessId?: string;
  userId?: string;
  leakId?: string;
  partnerId: string;
  partnerSlug: string;
  leakCategory: string;
  source: "business" | "personal";
}): Promise<{ referralId: string; redirectUrl: string }> {

  // 1. Get partner details
  const { data: partner } = await supabase
    .from("affiliate_partners")
    .select("*")
    .eq("id", params.partnerId)
    .single();

  if (!partner) throw new Error("Partner not found");

  // 2. Create referral record
  const { data: referral } = await supabase
    .from("affiliate_referrals")
    .insert({
      user_id: params.userId || "anonymous",
      business_id: params.businessId || null,
      partner_id: params.partnerId,
      leak_id: params.leakId || null,
      category: params.leakCategory,
      referral_url: partner.referral_url,
      status: "CLICKED",
    })
    .select()
    .single();

  // Build tracked redirect URL — append UTM params + referralId for partner attribution
  const baseUrl = partner.referral_url || "";
  const separator = baseUrl.includes("?") ? "&" : "?";
  const trackedUrl = referral
    ? `${baseUrl}${separator}utm_source=fruxal&utm_medium=diagnostic&utm_campaign=${params.leakCategory}&utm_content=${referral.id}&ref=fruxal`
    : `${baseUrl}${separator}utm_source=fruxal&utm_medium=diagnostic&utm_campaign=${params.leakCategory}`;

  // 3. Track click in quick-tracking table
  await supabase.from("affiliate_clicks").insert({
    businessId: params.businessId || null,
    userId: params.userId || null,
    leakId: params.leakId || null,
    vertical: params.leakCategory,
    partner: partner.name,
    source: params.source,
  });

  // 4. Increment partner click count
  await supabase
    .from("affiliate_partners")
    .update({ total_clicks: (partner.total_clicks ?? 0) + 1 })
    .eq("id", params.partnerId);

  return {
    referralId: referral?.id || "",
    redirectUrl: trackedUrl,
  };
}

// ─── Record conversion ───────────────────────────────────────────────────────
export async function recordConversion(
  referralId: string,
  actualSavingsMonthly?: number
): Promise<void> {
  await supabase
    .from("affiliate_referrals")
    .update({
      status: "CONVERTED",
      converted_at: new Date().toISOString(),
      actual_savings_monthly: actualSavingsMonthly || null,
    })
    .eq("id", referralId);

  // Get partner and increment conversions
  const { data: referral } = await supabase
    .from("affiliate_referrals")
    .select("partner_id")
    .eq("id", referralId)
    .single();

  if (referral) {
    const { data: partner } = await supabase
      .from("affiliate_partners")
      .select("total_conversions, total_clicks")
      .eq("id", referral.partner_id)
      .single();

    if (partner) {
      const newConversions = (partner.total_conversions ?? 0) + 1;
      await supabase
        .from("affiliate_partners")
        .update({
          total_conversions: newConversions,
          conversion_rate: partner.total_clicks > 0 ? newConversions / partner.total_clicks : 0,
        })
        .eq("id", referral.partner_id);
    }
  }
}

// ─── Get affiliate stats (for admin/dashboard) ──────────────────────────────
export async function getAffiliateStats(businessId?: string) {
  // Total clicks
  const clickQuery = supabase.from("affiliate_clicks").select("*", { count: "exact" });
  if (businessId) clickQuery.eq("businessId", businessId);
  const { count: totalClicks } = await clickQuery;

  // Total conversions
  const convQuery = supabase.from("affiliate_referrals").select("*", { count: "exact" }).eq("status", "CONVERTED");
  if (businessId) convQuery.eq("business_id", businessId);
  const { count: totalConversions } = await convQuery;

  // Top partners
  const { data: topPartners } = await supabase
    .from("affiliate_partners")
    .select("id, name, slug, category, total_clicks, total_conversions, conversion_rate, commission_value")
    .eq("active", true)
    .order("total_clicks", { ascending: false })
    .limit(10);

  // Revenue by category
  const { data: clicksByCategory } = await supabase
    .from("affiliate_clicks")
    .select("vertical");

  const categoryBreakdown: Record<string, number> = {};
  (clicksByCategory || []).forEach((c: any) => {
    categoryBreakdown[c.vertical] = (categoryBreakdown[c.vertical] || 0) + 1;
  });

  return {
    totalClicks: totalClicks ?? 0,
    totalConversions: totalConversions ?? 0,
    conversionRate: totalClicks ? ((totalConversions ?? 0) / totalClicks * 100).toFixed(1) + "%" : "0%",
    topPartners: topPartners || [],
    categoryBreakdown,
  };
}

// ─── Get all active partners ─────────────────────────────────────────────────
export async function getAllPartners() {
  const { data } = await supabase
    .from("affiliate_partners")
    .select("*")
    .eq("active", true)
    .order("quality_score", { ascending: false });

  return data || [];
}

// ─── Get partners for B2C personal scan ──────────────────────────────────────
export async function getPersonalPartners() {
  const personalCategories = ["telecom", "banking", "mortgage", "energy", "personal-insurance"];

  const { data } = await supabase
    .from("affiliate_partner_leak_mappings")
    .select(`
      leak_type,
      estimated_savings_percentage,
      partner:partner_id (
        id, name, slug, description, category, sub_category,
        referral_url, quality_score, avg_user_satisfaction, active
      )
    `)
    .in("leak_type", personalCategories)
    .eq("active", true);

  // Group by category
  const grouped: Record<string, any[]> = {};
  (data || []).forEach((d: any) => {
    if (!d.partner?.active) return;
    if (!grouped[d.leak_type]) grouped[d.leak_type] = [];
    grouped[d.leak_type].push({
      ...d.partner,
      estimatedSavingsPercent: d.estimated_savings_percentage,
    });
  });

  return grouped;
}
