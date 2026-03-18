// =============================================================================
// app/api/plaid/link-token/route.ts
// GET — returns a Plaid link_token for the current user's business.
// Called by the frontend just before opening Plaid Link modal.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createLinkToken } from "@/services/v2/plaid-aggregator";

export async function GET(req: NextRequest) {
  const token  = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = ((token as any)?.id || token?.sub) as string | undefined;
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("business_profiles")
    .select("business_id")
    .eq("user_id", userId)
    .single();

  if (!profile?.business_id) {
    return NextResponse.json({ success: false, error: "No business profile" }, { status: 400 });
  }

  try {
    const linkToken = await createLinkToken(userId, profile.business_id);
    return NextResponse.json({ success: true, link_token: linkToken });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
