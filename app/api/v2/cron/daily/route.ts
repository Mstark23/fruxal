// =============================================================================
// src/app/api/v2/cron/daily/route.ts
// =============================================================================
// DAILY CRON — Runs every day at 7am EST.
//
// 1. Recompute deadlines for all active businesses
// 2. Generate notifications (in-app + email queue)
// 3. Process email queue (send batch via Resend/SendGrid/etc.)
// 4. Escalate overdue items
//
// vercel.json: { "crons": [{ "path": "/api/v2/cron/daily", "schedule": "0 12 * * *" }] }
// (12 UTC = 7am EST / 8am EDT)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(req: NextRequest): boolean {
  const cronHeader = req.headers.get("x-vercel-cron");
  const authHeader = req.headers.get("authorization");
  return (
    cronHeader === "1" ||
    (!!CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) ||
    process.env.NODE_ENV === "development"
  );
}

export const maxDuration = 300; // Vercel function timeout (seconds)



// Vercel Cron sends GET — alias to POST handler
export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  const start = Date.now();

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, any> = {};

  try {
    // ─── STEP 1: Generate daily notifications ───────────────────────
    process.env.NODE_ENV !== "production" && console.log("[Cron:Daily] Generating notifications...");
    const { data: notifResult, error: notifErr } = await supabaseAdmin.rpc(
      "generate_daily_notifications"
    );
    if (notifErr) {
      console.error("[Cron:Daily] Notification error:", notifErr);
      results.notifications = { error: notifErr.message };
    } else {
      results.notifications = notifResult;
    }

    // ─── STEP 2: Process email queue ────────────────────────────────
    process.env.NODE_ENV !== "production" && console.log("[Cron:Daily] Processing email queue...");
    const { data: emails, error: queueErr } = await supabaseAdmin.rpc(
      "process_email_queue",
      { p_batch_size: 100 }
    );

    if (queueErr) {
      console.error("[Cron:Daily] Queue error:", queueErr);
      results.emails = { error: queueErr.message };
    } else if (emails && emails.length > 0) {
      // Send each email
      let sent = 0;
      let failed = 0;

      for (const email of emails) {
        try {
          await sendEmail(email);
          await supabaseAdmin.rpc("mark_email_sent", { p_email_id: email.id });
          sent++;
        } catch (err: any) {
          await supabaseAdmin.rpc("mark_email_failed", {
            p_email_id: email.id,
            p_error: err.message,
          });
          failed++;
        }
      }

      results.emails = { total: emails.length, sent, failed };
    } else {
      results.emails = { total: 0, sent: 0, failed: 0 };
    }

    // ─── STEP 3: Check for Monday → weekly digest ───────────────────
    const today = new Date();
    if (today.getDay() === 1) {
      // Monday
      process.env.NODE_ENV !== "production" && console.log("[Cron:Daily] Monday — generating weekly digests...");
      const { data: digestCount, error: digestErr } = await supabaseAdmin.rpc(
        "generate_weekly_digest"
      );
      if (digestErr) {
        results.weekly_digest = { error: digestErr.message };
      } else {
        results.weekly_digest = { queued: digestCount };
      }
    }

    const took = Date.now() - start;
    process.env.NODE_ENV !== "production" && console.log(`[Cron:Daily] Complete in ${took}ms`, results);

    return NextResponse.json({
      success: true,
      took_ms: took,
      ...results,
    });
  } catch (err: any) {
    console.error("[Cron:Daily] Fatal error:", err);
    return NextResponse.json(
      { success: false, error: err.message, partial_results: results },
      { status: 500 }
    );
  }
}

// =============================================================================
// EMAIL SENDER — Swap provider here
// =============================================================================
// Replace with your email provider: Resend, SendGrid, AWS SES, Postmark, etc.

async function sendEmail(email: any): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER || "resend";

  if (provider === "resend") {
    await sendViaResend(email);
  } else if (provider === "sendgrid") {
    await sendViaSendGrid(email);
  } else {
    // Log-only mode (development)
    process.env.NODE_ENV !== "production" && console.log(`[Email:Dev] Would send to ${email.to_email}: ${email.subject}`);
  }
}

