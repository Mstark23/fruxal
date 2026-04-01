import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const token = await getToken({ req });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("tier3_notes")
    .select("*")
    .eq("engagement_id", params.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data || [] });  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;
  try {
  const token = await getToken({ req });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { followUpDate, note, ...rest } = body;

  // Save the note text
  if (note) {
    const { error } = await supabaseAdmin
      .from("tier3_notes")
      .insert({ engagement_id: params.id, author_id: token.id as string, note, ...rest, created_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also update follow-up date + notes on the pipeline (params.id is pipeline_id)
  const pipelineUpdate: Record<string, any> = { updated_at: new Date().toISOString() };
  if (followUpDate !== undefined) pipelineUpdate.follow_up_date = followUpDate || null;
  if (note) pipelineUpdate.notes = note;
  await supabaseAdmin.from("tier3_pipeline").update(pipelineUpdate).eq("id", params.id);

  return NextResponse.json({ success: true });  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
