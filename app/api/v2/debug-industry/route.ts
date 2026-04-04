// Temporary debug endpoint — remove after fixing industry issue
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = ((token as any)?.id || token?.sub) as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("business_profiles")
    .select("business_id, business_name, industry, province, country, business_structure")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: prescan } = await supabaseAdmin
    .from("prescan_runs")
    .select("id, industry_slug, province")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // List ALL columns in business_profiles to see which exist
  const { data: allCols } = await supabaseAdmin
    .from("business_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const columnNames = allCols ? Object.keys(allCols) : [];

  return NextResponse.json({
    userId,
    profile_industry: profile?.industry,
    profile_business_name: profile?.business_name,
    profile_province: profile?.province,
    profile_country: profile?.country,
    profile_structure: profile?.business_structure,
    prescan_industry: prescan?.industry_slug,
    has_industry_label_column: columnNames.includes("industry_label"),
    has_industry_slug_column: columnNames.includes("industry_slug"),
    has_industry_naics_column: columnNames.includes("industry_naics"),
    all_columns: columnNames,
  });
}
