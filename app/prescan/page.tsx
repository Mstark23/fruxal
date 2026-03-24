"use client";
// Stale prescan page — redirects to landing page chat prescan
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function PrescanRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, []);
  return null;
}
