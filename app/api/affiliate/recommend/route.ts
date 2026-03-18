// =============================================================================
// GET /api/affiliate/recommend — Find partners for a leak category
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { findPartnersForLeak, getAllPartners, getPersonalPartners } from "@/services/affiliate/service";

export async function GET(req: NextRequest) {
  const leakCategory = req.nextUrl.searchParams.get("category");
  const mode = req.nextUrl.searchParams.get("mode"); // "personal" for B2C

  try {
    // Personal mode — return grouped B2C partners
    if (mode === "personal") {
      const grouped = await getPersonalPartners();
      return NextResponse.json({ mode: "personal", categories: grouped });
    }

    // No category — return all partners
    if (!leakCategory) {
      const all = await getAllPartners();
      return NextResponse.json({
        partnerCount: all.length,
        partners: all,
      });
    }

    // Category specified — return matched partners
    const partners = await findPartnersForLeak(leakCategory);
    return NextResponse.json({
      category: leakCategory,
      partnerCount: partners.length,
      partners,
      bestPartner: partners[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
