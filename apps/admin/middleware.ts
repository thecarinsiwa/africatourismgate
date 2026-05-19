import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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

function isDashboardPath(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
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

  if (!isAuthPath(pathname) && !isDashboardPath(pathname)) {
    return NextResponse.next();
  }

  const valid = await ensureValidSession(request);

  if (isDashboardPath(pathname)) {
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

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login', '/register'],
};
