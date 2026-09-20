import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'components/**/*.{test,spec}.{ts,tsx}',
      'lib/bookings/**/*.component.test.{ts,tsx}',
      'test/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['node_modules', 'tests/e2e', '.next', '.next-e2e'],
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
