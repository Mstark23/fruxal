// =============================================================================
// src/app/api/v2/intelligence/route.ts
// =============================================================================
// AUTH REQUIRED — Returns the latest intelligence report for a business.
//
// GET ?businessId=xxx           → latest saved report
// GET ?businessId=xxx&refresh=1 → regenerate fresh report
//
// POST — Generate new report with custom params (for onboarding/profile update)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getLatestReport, generateIntelligence } from "@/services/intelligence";

export async function GET(req: NextRequest) {
  const start = Date.now();

  try {
    // Auth check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    const refresh = searchParams.get("refresh") === "1";

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: "businessId is required" },
        { status: 400 }
      );
    }

    let report;

    if (refresh) {
      // Re-generate from profile
      report = await generateIntelligence({
        businessId,
        userId: token.sub,
        triggeredBy: "manual_refresh",
      });
    } else {
      // Fetch latest saved report
      report = await getLatestReport(businessId);

      if (!report) {
        return NextResponse.json(
          {
            success: false,
            error: "No report found. Run a prescan or generate a new report first.",
            code: "NO_REPORT",
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: report,
      meta: { took_ms: Date.now() - start },
    });
  } catch (err: any) {
    console.error("[GET /api/v2/intelligence] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.businessId) {
      return NextResponse.json(
        { success: false, error: "businessId is required" },
        { status: 400 }
      );
    }

    const report = await generateIntelligence({
      businessId: body.businessId,
      userId: token.sub,
      businessName: body.businessName,
      province: body.province || "",
      municipality: body.municipality,
      structure: body.structure || "sole_proprietor",
      isIncorporated: body.isIncorporated || false,
      employeeCount: body.employeeCount ?? 0,
      annualRevenue: body.annualRevenue ?? 0,
      monthlyRevenue: body.monthlyRevenue ?? 0,
      industry: body.industry || "general",
      fiscalYearEndMonth: body.fiscalYearEndMonth || 12,
      language: body.language || "fr",
      triggeredBy: body.triggeredBy || "profile_update",
    });

    return NextResponse.json({
      success: true,
      data: report,
      meta: { took_ms: Date.now() - start },
    });
  } catch (err: any) {
    console.error("[POST /api/v2/intelligence] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
