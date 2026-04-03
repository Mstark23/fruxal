// =============================================================================
// POST /api/rep/customer/[id]/debrief
// Rep submits post-call debrief. Stores it, generates agreement token,
// sends personalized engagement email to client with one-click sign link.
// [id] = pipeline id (same as rep/customer pages use)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import { supabaseAdmin }             from "@/lib/supabase-admin";
import { sendEmail }                 from "@/services/email/service";
import crypto                        from "crypto";

export const maxDuration = 30;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const repId = (session.user as any).repId || (session.user as any).id;
  const { id: pipelineId } = params;

  try {
    const body = await req.json();
    const {
      agreed_findings,   // string[] — finding ids the client agreed to pursue
      call_outcome,      // "ready_to_sign" | "needs_time" | "not_interested"
      client_concerns,   // string — any objections or questions raised
      next_action,       // string — what rep will do next
      notes,             // string — internal notes
    } = body;

    if (!call_outcome) return NextResponse.json({ success: false, error: "call_outcome required" }, { status: 400 });

    // Fetch pipeline + report + profile
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("*, tier3_reps(name, email, calendly_url, contingency_rate)")
      .eq("id", pipelineId)
      .single();

    if (!pipe) return NextResponse.json({ success: false, error: "Pipeline entry not found" }, { status: 404 });

    // Fetch findings from diagnostic report
    let findings: any[] = [];
    if (pipe.report_id) {
      const { data: report } = await supabaseAdmin
        .from("diagnostic_reports")
        .select("result_json, total_annual_leaks")
        .eq("id", pipe.report_id)
        .single();
      findings = report?.result_json?.findings || [];
    }

    // Filter to agreed findings only
    const agreedList = agreed_findings?.length
      ? findings.filter((f: any) => agreed_findings.includes(f.id))
      : findings;
    const totalAgreed = agreedList.reduce((s: number, f: any) => s + (f.impact_max || f.impact_min || 0), 0);
    const contingencyRate = (pipe.tier3_reps as any)?.contingency_rate ?? 12;
    const repName  = (pipe.tier3_reps as any)?.name || "Your Fruxal Rep";
    const repEmail = (pipe.tier3_reps as any)?.email || "hello@fruxal.ca";
    const calendly = (pipe.tier3_reps as any)?.calendly_url || null;

    // Save debrief record
    const debriefId = crypto.randomUUID();
    await supabaseAdmin.from("call_debriefs").insert({
      id:               debriefId,
      pipeline_id:      pipelineId,
      rep_id:           repId,
      call_outcome,
      agreed_findings:  agreedList.map((f: any) => ({ id: f.id, title: f.title, amount: f.impact_max || 0 })),
      client_concerns:  client_concerns || null,
      next_action:      next_action || null,
      notes:            notes || null,
      total_agreed:     totalAgreed,
      created_at:       new Date().toISOString(),
    });

    // Update pipeline stage + store agreed findings
    const newStage = call_outcome === "ready_to_sign" ? "agreement_out" : "call_booked";
    await supabaseAdmin.from("tier3_pipeline").update({
      stage:           newStage,
      notes:           notes || pipe.notes,
      updated_at:      new Date().toISOString(),
      agreed_findings: agreedList.map((f: any) => f.id),
    }).eq("id", pipelineId);

    // If client is ready to sign — generate token and send engagement email
    if (call_outcome === "ready_to_sign" && pipe.contact_email) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      await supabaseAdmin.from("tier3_pipeline").update({
        agreement_token:        token,
        agreement_token_expiry: tokenExpiry,
      }).eq("id", pipelineId);

      const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
      const signUrl = `${appUrl}/agreement/${token}`;

      // Build findings summary HTML
      const findingsHtml = agreedList.slice(0, 5).map((f: any) =>
        `<tr>
          <td style="padding:8px 12px;font-size:13px;color:#3A3935;border-bottom:1px solid #F0EFEB">${f.title}</td>
          <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#B34040;text-align:right;border-bottom:1px solid #F0EFEB">$${(f.impact_max || f.impact_min || 0).toLocaleString()}/yr</td>
        </tr>`
      ).join("");

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:0 auto;padding:40px 20px">
  <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0F2419,#1B3A2D);padding:28px 32px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <div style="width:26px;height:26px;border-radius:6px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center">
          <span style="color:white;font-weight:900;font-size:12px">F</span>
        </div>
        <span style="color:rgba(255,255,255,0.8);font-size:13px;font-weight:600">Fruxal</span>
      </div>
      <h1 style="margin:0;font-size:20px;font-weight:800;color:white;line-height:1.3">
        Your recovery plan is ready.<br>One signature to start.
      </h1>
      <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.6)">
        We identified <strong style="color:#6ee7a0">$${(totalAgreed || 0).toLocaleString()}</strong> in recoverable savings across ${agreedList.length} area${agreedList.length !== 1 ? "s" : ""}.
      </p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px">
      <p style="margin:0 0 20px;font-size:14px;color:#3A3935;line-height:1.7">
        Hi ${pipe.contact_name || "there"},
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#3A3935;line-height:1.7">
        Based on our call, here's exactly what we'll recover for you — and what it's worth:
      </p>

      <!-- Findings table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0EFEB;border-radius:10px;overflow:hidden;margin-bottom:24px">
        <thead>
          <tr style="background:#FAFAF8">
            <th style="padding:8px 12px;font-size:11px;font-weight:700;color:#8E8C85;text-align:left;text-transform:uppercase;letter-spacing:0.05em">Finding</th>
            <th style="padding:8px 12px;font-size:11px;font-weight:700;color:#8E8C85;text-align:right;text-transform:uppercase;letter-spacing:0.05em">Annual Value</th>
          </tr>
        </thead>
        <tbody>${findingsHtml}</tbody>
        <tfoot>
          <tr style="background:#FAFAF8">
            <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#1A1A18">Total recoverable</td>
            <td style="padding:10px 12px;font-size:15px;font-weight:800;color:#2D7A50;text-align:right">$${(totalAgreed || 0).toLocaleString()}/yr</td>
          </tr>
        </tfoot>
      </table>

      <!-- How it works -->
      <div style="background:#F7F8FA;border-radius:10px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#8E8C85;text-transform:uppercase;letter-spacing:0.05em">How it works</p>
        ${["We handle everything — CRA calls, vendor negotiations, grant applications.", `You pay ${contingencyRate}% of what we actually recover. Nothing until money is in your account.`, "Sign below to authorize us to begin. Takes 30 seconds."].map((s, i) =>
          `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px">
            <span style="width:20px;height:20px;border-radius:50%;background:rgba(27,58,45,0.08);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#1B3A2D;flex-shrink:0;margin-top:1px">${i + 1}</span>
            <span style="font-size:13px;color:#56554F;line-height:1.5">${s}</span>
          </div>`
        ).join("")}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:20px">
        <a href="${signUrl}" style="display:inline-block;background:linear-gradient(135deg,#1B3A2D,#2D7A50);color:white;font-weight:800;font-size:15px;padding:16px 36px;border-radius:12px;text-decoration:none">
          Sign My Agreement →
        </a>
        <p style="margin:10px 0 0;font-size:11px;color:#B5B3AD">No credit card · No upfront cost · Link expires in 7 days</p>
      </div>

      <p style="margin:0;font-size:13px;color:#8E8C85;line-height:1.6">
        Questions? Reply to this email or ${calendly ? `<a href="${calendly}" style="color:#1B3A2D">book a quick call with ${repName}</a>` : `reach ${repName} at <a href="mailto:${repEmail}" style="color:#1B3A2D">${repEmail}</a>`}.
      </p>
    </div>
  </div>
  <p style="text-align:center;margin-top:16px;font-size:11px;color:#B5B3AD">
    Fruxal · <a href="${appUrl}" style="color:#B5B3AD;text-decoration:none">${appUrl.replace("https://","")}</a>
  </p>
