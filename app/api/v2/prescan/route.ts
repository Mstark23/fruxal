// =============================================================================
// src/app/api/v2/prescan/route.ts
// =============================================================================
// PUBLIC — No auth required. This is the prescan entry point.
//
// POST: Process 5-question prescan → full intelligence report
//
// Request body:
// {
//   sessionId: "abc123",
//   email: "user@example.com",         // optional
//   industry: "restaurant",
//   monthlyRevenue: 100000,
//   employeeCount: 15,
//   structure: "corporation",
//   province: "QC"
// }
//
// Returns: IntelligenceReport (scores, obligations, leaks, programs, CTA)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { processPrescan } from "@/services/intelligence";
import type { PrescanInput } from "@/types/intelligence";

// Rate limiter: 10 prescans per IP per hour
const rateLimits = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || entry.reset < now) {
    rateLimits.set(ip, { count: 1, reset: now + 3600000 });
    return true;
  }
  entry.count++;
  return entry.count <= 10;
}

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    // Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate required fields
    const { sessionId, industry, monthlyRevenue, employeeCount, structure, province } = body;

    if (!sessionId || !industry || monthlyRevenue === undefined || employeeCount === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: sessionId, industry, monthlyRevenue, employeeCount",
        },
        { status: 400 }
      );
    }

    // Validate structure
    const validStructures = ["sole_proprietor", "corporation", "partnership", "cooperative", "npo"];
    if (structure && !validStructures.includes(structure)) {
      return NextResponse.json(
        { success: false, error: `Invalid structure. Must be one of: ${validStructures.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate province
    const validProvinces = ["QC", "ON", "BC", "AB", "SK", "MB", "NS", "NB", "NL", "PE", "YT", "NT", "NU"];
    if (province && !validProvinces.includes(province.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Invalid province code" },
        { status: 400 }
      );
    }

    // Build input
    const input: PrescanInput = {
      sessionId,
      email: body.email || undefined,
      industry: industry.toLowerCase().trim(),
      monthlyRevenue: Math.max(0, Number(monthlyRevenue) || 0),
      employeeCount: Math.max(0, Math.floor(Number(employeeCount) || 0)),
      structure: structure || "sole_proprietor",
      province: (province || "").toUpperCase(),
      municipality: body.municipality?.toLowerCase().trim(),
      businessName: body.businessName,
      fiscalYearEndMonth: body.fiscalYearEndMonth || 12,
    };

    // Run the full intelligence pipeline
    const report = await processPrescan(input);

    return NextResponse.json(
      {
        success: true,
        data: report,
        meta: { took_ms: Date.now() - start },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[POST /api/v2/prescan] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "development" ? err.message : "Prescan processing failed",
      },
      { status: 500 }
    );
  }
}
