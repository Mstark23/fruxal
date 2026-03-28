// GET /api/accountant/auth/verify?token=... — exchange magic token for session cookie
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyToken, setSessionCookie } from "@/lib/accountant-auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";

  if (!token) return NextResponse.redirect(`${appUrl}/accountant/login?error=missing_token`);

  const payload = verifyToken(token);
  if (!payload?.accountantId || payload.type !== "magic") {
    return NextResponse.redirect(`${appUrl}/accountant/login?error=expired`);
  }

  const { data: accountant } = await supabaseAdmin
    .from("accountants")
    .select("id, email, status")
    .eq("id", payload.accountantId)
    .single();

  if (!accountant || accountant.status !== "active") {
    return NextResponse.redirect(`${appUrl}/accountant/login?error=inactive`);
  }

  const res = NextResponse.redirect(`${appUrl}/accountant/dashboard`);
  setSessionCookie(res, accountant.id, accountant.email);
  return res;
}
