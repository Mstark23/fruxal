import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export const maxDuration = 60; // Vercel function timeout (seconds)

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) return NextResponse.json({ error: "business_id required" }, { status: 400 });

  try {
    const expenses = await prisma.userExpenseProfile.findMany({
      where: {
        businessId,
        contractEndDate: { not: null },
      },
      orderBy: { contractEndDate: "asc" },
    });

    const now = new Date();
    const renewals = expenses
      .filter((e) => e.contractEndDate && e.contractEndDate > now)
      .map((e) => {
        const daysUntil = Math.ceil(
          (e.contractEndDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const urgency = daysUntil <= 14 ? "critical" : daysUntil <= 30 ? "high" : daysUntil <= 60 ? "medium" : "low";

        return {
          id: e.id,
          category: e.category,
          vendorName: e.vendorName || "Unknown",
          currentCost: e.monthlyCost,
          renewalDate: e.contractEndDate!.toISOString().split("T")[0],
          daysUntilRenewal: daysUntil,
          urgency,
          estimatedSavings: e.potentialSavingsMonthly || null,
          bestPartner: null as any, // Will be populated below
        };
      });

    // Find best partner for each renewal category
    // Batch: load best partner per category once, not per renewal
    const uniqueCategories = [...new Set(renewals.map((r: any) => r.category).filter(Boolean))];
    const partnersByCategory: Record<string, any> = {} as Record<string, any>;
    await Promise.all(uniqueCategories.map(async (cat) => {
      const p = await prisma.affiliatePartner.findFirst({
        where: { category: cat, active: true },
        orderBy: { qualityScore: "desc" },
      });
      if (p) (partnersByCategory as Record<string, any>)[String(cat)] = p;
    }));

    for (const r of renewals) {
      const partner = (partnersByCategory as Record<string, any>)[String(r.category)];
      if (partner) {
        r.bestPartner = {
          id: partner.id,
          name: partner.name,
          slug: partner.slug,
          logoUrl: partner.logoUrl,
          category: partner.category,
          pricingType: partner.pricingType,
          avgSavingsPercentage: null,
        };
      }
    }

    return NextResponse.json({ renewals, total: renewals.length });
  } catch (err: any) {
    console.error("Renewals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { business_id } = await req.json();
    if (!business_id) return NextResponse.json({ error: "business_id required" }, { status: 400 });

    // Scan transactions for recurring expenses and detect renewal patterns
    const transactions = await prisma.transaction.findMany({
      where: { businessId: business_id },
      orderBy: { date: "desc" },
      take: 500,
    });

    // Group by vendor/description to find recurring charges
    const recurring: Record<string, { amounts: number[]; dates: Date[]; desc: string }> = {};
    for (const t of transactions) {
      const key = (t.description || t.category || "unknown").toLowerCase().trim();
      if (!recurring[key]) recurring[key] = { amounts: [], dates: [], desc: t.description || "" };
      recurring[key].amounts.push(Math.abs(t.amount));
      if (t.date) recurring[key].dates.push(t.date);
    }

    let created = 0;
    for (const [key, data] of Object.entries(recurring)) {
      if (data.amounts.length < 3) continue; // Need at least 3 occurrences

      const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
      const isConsistent = data.amounts.every((a) => Math.abs(a - avgAmount) / avgAmount < 0.15);
      if (!isConsistent) continue;

      // Check if expense profile already exists
      const existing = await prisma.userExpenseProfile.findFirst({
        where: { businessId: business_id, vendorName: data.desc },
      });
      if (existing) continue;

      // Detect category from description
      const desc = data.desc.toLowerCase();
      let category = "other";
      if (desc.includes("insurance") || desc.includes("assurance")) category = "insurance";
      else if (desc.includes("bell") || desc.includes("rogers") || desc.includes("telus") || desc.includes("videotron")) category = "telecom";
      else if (desc.includes("stripe") || desc.includes("square") || desc.includes("moneris")) category = "payment_processing";
      else if (desc.includes("quickbooks") || desc.includes("xero") || desc.includes("freshbooks")) category = "software";

      await prisma.userExpenseProfile.create({
        data: {
          businessId: business_id,
          category,
          vendorName: data.desc,
          monthlyCost: Math.round(avgAmount * 100) / 100,
          detectedFromTransactions: true,
        },
      });
      created++;
    }

    return NextResponse.json({ scanned: transactions.length, newExpenses: created });
  } catch (err: any) {
    console.error("Renewal scan error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
