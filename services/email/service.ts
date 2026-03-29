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
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px"><div style="width:26px;height:26px;border-radius:6px;background:#1B3A2D;display:flex;align-items:center;justify-content:center"><span style="color:white;font-weight:900;font-size:12px">F</span></div><span style="font-size:15px;font-weight:800;color:#1A1A18">Fruxal</span></div>
    <div style="font-size:18px;font-weight:800;color:#1A1A18;margin-bottom:14px;line-height:1.3">${title}</div>
    <div style="font-size:14px;color:#56554F;line-height:1.7;margin-bottom:28px">${body}</div>
    <a href="${ctaUrl}" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:13px;padding:12px 24px;border-radius:8px;text-decoration:none">${ctaText}</a>
  </div>
  <div style="text-align:center;margin-top:20px;font-size:11px;color:#B5B3AD">
    Fruxal &nbsp;·&nbsp; <a href="https://fruxal.ca" style="color:#B5B3AD;text-decoration:none">fruxal.ca</a>
  </div>
</div></body></html>`;
}

export async function sendScanComplete(to: string, businessName: string, totalLeaking: number, leakCount: number, urgentCount: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: `We found $${(totalLeaking ?? 0).toLocaleString()} leaking from ${businessName}`,
    html: emailTemplate(
      `$${(totalLeaking ?? 0).toLocaleString()}/yr leaking from ${businessName}`,
      `We found <strong>${leakCount} leaks</strong> in your business — <strong>${urgentCount} urgent</strong>. Run your full intake so your rep can start recovering this money.`,
      "See Your Leaks →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/v2/dashboard`
    ),
  });
}

export async function sendLeakFixed(to: string, leakTitle: string, savings: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: `${leakTitle} confirmed — $${(savings ?? 0).toLocaleString()}/yr recovered`,
    html: emailTemplate(
      `💰 $${(savings ?? 0).toLocaleString()}/yr recovered`,
      `Your rep confirmed the recovery on <strong>${leakTitle}</strong>. That's <strong>$${(savings ?? 0).toLocaleString()}/yr</strong> back in your business.<br><br>Check your recovery timeline to see confirmed amounts and what's still in progress.`,
      "View My Recovery →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/v2/recovery`
    ),
  });
}

export async function sendWeeklyDigest(to: string, businessName: string, openLeaks: number, totalLeaking: number, fixedThisWeek: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Weekly: ${openLeaks} leaks open, $${(totalLeaking ?? 0).toLocaleString()}/yr still leaking`,
    html: emailTemplate(
      `Weekly update for ${businessName}`,
      `<strong>${openLeaks} leaks</strong> still open · <strong>$${(totalLeaking ?? 0).toLocaleString()}/yr</strong> still leaking${fixedThisWeek > 0 ? ` · <strong>$${fixedThisWeek.toLocaleString()}</strong> recovered this week 🎉` : ""}<br><br>Your rep is working on the highest-value items. Check your recovery status for updates.`,
      "View Recovery Status →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/v2/recovery`
    ),
  });
}

