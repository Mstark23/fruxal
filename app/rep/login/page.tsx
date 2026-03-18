"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERRORS: Record<string, string> = {
  missing_token: "No login token found. Please use the link sent to your email.",
  expired:       "This login link has expired. Ask your admin to resend access.",
  inactive:      "Your rep account is inactive. Contact your admin.",
  session:       "Your session has expired. Please request a new login link.",
};

function LoginContent() {
  const params = useSearchParams();
  const error  = params.get("error");

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E5E3DD] rounded-2xl px-8 py-10 max-w-md w-full text-center"
        style={{ boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
        <div className="mb-6">
          <span className="text-[20px] font-bold text-[#1B3A2D] tracking-tight">Fruxal</span>
          <span className="text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider ml-2">Rep Portal</span>
        </div>
        {error ? (
          <>
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background:"rgba(179,64,64,0.08)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B34040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-[16px] font-bold text-[#1A1A18] mb-2">Access Error</h2>
            <p className="text-[13px] text-[#56554F] leading-relaxed">{ERRORS[error] || "Something went wrong. Contact your admin."}</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background:"rgba(27,58,45,0.08)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 className="text-[16px] font-bold text-[#1A1A18] mb-2">Check Your Email</h2>
            <p className="text-[13px] text-[#56554F] leading-relaxed">Your Fruxal rep portal access was sent to your email. Click the link in the email to sign in.</p>
            <p className="text-[11px] text-[#B5B3AD] mt-4">The link expires in 15 minutes.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function RepLoginPage() {
  return <Suspense fallback={null}><LoginContent /></Suspense>;
}
