import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");
  const active = searchParams.get("active");

  try {
    if (id) {
      const partner = await prisma.affiliatePartner.findUnique({
        where: { id },
        include: { rates: true, leakMappings: true },
      });
      return NextResponse.json({ partner });
    }

    const where: any = {};
    if (category) where.category = category;
    if (active === "true") where.active = true;

    const partners = await prisma.affiliatePartner.findMany({
      where,
      include: { rates: true },
      orderBy: { qualityScore: "desc" },
    });

    // Group by category
    const byCategory: Record<string, any[]> = {};
    for (const p of partners) {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push(p);
    }

    return NextResponse.json({ partners, byCategory, total: partners.length });
  } catch (err: any) {
    console.error("Partners error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