export async function sendNudge(to: string, totalLeaking: number): Promise<boolean> {
  const daily = Math.round(totalLeaking / 365);
  return sendEmail({
    to,
    subject: `You're losing $${daily}/day — your rep can stop that`,
    html: emailTemplate(
      `$${daily} lost today. And yesterday. And the day before.`,
      `Your scan found <strong>$${(totalLeaking ?? 0).toLocaleString()}/yr</strong> in leaks. Every day costs <strong>$${daily}</strong>.<br><br>Your recovery expert is waiting. Book a free call — we handle everything, and you only pay when money is actually recovered.`,
      "See My Leaks →",
      `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/v2/leaks`
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
  const recoveryUrl = `${appUrl}/v2/recovery`;

  const taskLines = top_tasks
    .map(t => `<tr><td style="padding:6px 0;font-size:13px;color:#555">→ ${t.title}</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#00c853;text-align:right">$${(t.savings_monthly ?? 0).toLocaleString()}/mo</td></tr>`)
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;padding:40px 20px">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <div style="font-size:20px;font-weight:900;margin-bottom:4px">💧 Fruxal</div>
    <div style="font-size:12px;color:#888;margin-bottom:24px">Business Recovery</div>
    <div style="font-size:32px;margin-bottom:8px">🎉</div>
    <div style="font-size:22px;font-weight:900;color:#1a1a2e;margin-bottom:8px">
      $${(milestone ?? 0).toLocaleString()}/month recovered
    </div>
    <div style="font-size:14px;color:#555;margin-bottom:20px">
      That's <strong>$${(annualized ?? 0).toLocaleString()}/year</strong> back in your business. Your rep did that — no upfront cost, no work on your end.
    </div>
    <div style="background:#f7f8fa;border-radius:10px;padding:16px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Confirmed recoveries</div>
      <table style="width:100%;border-collapse:collapse">${taskLines}</table>
    </div>
    <div style="font-size:13px;color:#555;margin-bottom:20px">
      There's still <strong style="color:#1B3A2D">$${(savings_available ?? 0).toLocaleString()}/month</strong> on the table — your rep is working through it.
    </div>
    <a href="${recoveryUrl}" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none">
      View My Recovery →
    </a>
  </div>
  <div style="text-align:center;margin-top:16px;font-size:11px;color:#aaa">Fruxal · fruxal.ca</div>
</div></body></html>`;

  return sendEmail({
    to,
    subject: `🎉 $${(milestone ?? 0).toLocaleString()}/month recovered — here's what's next`,
    html,
    text: `$${(milestone ?? 0).toLocaleString()}/month recovered. That's $${(annualized ?? 0).toLocaleString()}/year back in your business. View your recovery: ${recoveryUrl}`,
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
          <a href="${appUrl}/v2/recovery" style="display:inline-block;background:#1B3A2D;color:white;font-weight:700;font-size:12px;padding:10px 20px;border-radius:8px;text-decoration:none">View my recovery →</a>
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

  const fullText = `${businessName} — Monthly Brief (${monthYear})\n\n${bodyText}\n\n---\nView your recovery: ${appUrl}/v2/recovery\nUnsubscribe: ${unsubUrl}`;

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
      <a href="${appUrl}/v2/recovery" style="display:inline-block;background:#f0f0f0;color:#1B3A2D;font-weight:700;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none">View my recovery →</a>
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
  to, name, industry, province, qualifiedPlan, teaserLeaks, lang = "en", hasRep = false,
}: WelcomeEmailArgs & { hasRep?: boolean }): Promise<boolean> {
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

  const steps = hasRep
    ? (isFR
      ? [
          { n: "1", text: "Un expert en récupération vous a été assigné", sub: "Vous recevrez bientôt un appel de votre rep Fruxal — soyez disponible.", href: `${appUrl}/v2/dashboard` },
          { n: "2", text: "Préparez vos documents", sub: "Contrats fournisseurs, relevés bancaires récents, déclarations fiscales — votre rep vous guidera.", href: `${appUrl}/v2/collect` },
          { n: "3", text: "Aucun frais jusqu'à récupération", sub: "On prend 12% de ce qu'on récupère. Vous gardez 88%.", href: `${appUrl}/v2/dashboard` },
        ]
      : [
          { n: "1", text: "A recovery expert is being assigned to you", sub: "Your Fruxal rep will reach out soon — be available for a short call.", href: `${appUrl}/v2/dashboard` },
          { n: "2", text: "Prepare your documents", sub: "Vendor contracts, recent bank statements, tax returns — your rep will guide you on exactly what's needed.", href: `${appUrl}/v2/collect` },
          { n: "3", text: "No cost until money is recovered", sub: "We take 12% of what we recover. You keep 88%. Nothing until then.", href: `${appUrl}/v2/dashboard` },
        ])
    : (isFR
      ? [
          { n: "1", text: "Lancez votre analyse complète", sub: "Obtenez vos vrais montants — votre rep en a besoin pour commencer la récupération", href: `${appUrl}/v2/diagnostic` },
          { n: "2", text: "Voyez où votre argent fuit", sub: "Commencez par la fuite avec le montant le plus élevé — c'est votre plus grande opportunité", href: `${appUrl}/v2/leaks` },
          { n: "3", text: "Un expert en récupération s'occupera de tout", sub: "Pas de frais avant récupération. On prend 12% de ce qu'on récupère. Vous gardez le reste.", href: `${appUrl}/v2/dashboard` },
        ]
      : [
          { n: "1", text: "Run your full intake", sub: "Get your real numbers — your rep needs this to start recovering your money", href: `${appUrl}/v2/diagnostic` },
          { n: "2", text: "See where your money is leaking", sub: "The highest dollar amount is your biggest win — your rep will tackle it first", href: `${appUrl}/v2/leaks` },
          { n: "3", text: "A recovery expert handles everything", sub: "No cost until money is recovered. We take 12% of what we get back. You keep the rest.", href: `${appUrl}/v2/dashboard` },
        ]);

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

// ─────────────────────────────────────────────────────────────────────────────
// Rep notification emails
// ─────────────────────────────────────────────────────────────────────────────

/** Sent to customer when a rep is assigned to them */
export async function sendRepAssigned(
  to: string,
  businessName: string,
  repName: string,
  calendlyUrl: string | null,
  totalLeak: number,
  contingencyRate = 12,
): Promise<boolean> {
  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const keep = 100 - contingencyRate;
  const keepAmount = Math.round(totalLeak * (keep / 100));
  const ctaUrl = calendlyUrl || `${appUrl}/v2/dashboard`;
  const ctaText = calendlyUrl ? `Book a Free Call with ${repName} →` : "View Your Dashboard →";
  const body = `
    <p style="font-size:15px;color:#1a1a2e;margin:0 0 16px">Hi ${businessName},</p>
    <p style="color:#3d3d4e;margin:0 0 16px">
      We've reviewed your scan results and assigned <strong>${repName}</strong> as your dedicated recovery expert.
    </p>
    <p style="color:#3d3d4e;margin:0 0 16px">
      Based on what we found, you could recover <strong style="color:#2D7A50">$${keepAmount.toLocaleString()}/year</strong> 
      (after our ${contingencyRate}% contingency fee). You don't pay anything until savings are confirmed.
    </p>
    <p style="color:#3d3d4e;margin:0 0 24px">
      ${repName} will handle all the work — CRA/IRS filings, vendor renegotiations, grant & program applications. 
      You just need to show up for one call.
    </p>
  `;
  return sendEmail({ to, subject: `${repName} has been assigned to your Fruxal recovery`, html: emailTemplate(`Your recovery expert is ready`, body, ctaText, ctaUrl) });
}

/** Sent to rep when a new client is assigned */
export async function sendRepNewClient(
  to: string,
  repName: string,
  clientName: string,
  industry: string | null,
  province: string | null,
  totalLeak: number,
  dashUrl: string,
): Promise<boolean> {
  const body = `
    <p style="font-size:15px;color:#1a1a2e;margin:0 0 16px">Hi ${repName},</p>
    <p style="color:#3d3d4e;margin:0 0 16px">
      You've been assigned a new client: <strong>${clientName}</strong>
      ${industry ? ` (${industry}${province ? `, ${province}` : ''})` : ''}.
    </p>
    ${totalLeak > 0 ? `<p style="color:#3d3d4e;margin:0 0 16px">Estimated annual leak: <strong style="color:#B34040">$${totalLeak.toLocaleString()}/yr</strong></p>` : ''}
    <p style="color:#3d3d4e;margin:0 0 24px">Review their file and make first contact within 24 hours for best conversion.</p>
  `;
  return sendEmail({ to, subject: `New client assigned: ${clientName}`, html: emailTemplate(`New client assigned`, body, `View Client File →`, dashUrl) });
}

/** Sent to customer when rep confirms a saving */
export async function sendSavingConfirmed(
  to: string,
  businessName: string,
  leakName: string,
  confirmedAmount: number,
  totalConfirmedToDate: number,
  repName: string,
): Promise<boolean> {
  const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
  const body = `
    <p style="font-size:15px;color:#1a1a2e;margin:0 0 16px">Hi ${businessName},</p>
    <p style="color:#3d3d4e;margin:0 0 16px">
      <strong>${repName}</strong> has confirmed a recovery on your behalf:
    </p>
    <div style="background:#F0FBF5;border:1px solid #d1fae5;border-radius:12px;padding:20px;margin:0 0 20px">
      <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Confirmed recovery</p>
      <p style="margin:0 0 8px;font-size:28px;font-weight:900;color:#2D7A50">+$${confirmedAmount.toLocaleString()}</p>
      <p style="margin:0;font-size:13px;color:#4b5563">${leakName}</p>
    </div>
    ${totalConfirmedToDate > confirmedAmount ? `<p style="color:#3d3d4e;margin:0 0 16px">Total recovered to date: <strong>$${totalConfirmedToDate.toLocaleString()}</strong></p>` : ''}
    <p style="color:#3d3d4e;margin:0 0 24px">This has been added to your dashboard. Your rep continues working on the remaining items.</p>
  `;
  return sendEmail({ to, subject: `$${confirmedAmount.toLocaleString()} recovered — ${leakName}`, html: emailTemplate(`Saving confirmed`, body, `View Your Dashboard →`, `${appUrl}/v2/dashboard`) });
}
