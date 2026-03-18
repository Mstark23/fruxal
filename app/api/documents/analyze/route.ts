import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { readFile } from "fs/promises";
import path from "path";
import { analyzeContract, compareContractToBilling } from "@/services/ai-engine";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const membership = await prisma.businessMember.findFirst({ where: { userId } });
    if (!membership) {
      return NextResponse.json({ error: "No business found" }, { status: 400 });
    }

    // Get the document
    const document = await prisma.document.findFirst({
      where: { id: documentId, businessId: membership.businessId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Update status to analyzing
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "ANALYZING" },
    });

    // Read the file
    const filePath = path.join(process.cwd(), document.fileUrl);
    const fileBuffer = await readFile(filePath);

    // Send to Claude for analysis
    const extractedData = await analyzeContract(
      documentId,
      fileBuffer,
      document.fileType,
      document.fileName
    );

    // Compare contract terms against actual billing
    const billingGaps = await compareContractToBilling(
      membership.businessId,
      documentId,
      extractedData
    );

    // Create leaks from billing gaps
    for (const gap of billingGaps) {
      await prisma.leak.create({
        data: {
          businessId: membership.businessId,
          clientId: gap.clientId,
          type: gap.type === "UNDERBILLING" ? "UNDERPRICING" : gap.type === "UNCOLLECTED_LATE_FEES" ? "COLLECTION_FAILURE" : "SYSTEM_GAP",
          severity: gap.severity,
          status: "OPEN",
          title: gap.title,
          description: gap.description,
          annualImpact: gap.annualImpact,
          evidence: {
            source: "contract_analysis",
            documentId,
            documentName: document.fileName,
            ...gap,
          },
        },
      });
    }

    // Create contract record if pricing extracted
    if (extractedData.pricing && extractedData.pricing.length > 0) {
      // Find matching client
      const clientName = extractedData.parties?.client;
      let matchedClientId = null;

      if (clientName) {
        const clients = await prisma.client.findMany({
          where: { businessId: membership.businessId },
        });
        const match = clients.find((c) => {
          const a = clientName.toLowerCase().replace(/[^a-z0-9]/g, "");
          const b = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
          return b.includes(a) || a.includes(b);
        });
        if (match) matchedClientId = match.id;
      }

      await prisma.contract.create({
        data: {
          documentId,
          clientId: matchedClientId,
          type: extractedData.documentType || "CONTRACT",
          terms: extractedData,
          startDate: extractedData.effectiveDate ? new Date(extractedData.effectiveDate) : null,
          endDate: extractedData.expirationDate ? new Date(extractedData.expirationDate) : null,
          autoRenew: extractedData.autoRenewal || false,
          status: "active",
        },
      });
    }

    // Update document with extracted data
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "ANALYZED",
        extractedData: extractedData as any,
        analyzedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Analysis complete",
      extractedData,
      billingGaps,
      leaksCreated: billingGaps.length,
    });

  } catch (error: any) {
    console.error("Analysis error:", error);

    // Try to update document status on error
    try {
      const { documentId } = await new Response(request.body).json().catch(() => ({}));
      if (documentId) {
        await prisma.document.update({
          where: { id: documentId },
          data: { status: "ERROR" },
        });
      }
    } catch {}

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
