import { defineConfig } from '@playwright/test';

const port = 3002;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

/**
 * Production server after `pnpm build` avoids Next.js vendor-chunks errors
 * from a stale `.next` cache under `pnpm dev` (see WEB-006 / test:e2e:ci).
 */
const useProdServer =
  Boolean(process.env.CI) || process.env.npm_lifecycle_event === 'test:e2e:ci';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 1,
  retries: process.env.CI ? 2 : 1,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: useProdServer ? 'pnpm start' : 'pnpm dev',
    url: `${baseURL}/`,
    cwd: __dirname,
    reuseExistingServer: !useProdServer,
    timeout: 120_000,
  },
});
