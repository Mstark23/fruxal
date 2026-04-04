// Temporary debug endpoint — remove after fixing industry issue
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      // Fallback: try getToken
      const { getToken } = await import("next-auth/jwt");
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      const tokenUserId = ((token as any)?.id || token?.sub) as string | undefined;
      if (!tokenUserId) {
        return NextResponse.json({ error: "Not logged in. Open dashboard first, then try again.", hint: "Use browser console: fetch('/api/v2/debug-industry').then(r=>r.json()).then(console.log)" });
      }
      return await getDebugData(tokenUserId);
    }

    return await getDebugData(userId);
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}

async function getDebugData(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from("business_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: prescan } = await supabaseAdmin
    .from("prescan_runs")
    .select("id, industry_slug, province")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const columnNames = profile ? Object.keys(profile) : [];

  // Also check businesses table for tier
  const { data: biz } = await supabaseAdmin
    .from("businesses")
    .select("id, tier, billing_tier, owner_user_id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  return NextResponse.json({
    userId,
    db_industry: profile?.industry ?? "NULL",
    db_business_name: profile?.business_name ?? "NULL",
    db_province: profile?.province ?? "NULL",
    db_country: profile?.country ?? "NULL",
    db_exact_annual_revenue: profile?.exact_annual_revenue ?? "NULL",
    db_annual_revenue: profile?.annual_revenue ?? "NULL",
    prescan_industry: prescan?.industry_slug ?? "NO_PRESCAN",
    businesses_tier: biz?.tier ?? "NULL",
    businesses_billing_tier: biz?.billing_tier ?? "NULL",
    businesses_id: biz?.id ?? "NULL",
    profile_business_id: profile?.business_id ?? "NULL",
  });
}
