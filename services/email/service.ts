// =============================================================================
// EMAIL SERVICE — Send real emails via Resend
// =============================================================================
// Fallback: logs to console if RESEND_API_KEY not set (dev mode)
// =============================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "Fruxal <noreply@fruxal.com>";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`📧 [DEV] Email to ${to}: ${subject}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, text }),
    });
    return res.ok;
  } catch (e) {
    console.error("Email send failed:", e);
    return false;
  }
}

// ─── Pre-built email templates ──────────────────────────────────────────────

export function emailTemplate(title: string, body: string, ctaText: string, ctaUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;padding:40px 20px">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <div style="font-size:20px;font-weight:900;margin-bottom:4px">💧 Fruxal</div>
    <div style="font-size:12px;color:#888;margin-bottom:24px">Business Intelligence</div>
    <div style="font-size:18px;font-weight:800;color:#1a1a2e;margin-bottom:12px">${title}</div>
    <div style="font-size:14px;color:#555;line-height:1.6;margin-bottom:24px">${body}</div>
    <a href="${ctaUrl}" style="display:inline-block;background:#00c853;color:#000;font-weight:800;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none">${ctaText}</a>
  </div>
  <div style="text-align:center;margin-top:16px;font-size:11px;color:#aaa">
    Fruxal · <a href="${ctaUrl}" style="color:#aaa">fruxal.com</a>
  </div>
</div></body></html>`;
}

export async function sendScanComplete(to: string, businessName: string, totalLeaking: number, leakCount: number, urgentCount: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: `We found $${totalLeaking.toLocaleString()} leaking from ${businessName}`,
    html: emailTemplate(
      `$${totalLeaking.toLocaleString()}/yr leaking from ${businessName}`,
      `We found <strong>${leakCount} leaks</strong> across your business. <strong>${urgentCount} need urgent attention.</strong><br><br>Open your dashboard to see exactly where the money is going and how to fix each one.`,
      "See Your Leaks →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.com"}/dashboard`
    ),
  });
}

export async function sendLeakFixed(to: string, leakTitle: string, savings: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: `${leakTitle} fixed! Saving $${savings.toLocaleString()}/yr`,
    html: emailTemplate(
      `🎉 ${leakTitle} fixed!`,
      `That fix saves you <strong>$${savings.toLocaleString()}/yr</strong>. Nice work.<br><br>Check your dashboard to see your updated health score and find the next leak to fix.`,
      "See Your Progress →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.com"}/dashboard?tab=trends`
    ),
  });
}

export async function sendWeeklyDigest(to: string, businessName: string, openLeaks: number, totalLeaking: number, fixedThisWeek: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Weekly: ${openLeaks} leaks open, $${totalLeaking.toLocaleString()} still leaking`,
    html: emailTemplate(
      `Weekly update for ${businessName}`,
      `<strong>${openLeaks} leaks</strong> still open · <strong>$${totalLeaking.toLocaleString()}/yr</strong> still leaking${fixedThisWeek > 0 ? ` · <strong>${fixedThisWeek} fixed</strong> this week 🎉` : ""}<br><br>Your biggest open leak is waiting on your fix list.`,
      "Open Fix List →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.com"}/dashboard?tab=fix`
    ),
  });
}

export async function sendNudge(to: string, totalLeaking: number): Promise<boolean> {
  const daily = Math.round(totalLeaking / 365);
  return sendEmail({
    to,
    subject: `You're losing $${daily}/day — let's fix that`,
    html: emailTemplate(
      `$${daily} lost today. And yesterday. And the day before.`,
      `Your scan found <strong>$${totalLeaking.toLocaleString()}/yr</strong> in leaks. Every day without action costs <strong>$${daily}</strong>.<br><br>The average user fixes their first leak within 48 hours. You can do it in one click.`,
      "Fix My First Leak →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.com"}/dashboard?tab=fix`
    ),
  });
}
