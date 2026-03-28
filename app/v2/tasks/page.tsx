// =============================================================================
// app/v2/tasks/page.tsx
// Redirects to /v2/recovery — tasks are now handled by the rep, not self-serve.
// =============================================================================
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TasksRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/v2/recovery"); }, [router]);
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );
}
