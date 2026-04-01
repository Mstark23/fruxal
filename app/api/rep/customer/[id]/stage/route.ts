import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;
  try {
  const token = await getToken({ req });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stage } = await req.json();
  const VALID_STAGES = ["lead","contacted","called","diagnostic_sent","call_booked","agreement_out","signed","engaged","in_engagement","recovery_tracking","fee_collected","completed","lost"];
  if (!stage || !VALID_STAGES.includes(stage)) return NextResponse.json({ error: "Invalid stage" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("tier3_pipeline")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
