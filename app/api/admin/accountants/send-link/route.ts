// POST /api/admin/accountants/send-link — admin sends magic link to accountant
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateMagicToken } from "@/lib/accountant-auth";
import { sendEmail } from "@/services/email/service";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { accountant_id } = await req.json();
  if (!accountant_id) return NextResponse.json({ success: false, error: "accountant_id required" }, { status: 400 });

  const { data: accountant } = await supabaseAdmin
    .from("accountants")
    .select("id, name, email, status")
    .eq("id", accountant_id)
    .single();

  if (!accountant) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const token  = generateMagicToken(accountant.id, accountant.email);
  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const link   = `${appUrl}/accountant/verify?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to:      accountant.email,
    subject: "Your Fruxal accountant portal access",
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f7f8fa;padding:40px 20px">
<div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;border:1px solid #E8E6E1">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
    <div style="width:26px;height:26px;border-radius:6px;background:#1B3A2D;display:flex;align-items:center;justify-content:center">
      <span style="color:white;font-weight:900;font-size:12px">F</span>
    </div>
    <span style="font-size:15px;font-weight:800;color:#1A1A18">Fruxal</span>
  </div>
  <p style="font-size:16px;font-weight:700;color:#1A1A18;margin:0 0 8px">Hi ${accountant.name},</p>
  <p style="font-size:14px;color:#56554F;margin:0 0 20px;line-height:1.6">
    You've been added to the Fruxal accountant portal. Click below to access your work queue.
  </p>
  <a href="${link}" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;text-decoration:none">
    Open My Dashboard →
  </a>
  <p style="font-size:11px;color:#B5B3AD;margin:20px 0 0">Link expires in 15 minutes. You can always request a new one at ${appUrl}/accountant/login</p>
</div></body></html>`,
  });

  return NextResponse.json({ success: true });
}
