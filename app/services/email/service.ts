// =============================================================================
// EMAIL SERVICE — Send real emails via Resend
// =============================================================================
// Fallback: logs to console if RESEND_API_KEY not set (dev mode)
// =============================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Fruxal <noreply@fruxal.com>";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    process.env.NODE_ENV === "development" && console.log(`📧 [DEV] Email to ${to}: ${subject}`);
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
    Fruxal · <a href="${ctaUrl}" style="color:#aaa">fruxal.ca</a>
  </div>
</div></body></html>`;
}

export async function sendScanComplete(to: string, businessName: string, totalLeaking: number, leakCount: number, urgentCount: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: `We found $${(totalLeaking ?? 0).toLocaleString()} leaking from ${businessName}`,
    html: emailTemplate(
      `$${(totalLeaking ?? 0).toLocaleString()}/yr leaking from ${businessName}`,
      `We found <strong>${leakCount} leaks</strong> across your business. <strong>${urgentCount} need urgent attention.</strong><br><br>Open your dashboard to see exactly where the money is going and how to fix each one.`,
      "See Your Leaks →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/dashboard`
    ),
  });
}

export async function sendLeakFixed(to: string, leakTitle: string, savings: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: `${leakTitle} fixed! Saving $${(savings ?? 0).toLocaleString()}/yr`,
    html: emailTemplate(
      `🎉 ${leakTitle} fixed!`,
      `That fix saves you <strong>$${(savings ?? 0).toLocaleString()}/yr</strong>. Nice work.<br><br>Check your dashboard to see your updated health score and find the next leak to fix.`,
      "See Your Progress →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/dashboard?tab=trends`
    ),
  });
}

export async function sendWeeklyDigest(to: string, businessName: string, openLeaks: number, totalLeaking: number, fixedThisWeek: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Weekly: ${openLeaks} leaks open, $${(totalLeaking ?? 0).toLocaleString()} still leaking`,
    html: emailTemplate(
      `Weekly update for ${businessName}`,
      `<strong>${openLeaks} leaks</strong> still open · <strong>$${(totalLeaking ?? 0).toLocaleString()}/yr</strong> still leaking${fixedThisWeek > 0 ? ` · <strong>${fixedThisWeek} fixed</strong> this week 🎉` : ""}<br><br>Your biggest open leak is waiting on your fix list.`,
      "Open Fix List →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/dashboard?tab=fix`
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
      `Your scan found <strong>$${(totalLeaking ?? 0).toLocaleString()}/yr</strong> in leaks. Every day without action costs <strong>$${daily}</strong>.<br><br>The average user fixes their first leak within 48 hours. You can do it in one click.`,
      "Fix My First Leak →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/dashboard?tab=fix`
    ),
  });
}

// =============================================================================
// MILESTONE EMAIL — Sent when savings_recovered crosses a threshold
// Deduplication is handled by the snapshot route (milestone_sent column)
// =============================================================================

interface MilestoneEmailArgs {
  to: string;
  milestone: number;
  savings_recovered: number;
  savings_available: number;
  annualized: number;
  top_tasks: { title: string; savings_monthly: number }[];
  next_task: { title: string; savings_monthly: number } | null;
}

export async function sendMilestoneEmail({
  to, milestone, savings_recovered, savings_available,
  annualized, top_tasks, next_task,
}: MilestoneEmailArgs): Promise<boolean> {
  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const tasksUrl = `${appUrl}/v2/tasks`;

  const taskLines = top_tasks
    .map(t => `<tr><td style="padding:6px 0;font-size:13px;color:#555">→ ${t.title}</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#00c853;text-align:right">$${(t.savings_monthly ?? 0).toLocaleString()}/mo</td></tr>`)
    .join("");

  const nextLine = next_task
    ? `<p style="margin:16px 0 0;font-size:13px;color:#555">Your next easiest fix: <strong>${next_task.title}</strong> ($${(next_task.savings_monthly ?? 0).toLocaleString()}/mo)</p>`
    : "";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;padding:40px 20px">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <div style="font-size:20px;font-weight:900;margin-bottom:4px">💧 Fruxal</div>
    <div style="font-size:12px;color:#888;margin-bottom:24px">Business Intelligence</div>
    <div style="font-size:32px;margin-bottom:8px">🎉</div>
    <div style="font-size:22px;font-weight:900;color:#1a1a2e;margin-bottom:8px">
      You just hit $${(milestone ?? 0).toLocaleString()}/month recovered
    </div>
    <div style="font-size:14px;color:#555;margin-bottom:20px">
      That's <strong>$${(annualized ?? 0).toLocaleString()}/year</strong> staying in your business.
    </div>
    <div style="background:#f7f8fa;border-radius:10px;padding:16px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">What you've fixed</div>
      <table style="width:100%;border-collapse:collapse">${taskLines}</table>
    </div>
    <div style="font-size:13px;color:#555;margin-bottom:20px">
      You still have <strong style="color:#1B3A2D">$${(savings_available ?? 0).toLocaleString()}/month</strong> available to capture.
      ${nextLine}
    </div>
    <a href="${tasksUrl}" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none">
      Continue fixing →
    </a>
  </div>
  <div style="text-align:center;margin-top:16px;font-size:11px;color:#aaa">Fruxal · fruxal.ca</div>
</div></body></html>`;

  return sendEmail({
    to,
    subject: `🎉 You've recovered $${(milestone ?? 0).toLocaleString()}/month on Fruxal`,
    html,
    text: `You just hit $${(milestone ?? 0).toLocaleString()}/month recovered. That's $${(annualized ?? 0).toLocaleString()}/year staying in your business. See your progress: ${tasksUrl}`,
  });
}

