// GET /api/admin/invoices
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { data: invoices } = await supabaseAdmin
    .from("fruxal_invoices")
    .select("*")
    .order("created_at", { ascending: false });

  const total_pending   = (invoices || []).filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + (i.fee_amount || 0), 0);
  const total_collected = (invoices || []).filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (i.fee_amount || 0), 0);

  return NextResponse.json({ success: true, invoices: invoices || [], total_pending, total_collected });
}
