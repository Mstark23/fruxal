// =============================================================================
// GET /api/v2/data-collect — Returns collection items for this user's industry
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Get user's business + industry
    const membership = await prisma.businessMember.findFirst({
      where: { userId },
      include: { business: true },
    });

    const industry = membership?.business?.industry || "_universal";

    // Get collection items
    const { data: items } = await supabase
      .from("data_collection_items")
      .select("*")
      .in("industry", ["_universal", industry])
      .eq("is_active", true)
      .order("priority");

    // Check what's already connected/uploaded
    const ds = await prisma.dataSource.findFirst({
      where: { businessId: membership?.businessId || "", provider: "QUICKBOOKS", status: "CONNECTED" },
    });

    const { data: uploads } = await supabase
      .from("user_uploads")
      .select("collection_item_id")
      .eq("userId", userId);

    const uploadedIds = new Set((uploads || []).map((u: any) => u.collection_item_id));
    let completedCount = uploadedIds.size;
    if (ds) completedCount++;

    return NextResponse.json({
      items: (items || []).map((item: any) => ({
        ...item,
        completed: item.data_type === "quickbooks" ? !!ds : uploadedIds.has(item.id),
      })),
      completedCount,
      qbConnected: !!ds,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
