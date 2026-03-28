// lib/accountant-auth.ts — Accountant portal authentication (mirrors rep-auth)
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

const SECRET   = process.env.NEXTAUTH_SECRET || "fruxal-accountant-secret";
const COOKIE   = "fruxal_accountant_session";
const TTL_DAYS = 30;

function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig  = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}

export function generateMagicToken(accountantId: string, email: string): string {
  return sign({ accountantId, email, exp: Date.now() + 15 * 60 * 1000, type: "magic" });
}

export function generateSessionToken(accountantId: string, email: string): string {
  return sign({ accountantId, email, exp: Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000, type: "session" });
}

function getRawCookie(req: NextRequest, name: string): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function requireAccountant(req: NextRequest): Promise<{
  authorized: boolean;
  accountant?: any;
  error?: NextResponse;
}> {
  const token = getRawCookie(req, COOKIE);
  if (!token) {
    return {
      authorized: false,
      error: NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 }),
    };
  }
  const payload = verifyToken(token);
  if (!payload?.accountantId) {
    return {
      authorized: false,
      error: NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 }),
    };
  }
  const { data: accountant } = await supabaseAdmin
    .from("accountants")
    .select("*")
    .eq("id", payload.accountantId)
    .eq("status", "active")
    .single();

  if (!accountant) {
    return {
      authorized: false,
      error: NextResponse.json({ success: false, error: "Accountant not found or inactive" }, { status: 403 }),
    };
  }
  return { authorized: true, accountant };
}

export function setSessionCookie(res: NextResponse, accountantId: string, email: string): void {
  const token = generateSessionToken(accountantId, email);
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   TTL_DAYS * 24 * 60 * 60,
    path:     "/",
  });
}
