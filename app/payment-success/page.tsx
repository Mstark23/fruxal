"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params  = useSearchParams();
  const invoice = params.get("invoice") || "";
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E1] p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(45,122,80,0.08)] flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-[22px] font-bold text-[#1A1A18] mb-2">Payment received</h1>
        {invoice && (
          <p className="text-[13px] text-[#8E8C85] mb-1">Invoice {invoice}</p>
        )}
        <p className="text-[14px] text-[#56554F] leading-relaxed mb-6">
          Thank you. Your payment has been processed. You'll receive a confirmation email shortly.
        </p>
        <a href="https://fruxal.ca"
          className="inline-block px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition hover:opacity-90"
          style={{ background: "#1B3A2D" }}>
          Back to Fruxal →
        </a>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
