// =============================================================================
// src/lib/supabase-admin.ts — Admin Supabase client
// =============================================================================
// Re-exports the existing getSupabase() singleton as `supabaseAdmin`
// for compatibility with v2 feature modules.
// =============================================================================

import { getSupabase } from "./supabase";

// All v2 modules import { supabaseAdmin } from "@/lib/supabase-admin"
// This is the same service-role client as getSupabase()
export const supabaseAdmin = new Proxy({} as ReturnType<typeof getSupabase>, {
  get(_target, prop: string) {
    return (getSupabase() as any)[prop];
  },
});
