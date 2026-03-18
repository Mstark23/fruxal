// =============================================================================
// DATABASE SERVICE LAYER — The Single Source of Truth
// =============================================================================
// LAW 5: One database pattern. No exceptions.
// Every query goes through here. No raw DB calls in routes or pages.
// Uses Supabase for everything (intelligence tables aren't in Prisma).
// =============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Singleton ───────────────────────────────────────────────────────────────
let _client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing SUPABASE env vars. Check .env.local");
    _client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: "public" },
    });
  }
  return _client;
}

// ─── Typed Result Wrapper ────────────────────────────────────────────────────
export interface DbResult<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

// ─── Query Helpers ───────────────────────────────────────────────────────────

/** Get single row by ID */
export async function findById<T = any>(table: string, id: string): Promise<DbResult<T>> {
  const { data, error } = await db().from(table).select("*").eq("id", id).single();
  return { data: data as T, error: error?.message || null };
}

/** Get rows with filters */
export async function findMany<T = any>(
  table: string,
  filters?: Record<string, any>,
  options?: { limit?: number; offset?: number; orderBy?: string; ascending?: boolean; select?: string }
): Promise<DbResult<T[]>> {
  let query = db().from(table).select(options?.select || "*", { count: "exact" });
  if (filters) {
    for (const [key, val] of Object.entries(filters)) {
      if (val === null) query = query.is(key, null);
      else if (Array.isArray(val)) query = query.in(key, val);
      else query = query.eq(key, val);
    }
  }
  if (options?.orderBy) query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  const { data, error, count } = await query;
  return { data: (data as T[]) || [], error: error?.message || null, count: count ?? undefined };
}

/** Insert one or many rows */
export async function insert<T = any>(table: string, rows: Record<string, any> | Record<string, any>[]): Promise<DbResult<T>> {
  const { data, error } = await db().from(table).insert(rows).select();
  return { data: (Array.isArray(rows) ? data : data?.[0]) as T, error: error?.message || null };
}

/** Update rows matching filters */
export async function update<T = any>(table: string, filters: Record<string, any>, updates: Record<string, any>): Promise<DbResult<T>> {
  let query = db().from(table).update(updates);
  for (const [key, val] of Object.entries(filters)) query = query.eq(key, val);
  const { data, error } = await query.select();
  return { data: data?.[0] as T, error: error?.message || null };
}

/** Upsert (insert or update on conflict) */
export async function upsert<T = any>(table: string, rows: Record<string, any> | Record<string, any>[], onConflict?: string): Promise<DbResult<T>> {
  const { data, error } = await db().from(table).upsert(rows, { onConflict }).select();
  return { data: data as T, error: error?.message || null };
}

/** Delete rows matching filters */
export async function remove(table: string, filters: Record<string, any>): Promise<DbResult<null>> {
  let query = db().from(table).delete();
  for (const [key, val] of Object.entries(filters)) query = query.eq(key, val);
  const { error } = await query;
  return { data: null, error: error?.message || null };
}

/** Raw SQL via rpc (for complex joins, aggregations) */
export async function rpc<T = any>(fnName: string, params?: Record<string, any>): Promise<DbResult<T>> {
  const { data, error } = await db().rpc(fnName, params);
  return { data: data as T, error: error?.message || null };
}

// ─── Business-Specific Helpers ───────────────────────────────────────────────

/** Get business for a user (with ownership verification) */
export async function getBusinessForUser(userId: string): Promise<DbResult<any>> {
  const { data, error } = await db()
    .from("business_members")
    .select("*, business:businesses(*)")
    .eq("userId", userId)
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data?.business || null, error: null };
}

/** Verify user owns a business (LAW 2: ownership check on every request) */
export async function verifyBusinessOwnership(userId: string, businessId: string): Promise<boolean> {
  const { data } = await db()
    .from("business_members")
    .select("id")
    .eq("userId", userId)
    .eq("businessId", businessId)
    .single();
  return !!data;
}

/** Get leaks for a business with affiliate partner data */
export async function getLeaksWithPartners(businessId: string, filters?: { status?: string; severity?: string; limit?: number }) {
  let query = db()
    .from("leaks")
    .select("*")
    .eq("businessId", businessId);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.severity) query = query.eq("severity", filters.severity);
  query = query.order("annualImpact", { ascending: false });
  if (filters?.limit) query = query.limit(filters.limit);
  const { data, error } = await query;
  return { data: data || [], error: error?.message || null };
}

/** Get affiliate partners for a leak type */
export async function getPartnersForLeakType(leakType: string) {
  const { data, error } = await db()
    .from("affiliate_partner_leak_mappings")
    .select("*, partner:affiliate_partners(*)")
    .eq("leak_type", leakType)
    .eq("active", true);
  return { data: data || [], error: error?.message || null };
}

/** Track affiliate click (LAW 7: every click is revenue) */
export async function trackAffiliateClick(params: {
  userId: string;
  businessId?: string;
  partnerId: string;
  leakId?: string;
  category?: string;
  currentCostMonthly?: number;
  projectedSavingsMonthly?: number;
  projectedSavingsAnnual?: number;
}) {
  // 1. Create referral record
  const referral = await insert("affiliate_referrals", {
    user_id: params.userId,
    business_id: params.businessId || null,
    partner_id: params.partnerId,
    leak_id: params.leakId || null,
    category: params.category || null,
    current_cost_monthly: params.currentCostMonthly || null,
    projected_savings_monthly: params.projectedSavingsMonthly || null,
    projected_savings_annual: params.projectedSavingsAnnual || null,
    status: "CLICKED",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 2. Increment partner click count
  try {
    await db().rpc("increment_partner_clicks", { p_id: params.partnerId });
  } catch {
    // RPC may not exist yet — silently ignore
  }

  return referral;
}
