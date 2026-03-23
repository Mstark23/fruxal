// =============================================================================
// app/api/documents/analyze/route.ts
// POST — analyze an uploaded document via Claude
// Reads from Supabase Storage (not local disk which is ephemeral on Vercel)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { analyzeContract, compareContractToBilling } from "@/services/ai-engine";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { documentId } = await request.json();
    if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 });

    const userId     = (session.user as any).id as string;
    const membership = await prisma.businessMember.findFirst({ where: { userId } });
    if (!membership) return NextResponse.json({ error: "No business found" }, { status: 400 });

    const document = await prisma.document.findFirst({
      where: { id: documentId, businessId: membership.businessId },
    });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    await prisma.document.update({ where: { id: documentId }, data: { status: "ANALYZING" } });

    // Download from Supabase Storage (not from local disk)
    const { data: storageData, error: downloadError } = await supabaseAdmin.storage
      .from("documents")
      .download(document.fileUrl);

    if (downloadError || !storageData) {
      await prisma.document.update({ where: { id: documentId }, data: { status: "ERROR" } });
      return NextResponse.json({ error: "Could not retrieve file from storage" }, { status: 500 });
    }

    const fileBuffer = Buffer.from(await storageData.arrayBuffer());

    const extractedData = await analyzeContract(documentId, fileBuffer, document.fileType, document.fileName);
    const billingGaps   = await compareContractToBilling(membership.businessId, documentId, extractedData);

    for (const gap of billingGaps) {
      await prisma.leak.create({
        data: {
          businessId: membership.businessId,
          clientId:   gap.clientId,
          type:       gap.type === "UNDERBILLING" ? "UNDERPRICING" : gap.type === "UNCOLLECTED_LATE_FEES" ? "COLLECTION_FAILURE" : "SYSTEM_GAP",
          severity:   gap.severity,
          status:     "OPEN",
          title:      gap.title,
          description: gap.description,
          annualImpact: gap.annualImpact,
          evidence:   { source: "contract_analysis", documentId, documentName: document.fileName, ...gap },
        },
      });
    }

    if (extractedData.pricing?.length > 0) {
      const clientName = extractedData.parties?.client;
      let matchedClientId = null;
      if (clientName) {
        const clients = await prisma.client.findMany({ where: { businessId: membership.businessId } });
        const match = clients.find(c => {
          const a = clientName.toLowerCase().replace(/[^a-z0-9]/g, "");
          const b = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
          return b.includes(a) || a.includes(b);
        });
        if (match) matchedClientId = match.id;
      }
      await prisma.contract.create({
        data: {
          documentId,
          clientId:  matchedClientId,
          type:      extractedData.documentType || "CONTRACT",
          terms:     extractedData,
          startDate: extractedData.effectiveDate   ? new Date(extractedData.effectiveDate)   : null,
          endDate:   extractedData.expirationDate  ? new Date(extractedData.expirationDate)  : null,
          autoRenew: extractedData.autoRenewal || false,
          status:    "active",
        },
      });
    }

    await prisma.document.update({
      where: { id: documentId },
      data:  { status: "ANALYZED", extractedData: extractedData as any, analyzedAt: new Date() },
    });

    return NextResponse.json({ message: "Analysis complete", extractedData, billingGaps, leaksCreated: billingGaps.length });
  } catch (err: any) {
    console.error("[Analyze] Error:", err.message);
    try {
      const body = await request.json().catch(() => ({}));
      if (body.documentId) {
        await prisma.document.update({ where: { id: body.documentId }, data: { status: "ERROR" } });
      }
    } catch { /* non-fatal */ }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
