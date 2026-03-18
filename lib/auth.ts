// =============================================================================
// src/lib/auth.ts — NEXTAUTH CONFIGURATION
// =============================================================================
// Providers:
//   1. Google OAuth — one-click signup/login
//   2. Credentials — email + password (bcrypt hashed)
//
// Flow:
//   Signup → creates user in Supabase `users` table
//   Login → validates credentials or OAuth, returns JWT
//   JWT callback → embeds user id + role in token
//   Session callback → exposes id + role to client
//
// Tables required: users (id, email, name, password_hash, image, role, provider)
// =============================================================================

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";

// ─── Auto-detect production URL ─────────────────────────────────────────
// Priority: NEXTAUTH_URL (if not localhost) > VERCEL_PROJECT_PRODUCTION_URL > VERCEL_URL
// Without this, cookies get set for wrong domain → session drops on page navigation.
const needsUrlFix = !process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost");
if (needsUrlFix) {
  // Prefer the stable production domain over the per-deploy URL
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL; // e.g. "fruxal.com"
  const vercelUrl = process.env.VERCEL_URL; // e.g. "fruxal-abc123.vercel.app"
  const bestUrl = productionUrl || vercelUrl;
  if (bestUrl) {
    process.env.NEXTAUTH_URL = `https://${bestUrl}`;
    console.log(`[Auth] Auto-set NEXTAUTH_URL to ${process.env.NEXTAUTH_URL}`);
  }
}

export const authOptions: NextAuthOptions = {
  // ─── Providers ──────────────────────────────────────────────────

  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // Email + Password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const email = credentials.email.toLowerCase().trim();

        // Fetch user
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("id, email, name, password_hash, image, role")
          .eq("email", email)
          .single();

        if (error || !user) {
          throw new Error("No account found with this email");
        }

        if (!user.password_hash) {
          throw new Error("This account uses Google login. Please sign in with Google.");
        }

        // Verify password
        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || "user",
        };
      },
    }),
  ],

  // ─── Callbacks ──────────────────────────────────────────────────

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth — create or update user in DB
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase().trim();

        const { data: existing } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (!existing) {
          // Create new user
          const { data: newUser, error } = await supabaseAdmin
            .from("users")
            .insert({
              email,
              name: user.name || email.split("@")[0],
              image: user.image || null,
              provider: "google",
              role: "user",
              created_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (error) {
            console.error("[Auth] Google user creation error:", error);
            return false;
          }

          // Attach DB id to user object
          user.id = newUser.id;
        } else {
          user.id = existing.id;

          // Update profile image if changed
          if (user.image) {
            await supabaseAdmin
              .from("users")
              .update({ image: user.image, updated_at: new Date().toISOString() })
              .eq("id", existing.id);
          }
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      // On initial sign-in, embed user data in JWT
      if (user) {
        token.id   = user.id;
        token.role = (user as any).role || "user";
      }
      return token;
    },

    async session({ session, token }) {
      // Expose id + role to client via session
      if (session.user) {
        (session.user as any).id         = token.id;
        (session.user as any).role       = token.role;
        // Hint for login page redirect — rep goes to /rep/dashboard
        (session.user as any).redirectTo = token.role === "rep"
          ? "/rep/dashboard"
          : "/v2/dashboard";
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If there's a specific callbackUrl, honour it
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      // Default fallback — middleware will redirect reps to /rep/dashboard
      return `${baseUrl}/v2/dashboard`;
    },
  },

  // ─── Pages ──────────────────────────────────────────────────────

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ─── Session ────────────────────────────────────────────────────

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  // ─── Cookie Safety ──────────────────────────────────────────────
  // useSecureCookies in production ensures session cookies persist properly.
  // Without this, cookies can get lost on HTTPS → HTTP transitions.
  useSecureCookies: process.env.NODE_ENV === "production",

  // Trust the host header on Vercel (behind proxy/load balancer)
  // Prevents CSRF false positives that kill sessions
  ...(process.env.VERCEL ? { trustHost: true } : {}),
};
