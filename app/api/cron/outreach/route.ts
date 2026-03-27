import { NextRequest, NextResponse } from "next/server";
import { notifyAdmin } from "@/lib/admin-notify";
import { processOutreachSequences } from "@/services/outreach/sequences";

export const maxDuration = 300; // Vercel function timeout (seconds)

// Vercel Cron sends GET — alias to POST handler
export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processOutreachSequences();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    notifyAdmin({ type: "cron_failed", cronName: "outreach", error: (error as any).message }).catch(() => {});
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}
