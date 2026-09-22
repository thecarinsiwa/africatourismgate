import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isSiteMaintenanceActive,
  type PublicSiteMaintenance,
} from '@africatourismgate/types/organization-settings';

const MAINTENANCE_FETCH_TIMEOUT_MS = 800;
const defaultApiUrl = 'http://localhost:3000/api';

function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
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
  // Static files with an extension (favicon, images, etc.)
  const lastSegment = pathname.split('/').pop() ?? '';
  if (lastSegment.includes('.')) {
    return true;
  }
  return false;
}

async function fetchPublicMaintenance(
  signal: AbortSignal,
): Promise<PublicSiteMaintenance | null> {
  try {
    const response = await fetch(
      `${apiBaseUrl()}/organization-settings/public/maintenance`,
      {
        cache: 'no-store',
        signal,
        headers: { Accept: 'application/json' },
      },
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as PublicSiteMaintenance;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // E2E / local opt-out: avoid latency when no API is listening on :3000.
  if (process.env.DISABLE_SITE_MAINTENANCE_GATE === '1') {
    return NextResponse.next();
  }

  if (shouldBypassMaintenanceGate(pathname)) {
    return NextResponse.next();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    MAINTENANCE_FETCH_TIMEOUT_MS,
  );

  try {
    const maintenance = await fetchPublicMaintenance(controller.signal);
    // Fail-open: API down / timeout → normal site
    if (!maintenance || !isSiteMaintenanceActive(maintenance)) {
      return NextResponse.next();
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = '/maintenance';
    return NextResponse.rewrite(rewriteUrl);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
