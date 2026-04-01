// POST /api/accountant/auth/send — send magic link to accountant
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateMagicToken } from "@/lib/accountant-auth";
import { sendEmail } from "@/services/email/service";

const _rl = new Map<string, { c: number; r: number }>();
function rlCheck(ip: string): boolean {
  const now = Date.now(), e = _rl.get(ip);
  if (!e || e.r < now) { _rl.set(ip, { c: 1, r: now + 3600000 }); return true; }
  return ++e.c <= 5; // 5 per hour per IP
}

export async function POST(req: NextRequest) {
  try {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rlCheck(ip)) return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });

  const { email } = await req.json().catch(() => ({ email: null }));
  if (!email) return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });

  const { data: accountant } = await supabaseAdmin
    .from("accountants")
    .select("id, name, email, status")
    .eq("email", email.toLowerCase().trim())
    .single();

  // Always return success to prevent email enumeration
  if (!accountant || accountant.status !== "active") {
    return NextResponse.json({ success: true });
  }

  const token  = generateMagicToken(accountant.id, accountant.email);
  const host = req.headers.get("host") || "";
  const appUrl = process.env.NEXTAUTH_URL || (host.includes("fruxal.com") && !host.includes("fruxal.ca") ? "https://fruxal.com" : "https://fruxal.ca");
  const link   = `${appUrl}/accountant/verify?token=${encodeURIComponent(token)}`;

  const sent = await sendEmail({
    to:      accountant.email,
    subject: "Your Fruxal accountant login link",
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f7f8fa;padding:40px 20px">
<div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;border:1px solid #E8E6E1">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
    <div style="width:26px;height:26px;border-radius:6px;background:#1B3A2D;display:flex;align-items:center;justify-content:center">
      <span style="color:white;font-weight:900;font-size:12px">F</span>
    </div>
    <span style="font-size:15px;font-weight:800;color:#1A1A18">Fruxal</span>
    <span style="font-size:11px;color:#8E8C85;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-left:4px">Accountant Portal</span>
  </div>
  <p style="font-size:16px;font-weight:700;color:#1A1A18;margin:0 0 12px">Hi ${accountant.name},</p>
  <p style="font-size:14px;color:#56554F;margin:0 0 24px;line-height:1.6">
    Click the button below to access your Fruxal accountant dashboard. This link expires in 15 minutes.
  </p>
  <a href="${link}" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;text-decoration:none">
    Open My Dashboard →
  </a>
  <p style="font-size:11px;color:#B5B3AD;margin:20px 0 0">
    If you didn't request this, ignore this email.
  </p>
</div></body></html>`,
  });

  if (!sent) console.error("[Accountant:Auth] Failed to send magic link to:", accountant.email);
  return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Accountant:Auth:Send]", err.message);
    return NextResponse.json({ success: false, error: "Failed to send login link" }, { status: 500 });
  }
}
