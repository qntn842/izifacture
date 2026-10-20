import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Client Supabase pour le navigateur (composants 'use client').
 * La session de l'utilisateur est stockée dans des cookies, lus aussi par proxy.ts.
 * Une seule instance est partagée dans toute l'application.
 */
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }
  return browserClient;
}
