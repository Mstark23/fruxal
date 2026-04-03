// =============================================================================
// GET /api/v2/cron/email-drip — Automated Email Sequences
// =============================================================================
// Runs daily. Sends the right email based on where each user is in their journey.
// Day 1: Welcome → Day 3: Prescan nudge → Day 7: Findings reminder →
// Day 14: Rep intro → Day 30: Recovery update → Day 60: QBR tease
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 60;

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-vercel-cron") === "1" ||
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}` ||
    process.env.NODE_ENV === "development";
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = Date.now();
    const sent: string[] = [];

    // Get all users with their journey data
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, email, name, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    for (const user of users || []) {
      try {
        const daysSinceSignup = Math.floor((now - new Date(user.created_at).getTime()) / 86400000);
        const userId = user.id;

        // Check what emails were already sent
        const { data: sentEmails } = await supabaseAdmin
          .from("email_send_log")
          .select("template")
          .eq("user_id", userId)
          .in("template", ["drip_welcome", "drip_prescan_nudge", "drip_findings", "drip_rep_intro", "drip_recovery_update", "drip_qbr"]);

        const sentSet = new Set((sentEmails || []).map(e => e.template));

        // Get user's journey state
        const [profile, prescan, diagnostic, pipeline, progress] = await Promise.all([
          supabaseAdmin.from("business_profiles").select("business_name, country").eq("user_id", userId).maybeSingle().then(r => r.data),
          supabaseAdmin.from("prescan_runs").select("id").eq("user_id", userId).limit(1).maybeSingle().then(r => !!r?.data),
          supabaseAdmin.from("diagnostic_reports").select("id").eq("user_id", userId).eq("status", "completed").limit(1).maybeSingle().then(r => !!r?.data),
          supabaseAdmin.from("tier3_pipeline").select("id, stage").eq("user_id", userId).maybeSingle().then(r => r?.data),
          supabaseAdmin.from("user_progress").select("total_recovered").eq("user_id", userId).maybeSingle().then(r => r?.data),
        ]);

        const country = profile?.country || "CA";
        let templateToSend: string | null = null;
        let subject = "";
        let body = "";

        // Day 1: Welcome (if not sent)
        if (daysSinceSignup >= 1 && daysSinceSignup < 3 && !sentSet.has("drip_welcome")) {
          templateToSend = "drip_welcome";
          subject = `Welcome to Fruxal, ${user.name?.split(" ")[0] || "there"}`;
          body = `You've taken the first step. Your free business scan is ready — it takes 3 minutes and shows you exactly where your business might be losing money. No cost, no commitment.`;
        }

        // Day 3: Prescan nudge (if no prescan done)
        else if (daysSinceSignup >= 3 && daysSinceSignup < 7 && !prescan && !sentSet.has("drip_prescan_nudge")) {
          templateToSend = "drip_prescan_nudge";
          subject = "3 minutes could save you thousands";
          body = `Most ${country === "US" ? "US" : "Canadian"} businesses lose $8K-$15K/year without knowing it. Your free scan compares you against industry benchmarks and shows exactly where. Takes 3 minutes. Zero risk.`;
        }

        // Day 7: Findings reminder (if prescan done but no diagnostic)
        else if (daysSinceSignup >= 7 && daysSinceSignup < 14 && prescan && !diagnostic && !sentSet.has("drip_findings")) {
          templateToSend = "drip_findings";
          subject = "Your scan results are waiting";
          body = `You ran your business scan but haven't reviewed the full results yet. Your leaks are sitting there — and every week costs money. Run your full diagnostic to see the exact dollar amounts.`;
        }

        // Day 14: Rep intro (if has pipeline but early stage)
        else if (daysSinceSignup >= 14 && daysSinceSignup < 30 && pipeline && ["lead", "contacted"].includes(pipeline.stage) && !sentSet.has("drip_rep_intro")) {
          templateToSend = "drip_rep_intro";
          subject = "Your recovery expert is ready";
          body = `A Fruxal rep has been reviewing your file and is ready to walk you through your findings. One 15-minute call — that's all it takes. They handle everything after that. Book a time that works for you.`;
        }

        // Day 30: Recovery update (if in engagement)
        else if (daysSinceSignup >= 30 && daysSinceSignup < 60 && pipeline && ["in_engagement", "recovery_tracking"].includes(pipeline.stage) && !sentSet.has("drip_recovery_update")) {
          const recovered = progress?.total_recovered || 0;
          templateToSend = "drip_recovery_update";
          subject = recovered > 0 ? `$${recovered.toLocaleString()} recovered so far` : "Your recovery is in progress";
          body = recovered > 0
            ? `Your rep has confirmed $${recovered.toLocaleString()} in savings so far. Recovery work continues on the remaining items. Check your dashboard for the full breakdown.`
            : `Your rep is actively working on your recovery. Document collection and vendor negotiations are underway. Check your dashboard for updates.`;
        }

        if (templateToSend && user.email) {
          // Send via email service
          try {
            const { sendEmail, emailTemplate } = await import("@/services/email/service");
            const appUrl = country === "US" ? "https://fruxal.com" : "https://fruxal.ca";
            const html = emailTemplate(subject, body, "Open Dashboard →", `${appUrl}/v2/dashboard`, country);
            await sendEmail({ to: user.email, subject, html });

            // Log it
            await supabaseAdmin.from("email_send_log").insert({
              user_id: userId,
              template: templateToSend,
              subject,
              sent_at: new Date().toISOString(),
            });

            sent.push(`${user.email}: ${templateToSend}`);
          } catch (e: any) {
            console.warn(`[Drip] Email failed for ${user.email}:`, e.message);
          }
        }
      } catch { /* skip user, continue */ }
    }

    return NextResponse.json({ success: true, sent: sent.length, emails: sent });
  } catch (err: any) {
    console.error("[Drip]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