// =============================================================================
// MONTHLY BRIEF TEMPLATE — Wraps Claude-generated body_html in Fruxal layout
// Used by the monthly-brief cron and preview endpoint
// =============================================================================

interface MonthlyBriefArgs {
  bodyHtml:     string;
  bodyText:     string;
  businessName: string;
  unsubUrl:     string;
  appUrl:       string;
}

export function renderMonthlyBrief({
  bodyHtml, bodyText, businessName, unsubUrl, appUrl,
}: MonthlyBriefArgs): { html: string; text: string } {
  const now = new Date();
  const monthYear = now.toLocaleDateString("en-CA", { month: "long", year: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:580px;margin:0 auto;padding:32px 16px">

  <!-- Header -->
  <div style="background:#1B3A2D;border-radius:16px 16px 0 0;padding:24px 32px">
    <div style="font-size:18px;font-weight:900;color:white;margin-bottom:2px">💧 Fruxal</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.1em">Monthly Financial Brief</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:8px;font-weight:600">${businessName} — ${monthYear}</div>
  </div>

  <!-- Body -->
  <div style="background:white;padding:28px 32px">
    ${bodyHtml}
  </div>

  <!-- Divider + action links -->
  <div style="background:white;border-top:1px solid #F0EFEB;padding:16px 32px 24px;border-radius:0 0 16px 16px">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:0">
          <a href="${appUrl}/v2/tasks" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:12px;padding:10px 20px;border-radius:8px;text-decoration:none">View action plan →</a>
        </td>
      </tr>
    </table>
    <div style="margin-top:16px;font-size:11px;color:#aaa">
      <a href="${appUrl}/v2/settings" style="color:#aaa;text-decoration:none">Update preferences</a>
      &nbsp;·&nbsp;
      <a href="${unsubUrl}" style="color:#aaa;text-decoration:none">Unsubscribe from monthly briefs</a>
    </div>
  </div>

  <div style="text-align:center;margin-top:16px;font-size:10px;color:#c5c2bb">
    Fruxal Business Intelligence · fruxal.ca
  </div>
</div>
</body>
</html>`;

  const fullText = `${businessName} — Monthly Brief (${monthYear})\n\n${bodyText}\n\n---\nView your action plan: ${appUrl}/v2/tasks\nUnsubscribe: ${unsubUrl}`;

  return { html, text: fullText };
}

// =============================================================================
// GOAL COMPLETED EMAIL — Sent when progress_pct reaches 100%
// =============================================================================

interface GoalCompletedEmailArgs {
  to:            string;
  goalTitle:     string;
  recoveredMo:   number;
  daysAhead:     number;   // how many days before deadline
}

export async function sendGoalCompletedEmail({
  to, goalTitle, recoveredMo, daysAhead,
}: GoalCompletedEmailArgs): Promise<boolean> {
  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const html = emailTemplate(
    `🏆 Goal achieved: ${goalTitle}`,
    `You hit your goal${daysAhead > 0 ? ` <strong>${daysAhead} days early</strong>` : ""}! You recovered <strong>$${(recoveredMo ?? 0).toLocaleString()}/month</strong> — that's <strong>$${((recoveredMo ?? 0) * 12).toLocaleString()}/year</strong> staying in your business.<br><br>Set your next 90-day goal and keep the momentum going.`,
    "Set your next goal →",
    `${appUrl}/v2/dashboard`
  );
  return sendEmail({ to, subject: `🏆 Goal achieved — ${goalTitle}`, html });
}

// =============================================================================
// RESCAN COMPLETE EMAIL — Sent immediately after comparison is generated
// Deduplication enforced via monthly_briefs table (one per report_id)
// =============================================================================

interface RescanEmailArgs {
  to:               string;
  headline:         string;
  narrative:        string;
  scoreDelta:       number;
  prevScore:        number;
  newScore:         number;
  savingsRecovered: number;
  newIssuesCount:   number;
  netMonthly:       number;
  daysBetween:      number;
  newReportId:      string;
}

export async function sendRescanEmail({
  to, headline, narrative, scoreDelta, prevScore, newScore,
  savingsRecovered, newIssuesCount, netMonthly, daysBetween, newReportId,
}: RescanEmailArgs): Promise<boolean> {
  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const reportUrl = `${appUrl}/v2/diagnostic/${newReportId}`;
  const tasksUrl  = `${appUrl}/v2/tasks`;

  const scoreLine = scoreDelta > 0
    ? `<span style="color:#2D7A50;font-weight:700">↑ ${prevScore} → ${newScore} (+${scoreDelta})</span>`
    : scoreDelta < 0
    ? `<span style="color:#C4841D;font-weight:700">↓ ${prevScore} → ${newScore} (${scoreDelta})</span>`
    : `<span style="color:#8E8C85;font-weight:700">${newScore}/100 — unchanged</span>`;

  const netLine = netMonthly > 0
    ? `<strong style="color:#2D7A50">Net: +$${netMonthly.toLocaleString()}/month better overall</strong>`
    : netMonthly < 0
    ? `<strong style="color:#C4841D">Net: -$${Math.abs(netMonthly).toLocaleString()}/month (new issues found)</strong>`
    : `<strong>Net: Even — recoveries match new findings</strong>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="background:#1B3A2D;border-radius:16px 16px 0 0;padding:24px 32px">
    <div style="font-size:18px;font-weight:900;color:white;margin-bottom:2px">💧 Fruxal</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.1em">Rescan complete — ${daysBetween} days since last scan</div>
  </div>
  <div style="background:white;padding:28px 32px">
    <div style="font-size:18px;font-weight:900;color:#1a1a2e;margin-bottom:12px">${headline}</div>
    <div style="background:#f7f8fa;border-radius:10px;padding:16px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Score</div>${scoreLine}</div>
        ${savingsRecovered > 0 ? `<div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Recovered</div><span style="color:#2D7A50;font-weight:700">+$${savingsRecovered.toLocaleString()}/month</span></div>` : ""}
        ${newIssuesCount > 0 ? `<div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">New issues</div><span style="color:#C4841D;font-weight:700">${newIssuesCount} found</span></div>` : ""}
        <div><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Net</div>${netLine}</div>
      </div>
    </div>
    ${narrative ? `<div style="font-size:14px;color:#555;line-height:1.6;margin-bottom:24px">${narrative}</div>` : ""}
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <a href="${reportUrl}" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none">View full diagnostic →</a>
      <a href="${tasksUrl}" style="display:inline-block;background:#f0f0f0;color:#1B3A2D;font-weight:700;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none">See what to fix next →</a>
    </div>
  </div>
  <div style="text-align:center;margin-top:16px;font-size:10px;color:#c5c2bb">Fruxal Business Intelligence · fruxal.ca</div>
</div>
</body></html>`;

  const scoreSymbol = scoreDelta > 0 ? `+${scoreDelta}` : String(scoreDelta);
  const subject = `Your scan is in — score ${scoreSymbol}, net ${netMonthly >= 0 ? "+" : ""}$${Math.abs(netMonthly).toLocaleString()}/month`;

  return sendEmail({ to, subject, html,
    text: `${headline}\n\nScore: ${prevScore} → ${newScore} (${scoreSymbol})\nRecovered: $${(savingsRecovered ?? 0).toLocaleString()}/month\nNew issues: ${newIssuesCount}\n\n${narrative}\n\nView your diagnostic: ${reportUrl}`,
  });
}

// =============================================================================
// PAYMENT FAILED EMAIL
// =============================================================================
interface PaymentFailedArgs { to: string; plan: string; }

export async function sendPaymentFailedEmail({ to, plan }: PaymentFailedArgs): Promise<boolean> {
  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const html = emailTemplate(
    "Action required — payment failed",
    `Your payment for Fruxal ${plan} failed.<br><br>You have <strong>3 days of continued access</strong> while we retry.<br><br>To update your payment method, visit your billing settings. If payment is not updated within 3 days, your account will be downgraded to the free tier. <strong>Your data is never deleted for billing reasons</strong> — it will be waiting when you return.`,
    "Update payment method →",
    `${appUrl}/v2/settings#billing`
  );
  return sendEmail({ to, subject: `Action required — payment failed for your Fruxal ${plan}`, html });
}

