// =============================================================================
// src/hooks/useAuth.ts — CLIENT AUTH HOOK
// =============================================================================
// Wraps next-auth/react useSession with convenience methods.
//
// Usage:
//   const { user, isLoading, isLoggedIn, isAdmin, logout } = useAuth();
// =============================================================================

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user: AuthUser | null = session?.user
    ? {
        id: (session.user as any).id,
        email: session.user.email || "",
        name: session.user.name || "",
        image: session.user.image || null,
        role: (session.user as any).role || "user",
      }
    : null;

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/");
  }, [router]);

  const loginRedirect = useCallback(() => {
    router.push("/auth/login");
  }, [router]);

  return {
    user,
    session,
    isLoading: status === "loading",
    isLoggedIn: status === "authenticated",
    isAdmin: user?.role === "admin",
    logout,
    loginRedirect,
  };
}
