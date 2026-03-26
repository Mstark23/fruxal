// =============================================================================
// app/v2/solutions/page.tsx
// Solutions are now rep-only — customers are redirected to dashboard.
// =============================================================================
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SolutionsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/v2/dashboard"); }, [router]);
  return null;
}