// =============================================================================
// WELCOME EMAIL — sent immediately after account creation
// =============================================================================
interface WelcomeEmailArgs {
  to:           string;
  name?:        string;
  industry?:    string;
  province?:    string;
  qualifiedPlan?: string;
  teaserLeaks?: Array<{ title?: string; title_fr?: string; impact_min?: number; category?: string }>;
  lang?:        "en" | "fr";
}

export async function sendWelcomeEmail({
  to, name, industry, province, qualifiedPlan, teaserLeaks, lang = "en",
}: WelcomeEmailArgs): Promise<boolean> {
  const appUrl  = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const isFR    = lang === "fr" || (province === "QC" && lang !== "en");
  const greeting = name ? (isFR ? `Bonjour ${name}` : `Hi ${name}`) : (isFR ? "Bonjour" : "Hi there");
  const topLeaks = (teaserLeaks ?? []).slice(0, 3);

  const leaksHtml = topLeaks.length > 0
    ? `<div style="margin:20px 0;background:#F5F9F6;border-radius:10px;padding:16px 20px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1B3A2D;">
          ${isFR ? "Vos principales fuites détectées :" : "Your top leaks detected:"}
        </p>
        ${topLeaks.map(l => {
          const title = isFR && l.title_fr ? l.title_fr : (l.title ?? l.category ?? "Financial leak");
          const amt   = l.impact_min ? `~$${Math.round(l.impact_min / 12).toLocaleString()}/mo` : "";
          return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid rgba(27,58,45,0.08);font-size:13px;">
            <span style="color:#2C2C2A;">${title}</span>
            <span style="font-weight:600;color:#1B3A2D;">${amt}</span>
          </div>`;
        }).join("")}
      </div>`
    : "";

  const subject  = isFR ? "Bienvenue sur Fruxal — voici vos prochaines étapes" : "Welcome to Fruxal — here's what to do next";
  const bodyText = isFR
    ? `${greeting},<br><br>Votre compte Fruxal est prêt. Voici ce que vous devez faire maintenant :`
    : `${greeting},<br><br>Your Fruxal account is ready. Here's what to do now:`;

  const steps = isFR
    ? [
        { n: "1", text: "Lancez votre diagnostic complet", sub: "Obtenez votre score santé, tous vos constats et votre plan d'action personnalisé", href: `${appUrl}/v2/diagnostic` },
        { n: "2", text: "Complétez votre première tâche", sub: "Chaque tâche complétée récupère de l'argent dans votre entreprise", href: `${appUrl}/v2/diagnostic` },
        { n: "3", text: "Fixez un objectif de 90 jours", sub: "Engagez-vous sur un montant à récupérer ce trimestre", href: `${appUrl}/v2/dashboard` },
      ]
    : [
        { n: "1", text: "Run your full diagnostic", sub: "Get your health score, all findings, and a personalized 90-day action plan", href: `${appUrl}/v2/diagnostic` },
        { n: "2", text: "Complete your first task", sub: "Every task you complete recovers real money back into your business", href: `${appUrl}/v2/diagnostic` },
        { n: "3", text: "Set a 90-day goal", sub: "Commit to a savings target for this quarter", href: `${appUrl}/v2/dashboard` },
      ];

  const stepsHtml = steps.map(s =>
    `<div style="display:flex;gap:14px;margin-bottom:16px;align-items:flex-start;">
      <div style="width:28px;height:28px;border-radius:14px;background:#1B3A2D;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="color:white;font-size:12px;font-weight:700;">${s.n}</span>
      </div>
      <div>
        <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1A1A18;">${s.text}</p>
        <p style="margin:0;font-size:12px;color:#56554F;">${s.sub}</p>
      </div>
    </div>`
  ).join("");

  const html = emailTemplate(
    subject,
    `${bodyText}<br><br>${leaksHtml}${stepsHtml}`,
    isFR ? "Lancer mon diagnostic →" : "Run my diagnostic →",
    `${appUrl}/v2/diagnostic`
  );

  return sendEmail({ to, subject, html });
}
