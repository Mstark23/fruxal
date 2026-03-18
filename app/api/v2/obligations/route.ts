// =============================================================================
// src/app/api/v2/obligations/route.ts
// =============================================================================
// AUTH REQUIRED
//
// GET ?businessId=xxx                → obligation dashboard summary
// GET ?businessId=xxx&detail=1       → full obligation list with match reasons
// POST ?businessId=xxx               → sync obligations (re-match after profile change)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getObligations,
  getObligationDashboard,
  syncObligations,
} from "@/services/intelligence";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    const detail = searchParams.get("detail") === "1";

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: "businessId is required" },
        { status: 400 }
      );
    }

    if (detail) {
      // Full obligation list with match reasons
      const obligations = await getObligations(businessId);
      return NextResponse.json({
        success: true,
        data: {
          total: obligations.length,
          critical: obligations.filter((o) => o.risk_level === "critical").length,
          high: obligations.filter((o) => o.risk_level === "high").length,
          obligations,
        },
      });
    } else {
      // Dashboard summary
      const dashboard = await getObligationDashboard(businessId);
      return NextResponse.json({
        success: true,
        data: dashboard,
      });
    }
  } catch (err: any) {
    console.error("[GET /api/v2/obligations] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const result = await syncObligations(body.businessId);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("[POST /api/v2/obligations] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
