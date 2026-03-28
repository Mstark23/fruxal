"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function QuickstartRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/v2/dashboard"); }, [router]);
  return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" /></div>;
}
