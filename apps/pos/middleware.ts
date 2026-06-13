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
  type PosStoredSession,
} from './lib/auth/session';

const LOGIN_PATH = '/login';
const SELECT_ORG_PATH = '/select-org';
const HOME_PATH = '/';
const SALE_PATH = '/sale';
const SALE_SUCCESS_PATH = '/sale/success';

function isLoginPath(pathname: string): boolean {
  return pathname === LOGIN_PATH;
}

function isSelectOrgPath(pathname: string): boolean {
  return pathname === SELECT_ORG_PATH;
}

function isProtectedPosPath(pathname: string): boolean {
  return (
    pathname === HOME_PATH ||
    pathname === SALE_PATH ||
    pathname === SALE_SUCCESS_PATH ||
    pathname.startsWith(`${SALE_PATH}/`)
  );
}

function isMiddlewarePath(pathname: string): boolean {
  return isLoginPath(pathname) || isSelectOrgPath(pathname) || isProtectedPosPath(pathname);
}

function hasSelectedOrganization(session: PosStoredSession): boolean {
  return Boolean(session.selectedOrganizationId);
}

type ValidSession = {
  session: PosStoredSession;
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
    session: tokensToStoredSession(tokens, {
      user: session.user,
      selectedOrganizationId: session.selectedOrganizationId,
      selectedOrganizationName: session.selectedOrganizationName,
      selectedOrganizationSlug: session.selectedOrganizationSlug,
    }),
    remember,
    refreshed: true,
  };
}

function applyRefreshedCookies(
  response: NextResponse,
  valid: ValidSession,
): NextResponse {
  if (valid.refreshed) {
    setSessionCookies(response, valid.session, valid.remember);
  }
  return response;
}

function redirectToLogin(request: NextRequest, nextPath: string): NextResponse {
  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set('next', nextPath);
  const response = NextResponse.redirect(loginUrl);
  clearSessionCookies(response);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isMiddlewarePath(pathname)) {
    return NextResponse.next();
  }

  const valid = await ensureValidSession(request);

  if (isProtectedPosPath(pathname)) {
    if (!valid) {
      return redirectToLogin(request, pathname);
    }
    if (!hasSelectedOrganization(valid.session)) {
      return NextResponse.redirect(new URL(SELECT_ORG_PATH, request.url));
    }
    return applyRefreshedCookies(NextResponse.next(), valid);
  }

  if (isSelectOrgPath(pathname)) {
    if (!valid) {
      return redirectToLogin(request, pathname);
    }
    if (hasSelectedOrganization(valid.session)) {
      return NextResponse.redirect(new URL(HOME_PATH, request.url));
    }
    return applyRefreshedCookies(NextResponse.next(), valid);
  }

  if (isLoginPath(pathname)) {
    if (!valid) {
      return NextResponse.next();
    }
    if (hasSelectedOrganization(valid.session)) {
      return NextResponse.redirect(new URL(HOME_PATH, request.url));
    }
    return NextResponse.redirect(new URL(SELECT_ORG_PATH, request.url));
  }

  return NextResponse.next();
}

/** Tableau littéral requis par Next.js pour l’analyse statique du matcher. */
export const config = {
  matcher: ['/login', '/select-org', '/', '/sale', '/sale/success'],
};
