import { defineConfig } from '@playwright/test';

const port = 3002;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: `${baseURL}/`,
    cwd: __dirname,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
