/**
 * Run a command with NEXT_DIST_DIR=.next-e2e so E2E build/start never shares
 * apps/web/.next with a concurrent `pnpm dev` (webpack-runtime corruption).
 *
 * Usage: node ./scripts/with-e2e-dist.mjs <command> [args...]
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('Usage: node ./scripts/with-e2e-dist.mjs <command> [args...]');
  process.exit(1);
}

const env = {
  ...process.env,
  NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || '.next-e2e',
  // Avoid Next.js Image Optimization fetching remote Wikimedia (429/404) during E2E.
  NEXT_IMAGE_UNOPTIMIZED: process.env.NEXT_IMAGE_UNOPTIMIZED || '1',
};

const result = spawnSync(command, args, {
  cwd,
  env,
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
