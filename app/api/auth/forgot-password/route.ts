// =============================================================================
// POST /api/auth/forgot-password — Send password reset email
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, emailTemplate } from "@/services/email/service";
import crypto from "crypto";

export const maxDuration = 30;

const _rl = new Map<string, { c: number; r: number }>();
function rateCheck(ip: string) {
  const now = Date.now();
  const e = _rl.get(ip);
  if (!e || e.r < now) { _rl.set(ip, { c: 1, r: now + 3_600_000 }); return true; }
  e.c++; return e.c <= 3; // 3 per hour
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateCheck(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const norm = email.toLowerCase().trim();

    // Always return success to prevent email enumeration
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, email, name")
      .eq("email", norm)
      .maybeSingle();

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      await supabaseAdmin.from("password_reset_tokens").upsert({
        user_id:    user.id,
        token,
        expires_at: expiresAt,
        used:       false,
        created_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // Use request host so US users get fruxal.com links, CA gets fruxal.ca
      const host = req.headers.get("host") || "";
      const appUrl = host.includes("fruxal.com") ? "https://fruxal.com"
        : host.includes("fruxal.ca") ? "https://fruxal.ca"
        : process.env.NEXTAUTH_URL || "https://fruxal.ca";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      const sent = await sendEmail({
        to: norm,
        subject: "Reset your Fruxal password",
        html: emailTemplate(
          "Reset your password",
          `<p style="color:#3d3d4e;margin:0 0 16px">Hi${user.name ? " " + user.name : ""},</p>
          <p style="color:#3d3d4e;margin:0 0 24px">
            We received a request to reset your Fruxal password. Click below to set a new password.
            This link expires in 1 hour.
          </p>
          <p style="color:#3d3d4e;margin:0 0 24px;font-size:12px;color:#6b7280;">
            If you didn't request this, you can ignore this email — your password won't change.
          </p>`,
          "Reset My Password →",
          resetUrl
        ),
      });
      if (!sent) console.error("[ForgotPassword] Email send failed for:", norm);
    }

    // Always return success
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
