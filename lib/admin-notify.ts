// =============================================================================
// lib/admin-notify.ts — Admin operations alert emails
// =============================================================================
// Sends concise ops alerts to ADMIN_EMAILS when key business events happen.
// All non-fatal — never block the main flow.
// =============================================================================
import { sendEmail } from "@/services/email/service";

const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS || "")
  .split(",").map(e => e.trim()).filter(Boolean);

const APP_URL = process.env.NEXTAUTH_URL || "https://fruxal.ca";

type AlertType =
  | "hot_lead_assigned"
  | "engagement_started"
  | "fee_collected"
  | "commission_pending"
  | "cron_failed"
  | "rep_unresponsive";

interface AlertPayload {
  type:       AlertType;
  company?:   string;
  rep?:       string;
  amount?:    number;
  province?:  string;
  industry?:  string;
  score?:     number;
  cronName?:  string;
  error?:     string;
  link?:      string;
  extra?:     string;
}

const SUBJECTS: Record<AlertType, (p: AlertPayload) => string> = {
  hot_lead_assigned:  p => `🔥 HOT lead assigned — ${p.company || "unknown"} (score ${p.score ?? "?"})`,
  engagement_started: p => `⚡ Engagement started — ${p.company || "unknown"}`,
  fee_collected:      p => `💰 Fee collected — ${p.company || "unknown"} · $${(p.amount ?? 0).toLocaleString()}`,
  commission_pending: p => `💸 Commission pending — ${p.rep || "rep"} · $${(p.amount ?? 0).toLocaleString()}`,
  cron_failed:        p => `🚨 Cron failed — ${p.cronName || "unknown"}`,
  rep_unresponsive:   p => `⚠️ Rep unresponsive — ${p.rep || "rep"} · ${p.company || "client"}`,
};

function buildBody(p: AlertPayload): string {
  const rows: string[] = [];
  if (p.company)  rows.push(`<b>Company:</b> ${p.company}`);
  if (p.rep)      rows.push(`<b>Rep:</b> ${p.rep}`);
  if (p.province) rows.push(`<b>Province:</b> ${p.province}`);
  if (p.industry) rows.push(`<b>Industry:</b> ${p.industry}`);
  if (p.score != null) rows.push(`<b>Lead score:</b> ${p.score}/100`);
  if (p.amount != null) rows.push(`<b>Amount:</b> $${p.amount.toLocaleString()}`);
  if (p.cronName) rows.push(`<b>Cron:</b> ${p.cronName}`);
  if (p.error)    rows.push(`<b>Error:</b> <span style="color:#B34040">${p.error}</span>`);
  if (p.extra)    rows.push(p.extra);
  const body = rows.map(r => `<p style="margin:4px 0;font-size:13px;color:#3d3d4e">${r}</p>`).join("");
  const linkUrl = p.link || `${APP_URL}/admin/overview`;
  return `<div style="font-family:sans-serif;padding:16px">${body}
    <p style="margin:16px 0 0"><a href="${linkUrl}" style="color:#1B3A2D;font-weight:700">View in admin →</a></p></div>`;
}

export async function notifyAdmin(payload: AlertPayload): Promise<void> {
  if (!ADMIN_EMAILS.length) return;
  const subject = SUBJECTS[payload.type]?.(payload) ?? `Fruxal ops alert: ${payload.type}`;
  const html = buildBody(payload);
  await Promise.all(
    ADMIN_EMAILS.map(to => sendEmail({ to, subject, html }).catch(() => {}))
  );
}
