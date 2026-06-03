import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(__dirname, '../../..');

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(join(repoRoot, '.env'));
loadEnvFile(join(repoRoot, '.env.local'));

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
// Always isolate e2e from dev DB (override root .env DATABASE_NAME).
process.env.DATABASE_NAME =
  process.env.E2E_DATABASE_NAME?.trim() ?? 'africatourismgate_test';
process.env.DATABASE_AUTO_SCHEMA =
  process.env.DATABASE_AUTO_SCHEMA ?? 'true';
process.env.DATABASE_AUTO_SEED = process.env.DATABASE_AUTO_SEED ?? 'true';

// Ignore placeholder values from .env.example so e2e can use test defaults.
if (process.env.SEED_ADMIN_PASSWORD === '') {
  delete process.env.SEED_ADMIN_PASSWORD;
}
if (process.env.STRIPE_WEBHOOK_SECRET?.trim() === 'whsec_') {
  delete process.env.STRIPE_WEBHOOK_SECRET;
}
if (process.env.STRIPE_SECRET_KEY?.trim() === 'sk_test_') {
  delete process.env.STRIPE_SECRET_KEY;
}
