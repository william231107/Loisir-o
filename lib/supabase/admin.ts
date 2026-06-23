import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client à privilèges élevés : contourne le RLS.
// À n'utiliser QUE côté serveur (route handlers, webhooks), jamais exposé au client.
export const isAdminConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
