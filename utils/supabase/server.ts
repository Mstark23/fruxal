// Shim: re-exports a Supabase client compatible with routes that expect
// the @supabase/ssr `createClient()` pattern. Uses service role key since
// these are server-side API routes.

import { createClient as _createClient } from "@supabase/supabase-js";

export async function createClient() {
  return _createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
