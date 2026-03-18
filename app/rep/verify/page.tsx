// app/rep/verify/page.tsx
// Server Component — sets cookie via next/headers cookies().set()
// then redirects via meta-refresh (NOT redirect() which throws before cookie flushes)
import { cookies } from "next/headers";
import { verifyToken, generateSessionToken } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE   = "fruxal_rep_session";
const TTL_DAYS = 30;

export default async function RepVerifyPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return <Redirect to="/rep/login?error=missing_token" />;
  }

  const payload = verifyToken(token);
  if (!payload || payload.type !== "magic") {
    return <Redirect to="/rep/login?error=expired" />;
  }

  const { data: rep } = await supabaseAdmin
    .from("tier3_reps")
    .select("id, email, status")
    .eq("id", payload.repId)
    .single();

  if (!rep || rep.status !== "active") {
    return <Redirect to="/rep/login?error=inactive" />;
  }

  // cookies().set() in a Server Component is reliable — no redirect() called after
  const sessionToken = generateSessionToken(rep.id, rep.email);
  cookies().set(COOKIE, sessionToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   TTL_DAYS * 24 * 60 * 60,
    path:     "/",
  });

  // Return a page that redirects — NOT calling redirect() which throws and aborts response
  return <Redirect to="/rep/dashboard" />;
}

function Redirect({ to }: { to: string }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        {/* meta-refresh fires after cookie is committed to the browser */}
        <meta httpEquiv="refresh" content={`0;url=${to}`} />
        <style>{`
          body{background:#FAFAF8;font-family:system-ui,sans-serif;display:flex;
          align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}
          .s{width:24px;height:24px;border:2px solid #E5E3DD;border-top-color:#1B3A2D;
          border-radius:50%;animation:sp .7s linear infinite;margin:0 auto 12px}
          @keyframes sp{to{transform:rotate(360deg)}}
          p{font-size:13px;color:#8E8C85;margin:8px 0 0}
          strong{color:#1B3A2D;font-size:15px}
        `}</style>
      </head>
      <body>
        <div>
          <div className="s" />
          <strong>Signing you in…</strong>
          <p>Redirecting to your dashboard.</p>
        </div>
      </body>
    </html>
  );
}
