import type { NextRequest } from 'next/server';
import { proxyRemoteApiRequest } from '../../../../../packages/config/remote-api-proxy';

type RouteContext = { params: { path: string[] } };

async function handle(req: NextRequest, { params }: RouteContext) {
  return proxyRemoteApiRequest(req, params.path ?? [], process.env.WEB_PORT ?? '3002');
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
