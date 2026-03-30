import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db/client";


const MODEL = process.env.AI_MODEL || "claude-sonnet-4-20250514";

// =============================================================================
// EXTRACT: Send document to Claude for analysis
// =============================================================================
export async function analyzeContract(documentId: string, fileBuffer: Buffer, fileType: string, fileName: string) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build the prompt
  const systemPrompt = `You are a revenue intelligence analyst for a medical supply / e-commerce company. Your job is to analyze contracts, fee schedules, and business agreements to extract structured financial data.

Extract the following information from the document. Return ONLY valid JSON with no explanation.

{
  "documentType": "CONTRACT" | "FEE_SCHEDULE" | "INVOICE" | "PROPOSAL" | "OTHER",
  "parties": {
    "provider": "company providing goods/services",
    "client": "company receiving goods/services"
  },
  "effectiveDate": "YYYY-MM-DD or null",
  "expirationDate": "YYYY-MM-DD or null",
  "autoRenewal": true/false,
  "paymentTerms": {
    "netDays": 30,
    "earlyPaymentDiscount": "2% 10 net 30" or null,
    "lateFee": "1.5% per month" or null
  },
  "pricing": [
    {
      "item": "description of product/service",
      "rate": 100.00,
      "unit": "per unit / per hour / monthly / annual",
      "minimumQuantity": null,
      "maximumQuantity": null,
      "discountTier": null
    }
  ],
  "totalContractValue": null or estimated annual value,
  "minimumCommitment": null or minimum annual/monthly spend,
  "terminationClause": "summary of termination terms",
  "specialTerms": ["any unusual or notable terms"],
  "redFlags": [
    {
      "issue": "description of the concern",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "recommendation": "what to do about it"
    }
  ],
  "billingGaps": [
    {
      "issue": "description of potential billing gap",
      "estimatedImpact": dollar amount or null,
      "recommendation": "how to fix"
    }
  ]
}

If you cannot determine a value, use null. For pricing, extract every line item you can find. For redFlags, look for: auto-renewal traps, unfavorable payment terms, missing escalation clauses, below-market rates, scope gaps that could lead to unbilled work, and missing late payment penalties.`;

  // Determine media type for the API
  let mediaType: "application/pdf" | "image/png" | "image/jpeg" | "image/gif" | "image/webp" = "application/pdf";
  if (fileType.includes("png")) mediaType = "image/png";
  else if (fileType.includes("jpeg") || fileType.includes("jpg")) mediaType = "image/jpeg";

  const base64Data = fileBuffer.toString("base64");

  // Call Claude with the document
  const contentBlocks: any[] = [];

  if (fileType === "application/pdf") {
    contentBlocks.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: base64Data,
      },
    });
  } else {
    contentBlocks.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: base64Data,
      },
    });
  }

  contentBlocks.push({
    type: "text",
    text: `Analyze this document (${fileName}) and extract all financial terms, pricing, and identify any billing gaps or red flags. Return ONLY JSON as specified in your instructions.`,
  });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: contentBlocks,
      },
    ],
  });

  // Extract the text response
  const textBlock = response.content.find((b: any) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  // Parse JSON (handle markdown code blocks)
  let jsonText = textBlock.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
  }

  let extractedData: any = {};
  try { extractedData = JSON.parse(jsonText); } catch { extractedData = {}; }
  return extractedData;
}

