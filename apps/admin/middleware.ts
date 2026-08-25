import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminProtectedPaths } from './config/dashboard';
import {
  clearSessionCookies,
  getSessionFromCookies,
  setSessionCookies,
} from './lib/auth/cookies';
import { refreshAccessToken } from './lib/auth/refresh';
import {
  isAccessTokenExpired,
  tokensToStoredSession,
  type StoredSession,
} from './lib/auth/session';

const AUTH_PATHS = new Set(['/login', '/register', '/register/pending']);

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.has(pathname) || pathname.startsWith('/register/');
}

function isProtectedPath(pathname: string): boolean {
  return adminProtectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

type ValidSession = {
  session: StoredSession;
  refreshed: boolean;
};

async function ensureValidSession(
  request: NextRequest,
): Promise<ValidSession | null> {
  const session = getSessionFromCookies(request);
  if (!session?.refreshToken) {
    return null;
  }

  if (!isAccessTokenExpired(session)) {
    return { session, refreshed: false };
  }

  const tokens = await refreshAccessToken(session.refreshToken);
  if (tokens === 'locked') {
    return { session, refreshed: false };
  }
  if (!tokens) {
    return null;
  }

  return {
    session: tokensToStoredSession(tokens, session.user),
    refreshed: true,
  };
}

async function handleAuth(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (!isAuthPath(pathname) && !isProtectedPath(pathname)) {
    return null;
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
      setSessionCookies(response, valid.session);
    }
    return response;
  }

  if (isAuthPath(pathname) && valid) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const authResponse = await handleAuth(request);
  if (authResponse) {
    return authResponse;
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/register/:path*',
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
    '/gap',
    '/gap/:path*',
  ],
};
