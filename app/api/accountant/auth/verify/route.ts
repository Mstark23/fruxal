// GET /api/accountant/auth/verify?token=... — exchange magic token for session cookie
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyToken, setSessionCookie } from "@/lib/accountant-auth";

const _rl = new Map<string, { c: number; r: number }>();
function rlCheck(ip: string): boolean {
  const now = Date.now(), e = _rl.get(ip);
  if (!e || e.r < now) { _rl.set(ip, { c: 1, r: now + 600000 }); return true; }
  return ++e.c <= 10; // 10 per 10 min per IP
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rlCheck(ip)) return new Response("Too many requests", { status: 429 });

  const token = req.nextUrl.searchParams.get("token");
  const host = req.headers.get("host") || "";
  const appUrl = process.env.NEXTAUTH_URL || (host.includes("fruxal.com") && !host.includes("fruxal.ca") ? "https://fruxal.com" : "https://fruxal.ca");

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
