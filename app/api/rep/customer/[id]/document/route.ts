import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("tier3_engagement_documents")
    .select("*")
    .eq("engagement_id", params.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: data || [] });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { error } = await supabaseAdmin
    .from("tier3_engagement_documents")
    .upsert({ engagement_id: params.id, ...body, updated_at: new Date().toISOString() }, { onConflict: "engagement_id,document_type" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
