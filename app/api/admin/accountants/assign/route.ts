// POST /api/admin/accountants/assign — assign execution playbooks to accountant
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { playbook_ids, accountant_id } = await req.json();
  if (!playbook_ids?.length || !accountant_id) {
    return NextResponse.json({ success: false, error: "playbook_ids[] + accountant_id required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("execution_playbooks")
    .update({ assigned_to: accountant_id, updated_at: new Date().toISOString() })
    .in("id", playbook_ids);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, assigned: playbook_ids.length });
}
