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

  return NextResponse.json({
    userId,
    db_industry: profile?.industry ?? "NULL",
    db_industry_label: profile?.industry_label ?? "COLUMN_MISSING_OR_NULL",
    db_industry_slug: profile?.industry_slug ?? "COLUMN_MISSING_OR_NULL",
    db_business_name: profile?.business_name ?? "NULL",
    db_province: profile?.province ?? "NULL",
    db_country: profile?.country ?? "NULL",
    prescan_industry: prescan?.industry_slug ?? "NO_PRESCAN",
    columns_in_table: columnNames.sort(),
    has_industry_column: columnNames.includes("industry"),
    has_industry_label_column: columnNames.includes("industry_label"),
    has_industry_slug_column: columnNames.includes("industry_slug"),
  });
}
