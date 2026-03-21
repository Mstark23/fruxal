import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ── Ownership helper ──────────────────────────────────────────────────────────
// Returns the userId's verified businessId, or null if they don't own it.
async function verifyOwnership(userId: string, businessId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("business_profiles")
    .select("business_id")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .single()
    .catch(() => ({ data: null }));
  return !!data;
}

/**
 * GET /api/v3/transactions?businessId=xxx&page=1&limit=50&category=rent&from=2025-01-01&to=2025-12-31
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const businessId = sp.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  // IDOR fix: verify caller owns this businessId
  if (!(await verifyOwnership(userId, businessId))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const sb = getSupabase();
  const page = parseInt(sp.get("page") || "1");
  const limit = Math.min(parseInt(sp.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;
  const category = sp.get("category");
  const from = sp.get("from");
  const to = sp.get("to");
  const uncategorized = sp.get("uncategorized") === "true";

  let query = sb
    .from("raw_transactions")
    .select("id, transaction_date, description, amount, category_code, auto_categorized, user_confirmed, is_duplicate, created_at", { count: "exact" })
    .eq("business_id", businessId)
    .eq("is_duplicate", false)
    .order("transaction_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category_code", category);
  if (uncategorized) query = query.or("category_code.is.null,category_code.eq.other_expense");
  if (from) query = query.gte("transaction_date", from);
  if (to) query = query.lte("transaction_date", to);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also get summary
  const { data: summary } = await sb
    .from("raw_transactions")
    .select("category_code, amount")
    .eq("business_id", businessId)
    .eq("is_duplicate", false);

  const totalIncome = (summary || []).filter(r => r.amount > 0).reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = (summary || []).filter(r => r.amount < 0).reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
  const categorizedCount = (summary || []).filter(r => r.category_code && r.category_code !== "other_expense").length;

  return NextResponse.json({
    transactions: data || [],
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    summary: {
      total_transactions: summary?.length || 0,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      categorized: categorizedCount,
      uncategorized: (summary?.length || 0) - categorizedCount,
      categorization_pct: summary?.length ? Math.round((categorizedCount / summary.length) * 100) : 0,
    },
  });
}

/**
 * PATCH /api/v3/transactions — update category for one or many transactions
 * Body: { ids: string[], category_code: string, businessId: string }
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { ids, category_code, businessId } = body;
  if (!ids?.length || !category_code || !businessId) {
    return NextResponse.json({ error: "ids, category_code, and businessId required" }, { status: 400 });
  }

  // IDOR fix: verify caller owns the businessId before updating any transactions
  if (!(await verifyOwnership(userId, businessId))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const sb = getSupabase();
  // Scope update to businessId so a valid user can't update another business's transactions
  // even if they somehow obtained valid transaction UUIDs
  const { error } = await sb
    .from("raw_transactions")
    .update({ category_code, user_confirmed: true })
    .in("id", ids)
    .eq("business_id", businessId); // ownership scope

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, updated: ids.length });
}
