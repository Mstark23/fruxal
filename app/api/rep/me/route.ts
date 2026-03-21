import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data: rep } = await supabaseAdmin
      .from("tier3_reps")
      .select("id, name, email, phone, province, commission_rate, status")
      .eq("status", "active")
      .limit(1)
      .single();

    if (!rep) return NextResponse.json({ success: true, rep: { name: "Rep", province: "", commission_rate: 20, stats: { clients:0, commissions_paid:0, commissions_pending:0 } } });

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
