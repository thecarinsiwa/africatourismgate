#!/usr/bin/env node
/**
 * Regenerate packages/api-client/src/generated from the API OpenAPI spec.
 *
 * Spec resolution (first match):
 * 1. OPENAPI_SPEC env (file path)
 * 2. Fetch OPENAPI_URL (default http://127.0.0.1:3000/api-json) → apps/api/openapi.json
 * 3. Existing apps/api/openapi.json
 * 4. pnpm --filter @africatourismgate/api openapi:export (Nest bootstrap + MySQL)
 *
 * Flags:
 *   --refresh-spec   always re-fetch or re-export the spec before codegen
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_SPEC = join(ROOT, 'apps', 'api', 'openapi.json');
const GENERATED_DIR = join(ROOT, 'packages', 'api-client', 'src', 'generated');
const SCHEMA_OUT = join(GENERATED_DIR, 'schema.ts');
const AUTH_TYPES_OUT = join(GENERATED_DIR, 'auth-types.ts');

const refreshSpec = process.argv.includes('--refresh-spec');

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

async function fetchSpec(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  return res.text();
}

async function resolveSpecPath() {
  const fromEnv = process.env.OPENAPI_SPEC;
  if (fromEnv) {
    const abs = resolve(ROOT, fromEnv);
    if (!existsSync(abs)) {
      throw new Error(`OPENAPI_SPEC not found: ${abs}`);
    }
    return abs;
  }

  if (!refreshSpec && existsSync(DEFAULT_SPEC)) {
    return DEFAULT_SPEC;
  }

  const url =
    process.env.OPENAPI_URL ??
    `http://127.0.0.1:${process.env.API_PORT ?? '3000'}/api-json`;

  try {
    console.log(`Fetching OpenAPI from ${url}…`);
    const body = await fetchSpec(url);
    writeFileSync(DEFAULT_SPEC, body.endsWith('\n') ? body : `${body}\n`, 'utf8');
    console.log(`Wrote ${DEFAULT_SPEC}`);
    return DEFAULT_SPEC;
  } catch (fetchErr) {
    console.warn(`Fetch failed: ${fetchErr instanceof Error ? fetchErr.message : fetchErr}`);
  }

  if (existsSync(DEFAULT_SPEC) && !refreshSpec) {
    return DEFAULT_SPEC;
  }

  console.log('Exporting OpenAPI via Nest (requires MySQL)…');
  run('pnpm', ['--filter', '@africatourismgate/api', 'openapi:export']);

  if (!existsSync(DEFAULT_SPEC)) {
    throw new Error(
      'Could not obtain OpenAPI spec. Start the API (pnpm dev:api) or configure MySQL, then retry.',
    );
  }
  return DEFAULT_SPEC;
}

function writeAuthTypes() {
  const content = `/**
 * Auth request/response types derived from OpenAPI (do not edit — run pnpm codegen:api).
 */
import type { components, paths } from './schema';

export type { components, paths };

export type LoginRequestBody = NonNullable<
  paths['/api/auth/login']['post']['requestBody']
>['content']['application/json'];

export type LoginResponseBody =
  paths['/api/auth/login']['post']['responses'][200]['content']['application/json'];

export type RegisterRequestBody = NonNullable<
  paths['/api/auth/register']['post']['requestBody']
>['content']['application/json'];

export type RegisterResponseBody =
  paths['/api/auth/register']['post']['responses'][200]['content']['application/json'];

export type RefreshTokenRequestBody = NonNullable<
  paths['/api/auth/refresh']['post']['requestBody']
>['content']['application/json'];

export type RefreshTokenResponseBody =
  paths['/api/auth/refresh']['post']['responses'][200]['content']['application/json'];

export type AuthMeResponseBody =
  paths['/api/auth/me']['get']['responses'][200]['content']['application/json'];

export type AuthUserDto = components['schemas']['AuthUserDto'];
export type AuthResponseDto = components['schemas']['AuthResponseDto'];
export type AuthTokensResponseDto = components['schemas']['AuthTokensResponseDto'];
`;
  writeFileSync(AUTH_TYPES_OUT, content, 'utf8');
}

function writeGeneratedIndex() {
  const content = `/**
 * OpenAPI-generated client surface (do not edit — run pnpm codegen:api).
 */
export type { components, paths } from './schema';
export * from './auth-types';
export {
  createOpenApiClient,
  openApiBaseUrl,
  openApiLogin,
  type OpenApiClient,
  type OpenApiClientOptions,
  type OpenApiPaths,
} from './openapi-client';
`;
  writeFileSync(join(GENERATED_DIR, 'index.ts'), content, 'utf8');
}

function writeOpenApiClient() {
  const content = `/**
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
        request.headers.set('Authorization', \`Bearer \${options.accessToken}\`);
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
`;
  writeFileSync(join(GENERATED_DIR, 'openapi-client.ts'), content, 'utf8');
}

async function main() {
  const specPath = await resolveSpecPath();
  console.log(`Using OpenAPI spec: ${specPath}`);

  mkdirSync(GENERATED_DIR, { recursive: true });

  const openapiTs = join(
    ROOT,
    'node_modules',
    'openapi-typescript',
    'bin',
    'cli.js',
  );
  const cli = existsSync(openapiTs) ? 'node' : 'pnpm';
  const cliArgs = existsSync(openapiTs)
    ? [openapiTs, specPath, '-o', SCHEMA_OUT]
    : ['exec', 'openapi-typescript', specPath, '-o', SCHEMA_OUT];

  console.log('Generating schema.ts…');
  run(cli, cliArgs);

  writeAuthTypes();
  writeOpenApiClient();
  writeGeneratedIndex();

  console.log('Running api-client typecheck…');
  run('pnpm', ['--filter', '@africatourismgate/api-client', 'lint']);

  console.log('codegen:api complete.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
