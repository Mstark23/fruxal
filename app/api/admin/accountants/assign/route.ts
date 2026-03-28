// POST /api/admin/accountants/assign — assign execution playbooks to accountant
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { playbook_ids, accountant_id } = await req.json();
  if (!playbook_ids?.length || !accountant_id) {
    return NextResponse.json({ success: false, error: "playbook_ids[] + accountant_id required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("execution_playbooks")
    .update({ assigned_to: accountant_id, updated_at: new Date().toISOString() })
    .in("id", playbook_ids);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  // Notify accountant by email (non-blocking)
  try {
    const { data: accountant } = await supabaseAdmin
      .from("accountants")
      .select("name, email")
      .eq("id", accountant_id)
      .single();

    if (accountant?.email) {
      const { sendEmail } = await import("@/services/email/service");
      const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
      await sendEmail({
        to:      accountant.email,
        subject: `${playbook_ids.length} new finding${playbook_ids.length !== 1 ? "s" : ""} assigned to you`,
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
    <strong>${playbook_ids.length} new finding${playbook_ids.length !== 1 ? "s have" : " has"} been assigned to your queue.</strong><br><br>
    Open your dashboard to see the execution steps and draft templates ready for you.
  </p>
  <a href="${appUrl}/accountant/dashboard" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;text-decoration:none">
    View My Queue →
  </a>
</div></body></html>`,
      });
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({ success: true, assigned: playbook_ids.length });
}
