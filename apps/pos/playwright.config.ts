import { defineConfig } from '@playwright/test';

const port = 3003;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;
const apiURL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';

const devCorsOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  'http://localhost:3004',
  'http://127.0.0.1:3004',
].join(',');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  retries: process.env.CI ? 2 : 0,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    navigationTimeout: 60_000,
    actionTimeout: 30_000,
  },
  webServer: [
    {
      command: 'pnpm --filter @africatourismgate/api dev',
      url: `${apiURL}/api/health`,
      cwd: `${__dirname}/../..`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        CORS_ORIGIN: process.env.CORS_ORIGIN ?? devCorsOrigins,
      },
    },
    {
      command: 'pnpm dev',
      url: `${baseURL}/login`,
      cwd: __dirname,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        NEXT_PUBLIC_API_URL:
          process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
      },
    },
  ],
});
