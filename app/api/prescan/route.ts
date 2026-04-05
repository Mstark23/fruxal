/**
 * V1 Prescan Route — DEPRECATED
 * Superseded by /api/v3/prescan-chat which uses the adaptive chat flow.
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: false,
    error: "This prescan version is deprecated. Please use the latest version at fruxal.ca",
    redirect: "/"
  }, { status: 410 });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ deprecated: true, redirect: "/" }, { status: 410 });
}
