// =============================================================================
// GET /api/admin/users — Paginated user list with filters and enrichment
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
  const plan = searchParams.get("plan") || "all";
  const search = searchParams.get("search") || "";
  const province = searchParams.get("province") || "";
  const industry = searchParams.get("industry") || "";
  const sort = searchParams.get("sort") || "newest";
  const offset = (page - 1) * limit;

  try {
    // ═══ 1. Fetch base users ═══
    let query = supabaseAdmin
      .from("users")
      .select("id, email, name, image, role, created_at", { count: "exact" });

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Sort
    if (sort === "oldest") query = query.order("created_at", { ascending: true });
    else if (sort === "last_active") query = query.order("created_at", { ascending: false, nullsFirst: false });
    else query = query.order("created_at", { ascending: false }); // newest default

    query = query.range(offset, offset + limit - 1);

    const { data: rawUsers, count: totalCount, error: usersErr } = await query;
    if (usersErr) throw new Error("Users query failed: " + usersErr.message);

    const users = rawUsers || [];
    const userIds = users.map((u: any) => u.id);

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        pagination: { page, limit, total: totalCount || 0, totalPages: Math.ceil((totalCount || 0) / limit) },
        stats: await getStats(),
      });
    }

    // ═══ 2. Enrich from parallel queries ═══
    const [profiles, progress, prescanCounts, diagnosticCounts] = await Promise.all([
      // Business profiles
      safe(async () => {
        const { data } = await supabaseAdmin
          .from("business_profiles")
          .select("user_id, province, industry, industry_label, business_structure, annual_revenue, employee_count, business_id")
          .in("user_id", userIds);
        const map: Record<string, any> = {};
        for (const p of data || []) map[p.user_id] = p;
        return map;
      }, {} as Record<string, any>),

      // User progress (plan, stripe, health)
      safe(async () => {
        const { data } = await supabaseAdmin
          .from("user_progress")
          .select("userId, paid_plan, stripe_customer_id, total_recovered, leaks_fixed, health_score")
          .in("userId", userIds);
        const map: Record<string, any> = {};
        for (const p of data || []) map[p.userId] = p;
        return map;
      }, {} as Record<string, any>),

      // Prescan counts
      safe(async () => {
        const { data } = await supabaseAdmin
          .from("prescan_runs")
          .select("user_id")
          .in("user_id", userIds);
        const map: Record<string, number> = {};
        for (const r of data || []) map[r.user_id] = (map[r.user_id] || 0) + 1;
        return map;
      }, {} as Record<string, number>),

      // Diagnostic counts (from prescan_results as proxy)
      safe(async () => {
        const { data } = await supabaseAdmin
          .from("prescan_results")
          .select("user_id")
          .in("user_id", userIds);
        const map: Record<string, number> = {};
        for (const r of data || []) map[r.user_id] = (map[r.user_id] || 0) + 1;
        return map;
      }, {} as Record<string, number>),
    ]);

    // ═══ 3. Build enriched user list ═══
    let enriched = users.map((u: any) => {
      const prof = profiles[u.id] || {};
      const prog = progress[u.id] || {};
      const isPaid = prog.paid_plan && prog.paid_plan !== "free" && prog.paid_plan !== "";

      return {
        id: u.id,
        email: u.email || "",
        name: u.name || "",
        image: u.image || null,
        plan: isPaid ? "paid" : "free",
        planName: prog.paid_plan || "free",
        province: prof.province || null,
        industry: prof.industry_label || prof.industry || null,
        businessName: prof.business_structure || null,
        annualRevenue: prof.annual_revenue || null,
        employeeCount: prof.employee_count || null,
        createdAt: u.created_at,
        lastActiveAt: u.created_at,
        prescanCount: prescanCounts[u.id] || 0,
        diagnosticCount: diagnosticCounts[u.id] || 0,
        healthScore: prog.health_score ?? null,
        totalRecovered: prog.total_recovered || 0,
        stripeCustomerId: prog.stripe_customer_id || null,
      };
    });

    // ═══ 4. Post-filter (plan, province, industry) ═══
    if (plan === "paid") enriched = enriched.filter((u: any) => u.plan === "paid");
    if (plan === "free") enriched = enriched.filter((u: any) => u.plan === "free");
    if (province) enriched = enriched.filter((u: any) => u.province === province);
    if (industry) enriched = enriched.filter((u: any) => u.industry?.toLowerCase().includes(industry.toLowerCase()));

    // Sort by health_score if requested (post-enrichment)
    if (sort === "health_score") {
      enriched.sort((a: any, b: any) => (b.healthScore || 0) - (a.healthScore || 0));
    }

    const response = NextResponse.json({
      success: true,
      users: enriched,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
      stats: await getStats(),
    });
    response.headers.set("Cache-Control", "s-maxage=30, stale-while-revalidate=15");
    return response;

  } catch (error: any) {
    console.error("[Admin:Users]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function getStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekDay = now.getDay();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekDay + (weekDay === 0 ? -6 : 1)).toISOString();

  const [total, paid, newWeek, newMonth] = await Promise.all([
    safe(async () => {
      const { count } = await supabaseAdmin.from("users").select("id", { count: "exact", head: true });
      return count || 0;
    }, 0),
    safe(async () => {
      const { count } = await supabaseAdmin.from("user_progress").select("userId", { count: "exact", head: true })
        .neq("paid_plan", null).neq("paid_plan", "free").neq("paid_plan", "");
      return count || 0;
    }, 0),
    safe(async () => {
      const { count } = await supabaseAdmin.from("users").select("id", { count: "exact", head: true }).gte("created_at", weekStart);
      return count || 0;
    }, 0),
    safe(async () => {
      const { count } = await supabaseAdmin.from("users").select("id", { count: "exact", head: true }).gte("created_at", monthStart);
      return count || 0;
    }, 0),
  ]);

  return { totalUsers: total, paidUsers: paid, freeUsers: Math.max(0, total - paid), newThisWeek: newWeek, newThisMonth: newMonth };
}
