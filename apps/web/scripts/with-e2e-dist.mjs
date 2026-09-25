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
const rawArgs = process.argv.slice(2);

if (rawArgs.length === 0) {
  console.error('Usage: node ./scripts/with-e2e-dist.mjs <command> [args...]');
  process.exit(1);
}

// pnpm may forward a literal "--" separator; strip it so Playwright does not
// treat it as a test-file pattern ("No tests found").
const forwarded = rawArgs.filter((arg) => arg !== '--');
const [command, ...args] = forwarded;

if (!command) {
  console.error('Usage: node ./scripts/with-e2e-dist.mjs <command> [args...]');
  process.exit(1);
}

const binDir = path.join(cwd, 'node_modules', '.bin');
const rootBinDir = path.resolve(cwd, '..', '..', 'node_modules', '.bin');
const env = {
  ...process.env,
  PATH: [binDir, rootBinDir, process.env.PATH ?? ''].join(path.delimiter),
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
