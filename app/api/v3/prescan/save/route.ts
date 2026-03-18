/**
 * V3 Prescan Save — DEPRECATED
 * The V3 prescan engine saves directly via insertPrescanRun().
 * Kept as a stub so the build doesn't break.
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Prescan results are saved automatically by the V3 engine." },
    { status: 410 }
  );
}
