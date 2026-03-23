// =============================================================================
// app/api/v2/solutions/route.ts
// GET  /api/v2/solutions/match?businessId=X&category=Y — single category match
// POST /api/v2/solutions/match                          — batch categories
// GET  /api/v2/solutions/browse?businessId=X           — all solutions for business
// POST /api/v2/solutions/add-task                      — create task from solution
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { findSolutionsForCategory, findSolutions, type SolutionMatch } from "@/lib/solutions/matcher";

export const maxDuration = 20;

async function getBusinessContext(userId: string) {
  const [bizRow, profileRow] = await Promise.all([
    supabaseAdmin.from("businesses").select("id, owner_user_id")
      .eq("owner_user_id", userId).maybeSingle().then(r => r.data),
    supabaseAdmin.from("business_profiles")
      .select("business_id, industry, province, employee_count")
      .eq("user_id", userId).maybeSingle().then(r => r.data),
  ]);
  return { biz: bizRow, profile: profileRow };
}

// ── GET — single category match ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const businessId = req.nextUrl.searchParams.get("businessId");
    const category   = req.nextUrl.searchParams.get("category");
    const action     = req.nextUrl.searchParams.get("action") ?? "match";

    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const { biz, profile } = await getBusinessContext(userId);
    if (!biz && !profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const industry = profile?.industry ?? "general";
    const province = profile?.province ?? "QC";
    const tier     = "solo"; // will be enriched when tier is stored
    const bizCtx   = { industrySlug: industry, province, tier };

    if (action === "browse") {
      // Return solutions for top 10 most common categories
      const TOP_CATS = [
        "payment_processing", "accounting", "payroll", "tax",
        "cash_flow", "insurance", "marketing", "operations", "inventory", "hr",
      ];
      const results = await Promise.all(
        TOP_CATS.map(async cat => ({
          category: cat,
          solutions: await findSolutionsForCategory(cat, bizCtx),
        }))
      );
      const filtered = results.filter(r => r.solutions.length > 0);
      return NextResponse.json({ categories: filtered, businessName: profile?.industry ?? "Your Business" });
    }

    if (!category) return NextResponse.json({ error: "category required" }, { status: 400 });

    const solutions = await findSolutionsForCategory(category, bizCtx);
    return NextResponse.json({ solutions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST — batch match or add-task ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const body = await req.json();
    const { businessId, categories, solutionId, solutionName, solutionUrl, savingsMonthly } = body;
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const { biz, profile } = await getBusinessContext(userId);
    if (!biz && !profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const industry = profile?.industry ?? "general";
    const province = profile?.province ?? "QC";
    const bizCtx   = { industrySlug: industry, province, tier: "solo" as const };

    // Batch category match
    if (categories && Array.isArray(categories)) {
      const limited = (categories as string[]).slice(0, 10); // max 10 per spec
      const results = await Promise.all(
        limited.map(async (cat: string) => ({
          category: cat,
          solutions: await findSolutionsForCategory(cat, bizCtx),
        }))
      );
      const byCategory: Record<string, SolutionMatch[]> = {};
      for (const r of results) byCategory[r.category] = r.solutions;
      return NextResponse.json({ solutions: byCategory });
    }

    // Add-task from solution
    if (solutionId && solutionName) {
      const { data: task, error } = await supabaseAdmin
        .from("diagnostic_tasks")
        .insert({
          business_id:    businessId,
          user_id:        userId,
          title:          `Implement ${solutionName}`,
          action:         `Sign up for ${solutionName} and configure it for your business`,
          why:            `This solution was recommended based on your business profile`,
          savings_monthly: savingsMonthly ?? 0,
          effort:         "medium",
          time_to_implement: "1-3 hours",
          solution_name:  solutionName,
          solution_url:   solutionUrl ?? null,
          category:       body.category ?? "general",
          priority:       5,
          status:         "open",
          source:         "user_added",
          created_at:     new Date().toISOString(),
          updated_at:     new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ task });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
