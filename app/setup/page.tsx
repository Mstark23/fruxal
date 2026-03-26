"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [needed, setNeeded] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/setup").then(r => r.json()).then(d => setNeeded(d.setupRequired)).catch(() => setNeeded(true));
  }, []);

  const handleSetup = async () => {
    if (!email || !password) { setError("Email and password required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (needed === null) return <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center text-white">Checking...</div>;

  if (needed === false || done) return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center" style={{ fontFamily: "system-ui" }}>
      <div className="text-center">
        <div className="mb-4">{done ? <svg className="w-12 h-12 mx-auto text-positive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg className="w-12 h-12 mx-auto text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}</div>
        <h1 className="text-2xl font-black mb-2">{done ? "Admin Created!" : "Setup Complete"}</h1>
        <p className="text-gray-400 text-sm mb-6">{done ? "Your admin account is ready. Log in to get started." : "An admin already exists. Log in instead."}</p>
        <button onClick={() => router.push("/login")} className="px-6 py-3 bg-[#00c853] text-black rounded-xl font-bold hover:bg-[#00e676] transition-all">
          Go to Login →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center" style={{ fontFamily: "system-ui" }}>
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <svg className="w-10 h-10 mx-auto mb-3 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
          <h1 className="text-2xl font-black">First-Time Setup</h1>
          <p className="text-gray-400 text-sm mt-1">Create your admin account</p>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#00c853]/50" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#00c853]/50" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 8 chars)" type="password" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-[#00c853]/50" />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={handleSetup} disabled={loading}
            className="w-full py-3 bg-[#00c853] text-black font-bold rounded-xl hover:bg-[#00e676] transition-all disabled:opacity-50">
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-4">This page only works once. After your admin is created, this endpoint is permanently disabled.</p>
      </div>
    </div>
  );
}
