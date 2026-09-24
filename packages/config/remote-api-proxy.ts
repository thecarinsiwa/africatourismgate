import { getDevApiUrl } from './dev-api-url.mjs';

/** True when this Next app exposes same-origin `/api` (see next.config + route handler). */
export function shouldProxyRemoteApi(appPort: string): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  return apiUrl === `http://localhost:${appPort}/api`;
}

async function forwardApiRequest(
  req: Request,
  targetBaseUrl: string,
  pathSegments: string[],
): Promise<Response> {
  const requestUrl = new URL(req.url);
  const path = pathSegments.map((segment) => encodeURIComponent(segment)).join('/');
  const url = `${targetBaseUrl.replace(/\/$/, '')}/${path}${requestUrl.search}`;
  const headers = new Headers();
  const accept = req.headers.get('accept');
  const contentType = req.headers.get('content-type');
  const authorization = req.headers.get('authorization');
  if (accept) headers.set('Accept', accept);
  if (contentType) headers.set('Content-Type', contentType);
  if (authorization) headers.set('Authorization', authorization);

  const init: RequestInit = { method: req.method, headers, redirect: 'manual' };
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    init.body = await req.arrayBuffer();
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : 'upstream unreachable';
    return Response.json(
      {
        statusCode: 502,
        error: 'Bad Gateway',
        message: `API locale indisponible (${detail}). Vérifiez que pnpm dev:api tourne sur le port attendu.`,
      },
      { status: 502 },
    );
  }

  if ([301, 302, 303, 307, 308].includes(res.status)) {
    const location = res.headers.get('location');
    if (location) {
      return Response.redirect(location, res.status);
    }
  }

  const responseHeaders = new Headers();
  const resContentType = res.headers.get('content-type');
  if (resContentType) responseHeaders.set('Content-Type', resContentType);
  const contentDisposition = res.headers.get('content-disposition');
  if (contentDisposition) {
    responseHeaders.set('Content-Disposition', contentDisposition);
  }

  return new Response(await res.arrayBuffer(), {
    status: res.status,
    headers: responseHeaders,
  });
}

/**
 * Dev proxy: browser → same-origin `/api` → local Nest or remote API.
 * Avoids CORS for Authorization + blob downloads (PDF exports).
 */
export async function proxyRemoteApiRequest(
  req: Request,
  pathSegments: string[],
  appPort: string,
): Promise<Response> {
  if (!shouldProxyRemoteApi(appPort)) {
    return Response.json({ message: 'Not found' }, { status: 404 });
  }

  const remote = process.env.ATG_REMOTE_API_URL?.replace(/\/$/, '');
  const target = remote || getDevApiUrl();
  return forwardApiRequest(req, target, pathSegments);
}

/** @deprecated Use proxyRemoteApiRequest — local Nest is now the default target. */
export async function proxyLocalDevApiRequest(
  req: Request,
  pathSegments: string[],
): Promise<Response> {
  return forwardApiRequest(req, getDevApiUrl(), pathSegments);
}
