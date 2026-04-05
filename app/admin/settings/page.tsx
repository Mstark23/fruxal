"use client";
import { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable settings
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [contingencyRate, setContingencyRate] = useState("12");
  const [adminEmails, setAdminEmails] = useState("");
  const [supportEmail, setSupportEmail] = useState("hello@fruxal.com");

  useEffect(() => {
    // Load current env-based settings (display only — actual changes need Vercel env vars)
    setCalendlyUrl(process.env.NEXT_PUBLIC_CALENDLY_URL || "");
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-[10px] border-2 border-[#1B3A2D]/20 border-t-[#1B3A2D] animate-spin" style={{ animationDuration: "1.2s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2.2" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">ADMIN</p>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">Platform Settings</h1>
          </div>
        </div>

        <AdminNav />

        <div className="mt-6 space-y-6">
          {/* Calendly URL */}
          <div className="bg-white border border-[#E5E3DD] rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <h3 className="text-[13px] font-bold text-[#1A1A18] mb-1">Calendly URL</h3>
            <p className="text-[11px] text-[#8E8C85] mb-3">Used for all "Book a Strategy Call" buttons across the platform.</p>
            <input
              value={calendlyUrl}
              onChange={e => setCalendlyUrl(e.target.value)}
              placeholder="https://calendly.com/fruxal/strategy"
              className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5E3DD] rounded-lg focus:outline-none focus:border-[#1B3A2D]/50"
            />
            <p className="text-[10px] text-[#B5B3AD] mt-2">Set <code className="bg-[#F0EFEB] px-1 rounded">NEXT_PUBLIC_CALENDLY_URL</code> in Vercel environment variables to change this permanently.</p>
          </div>

          {/* Contingency Rate */}
          <div className="bg-white border border-[#E5E3DD] rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <h3 className="text-[13px] font-bold text-[#1A1A18] mb-1">Contingency Fee Rate</h3>
            <p className="text-[11px] text-[#8E8C85] mb-3">Percentage charged on confirmed savings. Displayed to customers.</p>
            <div className="flex items-center gap-2">
              <input
                value={contingencyRate}
                onChange={e => setContingencyRate(e.target.value)}
                className="w-24 px-3 py-2.5 text-sm bg-white border border-[#E5E3DD] rounded-lg focus:outline-none focus:border-[#1B3A2D]/50"
              />
              <span className="text-[13px] text-[#8E8C85]">%</span>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white border border-[#E5E3DD] rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <h3 className="text-[13px] font-bold text-[#1A1A18] mb-1">Email Configuration</h3>
            <p className="text-[11px] text-[#8E8C85] mb-3">Email sending is powered by Resend.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#56554F] mb-1">Support Email</label>
                <input
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5E3DD] rounded-lg focus:outline-none focus:border-[#1B3A2D]/50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#56554F] mb-1">From Address</label>
                <p className="text-[12px] text-[#8E8C85] px-3 py-2.5 bg-[#F0EFEB] rounded-lg">
                  {process.env.NEXT_PUBLIC_RESEND_FROM || "Set RESEND_FROM_EMAIL in Vercel"}
                </p>
              </div>
            </div>
          </div>

          {/* Environment Variables Reference */}
          <div className="bg-white border border-[#E5E3DD] rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <h3 className="text-[13px] font-bold text-[#1A1A18] mb-1">Environment Variables</h3>
            <p className="text-[11px] text-[#8E8C85] mb-3">These are configured in Vercel → Settings → Environment Variables.</p>
            <div className="space-y-2">
              {[
                { key: "NEXT_PUBLIC_CALENDLY_URL", desc: "Calendly booking link for strategy calls" },
                { key: "RESEND_API_KEY", desc: "Resend API key for email sending" },
                { key: "RESEND_FROM_EMAIL", desc: "Email 'from' address (must be verified domain)" },
                { key: "ANTHROPIC_API_KEY", desc: "Claude AI API key for diagnostics + chat" },
                { key: "NEXTAUTH_SECRET", desc: "Authentication secret (auto-generated)" },
                { key: "ADMIN_EMAILS", desc: "Comma-separated admin email addresses" },
                { key: "NEXT_PUBLIC_SUPABASE_URL", desc: "Supabase database URL" },
                { key: "SUPABASE_SERVICE_ROLE_KEY", desc: "Supabase admin access key" },
              ].map(v => (
                <div key={v.key} className="flex items-start gap-3 py-2 border-b border-[#F0EFEB] last:border-0">
                  <code className="text-[11px] font-mono text-[#1B3A2D] bg-[#F0EFEB] px-2 py-0.5 rounded shrink-0">{v.key}</code>
                  <span className="text-[11px] text-[#8E8C85]">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
