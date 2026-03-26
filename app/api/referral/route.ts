import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const _ip_referralRl = new Map<string, {c: number; r: number}>();
function ip_referralCheck(ip: string): boolean {
  const now = Date.now();
  const e = _ip_referralRl.get(ip);
  if (!e || e.r < now) { _ip_referralRl.set(ip, {c: 1, r: now + 3600000}); return true; }
  e.c++; return e.c <= 5;
}



const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET — Get referral code + stats for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    // Get or create referral code
    let { data: ref } = await supabase.from("referrals").select("*").eq("referrerId", userId).single();

    if (!ref) {
      const code = "LG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: newRef } = // NOTE: Multi-step write — not atomic. Partial failure leaves inconsistent state.
    await supabase.from("referrals").insert({
        referrerId: userId,
        code,
        signups: 0,
        conversions: 0,
        earned: 0,
        createdAt: new Date().toISOString(),
      }).select().single();
      ref = newRef;
    }

    return NextResponse.json({
      code: ref?.code || "",
      referralUrl: `\${process.env.NEXTAUTH_URL || "https://fruxal.ca"}?ref=\${ref?.code || ""}`,
      program: "For every business you refer that recovers money with Fruxal, you earn $500 when their engagement closes.",
      link: `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/register?ref=${ref?.code}`,
      signups: ref?.signups ?? 0,
      conversions: ref?.conversions ?? 0,
      earned: ref?.earned ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — Track a referral signup
export async function POST(req: NextRequest) {
  const _ip_ip_referral = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!ip_referralCheck(_ip_ip_referral)) return NextResponse.json({error: "Too many requests"}, {status: 429});
  try {
    const { referralCode, newUserId } = await req.json();
    if (!referralCode || !newUserId) return NextResponse.json({ error: "referralCode and newUserId required" }, { status: 400 });

    // Find referrer
    const { data: ref } = await supabase.from("referrals").select("*").eq("code", referralCode).single();
    if (!ref) return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });

    // Increment signups
    await supabase.from("referrals").update({
      signups: (ref.signups ?? 0) + 1,
    }).eq("code", referralCode);

    // Save the referral link
    await supabase.from("referral_signups").insert({
      referralCode,
      referrerId: ref.referrerId,
      referredUserId: newUserId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
