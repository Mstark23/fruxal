import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const token = await getToken({ req });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stage } = await req.json();
  if (!stage) return NextResponse.json({ error: "stage required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("tier3_pipeline")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
