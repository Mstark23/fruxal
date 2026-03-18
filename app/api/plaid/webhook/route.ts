// =============================================================================
// app/api/plaid/webhook/route.ts
// Handles Plaid webhook events — item errors, new transactions available.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { syncPlaidFinancials } from "@/services/v2/plaid-aggregator";

export async function POST(req: NextRequest) {
  try {
    const body        = await req.json();
    const webhookType = body.webhook_type;
    const webhookCode = body.webhook_code;
    const itemId      = body.item_id;

    if (!itemId) return NextResponse.json({ ok: true });

    const { data: conn } = await supabaseAdmin
      .from("plaid_connections")
      .select("business_id, status")
      .eq("item_id", itemId)
      .single();

    if (!conn) return NextResponse.json({ ok: true });

    if (webhookType === "TRANSACTIONS" && webhookCode === "SYNC_UPDATES_AVAILABLE") {
      // New transactions available — sync in background
      syncPlaidFinancials(conn.business_id).catch(err =>
        console.error("[Plaid Webhook] Sync error:", err.message)
      );
    }

    if (webhookType === "ITEM") {
      if (webhookCode === "ERROR") {
        await supabaseAdmin.from("plaid_connections").update({
          status:     "error",
          last_error: body.error?.error_message || "Item error",
        }).eq("item_id", itemId);

        // Mark business as needing reconnect
        await supabaseAdmin.from("business_profiles").update({
          plaid_connected: false,
        }).eq("business_id", conn.business_id);
      }

      if (webhookCode === "PENDING_EXPIRATION") {
        await supabaseAdmin.from("plaid_connections").update({
          status: "pending_expiration",
          last_error: "Bank connection expiring — user must reconnect",
        }).eq("item_id", itemId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Plaid Webhook] Error:", err.message);
    return NextResponse.json({ ok: true }); // always 200 to Plaid
  }
}
