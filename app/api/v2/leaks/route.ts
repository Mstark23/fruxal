// =============================================================================
// src/app/api/v2/leaks/route.ts
// =============================================================================
// PUBLIC or AUTH — Provincial leak detectors.
//
// GET ?industry=restaurant&structure=corporation&employees=15&revenue=1200000
//
// Returns leak detectors applicable to the business profile, sorted by
// severity and impact. Each includes diagnostic question + solution partners.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getLeakDetectors, getSmartPartners } from "@/services/intelligence";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry") || undefined;
    const structure = searchParams.get("structure") || undefined;
    const employees = Number(searchParams.get("employees")) || 0;
    const revenue = Number(searchParams.get("revenue")) || 0;
    const withPartners = searchParams.get("withPartners") !== "false";
    const language = searchParams.get("language") || "fr";

    const detectors = await getLeakDetectors({
      industry,
      structure,
      employeeCount: employees,
      annualRevenue: revenue,
    });

    // Optionally enrich each detector with matching partners
    let enrichedDetectors = detectors;

    if (withPartners && detectors.length > 0) {
      enrichedDetectors = await Promise.all(
        detectors.map(async (d) => {
          try {
            const province = searchParams.get("province") || "";
            const partners = await getSmartPartners({
              leakCategory: d.category,
              province,
              industry,
              structure,
              employeeCount: employees,
              annualRevenue: revenue,
              language,
              limit: 3,
            });
            return { ...d, matched_partners: partners };
          } catch {
            return { ...d, matched_partners: [] };
          }
        })
      );
    }

    // Calculate total potential impact
    const totalImpactMin = detectors.reduce((s, d) => s + d.annual_impact_min, 0);
    const totalImpactMax = detectors.reduce((s, d) => s + d.annual_impact_max, 0);

    // Group by category
    const byCategory: Record<string, typeof detectors> = {};
    for (const d of detectors) {
      if (!byCategory[d.category]) byCategory[d.category] = [];
      byCategory[d.category].push(d);
    }

    return NextResponse.json({
      success: true,
      data: {
        total: detectors.length,
        critical: detectors.filter((d) => d.severity === "critical").length,
        high: detectors.filter((d) => d.severity === "high").length,
        total_impact: { min: totalImpactMin, max: totalImpactMax },
        by_category: byCategory,
        detectors: enrichedDetectors,
      },
    });
  } catch (err: any) {
    console.error("[GET /api/v2/leaks] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
