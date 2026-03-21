import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { captureSnapshot, getTrends, seedHistoricalSnapshots } from "@/services/trending/snapshot-engine";

export const maxDuration = 30; // Vercel function timeout (seconds)

// GET: Get trend data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;
    const membership = await prisma.businessMember.findFirst({ where: { userId } });
    if (!membership) return NextResponse.json({ error: "No business" }, { status: 404 });

    const url = new URL(req.url);
    const months = parseInt(url.searchParams.get("months") || "6");

    const trends = await getTrends(membership.businessId, months);
    return NextResponse.json(trends);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Capture snapshot or seed history
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;
    const membership = await prisma.businessMember.findFirst({ where: { userId } });
    if (!membership) return NextResponse.json({ error: "No business" }, { status: 404 });

    const body = await req.json();

    if (body.action === "seed") {
      const count = await seedHistoricalSnapshots(membership.businessId);
      return NextResponse.json({ seeded: count });
    }

    const snapshot = await captureSnapshot(membership.businessId, body.periodType || "MONTHLY");
    return NextResponse.json({ snapshot });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
