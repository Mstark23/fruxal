// =============================================================================
// /v2/checkout — Redirects to dashboard
// Fruxal is now contingency-only. No subscription plans.
// =============================================================================
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/v2/dashboard");
  }, [router]);
  return null;
}
