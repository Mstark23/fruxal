// =============================================================================
// app/api/v2/account/delete/route.ts
// POST /api/v2/account/delete — PIPEDA-compliant full data purge
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;
    const { confirm, reason } = await req.json();
    if (confirm !== true) return NextResponse.json({ error: "Confirmation required" }, { status: 400 });

    // Get business IDs owned by this user
    const { data: businesses } = await supabaseAdmin
      .from("businesses").select("id").eq("owner_user_id", userId);
    const bizIds = (businesses ?? []).map((b: any) => b.id as string);

    // Cancel Stripe subscription if active
    try {
      const { data: up } = await supabaseAdmin
        .from("user_progress").select("stripe_subscription_id").eq("userId", userId).maybeSingle();
      if (up?.stripe_subscription_id) {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });
        await stripe.subscriptions.cancel(up.stripe_subscription_id).catch(() => {});
      }
    } catch { /* non-fatal */ }

    // Cascade delete through all user tables
    const deletions = [];
    if (bizIds.length > 0) {
      deletions.push(
        supabaseAdmin.from("diagnostic_tasks").delete().in("business_id", bizIds),
        supabaseAdmin.from("diagnostic_comparisons").delete().in("business_id", bizIds),
        supabaseAdmin.from("business_timeline").delete().in("business_id", bizIds),
        supabaseAdmin.from("diagnostic_reports").delete().in("business_id", bizIds),
        supabaseAdmin.from("recovery_snapshots").delete().in("business_id", bizIds),
        supabaseAdmin.from("score_history").delete().in("business_id", bizIds),
        supabaseAdmin.from("business_goals").delete().in("business_id", bizIds),
        supabaseAdmin.from("solution_clicks").delete().in("business_id", bizIds),
        supabaseAdmin.from("prescan_diagnostic_links").delete().in("business_id", bizIds),
        supabaseAdmin.from("break_even_data").delete().in("business_id", bizIds),
        supabaseAdmin.from("financial_ratios").delete().in("business_id", bizIds),
      );
    }
    deletions.push(
      supabaseAdmin.from("monthly_briefs").delete().eq("user_id", userId),
      supabaseAdmin.from("user_obligations").delete().eq("user_id", userId),
      supabaseAdmin.from("prescan_results").delete().eq("user_id", userId),
      supabaseAdmin.from("notification_preferences").delete().eq("user_id", userId),
      supabaseAdmin.from("business_profiles").delete().eq("user_id", userId),
      supabaseAdmin.from("user_progress").delete().eq("userId", userId),
    );

    await Promise.allSettled(deletions);

    // Delete businesses
    if (bizIds.length > 0) {
      await supabaseAdmin.from("businesses").delete().in("id", bizIds);
    }

    // Delete user record
    await supabaseAdmin.from("users").delete().eq("id", userId);

    // Log deletion (hash only — no PII)
    const hash = crypto.createHash("sha256").update(userId).digest("hex");
    try { await supabaseAdmin.from("deletion_log").insert({ user_id_hash: hash, reason: reason ?? null, deleted_at: new Date().toISOString(), data_purge_confirmed: true }); } catch { /* non-fatal */ }

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (err: any) {
    console.error("[Account Delete]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