async function sendViaResend(email: any): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

  const html = buildEmailHtml(email);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Fruxal <alerts@fruxal.com>",
      to: [email.to_email],
      subject: email.subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

async function sendViaSendGrid(email: any): Promise<void> {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set");

  const html = buildEmailHtml(email);

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: email.to_email, name: email.to_name }] }],
      from: { email: process.env.EMAIL_FROM_ADDRESS || "alerts@fruxal.com", name: "Fruxal" },
      subject: email.subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid error: ${err}`);
  }
}

// =============================================================================
// EMAIL TEMPLATE BUILDER
// =============================================================================

function buildEmailHtml(email: any): string {
  const d = email.template_data || {};
  const lang = email.language || "fr";
  const isFr = lang === "fr";

  const title = isFr ? (d.obligation_title_fr || d.obligation_title) : d.obligation_title;
  const urgencyColor = d.urgency === "critical" ? "#ef4444" : d.urgency === "warning" ? "#f59e0b" : "#3b82f6";

  if (email.template === "weekly_digest") {
    return buildWeeklyDigestHtml(d, isFr);
  }

  // Default: obligation reminder / overdue / escalation
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">

  <!-- Logo -->
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#10b981,#059669);text-align:center;line-height:36px;color:#fff;font-weight:800;font-size:16px;">L</div>
  </div>

  <!-- Card -->
  <div style="background:#12161e;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:28px;margin-bottom:20px;">

    <!-- Urgency badge -->
    <div style="display:inline-block;padding:4px 12px;border-radius:6px;background:${urgencyColor}20;color:${urgencyColor};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">
      ${d.tier === "overdue" ? (isFr ? "EN RETARD" : "OVERDUE") : d.days_until <= 7 ? (isFr ? "URGENT" : "URGENT") : (isFr ? "RAPPEL" : "REMINDER")}
    </div>

    <!-- Title -->
    <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 8px;">${title || "Obligation"}</h2>

    <!-- Details -->
    <div style="margin:16px 0;padding:16px;background:rgba(255,255,255,0.03);border-radius:10px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.35);font-size:12px;">${isFr ? "Catégorie" : "Category"}</td>
          <td style="padding:6px 0;color:rgba(255,255,255,0.8);font-size:12px;text-align:right;">${d.category || "—"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.35);font-size:12px;">${isFr ? "Échéance" : "Deadline"}</td>
          <td style="padding:6px 0;color:${urgencyColor};font-size:12px;font-weight:600;text-align:right;">${d.deadline_date || "—"}${d.days_until !== undefined ? ` (${d.days_until < 0 ? Math.abs(d.days_until) + (isFr ? " jours de retard" : " days overdue") : d.days_until + (isFr ? " jours" : " days")})` : ""}</td>
        </tr>
        ${d.penalty_max ? `<tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.35);font-size:12px;">${isFr ? "Pénalité max" : "Max penalty"}</td>
          <td style="padding:6px 0;color:#ef4444;font-size:12px;font-weight:700;text-align:right;">$${Number(d.penalty_max).toLocaleString()}</td>
        </tr>` : ""}
      </table>
    </div>

    <!-- CTA -->
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://app.fruxal.com"}${d.dashboard_url || "/v2/obligations"}"
       style="display:block;text-align:center;padding:14px;background:#10b981;color:#fff;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;margin-top:20px;">
      ${d.tier === "overdue" ? (isFr ? "Corriger maintenant →" : "Fix Now →") : (isFr ? "Voir l'obligation →" : "View Obligation →")}
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;color:rgba(255,255,255,0.15);font-size:10px;line-height:1.6;">
    <p>Fruxal · ${isFr ? "Intelligence financière pour PME" : "Financial Intelligence for SMBs"}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://app.fruxal.com"}/settings/notifications" style="color:rgba(255,255,255,0.25);text-decoration:underline;">${isFr ? "Gérer les notifications" : "Manage notifications"}</a></p>
  </div>

</div>
</body>
</html>`;
}

