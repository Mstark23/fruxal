import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    // Get all leaks with their status changes
    const { data: leaks } = await sb.from("leaks").select("*").eq("businessId", businessId).order("createdAt", { ascending: true });
    const { data: snapshots } = await sb.from("scan_snapshots").select("*").eq("businessId", businessId).order("scannedAt", { ascending: true });

    if (!leaks) return NextResponse.json({ timeline: [], stats: {} });

    // Build timeline events
    const events: any[] = [];
    let runningSaved = 0;

    // Add scan events
    (snapshots || []).forEach(s => {
      events.push({
        type: "scan",
        date: s.scannedAt,
        title: "Scan completed",
        detail: `Found $${(s.totalAmount ?? 0).toLocaleString()} leaking · Health: ${s.healthScore}/100`,
        amount: s.totalAmount,
        icon: "scan",
      });
    });

    // Add fix events
    leaks.filter(l => l.status === "FIXED" || l.status === "fixed").forEach(l => {
      runningSaved += l.annualImpact ?? 0;
      events.push({
        type: "fix",
        date: l.updatedAt || l.createdAt,
        title: `Fixed: ${l.title}`,
        detail: `Saving $${(l.annualImpact ?? 0).toLocaleString()}/yr · Running total: $${runningSaved.toLocaleString()}/yr`,
        amount: l.annualImpact,
        runningTotal: runningSaved,
        icon: "done",
      });
    });

    // Add detection events
    leaks.filter(l => l.status !== "FIXED" && l.status !== "fixed").forEach(l => {
      events.push({
        type: "found",
        date: l.createdAt,
        title: `Detected: ${l.title}`,
        detail: `$${(l.annualImpact ?? 0).toLocaleString()}/yr · ${l.severity}`,
        amount: l.annualImpact,
        icon: "leak",
      });
    });

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalFound = leaks.reduce((s, l) => s + (l.annualImpact ?? 0), 0);
    const totalSaved = leaks.filter(l => l.status === "FIXED" || l.status === "fixed").reduce((s, l) => s + (l.annualImpact ?? 0), 0);

    return NextResponse.json({
      timeline: events,
      stats: {
        totalFound,
        totalSaved,
        fixRate: leaks.length > 0 ? Math.round((leaks.filter(l => l.status === "FIXED" || l.status === "fixed").length / leaks.length) * 100) : 0,
        daysActive: snapshots?.length ? Math.ceil((Date.now() - new Date(snapshots[0].scannedAt).getTime()) / 86400000) : 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
