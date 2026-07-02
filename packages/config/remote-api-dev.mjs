import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ATG_DOMAINS } from './domains.mjs';
import { getDevApiUrl } from './dev-api-url.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readRootEnvFlag(name) {
  const fromProcess = process.env[name]?.trim();
  if (fromProcess) return fromProcess;
  for (const file of ['.env.local', '.env']) {
    const path = join(repoRoot, file);
    if (!existsSync(path)) continue;
    const match = readFileSync(path, 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'));
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

/**
 * Dev frontends only — proxy browser/SSR calls to the production API
 * so MySQL + apps/api can stay stopped locally (saves disk/RAM).
 *
 * Enable in `.env.local`:
 *   ATG_USE_REMOTE_API=1
 */
export function isRemoteApiDev() {
  if (process.env.NODE_ENV === 'production') return false;
  const flag = readRootEnvFlag('ATG_USE_REMOTE_API').toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
}

export function getRemoteApiTargetUrl() {
  const fromFile = readRootEnvFlag('ATG_REMOTE_API_URL');
  return (
    fromFile.replace(/\/$/, '') ||
    process.env.ATG_REMOTE_API_URL?.replace(/\/$/, '') ||
    ATG_DOMAINS.api.url
  );
}

/**
 * @param {{ appPort: string; explicitUrl?: string }} options
 */
export function resolveDevApiUrl({ appPort, explicitUrl }) {
  if (explicitUrl) return explicitUrl.replace(/\/$/, '');
  if (isRemoteApiDev()) {
    return `http://localhost:${appPort}/api`;
  }
  return getDevApiUrl();
}

export function buildRemoteApiRewrites(targetUrl) {
  const base = targetUrl.replace(/\/$/, '');
  return {
    beforeFiles: [
      {
        source: '/api/:path*',
        destination: `${base}/:path*`,
      },
    ],
  };
}