function buildWeeklyDigestHtml(d: any, isFr: boolean): string {
  const overdueItems = (d.overdue_items || []).slice(0, 5);
  const weekItems = (d.this_week_items || []).slice(0, 5);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0e14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">

  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#10b981,#059669);text-align:center;line-height:36px;color:#fff;font-weight:800;font-size:16px;">L</div>
    <h2 style="color:#fff;font-size:20px;margin:12px 0 4px;">${isFr ? "Résumé hebdomadaire" : "Weekly Summary"}</h2>
    <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">${d.reference_date || ""}</p>
  </div>

  <!-- Stats -->
  <div style="background:#12161e;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px;margin-bottom:16px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="text-align:center;padding:8px;">
          <div style="color:${(d.overdue_count ?? 0) > 0 ? "#ef4444" : "#10b981"};font-size:24px;font-weight:800;">${d.overdue_count ?? 0}</div>
          <div style="color:rgba(255,255,255,0.3);font-size:10px;text-transform:uppercase;">${isFr ? "En retard" : "Overdue"}</div>
        </td>
        <td style="text-align:center;padding:8px;">
          <div style="color:#f59e0b;font-size:24px;font-weight:800;">${d.due_this_week ?? 0}</div>
          <div style="color:rgba(255,255,255,0.3);font-size:10px;text-transform:uppercase;">${isFr ? "Cette sem." : "This Week"}</div>
        </td>
        <td style="text-align:center;padding:8px;">
          <div style="color:#3b82f6;font-size:24px;font-weight:800;">${d.due_this_month ?? 0}</div>
          <div style="color:rgba(255,255,255,0.3);font-size:10px;text-transform:uppercase;">${isFr ? "Ce mois" : "This Month"}</div>
        </td>
        <td style="text-align:center;padding:8px;">
          <div style="color:#10b981;font-size:24px;font-weight:800;">${d.completed_this_year ?? 0}</div>
          <div style="color:rgba(255,255,255,0.3);font-size:10px;text-transform:uppercase;">${isFr ? "Complétées" : "Completed"}</div>
        </td>
      </tr>
    </table>
  </div>

  ${(d.total_penalty_exposure ?? 0) > 0 ? `
  <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15);border-radius:12px;padding:14px;margin-bottom:16px;text-align:center;">
    <span style="color:rgba(255,255,255,0.4);font-size:11px;">${isFr ? "Exposition aux pénalités" : "Penalty Exposure"}: </span>
    <span style="color:#ef4444;font-size:16px;font-weight:800;">$${Number(d.total_penalty_exposure).toLocaleString()}</span>
  </div>` : ""}

  ${overdueItems.length > 0 ? `
  <div style="background:#12161e;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px;margin-bottom:16px;">
    <h3 style="color:#ef4444;font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">${isFr ? "⚠️ En retard" : "⚠️ Overdue"}</h3>
    ${overdueItems.map((item: any) => `
    <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <div style="color:rgba(255,255,255,0.8);font-size:13px;">${isFr ? (item.title_fr || item.title) : item.title}</div>
      <div style="color:rgba(255,255,255,0.25);font-size:11px;">${item.days_overdue || "?"} ${isFr ? "jours" : "days"} · ${item.penalty_max ? "$" + Number(item.penalty_max).toLocaleString() : ""}</div>
    </div>`).join("")}
  </div>` : ""}

  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://app.fruxal.com"}/v2/obligations"
     style="display:block;text-align:center;padding:14px;background:#10b981;color:#fff;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;">
    ${isFr ? "Voir toutes mes obligations →" : "View All Obligations →"}
  </a>

  <div style="text-align:center;color:rgba(255,255,255,0.15);font-size:10px;margin-top:24px;">
    <p>Fruxal</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://app.fruxal.com"}/settings/notifications" style="color:rgba(255,255,255,0.25);text-decoration:underline;">${isFr ? "Se désabonner" : "Unsubscribe"}</a></p>
  </div>

</div>
</body>
</html>`;
}
