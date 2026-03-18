import { NextRequest, NextResponse } from "next/server";
import { processOutreachSequences } from "@/services/outreach/sequences";

export const maxDuration = 300; // Vercel function timeout (seconds)

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processOutreachSequences();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
