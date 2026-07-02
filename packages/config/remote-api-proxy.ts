import { ATG_DOMAINS } from './domains.mjs';

function remoteApiTarget(): string {
  return (
    process.env.ATG_REMOTE_API_URL?.replace(/\/$/, '') ?? ATG_DOMAINS.api.url
  );
}

/** True when this Next app proxies /api to production (see next.config + ATG_USE_REMOTE_API). */
export function shouldProxyRemoteApi(appPort: string): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
  return apiUrl === `http://localhost:${appPort}/api`;
}

export async function proxyRemoteApiRequest(
  req: Request,
  pathSegments: string[],
  appPort: string,
): Promise<Response> {
  if (!shouldProxyRemoteApi(appPort)) {
    return Response.json({ message: 'Not found' }, { status: 404 });
  }

  const requestUrl = new URL(req.url);
  const path = pathSegments.map((segment) => encodeURIComponent(segment)).join('/');
  const url = `${remoteApiTarget()}/${path}${requestUrl.search}`;
  const headers = new Headers();
  const accept = req.headers.get('accept');
  const contentType = req.headers.get('content-type');
  const authorization = req.headers.get('authorization');
  if (accept) headers.set('Accept', accept);
  if (contentType) headers.set('Content-Type', contentType);
  if (authorization) headers.set('Authorization', authorization);

  const init: RequestInit = { method: req.method, headers, redirect: 'manual' };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  const res = await fetch(url, init);

  if ([301, 302, 303, 307, 308].includes(res.status)) {
    const location = res.headers.get('location');
    if (location) {
      return Response.redirect(location, res.status);
    }
  }

  const responseHeaders = new Headers();
  const resContentType = res.headers.get('content-type');
  if (resContentType) responseHeaders.set('Content-Type', resContentType);

  return new Response(await res.arrayBuffer(), {
    status: res.status,
    headers: responseHeaders,
  });
}
