import { defineConfig } from '@playwright/test';

const port = 3001;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;
const apiURL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
const gapPort = 3004;
const gapURL = process.env.PLAYWRIGHT_GAP_URL ?? `http://localhost:${gapPort}`;

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
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm --filter @africatourismgate/api dev',
      url: `${apiURL}/api/health`,
      cwd: `${__dirname}/../..`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        CORS_ORIGIN: process.env.CORS_ORIGIN ?? devCorsOrigins,
      },
    },
    {
      command: 'pnpm dev',
      url: `${baseURL}/login`,
      cwd: __dirname,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @africatourismgate/gap dev',
      url: `${gapURL}/`,
      cwd: `${__dirname}/../..`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
