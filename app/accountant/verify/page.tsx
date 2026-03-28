"use client";
import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token  = params.get("token");

  useEffect(() => {
    if (!token) { router.replace("/accountant/login?error=missing_token"); return; }
    router.replace(`/api/accountant/auth/verify?token=${encodeURIComponent(token)}`);
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );
}

export default function AccountantVerifyPage() {
  return <Suspense><VerifyContent /></Suspense>;
}
