"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function SettingsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/v2/settings"); }, [router]);
  return <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><div className="w-5 h-5 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" /></div>;
}
