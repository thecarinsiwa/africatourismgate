/**
 * Typed fetch client from OpenAPI paths (do not edit — run pnpm codegen:api).
 */
import createClient, { type Middleware } from 'openapi-fetch';
import type { LoginRequestBody, LoginResponseBody } from './auth-types';
import type { paths } from './schema';

export type OpenApiPaths = paths;

export interface OpenApiClientOptions {
  baseUrl: string;
  accessToken?: string | null;
}

export type OpenApiClient = ReturnType<typeof createOpenApiClient>;

export function createOpenApiClient(options: OpenApiClientOptions) {
  const baseUrl = options.baseUrl.endsWith('/')
    ? options.baseUrl.slice(0, -1)
    : options.baseUrl;
  const client = createClient<paths>({ baseUrl });

  const authMiddleware: Middleware = {
    onRequest({ request }) {
      if (options.accessToken) {
        request.headers.set('Authorization', `Bearer ${options.accessToken}`);
      }
      return request;
    },
  };

  client.use(authMiddleware);
  return client;
}

/** POST /api/auth/login — body and 200 response are fully typed from OpenAPI. */
export async function openApiLogin(
  client: OpenApiClient,
  body: LoginRequestBody,
): Promise<{ data?: LoginResponseBody; error?: unknown; response: Response }> {
  return client.POST('/api/auth/login', { body });
}

/** Strip trailing /api from NEXT_PUBLIC_API_URL (OpenAPI paths include the global prefix). */
export function openApiBaseUrl(apiUrl: string): string {
  const trimmed = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  if (trimmed.endsWith('/api')) return trimmed.slice(0, -4);
  return trimmed;
}
