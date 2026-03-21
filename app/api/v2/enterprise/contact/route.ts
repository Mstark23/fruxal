import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const _entCtRl = new Map<string, { c: number; r: number }>();
function entCtRateCheck(ip: string): boolean {
  const now = Date.now();
  const e = _entCtRl.get(ip);
  if (!e || e.r < now) { _entCtRl.set(ip, { c: 1, r: now + 3_600_000 }); return true; }
  e.c++;
  return e.c <= 3;
}



export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!entCtRateCheck(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const { company, name, email, phone, revenue, industry, province, message, lang } = body;
    if (!company || !name || !email || !revenue) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin.from("tier3_pipeline").insert({
      company_name: company, contact_name: name, contact_email: email,
      contact_phone: phone || null, annual_revenue: revenue,
      industry: industry || null, province: province || null,
      notes: message || null, stage: "lead", source: "enterprise_page",
      lang: lang || "en",
    }).select().single();
    if (error) throw new Error(error.message);
    try {
      const RESEND_KEY = process.env.RESEND_API_KEY;
      const SALES_EMAIL = process.env.SALES_EMAIL || "sales@fruxal.com";
      if (RESEND_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
          body: JSON.stringify({
            from: "Fruxal <noreply@fruxal.com>",
            to: [SALES_EMAIL],
            subject: `🔥 New Enterprise Lead: ${company} (${revenue})`,
            html: `<div style="font-family:system-ui;max-width:520px;padding:24px;"><h2 style="color:#1B3A2D">New Enterprise Lead</h2><table style="width:100%;border-collapse:collapse;margin-top:16px;">${[["Company",company],["Contact",name],["Email",`<a href="mailto:${email}">${email}</a>`],["Phone",phone||"—"],["Revenue",`<strong>${revenue}</strong>`],["Industry",industry||"—"],["Province",province||"—"],["Notes",message||"—"]].map(([k,v])=>`<tr><td style="padding:8px 0;color:#8E8C85;font-size:13px;width:120px;">${k}</td><td style="font-size:13px;">${v}</td></tr>`).join("")}</table>${data?.id?`<div style="margin-top:20px;"><a href="${process.env.NEXTAUTH_URL||"https://fruxal.com"}/admin/tier3/pipeline" style="padding:10px 20px;background:#1B3A2D;color:white;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;">View in Pipeline →</a></div>`:""}</div>`,
          }),
        });
      }
    } catch { /* non-blocking */ }
    return NextResponse.json({ success: true, pipelineId: data?.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
