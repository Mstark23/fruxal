// =============================================================================
// POST /api/v2/prescan/email-capture
// Captures email from anonymous prescan user and sends a copy of their results.
// No account created — just emails a summary + link back.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, emailTemplate } from "@/services/email/service";

const _rl = new Map<string, { c: number; r: number }>();
function rlCheck(ip: string) {
  const now = Date.now();
  const e = _rl.get(ip);
  if (!e || e.r < now) { _rl.set(ip, { c: 1, r: now + 3_600_000 }); return true; }
  e.c++; return e.c <= 5;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rlCheck(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const { email, prescanResultId } = await req.json();
    if (!email || !prescanResultId) return NextResponse.json({ error: "email and prescanResultId required" }, { status: 400 });

    const norm = email.toLowerCase().trim();

    // Load prescan summary
    const { data: result } = await supabaseAdmin
      .from("prescan_results")
      .select("summary, industry, province, teaser_leaks")
      .eq("id", prescanResultId)
      .maybeSingle();

    if (!result) return NextResponse.json({ error: "Result not found" }, { status: 404 });

    const s: any = result.summary || {};
    const totalLeak = s.leak_range_max ?? s.total_leak ?? 0;
    const leakCount = s.total_leaks ?? 0;
    const dailyCost = Math.round(totalLeak / 365);
    const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
    const registerUrl = `${appUrl}/register?from=prescan&prescanRunId=${prescanResultId}`;

    const teaserRows = ((result.teaser_leaks as any[]) || []).slice(0, 3).map((l: any) =>
      `<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid rgba(27,58,45,0.08);font-size:13px;">
        <span style="color:#2C2C2A">${l.title || l.category || "Financial leak"}</span>
        <span style="font-weight:600;color:#B34040">~$${Math.round((l.impact_min || l.amount || 0) / 12).toLocaleString()}/mo</span>
      </div>`
    ).join("");

    const body = `
      <p style="color:#3d3d4e;margin:0 0 16px">Here's what we found in your free scan:</p>
      <div style="background:#F5F9F6;border-radius:10px;padding:16px 20px;margin:0 0 16px">
        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Estimated annual leak</p>
        <p style="margin:0;font-size:28px;font-weight:900;color:#B34040">$${totalLeak.toLocaleString()}/yr</p>
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280">~$${dailyCost}/day left unaddressed</p>
      </div>
      ${teaserRows ? `<div style="margin:0 0 16px">${teaserRows}</div>` : ""}
      <p style="color:#3d3d4e;margin:0 0 16px">
        ${leakCount} findings were identified. Create your free account to see all of them with the exact dollar amounts.
      </p>
      <p style="color:#3d3d4e;margin:0 0 24px;font-size:12px;color:#6b7280;">
        We recover this on contingency — you pay nothing until money is back in your account. Our fee is 12% of what we recover.
      </p>
    `;

    await sendEmail({
      to: norm,
      subject: `Your scan found $${totalLeak.toLocaleString()}/yr in leaks — here's your report`,
      html: emailTemplate("Your scan results", body, "See My Full Results →", registerUrl),
    });

    // Store for follow-up sequence
    await supabaseAdmin.from("prescan_email_captures").insert({
      email: norm,
      prescan_result_id: prescanResultId,
      total_leak: totalLeak,
      industry: result.industry,
      province: result.province,
      captured_at: new Date().toISOString(),
    }).then(() => {}, () => {}); // table may not exist — non-fatal

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
