// =============================================================================
// GET /api/tier3/diagnostic/[id]/pdf — Download executive report PDF
// =============================================================================
// Authenticates user, fetches diagnostic, generates PDF, returns buffer.
// Also updates status to "sent" if currently "draft".
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateTier3Report } from "@/services/tier3/pdf-generator";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Diagnostic ID required" }, { status: 400 });
    }

    // Fetch diagnostic
    const { data, error } = await supabaseAdmin
      .from("tier3_diagnostics")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Diagnostic not found" },
        { status: 404 }
      );
    }

    const result = data.result;
    if (!result || !result.topLeaks) {
      return NextResponse.json({ error: "Diagnostic has no result data" }, { status: 400 });
    }

    // Generate PDF
    console.log(`[Tier3:PDF] Generating report for "${data.company_name}" (${id})`);

    const pdfBuffer = await generateTier3Report({
      id: data.id,
      companyName: result.companyName || data.company_name,
      industry: result.industry || data.industry,
      province: result.province || data.province,
      revenueBracket: result.revenueBracket || data.revenue_bracket,
      generatedAt: result.generatedAt || data.created_at,
      topLeaks: result.topLeaks,
      summary: result.summary,
    });

    console.log(`[Tier3:PDF] Generated ${(pdfBuffer.length / 1024).toFixed(1)}KB PDF`);

    // Update status to "sent" if currently "draft"
    if (data.status === "draft") {
      try {
        await supabaseAdmin
          .from("tier3_diagnostics")
          .update({ status: "sent", updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", userId);
        console.log(`[Tier3:PDF] Status updated to "sent"`);
      } catch (updateErr) {
        console.warn("[Tier3:PDF] Status update failed:", updateErr);
      }
    }

    // Clean filename
    const safeName = (data.company_name || "company")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `fruxal-diagnostic-${safeName}-${dateStr}.pdf`;

    // Return PDF
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[Tier3:PDF] Error:", error);
    return NextResponse.json({ error: error.message || "PDF generation failed" }, { status: 500 });
  }
}
