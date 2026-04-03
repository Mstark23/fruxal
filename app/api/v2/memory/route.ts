// =============================================================================
// GET/POST/DELETE /api/v2/memory — Business Memory Management
// =============================================================================
// GET — Load memories for a business/user/pipeline
// POST — Write a new memory (manual or from other features)
// DELETE — Remove a memory by ID
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { loadMemories, deleteMemory, cleanupMemories } from "@/lib/ai/memory";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (token as any).id || token.sub;
  const businessId = req.nextUrl.searchParams.get("businessId");
  const pipelineId = req.nextUrl.searchParams.get("pipelineId");

  const memories = await loadMemories({
    businessId,
    userId: !businessId && !pipelineId ? userId : undefined,
    pipelineId,
  });

  return NextResponse.json({ success: true, memories, count: memories.length });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { businessId, userId, pipelineId, category, content, importance, tags, source } = await req.json();

  if (!content?.trim() || !category) {
    return NextResponse.json({ error: "content and category required" }, { status: 400 });
  }

  const validCategories = ["fact", "preference", "decision", "insight", "concern", "relationship", "action"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from("business_memories").insert({
    business_id: businessId || null,
    user_id: userId || (token as any).id || token.sub,
    pipeline_id: pipelineId || null,
    category,
    content: content.trim(),
    importance: importance || "medium",
    tags: tags || [],
    source: source || "manual",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, memoryId: data.id });
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memoryId = req.nextUrl.searchParams.get("id");
  if (!memoryId) return NextResponse.json({ error: "id required" }, { status: 400 });

  await deleteMemory(memoryId);
  return NextResponse.json({ success: true });
}