// =============================================================================
// COMPARE: Check extracted contract terms against actual billing
// =============================================================================
export async function compareContractToBilling(
  businessId: string,
  documentId: string,
  extractedData: any
) {
  const gaps: any[] = [];

  // If we can identify the client from the contract
  const clientName = extractedData.parties?.client;
  if (!clientName) return gaps;

  // Try to find matching client in our database
  const clients = await prisma.client.findMany({
    where: { businessId },
  });

  // Fuzzy match client name
  const matchedClient = clients.find((c) => {
    const normalizedContract = clientName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normalizedDb = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalizedDb.includes(normalizedContract) || normalizedContract.includes(normalizedDb);
  });

  if (!matchedClient) return gaps;

  // Get client's recent invoices
  const invoices = await prisma.invoice.findMany({
    where: { businessId, clientId: matchedClient.id },
    orderBy: { issuedAt: "desc" },
    take: 6,
  });

  if (invoices.length === 0) return gaps;

  // Compare contract pricing against actual billing
  const contractValue = extractedData.totalContractValue;
  const avgMonthlyBilling = invoices.reduce((sum, inv) => sum + inv.amount, 0) / invoices.length;
  const annualizedBilling = avgMonthlyBilling * 12;

  if (contractValue && annualizedBilling < contractValue * 0.85) {
    gaps.push({
      type: "UNDERBILLING",
      clientId: matchedClient.id,
      clientName: matchedClient.name,
      title: `${matchedClient.name} — billed $${Math.round(annualizedBilling).toLocaleString()}/yr vs contract value $${Math.round(contractValue).toLocaleString()}/yr`,
      description: `Contract specifies approximately $${Math.round(contractValue).toLocaleString()} in annual value, but actual billing averages only $${Math.round(annualizedBilling).toLocaleString()}/year (${Math.round((annualizedBilling / contractValue) * 100)}% of contract). Potential unbilled services or underpricing of $${Math.round(contractValue - annualizedBilling).toLocaleString()}/year.`,
      annualImpact: Math.round(contractValue - annualizedBilling),
      severity: (contractValue - annualizedBilling) > 10000 ? "HIGH" : "MEDIUM",
    });
  }

  // Check payment terms compliance
  if (extractedData.paymentTerms?.netDays) {
    const lateInvoices = invoices.filter((inv) => {
      if (!inv.dueAt || !inv.paidAt) return false;
      const daysLate = Math.floor(
        (new Date(inv.paidAt).getTime() - new Date(inv.dueAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysLate > 5;
    });

    if (lateInvoices.length > 0) {
      const avgLateDays = lateInvoices.reduce((sum, inv) => {
        const days = Math.floor(
          (new Date(inv.paidAt!).getTime() - new Date(inv.dueAt!).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) / lateInvoices.length;

      const lateAmount = lateInvoices.reduce((sum, inv) => sum + inv.amount, 0);

      if (extractedData.paymentTerms.lateFee && !lateInvoices.some((inv: any) => inv.metadata?.lateFeeApplied)) {
        gaps.push({
          type: "UNCOLLECTED_LATE_FEES",
          clientId: matchedClient.id,
          clientName: matchedClient.name,
          title: `${matchedClient.name} — late fees not applied on ${lateInvoices.length} invoices`,
          description: `Contract allows charging "${extractedData.paymentTerms.lateFee}" for late payments. ${lateInvoices.length} invoices totaling $${Math.round(lateAmount).toLocaleString()} were paid an average of ${Math.round(avgLateDays)} days late, but no late fees were applied.`,
          annualImpact: Math.round(lateAmount * 0.015 * 12), // Estimate 1.5% monthly
          severity: "MEDIUM",
        });
      }
    }
  }

  // Check auto-renewal flag
  if (extractedData.autoRenewal && extractedData.expirationDate) {
    const expDate = new Date(extractedData.expirationDate);
    const daysUntilExpiry = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry > 0 && daysUntilExpiry < 90) {
      gaps.push({
        type: "RENEWAL_OPPORTUNITY",
        clientId: matchedClient.id,
        clientName: matchedClient.name,
        title: `${matchedClient.name} — contract expires in ${daysUntilExpiry} days (auto-renews)`,
        description: `Contract auto-renews on ${extractedData.expirationDate}. This is a ${daysUntilExpiry}-day window to renegotiate rates before the contract locks in for another term. Current billing suggests a rate adjustment opportunity.`,
        annualImpact: Math.round(avgMonthlyBilling * 12 * 0.05), // 5% rate increase opportunity
        severity: daysUntilExpiry < 30 ? "HIGH" : "MEDIUM",
      });
    }
  }

  return gaps;
}
