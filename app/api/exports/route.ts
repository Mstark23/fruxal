import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { generatePDFReport, generateExcelExport, gatherReportData } from "@/services/exports/export-service";

export const maxDuration = 30; // Vercel function timeout (seconds)

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Get report data as JSON (for preview)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const { data: membership } = await sb
      .from("business_members")
      .select("businessId")
      .eq("userId", userId)
      .limit(1)
      .single();
    if (!membership) return NextResponse.json({ error: "No business" }, { status: 404 });

    const data = await gatherReportData(membership.businessId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Generate PDF or Excel
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const { data: membership } = await sb
      .from("business_members")
      .select("businessId")
      .eq("userId", userId)
      .limit(1)
      .single();
    if (!membership) return NextResponse.json({ error: "No business" }, { status: 404 });

    const { format } = await req.json();

    if (format === "pdf") {
      const buffer = await generatePDFReport(membership.businessId);
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="leak-grow-report.pdf"`,
        },
      });
    }

    if (format === "excel") {
      const buffer = await generateExcelExport(membership.businessId);
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="leak-grow-export.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "Format must be 'pdf' or 'excel'" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
