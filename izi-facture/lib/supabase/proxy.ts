import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/** Pages accessibles sans être connecté */
const PUBLIC_ROUTES = ['/connexion', '/inscription'];

/**
 * Appelée par proxy.ts à chaque requête de page :
 * - rafraîchit la session Supabase (cookies) si besoin ;
 * - renvoie vers /connexion un visiteur non connecté ;
 * - renvoie vers le tableau de bord un utilisateur déjà connecté qui ouvre /connexion ou /inscription.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );

  // Vérifie la session (signature du jeton) : ne rien exécuter entre createServerClient et getClaims
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;

  // Liens reçus par email (/auth/confirm…) : toujours accessibles, sans redirection
  if (pathname.startsWith('/auth/')) {
    return response;
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!isLoggedIn && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.search = pathname !== '/' ? `?suite=${encodeURIComponent(pathname)}` : '';
    return redirectWithCookies(url, response);
  }

  if (isLoggedIn && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/tableau-de-bord';
    url.search = '';
    return redirectWithCookies(url, response);
  }

  return response;
}

/** Redirection qui conserve les cookies de session éventuellement rafraîchis */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
