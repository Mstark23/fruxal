// =============================================================================
// app/api/stripe-connect/connect/route.ts
// Redirects the user to Stripe Connect OAuth.
// NOTE: This is separate from the platform's own Stripe billing.
//       STRIPE_CONNECT_CLIENT_ID is the platform's Connect client_id.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const token  = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = ((token as any)?.id || token?.sub) as string | undefined;
  if (!userId) return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));

  const { data: profile } = await supabaseAdmin
    .from("business_profiles")
    .select("business_id")
    .eq("user_id", userId)
    .single();

  if (!profile?.business_id) {
    return NextResponse.redirect(new URL("/v2/dashboard?stripe=error&msg=no_profile", process.env.NEXTAUTH_URL!));
  }

  const state = Buffer.from(
    JSON.stringify({ businessId: profile.business_id, userId })
  ).toString("base64");

  const params = new URLSearchParams({
    response_type: "code",
    client_id:     process.env.STRIPE_CONNECT_CLIENT_ID!,
    scope:         "read_only",
    state,
    redirect_uri:  `${process.env.NEXTAUTH_URL}/api/stripe-connect/callback`,
  });

  return NextResponse.redirect(
    `https://connect.stripe.com/oauth/authorize?${params.toString()}`
  );
}
