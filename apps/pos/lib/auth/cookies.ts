import type { NextRequest, NextResponse } from 'next/server';
import type { AuthUser } from '@africatourismgate/types';
import type { PosStoredSession } from './session';

export const ACCESS_COOKIE = 'atg.pos.access';
export const REFRESH_COOKIE = 'atg.pos.refresh';
export const EXPIRES_COOKIE = 'atg.pos.expires';
export const USER_COOKIE = 'atg.pos.user';
export const REMEMBER_COOKIE = 'atg.pos.remember';
export const ORG_ID_COOKIE = 'atg.pos.org.id';
export const ORG_NAME_COOKIE = 'atg.pos.org.name';

/** Align with JWT refresh TTL (7d) when remember-me is enabled */
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const COOKIE_NAMES = [
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  EXPIRES_COOKIE,
  USER_COOKIE,
  REMEMBER_COOKIE,
  ORG_ID_COOKIE,
  ORG_NAME_COOKIE,
] as const;

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function cookieOptions(remember: boolean) {
  const base = {
    path: '/',
    sameSite: 'lax' as const,
    secure: isProduction(),
  };
  if (!remember) {
    return base;
  }
  return { ...base, maxAge: REFRESH_COOKIE_MAX_AGE };
}

function encodeUser(user: AuthUser): string {
  return encodeURIComponent(JSON.stringify(user));
}

function decodeUser(raw: string | undefined): AuthUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as AuthUser;
  } catch {
    return null;
  }
}

function decodeOrgName(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export function getRememberFromRequest(request: NextRequest): boolean {
  return request.cookies.get(REMEMBER_COOKIE)?.value === '1';
}

export function getRememberFromDocumentCookies(): boolean {
  if (typeof document === 'undefined') return false;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REMEMBER_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );
  return match?.[1] === '1';
}

export function getSessionFromCookies(request: NextRequest): PosStoredSession | null {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const expiresRaw = request.cookies.get(EXPIRES_COOKIE)?.value;
  const user = decodeUser(request.cookies.get(USER_COOKIE)?.value);
  const orgId = request.cookies.get(ORG_ID_COOKIE)?.value ?? null;
  const orgName = decodeOrgName(request.cookies.get(ORG_NAME_COOKIE)?.value);

  if (!accessToken || !refreshToken || !expiresRaw || !user) {
    return null;
  }

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
    user,
    selectedOrganizationId: orgId || null,
    selectedOrganizationName: orgName,
  };
}

function setOrgCookies(
  response: NextResponse,
  session: PosStoredSession,
  options: ReturnType<typeof cookieOptions>,
): void {
  if (session.selectedOrganizationId) {
    response.cookies.set(ORG_ID_COOKIE, session.selectedOrganizationId, options);
    response.cookies.set(
      ORG_NAME_COOKIE,
      encodeURIComponent(session.selectedOrganizationName ?? ''),
      options,
    );
  } else {
    const expired = { ...options, maxAge: 0 };
    response.cookies.set(ORG_ID_COOKIE, '', expired);
    response.cookies.set(ORG_NAME_COOKIE, '', expired);
  }
}

export function setSessionCookies(
  response: NextResponse,
  session: PosStoredSession,
  remember: boolean,
): void {
  const options = cookieOptions(remember);
  response.cookies.set(ACCESS_COOKIE, session.accessToken, options);
  response.cookies.set(REFRESH_COOKIE, session.refreshToken, options);
  response.cookies.set(EXPIRES_COOKIE, String(session.expiresAt), options);
  response.cookies.set(USER_COOKIE, encodeUser(session.user), options);
  response.cookies.set(REMEMBER_COOKIE, remember ? '1' : '0', options);
  setOrgCookies(response, session, options);
}

export function clearSessionCookies(response: NextResponse): void {
  const expired = { ...cookieOptions(false), maxAge: 0 };
  for (const name of COOKIE_NAMES) {
    response.cookies.set(name, '', expired);
  }
}

/** Browser-only: mirror session into document.cookie for middleware */
export function setClientSessionCookies(session: PosStoredSession, remember: boolean): void {
  if (typeof document === 'undefined') return;

  const secure = isProduction() ? '; Secure' : '';
  const maxAgePart = remember ? `; Max-Age=${REFRESH_COOKIE_MAX_AGE}` : '';
  const base = `; Path=/; SameSite=Lax${maxAgePart}${secure}`;

  document.cookie = `${ACCESS_COOKIE}=${encodeURIComponent(session.accessToken)}${base}`;
  document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent(session.refreshToken)}${base}`;
  document.cookie = `${EXPIRES_COOKIE}=${session.expiresAt}${base}`;
  document.cookie = `${USER_COOKIE}=${encodeUser(session.user)}${base}`;
  document.cookie = `${REMEMBER_COOKIE}=${remember ? '1' : '0'}${base}`;

  if (session.selectedOrganizationId) {
    document.cookie = `${ORG_ID_COOKIE}=${encodeURIComponent(session.selectedOrganizationId)}${base}`;
    document.cookie = `${ORG_NAME_COOKIE}=${encodeURIComponent(session.selectedOrganizationName ?? '')}${base}`;
  } else {
    const expired = `; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    document.cookie = `${ORG_ID_COOKIE}=${expired}`;
    document.cookie = `${ORG_NAME_COOKIE}=${expired}`;
  }
}

export function clearClientSessionCookies(): void {
  if (typeof document === 'undefined') return;

  const secure = isProduction() ? '; Secure' : '';
  const expired = `; Path=/; Max-Age=0; SameSite=Lax${secure}`;

  for (const name of COOKIE_NAMES) {
    document.cookie = `${name}=${expired}`;
  }
}

function readDocumentCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Read session from document.cookie (e.g. after middleware silent refresh). */
export function getSessionFromDocumentCookies(): PosStoredSession | null {
  const accessToken = readDocumentCookie(ACCESS_COOKIE);
  const refreshToken = readDocumentCookie(REFRESH_COOKIE);
  const expiresRaw = readDocumentCookie(EXPIRES_COOKIE);
  const user = decodeUser(readDocumentCookie(USER_COOKIE));
  const orgId = readDocumentCookie(ORG_ID_COOKIE) ?? null;
  const orgName = decodeOrgName(readDocumentCookie(ORG_NAME_COOKIE));

  if (!accessToken || !refreshToken || !expiresRaw || !user) {
    return null;
  }

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
    user,
    selectedOrganizationId: orgId || null,
    selectedOrganizationName: orgName,
  };
}
