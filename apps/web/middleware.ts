import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isSiteMaintenanceActive,
  type PublicSiteMaintenance,
} from '@africatourismgate/types/organization-settings';
import { defaultLocale, LOCALE_COOKIE, locales, type AppLocale } from './i18n/routing';

const MAINTENANCE_FETCH_TIMEOUT_MS = 2_000;
const DEFAULT_API = 'http://127.0.0.1:3000/api';

function resolveRequestLocale(request: NextRequest): AppLocale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && locales.includes(cookieLocale as AppLocale)) {
    return cookieLocale as AppLocale;
  }
  return defaultLocale;
}

function withLocaleQuery(url: string, locale: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set('locale', locale);
  return parsed.toString();
}

function shouldBypassMaintenanceGate(pathname: string): boolean {
  if (pathname === '/maintenance' || pathname.startsWith('/maintenance/')) {
    return true;
  }
  if (pathname.startsWith('/api/') || pathname === '/api') {
    return true;
  }
  if (pathname.startsWith('/_next/')) {
    return true;
  }
  const lastSegment = pathname.split('/').pop() ?? '';
  if (lastSegment.includes('.')) {
    return true;
  }
  return false;
}

/**
 * Resolve the maintenance status URL.
 * - Direct Nest (`:3000/api`): Edge often fails on `localhost` → use `127.0.0.1`.
 * - Same-origin web proxy (`:3002/api` when ATG_USE_REMOTE_API=1): use request origin
 *   so we hit the Next `/api` rewrite without a self-deadlock on a second host.
 */
function maintenanceStatusUrls(request: NextRequest): string[] {
  const locale = resolveRequestLocale(request);
  const configured = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API)
    .replace(/\/$/, '')
    .replace('://localhost', '://127.0.0.1');

  const urls: string[] = [];

  try {
    const api = new URL(configured);
    const samePort =
      api.port === request.nextUrl.port ||
      (!api.port &&
        ((api.protocol === 'https:' && request.nextUrl.port === '443') ||
          (api.protocol === 'http:' && request.nextUrl.port === '80')));
    const loopback =
      api.hostname === '127.0.0.1' || api.hostname === 'localhost';

    if (samePort && loopback) {
      urls.push(
        withLocaleQuery(
          new URL(
            '/api/public/organization-maintenances/current',
            request.nextUrl.origin,
          ).toString(),
          locale,
        ),
      );
    }
  } catch {
    // ignore invalid URL
  }

  urls.push(
    withLocaleQuery(
      `${configured}/public/organization-maintenances/current`,
      locale,
    ),
  );

  return [...new Set(urls)];
}

async function fetchPublicMaintenance(
  request: NextRequest,
): Promise<PublicSiteMaintenance | null> {
  const deadline = Date.now() + MAINTENANCE_FETCH_TIMEOUT_MS;

  for (const url of maintenanceStatusUrls(request)) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      break;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), remaining);

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        continue;
      }
      return (await response.json()) as PublicSiteMaintenance;
    } catch {
      // try next candidate
    } finally {
      clearTimeout(timeoutId);
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Playwright only — never set this in normal local/prod `.env`.
  if (process.env.DISABLE_SITE_MAINTENANCE_GATE === '1') {
    return NextResponse.next();
  }

  if (shouldBypassMaintenanceGate(pathname)) {
    return NextResponse.next();
  }

  const maintenance = await fetchPublicMaintenance(request);
  if (!maintenance || !isSiteMaintenanceActive(maintenance)) {
    return NextResponse.next();
  }

  const maintenanceUrl = request.nextUrl.clone();
  maintenanceUrl.pathname = '/maintenance';
  maintenanceUrl.search = '';
  return NextResponse.redirect(maintenanceUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
