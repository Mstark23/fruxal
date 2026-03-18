import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "click") {
      const referral = await prisma.affiliateReferral.create({
        data: {
          userId,
          businessId: body.businessId || null,
          partnerId: body.partnerId,
          expenseProfileId: body.expenseProfileId || null,
          leakId: body.leakId || null,
          category: body.category || null,
          currentCostMonthly: body.currentCostMonthly || null,
          projectedSavingsMonthly: body.projectedSavingsMonthly || null,
          projectedSavingsAnnual: body.projectedSavingsAnnual || null,
          referralUrl: body.referralUrl || null,
          status: "CLICKED",
        },
      });

      // Increment partner click count
      await prisma.affiliatePartner.update({
        where: { id: body.partnerId },
        data: { totalClicks: { increment: 1 } },
      });

      return NextResponse.json({ referralId: referral.id, status: "CLICKED" });
    }

    if (action === "convert") {
      const updated = await prisma.affiliateReferral.update({
        where: { id: body.referralId },
        data: {
          status: "CONVERTED",
          convertedAt: new Date(),
          actualSavingsMonthly: body.actualSavingsMonthly || null,
        },
      });

      // Increment partner conversion count
      await prisma.affiliatePartner.update({
        where: { id: updated.partnerId },
        data: { totalConversions: { increment: 1 } },
      });

      return NextResponse.json({ referralId: updated.id, status: "CONVERTED" });
    }

    if (action === "feedback") {
      await prisma.affiliateReferral.update({
        where: { id: body.referralId },
        data: {
          userSatisfaction: body.userSatisfaction,
          userFeedback: body.userFeedback,
          wouldRecommend: body.wouldRecommend,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "dismiss") {
      if (body.recommendationId) {
        await prisma.affiliateRecommendation.update({
          where: { id: body.recommendationId },
          data: { dismissed: true, dismissReason: body.reason || null },
        });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Referral error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
