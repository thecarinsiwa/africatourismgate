import { defineConfig } from '@playwright/test';

const port = 3099;
const baseURL = `http://127.0.0.1:${port}`;

/** Isolated prod build on :3099 + `.next-e2e` — avoids sharing `.next` with `pnpm dev`. */
process.env.NEXT_DIST_DIR ||= '.next-e2e';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'customer-loyalty.spec.ts',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `pnpm exec next start -p ${port}`,
    url: `${baseURL}/`,
    cwd: __dirname,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { ...process.env, NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || '.next-e2e' },
  },
});
