import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Load `.env` / `.env.local` from the monorepo root (for Next.js apps in apps/*).
 * @param {string} appConfigFileUrl — pass `import.meta.url` from the app's next.config.mjs
 */
export function loadRootEnv(appConfigFileUrl) {
  const appDir = dirname(fileURLToPath(appConfigFileUrl));
  const require = createRequire(join(appDir, 'package.json'));
  const { loadEnvConfig } = require('@next/env');
  const repoRoot = join(appDir, '../..');
  loadEnvConfig(repoRoot);
}
