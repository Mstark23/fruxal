import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const rep = auth.rep!;

    const [assignments, commissions] = await Promise.all([
      supabaseAdmin.from("tier3_rep_assignments").select("diagnostic_id").eq("rep_id", rep.id).then(r => r.data || []),
      supabaseAdmin.from("tier3_rep_commissions").select("commission_amount, status").eq("rep_id", rep.id).then(r => r.data || []),
    ]);

    return NextResponse.json({
      success: true,
      rep: {
        ...rep,
        stats: {
          clients:             assignments.length,
          commissions_paid:    commissions.filter((c:any)=>c.status==="paid").reduce((s:number,c:any)=>s+(c.commission_amount??0),0),
          commissions_pending: commissions.filter((c:any)=>c.status==="pending").reduce((s:number,c:any)=>s+(c.commission_amount??0),0),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const body = await req.json();
    const updates: Record<string, any> = {};

    if (typeof body.calendly_url === "string") {
      const url = body.calendly_url.trim();
      if (url && !url.startsWith("https://")) {
        return NextResponse.json({ success: false, error: "Calendly URL must start with https://" }, { status: 400 });
      }
      updates.calendly_url = url || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("tier3_reps")
      .update(updates)
      .eq("id", auth.rep!.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
