import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  const { data } = await sb.from("webhook_endpoints").select("id, url, events, active, createdAt").eq("businessId", businessId);
  return NextResponse.json({ endpoints: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, url, events = ["*"] } = await req.json();
    if (!businessId || !url) return NextResponse.json({ error: "businessId and url required" }, { status: 400 });

    const secret = crypto.randomBytes(24).toString("hex");
    const { data } = await sb.from("webhook_endpoints").insert({
      id: `whe_${Date.now()}`,
      businessId,
      url,
      events: JSON.stringify(events),
      secret,
      active: true,
      createdAt: new Date().toISOString(),
    }).select().single();

    return NextResponse.json({ endpoint: data, secret });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await sb.from("webhook_endpoints").delete().eq("id", id);
  return NextResponse.json({ deleted: true });
}
