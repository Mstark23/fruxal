// =============================================================================
// GET/POST /api/admin/tier3/reps — Rep management
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export const maxDuration = 30; // Vercel function timeout (seconds)

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch { return fb; }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const [reps, assignments, commissions] = await Promise.all([
      safe(async () => { const { data } = await supabaseAdmin.from("tier3_reps").select("*").order("created_at", { ascending: false }); return data || []; }, [] as any[]),
      safe(async () => { const { data } = await supabaseAdmin.from("tier3_rep_assignments").select("rep_id, diagnostic_id, assigned_at, stage_at_assignment, notes"); return data || []; }, [] as any[]),
      safe(async () => { const { data } = await supabaseAdmin.from("tier3_rep_commissions").select("rep_id, engagement_id, commission_amount, status, paid_at, confirmed_savings, fee_collected"); return data || []; }, [] as any[]),
    ]);

    // Build per-rep stats
    const assignmentsByRep: Record<string, any[]> = {};
    for (const a of assignments) {
      if (!assignmentsByRep[a.rep_id]) assignmentsByRep[a.rep_id] = [];
      assignmentsByRep[a.rep_id].push(a);
    }

    const commissionsByRep: Record<string, any[]> = {};
    for (const c of commissions) {
      if (!commissionsByRep[c.rep_id]) commissionsByRep[c.rep_id] = [];
      commissionsByRep[c.rep_id].push(c);
    }

    const enriched = reps.map((r: any) => {
      const repAssignments = assignmentsByRep[r.id] || [];
      const repCommissions = commissionsByRep[r.id] || [];
      const totalEarned = repCommissions.filter((c: any) => c.status === "paid").reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0);
      const totalPending = repCommissions.filter((c: any) => c.status === "pending").reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0);

      return {
        id: r.id, name: r.name, email: r.email, phone: r.phone,
        province: r.province, status: r.status, commissionRate: r.commission_rate,
        notes: r.notes, createdAt: r.created_at,
        activeDeals: repAssignments.length,
        totalEarned, totalPending,
        commissionsCount: repCommissions.length,
      };
    });

    const totalReps = reps.filter((r: any) => r.status === "active").length;
    const totalPaid = commissions.filter((c: any) => c.status === "paid").reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0);
    const totalPending = commissions.filter((c: any) => c.status === "pending").reduce((s: number, c: any) => s + (c.commission_amount ?? 0), 0);

    return NextResponse.json({
      success: true, reps: enriched,
      stats: { activeReps: totalReps, totalPaid, totalPending, totalAssignments: assignments.length },
    });
  } catch (err: any) {
    console.error("[Reps:GET]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { name, email, phone, province, commissionRate, notes } = await req.json();
    if (!name || !email) return NextResponse.json({ success: false, error: "name and email required" }, { status: 400 });

    const id = crypto.randomUUID();
    const { error } = await supabaseAdmin.from("tier3_reps").insert({
      id, name: name.trim(), email: email.trim().toLowerCase(),
      phone: phone || null, province: province || null,
      commission_rate: commissionRate || 20, notes: notes || null,
      status: "active",
    });
    if (error) {
      if (error.message.includes("duplicate")) return NextResponse.json({ success: false, error: "A rep with this email already exists" }, { status: 409 });
      throw error;
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("[Reps:POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
