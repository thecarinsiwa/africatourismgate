import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3002);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

/**
 * Production server after `pnpm build` avoids Next.js vendor-chunks errors
 * from a stale `.next` cache under `pnpm dev` (see WEB-006 / test:e2e:ci).
 *
 * Use a dedicated distDir (`.next-e2e`) so a concurrent `pnpm dev` on :3002
 * cannot corrupt the production server mid-suite (webpack-runtime "reading 'call'").
 */
const useProdServer =
  Boolean(process.env.CI) || process.env.npm_lifecycle_event === 'test:e2e:ci';

if (useProdServer) {
  process.env.NEXT_DIST_DIR ||= '.next-e2e';
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  // Parallelize on CI (2 vCPU runners). Specs mock the API via page.route.
  workers: process.env.CI ? 2 : undefined,
  // Sharding is configured in GitHub Actions (--shard=n/4); keep retries low.
  retries: process.env.CI ? 1 : 1,
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: useProdServer
      ? `pnpm exec next start -p ${port}`
      : `pnpm exec next dev -p ${port}`,
    url: `${baseURL}/`,
    cwd: __dirname,
    reuseExistingServer: !useProdServer,
    timeout: 120_000,
    env: {
      ...process.env,
      ...(useProdServer
        ? {
            NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || '.next-e2e',
            NEXT_IMAGE_UNOPTIMIZED: process.env.NEXT_IMAGE_UNOPTIMIZED || '1',
          }
        : {}),
      // Web E2E does not start the API; skip maintenance probes (fail-open still applies
      // when unset, but this avoids up to ~800ms per navigation on connection refused).
      DISABLE_SITE_MAINTENANCE_GATE:
        process.env.DISABLE_SITE_MAINTENANCE_GATE ?? '1',
    },
  },
});
