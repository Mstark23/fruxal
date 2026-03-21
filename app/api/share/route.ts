import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const _ip_shareRl = new Map<string, {c: number; r: number}>();
function ip_shareCheck(ip: string): boolean {
  const now = Date.now();
  const e = _ip_shareRl.get(ip);
  if (!e || e.r < now) { _ip_shareRl.set(ip, {c: 1, r: now + 3600000}); return true; }
  e.c++; return e.c <= 20;
}



const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// POST — create share link
export async function POST(req: NextRequest) {
  const _ip_ip_share = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!ip_shareCheck(_ip_ip_share)) return NextResponse.json({error: "Too many requests"}, {status: 429});
  try {
    const { businessId } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const shareId = crypto.randomBytes(8).toString("hex");

    // Get business info
    const { data: biz } = await sb
      .from("businesses")
      .select("name, industry, industry_slug")
      .eq("id", businessId)
      .single();

    // Get latest prescan run
    const { data: prescanRun } = await sb
      .from("prescan_runs")
      .select("id, health_score, total_leak_estimate_year")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get leaks (from prescan or direct)
    let leaks: any[] = [];
    if (prescanRun) {
      const { data } = await sb
        .from("detected_leaks")
        .select("*")
        .eq("prescan_run_id", prescanRun.id)
        .order("priority_score", { ascending: false, nullsFirst: false });
      leaks = data || [];
    }

    const open = leaks.filter(l => l.status === "detected" || l.status === "shown_free");
    const totalLeaking = open.reduce((s, l) => s + (l.estimated_annual_leak || l.annual_leak_amount ?? 0), 0);

    await sb.from("shared_results").insert({
      id: shareId,
      business_id: businessId,
      business_name: biz?.name || "Business",
      industry: biz?.industry_slug || biz?.industry || "",
      health_score: prescanRun?.health_score ?? 0,
      total_leaking: totalLeaking,
      total_saved: 0,
      leak_count: open.length,
      top_leaks: JSON.stringify(open.slice(0, 5).map(l => ({
        code: l.leak_type_code || l.leak_type || "",
        amount: l.estimated_annual_leak || l.annual_leak_amount ?? 0,
        severity: l.severity_score ?? 0,
      }))),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    });

    const url = `${process.env.NEXTAUTH_URL || "https://fruxal.com"}/share/${shareId}`;
    return NextResponse.json({ shareId, url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — retrieve shared result
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data } = await sb.from("shared_results").select("*").eq("id", id).single();
  if (!data) return NextResponse.json({ error: "Not found or expired" }, { status: 404 });

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  return NextResponse.json({
    businessName: data.business_name,
    industry: data.industry,
    healthScore: data.health_score,
    totalLeaking: data.total_leaking,
    totalSaved: data.total_saved,
    leakCount: data.leak_count,
    topLeaks: JSON.parse(data.top_leaks || "[]"),
  });
}
