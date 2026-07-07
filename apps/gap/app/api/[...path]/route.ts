import type { NextRequest } from 'next/server';
import {
  proxyLocalDevApiRequest,
  proxyRemoteApiRequest,
  shouldProxyRemoteApi,
} from '../../../../../packages/config/remote-api-proxy';

type RouteContext = { params: { path: string[] } };

async function handle(req: NextRequest, { params }: RouteContext) {
  const appPort = process.env.GAP_PORT ?? '3004';
  const segments = params.path ?? [];

  if (shouldProxyRemoteApi(appPort)) {
    return proxyRemoteApiRequest(req, segments, appPort);
  }

  if (process.env.NODE_ENV === 'production') {
    return Response.json({ message: 'Not found' }, { status: 404 });
  }

  return proxyLocalDevApiRequest(req, segments);
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
