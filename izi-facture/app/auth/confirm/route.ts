import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Page d'arrivée du lien de confirmation reçu par email après l'inscription.
 * Supabase vérifie d'abord le lien, puis redirige ici avec :
 * - ?code=...                     (email par défaut de Supabase, flux PKCE) ;
 * - ou ?token_hash=...&type=...   (si un modèle d'email personnalisé est utilisé plus tard) ;
 * - ou ?error_code=...            (lien expiré ou déjà utilisé).
 * Lien valide -> utilisateur connecté et envoyé sur le tableau de bord.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (searchParams.get('error_code') || searchParams.get('error')) {
    return redirectTo('/connexion?erreur=lien');
  }

  // Les cookies de session sont écrits directement sur la réponse de redirection
  const response = redirectTo('/tableau-de-bord');
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // Échec typique : lien ouvert sur un autre navigateur/appareil que celui de l'inscription.
    // L'email est malgré tout confirmé par Supabase : il suffit de se connecter.
    return error ? redirectTo('/connexion?confirme=1') : response;
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    return error ? redirectTo('/connexion?erreur=lien') : response;
  }

  return redirectTo('/connexion?erreur=lien');
}
