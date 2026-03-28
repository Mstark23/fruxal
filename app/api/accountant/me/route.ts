// GET /api/accountant/me — accountant profile + stats
import { NextRequest, NextResponse } from "next/server";
import { requireAccountant } from "@/lib/accountant-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAccountant(req);
  if (!auth.authorized) return auth.error!;
  const a = auth.accountant!;

  const [queueCount, doneThisMonth, totalConfirmed] = await Promise.all([
    supabaseAdmin.from("execution_playbooks")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", a.id)
      .in("status", ["queued", "in_progress"])
      .then(r => r.count || 0),
    supabaseAdmin.from("execution_playbooks")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", a.id)
      .eq("status", "confirmed")
      .gte("confirmed_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .then(r => r.count || 0),
    supabaseAdmin.from("execution_playbooks")
      .select("confirmed_amount")
      .eq("assigned_to", a.id)
      .eq("status", "confirmed")
      .then(r => (r.data || []).reduce((s: number, p: any) => s + (p.confirmed_amount || 0), 0)),
  ]);

  return NextResponse.json({
    success: true,
    accountant: { ...a, stats: { queue: queueCount, done_this_month: doneThisMonth, total_confirmed: totalConfirmed } },
  });
}
