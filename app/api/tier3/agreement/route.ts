// =============================================================================
// POST /api/tier3/agreement — Generate contingency agreement PDF
// =============================================================================
// Authenticates user, fetches diagnostic, generates agreement, saves record,
// returns PDF as browser download.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateContingencyAgreement } from "@/services/tier3/agreement-generator";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { diagnosticId, contactName, contactTitle, feePercentage, scopeCategories } = body;

    if (!diagnosticId) {
      return NextResponse.json({ error: "diagnosticId is required" }, { status: 400 });
    }
    if (!scopeCategories || !Array.isArray(scopeCategories) || scopeCategories.length === 0) {
      return NextResponse.json({ error: "At least one scope category is required" }, { status: 400 });
    }

    const fee = Math.min(Math.max(Number(feePercentage) || 12, 10), 15);

    // Fetch diagnostic
    const { data: diagnostic, error: fetchErr } = await supabaseAdmin
      .from("tier3_diagnostics")
      .select("*")
      .eq("id", diagnosticId)
      .eq("user_id", userId)
      .single();

    if (fetchErr || !diagnostic) {
      return NextResponse.json(
        { error: fetchErr?.message || "Diagnostic not found" },
        { status: 404 }
      );
    }

    const result = diagnostic.result;
    if (!result?.summary) {
      return NextResponse.json({ error: "Diagnostic has no result data" }, { status: 400 });
    }

    // Generate agreement PDF
    console.log(`[Tier3:Agreement] Generating for "${diagnostic.company_name}" — ${scopeCategories.length} categories, ${fee}% fee`);

    const pdfBuffer = await generateContingencyAgreement({
      diagnosticId: diagnostic.id,
      companyName: result.companyName || diagnostic.company_name,
      contactName: contactName || "",
      contactTitle: contactTitle || "",
      industry: result.industry || diagnostic.industry,
      province: result.province || diagnostic.province,
      feePercentage: fee,
      scopeCategories,
      estimatedLow: result.summary.totalEstimatedLow,
      estimatedHigh: result.summary.totalEstimatedHigh,
      generatedAt: new Date().toISOString(),
    });

    console.log(`[Tier3:Agreement] Generated ${(pdfBuffer.length / 1024).toFixed(1)}KB PDF`);

    // Save agreement record
    const agreementId = crypto.randomUUID();
    try {
      await supabaseAdmin.from("tier3_agreements").insert({
        id: agreementId,
        user_id: userId,
        diagnostic_id: diagnosticId,
        company_name: diagnostic.company_name,
        contact_name: contactName || null,
        contact_title: contactTitle || null,
        fee_percentage: fee,
        scope_categories: scopeCategories,
        status: "pending",
        created_at: new Date().toISOString(),
      });
    } catch (saveErr: any) {
      console.warn("[Tier3:Agreement] Save failed (table may not exist):", saveErr.message);
    }

    // Return PDF
    const safeName = (diagnostic.company_name || "company")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `fruxal-agreement-${safeName}-${dateStr}.pdf`;

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
    console.error("[Tier3:Agreement] Error:", error);
    return NextResponse.json({ error: error.message || "Agreement generation failed" }, { status: 500 });
  }
}
