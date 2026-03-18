/**
 * V1 Prescan Route — DEPRECATED
 * Superseded by /api/v3/prescan-chat which uses the adaptive chat flow.
 * Kept as a stub so the build doesn't break.
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use /api/v3/prescan-chat instead." },
    { status: 410 }
  );
}