</div></body></html>`;

      await sendEmail({
        to:      pipe.contact_email,
        subject: `Your Fruxal recovery plan — $${(totalAgreed || 0).toLocaleString()} identified, one signature to start`,
        html,
      });
    }

    // ─── Smart next-action suggestions (logic-based, no AI) ─────────────
    const contactFirstName = (pipe.contact_name || "there").split(" ")[0];
    const totalAgreedFmt = `$${(totalAgreed || 0).toLocaleString()}`;
    const now = new Date();

    function addBusinessDays(from: Date, days: number): string {
      const d = new Date(from);
      let added = 0;
      while (added < days) {
        d.setDate(d.getDate() + 1);
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) added++;
      }
      return d.toISOString().split("T")[0];
    }

    let nextActions: { action: string; priority: "high" | "medium" | "low"; automated: boolean }[] = [];
    let suggestedFollowUpDate = "";
    let suggestedMessage = "";

    if (call_outcome === "ready_to_sign") {
      suggestedFollowUpDate = addBusinessDays(now, 2);
      nextActions = [
        { action: "Send agreement email (auto-sent)", priority: "high", automated: true },
        { action: "Follow up in 2 days if not signed", priority: "high", automated: false },
        { action: "Prepare onboarding checklist for engagement kickoff", priority: "medium", automated: false },
      ];
      suggestedMessage = `Hi ${contactFirstName},\n\nGreat speaking with you today. I just sent over the engagement agreement for the ${totalAgreedFmt} in annual savings we identified.\n\nQuick recap of what we'll recover:\n${agreedList.slice(0, 5).map((f: any) => `- ${f.title}: $${(f.impact_max || f.impact_min || 0).toLocaleString()}/yr`).join("\n")}\n\nThe agreement takes about 30 seconds to sign. Once that's done, we get started right away — you don't lift a finger.\n\nLet me know if you have any questions!\n\nBest,\n${repName}`;
    } else if (call_outcome === "needs_time") {
      // 3-5 business days based on whether there are concerns
      const followUpDays = client_concerns ? 5 : 3;
      suggestedFollowUpDate = addBusinessDays(now, followUpDays);
      nextActions = [
        { action: "Send recap email within 24 hours", priority: "high", automated: false },
        { action: `Schedule follow-up call for ${new Date(suggestedFollowUpDate).toLocaleDateString("en-CA", { weekday: "long", month: "short", day: "numeric" })}`, priority: "high", automated: false },
        { action: "Prepare answers to client concerns for next call", priority: "medium", automated: false },
        ...(client_concerns ? [{ action: "Address specific objections in follow-up email", priority: "medium" as const, automated: false }] : []),
      ];
      suggestedMessage = `Hi ${contactFirstName},\n\nThanks for taking the time today to go over the findings for your business. I appreciate you being thorough about this.\n\nHere's a quick recap of what we discussed:\n\nTotal identified savings: ${totalAgreedFmt}/year\n${agreedList.slice(0, 5).map((f: any) => `- ${f.title}: $${(f.impact_max || f.impact_min || 0).toLocaleString()}/yr`).join("\n")}\n\nAs a reminder, we work on contingency — ${contingencyRate}% of what we actually recover. If we don't find real savings, you pay nothing.${client_concerns ? `\n\nRegarding your concern about ${client_concerns.split(".")[0].toLowerCase()} — I completely understand, and I'll have more details for you when we reconnect.` : ""}\n\nI'll follow up ${followUpDays === 3 ? "later this week" : "early next week"} to see where you're at. In the meantime, feel free to reach out with any questions.\n\nBest,\n${repName}`;
    } else if (call_outcome === "not_interested") {
      suggestedFollowUpDate = addBusinessDays(now, 30);
      nextActions = [
        { action: "Add to reactivation queue (30-day follow-up)", priority: "medium", automated: false },
        { action: "Send a polite closing email", priority: "low", automated: false },
        { action: "Log reason for decline for future reference", priority: "low", automated: false },
      ];
      suggestedMessage = `Hi ${contactFirstName},\n\nThank you for taking the time to speak with me today. I understand the timing may not be right, and I respect that.\n\nJust so you have it for reference, we identified ${totalAgreedFmt}/year in potential savings for your business. That opportunity doesn't expire — these are ongoing costs that can be recovered anytime.\n\nIf anything changes or you'd like to revisit, I'm always here. No pressure at all.\n\nWishing you and your business all the best,\n${repName}`;
    }

    return NextResponse.json({
      success:       true,
      debrief_id:    debriefId,
      new_stage:     newStage,
      email_sent:    call_outcome === "ready_to_sign" && !!pipe.contact_email,
      total_agreed:  totalAgreed,
      nextActions,
      suggestedFollowUpDate,
      suggestedMessage,
    });
  } catch (err: any) {
    console.error("[debrief POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
