// =============================================================================
// src/app/api/v2/billing/portal/route.ts
// =============================================================================
// POST — Creates a Stripe Customer Portal session.
// Returns { url } for redirect to Stripe-hosted billing management.
// User can: update payment method, view invoices, cancel/change plan.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Stripe from "stripe";

export const maxDuration = 60; // Vercel function timeout (seconds)

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any });
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get Stripe customer ID from subscription
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", token.sub)
      .single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({
        success: false,
        error: "No billing account found. Please subscribe first.",
      }, { status: 404 });
    }

    // Create Stripe portal session
    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://app.fruxal.com"}/v2/settings?tab=billing`,
    });

    return NextResponse.json({ success: true, url: session.url });

  } catch (err: any) {
    console.error("[Billing:Portal] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
