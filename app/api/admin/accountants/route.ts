// GET/POST /api/admin/accountants
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { data: accountants } = await supabaseAdmin
    .from("accountants")
    .select("id, name, email, province, specialties, status, created_at")
    .order("created_at", { ascending: false });

  // Get queue stats per accountant
  const { data: queues } = await supabaseAdmin
    .from("execution_playbooks")
    .select("assigned_to, status, amount_recoverable, confirmed_amount, quick_win");

  const statsMap: Record<string, any> = {};
  for (const q of queues || []) {
    if (!q.assigned_to) continue;
    if (!statsMap[q.assigned_to]) statsMap[q.assigned_to] = { queued: 0, in_progress: 0, submitted: 0, confirmed: 0, total_value: 0, confirmed_value: 0, quick_wins: 0 };
    const s = statsMap[q.assigned_to];
    s[q.status] = (s[q.status] || 0) + 1;
    s.total_value += q.amount_recoverable || 0;
    if (q.status === "confirmed") s.confirmed_value += q.confirmed_amount || q.amount_recoverable || 0;
    if (q.quick_win && q.status === "queued") s.quick_wins++;
  }

  return NextResponse.json({
    success: true,
    accountants: (accountants || []).map((a: any) => ({
      ...a,
      stats: statsMap[a.id] || { queued: 0, in_progress: 0, submitted: 0, confirmed: 0, total_value: 0, confirmed_value: 0, quick_wins: 0 },
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { name, email, province, specialties } = await req.json();
  if (!name || !email) return NextResponse.json({ success: false, error: "name + email required" }, { status: 400 });

  const id = crypto.randomUUID();
  const { error } = await supabaseAdmin.from("accountants").insert({
    id, name: name.trim(), email: email.trim().toLowerCase(),
    province: province || null,
    specialties: specialties || [],
    status: "active",
    created_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, id });
}
