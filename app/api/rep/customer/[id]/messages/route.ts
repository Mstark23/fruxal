// =============================================================================
// GET/POST /api/rep/customer/[id]/messages
// Rep ↔ internal thread stored in tier3_pipeline.notes_json
// id = pipeline_id
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("messages_json, company_name")
      .eq("id", params.id)
      .single();

    const messages = (pipe as any)?.messages_json || [];
    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { text, authorName } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });

    // Get existing messages
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("messages_json")
      .eq("id", params.id)
      .single();

    const existing: any[] = (pipe as any)?.messages_json || [];
    const newMsg = {
      id:         crypto.randomUUID(),
      author:     authorName || "Rep",
      role:       "rep",
      text:       text.trim(),
      created_at: new Date().toISOString(),
    };
    const updated = [...existing, newMsg];

    await supabaseAdmin
      .from("tier3_pipeline")
      .update({ messages_json: updated, updated_at: new Date().toISOString() })
      .eq("id", params.id);

    return NextResponse.json({ success: true, message: newMsg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
