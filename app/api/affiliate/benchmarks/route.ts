import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) return NextResponse.json({ error: "business_id required" }, { status: 400 });

  try {
    const expenses = await prisma.userExpenseProfile.findMany({
      where: { businessId },
      orderBy: { monthlyCost: "desc" },
    });

    const comparisons = await Promise.all(
      expenses.map(async (exp) => {
        const benchmark = await prisma.marketBenchmark.findFirst({
          where: { category: exp.category, region: "CANADA" },
        });

        let position = "unknown";
        if (benchmark && exp.monthlyCost) {
          if (exp.monthlyCost <= (benchmark.top10Value ?? 0)) position = "excellent";
          else if (exp.monthlyCost <= (benchmark.lowValue ?? 0)) position = "good";
          else if (exp.monthlyCost <= (benchmark.medianValue ?? 0)) position = "average";
          else if (exp.monthlyCost <= (benchmark.highValue ?? 0)) position = "high";
          else position = "very_high";
        }

        return {
          expenseId: exp.id,
          category: exp.category,
          subCategory: exp.subCategory,
          vendor: exp.vendorName,
          currentValue: exp.monthlyCost,
          benchmark: benchmark ? {
            top10: benchmark.top10Value,
            low: benchmark.lowValue,
            median: benchmark.medianValue,
            high: benchmark.highValue,
            unit: benchmark.unit,
            sampleSize: benchmark.sampleSize,
            confidence: benchmark.confidenceScore,
          } : null,
          position,
          verdict: position === "excellent" ? "Top 10%" : position === "good" ? "Below median" :
            position === "average" ? "Around median" : position === "high" ? "Above median" : "Well above average",
          potentialSavings: exp.potentialSavingsMonthly ?? 0,
          bestPartnerName: exp.bestPartnerId ? null : null, // Will be populated when partners are linked
        };
      })
    );

    return NextResponse.json({
      comparisons,
      summary: {
        totalExpenses: comparisons.length,
        totalMonthlyCost: comparisons.reduce((s, c) => s + (c.currentValue ?? 0), 0),
        totalPotentialSavings: comparisons.reduce((s, c) => s + (c.potentialSavings ?? 0), 0),
        overpayingCount: comparisons.filter((c) => c.position === "high" || c.position === "very_high").length,
      },
    });
  } catch (err: any) {
    console.error("Benchmarks error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
