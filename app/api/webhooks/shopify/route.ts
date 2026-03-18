import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

// =============================================================================
// SHOPIFY WEBHOOK
// =============================================================================
// Receives real-time events from Shopify:
// - orders/create → create invoice record
// - orders/paid → mark invoice paid
// - refunds/create → create REFUND_LEAKAGE leak
// - customers/create → create client record
// =============================================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const topic = req.headers.get("x-shopify-topic");
    const shopDomain = req.headers.get("x-shopify-shop-domain");

    // In production, verify HMAC signature
    // const hmac = req.headers.get("x-shopify-hmac-sha256");

    const data = JSON.parse(body);

    // Find business by shop domain
    const integrations = await prisma.$queryRawUnsafe(
      `SELECT * FROM integrations WHERE provider = 'shopify' AND status = 'CONNECTED' AND "externalAccountId" = $1`,
      shopDomain?.replace(".myshopify.com", "")
    ) as any[];

    if (!integrations.length) {
      return NextResponse.json({ received: true, message: "No matching Shopify integration" });
    }

    const businessId = integrations[0].businessId;

    switch (topic) {
      case "orders/create":
      case "orders/updated": {
        const order = data;
        const total = parseFloat(order.total_price || "0");
        const customerName = order.customer ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() : "Unknown";
        const customerEmail = order.customer?.email;
        const customerId = order.customer?.id;

        // Upsert customer
        if (customerId) {
          const existing = await prisma.client.findFirst({
            where: { businessId, externalId: `shopify_${customerId}` }
          });
          if (!existing) {
            await prisma.client.create({
              data: {
                businessId, externalId: `shopify_${customerId}`,
                name: customerName || customerEmail || "Shopify Customer",
                email: customerEmail, status: "ACTIVE",
              }
            });
          }

          // Upsert order as invoice
          const client = await prisma.client.findFirst({
            where: { businessId, externalId: `shopify_${customerId}` }
          });
          if (client) {
            const existingInv = await prisma.invoice.findFirst({
              where: { businessId, externalId: `shopify_ord_${order.id}` }
            });
            const isPaid = order.financial_status === "paid";

            if (existingInv) {
              await prisma.invoice.update({
                where: { id: existingInv.id },
                data: {
                  amount: total,
                  amountPaid: isPaid ? total : 0,
                  status: isPaid ? "PAID" : "PENDING",
                  paidAt: isPaid ? new Date() : undefined,
                }
              });
            } else {
              await prisma.invoice.create({
                data: {
                  businessId, clientId: client.id,
                  externalId: `shopify_ord_${order.id}`,
                  amount: total, amountPaid: isPaid ? total : 0,
                  status: isPaid ? "PAID" : "PENDING",
                  issuedAt: new Date(order.createdAt || Date.now()),
                  dueAt: new Date(order.createdAt || Date.now()),
                  paidAt: isPaid ? new Date() : undefined,
                  // @ts-ignore
                  description: `Order #${order.order_number || order.name}`,
                }
              });
            }
          }
        }
        break;
      }

      case "refunds/create": {
        const refund = data;
        const refundAmount = refund.transactions?.reduce((s: number, t: any) => s + parseFloat(t.amount || "0"), 0) || 0;
        const orderId = refund.order_id;

        if (refundAmount > 0 && orderId) {
          const invoice = await prisma.invoice.findFirst({
            where: { businessId, externalId: `shopify_ord_${orderId}` },
            include: { client: true }
          });

          if (invoice) {
            // Update invoice
            const newPaid = Math.max(0, invoice.amountPaid - refundAmount);
            await prisma.invoice.update({
              where: { id: invoice.id },
              data: { amountPaid: newPaid, status: newPaid >= invoice.amount ? "PAID" : newPaid > 0 ? "PARTIAL" : "PENDING" }
            });

            // Create refund leak
            await prisma.leak.create({
              data: {
                businessId,
                clientId: invoice.clientId,
                type: "COLLECTION_FAILURE",
                description: `Shopify refund: $${refundAmount.toLocaleString()} on Order #${orderId}. Reason: ${refund.note || "not specified"}`,
                annualImpact: refundAmount,
                // @ts-ignore
                confidence: 100,
                status: "OPEN",
                priority: refundAmount > 200 ? "HIGH" : "LOW",
                fix: `Review refund pattern for ${invoice.client?.name || "customer"}. ${refundAmount > 200 ? "High refund amount - check product quality or expectations." : "Monitor for repeat refund behavior."}`,
              }
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Shopify webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
