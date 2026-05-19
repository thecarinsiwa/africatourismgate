import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminProtectedPaths } from './config/dashboard';
import {
  clearSessionCookies,
  getRememberFromRequest,
  getSessionFromCookies,
  setSessionCookies,
} from './lib/auth/cookies';
import { refreshAccessToken } from './lib/auth/refresh';
import {
  isAccessTokenExpired,
  tokensToStoredSession,
  type StoredSession,
} from './lib/auth/session';

const AUTH_PATHS = new Set(['/login', '/register']);

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.has(pathname);
}

function isProtectedPath(pathname: string): boolean {
  return adminProtectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

type ValidSession = {
  session: StoredSession;
  remember: boolean;
  refreshed: boolean;
};

async function ensureValidSession(
  request: NextRequest,
): Promise<ValidSession | null> {
  const session = getSessionFromCookies(request);
  if (!session?.refreshToken) {
    return null;
  }

  const remember = getRememberFromRequest(request);

  if (!isAccessTokenExpired(session)) {
    return { session, remember, refreshed: false };
  }

  const tokens = await refreshAccessToken(session.refreshToken);
  if (!tokens) {
    return null;
  }

  return {
    session: tokensToStoredSession(tokens, session.user),
    remember,
    refreshed: true,
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAuthPath(pathname) && !isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const valid = await ensureValidSession(request);

  if (isProtectedPath(pathname)) {
    if (!valid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      const response = NextResponse.redirect(loginUrl);
      clearSessionCookies(response);
      return response;
    }

    const response = NextResponse.next();
    if (valid.refreshed) {
      setSessionCookies(response, valid.session, valid.remember);
    }
    return response;
  }

  if (isAuthPath(pathname) && valid) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Doit rester un tableau littéral (pas de fonction) pour que Next.js l’analyse au build.
 * Racines alignées sur `adminDashboardNavConfig` dans dashboard-nav.config.ts.
 */
export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard',
    '/dashboard/:path*',
    '/utilisateurs',
    '/utilisateurs/:path*',
    '/fidelite',
    '/fidelite/:path*',
    '/hebergements',
    '/hebergements/:path*',
    '/produits',
    '/produits/:path*',
    '/reservations',
    '/reservations/:path*',
    '/paiements',
    '/paiements/:path*',
    '/contenu',
    '/contenu/:path*',
    '/organisations',
    '/organisations/:path*',
    '/systeme',
    '/systeme/:path*',
    '/parametres',
    '/parametres/:path*',
  ],
};
