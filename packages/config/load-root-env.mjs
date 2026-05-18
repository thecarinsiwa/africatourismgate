import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Charge `.env` / `.env.local` / `.env.production` depuis la racine du monorepo.
 * Résout `@next/env` via le paquet `next` (compatible pnpm en production).
 *
 * @param {string} appConfigFileUrl — `import.meta.url` du next.config.mjs de l'app
 */
export function loadRootEnv(appConfigFileUrl) {
  const appDir = dirname(fileURLToPath(appConfigFileUrl));
  const requireFromApp = createRequire(join(appDir, 'package.json'));

  const nextPkg = requireFromApp.resolve('next/package.json');
  const requireFromNext = createRequire(nextPkg);
  const { loadEnvConfig } = requireFromNext('@next/env');

  const repoRoot = join(appDir, '../..');
  loadEnvConfig(repoRoot);
}
