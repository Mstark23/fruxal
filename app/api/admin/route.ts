import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  // Simple admin auth: check for admin secret header
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      { data: users, count: userCount },
      { data: businesses, count: bizCount },
      { data: leaks },
      { data: clicks },
      { data: notifications },
    ] = await Promise.all([
      supabase.from("users").select("id, email, name, createdAt", { count: "exact" }).order("createdAt", { ascending: false }).limit(50),
      supabase.from("businesses").select("id, name, industry, plan, createdAt", { count: "exact" }).order("createdAt", { ascending: false }).limit(50),
      supabase.from("leaks").select("id, status, annualImpact, severity, category"),
      supabase.from("affiliate_clicks").select("id, partnerId, leakCategory, createdAt, converted").order("createdAt", { ascending: false }).limit(100),
      supabase.from("notifications").select("id, type, createdAt, readAt").order("createdAt", { ascending: false }).limit(100),
    ]);

    const allLeaks = leaks || [];
    const openLeaks = allLeaks.filter(l => l.status !== "FIXED" && l.status !== "fixed");
    const fixedLeaks = allLeaks.filter(l => l.status === "FIXED" || l.status === "fixed");
    const totalLeaking = openLeaks.reduce((s, l) => s + (l.annualImpact ?? 0), 0);
    const totalSaved = fixedLeaks.reduce((s, l) => s + (l.annualImpact ?? 0), 0);

    const allBiz = businesses || [];
    const freeBiz = allBiz.filter(b => !b.plan || b.plan === "free").length;
    const proBiz = allBiz.filter(b => b.plan === "pro").length;
    const teamBiz = allBiz.filter(b => b.plan === "team").length;
    const mrr = (proBiz * 49) + (teamBiz * 99);

    // Industry breakdown
    const industryMap: Record<string, number> = {};
    allBiz.forEach(b => { industryMap[b.industry || "unknown"] = (industryMap[b.industry || "unknown"] || 0) + 1; });

    // Click stats
    const allClicks = clicks || [];
    const conversions = allClicks.filter(c => c.converted).length;

    return NextResponse.json({
      overview: {
        totalUsers: userCount ?? 0,
        totalBusinesses: bizCount ?? 0,
        totalLeaks: allLeaks.length,
        openLeaks: openLeaks.length,
        fixedLeaks: fixedLeaks.length,
        totalLeaking,
        totalSaved,
        mrr,
        conversionRate: allBiz.length > 0 ? Math.round(((proBiz + teamBiz) / allBiz.length) * 100) : 0,
      },
      plans: { free: freeBiz, pro: proBiz, team: teamBiz },
      industries: industryMap,
      affiliateClicks: { total: allClicks.length, conversions, conversionRate: allClicks.length > 0 ? Math.round((conversions / allClicks.length) * 100) : 0 },
      recentUsers: (users || []).slice(0, 20),
      recentBusinesses: (businesses || []).slice(0, 20),
      notificationStats: {
        total: (notifications || []).length,
        read: (notifications || []).filter(n => n.readAt).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
